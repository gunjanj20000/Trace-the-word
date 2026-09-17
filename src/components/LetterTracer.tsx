import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TracingDifficulty, Point, AppTheme } from '../types';
import { getLetterDefinition } from '../data/letterPaths';
import { playStrokeCompleteSound, playLetterCompleteSound, speakLetter } from '../services/audio';
import { getThemeConfig } from '../theme/themeConfig';
import { RotateCcw, Sparkles } from 'lucide-react';

interface LetterTracerProps {
  letter: string;
  theme?: AppTheme;
  difficulty?: TracingDifficulty;
  showArrows?: boolean;
  showStartPoint?: boolean;
  soundVolume?: number;
  phonicsEnabled?: boolean;
  onComplete: () => void;
  onStrokeComplete?: (strokeIndex: number, totalStrokes: number) => void;
  className?: string;
  isCompact?: boolean;
}

export const LetterTracer: React.FC<LetterTracerProps> = ({
  letter,
  theme = 'forest',
  difficulty = 'easy',
  showArrows = true,
  showStartPoint = true,
  soundVolume = 0.8,
  phonicsEnabled = true,
  onComplete,
  onStrokeComplete,
  className = '',
  isCompact = false,
}) => {
  const themeConfig = getThemeConfig(theme);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Get letter definition
  const letterDef = getLetterDefinition(letter);
  const totalStrokes = letterDef.strokes.length;

  const [activeStrokeIdx, setActiveStrokeIdx] = useState<number>(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [userTrail, setUserTrail] = useState<Point[]>([]);
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [coveredCount, setCoveredCount] = useState<number>(0);
  const [isLetterSuccess, setIsLetterSuccess] = useState<boolean>(false);
  const [outsideNotice, setOutsideNotice] = useState<boolean>(false);

  // Difficulty settings
  const tolerance = difficulty === 'easy' ? 42 : difficulty === 'medium' ? 28 : 18;
  const guideStrokeWidth = difficulty === 'easy' ? 38 : difficulty === 'medium' ? 28 : 20;
  const userStrokeWidth = difficulty === 'easy' ? 32 : difficulty === 'medium' ? 24 : 16;
  const completionThresholdPct = difficulty === 'easy' ? 70 : difficulty === 'medium' ? 80 : 88;

  // Reset when letter changes
  useEffect(() => {
    setActiveStrokeIdx(0);
    setCompletedStrokes([]);
    setUserTrail([]);
    setIsTracing(false);
    setCoveredCount(0);
    setIsLetterSuccess(false);
    setOutsideNotice(false);
  }, [letter]);

  // Transform screen client coordinates to SVG 200x240 coordinates
  const getSvgCoordinates = useCallback((clientX: number, clientY: number): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const transformed = pt.matrixTransform(ctm.inverse());
      return { x: transformed.x, y: transformed.y };
    }

    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 200,
      y: ((clientY - rect.top) / rect.height) * 240,
    };
  }, []);

  // Distance helper
  const dist = (p1: Point, p2: Point): number => {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const currentStroke = letterDef.strokes[activeStrokeIdx];

  // Handle pointer down (touch/mouse/stylus)
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isLetterSuccess || !currentStroke) return;

    // Capture pointer to track even if finger slides slightly outside SVG
    (e.target as Element).setPointerCapture?.(e.pointerId);

    const pt = getSvgCoordinates(e.clientX, e.clientY);
    const strokePoints = currentStroke.points;
    if (strokePoints.length === 0) return;

    // Check distance to start point or already covered point
    const distToStart = dist(pt, currentStroke.startPoint);
    // On easy, allow starting anywhere within first 25% of points
    const startRange = difficulty === 'easy' ? Math.max(3, Math.floor(strokePoints.length * 0.25)) : 2;
    let validStart = distToStart <= tolerance * 1.35;

    if (!validStart && difficulty === 'easy') {
      for (let i = 0; i < startRange; i++) {
        if (dist(pt, strokePoints[i]) <= tolerance * 1.2) {
          validStart = true;
          break;
        }
      }
    }

    if (validStart) {
      setIsTracing(true);
      setUserTrail([pt]);
      setOutsideNotice(false);
      // Mark initial points
      setCoveredCount(Math.min(3, strokePoints.length));
    } else {
      // Gently remind where start point is (no buzzer, gentle guidance)
      setOutsideNotice(true);
      setTimeout(() => setOutsideNotice(false), 1200);
    }
  };

  // Handle pointer move
  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isTracing || isLetterSuccess || !currentStroke) return;

    const pt = getSvgCoordinates(e.clientX, e.clientY);
    const strokePoints = currentStroke.points;
    const totalPts = strokePoints.length;

    setUserTrail((prev) => {
      // Keep last 40 points for smooth performance
      const updated = [...prev, pt];
      return updated.length > 45 ? updated.slice(-45) : updated;
    });

    // Check proximity to next expected points along the stroke
    const currentIdx = coveredCount;
    // Look ahead up to 12 points for fast gestures
    const lookAheadLimit = Math.min(totalPts, currentIdx + 12);
    let newCovered = currentIdx;

    for (let i = currentIdx; i < lookAheadLimit; i++) {
      const d = dist(pt, strokePoints[i]);
      if (d <= tolerance) {
        newCovered = i + 1;
      }
    }

    if (newCovered > currentIdx) {
      setCoveredCount(newCovered);

      // Check if stroke completed
      const pct = (newCovered / totalPts) * 100;
      if (pct >= completionThresholdPct) {
        handleStrokeComplete();
      }
    }
  };

  // Complete current stroke
  const handleStrokeComplete = () => {
    setIsTracing(false);
    setUserTrail([]);

    const nextCompleted = [...completedStrokes, activeStrokeIdx];
    setCompletedStrokes(nextCompleted);

    playStrokeCompleteSound(soundVolume);

    if (onStrokeComplete) {
      onStrokeComplete(activeStrokeIdx + 1, totalStrokes);
    }

    if (nextCompleted.length >= totalStrokes) {
      // Entire letter completed!
      setIsLetterSuccess(true);
      playLetterCompleteSound(soundVolume);

      // Speak phonics or letter sound
      speakLetter(letter, phonicsEnabled, soundVolume);

      setTimeout(() => {
        onComplete();
      }, 950);
    } else {
      // Advance to next stroke
      const nextIdx = activeStrokeIdx + 1;
      setActiveStrokeIdx(nextIdx);
      setCoveredCount(0);
    }
  };

  // Handle pointer up
  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isTracing) return;
    setIsTracing(false);

    // If child got close to completion (e.g. 60%+), help them finish if on Easy mode
    if (currentStroke && difficulty === 'easy') {
      const pct = (coveredCount / currentStroke.points.length) * 100;
      if (pct >= completionThresholdPct - 10) {
        handleStrokeComplete();
        return;
      }
    }

    // Keep partial progress or gently guide back
    setUserTrail([]);
  };

  const handlePointerCancel = () => {
    setIsTracing(false);
    setUserTrail([]);
  };

  // Manual reset of current letter
  const handleReset = () => {
    setActiveStrokeIdx(0);
    setCompletedStrokes([]);
    setUserTrail([]);
    setIsTracing(false);
    setCoveredCount(0);
    setIsLetterSuccess(false);
  };

  // Calculate active stroke reveal path
  const activeStrokeCoveredPath = (() => {
    if (!currentStroke || coveredCount === 0) return '';
    const pts = currentStroke.points.slice(0, coveredCount);
    if (pts.length < 2) return '';
    return pts.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  })();

  // User drawn pointer trail path
  const userDrawnPath = (() => {
    if (userTrail.length < 2) return '';
    return userTrail.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  })();

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* SVG Tracing Canvas */}
      <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
        <svg
          ref={svgRef}
          viewBox={letterDef.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full max-h-[72vh] max-w-[90vw] touch-none cursor-crosshair filter drop-shadow-md select-none transition-transform duration-300"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <defs>
            {/* Gradient for user's active drawn brush stroke */}
            <linearGradient id="userBrushGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeConfig.tracerUserBrush.start} />
              <stop offset="100%" stopColor={themeConfig.tracerUserBrush.end} />
            </linearGradient>

            {/* Gradient for completed strokes */}
            <linearGradient id="completedStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeConfig.tracerCompletedStroke.start} />
              <stop offset="100%" stopColor={themeConfig.tracerCompletedStroke.end} />
            </linearGradient>

            {/* Pulsing start marker gradient */}
            <radialGradient id="startPointGrad">
              <stop offset="0%" stopColor={themeConfig.tracerStartPoint.start} />
              <stop offset="60%" stopColor={themeConfig.tracerStartPoint.mid} />
              <stop offset="100%" stopColor={themeConfig.tracerStartPoint.end} />
            </radialGradient>
          </defs>

          {/* 1. BACKGROUND GUIDE LAYER: Faint outline of all strokes */}
          {letterDef.strokes.map((stroke, idx) => (
            <path
              key={`bg-${stroke.id}`}
              d={stroke.pathD}
              fill="none"
              stroke={themeConfig.tracerGuideBg}
              strokeWidth={guideStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-colors duration-200"
            />
          ))}

          {/* 2. INNER DASHED TRACING TRACK */}
          {letterDef.strokes.map((stroke, idx) => {
            const isCompleted = completedStrokes.includes(idx);
            const isActive = idx === activeStrokeIdx && !isLetterSuccess;

            if (isCompleted) return null;

            return (
              <path
                key={`track-${stroke.id}`}
                d={stroke.pathD}
                fill="none"
                stroke={isActive ? themeConfig.tracerTrackActive : themeConfig.tracerTrackInactive}
                strokeWidth={guideStrokeWidth * 0.45}
                strokeDasharray={isActive ? '10 10' : '6 12'}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isActive ? 0.85 : 0.3}
              />
            );
          })}

          {/* 3. COMPLETED STROKES LAYER: Solid vibrant themed color */}
          {letterDef.strokes.map((stroke, idx) => {
            if (!completedStrokes.includes(idx)) return null;
            return (
              <path
                key={`completed-${stroke.id}`}
                d={stroke.pathD}
                fill="none"
                stroke="url(#completedStrokeGrad)"
                strokeWidth={userStrokeWidth * 1.15}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            );
          })}

          {/* 4. ACTIVE STROKE REVEALED PORTION */}
          {activeStrokeCoveredPath && (
            <path
              d={activeStrokeCoveredPath}
              fill="none"
              stroke={themeConfig.tracerUserBrush.end}
              strokeWidth={userStrokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 5. USER POINTER FINGER TRAIL */}
          {userDrawnPath && (
            <path
              d={userDrawnPath}
              fill="none"
              stroke="url(#userBrushGrad)"
              strokeWidth={userStrokeWidth * 0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}

          {/* 6. DIRECTIONAL GUIDANCE ARROWS */}
          {showArrows && currentStroke && !isLetterSuccess && currentStroke.arrowPoint && (
            <g
              transform={`translate(${currentStroke.arrowPoint.x}, ${currentStroke.arrowPoint.y}) rotate(${
                currentStroke.arrowAngle || 0
              })`}
              className="pointer-events-none"
            >
              <polygon
                points="-10,-10 12,0 -10,10 -4,0"
                fill="#0284c7"
                stroke="#ffffff"
                strokeWidth="2"
                className="animate-pulse"
              />
            </g>
          )}

          {/* 7. START POINT INDICATOR */}
          {showStartPoint && currentStroke && !isLetterSuccess && (
            <g
              transform={`translate(${currentStroke.startPoint.x}, ${currentStroke.startPoint.y})`}
              className="pointer-events-none"
            >
              {/* Pulsing ring */}
              <circle
                cx="0"
                cy="0"
                r={tolerance * 0.9}
                fill={themeConfig.tracerStartPoint.ring}
                opacity="0.25"
                className="animate-ping"
              />
              {/* Outer border circle */}
              <circle
                cx="0"
                cy="0"
                r="18"
                fill="#ffffff"
                stroke={themeConfig.tracerStartPoint.outerStroke}
                strokeWidth="4"
              />
              {/* Inner glowing dot */}
              <circle cx="0" cy="0" r="11" fill="url(#startPointGrad)" />
              {/* Friendly start dot star */}
              <circle cx="0" cy="0" r="4" fill="#ffffff" />
            </g>
          )}

          {/* SUCCESS CELEBRATION OVERLAY */}
          {isLetterSuccess && (
            <g className="pointer-events-none">
              {/* Letter glow */}
              {letterDef.strokes.map((stroke) => (
                <path
                  key={`success-glow-${stroke.id}`}
                  d={stroke.pathD}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth={userStrokeWidth * 1.4}
                  strokeLinecap="round"
                  opacity="0.4"
                  className="animate-pulse"
                />
              ))}
            </g>
          )}
        </svg>

        {/* Gentle "Start Here" banner if user tapped far away */}
        {outsideNotice && currentStroke && (
          <div className="absolute top-4 bg-sky-100 text-sky-800 border-2 border-sky-300 font-bold px-4 py-2 rounded-full text-base shadow-lg animate-bounce pointer-events-none flex items-center gap-2">
            <span>👉 Start at the glowing circle!</span>
          </div>
        )}

        {/* Success sparkle badge */}
        {isLetterSuccess && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-emerald-500 text-white rounded-full p-6 shadow-2xl animate-bounce flex items-center gap-2">
              <Sparkles className="w-12 h-12 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Stroke progress dots at bottom of letter if letter has multiple strokes */}
      {totalStrokes > 1 && !isCompact && (
        <div className="flex items-center gap-2 mt-1 mb-2">
          {letterDef.strokes.map((_, idx) => (
            <div
              key={`stroke-dot-${idx}`}
              className={`h-3 rounded-full transition-all duration-300 ${
                completedStrokes.includes(idx)
                  ? 'w-8 bg-emerald-500'
                  : idx === activeStrokeIdx
                  ? 'w-8 bg-sky-500 animate-pulse'
                  : 'w-3 bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
