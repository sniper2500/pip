import { ImportExportManager } from './importExport.js';
import { db } from './database.js';
import { auth } from './auth.js';

export class ImportExportUI {
  constructor(app) {
    this.app = app;
    this.manager = new ImportExportManager();
    this.projects = [];
    this.setupEventListeners();
  }

  createImportExportSection() {
    return `
      <div class="import-export-section">
        <div class="import-export-header">
          <h2>📁 Import & Export</h2>
          <p>Save, restore, and share project data with cloud storage and Excel support</p>
        </div>

        <!-- Authentication Section -->
        <div class="auth-section" id="auth-section">
          <div class="auth-form" id="auth-form">
            <h3>🔐 Sign In to Access Cloud Storage</h3>
            <div class="auth-inputs">
              <input type="email" id="auth-email" placeholder="Email address" required>
              <input type="password" id="auth-password" placeholder="Password" required>
            </div>
            <div class="auth-buttons">
              <button class="auth-btn sign-in" id="sign-in-btn">Sign In</button>
              <button class="auth-btn sign-up" id="sign-up-btn">Sign Up</button>
            </div>
          </div>
          
          <div class="user-info" id="user-info" style="display: none;">
            <div class="user-details">
              <span class="user-email" id="user-email"></span>
              <button class="sign-out-btn" id="sign-out-btn">Sign Out</button>
            </div>
          </div>
        </div>
        
        <div class="import-export-grid">
          <!-- Cloud Storage Section -->
          <div class="cloud-panel">
            <h3>☁️ Cloud Storage</h3>
            <div class="cloud-actions" id="cloud-actions" style="display: none;">
              <button class="cloud-btn save-to-cloud" id="save-to-cloud">
                <span class="btn-icon">💾</span>
                Save to Cloud
                <small>Save current project to your cloud storage</small>
              </button>
              
              <div class="projects-list" id="projects-list">
                <h4>Your Projects</h4>
                <div class="projects-container" id="projects-container">
                  <!-- Projects will be loaded here -->
                </div>
              </div>
            </div>
            
            <div class="cloud-disabled" id="cloud-disabled">
              <p>Sign in to access cloud storage features</p>
            </div>
          </div>

          <!-- File Import/Export Section -->
          <div class="file-panel">
            <h3>📄 File Import/Export</h3>
            <div class="file-options">
              <button class="export-btn excel" data-type="excel">
                <span class="btn-icon">📊</span>
                Export to Excel
                <small>Complete project data in Excel format</small>
              </button>
              
              <button class="export-btn json" data-type="json">
                <span class="btn-icon">📋</span>
                Export to JSON
                <small>Complete project data in JSON format</small>
              </button>
              
              <button class="export-btn csv-params" data-type="csv-params">
                <span class="btn-icon">⚙️</span>
                Export Parameters (CSV)
                <small>Project parameters only</small>
              </button>
              
              <button class="export-btn csv-structures" data-type="csv-structures">
                <span class="btn-icon">🏗️</span>
                Export Structures (CSV)
                <small>Structure data only</small>
              </button>
            </div>
            
            <div class="import-options">
              <div class="file-input-group">
                <label for="import-excel" class="file-input-label">
                  <span class="btn-icon">📊</span>
                  Import from Excel
                  <small>Excel file (.xlsx, .xls)</small>
                </label>
                <input type="file" id="import-excel" accept=".xlsx,.xls" class="file-input">
              </div>
              
              <div class="file-input-group">
                <label for="import-json" class="file-input-label">
                  <span class="btn-icon">📋</span>
                  Import from JSON
                  <small>JSON file with project data</small>
                </label>
                <input type="file" id="import-json" accept=".json" class="file-input">
              </div>
              
              <div class="file-input-group">
                <label for="import-csv" class="file-input-label">
                  <span class="btn-icon">📄</span>
                  Import from CSV
                  <small>CSV file with parameters or structures</small>
                </label>
                <input type="file" id="import-csv" accept=".csv" class="file-input">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Import Preview -->
        <div class="import-preview" id="import-preview" style="display: none;">
          <h3>📋 Import Preview</h3>
          <div class="preview-content" id="preview-content"></div>
          <div class="preview-actions">
            <button class="confirm-import-btn" id="confirm-import">Confirm Import</button>
            <button class="cancel-import-btn" id="cancel-import">Cancel</button>
          </div>
        </div>

        <!-- Save Project Modal -->
        <div class="modal" id="save-project-modal" style="display: none;">
          <div class="modal-content">
            <h3>💾 Save Project to Cloud</h3>
            <div class="modal-form">
              <label for="project-name">Project Name</label>
              <input type="text" id="project-name" placeholder="Enter project name" required>
              
              <label for="project-description">Description (Optional)</label>
              <textarea id="project-description" placeholder="Project description" rows="3"></textarea>
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" id="confirm-save">Save Project</button>
              <button class="modal-btn secondary" id="cancel-save">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Authentication handlers
      if (e.target.id === 'sign-in-btn') {
        this.handleSignIn();
      } else if (e.target.id === 'sign-up-btn') {
        this.handleSignUp();
      } else if (e.target.id === 'sign-out-btn') {
        this.handleSignOut();
      }

      // Cloud storage handlers
      if (e.target.id === 'save-to-cloud') {
        this.showSaveProjectModal();
      } else if (e.target.id === 'confirm-save') {
        this.handleSaveToCloud();
      } else if (e.target.id === 'cancel-save') {
        this.hideSaveProjectModal();
      }

      // Export handlers
      if (e.target.closest('.export-btn')) {
        const type = e.target.closest('.export-btn').dataset.type;
        this.handleExport(type);
      }

      // Import preview handlers
      if (e.target.id === 'confirm-import') {
        this.handleConfirmImport();
      } else if (e.target.id === 'cancel-import') {
        this.handleCancelImport();
      }

      // Project load handlers
      if (e.target.classList.contains('load-project-btn')) {
        const projectId = e.target.dataset.projectId;
        this.handleLoadProject(projectId);
      } else if (e.target.classList.contains('delete-project-btn')) {
        const projectId = e.target.dataset.projectId;
        this.handleDeleteProject(projectId);
      }
    });

    // File input handlers
    document.addEventListener('change', (e) => {
      if (e.target.id === 'import-excel') {
        this.handleFileImport(e.target.files[0], 'excel');
      } else if (e.target.id === 'import-json') {
        this.handleFileImport(e.target.files[0], 'json');
      } else if (e.target.id === 'import-csv') {
        this.handleFileImport(e.target.files[0], 'csv');
      }
    });

    // Auth state change listener
    auth.onAuthChange((user) => {
      this.updateAuthUI(user);
      if (user) {
        this.loadProjects();
      }
    });
  }

  // Authentication methods
  async handleSignIn() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
      this.showNotification('Please enter email and password', 'error');
      return;
    }

    try {
      await auth.signIn(email, password);
      this.showNotification('Signed in successfully!', 'success');
    } catch (error) {
      this.showNotification(`Sign in failed: ${error.message}`, 'error');
    }
  }

  async handleSignUp() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
      this.showNotification('Please enter email and password', 'error');
      return;
    }

    if (password.length < 6) {
      this.showNotification('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      await auth.signUp(email, password);
      this.showNotification('Account created successfully! Please check your email for verification.', 'success');
    } catch (error) {
      this.showNotification(`Sign up failed: ${error.message}`, 'error');
    }
  }

  async handleSignOut() {
    try {
      await auth.signOut();
      this.showNotification('Signed out successfully!', 'info');
    } catch (error) {
      this.showNotification(`Sign out failed: ${error.message}`, 'error');
    }
  }

  updateAuthUI(user) {
    const authForm = document.getElementById('auth-form');
    const userInfo = document.getElementById('user-info');
    const cloudActions = document.getElementById('cloud-actions');
    const cloudDisabled = document.getElementById('cloud-disabled');

    if (user) {
      authForm.style.display = 'none';
      userInfo.style.display = 'block';
      cloudActions.style.display = 'block';
      cloudDisabled.style.display = 'none';
      
      document.getElementById('user-email').textContent = user.email;
    } else {
      authForm.style.display = 'block';
      userInfo.style.display = 'none';
      cloudActions.style.display = 'none';
      cloudDisabled.style.display = 'block';
    }
  }

  // Cloud storage methods
  showSaveProjectModal() {
    const modal = document.getElementById('save-project-modal');
    const projectName = document.getElementById('project-name');
    
    // Set default project name
    const sectionName = document.getElementById('sectionName')?.value || 'Untitled Project';
    projectName.value = `${sectionName} - ${new Date().toLocaleDateString()}`;
    
    modal.style.display = 'flex';
  }

  hideSaveProjectModal() {
    document.getElementById('save-project-modal').style.display = 'none';
  }

  async handleSaveToCloud() {
    const projectName = document.getElementById('project-name').value;
    const projectDescription = document.getElementById('project-description').value;

    if (!projectName.trim()) {
      this.showNotification('Please enter a project name', 'error');
      return;
    }

    try {
      const currentData = this.app.getCurrentProjectData();
      
      await this.manager.exportProjectToDatabase({
        ...currentData,
        name: projectName,
        description: projectDescription
      }, projectName);

      this.showNotification('Project saved to cloud successfully!', 'success');
      this.hideSaveProjectModal();
      this.loadProjects();
    } catch (error) {
      this.showNotification(`Failed to save project: ${error.message}`, 'error');
    }
  }

  async loadProjects() {
    try {
      this.projects = await db.getProjects();
      this.renderProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
      this.showNotification('Failed to load projects', 'error');
    }
  }

  renderProjects() {
    const container = document.getElementById('projects-container');
    
    if (this.projects.length === 0) {
      container.innerHTML = '<p class="no-projects">No projects saved yet</p>';
      return;
    }

    container.innerHTML = this.projects.map(project => `
      <div class="project-item">
        <div class="project-info">
          <h4>${project.name}</h4>
          <p>${project.description || 'No description'}</p>
          <small>Updated: ${new Date(project.updated_at).toLocaleString()}</small>
        </div>
        <div class="project-actions">
          <button class="load-project-btn" data-project-id="${project.id}">Load</button>
          <button class="delete-project-btn" data-project-id="${project.id}">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async handleLoadProject(projectId) {
    try {
      const projectData = await this.manager.importProjectFromDatabase(projectId);
      this.app.importProjectData(projectData, 'complete');
      this.showNotification('Project loaded successfully!', 'success');
    } catch (error) {
      this.showNotification(`Failed to load project: ${error.message}`, 'error');
    }
  }

  async handleDeleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await db.deleteProject(projectId);
      this.showNotification('Project deleted successfully!', 'info');
      this.loadProjects();
    } catch (error) {
      this.showNotification(`Failed to delete project: ${error.message}`, 'error');
    }
  }

  // File export/import methods
  async handleExport(type) {
    try {
      const currentData = this.app.getCurrentProjectData();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      switch (type) {
        case 'excel':
          this.manager.exportToExcel(currentData, `project-${timestamp}`);
          this.showNotification('Project exported to Excel successfully!', 'success');
          break;
          
        case 'json':
          this.manager.exportToJSON(currentData, `project-${timestamp}`);
          this.showNotification('Project exported to JSON successfully!', 'success');
          break;
          
        case 'csv-params':
          this.manager.exportParametersToCSV(currentData.parameters, `parameters-${timestamp}`);
          this.showNotification('Parameters exported to CSV successfully!', 'success');
          break;
          
        case 'csv-structures':
          this.manager.exportStructuresToCSV(currentData.structures, `structures-${timestamp}`);
          this.showNotification('Structures exported to CSV successfully!', 'success');
          break;
      }
    } catch (error) {
      this.showNotification(`Export failed: ${error.message}`, 'error');
    }
  }

  async handleFileImport(file, type) {
    if (!file) return;
    
    try {
      let importedData;
      
      switch (type) {
        case 'excel':
          importedData = await this.manager.importFromExcel(file);
          break;
        case 'json':
          importedData = await this.manager.importFromJSON(file);
          break;
        case 'csv':
          // Determine if it's parameters or structures based on content
          const text = await this.manager.readFileAsText(file);
          const lines = text.split('\n');
          const firstLine = lines[0].toLowerCase();
          
          if (firstLine.includes('parameter')) {
            importedData = { parameters: await this.manager.importParametersFromCSV(file) };
          } else if (firstLine.includes('station')) {
            importedData = { structures: await this.manager.importStructuresFromCSV(file) };
          } else {
            throw new Error('Unable to determine CSV format. Please ensure the file has proper headers.');
          }
          break;
      }
      
      this.showImportPreview(importedData, type);
    } catch (error) {
      this.showNotification(`Import failed: ${error.message}`, 'error');
    }
  }

  showImportPreview(data, type) {
    const previewElement = document.getElementById('import-preview');
    const contentElement = document.getElementById('preview-content');
    
    let previewHTML = '<div class="preview-summary">';
    
    if (data.parameters) {
      previewHTML += `
        <div class="preview-section">
          <h4>📊 Parameters (${Object.keys(data.parameters).length} items)</h4>
          <div class="preview-items">
            ${Object.entries(data.parameters).slice(0, 5).map(([key, value]) => 
              `<span class="preview-item">${key}: ${value}</span>`
            ).join('')}
            ${Object.keys(data.parameters).length > 5 ? '<span class="preview-more">...and more</span>' : ''}
          </div>
        </div>
      `;
    }
    
    if (data.structures && data.structures.length > 0) {
      previewHTML += `
        <div class="preview-section">
          <h4>🏗️ Structures (${data.structures.length} items)</h4>
          <div class="preview-items">
            ${data.structures.slice(0, 3).map(structure => 
              `<span class="preview-item">${structure.station} - ${structure.type}</span>`
            ).join('')}
            ${data.structures.length > 3 ? '<span class="preview-more">...and more</span>' : ''}
          </div>
        </div>
      `;
    }
    
    if (data.surveyorInfo) {
      previewHTML += `
        <div class="preview-section">
          <h4>👤 Surveyor Info</h4>
          <div class="preview-items">
            <span class="preview-item">${data.surveyorInfo.name || 'N/A'}</span>
            <span class="preview-item">${data.surveyorInfo.company || 'N/A'}</span>
          </div>
        </div>
      `;
    }
    
    previewHTML += '</div>';
    
    contentElement.innerHTML = previewHTML;
    previewElement.style.display = 'block';
    
    this.pendingImportData = data;
    this.pendingImportType = type;
  }

  handleConfirmImport() {
    if (this.pendingImportData) {
      this.app.importProjectData(this.pendingImportData, this.pendingImportType);
      this.showNotification('Data imported successfully!', 'success');
      this.handleCancelImport();
    }
  }

  handleCancelImport() {
    document.getElementById('import-preview').style.display = 'none';
    this.pendingImportData = null;
    this.pendingImportType = null;
    
    // Clear file inputs
    document.getElementById('import-excel').value = '';
    document.getElementById('import-json').value = '';
    document.getElementById('import-csv').value = '';
  }

  showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    }
  }
}