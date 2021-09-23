const os = require('os');
const fs = require('fs');
const MY_FILE = "../Не хватает 200 ссылок.txt";
const SERG_FILE = require("../serg_media_compar.js");

const my_cats = prepare_my_array(MY_FILE);
const serg_cats = prepare_serg_array(SERG_FILE);
const intersec = intersection(my_cats, serg_cats)
// fs.writeFileSync("./My_Serg_Comparing/my.txt", JSON.stringify(my_cats, null, 2))
// fs.writeFileSync("./My_Serg_Comparing/serg.txt", JSON.stringify(serg_cats, null, 2))
//fs.writeFileSync("./My_Serg_Comparing/intersec.txt", JSON.stringify(intersec, null, 2))


function prepare_my_array(MY_FILE){
    const arr = fs.readFileSync(MY_FILE, "utf8").split(os.EOL);
    const CHECK_CAT_IDS = true;
    if(CHECK_CAT_IDS){
        const cats_arr = arr.map(line=>{
            const begin_index = line.indexOf('at category:') + 12;
            return line.slice(begin_index);
        });
        return cats_arr.sort()
    }else{
        const links_arr = arr.map(line=>{
            const begin_index = line.indexOf('http');
            line = line.slice(begin_index);
            const end_index = line.indexOf(' in dst project')
            line = line.slice(0, end_index);
            return line;
        })
    }
    //@ 2. Sort
}
function prepare_serg_array(SERG_FILE){
    const cats_arr = [];
    Object.keys(SERG_FILE).forEach(key=>{
        cats_arr.push(key)
    })
    return cats_arr.sort()
}
function intersection(my_cats, serg_cats){
    return my_cats.filter(x=>serg_cats.includes(x));
}