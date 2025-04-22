let io;

module.exports =  {
    init: (httpServer) => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: '*'
            }
        });
        io.on('connection', socket => {
            console.log('Client connected!');
            socket.on('disconnect', () => {
                console.log('Client disconnected!');
            });
        });
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    }
}