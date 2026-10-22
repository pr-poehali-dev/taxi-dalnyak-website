import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapPoint, MapProps } from "./AppMap";

const TILE_SOURCES: { url: string; opts: L.TileLayerOptions }[] = [
  { url: "https://tile{s}.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1", opts: { subdomains: "0123", maxNativeZoom: 18 } },
  { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png", opts: { subdomains: "abcd", maxNativeZoom: 19 } },
  { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", opts: { maxNativeZoom: 19 } },
];

function carHtml(p: MapPoint) {
  return `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:30px;height:30px;border-radius:10px;background:${p.color};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div></div>`;
}

function icon(p: MapPoint) {
  if (p.car) return L.divIcon({ className: "", iconSize: [30, 30], iconAnchor: [15, 15], html: carHtml(p) });
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

    let src = 0;
    let errors = 0;
    let tiles = L.tileLayer(TILE_SOURCES[0].url, { ...TILE_SOURCES[0].opts, maxZoom: 19, className: "soft-tiles" }).addTo(m);
    const attach = () => {
      tiles.on("tileload", () => { errors = 0; });
      tiles.on("tileerror", () => {
        errors += 1;
        if (errors < 4 || src >= TILE_SOURCES.length - 1) return;
        errors = 0;
        src += 1;
        m.removeLayer(tiles);
        tiles = L.tileLayer(TILE_SOURCES[src].url, { ...TILE_SOURCES[src].opts, maxZoom: 19, className: "soft-tiles" }).addTo(m);
        attach();
      });
    };
    attach();

    layer.current = L.layerGroup().addTo(m);
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => m.invalidateSize()) : null;
    ro?.observe(el.current);
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
      ro?.disconnect();
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
