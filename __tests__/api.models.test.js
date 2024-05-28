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

describe("getAllTopics", () => {
  test("returns an array of objects with the correct length", async () => {
    const topicData = await models.getAllTopics();
    expect(Array.isArray(topicData)).toBe(true);
    topicData.forEach((item) => { expect(typeof item).toBe("object"); });
    expect(topicData).toHaveLength(3);
  });
  test("each object in the returned array has the correct shape",
    async () => {
      const topicData = await models.getAllTopics();
      topicData.forEach((item) => {
        expect(item).toMatchObject({
          slug: expect.any(String),
          description: expect.any(String),
        });
      });
    }
  );
});
