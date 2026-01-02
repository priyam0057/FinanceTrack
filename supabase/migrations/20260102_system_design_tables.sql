-- Migration: Add System Design Tables
-- Created: 2026-01-02
-- Description: Tables for storing project diagrams, API docs, tech stack, and environment config

-- Diagrams (Architecture, Database, Frontend)
CREATE TABLE IF NOT EXISTS public.project_diagrams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  diagram_type text NOT NULL CHECK (diagram_type IN ('architecture', 'database', 'frontend')),
  name text NOT NULL DEFAULT 'Main Diagram',
  nodes jsonb NOT NULL DEFAULT '[]',
  edges jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, diagram_type)
);

-- API Documentation
CREATE TABLE IF NOT EXISTS public.api_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  method text NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')),
  path text NOT NULL,
  description text,
  request_body text,
  response_example text,
  status_codes jsonb NOT NULL DEFAULT '[]',
  requires_auth boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tech Stack
CREATE TABLE IF NOT EXISTS public.tech_stack (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  version text,
  category text NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'devops', 'testing', 'other')),
  docs_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Environment Config
CREATE TABLE IF NOT EXISTS public.env_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  development text,
  staging text,
  production text,
  is_secret boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Diagram Templates (global, not per-project)
CREATE TABLE IF NOT EXISTS public.diagram_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  diagram_type text NOT NULL CHECK (diagram_type IN ('architecture', 'database', 'frontend')),
  nodes jsonb NOT NULL DEFAULT '[]',
  edges jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_diagrams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.env_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagram_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project-related tables
CREATE POLICY "Users can manage diagrams of their projects" ON public.project_diagrams
  FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage api_endpoints of their projects" ON public.api_endpoints
  FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage tech_stack of their projects" ON public.tech_stack
  FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage env_config of their projects" ON public.env_config
  FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE user_id = auth.uid()));

-- RLS for diagram templates (user owns their templates)
CREATE POLICY "Users can view their own templates" ON public.diagram_templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates" ON public.diagram_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON public.diagram_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON public.diagram_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_project_diagrams_project ON public.project_diagrams(project_id);
CREATE INDEX idx_api_endpoints_project ON public.api_endpoints(project_id);
CREATE INDEX idx_tech_stack_project ON public.tech_stack(project_id);
CREATE INDEX idx_env_config_project ON public.env_config(project_id);
CREATE INDEX idx_diagram_templates_user ON public.diagram_templates(user_id);
