import { Notification } from '../types';
import { INITIAL_NOTIFICATIONS } from '../mock';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    return INITIAL_NOTIFICATIONS;
  },

  async markAsRead(id: string): Promise<void> {
    // TODO: Update backend notification state
  },
};
