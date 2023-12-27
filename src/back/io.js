const path = require('node:path');
const os = require('os');
const appDir = path.resolve(os.homedir());
const fs = require('fs');

exports.load = (name) => {
	try {
		return JSON.parse(fs.readFileSync(`data/${name}`, { encoding: 'utf8', flag: 'r' }));
	} catch (error) {
		console.log(error);
		return null;		
	}
};

exports.save = (mapData) => {
	fs.writeFileSync(`data/${mapData.name}`, JSON.stringify(mapData));
};
