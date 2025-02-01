const fs = require('fs');
const path = require('path');

exports.clearImage = (filename)=>{
    const IMGpath = path.join("..","images",filename);
    fs.unlink(IMGpath)
}