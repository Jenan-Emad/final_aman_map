// middleware/logger.js
// this middleware used to check the requests that hitting the server 
const logger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

export default logger;
