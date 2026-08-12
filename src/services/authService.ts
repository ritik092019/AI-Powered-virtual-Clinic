import { User, Role } from '../types';
import { MOCK_USERS } from '../mock';

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: Role;
}

export const authService = {
  /**
   * Mock login function with dev role override
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // Simulate network latency
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (credentials.role && MOCK_USERS[credentials.role]) {
      return {
        user: MOCK_USERS[credentials.role],
        token: `mock-jwt-token-${credentials.role.toLowerCase()}`,
      };
    }

    // Default to Health Worker for dev login
    const matchedRole = credentials.email.includes('doctor')
      ? 'DOCTOR'
      : credentials.email.includes('admin')
      ? 'ADMIN'
      : 'HEALTH_WORKER';

    return {
      user: MOCK_USERS[matchedRole],
      token: `mock-jwt-token-${matchedRole.toLowerCase()}`,
    };
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  async getCurrentUser(): Promise<User | null> {
    return MOCK_USERS.HEALTH_WORKER;
  },
};
