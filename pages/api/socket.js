import { Server } from 'Socket.IO'

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    let players = [];
    let turn = 0;
    console.log('Socket is initializing')
    const io = new Server(res.socket.server)
    res.socket.server.io = io

    io.on('connection', socket => {
      players.push(socket.id);
      console.log(players);
      socket.on('player-check', () => {
        socket.emit('start-game', players.length);
        socket.broadcast.emit('start-game', players.length);
      });
      socket.on('input-change', msg => {
        if (socket.id === players[turn % 2]) {
          socket.broadcast.emit('update-input', msg);
          socket.emit('update-input', msg);
          turn++;
        }
      });
      socket.on('game-restart', msg => {
        socket.broadcast.emit('update-input', msg);
      })
      socket.on('disconnect', () => {
        socket.broadcast.emit('player-disconnect', 'Player Disconnected');
        players.splice(players.indexOf(socket),1);
        turn = 0;
        console.log(players);
      });
    })
  }
  res.end()
}

export default SocketHandler;