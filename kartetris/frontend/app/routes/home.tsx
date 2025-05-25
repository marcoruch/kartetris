import type { Route } from "./+types/home";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import type { WSWaitingForPlayerMessage } from "../../../shared/types";
import { Button } from "../components/ui/button"
import { useState } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from 'react-redux'
import { setOpponentBoard } from "../state/slices/boardSlice";
import type { RootState } from '../state/store';
import { socketService } from "../state/services/socketService";
import { Input } from "../components/ui/input";
import CharacterSelector from "../components/menu/CharacterSelector";
import { useToast } from "../components/ui/hooks/use-toast";
import { setName, } from "../state/slices/playerSlice";
import { hasPickedNameAndCharacter } from '../state/store';
import HighScores from "../components/menu/Highscores";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Kartetris - A turn on Tetris" },
    { name: "Kartetris is a 1v1 live Tetris app with a twist, pick up the boxes to explore the specials!", content: "Welcome to Kartetris!" },
  ];
}

export default function Home() {
  const [, setWaitingMessage] = useState<string>("");
  const [waiting, setWaiting] = useState<boolean>(false);
  const [, setMatched] = useState<boolean>(false);
  const [, setRoomId] = useState<string>("");
  const [, setOpponent] = useState<string>("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();

  const socket = useSelector((state: RootState) => state.socket);
  const hasPicked = useSelector((state: RootState) => hasPickedNameAndCharacter(state));

  const joinGameHandler = (): void => {
    if (!hasPicked) {
      return;
    }

    socketService.connect();
    setWaiting(true);

    socketService.on("waiting", (data: WSWaitingForPlayerMessage) => {
      setWaitingMessage(data.message);
      toast({
        variant: "default",
        title: "Joined waiting room...",
        description: data.message,
      })
    });

    socketService.on("matched", (data: { roomId: string; opponent: string }) => {
      setWaiting(false);
      setMatched(true);
      setRoomId(data.roomId);
      setOpponent(data.opponent);
      setWaitingMessage("");
      dispatch(setOpponentBoard({ roomId: data.roomId, boardTetris: [], currentFigureTetris: undefined, step: 0 }));
      navigate('/game');
    });
  }

  return <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0a0a23] via-[#1e1e3f] to-[#2d1a4a]">
    <h1 className="text-5xl font-extrabold text-sky-400 tracking-widest mb-4">
      Welcome to <span className="text-pink-400 neon-glow">Kartetris</span>
    </h1>
    <h2 className="text-2xl font-semibold text-cyan-300 mb-2">
      The ultimate 1v1 online Tetris showdown
      <span className="text-yellow-300"> — with a Mario Kart twist!</span>
    </h2>
    <h3 className="text-lg font-normal text-sky-300 mb-16">
      Race your opponent, unleash wild power-ups, and discover game-changing specials as you stack your way to victory.
    </h3>
    <div className="flex flex-row gap-16 items-start justify-center">
      <img
        src="/images/gamebanner.png"
        width="405px"
        alt="Kartetris Logo"
        className="rounded-lg border-4 border-pink-400 bg-[#18182f] shadow-[0_0_16px_#38bdf8]"
      />
      <Card className="w-2xl bg-[#18182f] border-4 border-sky-400 shadow-[0_0_16px_#38bdf8]">
        <CardHeader>
          <CardTitle className="text-cyan-300">
            {socket.status === 'disconnected'
              ? 'Join a new Kartetris Game'
              : 'Waiting for opponent...'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-end">
          <Input
            disabled={waiting}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                joinGameHandler();
              }
            }}
            onChange={(e) => {
              const name = e.target.value.trim();
              if (name.length > 0) {
                dispatch(setName(name));
              }
              else {
                dispatch(setName(undefined));
              }
            }}
            type="text"
            placeholder="Player name"
            className="bg-[#23234a] text-sky-200 border-sky-400 focus:ring-pink-400"
          />
          <CharacterSelector disabled={waiting} />
          <br />
          {socket.status === 'disconnected' && (
            <Button
              disabled={waiting || !hasPicked}
              onClick={joinGameHandler}
              className="w-full cursor-pointer rounded-md bg-sky-500 px-3 py-2 text-lg font-bold text-white hover:bg-pink-400 focus:outline-none disabled:bg-sky-800"
              variant="outline"
              size="lg"
            >
              Join Game
            </Button>
          )}
        </CardContent>
      </Card>
      <Card className="w-full max-w-lg bg-[#18182f] border-4 border-pink-400 shadow-[0_0_16px_#f472b6]">
        <CardHeader>
          <CardTitle className="text-pink-400">Top 10 Players</CardTitle>
          <CardDescription className="text-sky-300">
            Rankings of top 10 players
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-start space-y-4 mb-4">
          <HighScores />
        </CardContent>
      </Card>
    </div>
  </div>;
}

