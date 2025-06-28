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
              <h1>Civil Survey Profile Drawing</h1>
              <p>Professional Pipeline Cross-Section with Accurate Dimensions</p>
              <div class="profile-project-info">
                <span>Section: ${parameters.sectionName}</span>
                <span>Length: ${parameters.totalLength}m</span>
                <span>Pipe: Ø${parameters.pipeSize}mm</span>
                <span>Slope: ${parameters.slope.toFixed(3)}%</span>
                <span>Interval: ${parameters.stationInterval}m</span>
              </div>
            </div>
            <div class="profile-surveyor-info">
              <div class="surveyor-badge">
                <div class="surveyor-name">${surveyorInfo.name}</div>
                <div class="surveyor-title">${surveyorInfo.title}</div>
                <div class="surveyor-contact">📞 ${surveyorInfo.phone}</div>
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
                  <span><strong>Ground Level</strong> - Structure Cover Levels</span>
                </div>
                <div class="legend-item">
                  <div class="legend-symbol pipe-line"></div>
                  <span><strong>Pipe Invert</strong> - Bottom of Pipe (Ø${parameters.pipeSize}mm)</span>
                </div>
                <div class="legend-item">
                  <div class="legend-symbol" style="background: #dc2626; height: 8px;"></div>
                  <span><strong>Pipe Body</strong> - Full Pipe Thickness</span>
                </div>
                <div class="legend-item">
                  <div class="legend-symbol excavation-line"></div>
                  <span><strong>Excavation Level</strong> - Excavation Boundaries</span>
                </div>
                <div class="legend-item">
                  <div class="manhole-symbol"></div>
                  <span><strong>Manhole</strong> - Access Structure</span>
                </div>
                <div class="legend-item">
                  <div class="ic-symbol"></div>
                  <span><strong>IC Chamber</strong> - Inspection Chamber</span>
                </div>
              </div>
            </div>
            
            <div class="profile-specifications">
              <h3>Technical Specifications</h3>
              <div class="spec-grid">
                <div class="spec-item">
                  <span>Pipeline Gradient:</span>
                  <span>${parameters.slope.toFixed(3)}%</span>
                </div>
                <div class="spec-item">
                  <span>Pipe Diameter:</span>
                  <span>Ø${parameters.pipeSize}mm</span>
                </div>
                <div class="spec-item">
                  <span>Total Drop:</span>
                  <span>${(parameters.startInvert - parameters.endInvert).toFixed(3)}m</span>
                </div>
                <div class="spec-item">
                  <span>Start Invert:</span>
                  <span>${parameters.startInvert.toFixed(3)}m</span>
                </div>
                <div class="spec-item">
                  <span>End Invert:</span>
                  <span>${parameters.endInvert.toFixed(3)}m</span>
                </div>
                <div class="spec-item">
                  <span>Analysis Interval:</span>
                  <span>${parameters.stationInterval}m</span>
                </div>
              </div>
            </div>
          </div>

          <div class="profile-actions">
            <button class="profile-action-btn primary" onclick="printProfile()">
              <span class="btn-icon">🖨️</span>
              Print Profile
            </button>
            <button class="profile-action-btn secondary" onclick="exportProfile()">
              <span class="btn-icon">💾</span>
              Export PNG
            </button>
            <button class="profile-action-btn tertiary" onclick="refreshProfile()">
              <span class="btn-icon">🔄</span>
              Refresh Drawing
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
    setTimeout(() => drawProfile(), 100); // Small delay to ensure canvas is rendered
  }
}

