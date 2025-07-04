import { auth } from './supabaseClient.js'

export class AuthManager {
  constructor() {
    this.user = null
    this.isAuthenticated = false
    this.authCallbacks = []
    
    // Initialize auth state
    this.initializeAuth()
  }

  async initializeAuth() {
    try {
      const { user } = await auth.getCurrentUser()
      this.user = user
      this.isAuthenticated = !!user
      this.notifyAuthChange()
    } catch (error) {
      console.error('Error initializing auth:', error)
    }

    // Listen for auth changes
    auth.onAuthStateChange((event, session) => {
      this.user = session?.user || null
      this.isAuthenticated = !!session?.user
      this.notifyAuthChange()
    })
  }

  async signUp(email, password) {
    try {
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: error.message }
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      
      return { success: true, data }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: error.message }
    }
  }

  async signOut() {
    try {
      const { error } = await auth.signOut()
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
  }

  onAuthChange(callback) {
    this.authCallbacks.push(callback)
  }

  notifyAuthChange() {
    this.authCallbacks.forEach(callback => {
      callback(this.user, this.isAuthenticated)
    })
  }

  getUser() {
    return this.user
  }

  isUserAuthenticated() {
    return this.isAuthenticated
  }
}

// Create singleton instance
export const authManager = new AuthManager()