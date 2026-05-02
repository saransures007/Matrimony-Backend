import express from 'express';
import cors from 'cors';
import http from 'http';
import rateLimit from 'express-rate-limit';
import router from '@routes/routes';
import logger from '@utils/logger';
import { DB } from '@database/index';
import { PORT } from './config';
import { errorHandler } from './utils/error-handler';
import { swaggerSpec, swaggerUi } from './utils/swagger';
import { initRealtime } from './modules/realtime/realtime.service';

const app = express();
const port = PORT;

// CORS config
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 240,
  standardHeaders: true,
  legacyHeaders: false,
}));


// Logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 500) logger.error(message);
    else if (res.statusCode >= 400) logger.warn(message);
    else logger.info(message);
  });
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/test', (_req, res) => {
  res.send('Hello world!');
});


// API routes
app.use('/api', router);

// 404 handler (catch-all) — must be after all routes
app.all(/.*/, (_req, res) => {
  res.status(404).json({ message: 'Sorry! Page not found' });
});


// Error handler — must be after all routes
app.use(errorHandler);

// DB connect & start server
DB.sequelize
  .authenticate()
  .then(async () => {
    logger.info('Database connected successfully!');
    const server = http.createServer(app);
    await initRealtime(server);
    server.listen(port, () => {
      logger.info(`Server running at http://localhost:${port}`);
    });
  })
  .catch(err => {
    logger.error('Unable to connect to DB:', err);
  });
