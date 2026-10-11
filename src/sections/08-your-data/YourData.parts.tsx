import type { CSSProperties, ReactNode } from 'react';
import { CELL_KIND, GRID, LAYERS, type CellCode, type LayerDrawing } from './your-data.shapes';

export function DataOurs() {
  return (
    <div className="data-ours" data-ours="">
      <h3>Simpul keeps three things</h3>
      <ol className="data-kept">
        <KeptSignIn />
        <KeptWorkspace />
        <KeptLink />
      </ol>
    </div>
  );
}

function KeptDrawing({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 192" width="300" height="192">
      <path className="plate-edge" d="M150 31.5L286 110L150 188.5L14 110Z" />
      <path className="plate" d="M150 21.5L286 100L150 178.5L14 100Z" />
      <g transform="matrix(0.866 0.5 -0.866 0.5 150 100)">
        {GRID.map((cell) => (
          <rect
            key={`${cell.x},${cell.y}`}
            className="ghost"
            x={cell.x}
            y={cell.y}
            width="18"
            height="18"
            rx="3.5"
          />
        ))}
      </g>
      <ellipse className="thing-shadow" data-shadow="" cx="150" cy="102" rx="54" ry="18" />
      {children}
    </svg>
  );
}

function KeptSignIn() {
  return (
    <li style={{ '--at': '13.75%' } as CSSProperties}>
      <KeptDrawing>
        <g transform="translate(88 -20) scale(1.3)">
          <g className="thing" data-thing="">
            <path className="thing-fill" d="M14 90c2-23 16-35 34-35s32 12 34 35z" />
            <circle className="thing-fill" cx="48" cy="27" r="16" />
          </g>
        </g>
      </KeptDrawing>
      <span>Your sign-in</span>
    </li>
  );
}

function KeptWorkspace() {
  return (
    <li style={{ '--at': '48.42%' } as CSSProperties}>
      <KeptDrawing>
        <g transform="translate(88 -20) scale(1.3)">
          <g className="thing" data-thing="">
            <path
              className="thing-fill"
              d="M12 52V20a8 8 0 0 1 8-8h32l32 32a8 8 0 0 1 0 11.300L60.700 78.600a8 8 0 0 1-11.300 0z"
            />
            <circle className="thing-hole" cx="32" cy="32" r="7" />
            <path className="thing-line" d="M44 58l14-14" />
          </g>
        </g>
      </KeptDrawing>
      <span>Your workspace name</span>
    </li>
  );
}

function KeptLink() {
  return (
    <li style={{ '--at': '83.08%' } as CSSProperties}>
      <KeptDrawing>
        <g transform="translate(88 -20) scale(1.3)">
          <g className="thing" data-thing="">
            <path className="thing-line" d="M30 44V31a18 18 0 0 1 36 0v13" />
            <rect className="thing-fill" x="16" y="44" width="64" height="46" rx="10" />
            <circle className="thing-hole" cx="48" cy="62" r="6" />
            <path className="thing-line" d="M48 68v9" />
          </g>
        </g>
      </KeptDrawing>
      <span>An encrypted link to your database</span>
    </li>
  );
}

export function DataYours() {
  return (
    <figure className="data-yours">
      <h3>What stays in your database</h3>
      <div className="data-stack" data-stack="">
        <svg aria-hidden="true" viewBox="0 0 300 600" width="300" height="600">
          {LAYERS.map((layer) => (
            <DataLayer key={layer.key} layer={layer} />
          ))}
        </svg>
        <ol className="data-layers">
          <li style={{ top: '13.75%' }}>Messages</li>
          <li style={{ top: '31.08%' }}>Work items</li>
          <li style={{ top: '48.42%' }}>People and rules</li>
          <li style={{ top: '65.75%' }}>Notifications</li>
          <li style={{ top: '83.08%' }}>History</li>
        </ol>
      </div>
    </figure>
  );
}

function DataLayer({ layer }: { layer: LayerDrawing }) {
  return (
    <g data-layer="">
      <path className="plate-edge" d={layer.edge} />
      <path className="plate" d={layer.plate} />
      <g transform={layer.transform}>
        {GRID.map((cell, index) => {
          const kind = CELL_KIND[layer.fills[index] as CellCode];

          return (
            <rect
              key={`${cell.x},${cell.y}`}
              className={`cell cell--${kind}`}
              data-far={cell.far.toFixed(2)}
              x={cell.x}
              y={cell.y}
              width="18"
              height="18"
              rx="3.5"
            />
          );
        })}
      </g>
    </g>
  );
}
