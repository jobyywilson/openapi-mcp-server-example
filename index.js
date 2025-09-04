// app.js
const express = require("express");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());

// In-memory data store
let companies = [
  { id: 1, name: "Acme Corp", industry: "Technology", address: "123 Tech Lane" },
  { id: 2, name: "Beta Ltd", industry: "Finance", address: "456 Finance Road" }
];
let nextId = 3;

// Function to reset companies array
function resetCompanies() {
  companies = [
    { id: 1, name: "Acme Corp", industry: "Technology", address: "123 Tech Lane" },
    { id: 2, name: "Beta Ltd", industry: "Finance", address: "456 Finance Road" }
  ];
  nextId = 3;
}

// Initial reset
resetCompanies();

// OpenAPI Spec (inline JSON)
const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Company API",
    description: "A simple API to manage companies, departments, and users.",
    version: "1.0.0"
  },
  servers: [
    {
      url: "/",
      description: "Current server"
    }
  ],
  paths: {
    "/rest/v1/companies": {
      get: {
        summary: "Get all companies",
        operationId: "getCompanies",
        responses: {
          200: {
            description: "A list of companies.",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CompanySummary" }
                }
              }
            }
          }
        }
      },
      post: {
        summary: "Create a new company",
        operationId: "createCompany",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompanyCreateRequest" }
            }
          }
        },
        responses: {
          201: {
            description: "Company created successfully.",
            headers: {
              Location: {
                description: "The URL of the newly created company.",
                schema: { type: "string", example: "/rest/v1/companies/123" }
              }
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Company" }
              }
            }
          },
          400: { description: "Invalid request payload." }
        }
      }
    },
    "/rest/v1/companies/{companyId}": {
      delete: {
        summary: "Delete a company by ID",
        operationId: "deleteCompanyById",
        parameters: [
          {
            name: "companyId",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          204: { description: "Company deleted successfully." },
          404: { description: "Company not found." }
        }
      },
      get: {
        summary: "Get a company by ID",
        operationId: "getCompanyById",
        parameters: [
          {
            name: "companyId",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 }
          }
        ],
        responses: {
          200: {
            description: "The company object.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Company" }
              }
            }
          },
          404: { description: "Company not found." }
        }
      },
      patch: {
        summary: "Update a company",
        operationId: "updateCompany",
        parameters: [
          {
            name: "companyId",
            in: "path",
            required: true,
            schema: { type: "integer", example: 1 }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CompanyUpdateRequest" }
            }
          }
        },
        responses: {
          200: {
            description: "Company updated successfully.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Company" }
              }
            }
          },
          400: { description: "Invalid request payload." },
          404: { description: "Company not found." }
        }
      }
    }
  },
  components: {
    schemas: {
      CompanySummary: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Acme Corp" }
        }
      },
      Company: {
        type: "object",
        properties: {
          id: { type: "integer", example: 123 },
          name: { type: "string", example: "New Company" },
          industry: { type: "string", example: "Technology" },
          address: { type: "string", example: "123 Test Street" }
        }
      },
      CompanyCreateRequest: {
        type: "object",
        required: ["name", "industry"],
        properties: {
          name: { type: "string", example: "New Company" },
          industry: { type: "string", example: "Finance" },
          address: { type: "string", example: "123 Test Street" }
        }
      },
      CompanyUpdateRequest: {
        type: "object",
        properties: {
          name: { type: "string", example: "Updated Company Name" },
          industry: { type: "string", example: "Manufacturing" },
          address: { type: "string", example: "456 New Avenue" }
        }
      }
    }
  }
};

// Expose OpenAPI JSON
app.get("/rest/v1/metadata-catalog/companies/openapi.json", (req, res) => {
  res.json(openApiSpec);
});

// Expose Swagger UI at /rest/v1/metadata-catalog/companies
app.use(
  "/rest/v1/metadata-catalog/companies",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec)
);

// ------------------- API Routes -------------------

app.get("/rest/v1/companies", (req, res) => {
  const summaries = companies.map(c => ({ id: c.id, name: c.name }));
  res.json(summaries);
});

app.post("/rest/v1/companies", (req, res) => {
  const { name, industry, address } = req.body;
  if (!name || !industry) {
    return res.status(400).json({ error: "Invalid request payload." });
  }
  const newCompany = { id: nextId++, name, industry, address: address || "" };
  companies.push(newCompany);
  res.status(201)
    .location(`/rest/v1/companies/${newCompany.id}`)
    .json(newCompany);
});

app.get("/rest/v1/companies/:companyId", (req, res) => {
  const companyId = parseInt(req.params.companyId, 10);
  const company = companies.find(c => c.id === companyId);
  if (!company) return res.status(404).json({ error: "Company not found." });
  res.json(company);
});

app.patch("/rest/v1/companies/:companyId", (req, res) => {
  const companyId = parseInt(req.params.companyId, 10);
  const company = companies.find(c => c.id === companyId);
  if (!company) return res.status(404).json({ error: "Company not found." });

  const { name, industry, address } = req.body;
  if (!name && !industry && !address) {
    return res.status(400).json({ error: "Invalid request payload." });
  }

  if (name) company.name = name;
  if (industry) company.industry = industry;
  if (address) company.address = address;

  res.json(company);
});

app.delete("/rest/v1/companies/:companyId", (req, res) => {
  const companyId = parseInt(req.params.companyId, 10);
  const index = companies.findIndex(c => c.id === companyId);
  if (index === -1) return res.status(404).json({ error: "Company not found." });
  
  companies.splice(index, 1);
  res.status(204).send();
});

// ------------------- Start Server -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 Swagger docs at http://localhost:${PORT}/rest/v1/metadata-catalog/companies`);

  // Reset companies every hour
  setInterval(resetCompanies, 3600000);
  console.log('Scheduled hourly reset of companies array');
});
