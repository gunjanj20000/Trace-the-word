import { LetterDefinition, Point, StrokeSegment } from '../types';

interface RawLetterDef {
  letter: string;
  paths: string[];
}

export const RAW_LETTERS: Record<string, string[]> = {
  A: [
    'M 100 35 L 45 205',      // Left diagonal down
    'M 100 35 L 155 205',     // Right diagonal down
    'M 68 145 L 132 145',     // Crossbar left to right
  ],
  B: [
    'M 60 35 L 60 205',                                      // Vertical down
    'M 60 35 C 135 35, 140 120, 60 120',                    // Top loop
    'M 60 120 C 145 120, 145 205, 60 205',                   // Bottom loop
  ],
  C: [
    'M 155 65 C 140 35, 60 35, 55 120 C 50 195, 135 210, 155 180', // Curve
  ],
  D: [
    'M 60 35 L 60 205',                                      // Vertical down
    'M 60 35 C 165 35, 165 205, 60 205',                    // Big curve
  ],
  E: [
    'M 60 35 L 60 205',     // Vertical stem
    'M 60 35 L 150 35',     // Top bar
    'M 60 120 L 135 120',   // Middle bar
    'M 60 205 L 150 205',   // Bottom bar
  ],
  F: [
    'M 60 35 L 60 205',     // Vertical stem
    'M 60 35 L 150 35',     // Top bar
    'M 60 120 L 130 120',   // Middle bar
  ],
  G: [
    'M 155 65 C 140 35, 60 35, 55 120 C 50 195, 140 210, 155 175 L 155 125', // Curve and right wall
    'M 155 125 L 115 125',                                                     // Cross inward
  ],
  H: [
    'M 55 35 L 55 205',     // Left stem
    'M 145 35 L 145 205',   // Right stem
    'M 55 120 L 145 120',   // Middle bar
  ],
  I: [
    'M 60 35 L 140 35',     // Top bar
    'M 100 35 L 100 205',   // Center stem
    'M 60 205 L 140 205',   // Bottom bar
  ],
  J: [
    'M 65 35 L 145 35',                                      // Top bar
    'M 125 35 L 125 155 C 125 215, 65 215, 60 170',         // Hook down and up
  ],
  K: [
    'M 60 35 L 60 205',     // Left stem
    'M 145 45 L 60 125',    // Upper diagonal
    'M 80 108 L 150 205',   // Lower diagonal
  ],
  L: [
    'M 65 35 L 65 205',     // Vertical stem
    'M 65 205 L 150 205',   // Bottom bar
  ],
  M: [
    'M 48 205 L 48 35',     // Left stem up
    'M 48 35 L 100 145',    // Diagonal down
    'M 100 145 L 152 35',   // Diagonal up
    'M 152 35 L 152 205',   // Right stem down
  ],
  N: [
    'M 52 205 L 52 35',     // Left stem up
    'M 52 35 L 148 205',    // Diagonal down
    'M 148 205 L 148 35',   // Right stem up
  ],
  O: [
    // Two half-arcs for easier tracing and clear start point at top
    'M 100 35 C 45 35, 45 205, 100 205',   // Left half counter-clockwise
    'M 100 205 C 155 205, 155 35, 100 35', // Right half up to top
  ],
  P: [
    'M 60 35 L 60 205',                    // Stem down
    'M 60 35 C 145 35, 145 125, 60 125',   // Top loop
  ],
  Q: [
    'M 100 35 C 45 35, 45 205, 100 205',   // Left half
    'M 100 205 C 155 205, 155 35, 100 35', // Right half
    'M 115 155 L 160 210',                  // Tail
  ],
  R: [
    'M 60 35 L 60 205',                    // Stem down
    'M 60 35 C 145 35, 145 125, 60 125',   // Top loop
    'M 100 125 L 150 205',                 // Leg
  ],
  S: [
    'M 148 65 C 135 35, 65 35, 65 80 C 65 140, 145 125, 145 170 C 145 215, 65 215, 52 180',
  ],
  T: [
    'M 40 35 L 160 35',     // Top bar
    'M 100 35 L 100 205',   // Center stem
  ],
  U: [
    'M 55 35 L 55 145 C 55 215, 145 215, 145 145 L 145 35', // Down, curve, up
  ],
  V: [
    'M 45 35 L 100 205',    // Diagonal down
    'M 100 205 L 155 35',   // Diagonal up
  ],
  W: [
    'M 42 35 L 68 205',     // Slant down
    'M 68 205 L 100 95',    // Slant up
    'M 100 95 L 132 205',   // Slant down
    'M 132 205 L 158 35',   // Slant up
  ],
  X: [
    'M 50 35 L 150 205',    // Diagonal top-left to bottom-right
    'M 150 35 L 50 205',    // Diagonal top-right to bottom-left
  ],
  Y: [
    'M 48 35 L 100 115',    // Left slant to center
    'M 152 35 L 100 115',   // Right slant to center
    'M 100 115 L 100 205',  // Center stem down
  ],
  Z: [
    'M 50 40 L 150 40',     // Top bar
    'M 150 40 L 50 205',    // Diagonal down-left
    'M 50 205 L 150 205',   // Bottom bar
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
