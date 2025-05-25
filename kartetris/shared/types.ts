export type GameBoard = (TetrisFigure | undefined)[][];

export interface EffectMessage {
    name: string,
    roomId: string,
}

export interface GameResultMessage {
    winnerName: string;
    looserName: string;
    winnerScore: number;
    looserScore: number;
    roomId: string;
}

export interface WSWaitingForPlayerMessage {
    message: string;
}

/* Game Update */
export interface WSGameUpdateMessage {
    roomId: string;
    update: string;
    board: GameBoard;
    currentFigure?: CurrentTetrisFigure | undefined;
    step?: number;
    score?: number;
    won?: boolean;
    character: string;
    playerName: string;
}

export interface WsGameUpdateMessageSerialized {
    roomId: string;
    update: string;
    board: (object | undefined)[][];
    currentFigure?: object | undefined;
    step?: number;
    score?: number;
    won?: boolean;
    character: string;
    playerName: string;
}
/* Game Update End */

/* Game Result */
export interface WSGameResultMessage {
    roomId: string;
    winnerName: string;
    looserName: string;
    winnerScore: number;
    looserScore: number;
}

export type WSResponseMessage = string;
export type WSCallingMessage = string;

export interface Position {
  x: number;
  y: number;
}


export interface CurrentTetrisFigure {
  startingPoint: Position;
  figure: TetrisFigure;
}

export interface RankingEntry {
  playerName: string;
  score: number;
}

interface TetrisFigureInterface {
  shape: number[][];
  color: string;
  position: Position;
  type?: string;
}

class TetrisFigure implements TetrisFigureInterface {
  shape: number[][];
  color: string;
  position: Position;
  type!: string;
  lastUpdated: Date = new Date();

  constructor(shape: number[][], color: string, x: number, y: number) {
    this.shape = shape;
    this.color = color;
    this.position = { x, y };
  }

  rotate = (): void => {
    const newShape = this.shape[0].map((_, index) =>
      this.shape.map((row) => row[index]).reverse()
    );
    
    const leftmostCell = this.position.x + this.leftCell(newShape);
    const rightmostCell = this.position.x + this.rightCell(newShape);

    if (leftmostCell < 0) {
      this.position.x += Math.abs(leftmostCell);
    } else if (rightmostCell > 9) {
      this.position.x -= rightmostCell - 9;
    }
    this.shape = newShape;
    this.lastUpdated = new Date();
  };

  moveDown = (): void => {
    this.position.y++;
    this.lastUpdated = new Date();
  };

  moveLeft = (): void => {
    const newX = this.position.x - 1;
    if (newX + this.leftCell() >= 0) {
      this.position.x--;
      this.lastUpdated = new Date();
    }
  };

  moveRight = (): void => {
    const newX = this.position.x + 1;
    if (newX + this.rightCell() <= 9) {
      this.position.x++;
      this.lastUpdated = new Date();
    }
  };

  topCell = (): number => {
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        if (this.shape[i][j] === 1) {
          return i;
        }
      }
    }

    return -1;
  };

  bottomCell = (): void => { };

  leftCell = (shape: number[][] = this.shape): number => {
    const width = shape[0].length;
    const height = shape.length;
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (shape[j][i] === 1) {
          return i;
        }
      }
    }
    return 0;
  };
  
  rightCell = (shape: number[][] = this.shape): number => {
    const width = shape[0].length;
    const height = shape.length;
    for (let i = width - 1; i >= 0; i--) {
      for (let j = 0; j < height; j++) {
        if (shape[j][i] === 1) {
          return i;
        }
      }
    }
    return 0;
  };
}

class TFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [0, 1, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      "#a21caf", // Neon purple
      x,
      y
    );
    this.type = "T";
  }
}

class LFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [0, 0, 0, 0],
        [0, 0, 1, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      "#f59e42", // Neon orange
      x,
      y
    );
    this.type = "L";
  }
}

class JFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [0, 0, 0, 0],
        [1, 0, 0, 0],
        [1, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      "#0A99DF", // Neon blue
      x,
      y
    );
    this.type = "J";
  }
}

class OFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      "#fde047", // Neon yellow
      x,
      y
    );
    this.type = "O";
  }
}

class SFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
      ],
      "#4ade80", // Neon green
      x,
      y
    );
    this.type = "S";
  }
}

class ZFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [0, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0],
      ],
      "#EA5EEF", // Neon pink
      x,
      y
    );
    this.type = "Z";
  }
}

class IFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      "#38bdf8", // Neon cyan
      x,
      y
    );
    this.type = "I";
  }
}

class SpecialFigure extends TetrisFigure {
  type: string;

  constructor(x: number, y: number) {
    super(
      [
        [1]
      ],
      `gradient`,
      x,
      y
    );
    this.type = "Special";
  }
}

export {
  IFigure,
  ZFigure,
  SFigure,
  LFigure,
  JFigure,
  OFigure,
  TFigure,
  SpecialFigure,
  TetrisFigure,
};