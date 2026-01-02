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

interface DatabaseEditorProps {
  projectId: string;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const defaultNodes: Node<CustomNodeData>[] = [];

const defaultEdges: Edge[] = [];

import { useSystemDesign } from '../../hooks/useSystemDesign';

// ... (imports remain the same, ensure CustomNodeData is imported)

function DatabaseEditorInner({ projectId, isFullscreen, onToggleFullscreen }: DatabaseEditorProps) {
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
      loadDiagram('database').then((data) => {
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
        saveDiagram('database', nodes, edges);
      }, 2000); // Increased debounce to 2s to reduce DB writes
      return () => clearTimeout(timer);
    }
  }, [nodes, edges, autoSave, initialized, saveDiagram]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, id: `edge-${Date.now()}`, type: 'deletable', markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#8b5cf6', strokeWidth: 2 }, label: '1:N' }, eds));
    toast.success('Relationship created!');
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
      id: `table-${Date.now()}`, type: 'table', draggable: true,
      position: { x: 250 + Math.random() * 100, y: 200 + Math.random() * 100 },
      data: { label: 'new_table', nodeType: 'table', description: '', notes: [],
        fields: [{ name: 'id', type: 'uuid', isPK: true }, { name: 'field1', type: 'text' }, { name: 'field2', type: 'text' }] },
    }]);
    toast.success('Added table');
  }, [setNodes]);

  const handleSave = useCallback(() => {
    saveDiagram('database', nodes, edges);
    toast.success('Saved to database!');
  }, [nodes, edges, saveDiagram]);

  const handleReset = useCallback(() => {
    setNodes(defaultNodes); setEdges(defaultEdges);
    saveDiagram('database', [], []);
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
        defaultEdgeOptions={{ style: { strokeWidth: 2, stroke: '#8b5cf6' }, markerEnd: { type: MarkerType.ArrowClosed } }}
        className="bg-background"
      >
        <DiagramToolbar
          mode="database" onAddNode={handleAddNode}
          onZoomIn={zoomIn} onZoomOut={zoomOut} onFitView={() => fitView({ padding: 0.2 })}
          onSave={handleSave} onReset={handleReset} onDeleteSelected={handleDeleteSelected}
          hasSelection={selectedNodes.length > 0}
          autoSave={autoSave} onAutoSaveChange={setAutoSave}
          isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen}
        />
        <Panel position="top-right" className="flex gap-2">
          <DiagramExport nodes={nodes} edges={edges} projectId={projectId} diagramType="database" flowRef={flowRef} onImport={handleImport} />
          <DiagramTemplates nodes={nodes} edges={edges} diagramType="database" onLoadTemplate={handleLoadTemplate} />
          <VersionHistory nodes={nodes} edges={edges} projectId={projectId} diagramType="database" onRestore={handleLoadTemplate} />
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

export function DatabaseEditor(props: DatabaseEditorProps) {
  return <ReactFlowProvider><DatabaseEditorInner {...props} /></ReactFlowProvider>;
}
