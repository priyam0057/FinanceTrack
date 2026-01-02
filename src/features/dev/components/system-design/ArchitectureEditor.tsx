import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow, Controls, MiniMap, Background, BackgroundVariant, useNodesState, useEdgesState,
  addEdge, Connection, Edge, Node, useReactFlow, ReactFlowProvider, MarkerType, Panel, ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { customNodeTypes } from './CustomNodes';
import { customEdgeTypes } from './CustomEdges';
import { CustomNodeData, CustomNodeType } from './types';
import { DiagramToolbar } from './DiagramToolbar';
import { NodeDetailsSidebar } from './NodeDetailsSidebar';
import { DiagramExport } from './DiagramExport';
import { DiagramTemplates } from './DiagramTemplates';
import { VersionHistory } from './VersionHistory';
import { toast } from 'sonner';

interface ArchitectureEditorProps {
  projectId: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const defaultNodes: Node<CustomNodeData>[] = [];

const defaultEdges: Edge[] = [];

import { useSystemDesign } from '../../hooks/useSystemDesign';

// ... (imports remain the same, ensure CustomNodeData is imported)

function ArchitectureEditorInner({ projectId, isFullscreen, onToggleFullscreen }: ArchitectureEditorProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const flowRef = useRef<HTMLDivElement>(null);
  
  const { loadDiagram, saveDiagram, loading } = useSystemDesign(projectId);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState<{ id: string; data: CustomNodeData } | null>(null);
  const [autoSave, setAutoSave] = useState(true);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultEdges);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!initialized) {
      loadDiagram('architecture').then((data) => {
        if (data) {
          setNodes(data.nodes.map(n => ({ ...n, draggable: true })) as Node<CustomNodeData>[]);
          setEdges(data.edges.map(e => ({ ...e, type: 'deletable' })));
        }
        setInitialized(true);
      });
    }
  }, [projectId, loadDiagram, initialized, setNodes, setEdges]);

  // Auto-save
  useEffect(() => {
    if (autoSave && initialized) {
      const timer = setTimeout(() => {
        saveDiagram('architecture', nodes, edges);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, autoSave, initialized, saveDiagram]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, id: `edge-${Date.now()}`, type: 'deletable', markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeWidth: 2 } }, eds));
    toast.success('Connected!');
  }, [setEdges]);

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    setSelectedNodes(nodes.map(n => n.id));
  }, []);

  const onNodeDoubleClick = useCallback((e: React.MouseEvent, node: Node) => {
    setSelectedNodeForEdit({ id: node.id, data: node.data as CustomNodeData });
    setSidebarOpen(true);
  }, []);

  const handleSaveNodeDetails = useCallback((nodeId: string, updates: Partial<CustomNodeData>) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...updates } } : n));
    toast.success('Saved!');
  }, [setNodes]);

  const handleAddNode = useCallback((type: CustomNodeType) => {
    setNodes((nds) => [...nds, {
      id: `${type}-${Date.now()}`, type: 'architecture', draggable: true,
      position: { x: 250 + Math.random() * 100, y: 200 + Math.random() * 100 },
      data: { label: type.charAt(0).toUpperCase() + type.slice(1), sublabel: 'New', nodeType: type, description: '', notes: [] },
    }]);
    toast.success(`Added ${type}`);
  }, [setNodes]);

  const handleSave = useCallback(() => {
    saveDiagram('architecture', nodes, edges);
    toast.success('Saved to database!');
  }, [nodes, edges, saveDiagram]);

  const handleReset = useCallback(() => {
    setNodes(defaultNodes); setEdges(defaultEdges);
    saveDiagram('architecture', [], []);
    toast.success('Reset!');
  }, [setNodes, setEdges, saveDiagram]);

  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
    setEdges((eds) => eds.filter((e) => !selectedNodes.includes(e.source) && !selectedNodes.includes(e.target)));
    setSelectedNodes([]);
  }, [selectedNodes, setNodes, setEdges]);

  const handleImport = useCallback((data: { nodes: Node[]; edges: Edge[] }) => {
    setNodes(data.nodes.map(n => ({ ...n, draggable: true })) as Node<CustomNodeData>[]);
    setEdges(data.edges.map(e => ({ ...e, type: 'deletable' })));
  }, [setNodes, setEdges]);

  const handleLoadTemplate = useCallback((templateNodes: Node[], templateEdges: Edge[]) => {
    setNodes(templateNodes.map(n => ({ ...n, draggable: true })) as Node<CustomNodeData>[]);
    setEdges(templateEdges.map(e => ({ ...e, type: 'deletable' })));
  }, [setNodes, setEdges]);

  return (
    <div ref={flowRef} className="h-[600px] w-full rounded-xl border border-border overflow-hidden relative">
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onSelectionChange={onSelectionChange}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={customNodeTypes}
        edgeTypes={customEdgeTypes}
        nodesDraggable nodesConnectable elementsSelectable
        connectOnClick connectionMode={ConnectionMode.Loose}
        selectNodesOnDrag={false} panOnDrag={[1, 2]}
        selectionOnDrag panOnScroll={false} zoomOnScroll
        fitView snapToGrid snapGrid={[20, 20]}
        defaultEdgeOptions={{ style: { strokeWidth: 2, stroke: 'hsl(var(--muted-foreground))' }, markerEnd: { type: MarkerType.ArrowClosed } }}
        className="bg-background"
      >
        <DiagramToolbar
          mode="architecture" onAddNode={handleAddNode}
          onZoomIn={zoomIn} onZoomOut={zoomOut} onFitView={() => fitView({ padding: 0.2 })}
          onSave={handleSave} onReset={handleReset} onDeleteSelected={handleDeleteSelected}
          hasSelection={selectedNodes.length > 0}
          autoSave={autoSave} onAutoSaveChange={setAutoSave}
          isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen}
        />
        <Panel position="top-right" className="flex gap-2">
          <DiagramExport nodes={nodes} edges={edges} projectId={projectId} diagramType="architecture" flowRef={flowRef} onImport={handleImport} />
          <DiagramTemplates nodes={nodes} edges={edges} diagramType="architecture" onLoadTemplate={handleLoadTemplate} />
          <VersionHistory nodes={nodes} edges={edges} projectId={projectId} diagramType="architecture" onRestore={handleLoadTemplate} />
        </Panel>
        <Controls className="!bg-background !border-border !shadow-lg" />
        <MiniMap className="!bg-background !border-border" nodeStrokeWidth={3} zoomable pannable />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-background" />
      </ReactFlow>
      <NodeDetailsSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        nodeId={selectedNodeForEdit?.id || ''} nodeData={selectedNodeForEdit?.data || null}
        onSave={handleSaveNodeDetails} />
    </div>
  );
}

export function ArchitectureEditor(props: ArchitectureEditorProps) {
  return <ReactFlowProvider><ArchitectureEditorInner {...props} /></ReactFlowProvider>;
}
