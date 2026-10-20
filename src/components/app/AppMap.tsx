import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

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
  fly?: { lat: number; lng: number; n: number; zoom?: number } | null;
  fitKey?: string;
  fitMaxZoom?: number;
  onCenterChange?: (lat: number, lng: number) => void;
}

const STYLE_URL = "https://tiles.openfreemap.org/styles/bright";
let styleCache: Promise<maplibregl.StyleSpecification | string> | null = null;

function loadStyle(): Promise<maplibregl.StyleSpecification | string> {
  if (!styleCache) {
    styleCache = fetch(STYLE_URL)
      .then((r) => r.json())
      .then((st) => {
        const ru = ["coalesce", ["get", "name:ru"], ["get", "name"], ["get", "name_en"]];
        (st.layers || []).forEach((l: { layout?: Record<string, unknown> }) => {
          if (l.layout && l.layout["text-field"]) l.layout["text-field"] = ru;
        });
        return st as maplibregl.StyleSpecification;
      })
      .catch(() => STYLE_URL);
  }
  return styleCache;
}

function markerEl(p: MapPoint) {
  const wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;pointer-events:none";
  if (p.label) {
    const t = document.createElement("div");
    t.textContent = p.label;
    t.style.cssText = "margin-bottom:4px;padding:2px 8px;border-radius:9999px;background:#fff;color:#171717;font:700 12px Manrope,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25);white-space:nowrap";
    wrap.appendChild(t);
  }
  const d = document.createElement("div");
  d.style.cssText = `width:24px;height:24px;border-radius:50%;background:${p.color};border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)`;
  wrap.appendChild(d);
  return wrap;
}

export default function AppMap({ center, points, className, pin, fly, onCenterChange, fitKey, fitMaxZoom }: Props) {
  const lastFit = useRef<string | undefined>(undefined);
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const centered = useRef(false);
  const cb = useRef(onCenterChange);
  cb.current = onCenterChange;
  const pinRef = useRef(pin);
  pinRef.current = pin;
  const ready = useRef(false);
  const pending = useRef<(() => void)[]>([]);
  const run = (fn: () => void) => (ready.current ? fn() : pending.current.push(fn));

  useEffect(() => {
    let dead = false;
    if (!el.current) return;
    loadStyle().then((style) => {
      if (dead || !el.current) return;
      const m = new maplibregl.Map({
        container: el.current,
        style,
        center: [center[1], center[0]],
        zoom: 14,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        fadeDuration: 0,
      });
      m.touchZoomRotate.disableRotation();
      map.current = m;
      m.on("moveend", (e: any) => {
        if (!e.originalEvent) return;
        if (pinRef.current) {
          const c = m.getCenter();
          cb.current?.(c.lat, c.lng);
        }
      });
      m.once("load", () => {
        ready.current = true;
        pending.current.splice(0).forEach((f) => f());
      });
    });
    return () => {
      dead = true;
      ready.current = false;
      markers.current.forEach((x) => x.remove());
      markers.current = [];
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!fly) return;
    run(() => {
      const m = map.current;
      if (!m) return;
      m.jumpTo({ center: [fly.lng, fly.lat], zoom: fly.zoom ? fly.zoom - 1 : Math.max(m.getZoom(), 14) });
    });
  }, [fly?.n]);

  useEffect(() => {
    run(() => {
      const m = map.current;
      if (!m) return;
      markers.current.forEach((x) => x.remove());
      markers.current = points.map((p) => new maplibregl.Marker({ element: markerEl(p), anchor: "bottom" }).setLngLat([p.lng, p.lat]).addTo(m));
      if (pin) return;
      if (fitKey !== undefined && fitKey === lastFit.current) return;
      lastFit.current = fitKey;
      if (points.length > 1) {
        const b = new maplibregl.LngLatBounds();
        points.forEach((p) => b.extend([p.lng, p.lat]));
        m.fitBounds(b, { padding: 60, maxZoom: (fitMaxZoom ?? 15) - 1, animate: false });
      } else if (!centered.current || points.length === 1) {
        const c = points[0] ? [points[0].lng, points[0].lat] : [center[1], center[0]];
        m.jumpTo({ center: c as [number, number], zoom: fitKey !== undefined ? (fitMaxZoom ?? 15) - 1 : centered.current ? m.getZoom() : 14 });
        centered.current = true;
      }
    });
  }, [points, center, pin]);

  return (
    <div className="relative">
      <div ref={el} className={className} />
      {pin && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[5] -translate-x-1/2 -translate-y-full">
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
