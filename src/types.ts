export interface Grid {
	width: number, 
	height: number,
        currentX: number,
        currentY: number,
        map: Array<string>,
        color: Array<number>,
        neighbors: Array<string>,
        name: string,
};
