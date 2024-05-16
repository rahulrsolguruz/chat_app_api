export const userSocketIDs = new Map();
export const onlineUsers = new Set();
export const getSockets = (users = []) => {
  const sockets = users.map((user) => userSocketIDs.get(user.toString()));

  return sockets;
};
export const emitEvent = (req, event, users, data?) => {
  const io = req.app.get('io');
  const usersSocket = getSockets(users);
  io.to(usersSocket).emit(event, data);
};
