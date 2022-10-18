import { getFirestore } from "../firebase.js";
import { buildFirestoreUserStorer } from "./firestore.js";
import { buildMemoryUserStorer } from "./memory.js";

export const createUserStorer = ({ type }) => {
  if (type === "firestore") {
    const db = getFirestore();
    return buildFirestoreUserStorer({ db });
  }
  if (type === "memory") {
    return buildMemoryUserStorer();
  }
  throw new Error(`unknown userStorer type: ${type}`);
};

export * from "./firestore.js";
export * from "./memory.js";
