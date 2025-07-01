import './style.css'
import { ProfileDrawing } from './profile-drawing.js'
import { PDFGenerator } from './pdf-generator.js'

// Application state
let appState = {
  currentTab: 'parameters',
  structures: [
    {
      id: 1,
      name: 'MH-1',
      type: 'Manhole',
      chainage: 0,
      coverLevel: 602.500,
      invertLevel: 601.000,
      excavationDepth: 0.50
    },
    {
      id: 2,
      name: 'IC Chamber 10',
      type: 'IC Chamber',
      chainage: 35,
      coverLevel: 602.140,
      invertLevel: 600.640,
      excavationDepth: 0.35
    }
  ],
  parameters: {
    sectionName: 'MH-1 - IC Chamber 10',
    pipeLength: 35,
    pipeDiameter: 200,
    pipeThickness: 10,
    startInvert: 601.000,
    endInvert: 600.640,
    slope: 1.030,
    totalDrop: 0.360,
    analysisInterval: 3,
    mhExcavation: 50,
    icExcavation: 35,
    bedding: 150,
    backfill: 300
  },
  surveyorInfo: {
    name: 'AHMED BARAKAT',
    title: 'Professional Surveyor',
    contact: '0596488146',
    license: 'PS-2024-001',
    signature: null
  },
  savedRecords: []
}

// Profile drawing instance
let profileDrawing = null
let pdfGenerator = null

// Initialize application
function initApp() {
  setupEventListeners()
  updateUI()
  initializeProfileDrawing()
  loadSavedRecords()
}

function setupEventListeners() {
  // Tab navigation
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', (e) => {
      switchTab(e.target.dataset.tab)
    })
  })

  // Parameters form
  const parametersForm = document.getElementById('parameters-form')
  if (parametersForm) {
    parametersForm.addEventListener('input', handleParameterChange)
  }

  // Structures management
  document.getElementById('add-structure-btn')?.addEventListener('click', addStructure)
  document.getElementById('sort-structures-btn')?.addEventListener('click', sortStructures)
  document.getElementById('update-section-btn')?.addEventListener('click', updateSectionName)

  // Action buttons
  document.getElementById('recalculate-btn')?.addEventListener('click', recalculateProfile)
  document.getElementById('save-record-btn')?.addEventListener('click', saveRecord)
  document.getElementById('print-profile-btn')?.addEventListener('click', printProfile)
  document.getElementById('export-drawing-btn')?.addEventListener('click', exportDrawing)
  document.getElementById('refresh-profile-btn')?.addEventListener('click', refreshProfile)
  document.getElementById('professional-report-btn')?.addEventListener('click', generateProfessionalReport)

  // Surveyor info
  document.querySelectorAll('.surveyor-field input').forEach(input => {
    input.addEventListener('input', handleSurveyorInfoChange)
  })

  // Signature canvas
  initializeSignatureCanvas()
}

function switchTab(tabName) {
  appState.currentTab = tabName
  
  // Update tab buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName)
  })
  
  // Show/hide sections
  document.querySelectorAll('.tab-content').forEach(section => {
    section.style.display = section.id === `${tabName}-tab` ? 'block' : 'none'
  })

  // Refresh profile drawing when switching to profile tab
  if (tabName === 'profile') {
    setTimeout(() => {
      refreshProfile()
    }, 100)
  }
}

function handleParameterChange(e) {
  const field = e.target.name
  const value = parseFloat(e.target.value) || e.target.value

  if (field in appState.parameters) {
    appState.parameters[field] = value
    e.target.classList.add('changed')
    
    // Auto-calculate dependent values
    if (field === 'startInvert' || field === 'endInvert') {
      calculateSlope()
    } else if (field === 'pipeLength' || field === 'slope') {
      calculateEndInvert()
    }
    
    updateCalculatedFields()
  }
}

function calculateSlope() {
  const { startInvert, endInvert, pipeLength } = appState.parameters
  if (startInvert && endInvert && pipeLength) {
    const drop = startInvert - endInvert
    const slope = (drop / pipeLength) * 100
    appState.parameters.slope = parseFloat(slope.toFixed(3))
    appState.parameters.totalDrop = parseFloat(drop.toFixed(3))
    
    document.getElementById('slope').value = appState.parameters.slope
    document.getElementById('totalDrop').value = appState.parameters.totalDrop
  }
}

