import ethUtil from "@ethereumjs/util";
import { jest } from "@jest/globals";
import request from "supertest";
import { createApp } from "../app.js";
import { NotFoundError } from "../errors/http.js";

const createSignature = ({ privateKey, nonce }) => {
  const msgHash = ethUtil.hashPersonalMessage(Buffer.from(`Nonce: ${nonce}`, "ascii"));
  const sig = ethUtil.ecsign(msgHash, privateKey);
  return ethUtil.toRpcSig(sig.v, sig.r, sig.s);
};

describe("routes/ethereum", () => {
  const privateKey = Buffer.from("62debf78d596673bce224a85a90da5aecf6e781d9aadcaedd4f65586cfe670d2", "hex");
  const address = ethUtil.privateToAddress(privateKey).toString("hex");

  it("should return nonce for GET /", async () => {
    const nonce = 123;
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce })
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .get(`/exchange/ethereum/${address}`)
      .expect(200);

    expect(res.body).toHaveProperty("data", nonce);
  });

  it("should return 404 for GET / when missing user record", async () => {
    const userStorer = {
      findById: jest.fn().mockRejectedValue(new NotFoundError())
    };
    const app = createApp({ userStorer });

    await request(app)
      .get(`/exchange/ethereum/${address}`)
      .expect(404);
  });

  it("should return 400 for POST /signature with missing signature", async () => {
    const nonce = 123;
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce }),
      update: jest.fn()
    };
    const app = createApp({ userStorer });

    const res = await request(app)
      .post(`/exchange/ethereum/${address}`)
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
      .post(`/exchange/ethereum/${address}`)
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
    const authProvider = {
      create: jest.fn().mockResolvedValue("token")
    };
    const app = createApp({ userStorer, authProvider });

    const res = await request(app)
      .post(`/exchange/ethereum/${address}`)
      .send({ signature })
      .expect(200);

    expect(res.body).toHaveProperty("data.token", "token");
    expect(userStorer.findById).toHaveBeenCalledWith(address);
    expect(userStorer.update).toHaveBeenCalledWith(address, expect.objectContaining({
      nonce: expect.anything()
    }));
    expect(authProvider.create).toHaveBeenCalledWith({ uid: address });
  });

  it("should validate signature for POST /signature without 0x prefix", async () => {
    const nonce = 123;
    const signature = ethUtil.stripHexPrefix(createSignature({ privateKey, nonce }));
    const userStorer = {
      findById: jest.fn().mockResolvedValue({ address, nonce }),
      update: jest.fn()
    };
    const authProvider = {
      create: jest.fn().mockResolvedValue("token")
    };
    const app = createApp({ userStorer, authProvider });

    const res = await request(app)
      .post(`/exchange/ethereum/${address}`)
      .send({ signature })
      .expect(200);

    expect(res.body).toHaveProperty("data.token", "token");
    expect(userStorer.findById).toHaveBeenCalledWith(address);
    expect(userStorer.update).toHaveBeenCalledWith(address, expect.objectContaining({
      nonce: expect.anything()
    }));
    expect(authProvider.create).toHaveBeenCalledWith({ uid: address });
  });
});
