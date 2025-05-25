import { type WSGameResultMessage, type WSGameUpdateMessage, type WsGameUpdateMessageSerialized } from './../../../../shared/types';
import { io, Socket } from 'socket.io-client';
import store from '../store';
import { setConnectionError, setConnectionStatus } from '../slices/socketSlice';
import { WSSerializer } from '@/lib/serializer';

const socketUrl = import.meta.env.VITE_SOCKET_URL!;

class SocketService {
  private socket: Socket | null = null;

  connect() {
    store.dispatch(setConnectionStatus('connecting'));

    this.socket = io(socketUrl, { port: 443 });

    this.socket.on('connect', () => {
      store.dispatch(setConnectionStatus('connected'));
    });

    this.socket.on('disconnect', () => {
      store.dispatch(setConnectionStatus('disconnected'));
    });

    this.socket.on('connect_error', (error) => {
      store.dispatch(setConnectionError(error.message));
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    store.dispatch(setConnectionStatus('disconnected'));
  }

  /*
  * Do not use! Use typed emit instead!
  */
  emit(event: string, ...args: any[]) {
    if (this.socket) {
      this.socket.emit(event, ...args);
    }
  }

  emitGameResult(wsGameResultMessage: WSGameResultMessage) {
    const gameResultWSMessage: WSGameResultMessage = {
      roomId: wsGameResultMessage.roomId,
      winnerName: wsGameResultMessage.winnerName,
      looserName: wsGameResultMessage.looserName,
      winnerScore: wsGameResultMessage.winnerScore,
      looserScore: wsGameResultMessage.looserScore,
    };

    const gameResultWsMessageSerialized = JSON.stringify(gameResultWSMessage);
    this.emit('gameResult', gameResultWsMessageSerialized);
  }

  emitGameUpdate(wsGameUpdateMessage: WSGameUpdateMessage) {
    const gameUpdateWsMessageSerialized: WsGameUpdateMessageSerialized = {
      roomId: wsGameUpdateMessage.roomId,
      update: wsGameUpdateMessage.update,
      board: wsGameUpdateMessage.board?.map((row) => row.map(item => item ? WSSerializer.serializeFigure(item) : undefined)),
      currentFigure: WSSerializer.serializeCurrentFigure(wsGameUpdateMessage.currentFigure),
      step: wsGameUpdateMessage.step,
      score: wsGameUpdateMessage.score,
      won: wsGameUpdateMessage.won,
      character: wsGameUpdateMessage.character,
      playerName: wsGameUpdateMessage.playerName,
    }

    
    const gameUpdateWsMessage = JSON.stringify(gameUpdateWsMessageSerialized);
    socketService.emit('gameUpdate', gameUpdateWsMessage);
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

export const socketService = new SocketService();
