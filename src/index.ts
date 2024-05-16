import express from 'express';
import cors from 'cors';
import { env } from './config/env.config';
import { limiter } from './middlewares/limiter';
import router from './routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { getSockets, onlineUsers, userSocketIDs } from './utils/common.functions';
import {
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  NEW_MESSAGE_ALERT,
  NEW_REQUEST,
  ONLINE_USERS,
  START_TYPING,
  STOP_TYPING
} from './utils/events';
import { socketAuthenticator } from './middlewares/authenticate-user';
const app = express();
const server = createServer(app);
const port = env.PORT;
// const io = new Server(server, {
//   cors: corsOptions
// });
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

app.use('/api/v1', router);
// socket io setup start
const io = new Server(server);
app.set('io', io);
io.use(socketAuthenticator);
io.on('connection', (socket) => {
  const user = socket.user;
  userSocketIDs.set(user.id.toString(), socket.id);
  // handle the NEW_REQUEST event
  socket.on(NEW_REQUEST, (data) => {
    console.log('Received NEW_REQUEST event:', data);
    // send a notification to the user who received the friend request
    io.to(data.to).emit('NEW_NOTIFICATION', {
      type: 'friend_request',
      message: `${data.from} has sent you a friend request`
    });
  });
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
    const messageForRealTime = {
      content: message,
      // _id: 'uuid',
      sender: {
        _id: user.user_id,
        name: user.name
      },
      chat: chatId,
      createdAt: new Date().toISOString()
    };

    const messageForDB = {
      content: message,
      sender: user.user_id,
      chat: chatId
    };

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(NEW_MESSAGE, {
      chatId,
      message: messageForRealTime
    });
    io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId });

    try {
      await message.create(messageForDB);
    } catch (error) {
      throw new Error(error);
    }
  });

  socket.on(START_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(START_TYPING, { chatId });
  });

  socket.on(STOP_TYPING, ({ members, chatId }) => {
    const membersSockets = getSockets(members);
    socket.to(membersSockets).emit(STOP_TYPING, { chatId });
  });

  socket.on(CHAT_JOINED, ({ userId, members }) => {
    onlineUsers.add(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on(CHAT_LEAVED, ({ userId, members }) => {
    onlineUsers.delete(userId.toString());

    const membersSocket = getSockets(members);
    io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers));
  });

  socket.on('disconnect', () => {
    userSocketIDs.delete(user.user_id.toString());
    onlineUsers.delete(user.user_id.toString());
    socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers));
  });
});
server.listen(port, () => {
  console.log(`Server is Running On the port ${port}`);
});
