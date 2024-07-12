const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const routes = require('./routes/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const dotenv = require('dotenv');

const app = express();
dotenv.config();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'"],
      },
    },
    referrerPolicy: { policy: 'no-referrer' },
    xssFilter: true,
    hidePoweredBy: true,
    frameguard: { action: 'deny' },
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    ieNoOpen: true,
  })
);

app.use(cors({
  origin: '*',
  // origin: ['*', 'https://senjaro.app', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
});
app.use(limiter);

app.use(morgan('combined'));

const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'GUGU API',
      description: 'This API provides endpoints to manage activities on an GUGU platform. ' +
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
app.use('/api-senjaro', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/', routes);

app.get('/', (req, res) => {
  res.send('Welcome To GUGU API!');
});

// const PORT = process.env.API_PORT || 8080;
const PORT = process.env.API_PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

PORT.keepAliveTimeout = process.env.API_KEEPALIVETIMEOUT; 
PORT.headersTimeout = process.env.API_HEADERSTIMEOUT; 