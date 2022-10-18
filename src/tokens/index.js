import { getAuth } from "../firebase.js";
import { buildFirebaseTokenCreator } from "./firebase.js";

export const createTokenCreator = ({ type }) => {
  if (type === "firebase") {
    const auth = getAuth();
    return buildFirebaseTokenCreator({ auth });
  }
  throw new Error(`unknown tokenCreator type: ${type}`);
};

export * from "./firebase.js";
