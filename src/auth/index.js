import { getAuth } from "../firebase.js";
import { buildFirebaseAuthProvider } from "./firebase.js";

export const createAuthProvider = ({ type }) => {
  if (type === "firebase") {
    const auth = getAuth();
    return buildFirebaseAuthProvider({ auth });
  }
  throw new Error(`unknown authProvider type: ${type}`);
};

export * from "./firebase.js";
