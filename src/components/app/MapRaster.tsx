import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint, MapProps } from "./AppMap";

function icon(p: MapPoint) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${p.color};border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
  });
}

export default function MapRaster({ center, points, className, pin, fly, onCenterChange, fitKey, fitMaxZoom }: MapProps) {
  const lastFit = useRef<string | undefined>(undefined);
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

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "soft-tiles" }).addTo(m);

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
    m.setView([fly.lat, fly.lng], fly.zoom ?? Math.max(m.getZoom(), 15), { animate: false });
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
    if (fitKey !== undefined && fitKey === lastFit.current) return;
    lastFit.current = fitKey;
    programmatic.current += 1;
    if (points.length > 1) {
      m.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [50, 50], maxZoom: fitMaxZoom ?? 15, animate: false });
    } else if (!centered.current || points.length === 1) {
      m.setView(points[0] ? [points[0].lat, points[0].lng] : center, fitKey !== undefined ? (fitMaxZoom ?? 15) : (centered.current ? m.getZoom() : 15), { animate: false });
      centered.current = true;
    }
    window.setTimeout(() => { if (programmatic.current > 0) programmatic.current -= 1; }, 300);
  }, [points, center, pin]);

  return <div ref={el} className={className} />;
}
