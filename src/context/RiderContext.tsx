import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";

export type OrderStatus = "PENDING" | "PICKED_UP" | "DELIVERED" | "CANCELLED";
export type RiderWorkStatusCode = "QUEUED" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type RiderWork = {
  id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  work_at?: string | null;
  finish_at?: string | null;
  order_id: number;
  rider_id: number;
  rider_work_status_id: number;
  status_code: RiderWorkStatusCode;
  status_label: string;
  order_code?: string;
  customer_name?: string;
  restaurant_name?: string;
  pickup_address?: string;
  dropoff_address?: string;
  estimate_distance_km?: number;
  estimate_fee?: number;
};

type State = {
  isWorking: boolean;
  currentWork: RiderWork | null;
  queueCount: number;
};

type Action =
  | { type: "SET_WORKING"; payload: boolean }
  | { type: "SET_CURRENT_WORK"; payload: RiderWork | null }
  | { type: "SET_QUEUE_COUNT"; payload: number };

const initialState: State = {
  isWorking: false,
  currentWork: null,
  queueCount: 0,
};

const KEY = "rider.ctx.v1";

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_WORKING": return { ...state, isWorking: action.payload };
    case "SET_CURRENT_WORK": return { ...state, currentWork: action.payload };
    case "SET_QUEUE_COUNT": return { ...state, queueCount: action.payload };
    default: return state;
  }
}

type Ctx = State & {
  setWorking: (b: boolean) => void;
  setCurrentWork: (w: RiderWork | null) => void;
  setQueueCount: (n: number) => void;
};

const RiderContext = createContext<Ctx | null>(null);

export const RiderProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (s) => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return { ...s, ...JSON.parse(raw) };
    } catch {}
    return s;
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  // sync ข้ามแท็บ (เผื่ออนาคต)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          const next: State = JSON.parse(e.newValue);
          dispatch({ type: "SET_WORKING", payload: next.isWorking });
          dispatch({ type: "SET_CURRENT_WORK", payload: next.currentWork });
          dispatch({ type: "SET_QUEUE_COUNT", payload: next.queueCount });
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setWorking = useCallback((b: boolean) => dispatch({ type: "SET_WORKING", payload: b }), []);
  const setCurrentWork = useCallback((w: RiderWork | null) => dispatch({ type: "SET_CURRENT_WORK", payload: w }), []);
  const setQueueCount = useCallback((n: number) => dispatch({ type: "SET_QUEUE_COUNT", payload: n }), []);

  const value = useMemo(() => ({ ...state, setWorking, setCurrentWork, setQueueCount }), [state, setWorking, setCurrentWork, setQueueCount]);

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
};

export const useRider = () => {
  const ctx = useContext(RiderContext);
  if (!ctx) throw new Error("useRider must be used within RiderProvider");
  return ctx;
};
