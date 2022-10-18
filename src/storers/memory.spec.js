import { NotFoundError, UserExistsError } from "../errors/http.js";
import { buildMemoryUserStorer } from "./memory.js";

describe("storers/memory", () => {
  let storer;

  beforeEach(() => {
    storer = buildMemoryUserStorer();
  });

  describe("findById", () => {
    it("should throw NotFound for missing id", async () => {
      await expect(storer.findById("abc")).rejects.toThrow(NotFoundError);
    });

    it("should return user for id", async () => {
      const uid = "abc";
      const user = { uid, nonce: 123 };
      await storer.create(user);

      await expect(storer.findById(uid)).resolves.toStrictEqual(user);
    });
  });

  describe("create", () => {
    it("should throw UserExistsError for existing user", async () => {
      const user = { uid: "abc", nonce: 123 };
      await storer.create(user);

      await expect(storer.create(user)).rejects.toThrow(UserExistsError);
    });
  });

  describe("update", () => {
    it("should throw NotFound for missing id", async () => {
      await expect(storer.update("abc", { nonce: 456 })).rejects.toThrow(NotFoundError);
    });

    it("should update user", async () => {
      const uid = "abc";
      const user = { uid, nonce: 123 };
      await storer.create(user);

      await expect(storer.update(uid, { nonce: 456 })).resolves.toBe();

      const actual = await storer.findById(uid);
      expect(actual).toHaveProperty("nonce", 456);
    });
  });
});
