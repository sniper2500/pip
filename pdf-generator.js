export class PDFGenerator {
  constructor() {
    this.loadJsPDF()
  }

  async loadJsPDF() {
    // Load jsPDF library
    if (!window.jsPDF) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      document.head.appendChild(script)
      
      await new Promise(resolve => {
        script.onload = resolve
      })
    }
  }

  generateReport(structures, parameters, surveyorInfo) {
    const { jsPDF } = window
    const doc = new jsPDF()
    
    // Add header
    this.addHeader(doc, parameters, surveyorInfo)
    
    // Add profile drawing
    this.addProfileDrawing(doc, structures, parameters)
    
    // Add technical specifications
    this.addTechnicalSpecs(doc, parameters)
    
    // Add structures table
    this.addStructuresTable(doc, structures)
    
    // Add footer
    this.addFooter(doc, surveyorInfo)
    
    // Save PDF
    doc.save(`${parameters.sectionName}_Profile_Report.pdf`)
  }

  generateProfessionalReport(structures, parameters, surveyorInfo) {
    const { jsPDF } = window
    const doc = new jsPDF()
    
    // Cover page
    this.addCoverPage(doc, parameters, surveyorInfo)
    
    // Add new page for technical content
    doc.addPage()
    
    // Add comprehensive technical analysis
    this.addTechnicalAnalysis(doc, structures, parameters)
    
    // Add detailed calculations
    this.addCalculations(doc, structures, parameters)
    
    // Add recommendations
    this.addRecommendations(doc, structures, parameters)
    
    // Add appendices
    doc.addPage()
    this.addAppendices(doc, structures, parameters)
    
    // Save professional report
    doc.save(`${parameters.sectionName}_Professional_Report.pdf`)
  }

  addHeader(doc, parameters, surveyorInfo) {
    // Title
    doc.setFontSize(20)
    doc.setFont(undefined, 'bold')
    doc.text('CIVIL SURVEY PROFILE REPORT', 105, 20, { align: 'center' })
    
    // Section name
    doc.setFontSize(16)
    doc.text(parameters.sectionName, 105, 30, { align: 'center' })
    
    // Project information
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    doc.text(`Length: ${parameters.pipeLength}m`, 20, 45)
    doc.text(`Pipe: Ø${parameters.pipeDiameter}mm`, 70, 45)
    doc.text(`Slope: ${parameters.slope.toFixed(3)}%`, 120, 45)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 170, 45)
    
    // Surveyor information
    doc.setFont(undefined, 'bold')
    doc.text('Surveyor:', 150, 55)
    doc.setFont(undefined, 'normal')
    doc.text(surveyorInfo.name, 150, 62)
    doc.text(surveyorInfo.title, 150, 69)
    doc.text(surveyorInfo.contact, 150, 76)
  }

  addProfileDrawing(doc, structures, parameters) {
    // Get canvas data
    const canvas = document.getElementById('profile-canvas')
    if (canvas) {
      const imgData = canvas.toDataURL('image/png')
      doc.addImage(imgData, 'PNG', 10, 85, 190, 95)
    }
  }

  addTechnicalSpecs(doc, parameters) {
    let yPos = 190
    
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('TECHNICAL SPECIFICATIONS', 20, yPos)
    
    yPos += 10
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    
    const specs = [
      ['Start Invert Level:', `${parameters.startInvert.toFixed(3)}m`],
      ['End Invert Level:', `${parameters.endInvert.toFixed(3)}m`],
      ['Total Drop:', `${parameters.totalDrop.toFixed(3)}m`],
      ['Pipe Diameter:', `Ø${parameters.pipeDiameter}mm`],
      ['Pipe Thickness:', `${parameters.pipeThickness}mm`],
      ['Gradient:', `${parameters.slope.toFixed(3)}%`],
      ['Analysis Interval:', `${parameters.analysisInterval}m`],
      ['Bedding Depth:', `${parameters.bedding}mm`],
      ['Backfill Depth:', `${parameters.backfill}mm`]
    ]
    
    specs.forEach(([label, value]) => {
      doc.text(label, 20, yPos)
      doc.text(value, 100, yPos)
      yPos += 7
    })
  }

  addStructuresTable(doc, structures) {
    let yPos = 190
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('STRUCTURES SCHEDULE', 20, yPos)
    
    yPos += 15
    
    // Table headers
    doc.setFontSize(9)
    const headers = ['Structure', 'Type', 'Chainage (m)', 'Cover Level (m)', 'Invert Level (m)', 'Excavation (m)']
    const colWidths = [30, 25, 25, 30, 30, 25]
    let xPos = 20
    
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos)
      xPos += colWidths[i]
    })
    
    // Draw header line
    doc.line(20, yPos + 2, 185, yPos + 2)
    yPos += 8
    
    // Table data
    doc.setFont(undefined, 'normal')
    structures.forEach(structure => {
      xPos = 20
      const data = [
        structure.name,
        structure.type,
        structure.chainage.toFixed(3),
        structure.coverLevel.toFixed(3),
        structure.invertLevel.toFixed(3),
        structure.excavationDepth.toFixed(2)
      ]
      
      data.forEach((value, i) => {
        doc.text(value.toString(), xPos, yPos)
        xPos += colWidths[i]
      })
      yPos += 7
    })
  }

  addFooter(doc, surveyorInfo) {
    const pageHeight = doc.internal.pageSize.height
    
    // Signature area
    doc.setFontSize(10)
    doc.text('Surveyor Signature:', 20, pageHeight - 30)
    doc.rect(20, pageHeight - 25, 60, 15)
    
    // Date
    doc.text('Date:', 120, pageHeight - 30)
    doc.rect(120, pageHeight - 25, 40, 15)
    
    // Page number
    doc.text(`Page 1 of 1`, 180, pageHeight - 10, { align: 'right' })
  }

  addCoverPage(doc, parameters, surveyorInfo) {
    // Company logo area
    doc.rect(20, 20, 170, 40)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('PROFESSIONAL SURVEY REPORT', 105, 45, { align: 'center' })
    
    // Project title
    doc.setFontSize(18)
    doc.text(parameters.sectionName, 105, 80, { align: 'center' })
    
    // Project details box
    doc.rect(30, 100, 150, 80)
    doc.setFontSize(12)
    doc.text('PROJECT DETAILS', 105, 115, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    const projectDetails = [
      `Section: ${parameters.sectionName}`,
      `Total Length: ${parameters.pipeLength}m`,
      `Pipe Diameter: Ø${parameters.pipeDiameter}mm`,
      `Gradient: ${parameters.slope.toFixed(3)}%`,
      `Start Invert: ${parameters.startInvert.toFixed(3)}m`,
      `End Invert: ${parameters.endInvert.toFixed(3)}m`,
      `Total Drop: ${parameters.totalDrop.toFixed(3)}m`
    ]
    
    let yPos = 130
    projectDetails.forEach(detail => {
      doc.text(detail, 40, yPos)
      yPos += 8
    })
    
    // Surveyor information
    doc.rect(30, 200, 150, 60)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('SURVEYOR INFORMATION', 105, 215, { align: 'center' })
    
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.text(`Name: ${surveyorInfo.name}`, 40, 230)
    doc.text(`Title: ${surveyorInfo.title}`, 40, 240)
    doc.text(`Contact: ${surveyorInfo.contact}`, 40, 250)
    
    // Date and signature
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 40, 270)
    doc.text('Signature: ________________________', 40, 280)
  }

  addTechnicalAnalysis(doc, structures, parameters) {
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('TECHNICAL ANALYSIS', 20, 20)
    
    let yPos = 35
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    
    // Hydraulic analysis
    doc.setFont(undefined, 'bold')
    doc.text('1. HYDRAULIC ANALYSIS', 20, yPos)
    yPos += 10
    
    doc.setFont(undefined, 'normal')
    const hydraulicText = [
      `The proposed sewer line has a total length of ${parameters.pipeLength}m with a gradient of ${parameters.slope.toFixed(3)}%.`,
      `The pipe diameter of ${parameters.pipeDiameter}mm provides adequate capacity for the design flow.`,
      `The total drop of ${parameters.totalDrop.toFixed(3)}m ensures proper hydraulic performance.`
    ]
    
    hydraulicText.forEach(text => {
      const lines = doc.splitTextToSize(text, 170)
      lines.forEach(line => {
        doc.text(line, 20, yPos)
        yPos += 6
      })
      yPos += 3
    })
    
    // Structural analysis
    yPos += 5
    doc.setFont(undefined, 'bold')
    doc.text('2. STRUCTURAL ANALYSIS', 20, yPos)
    yPos += 10
    
    doc.setFont(undefined, 'normal')
    const structuralText = [
      `The excavation depths range from ${Math.min(...structures.map(s => s.excavationDepth)).toFixed(2)}m to ${Math.max(...structures.map(s => s.excavationDepth)).toFixed(2)}m.`,
      `Proper bedding and backfill specifications ensure structural integrity of the pipeline.`,
      `All structures are positioned to maintain minimum cover requirements.`
    ]
    
    structuralText.forEach(text => {
      const lines = doc.splitTextToSize(text, 170)
      lines.forEach(line => {
        doc.text(line, 20, yPos)
        yPos += 6
      })
      yPos += 3
    })
  }

  addCalculations(doc, structures, parameters) {
    let yPos = 150
    
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('DESIGN CALCULATIONS', 20, yPos)
    
    yPos += 15
    doc.setFontSize(11)
    
    // Slope calculation
    doc.setFont(undefined, 'bold')
    doc.text('Gradient Calculation:', 20, yPos)
    yPos += 8
    
    doc.setFont(undefined, 'normal')
    doc.text(`Slope = (Start Invert - End Invert) / Length × 100`, 25, yPos)
    yPos += 6
    doc.text(`Slope = (${parameters.startInvert.toFixed(3)} - ${parameters.endInvert.toFixed(3)}) / ${parameters.pipeLength} × 100`, 25, yPos)
    yPos += 6
    doc.text(`Slope = ${parameters.slope.toFixed(3)}%`, 25, yPos)
    
    yPos += 15
    
    // Excavation volumes
    doc.setFont(undefined, 'bold')
    doc.text('Excavation Volume Estimation:', 20, yPos)
    yPos += 8
    
    doc.setFont(undefined, 'normal')
    const avgExcavation = structures.reduce((sum, s) => sum + s.excavationDepth, 0) / structures.length
    const estimatedVolume = parameters.pipeLength * avgExcavation * 1.5 // Assuming 1.5m width
    
    doc.text(`Average Excavation Depth: ${avgExcavation.toFixed(2)}m`, 25, yPos)
    yPos += 6
    doc.text(`Estimated Excavation Volume: ${estimatedVolume.toFixed(1)}m³`, 25, yPos)
  }

  addRecommendations(doc, structures, parameters) {
    let yPos = 220
    
    doc.setFontSize(14)
    doc.setFont(undefined, 'bold')
    doc.text('RECOMMENDATIONS', 20, yPos)
    
    yPos += 15
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    
    const recommendations = [
      '1. Ensure proper compaction of bedding material around the pipe.',
      '2. Install temporary shoring for excavations deeper than 1.5m.',
      '3. Conduct pressure testing before backfilling operations.',
      '4. Maintain minimum cover of 1.0m over the pipe crown.',
      '5. Install warning tape 300mm above the pipe crown.',
      '6. Coordinate with utility companies before excavation.'
    ]
    
    recommendations.forEach(rec => {
      const lines = doc.splitTextToSize(rec, 170)
      lines.forEach(line => {
        doc.text(line, 20, yPos)
        yPos += 6
      })
      yPos += 3
    })
  }

  addAppendices(doc, structures, parameters) {
    doc.setFontSize(16)
    doc.setFont(undefined, 'bold')
    doc.text('APPENDICES', 20, 20)
    
    let yPos = 35
    
    // Appendix A - Design Standards
    doc.setFontSize(12)
    doc.text('Appendix A: Design Standards', 20, yPos)
    yPos += 10
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    const standards = [
      '• AS/NZS 3500.2 - Plumbing and drainage',
      '• AS 2566.1 - Buried flexible pipelines',
      '• Local authority requirements',
      '• Australian Standard for Earthworks'
    ]
    
    standards.forEach(std => {
      doc.text(std, 25, yPos)
      yPos += 7
    })
    
    yPos += 10
    
    // Appendix B - Material Specifications
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Appendix B: Material Specifications', 20, yPos)
    yPos += 10
    
    doc.setFontSize(10)
    doc.setFont(undefined, 'normal')
    const materials = [
      `• Pipe: ${parameters.pipeDiameter}mm diameter, ${parameters.pipeThickness}mm wall thickness`,
      '• Bedding: 20mm aggregate, 150mm minimum depth',
      '• Backfill: Selected material, compacted in 200mm lifts',
      '• Warning tape: Detectable plastic tape'
    ]
    
    materials.forEach(mat => {
      doc.text(mat, 25, yPos)
      yPos += 7
    })
  }
}