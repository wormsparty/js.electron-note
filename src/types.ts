export interface Grid {
	width: number, 
	height: number,
        startX: number,
        startY: number,
        map: Array<string>,
        color: Array<number>,
        neighbors: Array<string>,
        name: string,
};

export interface State {
	currentColor: number,
	itemIndex: number,
	mode: 'item' | 'text' | 'play',
	layer: 'map' | 'item' | 'mob',
	question: string,
	answer: string,
	answered: (a: string) => void,
	currentX: number,
	currentY: number,
};
