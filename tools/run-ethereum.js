import ethUtil from "@ethereumjs/util";
import bent from "bent";
import { randomBytes } from "node:crypto";

const baseUrl = "http://localhost:4100";

const getJson = bent(baseUrl, "GET", "json");
const postJson = bent(baseUrl, "POST", "json");

const registerUser = async ({ address }) => {
  const { status, error, data } = await postJson(`/users/register`, { address });
  if (status !== "success") {
    throw new Error(error.message);
  }
  return data;
};

const getNonce = async ({ address }) => {
  const { status, error, data } = await getJson(`/exchange/ethereum/${address}`);
  if (status !== "success") {
    throw new Error(error.message);
  }
  return data;
};

const sendSignature = async ({ privateKey, nonce }) => {
  const address = ethUtil.privateToAddress(privateKey).toString("hex");
  const msgHash = ethUtil.hashPersonalMessage(Buffer.from(`Nonce: ${nonce}`, "ascii"));
  const sig = ethUtil.ecsign(msgHash, privateKey);
  const signature = ethUtil.toRpcSig(sig.v, sig.r, sig.s);
  const { status, error, data } = await postJson(`/exchange/ethereum/${address}`, { signature });
  if (status !== "success") {
    throw new Error(error.message);
  }
  return data;
};

const run = async () => {
  const privateKey = randomBytes(32);
  const address = ethUtil.privateToAddress(privateKey).toString("hex");

  await registerUser({ address });
  console.log(`Registered: ${address}`);

  const nonce = await getNonce({ address });
  console.log(`Nonce: ${nonce}`);

  const { token } = await sendSignature({ privateKey, nonce });
  console.log(`Token: ${token}`);
};

run().catch(console.error);
