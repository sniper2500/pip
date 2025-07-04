import { database } from './database.js'
import { authManager } from './auth.js'

export class ProjectManager {
  constructor() {
    this.projects = []
    this.currentProject = null
    this.autoSaveInterval = null
    this.autoSaveDelay = 2000 // 2 seconds
  }

  async loadProjects() {
    try {
      if (!authManager.isUserAuthenticated()) {
        throw new Error('User not authenticated')
      }

      this.projects = await database.getProjects()
      return this.projects
    } catch (error) {
      console.error('Error loading projects:', error)
      throw error
    }
  }

  async createNewProject(name, description = '') {
    try {
      if (!authManager.isUserAuthenticated()) {
        throw new Error('User not authenticated')
      }

      const project = await database.createProject(name, description)
      this.projects.unshift(project)
      this.currentProject = project
      return project
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  async loadProject(projectId) {
    try {
      const projectData = await database.loadCompleteProject(projectId)
      this.currentProject = projectData.project
      return projectData
    } catch (error) {
      console.error('Error loading project:', error)
      throw error
    }
  }

  async saveCurrentProject(projectData) {
    try {
      if (!authManager.isUserAuthenticated()) {
        throw new Error('User not authenticated')
      }

      const projectId = await database.saveCompleteProject(projectData)
      
      // Update current project if it was just created
      if (!this.currentProject && projectId) {
        const projects = await this.loadProjects()
        this.currentProject = projects.find(p => p.id === projectId)
      }

      return projectId
    } catch (error) {
      console.error('Error saving project:', error)
      throw error
    }
  }

  async deleteProject(projectId) {
    try {
      await database.deleteProject(projectId)
      this.projects = this.projects.filter(p => p.id !== projectId)
      
      if (this.currentProject?.id === projectId) {
        this.currentProject = null
        database.setCurrentProject(null)
      }
      
      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  startAutoSave(getProjectDataCallback) {
    this.stopAutoSave()
    
    this.autoSaveInterval = setInterval(async () => {
      try {
        if (authManager.isUserAuthenticated() && database.getCurrentProjectId()) {
          const projectData = getProjectDataCallback()
          await database.autoSave(projectData)
        }
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, this.autoSaveDelay)
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  getCurrentProject() {
    return this.currentProject
  }

  getProjects() {
    return this.projects
  }

  setCurrentProject(project) {
    this.currentProject = project
    if (project) {
      database.setCurrentProject(project.id)
    }
  }
}

// Create singleton instance
export const projectManager = new ProjectManager()