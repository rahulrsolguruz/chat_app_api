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

// N4
import { and, eq, or } from 'drizzle-orm';
import db from '../config/db.config';
import { group_chat_members, group_chats, group_messages, role_type_enum, users } from '../model/schema';
import ENUM from '../utils/enum';
import { logger } from '../utils/logger';
import { EVENTS } from './events';
import { ioResponse } from '../utils/common.functions';
import { errorMessage, successMessage } from '../config/constant.config';

export const groupChatHandler = (socket) => {
  const user_id = socket.user?.id;

  socket.on(EVENTS.GROUP_CHAT.CREATE, async (data) => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        logger.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }
    const { group_name, group_picture_url } = data;

    try {
      const group_admin = user_id;

      const newGroupChat = {
        group_admin,
        group_name,
        group_picture_url
      };

      const [result] = await db.insert(group_chats).values(newGroupChat).returning();
      const newGroupChatMembers = {
        user_id: result.group_admin,
        group_id: result.id,
        joined_at: new Date(),
        role: role_type_enum.enumValues[0]
      };
      await db.insert(group_chat_members).values(newGroupChatMembers).returning();

      if (!result) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.CREATE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      return ioResponse(socket, EVENTS.GROUP_CHAT.CREATE, true, successMessage.ADDED('Group Chat'), result);
    } catch (error) {
      logger.error(`Error : ${error.message}`);
      return ioResponse(socket, EVENTS.GROUP_CHAT.CREATE, false, 'Failed to create group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.UPDATE, async (data) => {
    const { group_id, newGroupName, newGroupPictureUrl } = data;

    try {
      const [group] = await db
        .select({ group_id: group_chats.id })
        .from(group_chats)
        .where(and(eq(group_chats.group_admin, user_id), eq(group_chats.id, group_id)));

      if (!group) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.UPDATE, false, errorMessage.NOT_EXIST('Group Chat'));
      }

      const [updatedGroup] = await db
        .update(group_chats)
        .set({ group_name: newGroupName, group_picture_url: newGroupPictureUrl })
        .where(eq(group_chats.id, group_id))
        .returning({
          group_id: group_chats.id,
          group_name: group_chats.group_name,
          group_picture_url: group_chats.group_picture_url
        });

      if (!updatedGroup) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.UPDATE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      return ioResponse(socket, EVENTS.GROUP_CHAT.UPDATE, true, successMessage.UPDATED('Group Chat'), updatedGroup);
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.UPDATE, false, 'Failed to update group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.DELETE, async (data) => {
    const { group_id } = data;

    try {
      const [group] = await db
        .select({ group_id: group_chats.id })
        .from(group_chats)
        .where(and(eq(group_chats.group_admin, user_id), eq(group_chats.id, group_id)));

      if (!group) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.NOT_EXIST('Group Chat'));
      }

      const [deleteCount] = await db
        .update(group_chats)
        .set({ deleted_at: new Date() })
        .where(eq(group_chats.id, group_id));

      if (!deleteCount) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, true, successMessage.DELETED('Group Chat'));
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, 'Failed to delete group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.ADD_MEMBER, async (data) => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (error) {
        logger.error(`Error parsing JSON: ${error.message}`);
        socket.emit('error', { message: 'Invalid JSON format' });
        return;
      }
    }
    const { group_id, member_id } = data;

    try {
      const [isAdmin] = await db
        .select()
        .from(group_chat_members)
        .where(
          and(
            eq(group_chat_members.group_id, group_id),
            eq(group_chat_members.user_id, user_id),
            eq(group_chat_members.role, ENUM.RoleType.ADMIN)
          )
        );

      if (!isAdmin) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.id, group_id), eq(group_chat_members.user_id, member_id)));

      if (isMember) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.EXIST('Member'));
      }

      await db.insert(group_chat_members).values({ user_id: member_id, group_id, role: ENUM.RoleType.MEMBER });

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_ADDED, { member_id });
      return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, true, successMessage.ADDED('Member'));
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, 'Failed to add member to group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.REMOVE_MEMBER, async (data) => {
    const { group_id, member_id } = data;

    try {
      const [isAdmin] = await db
        .select()
        .from(group_chat_members)
        .where(
          and(
            eq(group_chat_members.group_id, group_id),
            eq(group_chat_members.user_id, user_id),
            eq(group_chat_members.role, ENUM.RoleType.ADMIN)
          )
        );

      if (!isAdmin) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const [deleteCount] = await db
        .delete()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, member_id)));

      if (!deleteCount) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_REMOVED, { member_id });
      return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, true, successMessage.REMOVED('Member'));
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, 'Failed to remove member from group chat');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.SEND_MESSAGE, async (data) => {
    const { group_id, message_content, message_type, media_url } = data;

    try {
      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, user_id)));

      if (!isMember) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const newMessage = {
        sender_id: user_id,
        group_id,
        message_content,
        message_type: ENUM.MessageType[message_type],
        media_url,
        time_stamp: new Date(),
        status: ENUM.MessageStatus.SENT
      };

      const [result] = await db.insert(group_messages).values(newMessage).returning({
        message_id: group_messages.id,
        message_content: group_messages.message_content,
        message_type: group_messages.message_type,
        media_url: group_messages.media_url,
        time_stamp: group_messages.time_stamp,
        status: group_messages.status
      });

      if (!result) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.RECEIVE_MESSAGE, result);
      return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, true, successMessage.ADDED('Message'), result);
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, 'Failed to send group message');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.GET_MESSAGES, async (data) => {
    const { group_id, page = 1, limit = 10 } = data;
    const offset = (page - 1) * limit;

    try {
      const [isMember] = await db
        .select()
        .from(group_chat_members)
        .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, user_id)));

      if (!isMember) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.GET_MESSAGES, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const totalMessagesResult = await db
        .select(db.raw('COUNT(*) AS count'))
        .from(group_messages)
        .where(eq(group_messages.group_id, group_id));

      const totalMessages = totalMessagesResult ? totalMessagesResult.count : 0;

      const messages = await db
        .select({
          message_id: group_messages.id,
          sender_id: group_messages.sender_id,
          message_content: group_messages.message_content,
          message_type: group_messages.message_type,
          media_url: group_messages.media_url,
          time_stamp: group_messages.time_stamp,
          status: group_messages.status,
          sender_username: users.username
        })
        .from(group_messages)
        .join(users, eq(group_messages.sender_id, users.id))
        .where(eq(group_messages.group_id, group_id))
        .limit(limit)
        .offset(offset)
        .orderBy(group_messages.time_stamp, 'asc');

      const responseData = {
        message: successMessage.FETCHED('Group Messages'),
        total: totalMessages,
        limit,
        skip: offset,
        data: messages
      };

      return ioResponse(
        socket,
        EVENTS.GROUP_CHAT.GET_MESSAGES,
        true,
        successMessage.FETCHED('Group Messages'),
        responseData
      );
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.GET_MESSAGES, false, 'Failed to get group messages');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.DELETE, async (data) => {
    const { group_id, message_id } = data;

    try {
      const [isSenderOrAdmin] = await db
        .select()
        .from(group_messages)
        .join(group_chat_members, eq(group_messages.group_id, group_chat_members.group_id))
        .where(
          and(
            eq(group_messages.id, message_id),
            eq(group_chat_members.id, group_id),
            eq(group_chat_members.user_id, user_id),
            or(eq(group_chat_members.role, ENUM.RoleType.ADMIN), eq(group_messages.sender_id, user_id))
          )
        );

      if (!isSenderOrAdmin) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.UNAUTHORIZED_ACCESS);
      }

      const deleteCount = await db.delete(group_messages).where(eq(group_messages.id, message_id));

      if (!deleteCount) {
        return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, errorMessage.SOMETHING_WENT_WRONG);
      }

      socket.to(group_id).emit(EVENTS.GROUP_CHAT.MESSAGE_DELETED, { message_id });
      return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, true, successMessage.DELETED('Message'));
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.DELETE, false, 'Failed to delete group message');
    }
  });

  socket.on(EVENTS.GROUP_CHAT.GET_MEMBERS, async (data) => {
    const { group_id } = data;

    try {
      const memberList = await db
        .select({
          user_id: group_chat_members.user_id,
          role: group_chat_members.role,
          username: users.username,
          email: users.email
        })
        .from(group_chat_members)
        .join(users, eq(group_chat_members.user_id, users.id))
        .where(eq(group_chat_members.group_id, group_id));

      return ioResponse(
        socket,
        EVENTS.GROUP_CHAT.GET_MEMBERS,
        true,
        successMessage.FETCHED('Group Chat Members'),
        memberList
      );
    } catch (error) {
      return ioResponse(socket, EVENTS.GROUP_CHAT.GET_MEMBERS, false, 'Failed to get group chat members');
    }
  });
};

