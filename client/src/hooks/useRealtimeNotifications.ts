import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface NotificationData {
  type: string;
  data: any;
  message: string;
  timestamp: string;
  priority: string;
}

export function useRealtimeNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log("Connected to WebSocket for real-time notifications");
      setIsConnected(true);
      
      // Clear any pending reconnect attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };

    wsRef.current.onmessage = (event) => {
      try {
        const notification: NotificationData = JSON.parse(event.data);
        console.log("Received notification:", notification);
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep last 10
        
        // Show toast notification
        if (notification.type === 'NEW_LEAD') {
          // Request notification permission if needed
          if (Notification.permission === 'default') {
            Notification.requestPermission();
          }
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            const browserNotification = new Notification('New Lead Received!', {
              body: notification.message,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: `lead-${notification.data.id}`,
              requireInteraction: true,
              data: notification.data
            });
            
            browserNotification.onclick = () => {
              window.focus();
              // Navigate to leads page
              window.location.href = '/admin/leads';
              browserNotification.close();
            };
            
            // Auto close after 10 seconds
            setTimeout(() => {
              browserNotification.close();
            }, 10000);
          }
          
          // Show toast
          toast({
            title: "New Lead Received!",
            description: notification.message,
            duration: 5000,
          });
          
          // Invalidate leads query to refresh the dashboard
          queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
          queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
        }
      } catch (error) {
        console.error("Error parsing notification:", error);
      }
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
      
      // Attempt to reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Attempting to reconnect WebSocket...");
        connect();
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Request notification permission on component mount
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    notifications,
    clearNotifications,
    markAsRead,
    connect,
    disconnect
  };
}