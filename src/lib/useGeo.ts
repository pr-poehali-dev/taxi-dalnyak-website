import { useCallback, useEffect, useRef, useState } from "react";

export function useGeo(active: boolean, watch = false) {
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");
  const ref = useRef<[number, number] | null>(null);

  const locate = useCallback(() => {
    setError("");
    if (!navigator.geolocation) {
      setError("Ваш телефон не поддерживает определение местоположения");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const c: [number, number] = [p.coords.latitude, p.coords.longitude];
        ref.current = c;
        setPos(c);
      },
      () => setError("Разрешите доступ к местоположению в настройках телефона"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  useEffect(() => {
    if (!active) return;
    locate();
    if (!watch) return;
    const id = navigator.geolocation?.watchPosition(
      (p) => { ref.current = [p.coords.latitude, p.coords.longitude]; },
      () => undefined,
      { enableHighAccuracy: true },
    );
    return () => { if (id !== undefined) navigator.geolocation.clearWatch(id); };
  }, [active, watch, locate]);

  return { pos, ref, error, locate };
}
