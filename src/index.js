import express from 'express';
import http from 'http';
import { matchRouter } from './routes/matches.js';
import { commentryRouter } from './routes/commentry.js';
import { attachWebSocketServer } from './ws/server.js';
import { securityMiddleware } from '../arcjet.js';

const PORT = Number(process.env.PORT) || 8000;
const HOST = process.env.HOST || '0.0.0.0';

const app = express();

const server = http.createServer(app);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from express server');
});

app.use(securityMiddleware());
app.use('/matches', matchRouter);
app.use('/matches/:id/commentry', commentryRouter);

const { broadCastMatchCreated, broadCastCommentry } =
  attachWebSocketServer(server);
app.locals.broadCastMatchCreated = broadCastMatchCreated;
app.locals.broadCastCommentry = broadCastCommentry;

server.listen(PORT, HOST, () => {
  const baseUrl =
    HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server is running on ${baseUrl}`);
  console.log(`Websocket running on  ${baseUrl.replace('http', 'ws')}/ws`);
});
