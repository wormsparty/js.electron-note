import * as fs from 'fs';
import { Grid } from './types';

export const load = (name: string) => {
	try {
		const grid = JSON.parse(fs.readFileSync(`map/${name}`, { encoding: 'utf8', flag: 'r' }));
		if (grid.palette) {
			// Object needs to be converted to Map
			grid.palette = new Map(Object.entries(grid.palette));
		}

		return grid;
	} catch (error) {
		console.log(error);
		return null;		
	}
};

export const save = (mapData: Grid) => {
	const data: any = Object.assign({}, mapData);
	data['palette'] = Object.fromEntries(mapData.palette);
	console.log(data);

	fs.writeFileSync(`map/${mapData.name}`, JSON.stringify(data, null, 2));
};

export const fileExists = (name: string) => {
	return fs.existsSync(`map/${name}`);
}
