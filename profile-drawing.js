export class ProfileDrawing {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.setupCanvas()
  }

  setupCanvas() {
    // Set canvas size
    this.canvas.width = 1200
    this.canvas.height = 600
    
    // Set drawing properties
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
  }

  drawProfile(structures, parameters) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // Set up coordinate system
    this.setupCoordinates(structures, parameters)
    
    // Draw grid and axes
    this.drawGrid()
    this.drawAxes()
    
    // Draw profile elements
    this.drawGroundLine(structures)
    this.drawPipeLine(structures, parameters)
    this.drawExcavationLine(structures, parameters)
    this.drawStructures(structures)
    
    // Add annotations
    this.addAnnotations(structures, parameters)
    this.addDimensions(structures, parameters)
    this.addLabels(structures, parameters)
  }

  setupCoordinates(structures, parameters) {
    // Calculate drawing bounds
    const minChainage = Math.min(...structures.map(s => s.chainage))
    const maxChainage = Math.max(...structures.map(s => s.chainage))
    const minLevel = Math.min(...structures.map(s => s.invertLevel)) - 1
    const maxLevel = Math.max(...structures.map(s => s.coverLevel)) + 0.5

    // Set margins
    this.margins = { left: 100, right: 100, top: 80, bottom: 100 }
    
    // Calculate scale
    this.scaleX = (this.canvas.width - this.margins.left - this.margins.right) / (maxChainage - minChainage)
    this.scaleY = (this.canvas.height - this.margins.top - this.margins.bottom) / (maxLevel - minLevel)
    
    // Store bounds
    this.bounds = { minChainage, maxChainage, minLevel, maxLevel }
  }

  worldToScreen(chainage, level) {
    const x = this.margins.left + (chainage - this.bounds.minChainage) * this.scaleX
    const y = this.canvas.height - this.margins.bottom - (level - this.bounds.minLevel) * this.scaleY
    return { x, y }
  }

  drawGrid() {
    this.ctx.strokeStyle = '#f0f0f0'
    this.ctx.lineWidth = 1
    
    // Vertical grid lines (every 5m)
    for (let chainage = Math.ceil(this.bounds.minChainage / 5) * 5; chainage <= this.bounds.maxChainage; chainage += 5) {
      const { x } = this.worldToScreen(chainage, 0)
      this.ctx.beginPath()
      this.ctx.moveTo(x, this.margins.top)
      this.ctx.lineTo(x, this.canvas.height - this.margins.bottom)
      this.ctx.stroke()
    }
    
    // Horizontal grid lines (every 0.5m)
    for (let level = Math.ceil(this.bounds.minLevel * 2) / 2; level <= this.bounds.maxLevel; level += 0.5) {
      const { y } = this.worldToScreen(0, level)
      this.ctx.beginPath()
      this.ctx.moveTo(this.margins.left, y)
      this.ctx.lineTo(this.canvas.width - this.margins.right, y)
      this.ctx.stroke()
    }
  }

  drawAxes() {
    this.ctx.strokeStyle = '#333'
    this.ctx.lineWidth = 2
    this.ctx.fillStyle = '#333'
    this.ctx.font = '12px Arial'
    
    // X-axis (chainage)
    const { y: xAxisY } = this.worldToScreen(0, this.bounds.minLevel)
    this.ctx.beginPath()
    this.ctx.moveTo(this.margins.left, xAxisY)
    this.ctx.lineTo(this.canvas.width - this.margins.right, xAxisY)
    this.ctx.stroke()
    
    // Y-axis (levels)
    this.ctx.beginPath()
    this.ctx.moveTo(this.margins.left, this.margins.top)
    this.ctx.lineTo(this.margins.left, this.canvas.height - this.margins.bottom)
    this.ctx.stroke()
    
    // Axis labels
    this.ctx.textAlign = 'center'
    this.ctx.fillText('Chainage (m)', this.canvas.width / 2, this.canvas.height - 20)
    
    this.ctx.save()
    this.ctx.translate(20, this.canvas.height / 2)
    this.ctx.rotate(-Math.PI / 2)
    this.ctx.fillText('Level (m)', 0, 0)
    this.ctx.restore()
    
    // Scale markings
    this.drawScaleMarkings()
  }

  drawScaleMarkings() {
    this.ctx.fillStyle = '#666'
    this.ctx.font = '10px Arial'
    this.ctx.textAlign = 'center'
    
    // Chainage markings
    for (let chainage = Math.ceil(this.bounds.minChainage / 5) * 5; chainage <= this.bounds.maxChainage; chainage += 5) {
      const { x } = this.worldToScreen(chainage, this.bounds.minLevel)
      this.ctx.fillText(chainage.toString(), x, this.canvas.height - this.margins.bottom + 20)
    }
    
    // Level markings
    this.ctx.textAlign = 'right'
    for (let level = Math.ceil(this.bounds.minLevel * 2) / 2; level <= this.bounds.maxLevel; level += 0.5) {
      const { y } = this.worldToScreen(0, level)
      this.ctx.fillText(level.toFixed(1), this.margins.left - 10, y)
    }
  }

  drawGroundLine(structures) {
    this.ctx.strokeStyle = '#8b5cf6'
    this.ctx.lineWidth = 3
    
    this.ctx.beginPath()
    structures.forEach((structure, index) => {
      const { x, y } = this.worldToScreen(structure.chainage, structure.coverLevel)
      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })
    this.ctx.stroke()
  }

  drawPipeLine(structures, parameters) {
    // Draw pipe invert line
    this.ctx.strokeStyle = '#dc2626'
    this.ctx.lineWidth = 2
    
    this.ctx.beginPath()
    structures.forEach((structure, index) => {
      const { x, y } = this.worldToScreen(structure.chainage, structure.invertLevel)
      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })
    this.ctx.stroke()
    
    // Draw pipe body (thickness)
    this.ctx.fillStyle = 'rgba(220, 38, 38, 0.3)'
    this.ctx.strokeStyle = '#dc2626'
    this.ctx.lineWidth = 1
    
    const pipeRadius = parameters.pipeDiameter / 2000 // Convert mm to m
    const pipeThickness = parameters.pipeThickness / 1000 // Convert mm to m
    
    // Create pipe body path
    this.ctx.beginPath()
    
    // Top of pipe
    structures.forEach((structure, index) => {
      const topLevel = structure.invertLevel + (pipeRadius * 2) + pipeThickness
      const { x, y } = this.worldToScreen(structure.chainage, topLevel)
      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })
    
    // Bottom of pipe (reverse order)
    for (let i = structures.length - 1; i >= 0; i--) {
      const structure = structures[i]
      const { x, y } = this.worldToScreen(structure.chainage, structure.invertLevel)
      this.ctx.lineTo(x, y)
    }
    
    this.ctx.closePath()
    this.ctx.fill()
    this.ctx.stroke()
  }

  drawExcavationLine(structures, parameters) {
    this.ctx.strokeStyle = '#f59e0b'
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([5, 5])
    
    this.ctx.beginPath()
    structures.forEach((structure, index) => {
      const excavationLevel = structure.invertLevel - (parameters.bedding / 1000) - (parameters.backfill / 1000)
      const { x, y } = this.worldToScreen(structure.chainage, excavationLevel)
      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })
    this.ctx.stroke()
    this.ctx.setLineDash([]) // Reset line dash
  }

  drawStructures(structures) {
    structures.forEach(structure => {
      const { x, y } = this.worldToScreen(structure.chainage, structure.coverLevel)
      
      if (structure.type === 'Manhole') {
        this.drawManhole(x, y, structure)
      } else if (structure.type === 'IC Chamber') {
        this.drawICChamber(x, y, structure)
      }
    })
  }

  drawManhole(x, y, structure) {
    // Draw manhole symbol
    this.ctx.fillStyle = '#2563eb'
    this.ctx.strokeStyle = '#1e40af'
    this.ctx.lineWidth = 2
    
    this.ctx.beginPath()
    this.ctx.arc(x, y, 15, 0, 2 * Math.PI)
    this.ctx.fill()
    this.ctx.stroke()
    
    // Draw vertical line to invert
    const { y: invertY } = this.worldToScreen(structure.chainage, structure.invertLevel)
    this.ctx.strokeStyle = '#2563eb'
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(x, invertY)
    this.ctx.stroke()
  }

  drawICChamber(x, y, structure) {
    // Draw IC chamber symbol
    this.ctx.fillStyle = '#059669'
    this.ctx.strokeStyle = '#047857'
    this.ctx.lineWidth = 2
    
    this.ctx.fillRect(x - 10, y - 8, 20, 16)
    this.ctx.strokeRect(x - 10, y - 8, 20, 16)
    
    // Draw vertical line to invert
    const { y: invertY } = this.worldToScreen(structure.chainage, structure.invertLevel)
    this.ctx.strokeStyle = '#059669'
    this.ctx.lineWidth = 3
    this.ctx.beginPath()
    this.ctx.moveTo(x, y)
    this.ctx.lineTo(x, invertY)
    this.ctx.stroke()
  }

  addAnnotations(structures, parameters) {
    this.ctx.fillStyle = '#1e40af'
    this.ctx.font = 'bold 12px Arial'
    this.ctx.textAlign = 'center'
    
    // Structure labels
    structures.forEach(structure => {
      const { x, y } = this.worldToScreen(structure.chainage, structure.coverLevel)
      
      // Structure name
      this.ctx.fillText(structure.name, x, y - 30)
      
      // Cover level
      this.ctx.font = '10px Arial'
      this.ctx.fillStyle = '#059669'
      this.ctx.fillText(`CL: ${structure.coverLevel.toFixed(3)}m`, x, y - 45)
      
      // Invert level
      this.ctx.fillStyle = '#dc2626'
      const { y: invertY } = this.worldToScreen(structure.chainage, structure.invertLevel)
      this.ctx.fillText(`IL: ${structure.invertLevel.toFixed(3)}m`, x, invertY + 15)
      
      this.ctx.font = 'bold 12px Arial'
      this.ctx.fillStyle = '#1e40af'
    })
    
    // Pipe information
    const midChainage = (structures[0].chainage + structures[structures.length - 1].chainage) / 2
    const midLevel = (structures[0].invertLevel + structures[structures.length - 1].invertLevel) / 2
    const { x: midX, y: midY } = this.worldToScreen(midChainage, midLevel)
    
    this.ctx.fillStyle = '#dc2626'
    this.ctx.font = 'bold 14px Arial'
    this.ctx.fillText(`Pipe: Ø${parameters.pipeDiameter}mm`, midX, midY - 30)
    this.ctx.fillText(`Slope: ${parameters.slope.toFixed(3)}%`, midX, midY - 50)
  }

  addDimensions(structures, parameters) {
    this.ctx.strokeStyle = '#666'
    this.ctx.fillStyle = '#666'
    this.ctx.lineWidth = 1
    this.ctx.font = '10px Arial'
    this.ctx.textAlign = 'center'
    
    // Total length dimension
    const startStructure = structures[0]
    const endStructure = structures[structures.length - 1]
    const { x: startX } = this.worldToScreen(startStructure.chainage, 0)
    const { x: endX } = this.worldToScreen(endStructure.chainage, 0)
    const dimY = this.canvas.height - this.margins.bottom + 50
    
    // Dimension line
    this.ctx.beginPath()
    this.ctx.moveTo(startX, dimY)
    this.ctx.lineTo(endX, dimY)
    this.ctx.stroke()
    
    // Dimension arrows
    this.drawArrow(startX, dimY, 'right')
    this.drawArrow(endX, dimY, 'left')
    
    // Dimension text
    const totalLength = endStructure.chainage - startStructure.chainage
    this.ctx.fillText(`Total Length: ${totalLength}m`, (startX + endX) / 2, dimY - 10)
  }

  drawArrow(x, y, direction) {
    const size = 5
    this.ctx.beginPath()
    if (direction === 'right') {
      this.ctx.moveTo(x, y)
      this.ctx.lineTo(x + size, y - size/2)
      this.ctx.lineTo(x + size, y + size/2)
    } else {
      this.ctx.moveTo(x, y)
      this.ctx.lineTo(x - size, y - size/2)
      this.ctx.lineTo(x - size, y + size/2)
    }
    this.ctx.closePath()
    this.ctx.fill()
  }

  addLabels(structures, parameters) {
    // Add title
    this.ctx.fillStyle = '#1e40af'
    this.ctx.font = 'bold 16px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('CIVIL SURVEY PROFILE', this.canvas.width / 2, 30)
    
    // Add section name
    this.ctx.font = 'bold 14px Arial'
    this.ctx.fillText(parameters.sectionName, this.canvas.width / 2, 50)
    
    // Add scale information
    this.ctx.fillStyle = '#666'
    this.ctx.font = '10px Arial'
    this.ctx.textAlign = 'left'
    this.ctx.fillText(`Horizontal Scale: 1:${Math.round(1/this.scaleX * 1000)}`, this.margins.left, this.margins.top - 20)
    this.ctx.fillText(`Vertical Scale: 1:${Math.round(1/this.scaleY * 1000)}`, this.margins.left, this.margins.top - 5)
  }

  exportAsImage(filename = 'profile') {
    // Create download link
    const link = document.createElement('a')
    link.download = `${filename}.png`
    link.href = this.canvas.toDataURL()
    link.click()
  }
}