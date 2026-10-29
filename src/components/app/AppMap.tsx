import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import MapRaster from "./MapRaster";

export interface MapPoint {
  lat: number;
  lng: number;
  color: string;
  label?: string;
  car?: boolean;
}

export interface MapProps {
  center: [number, number];
  points: MapPoint[];
  className?: string;
  pin?: boolean;
  fly?: { lat: number; lng: number; n: number; zoom?: number } | null;
  fitKey?: string;
  fitMaxZoom?: number;
  onCenterChange?: (lat: number, lng: number) => void;
}

export type GLProps = MapProps & { onFail: () => void };

function FailNow({ onFail }: GLProps): React.JSX.Element | null {
  useEffect(() => { onFail(); }, []);
  return null;
}

const MapGL = lazy<(p: GLProps) => React.JSX.Element | null>(() => import("./MapGL").catch(() => ({ default: FailNow })));

const FLAG = "map_gl_failed";

function glAvailable() {
  try {
    if (localStorage.getItem("map_gl") !== "1") return false;
    if (sessionStorage.getItem(FLAG) === "1") return false;
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

export default function AppMap(props: MapProps) {
  const [gl, setGl] = useState(glAvailable);
  const fail = useCallback(() => {
    try { sessionStorage.setItem(FLAG, "1"); } catch { /* ignore */ }
    setGl(false);
  }, []);

  return (
    <div className="relative">
      {gl ? (
        <Suspense fallback={<div className={`${props.className || ""} bg-neutral-100`} />}>
          <MapGL {...props} onFail={fail} />
        </Suspense>
      ) : (
        <MapRaster {...props} />
      )}
      {props.pin && (
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