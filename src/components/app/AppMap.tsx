import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPoint {
  lat: number;
  lng: number;
  color: string;
  label?: string;
}

interface Props {
  center: [number, number];
  points: MapPoint[];
  className?: string;
  pin?: boolean;
  fly?: { lat: number; lng: number; n: number } | null;
  onCenterChange?: (lat: number, lng: number) => void;
}

function icon(p: MapPoint) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${p.color};border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
  });
}

export default function AppMap({ center, points, className, pin, fly, onCenterChange }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const centered = useRef(false);
  const programmatic = useRef(0);
  const cb = useRef(onCenterChange);
  cb.current = onCenterChange;
  const pinRef = useRef(pin);
  pinRef.current = pin;

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: false }).setView(center, 15);
    map.current = m;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("moveend", () => {
      if (programmatic.current > 0) {
        programmatic.current -= 1;
        return;
      }
      if (pinRef.current) {
        const c = m.getCenter();
        cb.current?.(c.lat, c.lng);
      }
    });
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !fly) return;
    programmatic.current += 1;
    m.setView([fly.lat, fly.lng], Math.max(m.getZoom(), 15), { animate: false });
    window.setTimeout(() => { if (programmatic.current > 0) programmatic.current -= 1; }, 300);
  }, [fly?.n]);

  useEffect(() => {
    const m = map.current;
    if (!m || !layer.current) return;
    layer.current.clearLayers();
    points.forEach((p) => {
      const mk = L.marker([p.lat, p.lng], { icon: icon(p) }).addTo(layer.current!);
      if (p.label) mk.bindTooltip(p.label, { permanent: true, direction: "top", offset: [0, -14] });
    });
    if (pin) return;
    programmatic.current += 1;
    if (points.length > 1) {
      m.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [60, 60], maxZoom: 15, animate: false });
    } else if (!centered.current || points.length === 1) {
      m.setView(points[0] ? [points[0].lat, points[0].lng] : center, centered.current ? m.getZoom() : 15, { animate: false });
      centered.current = true;
    }
    window.setTimeout(() => { if (programmatic.current > 0) programmatic.current -= 1; }, 300);
  }, [points, center, pin]);

  return (
    <div className="relative">
      <div ref={el} className={className} />
      {pin && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[500] -translate-x-1/2 -translate-y-full">
          <div className="flex flex-col items-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900 shadow-lg ring-4 ring-white">
              <span className="h-3.5 w-3.5 rounded-full bg-[#fcd34d]" />
            </div>
            <div className="h-4 w-1 rounded-b bg-neutral-900" />
          </div>
        </div>
      )}
    </div>
  );
}
