import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from "react";

type TiltState = {
  rx: number;
  ry: number;
  glowX: number;
  glowY: number;
  hovering: boolean;
};

const INITIAL: TiltState = { rx: 0, ry: 0, glowX: 50, glowY: 50, hovering: false };

export function useCardTilt(max = 14, hoverScale = 1.05) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const [state, setState] = useState<TiltState>(INITIAL);

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const ratioX = (x - 0.5) * 2; // -1..1
        const ratioY = (y - 0.5) * 2;
        setState({
          ry: ratioX * max,
          rx: -ratioY * max,
          glowX: x * 100,
          glowY: y * 100,
          hovering: true,
        });
      });
    },
    [max],
  );

  const onMouseEnter = useCallback(() => {
    setState((s) => ({ ...s, hovering: true }));
  }, []);

  const onMouseLeave = useCallback(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
    setState(INITIAL);
  }, []);

  const style: CSSProperties = {
    transform: `perspective(800px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) scale(${state.hovering ? hoverScale : 1})`,
    transition: state.hovering
      ? "transform 0.08s ease-out"
      : "transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)",
    willChange: "transform",
  };

  return {
    ref,
    style,
    glowX: state.glowX,
    glowY: state.glowY,
    hovering: state.hovering,
    handlers: { onMouseMove, onMouseEnter, onMouseLeave },
  };
}
