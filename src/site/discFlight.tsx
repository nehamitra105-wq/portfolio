import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import Disc from "../components/Disc";
import type { CaseStudy } from "./caseStudies";

export const FLIGHT_MS = 1300;
const FLIGHT_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";

type Box = { left: number; top: number; size: number; rotate: number };

export type Flight = {
  study: CaseStudy;
  from: Box;
  to: Box;
  startedAt: number;
};

const FlightContext = createContext<{
  flight: Flight | null;
  startFlight: (flight: Omit<Flight, "startedAt">) => void;
}>({ flight: null, startFlight: () => {} });

export const useDiscFlight = () => useContext(FlightContext);

// The CD that flies from the home shelf to its corner of the brief page. It
// lives above the routes so it keeps flying while the page switches, which
// lets the brief start coming in before the CD lands.
export function DiscFlightProvider({ children }: { children: ReactNode }) {
  const [flight, setFlight] = useState<Flight | null>(null);
  const startFlight = useCallback(
    (next: Omit<Flight, "startedAt">) => setFlight({ ...next, startedAt: performance.now() }),
    [],
  );

  return (
    <FlightContext.Provider value={{ flight, startFlight }}>
      {children}
      {flight && <FlyingDisc flight={flight} onLanded={() => setFlight(null)} />}
    </FlightContext.Provider>
  );
}

function FlyingDisc({ flight, onLanded }: { flight: Flight; onLanded: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onLandedRef = useRef(onLanded);
  onLandedRef.current = onLanded;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const box = ({ left, top, size, rotate }: Box) => ({
      left: `${left}px`,
      top: `${top}px`,
      width: `${size}px`,
      height: `${size}px`,
      transform: `rotate(${rotate}deg)`,
    });
    const animation = el.animate([box(flight.from), box(flight.to)], {
      duration: FLIGHT_MS,
      easing: FLIGHT_EASING,
      fill: "forwards",
    });
    // Hand over to the brief page's own disc a moment after landing.
    let handOver = 0;
    animation.onfinish = () => {
      handOver = window.setTimeout(() => onLandedRef.current(), 120);
    };
    return () => {
      animation.cancel();
      window.clearTimeout(handOver);
    };
  }, [flight]);

  return <Disc className="pointer-events-none fixed z-50" disc={flight.study.shelfDisc} ref={ref} />;
}
