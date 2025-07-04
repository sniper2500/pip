import * as XLSX from 'xlsx';
import { db } from './database.js';

export class ImportExportManager {
  constructor() {
    this.supportedFormats = ['json', 'csv', 'xlsx', 'xls'];
  }

  // Export to Excel (XLSX)
  exportToExcel(data, filename = 'pipe-excavation-project') {
    const workbook = XLSX.utils.book_new();

    // Create Parameters worksheet
    if (data.parameters) {
      const parametersData = [
        ['Parameter', 'Value', 'Unit', 'Description'],
        ['Section Name', data.parameters.sectionName || '', '', 'Project section identifier'],
        ['Start Station', data.parameters.startStation || '', 'm', 'Starting station point'],
        ['End Station', data.parameters.endStation || '', 'm', 'Ending station point'],
        ['Pipe Diameter', data.parameters.pipeDiameter || '', 'mm', 'Pipe diameter'],
        ['Pipe Depth', data.parameters.pipeDepth || '', 'm', 'Pipe burial depth'],
        ['Excavation Width', data.parameters.excavationWidth || '', 'm', 'Excavation width'],
        ['Slope Ratio', data.parameters.slopeRatio || '', '1:n', 'Excavation slope ratio'],
        ['Ground Level Start', data.parameters.groundLevelStart || '', 'm', 'Starting ground elevation'],
        ['Ground Level End', data.parameters.groundLevelEnd || '', 'm', 'Ending ground elevation'],
        ['Pipe Level Start', data.parameters.pipeLevelStart || '', 'm', 'Starting pipe elevation'],
        ['Pipe Level End', data.parameters.pipeLevelEnd || '', 'm', 'Ending pipe elevation'],
        ['Calculated Slope', data.parameters.calculatedSlope || '', '%', 'Calculated pipe slope']
      ];

      const parametersWS = XLSX.utils.aoa_to_sheet(parametersData);
      XLSX.utils.book_append_sheet(workbook, parametersWS, 'Parameters');
    }

    // Create Structures worksheet
    if (data.structures && data.structures.length > 0) {
      const structuresData = [
        ['Station', 'Structure Type', 'Invert Level (m)', 'Ground Level (m)', 'Excavation Depth (m)', 'Description'],
        ...data.structures.map(structure => [
          structure.station || '',
          structure.type || '',
          structure.invertLevel || '',
          structure.groundLevel || '',
          structure.excavationDepth || '',
          structure.description || ''
        ])
      ];

      const structuresWS = XLSX.utils.aoa_to_sheet(structuresData);
      XLSX.utils.book_append_sheet(workbook, structuresWS, 'Structures');
    }

    // Create Surveyor Info worksheet
    if (data.surveyorInfo) {
      const surveyorData = [
        ['Field', 'Value'],
        ['Name', data.surveyorInfo.name || ''],
        ['Title', data.surveyorInfo.title || ''],
        ['Company', data.surveyorInfo.company || ''],
        ['Phone', data.surveyorInfo.phone || ''],
        ['Email', data.surveyorInfo.email || ''],
        ['License', data.surveyorInfo.license || '']
      ];

      const surveyorWS = XLSX.utils.aoa_to_sheet(surveyorData);
      XLSX.utils.book_append_sheet(workbook, surveyorWS, 'Surveyor Info');
    }

    // Create Calculations worksheet
    if (data.calculations) {
      const calculationsData = [
        ['Calculation', 'Value', 'Unit'],
        ['Total Length', data.calculations.totalLength || '', 'm'],
        ['Excavation Volume', data.calculations.excavationVolume || '', 'm³'],
        ['Pipe Slope', data.calculations.pipeSlope || '', '%'],
        ['Average Depth', data.calculations.averageDepth || '', 'm']
      ];

      const calculationsWS = XLSX.utils.aoa_to_sheet(calculationsData);
      XLSX.utils.book_append_sheet(workbook, calculationsWS, 'Calculations');
    }

    // Save the file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }

  // Import from Excel (XLSX)
  async importFromExcel(file) {
    try {
      const data = await this.readFileAsArrayBuffer(file);
      const workbook = XLSX.read(data, { type: 'array' });
      
      const result = {
        parameters: {},
        structures: [],
        surveyorInfo: {}
      };

      // Read Parameters sheet
      if (workbook.SheetNames.includes('Parameters')) {
        const parametersSheet = workbook.Sheets['Parameters'];
        const parametersData = XLSX.utils.sheet_to_json(parametersSheet, { header: 1 });
        
        for (let i = 1; i < parametersData.length; i++) {
          const row = parametersData[i];
          if (row.length >= 2) {
            const paramName = this.normalizeParameterName(row[0]);
            const paramValue = row[1];
            if (paramName && paramValue !== undefined) {
              result.parameters[paramName] = paramValue;
            }
          }
        }
      }

      // Read Structures sheet
      if (workbook.SheetNames.includes('Structures')) {
        const structuresSheet = workbook.Sheets['Structures'];
        const structuresData = XLSX.utils.sheet_to_json(structuresSheet, { header: 1 });
        
        for (let i = 1; i < structuresData.length; i++) {
          const row = structuresData[i];
          if (row.length >= 6) {
            result.structures.push({
              id: Date.now() + Math.random(),
              station: row[0] || '',
              type: row[1] || 'Manhole',
              invertLevel: parseFloat(row[2]) || 0,
              groundLevel: parseFloat(row[3]) || 0,
              excavationDepth: parseFloat(row[4]) || 0,
              description: row[5] || ''
            });
          }
        }
      }

      // Read Surveyor Info sheet
      if (workbook.SheetNames.includes('Surveyor Info')) {
        const surveyorSheet = workbook.Sheets['Surveyor Info'];
        const surveyorData = XLSX.utils.sheet_to_json(surveyorSheet, { header: 1 });
        
        for (let i = 1; i < surveyorData.length; i++) {
          const row = surveyorData[i];
          if (row.length >= 2) {
            const fieldName = this.normalizeSurveyorField(row[0]);
            const fieldValue = row[1];
            if (fieldName && fieldValue !== undefined) {
              result.surveyorInfo[fieldName] = fieldValue;
            }
          }
        }
      }

      return result;
    } catch (error) {
      throw new Error(`Failed to import Excel file: ${error.message}`);
    }
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

  // Import project data from JSON
  async importFromJSON(file) {
    try {
      const text = await this.readFileAsText(file);
      const data = JSON.parse(text);
      
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

  // Database export methods
  async exportProjectToDatabase(projectData, projectName) {
    try {
      const project = await db.saveCompleteProject({
        name: projectName,
        description: `Exported on ${new Date().toLocaleString()}`,
        parameters: projectData.parameters,
        structures: projectData.structures,
        surveyorInfo: projectData.surveyorInfo
      });

      return project;
    } catch (error) {
      throw new Error(`Failed to save to database: ${error.message}`);
    }
  }

  async importProjectFromDatabase(projectId) {
    try {
      const projectData = await db.loadCompleteProject(projectId);
      return {
        parameters: this.convertDbParametersToApp(projectData.parameters),
        structures: this.convertDbStructuresToApp(projectData.structures),
        surveyorInfo: this.convertDbSurveyorInfoToApp(projectData.surveyorInfo)
      };
    } catch (error) {
      throw new Error(`Failed to load from database: ${error.message}`);
    }
  }

  // Convert database format to app format
  convertDbParametersToApp(dbParams) {
    if (!dbParams) return {};
    
    return {
      sectionName: dbParams.section_name,
      startStation: dbParams.start_station,
      endStation: dbParams.end_station,
      pipeDiameter: dbParams.pipe_diameter?.toString(),
      pipeDepth: dbParams.pipe_depth?.toString(),
      excavationWidth: dbParams.excavation_width?.toString(),
      slopeRatio: dbParams.slope_ratio?.toString(),
      groundLevelStart: dbParams.ground_level_start?.toString(),
      groundLevelEnd: dbParams.ground_level_end?.toString(),
      pipeLevelStart: dbParams.pipe_level_start?.toString(),
      pipeLevelEnd: dbParams.pipe_level_end?.toString(),
      calculatedSlope: dbParams.calculated_slope?.toString()
    };
  }

  convertDbStructuresToApp(dbStructures) {
    if (!dbStructures) return [];
    
    return dbStructures.map(structure => ({
      id: structure.id,
      station: structure.station,
      type: structure.structure_type,
      invertLevel: structure.invert_level,
      groundLevel: structure.ground_level,
      excavationDepth: structure.excavation_depth,
      description: structure.description
    }));
  }

  convertDbSurveyorInfoToApp(dbSurveyorInfo) {
    if (!dbSurveyorInfo) return {};
    
    return {
      name: dbSurveyorInfo.name,
      title: dbSurveyorInfo.title,
      company: dbSurveyorInfo.company,
      phone: dbSurveyorInfo.phone,
      email: dbSurveyorInfo.email,
      license: dbSurveyorInfo.license,
      signature: dbSurveyorInfo.signature_data
    };
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

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
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

  normalizeSurveyorField(name) {
    const mapping = {
      'Name': 'name',
      'Title': 'title',
      'Company': 'company',
      'Phone': 'phone',
      'Email': 'email',
      'License': 'license'
    };
    
    return mapping[name] || name.toLowerCase();
  }

  validateImportedData(data) {
    if (!data || typeof data !== 'object') return false;
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
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}