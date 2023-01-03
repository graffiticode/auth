import ethUtil from "@ethereumjs/util";
import { Router } from "express";
import { InvalidArgumentError, UnauthenticatedError } from "../errors/http.js";
import { generateNonce, isNonEmptyString } from "../utils.js";
import { buildHttpHandler, createSuccessResponse } from "./utils.js";

const buildGetNonce = ({ userStorer }) => buildHttpHandler(async (req, res) => {
  const { address } = req.params;
  if (!ethUtil.isValidAddress(ethUtil.addHexPrefix(address))) {
    throw new InvalidArgumentError(`invalid address: ${address}`);
  }
  const user = await userStorer.findById(address);
  res.status(200).json(createSuccessResponse(user.nonce));
});

const createMessageHash = ({ nonce }) => {
  const msg = `Nonce: ${nonce}`;
  const msgBuffer = Buffer.from(msg, "ascii");
  return ethUtil.hashPersonalMessage(msgBuffer);
};

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

const extractSignatureAddress = ({ nonce, sig }) => {
  const msgHash = createMessageHash({ nonce });
  const publicKey = ethUtil.ecrecover(msgHash, sig.v, sig.r, sig.s);
  return ethUtil.publicToAddress(publicKey).toString("hex");
};

const buildPostSignature = ({ userStorer, authProvider }) => buildHttpHandler(async (req, res) => {
  const { address } = req.params;
  if (!ethUtil.isValidAddress(ethUtil.addHexPrefix(address))) {
    throw new InvalidArgumentError(`invalid address: ${address}`);
  }

  const { signature } = req.body;
  if (!isNonEmptyString(signature)) {
    throw new InvalidArgumentError("must provide a signature");
  }
  const sig = parseRpcSignature({ signature });

  const { nonce } = await userStorer.findById(address);

  const signatureAddress = extractSignatureAddress({ nonce, sig });
  if (address !== signatureAddress) {
    throw new UnauthenticatedError();
  }

  const newNonce = await generateNonce();
  await userStorer.update(address, { nonce: newNonce });

  const token = await authProvider.create({ uid: address });

  res.status(200).json(createSuccessResponse({ token }));
});

export const buildEthereumRouter = ({ userStorer, authProvider }) => {
  const router = new Router();
  router.get("/:address", buildGetNonce({ userStorer }));
  router.post("/:address", buildPostSignature({ userStorer, authProvider }));
  return router;
};
