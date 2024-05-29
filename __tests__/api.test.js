const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const app = require("../app");
const models = require("../api.models.js");
const request = require("supertest");

beforeEach(async () => {
  await seed(testData);
});

afterAll(async () => {
  await db.end();
});

describe("GET /api/topics", () => {
  test("model retrieves correct data", async () => {
    const topicData = await models.getAllTopics();
    // check return type
    expect(Array.isArray(topicData)).toBe(true);
    // check array length
    expect(topicData).toHaveLength(testData.topicData.length);
    // check type of each item
    topicData.forEach((item) => {
      expect(item).toMatchObject({
        slug: expect.any(String),
        description: expect.any(String),
      });
    });
    // check data is correct
    expect(topicData).toEqual(testData.topicData);
  });
  test("200: sends an array of topics to the client", async () => {
    await request(app).get("/api/topics")
      .expect(200)
      .then((response) => {
        // check return type
        expect(Array.isArray(response.body)).toBe(true);
        // check array length
        expect(response.body).toHaveLength(testData.topicData.length);
        // check type of each item
        response.body.forEach((item) => {
          expect(item).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
        // check data is correct
        expect(response.body).toEqual(testData.topicData);
      });
    });
});

describe("GET /api", () => {
  test("200: sends API documentation", async () => {
    await request(app).get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(require("../endpoints.json"));
      });
  });
});