function drawProfile() {
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
  
  // Calculate elevation range using structure cover levels as ground
  const sortedStructures = [...structures].sort((a, b) => a.station - b.station);
  const minGroundLevel = Math.min(...sortedStructures.map(s => s.coverLevel));
  const maxGroundLevel = Math.max(...sortedStructures.map(s => s.coverLevel));
  
  // Calculate excavation levels
  const excavationLevels = [];
  for (let station = 0; station <= parameters.totalLength; station += parameters.stationInterval) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const excavationLevel = invertAtStation - 0.2; // 20cm below invert
    excavationLevels.push(excavationLevel);
  }
  
  const minExcavation = Math.min(...excavationLevels);
  const minElevation = Math.min(minExcavation, Math.min(...structures.map(s => s.excavation))) - 0.5;
  const maxElevation = Math.max(maxGroundLevel, Math.max(...structures.map(s => s.coverLevel))) + 0.5;
  
  const elevationRange = maxElevation - minElevation;
  
  // Scale functions
  const scaleX = (station) => margin + (station / parameters.totalLength) * drawWidth;
  const scaleY = (elevation) => margin + ((maxElevation - elevation) / elevationRange) * drawHeight;
  
  // Draw grid
  drawGrid(ctx, margin, drawWidth, drawHeight, minElevation, maxElevation, parameters.totalLength);
  
  // Draw ground level line (interpolated between structure cover levels)
  drawGroundLevel(ctx, sortedStructures, scaleX, scaleY);
  
  // Draw excavation area with thickness
  drawExcavationArea(ctx, scaleX, scaleY, minElevation, maxElevation);
  
  // Draw pipe with actual thickness
  drawPipeWithThickness(ctx, scaleX, scaleY);
  
  // Draw structures
  drawStructures(ctx, sortedStructures, scaleX, scaleY);
  
  // Draw annotations
  drawAnnotations(ctx, scaleX, scaleY, minElevation, maxElevation);
}

function drawGrid(ctx, margin, drawWidth, drawHeight, minElevation, maxElevation, totalLength) {
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#64748b';
  
  // Vertical grid lines (stations)
  const stationStep = parameters.stationInterval;
  for (let station = 0; station <= totalLength; station += stationStep) {
    const x = margin + (station / totalLength) * drawWidth;
    
    // Grid line
    ctx.beginPath();
    ctx.moveTo(x, margin);
    ctx.lineTo(x, margin + drawHeight);
    ctx.stroke();
    
    // Station label
    ctx.fillText(`${station}m`, x - 15, margin + drawHeight + 20);
  }
  
  // Horizontal grid lines (elevations)
  const elevationRange = maxElevation - minElevation;
  const elevationStep = Math.max(0.5, Math.round(elevationRange / 10 * 2) / 2); // Round to nearest 0.5m
  
  for (let elev = Math.ceil(minElevation / elevationStep) * elevationStep; elev <= maxElevation; elev += elevationStep) {
    const y = margin + ((maxElevation - elev) / elevationRange) * drawHeight;
    
    // Grid line
    ctx.beginPath();
    ctx.moveTo(margin, y);
    ctx.lineTo(margin + drawWidth, y);
    ctx.stroke();
    
    // Elevation label
    ctx.fillText(`${elev.toFixed(1)}m`, 10, y + 4);
  }
  
  // Draw border
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, drawWidth, drawHeight);
}

