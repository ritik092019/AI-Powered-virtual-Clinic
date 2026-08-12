import axios from 'axios';
import { User, Role } from '../types';
import { MOCK_USERS } from '../mock';

export interface LoginCredentials {
  email: string;
  password?: string;
  role?: Role;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  language?: string;
  center_name?: string;
  district?: string;
  specialty?: string;
  qualifications?: string;
  registration_number?: string;
  age?: number;
  gender?: string;
  address?: string;
}

const REGISTERED_USERS_KEY = 'arogya_registered_auth_users';

const getStoredAuthUsers = (): Record<string, { user: User; password: string }> => {
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredAuthUser = (user: User, password: string) => {
  try {
    const users = getStoredAuthUsers();
    users[user.email.toLowerCase()] = { user, password };
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Could not save user to local storage', e);
  }
};

export const authService = {
  async register(payload: SignupPayload): Promise<{ user: User; token: string }> {
    if (payload.role === 'ADMIN') {
      throw new Error('Public self-registration for ADMIN accounts is prohibited. Admin accounts must be created by an existing administrator.');
    }

    // Try Backend API registration first
    try {
      const response = await axios.post('/api/v1/auth/register', payload);
      if (response.data && response.data.data) {
        const item = response.data.data;
        const newUser: User = {
          id: item.id,
          name: item.name,
          email: item.email,
          role: item.role,
          phone: item.phone,
          title: item.role === 'DOCTOR' ? 'Medical Specialist' : item.role === 'PATIENT' ? 'Clinic Patient' : 'Health Worker',
          centerName: item.profile_metadata?.centerName || item.profile_metadata?.address || 'Sub-Health Centre Rampur',
          region: item.profile_metadata?.district || 'Surguja',
        };
        saveStoredAuthUser(newUser, payload.password);
        return { user: newUser, token: `jwt-token-${newUser.id}` };
      }
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.status === 403) {
        throw new Error(err.response?.data?.message || 'Registration failed.');
      }
      console.warn('Backend Auth API offline, creating persistent account in local database.', err);
    }

    // Fallback Local Storage Registration
    const users = getStoredAuthUsers();
    if (users[payload.email.toLowerCase()]) {
      throw new Error(`User with email '${payload.email}' is already registered.`);
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      role: payload.role,
      phone: payload.phone || '+91 98765 00000',
      title: payload.role === 'DOCTOR' ? (payload.specialty || 'Tele-Doctor Specialist') : payload.role === 'PATIENT' ? 'Clinic Patient' : 'Frontline ASHA Worker',
      centerName: payload.center_name || payload.address || 'Sub-Health Centre Rampur',
      region: payload.district || 'Surguja',
    };

    saveStoredAuthUser(newUser, payload.password);
    return { user: newUser, token: `local-jwt-${newUser.id}` };
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    // 1. Try real API backend login
    try {
      const response = await axios.post('/api/v1/auth/login', {
        email: credentials.email,
        password: credentials.password || '',
      });
      if (response.data && response.data.data) {
        const data = response.data.data;
        const u = data.user;
        const authenticatedUser: User = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          phone: u.phone,
          title: u.role === 'DOCTOR' ? 'Medical Officer' : u.role === 'ADMIN' ? 'District Administrator' : u.role === 'PATIENT' ? 'Clinic Patient' : 'Health Worker',
          centerName: u.profile_metadata?.centerName || 'Sub-Health Centre Rampur',
          region: u.profile_metadata?.district || 'Surguja',
        };
        localStorage.setItem('arogya_access_token', data.access_token);
        return { user: authenticatedUser, token: data.access_token };
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        throw new Error('Invalid email or password.');
      }
      console.warn('Backend login API offline, checking local storage & mock database.', err);
    }

    // 2. Check locally registered users
    const storedUsers = getStoredAuthUsers();
    const foundLocal = storedUsers[credentials.email.toLowerCase()];
    if (foundLocal) {
      if (credentials.password && foundLocal.password !== credentials.password) {
        throw new Error('Invalid email or password.');
      }
      return { user: foundLocal.user, token: `local-jwt-${foundLocal.user.id}` };
    }

    // 3. Dev Demo Role Override
    if (credentials.role && MOCK_USERS[credentials.role]) {
      return {
        user: MOCK_USERS[credentials.role],
        token: `mock-jwt-token-${credentials.role.toLowerCase()}`,
      };
    }

    // Default matching based on email keywords for demo credentials
    const emailLower = credentials.email.toLowerCase();
    const matchedRole: Role = emailLower.includes('doctor')
      ? 'DOCTOR'
      : emailLower.includes('admin')
      ? 'ADMIN'
      : emailLower.includes('patient')
      ? 'PATIENT'
      : 'HEALTH_WORKER';

    return {
      user: MOCK_USERS[matchedRole],
      token: `mock-jwt-token-${matchedRole.toLowerCase()}`,
    };
  },

  async logout(): Promise<void> {
    localStorage.removeItem('arogya_access_token');
    await new Promise((resolve) => setTimeout(resolve, 100));
  },

  async getCurrentUser(): Promise<User | null> {
    return MOCK_USERS.HEALTH_WORKER;
  },
};
