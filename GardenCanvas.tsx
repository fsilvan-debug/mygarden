
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GardenObject, Point } from './types';
import { SCALE, GARDEN_DIMENSIONS, COLORS } from './constants';

interface GardenCanvasProps {
  objects: GardenObject[];
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (obj: GardenObject) => void;
  selectedId: string | null;
  canvasRef: React.RefObject<SVGSVGElement | null>;
}

const GardenCanvas: React.FC<GardenCanvasProps> = ({ objects, onSelectObject, onUpdateObject, selectedId, canvasRef }) => {
  const { width: gardenWidth, height: gardenHeight, recessX, recessY } = GARDEN_DIMENSIONS;
  const svgRef = useRef<SVGSVGElement>(null);
  
  const setRefs = (node: SVGSVGElement) => {
    (svgRef as any).current = node;
    if (canvasRef) (canvasRef as any).current = node;
  };
  
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPos, setTempPos] = useState({ x: 0, y: 0 });

  const minorGridSize = SCALE * 0.2; 
  const majorGridSize = SCALE;       

  const boundaryPoints: Point[] = [
    { x: 0, y: 0 },                        
    { x: gardenWidth - recessX, y: 0 },    
    { x: gardenWidth - recessX, y: recessY },
    { x: gardenWidth, y: recessY },        
    { x: gardenWidth, y: gardenHeight },   
    { x: 0, y: gardenHeight },             
  ];

  const polygonPath = useMemo(() => boundaryPoints.map(p => `${p.x * SCALE},${p.y * SCALE}`).join(' '), [boundaryPoints]);

  const getSVGPoint = (e: MouseEvent | React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const transformed = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return { x: (transformed.x / SCALE) || 0, y: (transformed.y / SCALE) || 0 };
  };

  const handleMouseDown = (e: React.MouseEvent, obj: GardenObject) => {
    e.stopPropagation();
    onSelectObject(obj.id);
    const mousePos = getSVGPoint(e);
    setDraggingId(obj.id);
    setDragOffset({ x: mousePos.x - obj.x, y: mousePos.y - obj.y });
    setTempPos({ x: obj.x, y: obj.y });
  };

  useEffect(() => {
    if (!draggingId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mousePos = getSVGPoint(e);
      const obj = objects.find(o => o.id === draggingId);
      if (!obj) return;

      const newX = Math.max(0, Math.min(gardenWidth - obj.width, mousePos.x - dragOffset.x));
      const newY = Math.max(0, Math.min(gardenHeight - obj.height, mousePos.y - dragOffset.y));

      setTempPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      const obj = objects.find(o => o.id === draggingId);
      if (obj) {
        onUpdateObject({ 
          ...obj, 
          x: Number(tempPos.x.toFixed(2)), 
          y: Number(tempPos.y.toFixed(2)) 
        });
      }
      setDraggingId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset, objects, tempPos, gardenWidth, gardenHeight]);

  return (
    <div className="flex-1 bg-zinc-400 p-8 overflow-auto flex items-center justify-center min-h-screen">
      <div className="relative shadow-2xl bg-white rounded-lg p-12">
        <svg 
          ref={setRefs}
          width={gardenWidth * SCALE} 
          height={gardenHeight * SCALE}
          viewBox={`0 0 ${gardenWidth * SCALE} ${gardenHeight * SCALE}`}
          className="overflow-visible select-none touch-none bg-white border-2 border-zinc-200"
          onClick={() => onSelectObject(null)}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="minorGrid" width={minorGridSize} height={minorGridSize} patternUnits="userSpaceOnUse">
              <path d={`M ${minorGridSize} 0 L 0 0 0 ${minorGridSize}`} fill="none" stroke="#92400e" strokeWidth="0.8" opacity="0.4" />
            </pattern>
            <pattern id="majorGrid" width={majorGridSize} height={majorGridSize} patternUnits="userSpaceOnUse">
              <rect width={majorGridSize} height={majorGridSize} fill="url(#minorGrid)"/>
              <path d={`M ${majorGridSize} 0 L 0 0 0 ${majorGridSize}`} fill="none" stroke={COLORS.gridMajor} strokeWidth="2" opacity="0.6" />
            </pattern>
          </defs>
          
          <polygon points={polygonPath} fill={COLORS.background} />
          <polygon points={polygonPath} fill="url(#majorGrid)" className="pointer-events-none" />
          
          <polygon points={polygonPath} fill="none" stroke={COLORS.border} strokeWidth="6" strokeLinejoin="round" />

          {objects.map((obj) => {
            const isDragging = draggingId === obj.id;
            const x = isDragging ? tempPos.x : obj.x;
            const y = isDragging ? tempPos.y : obj.y;
            const isSelected = selectedId === obj.id;
            const selectionColor = "#2563eb";

            return (
              <g 
                key={obj.id} 
                onMouseDown={(e) => handleMouseDown(e, obj)} 
                className={`${isDragging ? 'cursor-grabbing' : 'cursor-grab'} group transition-none`}
                style={{ transform: `translate(${x * SCALE}px, ${y * SCALE}px)` }}
              >
                {obj.type === 'tree' ? (
                  <circle 
                    cx={(obj.width / 2) * SCALE} cy={(obj.height / 2) * SCALE} r={(obj.width / 2) * SCALE}
                    fill={obj.color} stroke={isSelected ? selectionColor : "rgba(0,0,0,0.1)"} strokeWidth={isSelected ? 8 : 2}
                  />
                ) : (
                  <rect
                    width={obj.width * SCALE} height={obj.height * SCALE}
                    fill={obj.color} rx={obj.type === 'fence' ? 2 : 4} 
                    stroke={isSelected ? selectionColor : "rgba(0,0,0,0.1)"} 
                    strokeWidth={isSelected ? 8 : 2}
                  />
                )}
                <text 
                  x={(obj.width / 2) * SCALE} 
                  y={(obj.height / 2) * SCALE} 
                  textAnchor="middle" 
                  dominantBaseline="middle" 
                  fontSize="16" 
                  fill={obj.type === 'fence' ? 'black' : 'white'} 
                  className="pointer-events-none font-black select-none drop-shadow-sm"
                >
                  {obj.label}
                </text>
              </g>
            );
          })}

          <g className="font-black fill-emerald-950 pointer-events-none">
            <text x={(gardenWidth * SCALE) / 2} y="-35" textAnchor="middle" fontSize="24">קיר מזרחי: 14.1 מ'</text>
            <text x={gardenWidth * SCALE + 40} y={(gardenHeight * SCALE) / 2} textAnchor="start" fontSize="22" transform={`rotate(90, ${gardenWidth * SCALE + 40}, ${(gardenHeight * SCALE) / 2})`}>קיר דרומי: 8.5 מ'</text>
            <text x="-50" y={(gardenHeight * SCALE) / 2} textAnchor="middle" fontSize="22" transform={`rotate(-90, -50, ${(gardenHeight * SCALE) / 2})`}>קיר צפוני: 8.5 מ'</text>
            <text x={(gardenWidth * SCALE) / 2} y={(gardenHeight * SCALE) + 50} textAnchor="middle" fontSize="24">קיר מערבי: 14.1 מ'</text>
          </g>

          <g transform={`translate(20, ${gardenHeight * SCALE - 40})`} className="pointer-events-none">
            <rect width={SCALE} height="8" fill="#1e293b" rx="2" />
            <text x={SCALE / 2} y="-10" textAnchor="middle" fontSize="18" fill="#1e293b" className="font-black">1 מטר</text>
            <line x1="0" y1="0" x2="0" y2="8" stroke="#1e293b" strokeWidth="2" />
            <line x1={SCALE} y1="0" x2={SCALE} y2="8" stroke="#1e293b" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default GardenCanvas;
