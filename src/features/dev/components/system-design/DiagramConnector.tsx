interface DiagramConnectorProps {
  direction?: 'down' | 'right' | 'left';
  animated?: boolean;
  label?: string;
}

export function DiagramConnector({ 
  direction = 'down', 
  animated = true,
  label 
}: DiagramConnectorProps) {
  const isVertical = direction === 'down';
  const width = isVertical ? 40 : 80;
  const height = isVertical ? 50 : 30;
  
  return (
    <div className="flex flex-col items-center justify-center">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="connector-svg"
      >
        {isVertical ? (
          <>
            {/* Vertical line */}
            <line 
              x1={width / 2} 
              y1="0" 
              x2={width / 2} 
              y2={height - 10}
              className={`connector-line ${animated ? 'flow-animated' : ''}`}
            />
            {/* Arrow head */}
            <polygon 
              points={`${width / 2 - 6},${height - 12} ${width / 2 + 6},${height - 12} ${width / 2},${height}`}
              className="connector-arrow"
            />
          </>
        ) : (
          <>
            {/* Horizontal line */}
            <line 
              x1="0" 
              y1={height / 2} 
              x2={width - 10} 
              y2={height / 2}
              className={`connector-line ${animated ? 'flow-animated' : ''}`}
            />
            {/* Arrow head */}
            <polygon 
              points={`${width - 12},${height / 2 - 6} ${width - 12},${height / 2 + 6} ${width},${height / 2}`}
              className="connector-arrow"
            />
          </>
        )}
      </svg>
      {label && (
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      )}
    </div>
  );
}
