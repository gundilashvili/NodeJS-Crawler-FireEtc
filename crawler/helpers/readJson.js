const fs = require('fs-extra');
const path = require('path');

module.exports = writeJson = async (filename) => {
 
  const filePath = (storeinfopath = path.join(
    __dirname,
    `../../input/${filename}`
  )); 

 
  const data = await fs.readJson(filePath )
  return data['Products'];
};
