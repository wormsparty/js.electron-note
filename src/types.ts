export interface Grid {
        name: string,
	width: number, 
	height: number,
        startX: number,
        startY: number,
        map: Array<string>,
        neighbors: Array<string>,
	palette: Map<string, number>,
};

export interface State {
	itemIndex: number,
	mode: 'item' | 'text' | 'play',
	layer: 'map' | 'item' | 'mob',
	question: string,
	answer: string,
	answered: (a: string) => void,
	currentX: number,
	currentY: number,
};
