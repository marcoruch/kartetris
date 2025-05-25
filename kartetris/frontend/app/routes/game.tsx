import { useEffect, useState, useRef } from "react";
import type { Route } from "./+types/game";
import GameController from "../controller/game";
import MainBoard from "../components/game/mainBoard";
import NextFigure from "../components/game/nextFigure";
import {
  type CurrentTetrisFigure,
  type EffectMessage,
  type GameBoard,
  type GameResultMessage,
  type WSGameResultMessage,
  type WSGameUpdateMessage,
  type WsGameUpdateMessageSerialized,
} from "../../../shared/types";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../state/store";
import { setOpponent, setOpponentBoard } from "../state/slices/boardSlice";
import { socketService } from "../state/services/socketService";
import { WSSerializer } from "@/lib/serializer";
import Scoreboard from "../components/game/scoreboard";
import { incrementLines, setOpponentScore, setWon } from "../state/slices/scoreboardSlice";
import SlotMachine from "../components/game/slotMachine";
import { toast } from "../components/ui/hooks/use-toast";
import { useNavigate } from "react-router";
import { effects } from "@/lib/effects";
import CharacterCard from "../components/menu/CharacterCard";
import PlayerCard from "../components/shared/PlayerCard";
import { Play } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Kartetris - A turn on Tetris" },
    {
      name: "Kartetris is a 1v1 live Tetris app with a twist, pick up the boxes to explore the specials!",
      content: "Welcome to Kartetris!",
    },
  ];
}

