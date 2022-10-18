import { jest } from "@jest/globals";
import request from "supertest";
import { createApp } from "../app.js";

describe("routes/validate", () => {
  it("should return 400 from POST / if missing token", async () => {
    const app = createApp({});

    await request(app)
      .post("/validate")
      .send({})
      .expect(400);
  });

  it("should validate valid token", async () => {
    const uid = "123";
    const authProvider = {
      verify: jest.fn().mockResolvedValue({ uid })
    };
    const app = createApp({ authProvider });
    const token = "header.body.sig";

    const res = await request(app)
      .post("/validate")
      .send({ token })
      .expect(200);

    expect(res.body).toHaveProperty("data.uid", uid);
    expect(authProvider.verify).toHaveBeenCalledWith({ token });
  });
});
