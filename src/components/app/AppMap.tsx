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
  onPick?: (lat: number, lng: number) => void;
}

function icon(p: MapPoint) {
  return L.divIcon({
    className: "",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="width:28px;height:28px;border-radius:50%;background:${p.color};border:4px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
  });
}

export default function AppMap({ center, points, className, onPick }: Props) {
  const pickRef = useRef(onPick);
  pickRef.current = onPick;
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const centered = useRef(false);

  useEffect(() => {
    if (!el.current || map.current) return;
    map.current = L.map(el.current, { zoomControl: false, attributionControl: false }).setView(center, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    map.current.on("click", (e: L.LeafletMouseEvent) => pickRef.current?.(e.latlng.lat, e.latlng.lng));
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layer.current) return;
    layer.current.clearLayers();
    points.forEach((p) => {
      const m = L.marker([p.lat, p.lng], { icon: icon(p) }).addTo(layer.current!);
      if (p.label) m.bindTooltip(p.label, { permanent: true, direction: "top", offset: [0, -14] });
    });
    if (points.length > 1) {
      map.current.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [60, 60], maxZoom: 15 });
    } else if (!centered.current || points.length === 1) {
      map.current.setView(points[0] ? [points[0].lat, points[0].lng] : center, centered.current ? map.current.getZoom() : 15);
      centered.current = true;
    }
  }, [points, center]);

  return <div ref={el} className={className} />;
}
