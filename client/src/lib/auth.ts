import { User, LoginData } from "@shared/schema";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
  };
  private listeners: (() => void)[] = [];

  private constructor() {
    this.loadAuthFromStorage();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadAuthFromStorage() {
    const savedUser = localStorage.getItem("cineRate_user") || sessionStorage.getItem("cineRate_user");
    if (savedUser) {
      try {
        this.authState.user = JSON.parse(savedUser);
        this.authState.isAuthenticated = true;
        this.verifySession();
      } catch (error) {
        this.clearAuthFromStorage();
      }
    }
  }

  private async verifySession() {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: 'include'
      });
      if (!response.ok) {
        this.logout();
      }
    } catch (error) {
      this.logout();
    }
  }

  private saveAuthToStorage(user: User, remember: boolean = false) {
    if (remember) {
      localStorage.setItem("cineRate_user", JSON.stringify(user));
    } else {
      sessionStorage.setItem("cineRate_user", JSON.stringify(user));
    }
  }

  private clearAuthFromStorage() {
    localStorage.removeItem("cineRate_user");
    sessionStorage.removeItem("cineRate_user");
  }

  async login(loginData: LoginData): Promise<User> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const user = await response.json();
    this.authState.user = user;
    this.authState.isAuthenticated = true;
    this.saveAuthToStorage(user, loginData.rememberMe || false);
    this.notifyListeners();

    return user;
  }

  async register(userData: { username: string; email: string; password: string }): Promise<User> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: 'include',
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const user = await response.json();
    this.authState.user = user;
    this.authState.isAuthenticated = true;
    this.saveAuthToStorage(user, false);
    this.notifyListeners();

    return user;
  }

  async logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });
    } catch (error) {
    }
    
    this.authState.user = null;
    this.authState.isAuthenticated = false;
    this.clearAuthFromStorage();
    this.notifyListeners();
  }

  getAuthState(): AuthState {
    return { ...this.authState };
  }

  getCurrentUser(): User | null {
    return this.authState.user;
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  updateUser(updatedUser: User) {
    this.authState.user = updatedUser;
    this.saveAuthToStorage(updatedUser, false);
    this.notifyListeners();
  }

  onAuthChange(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const authService = AuthService.getInstance();