function calculateEndInvert() {
  const { startInvert, pipeLength, slope } = appState.parameters
  if (startInvert && pipeLength && slope) {
    const drop = (slope / 100) * pipeLength
    const endInvert = startInvert - drop
    appState.parameters.endInvert = parseFloat(endInvert.toFixed(3))
    appState.parameters.totalDrop = parseFloat(drop.toFixed(3))
    
    document.getElementById('endInvert').value = appState.parameters.endInvert
    document.getElementById('totalDrop').value = appState.parameters.totalDrop
  }
}

function updateCalculatedFields() {
  // Update section name if structures changed
  if (appState.structures.length >= 2) {
    const firstStructure = appState.structures[0]
    const lastStructure = appState.structures[appState.structures.length - 1]
    appState.parameters.sectionName = `${firstStructure.name} - ${lastStructure.name}`
    
    // Update parameters from structures
    appState.parameters.pipeLength = lastStructure.chainage - firstStructure.chainage
    appState.parameters.startInvert = firstStructure.invertLevel
    appState.parameters.endInvert = lastStructure.invertLevel
    
    calculateSlope()
  }
  
  updateUI()
}

function addStructure() {
  const newId = Math.max(...appState.structures.map(s => s.id)) + 1
  const newStructure = {
    id: newId,
    name: `Structure ${newId}`,
    type: 'Manhole',
    chainage: 0,
    coverLevel: 602.000,
    invertLevel: 601.000,
    excavationDepth: 0.50
  }
  
  appState.structures.push(newStructure)
  updateStructuresTable()
  updateCalculatedFields()
}

function deleteStructure(id) {
  appState.structures = appState.structures.filter(s => s.id !== id)
  updateStructuresTable()
  updateCalculatedFields()
}

function sortStructures() {
  appState.structures.sort((a, b) => a.chainage - b.chainage)
  updateStructuresTable()
  updateCalculatedFields()
}

function updateSectionName() {
  if (appState.structures.length >= 2) {
    const firstStructure = appState.structures[0]
    const lastStructure = appState.structures[appState.structures.length - 1]
    appState.parameters.sectionName = `${firstStructure.name} - ${lastStructure.name}`
    updateUI()
    showNotification('Section name updated successfully!', 'success')
  }
}

function updateStructuresTable() {
  const tbody = document.querySelector('#structures-table tbody')
  if (!tbody) return

  tbody.innerHTML = appState.structures.map(structure => `
    <tr>
      <td class="structure-name">${structure.name}</td>
      <td>
        <select class="structure-select" onchange="updateStructure(${structure.id}, 'type', this.value)">
          <option value="Manhole" ${structure.type === 'Manhole' ? 'selected' : ''}>Manhole</option>
          <option value="IC Chamber" ${structure.type === 'IC Chamber' ? 'selected' : ''}>IC Chamber</option>
          <option value="Junction" ${structure.type === 'Junction' ? 'selected' : ''}>Junction</option>
        </select>
      </td>
      <td>
        <input type="number" class="structure-input" value="${structure.chainage}" 
               onchange="updateStructure(${structure.id}, 'chainage', parseFloat(this.value))" step="0.001">
      </td>
      <td>
        <input type="number" class="structure-input" value="${structure.coverLevel}" 
               onchange="updateStructure(${structure.id}, 'coverLevel', parseFloat(this.value))" step="0.001">
      </td>
      <td>
        <input type="number" class="structure-input" value="${structure.invertLevel}" 
               onchange="updateStructure(${structure.id}, 'invertLevel', parseFloat(this.value))" step="0.001">
      </td>
      <td class="excavation-depth">${structure.excavationDepth.toFixed(2)}m</td>
      <td>
        <button class="delete-structure-btn" onclick="deleteStructure(${structure.id})">Delete</button>
      </td>
    </tr>
  `).join('')
}