// N5
// // Add member to group chat
// socket.on(EVENTS.GROUP_CHAT.ADD_MEMBER, async (data) => {
//   if (typeof data === 'string') {
//     try {
//       data = JSON.parse(data);
//     } catch (error) {
//       logger.error(`Error parsing JSON: ${error.message}`);
//       socket.emit('error', { message: 'Invalid JSON format' });
//       return;
//     }
//   }
//   const { group_id, member_id } = data;

//   try {
//     const [isAdmin] = await db
//       .select()
//       .from(group_chats)
//       .where(and(eq(group_chats.id, group_id), eq(group_chats.group_admin, user_id)));
//     if (!isAdmin) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
//     }

//     const [isMember] = await db
//       .select()
//       .from(group_chat_members)
//       .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, member_id)));

//     if (isMember) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, errorMessage.EXIST('Member'));
//     }

//     await db.insert(group_chat_members).values({ user_id: member_id, group_id, role: ENUM.RoleType.MEMBER });

//     socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_ADDED, { member_id });
//     ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, true, successMessage.ADDED('Member'));
//   } catch (error) {
//     ioResponse(socket, EVENTS.GROUP_CHAT.ADD_MEMBER, false, 'Failed to add member to group chat');
//   }
// });

// // Remove member from group chat
// socket.on(EVENTS.GROUP_CHAT.REMOVE_MEMBER, async (data) => {
//   if (typeof data === 'string') {
//     try {
//       data = JSON.parse(data);
//     } catch (error) {
//       logger.error(`Error parsing JSON: ${error.message}`);
//       socket.emit('error', { message: 'Invalid JSON format' });
//       return;
//     }
//   }
//   const { group_id, member_id } = data;

