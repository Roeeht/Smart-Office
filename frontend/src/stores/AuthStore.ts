import { makeAutoObservable, runInAction } from 'mobx';
import { authApi, setToken, removeToken, getToken } from '../api/client';
import type { LoginRequest, RegisterRequest, AuthResponse, UserRole, ApiError } from '../types';

/**
 * MobX store for authentication state management.
 * Handles login, logout, registration, and token persistence.
 */
class AuthStore {
  token: string | null = null;
  role: UserRole | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initFromStorage();
    
    // Listen for logout events from API interceptor (401 responses)
    window.addEventListener('auth:logout', this.handleForceLogout);
  }

  /**
   * Initialize auth state from localStorage on app load
   */
  private initFromStorage(): void {
    const token = getToken();
    const role = localStorage.getItem('smart_office_role') as UserRole | null;
    
    if (token && role) {
      this.token = token;
      this.role = role;
    }
  }

  /**
   * Handle forced logout from API interceptor (e.g., token expired)
   */
  private handleForceLogout = (): void => {
    runInAction(() => {
      this.token = null;
      this.role = null;
    });
  };

  /**
   * Whether the user is currently authenticated
   */
  get isAuthenticated(): boolean {
    return this.token !== null;
  }

  /**
   * Whether the user has Admin role
   */
  get isAdmin(): boolean {
    return this.role === 'Admin';
  }

  /**
   * Register a new user account
   * All registrations create Member accounts
   */
  async register(request: RegisterRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await authApi.post<AuthResponse>('/register', request);
      
      runInAction(() => {
        this.token = response.data.token;
        this.role = response.data.role;
        this.isLoading = false;
      });

      // Persist to localStorage
      setToken(response.data.token);
      localStorage.setItem('smart_office_role', response.data.role);

      return true;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message;
        this.isLoading = false;
      });
      return false;
    }
  }

  /**
   * Login with existing credentials
   */
  async login(request: LoginRequest): Promise<boolean> {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await authApi.post<AuthResponse>('/login', request);
      
      runInAction(() => {
        this.token = response.data.token;
        this.role = response.data.role;
        this.isLoading = false;
      });

      // Persist to localStorage
      setToken(response.data.token);
      localStorage.setItem('smart_office_role', response.data.role);

      return true;
    } catch (err) {
      const apiError = err as ApiError;
      runInAction(() => {
        this.error = apiError.message;
        this.isLoading = false;
      });
      return false;
    }
  }

  /**
   * Logout and clear all auth state
   */
  logout(): void {
    this.token = null;
    this.role = null;
    this.error = null;
    
    removeToken();
    localStorage.removeItem('smart_office_role');
  }

  /**
   * Clear any error message
   */
  clearError(): void {
    this.error = null;
  }
}

// Export singleton instance
export const authStore = new AuthStore();
