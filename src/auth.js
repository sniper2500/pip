import { db } from './database.js';

export class AuthService {
  constructor() {
    this.currentUser = null;
    this.authCallbacks = [];
    this.initializeAuth();
  }

  async initializeAuth() {
    // Check for existing session
    const user = await db.getCurrentUser();
    this.currentUser = user;
    this.notifyAuthChange();

    // Listen for auth changes
    db.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      this.notifyAuthChange();
    });
  }

  onAuthChange(callback) {
    this.authCallbacks.push(callback);
  }

  notifyAuthChange() {
    this.authCallbacks.forEach(callback => callback(this.currentUser));
  }

  async signUp(email, password) {
    try {
      const { data, error } = await db.signUp(email, password);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await db.signIn(email, password);
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await db.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// Create singleton instance
export const auth = new AuthService();