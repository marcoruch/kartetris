import { useEffect, useState } from "react";
import type { TetrisFigure } from "../../../../shared/types";

export default function NextFigure({ figure }: { figure: TetrisFigure }) {
  const [nextShape, setNextShape] = useState<number[][] | undefined>();
  useEffect(() => {
    if (figure) {
      setNextShape(figure?.shape);
    }
  }, [figure?.type]);

  return (
    <div className="flex flex-col">
      {nextShape?.map((row: number[], ri: number) => (
        <div key={ri} className="flex">
          {row.map((cell: number, ci: number) => (
            <div
              key={"next" + ci}
              className={`w-5 h-5 border border-stone-900 m-0.5 rounded-sm  w-5 h-5 neon-glow-for-blocks ${
                cell ? "neon-glow-for-blocks" : "neon-glow-for-non-playing-blocks"}`}
              style={{ backgroundColor: cell ? figure.color : "transparent", border: cell ? '1px solid #fffbe6' : '' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
