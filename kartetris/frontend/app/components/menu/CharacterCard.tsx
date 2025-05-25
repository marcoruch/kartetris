import { setCharacter } from "@/app/state/slices/playerSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";

export default function CharacterCard({
  disabled,
  name,
  selected,
}: {
  disabled?: boolean;
  name: string;
  selected: boolean;
}) {
  const [animate, setAnimate] = useState(false);
  const dispatch = useDispatch();
  const animationStyle = {
    animation: animate ? "grow-shrink 0.6s ease-in-out" : "none",
  };

  const fullFilePath = (name: string) => {
    return `/gameassets/characters/${name}.png`;
  };

  return (
    <div
      onClick={disabled ? () => { } : () => {
        setAnimate(true);
        dispatch(setCharacter(name));
      }}
      onAnimationEnd={() => setAnimate(false)}
      style={animationStyle}
    >
      <img
        className={`w-32 p-1 rounded hover:shadow ${selected ? "dark:bg-sky-100 bg-sky-300" : "hover:bg-sky-50"}`}
        src={fullFilePath(name)}
      />
    </div>
  );
}
