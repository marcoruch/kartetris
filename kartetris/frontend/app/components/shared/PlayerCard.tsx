import CharacterCard from "../menu/CharacterCard";

export default function PlayerCard({
  playerName,
  character,
}: {
  playerName: string;
  character: string;
}) {
  return (

    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4 neon-glow">{playerName}</h2>
      <CharacterCard name={character!} selected={false} disabled={true} />
    </div>
  );
}
