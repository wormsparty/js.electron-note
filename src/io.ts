import * as fs from 'fs';
import { Grid } from './types';

export const loadGlobal = () => {
	try {
		const global = JSON.parse(fs.readFileSync(`map/global.json`, { encoding: 'utf8', flag: 'r' }));
		return new Map(Object.entries(global));
	} catch (error) {
		console.log(error);
		return null;
	}
};

export const loadMap = (name: string) => {
	try {
		const grid = JSON.parse(fs.readFileSync(`map/${name}`, { encoding: 'utf8', flag: 'r' }));
		
		grid.palette = new Map(Object.entries(grid.palette));
		grid.map = new Map(Object.entries(grid.map));

		return grid;
	} catch (error) {
		console.log(error);
		return null;		
	}
};

export const saveGlobal = (global: Map<string, [number, number]>) => {
	const data = Object.fromEntries(global);

	if (!fs.existsSync('map')) {
		fs.mkdirSync('map');
	}

	fs.writeFileSync(`map/global.json`, JSON.stringify(data, null, 2));
};

export const saveMap = (mapData: Grid) => {
	const data: any = Object.assign({}, mapData);

	// Need to convert Map to Object for serialisation
	data['palette'] = Object.fromEntries(mapData.palette);
	data['map'] = Object.fromEntries(mapData.map);
	
	if (!fs.existsSync('map')) {
		fs.mkdirSync('map');
	}

	fs.writeFileSync(`map/${mapData.name}`, JSON.stringify(data, null, 2));
};

export const fileExists = (name: string) => {
	return fs.existsSync(`map/${name}`);
}
