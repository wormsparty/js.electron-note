import * as fs from 'fs';
import { Grid } from '../types';

exports.load = (name: string) => {
	try {
		return JSON.parse(fs.readFileSync(`data/${name}`, { encoding: 'utf8', flag: 'r' }));
	} catch (error) {
		console.log(error);
		return null;		
	}
};

exports.save = (mapData: Grid) => {
	fs.writeFileSync(`data/${mapData.name}`, JSON.stringify(mapData));
};
