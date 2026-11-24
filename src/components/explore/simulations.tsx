"use client";

import { useState, type ReactNode } from "react";
import type { SimulationKind } from "@/lib/explore/types";

/**
 * SIMULATION INTEGRATION SLOT
 * ---------------------------
 * Every lab simulation renders through <SimulationSlot kind=... />.
 * To integrate a richer engine (e.g. a WebGL physics sim, a notebook runtime,
 * or an embedded third-party lab), register a component in `registry` below.
 * Kinds without a registered component show a clearly labelled placeholder.
 */
const registry: Partial<Record<SimulationKind, () => ReactNode>> = {
  battery: BatterySim,
  "robot-arm": RobotArmSim,
  transistor: TransistorSim,
  circuit: CircuitSim,
  resources: ResourceSim,
};

export default function SimulationSlot({ kind }: { kind: SimulationKind }) {
  const Sim = registry[kind];
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <p className="font-bold text-slate-900">🎛️ Simulation</p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
          {Sim ? "Simplified demo model" : "Integration slot"}
        </span>
      </div>
      <div className="p-4">
        {Sim ? (
          <Sim />
        ) : (
          <div className="flex aspect-[16/7] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <p className="font-semibold text-slate-700">Simulation coming soon</p>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              This space is reserved for the <code className="rounded bg-white px-1 font-mono text-xs">{kind}</code> simulation.
              You can complete the steps below using the guided instructions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="flex justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span className="font-mono text-slate-900">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-blue-600"
      />
    </label>
  );
}

function Readout({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid grid-cols-3 gap-2">
      {items.map(([k, v]) => (
        <div key={k} className="rounded-xl bg-slate-50 p-3">
          <dt className="text-[11px] text-slate-500">{k}</dt>
          <dd className="font-mono text-sm font-semibold text-slate-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function BatterySim() {
  const [current, setCurrent] = useState(2);
  const [mode, setMode] = useState<"charge" | "discharge">("charge");
  const capacity = 4; // Ah
  // Simplified CC-CV model: linear to 80%, then exponential taper.
  const points = Array.from({ length: 61 }, (_, i) => {
    const t = i / 20; // hours, 0..3
    const ccEnd = (0.8 * capacity) / current;
    let soc: number;
    if (t <= ccEnd) soc = (current * t) / capacity;
    else soc = 1 - 0.2 * Math.exp(-(t - ccEnd) * current * 0.9);
    soc = Math.min(1, soc);
    return { t, soc: mode === "charge" ? soc : Math.max(0, 1 - (current * t) / capacity) };
  });
  const toXY = (p: { t: number; soc: number }) => `${(p.t / 3) * 300 + 30},${170 - p.soc * 150}`;
  const t80 = (0.8 * capacity) / current; // CC phase to 80% charge, or 80% discharged
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 340 190" className="w-full rounded-2xl bg-slate-50" role="img" aria-label="State of charge over time">
        {[0, 0.25, 0.5, 0.75, 1].map((v) => (
          <g key={v}>
            <line x1="30" x2="330" y1={170 - v * 150} y2={170 - v * 150} stroke="#e2e8f0" />
            <text x="4" y={174 - v * 150} fontSize="9" fill="#64748b">{v * 100}%</text>
          </g>
        ))}
        {[0, 1, 2, 3].map((h) => (
          <text key={h} x={(h / 3) * 300 + 26} y="184" fontSize="9" fill="#64748b">{h}h</text>
        ))}
        <polyline points={points.map(toXY).join(" ")} fill="none" stroke="#059669" strokeWidth="2.5" />
      </svg>
      <div className="space-y-4">
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          {(["charge", "discharge"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m}
              className={`flex-1 rounded-lg py-1.5 capitalize ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
              {m}
            </button>
          ))}
        </div>
        <Slider label="Current" value={current} min={1} max={6} step={0.5} unit=" A" onChange={setCurrent} />
        <Readout items={[["Capacity", `${capacity} Ah`], [mode === "charge" ? "Time to 80%" : "Time to 20%", `${(t80 * 60).toFixed(0)} min`], ["C-rate", `${(current / capacity).toFixed(2)}C`]]} />
      </div>
    </div>
  );
}

function RobotArmSim() {
  const [a1, setA1] = useState(45);
  const [a2, setA2] = useState(-30);
  const L1 = 90, L2 = 70;
  const r = (d: number) => (d * Math.PI) / 180;
  // Rounded so server- and client-rendered SVG coordinates match exactly (hydration).
  const round = (n: number) => Math.round(n * 100) / 100;
  const x1 = round(L1 * Math.cos(r(a1))), y1 = round(L1 * Math.sin(r(a1)));
  const x2 = round(x1 + L2 * Math.cos(r(a1 + a2))), y2 = round(y1 + L2 * Math.sin(r(a1 + a2)));
  const ox = 170, oy = 170;
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 340 190" className="w-full rounded-2xl bg-slate-50" role="img" aria-label="Two-joint robotic arm">
        <circle cx={ox} cy={oy} r={L1 + L2} fill="#dbeafe" fillOpacity="0.5" />
        <line x1="0" x2="340" y1={oy} y2={oy} stroke="#cbd5e1" />
        <line x1={ox} y1={oy} x2={ox + x1} y2={oy - y1} stroke="#1e3a8a" strokeWidth="10" strokeLinecap="round" />
        <line x1={ox + x1} y1={oy - y1} x2={ox + x2} y2={oy - y2} stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" />
        <circle cx={ox} cy={oy} r="8" fill="#0f172a" />
        <circle cx={ox + x1} cy={oy - y1} r="6" fill="#0f172a" />
        <circle cx={ox + x2} cy={oy - y2} r="6" fill="#f59e0b" />
      </svg>
      <div className="space-y-4">
        <Slider label="Joint 1 (shoulder)" value={a1} min={0} max={180} unit="°" onChange={setA1} />
        <Slider label="Joint 2 (elbow)" value={a2} min={-150} max={150} unit="°" onChange={setA2} />
        <Readout items={[["Gripper x", `${x2.toFixed(1)}`], ["Gripper y", `${y2.toFixed(1)}`], ["Reach", `${Math.hypot(x2, y2).toFixed(1)}`]]} />
      </div>
    </div>
  );
}

function TransistorSim() {
  const [vg, setVg] = useState(0.4);
  const vth = 0.7;
  const id = vg <= vth ? 0 : 5 * (vg - vth) ** 2; // mA, simplified square law
  const on = vg > vth;
  return (
    <div className="space-y-4">
      <div className="flex aspect-[16/9] items-center justify-center gap-6 rounded-2xl bg-slate-50 p-4">
        <div className={`flex h-20 w-20 items-center justify-center rounded-full text-sm font-bold transition ${on ? "bg-amber-300 text-amber-900 shadow-[0_0_40px_rgba(251,191,36,0.7)]" : "bg-slate-200 text-slate-500"}`}>
          {on ? "ON · 1" : "OFF · 0"}
        </div>
        <div className="text-sm text-slate-600">
          <p>Threshold V<sub>th</sub> = {vth} V</p>
          <p className="mt-1">Drain current flows only above threshold.</p>
        </div>
      </div>
      <div className="space-y-4">
        <Slider label="Gate voltage" value={vg} min={0} max={2} step={0.05} unit=" V" onChange={setVg} />
        <Readout items={[["Drain current", `${id.toFixed(2)} mA`], ["State", on ? "Conducting" : "Off"]]} />
      </div>
    </div>
  );
}

function CircuitSim() {
  const [v, setV] = useState(9);
  const [res, setRes] = useState(450);
  const i = (v / res) * 1000;
  return (
    <div className="space-y-4">
      <svg viewBox="0 0 340 190" className="w-full rounded-2xl bg-slate-50" role="img" aria-label="Series circuit">
        <rect x="60" y="40" width="220" height="110" fill="none" stroke="#334155" strokeWidth="3" rx="6" />
        <rect x="40" y="80" width="40" height="30" fill="#fff" stroke="#334155" strokeWidth="2" />
        <text x="47" y="100" fontSize="11" fill="#0f172a">{v}V</text>
        <path d="M140 40 l8 -10 l8 20 l8 -20 l8 20 l8 -20 l8 10" fill="#fff" stroke="#334155" strokeWidth="2.5" />
        <text x="148" y="70" fontSize="11" fill="#0f172a">{res}Ω</text>
        <circle cx="280" cy="95" r="16" fill="#fef3c7" stroke="#d97706" strokeWidth="2" opacity={Math.min(1, 0.2 + i / 40)} />
        <text x="230" y="170" fontSize="11" fill="#0f172a">I = {i.toFixed(1)} mA</text>
      </svg>
      <div className="space-y-4">
        <Slider label="Supply voltage" value={v} min={1} max={12} unit=" V" onChange={setV} />
        <Slider label="Resistance" value={res} min={100} max={1000} step={10} unit=" Ω" onChange={setRes} />
        <Readout items={[["Current", `${i.toFixed(1)} mA`], ["Power", `${((v * i) / 1000).toFixed(3)} W`]]} />
      </div>
    </div>
  );
}

function ResourceSim() {
  const [rate, setRate] = useState(30);
  const [material, setMaterial] = useState<"Aluminium" | "Plastic" | "Glass">("Aluminium");
  const saving = { Aluminium: 0.95, Plastic: 0.6, Glass: 0.3 }[material]; // illustrative energy saving vs virgin
  const demand = 1000; // tonnes
  const virgin = demand * (1 - rate / 100);
  const energySaved = (rate / 100) * saving * 100;
  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl bg-slate-50 p-5">
        <p className="text-xs font-semibold text-slate-500">Material sourced for 1,000 t of product</p>
        <div className="flex h-8 overflow-hidden rounded-lg">
          <div className="bg-lime-500" style={{ width: `${rate}%` }} />
          <div className="flex-1 bg-slate-400" />
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Recycled: {demand - virgin} t</span>
          <span>Virgin: {virgin} t</span>
        </div>
        <p className="text-[11px] text-slate-400">Illustrative coefficients for learning purposes only.</p>
      </div>
      <div className="space-y-4">
        <select value={material} onChange={(e) => setMaterial(e.target.value as typeof material)} aria-label="Material"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
          <option>Aluminium</option>
          <option>Plastic</option>
          <option>Glass</option>
        </select>
        <Slider label="Recycling rate" value={rate} min={0} max={100} step={5} unit="%" onChange={setRate} />
        <Readout items={[["Virgin material", `${virgin} t`], ["Energy saved", `~${energySaved.toFixed(0)}%`]]} />
      </div>
    </div>
  );
}
