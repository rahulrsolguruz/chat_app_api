import express from 'express';
import cors from 'cors';
import { env } from './config/env.config';
import { limiter } from './middlewares/limiter';
import router from './routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthenticator } from './middlewares/authenticate-user';
import { setupSocketHandlers } from './sockets';

const app = express();
const server = createServer(app);
const port = env.PORT;

app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use('/api/v1', router);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

app.set('io', io);
io.use(socketAuthenticator);
setupSocketHandlers(io);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