// Make functions globally available
window.updateStructure = function(id, field, value) {
  const structure = appState.structures.find(s => s.id === id)
  if (structure) {
    structure[field] = value
    
    // Calculate excavation depth
    if (field === 'coverLevel' || field === 'invertLevel') {
      structure.excavationDepth = structure.coverLevel - structure.invertLevel
    }
    
    updateStructuresTable()
    updateCalculatedFields()
  }
}

window.deleteStructure = deleteStructure

function handleSurveyorInfoChange(e) {
  const field = e.target.name
  appState.surveyorInfo[field] = e.target.value
}

function initializeSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas')
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  let isDrawing = false
  let lastX = 0
  let lastY = 0

  function startDrawing(e) {
    isDrawing = true
    const rect = canvas.getBoundingClientRect()
    lastX = e.clientX - rect.left
    lastY = e.clientY - rect.top
  }

  function draw(e) {
    if (!isDrawing) return
    
    const rect = canvas.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(currentX, currentY)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()

    lastX = currentX
    lastY = currentY
  }

  function stopDrawing() {
    isDrawing = false
  }

  canvas.addEventListener('mousedown', startDrawing)
  canvas.addEventListener('mousemove', draw)
  canvas.addEventListener('mouseup', stopDrawing)
  canvas.addEventListener('mouseout', stopDrawing)

  // Touch events for mobile
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousedown', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    canvas.dispatchEvent(mouseEvent)
  })

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const mouseEvent = new MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    canvas.dispatchEvent(mouseEvent)
  })

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault()
    const mouseEvent = new MouseEvent('mouseup', {})
    canvas.dispatchEvent(mouseEvent)
  })

  // Clear signature button
  document.getElementById('clear-signature-btn')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  })

  // Save signature button
  document.getElementById('save-signature-btn')?.addEventListener('click', () => {
    appState.surveyorInfo.signature = canvas.toDataURL()
    showNotification('Signature saved successfully!', 'success')
  })
}

function initializeProfileDrawing() {
  const canvas = document.getElementById('profile-canvas')
  if (canvas) {
    profileDrawing = new ProfileDrawing(canvas)
    pdfGenerator = new PDFGenerator()
  }
}

function recalculateProfile() {
  updateCalculatedFields()
  refreshProfile()
  showNotification('Profile recalculated successfully!', 'success')
}

function refreshProfile() {
  if (profileDrawing) {
    profileDrawing.drawProfile(appState.structures, appState.parameters)
    updateProfileInfo()
  }
}

function updateProfileInfo() {
  // Update profile header information
  const sectionNameEl = document.querySelector('.section-name-display')
  if (sectionNameEl) {
    sectionNameEl.textContent = appState.parameters.sectionName
  }

  // Update technical specifications
  const specs = {
    'Start Invert:': `${appState.parameters.startInvert.toFixed(3)}m`,
    'End Invert:': `${appState.parameters.endInvert.toFixed(3)}m`,
    'Total Drop:': `${appState.parameters.totalDrop.toFixed(3)}m`,
    'Pipe Diameter:': `Ø${appState.parameters.pipeDiameter}mm`,
    'Gradient:': `${appState.parameters.slope.toFixed(3)}%`,
    'Analysis Interval:': `${appState.parameters.analysisInterval}m`,
    'MH Excavation:': `${appState.parameters.mhExcavation}cm`,
    'IC Excavation:': `${appState.parameters.icExcavation}cm`
  }

  const specGrid = document.querySelector('.spec-grid')
  if (specGrid) {
    specGrid.innerHTML = Object.entries(specs).map(([key, value]) => `
      <div class="spec-item">
        <span>${key}</span>
        <span>${value}</span>
      </div>
    `).join('')
  }

  // Update project info
  const projectInfo = document.querySelector('.profile-project-info')
  if (projectInfo) {
    projectInfo.innerHTML = `
      <span>Length: ${appState.parameters.pipeLength}m</span>
      <span>Pipe: Ø${appState.parameters.pipeDiameter}mm</span>
      <span>Slope: ${appState.parameters.slope.toFixed(3)}%</span>
    `
  }
}

function saveRecord() {
  const record = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    sectionName: appState.parameters.sectionName,
    parameters: { ...appState.parameters },
    structures: [...appState.structures],
    surveyorInfo: { ...appState.surveyorInfo }
  }

  appState.savedRecords.push(record)
  localStorage.setItem('pipeCalculatorRecords', JSON.stringify(appState.savedRecords))
  updateSavedRecordsList()
  showNotification('Record saved successfully!', 'success')
}

