const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const seedUtils = require("../db/seeds/utils");
const db = require("../db/connection");
const app = require("../app");
const models = require("../api.models.js");
const request = require("supertest");
require("jest-sorted");


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


describe("GET /api/articles/:article_id", () => {
  test("model retrieves data with right shape", async () => {
    const articleData = await models.selectArticleById(1);
    expect(articleData).toMatchObject({
      author: "butter_bridge",
      title: "Living in the shadow of a great man",
      article_id: 1,
      body: "I find this existence challenging",
      topic: "mitch",
      created_at: expect.any(Date),
      votes: 100,
      article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      comment_count: 11,
    });
  });
  test("200: sends correct data, given a valid id", async () => {
    await request(app).get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        expect(typeof body ).toBe("object");
        expect(body).toMatchObject({
          author: "butter_bridge",
          title: "Living in the shadow of a great man",
          article_id: 1,
          body: "I find this existence challenging",
          topic: "mitch",
          created_at: expect.any(String), // this is different to the model test
          votes: 100,
          article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 11,
        });
      });
  });
  test("400: sends a bad request if passed a non-number", async () => {
    await request(app).get("/api/articles/pineapple")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("404: sends Not Found if passed an invalid id number", async () => {
    await request(app).get("/api/articles/20000")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/articles", () => {
  test("model retrieves data with the right shape, sorted by date," +
    "latest first",
    async () => {
      const articleData = await models.selectArticles({});
      expect(Array.isArray(articleData)).toBe(true);
      expect(articleData[0]).toMatchObject({
        author: expect.any(String),
        title: expect.any(String),
        article_id: expect.any(Number),
        topic: expect.any(String),
        created_at: expect.any(Date),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
      expect(articleData).toBeSortedBy("created_at",{ descending: true });
    }
  );
  test("200: sends data with the correct type, sorted by date, latest first",
    async () => {
      await request(app).get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.articles[0]).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
              // ^this is different to the model test
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
          expect(body.articles).toBeSortedBy("created_at",{ descending: true });
        });
    }
  );
  test("200: sends articles with the correct topic when queried",
    async () => {
      await request(app).get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.articles)).toBe(true);
          expect(body.articles).toHaveLength(1);
          expect(body.articles[0]).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: "cats",
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
    }
  );
  test("200: sends the correct articles when queried for a valid author",
    async () => {
      const { body } = await request(app)
        .get("/api/articles?author=icellusedkars")
        .expect(200);
      expect(body.articles).toHaveLength(6);
      body.articles.forEach((receivedArticle) => {
        expect(receivedArticle).toMatchObject({
          author: "icellusedkars",
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
    }
  );
  test("200: sends correct articles when queried for a valid author & topic",
    async () => {
      const { body } = await request(app)
        .get("/api/articles?author=butter_bridge&topic=mitch")
        .expect(200);
      expect(Array.isArray(body.articles)).toBe(true);
      expect(body.articles).toHaveLength(4);
      body.articles.forEach((receivedArticle) => {
        expect(receivedArticle).toMatchObject({
          author: "butter_bridge",
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: "mitch",
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
    }
  );
  test("200: sends an empty list when queried for a non-existent " +
    "topic and/or author",
    async () => {
      async function checkSendsEmpty(url) {
        await request(app).get(url)
          .expect(200)
          .then(({ body }) => {
            expect(body.articles).toEqual([]);
          });
      };
      await Promise.all([
        checkSendsEmpty("/api/articles?author=blancmonge"),
        checkSendsEmpty("/api/articles?topic=cheesecake"),
        checkSendsEmpty("/api/articles?author=blancmonge&topic=cheesecake"),
      ]);
    }
  );
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: sends a list of comments when given a valid id", async () => {
    await request(app).get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const data = body.comments;
        expect(Array.isArray(data)).toBe(true)
        expect(data[0]).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: 1,
        });
        expect(data).toBeSortedBy("created_at",{ descending: true });
      });
  });
  test("404: sends Not Found when passed an invalid id number", async () => {
    await request(app).get("/api/articles/3000/comments")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("400: sends Bad Request when passed a non-number", async () => {
    await request(app).get("/api/articles/fish/comments")
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: posts a valid comment object and sends it back", async () => {
    // the article we will try to post on
    const articleId = 1;
    // the comment we will try to post
    const ourComment = {
        username: "rogersop",
        body: "WhY isN't' this artrGicle about cabbages??"
    };
    // checking that we get the right body back
    await request(app).post(`/api/articles/${articleId}/comments`)
      .set("Content-Type","application/json")
      .send(ourComment)
      .expect(201)
      .then(({ body }) => {
        expect(body.postedComment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: ourComment.username,
          body: ourComment.body,
          article_id: articleId,
        });
    });
    // checking that the database has been updated correctly
    await db.query(
      `SELECT * FROM comments WHERE article_id = ${articleId}`)
      .then(({ rows }) => {
        expect(rows).toHaveLength(12); // make sure this tracks with test data
        expect(rows).toEqual(expect.arrayContaining([{
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(Date),
          author: ourComment.username,
          body: ourComment.body,
          article_id: articleId,
        }]));
      });
  });
  test("404: sends an error when passed an invalid id number", async () => {
    // the comment we will try to post
    const ourComment = {
        username: "rogersop",
        body: "WhY isN't' this artrGicle about cabbages??"
    };
    // checking that we get the right body back
    await request(app).post(`/api/articles/96531/comments`)
      .set("Content-Type","application/json")
      .send(ourComment)
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
  test("400: sends an error when passed a non-number as the id", async () => {
    // the comment we will try to post
    const ourComment = {
        username: "rogersop",
        body: "WhY isN't' this artrGicle about cabbages??"
    };
    await request(app).post(`/api/articles/orange/comments`)
      .set("Content-Type","application/json")
      .send(ourComment)
      .expect(400)
      .then(({ body }) => {
        expect(body.msg).toBe("Bad Request");
      });
  });
  test("400: sends an error if request body isn't the right shape",
    async () => {
      const ourComment = {
          body: "WhY isN't' this artrGicle about cabbages??"
      };
      await request(app).post(`/api/articles/1/comments`)
        .set("Content-Type","application/json")
        .send(ourComment)
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    }
  );
});

describe("PATCH /api/articles/:article_id", () => {
  test("201: increments the vote count by 1 on the given article & sends the"
    + " article back",
    async () => {
      // note that article 1 has 100 votes
      await request(app).patch("/api/articles/1")
        .set("Content-Type","application/json")
        .send({ inc_votes: 1 })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            "article_id": 1,
            "title": expect.any(String),
            "topic": expect.any(String),
            "author": expect.any(String),
            "body": expect.any(String),
            "created_at": expect.any(String),
            "votes": 101,
            "article_img_url": expect.any(String),
          });
        });
    }
  );
  test("201: decrements the vote count by 1 if the vote count is already"
    + " at least 1",
    async () => {
      // note that article 1 has 100 votes
      await request(app).patch("/api/articles/1")
        .set("Content-Type","application/json")
        .send({ inc_votes: -1 })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            "article_id": 1,
            "title": expect.any(String),
            "topic": expect.any(String),
            "author": expect.any(String),
            "body": expect.any(String),
            "created_at": expect.any(String),
            "votes": 99,
            "article_img_url": expect.any(String),
          });
        });
    }
  );
  test("201: trying to decrement below zero just sets vote count to zero",
    async () => {
      // note that article 1 has 100 votes
      await request(app).patch("/api/articles/1")
        .set("Content-Type","application/json")
        .send({ inc_votes: -101 })
        .expect(201)
        .then(({ body }) => {
          expect(body.article).toMatchObject({
            "article_id": 1,
            "title": expect.any(String),
            "topic": expect.any(String),
            "author": expect.any(String),
            "body": expect.any(String),
            "created_at": expect.any(String),
            "votes": 0,
            "article_img_url": expect.any(String),
          });
        });
    }
  );
  test("404: sends error when passed an invalid id number",
    async () => {
      await request(app).patch("/api/articles/9000")
        .set("Content-Type","application/json")
        .send({ inc_votes: 1 })
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    }
  );
  test("400: sends error when passed an non-number as the article id",
    async () => {
      await request(app).patch("/api/articles/:article_id")
        .set("Content-Type","application/json")
        .send({ inc_votes: 1 })
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    },
  );
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: deletes comment when passed a valid comment id",
    async () => {
      await request(app).delete("/api/comments/1")
        .expect(204)
        .then( async (response) => {
          const commentData = await db.query(
            `SELECT * FROM comments WHERE comment_id = 1`);
          expect(commentData.rows).toHaveLength(0);
          expect(response.body).toEqual({});
        });
    }
  );
  test("404: sends error if passed an invalid id number",
    async () => {
      await request(app).delete("/api/comments/20000000")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("Not Found");
        });
    }
  );
  test("400: sends error when passed a non-number as the id",
    async () => {
      await request(app).delete("/api/comments/:comment_id")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("Bad Request");
        });
    }
  );
});

describe("GET /api/users", () => {
  test("200: sends a list of all users",
    async () => {
      await request(app).get("/api/users")
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body.users)).toBe(true);
          expect(body.users).toHaveLength(4);
          body.users.forEach((receivedUser) => {
            expect(receivedUser).toMatchObject({
              username: expect.any(String),
              name: expect.any(String),
              avatar_url: expect.any(String),
            });
            // make sure we're leaking data we don't want to
            expect(Object.keys(receivedUser)).toHaveLength(3);
          });
        });
    }
  );
});
