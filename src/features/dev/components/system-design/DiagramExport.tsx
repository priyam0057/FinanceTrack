import { useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
import { Download, Upload, Image, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { Node, Edge } from '@xyflow/react';

interface DiagramExportProps {
  nodes: Node[];
  edges: Edge[];
  projectId: string;
  diagramType: 'architecture' | 'database' | 'frontend';
  flowRef: React.RefObject<HTMLDivElement>;
  onImport: (data: { nodes: Node[]; edges: Edge[] }) => void;
}

export function DiagramExport({ nodes, edges, projectId, diagramType, flowRef, onImport }: DiagramExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export as PNG
  const handleExportPNG = useCallback(async () => {
    if (!flowRef.current) return;
    
    try {
      const reactFlowElement = flowRef.current.querySelector('.react-flow') as HTMLElement;
      if (!reactFlowElement) return;

      const dataUrl = await toPng(reactFlowElement, {
        backgroundColor: '#0a0a0a',
        quality: 1,
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `${diagramType}-diagram-${projectId.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Exported as PNG!');
    } catch (error) {
      toast.error('Failed to export PNG');
      console.error(error);
    }
  }, [flowRef, projectId, diagramType]);

  // Export as JSON
  const handleExportJSON = useCallback(() => {
    const data = {
      version: '1.0',
      type: diagramType,
      projectId,
      exportedAt: new Date().toISOString(),
      nodes,
      edges,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${diagramType}-diagram-${projectId.slice(0, 8)}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as JSON!');
  }, [nodes, edges, projectId, diagramType]);

  // Import JSON
  const handleImportJSON = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && data.edges) {
          onImport({ nodes: data.nodes, edges: data.edges });
          toast.success('Diagram imported!');
        } else {
          toast.error('Invalid diagram file');
        }
      } catch (error) {
        toast.error('Failed to parse file');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImport]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportJSON}
        className="hidden"
      />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">Export</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleExportPNG} className="gap-2 cursor-pointer">
            <Image className="w-4 h-4 text-blue-500" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJSON} className="gap-2 cursor-pointer">
            <FileJson className="w-4 h-4 text-green-500" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">Import</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="gap-2 cursor-pointer">
            <Upload className="w-4 h-4 text-orange-500" />
            Import from JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
