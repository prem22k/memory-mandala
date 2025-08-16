import { useRef, useEffect, useState } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { type Memory } from '../types';

interface MandalaDisplayProps {
  memories: Memory[];
  onMemorySelect: (memory: Memory | null) => void;
}

const MandalaDisplay: React.FC<MandalaDisplayProps> = ({ memories, onMemorySelect }) => {
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState(600);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setCanvasSize(mobile ? 350 : 600);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(canvasSize, canvasSize).parent(canvasParentRef);
    p5.angleMode(p5.DEGREES);
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    p5.rectMode(p5.CENTER);
  };

  const mouseClicked = (p5: p5Types) => {
    const mouseDist = p5.dist(p5.mouseX, p5.mouseY, p5.width / 2, p5.height / 2);
    const clickedIndex = memories.findIndex((_memory, index) => {
      const radius = (isMobile ? 40 : 60) + index * (isMobile ? 25 : 35);
      return mouseDist > radius - 15 && mouseDist < radius + 15;
    });

    if (clickedIndex !== -1) {
      onMemorySelect(memories[clickedIndex]);
    } else {
      onMemorySelect(null);
    }
  };

  const draw = (p5: p5Types) => {
    // Reduce animation speed on mobile for better performance
    const animationSpeed = isMobile ? 0.01 : 0.02;
    const timeSpeed = isMobile ? 0.01 : 0.015;
    
    timeRef.current += animationSpeed;
    animationRef.current += timeSpeed;
    
    // Simple background for mobile, gradient for desktop
    if (isMobile) {
      p5.background(0);
    } else {
      // Create beautiful gradient background only on desktop
      p5.background(0);
      for (let i = 0; i < p5.width; i += 2) {
        for (let j = 0; j < p5.height; j += 2) {
          const dist = p5.dist(i, j, p5.width / 2, p5.height / 2);
          const maxDist = p5.width / 2;
          const normalizedDist = p5.map(dist, 0, maxDist, 0, 1);
          
          const hue = 220 + normalizedDist * 40;
          const sat = 30 + normalizedDist * 20;
          const bright = 5 + normalizedDist * 15;
          const alpha = p5.map(normalizedDist, 0, 1, 0.3, 0.1);
          
          p5.set(i, j, p5.color(hue, sat, bright, alpha));
        }
      }
      p5.updatePixels();
    }
    
    p5.translate(p5.width / 2, p5.height / 2);

    // Draw ambient particles only on desktop
    if (!isMobile) {
      drawAmbientParticles(p5);
    }
    
    // Draw mandala layers
    memories.forEach((memory, index) => {
      const baseRadius = (isMobile ? 40 : 60) + index * (isMobile ? 25 : 35);
      const mouseDist = p5.dist(p5.mouseX, p5.mouseY, p5.width / 2, p5.height / 2);
      const isHovered = mouseDist > baseRadius - 15 && mouseDist < baseRadius + 15;
      
      drawMandalaLayer(p5, memory, baseRadius, index, isHovered);
    });

    // Draw central core
    drawCentralCore(p5);
  };

  const drawAmbientParticles = (p5: p5Types) => {
    p5.stroke(210, 40, 80, 0.4);
    p5.strokeWeight(1);
    p5.noFill();
    
    for (let i = 0; i < 20; i++) {
      const angle = timeRef.current * 30 + i * 18;
      const radius = 200 + p5.sin(timeRef.current * 3 + i) * 20;
      const x = radius * p5.cos(angle);
      const y = radius * p5.sin(angle);
      const size = p5.sin(timeRef.current * 2 + i) * 2 + 2;
      p5.circle(x, y, size);
    }
  };

  const drawCentralCore = (p5: p5Types) => {
    const coreSize = isMobile ? 25 : 40;
    
    // Inner glow
    p5.drawingContext.shadowBlur = isMobile ? 15 : 30;
    p5.drawingContext.shadowColor = p5.color(210, 60, 80);
    
    // Core circle
    p5.fill(210, 60, 80, 0.3);
    p5.stroke(210, 80, 90, 0.8);
    p5.strokeWeight(isMobile ? 1 : 2);
    p5.circle(0, 0, coreSize);
    
    // Inner pattern
    p5.stroke(210, 100, 100, 0.6);
    p5.strokeWeight(1);
    p5.noFill();
    const patternRadius = isMobile ? 10 : 15;
    for (let i = 0; i < 360; i += 30) {
      const x = patternRadius * p5.cos(i);
      const y = patternRadius * p5.sin(i);
      p5.line(0, 0, x, y);
    }
    
    p5.drawingContext.shadowBlur = 0;
  };

  const drawMandalaLayer = (p5: p5Types, memory: Memory, baseRadius: number, index: number, isHovered: boolean) => {
    const color = p5.color(memory.art_instructions.color);
    const hue = p5.hue(color);
    const sat = p5.saturation(color);
    const bright = p5.brightness(color);
    
    // Reduce layers on mobile for better performance
    const layers = isMobile ? 3 : 5;
    const pulse = p5.sin(animationRef.current + index * 0.8) * (isMobile ? 0.1 : 0.15) + 1;
    
    for (let layer = 0; layer < layers; layer++) {
      const layerRadius = baseRadius + layer * (isMobile ? 2 : 3);
      const layerAlpha = isHovered ? 0.9 - layer * 0.15 : 0.7 - layer * 0.1;
      const currentRadius = layerRadius * pulse;
      
      // Enhanced glow effect
      if (isHovered) {
        p5.drawingContext.shadowBlur = isMobile ? 20 - layer * 3 : 35 - layer * 5;
        p5.drawingContext.shadowColor = p5.color(hue, sat, bright, 0.8);
      } else {
        p5.drawingContext.shadowBlur = isMobile ? 8 - layer * 1 : 15 - layer * 2;
        p5.drawingContext.shadowColor = p5.color(hue, sat, bright, 0.5);
      }
      
      p5.stroke(hue, sat, bright, layerAlpha);
      p5.strokeWeight(isHovered ? (isMobile ? 2 - layer * 0.2 : 3 - layer * 0.3) : (isMobile ? 1.5 - layer * 0.15 : 2 - layer * 0.2));
      p5.noFill();
      
              drawComplexPattern(p5, memory.art_instructions.pattern, currentRadius, index);
    }
    
    // Reset shadow
    p5.drawingContext.shadowBlur = 0;
    
    // Add floating elements only on desktop
    if (!isMobile) {
      drawFloatingElements(p5, baseRadius, hue, sat, bright, index, isHovered);
    }
  };

  const drawComplexPattern = (p5: p5Types, pattern: string, radius: number, index: number) => {
    const rotation = timeRef.current * (isMobile ? 5 : 10) + index * 45;
    p5.push();
    p5.rotate(rotation);
    
    switch (pattern) {
      case 'circle':
        // Concentric circles with inner details
        p5.circle(0, 0, radius * 2);
        p5.circle(0, 0, radius * 1.6);
        p5.circle(0, 0, radius * 1.2);
        
        // Inner flower pattern
        for (let i = 0; i < (isMobile ? 6 : 8); i++) {
          const angle = i * (isMobile ? 60 : 45);
          const x = radius * 0.4 * p5.cos(angle);
          const y = radius * 0.4 * p5.sin(angle);
          p5.circle(x, y, radius * 0.2);
        }
        break;
        
      case 'square':
        // Rotating squares with diamond pattern
        p5.rect(0, 0, radius * 2, radius * 2);
        p5.rotate(45);
        p5.rect(0, 0, radius * 1.4, radius * 1.4);
        p5.rotate(-90);
        p5.rect(0, 0, radius * 0.8, radius * 0.8);
        
        // Corner elements
        for (let i = 0; i < 4; i++) {
          p5.rotate(90);
          const x = radius * 0.8;
          const y = 0;
          p5.circle(x, y, radius * 0.3);
        }
        break;
        
      case 'triangle':
        // Star pattern with triangles
        for (let i = 0; i < 3; i++) {
          p5.rotate(120);
          p5.triangle(
            0, -radius,
            -radius * 0.7, radius * 0.7,
            radius * 0.7, radius * 0.7
          );
        }
        
        // Inner star
        p5.rotate(60);
        for (let i = 0; i < 3; i++) {
          p5.rotate(120);
          p5.triangle(
            0, -radius * 0.5,
            -radius * 0.35, radius * 0.35,
            radius * 0.35, radius * 0.35
          );
        }
        break;
        
      case 'line':
        // Spiral pattern with radiating lines
        for (let i = 0; i < 360; i += (isMobile ? 12 : 8)) {
          const spiralRadius = radius * (0.3 + (i / 360) * 0.7);
          const x = spiralRadius * p5.cos(i);
          const y = spiralRadius * p5.sin(i);
          p5.line(0, 0, x, y);
        }
        
        // Outer ring of dots
        for (let i = 0; i < (isMobile ? 16 : 24); i++) {
          const angle = i * (isMobile ? 22.5 : 15);
          const x = radius * 0.9 * p5.cos(angle);
          const y = radius * 0.9 * p5.sin(angle);
          p5.circle(x, y, 3);
        }
        break;
        
      case 'arc':
        // Flower-like pattern with arcs
        for (let i = 0; i < (isMobile ? 8 : 12); i++) {
          p5.rotate(isMobile ? 45 : 30);
          p5.arc(0, 0, radius * 2, radius * 2, 0, 60);
          p5.arc(0, 0, radius * 1.5, radius * 1.5, 30, 90);
        }
        
        // Inner petals
        for (let i = 0; i < (isMobile ? 6 : 8); i++) {
          p5.rotate(isMobile ? 60 : 45);
          p5.ellipse(radius * 0.3, 0, radius * 0.4, radius * 0.2);
        }
        break;
        
      default:
        // Default flower pattern
        for (let i = 0; i < (isMobile ? 8 : 12); i++) {
          p5.rotate(isMobile ? 45 : 30);
          p5.ellipse(radius * 0.6, 0, radius * 0.4, radius * 0.2);
        }
        p5.circle(0, 0, radius * 0.8);
    }
    
    p5.pop();
  };

  const drawFloatingElements = (p5: p5Types, radius: number, hue: number, sat: number, bright: number, index: number, isHovered: boolean) => {
    const elements = isHovered ? 6 : 3;
    
    for (let i = 0; i < elements; i++) {
      const angle = timeRef.current * 15 + index * 30 + i * (360 / elements);
      const elementRadius = radius + 15 + p5.sin(timeRef.current * 2 + i) * 5;
      const x = elementRadius * p5.cos(angle);
      const y = elementRadius * p5.sin(angle);
      const size = p5.sin(timeRef.current * 1.5 + i) * 2 + 3;
      
      p5.fill(hue, sat, bright, 0.6);
      p5.stroke(hue, sat, bright, 0.8);
      p5.strokeWeight(1);
      p5.circle(x, y, size);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />
      {memories.length === 0 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'var(--primary-text)',
          opacity: 0.7,
          pointerEvents: 'none',
          background: 'rgba(0, 0, 0, 0.5)',
          padding: isMobile ? '1.5rem' : '2rem',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          maxWidth: isMobile ? '280px' : 'auto'
        }}>
          <p style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: '500' }}>✨ Your Mandala Awaits ✨</p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: isMobile ? '0.8rem' : '0.9rem', opacity: 0.8 }}>
            Add memories to see your celestial garden bloom
          </p>
        </div>
      )}
    </div>
  );
};

export default MandalaDisplay;
