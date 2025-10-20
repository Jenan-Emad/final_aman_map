import http from 'http';
import 'dotenv/config';

import app from './app.js';

const server = http.createServer(app);

server.listen(5000, () => {
    console.log('Server is running on port 5000');
})
