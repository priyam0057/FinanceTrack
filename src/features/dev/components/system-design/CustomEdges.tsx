
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
  useReactFlow,
} from '@xyflow/react';
import { X } from 'lucide-react';

export function CustomDeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    setEdges((edges) => edges.filter((e) => e.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan flex flex-col items-center gap-1"
        >
          {label && (
            <div className="bg-background px-2 py-0.5 rounded border border-border text-[10px] font-medium text-foreground shadow-sm">
              {label}
            </div>
          )}
          <button
            className="w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-md border border-border"
            onClick={(event) => onEdgeClick(event, id)}
            aria-label="Delete connection"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const customEdgeTypes = {
  deletable: CustomDeletableEdge,
};
