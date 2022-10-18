import ethUtil from "@ethereumjs/util";
import { jest } from "@jest/globals";
import request from "supertest";

import { createApp } from "../app.js";
import { NotFoundError } from "../errors/http.js";

describe("routes/users", () => {
  const privateKey = Buffer.from("62debf78d596673bce224a85a90da5aecf6e781d9aadcaedd4f65586cfe670d2", "hex");
  const address = ethUtil.privateToAddress(privateKey).toString("hex");

  it("should return user for GET /", async () => {
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce: 123 })
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .get(`/users/${address}`)
      .expect(200);

    expect(userStorer.findById).toHaveBeenCalledWith(address);
    expect(res.body).toHaveProperty("data.address", address);
    expect(res.body).toHaveProperty("data.nonce", 123);
  });

  it("should return 404 for GET / if user is missing", async () => {
    const userStorer = {
      findById: jest.fn().mockRejectedValue(new NotFoundError(""))
    };
    const app = createApp({ userStorer });

    await request(app)
      .get(`/users/${address}`)
      .expect(404);

    expect(userStorer.findById).toHaveBeenCalledWith(address);
  });

  it("should register user for POST /register", async () => {
    const userStorer = {
      create: jest.fn().mockResolvedValue()
    };
    const app = createApp({ userStorer });

    await request(app)
      .post("/users/register")
      .send({ uid: address })
      .expect(200);

    expect(userStorer.create).toHaveBeenCalledWith(expect.objectContaining({
      uid: address,
      nonce: expect.anything()
    }));
  });
});
