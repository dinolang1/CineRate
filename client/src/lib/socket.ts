import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const serverUrl = import.meta.env.PROD 
  ? 'wss://cinerate-projekt.onrender.com' 
      : 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinMovie(movieId: string) {
    if (this.socket) {
      this.socket.emit('join-movie', movieId);
    }
  }

  onReviewAdded(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('review-added', callback);
    }
  }

  emitNewReview(data: any) {
    if (this.socket) {
      this.socket.emit('new-review', data);
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
