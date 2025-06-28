import './style.css'

// Application state
let currentTab = 'parameters';
let structures = [
  { 
    id: 1, 
    station: 0, 
    type: 'manhole', 
    name: 'MH-1', 
    invert: 601.000, 
    excavation: 600.500, 
    coverLevel: 602.500,
    color: '#2563eb' 
  },
  { 
    id: 2, 
    station: 35, 
    type: 'ic_chamber', 
    name: 'IC Chamber 10', 
    invert: 600.640, 
    excavation: 600.290, 
    coverLevel: 602.140,
    color: '#059669' 
  }
];
let nextStructureId = 3;

// Parameters with default values
let parameters = {
  sectionName: 'MH-1 - IC Chamber 10',
  startStation: 0,
  endStation: 35,
  startInvert: 601.000,
  endInvert: 600.640,
  pipeSize: 200,
  totalLength: 35,
  slope: 1.03,
  invertAtStation: 601.000,
  cumulativeDrop: 0,
  excavationLevel: 600.800,
  excavationReading: 1.200,
  topOfPipe: 601.200,
  topOfPipeReading: 0.800,
  stationInterval: 3, // User-defined station interval
  excavationDepthManhole: 50, // Default 50cm for manholes
  excavationDepthIC: 35 // Default 35cm for IC chambers
};

// Saved records
let savedRecords = JSON.parse(localStorage.getItem('pipeCalculatorRecords') || '[]');

