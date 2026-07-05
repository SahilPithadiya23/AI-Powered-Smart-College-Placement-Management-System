import http from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { initSocket } from './services/socketService.js';
import { startSchedulers } from './services/scheduler.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    credentials: true
  }
});

initSocket(io);

const boot = async () => {
  await connectDb();
  startSchedulers();
  server.listen(env.port, () => console.log(`API running on http://localhost:${env.port}`));
};

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use. Stop the existing backend process or set PORT to another value.`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

boot().catch((error) => {
  console.error(error);
  process.exit(1);
});
