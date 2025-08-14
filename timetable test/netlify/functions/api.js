const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const path = require('path');

// Import your existing server logic
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import and use your existing routes from server.js
// Note: You'll need to modify server.js to export the routes
const { setupRoutes } = require('../../server/server-routes');
setupRoutes(app);

// Export the serverless function
exports.handler = serverless(app);
