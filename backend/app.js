// import express from 'express';
// import routes from './routes/index.js';
// import cors from "cors";
// // const { WebServiceClient } = require('@maxmind/geoip2-node');

// const app = express();

// // app.use(express.json());

// // app.use(express.static('public'));

// // //test of how to get user ip address
// // app.get('/get-ip', (req, res) => {
// //   // Get client IP
// //   const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
// //   console.log('Client IP:', ip);
// //   res.json({ ip });
// // });

// // app.get('/home', (req, res, next) => {
// //     res.send('<h1>Welcome to the Home Page</h1>');
// // });

// routes(app);

// // app.use('/map', mapRoutes); 

// // إضافة CORS
// app.use(cors({
//   origin: 'http://localhost:5173',  // السماح للـ Frontend
//   credentials: true
// }));

// // إضافة JSON Parser
// app.use(express.json());  // عشان نقدر نستقبل JSON من Frontend

// export default app;


import express from 'express';
import routes from './routes/index.js';
import cors from "cors";
import rateLimit from 'express-rate-limit';

const app = express();

// إضافة CORS قبل أي middleware آخر
app.use(cors({
  origin: 'http://localhost:5173',  // السماح للـ Frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'تم تجاوز عدد المحاولات المسموح بها. يرجى المحاولة لاحقاً',
  standardHeaders: true,
  legacyHeaders: false,
});

// إضافة JSON Parser
app.use(express.json());

// إضافة static files (if needed)
// app.use(express.static('public'));

// Routes
routes(app);
app.use('/map', limiter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

export default app;