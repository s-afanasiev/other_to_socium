const fs = require('fs');
const os = require('os');

const FILE= fs.readFileSync('MEDIA_REPORT_good_and_bad.txt', 'utf8');
const ARR = FILE.split(os.EOL);
const UNIQ = {};
let RES_STR = "";
ARR.forEach(line=>{
    if(UNIQ[line]){
        UNIQ[line]++;
    }else{
        UNIQ[line] = 1;
        if(!line.startsWith("GOOD")){
            if(!line.startsWith("Excess")){
                if(line.indexOf("https://abbfb.com/media/") == -1){
                    RES_STR += line + os.EOL
                }
            }
        }
    }
})
//console.log("UNIQ=", UNIQ)
fs.writeFileSync("Uniq_lines.txt", RES_STR)