function loadSavedRecords() {
  const saved = localStorage.getItem('pipeCalculatorRecords')
  if (saved) {
    appState.savedRecords = JSON.parse(saved)
    updateSavedRecordsList()
  }
}

function updateSavedRecordsList() {
  const container = document.querySelector('.saved-records-list')
  if (!container) return

  container.innerHTML = appState.savedRecords.map(record => `
    <div class="saved-record-item">
      <div class="saved-record-info">
        <h4>${record.sectionName}</h4>
        <div class="saved-record-timestamp">Saved: ${new Date(record.timestamp).toLocaleString()}</div>
        <div class="saved-record-surveyor">Surveyor: ${record.surveyorInfo.name}</div>
        <div class="saved-record-details">
          <span>Length: ${record.parameters.pipeLength}m</span>
          <span>Pipe: Ø${record.parameters.pipeDiameter}mm</span>
          <span>Slope: ${record.parameters.slope.toFixed(3)}%</span>
        </div>
        <div class="saved-record-levels">
          <span>Start: ${record.parameters.startInvert.toFixed(3)}m</span>
          <span>End: ${record.parameters.endInvert.toFixed(3)}m</span>
          <span>Drop: ${record.parameters.totalDrop.toFixed(3)}m</span>
        </div>
      </div>
      <div class="saved-record-actions">
        <button class="load-btn" onclick="loadRecord(${record.id})">Load</button>
        <button class="print-btn" onclick="printRecord(${record.id})">Print</button>
        <button class="delete-btn" onclick="deleteRecord(${record.id})">Delete</button>
      </div>
    </div>
  `).join('')
}

window.loadRecord = function(id) {
  const record = appState.savedRecords.find(r => r.id === id)
  if (record) {
    appState.parameters = { ...record.parameters }
    appState.structures = [...record.structures]
    appState.surveyorInfo = { ...record.surveyorInfo }
    updateUI()
    refreshProfile()
    showNotification('Record loaded successfully!', 'success')
  }
}

window.deleteRecord = function(id) {
  if (confirm('Are you sure you want to delete this record?')) {
    appState.savedRecords = appState.savedRecords.filter(r => r.id !== id)
    localStorage.setItem('pipeCalculatorRecords', JSON.stringify(appState.savedRecords))
    updateSavedRecordsList()
    showNotification('Record deleted successfully!', 'success')
  }
}

window.printRecord = function(id) {
  const record = appState.savedRecords.find(r => r.id === id)
  if (record && pdfGenerator) {
    pdfGenerator.generateReport(record.structures, record.parameters, record.surveyorInfo)
  }
}

function printProfile() {
  if (pdfGenerator) {
    pdfGenerator.generateReport(appState.structures, appState.parameters, appState.surveyorInfo)
  }
}

function exportDrawing() {
  if (profileDrawing) {
    profileDrawing.exportAsImage(appState.parameters.sectionName)
    showNotification('Drawing exported successfully!', 'success')
  }
}

function generateProfessionalReport() {
  if (pdfGenerator) {
    pdfGenerator.generateProfessionalReport(appState.structures, appState.parameters, appState.surveyorInfo)
    showNotification('Professional report generated successfully!', 'success')
  }
}

function updateUI() {
  // Update parameters form
  Object.entries(appState.parameters).forEach(([key, value]) => {
    const input = document.getElementById(key)
    if (input) {
      input.value = value
    }
  })

  // Update surveyor info
  Object.entries(appState.surveyorInfo).forEach(([key, value]) => {
    const input = document.querySelector(`input[name="${key}"]`)
    if (input && key !== 'signature') {
      input.value = value
    }
  })

  // Update structures table
  updateStructuresTable()
  
  // Update profile info
  updateProfileInfo()
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.className = `notification notification-${type}`
  notification.textContent = message
  
  document.body.appendChild(notification)
  
  setTimeout(() => {
    notification.remove()
  }, 3000)
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp)

// Export for use in other modules
export { appState, showNotification }