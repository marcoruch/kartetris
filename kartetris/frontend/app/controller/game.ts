import { IFigure, JFigure, LFigure, OFigure, SFigure, SpecialFigure, TetrisFigure, TFigure, ZFigure, type CurrentTetrisFigure, type GameBoard } from "../../../shared/types";

class GameController {
  gamesize_w: number;
  gamesize_h: number;
  size: number;
  width: number;
  height: number;
  currentPlayingFigure: CurrentTetrisFigure | undefined;
  board: GameBoard;
  currentFigure: TetrisFigure;
  nextFigure: TetrisFigure;
  interval: NodeJS.Timeout | null;
  status: "running" | "won" | "lost" = "running";
  drawBoard: (gameBoard: GameBoard, currentFigure: CurrentTetrisFigure | undefined, step: number) => void;
  drawCurrentDiv: (gameBoard: GameBoard, f: CurrentTetrisFigure | undefined) => void;
  handleLineCompletion: (linesCompleted: number) => void;
  handleSpecialBlockCollission: () => void;
  step: number;
  roomId: string = '';
  currentPressed: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | null = null;
  specialBlock: { x: number; y: number } | null = null;

  constructor(
    size: number,
    width: number,
    height: number,
    roomId: string,
    gamesize_w: number,
    gamesize_h: number,
    drawBoard: (gameBoard: GameBoard, currentFigure: CurrentTetrisFigure | undefined, step: number) => void,
    drawCurrentDiv: (gameBoard: GameBoard, f: CurrentTetrisFigure | undefined) => void,
    handleLineCompletion: (linesCompleted: number) => void,
    handleSpecialBlockCollision: () => void
  ) {
    this.gamesize_w = gamesize_w;
    this.gamesize_h = gamesize_h;
    this.size = size;
    this.width = width;
    this.height = height;
    this.board = this.initBoard();
    this.currentPlayingFigure = undefined;
    this.currentFigure = this.getRandomFigure();
    this.nextFigure = this.getRandomFigure();
    this.interval = setInterval(() => this.update(), 500);
    this.drawBoard = drawBoard;
    this.drawCurrentDiv = drawCurrentDiv;
    this.handleLineCompletion = handleLineCompletion;
    this.handleSpecialBlockCollission = handleSpecialBlockCollision;
    this.drawNext();
    this.step = 0;
    this.roomId = roomId;
  }

  initBoard = (): GameBoard => {
    const board: GameBoard = [];
    for (let i = 0; i < this.gamesize_h; i++) {
      board.push([]);
      for (let j = 0; j < this.gamesize_w; j++) {
        board[i][j] = undefined;
      }
    }
    return board;
  };

  figureClasses = () => [
    IFigure,
    ZFigure,
    SFigure,
    LFigure,
    JFigure,
    OFigure,
    TFigure,
  ];

  getRandomFigure(): TetrisFigure {
    const FigureClass =
      this.figureClasses()[
      Math.floor(Math.random() * this.figureClasses().length)
      ];

    const f = new FigureClass(Math.floor(Math.random() * this.gamesize_w), 0);
    f.position.y = -f.topCell();

    if (f.position.x + f.shape.length > this.gamesize_w) {
      return this.getRandomFigure();
    }

    return f;
  }

  isFinished = () => {
    return ["won", "lost"].includes(this.status);
  }

  lost = () => {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = null;
    this.status = "lost";
  };

