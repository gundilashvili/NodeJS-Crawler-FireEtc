const download = require('image-downloader');
const path = require('path');


module.exports =  ImageDownloader = async (_url, _name,) => {
  try{
    let succeeded = false;
    const filePath = (storeinfopath = path.join(
      __dirname,
      `../../output/Images/${_name}.png`
    ));

    const options = {
      url: _url,
      dest: filePath,      
    };
    
    await download.image(options)
      .then(({ filename }) => {
        succeeded = true 
      })
      .catch((err) => console.error(err));

    return succeeded;
  }catch(e){
    console.log(e);
  }
}
