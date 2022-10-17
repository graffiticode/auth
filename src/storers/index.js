import { buildFirestoreUserStorer, createFirestoreDb } from "./firestore.js";
import { buildMemoryUserStorer } from "./memory.js";

export const createUserStorer = ({ type }) => {
  if (type === "firestore") {
    const db = createFirestoreDb();
    console.log(db.toJSON());
    return buildFirestoreUserStorer({ db });
  }
  if (type === "memory") {
    return buildMemoryUserStorer();
  }
  throw new Error(`unknown userStorer type: ${type}`);
};

export * from "./firestore.js";
export * from "./memory.js";
