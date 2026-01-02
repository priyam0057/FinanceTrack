import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Node, Edge } from '@xyflow/react';
import { toast } from 'sonner';
import { CustomNodeData } from '../components/system-design/types';

export interface EnvVariable {
  id: string;
  name: string;
  development: string;
  staging: string;
  production: string;
  isSecret: boolean;
}

interface DiagramRow {
  nodes: unknown;
  edges: unknown;
}

interface EnvConfigRow {
  id: string;
  name: string;
  development: string | null;
  staging: string | null;
  production: string | null;
  is_secret: boolean | null;
}

export function useSystemDesign(projectId: string) {
  const [loading, setLoading] = useState<boolean>(false);

  const loadDiagram = useCallback(async (type: 'database' | 'frontend' | 'architecture') => {
    try {
      setLoading(true);
      
      const query = supabase
        .from('project_diagrams')
        .select('nodes, edges')
        .eq('project_id', projectId)
        .eq('diagram_type', type)
        .maybeSingle();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (query as Promise<any>);

      if (error) {
        console.error('Error loading diagram:', error);
        toast.error('Failed to load diagram');
        return null;
      }

      if (data) {
        const row = data as DiagramRow;
        const nodes = (row.nodes as Node<CustomNodeData>[]) || [];
        const edges = (row.edges as Edge[]) || [];
        return { nodes, edges };
      }
      
      return { nodes: [], edges: [] };
    } catch (err) {
      console.error('Unexpected error loading diagram:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const saveDiagram = useCallback(async (type: 'database' | 'frontend' | 'architecture', nodes: Node[], edges: Edge[]) => {
    try {
      // Upsert based on project_id and diagram_type unique constraint
      const query = supabase
        .from('project_diagrams')
        .upsert(
          { 
            project_id: projectId,
            diagram_type: type,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            nodes: nodes as any, 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            edges: edges as any,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'project_id,diagram_type' }
        );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (query as Promise<any>);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving diagram:', err);
      toast.error('Failed to save diagram');
      return false;
    }
  }, [projectId]);

  const loadEnvConfig = useCallback(async () => {
    try {
      setLoading(true);
      
      const query = supabase
        .from('env_config')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (query as Promise<any>);

      if (error) throw error;

      const rows = data as EnvConfigRow[];
      return rows.map(item => ({
        id: item.id,
        name: item.name,
        development: item.development || '',
        staging: item.staging || '',
        production: item.production || '',
        isSecret: item.is_secret || false
      })) as EnvVariable[];
    } catch (err) {
      console.error('Error loading env config:', err);
      toast.error('Failed to load environment config');
      return [];
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const saveEnvVariable = useCallback(async (variable: Omit<EnvVariable, 'id'> & { id?: string }) => {
    try {
      const payload = {
        project_id: projectId,
        name: variable.name,
        development: variable.development,
        staging: variable.staging,
        production: variable.production,
        is_secret: variable.isSecret,
        updated_at: new Date().toISOString()
      };

      let query;
      if (variable.id && !variable.id.startsWith('temp-')) {
        // Update existing
        query = supabase
          .from('env_config')
          .update(payload)
          .eq('id', variable.id)
          .select()
          .single();
      } else {
        // Insert new
        query = supabase
          .from('env_config')
          .insert(payload)
          .select()
          .single();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (query as Promise<any>);

      if (result.error) throw result.error;
      
      const item = result.data as EnvConfigRow;
      return {
        id: item.id,
        name: item.name,
        development: item.development || '',
        staging: item.staging || '',
        production: item.production || '',
        isSecret: item.is_secret || false
      } as EnvVariable;

    } catch (err) {
      console.error('Error saving env variable:', err);
      toast.error('Failed to save variable');
      return null;
    }
  }, [projectId]);

  const deleteEnvVariable = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('env_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting env variable:', err);
      toast.error('Failed to delete variable');
      return false;
    }
  }, []);

  const loadTemplates = useCallback(async (type: 'architecture' | 'database' | 'frontend') => {
    try {
      console.log('Loading templates for:', type);
      // @ts-ignore
      const { data, error } = await supabase
        .from('diagram_templates')
        .select('*')
        .eq('diagram_type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading templates:', error);
        throw error;
      }
      console.log('Loaded templates:', data);
      return data || [];
    } catch (err) {
      console.error('Error loading templates:', err);
      toast.error('Failed to load templates');
      return [];
    }
  }, []);

  const saveTemplate = useCallback(async (name: string, type: 'architecture' | 'database' | 'frontend', nodes: Node[], edges: Edge[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      console.log('Saving template:', { name, type, userId: user.id });

      // @ts-ignore
      const { data, error } = await supabase
        .from('diagram_templates')
        .insert({
          user_id: user.id,
          name,
          diagram_type: type,
          nodes: nodes as any,
          edges: edges as any
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving template:', error);
        throw error;
      }
      
      console.log('Saved template:', data);
      return data;
    } catch (err) {
      console.error('Error saving template:', err);
      toast.error('Failed to save template');
      return null;
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      // @ts-ignore
      const { error } = await supabase
        .from('diagram_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting template:', err);
      toast.error('Failed to delete template');
      return false;
    }
  }, []);

  return {
    loading,
    loadDiagram,
    saveDiagram,
    loadEnvConfig,
    saveEnvVariable,
    deleteEnvVariable,
    loadTemplates,
    saveTemplate,
    deleteTemplate
  };
}
