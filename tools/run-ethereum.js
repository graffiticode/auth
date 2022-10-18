import ethUtil from "@ethereumjs/util";
import bent from "bent";
import { initializeApp } from "firebase/app";
import { getAuth, getIdToken, signInWithCustomToken } from "firebase/auth";
import { randomBytes } from "node:crypto";

// const baseUrl = "http://localhost:4100";
const baseUrl = "https://auth-sja7fatcta-uc.a.run.app";

const getJson = bent(baseUrl, "GET", "json");
const postJson = bent(baseUrl, "POST", "json");

const firebaseConfig = {
  apiKey: "AIzaSyAoVuUNi8ElnS7cn6wc3D8XExML-URLw0I",
  authDomain: "graffiticode.firebaseapp.com",
  databaseURL: "https://graffiticode.firebaseio.com",
  projectId: "graffiticode",
  storageBucket: "graffiticode.appspot.com",
  messagingSenderId: "656973052505",
  appId: "1:656973052505:web:f3f3cc6397a844599c8f48",
  measurementId: "G-KRPK1CDB19"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const registerUser = async ({ address }) => {
  console.log({ uid: address });
  const { status, error, data } = await postJson(`/users/register`, { uid: address });
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

const validateToken = async ({ token }) => {
  const { status, error, data } = await postJson(`/validate`, { token });
  if (status !== "success") {
    throw new Error(error.message);
  }
  return data;
};

const run = async ({ privateKey }) => {
  const address = ethUtil.privateToAddress(privateKey).toString("hex");

  await registerUser({ address });
  console.log(`Registered: ${address}`);

  const nonce = await getNonce({ address });
  console.log(`Nonce: ${nonce}`);

  const { token: customToken } = await sendSignature({ privateKey, nonce });
  const userCred = await signInWithCustomToken(auth, customToken);
  const token = await getIdToken(userCred.user);

  const { uid } = await validateToken({ token });
  console.log(`Uid: ${uid}`);
};


const runs = [];
for (let i = 0; i < 1; i++) {
  runs.push(run({ privateKey: randomBytes(32) }));
}

Promise.all(runs).catch(console.error);
