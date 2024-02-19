const { app } = require('../app')
const request = require('supertest');
const db = require('../db/connection.js');
const seed = require('../db/seeds/seed.js');
const { articleData, commentData, topicData, userData } = require('../db/data/test-data/index.js');

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
});