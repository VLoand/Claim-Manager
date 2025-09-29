// Notification Context for Real-Time Notifications
import React, { createContext, useContext, useReducer, useCallback } from 'react';
import socketService from '../services/socket';

const NotificationContext = createContext();

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  CLAIM_UPDATE: 'claim_update'
};

// Initial state
const initialState = {
  notifications: [],
  connectionStatus: { connected: false }
};

// Reducer
function notificationReducer(state, action) {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, {
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          ...action.payload
        }]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    
    case 'UPDATE_CONNECTION_STATUS':
      return {
        ...state,
        connectionStatus: action.payload
      };
    
    default:
      return state;
  }
}

// Provider Component
export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Add notification
  const addNotification = useCallback((notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: NOTIFICATION_TYPES.INFO,
        autoClose: true,
        duration: 5000,
        ...notification
      }
    });
  }, []);

  // Remove notification
  const removeNotification = useCallback((id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  }, []);

  // Success notification shorthand
  const showSuccess = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      message,
      ...options
    });
  }, [addNotification]);

  // Error notification shorthand
  const showError = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      message,
      autoClose: false,
      ...options
    });
  }, [addNotification]);

  // Warning notification shorthand
  const showWarning = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      message,
      ...options
    });
  }, [addNotification]);

  // Info notification shorthand
  const showInfo = useCallback((message, options = {}) => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      message,
      ...options
    });
  }, [addNotification]);

  // Claim update notification
  const showClaimUpdate = useCallback((claimData) => {
    const statusColors = {
      pending: '🕒',
      processing: '⏳',
      approved: '✅',
      rejected: '❌',
      completed: '🎉'
    };

    const emoji = statusColors[claimData.status?.toLowerCase()] || '📋';
    
    addNotification({
      type: NOTIFICATION_TYPES.CLAIM_UPDATE,
      title: 'Claim Status Updated',
      message: `${emoji} Claim #${claimData.claimNumber || claimData.id} is now ${claimData.status}`,
      claimId: claimData.id,
      autoClose: true,
      duration: 8000
    });
  }, [addNotification]);

  // Update connection status
  const updateConnectionStatus = useCallback((status) => {
    dispatch({ type: 'UPDATE_CONNECTION_STATUS', payload: status });
  }, []);

  const value = {
    ...state,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showClaimUpdate,
    updateConnectionStatus
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;