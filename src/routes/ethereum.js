import ethUtil from "@ethereumjs/util";
import { Router } from "express";
import { InvalidArgumentError, UnauthenticatedError } from "../errors/http.js";
import { isNonEmptyString } from "../utils.js";
import { buildHttpHandler, createSuccessResponse } from "./utils.js";

const generateNonce = () => Math.floor(Math.random() * 1000000);

const buildGetNonce = ({ userStorer }) => buildHttpHandler(async (req, res) => {
  const { address } = req.params;
  if (!ethUtil.isValidAddress(ethUtil.addHexPrefix(address))) {
    throw new InvalidArgumentError(`invalid address: ${address}`);
  }
  const user = await userStorer.findById(address);
  res.status(200).json(createSuccessResponse(user.nonce));
});

const parseRpcSignature = ({ signature }) => {
  try {
    if (!ethUtil.isHexPrefixed(signature)) {
      signature = ethUtil.addHexPrefix(signature);
    }
    const sig = ethUtil.fromRpcSig(signature);
    if (!ethUtil.isValidSignature(sig.v, sig.r, sig.s)) {
      throw new InvalidArgumentError(`invalid signature: ${signature}`);
    }
    return sig;
  } catch (err) {
    if (err.message.includes("Invalid signature length")) {
      throw new InvalidArgumentError("invalid signature length");
    }
    throw err;
  }
};

const createMessageHash = ({ nonce }) => {
  const msg = `Nonce: ${nonce}`;
  const msgBuffer = Buffer.from(msg, "ascii");
  return ethUtil.hashPersonalMessage(msgBuffer);
};

const extractSignatureAddress = ({ nonce, signature }) => {
  const sig = parseRpcSignature({ signature });
  const msgHash = createMessageHash({ nonce });
  const publicKey = ethUtil.ecrecover(msgHash, sig.v, sig.r, sig.s);
  return ethUtil.publicToAddress(publicKey).toString("hex");
};

const buildPostSignature = ({ userStorer, tokenCreator }) => buildHttpHandler(async (req, res) => {
  const { address } = req.params;
  if (!ethUtil.isValidAddress(ethUtil.addHexPrefix(address))) {
    throw new InvalidArgumentError(`invalid address: ${address}`);
  }

  const { signature } = req.body;
  if (!isNonEmptyString(signature)) {
    throw new InvalidArgumentError("must provide a signature");
  }

  const { nonce } = await userStorer.findById(address);
  const signatureAddress = extractSignatureAddress({ nonce, signature });
  if (address !== signatureAddress) {
    throw new UnauthenticatedError();
  }

  // Update/roll nonce
  const newNonce = generateNonce();
  await userStorer.update(address, { nonce: newNonce });

  // Create token
  const token = await tokenCreator({ uid: address });

  res.status(200).json(createSuccessResponse({ token }));
});

export const buildEthereumRouter = ({ userStorer, tokenCreator }) => {
  const router = new Router();
  router.get("/:address", buildGetNonce({ userStorer }));
  router.post("/:address", buildPostSignature({ userStorer, tokenCreator }));
  return router;
};
