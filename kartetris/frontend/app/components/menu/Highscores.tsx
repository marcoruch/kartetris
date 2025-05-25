import React, { useEffect, useState } from "react";
import type { RankingEntry } from "../../../../shared/types";

const HighScores: React.FC = () => {
    const [highScores, setHighScores] = useState<(RankingEntry & { rank: number })[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHighScores = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/ranking`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const data: RankingEntry[] = await response.json();
                setHighScores(data.map((player, index) => ({
                    ...player,
                    rank: index + 1,
                })));
            } catch (err) {
                setError('Failed to fetch high scores');
            } finally {
                setLoading(false);
            }
        };

        fetchHighScores();

        const interval = setInterval(() => {
            setError(null);
            fetchHighScores();
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    const rankMedal = (rank: number): string => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return '';
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    if (highScores.length === 0) {
        return <p>No high scores available.</p>;
    }

    return (

        <div className="w-full max-w-md mx-auto space-y-3">
            {highScores.map((player, idx) => (
                <div
                    key={player.playerName}
                    className={`
            flex items-center justify-between px-4 py-2
            rounded-lg bg-gray-800/80 shadow-lg
            border border-cyan-700
            ${player.rank === 1 ? "ring-2 ring-yellow-400" : ""}
            ${player.rank === 2 ? "ring-2 ring-gray-400" : ""}
            ${player.rank === 3 ? "ring-2 ring-yellow-600" : ""}
          `}
                >
                    <div className="flex items-center space-x-2 w-1/2">
                        <span className="text-2xl w-8">{rankMedal(player.rank)}</span>
                        <span className="text-lg font-bold text-cyan-300 drop-shadow">
                            {player.playerName}
                        </span>
                    </div>
                    <div className="w-1/4 text-right">
                        <span className="text-xl font-semibold text-yellow-300 drop-shadow">
                            {player.score}
                        </span>
                    </div>
                    <div className="w-1/12 text-right">
                        <span className="text-sm font-medium text-sky-300 bg-gray-900/60 px-2 py-1 rounded-full">
                            #{player.rank}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HighScores;
