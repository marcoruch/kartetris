import type GameController from "@/app/controller/game";

export interface Effect {
    name: string;
    type: "buff" | "debuff";
    duration?: number;
    apply: (game: GameController) => void;
}

export class HalveGameSpeedEffect implements Effect {
    name = "HalveGameSpeed";
    type: "buff" = "buff";
    duration = 5000;
    apply(game: GameController) {
        game.increaseSpeed(1000);
        setTimeout(() => {
            game.normalGameSpeed();
        }, this.duration);
    }
}

export class DoubleGameSpeedEffect implements Effect {
    name = "DoubleGameSpeed";
    type: "debuff" = "debuff";
    duration = 5000;
    apply(game: GameController) {
        game.increaseSpeed(100);
        setTimeout(() => {
            game.normalGameSpeed();
        }, this.duration);
    }
}

export class ClearLineEffect implements Effect {
    name = "ClearLine";
    type: "buff" = "buff";
    apply(game: GameController) {
        for (let i = game.board.length - 1; i >= 0; i--) {
            if (game.board[i].some((cell) => cell !== undefined)) {
                game.board[i] = new Array(game.gamesize_w).fill(undefined);
                game.board = game.pushNonZeroRowsToBottom(game.board);
                game.handleLineCompletion(1);
                game.drawAll();
                break;
            }
        }
    }
}

export class AddLineEffect implements Effect {
    name = "AddLine";
    type: "debuff" = "debuff";
    apply(game: GameController) {
        const newLine = new Array(game.gamesize_w).fill(undefined);
        game.board.push(newLine);
        game.board.shift();    
    }
}

export const effects: Effect[] = [
    new HalveGameSpeedEffect(),
    new DoubleGameSpeedEffect(),
    new ClearLineEffect(),
    new HalveGameSpeedEffect()
]