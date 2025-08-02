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
    const savedUser = localStorage.getItem("cineRate_user");
    if (savedUser) {
      try {
        this.authState.user = JSON.parse(savedUser);
        this.authState.isAuthenticated = true;
      } catch (error) {
        localStorage.removeItem("cineRate_user");
      }
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

    return user;
  }

  async register(userData: { username: string; email: string; password: string }): Promise<User> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    return user;
  }

  logout() {
    this.authState.user = null;
    this.authState.isAuthenticated = false;
    this.clearAuthFromStorage();
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
}

export const authService = AuthService.getInstance();
