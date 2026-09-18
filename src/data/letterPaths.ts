import { LetterDefinition, Point, StrokeSegment } from '../types';

interface RawLetterDef {
  letter: string;
  paths: string[];
}

export const RAW_LETTERS: Record<string, string[]> = {
  A: [
    'M 100 35 L 30 205',      // Left diagonal down
    'M 100 35 L 170 205',     // Right diagonal down
    'M 59 135 L 141 135',     // Symmetrical crossbar
  ],
  B: [
    'M 44 35 L 44 205',                                              // Vertical stem
    'M 44 35 L 105 35 C 152 35, 152 120, 105 120 L 44 120',          // Upper loop
    'M 44 120 L 105 120 C 156 120, 156 205, 105 205 L 44 205',        // Lower loop
  ],
  C: [
    'M 155 65 C 138 35, 75 35, 45 75 C 28 98, 28 142, 45 165 C 75 205, 138 205, 155 175', // Smooth balanced curve
  ],
  D: [
    'M 45 35 L 45 205',                                              // Vertical stem
    'M 45 35 L 95 35 C 160 35, 160 205, 95 205 L 45 205',            // Wide balanced curve
  ],
  E: [
    'M 45 35 L 45 205',     // Vertical stem
    'M 45 35 L 155 35',     // Top bar
    'M 45 120 L 140 120',   // Middle bar
    'M 45 205 L 155 205',   // Bottom bar
  ],
  F: [
    'M 45 35 L 45 205',     // Vertical stem
    'M 45 35 L 155 35',     // Top bar
    'M 45 120 L 140 120',   // Middle bar
  ],
  G: [
    'M 155 65 C 138 35, 75 35, 45 75 C 28 98, 28 142, 45 165 C 75 205, 138 205, 155 170 L 155 120', // Outer curve
    'M 155 120 L 110 120',                                                                           // Horizontal cross
  ],
  H: [
    'M 45 35 L 45 205',     // Left stem
    'M 155 35 L 155 205',   // Right stem
    'M 45 120 L 155 120',   // Centered crossbar
  ],
  I: [
    'M 45 35 L 155 35',     // Top bar
    'M 100 35 L 100 205',   // Center stem
    'M 45 205 L 155 205',   // Bottom bar
  ],
  J: [
    'M 45 35 L 155 35',                              // Top bar
    'M 130 35 L 130 155 C 130 205, 55 205, 55 165',  // Stem and smooth hook
  ],
  K: [
    'M 45 35 L 45 205',     // Vertical stem
    'M 155 35 L 45 120',    // Upper diagonal
    'M 65 105 L 155 205',   // Lower diagonal
  ],
  L: [
    'M 45 35 L 45 205',     // Vertical stem
    'M 45 205 L 155 205',   // Generous bottom bar
  ],
  M: [
    'M 28 205 L 28 35',     // Left stem up
    'M 28 35 L 100 165',    // Diagonal down to center
    'M 100 165 L 172 35',   // Diagonal up to right
    'M 172 35 L 172 205',   // Right stem down
  ],
  N: [
    'M 35 205 L 35 35',     // Left stem up
    'M 35 35 L 165 205',    // Diagonal down
    'M 165 205 L 165 35',   // Right stem up
  ],
  O: [
    'M 100 35 C 155 35, 172 75, 172 120 C 172 165, 155 205, 100 205',   // Right half (top to bottom) - clockwise
    'M 100 205 C 45 205, 28 165, 28 120 C 28 75, 45 35, 100 35',       // Left half (bottom to top) - clockwise
  ],
  P: [
    'M 45 35 L 45 205',                                              // Vertical stem
    'M 45 35 L 105 35 C 155 35, 155 120, 105 120 L 45 120',          // Symmetrical upper loop
  ],
  Q: [
    'M 100 35 C 45 35, 28 75, 28 120 C 28 165, 45 205, 100 205',   // Left half
    'M 100 205 C 155 205, 172 165, 172 120 C 172 75, 155 35, 100 35', // Right half
    'M 115 145 L 168 205',                                          // Diagonal tail
  ],
  R: [
    'M 45 35 L 45 205',                                              // Vertical stem
    'M 45 35 L 105 35 C 155 35, 155 120, 105 120 L 45 120',          // Loop
    'M 95 120 L 155 205',                                            // Leg
  ],
  S: [
    'M 152 68 C 140 35, 58 35, 58 78 C 58 120, 142 120, 142 162 C 142 205, 60 205, 48 172', // Balanced S curve
  ],
  T: [
    'M 25 35 L 175 35',     // Wide top bar
    'M 100 35 L 100 205',   // Centered vertical stem
  ],
  U: [
    'M 42 35 L 42 145 C 42 205, 158 205, 158 145 L 158 35', // Symmetric U curve
  ],
  V: [
    'M 32 35 L 100 205',    // Diagonal down
    'M 100 205 L 168 35',   // Diagonal up
  ],
  W: [
    'M 20 35 L 56 205',     // Left diagonal down
    'M 56 205 L 100 95',    // First diagonal up
    'M 100 95 L 144 205',   // Second diagonal down
    'M 144 205 L 180 35',   // Right diagonal up
  ],
  X: [
    'M 30 35 L 170 205',    // Diagonal top-left to bottom-right
    'M 170 35 L 30 205',    // Diagonal top-right to bottom-left
  ],
  Y: [
    'M 32 35 L 100 120',    // Left slant to center
    'M 168 35 L 100 120',   // Right slant to center
    'M 100 120 L 100 205',  // Center vertical stem down
  ],
  Z: [
    'M 35 35 L 165 35',     // Top bar
    'M 165 35 L 35 205',    // Symmetrical diagonal
    'M 35 205 L 165 205',   // Bottom bar
  ],
};

