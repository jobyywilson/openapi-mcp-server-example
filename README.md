# Company API Server

This is a simple Express.js server that manages a list of companies. It provides RESTful API endpoints to create, read, update, and delete companies.

## Features

- In-memory data store for companies
- RESTful API endpoints for company management
- Swagger UI for API documentation and testing
- Hourly reset of the companies array

## Endpoints

- `GET /rest/v1/companies`: Get all companies
- `POST /rest/v1/companies`: Create a new company
- `GET /rest/v1/companies/{companyId}`: Get a company by ID
- `PATCH /rest/v1/companies/{companyId}`: Update a company
- `DELETE /rest/v1/companies/{companyId}`: Delete a company

## Running the Server

1. Ensure you have Node.js installed on your system.
2. Navigate to the project directory in your terminal.
3. Run `node index.js` to start the server.
4. Open your web browser and navigate to `http://localhost:3000/rest/v1/metadata-catalog/companies` to access the Swagger UI.

## Notes

- The companies array is reset every hour to its initial state.
- The server runs on port 3000 by default, but you can change this by setting the `PORT` environment variable.
