import React from "react";
import type { CurrentTetrisFigure, GameBoard } from "../../../../shared/types";

interface MainBoardProps {
  width: number;
  height: number;
  board: GameBoard;
  currentFigure?: CurrentTetrisFigure;
}

export default function MainBoard({
  width,
  height,
  board,
  currentFigure,
}: MainBoardProps) {
  const gameGrid = React.useMemo(() => {
    const newGrid = [];

    const currentFigureColor = currentFigure?.figure?.color ?? 'transparent';
    const currentFigureSpots: { x: number; y: number }[] = [];
    if (currentFigure?.figure !== undefined) {
      for (let i = 0; i < currentFigure.figure.shape.length; i++) {
        for (let j = 0; j < currentFigure.figure.shape[i].length; j++) {
          if (currentFigure.figure.shape[j][i] === 1) {
            currentFigureSpots.push({
              x: currentFigure.startingPoint.x + i,
              y: currentFigure.startingPoint.y + j,
            });
          }
        }
      }
    }

    for (let i = 0; i < width; i++) {
      const gridRow = [];
      for (let j = 0; j < height; j++) {
        let color =
          board[j] && board[j][i] !== undefined
            ? board[j][i]!.color
            : "transparent";

        if (currentFigureSpots.some((spot) => spot.x === i && spot.y === j)) {
          color = currentFigureColor;
        }
        gridRow.push({ color });
      }
      newGrid.push(gridRow);
    }
    return newGrid;
  }, [width, height, board, currentFigure]);

  return (
    <div className="mx-auto max-w-fit flex shadow border-1 caret-transparent border-sky-500 rounded-lg bg-neutral-900 w-2xl border-4 border-sky-400 shadow-[0_0_8px_#38bdf8]">
      {gameGrid.map((row, rowIndex) => (
        <div key={rowIndex + "game"}>
          {row.map((cell, cellIndex) => (
            <div
              key={cellIndex + "game"}
              className={`w-5 h-5 m-0.5 rounded-sm ${cell.color !== "transparent" ? "neon-glow-for-blocks" : "neon-glow-for-non-playing-blocks "} ${cell.color.includes("gradient") ? "animated-gradient" : ""}`}
              style={{
                background: cell.color.includes("gradient") ? cell.color : cell.color, 
                backgroundColor: cell.color, 
                border: cell.color !== "transparent" ? '1px solid #fffbe6' : '' }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
