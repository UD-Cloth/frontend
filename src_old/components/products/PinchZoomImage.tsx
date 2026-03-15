 import { useState, useRef, useCallback } from "react";
 import { cn } from "@/lib/utils";
 
 interface PinchZoomImageProps {
   src: string;
   alt: string;
   className?: string;
 }
 
 export const PinchZoomImage = ({ src, alt, className }: PinchZoomImageProps) => {
   const [scale, setScale] = useState(1);
   const [position, setPosition] = useState({ x: 0, y: 0 });
   const containerRef = useRef<HTMLDivElement>(null);
   const initialDistance = useRef<number | null>(null);
   const initialScale = useRef(1);
   const lastPosition = useRef({ x: 0, y: 0 });
   const isDragging = useRef(false);
 
   const getDistance = (e: React.TouchEvent) => {
     const touch0 = e.touches.item(0);
     const touch1 = e.touches.item(1);
     if (!touch0 || !touch1) return 0;
     const dx = touch0.clientX - touch1.clientX;
     const dy = touch0.clientY - touch1.clientY;
     return Math.sqrt(dx * dx + dy * dy);
   };
 
   const handleTouchStart = useCallback((e: React.TouchEvent) => {
     if (e.touches.length === 2) {
       e.preventDefault();
       initialDistance.current = getDistance(e);
       initialScale.current = scale;
     } else if (e.touches.length === 1 && scale > 1) {
       isDragging.current = true;
       const touch = e.touches.item(0);
       if (!touch) return;
       lastPosition.current = {
         x: touch.clientX - position.x,
         y: touch.clientY - position.y,
       };
     }
   }, [scale, position]);
 
   const handleTouchMove = useCallback((e: React.TouchEvent) => {
     if (e.touches.length === 2 && initialDistance.current) {
       e.preventDefault();
       const currentDistance = getDistance(e);
       const newScale = Math.min(Math.max(initialScale.current * (currentDistance / initialDistance.current), 1), 4);
       setScale(newScale);
       
       if (newScale === 1) {
         setPosition({ x: 0, y: 0 });
       }
     } else if (e.touches.length === 1 && isDragging.current && scale > 1) {
       e.preventDefault();
       const container = containerRef.current;
       if (!container) return;
       
       const touch = e.touches.item(0);
       if (!touch) return;
       
       const rect = container.getBoundingClientRect();
       const maxX = (rect.width * (scale - 1)) / 2;
       const maxY = (rect.height * (scale - 1)) / 2;
       
       const newX = touch.clientX - lastPosition.current.x;
       const newY = touch.clientY - lastPosition.current.y;
       
       setPosition({
         x: Math.min(Math.max(newX, -maxX), maxX),
         y: Math.min(Math.max(newY, -maxY), maxY),
       });
     }
   }, [scale]);
 
   const handleTouchEnd = useCallback(() => {
     initialDistance.current = null;
     isDragging.current = false;
   }, []);
 
   const handleDoubleClick = useCallback(() => {
     if (scale > 1) {
       setScale(1);
       setPosition({ x: 0, y: 0 });
     } else {
       setScale(2);
     }
   }, [scale]);
 
   return (
     <div
       ref={containerRef}
       className={cn("relative overflow-hidden touch-none", className)}
       onTouchStart={handleTouchStart}
       onTouchMove={handleTouchMove}
       onTouchEnd={handleTouchEnd}
       onDoubleClick={handleDoubleClick}
     >
       <img
         src={src}
         alt={alt}
         className="w-full h-full object-contain transition-transform duration-100"
         style={{
           transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
         }}
         draggable={false}
       />
       {scale > 1 && (
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 px-3 py-1 rounded-full text-sm text-foreground">
           {Math.round(scale * 100)}%
         </div>
       )}
     </div>
   );
 };