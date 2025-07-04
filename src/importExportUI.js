// UI components for import/export functionality
export class ImportExportUI {
  constructor(importExportManager, app) {
    this.manager = importExportManager;
    this.app = app;
    this.setupEventListeners();
  }

  // Create import/export section HTML
  createImportExportSection() {
    return `
      <div class="import-export-section">
        <div class="import-export-header">
          <h2>📁 Import & Export</h2>
          <p>Save time by importing/exporting project data, parameters, and structures</p>
        </div>
        
        <div class="import-export-grid">
          <!-- Export Section -->
          <div class="export-panel">
            <h3>📤 Export Data</h3>
            <div class="export-options">
              <button class="export-btn complete-project" data-type="complete">
                <span class="btn-icon">📋</span>
                Complete Project
                <small>All data including parameters, structures, and calculations</small>
              </button>
              
              <button class="export-btn parameters-only" data-type="parameters">
                <span class="btn-icon">⚙️</span>
                Parameters Only
                <small>Project parameters as CSV file</small>
              </button>
              
              <button class="export-btn structures-only" data-type="structures">
                <span class="btn-icon">🏗️</span>
                Structures Only
                <small>Structure data as CSV file</small>
              </button>
              
              <button class="export-btn template" data-type="template">
                <span class="btn-icon">📄</span>
                Project Template
                <small>Reusable project template</small>
              </button>
            </div>
          </div>
          
          <!-- Import Section -->
          <div class="import-panel">
            <h3>📥 Import Data</h3>
            <div class="import-options">
              <div class="file-input-group">
                <label for="import-complete" class="file-input-label">
                  <span class="btn-icon">📋</span>
                  Import Complete Project
                  <small>JSON file with all project data</small>
                </label>
                <input type="file" id="import-complete" accept=".json" class="file-input">
              </div>
              
              <div class="file-input-group">
                <label for="import-parameters" class="file-input-label">
                  <span class="btn-icon">⚙️</span>
                  Import Parameters
                  <small>CSV file with project parameters</small>
                </label>
                <input type="file" id="import-parameters" accept=".csv" class="file-input">
              </div>
              
              <div class="file-input-group">
                <label for="import-structures" class="file-input-label">
                  <span class="btn-icon">🏗️</span>
                  Import Structures
                  <small>CSV file with structure data</small>
                </label>
                <input type="file" id="import-structures" accept=".csv" class="file-input">
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <h3>⚡ Quick Actions</h3>
          <div class="quick-action-buttons">
            <button class="quick-action-btn" id="download-template">
              <span class="btn-icon">📄</span>
              Download Template
              <small>Get started with a sample project</small>
            </button>
            
            <button class="quick-action-btn" id="backup-current">
              <span class="btn-icon">💾</span>
              Backup Current Project
              <small>Save current work as backup</small>
            </button>
            
            <button class="quick-action-btn" id="clear-import-data">
              <span class="btn-icon">🗑️</span>
              Clear All Data
              <small>Reset to start fresh</small>
            </button>
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
      </div>
    `;
  }

  // Setup event listeners
  setupEventListeners() {
    document.addEventListener('click', (e) => {
      // Export button handlers
      if (e.target.closest('.export-btn')) {
        const type = e.target.closest('.export-btn').dataset.type;
        this.handleExport(type);
      }
      
      // Quick action handlers
      if (e.target.closest('#download-template')) {
        this.handleDownloadTemplate();
      }
      
      if (e.target.closest('#backup-current')) {
        this.handleBackupCurrent();
      }
      
      if (e.target.closest('#clear-import-data')) {
        this.handleClearData();
      }
      
      if (e.target.closest('#confirm-import')) {
        this.handleConfirmImport();
      }
      
      if (e.target.closest('#cancel-import')) {
        this.handleCancelImport();
      }
    });

    // File input handlers
    document.addEventListener('change', (e) => {
      if (e.target.id === 'import-complete') {
        this.handleFileImport(e.target.files[0], 'complete');
      } else if (e.target.id === 'import-parameters') {
        this.handleFileImport(e.target.files[0], 'parameters');
      } else if (e.target.id === 'import-structures') {
        this.handleFileImport(e.target.files[0], 'structures');
      }
    });
  }

  // Handle export operations
  async handleExport(type) {
    try {
      const currentData = this.app.getCurrentProjectData();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      switch (type) {
        case 'complete':
          this.manager.exportCompleteProject(currentData, `project-${timestamp}`);
          this.showNotification('Complete project exported successfully!', 'success');
          break;
          
        case 'parameters':
          this.manager.exportParametersToCSV(currentData.parameters, `parameters-${timestamp}`);
          this.showNotification('Parameters exported to CSV successfully!', 'success');
          break;
          
        case 'structures':
          this.manager.exportStructuresToCSV(currentData.structures, `structures-${timestamp}`);
          this.showNotification('Structures exported to CSV successfully!', 'success');
          break;
          
        case 'template':
          this.manager.exportTemplate(`template-${timestamp}`);
          this.showNotification('Project template exported successfully!', 'success');
          break;
      }
    } catch (error) {
      this.showNotification(`Export failed: ${error.message}`, 'error');
    }
  }

  // Handle file import
  async handleFileImport(file, type) {
    if (!file) return;
    
    try {
      let importedData;
      
      switch (type) {
        case 'complete':
          importedData = await this.manager.importFromJSON(file);
          break;
        case 'parameters':
          importedData = { parameters: await this.manager.importParametersFromCSV(file) };
          break;
        case 'structures':
          importedData = { structures: await this.manager.importStructuresFromCSV(file) };
          break;
      }
      
      this.showImportPreview(importedData, type);
    } catch (error) {
      this.showNotification(`Import failed: ${error.message}`, 'error');
    }
  }

  // Show import preview
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
    
    // Store data for confirmation
    this.pendingImportData = data;
    this.pendingImportType = type;
  }

  // Handle quick actions
  handleDownloadTemplate() {
    this.manager.exportTemplate('project-template');
    this.showNotification('Project template downloaded!', 'success');
  }

  handleBackupCurrent() {
    const currentData = this.app.getCurrentProjectData();
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    this.manager.exportCompleteProject(currentData, `backup-${timestamp}`);
    this.showNotification('Current project backed up successfully!', 'success');
  }

  handleClearData() {
    if (confirm('Are you sure you want to clear all current data? This action cannot be undone.')) {
      this.app.clearAllData();
      this.showNotification('All data cleared successfully!', 'info');
    }
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
    document.getElementById('import-complete').value = '';
    document.getElementById('import-parameters').value = '';
    document.getElementById('import-structures').value = '';
  }

  showNotification(message, type) {
    if (window.showNotification) {
      window.showNotification(message, type);
    }
  }
}