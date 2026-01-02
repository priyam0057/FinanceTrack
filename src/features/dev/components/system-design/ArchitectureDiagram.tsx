import { DiagramNode } from './DiagramNode';
import { DiagramConnector } from './DiagramConnector';
import { Network } from 'lucide-react';

interface ArchitectureDiagramProps {
  projectName?: string;
}

export function ArchitectureDiagram({ projectName }: ArchitectureDiagramProps) {
  return (
    <div className="space-y-4">
      <h3 className="diagram-section-title">
        <Network />
        Backend & API Architecture
      </h3>
      
      <div className="system-design-container">
        <div className="architecture-diagram">
          {/* Client Layer */}
          <div className="architecture-layer">
            <span className="layer-label">Client</span>
            <DiagramNode 
              type="client" 
              label="Web Browser" 
              sublabel="React Frontend"
            />
            <DiagramNode 
              type="client" 
              label="Mobile App" 
              sublabel="Optional"
            />
          </div>
          
          <DiagramConnector direction="down" label="HTTPS Requests" />
          
          {/* API Gateway Layer */}
          <div className="architecture-layer">
            <span className="layer-label">API</span>
            <DiagramNode 
              type="server" 
              label="API Gateway" 
              sublabel="Authentication & Routing"
            />
          </div>
          
          <DiagramConnector direction="down" label="Internal Calls" />
          
          {/* Services Layer */}
          <div className="architecture-layer">
            <span className="layer-label">Services</span>
            <DiagramNode 
              type="service" 
              label="Auth Service" 
              sublabel="JWT / Session"
            />
            <DiagramNode 
              type="service" 
              label="Business Logic" 
              sublabel="Controllers"
            />
            <DiagramNode 
              type="service" 
              label="File Storage" 
              sublabel="Media Handler"
            />
          </div>
          
          <DiagramConnector direction="down" label="Queries / Commands" />
          
          {/* Data Layer */}
          <div className="architecture-layer">
            <span className="layer-label">Data</span>
            <DiagramNode 
              type="database" 
              label="PostgreSQL" 
              sublabel="Supabase"
            />
            <DiagramNode 
              type="external" 
              label="External APIs" 
              sublabel="Third-party Services"
            />
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-8 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Request Flow:</p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>1. Client sends request to API Gateway</span>
            <span>→</span>
            <span>2. Gateway authenticates & routes</span>
            <span>→</span>
            <span>3. Services process business logic</span>
            <span>→</span>
            <span>4. Data layer handles persistence</span>
          </div>
        </div>
      </div>
    </div>
  );
}
