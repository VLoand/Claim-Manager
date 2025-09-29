// WebSocket Service for Real-Time Communication
import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.callbacks = new Map();
  }

  // Initialize socket connection
  connect(userId = null) {
    if (this.socket) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
    
    this.socket = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket.id);
      this.isConnected = true;
      
      // Join user-specific room if userId provided
      if (userId) {
        this.socket.emit('join-room', userId);
        console.log(`🏠 Joined room for user: ${userId}`);
      }

      // Notify connection status callbacks
      this.emit('connection-status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection-status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 WebSocket connection error:', error);
      this.emit('connection-error', error);
    });

    // Register real-time event listeners
    this.setupEventListeners();

    return this.socket;
  }

  // Setup all real-time event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Claim status updates
    this.socket.on('claim-status-updated', (data) => {
      console.log('📋 Claim status updated:', data);
      this.emit('claim-status-updated', data);
    });

    // New claims created
    this.socket.on('claim-created', (data) => {
      console.log('🆕 New claim created:', data);
      this.emit('claim-created', data);
    });

    // Document uploaded
    this.socket.on('document-uploaded', (data) => {
      console.log('📄 Document uploaded:', data);
      this.emit('document-uploaded', data);
    });

    // General notifications
    this.socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data);
      this.emit('notification', data);
    });

    // Admin alerts
    this.socket.on('admin-alert', (data) => {
      console.log('⚠️ Admin alert:', data);
      this.emit('admin-alert', data);
    });
  }

  // Subscribe to events with callbacks
  on(event, callback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.callbacks.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Emit events to registered callbacks
  emit(event, data) {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }

  // Send data to server
  send(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot send:', event, data);
    }
  }

  // Join a specific room
  joinRoom(roomId) {
    this.send('join-room', roomId);
  }

  // Leave a specific room
  leaveRoom(roomId) {
    this.send('leave-room', roomId);
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.callbacks.clear();
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;