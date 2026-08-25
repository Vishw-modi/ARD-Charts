"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type TooltipState = {
  visible: boolean;
  x: number;
  y: number;
  content: ReactNode | null;
};

type TooltipContextType = {
  show: (x: number, y: number, content: ReactNode) => void;
  hide: () => void;
};

const TooltipContext = createContext<TooltipContextType | undefined>(undefined);

const emptySubscribe = () => () => {};

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    content: null,
  });

  const show = useCallback((x: number, y: number, content: ReactNode) => {
    setState({ visible: true, x, y, content });
  }, []);

  const hide = useCallback(() => {
    setState((prev) => prev.visible ? { ...prev, visible: false } : prev);
  }, []);

  const contextValue = useMemo(() => ({ show, hide }), [show, hide]);

  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <TooltipContext.Provider value={contextValue}>
      {children}
      {isClient &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-[6px] bg-[#1A2B4A] px-[10px] py-[6px] text-[12px] text-white transition-opacity duration-100 ease-in-out"
            style={{
              left: state.x,
              top: state.y,
              opacity: state.visible ? 1 : 0,
              visibility: state.visible ? "visible" : "hidden",
            }}
          >
            {state.content}
          </div>,
          document.body
        )}
    </TooltipContext.Provider>
  );
}

export function useTooltip() {
  const context = useContext(TooltipContext);
  if (context === undefined) {
    throw new Error("useTooltip must be used within a TooltipProvider");
  }
  return context;
}
