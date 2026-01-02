import { Database, Key, Link2, ArrowRight } from 'lucide-react';

interface TableField {
  name: string;
  type: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: string;
}

interface DatabaseTable {
  name: string;
  fields: TableField[];
}

// Sample tables based on typical project structure
const sampleTables: DatabaseTable[] = [
  {
    name: 'projects',
    fields: [
      { name: 'id', type: 'uuid', isPrimaryKey: true },
      { name: 'name', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'phase', type: 'enum' },
      { name: 'user_id', type: 'uuid', isForeignKey: true, references: 'users.id' },
      { name: 'created_at', type: 'timestamp' },
    ],
  },
  {
    name: 'tasks',
    fields: [
      { name: 'id', type: 'uuid', isPrimaryKey: true },
      { name: 'project_id', type: 'uuid', isForeignKey: true, references: 'projects.id' },
      { name: 'title', type: 'text' },
      { name: 'status', type: 'enum' },
      { name: 'priority', type: 'enum' },
      { name: 'due_date', type: 'timestamp' },
    ],
  },
  {
    name: 'issues',
    fields: [
      { name: 'id', type: 'uuid', isPrimaryKey: true },
      { name: 'project_id', type: 'uuid', isForeignKey: true, references: 'projects.id' },
      { name: 'title', type: 'text' },
      { name: 'severity', type: 'enum' },
      { name: 'status', type: 'enum' },
    ],
  },
  {
    name: 'dev_notes',
    fields: [
      { name: 'id', type: 'uuid', isPrimaryKey: true },
      { name: 'project_id', type: 'uuid', isForeignKey: true, references: 'projects.id' },
      { name: 'title', type: 'text' },
      { name: 'content', type: 'text' },
      { name: 'tags', type: 'text[]' },
    ],
  },
  {
    name: 'team_members',
    fields: [
      { name: 'id', type: 'uuid', isPrimaryKey: true },
      { name: 'project_id', type: 'uuid', isForeignKey: true, references: 'projects.id' },
      { name: 'name', type: 'text' },
      { name: 'role', type: 'text' },
      { name: 'email', type: 'text' },
    ],
  },
  {
    name: 'goals',
    fields: [
      { name: 'id', type: 'uuid', isPrimaryKey: true },
      { name: 'project_id', type: 'uuid', isForeignKey: true, references: 'projects.id' },
      { name: 'title', type: 'text' },
      { name: 'status', type: 'enum' },
      { name: 'target_date', type: 'timestamp' },
    ],
  },
];

const relationships = [
  { from: 'projects', to: 'tasks', type: 'one-to-many' },
  { from: 'projects', to: 'issues', type: 'one-to-many' },
  { from: 'projects', to: 'dev_notes', type: 'one-to-many' },
  { from: 'projects', to: 'team_members', type: 'one-to-many' },
  { from: 'projects', to: 'goals', type: 'one-to-many' },
];

function TableCard({ table }: { table: DatabaseTable }) {
  return (
    <div className="db-table">
      <div className="db-table-header">
        <Database className="db-table-icon" />
        <span className="db-table-name">{table.name}</span>
      </div>
      <div className="db-table-fields">
        {table.fields.map((field) => (
          <div key={field.name} className="db-field">
            {field.isPrimaryKey && <Key className="db-field-key pk" />}
            {field.isForeignKey && <Link2 className="db-field-key fk" />}
            {!field.isPrimaryKey && !field.isForeignKey && (
              <span className="db-field-key" style={{ width: 14 }} />
            )}
            <span className="db-field-name">{field.name}</span>
            <span className="db-field-type">{field.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DatabaseDiagramProps {
  projectName?: string;
}

export function DatabaseDiagram({ projectName }: DatabaseDiagramProps) {
  return (
    <div className="space-y-4">
      <h3 className="diagram-section-title">
        <Database />
        Database Design
      </h3>
      
      <div className="system-design-container">
        <div className="database-diagram">
          {/* Tables Grid */}
          <div className="db-tables-container">
            {sampleTables.map((table) => (
              <TableCard key={table.name} table={table} />
            ))}
          </div>
          
          {/* Relationships */}
          <div className="db-relationships">
            <p className="text-xs font-medium text-foreground mb-2">
              Table Relationships
            </p>
            {relationships.map((rel, idx) => (
              <div key={idx} className="relationship-item">
                <span className="font-mono">{rel.from}</span>
                <ArrowRight className="relationship-arrow w-4 h-4" />
                <span className="font-mono">{rel.to}</span>
                <span className="ml-2 text-muted-foreground">({rel.type})</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Legend:</p>
            <div className="flex flex-wrap gap-6 text-xs">
              <div className="flex items-center gap-2">
                <Key className="w-3 h-3 text-yellow-500" />
                <span className="text-muted-foreground">Primary Key</span>
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="w-3 h-3 text-blue-500" />
                <span className="text-muted-foreground">Foreign Key</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
