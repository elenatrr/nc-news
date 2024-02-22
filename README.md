# # Northcoders News API

## Hosted Version

[https://nc-news-yolm.onrender.com/api/articles](#)

## Project Summary

NC News is a backend service designed to mimic real-world API services like Reddit, providing a foundation for front-end applications to access application data programmatically. This project uses PostgreSQL for the database and interacts with it using Node.js and the node-postgres library.

## Getting Started

### Prerequisites

Minimum versions needed to run the project:

- Node.js ^16.0.0
- PostgreSQL ^8.7.3

### Clone the Repository

```
git clone https://github.com/elenatrr/nc-news.git
cd be-nc-news
```

### Install Dependencies

```
npm install
```

### Configure Environment 

To successfully connect to the two databases locally you will need to create two **.env files**: `.env.test` and `.env.development` for the test and the development environments respectively. 

In each file, add **PGDATABASE=**, followed by the appropriate database name. Refer to `/db/setup.sql` for database names.

Example for .env.development:
```
PGDATABASE=development_db_name
```

Example for .env.test:
```
PGDATABASE=test_db_name
```

### Set Up and Seed the Database

Run the following command to set up the database:
```
npm run setup-dbs
```
Seed the local database:
```
npm run seed
```

### Run the Tests

To run the automated tests:
```
npm test
```

### Run the Project

To start the server:
```
npm start
```
The server will start, and you can interact with the API on the specified port.

### Explore Available Endpoints

Refer to the `endpoints.json` file included in the project's root directory to see all the available endpoints and how they should be interacted with.

### Local Endpoint Access

For local testing of endpoints, you can utilize applications like Postman or Insomnia, or execute a straightforward curl command in your terminal:
```
curl -X GET http://localhost:PORT/api/articles
```
Ensure to replace PORT with the actual port number your application server is listening on.

### Accessing Endpoints via Web Browser

To interact with an available endpoint through your web browser, use the following format:
```
[link to hosted version]/api/users
```
Navigate to the URL in your browser to view the response from the server.