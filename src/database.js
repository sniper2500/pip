import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database service class
export class DatabaseService {
  constructor() {
    this.supabase = supabase;
  }

  // Authentication methods
  async signUp(email, password) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async signIn(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // Project methods
  async createProject(projectData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('projects')
      .insert([{
        name: projectData.name,
        description: projectData.description || '',
        user_id: user.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getProjects() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateProject(projectId, updates) {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(projectId) {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  }

  // Project parameters methods
  async saveProjectParameters(projectId, parameters) {
    // First, try to get existing parameters
    const { data: existing } = await this.supabase
      .from('project_parameters')
      .select('id')
      .eq('project_id', projectId)
      .single();

    if (existing) {
      // Update existing parameters
      const { data, error } = await this.supabase
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
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new parameters
      const { data, error } = await this.supabase
        .from('project_parameters')
        .insert([{
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
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async getProjectParameters(projectId) {
    const { data, error } = await this.supabase
      .from('project_parameters')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }

  // Project structures methods
  async saveProjectStructures(projectId, structures) {
    // Delete existing structures
    await this.supabase
      .from('project_structures')
      .delete()
      .eq('project_id', projectId);

    // Insert new structures
    if (structures.length > 0) {
      const structuresData = structures.map(structure => ({
        project_id: projectId,
        station: structure.station,
        structure_type: structure.type,
        invert_level: parseFloat(structure.invertLevel),
        ground_level: parseFloat(structure.groundLevel),
        excavation_depth: parseFloat(structure.excavationDepth),
        description: structure.description || ''
      }));

      const { data, error } = await this.supabase
        .from('project_structures')
        .insert(structuresData)
        .select();

      if (error) throw error;
      return data;
    }
    return [];
  }

  async getProjectStructures(projectId) {
    const { data, error } = await this.supabase
      .from('project_structures')
      .select('*')
      .eq('project_id', projectId)
      .order('station');

    if (error) throw error;
    return data || [];
  }

  // Surveyor info methods
  async saveSurveyorInfo(projectId, surveyorInfo) {
    // First, try to get existing surveyor info
    const { data: existing } = await this.supabase
      .from('surveyor_info')
      .select('id')
      .eq('project_id', projectId)
      .single();

    if (existing) {
      // Update existing surveyor info
      const { data, error } = await this.supabase
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
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new surveyor info
      const { data, error } = await this.supabase
        .from('surveyor_info')
        .insert([{
          project_id: projectId,
          name: surveyorInfo.name || '',
          title: surveyorInfo.title || '',
          company: surveyorInfo.company || '',
          phone: surveyorInfo.phone || '',
          email: surveyorInfo.email || '',
          license: surveyorInfo.license || '',
          signature_data: surveyorInfo.signature || ''
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  async getSurveyorInfo(projectId) {
    const { data, error } = await this.supabase
      .from('surveyor_info')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Complete project methods
  async saveCompleteProject(projectData) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    try {
      // Create or update project
      let project;
      if (projectData.id) {
        project = await this.updateProject(projectData.id, {
          name: projectData.name,
          description: projectData.description
        });
      } else {
        project = await this.createProject({
          name: projectData.name,
          description: projectData.description
        });
      }

      // Save all related data
      await Promise.all([
        this.saveProjectParameters(project.id, projectData.parameters),
        this.saveProjectStructures(project.id, projectData.structures),
        this.saveSurveyorInfo(project.id, projectData.surveyorInfo)
      ]);

      return project;
    } catch (error) {
      console.error('Error saving complete project:', error);
      throw error;
    }
  }

  async loadCompleteProject(projectId) {
    try {
      const [project, parameters, structures, surveyorInfo] = await Promise.all([
        this.supabase.from('projects').select('*').eq('id', projectId).single(),
        this.getProjectParameters(projectId),
        this.getProjectStructures(projectId),
        this.getSurveyorInfo(projectId)
      ]);

      if (project.error) throw project.error;

      return {
        project: project.data,
        parameters: parameters || {},
        structures: structures || [],
        surveyorInfo: surveyorInfo || {}
      };
    } catch (error) {
      console.error('Error loading complete project:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const db = new DatabaseService();