// Surveyor information (fixed data)
let surveyorInfo = {
  name: 'AHMED BARAKAT',
  title: 'Professional Surveyor',
  phone: '0596488146',
  signature: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  document.querySelector('#app').innerHTML = `
    <div class="container">
      <header>
        <h1>Pipe & Excavation Calculator</h1>
        <p>Professional Civil Engineering Calculator System</p>
      </header>

      <nav class="tab-navigation">
        <button class="tab-button active" data-tab="parameters">Parameters & Calculations</button>
        <button class="tab-button" data-tab="structures">Project Structures</button>
        <button class="tab-button" data-tab="table">Analysis Table</button>
        <button class="tab-button" data-tab="profile">Civil Survey Profile</button>
      </nav>

      <div id="parameters-tab" class="tab-content">
        <div class="parameters-section">
          <h2>Project Parameters</h2>
          <div class="parameters-grid">
            <div class="parameter-item section-name">
              <label for="sectionName">Section Name (Between Structures):</label>
              <input type="text" id="sectionName" value="${parameters.sectionName}" readonly>
              <div class="auto-generated-note">Auto-generated from selected structures</div>
            </div>
            <div class="parameter-item">
              <label for="startInvert">Start Invert (m):</label>
              <input type="number" id="startInvert" value="${parameters.startInvert}" step="0.001">
            </div>
            <div class="parameter-item">
              <label for="endInvert">End Invert (m):</label>
              <input type="number" id="endInvert" value="${parameters.endInvert}" step="0.001">
            </div>
            <div class="parameter-item">
              <label for="pipeSize">Pipe Size (mm):</label>
              <input type="number" id="pipeSize" value="${parameters.pipeSize}">
            </div>
            <div class="parameter-item">
              <label for="totalLength">Total Length (m):</label>
              <input type="number" id="totalLength" value="${parameters.totalLength}" step="0.001">
            </div>
            <div class="parameter-item slope-calculated">
              <label for="slope">Slope (%):</label>
              <input type="number" id="slope" value="${parameters.slope}" step="0.001" readonly class="auto-calculated">
              <div class="calculation-note">Calculated: ((Start Invert - End Invert) / Total Length) × 100</div>
            </div>
            <div class="parameter-item">
              <label for="stationInterval">Station Interval (m):</label>
              <input type="number" id="stationInterval" value="${parameters.stationInterval}" step="1" min="1">
              <div class="calculation-note">Interval for detailed analysis (e.g., 2m, 3m, 4m)</div>
            </div>
            <div class="parameter-item">
              <label for="excavationDepthManhole">Manhole Excavation Depth (cm):</label>
              <input type="number" id="excavationDepthManhole" value="${parameters.excavationDepthManhole}" step="1">
              <div class="calculation-note">Default depth below invert for manholes</div>
            </div>
            <div class="parameter-item">
              <label for="excavationDepthIC">IC Chamber Excavation Depth (cm):</label>
              <input type="number" id="excavationDepthIC" value="${parameters.excavationDepthIC}" step="1">
              <div class="calculation-note">Default depth below invert for IC chambers</div>
            </div>
            <div class="parameter-item">
              <label for="invertAtStation">Invert at Station (m):</label>
              <input type="number" id="invertAtStation" value="${parameters.invertAtStation}" step="0.001">
            </div>
            <div class="parameter-item">
              <label for="cumulativeDrop">Cumulative Drop (m):</label>
              <input type="number" id="cumulativeDrop" value="${parameters.cumulativeDrop}" step="0.001" readonly class="auto-calculated">
              <div class="calculation-note">Calculated: (Station - Start Station) × (Slope / 100)</div>
            </div>
            <div class="parameter-item">
              <label for="excavationLevel">Excavation Level (m):</label>
              <input type="number" id="excavationLevel" value="${parameters.excavationLevel}" step="0.001">
            </div>
            <div class="parameter-item">
              <label for="excavationReading">Excavation Reading (m):</label>
              <input type="number" id="excavationReading" value="${parameters.excavationReading}" step="0.001" readonly class="auto-calculated">
              <div class="calculation-note">Calculated: Ground Level - Excavation Level</div>
            </div>
            <div class="parameter-item">
              <label for="topOfPipe">Top of Pipe (m):</label>
              <input type="number" id="topOfPipe" value="${parameters.topOfPipe}" step="0.001" readonly class="auto-calculated">
              <div class="calculation-note">Calculated: Invert at Station + (Pipe Size / 1000)</div>
            </div>
            <div class="parameter-item">
              <label for="topOfPipeReading">Top of Pipe Reading (m):</label>
              <input type="number" id="topOfPipeReading" value="${parameters.topOfPipeReading}" step="0.001" readonly class="auto-calculated">
              <div class="calculation-note">Calculated: Ground Level - Top of Pipe</div>
            </div>
          </div>
          <div class="button-group">
            <button class="recalculate-btn" onclick="recalculateParameters()">Recalculate All</button>
            <button class="save-record-btn" onclick="saveRecord()">Save Record</button>
            <button class="professional-report-btn" onclick="generateProfessionalReport()">Professional Report</button>
            <button class="print-btn" onclick="printReport()">Print Report</button>
          </div>
        </div>

        <div class="saved-records-section">
          <h3>Saved Records</h3>
          <div class="saved-records-list" id="savedRecordsList">
            ${renderSavedRecords()}
          </div>
        </div>

        <div class="surveyor-info-section">
          <h3>Surveyor Information</h3>
          <div class="surveyor-info-grid">
            <div class="surveyor-field">
              <label for="surveyorName">Surveyor Name:</label>
              <input type="text" id="surveyorName" value="${surveyorInfo.name}" readonly>
            </div>
            <div class="surveyor-field">
              <label for="surveyorTitle">Title:</label>
              <input type="text" id="surveyorTitle" value="${surveyorInfo.title}" readonly>
            </div>
            <div class="surveyor-field">
              <label for="surveyorPhone">Phone Number:</label>
              <input type="text" id="surveyorPhone" value="${surveyorInfo.phone}" readonly>
            </div>
          </div>
          
          <div class="signature-section">
            <h4>Digital Signature</h4>
            <div class="signature-container">
              <canvas id="signatureCanvas" class="signature-canvas" width="300" height="120"></canvas>
              <div class="signature-controls">
                <button class="clear-signature-btn" onclick="clearSignature()">Clear</button>
                <button class="save-signature-btn" onclick="saveSignature()">Save Signature</button>
              </div>
              ${surveyorInfo.signature ? `
                <div class="signature-preview">
                  <h5>Saved Signature:</h5>
                  <img src="${surveyorInfo.signature}" alt="Saved Signature" class="saved-signature">
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <div id="structures-tab" class="tab-content" style="display: none;">
        <div class="structures-section">
          <div class="structures-header">
            <h2>Project Structures</h2>
            <p>Manage manholes, IC chambers, and other structures along the pipeline</p>
          </div>

          <div class="section-name-preview">
            <h3>Current Section Name:</h3>
            <div class="section-name-display">${parameters.sectionName}</div>
          </div>

          <div class="structures-table-container">
            <table class="structures-table">
              <thead>
                <tr>
                  <th>Station (m)</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Color</th>
                  <th>Invert (m)</th>
                  <th>Cover Level (m)</th>
                  <th>Excavation (m)</th>
                  <th>Excavation Depth (cm)</th>
                  <th>Visual</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="structuresTableBody">
                ${renderStructuresTable()}
              </tbody>
            </table>
          </div>

          <div class="structures-actions">
            <button class="add-structure-btn" onclick="addStructure()">Add Structure</button>
            <button class="sort-structures-btn" onclick="sortStructures()">Sort by Station</button>
            <button class="update-section-btn" onclick="updateSectionName()">Update Section Name</button>
          </div>
        </div>
      </div>

      <div id="table-tab" class="tab-content" style="display: none;">
        <div class="table-section">
          <h2>Detailed Analysis Table</h2>
          <div class="station-info">
            <p><strong>Section:</strong> ${parameters.sectionName}</p>
            <p><strong>Total Length:</strong> ${parameters.totalLength}m</p>
            <p><strong>Pipe Size:</strong> ${parameters.pipeSize}mm</p>
            <p><strong>Slope:</strong> ${parameters.slope}%</p>
            <p><strong>Station Interval:</strong> ${parameters.stationInterval}m</p>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Station (m)</th>
                  <th>Start Invert (m)</th>
                  <th>End Invert (m)</th>
                  <th>Top of Pipe (m)</th>
                  <th>Top Pipe Reading (m)</th>
                  <th>Invert at Station (m)</th>
                  <th>Cumulative Drop (m)</th>
                  <th>Total Length (m)</th>
                  <th>Excavation Level (m)</th>
                  <th>Excavation Reading (m)</th>
                  <th>Structure Name</th>
                  <th>Structure Invert (m)</th>
                  <th>Structure Cover (m)</th>
                  <th>Structure Excavation (m)</th>
                  <th>Structure Reading (m)</th>
                </tr>
              </thead>
              <tbody id="analysisTableBody">
                ${generateAnalysisTable()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="profile-tab" class="tab-content" style="display: none;">
        <div class="profile-section">
          <div class="profile-header">
            <div class="profile-title-section">
              <h1>Civil Survey Profile</h1>
              <p>Professional Cross-Sectional Drawing with Accurate Pipe & Excavation Thickness</p>
              <div class="profile-project-info">
                <span>Section: ${parameters.sectionName}</span>
                <span>Length: ${parameters.totalLength}m</span>
                <span>Pipe: Ø${parameters.pipeSize}mm</span>
                <span>Slope: ${parameters.slope.toFixed(3)}%</span>
              </div>
            </div>
            <div class="profile-surveyor-info">
              <div class="surveyor-badge">
                <div class="surveyor-name">${surveyorInfo.name}</div>
                <div class="surveyor-title">${surveyorInfo.title}</div>
                <div class="surveyor-contact">${surveyorInfo.phone}</div>
              </div>
            </div>
          </div>

          <div class="profile-drawing-container">
            <canvas id="profileCanvas" class="profile-canvas" width="1200" height="600"></canvas>
          </div>

          <div class="profile-legend">
            <div class="legend-section">
              <h3>Drawing Legend</h3>
              <div class="legend-items">
                <div class="legend-item">
                  <div class="legend-symbol ground-line"></div>
                  <span><strong>Ground Level (GL)</strong> - Natural ground surface from structure cover levels</span>
                </div>
                <div class="legend-item">
                  <div class="legend-symbol pipe-line"></div>
                  <span><strong>Pipe Invert & Top</strong> - Ø${parameters.pipeSize}mm pipe with actual thickness</span>
                </div>
                <div class="legend-item">
                  <div class="legend-symbol excavation-line"></div>
                  <span><strong>Excavation Zone</strong> - 20cm below invert level with boundaries</span>
                </div>
                <div class="legend-item">
                  <div class="manhole-symbol"></div>
                  <span><strong>Manhole</strong> - Circular structure with shaft</span>
                </div>
                <div class="legend-item">
                  <div class="ic-symbol"></div>
                  <span><strong>IC Chamber</strong> - Rectangular inspection chamber</span>
                </div>
              </div>
            </div>

            <div class="profile-specifications">
              <h3>Technical Specifications</h3>
              <div class="spec-grid">
                <div class="spec-item">
                  <span>Horizontal Scale:</span>
                  <span>1:500</span>
                </div>
                <div class="spec-item">
                  <span>Vertical Scale:</span>
                  <span>1:100</span>
                </div>
                <div class="spec-item">
                  <span>Pipe Material:</span>
                  <span>Concrete/PVC</span>
                </div>
                <div class="spec-item">
                  <span>Excavation Depth:</span>
                  <span>200mm below IL</span>
                </div>
                <div class="spec-item">
                  <span>Drawing Standard:</span>
                  <span>Civil 3D Compatible</span>
                </div>
                <div class="spec-item">
                  <span>Coordinate System:</span>
                  <span>Local Grid</span>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <button class="profile-action-btn primary" onclick="exportToCAD()">
              <span class="btn-icon">📐</span>
              Export to CAD (DXF)
            </button>
            <button class="profile-action-btn secondary" onclick="printProfile()">
              <span class="btn-icon">🖨️</span>
              Print Profile
            </button>
            <button class="profile-action-btn tertiary" onclick="saveProfileImage()">
              <span class="btn-icon">💾</span>
              Save as Image
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Initialize event listeners
  initializeEventListeners();
  initializeSignatureCanvas();
  
  // Load saved surveyor signature if exists
  const savedSignature = localStorage.getItem('surveyorSignature');
  if (savedSignature) {
    surveyorInfo.signature = savedSignature;
  }
}

function initializeEventListeners() {
  // Tab navigation
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', function() {
      switchTab(this.dataset.tab);
    });
  });

  // Parameter inputs
  document.querySelectorAll('.parameter-item input').forEach(input => {
    input.addEventListener('input', function() {
      if (!this.readOnly) {
        this.classList.add('changed');
        updateParameters();
      }
    });
  });
}

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

  // Refresh content if needed
  if (tabName === 'structures') {
    refreshStructuresTable();
  } else if (tabName === 'table') {
    refreshAnalysisTable();
  } else if (tabName === 'profile') {
    drawCivilProfile();
  }
}

