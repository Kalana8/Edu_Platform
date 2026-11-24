import type { Motif, SubjectTheme } from "@/lib/explore/types";

/**
 * Subject illustration rendered as inline SVG (no image hosting required).
 * Replace with real photography later by passing an `imageUrl` from the backend.
 */
export default function SubjectVisual({
  motif,
  theme,
  className = "",
  title,
}: {
  motif: Motif;
  theme: SubjectTheme;
  className?: string;
  title?: string;
}) {
  const patternId = `grid-${motif}`;
  const glowId = `glow-${motif}`;
  return (
    <svg
      viewBox="0 0 400 240"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <pattern id={patternId} width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.2" fill="#ffffff" opacity="0.12" />
        </pattern>
        <radialGradient id={glowId} cx="72%" cy="45%" r="60%">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="240" fill={theme.base} />
      <rect width="400" height="240" fill={`url(#${patternId})`} />
      <rect width="400" height="240" fill={`url(#${glowId})`} />
      <circle cx="40" cy="220" r="90" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1.5" />
      <circle cx="40" cy="220" r="130" fill="none" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1.5" />
      <g
        transform="translate(285 120)"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <MotifShape motif={motif} accent={theme.accent} />
      </g>
    </svg>
  );
}

function MotifShape({ motif, accent }: { motif: Motif; accent: string }) {
  switch (motif) {
    case "robot":
      return (
        <>
          <rect x="-80" y="62" width="90" height="16" rx="5" fill="#ffffff" fillOpacity="0.15" />
          <line x1="-35" y1="55" x2="5" y2="-25" strokeWidth="14" strokeOpacity="0.9" />
          <line x1="5" y1="-25" x2="65" y2="-10" strokeWidth="10" strokeOpacity="0.9" />
          <circle cx="-35" cy="55" r="11" fill={accent} stroke="none" />
          <circle cx="5" cy="-25" r="9" fill={accent} stroke="none" />
          <circle cx="65" cy="-10" r="6" fill={accent} stroke="none" />
          <path d="M65 -10 l18 -12 M65 -10 l18 12" />
          <rect x="82" y="30" width="22" height="22" rx="3" fill={accent} fillOpacity="0.85" stroke="none" />
          <path d="M-90 78 H110" strokeOpacity="0.3" />
        </>
      );
    case "neural": {
      const layers = [
        { x: -75, ys: [-55, 0, 55] },
        { x: 0, ys: [-75, -25, 25, 75] },
        { x: 75, ys: [-28, 28] },
      ];
      return (
        <>
          {layers.slice(0, -1).flatMap((layer, li) =>
            layer.ys.flatMap((y1) =>
              layers[li + 1].ys.map((y2) => (
                <line
                  key={`${li}-${y1}-${y2}`}
                  x1={layer.x}
                  y1={y1}
                  x2={layers[li + 1].x}
                  y2={y2}
                  strokeWidth="1.5"
                  strokeOpacity="0.45"
                />
              )),
            ),
          )}
          {layers.flatMap((layer) =>
            layer.ys.map((y) => (
              <circle key={`${layer.x}-${y}`} cx={layer.x} cy={y} r="10" fill={accent} stroke="#ffffff" strokeWidth="2.5" />
            )),
          )}
        </>
      );
    }
    case "battery":
      return (
        <>
          <rect x="-70" y="-40" width="125" height="80" rx="12" />
          <rect x="55" y="-14" width="12" height="28" rx="3" fill="#ffffff" stroke="none" />
          <rect x="-58" y="-28" width="30" height="56" rx="5" fill={accent} stroke="none" />
          <rect x="-22" y="-28" width="30" height="56" rx="5" fill={accent} stroke="none" />
          <rect x="14" y="-28" width="30" height="56" rx="5" fill={accent} fillOpacity="0.35" stroke="none" />
          <path d="M-10 -85 L-28 -55 H-8 L-22 -28" stroke={accent} strokeWidth="5" />
        </>
      );
    case "chip":
      return (
        <>
          {[-30, -15, 0, 15, 30].map((o) => (
            <g key={o} strokeWidth="3" strokeOpacity="0.8">
              <line x1={o} y1="-50" x2={o} y2="-68" />
              <line x1={o} y1="50" x2={o} y2="68" />
              <line x1="-50" y1={o} x2="-68" y2={o} />
              <line x1="50" y1={o} x2="68" y2={o} />
            </g>
          ))}
          <rect x="-50" y="-50" width="100" height="100" rx="10" fill="#ffffff" fillOpacity="0.08" />
          <rect x="-28" y="-28" width="56" height="56" rx="4" fill={accent} fillOpacity="0.85" stroke="none" />
          <path d="M-28 -9 H28 M-28 9 H28 M-9 -28 V28 M9 -28 V28" stroke="#0f172a" strokeOpacity="0.35" strokeWidth="1.5" />
        </>
      );
    case "cycle":
      return (
        <>
          <circle r="62" strokeDasharray="110 20" transform="rotate(-20)" />
          <path d="M52 -40 l12 4 l-2 13" transform="rotate(10)" />
          <path d="M-62 -10 l-4 12 l12 2" transform="rotate(-5)" />
          <path d="M10 62 l-11 6 l-5 -11" />
          <path d="M0 30 C -32 4 -14 -30 26 -30 C 26 6 14 24 0 30 Z" fill={accent} stroke="none" />
          <path d="M0 30 C 6 8 12 -6 22 -24" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2.5" />
        </>
      );
    case "rocket":
      return (
        <>
          <ellipse rx="100" ry="32" transform="rotate(-18)" strokeOpacity="0.4" strokeWidth="2.5" />
          <path d="M0 -70 C 22 -46 22 10 14 34 L -14 34 C -22 10 -22 -46 0 -70 Z" fill="#ffffff" fillOpacity="0.15" />
          <circle cy="-22" r="8" fill={accent} stroke="none" />
          <path d="M-15 12 L-32 40 L-14 34 M15 12 L32 40 L14 34" />
          <path d="M-8 40 Q0 66 8 40" fill={accent} stroke={accent} />
          <circle cx="85" cy="-34" r="7" fill={accent} stroke="none" />
        </>
      );
    case "dna": {
      // Round trig output: Node and browsers can differ in the last digits of Math.sin,
      // which breaks hydration when the raw values end up in SVG attributes.
      const wave = (x: number) => Math.round(Math.sin(x / 18) * 4000) / 100;
      const xs = Array.from({ length: 41 }, (_, i) => -90 + i * 4.5);
      const a = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x} ${wave(x)}`).join(" ");
      const b = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x} ${-wave(x)}`).join(" ");
      return (
        <>
          {xs.filter((_, i) => i % 4 === 0).map((x) => (
            <line key={x} x1={x} y1={wave(x)} x2={x} y2={-wave(x)} stroke={accent} strokeWidth="3" strokeOpacity="0.8" />
          ))}
          <path d={a} />
          <path d={b} strokeOpacity="0.7" />
        </>
      );
    }
    case "qubit":
      return (
        <>
          <circle r="70" fill="#ffffff" fillOpacity="0.06" />
          <ellipse rx="70" ry="20" strokeOpacity="0.55" strokeWidth="2.5" />
          <line x1="0" y1="-85" x2="0" y2="85" strokeDasharray="5 6" strokeOpacity="0.5" strokeWidth="2" />
          <line x1="0" y1="0" x2="40" y2="-48" stroke={accent} strokeWidth="5" />
          <circle cx="40" cy="-48" r="9" fill={accent} stroke="none" />
          <circle r="5" fill="#ffffff" stroke="none" />
        </>
      );
    case "lattice": {
      const pts: [number, number][] = [];
      for (let r = -2; r <= 2; r++) {
        for (let c = -3; c <= 3; c++) {
          pts.push([c * 30 + (Math.abs(r) % 2 ? 15 : 0), r * 26]);
        }
      }
      return (
        <>
          {pts.map(([x, y]) => (
            <g key={`${x}-${y}`} strokeWidth="2" strokeOpacity="0.4">
              {x < 90 && <line x1={x} y1={y} x2={x + 30} y2={y} />}
              {y < 52 && <line x1={x} y1={y} x2={x + 15} y2={y + 26} />}
            </g>
          ))}
          {pts.map(([x, y], i) => (
            <circle key={`p-${x}-${y}`} cx={x} cy={y} r={i % 3 === 0 ? 8 : 6} fill={i % 3 === 0 ? accent : "#ffffff"} stroke="none" />
          ))}
        </>
      );
    }
  }
}
