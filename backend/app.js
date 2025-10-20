import express from 'express';
import routes from './routes/index.js';
// const { WebServiceClient } = require('@maxmind/geoip2-node');

const app = express();

app.use(express.json());

// app.use(express.static('public'));

// //test of how to get user ip address
// app.get('/get-ip', (req, res) => {
//   // Get client IP
//   const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//   console.log('Client IP:', ip);
//   res.json({ ip });
// });

// app.get('/home', (req, res, next) => {
//     res.send('<h1>Welcome to the Home Page</h1>');
// });

routes(app);

// app.use('/map', mapRoutes); 

export default app;