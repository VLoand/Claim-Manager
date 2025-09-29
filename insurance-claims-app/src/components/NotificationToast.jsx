// Toast Notification Component for Real-Time Notifications
import React, { useEffect, useState } from 'react';
import { useNotifications, NOTIFICATION_TYPES } from '../contexts/NotificationContext';

// Individual toast component
const Toast = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);

    // Auto-close if enabled
    if (notification.autoClose) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Animation duration
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start p-4 mb-3 rounded-lg shadow-lg border-l-4 transition-all duration-300 transform backdrop-blur-sm";
    
    const typeStyles = {
      [NOTIFICATION_TYPES.SUCCESS]: "bg-green-50 border-green-500 text-green-800",
      [NOTIFICATION_TYPES.ERROR]: "bg-red-50 border-red-500 text-red-800",
      [NOTIFICATION_TYPES.WARNING]: "bg-yellow-50 border-yellow-500 text-yellow-800",
      [NOTIFICATION_TYPES.INFO]: "bg-blue-50 border-blue-500 text-blue-800",
      [NOTIFICATION_TYPES.CLAIM_UPDATE]: "bg-purple-50 border-purple-500 text-purple-800"
    };

    const animationStyles = isRemoving 
      ? "opacity-0 translate-x-full scale-95" 
      : isVisible 
        ? "opacity-100 translate-x-0 scale-100" 
        : "opacity-0 translate-x-full scale-95";

    return `${baseStyles} ${typeStyles[notification.type]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconStyles = "w-5 h-5 flex-shrink-0 mt-0.5";
    
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return (
          <svg className={`${iconStyles} text-green-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case NOTIFICATION_TYPES.ERROR:
        return (
          <svg className={`${iconStyles} text-red-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case NOTIFICATION_TYPES.WARNING:
        return (
          <svg className={`${iconStyles} text-yellow-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case NOTIFICATION_TYPES.CLAIM_UPDATE:
        return (
          <svg className={`${iconStyles} text-purple-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className={`${iconStyles} text-blue-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className={getToastStyles()}>
      {getIcon()}
      <div className="ml-3 flex-1">
        {notification.title && (
          <h4 className="font-semibold text-sm mb-1">{notification.title}</h4>
        )}
        <p className="text-sm leading-relaxed">{notification.message}</p>
        {notification.timestamp && (
          <p className="text-xs opacity-75 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
      <button
        onClick={handleRemove}
        className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Connection status indicator
const ConnectionStatus = ({ connectionStatus }) => {
  if (connectionStatus.connected) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-lg mb-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-green-700 font-medium">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded-lg mb-2">
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
      <span className="text-xs text-red-700 font-medium">Disconnected</span>
    </div>
  );
};

// Main notification container
const NotificationToast = () => {
  const { notifications, connectionStatus, removeNotification } = useNotifications();

  if (notifications.length === 0 && connectionStatus.connected) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 max-w-sm">
      {/* Connection Status */}
      {!connectionStatus.connected && (
        <ConnectionStatus connectionStatus={connectionStatus} />
      )}
      
      {/* Notifications */}
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationToast;