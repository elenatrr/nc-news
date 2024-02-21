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
afterAll(() => db.end());

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
    test("GET:200 responds with a list of articles", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          expect(response.body.articles.length).toBe(13);
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
              created_at: "2020-07-09T20:11:00.000Z",
              votes: 100,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
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
      test("PATCH:200 updates an article by article_id and responds with the updated article", () => {
        const updatedArticle = {
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: "2020-07-09T20:11:00.000Z",
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
      test("POST:400 responds with error message when no body provided", () => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({
            username: "lurker",
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
          })
          .expect(400)
          .then((response) => {
            expect(response.body.msg).toBe("Bad request");
          });
      });
      test("POST:422 responds with error message when given non-existent username", () => {
        return request(app)
          .post("/api/articles/2/comments")
          .send({
            body: "Hello World!",
            username: "newuser",
          })
          .expect(422)
          .then((response) => {
            expect(response.body.msg).toBe(
              "Unable to process the request: username does not exist"
            );
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
    });
  });
  describe("/api/comments/:comment_id", () => {
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
});
