import { TetrisFigure } from "../../shared/types";
import type { CurrentTetrisFigure, Position } from "../../shared/types";

export class WSSerializer {

    static serializeFigure = (figure: TetrisFigure | undefined): object | undefined => {
        if (figure) {
            return {
                type: figure.type,
                position: figure.position,
                shape: figure.shape,
                color: figure.color
            };
        }

        return undefined;
    }

    static deserializeFigure = (data: object): TetrisFigure => {
        const figure = data as TetrisFigure;
        return new TetrisFigure(figure.shape, figure.color, figure.position.x, figure.position.y);
    }

    static serializeCurrentFigure = (currentTetrisFigure: CurrentTetrisFigure | undefined): object | undefined => {
        if (currentTetrisFigure) {
            return {
                figure: {
                    type: currentTetrisFigure.figure.type,
                    position: currentTetrisFigure.figure.position,
                    shape: currentTetrisFigure.figure.shape,
                    color: currentTetrisFigure.figure.color,
                },
                startingPoint: currentTetrisFigure.startingPoint
            };
        }

        return undefined;
    }

    static deserializeCurrentFigure = (data: object | undefined): CurrentTetrisFigure => {
        const currentFigure = data as CurrentTetrisFigure;
        return {
            figure: new TetrisFigure(currentFigure.figure.shape, currentFigure.figure.color, currentFigure.figure.position.x, currentFigure.figure.position.y),
            startingPoint: currentFigure.startingPoint as Position,
        };
    }
}