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
});