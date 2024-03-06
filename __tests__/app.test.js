const { app } = require("../app");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const {
  articleData,
  commentData,
  topicData,
  userData,
} = require("../db/data/test-data/index.js");
const endpoints = require("../endpoints.json");

beforeEach(async () => seed({ articleData, commentData, topicData, userData }));
afterAll(async () => {
  await db.end();
});

describe("App", () => {
  describe("/api", () => {
    test("GET:200 responds with an object that contains all the available endpoints", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((response) => {
          expect(typeof response.body.endpoints).toBe("object");
          expect(Object.keys(response.body.endpoints).length).toBe(
            Object.keys(endpoints).length
          );
        });
    });
    describe("each endpoint", () => {
      test("should include a brief description, queries that are accepted, example response", () => {
        return request(app)
          .get("/api")
          .expect(200)
          .then((response) => {
            const currentEndpoint = "GET /api";

            for (const [key, value] of Object.entries(
              response.body.endpoints
            )) {
              expect(value).toHaveProperty("description");
              expect(typeof value.description).toBe("string");
              expect(value.description.length).toBeGreaterThan(0);

              if (key !== currentEndpoint) {
                expect(value.queries).toBeInstanceOf(Array);
                expect(value.exampleResponse).toBeInstanceOf(Object);
              }
            }
          });
      });
    });
  });
  describe("/api/non-existent-route", () => {
    test("GET:404 responds with error for route that does not exist", () => {
      return request(app)
        .get("/api/non-existent-route")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Route not found");
        });
    });
  });
  describe("/api/topics", () => {
    test("GET:200 responds with a list of topics", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then((response) => {
          expect(response.body.topics.length).toBe(3);
          response.body.topics.forEach((topic) => {
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
  });
  describe("/api/articles", () => {
    describe("GET", () => {
      test("GET:200 responds with a list of articles", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then((response) => {
            expect(response.body.articles.length).toBeLessThanOrEqual(13);
            expect(response.body.articles.length).toBeGreaterThan(0);
            response.body.articles.forEach((article) => {
              expect(typeof article.article_id).toBe("number");
              expect(typeof article.title).toBe("string");
              expect(typeof article.topic).toBe("string");
              expect(typeof article.author).toBe("string");
              expect(typeof article.created_at).toBe("string");
              expect(typeof article.votes).toBe("number");
              expect(typeof article.article_img_url).toBe("string");
              expect(typeof article.comment_count).toBe("number");
            });
          });
      });
      describe("each article", () => {
        test("should be sorted by date in descending order", () => {
          return request(app)
            .get("/api/articles")
            .expect(200)
            .then((response) => {
              expect(response.body.articles).toBeSortedBy("created_at", {
                descending: true,
              });
            });
        });
        test("should not have a body property", () => {
          return request(app)
            .get("/api/articles")
            .expect(200)
            .then((response) => {
              response.body.articles.forEach((article) => {
                expect(article).not.toHaveProperty("body");
              });
            });
        });
      });
    });
    describe("POST", () => {
      test("POST:201 inserts a new article to the db and sends the new article back to the client", () => {
        const createdArticle = {
          article_id: 14,
          title: "Summer",
          topic: "mitch",
          author: "rogersop",
          body: "I love dancing",
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          comment_count: 0,
        };
        return request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "Summer",
            body: "I love dancing",
            topic: "mitch",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(201)
          .then((response) => {
            expect(response.body.article).toEqual(createdArticle);
          });
      });
      test("POST:404 responds with error message when given non-existent username", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "new_user",
            title: "Summer",
            body: "I love dancing",
            topic: "mitch",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("POST:404 responds with error message when given non-existent topic", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "Summer",
            body: "Summer vibes",
            topic: "sun",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("POST:400 responds with error message when no username provided", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "",
            title: "Summer",
            body: "I love dancing",
            topic: "mitch",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("POST:400 responds with error message when no topic provided", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "Summer",
            body: "I love dancing",
            topic: "",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("POST:400 responds with error message when no title provided", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "",
            body: "I love dancing",
            topic: "mitch",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("POST:400 responds with error message when no body provided", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "Summer",
            body: "",
            topic: "mitch",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("POST:400 responds with error message when no article_img_url provided", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "Summer",
            body: "Summer vibes",
            topic: "mitch",
            article_img_url: "",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
    });
  });
  describe("/api/articles?topic=topicname", () => {
    test("GET:200 responds with articles filtered by the topic value specified in the query", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then((response) => {
          expect(response.body.articles).toEqual([
            {
              article_id: 5,
              title: "UNCOVERED: catspiracy to bring down democracy",
              topic: "cats",
              author: "rogersop",
              created_at: expect.any(String),
              votes: 0,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              comment_count: 2,
            },
          ]);
        });
    });
    test("GET:200 responds with an empty array when there are no articles by given topic (existent)", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then((response) => {
          expect(response.body.articles).toEqual([]);
        });
    });
    test("GET:404 responds with error when given non-existent topic", () => {
      return request(app)
        .get("/api/articles?topic=flowers")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
    test("GET:200 treats empty query whith no topic provided as request for all articles", () => {
      return request(app)
        .get("/api/articles?topic=")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBeLessThanOrEqual(13);
          expect(response.body.articles.length).toBeGreaterThan(0);
          response.body.articles.forEach((article) => {
            expect(typeof article.article_id).toBe("number");
            expect(typeof article.title).toBe("string");
            expect(typeof article.topic).toBe("string");
            expect(typeof article.author).toBe("string");
            expect(typeof article.created_at).toBe("string");
            expect(typeof article.votes).toBe("number");
            expect(typeof article.article_img_url).toBe("string");
            expect(typeof article.comment_count).toBe("number");
          });
        });
    });
  });
  describe("/api/articles?sort_by=column", () => {
    test("GET:200 responds with articles sorted by the column specified in the query (desc by default)", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBeLessThanOrEqual(13);
          expect(response.body.articles.length).toBeGreaterThan(0);
          expect(response.body.articles).toBeSortedBy("author", {
            descending: true,
          });
        });
    });
    test("GET:404 responds with error when given non-existent column", () => {
      return request(app)
        .get("/api/articles?sort_by=mood")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
    test("GET:200 responds with articles sorted by 'created_at' (by default) when no value provided", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBeLessThanOrEqual(13);
          expect(response.body.articles.length).toBeGreaterThan(0);
          expect(response.body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
  });
  describe("/api/articles?order=chosenorder", () => {
    test("GET:200 responds with articles sorted in either ascending or descending order specified in the query", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBeLessThanOrEqual(13);
          expect(response.body.articles.length).toBeGreaterThan(0);
          expect(response.body.articles).toBeSortedBy("created_at", {
            descending: false,
          });
        });
    });
    test('GET:400 responds with error when given value is neither "asc" nor "desc"', () => {
      return request(app)
        .get("/api/articles?order=ascending")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    test("GET:200 responds with articles sorted in desc order (by default) when no value provided", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBeLessThanOrEqual(13);
          expect(response.body.articles.length).toBeGreaterThan(0);
          expect(response.body.articles).toBeSortedBy("created_at", {
            descending: true,
          });
        });
    });
  });
  describe("/api/articles?limit=10", () => {
    test("GET:200 responds with a list of articles given limit", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(5);
        });
    });
    test("GET:200 responds with a list of articles with the limit of 10 by default", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(10);
        });
    });
    test("GET:200 includes accurate total_count reflecting total articles", () => {
      return request(app)
        .get("/api/articles?limit=9")
        .expect(200)
        .then((response) => {
          expect(response.body.total_count).toBe(13);
        });
    });
    test("GET:200 responds with accurate amount of articles respecting filters", () => {
      return request(app)
        .get("/api/articles?limit=5&topic=cats")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(1);
          expect(response.body.total_count).toBe(1);
        });
    });
    test("GET:400 responds with error message when given negative limit", () => {
      return request(app)
        .get("/api/articles?limit=-3")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    test("GET:400 responds with error message when given non-integer limit", () => {
      return request(app)
        .get("/api/articles?limit=notAnInteger")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
  describe("/api/articles?p=1", () => {
    test("GET:200 responds with a correctly paginated list of articles given page number", () => {
      return request(app)
        .get("/api/articles?limit=2&p=3&sort_by=article_id&order=asc")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(2);
          expect(response.body.articles).toEqual([
            {
              article_id: 5,
              title: "UNCOVERED: catspiracy to bring down democracy",
              topic: "cats",
              author: "rogersop",
              created_at: "2020-08-03T13:14:00.000Z",
              votes: 0,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              comment_count: 2,
            },
            {
              article_id: 6,
              title: "A",
              topic: "mitch",
              author: "icellusedkars",
              created_at: "2020-10-18T01:00:00.000Z",
              votes: 0,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              comment_count: 1,
            },
          ]);
        });
    });
    test("GET:200 responds with a list of articles at page 1 by default", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&order=asc")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(10);
          response.body.articles.forEach((article, index) => {
            expect(article.article_id).toBe(index + 1);
          });
        });
    });
    test("GET:200 responds with accurate amount of articles respecting filters", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(1);
          expect(response.body.articles[0].article_id).toBe(5);
        });
    });
    test("GET:400 responds with error message when given negative page number", () => {
      return request(app)
        .get("/api/articles?p=-2")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    test("GET:400 responds with error message when given non-integer page number", () => {
      return request(app)
        .get("/api/articles?p=notAnInteger")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
  describe("/api/articles/:article_id", () => {
    describe("GET", () => {
      test("GET:200 responds with a single article by article_id", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then((response) => {
            expect(response.body.article).toBeInstanceOf(Object);
            expect(response.body.article).toEqual({
              article_id: 1,
              title: "Living in the shadow of a great man",
              topic: "mitch",
              author: "butter_bridge",
              body: "I find this existence challenging",
              created_at: expect.any(String),
              votes: 100,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              comment_count: 11,
            });
          });
      });
      test("GET:404 responds with error message when given a valid but non-existent id", () => {
        return request(app)
          .get("/api/articles/9999")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("GET:400 responds with error message when given an invalid id", () => {
        return request(app)
          .get("/api/articles/not-a-number")
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
    });
    describe("PATCH", () => {
      test("PATCH:200 updates votes on an article by article_id and responds with the updated article", () => {
        const updatedArticle = {
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: expect.any(String),
          votes: -1,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        };
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: -101 })
          .expect(200)
          .then((response) => {
            expect(response.body.article).toEqual(updatedArticle);
          });
      });
      test("PATCH:400 responds with error message when passed invalid data type", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({ inc_votes: "1000" })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("PATCH:400 responds with error message when passed no data", () => {
        return request(app)
          .patch("/api/articles/1")
          .send({})
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("PATCH:400 responds with error message when given an invalid id", () => {
        return request(app)
          .patch("/api/articles/three")
          .send({ inc_votes: 10 })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("PATCH:404 responds with error message when given a valid but non-existent id", () => {
        return request(app)
          .patch("/api/articles/9999")
          .send({ inc_votes: 10 })
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
    });
  });
  describe("/api/articles/:article_id/comments", () => {
    describe("GET", () => {
      test("GET:200 responds with a list of comments by article_id", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then((response) => {
            expect(response.body.comments.length).toBe(11);
            response.body.comments.forEach((comment) => {
              expect(typeof comment.comment_id).toBe("number");
              expect(typeof comment.votes).toBe("number");
              expect(typeof comment.created_at).toBe("string");
              expect(typeof comment.author).toBe("string");
              expect(typeof comment.body).toBe("string");
              expect(comment.article_id).toBe(1);
            });
          });
      });
      test("should respond with an array of comments oredered by date: most recent comments first", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then((response) => {
            expect(response.body.comments).toBeSortedBy("created_at", {
              descending: true,
            });
          });
      });
      test("GET:200 responds with an empty array when there are no comments by given article_id", () => {
        return request(app)
          .get("/api/articles/2/comments")
          .expect(200)
          .then((response) => {
            expect(response.body.comments).toBeInstanceOf(Array);
            expect(response.body.comments.length).toBe(0);
          });
      });
      test("GET:404 responds with error message when given a valid but non-existent id", () => {
        return request(app)
          .get("/api/articles/9999/comments")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("GET:400 responds with error message when given an invalid id", () => {
        return request(app)
          .get("/api/articles/one/comments")
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
    });
    describe("POST", () => {
      test("POST:201 inserts a new comment by article id to the db and sends the new comment back to the client", () => {
        const createdComment = {
          comment_id: 19,
          body: "Hello World!",
          votes: 0,
          author: "lurker",
          article_id: 2,
        };
        return request(app)
          .post("/api/articles/2/comments")
          .send({
            username: "lurker",
            body: "Hello World!",
          })
          .expect(201)
          .then((response) => {
            expect(response.body.comment).toEqual({
              ...createdComment,
              created_at: expect.any(String),
            });
          });
      });
      test("POST:404 responds with error message when given non-existent username", () => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({
            body: "Hello World!",
            username: "newuser",
          })
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("POST:404 responds with error message when given a valid but non-existent id", () => {
        return request(app)
          .post("/api/articles/9999/comments")
          .send({
            body: "Hello World!",
            username: "lurker",
          })
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("POST:400 responds with error message when no body provided", () => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({
            username: "lurker",
            body: "",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("POST:400 responds with error message when no username provided", () => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({
            body: "Hello World!",
            username: "",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("POST:400 responds with error message when given an invalid id", () => {
        return request(app)
          .post("/api/articles/three/comments")
          .send({
            body: "Hello World!",
            username: "lurker",
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
    });
  });
  describe("/api/comments/:comment_id", () => {
    describe("DELETE", () => {
      test("DELETE:204 deletes a comment by comment_id and returns no content", () => {
        return request(app)
          .delete("/api/comments/9")
          .expect(204)
          .then((response) => {
            expect(response.body).toEqual({});
            return db.query("SELECT * FROM comments;");
          })
          .then((finalResponse) => {
            expect(finalResponse.rows.length).toBe(17);
          });
      });
      test("DELETE:404 responds with error message when given a valid but non-existent id", () => {
        return request(app)
          .delete("/api/comments/9999")
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("DELETE:400 responds with error message when given an invalid id", () => {
        return request(app)
          .delete("/api/comments/five")
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
    });
    describe("PATCH", () => {
      test("PATCH:200 updates votes on a comment by comment_id and responds with the updated comment", () => {
        const updatedComment = {
          body: "The beautiful thing about treasure is that it exists. Got to find out what kind of sheets these are; not cotton, not rayon, silky.",
          votes: 10,
          author: "butter_bridge",
          article_id: 1,
          created_at: expect.any(String),
          comment_id: 2,
        };
        return request(app)
          .patch("/api/comments/2")
          .send({ inc_votes: -4 })
          .expect(200)
          .then((response) => {
            expect(response.body.comment).toEqual(updatedComment);
          });
      });
      test("PATCH:404 responds with error message when given a valid but non-existent id", () => {
        return request(app)
          .patch("/api/comments/9999")
          .send({ inc_votes: 10 })
          .expect(404)
          .then((response) => {
            expect(response.body.msg).toBe("Not found");
          });
      });
      test("PATCH:400 responds with error message when passed invalid data type", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: "1000" })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("PATCH:400 responds with error message when passed no data", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: "" })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("PATCH:400 responds with error message when given an invalid id", () => {
        return request(app)
          .patch("/api/comments/three")
          .send({ inc_votes: 10 })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
    });
  });
  describe("/api/users", () => {
    test("GET:200 responds with a list of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then((response) => {
          expect(response.body.users.length).toBe(4);
          response.body.users.forEach((user) => {
            expect(typeof user.username).toBe("string");
            expect(typeof user.name).toBe("string");
            expect(typeof user.avatar_url).toBe("string");
          });
        });
    });
  });
  describe("/api/users/:username", () => {
    test("GET:200 responds with a single user by username", () => {
      return request(app)
        .get("/api/users/lurker")
        .expect(200)
        .then((respose) => {
          expect(respose.body.user).toBeInstanceOf(Object);
          expect(respose.body.user).toEqual({
            username: "lurker",
            name: "do_nothing",
            avatar_url:
              "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
          });
        });
    });
    test("GET:404 responds with error message when given non-existent username", () => {
      return request(app)
        .get("/api/users/ironman")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
  });
});