//   try {
//     // Check if the user is the group admin
//     const [isAdmin] = await db
//       .select()
//       .from(group_chats)
//       .where(and(eq(group_chats.id, group_id), eq(group_chats.group_admin, user_id)));

//     if (!isAdmin) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.UNAUTHORIZED_ACCESS);
//     }

//     // Check if the member is part of the group
//     const [isMember] = await db
//       .select()
//       .from(group_chat_members)
//       .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, member_id)));

//     if (!isMember) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.NOT_EXIST('memeber'));
//     }

//     // Remove the member from the group chat
//     const [deleteCount] = await db
//       .delete(group_chat_members)
//       .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, member_id)))
//       .returning();

//     if (!deleteCount) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, errorMessage.SOMETHING_WENT_WRONG);
//     }

//     socket.to(group_id).emit(EVENTS.GROUP_CHAT.MEMBER_REMOVED, { member_id });
//     ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, true, successMessage.REMOVED('Member'));
//   } catch (error) {
//     console.log(error);
//     ioResponse(socket, EVENTS.GROUP_CHAT.REMOVE_MEMBER, false, 'Failed to remove member from group chat');
//   }
// });

// // Send message to group chat
// socket.on(EVENTS.GROUP_CHAT.SEND_MESSAGE, async (data) => {
//   if (typeof data === 'string') {
//     try {
//       data = JSON.parse(data);
//     } catch (error) {
//       logger.error(`Error parsing JSON: ${error.message}`);
//       socket.emit('error', { message: 'Invalid JSON format' });
//       return;
//     }
//   }
//   const { group_id, message_content, message_type, media_url } = data;

//   try {
//     const [isMember] = await db
//       .select()
//       .from(group_chat_members)
//       .where(and(eq(group_chat_members.group_id, group_id), eq(group_chat_members.user_id, user_id)));

//     if (!isMember) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.UNAUTHORIZED_ACCESS);
//     }

//     const newMessage = {
//       sender_id: user_id,
//       group_id,
//       message_content,
//       message_type: ENUM.MessageType[message_type],
//       media_url,
//       time_stamp: new Date(),
//       status: ENUM.MessageStatus.SENT
//     };

//     const [result] = await db.insert(group_messages).values(newMessage).returning({
//       message_id: group_messages.id,
//       message_content: group_messages.message_content,
//       message_type: group_messages.message_type,
//       media_url: group_messages.media_url,
//       time_stamp: group_messages.time_stamp,
//       status: group_messages.status
//     });

//     if (!result) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, errorMessage.SOMETHING_WENT_WRONG);
//     }

//     // Emit the message to the entire group
//     io.to(group_id).emit(EVENTS.GROUP_CHAT.RECEIVE_MESSAGE, result);
//     ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, true, successMessage.ADDED('Message'), result);
//   } catch (error) {
//     ioResponse(socket, EVENTS.GROUP_CHAT.SEND_MESSAGE, false, 'Failed to send group message');
//   }
// });

// // Delete message from group chat
// socket.on(EVENTS.GROUP_CHAT.DELETED, async (data) => {
//   const { group_id, message_id } = data;

//   try {
//     const [isSenderOrAdmin] = await db
//       .select()
//       .from(group_messages)
//       .join(group_chat_members, eq(group_messages.group_id, group_chat_members.group_id))
//       .where(
//         and(
//           eq(group_messages.id, message_id),
//           eq(group_chat_members.group_id, group_id),
//           eq(group_chat_members.user_id, user_id),
//           or(eq(group_chat_members.role, ENUM.RoleType.ADMIN), eq(group_messages.sender_id, user_id))
//         )
//       );

//     if (!isSenderOrAdmin) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.DELETED, false, errorMessage.UNAUTHORIZED_ACCESS);
//     }

//     const deleteCount = await db.delete(group_messages).where(eq(group_messages.id, message_id));

//     if (!deleteCount) {
//       return ioResponse(socket, EVENTS.GROUP_CHAT.DELETED, false, errorMessage.SOMETHING_WENT_WRONG);
//     }

//     socket.to(group_id).emit(EVENTS.GROUP_CHAT.MESSAGE_DELETED, { message_id });
//     ioResponse(socket, EVENTS.GROUP_CHAT.DELETED, true, successMessage.DELETED('Message'));
//   } catch (error) {
//     ioResponse(socket, EVENTS.GROUP_CHAT.DELETED, false, 'Failed to delete group message');
//   }
// });

// Join Group Room
