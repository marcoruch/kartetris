import { EffectMessage, WSCallingMessage, WSGameResultMessage, WSGameUpdateMessage, WSWaitingForPlayerMessage } from './../../shared/types';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { getClient } from './db/client';
import { Server as SocketIOServer } from 'socket.io';
import { retrieveTop10Scores, updateScores } from './db/collections/scores';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;
const MONGO_URI = process.env.MONGO_URI!;

app.use(cors());
app.use(express.json());

const client = getClient(MONGO_URI);

app.get('/', async (_, res) => {
  res.send('Hello from Express!');
});

app.get('/api/ranking', async (_, res) => {
  try {
    await client.connect();
    const highScores = await retrieveTop10Scores(client);
    res.status(200).json(highScores);
  } catch (error) {
    console.error("Error retrieving high scores:", error);
    res.status(500).json({ error: "Failed to retrieve high scores" });
  } finally {
    await client.close();
  }
});


// WS server setup
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // We should adjust this to be .ENV variable for localhost vs. test vs. prod
  },
});


let waitingSockets: any[] = [];

io.on('connection', (socket) => {
  waitingSockets.push(socket);
  socket.emit('waiting', { message: 'Waiting for an opponent...' } as WSWaitingForPlayerMessage);

  if (waitingSockets.length >= 2) {
    const player1 = waitingSockets.shift();
    const player2 = waitingSockets.shift();

    const roomId = `room-${player1.id}-${player2.id}`;
    player1.join(roomId);
    player2.join(roomId);
    player1.emit('matched', { roomId, opponent: player2.id });
    player2.emit('matched', { roomId, opponent: player1.id });
    socket.emit('gameUpdate', { update: 'Game starting!', roomId, board: '', currentFigure: '', step: 0, score: 0, won: undefined });
  }

  socket.on('gameUpdate', (data: WSCallingMessage) => {
    console.log('SERVER gameupdate');
    const { roomId, update, board, currentFigure, step, score, won, playerName, character } = JSON.parse(data) as WSGameUpdateMessage;
    socket.to(roomId).emit('gameUpdate', { update, roomId, board, currentFigure, step, score, won: (won === undefined ? undefined : !won), playerName, character });
  });

  socket.on('effect', (data: EffectMessage) => {
    console.log('SERVER effect');
    const { name, roomId } = data;
    socket.to(roomId).emit('effect', { name, roomId });
  });

  socket.on('gameResult', async (data: WSCallingMessage) => {
    console.log('SERVER gameResult');
    const { roomId, looserName, winnerName, looserScore, winnerScore } = JSON.parse(data) as WSGameResultMessage;


    await client.connect();
    try {
      await updateScores(client, winnerName, winnerScore, looserName, looserScore);
    }
    catch (error) {
      console.error("Error processing game result:", error);
    }
    finally {
      await client.close();
    }

    socket.to(roomId).emit('gameResult', { looserName, winnerName, roomId });
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    waitingSockets = waitingSockets.filter((s) => s.id !== socket.id);
  });
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});