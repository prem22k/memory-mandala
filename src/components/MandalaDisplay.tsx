import { useRef, useEffect, useState } from 'react';
import Sketch from 'react-p5';
import p5Types from 'p5';
import { type Memory } from '../types';

interface MandalaDisplayProps {
  memories: Memory[];
  onMemorySelect: (memory: Memory | null) => void;
  selectedMemory?: Memory | null;
}

const MandalaDisplay: React.FC<MandalaDisplayProps> = ({ memories, onMemorySelect, selectedMemory }) => {
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [canvasSize, setCanvasSize] = useState(600);
  const [mode, setMode] = useState<'canvas' | 'svg' | 'webgl'>('canvas');
  const p5Ref = useRef<p5Types | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

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

  // Small deterministic pseudo-random based on seed
  const seededRandom = (p5: p5Types, seed: number) => {
    p5.randomSeed(seed);
    p5.noiseSeed(seed);
  };

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5Ref.current = p5;
    if (mode === 'webgl') {
      const renderer = (p5 as unknown as any).createCanvas(canvasSize, canvasSize, (p5 as any).WEBGL);
      renderer.parent(canvasParentRef);
    } else {
      p5.createCanvas(canvasSize, canvasSize).parent(canvasParentRef);
      p5.angleMode(p5.DEGREES);
      p5.colorMode(p5.HSB, 360, 100, 100, 1);
      p5.rectMode(p5.CENTER);
    }
  };

  const mouseClicked = (p5: p5Types) => {
    if (mode !== 'canvas') return;
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
    if (mode === 'svg') return; // Skip drawing when in SVG mode

    const animationSpeed = isMobile ? 0.01 : 0.02;
    const timeSpeed = isMobile ? 0.01 : 0.015;
    timeRef.current += animationSpeed;
    animationRef.current += timeSpeed;

    if (mode === 'webgl') {
      drawWebGL(p5);
      return;
    }

    if (isMobile) {
      p5.background(0);
    } else {
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

    if (!isMobile) {
      drawAmbientParticles(p5);
    }
    
    memories.forEach((memory, index) => {
      const baseRadius = (isMobile ? 40 : 60) + index * (isMobile ? 25 : 35);
      const mouseDist = p5.dist(p5.mouseX, p5.mouseY, p5.width / 2, p5.height / 2);
      const isHovered = mouseDist > baseRadius - 15 && mouseDist < baseRadius + 15;
      drawMandalaLayer(p5, memory, baseRadius, index, isHovered);
    });

    drawCentralCore(p5);
  };

  const drawWebGL = (p5: p5Types) => {
    const gl = (p5 as any);
    gl.clear(0);
    gl.background(0);
    gl.orbitControl?.(2, 2); // gentle orbit
    gl.rotateX(timeRef.current * 5);
    gl.rotateZ(timeRef.current * 3);

    memories.forEach((memory, index) => {
      const params = memory.art_instructions || ({} as Memory['art_instructions']);
      const color = params.color || '#30a8f0';
      const seed = params.seed ?? 1337 + index * 101;
      const symmetry = Math.max(2, Math.min(params.symmetry ?? 12, 36));
      const baseRadius = (isMobile ? 40 : 60) + index * (isMobile ? 25 : 35);

      seededRandom(p5, seed);
      gl.push();
      const step = 360 / symmetry;
      for (let a = 0; a < 360; a += step) {
        gl.push();
        gl.rotateZ(a);
        gl.noFill();
        gl.stroke(color);
        gl.strokeWeight(1.2);
        // 3D ring segments
        for (let r = baseRadius * 0.6; r < baseRadius * 1.1; r += 8) {
          gl.beginShape();
          for (let ang = 0; ang <= 360; ang += 15) {
            const x = r * gl.cos(ang);
            const y = r * gl.sin(ang);
            const z = gl.sin(timeRef.current * 40 + ang * 0.5 + r * 0.1) * 6; // gentle wave height
            gl.vertex(x, y, z);
          }
          gl.endShape();
        }
        gl.pop();
      }
      gl.pop();
    });
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
    p5.drawingContext.shadowBlur = isMobile ? 15 : 30;
    p5.drawingContext.shadowColor = p5.color(210, 60, 80);
    p5.fill(210, 60, 80, 0.3);
    p5.stroke(210, 80, 90, 0.8);
    p5.strokeWeight(isMobile ? 1 : 2);
    p5.circle(0, 0, coreSize);
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

  const applyStrokeStyle = (p5: p5Types, style?: string) => {
    if (style === 'dotted') {
      p5.drawingContext.setLineDash([2, 6]);
    } else if (style === 'dashed') {
      p5.drawingContext.setLineDash([8, 8]);
    } else {
      p5.drawingContext.setLineDash([]);
    }
  };

  const drawMandalaLayer = (p5: p5Types, memory: Memory, baseRadius: number, index: number, isHovered: boolean) => {
    const params = memory.art_instructions || ({} as Memory['art_instructions']);
    const color = p5.color(params.color || '#30a8f0');
    const secondary = p5.color(params.secondary_color || '#ffffff');
    const hue = p5.hue(color);
    const sat = p5.saturation(color);
    const bright = p5.brightness(color);

    const symmetry = Math.max(2, Math.min(params.symmetry ?? 12, 36));
    const petals = Math.max(3, Math.min(params.petals ?? 12, 60));
    const strokeStyle = params.strokeStyle || 'solid';
    const seed = params.seed ?? 1337 + index * 101;
    const energy = params.energy || 'romantic';

    seededRandom(p5, seed);

    const layers = isMobile ? 3 : 5;
    const energyAmplitude = energy === 'calm' ? 0.06 : energy === 'energetic' ? 0.18 : 0.12;
    const pulse = p5.sin(animationRef.current + index * 0.8) * (isMobile ? energyAmplitude * 0.6 : energyAmplitude) + 1;

    for (let layer = 0; layer < layers; layer++) {
      const layerRadius = baseRadius + layer * (isMobile ? 2 : 3);
      const layerAlpha = isHovered ? 0.9 - layer * 0.15 : 0.7 - layer * 0.1;
      const currentRadius = layerRadius * pulse;

      p5.drawingContext.shadowBlur = isHovered ? (isMobile ? 20 - layer * 3 : 35 - layer * 5) : (isMobile ? 8 - layer * 1 : 15 - layer * 2);
      p5.drawingContext.shadowColor = p5.color(hue, sat, bright, isHovered ? 0.8 : 0.5);

      p5.stroke(hue, sat, bright, layerAlpha);
      p5.strokeWeight(isHovered ? (isMobile ? 2 - layer * 0.2 : 3 - layer * 0.3) : (isMobile ? 1.5 - layer * 0.15 : 2 - layer * 0.2));
      applyStrokeStyle(p5, strokeStyle);
      p5.noFill();

      drawGenerativePattern(p5, params.pattern, currentRadius, index, symmetry, petals, secondary);
    }

    p5.drawingContext.setLineDash([]);
    p5.drawingContext.shadowBlur = 0;

    if (!isMobile) {
      drawFloatingElements(p5, baseRadius, hue, sat, bright, index, isHovered);
    }
  };

  const drawGenerativePattern = (
    p5: p5Types,
    pattern: string,
    radius: number,
    index: number,
    symmetry: number,
    petals: number,
    secondary: p5Types.Color,
  ) => {
    const step = 360 / symmetry;
    p5.push();
    for (let a = 0; a < 360; a += step) {
      p5.push();
      p5.rotate(a);
      switch (pattern) {
        case 'circle':
          for (let i = 0; i < petals; i++) {
            const ang = (i / petals) * 360;
            const wobble = p5.sin(timeRef.current * 40 + i * 10 + index * 20) * (radius * 0.04);
            const r = radius * 0.5 + wobble;
            const x = r * p5.cos(ang);
            const y = r * p5.sin(ang);
            p5.ellipse(x, y, radius * 0.35, radius * 0.18);
          }
          p5.stroke(secondary);
          p5.circle(0, 0, radius * 1.2);
          break;
        case 'square':
          p5.rect(0, 0, radius * 1.4, radius * 1.4);
          p5.rotate(45);
          p5.rect(0, 0, radius, radius);
          p5.stroke(secondary);
          for (let i = 0; i < 4; i++) {
            p5.rotate(90);
            p5.circle(radius * 0.8, 0, radius * 0.25);
          }
          break;
        case 'triangle':
          for (let i = 0; i < 3; i++) {
            p5.rotate(120);
            p5.triangle(0, -radius, -radius * 0.7, radius * 0.7, radius * 0.7, radius * 0.7);
          }
          p5.rotate(60);
          p5.stroke(secondary);
          for (let i = 0; i < 3; i++) {
            p5.rotate(120);
            p5.triangle(0, -radius * 0.55, -radius * 0.35, radius * 0.35, radius * 0.35, radius * 0.35);
          }
          break;
        case 'line':
          for (let i = 0; i < 360; i += 12) {
            const spiral = radius * (0.25 + (i / 360) * 0.75);
            const x = spiral * p5.cos(i);
            const y = spiral * p5.sin(i);
            p5.line(0, 0, x, y);
          }
          p5.stroke(secondary);
          for (let i = 0; i < petals; i++) {
            const ang = (i / petals) * 360;
            const x = radius * 0.9 * p5.cos(ang);
            const y = radius * 0.9 * p5.sin(ang);
            p5.circle(x, y, 3);
          }
          break;
        case 'arc':
        default:
          for (let i = 0; i < petals; i++) {
            p5.rotate(360 / petals);
            p5.arc(0, 0, radius * 2, radius * 2, 0, 60);
            p5.arc(0, 0, radius * 1.5, radius * 1.5, 30, 90);
          }
          p5.stroke(secondary);
          for (let i = 0; i < Math.max(6, Math.floor(petals / 2)); i++) {
            p5.rotate(360 / Math.max(6, Math.floor(petals / 2)));
            p5.ellipse(radius * 0.35, 0, radius * 0.4, radius * 0.2);
          }
          break;
      }
      p5.pop();
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

  const renderSVG = () => {
    const size = canvasSize;
    const center = size / 2;
    const lcg = (seed: number) => {
      let s = seed % 2147483647;
      if (s <= 0) s += 2147483646;
      return () => (s = (s * 48271) % 2147483647) / 2147483647;
    };

    const elements: JSX.Element[] = [];

    memories.forEach((memory, index) => {
      const params = memory.art_instructions || ({} as Memory['art_instructions']);
      const color = params.color || '#30a8f0';
      const secondary = params.secondary_color || '#ffffff';
      const symmetry = Math.max(2, Math.min(params.symmetry ?? 12, 36));
      const petals = Math.max(3, Math.min(params.petals ?? 12, 60));
      const seed = params.seed ?? 1337 + index * 101;
      const rnd = lcg(seed);
      const baseRadius = (isMobile ? 40 : 60) + index * (isMobile ? 25 : 35);
      const step = 360 / symmetry;
      const groupChildren: JSX.Element[] = [];

      for (let a = 0; a < 360; a += step) {
        const rot = a;
        const petalChildren: JSX.Element[] = [];
        for (let i = 0; i < petals; i++) {
          const ang = (i / petals) * 360;
          const wobble = (Math.sin(i * 0.5) + rnd() * 0.2) * (baseRadius * 0.04);
          const r = baseRadius * 0.5 + wobble;
          const x = r * Math.cos((ang * Math.PI) / 180);
          const y = r * Math.sin((ang * Math.PI) / 180);
          petalChildren.push(
            <ellipse key={`p-${index}-${a}-${i}`} cx={x} cy={y} rx={baseRadius * 0.35} ry={baseRadius * 0.18} fill="none" stroke={color} strokeWidth={2} />
          );
        }
        petalChildren.push(
          <circle key={`ring-${index}-${a}`} cx={0} cy={0} r={baseRadius * 1.2} fill="none" stroke={secondary} strokeWidth={1.5} />
        );
        groupChildren.push(
          <g key={`g-${index}-${a}`} transform={`rotate(${rot})`}>
            {petalChildren}
          </g>
        );
      }

      elements.push(
        <g key={`layer-${index}`} transform={`translate(${center}, ${center})`}>
          {groupChildren}
        </g>
      );
    });

    elements.push(
      <g key="core" transform={`translate(${center}, ${center})`}>
        <circle cx={0} cy={0} r={isMobile ? 12.5 : 20} fill="rgba(48,168,240,0.3)" stroke="rgba(48,168,240,0.8)" strokeWidth={isMobile ? 1 : 2} />
      </g>
    );

    return (
      <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: mode === 'svg' ? 'block' : 'none' }}>
        <rect x={0} y={0} width={size} height={size} fill="#000" />
        {elements}
      </svg>
    );
  };

  const handleExportPNG = () => {
    if (mode === 'canvas' && p5Ref.current) {
      p5Ref.current.saveCanvas('mandala-of-us', 'png');
    }
  };

  const handleExportPoster = () => {
    if (mode !== 'canvas' || !p5Ref.current) return;
    const p5 = p5Ref.current;
    // Draw overlay on top (temporary), then export PNG
    p5.push();
    p5.resetMatrix();
    p5.noStroke();
    p5.fill(0, 0, 0, 0.6);
    p5.rect(0, p5.height * 0.65, p5.width, p5.height * 0.35);
    p5.fill(0, 0, 100, 1);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.textFont('Playfair Display');
    p5.textSize(isMobile ? 16 : 20);
    const title = extractTitle(selectedMemory?.description || '');
    const date = extractDate(selectedMemory?.description || '');
    const poem = selectedMemory?.poetic_narrative || '';
    if (title) {
      p5.text(title, p5.width / 2, p5.height * 0.68);
    }
    if (date) {
      p5.textSize(isMobile ? 12 : 14);
      p5.text(date, p5.width / 2, p5.height * 0.72);
    }
    p5.textSize(isMobile ? 12 : 14);
    p5.textLeading(isMobile ? 16 : 20);
    const poemY = p5.height * 0.76;
    wrapAndText(p5, poem, p5.width * 0.1, poemY, p5.width * 0.8);
    p5.pop();
    p5.saveCanvas('mandala-of-us-poster', 'png');
  };

  const handleExportSVG = () => {
    if (mode === 'svg' && svgRef.current) {
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgRef.current);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'mandala-of-us.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const extractTitle = (desc: string) => {
    const match = desc.match(/Title: ([^D]+?)(?=Date:|Description:)/);
    return match ? match[1].trim() : '';
  };
  const extractDate = (desc: string) => {
    const match = desc.match(/Date: ([^D]+?)(?=Description:)/);
    return match ? match[1].trim() : '';
  };

  const wrapAndText = (p5: p5Types, text: string, x: number, y: number, maxWidth: number) => {
    const words = text.split(' ');
    let line = '';
    let lineY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (p5.textWidth(testLine) > maxWidth && n > 0) {
        p5.text(line, x + maxWidth / 2, lineY);
        line = words[n] + ' ';
        lineY += p5.textLeading();
      } else {
        line = testLine;
      }
    }
    if (line) {
      p5.text(line, x + maxWidth / 2, lineY);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Controls overlay */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 5, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', background: 'rgba(28,33,40,0.9)', border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
          <button onClick={() => setMode('canvas')} style={{ padding: '6px 10px', background: mode === 'canvas' ? 'var(--accent-color)' : 'transparent', color: mode === 'canvas' ? '#fff' : 'var(--primary-text)', border: 'none', cursor: 'pointer' }}>Canvas</button>
          <button onClick={() => setMode('svg')} style={{ padding: '6px 10px', background: mode === 'svg' ? 'var(--accent-color)' : 'transparent', color: mode === 'svg' ? '#fff' : 'var(--primary-text)', border: 'none', cursor: 'pointer' }}>SVG</button>
          <button onClick={() => setMode('webgl')} style={{ padding: '6px 10px', background: mode === 'webgl' ? 'var(--accent-color)' : 'transparent', color: mode === 'webgl' ? '#fff' : 'var(--primary-text)', border: 'none', cursor: 'pointer' }}>WebGL</button>
        </div>
        {mode === 'canvas' && (
          <>
            <button onClick={handleExportPNG} className="sign-out-button" style={{ position: 'static' }}>Export PNG</button>
            <button onClick={handleExportPoster} className="sign-out-button" style={{ position: 'static' }}>Export Poster</button>
          </>
        )}
        {mode === 'svg' && (
          <button onClick={handleExportSVG} className="sign-out-button" style={{ position: 'static' }}>Export SVG</button>
        )}
      </div>

      {mode === 'canvas' && <Sketch setup={setup} draw={draw} mouseClicked={mouseClicked} />}
      {mode === 'svg' && renderSVG()}
      {mode === 'webgl' && <Sketch setup={setup} draw={draw} />}

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
