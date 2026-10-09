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
    const map = L.map(mapEl.current, { scrollWheelZoom: true }).setView(OAK_PARK_CENTER, 14);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    for (const s of stations) {
      const color = LINE_COLORS[s.lines[0]] ?? "#333";
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: 9,
        color: "#ffffff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      })
        .bindTooltip(s.name)
        .addTo(map)
        .on("click", () => setSelected(s.map_id));
      markers.current.set(s.map_id, marker);
    }

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
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] dark:border-slate-800">
        <h1 className="text-lg font-semibold">Oak Park Transit</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          CTA 'L' stations near Oak Park
        </p>
      </header>

      <div
        ref={mapEl}
        className="h-[45dvh] min-h-64 w-full shrink-0"
        role="region"
        aria-label="Map of CTA stations"
      />

      <section className="flex min-h-0 flex-1 flex-col">
        <h2 className="sr-only">Stations</h2>
        <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {sorted.map((s) => {
            const isSelected = selected === s.map_id;
            return (
              <li key={s.map_id} className="border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelected(s.map_id)}
                  aria-pressed={isSelected}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left text-base ${
                    isSelected ? "bg-sky-100 dark:bg-sky-900/40" : "hover:bg-slate-100 dark:hover:bg-slate-900"
                  }`}
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="flex shrink-0 gap-1">
                    {s.lines.map((l) => (
                      <span
                        key={l}
                        title={`${LINE_NAMES[l] ?? l} Line`}
                        className="rounded px-2 py-0.5 text-xs font-semibold text-slate-900"
                        style={{ backgroundColor: LINE_COLORS[l] ?? "#ccc" }}
                      >
                        {LINE_NAMES[l] ?? l}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
