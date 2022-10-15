import request from "supertest";

import { createApp } from "./app.js";

describe("app", () => {
  it("should return 200 from GET /", async () => {
    const app = createApp({});

    await request(app)
      .get("/")
      .expect(200);
  });
});
