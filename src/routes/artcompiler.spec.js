import { jest } from "@jest/globals";
import request from "supertest";

import { createApp } from "../app.js";

describe("routes/artcompiler", () => {
  it("should ", async () => {
    const userStorer = { findById: jest.fn() };
    const app = createApp({ userStorer });

    await request(app)
      .get("/exchange/artcompiler")
      .expect(200);
  });
});
