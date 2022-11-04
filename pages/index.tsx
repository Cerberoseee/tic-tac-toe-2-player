import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import styles from "styles/Home.module.scss"

let socket:any;

const Square = (props: any) => {
  const { value, onClick } = props;
  return (
    <div onClick={onClick} className={styles.square}>
      {value}
    </div>
  )
} 

const Board = (props: any) => {
  const { board, onClick } = props;
  return (
    <div className={styles.board}>
      {
        board.map((item: any, index: any) => (
          <Square 
            key={index} 
            value={item} 
            onClick={() => onClick(index)}
          />
        ))
      }
    </div>
  )
}

const Home = () => {  
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState(true);
  const [start, setStart] = useState(false);
  
  const calculateWinner = (squares: any) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  }
  
  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setTurn(true);
    let msg = {
      board: Array(9).fill(null),
      turn: true,
    }
    socket.emit('game-restart', msg);
  }

  const onClick = (index: any) => {
    let squares = [...board];
    if (calculateWinner(board) || squares[index]) {
      let msg = {
        board: board,
        turn: turn,
      }
      socket.emit('input-change', msg);
      return;
    }
    squares[index] = turn ? "X" : "O";
    let msg = {
      board: squares,
      turn: !turn,
    }
    socket.emit('input-change', msg);
  }

  useEffect(() => {
    socketInitializer();
    return () => {
      console.log("This will be logged on unmount");
    }
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket');
    socket = io()    ;
    socket.on('connect', (msg:any) => {
      console.log('Player Connected');
      socket.emit('player-check', '');
    })
    socket.on('update-input', (msg:any) => {  
      setBoard(msg.board);
      setTurn(msg.turn);
    })
    socket.on('start-game', (msg: any) => {
      if (msg >= 2) setStart(true);
    });
    socket.on('player-disconnect', (msg: any) => {
      alert(msg);
      setStart(false);
    })
  }

  return (
    <div className={styles.game}>
      {start ? 
        (
        <div>
          <Board onClick={onClick} board={board}/>
          <div className={styles.information}>
            <div className={styles.turn}>{(turn? 'X': 'O')+ "'s turn"}</div>
            <div>{calculateWinner(board) ? calculateWinner(board) + " wins!" : null}</div>
            {calculateWinner(board) && (
              <button onClick={restartGame}>Restart game</button>
            )}
          </div>
        </div>
        
        ) : (
          <div>
            <h1>Waiting for players...</h1>
          </div>
        )
      }
    </div>
      
  )
}

export default Home;