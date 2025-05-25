import React, { useState, useEffect } from "react";

interface SlotMachineProps {
  effects: string[];
  onEffectSelected: (effect: string) => void;
  onSettled?: () => void;
  settleDelay?: number;
}

const SlotMachine: React.FC<SlotMachineProps> = ({
  effects,
  onEffectSelected,
  onSettled,
  settleDelay = 1200,
}) => {
  const [currentEffect, setCurrentEffect] = useState<string>(effects[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [settled, setSettled] = useState(false);
  const [blowoutText, setBlowoutText] = useState<string | null>(null);

  useEffect(() => {
    startSpin();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSpinning) {
      interval = setInterval(() => {
        setCurrentEffect((prev) => {
          const currentIndex = effects.indexOf(prev);
          const nextIndex = (currentIndex + 1) % effects.length;
          return effects[nextIndex];
        });
      }, 100);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isSpinning, effects]);

  const startSpin = () => {
    setIsSpinning(true);

    setTimeout(() => {
      setIsSpinning(false);
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];
      setCurrentEffect(randomEffect);
      setSettled(true);
      onEffectSelected(randomEffect);

      setBlowoutText("EFFECT SELECTED");

      setTimeout(() => {
        setSettled(false);
        setBlowoutText(null);
        if (onSettled) onSettled();
      }, settleDelay);
    }, 2000);
  };

  useEffect(() => {
    if (isSpinning) {
      setBlowoutText("SPINNING");
      setTimeout(() => setBlowoutText(null), 1000);
    }
  }, [isSpinning]);

  return (
    <div className="flex flex-col items-center space-y-4 min-h-[200px]">
      {blowoutText && (
        <div className="blowout-text">{blowoutText}</div>
      )}

      <div className="w-128 h-16 flex flex-row items-center justify-between text-white text-xl font-bold rounded-md shadow-md transition-all duration-300 rounded-lg border-4 border-pink-400 bg-[#18182f] shadow-[0_0_16px_#38bdf8]">
        <img src="/images/mario_transparent.png" alt="Excited Mario" className="w-16 h-16" />
        <span>{currentEffect}</span>
        <img src="/images/mario_transparent.png" alt="Excited Mario" className="w-16 h-16" />
      </div>
    </div>
  );
};

export default SlotMachine;
