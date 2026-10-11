export interface GridCell {
  x: number;
  y: number;
  far: number;
}

export const GRID: readonly GridCell[] = [
  { x: -66.5, y: -66.5, far: 0.0 },
  { x: -43.5, y: -66.5, far: 0.1 },
  { x: -20.5, y: -66.5, far: 0.2 },
  { x: 2.5, y: -66.5, far: 0.3 },
  { x: 25.5, y: -66.5, far: 0.4 },
  { x: 48.5, y: -66.5, far: 0.5 },
  { x: -66.5, y: -43.5, far: 0.1 },
  { x: -43.5, y: -43.5, far: 0.2 },
  { x: -20.5, y: -43.5, far: 0.3 },
  { x: 2.5, y: -43.5, far: 0.4 },
  { x: 25.5, y: -43.5, far: 0.5 },
  { x: 48.5, y: -43.5, far: 0.6 },
  { x: -66.5, y: -20.5, far: 0.2 },
  { x: -43.5, y: -20.5, far: 0.3 },
  { x: -20.5, y: -20.5, far: 0.4 },
  { x: 2.5, y: -20.5, far: 0.5 },
  { x: 25.5, y: -20.5, far: 0.6 },
  { x: 48.5, y: -20.5, far: 0.7 },
  { x: -66.5, y: 2.5, far: 0.3 },
  { x: -43.5, y: 2.5, far: 0.4 },
  { x: -20.5, y: 2.5, far: 0.5 },
  { x: 2.5, y: 2.5, far: 0.6 },
  { x: 25.5, y: 2.5, far: 0.7 },
  { x: 48.5, y: 2.5, far: 0.8 },
  { x: -66.5, y: 25.5, far: 0.4 },
  { x: -43.5, y: 25.5, far: 0.5 },
  { x: -20.5, y: 25.5, far: 0.6 },
  { x: 2.5, y: 25.5, far: 0.7 },
  { x: 25.5, y: 25.5, far: 0.8 },
  { x: 48.5, y: 25.5, far: 0.9 },
  { x: -66.5, y: 48.5, far: 0.5 },
  { x: -43.5, y: 48.5, far: 0.6 },
  { x: -20.5, y: 48.5, far: 0.7 },
  { x: 2.5, y: 48.5, far: 0.8 },
  { x: 25.5, y: 48.5, far: 0.9 },
  { x: 48.5, y: 48.5, far: 1.0 },
];

export const CELL_KIND = { a: 'a', b: 'b', c: 'c', e: 'empty' } as const;

export type CellCode = keyof typeof CELL_KIND;

export interface LayerDrawing {
  key: string;
  edge: string;
  plate: string;
  transform: string;
  fills: string;
}

export const LAYERS: readonly LayerDrawing[] = [
  {
    key: 'bottom',
    edge: 'M150 430L286 508.5L150 587L14 508.5Z',
    plate: 'M150 420L286 498.5L150 577L14 498.5Z',
    transform: 'matrix(0.866 0.5 -0.866 0.5 150 498.5)',
    fills: 'ecaabbabbbbbbaabbebacbebcbbbccaacaea',
  },
  {
    key: 'second',
    edge: 'M150 326L286 404.5L150 483L14 404.5Z',
    plate: 'M150 316L286 394.5L150 473L14 394.5Z',
    transform: 'matrix(0.866 0.5 -0.866 0.5 150 394.5)',
    fills: 'aacbbceabbaaceaabcbaaaaaabbacacbbbbb',
  },
  {
    key: 'middle',
    edge: 'M150 222L286 300.5L150 379L14 300.5Z',
    plate: 'M150 212L286 290.5L150 369L14 290.5Z',
    transform: 'matrix(0.866 0.5 -0.866 0.5 150 290.5)',
    fills: 'cababaaabcebeaeecabeabecccccbaeaeeba',
  },
  {
    key: 'fourth',
    edge: 'M150 118L286 196.5L150 275L14 196.5Z',
    plate: 'M150 108L286 186.5L150 265L14 186.5Z',
    transform: 'matrix(0.866 0.5 -0.866 0.5 150 186.5)',
    fills: 'babacaaceaecbcecacbbaaabebbbaeecebce',
  },
  {
    key: 'top',
    edge: 'M150 14L286 92.5L150 171L14 92.5Z',
    plate: 'M150 4L286 82.5L150 161L14 82.5Z',
    transform: 'matrix(0.866 0.5 -0.866 0.5 150 82.5)',
    fills: 'ccccbaabcaaacbabbabaaaccbccabeabbcaa',
  },
];
