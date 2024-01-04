export type Layer = 'map' | 'item' | 'mob';
export type Mode = 'play' | 'text' | 'item';

export interface Grid {
        name: string,
	width: number, 
	height: number,
        startX: number,
        startY: number,
        map: Map<Layer, Array<string>>,
        neighbors: Array<string>,
	palette: Map<string, number>,
};

export interface State {
	itemIndex: number,
	layer: Layer,
	mode: Mode,
	question: string,
	answer: string,
	answered: (a: string) => void,
	currentX: number,
	currentY: number,
};
