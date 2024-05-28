const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const models = require("../api.models");

beforeEach(async () => {
  await seed(testData);
});

afterAll(async () => {
  await db.end();
});

describe("/api/topics", () => {
  test("retrieves all topics", async () => {
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
});
