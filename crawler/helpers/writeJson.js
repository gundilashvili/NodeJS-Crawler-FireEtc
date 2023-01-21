const fs = require('fs');
const path = require('path');

module.exports = writeJson = (filename, _data) => {
  const filePath = (storeinfopath = path.join(
    __dirname,
    `../../input/${filename}`
  ));
  fs.writeFile(filePath, JSON.stringify(_data), (err) => {
    if (err) {
      console.log('Error writing file:', err);
    } else {
      console.log(`Successfully created ${filename} file in 'input' folder.`);
    }
  });
};
