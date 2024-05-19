import express from 'express';
import cors from 'cors';
import { env } from './config/env.config';
import { limiter } from './middlewares/limiter';
import router from './routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthenticator } from './middlewares/authenticate-user';
const app = express();
const server = createServer(app);
const port = env.PORT;

app.use(cors({ origin: true }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(limiter);

app.use('/api/v1', router);

// socket io setup start

const io = new Server(server);

app.set('io', io);

io.use(socketAuthenticator);

server.listen(port, () => {
  console.log(`Server is Running On the port ${port}`);
});

// N1
import express from 'express';
import cors from 'cors';
import { env } from './config/env.config';
import { limiter } from './middlewares/limiter';
import router from './routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthenticator } from './middlewares/authenticate-user';
import db from './config/db.config';
import { messages } from './model/schema';
import ENUM from './utils/enum';

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
    origin: '*' // Adjust this as per your requirements
  }
});

app.set('io', io);

io.use(socketAuthenticator);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Assuming the user ID is attached to the socket object by the socketAuthenticator
  const user_id = socket.user?.id;
  if (user_id) {
    socket.join(user_id); // Join the user to a room identified by their user ID
    console.log(`User with ID ${user_id} joined room ${user_id}`);
  }

  socket.on('sendMessage', async (data) => {
    console.log('Raw incoming data:', data); // Log the raw incoming data

    // Check if the data is a string and parse it to JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { receiver_id, message_content } = data;
    const sender_id = socket.user?.id;

    if (!receiver_id || !message_content || !sender_id) {
      console.log('Missing required fields');
      socket.emit('error', { message: 'Invalid data' });
      return;
    }

    try {
      // Insert the message into the database
      const [result] = await db
        .insert(messages)
        .values({
          sender_id,
          receiver_id,
          message_content,
          message_type: ENUM.MessageType.TEXT,
          time_stamp: new Date(),
          status: ENUM.MessageStatus.SENT
        })
        .returning({
          message_id: messages.id
        });

      if (result) {
        // Emit the message to the receiver's room
        io.to(receiver_id).emit('receiveMessage', {
          message_id: result.message_id,
          sender_id,
          receiver_id,
          message_content,
          message_type: ENUM.MessageType.TEXT,
          time_stamp: new Date(),
          status: ENUM.MessageStatus.SENT
        });
        console.log(`Message sent to room ${receiver_id}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Message sending failed', error });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// N2
import express from 'express';
import cors from 'cors';
import { env } from './config/env.config';
import { limiter } from './middlewares/limiter';
import router from './routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthenticator } from './middlewares/authenticate-user';
import { socketHandler } from './socketHandler'; // Import the socketHandler

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
    origin: '*' // Adjust this as per your requirements
  }
});

app.set('io', io);

io.use(socketAuthenticator);

// Use the socketHandler for managing socket events
socketHandler(io);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// N3
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Assuming the user ID is attached to the socket object by the socketAuthenticator
  const user_id = socket.user?.id;
  if (user_id) {
    socket.join(user_id); // Join the user to a room identified by their user ID
    console.log(`User with ID ${user_id} joined room ${user_id}`);
  }

  socket.on('sendMessage', async (data) => {
    console.log('Raw incoming data:', data); // Log the raw incoming data

    // Check if the data is a string and parse it to JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }

    const { receiver_id, message_content } = data;
    const sender_id = socket.user?.id;

    if (!receiver_id || !message_content || !sender_id) {
      console.log('Missing required fields');
      socket.emit('error', { message: 'Invalid data' });
      return;
    }

    try {
      // Insert the message into the database
      const [result] = await db
        .insert(messages)
        .values({
          sender_id,
          receiver_id,
          message_content,
          message_type: ENUM.MessageType.TEXT,
          time_stamp: new Date(),
          status: ENUM.MessageStatus.SENT
        })
        .returning({
          message_id: messages.id
        });

      if (result) {
        // Emit the message to the receiver's room
        io.to(receiver_id).emit('receiveMessage', {
          message_id: result.message_id,
          sender_id,
          receiver_id,
          message_content,
          message_type: ENUM.MessageType.TEXT,
          time_stamp: new Date(),
          status: ENUM.MessageStatus.SENT
        });
        console.log(`Message sent to room ${receiver_id}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Message sending failed', error });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