  increaseSpeed(interval: number) {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => this.update(), interval);
  }

  normalGameSpeed() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => this.update(), 500);
  }

  checkCollision(piece: TetrisFigure) {
    return piece.shape.some((row: number[], y: number) => {
      return row.some((cell: number, x: number) => {
        if (cell) {
          let newX = piece.position.x + x;
          let newY = piece.position.y + y;
          if (newY >= this.height / this.size || (!(this.board[newY][newX] instanceof SpecialFigure) && !!this.board[newY][newX])) {
            return true;
          }
        }
        return false;
      });
    });
  }

  checkHorizontalCollision = (direction: 'right' | 'left') => {
    return this.currentFigure.shape.some((row: number[], y: number) => {
      return row.some((cell: number, x: number) => {
        if (cell) {
          let newX = this.currentFigure.position.x + x + (direction === 'right' ? 1 : -1);
          let newY = this.currentFigure.position.y + y;
          if (!!this.board[newY][newX] && !(this.board[newY][newX] instanceof SpecialFigure)) {
            return true;
          }
        }
        return false;
      });
    })
  }

  checkTopOverflow = () => {
    if (this.currentFigure.topCell() + this.currentFigure.position.y <= 0) {
      return true;
    }
    return false;
  };

  update(withoutMove = false) {
    if (!withoutMove) {
      this.currentFigure.moveDown();
    }

    if (this.checkCollision(this.currentFigure)) {
      this.currentFigure.position.y--;
      if (this.checkTopOverflow()) {
        this.lost();
      }

      this.renderCurrentOnBoard();
      this.removeSpecialBlock();
      this.checkLine();

      this.currentFigure = this.nextFigure;
      this.nextFigure = this.getRandomFigure();

      if (Math.random() < 0.5)
        this.spawnSpecialBlock();

      this.drawAll();
      this.drawNext();
    } else {
      this.drawCurrent();

      if (this.checkSpecialBlockCollision()) {
        this.removeSpecialBlock();
        this.handleSpecialBlockCollission();
      }
    }
  }

  checkLine = () => {
    for (let i = 0; i < this.gamesize_h; i++) {
      let hasElement = true;
      for (let j = 0; j < this.gamesize_w && hasElement; j++) {
        hasElement = !!this.board[i][j];
      }

      if (hasElement) {
        for (let j = 0; j < this.gamesize_w && hasElement; j++) {
          this.board[i][j] = undefined;
        }
        this.board = this.pushNonZeroRowsToBottom(this.board);
        this.handleLineCompletion(1);
      }
    }
  };

  drawCurrent() {
    this.renderCurrentBoard();
    this.drawCurrentDiv(this.board, this.currentPlayingFigure);
  }

  drawAll = () => {
    this.clearAll();
    this.drawCurrent();
    this.drawBoard(this.board, this.currentPlayingFigure, this.step);

    if (this.specialBlock) {
      const { x, y } = this.specialBlock;
      this.drawSpecialBlock(x, y);
    }

    this.step++;
  };

  drawSpecialBlock(x: number, y: number) {
    this.board[y][x] = new SpecialFigure(x, y);
  }

  renderCurrentOnBoard = () => {
    const px = this.currentFigure.position.x;
    const py = this.currentFigure.position.y;
    this.currentFigure.shape.forEach((row, y) => {
      row.forEach((col, x) => {
        if (col) {
          this.board[py + y][px + x] = this.currentFigure;
        }
      });
    });
  };

  renderCurrentBoard = () => {
    this.currentPlayingFigure = {
      startingPoint: {
        x: this.currentFigure.position.x,
        y: this.currentFigure.position.y,
      },
      figure: this.currentFigure,
    }
  };

  drawNext = () => { };

  clearAll = () => { };

  pushNonZeroRowsToBottom = (matrix: GameBoard) => {
    const result = [];
    let zeroRowsCount = 0;
    for (let row of matrix) {
      if (row.every((value) => value === undefined)) {
        zeroRowsCount++;
      } else {
        result.push(row);
      }
    }
    for (let i = 0; i < zeroRowsCount; i++) {
      result.unshift(new Array(matrix[0].length).fill(undefined));
    }
    return result;
  };

  spawnSpecialBlock() {
    const availablePositions: { x: number; y: number }[] = [];
    for (let y = this.board.length - 1; y >= 0; y--) {
      for (let x = 0; x < this.board[0].length; x++) {
        if (this.board[y][x] === undefined && y < this.board.length - 1 && this.board[y + 1][x] !== undefined) {
          let isReachable = true;
          for (let aboveY = 0; aboveY < y; aboveY++) {
            if (this.board[aboveY][x] !== undefined) {
              isReachable = false;
              break;
            }
          }

          if (isReachable) {
            availablePositions.push({ x, y });
          }
        }
      }
    }

    if (availablePositions.length > 0) {
      this.specialBlock = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    }
  }

  removeSpecialBlock() {
    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[0].length; x++) {
        if (this.board[y][x] instanceof SpecialFigure) {
          this.board[y][x] = undefined;
        }
      }
    }
    this.specialBlock = null;
  }

  checkSpecialBlockCollision() {
    if (!this.specialBlock || !this.currentFigure) {
      return false;
    }

    const { x: blockX, y: blockY } = this.specialBlock;

    for (let y = 0; y < this.currentFigure.shape.length; y++) {
      for (let x = 0; x < this.currentFigure.shape[y].length; x++) {
        if (
          this.currentFigure.shape[y][x] !== 0 &&
          this.currentFigure.position.x + x === blockX &&
          this.currentFigure.position.y + y === blockY
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
export default GameController;
