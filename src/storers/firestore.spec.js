import { NotFoundError, UserExistsError } from "../errors/http.js";
import { getFirestore } from "../firebase.js";
import { buildFirestoreUserStorer } from "./firestore.js";

describe("storers/firestore", () => {
  let storer;
  beforeEach(() => {
    storer = buildFirestoreUserStorer({ db: getFirestore() });
  });

  afterEach(async () => {
    const db = getFirestore();
    const cols = await db.listCollections();
    await Promise.all(cols.map(c => db.recursiveDelete(c)));
  });

  describe("findById", () => {
    it("should throw NotFound for missing id", async () => {
      await expect(storer.findById("abc")).rejects.toThrow(NotFoundError);
    });

    it("should return user for id", async () => {
      const address = "abc";
      const user = { address, nonce: 123 };
      await storer.create(user);

      await expect(storer.findById(address)).resolves.toStrictEqual(user);
    });
  });

  describe("create", () => {
    it("should throw UserExistsError for existing user", async () => {
      const user = { address: "abc", nonce: 123 };
      await storer.create(user);

      await expect(storer.create(user)).rejects.toThrow(UserExistsError);
    });
  });

  describe("update", () => {
    it("should throw NotFound for missing id", async () => {
      await expect(storer.update("abc", { nonce: 456 })).rejects.toThrow(NotFoundError);
    });

    it("should update user", async () => {
      const address = "abc";
      const user = { address, nonce: 123 };
      await storer.create(user);

      await expect(storer.update(address, { nonce: 456 })).resolves.toBe();

      const actual = await storer.findById(address);
      expect(actual).toHaveProperty("nonce", 456);
    });
  });
});