// Phonics phonetic sounds for each uppercase letter
export const LETTER_PHONICS: Record<string, { sound: string; hint: string }> = {
  A: { sound: 'ah', hint: 'Short a sound as in apple' },
  B: { sound: 'buh', hint: 'b sound as in ball' },
  C: { sound: 'kuh', hint: 'Hard c sound as in cat' },
  D: { sound: 'duh', hint: 'd sound as in dog' },
  E: { sound: 'eh', hint: 'Short e sound as in elephant' },
  F: { sound: 'fff', hint: 'f sound as in fish' },
  G: { sound: 'guh', hint: 'Hard g sound as in girl' },
  H: { sound: 'huh', hint: 'h sound as in hat' },
  I: { sound: 'ih', hint: 'Short i sound as in igloo' },
  J: { sound: 'juh', hint: 'j sound as in jump' },
  K: { sound: 'kuh', hint: 'k sound as in kite' },
  L: { sound: 'lll', hint: 'l sound as in lion' },
  M: { sound: 'mmm', hint: 'm sound as in moon' },
  N: { sound: 'nnn', hint: 'n sound as in nest' },
  O: { sound: 'aw', hint: 'Short o sound as in octopus' },
  P: { sound: 'puh', hint: 'p sound as in pig' },
  Q: { sound: 'kwuh', hint: 'qu sound as in queen' },
  R: { sound: 'rrr', hint: 'r sound as in red' },
  S: { sound: 'sss', hint: 's sound as in sun' },
  T: { sound: 'tuh', hint: 't sound as in tree' },
  U: { sound: 'uh', hint: 'Short u sound as in umbrella' },
  V: { sound: 'vvv', hint: 'v sound as in van' },
  W: { sound: 'wuh', hint: 'w sound as in water' },
  X: { sound: 'ks', hint: 'x sound as in box' },
  Y: { sound: 'yuh', hint: 'y sound as in yellow' },
  Z: { sound: 'zzz', hint: 'z sound as in zebra' },
};

// Cache parsed letter definitions
const letterDefCache: Record<string, LetterDefinition> = {};

/**
 * Parses SVG path strings into sampled points, start/end points and directional arrows.
 */
export function getLetterDefinition(letter: string): LetterDefinition {
  const upper = letter.toUpperCase();
  if (letterDefCache[upper]) {
    return letterDefCache[upper];
  }

  const rawPaths = RAW_LETTERS[upper] || RAW_LETTERS['A'];
  const strokes: StrokeSegment[] = [];

  rawPaths.forEach((pathD, idx) => {
    let points: Point[] = [];
    let startPoint: Point = { x: 50, y: 50 };
    let endPoint: Point = { x: 50, y: 50 };
    let arrowPoint: Point | undefined;
    let arrowAngle: number | undefined;

    if (typeof document !== 'undefined') {
      try {
        const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        svgPath.setAttribute('d', pathD);
        const totalLength = svgPath.getTotalLength();
        const numSamples = Math.max(30, Math.min(80, Math.round(totalLength / 3)));

        for (let i = 0; i <= numSamples; i++) {
          const pt = svgPath.getPointAtLength((i / numSamples) * totalLength);
          points.push({
            x: Math.round(pt.x * 10) / 10,
            y: Math.round(pt.y * 10) / 10,
          });
        }

        if (points.length > 0) {
          startPoint = points[0];
          endPoint = points[points.length - 1];

          // Calculate arrow at ~40% along stroke
          const arrowLen = totalLength * 0.45;
          const arrowLenNext = Math.min(totalLength, arrowLen + Math.min(12, totalLength * 0.1));
          const p1 = svgPath.getPointAtLength(arrowLen);
          const p2 = svgPath.getPointAtLength(arrowLenNext);
          
          arrowPoint = { x: Math.round(p1.x * 10) / 10, y: Math.round(p1.y * 10) / 10 };
          arrowAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
        }
      } catch (err) {
        console.warn('SVG path measurement error for', upper, err);
      }
    }

    // Fallback if document not available
    if (points.length === 0) {
      points = [
        { x: 50, y: 50 },
        { x: 100, y: 100 },
      ];
      startPoint = points[0];
      endPoint = points[1];
    }

    strokes.push({
      id: idx,
      pathD,
      points,
      startPoint,
      endPoint,
      arrowPoint,
      arrowAngle,
    });
  });

  const def: LetterDefinition = {
    letter: upper,
    strokes,
    viewBox: '0 0 200 240',
  };

  letterDefCache[upper] = def;
  return def;
}
