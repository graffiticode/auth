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
      .send({ address })
      .expect(200);

    expect(userStorer.create).toHaveBeenCalledWith(expect.objectContaining({
      address,
      nonce: expect.anything()
    }));
  });

  it("should return user nonce for GET /nonce", async () => {
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce: 123 })
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .get(`/users/${address}/nonce`)
      .expect(200);

    expect(userStorer.findById).toHaveBeenCalledWith(address);
    expect(res.body).toHaveProperty("data", 123);
  });

  it("should return 404 for GET /nonce if user is missing", async () => {
    const userStorer = {
      findById: jest.fn().mockRejectedValue(new NotFoundError(""))
    };
    const app = createApp({ userStorer });

    await request(app)
      .get(`/users/${address}/nonce`)
      .expect(404);

    expect(userStorer.findById).toHaveBeenCalledWith(address);
  });

  const createSignature = ({ privateKey, nonce }) => {
    const msg = `Nonce: ${nonce}`;
    const msgBuffer = Buffer.from(msg, "ascii");
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const sig = ethUtil.ecsign(msgHash, privateKey);
    return ethUtil.toRpcSig(sig.v, sig.r, sig.s);
  };

  it("should return 400 for POST /signature with missing signature", async () => {
    const nonce = 123;
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce }),
      update: jest.fn()
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .post(`/users/${address}/signature`)
      .send({ signature: "" })
      .expect(400);

    expect(res.body).toHaveProperty("error.message", "must provide a signature");
  });

  it("should return 400 for POST /signature with invalid signature", async () => {
    const nonce = 123;
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce }),
      update: jest.fn()
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .post(`/users/${address}/signature`)
      .send({ signature: "0x1234" })
      .expect(400);

    expect(res.body).toHaveProperty("error.message", "invalid signature length");
  });

  it("should validate signature for POST /signature", async () => {
    const nonce = 123;
    const signature = createSignature({ privateKey, nonce });
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce }),
      update: jest.fn()
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .post(`/users/${address}/signature`)
      .send({ signature })
      .expect(200);

    expect(res.body).toHaveProperty("data");
    expect(userStorer.findById).toHaveBeenCalledWith(address);
    expect(userStorer.update).toHaveBeenCalledWith(address, expect.objectContaining({
      nonce: expect.anything()
    }));
  });

  it("should validate signature for POST /signature without 0x prefix", async () => {
    const nonce = 123;
    const signature = ethUtil.stripHexPrefix(createSignature({ privateKey, nonce }));
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce }),
      update: jest.fn()
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .post(`/users/${address}/signature`)
      .send({ signature })
      .expect(200);

    expect(res.body).toHaveProperty("data");
    expect(userStorer.findById).toHaveBeenCalledWith(address);
    expect(userStorer.update).toHaveBeenCalledWith(address, expect.objectContaining({
      nonce: expect.anything()
    }));
  });
});
