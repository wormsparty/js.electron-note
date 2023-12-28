import * as fs from 'fs';
import { Grid } from './types';

export const load = (name: string) => {
	try {
		return JSON.parse(fs.readFileSync(`data/${name}`, { encoding: 'utf8', flag: 'r' }));
	} catch (error) {
		console.log(error);
		return null;		
	}
};

export const save = (mapData: Grid) => {
	fs.writeFileSync(`data/${mapData.name}`, JSON.stringify(mapData));
};
