import { NotFoundError, UserExistsError } from "../errors/http.js";

export const buildMemoryUserStorer = () => {
  const db = new Map();
  return {
    findById: async (id) => {
      if (!db.has(id)) {
        throw new NotFoundError();
      }
      return db.get(id);
    },
    create: async (user) => {
      const { uid, nonce } = user;
      if (db.has(uid)) {
        throw new UserExistsError();
      }
      db.set(uid, { uid, nonce });
    },
    update: async (id, update) => {
      if (!db.has(id)) {
        throw new NotFoundError();
      }
      const { nonce } = update;
      db.set(id, { ...db.get(id), nonce });
    }
  };
};
