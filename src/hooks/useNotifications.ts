import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  txHash?: string;
  timestamp: number;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  soundEnabled: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  unreadCount: () => number;
  toggleSound: () => void;
}

// Play notification sound using Web Audio API
const playNotificationSound = (type: NotificationType) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    const frequencies: Record<NotificationType, number[]> = {
      success: [523.25, 659.25, 783.99], // C5, E5, G5 - pleasant ascending
      error: [392, 349.23], // G4, F4 - descending warning
      warning: [440, 440], // A4 - attention
      info: [523.25, 587.33], // C5, D5 - neutral
    };

    const freqs = frequencies[type];
    const duration = type === 'success' ? 0.12 : 0.1;
    
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);

    let time = audioContext.currentTime;
    freqs.forEach((freq, i) => {
      oscillator.frequency.setValueAtTime(freq, time);
      time += duration;
    });

    gainNode.gain.exponentialRampToValueAtTime(0.01, time);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(time + 0.05);
  } catch (e) {
    // Audio not supported or blocked
  }
};

export const useNotifications = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      soundEnabled: true,
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          read: false,
        };
        
        // Play sound if enabled
        if (get().soundEnabled) {
          playNotificationSound(notification.type);
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50),
        }));
      },
      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },
      clearAll: () => {
        set({ notifications: [] });
      },
      unreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
    }),
    {
      name: 'mini-rialo-notifications',
    }
  )
);
