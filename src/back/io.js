const path = require('node:path');
const os = require('os');
const appDir = path.resolve(os.homedir());
const fs = require('fs');

exports.load = (name) => {
	try {
		return JSON.parse(fs.readFileSync(`data/${name}`, { encoding: 'utf8', flag: 'r' }));
	} catch (error) {
		if (name !== 'default.json') {
			console.log(error);
			return null;
		}
		
		const mapData = {
			width: 64, 
			height: 24,
			currentX: 32,
			currentY: 12,
			map: [],
			color: [],
			neighbor: [null, null, null, null],
		}

		for (let i = 0; i < mapData.width * mapData.height; i++) {
			// Put gray dots by default
			mapData.map[i] = '.';
			mapData.color[i] = 1;
		}
		
		return mapData;
	}
};

exports.save = (mapData) => {
	fs.writeFileSync(`data/${mapData.name}`, JSON.stringify(mapData));
};
