// Import/Export functionality for project data
export class ImportExportManager {
  constructor() {
    this.supportedFormats = ['json', 'csv', 'xlsx'];
  }

  // Export project data to JSON
  exportToJSON(data, filename = 'pipe-excavation-project') {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        application: 'Pipe & Excavation Calculator'
      },
      ...data
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    this.downloadFile(blob, `${filename}.json`);
  }

  // Export parameters to CSV
  exportParametersToCSV(parameters, filename = 'project-parameters') {
    const headers = ['Parameter', 'Value', 'Unit', 'Description'];
    const rows = [
      ['Section Name', parameters.sectionName || '', '', 'Project section identifier'],
      ['Start Station', parameters.startStation || '', 'm', 'Starting station point'],
      ['End Station', parameters.endStation || '', 'm', 'Ending station point'],
      ['Pipe Diameter', parameters.pipeDiameter || '', 'mm', 'Pipe diameter'],
      ['Pipe Depth', parameters.pipeDepth || '', 'm', 'Pipe burial depth'],
      ['Excavation Width', parameters.excavationWidth || '', 'm', 'Excavation width'],
      ['Slope Ratio', parameters.slopeRatio || '', '1:n', 'Excavation slope ratio'],
      ['Ground Level Start', parameters.groundLevelStart || '', 'm', 'Starting ground elevation'],
      ['Ground Level End', parameters.groundLevelEnd || '', 'm', 'Ending ground elevation'],
      ['Pipe Level Start', parameters.pipeLevelStart || '', 'm', 'Starting pipe elevation'],
      ['Pipe Level End', parameters.pipeLevelEnd || '', 'm', 'Ending pipe elevation'],
      ['Calculated Slope', parameters.calculatedSlope || '', '%', 'Calculated pipe slope']
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  // Export structures to CSV
  exportStructuresToCSV(structures, filename = 'project-structures') {
    if (!structures || structures.length === 0) {
      this.showNotification('No structures to export', 'info');
      return;
    }

    const headers = ['Station', 'Structure Type', 'Invert Level', 'Ground Level', 'Excavation Depth', 'Description'];
    const rows = structures.map(structure => [
      structure.station || '',
      structure.type || '',
      structure.invertLevel || '',
      structure.groundLevel || '',
      structure.excavationDepth || '',
      structure.description || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadFile(blob, `${filename}.csv`);
  }

  // Export complete project data
  exportCompleteProject(projectData, filename = 'complete-project') {
    const completeData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        application: 'Pipe & Excavation Calculator',
        exportType: 'complete-project'
      },
      parameters: projectData.parameters || {},
      structures: projectData.structures || [],
      calculations: projectData.calculations || {},
      surveyorInfo: projectData.surveyorInfo || {},
      signature: projectData.signature || null,
      savedRecords: projectData.savedRecords || []
    };

    this.exportToJSON(completeData, filename);
  }

  // Import project data from JSON
  async importFromJSON(file) {
    try {
      const text = await this.readFileAsText(file);
      const data = JSON.parse(text);
      
      // Validate imported data
      if (!this.validateImportedData(data)) {
        throw new Error('Invalid file format or corrupted data');
      }

      return data;
    } catch (error) {
      throw new Error(`Failed to import JSON: ${error.message}`);
    }
  }

  // Import parameters from CSV
  async importParametersFromCSV(file) {
    try {
      const text = await this.readFileAsText(file);
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain headers and data');
      }

      const parameters = {};
      
      // Skip header row and process data
      for (let i = 1; i < lines.length; i++) {
        const columns = this.parseCSVLine(lines[i]);
        if (columns.length >= 2) {
          const paramName = this.normalizeParameterName(columns[0]);
          const paramValue = columns[1];
          
          if (paramName && paramValue) {
            parameters[paramName] = paramValue;
          }
        }
      }

      return parameters;
    } catch (error) {
      throw new Error(`Failed to import CSV parameters: ${error.message}`);
    }
  }

  // Import structures from CSV
  async importStructuresFromCSV(file) {
    try {
      const text = await this.readFileAsText(file);
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain headers and data');
      }

      const structures = [];
      
      // Process data rows
      for (let i = 1; i < lines.length; i++) {
        const columns = this.parseCSVLine(lines[i]);
        if (columns.length >= 6) {
          structures.push({
            id: Date.now() + Math.random(),
            station: columns[0] || '',
            type: columns[1] || 'Manhole',
            invertLevel: parseFloat(columns[2]) || 0,
            groundLevel: parseFloat(columns[3]) || 0,
            excavationDepth: parseFloat(columns[4]) || 0,
            description: columns[5] || ''
          });
        }
      }

      return structures;
    } catch (error) {
      throw new Error(`Failed to import CSV structures: ${error.message}`);
    }
  }

  // Create project template
  createProjectTemplate() {
    return {
      metadata: {
        templateDate: new Date().toISOString(),
        version: '1.0',
        application: 'Pipe & Excavation Calculator',
        templateType: 'project-template'
      },
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
      structures: [
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
      ],
      surveyorInfo: {
        name: 'John Smith',
        title: 'Licensed Surveyor',
        company: 'ABC Engineering',
        phone: '+1-555-0123',
        email: 'j.smith@abceng.com',
        license: 'LS-12345'
      }
    };
  }

  // Export project template
  exportTemplate(filename = 'project-template') {
    const template = this.createProjectTemplate();
    this.exportToJSON(template, filename);
  }

  // Utility functions
  readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  normalizeParameterName(name) {
    const mapping = {
      'Section Name': 'sectionName',
      'Start Station': 'startStation',
      'End Station': 'endStation',
      'Pipe Diameter': 'pipeDiameter',
      'Pipe Depth': 'pipeDepth',
      'Excavation Width': 'excavationWidth',
      'Slope Ratio': 'slopeRatio',
      'Ground Level Start': 'groundLevelStart',
      'Ground Level End': 'groundLevelEnd',
      'Pipe Level Start': 'pipeLevelStart',
      'Pipe Level End': 'pipeLevelEnd',
      'Calculated Slope': 'calculatedSlope'
    };
    
    return mapping[name] || name.toLowerCase().replace(/\s+/g, '');
  }

  validateImportedData(data) {
    // Basic validation
    if (!data || typeof data !== 'object') return false;
    
    // Check for required structure
    const hasValidStructure = data.metadata || data.parameters || data.structures;
    return hasValidStructure;
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showNotification(message, type = 'info') {
    // This will be connected to the main notification system
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Export formats configuration
export const EXPORT_FORMATS = {
  JSON: {
    extension: 'json',
    mimeType: 'application/json',
    description: 'Complete project data with all settings'
  },
  CSV_PARAMETERS: {
    extension: 'csv',
    mimeType: 'text/csv',
    description: 'Project parameters only'
  },
  CSV_STRUCTURES: {
    extension: 'csv',
    mimeType: 'text/csv',
    description: 'Structure data only'
  },
  TEMPLATE: {
    extension: 'json',
    mimeType: 'application/json',
    description: 'Project template for reuse'
  }
};