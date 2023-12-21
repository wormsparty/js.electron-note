const path = require('node:path');
const os = require('os');
const appDir = path.resolve(os.homedir());
const fs = require('fs');

exports.getFiles = () => {
    console.log('Listing files in ' + appDir);
    const files = fs.readdirSync(appDir);
    console.log(files);
    return files;
};

