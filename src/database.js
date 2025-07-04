import { supabase } from './supabaseClient.js'

export class DatabaseManager {
  constructor() {
    this.currentProjectId = null
  }

  // Project Management
  async createProject(name, description = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name,
            description,
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error
      
      this.currentProjectId = data.id
      return data
    } catch (error) {
      console.error('Error creating project:', error)
      throw error
    }
  }

  async getProjects() {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  }

  async updateProject(projectId, updates) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  }

  async deleteProject(projectId) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  }

  // Parameters Management
  async saveParameters(projectId, parameters) {
    try {
      // Check if parameters already exist for this project
      const { data: existing } = await supabase
        .from('project_parameters')
        .select('id')
        .eq('project_id', projectId)
        .single()

      if (existing) {
        // Update existing parameters
        const { data, error } = await supabase
          .from('project_parameters')
          .update({
            section_name: parameters.sectionName,
            start_station: parameters.startStation,
            end_station: parameters.endStation,
            pipe_diameter: parseFloat(parameters.pipeDiameter),
            pipe_depth: parseFloat(parameters.pipeDepth),
            excavation_width: parseFloat(parameters.excavationWidth),
            slope_ratio: parseFloat(parameters.slopeRatio),
            ground_level_start: parseFloat(parameters.groundLevelStart),
            ground_level_end: parseFloat(parameters.groundLevelEnd),
            pipe_level_start: parseFloat(parameters.pipeLevelStart),
            pipe_level_end: parseFloat(parameters.pipeLevelEnd),
            calculated_slope: parseFloat(parameters.calculatedSlope)
          })
          .eq('project_id', projectId)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Insert new parameters
        const { data, error } = await supabase
          .from('project_parameters')
          .insert([
            {
              project_id: projectId,
              section_name: parameters.sectionName,
              start_station: parameters.startStation,
              end_station: parameters.endStation,
              pipe_diameter: parseFloat(parameters.pipeDiameter),
              pipe_depth: parseFloat(parameters.pipeDepth),
              excavation_width: parseFloat(parameters.excavationWidth),
              slope_ratio: parseFloat(parameters.slopeRatio),
              ground_level_start: parseFloat(parameters.groundLevelStart),
              ground_level_end: parseFloat(parameters.groundLevelEnd),
              pipe_level_start: parseFloat(parameters.pipeLevelStart),
              pipe_level_end: parseFloat(parameters.pipeLevelEnd),
              calculated_slope: parseFloat(parameters.calculatedSlope)
            }
          ])
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error saving parameters:', error)
      throw error
    }
  }

  async getParameters(projectId) {
    try {
      const { data, error } = await supabase
        .from('project_parameters')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching parameters:', error)
      throw error
    }
  }

  // Structures Management
  async saveStructures(projectId, structures) {
    try {
      // Delete existing structures for this project
      await supabase
        .from('project_structures')
        .delete()
        .eq('project_id', projectId)

      // Insert new structures
      if (structures && structures.length > 0) {
        const structuresData = structures.map(structure => ({
          project_id: projectId,
          station: structure.station,
          structure_type: structure.type,
          invert_level: parseFloat(structure.invertLevel),
          ground_level: parseFloat(structure.groundLevel),
          excavation_depth: parseFloat(structure.excavationDepth),
          description: structure.description
        }))

        const { data, error } = await supabase
          .from('project_structures')
          .insert(structuresData)
          .select()

        if (error) throw error
        return data
      }
      return []
    } catch (error) {
      console.error('Error saving structures:', error)
      throw error
    }
  }

  async getStructures(projectId) {
    try {
      const { data, error } = await supabase
        .from('project_structures')
        .select('*')
        .eq('project_id', projectId)
        .order('station')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching structures:', error)
      throw error
    }
  }

  // Surveyor Info Management
  async saveSurveyorInfo(projectId, surveyorInfo) {
    try {
      // Check if surveyor info already exists for this project
      const { data: existing } = await supabase
        .from('surveyor_info')
        .select('id')
        .eq('project_id', projectId)
        .single()

      if (existing) {
        // Update existing surveyor info
        const { data, error } = await supabase
          .from('surveyor_info')
          .update({
            name: surveyorInfo.name || '',
            title: surveyorInfo.title || '',
            company: surveyorInfo.company || '',
            phone: surveyorInfo.phone || '',
            email: surveyorInfo.email || '',
            license: surveyorInfo.license || '',
            signature_data: surveyorInfo.signature || ''
          })
          .eq('project_id', projectId)
          .select()
          .single()

        if (error) throw error
        return data
      } else {
        // Insert new surveyor info
        const { data, error } = await supabase
          .from('surveyor_info')
          .insert([
            {
              project_id: projectId,
              name: surveyorInfo.name || '',
              title: surveyorInfo.title || '',
              company: surveyorInfo.company || '',
              phone: surveyorInfo.phone || '',
              email: surveyorInfo.email || '',
              license: surveyorInfo.license || '',
              signature_data: surveyorInfo.signature || ''
            }
          ])
          .select()
          .single()

        if (error) throw error
        return data
      }
    } catch (error) {
      console.error('Error saving surveyor info:', error)
      throw error
    }
  }

  async getSurveyorInfo(projectId) {
    try {
      const { data, error } = await supabase
        .from('surveyor_info')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error fetching surveyor info:', error)
      throw error
    }
  }

  // Complete Project Data
  async saveCompleteProject(projectData) {
    try {
      let projectId = this.currentProjectId

      // Create or update project
      if (!projectId) {
        const project = await this.createProject(
          projectData.parameters?.sectionName || 'New Project',
          'Pipe & Excavation Calculator Project'
        )
        projectId = project.id
      }

      // Save all data
      const promises = []

      if (projectData.parameters) {
        promises.push(this.saveParameters(projectId, projectData.parameters))
      }

      if (projectData.structures) {
        promises.push(this.saveStructures(projectId, projectData.structures))
      }

      if (projectData.surveyorInfo) {
        promises.push(this.saveSurveyorInfo(projectId, projectData.surveyorInfo))
      }

      await Promise.all(promises)

      // Update project timestamp
      await this.updateProject(projectId, { updated_at: new Date().toISOString() })

      return projectId
    } catch (error) {
      console.error('Error saving complete project:', error)
      throw error
    }
  }

  async loadCompleteProject(projectId) {
    try {
      const [project, parameters, structures, surveyorInfo] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        this.getParameters(projectId),
        this.getStructures(projectId),
        this.getSurveyorInfo(projectId)
      ])

      if (project.error) throw project.error

      this.currentProjectId = projectId

      return {
        project: project.data,
        parameters: parameters ? {
          sectionName: parameters.section_name,
          startStation: parameters.start_station,
          endStation: parameters.end_station,
          pipeDiameter: parameters.pipe_diameter.toString(),
          pipeDepth: parameters.pipe_depth.toString(),
          excavationWidth: parameters.excavation_width.toString(),
          slopeRatio: parameters.slope_ratio.toString(),
          groundLevelStart: parameters.ground_level_start.toString(),
          groundLevelEnd: parameters.ground_level_end.toString(),
          pipeLevelStart: parameters.pipe_level_start.toString(),
          pipeLevelEnd: parameters.pipe_level_end.toString(),
          calculatedSlope: parameters.calculated_slope.toString()
        } : null,
        structures: structures ? structures.map(s => ({
          id: s.id,
          station: s.station,
          type: s.structure_type,
          invertLevel: s.invert_level,
          groundLevel: s.ground_level,
          excavationDepth: s.excavation_depth,
          description: s.description
        })) : [],
        surveyorInfo: surveyorInfo ? {
          name: surveyorInfo.name,
          title: surveyorInfo.title,
          company: surveyorInfo.company,
          phone: surveyorInfo.phone,
          email: surveyorInfo.email,
          license: surveyorInfo.license,
          signature: surveyorInfo.signature_data
        } : {}
      }
    } catch (error) {
      console.error('Error loading complete project:', error)
      throw error
    }
  }

  // Auto-save functionality
  async autoSave(projectData) {
    try {
      if (this.currentProjectId) {
        await this.saveCompleteProject(projectData)
        return true
      }
      return false
    } catch (error) {
      console.error('Auto-save failed:', error)
      return false
    }
  }

  setCurrentProject(projectId) {
    this.currentProjectId = projectId
  }

  getCurrentProjectId() {
    return this.currentProjectId
  }
}

// Create singleton instance
export const database = new DatabaseManager()