const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const app = require("../app");

beforeEach(async () => {
  await seed(testData).then(() => { db.end(); });
});

describe("GET /api/topics", () => {
  test("", () => {});
});
