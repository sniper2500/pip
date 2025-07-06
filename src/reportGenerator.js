export class ReportGenerator {
  constructor() {
    this.reportData = null;
  }

  generateProfessionalReport(projectData) {
    this.reportData = projectData;
    
    // Create a new window for the report
    const reportWindow = window.open('', '_blank', 'width=1200,height=800');
    
    if (!reportWindow) {
      throw new Error('Please allow popups to generate the professional report');
    }

    // Generate the HTML content for the report
    const reportHTML = this.createReportHTML();
    
    // Write the content to the new window
    reportWindow.document.write(reportHTML);
    reportWindow.document.close();
    
    // Add print functionality
    setTimeout(() => {
      reportWindow.focus();
      reportWindow.print();
    }, 500);

    return reportWindow;
  }

  createReportHTML() {
    const timestamp = new Date().toLocaleString();
    const projectInfo = this.reportData.projectInfo || {};
    const parameters = this.reportData.parameters || {};
    const structures = this.reportData.structures || [];
    const surveyor = this.reportData.surveyor || {};
    const calculations = this.reportData.calculations || {};

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Professional Engineering Report - ${parameters.sectionName || 'Project'}</title>
    <style>
        ${this.getReportStyles()}
    </style>
</head>
<body>
    <div class="report-container">
        <!-- Header -->
        <header class="report-header">
            <div class="header-content">
                <div class="company-info">
                    <h1>CIVIL ENGINEERING REPORT</h1>
                    <h2>Pipe Installation & Excavation Analysis</h2>
                    <div class="project-title">${parameters.sectionName || 'Untitled Project'}</div>
                </div>
                <div class="report-meta">
                    <div class="report-date">Report Date: ${timestamp}</div>
                    <div class="report-id">Report ID: ${this.generateReportId()}</div>
                </div>
            </div>
        </header>

        <!-- Surveyor Information -->
        ${this.createSurveyorSection(surveyor)}

        <!-- Project Overview -->
        ${this.createProjectOverviewSection(parameters, calculations)}

        <!-- Technical Specifications -->
        ${this.createTechnicalSpecsSection(parameters)}

        <!-- Structures Summary -->
        ${this.createStructuresSection(structures)}

        <!-- Calculations Summary -->
        ${this.createCalculationsSection(calculations, parameters)}

        <!-- Engineering Analysis -->
        ${this.createAnalysisSection(parameters, calculations)}

        <!-- Recommendations -->
        ${this.createRecommendationsSection(parameters)}

        <!-- Appendices -->
        ${this.createAppendicesSection()}

        <!-- Footer -->
        <footer class="report-footer">
            <div class="footer-content">
                <div class="signature-section">
                    <div class="signature-line">
                        <div class="signature-label">Professional Engineer Signature</div>
                        ${surveyor.signature ? `<img src="${surveyor.signature}" class="signature-image" alt="Signature">` : '<div class="signature-placeholder">Digital signature not provided</div>'}
                    </div>
                    <div class="engineer-info">
                        <div><strong>${surveyor.name || 'Engineer Name'}</strong></div>
                        <div>${surveyor.title || 'Professional Engineer'}</div>
                        <div>License: ${surveyor.license || 'PE-XXXXX'}</div>
                        <div>Date: ${new Date().toLocaleDateString()}</div>
                    </div>
                </div>
                <div class="disclaimer">
                    <p><strong>DISCLAIMER:</strong> This report is generated based on the provided input parameters. 
                    All calculations and recommendations should be verified by a licensed professional engineer 
                    before implementation. The accuracy of this report depends on the accuracy of the input data.</p>
                </div>
            </div>
        </footer>
    </div>
</body>
</html>`;
  }

  createSurveyorSection(surveyor) {
    return `
        <section class="report-section surveyor-section">
            <h3>PREPARED BY</h3>
            <div class="surveyor-details">
                <div class="surveyor-grid">
                    <div class="surveyor-item">
                        <label>Engineer:</label>
                        <span>${surveyor.name || 'Not specified'}</span>
                    </div>
                    <div class="surveyor-item">
                        <label>Title:</label>
                        <span>${surveyor.title || 'Professional Engineer'}</span>
                    </div>
                    <div class="surveyor-item">
                        <label>Company:</label>
                        <span>${surveyor.company || 'Engineering Firm'}</span>
                    </div>
                    <div class="surveyor-item">
                        <label>License:</label>
                        <span>${surveyor.license || 'PE-XXXXX'}</span>
                    </div>
                    <div class="surveyor-item">
                        <label>Phone:</label>
                        <span>${surveyor.phone || 'Not provided'}</span>
                    </div>
                    <div class="surveyor-item">
                        <label>Email:</label>
                        <span>${surveyor.email || 'Not provided'}</span>
                    </div>
                </div>
            </div>
        </section>`;
  }

  createProjectOverviewSection(parameters, calculations) {
    return `
        <section class="report-section overview-section">
            <h3>PROJECT OVERVIEW</h3>
            <div class="overview-content">
                <div class="overview-grid">
                    <div class="overview-item">
                        <label>Project Section:</label>
                        <span>${parameters.sectionName || 'Not specified'}</span>
                    </div>
                    <div class="overview-item">
                        <label>Station Range:</label>
                        <span>${parameters.startStation || '0+000'} to ${parameters.endStation || '0+100'}</span>
                    </div>
                    <div class="overview-item">
                        <label>Total Length:</label>
                        <span>${calculations.totalLength || 0} meters</span>
                    </div>
                    <div class="overview-item">
                        <label>Pipe Diameter:</label>
                        <span>${parameters.pipeDiameter || 0}mm</span>
                    </div>
                </div>
                <div class="project-description">
                    <p>This report presents the engineering analysis for the installation of a ${parameters.pipeDiameter || 0}mm diameter pipe 
                    system from station ${parameters.startStation || '0+000'} to ${parameters.endStation || '0+100'}. 
                    The analysis includes excavation requirements, structural considerations, and installation recommendations.</p>
                </div>
            </div>
        </section>`;
  }

  createTechnicalSpecsSection(parameters) {
    return `
        <section class="report-section specs-section">
            <h3>TECHNICAL SPECIFICATIONS</h3>
            <div class="specs-content">
                <div class="specs-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                                <th>Unit</th>
                                <th>Standard/Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Pipe Diameter</td>
                                <td>${parameters.pipeDiameter || 0}</td>
                                <td>mm</td>
                                <td>ASTM D3034</td>
                            </tr>
                            <tr>
                                <td>Minimum Cover Depth</td>
                                <td>${parameters.pipeDepth || 0}</td>
                                <td>m</td>
                                <td>Local Building Code</td>
                            </tr>
                            <tr>
                                <td>Excavation Width</td>
                                <td>${parameters.excavationWidth || 0}</td>
                                <td>m</td>
                                <td>OSHA 1926.651</td>
                            </tr>
                            <tr>
                                <td>Side Slope Ratio</td>
                                <td>1:${parameters.slopeRatio || 1.5}</td>
                                <td>-</td>
                                <td>OSHA 1926.651</td>
                            </tr>
                            <tr>
                                <td>Pipe Gradient</td>
                                <td>${parameters.calculatedSlope || 0}</td>
                                <td>%</td>
                                <td>Local Drainage Code</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>`;
  }

  createStructuresSection(structures) {
    if (!structures || structures.length === 0) {
      return `
        <section class="report-section structures-section">
            <h3>STRUCTURES SUMMARY</h3>
            <p>No structures defined for this project.</p>
        </section>`;
    }

    const structuresTable = structures.map(structure => `
        <tr>
            <td>${structure.station || 'N/A'}</td>
            <td>${structure.type || 'N/A'}</td>
            <td>${structure.invertLevel || 0}</td>
            <td>${structure.groundLevel || 0}</td>
            <td>${structure.excavationDepth || 0}</td>
            <td>${structure.description || 'N/A'}</td>
        </tr>
    `).join('');

    return `
        <section class="report-section structures-section">
            <h3>STRUCTURES SUMMARY</h3>
            <div class="structures-content">
                <table class="structures-table">
                    <thead>
                        <tr>
                            <th>Station</th>
                            <th>Type</th>
                            <th>Invert Level (m)</th>
                            <th>Ground Level (m)</th>
                            <th>Excavation Depth (m)</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${structuresTable}
                    </tbody>
                </table>
            </div>
        </section>`;
  }

  createCalculationsSection(calculations, parameters) {
    const excavationVolume = calculations.excavationVolume || 0;
    const totalLength = calculations.totalLength || 0;
    const averageDepth = calculations.averageDepth || 0;

    return `
        <section class="report-section calculations-section">
            <h3>ENGINEERING CALCULATIONS</h3>
            <div class="calculations-content">
                <div class="calc-summary">
                    <div class="calc-item">
                        <label>Total Excavation Volume:</label>
                        <span class="calc-value">${excavationVolume.toFixed(2)} m³</span>
                    </div>
                    <div class="calc-item">
                        <label>Average Excavation Depth:</label>
                        <span class="calc-value">${averageDepth.toFixed(2)} m</span>
                    </div>
                    <div class="calc-item">
                        <label>Pipe Gradient:</label>
                        <span class="calc-value">${parameters.calculatedSlope || 0}%</span>
                    </div>
                    <div class="calc-item">
                        <label>Total Pipeline Length:</label>
                        <span class="calc-value">${totalLength.toFixed(2)} m</span>
                    </div>
                </div>
                
                <div class="calc-details">
                    <h4>Calculation Methodology</h4>
                    <ul>
                        <li><strong>Excavation Volume:</strong> Calculated using trapezoidal cross-section method with side slopes of 1:${parameters.slopeRatio || 1.5}</li>
                        <li><strong>Pipe Gradient:</strong> Determined from invert levels at start and end stations</li>
                        <li><strong>Safety Factors:</strong> Applied according to local building codes and OSHA requirements</li>
                        <li><strong>Soil Conditions:</strong> Assumed stable soil conditions (to be verified on site)</li>
                    </ul>
                </div>
            </div>
        </section>`;
  }

  createAnalysisSection(parameters, calculations) {
    const gradient = parseFloat(parameters.calculatedSlope || 0);
    const depth = parseFloat(parameters.pipeDepth || 0);
    const diameter = parseFloat(parameters.pipeDiameter || 0);

    let gradientAnalysis = '';
    if (gradient < 0.5) {
      gradientAnalysis = 'The pipe gradient is below the minimum recommended slope. Consider increasing the gradient to ensure proper flow.';
    } else if (gradient > 10) {
      gradientAnalysis = 'The pipe gradient is steep. Consider erosion protection measures and velocity control.';
    } else {
      gradientAnalysis = 'The pipe gradient is within acceptable limits for gravity flow systems.';
    }

    let depthAnalysis = '';
    if (depth < 1.0) {
      depthAnalysis = 'Shallow burial depth may require additional protection against surface loads and frost.';
    } else if (depth > 6.0) {
      depthAnalysis = 'Deep burial requires careful consideration of soil pressure and construction methodology.';
    } else {
      depthAnalysis = 'Burial depth is appropriate for typical installation conditions.';
    }

    return `
        <section class="report-section analysis-section">
            <h3>ENGINEERING ANALYSIS</h3>
            <div class="analysis-content">
                <div class="analysis-item">
                    <h4>Hydraulic Analysis</h4>
                    <p>${gradientAnalysis}</p>
                    <p>The ${diameter}mm diameter pipe should provide adequate capacity for the intended flow rates, 
                    subject to detailed hydraulic calculations based on actual flow requirements.</p>
                </div>
                
                <div class="analysis-item">
                    <h4>Structural Analysis</h4>
                    <p>${depthAnalysis}</p>
                    <p>The excavation design includes appropriate side slopes for worker safety and soil stability. 
                    Temporary shoring may be required in unstable soil conditions.</p>
                </div>
                
                <div class="analysis-item">
                    <h4>Construction Considerations</h4>
                    <p>The excavation volume of ${calculations.excavationVolume?.toFixed(2) || 0} m³ will require 
                    appropriate equipment and disposal methods. Consider environmental protection measures during construction.</p>
                </div>
            </div>
        </section>`;
  }

  createRecommendationsSection(parameters) {
    return `
        <section class="report-section recommendations-section">
            <h3>RECOMMENDATIONS</h3>
            <div class="recommendations-content">
                <ol class="recommendations-list">
                    <li><strong>Site Investigation:</strong> Conduct detailed geotechnical investigation to confirm soil conditions and groundwater levels.</li>
                    <li><strong>Utility Clearance:</strong> Verify locations of existing utilities before excavation begins.</li>
                    <li><strong>Safety Measures:</strong> Implement proper excavation safety procedures including atmospheric testing and emergency egress.</li>
                    <li><strong>Material Specifications:</strong> Use pipe materials appropriate for the intended service and soil conditions.</li>
                    <li><strong>Backfill Requirements:</strong> Specify appropriate backfill materials and compaction requirements.</li>
                    <li><strong>Quality Control:</strong> Implement inspection procedures for pipe installation and backfill operations.</li>
                    <li><strong>Environmental Protection:</strong> Implement erosion and sediment control measures during construction.</li>
                    <li><strong>Traffic Management:</strong> Develop appropriate traffic control plans if work affects roadways.</li>
                </ol>
            </div>
        </section>`;
  }

  createAppendicesSection() {
    return `
        <section class="report-section appendices-section">
            <h3>APPENDICES</h3>
            <div class="appendices-content">
                <div class="appendix-item">
                    <h4>Appendix A: Design Standards and Codes</h4>
                    <ul>
                        <li>ASTM D3034 - Standard Specification for Type PSM Poly(Vinyl Chloride) (PVC) Sewer Pipe and Fittings</li>
                        <li>OSHA 1926.651 - Excavations Standard</li>
                        <li>Local Building and Drainage Codes</li>
                        <li>Environmental Protection Guidelines</li>
                    </ul>
                </div>
                
                <div class="appendix-item">
                    <h4>Appendix B: Calculation References</h4>
                    <ul>
                        <li>Hydraulic calculations based on Manning's equation</li>
                        <li>Excavation volume calculations using trapezoidal method</li>
                        <li>Structural load calculations per AASHTO standards</li>
                    </ul>
                </div>
                
                <div class="appendix-item">
                    <h4>Appendix C: Quality Assurance</h4>
                    <ul>
                        <li>Material testing requirements</li>
                        <li>Installation inspection checklists</li>
                        <li>Compaction testing procedures</li>
                    </ul>
                </div>
            </div>
        </section>`;
  }

  generateReportId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RPT-${year}${month}${day}-${random}`;
  }

  getReportStyles() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }

        .report-container {
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
            min-height: 297mm;
        }

        .report-header {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header-content {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        .company-info h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
        }

        .company-info h2 {
            font-size: 18px;
            color: #64748b;
            margin-bottom: 15px;
        }

        .project-title {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            border: 2px solid #1e40af;
            padding: 10px;
            border-radius: 5px;
        }

        .report-meta {
            text-align: right;
            font-size: 12px;
            color: #64748b;
        }

        .report-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
        }

        .report-section h3 {
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 5px;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .report-section h4 {
            font-size: 14px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 10px;
            margin-top: 15px;
        }

        .surveyor-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .surveyor-item {
            display: flex;
            justify-content: space-between;
            padding: 8px;
            background: #f8fafc;
            border-radius: 4px;
        }

        .surveyor-item label {
            font-weight: bold;
            color: #374151;
        }

        .overview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .overview-item {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            background: #f0f9ff;
            border-radius: 4px;
            border-left: 4px solid #1e40af;
        }

        .overview-item label {
            font-weight: bold;
            color: #1e40af;
        }

        .project-description {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .specs-table table,
        .structures-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
        }

        .specs-table th,
        .specs-table td,
        .structures-table th,
        .structures-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
        }

        .specs-table th,
        .structures-table th {
            background: #1e40af;
            color: white;
            font-weight: bold;
        }

        .specs-table tbody tr:nth-child(even),
        .structures-table tbody tr:nth-child(even) {
            background: #f8fafc;
        }

        .calc-summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
        }

        .calc-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: #fef3c7;
            border-radius: 6px;
            border-left: 4px solid #f59e0b;
        }

        .calc-item label {
            font-weight: bold;
            color: #92400e;
        }

        .calc-value {
            font-size: 16px;
            font-weight: bold;
            color: #92400e;
        }

        .calc-details {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .calc-details ul {
            margin-left: 20px;
        }

        .calc-details li {
            margin-bottom: 8px;
        }

        .analysis-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f0fdf4;
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }

        .recommendations-list {
            margin-left: 20px;
        }

        .recommendations-list li {
            margin-bottom: 12px;
            line-height: 1.8;
        }

        .appendices-content {
            font-size: 12px;
        }

        .appendix-item {
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }

        .appendix-item ul {
            margin-left: 20px;
            margin-top: 10px;
        }

        .appendix-item li {
            margin-bottom: 5px;
        }

        .report-footer {
            margin-top: 40px;
            border-top: 3px solid #1e40af;
            padding-top: 20px;
        }

        .signature-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
        }

        .signature-line {
            flex: 1;
            margin-right: 30px;
        }

        .signature-label {
            font-weight: bold;
            margin-bottom: 10px;
            color: #374151;
        }

        .signature-image {
            max-width: 200px;
            max-height: 80px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
        }

        .signature-placeholder {
            width: 200px;
            height: 60px;
            border: 2px dashed #d1d5db;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
            font-style: italic;
            border-radius: 4px;
        }

        .engineer-info {
            text-align: right;
            font-size: 12px;
            line-height: 1.8;
        }

        .disclaimer {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 15px;
            font-size: 11px;
            color: #991b1b;
            line-height: 1.6;
        }

        @media print {
            .report-container {
                margin: 0;
                padding: 15mm;
                box-shadow: none;
            }
            
            .report-section {
                page-break-inside: avoid;
            }
            
            .report-header {
                page-break-after: avoid;
            }
        }

        @page {
            size: A4;
            margin: 15mm;
        }
    `;
  }
}