export default function Game() {
  const GAMESIZE_WIDTH = 10;
  const GAMESIZE_HEIGHT = 20;
  let navigate = useNavigate();

  const [boardFigures, setBoardFigures] = useState<GameBoard>([]);
  const [step, setStep] = useState<number>();
  const [blowoutText, setBlowoutText] = useState<string | null>(null);
  const [currentFigure, setCurrentFigure] = useState<
    CurrentTetrisFigure | undefined
  >();

  const board = useSelector((state: RootState) => state.board);
  const character = useSelector((state: RootState) => state.player.character);
  const playerName = useSelector((state: RootState) => state.player.name);
  const opponent = useSelector(
    (state: RootState) => state.board.opponent
  );
  const dispatch = useDispatch();
  const gameRef = useRef<GameController | null>(null);
  const won = useSelector((state: RootState) => state.scoreboard.won);
  const wonRef = useRef(won);
  const score = useSelector((state: RootState) => state.scoreboard.score);
  const scoreRef = useRef(score);
  let doubleGameSpeedActive = false;

  const [showSlot, setShowSlot] = useState(false);
  const effectNames = effects.map(e => e.name);
  const handleSpecialBlockCollision = () => {
    setShowSlot(true);
  };
  const handleEffectSelected = (effectName: string) => {
    const effect = effects.find(e => e.name === effectName);
    if (effect) {
      if (effect.type === 'buff')
        effect.apply(gameRef.current!);
      else {
        socketService.emit("effect", {
          name: effect.name,
          roomId: board.roomId,
        } as EffectMessage)
      }
    }
  };
  const handleSlotSettled = () => {
    setShowSlot(false);
  }
  socketService.on("effect", (data: EffectMessage) => {
    effects.forEach((effect) => {
      if (effect.name === data.name) {
        effect.apply(gameRef.current!);

        toast({
          variant: "info",
          title: "Effect applied!",
          description: `Your opponent has applied the effect: ${effect.name}`,
        })
        if (effect.name === "DoubleGameSpeed") {
          doubleGameSpeedActive = true;
          setTimeout(() => {
            doubleGameSpeedActive = false;
          }, effect.duration);
        }
      }
    });
  });

  socketService.on("gameResult", (data: Omit<WSGameResultMessage, 'winnerScore' & 'looserScore'>) => {
    const weWon = playerName === data.winnerName
    dispatch(setWon({ won: weWon }));
    gameRef.current!.status = weWon ? "won" : "lost";
    gameEnded();
  });

  const handleLineCompletion = (linesCompleted: number) => {
    dispatch(incrementLines(linesCompleted));
  };

  const handleKeyDown = (event: { key: any }) => {
    const game = gameRef.current!;

    if (game.isFinished()) {
      return;
    }

    switch (event.key) {
      case "ArrowLeft":
        if (!game.checkHorizontalCollision('left'))
          game.currentFigure.moveLeft();
        game.drawAll();
        break;
      case "ArrowRight":
        if (!game.checkHorizontalCollision('right'))
          game.currentFigure.moveRight();
        game.drawAll();
        break;
      case "ArrowDown":
        if (game.currentPressed === "ArrowDown" || doubleGameSpeedActive) {
          break;
        }
        game.currentPressed = "ArrowDown";
        game.increaseSpeed(50);
        break;
      case "ArrowUp":
        game.currentFigure.rotate();
        game.drawAll();
        break;
      default:
        break;
    }
  };

  const handleKeyUp = (event: { key: any }) => {
    const game = gameRef.current!;

    if (game.isFinished()) {
      return;
    }

    game.currentPressed = null;
    if (event.key === "ArrowDown" && !doubleGameSpeedActive) {
      game.normalGameSpeed();
    }
  };

  const sendGameResult = (won: boolean) => {
    const gameResult: GameResultMessage = {
      roomId: board.roomId,
      looserName: won ? opponent?.name! : playerName!,
      winnerName: won ? playerName! : opponent?.name!,
      looserScore: won ? scoreRef.current : 0,
      winnerScore: won ? 0 : scoreRef.current,
    };
    socketService.emitGameResult(gameResult);
  }

  const sendGameUpdate = (gameBoard: GameBoard, currentFigure: CurrentTetrisFigure | undefined, step: number | undefined) => {
    const gameUpdate: WSGameUpdateMessage = {
      roomId: board.roomId,
      update: "Game update",
      currentFigure: currentFigure,
      board: gameBoard,
      step: step,
      score: scoreRef.current,
      won: wonRef.current,
      character: character!,
      playerName: playerName!,
    };
    socketService.emitGameUpdate(gameUpdate);
  }

  const drawCurrent = (
    gameBoard: GameBoard,
    currentFigure: CurrentTetrisFigure | undefined
  ) => {
    setCurrentFigure(currentFigure);
    sendGameUpdate(gameBoard, currentFigure!, step);
  };

  const drawBoard = (
    gameBoard: GameBoard,
    currentFigure: CurrentTetrisFigure | undefined,
    step: number
  ) => {
    setStep(step);
    setBoardFigures(gameBoard);
    sendGameUpdate(gameBoard, currentFigure!, step);
  };

  useEffect(() => {
    scoreRef.current = score;
    wonRef.current = won;
  }, [score, won]);

  const gameEnded = () => {
    if (gameRef.current === null) {
      return;
    }
    setBlowoutText(gameRef.current.status === "won" ? "YOU WON!" : "YOU LOST!");
    toast({
      variant: gameRef.current.status === "won" ? "success" : "destructive",
      title: gameRef.current.status === "won" ? "You won!" : "You lost!",
      description: gameRef.current.status === "won" ? "Congratulations!" : "Better luck next time!",
    });
    setTimeout(() => {
      setBlowoutText(null);
    }, 2000);

    setTimeout(() => {
      navigate('/', { replace: true });
    }, 2500);
  }

  useEffect(() => {
    if (gameRef.current?.isFinished() && won === undefined) {
      sendGameResult(gameRef.current.status === "won");
      dispatch(setWon({
        won: gameRef.current.status === "won",
      }))
      gameEnded();
    }

  }, [gameRef.current?.status]);

  useEffect(() => {
    if (gameRef.current !== null) {
      return;
    }

    gameRef.current = new GameController(
      20,
      200,
      400,
      board.roomId,
      GAMESIZE_WIDTH,
      GAMESIZE_HEIGHT,
      drawBoard,
      drawCurrent,
      handleLineCompletion,
      handleSpecialBlockCollision
    );

    socketService.on("gameUpdate", (data: WsGameUpdateMessageSerialized) => {
      dispatch(
        setOpponentBoard({
          roomId: data.roomId,
          boardTetris: data.board?.map((row: (object | undefined)[]) =>
            row.map((item) =>
              item ? WSSerializer.deserializeFigure(item) : undefined
            )
          ),
          currentFigureTetris: WSSerializer.deserializeCurrentFigure(
            data.currentFigure
          ),
          step: data.step!,
        }),
      );
      dispatch(setOpponent({ name: data.playerName, character: data.character }));
      dispatch(setOpponentScore(data.score!));
    });

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  }, []);

  const gameResult = () => {
    if (won === undefined) {
      return <></>;
    }
    if (won) {
      return <h1 className="text-4xl font-bold text-green-500 mb-0">You won!</h1>;
    } else {
      return <h1 className="text-4xl font-bold text-rose-500 mb-0">You lost!</h1>;
    }
  }

  const slot = () => {
    return showSlot && (
      <div className="w-full flex justify-center z-50 mb-0 mt-0">
        <SlotMachine effects={effectNames} onEffectSelected={handleEffectSelected} onSettled={handleSlotSettled} settleDelay={2000} />
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <Scoreboard />
      <div className="h-16 mb-8 mt-4">
        {gameResult()}
        {slot()}
      </div>
      <div className="flex">
        <div className="flex flex-row items-start justify-start space-x-4 gap-4">
          <PlayerCard character={character!} playerName={playerName!} />
          <MainBoard
            key={board.roomId + "own"}
            width={GAMESIZE_WIDTH}
            height={GAMESIZE_HEIGHT}
            board={boardFigures}
            currentFigure={currentFigure}
          />
          {
            <div className="flex items-center justify-center">
              {won === undefined ? (
                <div className="">
                  <NextFigure figure={gameRef.current?.nextFigure!} />
                </div>) : <></>}
              {blowoutText && (
                <div className="blowout-text">
                  {blowoutText}
                </div>
              )}
            </div>
          }
        </div>
        <div className="flex flex-row items-start justify-start space-x-4 gap-4 ml-4">
          <MainBoard
            key={board.roomId + "opponent"}
            width={GAMESIZE_WIDTH}
            height={GAMESIZE_HEIGHT}
            board={board.opponentBoard}
            currentFigure={board.opponentCurrentFigure}
          />
          { board.opponent ? 
          <PlayerCard
            character={board.opponent?.character!}
            playerName={board.opponent?.name!}
          /> : <></> }
        </div>
      </div>
    </div>
  );
}
