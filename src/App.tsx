import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import stationData from "../data/cta_l_stations_oak_park.json";

type Station = {
  map_id: string;
  name: string;
  lat: number;
  lon: number;
  lines: string[];
};

const LINE_NAMES: Record<string, string> = {
  red: "Red",
  blue: "Blue",
  brn: "Brown",
  g: "Green",
  o: "Orange",
  p: "Purple",
  pexp: "Purple Express",
  y: "Yellow",
  pnk: "Pink",
};

const LINE_COLORS: Record<string, string> = {
  red: "#c60c30",
  blue: "#00a1de",
  brn: "#62361b",
  g: "#009b3a",
  o: "#f9461c",
  p: "#522398",
  pexp: "#522398",
  y: "#f9e300",
  pnk: "#e27ea6",
};

// Pick black or white text for a badge so it stays readable on each line color.
function badgeText(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0f172a" : "#ffffff";
}

const stations = (stationData as { stations: Station[] }).stations;
const OAK_PARK_CENTER: [number, number] = [41.8875, -87.7905];

export default function App() {
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markers = useRef<Map<string, L.CircleMarker>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...stations].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, { scrollWheelZoom: true, zoomControl: false }).setView(
      OAK_PARK_CENTER,
      13,
    );
    L.control.zoom({ position: "topright" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    for (const s of stations) {
      const color = LINE_COLORS[s.lines[0]] ?? "#334155";
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 9,
        color: "#ffffff",
        weight: 2.5,
        fillColor: color,
        fillOpacity: 1,
      })
        .bindTooltip(s.name, { direction: "top", offset: [0, -8] })
        .addTo(map)
        .on("click", () => setSelected(s.map_id));
      markers.current.set(s.map_id, marker);
    }

    map.fitBounds(L.latLngBounds(stations.map((s) => [s.lat, s.lon] as [number, number])), {
      padding: [28, 28],
      maxZoom: 14,
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markers.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected) return;
    const s = stations.find((x) => x.map_id === selected);
    if (!s) return;
    map.setView([s.lat, s.lon], Math.max(map.getZoom(), 15), { animate: true });
    markers.current.get(selected)?.openTooltip();
  }, [selected]);

  return (
    <div className="flex h-dvh flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="relative z-10 shrink-0 bg-slate-900 px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] text-white shadow-md dark:bg-slate-900">
        <div className="mx-auto flex max-w-3xl items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-sky-300">
              CTA 'L' · Oak Park
            </p>
            <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight">Transit Dashboard</h1>
          </div>
          <p className="shrink-0 whitespace-nowrap rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
            {stations.length} stations
          </p>
        </div>
      </header>

      <div
        ref={mapEl}
        className="relative h-[42dvh] min-h-64 w-full shrink-0 border-b border-slate-300 dark:border-slate-800"
        role="region"
        aria-label="Map of CTA stations"
      />

      <section className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
          <h2 className="px-4 pb-2 pt-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Stations
          </h2>
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {sorted.map((s) => {
              const isSelected = selected === s.map_id;
              const accent = LINE_COLORS[s.lines[0]] ?? "#334155";
              return (
                <li key={s.map_id}>
                  <button
                    type="button"
                    onClick={() => setSelected(s.map_id)}
                    aria-pressed={isSelected}
                    className={`flex min-h-14 w-full items-center gap-3 overflow-hidden rounded-xl border bg-white px-4 py-3 text-left shadow-sm transition-colors dark:bg-slate-900 ${
                      isSelected
                        ? "border-sky-500 ring-2 ring-sky-500/40"
                        : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="h-8 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent }}
                    />
                    <span className="min-w-0 flex-1 font-medium leading-snug">{s.name}</span>
                    <span className="flex shrink-0 flex-wrap justify-end gap-1">
                      {s.lines.map((l) => {
                        const color = LINE_COLORS[l] ?? "#334155";
                        return (
                          <span
                            key={l}
                            title={`${LINE_NAMES[l] ?? l} Line`}
                            className="rounded-md px-2 py-0.5 text-xs font-bold"
                            style={{ backgroundColor: color, color: badgeText(color) }}
                          >
                            {LINE_NAMES[l] ?? l}
                          </span>
                        );
                      })}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