function drawGroundLevel(ctx, sortedStructures, scaleX, scaleY) {
  if (sortedStructures.length < 2) return;
  
  ctx.strokeStyle = '#8b5cf6';
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
  
  ctx.beginPath();
  
  // Interpolate ground level between structures
  for (let station = 0; station <= parameters.totalLength; station += 1) {
    let groundLevel;
    
    // Find the two structures that bracket this station
    const beforeStructure = sortedStructures.filter(s => s.station <= station).pop();
    const afterStructure = sortedStructures.find(s => s.station > station);
    
    if (!beforeStructure) {
      groundLevel = sortedStructures[0].coverLevel;
    } else if (!afterStructure) {
      groundLevel = sortedStructures[sortedStructures.length - 1].coverLevel;
    } else {
      // Linear interpolation between structures
      const ratio = (station - beforeStructure.station) / (afterStructure.station - beforeStructure.station);
      groundLevel = beforeStructure.coverLevel + ratio * (afterStructure.coverLevel - beforeStructure.coverLevel);
    }
    
    const x = scaleX(station);
    const y = scaleY(groundLevel);
    
    if (station === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
}

function drawExcavationArea(ctx, scaleX, scaleY, minElevation, maxElevation) {
  // Draw excavation area as filled polygon
  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  // Calculate excavation points
  const excavationPoints = [];
  const groundPoints = [];
  
  for (let station = 0; station <= parameters.totalLength; station += 1) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const excavationLevel = invertAtStation - 0.2; // 20cm below invert
    
    // Ground level interpolation
    const sortedStructures = [...structures].sort((a, b) => a.station - b.station);
    const beforeStructure = sortedStructures.filter(s => s.station <= station).pop();
    const afterStructure = sortedStructures.find(s => s.station > station);
    
    let groundLevel;
    if (!beforeStructure) {
      groundLevel = sortedStructures[0].coverLevel;
    } else if (!afterStructure) {
      groundLevel = sortedStructures[sortedStructures.length - 1].coverLevel;
    } else {
      const ratio = (station - beforeStructure.station) / (afterStructure.station - beforeStructure.station);
      groundLevel = beforeStructure.coverLevel + ratio * (afterStructure.coverLevel - beforeStructure.coverLevel);
    }
    
    excavationPoints.push({ x: scaleX(station), y: scaleY(excavationLevel) });
    groundPoints.push({ x: scaleX(station), y: scaleY(groundLevel) });
  }
  
  // Fill excavation area
  ctx.beginPath();
  ctx.moveTo(excavationPoints[0].x, excavationPoints[0].y);
  
  // Draw excavation bottom
  for (let i = 1; i < excavationPoints.length; i++) {
    ctx.lineTo(excavationPoints[i].x, excavationPoints[i].y);
  }
  
  // Draw up to ground level
  for (let i = groundPoints.length - 1; i >= 0; i--) {
    ctx.lineTo(groundPoints[i].x, groundPoints[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Draw excavation boundary lines
  ctx.beginPath();
  ctx.moveTo(excavationPoints[0].x, excavationPoints[0].y);
  for (let i = 1; i < excavationPoints.length; i++) {
    ctx.lineTo(excavationPoints[i].x, excavationPoints[i].y);
  }
  ctx.stroke();
}

function drawPipeWithThickness(ctx, scaleX, scaleY) {
  const pipeRadius = parameters.pipeSize / 2000; // Convert mm to meters and get radius
  
  // Draw pipe as filled area showing actual thickness
  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 1;
  ctx.setLineDash([]);
  
  // Calculate pipe invert and top points
  const invertPoints = [];
  const topPoints = [];
  
  for (let station = 0; station <= parameters.totalLength; station += 1) {
    const distanceFromStart = station;
    const drop = distanceFromStart * (parameters.slope / 100);
    const invertAtStation = parameters.startInvert - drop;
    const topOfPipe = invertAtStation + (parameters.pipeSize / 1000);
    
    invertPoints.push({ x: scaleX(station), y: scaleY(invertAtStation) });
    topPoints.push({ x: scaleX(station), y: scaleY(topOfPipe) });
  }
  
  // Fill pipe body
  ctx.beginPath();
  ctx.moveTo(invertPoints[0].x, invertPoints[0].y);
  
  // Draw invert line
  for (let i = 1; i < invertPoints.length; i++) {
    ctx.lineTo(invertPoints[i].x, invertPoints[i].y);
  }
  
  // Draw to top of pipe
  for (let i = topPoints.length - 1; i >= 0; i--) {
    ctx.lineTo(topPoints[i].x, topPoints[i].y);
  }
  
  ctx.closePath();
  ctx.fill();
  
  // Draw pipe invert line (bottom)
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(invertPoints[0].x, invertPoints[0].y);
  for (let i = 1; i < invertPoints.length; i++) {
    ctx.lineTo(invertPoints[i].x, invertPoints[i].y);
  }
  ctx.stroke();
  
  // Draw pipe top line
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(topPoints[0].x, topPoints[0].y);
  for (let i = 1; i < topPoints.length; i++) {
    ctx.lineTo(topPoints[i].x, topPoints[i].y);
  }
  ctx.stroke();
}

function drawStructures(ctx, sortedStructures, scaleX, scaleY) {
  sortedStructures.forEach(structure => {
    const x = scaleX(structure.station);
    const groundY = scaleY(structure.coverLevel);
    const invertY = scaleY(structure.invert);
    const excavationY = scaleY(structure.excavation);
    
    // Draw structure shaft from ground to excavation
    ctx.fillStyle = structure.color + '40'; // Semi-transparent
    ctx.fillRect(x - 15, groundY, 30, excavationY - groundY);
    
    // Draw structure outline
    ctx.strokeStyle = structure.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 15, groundY, 30, excavationY - groundY);
    
    if (structure.type === 'manhole') {
      // Draw manhole symbol
      ctx.fillStyle = structure.color;
      ctx.beginPath();
      ctx.arc(x, groundY - 10, 12, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // MH text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('MH', x, groundY - 6);
    } else {
      // Draw IC chamber symbol
      ctx.fillStyle = structure.color;
      ctx.fillRect(x - 12, groundY - 20, 24, 15);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 12, groundY - 20, 24, 15);
      
      // IC text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('IC', x, groundY - 10);
    }
    
    // Structure name and elevation labels
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(structure.name, x, groundY - 30);
    
    ctx.font = '10px Arial';
    ctx.fillText(`GL: ${structure.coverLevel.toFixed(3)}m`, x, groundY - 45);
    ctx.fillText(`IL: ${structure.invert.toFixed(3)}m`, x, invertY - 5);
    ctx.fillText(`EL: ${structure.excavation.toFixed(3)}m`, x, excavationY + 15);
  });
}

function drawAnnotations(ctx, scaleX, scaleY, minElevation, maxElevation) {
  // Draw title and key information
  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${parameters.sectionName} - Profile Drawing`, scaleX(parameters.totalLength / 2), 30);
  
  ctx.font = '12px Arial';
  ctx.fillText(`Pipe: Ø${parameters.pipeSize}mm | Slope: ${parameters.slope.toFixed(3)}% | Length: ${parameters.totalLength}m`, 
               scaleX(parameters.totalLength / 2), 50);
  
  // Draw slope annotation on the pipe
  const midStation = parameters.totalLength / 2;
  const midX = scaleX(midStation);
  const drop = midStation * (parameters.slope / 100);
  const invertAtMid = parameters.startInvert - drop;
  const midY = scaleY(invertAtMid);
  
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 11px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${parameters.slope.toFixed(3)}%`, midX, midY - 10);
  
  // Draw station markers
  ctx.fillStyle = '#64748b';
  ctx.font = '10px Arial';
  for (let station = 0; station <= parameters.totalLength; station += parameters.stationInterval) {
    const x = scaleX(station);
    const y = scaleY(minElevation) + 40;
    ctx.textAlign = 'center';
    ctx.fillText(`${station}+000`, x, y);
  }
}

function refreshProfile() {
  if (currentTab === 'profile') {
    setTimeout(() => drawProfile(), 100);
  }
  showNotification('Profile drawing refreshed', 'success');
}

function printProfile() {
  const canvas = document.getElementById('profileCanvas');
  if (!canvas) return;
  
  const printWindow = window.open('', '_blank');
  const imgData = canvas.toDataURL();
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Civil Survey Profile - ${parameters.sectionName}</title>
      <style>
        body { margin: 0; padding: 20px; text-align: center; }
        img { max-width: 100%; height: auto; }
        .header { margin-bottom: 20px; }
        .footer { margin-top: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Civil Survey Profile Drawing</h1>
        <h2>${parameters.sectionName}</h2>
        <p>Surveyor: ${surveyorInfo.name} | ${surveyorInfo.title} | ${surveyorInfo.phone}</p>
      </div>
      <img src="${imgData}" alt="Civil Survey Profile">
      <div class="footer">
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Professional Pipe & Excavation Calculator System</p>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.print();
}

function exportProfile() {
  const canvas = document.getElementById('profileCanvas');
  if (!canvas) return;
  
  const link = document.createElement('a');
  link.download = `Civil_Survey_Profile_${parameters.sectionName.replace(/\s+/g, '_')}.png`;
  link.href = canvas.toDataURL();
  link.click();
  
  showNotification('Profile exported as PNG', 'success');
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
    
    // Refresh profile if it's currently visible
    if (currentTab === 'profile') {
      setTimeout(() => drawProfile(), 100);
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
  
  // Refresh profile if it's currently visible
  if (currentTab === 'profile') {
    setTimeout(() => drawProfile(), 100);
  }
  
  showNotification('Structure deleted', 'success');
}

function sortStructures() {
  structures.sort((a, b) => a.station - b.station);
  refreshStructuresTable();
  updateSectionName();
  
  // Refresh profile if it's currently visible
  if (currentTab === 'profile') {
    setTimeout(() => drawProfile(), 100);
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
    setTimeout(() => drawProfile(), 100);
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
window.refreshProfile = refreshProfile;
window.printProfile = printProfile;
window.exportProfile = exportProfile;