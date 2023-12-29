import * as fs from 'fs';
import { Grid } from './types';

export const load = (name: string) => {
	try {
		return JSON.parse(fs.readFileSync(`map/${name}`, { encoding: 'utf8', flag: 'r' }));
	} catch (error) {
		console.log(error);
		return null;		
	}
};

export const save = (mapData: Grid) => {
	fs.writeFileSync(`map/${mapData.name}`, JSON.stringify(mapData, null, 2));
};

export const fileExists = (name: string) => {
	return fs.existsSync(`map/${name}`);
}
