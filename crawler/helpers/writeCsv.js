const ObjectsToCsv = require('objects-to-csv');
const path = require('path');

module.exports = WriteCsv = async (filename, _data) => {
  try {
    const filePath = (storeinfopath = path.join(
      __dirname,
      `../../output/${filename}`
    ));

    const csv = new ObjectsToCsv(_data);
    await csv.toDisk(filePath);
    console.log(`Successfully created ${filename} file in 'output' folder.`);
  } catch (e) {
    console.log(e);
  }
};
