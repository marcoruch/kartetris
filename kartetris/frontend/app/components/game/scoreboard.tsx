import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/state/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const Scoreboard: React.FC = () => {
  const { lines, score, opponentScore } = useSelector(
    (state: RootState) => state.scoreboard
  );

  return (
    <Card className="w-2xl border-4 border-sky-400 shadow-[0_0_8px_#38bdf8]">
      <CardHeader>
        <CardTitle className="text-cyan-300">
          Scoreboard
        </CardTitle>
        <CardDescription className="text-sky-300">
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col justify-end">
        <div className="text-lg">
          <strong>Lines:</strong> {lines}
        </div>
        <div className="text-lg">
          <strong>Score:</strong> {score}
        </div>
        <div className="text-sm text-gray-400">
          <strong>Opponent's Score:</strong> {opponentScore}
        </div>
      </CardContent>
    </Card>
  );
};

export default Scoreboard;