const { app } = require('../app')
const request = require('supertest');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const { articleData, commentData, topicData, userData } = require('../db/data/test-data/index.js');
const endpoints = require('../endpoints.json')

beforeEach(async () => seed({ articleData, commentData, topicData, userData }));
afterAll(() => db.end());

describe('App', () => {
  describe('/api/topics', () => {
    test('GET:200 responds with a list of topics', () => {
      return request(app)
        .get('/api/topics')
        .expect(200)
        .then((response) => {
          expect(response.body.topics.length).toBe(3);
          response.body.topics.forEach((topic) => {
            expect(typeof topic.slug).toBe('string');
            expect(typeof topic.description).toBe('string');
          });
        });
    });
  });

  describe('/api/non-existent-route', () => {
    test('GET:404 responds with error for route that does not exist', () => {
      return request(app)
        .get('/api/non-existent-route')
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe('Route not found');
        });
    });
  });

  describe('/api', () => {
    test('GET:200 responds with an object that contains all the available endpoints', () => {
      return request(app)
        .get('/api')
        .expect(200)
        .then((response) => {
          expect(typeof response.body.endpoints).toBe('object');
          expect(Object.keys(response.body.endpoints).length).toBe(Object.keys(endpoints).length);
        })
    });
    
    describe('each endpoint', () => {
      test('should include a brief description, queries that are accepted, example response', () => {
        return request(app)
          .get('/api')
          .expect(200)
          .then((response) => {
            const currentEndpoint = 'GET /api'

            for (const [key, value] of Object.entries(response.body.endpoints)) {
              expect(value).toHaveProperty('description')
              expect(typeof value.description).toBe('string')
              expect(value.description.length).toBeGreaterThan(0)
  
              if (key !== currentEndpoint) {
                expect(value.queries).toBeInstanceOf(Array)
                expect(value.exampleResponse).toBeInstanceOf(Object)
              }
            }
          })
      });
    });
  });

  describe('/api/articles/:article_id', () => {
    test('GET:200 responds with a single article by article_id', () => {
      return request(app)
      .get('/api/articles/1')
      .expect(200)
      .then((response) => {
        expect(response.body.article).toBeInstanceOf(Object)
        expect(response.body.article).toEqual({
          article_id: 1,
          title: 'Living in the shadow of a great man',
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          created_at: '2020-07-09T20:11:00.000Z',
          votes: 100,
          article_img_url: "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        });
      });
    });
    test('GET:404 responds with error message when given a valid but non-existent id', () => {
      return request(app)
        .get('/api/articles/9999')
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe('Not Found');
        });
    });
    test('GET:400 responds with error message when given an invalid id', () => {
      return request(app)
        .get('/api/articles/not-a-number')
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe('Bad request');
        });
    });
  });

  describe('/api/articles', () => {
    test('GET:200 responds with a list of articles', () => {
      return request(app)
      .get('/api/articles')
      .expect(200)
      .then((response) => {
        expect(response.body.articles.length).toBe(13);
        response.body.articles.forEach((article) => {
          expect(typeof article.article_id).toBe('number');
          expect(typeof article.title).toBe('string');
          expect(typeof article.topic).toBe('string');
          expect(typeof article.author).toBe('string');
          expect(typeof article.created_at).toBe('string');
          expect(typeof article.votes).toBe('number');
          expect(typeof article.article_img_url).toBe('string');
          expect(typeof article.comment_count).toBe('number');
        });
      });
    });

    describe('each article', () => {
      test('should be sorted by date in descending order and should not have a body property', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((response) => {
          expect(response.body.articles).toBeSortedBy('created_at', { descending: true });
          response.body.articles.forEach((article) => {
            expect(article).not.toHaveProperty('body')
          });
        });
      });
    });
  });
});