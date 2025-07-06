import './style.css'
import { setupCounter } from './counter.js'
import { ImportExportUI } from './src/importExportUI.js'
import { auth } from './src/auth.js'
import { ReportGenerator } from './src/reportGenerator.js'

// Global variables
let currentTab = 'parameters';
let structures = [];
let savedRecords = [];
let surveyorInfo = {
  name: '',
  title: '',
  company: '',
  phone: '',
  email: '',
  license: ''
};
let savedSignature = null;

// Initialize Import/Export functionality
let importExportUI;

// Initialize Report Generator
const reportGenerator = new ReportGenerator();

// Application state management
const appState = {
  parameters: {
    sectionName: 'Section A-A',
    startStation: '0+000',
    endStation: '0+100',
    pipeDiameter: '300',
    pipeDepth: '2.5',
    excavationWidth: '1.2',
    slopeRatio: '1.5',
    groundLevelStart: '100.00',
    groundLevelEnd: '99.50',
    pipeLevelStart: '97.50',
    pipeLevelEnd: '97.00',
    calculatedSlope: '0.50'
  },
  structures: [],
  surveyorInfo: {},
  signature: null,
  savedRecords: []
};

// Main application object
const app = {
  getCurrentProjectData() {
    return {
      projectInfo: {
        sectionName: appState.parameters.sectionName,
        startStation: appState.parameters.startStation,
        endStation: appState.parameters.endStation,
        totalLength: this.calculateDistance(appState.parameters.startStation, appState.parameters.endStation)
      },
      parameters: appState.parameters,
      structures: appState.structures,
      calculations: this.getCalculations(),
      surveyorInfo: appState.surveyorInfo,
      signature: appState.signature,
      savedRecords: appState.savedRecords
    };
  },

  getCalculations() {
    // Return current calculations based on parameters
    const params = appState.parameters;
    return {
      totalLength: this.calculateDistance(params.startStation, params.endStation),
      excavationVolume: this.calculateExcavationVolume(),
      pipeSlope: params.calculatedSlope,
      averageDepth: (parseFloat(params.pipeDepth) + parseFloat(params.pipeDepth)) / 2
    };
  },

  calculateDistance(start, end) {
    // Simple station calculation (assumes format like "0+000")
    const startNum = this.parseStation(start);
    const endNum = this.parseStation(end);
    return Math.abs(endNum - startNum);
  },

  parseStation(station) {
    // Convert station format "0+000" to number
    const parts = station.split('+');
    return parseInt(parts[0]) * 1000 + parseInt(parts[1] || 0);
  },

  calculateExcavationVolume() {
    // Simplified excavation volume calculation
    const params = appState.parameters;
    const length = this.calculateDistance(params.startStation, params.endStation);
    const width = parseFloat(params.excavationWidth);
    const depth = parseFloat(params.pipeDepth);
    return length * width * depth;
  },

  importProjectData(data, type) {
    try {
      if (type === 'complete' && data.parameters) {
        // Import complete project
        if (data.parameters) {
          Object.assign(appState.parameters, data.parameters);
          this.updateParametersUI();
        }
        if (data.structures) {
          appState.structures = data.structures;
          this.updateStructuresUI();
        }
        if (data.surveyorInfo) {
          Object.assign(appState.surveyorInfo, data.surveyorInfo);
          this.updateSurveyorInfoUI();
        }
        if (data.signature) {
          appState.signature = data.signature;
        }
      } else if (type === 'parameters' && data.parameters) {
        // Import parameters only
        Object.assign(appState.parameters, data.parameters);
        this.updateParametersUI();
      } else if (type === 'structures' && data.structures) {
        // Import structures only
        appState.structures = data.structures;
        this.updateStructuresUI();
      } else if (type === 'excel' || type === 'json' || type === 'csv') {
        // Handle file imports
        if (data.parameters) {
          Object.assign(appState.parameters, data.parameters);
          this.updateParametersUI();
        }
        if (data.structures) {
          appState.structures = data.structures;
          this.updateStructuresUI();
        }
        if (data.surveyorInfo) {
          Object.assign(appState.surveyorInfo, data.surveyorInfo);
          this.updateSurveyorInfoUI();
        }
      }

      // Recalculate after import
      this.recalculateAll();
      
    } catch (error) {
      console.error('Import failed:', error);
      showNotification('Import failed: ' + error.message, 'error');
    }
  },

  updateParametersUI() {
    // Update parameter input fields
    Object.keys(appState.parameters).forEach(key => {
      const input = document.getElementById(key);
      if (input) {
        input.value = appState.parameters[key];
        input.classList.add('changed');
      }
    });
  },

  updateStructuresUI() {
    // Rebuild structures table
    structures = appState.structures;
    renderStructuresTable();
  },

  updateSurveyorInfoUI() {
    // Update surveyor info fields
    Object.keys(appState.surveyorInfo).forEach(key => {
      const input = document.getElementById(`surveyor-${key}`);
      if (input) {
        input.value = appState.surveyorInfo[key];
      }
    });
    
    // Update signature if available
    if (appState.surveyorInfo.signature) {
      const preview = document.getElementById('signature-preview');
      const img = document.getElementById('saved-signature');
      if (preview && img) {
        img.src = appState.surveyorInfo.signature;
        preview.style.display = 'block';
        savedSignature = appState.surveyorInfo.signature;
        appState.signature = appState.surveyorInfo.signature;
      }
    }
  },

  clearAllData() {
    // Reset all data to defaults
    appState.parameters = {
      sectionName: 'Section A-A',
      startStation: '0+000',
      endStation: '0+100',
      pipeDiameter: '300',
      pipeDepth: '2.5',
      excavationWidth: '1.2',
      slopeRatio: '1.5',
      groundLevelStart: '100.00',
      groundLevelEnd: '99.50',
      pipeLevelStart: '97.50',
      pipeLevelEnd: '97.00',
      calculatedSlope: '0.50'
    };
    appState.structures = [];
    appState.surveyorInfo = {};
    appState.signature = null;
    appState.savedRecords = [];

    // Update UI
    this.updateParametersUI();
    this.updateStructuresUI();
    this.updateSurveyorInfoUI();
    
    // Clear signature canvas
    const canvas = document.getElementById('signature-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  },

  recalculateAll() {
    // Trigger recalculation of all dependent values
    calculateSlope();
    updateStructureDepths();
    renderTable();
    updateProfileDrawing();
  }
};

// Make app globally available for import/export
window.app = app;

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header>
      <h1>🚧 Pipe & Excavation Calculator</h1>
      <p>Professional civil engineering calculations for pipe installation and excavation planning</p>
    </header>

    <nav class="tab-navigation no-print">
      <button class="tab-button active" data-tab="parameters">📊 Parameters</button>
      <button class="tab-button" data-tab="import-export">📁 Import/Export</button>
      <button class="tab-button" data-tab="structures">🏗️ Structures</button>
      <button class="tab-button" data-tab="table">📋 Calculations</button>
      <button class="tab-button" data-tab="profile">📈 Profile</button>
    </nav>

    <div id="parameters-tab" class="tab-content">
      <section class="parameters-section">
        <h2>📊 Project Parameters</h2>
        <div class="parameters-grid">
          <div class="parameter-item section-name">
            <label for="sectionName">Section Name</label>
            <input type="text" id="sectionName" value="Section A-A" placeholder="e.g., Section A-A">
            <div class="auto-generated-note">This will be used in the profile drawing</div>
          </div>
          
          <div class="parameter-item">
            <label for="startStation">Start Station</label>
            <input type="text" id="startStation" value="0+000" placeholder="e.g., 0+000">
          </div>
          
          <div class="parameter-item">
            <label for="endStation">End Station</label>
            <input type="text" id="endStation" value="0+100" placeholder="e.g., 0+100">
          </div>
          
          <div class="parameter-item">
            <label for="pipeDiameter">Pipe Diameter (mm)</label>
            <input type="number" id="pipeDiameter" value="300" min="100" max="2000" step="50">
          </div>
          
          <div class="parameter-item">
            <label for="pipeDepth">Pipe Depth (m)</label>
            <input type="number" id="pipeDepth" value="2.5" min="0.5" max="10" step="0.1">
          </div>
          
          <div class="parameter-item">
            <label for="excavationWidth">Excavation Width (m)</label>
            <input type="number" id="excavationWidth" value="1.2" min="0.5" max="5" step="0.1">
          </div>
          
          <div class="parameter-item">
            <label for="slopeRatio">Slope Ratio (1:n)</label>
            <input type="number" id="slopeRatio" value="1.5" min="0.5" max="3" step="0.1">
          </div>
          
          <div class="parameter-item">
            <label for="groundLevelStart">Ground Level Start (m)</label>
            <input type="number" id="groundLevelStart" value="100.00" step="0.01">
          </div>
          
          <div class="parameter-item">
            <label for="groundLevelEnd">Ground Level End (m)</label>
            <input type="number" id="groundLevelEnd" value="99.50" step="0.01">
          </div>
          
          <div class="parameter-item">
            <label for="pipeLevelStart">Pipe Level Start (m)</label>
            <input type="number" id="pipeLevelStart" value="97.50" step="0.01">
          </div>
          
          <div class="parameter-item">
            <label for="pipeLevelEnd">Pipe Level End (m)</label>
            <input type="number" id="pipeLevelEnd" value="97.00" step="0.01">
          </div>
          
          <div class="parameter-item slope-calculated">
            <label for="calculatedSlope">Calculated Slope (%)</label>
            <input type="number" id="calculatedSlope" value="0.50" step="0.01" readonly class="auto-calculated">
            <div class="calculation-note">Automatically calculated from pipe levels and distance</div>
          </div>
        </div>
        
        <div class="button-group">
          <button class="recalculate-btn" onclick="recalculateAll()">🔄 Recalculate</button>
          <button class="save-record-btn" onclick="saveRecord()">💾 Save Record</button>
          <button class="professional-report-btn" onclick="generateProfessionalReport()">📄 Professional Report</button>
          <button class="print-btn no-print" onclick="window.print()">🖨️ Print</button>
        </div>
        
        <div class="saved-records-section">
          <h3>📚 Saved Records</h3>
          <div class="saved-records-list" id="saved-records-list">
            <!-- Saved records will be populated here -->
          </div>
        </div>
      </section>
      
      <!-- Surveyor Information Section -->
      <section class="surveyor-info-section">
        <h3>👤 Surveyor Information</h3>
        <div class="surveyor-info-grid">
          <div class="surveyor-field">
            <label for="surveyor-name">Full Name</label>
            <input type="text" id="surveyor-name" placeholder="John Smith">
          </div>
          <div class="surveyor-field">
            <label for="surveyor-title">Professional Title</label>
            <input type="text" id="surveyor-title" placeholder="Licensed Surveyor">
          </div>
          <div class="surveyor-field">
            <label for="surveyor-company">Company</label>
            <input type="text" id="surveyor-company" placeholder="ABC Engineering Ltd.">
          </div>
          <div class="surveyor-field">
            <label for="surveyor-phone">Phone Number</label>
            <input type="tel" id="surveyor-phone" placeholder="+1-555-0123">
          </div>
          <div class="surveyor-field">
            <label for="surveyor-email">Email Address</label>
            <input type="email" id="surveyor-email" placeholder="j.smith@abceng.com">
          </div>
          <div class="surveyor-field">
            <label for="surveyor-license">License Number</label>
            <input type="text" id="surveyor-license" placeholder="LS-12345">
          </div>
        </div>
        
        <!-- Digital Signature Section -->
        <div class="signature-section">
          <h4>✍️ Digital Signature</h4>
          <div class="signature-container">
            <canvas id="signature-canvas" class="signature-canvas" width="400" height="150"></canvas>
            <div class="signature-controls">
              <button class="clear-signature-btn" onclick="clearSignature()">Clear</button>
              <button class="save-signature-btn" onclick="saveSignature()">Save Signature</button>
            </div>
          </div>
          <div class="signature-preview" id="signature-preview" style="display: none;">
            <h5>Saved Signature:</h5>
            <img id="saved-signature" class="saved-signature" alt="Saved signature">
          </div>
        </div>
      </section>
    </div>

    <div id="import-export-tab" class="tab-content" style="display: none;">
      <!-- Import/Export content will be inserted here -->
    </div>

    <div id="structures-tab" class="tab-content" style="display: none;">
      <section class="structures-section">
        <div class="structures-header">
          <h2>🏗️ Project Structures</h2>
          <p>Manage manholes, inspection chambers, and other structures along the pipeline</p>
        </div>
        
        <div class="section-name-preview">
          <h3>Current Section</h3>
          <div class="section-name-display" id="section-name-display">Section A-A</div>
        </div>
        
        <div class="structures-actions no-print">
          <button class="add-structure-btn" onclick="addStructure()">➕ Add Structure</button>
          <button class="sort-structures-btn" onclick="sortStructures()">🔄 Sort by Station</button>
          <button class="update-section-btn" onclick="updateSectionName()">📝 Update Section Name</button>
        </div>
        
        <div class="structures-table-container">
          <table class="structures-table">
            <thead>
              <tr>
                <th>Station</th>
                <th>Type</th>
                <th>Invert Level (m)</th>
                <th>Ground Level (m)</th>
                <th>Excavation Depth (m)</th>
                <th>Description</th>
                <th class="no-print">Actions</th>
              </tr>
            </thead>
            <tbody id="structures-table-body">
              <!-- Structure rows will be populated here -->
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div id="table-tab" class="tab-content" style="display: none;">
      <section class="table-section">
        <h2>📋 Excavation Calculations</h2>
        <div class="station-info">
          <p><strong>Project:</strong> <span id="project-name-display">Section A-A</span></p>
          <p><strong>Station Range:</strong> <span id="station-range-display">0+000 to 0+100</span></p>
          <p><strong>Total Length:</strong> <span id="total-length-display">100.00 m</span></p>
        </div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Ground Level (m)</th>
                <th>Pipe Invert (m)</th>
                <th>Pipe Depth (m)</th>
                <th>Excavation Width (m)</th>
                <th>Excavation Depth (m)</th>
                <th>Volume per m (m³)</th>
                <th>Cumulative Volume (m³)</th>
              </tr>
            </thead>
            <tbody id="calculations-table-body">
              <!-- Calculation rows will be populated here -->
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <div id="profile-tab" class="tab-content" style="display: none;">
      <section class="profile-section">
        <div class="profile-header">
          <div class="profile-title-section">
            <h1 id="profile-section-name">Section A-A</h1>
            <p>Civil Survey Profile - Pipe Installation & Excavation</p>
            <div class="profile-project-info">
              <span id="profile-station-range">0+000 to 0+100</span>
              <span id="profile-pipe-diameter">Ø300mm</span>
              <span id="profile-total-length">Length: 100.00m</span>
            </div>
          </div>
          <div class="profile-surveyor-info">
            <div class="surveyor-badge">
              <div class="surveyor-name" id="profile-surveyor-name">John Smith</div>
              <div class="surveyor-title" id="profile-surveyor-title">Licensed Surveyor</div>
              <div class="surveyor-contact" id="profile-surveyor-contact">ABC Engineering Ltd.</div>
            </div>
          </div>
        </div>
        
        <div class="profile-drawing-container">
          <canvas id="profile-canvas" class="profile-canvas" width="1000" height="400"></canvas>
        </div>
        
        <div class="profile-legend">
          <div class="legend-section">
            <h3>📊 Legend</h3>
            <div class="legend-items">
              <div class="legend-item">
                <div class="legend-symbol ground-line"></div>
                <span>Ground Line</span>
              </div>
              <div class="legend-item">
                <div class="legend-symbol pipe-line"></div>
                <span>Pipe Centerline</span>
              </div>
              <div class="legend-item">
                <div class="legend-symbol excavation-line"></div>
                <span>Excavation Limits</span>
              </div>
              <div class="legend-item">
                <div class="manhole-symbol"></div>
                <span>Manhole</span>
              </div>
              <div class="legend-item">
                <div class="ic-symbol"></div>
                <span>Inspection Chamber</span>
              </div>
            </div>
          </div>
          
          <div class="profile-specifications">
            <h3>📋 Specifications</h3>
            <div class="spec-grid">
              <div class="spec-item">
                <span>Pipe Diameter:</span>
                <span id="spec-pipe-diameter">300mm</span>
              </div>
              <div class="spec-item">
                <span>Pipe Material:</span>
                <span>PVC</span>
              </div>
              <div class="spec-item">
                <span>Slope:</span>
                <span id="spec-slope">0.50%</span>
              </div>
              <div class="spec-item">
                <span>Excavation Width:</span>
                <span id="spec-excavation-width">1.2m</span>
              </div>
              <div class="spec-item">
                <span>Side Slope:</span>
                <span id="spec-side-slope">1:1.5</span>
              </div>
              <div class="spec-item">
                <span>Cover Depth:</span>
                <span id="spec-cover-depth">2.5m</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="profile-actions no-print">
          <button class="profile-action-btn primary" onclick="generateProfessionalReport()">
            <span class="btn-icon">📄</span>
            Generate Report
          </button>
          <button class="profile-action-btn secondary" onclick="exportProfileImage()">
            <span class="btn-icon">🖼️</span>
            Export Image
          </button>
          <button class="profile-action-btn tertiary" onclick="window.print()">
            <span class="btn-icon">🖨️</span>
            Print Profile
          </button>
        </div>
      </section>
    </div>
  </div>
`

// Initialize Import/Export UI
document.addEventListener('DOMContentLoaded', () => {
  // Insert import/export content
  const importExportTab = document.getElementById('import-export-tab');
  importExportUI = new ImportExportUI(app);
  importExportTab.innerHTML = importExportUI.createImportExportSection();
  
  // Initialize other components
  initializeApp();
});

// Tab switching functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab-button')) {
    const tabName = e.target.dataset.tab;
    switchTab(tabName);
  }
});

function switchTab(tabName) {
  // Update active tab button
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Show/hide tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = 'none';
  });
  document.getElementById(`${tabName}-tab`).style.display = 'block';
  
  currentTab = tabName;
  
  // Update content when switching tabs
  if (tabName === 'structures') {
    updateSectionName();
    renderStructuresTable();
  } else if (tabName === 'table') {
    renderTable();
  } else if (tabName === 'profile') {
    updateProfileDrawing();
  }
}

// Initialize the application
function initializeApp() {
  // Set up event listeners for parameter inputs
  const parameterInputs = document.querySelectorAll('.parameter-item input');
  parameterInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      e.target.classList.add('changed');
      appState.parameters[e.target.id] = e.target.value;
      
      // Auto-calculate slope when pipe levels change
      if (e.target.id === 'pipeLevelStart' || e.target.id === 'pipeLevelEnd' || 
          e.target.id === 'startStation' || e.target.id === 'endStation') {
        calculateSlope();
      }
    });
  });
  
  // Set up surveyor info listeners
  const surveyorInputs = document.querySelectorAll('.surveyor-field input');
  surveyorInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const key = e.target.id.replace('surveyor-', '');
      appState.surveyorInfo[key] = e.target.value;
    });
  });
  
  // Initialize signature canvas
  initializeSignatureCanvas();
  
  // Add some default structures
  addDefaultStructures();
  
  // Initial calculations
  calculateSlope();
  renderTable();
  updateProfileDrawing();
}

function addDefaultStructures() {
  structures = [
    {
      id: 1,
      station: '0+000',
      type: 'Manhole',
      invertLevel: 97.50,
      groundLevel: 100.00,
      excavationDepth: 4.00,
      description: 'Start manhole'
    },
    {
      id: 2,
      station: '0+100',
      type: 'Manhole',
      invertLevel: 97.00,
      groundLevel: 99.50,
      excavationDepth: 4.00,
      description: 'End manhole'
    }
  ];
  appState.structures = structures;
}

function calculateSlope() {
  const startLevel = parseFloat(document.getElementById('pipeLevelStart').value);
  const endLevel = parseFloat(document.getElementById('pipeLevelEnd').value);
  const startStation = document.getElementById('startStation').value;
  const endStation = document.getElementById('endStation').value;
  
  const distance = calculateDistance(startStation, endStation);
  const levelDifference = startLevel - endLevel;
  const slope = distance > 0 ? (levelDifference / distance) * 100 : 0;
  
  document.getElementById('calculatedSlope').value = slope.toFixed(2);
  appState.parameters.calculatedSlope = slope.toFixed(2);
}

function calculateDistance(startStation, endStation) {
  // Convert station format to meters
  const parseStation = (station) => {
    const parts = station.split('+');
    return parseInt(parts[0]) * 1000 + parseInt(parts[1] || 0);
  };
  
  return Math.abs(parseStation(endStation) - parseStation(startStation));
}

function recalculateAll() {
  calculateSlope();
  updateStructureDepths();
  renderTable();
  updateProfileDrawing();
  showNotification('All calculations updated successfully!', 'success');
}

function updateStructureDepths() {
  structures.forEach(structure => {
    structure.excavationDepth = structure.groundLevel - structure.invertLevel + 0.5;
  });
  renderStructuresTable();
}

function saveRecord() {
  const record = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    sectionName: document.getElementById('sectionName').value,
    startStation: document.getElementById('startStation').value,
    endStation: document.getElementById('endStation').value,
    pipeDiameter: document.getElementById('pipeDiameter').value,
    pipeDepth: document.getElementById('pipeDepth').value,
    excavationWidth: document.getElementById('excavationWidth').value,
    slopeRatio: document.getElementById('slopeRatio').value,
    groundLevelStart: document.getElementById('groundLevelStart').value,
    groundLevelEnd: document.getElementById('groundLevelEnd').value,
    pipeLevelStart: document.getElementById('pipeLevelStart').value,
    pipeLevelEnd: document.getElementById('pipeLevelEnd').value,
    calculatedSlope: document.getElementById('calculatedSlope').value,
    surveyorName: document.getElementById('surveyor-name').value,
    structures: [...structures]
  };
  
  savedRecords.push(record);
  appState.savedRecords = savedRecords;
  renderSavedRecords();
  showNotification('Record saved successfully!', 'success');
}

function renderSavedRecords() {
  const container = document.getElementById('saved-records-list');
  
  if (savedRecords.length === 0) {
    container.innerHTML = '<p style="color: #64748b; font-style: italic;">No saved records yet. Save your first calculation above.</p>';
    return;
  }
  
  container.innerHTML = savedRecords.map(record => `
    <div class="saved-record-item">
      <div class="saved-record-info">
        <div class="saved-record-timestamp">Saved: ${new Date(record.timestamp).toLocaleString()}</div>
        <div class="saved-record-surveyor">Surveyor: ${record.surveyorName || 'Not specified'}</div>
        <h4>${record.sectionName}</h4>
        <div class="saved-record-details">
          <span>Stations: ${record.startStation} - ${record.endStation}</span>
          <span>Pipe: Ø${record.pipeDiameter}mm</span>
          <span>Depth: ${record.pipeDepth}m</span>
          <span>Slope: ${record.calculatedSlope}%</span>
        </div>
        <div class="saved-record-levels">
          <span>Ground: ${record.groundLevelStart}m - ${record.groundLevelEnd}m</span>
          <span>Pipe: ${record.pipeLevelStart}m - ${record.pipeLevelEnd}m</span>
        </div>
      </div>
      <div class="saved-record-actions">
        <button class="load-btn" onclick="loadRecord(${record.id})">Load</button>
        <button class="print-btn" onclick="printRecord(${record.id})">Print</button>
        <button class="delete-btn" onclick="deleteRecord(${record.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function loadRecord(recordId) {
  const record = savedRecords.find(r => r.id === recordId);
  if (!record) return;
  
  // Load parameters
  Object.keys(record).forEach(key => {
    const input = document.getElementById(key);
    if (input && typeof record[key] !== 'object') {
      input.value = record[key];
      appState.parameters[key] = record[key];
    }
  });
  
  // Load structures
  structures = record.structures || [];
  appState.structures = structures;
  
  // Update UI
  recalculateAll();
  renderStructuresTable();
  
  showNotification('Record loaded successfully!', 'success');
}

function deleteRecord(recordId) {
  if (confirm('Are you sure you want to delete this record?')) {
    savedRecords = savedRecords.filter(r => r.id !== recordId);
    appState.savedRecords = savedRecords;
    renderSavedRecords();
    showNotification('Record deleted successfully!', 'info');
  }
}

function printRecord(recordId) {
  const record = savedRecords.find(r => r.id === recordId);
  if (!record) return;
  
  // Load the record temporarily for printing
  const currentData = { ...appState.parameters };
  loadRecord(recordId);
  
  // Print
  window.print();
  
  // Restore current data
  Object.assign(appState.parameters, currentData);
}

// Structures management
function addStructure() {
  const newStructure = {
    id: Date.now(),
    station: '0+050',
    type: 'Manhole',
    invertLevel: 97.25,
    groundLevel: 99.75,
    excavationDepth: 4.00,
    description: 'New structure'
  };
  
  structures.push(newStructure);
  appState.structures = structures;
  renderStructuresTable();
  showNotification('Structure added successfully!', 'success');
}

function deleteStructure(structureId) {
  if (confirm('Are you sure you want to delete this structure?')) {
    structures = structures.filter(s => s.id !== structureId);
    appState.structures = structures;
    renderStructuresTable();
    showNotification('Structure deleted successfully!', 'info');
  }
}

function sortStructures() {
  structures.sort((a, b) => {
    const parseStation = (station) => {
      const parts = station.split('+');
      return parseInt(parts[0]) * 1000 + parseInt(parts[1] || 0);
    };
    return parseStation(a.station) - parseStation(b.station);
  });
  appState.structures = structures;
  renderStructuresTable();
  showNotification('Structures sorted by station!', 'info');
}

function updateSectionName() {
  const sectionName = document.getElementById('sectionName').value;
  document.getElementById('section-name-display').textContent = sectionName;
}

function renderStructuresTable() {
  const tbody = document.getElementById('structures-table-body');
  
  tbody.innerHTML = structures.map(structure => `
    <tr>
      <td>
        <input type="text" class="structure-input" value="${structure.station}" 
               onchange="updateStructure(${structure.id}, 'station', this.value)">
      </td>
      <td>
        <select class="structure-select" onchange="updateStructure(${structure.id}, 'type', this.value)">
          <option value="Manhole" ${structure.type === 'Manhole' ? 'selected' : ''}>Manhole</option>
          <option value="Inspection Chamber" ${structure.type === 'Inspection Chamber' ? 'selected' : ''}>Inspection Chamber</option>
          <option value="Junction" ${structure.type === 'Junction' ? 'selected' : ''}>Junction</option>
          <option value="Bend" ${structure.type === 'Bend' ? 'selected' : ''}>Bend</option>
        </select>
      </td>
      <td>
        <input type="number" class="structure-input" value="${structure.invertLevel}" step="0.01"
               onchange="updateStructure(${structure.id}, 'invertLevel', parseFloat(this.value))">
      </td>
      <td>
        <input type="number" class="structure-input" value="${structure.groundLevel}" step="0.01"
               onchange="updateStructure(${structure.id}, 'groundLevel', parseFloat(this.value))">
      </td>
      <td>
        <span class="excavation-depth">${structure.excavationDepth.toFixed(2)}m</span>
      </td>
      <td>
        <input type="text" class="structure-input" value="${structure.description}" 
               onchange="updateStructure(${structure.id}, 'description', this.value)">
      </td>
      <td class="no-print">
        <button class="delete-structure-btn" onclick="deleteStructure(${structure.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

function updateStructure(structureId, field, value) {
  const structure = structures.find(s => s.id === structureId);
  if (structure) {
    structure[field] = value;
    
    // Recalculate excavation depth when levels change
    if (field === 'invertLevel' || field === 'groundLevel') {
      structure.excavationDepth = structure.groundLevel - structure.invertLevel + 0.5;
      renderStructuresTable();
    }
    
    appState.structures = structures;
  }
}

// Table rendering
function renderTable() {
  const tbody = document.getElementById('calculations-table-body');
  const startStation = document.getElementById('startStation').value;
  const endStation = document.getElementById('endStation').value;
  const groundStart = parseFloat(document.getElementById('groundLevelStart').value);
  const groundEnd = parseFloat(document.getElementById('groundLevelEnd').value);
  const pipeStart = parseFloat(document.getElementById('pipeLevelStart').value);
  const pipeEnd = parseFloat(document.getElementById('pipeLevelEnd').value);
  const excavationWidth = parseFloat(document.getElementById('excavationWidth').value);
  const pipeDepth = parseFloat(document.getElementById('pipeDepth').value);
  
  const distance = calculateDistance(startStation, endStation);
  const stations = 10; // Number of calculation points
  const interval = distance / (stations - 1);
  
  let cumulativeVolume = 0;
  const rows = [];
  
  for (let i = 0; i < stations; i++) {
    const stationDistance = i * interval;
    const ratio = stationDistance / distance;
    
    const currentGroundLevel = groundStart + (groundEnd - groundStart) * ratio;
    const currentPipeLevel = pipeStart + (pipeEnd - pipeStart) * ratio;
    const currentPipeDepth = currentGroundLevel - currentPipeLevel;
    const excavationDepth = currentPipeDepth + 0.5; // Add 0.5m below pipe
    
    const volumePerMeter = excavationWidth * excavationDepth;
    const segmentVolume = i === 0 ? 0 : volumePerMeter * interval / (stations - 1);
    cumulativeVolume += segmentVolume;
    
    const stationName = formatStation(startStation, stationDistance);
    
    rows.push(`
      <tr>
        <td>${stationName}</td>
        <td>${currentGroundLevel.toFixed(2)}</td>
        <td>${currentPipeLevel.toFixed(2)}</td>
        <td>${currentPipeDepth.toFixed(2)}</td>
        <td>${excavationWidth.toFixed(2)}</td>
        <td>${excavationDepth.toFixed(2)}</td>
        <td>${volumePerMeter.toFixed(2)}</td>
        <td>${cumulativeVolume.toFixed(2)}</td>
      </tr>
    `);
  }
  
  tbody.innerHTML = rows.join('');
  
  // Update summary information
  document.getElementById('project-name-display').textContent = document.getElementById('sectionName').value;
  document.getElementById('station-range-display').textContent = `${startStation} to ${endStation}`;
  document.getElementById('total-length-display').textContent = `${distance.toFixed(2)} m`;
}

function formatStation(baseStation, additionalDistance) {
  const parseStation = (station) => {
    const parts = station.split('+');
    return parseInt(parts[0]) * 1000 + parseInt(parts[1] || 0);
  };
  
  const totalDistance = parseStation(baseStation) + additionalDistance;
  const km = Math.floor(totalDistance / 1000);
  const m = Math.round(totalDistance % 1000);
  
  return `${km}+${m.toString().padStart(3, '0')}`;
}

// Profile drawing
function updateProfileDrawing() {
  const canvas = document.getElementById('profile-canvas');
  const ctx = canvas.getContext('2d');
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Get parameters
  const groundStart = parseFloat(document.getElementById('groundLevelStart').value);
  const groundEnd = parseFloat(document.getElementById('groundLevelEnd').value);
  const pipeStart = parseFloat(document.getElementById('pipeLevelStart').value);
  const pipeEnd = parseFloat(document.getElementById('pipeLevelEnd').value);
  const excavationWidth = parseFloat(document.getElementById('excavationWidth').value);
  const slopeRatio = parseFloat(document.getElementById('slopeRatio').value);
  
  // Drawing parameters
  const margin = 50;
  const drawWidth = canvas.width - 2 * margin;
  const drawHeight = canvas.height - 2 * margin;
  
  // Calculate scale
  const minLevel = Math.min(groundStart, groundEnd, pipeStart, pipeEnd) - 2;
  const maxLevel = Math.max(groundStart, groundEnd, pipeStart, pipeEnd) + 1;
  const levelRange = maxLevel - minLevel;
  const verticalScale = drawHeight / levelRange;
  const horizontalScale = drawWidth / 100; // Assuming 100m length
  
  // Helper function to convert coordinates
  const toCanvasX = (distance) => margin + distance * horizontalScale;
  const toCanvasY = (level) => margin + (maxLevel - level) * verticalScale;
  
  // Draw grid
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  
  // Vertical grid lines
  for (let i = 0; i <= 100; i += 10) {
    const x = toCanvasX(i);
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, canvas.height - margin);
    ctx.stroke();
  }
  
  // Horizontal grid lines
  for (let level = Math.ceil(minLevel); level <= Math.floor(maxLevel); level++) {
    const y = toCanvasY(level);
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(canvas.width - margin, y);
    ctx.stroke();
  }
  
  // Draw ground line
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), toCanvasY(groundStart));
  ctx.lineTo(toCanvasX(100), toCanvasY(groundEnd));
  ctx.stroke();
  
  // Draw pipe line
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), toCanvasY(pipeStart));
  ctx.lineTo(toCanvasX(100), toCanvasY(pipeEnd));
  ctx.stroke();
  
  // Draw excavation limits
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  // Top excavation line (ground level)
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), toCanvasY(groundStart));
  ctx.lineTo(toCanvasX(100), toCanvasY(groundEnd));
  ctx.stroke();
  
  // Bottom excavation line
  const excavationBottom = Math.min(pipeStart, pipeEnd) - 0.5;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), toCanvasY(excavationBottom));
  ctx.lineTo(toCanvasX(100), toCanvasY(excavationBottom));
  ctx.stroke();
  
  ctx.setLineDash([]);
  
  // Draw structures
  structures.forEach(structure => {
    const stationDistance = calculateStationDistance(structure.station);
    const x = toCanvasX(stationDistance);
    
    if (structure.type === 'Manhole') {
      // Draw manhole symbol
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.arc(x, toCanvasY(structure.invertLevel), 8, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Draw inspection chamber symbol
      ctx.fillStyle = '#059669';
      ctx.fillRect(x - 6, toCanvasY(structure.invertLevel) - 6, 12, 12);
      
      ctx.strokeStyle = '#047857';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 6, toCanvasY(structure.invertLevel) - 6, 12, 12);
    }
    
    // Add station label
    ctx.fillStyle = '#374151';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(structure.station, x, toCanvasY(maxLevel) + 20);
  });
  
  // Add level labels
  ctx.fillStyle = '#374151';
  ctx.font = '12px Arial';
  ctx.textAlign = 'right';
  
  for (let level = Math.ceil(minLevel); level <= Math.floor(maxLevel); level++) {
    const y = toCanvasY(level);
    ctx.fillText(`${level.toFixed(0)}m`, margin - 10, y + 4);
  }
  
  // Update profile information
  document.getElementById('profile-section-name').textContent = document.getElementById('sectionName').value;
  document.getElementById('profile-station-range').textContent = 
    `${document.getElementById('startStation').value} to ${document.getElementById('endStation').value}`;
  document.getElementById('profile-pipe-diameter').textContent = 
    `Ø${document.getElementById('pipeDiameter').value}mm`;
  document.getElementById('profile-total-length').textContent = 
    `Length: ${calculateDistance(document.getElementById('startStation').value, document.getElementById('endStation').value).toFixed(2)}m`;
  
  // Update specifications
  document.getElementById('spec-pipe-diameter').textContent = `${document.getElementById('pipeDiameter').value}mm`;
  document.getElementById('spec-slope').textContent = `${document.getElementById('calculatedSlope').value}%`;
  document.getElementById('spec-excavation-width').textContent = `${document.getElementById('excavationWidth').value}m`;
  document.getElementById('spec-side-slope').textContent = `1:${document.getElementById('slopeRatio').value}`;
  document.getElementById('spec-cover-depth').textContent = `${document.getElementById('pipeDepth').value}m`;
  
  // Update surveyor info in profile
  document.getElementById('profile-surveyor-name').textContent = 
    document.getElementById('surveyor-name').value || 'Not specified';
  document.getElementById('profile-surveyor-title').textContent = 
    document.getElementById('surveyor-title').value || 'Licensed Surveyor';
  document.getElementById('profile-surveyor-contact').textContent = 
    document.getElementById('surveyor-company').value || 'Company not specified';
}

function calculateStationDistance(station) {
  // Convert station format to distance from start
  const parseStation = (station) => {
    const parts = station.split('+');
    return parseInt(parts[0]) * 1000 + parseInt(parts[1] || 0);
  };
  
  const startStation = document.getElementById('startStation').value;
  return parseStation(station) - parseStation(startStation);
}

// Signature functionality
function initializeSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  function startDrawing(e) {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = (e.clientX || e.touches[0].clientX) - rect.left;
    lastY = (e.clientY || e.touches[0].clientY) - rect.top;
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX || e.touches[0].clientX) - rect.left;
    const currentY = (e.clientY || e.touches[0].clientY) - rect.top;
    
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
  }
  
  function stopDrawing() {
    isDrawing = false;
  }
  
  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e);
  });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopDrawing();
  });
}

function clearSignature() {
  const canvas = document.getElementById('signature-canvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Hide preview
  document.getElementById('signature-preview').style.display = 'none';
  savedSignature = null;
  appState.signature = null;
}

function saveSignature() {
  const canvas = document.getElementById('signature-canvas');
  const dataURL = canvas.toDataURL();
  
  // Show preview
  const preview = document.getElementById('signature-preview');
  const img = document.getElementById('saved-signature');
  img.src = dataURL;
  preview.style.display = 'block';
  
  savedSignature = dataURL;
  appState.signature = dataURL;
  appState.surveyorInfo.signature = dataURL;
  showNotification('Signature saved successfully!', 'success');
}

// Export functions
function exportProfileImage() {
  const canvas = document.getElementById('profile-canvas');
  const link = document.createElement('a');
  link.download = `${document.getElementById('sectionName').value}-profile.png`;
  link.href = canvas.toDataURL();
  link.click();
  showNotification('Profile image exported successfully!', 'success');
}

function generateProfessionalReport() {
  try {
    // Get current project data
    const currentData = app.getCurrentProjectData();
    
    // Generate the professional report
    const reportWindow = reportGenerator.generateProfessionalReport(currentData);
    
    showNotification('Professional report generated successfully!', 'success');
    
    return reportWindow;
  } catch (error) {
    console.error('Report generation failed:', error);
    showNotification(`Report generation failed: ${error.message}`, 'error');
  }
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 4000);
}

// Make showNotification globally available
window.showNotification = showNotification;

// Initialize saved records on load
renderSavedRecords();