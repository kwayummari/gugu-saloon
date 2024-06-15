const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const routes = require('./routes/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Use helmet middleware for setting HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
        // Add more directives as needed
      },
    },
  })
);

// Use CORS middleware with specific options
app.use(cors({
  // origin: 'http://trusted-origin.com',
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(morgan('combined'));

// Swagger Configuration
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'ERP',
      description: 'This API provides endpoints to manage activities on an ERP platform. ' +
      'It allows users to create, retrieve, update, and delete various learning activities such as ' +
      'courses, quizzes, assignments, discussions, and more. Authentication and user-related functionalities ' +
      'are also included to manage users enrolled in activities and their progress.',
      version: '1.0.0',
    },
  },
  apis: ['./*.yaml'],
  host: process.env.API_SERVER,
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use routes defined in routes.js with base URL '/api'
app.use('/', routes);

// Define a simple route
app.get('/', (req, res) => {
  res.send('Welcome to my Node.js API!');
});

// Start the server
const PORT = process.env.API_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
