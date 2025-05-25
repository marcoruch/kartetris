import { useState } from "react";
import CharacterCard from "./CharacterCard";
import { Button } from "../ui/button";
import { setCharacter } from "../../state/slices/playerSlice";
import { useDispatch, useSelector } from "react-redux";

export default function CharacterSelector({ disabled }: { disabled?: boolean }) {
  const selectedCharacter = useSelector(
    (state: any) => state.player.character
  );
  const dispatch = useDispatch();

  const isSelected = (name: string) => name === selectedCharacter;

  const characters = ["bonedry", "bowser", "luigi", "mario", "toad", "yoshi"];
  const characterCards = () => {
    return characters.map((c) => (
      <CharacterCard
      disabled={disabled}
        key={c}
        selected={isSelected(c)}
        name={c}
      />
    ));
  };

  const selectRandom = () => {
    let timeoutLength = 50;
    const timeouts: Promise<void>[] = [];
    dispatch(setCharacter(undefined));

    while (timeoutLength < 4000) {
      const promise: Promise<void> = new Promise((resolve) => {
        setTimeout(() => {
          const random: number = Math.floor(Math.random() * characters.length);
          dispatch(setCharacter(characters[random]));
          resolve();
        }, timeoutLength);
      });

      timeouts.push(promise);
      timeoutLength *= 1.1;
    }

    Promise.allSettled(timeouts).then(() => {});
  };

  return (
    <div className="my-8">
      <div className="flex justify-between place-items-baseline">
        <h3 className="text mb-8 dark:text-neutral-100 text-sky-300">
          Select your character
          <span className="capitalize font-bold">
            {selectedCharacter ? ` (${selectedCharacter})` : ""}
          </span>
        </h3>
        <Button
          disabled={disabled}
          className="w-full cursor-pointer rounded-md bg-sky-600 px-3 py-2 
                  text-sm font-semibold text-white hover:bg-sky-700 focus:outline-none 
                  disabled:bg-indigo-300 sm:w-auto dark:disabled:bg-sky-800 
                  dark:disabled:text-sky-400"
          variant="outline"
          size="lg"
          onClick={() => selectRandom()}
        >
          Random
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-4">{characterCards()}</div>
    </div>
  );
}
