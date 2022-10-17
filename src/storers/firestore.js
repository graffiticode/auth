import admin from "firebase-admin";
import { InvalidArgumentError, NotFoundError, UserExistsError } from "../errors/http.js";
import { isNonEmptyString } from "../utils.js";

const buildFindById = ({ db }) => async (id) => {
  const userRef = db.doc(`users/${id}`);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new NotFoundError(`${id} does not exist`);
  }
  const user = {
    address: userDoc.get("address"),
    nonce: userDoc.get("nonce")
  };
  return user;
};

const buildCreate = ({ db }) => async (user) => {
  const { address, nonce } = user;
  if (!isNonEmptyString(address)) {
    throw new InvalidArgumentError("address must be a non empty string");
  }
  const userRef = db.doc(`users/${address}`);
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    throw new UserExistsError();
  }
  await userRef.set({ address, nonce });
};

const buildUpdate = ({ db }) => async (id, update) => {
  const userRef = db.doc(`users/${id}`);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new NotFoundError(`${id} does not exist`);
  }
  const { nonce } = update;
  await userRef.update({ nonce });
};

export const buildFirestoreUserStorer = ({ db }) => {
  return {
    findById: buildFindById({ db }),
    create: buildCreate({ db }),
    update: buildUpdate({ db })
  };
};

const buildCreateFirestoreDb = () => {
  let db;
  return () => {
    if (!db) {
      admin.initializeApp();
      db = admin.firestore();
    }
    return db;
  };
};
export const createFirestoreDb = buildCreateFirestoreDb();
