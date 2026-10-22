import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import type { GLProps, MapPoint } from "./AppMap";

const STYLE_URL = "https://tiles.openfreemap.org/styles/bright";
let styleCache: Promise<maplibregl.StyleSpecification | string> | null = null;

function loadStyle(): Promise<maplibregl.StyleSpecification | string> {
  if (!styleCache) {
    styleCache = fetch(STYLE_URL)
      .then((r) => r.json())
      .then((st) => {
        const ru = ["coalesce", ["get", "name:ru"], ["get", "name"], ["get", "name_en"]];
        (st.layers || []).forEach((l: { layout?: Record<string, unknown> }) => {
          const tf = l.layout && l.layout["text-field"];
          if (tf && JSON.stringify(tf).includes('"name')) l.layout!["text-field"] = ru;
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

export default function MapGL({ center, points, className, pin, fly, onCenterChange, fitKey, fitMaxZoom, onFail }: GLProps) {
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
  const failRef = useRef(onFail);
  failRef.current = onFail;
  const pending = useRef<(() => void)[]>([]);
  const run = (fn: () => void) => (ready.current ? fn() : pending.current.push(fn));

  useEffect(() => {
    let dead = false;
    let timer: number | undefined;
    let ro: ResizeObserver | null = null;
    if (!el.current) return;
    const fail = () => {
      if (dead || ready.current) return;
      dead = true;
      failRef.current();
    };
    loadStyle().then((style) => {
      if (dead || !el.current) return;
      let m: maplibregl.Map;
      try {
        m = new maplibregl.Map({
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
      } catch {
        fail();
        return;
      }
      m.touchZoomRotate.disableRotation();
      map.current = m;
      if (typeof ResizeObserver !== "undefined" && el.current) {
        ro = new ResizeObserver(() => { try { m.resize(); } catch { /* ignore */ } });
        ro.observe(el.current);
      }
      timer = window.setTimeout(fail, 9000);
      m.on("error", () => { if (!ready.current) fail(); });
      m.on("moveend", (e: any) => {
        if (!e.originalEvent) return;
        if (pinRef.current) {
          const c = m.getCenter();
          cb.current?.(c.lat, c.lng);
        }
      });
      m.once("load", () => {
        window.clearTimeout(timer);
        ready.current = true;
        pending.current.splice(0).forEach((f) => f());
      });
    }).catch(fail);
    return () => {
      dead = true;
      window.clearTimeout(timer);
      ro?.disconnect();
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

  return <div ref={el} className={className} />;
}
