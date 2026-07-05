let io;

export const initSocket = (serverIo) => {
  io = serverIo;

  io.on('connection', (socket) => {
    socket.on('join', (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
};

export const emitToUser = (userId, event, payload) => {
  if (io && userId) io.to(`user:${userId}`).emit(event, payload);
};
