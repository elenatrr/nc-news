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
        expect(response.body.article.article_id).toBe(1);
        expect(response.body.article.title).toBe('Living in the shadow of a great man');
        expect(response.body.article.topic).toBe("mitch");
        expect(response.body.article.author).toBe("butter_bridge");
        expect(response.body.article.body).toBe("I find this existence challenging");
        expect(response.body.article.created_at).toBe('2020-07-09T20:11:00.000Z');
        expect(response.body.article.votes).toBe(100);
        expect(response.body.article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700");
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
});