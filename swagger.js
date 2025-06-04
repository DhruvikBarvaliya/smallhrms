const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRMS API Documentation",
      version: "1.0.0",
      description: "Swagger documentation for HRMS APIs",
    },
    servers: [
      {
        url: "http://localhost:3000/api",
      },
      {
        url: "https://smallhrms.onrender.com/api",
      },
    ],
    components: {
      schemas: {
        Employee: {
          type: "object",
          required: [
            "employeeId",
            "name",
            "email",
            "phone",
            "department",
            "position",
            "joiningDate",
          ],
          properties: {
            employeeId: { type: "number", example: 101 },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            phone: { type: "string", example: "9876543210" },
            department: { type: "string", example: "HR" },
            position: { type: "string", example: "Manager" },
            joiningDate: {
              type: "string",
              format: "date",
              example: "2023-01-10",
            },
            salary: { type: "number", example: 45000 },
            dateOfBirth: {
              type: "string",
              format: "date",
              example: "1990-06-15",
            },
            qualification: { type: "string", example: "MBA" },
            passOutYear: { type: "number", example: 2012 },
            reference: { type: "string", example: "LinkedIn" },
            releaseDate: {
              type: "string",
              format: "date",
              example: "2025-12-31",
            },
          },
        },
        Leave: {
          type: "object",
          required: [
            "employeeId",
            "leaveType",
            "startDate",
            "endDate",
            "reason",
            "totalDays",
            "month",
            "year",
          ],
          properties: {
            employeeId: { type: "string", example: "60f6a4dbf8a4b445dc0f5471" },
            leaveType: {
              type: "string",
              enum: ["full_day", "half_day"],
              example: "full_day",
            },
            startDate: {
              type: "string",
              format: "date",
              example: "2024-06-01",
            },
            endDate: { type: "string", format: "date", example: "2024-06-03" },
            reason: { type: "string", example: "Medical emergency" },
            status: {
              type: "string",
              enum: ["pending", "approved", "rejected"],
              example: "pending",
            },
            appliedDate: {
              type: "string",
              format: "date-time",
              example: "2024-05-30T12:00:00Z",
            },
            approvedBy: { type: "string", example: "HR Manager" },
            approvalDate: {
              type: "string",
              format: "date",
              example: "2024-06-01",
            },
            totalDays: { type: "number", example: 3 },
            month: { type: "number", example: 6 },
            year: { type: "number", example: 2024 },
            isPaid: { type: "boolean", example: true },
          },
        },
      },
    },
  },
  apis: ["./routes/router.js"],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwagger;