function drawCivilProfile() {
  const canvas = document.getElementById('profileCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Set up drawing parameters
  const margin = 80;
  const drawWidth = width - 2 * margin;
  const drawHeight = height - 2 * margin;
  
  // Calculate scales
  const horizontalScale = drawWidth / parameters.totalLength;
  const minElevation = Math.min(...structures.map(s => s.excavation)) - 0.5;
  const maxElevation = Math.max(...structures.map(s => s.coverLevel)) + 0.5;
  const elevationRange = maxElevation - minElevation;
  const verticalScale = drawHeight / elevationRange;
  
  // Helper function to convert coordinates
  function toCanvasX(station) {
    return margin + (station * horizontalScale);
  }
  
  function toCanvasY(elevation) {
    return margin + drawHeight - ((elevation - minElevation) * verticalScale);
  }
  
  // Draw grid
  drawGrid(ctx, margin, drawWidth, drawHeight, horizontalScale, verticalScale, minElevation, maxElevation);
  
  // Draw ground level (interpolated from structure cover levels)
  drawGroundLevel(ctx, toCanvasX, toCanvasY);
  
  // Draw excavation area
  drawExcavationArea(ctx, toCanvasX, toCanvasY);
  
  // Draw pipe with thickness
  drawPipeWithThickness(ctx, toCanvasX, toCanvasY);
  
  // Draw structures
  drawStructures(ctx, toCanvasX, toCanvasY);
  
  // Draw annotations
  drawAnnotations(ctx, toCanvasX, toCanvasY, margin, drawHeight);
}

function drawGrid(ctx, margin, drawWidth, drawHeight, horizontalScale, verticalScale, minElevation, maxElevation) {
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  
  // Vertical grid lines (every 5m)
  for (let station = 0; station <= parameters.totalLength; station += 5) {
    const x = margin + (station * horizontalScale);
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, margin + drawHeight);
    ctx.stroke();
  }
  
  // Horizontal grid lines (every 0.5m elevation)
  for (let elevation = Math.floor(minElevation * 2) / 2; elevation <= Math.ceil(maxElevation * 2) / 2; elevation += 0.5) {
    const y = margin + drawHeight - ((elevation - minElevation) * verticalScale);
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(margin + drawWidth, y);
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
}

function drawGroundLevel(ctx, toCanvasX, toCanvasY) {
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  
  // Sort structures by station
  const sortedStructures = [...structures].sort((a, b) => a.station - b.station);
  
  ctx.beginPath();
  
  // Interpolate ground level between structures
  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    let groundLevel;
    
    if (station <= sortedStructures[0].station) {
      groundLevel = sortedStructures[0].coverLevel;
    } else if (station >= sortedStructures[sortedStructures.length - 1].station) {
      groundLevel = sortedStructures[sortedStructures.length - 1].coverLevel;
    } else {
      // Find the two structures to interpolate between
      let beforeStructure = sortedStructures[0];
      let afterStructure = sortedStructures[1];
      
      for (let i = 0; i < sortedStructures.length - 1; i++) {
        if (station >= sortedStructures[i].station && station <= sortedStructures[i + 1].station) {
          beforeStructure = sortedStructures[i];
          afterStructure = sortedStructures[i + 1];
          break;
        }
      }
      
      // Linear interpolation
      const ratio = (station - beforeStructure.station) / (afterStructure.station - beforeStructure.station);
      groundLevel = beforeStructure.coverLevel + ratio * (afterStructure.coverLevel - beforeStructure.coverLevel);
    }
    
    const x = toCanvasX(station);
    const y = toCanvasY(groundLevel);
    
    if (station === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
}

function drawExcavationArea(ctx, toCanvasX, toCanvasY) {
  // Draw excavation area (filled)
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  ctx.beginPath();
  
  // Top boundary (excavation level)
  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const excavationLevel = invertAtStation - 0.2; // 20cm below invert
    
    const x = toCanvasX(station);
    const y = toCanvasY(excavationLevel);
    
    if (station === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  // Right boundary
  const endExcavationLevel = parameters.endInvert - 0.2;
  ctx.lineTo(toCanvasX(parameters.totalLength), toCanvasY(endExcavationLevel - 0.3));
  
  // Bottom boundary
  ctx.lineTo(toCanvasX(0), toCanvasY(parameters.startInvert - 0.5));
  
  // Left boundary
  ctx.lineTo(toCanvasX(0), toCanvasY(parameters.startInvert - 0.2));
  
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  
  ctx.setLineDash([]);
}

function drawPipeWithThickness(ctx, toCanvasX, toCanvasY) {
  const pipeRadius = (parameters.pipeSize / 1000) / 2; // Convert mm to m and get radius
  
  // Draw pipe body (filled area)
  ctx.fillStyle = 'rgba(220, 38, 38, 0.3)';
  ctx.beginPath();
  
  // Top of pipe line
  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const topOfPipe = invertAtStation + (parameters.pipeSize / 1000);
    
    const x = toCanvasX(station);
    const y = toCanvasY(topOfPipe);
    
    if (station === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  // Right end cap
  ctx.lineTo(toCanvasX(parameters.totalLength), toCanvasY(parameters.endInvert));
  
  // Bottom of pipe line (invert)
  for (let station = parameters.totalLength; station >= 0; station -= 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    
    const x = toCanvasX(station);
    const y = toCanvasY(invertAtStation);
    
    ctx.lineTo(x, y);
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Draw pipe invert line (bottom)
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 4;
  ctx.beginPath();
  
  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    
    const x = toCanvasX(station);
    const y = toCanvasY(invertAtStation);
    
    if (station === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
  
  // Draw pipe top line
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  
  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const topOfPipe = invertAtStation + (parameters.pipeSize / 1000);
    
    const x = toCanvasX(station);
    const y = toCanvasY(topOfPipe);
    
    if (station === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
}

function drawStructures(ctx, toCanvasX, toCanvasY) {
  structures.forEach(structure => {
    const x = toCanvasX(structure.station);
    const groundY = toCanvasY(structure.coverLevel);
    const invertY = toCanvasY(structure.invert);
    const excavationY = toCanvasY(structure.excavation);
    
    // Draw structure shaft
    ctx.strokeStyle = structure.color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x, groundY);
    ctx.lineTo(x, excavationY);
    ctx.stroke();
    
    if (structure.type === 'manhole') {
      // Draw manhole symbol
      ctx.fillStyle = structure.color;
      ctx.beginPath();
      ctx.arc(x, groundY - 15, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, groundY - 15, 8, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(structure.name, x, groundY - 35);
      
    } else if (structure.type === 'ic_chamber') {
      // Draw IC chamber symbol
      ctx.fillStyle = structure.color;
      ctx.fillRect(x - 10, groundY - 25, 20, 15);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 8, groundY - 23, 16, 11);
      
      // Label
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(structure.name, x, groundY - 35);
    }
    
    // Draw elevation labels
    ctx.fillStyle = '#374151';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`GL: ${structure.coverLevel.toFixed(3)}m`, x + 15, groundY);
    ctx.fillText(`IL: ${structure.invert.toFixed(3)}m`, x + 15, invertY);
    ctx.fillText(`EL: ${structure.excavation.toFixed(3)}m`, x + 15, excavationY);
  });
}

function drawAnnotations(ctx, toCanvasX, toCanvasY, margin, drawHeight) {
  // Draw station markers
  ctx.fillStyle = '#374151';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  
  for (let station = 0; station <= parameters.totalLength; station += 5) {
    const x = toCanvasX(station);
    ctx.fillText(`${station}m`, x, margin + drawHeight + 20);
    
    // Draw tick marks
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, margin + drawHeight);
    ctx.lineTo(x, margin + drawHeight + 10);
    ctx.stroke();
  }
  
  // Draw slope annotation
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Slope: ${parameters.slope.toFixed(3)}%`, margin, margin - 20);
  
  // Draw pipe size annotation
  ctx.fillText(`Pipe: Ø${parameters.pipeSize}mm`, margin + 200, margin - 20);
  
  // Draw title
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`CIVIL SURVEY PROFILE - ${parameters.sectionName}`, toCanvasX(parameters.totalLength / 2), margin - 40);
}

// CAD Export Functions
function exportToCAD() {
  try {
    const dxfContent = generateDXFContent();
    downloadFile(dxfContent, `${parameters.sectionName.replace(/[^a-zA-Z0-9]/g, '_')}_Profile.dxf`, 'application/dxf');
    showNotification('CAD drawing exported successfully as DXF file', 'success');
  } catch (error) {
    console.error('Error exporting to CAD:', error);
    showNotification('Error exporting CAD drawing', 'error');
  }
}

function generateDXFContent() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  let dxf = `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$DWGCODEPAGE
3
ANSI_1252
9
$INSBASE
10
0.0
20
0.0
30
0.0
9
$EXTMIN
10
0.0
20
${Math.min(...structures.map(s => s.excavation)) - 1.0}
30
0.0
9
$EXTMAX
10
${parameters.totalLength}
20
${Math.max(...structures.map(s => s.coverLevel)) + 1.0}
30
0.0
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
5
2
330
0
100
AcDbSymbolTable
70
4
0
LAYER
5
10
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
GROUND_LEVEL
70
0
62
5
6
CONTINUOUS
0
LAYER
5
11
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
PIPE_INVERT
70
0
62
1
6
CONTINUOUS
0
LAYER
5
12
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
PIPE_TOP
70
0
62
1
6
CONTINUOUS
0
LAYER
5
13
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
EXCAVATION
70
0
62
3
6
DASHED
0
LAYER
5
14
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
STRUCTURES
70
0
62
2
6
CONTINUOUS
0
LAYER
5
15
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
2
ANNOTATIONS
70
0
62
7
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
`;

  // Add ground level polyline
  dxf += generateGroundLevelDXF();
  
  // Add pipe invert line
  dxf += generatePipeInvertDXF();
  
  // Add pipe top line
  dxf += generatePipeTopDXF();
  
  // Add excavation boundary
  dxf += generateExcavationDXF();
  
  // Add structures
  dxf += generateStructuresDXF();
  
  // Add annotations
  dxf += generateAnnotationsDXF();

  dxf += `0
ENDSEC
0
EOF
`;

  return dxf;
}

function generateGroundLevelDXF() {
  let dxf = `0
LWPOLYLINE
5
100
330
1F
100
AcDbEntity
8
GROUND_LEVEL
100
AcDbPolyline
90
${Math.floor(parameters.totalLength / 0.5) + 1}
70
0
`;

  const sortedStructures = [...structures].sort((a, b) => a.station - b.station);
  
  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    let groundLevel;
    
    if (station <= sortedStructures[0].station) {
      groundLevel = sortedStructures[0].coverLevel;
    } else if (station >= sortedStructures[sortedStructures.length - 1].station) {
      groundLevel = sortedStructures[sortedStructures.length - 1].coverLevel;
    } else {
      let beforeStructure = sortedStructures[0];
      let afterStructure = sortedStructures[1];
      
      for (let i = 0; i < sortedStructures.length - 1; i++) {
        if (station >= sortedStructures[i].station && station <= sortedStructures[i + 1].station) {
          beforeStructure = sortedStructures[i];
          afterStructure = sortedStructures[i + 1];
          break;
        }
      }
      
      const ratio = (station - beforeStructure.station) / (afterStructure.station - beforeStructure.station);
      groundLevel = beforeStructure.coverLevel + ratio * (afterStructure.coverLevel - beforeStructure.coverLevel);
    }
    
    dxf += `10
${station.toFixed(3)}
20
${groundLevel.toFixed(3)}
`;
  }
  
  return dxf;
}

function generatePipeInvertDXF() {
  let dxf = `0
LWPOLYLINE
5
101
330
1F
100
AcDbEntity
8
PIPE_INVERT
100
AcDbPolyline
90
${Math.floor(parameters.totalLength / 0.5) + 1}
70
0
`;

  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    
    dxf += `10
${station.toFixed(3)}
20
${invertAtStation.toFixed(3)}
`;
  }
  
  return dxf;
}

function generatePipeTopDXF() {
  let dxf = `0
LWPOLYLINE
5
102
330
1F
100
AcDbEntity
8
PIPE_TOP
100
AcDbPolyline
90
${Math.floor(parameters.totalLength / 0.5) + 1}
70
0
`;

  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const topOfPipe = invertAtStation + (parameters.pipeSize / 1000);
    
    dxf += `10
${station.toFixed(3)}
20
${topOfPipe.toFixed(3)}
`;
  }
  
  return dxf;
}

function generateExcavationDXF() {
  let dxf = `0
LWPOLYLINE
5
103
330
1F
100
AcDbEntity
8
EXCAVATION
100
AcDbPolyline
90
${Math.floor(parameters.totalLength / 0.5) + 1}
70
0
`;

  for (let station = 0; station <= parameters.totalLength; station += 0.5) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const excavationLevel = invertAtStation - 0.2;
    
    dxf += `10
${station.toFixed(3)}
20
${excavationLevel.toFixed(3)}
`;
  }
  
  return dxf;
}

function generateStructuresDXF() {
  let dxf = '';
  let entityId = 200;
  
  structures.forEach(structure => {
    // Structure vertical line
    dxf += `0
LINE
5
${entityId++}
330
1F
100
AcDbEntity
8
STRUCTURES
100
AcDbLine
10
${structure.station.toFixed(3)}
20
${structure.coverLevel.toFixed(3)}
30
0.0
11
${structure.station.toFixed(3)}
21
${structure.excavation.toFixed(3)}
31
0.0
`;

    // Structure symbol
    if (structure.type === 'manhole') {
      dxf += `0
CIRCLE
5
${entityId++}
330
1F
100
AcDbEntity
8
STRUCTURES
100
AcDbCircle
10
${structure.station.toFixed(3)}
20
${structure.coverLevel.toFixed(3)}
30
0.0
40
0.5
`;
    } else {
      dxf += `0
LWPOLYLINE
5
${entityId++}
330
1F
100
AcDbEntity
8
STRUCTURES
100
AcDbPolyline
90
5
70
1
10
${(structure.station - 0.3).toFixed(3)}
20
${(structure.coverLevel - 0.3).toFixed(3)}
10
${(structure.station + 0.3).toFixed(3)}
20
${(structure.coverLevel - 0.3).toFixed(3)}
10
${(structure.station + 0.3).toFixed(3)}
20
${(structure.coverLevel + 0.3).toFixed(3)}
10
${(structure.station - 0.3).toFixed(3)}
20
${(structure.coverLevel + 0.3).toFixed(3)}
10
${(structure.station - 0.3).toFixed(3)}
20
${(structure.coverLevel - 0.3).toFixed(3)}
`;
    }
  });
  
  return dxf;
}

function generateAnnotationsDXF() {
  let dxf = '';
  let entityId = 300;
  
  // Station markers
  for (let station = 0; station <= parameters.totalLength; station += 5) {
    dxf += `0
TEXT
5
${entityId++}
330
1F
100
AcDbEntity
8
ANNOTATIONS
100
AcDbText
10
${station.toFixed(3)}
20
${(Math.min(...structures.map(s => s.excavation)) - 0.5).toFixed(3)}
30
0.0
40
0.2
1
${station}m
50
0.0
`;
  }
  
  // Title
  dxf += `0
TEXT
5
${entityId++}
330
1F
100
AcDbEntity
8
ANNOTATIONS
100
AcDbText
10
${(parameters.totalLength / 2).toFixed(3)}
20
${(Math.max(...structures.map(s => s.coverLevel)) + 0.5).toFixed(3)}
30
0.0
40
0.5
1
CIVIL SURVEY PROFILE - ${parameters.sectionName}
50
0.0
72
1
`;
  
  return dxf;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function printProfile() {
  const canvas = document.getElementById('profileCanvas');
  if (!canvas) return;
  
  const printWindow = window.open('', '_blank');
  const imgData = canvas.toDataURL('image/png');
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Civil Survey Profile - ${parameters.sectionName}</title>
      <style>
        @page { margin: 1cm; size: A3 landscape; }
        body { margin: 0; padding: 20px; text-align: center; font-family: Arial, sans-serif; }
        .header { margin-bottom: 20px; }
        .header h1 { color: #1e40af; margin: 0; }
        .header p { color: #64748b; margin: 5px 0; }
        .profile-image { max-width: 100%; height: auto; border: 1px solid #ccc; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Civil Survey Profile</h1>
        <p>${parameters.sectionName}</p>
        <p>Length: ${parameters.totalLength}m | Pipe: Ø${parameters.pipeSize}mm | Slope: ${parameters.slope.toFixed(3)}%</p>
      </div>
      <img src="${imgData}" class="profile-image" alt="Civil Survey Profile">
      <div class="footer">
        <p>Surveyor: ${surveyorInfo.name} | ${surveyorInfo.title} | ${surveyorInfo.phone}</p>
        <p>Generated: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
}

function saveProfileImage() {
  const canvas = document.getElementById('profileCanvas');
  if (!canvas) return;
  
  try {
    const link = document.createElement('a');
    link.download = `${parameters.sectionName.replace(/[^a-zA-Z0-9]/g, '_')}_Profile.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showNotification('Profile image saved successfully', 'success');
  } catch (error) {
    console.error('Error saving profile image:', error);
    showNotification('Error saving profile image', 'error');
  }
}

function renderStructuresTable() {
  return structures.map(structure => {
    const excavationDepth = ((structure.invert - structure.excavation) * 100).toFixed(0);
    return `
    <tr>
      <td><input type="number" class="structure-input" value="${structure.station}" step="0.001" onchange="updateStructure(${structure.id}, 'station', this.value)"></td>
      <td>
        <select class="structure-select" onchange="updateStructure(${structure.id}, 'type', this.value)">
          <option value="manhole" ${structure.type === 'manhole' ? 'selected' : ''}>Manhole</option>
          <option value="ic_chamber" ${structure.type === 'ic_chamber' ? 'selected' : ''}>IC Chamber</option>
        </select>
      </td>
      <td><input type="text" class="structure-input structure-name" value="${structure.name}" onchange="updateStructure(${structure.id}, 'name', this.value)"></td>
      <td><input type="color" class="structure-input" value="${structure.color}" onchange="updateStructure(${structure.id}, 'color', this.value)"></td>
      <td><input type="number" class="structure-input" value="${structure.invert}" step="0.001" onchange="updateStructure(${structure.id}, 'invert', this.value)"></td>
      <td><input type="number" class="structure-input" value="${structure.coverLevel}" step="0.001" onchange="updateStructure(${structure.id}, 'coverLevel', this.value)"></td>
      <td><input type="number" class="structure-input" value="${structure.excavation}" step="0.001" onchange="updateStructure(${structure.id}, 'excavation', this.value)"></td>
      <td><span class="excavation-depth">${excavationDepth} cm</span></td>
      <td>${getStructureVisual(structure)}</td>
      <td><button class="delete-structure-btn" onclick="deleteStructure(${structure.id})">Delete</button></td>
    </tr>
  `}).join('');
}

function getStructureVisual(structure) {
  const color = structure.color;
  if (structure.type === 'manhole') {
    return `
      <div style="display: flex; align-items: center; justify-content: center;">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="18" fill="${color}" stroke="#333" stroke-width="2"/>
          <circle cx="20" cy="20" r="12" fill="none" stroke="white" stroke-width="2"/>
          <circle cx="20" cy="20" r="6" fill="white"/>
          <text x="20" y="25" text-anchor="middle" fill="white" font-size="8" font-weight="bold">MH</text>
        </svg>
      </div>
    `;
  } else {
    return `
      <div style="display: flex; align-items: center; justify-content: center;">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <rect x="4" y="4" width="32" height="32" fill="${color}" stroke="#333" stroke-width="2" rx="4"/>
          <rect x="8" y="8" width="24" height="24" fill="none" stroke="white" stroke-width="2" rx="2"/>
          <rect x="12" y="12" width="16" height="16" fill="white" rx="2"/>
          <text x="20" y="25" text-anchor="middle" fill="${color}" font-size="6" font-weight="bold">IC</text>
        </svg>
      </div>
    `;
  }
}

function addStructure() {
  const newStructure = {
    id: nextStructureId++,
    station: 0,
    type: 'manhole',
    name: `New Structure ${nextStructureId - 1}`,
    invert: 600.000,
    coverLevel: 602.000,
    excavation: 599.500, // Default 50cm below invert for manhole
    color: '#2563eb'
  };
  
  structures.push(newStructure);
  refreshStructuresTable();
  showNotification('Structure added successfully', 'success');
}

function updateStructure(id, field, value) {
  const structure = structures.find(s => s.id === id);
  if (structure) {
    if (field === 'station' || field === 'invert' || field === 'excavation' || field === 'coverLevel') {
      structure[field] = parseFloat(value);
      
      // Auto-calculate excavation when invert changes
      if (field === 'invert') {
        const defaultDepth = structure.type === 'manhole' ? parameters.excavationDepthManhole / 100 : parameters.excavationDepthIC / 100;
        structure.excavation = structure.invert - defaultDepth;
      }
      
      // Auto-calculate excavation when type changes
      if (field === 'type') {
        structure[field] = value;
        const defaultDepth = value === 'manhole' ? parameters.excavationDepthManhole / 100 : parameters.excavationDepthIC / 100;
        structure.excavation = structure.invert - defaultDepth;
      }
    } else {
      structure[field] = value;
    }
    
    if (field === 'station' || field === 'name') {
      updateSectionName();
    }
    
    // Refresh the table to show updated excavation depth
    refreshStructuresTable();
    
    // Refresh profile if visible
    if (currentTab === 'profile') {
      drawCivilProfile();
    }
    
    showNotification('Structure updated', 'info');
  }
}

function deleteStructure(id) {
  if (structures.length <= 2) {
    showNotification('Cannot delete - minimum 2 structures required', 'error');
    return;
  }
  
  structures = structures.filter(s => s.id !== id);
  refreshStructuresTable();
  updateSectionName();
  
  // Refresh profile if visible
  if (currentTab === 'profile') {
    drawCivilProfile();
  }
  
  showNotification('Structure deleted', 'success');
}

function sortStructures() {
  structures.sort((a, b) => a.station - b.station);
  refreshStructuresTable();
  updateSectionName();
  
  // Refresh profile if visible
  if (currentTab === 'profile') {
    drawCivilProfile();
  }
  
  showNotification('Structures sorted by station', 'success');
}

function updateSectionName() {
  if (structures.length >= 2) {
    const sortedStructures = [...structures].sort((a, b) => a.station - b.station);
    const firstStructure = sortedStructures[0];
    const lastStructure = sortedStructures[sortedStructures.length - 1];
    
    parameters.sectionName = `${firstStructure.name} - ${lastStructure.name}`;
    parameters.startInvert = firstStructure.invert;
    parameters.endInvert = lastStructure.invert;
    
    // Update the display
    const sectionNameInput = document.getElementById('sectionName');
    if (sectionNameInput) {
      sectionNameInput.value = parameters.sectionName;
    }
    
    const sectionNameDisplay = document.querySelector('.section-name-display');
    if (sectionNameDisplay) {
      sectionNameDisplay.textContent = parameters.sectionName;
    }
    
    recalculateParameters();
  }
}

function refreshStructuresTable() {
  const tbody = document.getElementById('structuresTableBody');
  if (tbody) {
    tbody.innerHTML = renderStructuresTable();
  }
}

function updateParameters() {
  // Get current values from inputs
  parameters.startInvert = parseFloat(document.getElementById('startInvert').value) || 0;
  parameters.endInvert = parseFloat(document.getElementById('endInvert').value) || 0;
  parameters.pipeSize = parseFloat(document.getElementById('pipeSize').value) || 200;
  parameters.totalLength = parseFloat(document.getElementById('totalLength').value) || 0;
  parameters.stationInterval = parseFloat(document.getElementById('stationInterval').value) || 3;
  parameters.excavationDepthManhole = parseFloat(document.getElementById('excavationDepthManhole').value) || 50;
  parameters.excavationDepthIC = parseFloat(document.getElementById('excavationDepthIC').value) || 35;
  parameters.invertAtStation = parseFloat(document.getElementById('invertAtStation').value) || 0;
  parameters.excavationLevel = parseFloat(document.getElementById('excavationLevel').value) || 0;

  recalculateParameters();
}

function recalculateParameters() {
  // Calculate slope
  if (parameters.totalLength > 0) {
    parameters.slope = ((parameters.startInvert - parameters.endInvert) / parameters.totalLength) * 100;
  } else {
    parameters.slope = 0;
  }
  
  // Calculate cumulative drop
  const currentStation = parameters.invertAtStation;
  parameters.cumulativeDrop = (currentStation - 0) * (parameters.slope / 100);
  
  // Calculate top of pipe
  parameters.topOfPipe = parameters.invertAtStation + (parameters.pipeSize / 1000);
  
  // Calculate readings (assuming ground level of 602m for demonstration)
  const groundLevel = 602;
  parameters.excavationReading = groundLevel - parameters.excavationLevel;
  parameters.topOfPipeReading = groundLevel - parameters.topOfPipe;

  // Update input fields
  updateInputFields();
  
  // Refresh analysis table if visible
  if (currentTab === 'table') {
    refreshAnalysisTable();
  }
  
  // Refresh profile if visible
  if (currentTab === 'profile') {
    drawCivilProfile();
  }
}

function updateInputFields() {
  const fields = [
    'slope', 'cumulativeDrop', 'topOfPipe', 
    'excavationReading', 'topOfPipeReading', 'startInvert', 
    'endInvert', 'stationInterval', 'excavationDepthManhole', 'excavationDepthIC'
  ];
  
  fields.forEach(field => {
    const input = document.getElementById(field);
    if (input) {
      input.value = parameters[field].toFixed(3);
    }
  });
}

function generateAnalysisTable() {
  const rows = [];
  const step = parameters.stationInterval; // User-defined interval
  const groundLevel = 602; // Assumed ground level
  
  for (let station = 0; station <= parameters.totalLength; station += step) {
    // Calculate invert at this station
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    
    // Calculate other values
    const topOfPipe = invertAtStation + (parameters.pipeSize / 1000);
    const topPipeReading = groundLevel - topOfPipe;
    const cumulativeDrop = drop;
    const excavationLevel = invertAtStation - 0.2; // 20cm below invert
    const excavationReading = groundLevel - excavationLevel;
    
    // Check if there's a structure at this station
    const structure = structures.find(s => Math.abs(s.station - station) < 0.1);
    const structureName = structure ? structure.name : '-';
    const structureInvert = structure ? structure.invert.toFixed(3) : '-';
    const structureCover = structure ? structure.coverLevel.toFixed(3) : '-';
    const structureExcavation = structure ? structure.excavation.toFixed(3) : '-';
    const structureReading = structure ? (groundLevel - structure.excavation).toFixed(3) : '-';
    
    rows.push(`
      <tr>
        <td>${station.toFixed(3)}</td>
        <td>${parameters.startInvert.toFixed(3)}</td>
        <td>${parameters.endInvert.toFixed(3)}</td>
        <td>${topOfPipe.toFixed(3)}</td>
        <td>${topPipeReading.toFixed(3)}</td>
        <td>${invertAtStation.toFixed(3)}</td>
        <td>${cumulativeDrop.toFixed(3)}</td>
        <td>${parameters.totalLength.toFixed(3)}</td>
        <td>${excavationLevel.toFixed(3)}</td>
        <td>${excavationReading.toFixed(3)}</td>
        <td style="color: ${structure ? structure.color : '#374151'}; font-weight: ${structure ? 'bold' : 'normal'}">${structureName}</td>
        <td>${structureInvert}</td>
        <td>${structureCover}</td>
        <td>${structureExcavation}</td>
        <td>${structureReading}</td>
      </tr>
    `);
  }
  
  return rows.join('');
}

function refreshAnalysisTable() {
  const tbody = document.getElementById('analysisTableBody');
  if (tbody) {
    tbody.innerHTML = generateAnalysisTable();
  }
}

function saveRecord() {
  const record = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    sectionName: parameters.sectionName,
    parameters: { ...parameters },
    structures: [...structures],
    surveyor: { ...surveyorInfo }
  };
  
  savedRecords.unshift(record);
  localStorage.setItem('pipeCalculatorRecords', JSON.stringify(savedRecords));
  
  // Refresh saved records display
  const recordsList = document.getElementById('savedRecordsList');
  if (recordsList) {
    recordsList.innerHTML = renderSavedRecords();
  }
  
  showNotification('Record saved successfully', 'success');
}

function renderSavedRecords() {
  if (savedRecords.length === 0) {
    return '<p style="text-align: center; color: #64748b; font-style: italic;">No saved records yet</p>';
  }
  
  return savedRecords.map(record => `
    <div class="saved-record-item">
      <div class="saved-record-info">
        <h4>${record.sectionName}</h4>
        <div class="saved-record-details">
          <span>Length: ${record.parameters.totalLength}m</span>
          <span>Slope: ${record.parameters.slope.toFixed(2)}%</span>
          <span>Pipe: ${record.parameters.pipeSize}mm</span>
        </div>
        <div class="saved-record-timestamp">Saved: ${record.timestamp}</div>
        <div class="saved-record-surveyor">Surveyor: ${record.surveyor.name}</div>
      </div>
      <div class="saved-record-actions">
        <button class="load-btn" onclick="loadRecord(${record.id})">Load</button>
        <button class="delete-btn" onclick="deleteRecord(${record.id})">Delete</button>
        <button class="print-btn" onclick="printRecord(${record.id})">Print</button>
      </div>
    </div>
  `).join('');
}

function loadRecord(id) {
  const record = savedRecords.find(r => r.id === id);
  if (record) {
    parameters = { ...record.parameters };
    structures = [...record.structures];
    
    // Update displays
    initializeApp();
    showNotification('Record loaded successfully', 'success');
  }
}

function deleteRecord(id) {
  savedRecords = savedRecords.filter(r => r.id !== id);
  localStorage.setItem('pipeCalculatorRecords', JSON.stringify(savedRecords));
  
  const recordsList = document.getElementById('savedRecordsList');
  if (recordsList) {
    recordsList.innerHTML = renderSavedRecords();
  }
  
  showNotification('Record deleted', 'success');
}

function printRecord(id) {
  const record = savedRecords.find(r => r.id === id);
  if (record) {
    // Create a temporary print window with the record data
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML(record));
    printWindow.document.close();
    printWindow.print();
  }
}

function printReport() {
  const currentRecord = {
    sectionName: parameters.sectionName,
    parameters: { ...parameters },
    structures: [...structures],
    surveyor: { ...surveyorInfo },
    timestamp: new Date().toLocaleString()
  };
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(generatePrintHTML(currentRecord));
  printWindow.document.close();
  printWindow.print();
}

function generateProfessionalReport() {
  const currentRecord = {
    sectionName: parameters.sectionName,
    parameters: { ...parameters },
    structures: [...structures],
    surveyor: { ...surveyorInfo },
    timestamp: new Date().toLocaleString()
  };
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(generateProfessionalReportHTML(currentRecord));
  printWindow.document.close();
  printWindow.print();
}

function generateProfessionalReportHTML(record) {
  const groundLevel = 602; // Assumed ground level
  
  // Generate detailed station analysis
  const stationAnalysis = [];
  const step = record.parameters.stationInterval; // User-defined interval
  
  for (let station = 0; station <= record.parameters.totalLength; station += step) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (record.parameters.slope / 100);
    const invertAtStation = record.parameters.startInvert - drop;
    const topOfPipe = invertAtStation + (record.parameters.pipeSize / 1000);
    const excavationLevel = invertAtStation - 0.2;
    
    // Check for structures
    const structure = record.structures.find(s => Math.abs(s.station - station) < 0.1);
    
    stationAnalysis.push({
      station: station.toFixed(3),
      invert: invertAtStation.toFixed(3),
      topOfPipe: topOfPipe.toFixed(3),
      excavation: excavationLevel.toFixed(3),
      drop: drop.toFixed(3),
      structure: structure || null
    });
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Professional Civil Survey Report - Pipe & Infrastructure Analysis</title>
      <style>
        @page {
          margin: 1.5cm;
          size: A4;
        }
        
        body { 
          font-family: 'Times New Roman', serif; 
          margin: 0; 
          padding: 0;
          line-height: 1.5;
          color: #000;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 4px solid #1e40af;
          padding-bottom: 25px;
          margin-bottom: 35px;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 30px;
          border-radius: 12px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: bold;
          color: #1e40af;
          margin: 0 0 15px 0;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 2px 2px 4px rgba(30, 64, 175, 0.1);
        }
        
        .header h2 {
          font-size: 20px;
          color: #374151;
          margin: 10px 0;
          font-weight: normal;
          font-style: italic;
        }
        
        .header .project-title {
          font-size: 22px;
          color: #dc2626;
          font-weight: bold;
          margin: 15px 0 10px 0;
          padding: 10px;
          background: white;
          border-radius: 8px;
          border: 2px solid #dc2626;
        }
        
        .project-info {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 3px solid #0ea5e9;
          padding: 25px;
          margin-bottom: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .project-info h3 {
          color: #0c4a6e;
          margin: 0 0 20px 0;
          font-size: 18px;
          border-bottom: 2px solid #0ea5e9;
          padding-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px dotted #0ea5e9;
        }
        
        .info-label {
          font-weight: bold;
          color: #374151;
          font-size: 14px;
        }
        
        .info-value {
          color: #0c4a6e;
          font-weight: bold;
          font-size: 14px;
        }
        
        .section {
          margin-bottom: 35px;
          page-break-inside: avoid;
        }
        
        .section h3 {
          color: #1e40af;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 20px 0;
          padding: 15px;
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-left: 6px solid #1e40af;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 0 8px 8px 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 25px;
          font-size: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }
        
        th {
          background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
          color: white;
          padding: 12px 8px;
          text-align: center;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        td {
          border: 1px solid #cbd5e1;
          padding: 10px 8px;
          text-align: center;
          font-weight: 500;
        }
        
        tbody tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        tbody tr:hover {
          background-color: #e0f2fe;
        }
        
        .structure-row {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
          font-weight: bold;
          border: 2px solid #f59e0b;
        }
        
        .calculations {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 3px solid #10b981;
          padding: 20px;
          margin: 25px 0;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .calculations h4 {
          color: #047857;
          margin: 0 0 15px 0;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .formula {
          font-family: 'Courier New', monospace;
          background: white;
          padding: 12px;
          border-radius: 6px;
          margin: 8px 0;
          border-left: 4px solid #10b981;
          font-size: 13px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .surveyor-section {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 3px solid #e2e8f0;
          display: grid;
          grid-template-columns: 1fr 250px;
          gap: 40px;
          background: linear-gradient(135deg, #fafafa 0%, #f4f4f5 100%);
          padding: 30px;
          border-radius: 12px;
        }
        
        .surveyor-info h4 {
          color: #1e40af;
          margin: 0 0 20px 0;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid #1e40af;
          padding-bottom: 8px;
        }
        
        .surveyor-details {
          line-height: 2;
          font-size: 14px;
        }
        
        .surveyor-details p {
          margin: 8px 0;
          padding: 5px 0;
          border-bottom: 1px dotted #cbd5e1;
        }
        
        .signature-area {
          text-align: center;
        }
        
        .signature-area h4 {
          margin-bottom: 15px;
          color: #374151;
          font-size: 14px;
        }
        
        .signature-box {
          border: 3px solid #cbd5e1;
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .signature-img {
          max-width: 220px;
          max-height: 90px;
        }
        
        .signature-line {
          border-top: 2px solid #000;
          margin-top: 25px;
          padding-top: 8px;
          font-size: 13px;
          text-align: center;
          font-weight: bold;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
          border-top: 2px solid #e5e7eb;
          padding-top: 20px;
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
        }
        
        .page-break {
          page-break-before: always;
        }
        
        .highlight {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: bold;
          border: 1px solid #f59e0b;
        }
        
        .critical {
          color: #dc2626;
          font-weight: bold;
        }
        
        .success {
          color: #059669;
          font-weight: bold;
        }
        
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: rgba(30, 64, 175, 0.05);
          z-index: -1;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="watermark">PROFESSIONAL SURVEY</div>
      
      <div class="header">
        <h1>Professional Civil Survey Report</h1>
        <h2>Comprehensive Pipe & Infrastructure Analysis</h2>
        <div class="project-title">${record.sectionName}</div>
        <p><strong>Report Generated:</strong> ${record.timestamp}</p>
      </div>
      
      <div class="project-info">
        <h3>Project Overview & Technical Specifications</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Total Pipeline Length:</span>
            <span class="info-value">${record.parameters.totalLength.toFixed(3)} m</span>
          </div>
          <div class="info-item">
            <span class="info-label">Pipe Diameter:</span>
            <span class="info-value">${record.parameters.pipeSize} mm</span>
          </div>
          <div class="info-item">
            <span class="info-label">Pipeline Gradient:</span>
            <span class="info-value ${record.parameters.slope > 2 ? 'critical' : 'success'}">${record.parameters.slope.toFixed(3)}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">Start Invert Level:</span>
            <span class="info-value">${record.parameters.startInvert.toFixed(3)} m</span>
          </div>
          <div class="info-item">
            <span class="info-label">End Invert Level:</span>
            <span class="info-value">${record.parameters.endInvert.toFixed(3)} m</span>
          </div>
          <div class="info-item">
            <span class="info-label">Total Elevation Drop:</span>
            <span class="info-value">${(record.parameters.startInvert - record.parameters.endInvert).toFixed(3)} m</span>
          </div>
          <div class="info-item">
            <span class="info-label">Analysis Interval:</span>
            <span class="info-value">${record.parameters.stationInterval}m Intervals</span>
          </div>
          <div class="info-item">
            <span class="info-label">Manhole Excavation Depth:</span>
            <span class="info-value">${record.parameters.excavationDepthManhole} cm</span>
          </div>
        </div>
      </div>

      <div class="calculations">
        <h4>Engineering Calculations & Formulas</h4>
        <div class="formula">
          <strong>Pipeline Gradient:</strong> Slope (%) = ((Start Invert - End Invert) / Total Length) × 100
        </div>
        <div class="formula">
          <strong>Invert at Station:</strong> Invert = Start Invert - (Distance × Slope/100)
        </div>
        <div class="formula">
          <strong>Top of Pipe:</strong> Top = Invert + (Pipe Diameter / 1000)
        </div>
        <div class="formula">
          <strong>Excavation Depth:</strong> Depth = Invert Level - Excavation Level
        </div>
      </div>
      
      <div class="section">
        <h3>Infrastructure Inventory & Specifications</h3>
        <table>
          <thead>
            <tr>
              <th>Station<br/>(m)</th>
              <th>Structure<br/>Type</th>
              <th>Structure<br/>Name</th>
              <th>Invert Level<br/>(m)</th>
              <th>Cover Level<br/>(m)</th>
              <th>Excavation Level<br/>(m)</th>
              <th>Excavation Depth<br/>(cm)</th>
              <th>Cover Depth<br/>(m)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${record.structures.map(s => {
              const coverDepth = (s.coverLevel - s.invert).toFixed(3);
              const excavationDepth = ((s.invert - s.excavation) * 100).toFixed(0);
              return `
                <tr class="structure-row">
                  <td>${s.station.toFixed(3)}</td>
                  <td>${s.type.replace('_', ' ').toUpperCase()}</td>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.invert.toFixed(3)}</td>
                  <td>${s.coverLevel.toFixed(3)}</td>
                  <td>${s.excavation.toFixed(3)}</td>
                  <td class="highlight">${excavationDepth}</td>
                  <td>${coverDepth}</td>
                  <td class="success">✓ SURVEYED</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="page-break"></div>
      
      <div class="section">
        <h3>Detailed Station Analysis (${record.parameters.stationInterval}m Intervals)</h3>
        <table>
          <thead>
            <tr>
              <th>Station<br/>(m)</th>
              <th>Invert Level<br/>(m)</th>
              <th>Top of Pipe<br/>(m)</th>
              <th>Excavation Level<br/>(m)</th>
              <th>Cumulative Drop<br/>(m)</th>
              <th>Structure</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${stationAnalysis.map(analysis => {
              return `
                <tr ${analysis.structure ? 'class="structure-row"' : ''}>
                  <td>${analysis.station}</td>
                  <td>${analysis.invert}</td>
                  <td>${analysis.topOfPipe}</td>
                  <td>${analysis.excavation}</td>
                  <td>${analysis.drop}</td>
                  <td>${analysis.structure ? `<strong>${analysis.structure.name}</strong>` : '-'}</td>
                  <td>${analysis.structure ? 'STRUCTURE POINT' : 'PIPELINE'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="surveyor-section">
        <div class="surveyor-info">
          <h4>Professional Certification</h4>
          <div class="surveyor-details">
            <p><strong>Surveyor:</strong> ${record.surveyor.name}</p>
            <p><strong>Title:</strong> ${record.surveyor.title}</p>
            <p><strong>Contact:</strong> ${record.surveyor.phone}</p>
            <p><strong>Survey Date:</strong> ${record.timestamp}</p>
            <p><strong>Report Status:</strong> <span class="success">CERTIFIED</span></p>
          </div>
        </div>
        <div class="signature-area">
          <h4>Digital Signature</h4>
          <div class="signature-box">
            ${record.surveyor.signature ? 
              `<img src="${record.surveyor.signature}" class="signature-img" alt="Professional Signature">` : 
              '<span style="color: #6b7280;">Digital signature required</span>'
            }
          </div>
          <div class="signature-line">
            ${record.surveyor.name}<br/>
            ${record.surveyor.title}
          </div>
        </div>
      </div>

      <div class="footer">
        <p><strong>PROFESSIONAL CIVIL SURVEY REPORT</strong></p>
        <p>This report contains confidential and proprietary information. Distribution is restricted to authorized personnel only.</p>
        <p>Generated by Professional Pipe & Excavation Calculator System | ${record.timestamp}</p>
        <p><strong>Surveyor:</strong> ${record.surveyor.name} | <strong>Phone:</strong> ${record.surveyor.phone}</p>
      </div>
    </body>
    </html>
  `;
}

function generatePrintHTML(record) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Pipe & Excavation Analysis Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .signature { margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>DETAILED PIPE & EXCAVATION ANALYSIS WITH INFRASTRUCTURE DATA</h1>
        <p><strong>Section:</strong> ${record.sectionName}</p>
        <p><strong>Generated:</strong> ${record.timestamp}</p>
      </div>
      
      <div class="section">
        <h3>Project Parameters</h3>
        <table>
          <tr><td>Total Length</td><td>${record.parameters.totalLength}m</td></tr>
          <tr><td>Pipe Size</td><td>${record.parameters.pipeSize}mm</td></tr>
          <tr><td>Slope</td><td>${record.parameters.slope.toFixed(3)}%</td></tr>
          <tr><td>Start Invert</td><td>${record.parameters.startInvert}m</td></tr>
          <tr><td>End Invert</td><td>${record.parameters.endInvert}m</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h3>Project Structures</h3>
        <table>
          <tr>
            <th>Station</th>
            <th>Type</th>
            <th>Name</th>
            <th>Invert</th>
            <th>Cover Level</th>
            <th>Excavation</th>
            <th>Excavation Depth</th>
          </tr>
          ${record.structures.map(s => `
            <tr>
              <td>${s.station}m</td>
              <td>${s.type.replace('_', ' ').toUpperCase()}</td>
              <td>${s.name}</td>
              <td>${s.invert}m</td>
              <td>${s.coverLevel}m</td>
              <td>${s.excavation}m</td>
              <td>${((s.invert - s.excavation) * 100).toFixed(0)}cm</td>
            </tr>
          `).join('')}
        </table>
      </div>
      
      <div class="signature">
        <p><strong>Surveyor:</strong> ${record.surveyor.name}</p>
        <p><strong>Title:</strong> ${record.surveyor.title}</p>
        <p><strong>Phone:</strong> ${record.surveyor.phone}</p>
        ${record.surveyor.signature ? `<img src="${record.surveyor.signature}" style="max-width: 200px; border: 1px solid #ccc;">` : ''}
      </div>
    </body>
    </html>
  `;
}

// Signature canvas functionality
let signatureCanvas, signatureCtx, isDrawing = false;

function initializeSignatureCanvas() {
  signatureCanvas = document.getElementById('signatureCanvas');
  if (signatureCanvas) {
    signatureCtx = signatureCanvas.getContext('2d');
    
    // Mouse events
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events
    signatureCanvas.addEventListener('touchstart', handleTouch);
    signatureCanvas.addEventListener('touchmove', handleTouch);
    signatureCanvas.addEventListener('touchend', stopDrawing);
    
    // Set up canvas
    signatureCtx.strokeStyle = '#000';
    signatureCtx.lineWidth = 2;
    signatureCtx.lineCap = 'round';
  }
}

function startDrawing(e) {
  isDrawing = true;
  const rect = signatureCanvas.getBoundingClientRect();
  signatureCtx.beginPath();
  signatureCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;
  const rect = signatureCanvas.getBoundingClientRect();
  signatureCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  signatureCtx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

function handleTouch(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                   e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  signatureCanvas.dispatchEvent(mouseEvent);
}

function clearSignature() {
  signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
}

function saveSignature() {
  const signatureData = signatureCanvas.toDataURL();
  surveyorInfo.signature = signatureData;
  localStorage.setItem('surveyorSignature', signatureData);
  
  // Refresh the signature preview
  initializeApp();
  showNotification('Signature saved successfully', 'success');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Global functions for onclick handlers
window.recalculateParameters = recalculateParameters;
window.saveRecord = saveRecord;
window.printReport = printReport;
window.generateProfessionalReport = generateProfessionalReport;
window.loadRecord = loadRecord;
window.deleteRecord = deleteRecord;
window.printRecord = printRecord;
window.addStructure = addStructure;
window.updateStructure = updateStructure;
window.deleteStructure = deleteStructure;
window.sortStructures = sortStructures;
window.updateSectionName = updateSectionName;
window.clearSignature = clearSignature;
window.saveSignature = saveSignature;
window.exportToCAD = exportToCAD;
window.printProfile = printProfile;
window.saveProfileImage = saveProfileImage;