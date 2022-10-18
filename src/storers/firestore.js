import { InvalidArgumentError, NotFoundError, UserExistsError } from "../errors/http.js";
import { isNonEmptyString } from "../utils.js";

const buildFindById = ({ db }) => async (id) => {
  const userRef = db.doc(`users/${id}`);
  const userDoc = await userRef.get();
  if (!userDoc.exists) {
    throw new NotFoundError(`${id} does not exist`);
  }
  const user = {
    uid: userDoc.get("uid"),
    nonce: userDoc.get("nonce")
  };
  return user;
};

const buildCreate = ({ db }) => async (user) => {
  const { uid, nonce } = user;
  if (!isNonEmptyString(uid)) {
    throw new InvalidArgumentError("uid must be a non empty string");
  }
  const userRef = db.doc(`users/${uid}`);
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    throw new UserExistsError();
  }
  await userRef.set({ uid, nonce });
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
