const fs = require('fs');
const os = require('os');
// const FB_MEDIA  = require("./../media_data_abbfb.js");
// const SMART_MEDIA  = require("./../media_data_smart.js");
const MOB_MEDIA  = require("./../media_data_mobility.js");
// first_simple_test(FB_MEDIA);
// first_simple_test(SMART_MEDIA);
first_simple_test(MOB_MEDIA);
// test_is_good_elems(FB_MEDIA, "fb");
// test_is_good_elems(SMART_MEDIA, "smart");
test_is_good_elems(MOB_MEDIA, "mobility");

function first_simple_test(media_data){
    const is_array = Array.isArray(media_data);
    const childs_lengths = [];
    let is_good_elems = true;
    media_data.forEach(el=>{
        if(!Array.isArray(el)){
            console.error("element is not Array:", el);
            is_good_elems = false;
        }else{
            const el_len = el.length;
            if(!childs_lengths.includes(el_len)){
                childs_lengths.push(el_len);
            }
        }
    });
    if(childs_lengths.length > 1){
        console.log("BAD childs_lengths:",childs_lengths);
    }
    if(is_array && is_good_elems && childs_lengths.length==1){
        const MEDIA_SIZE = media_data.length;
        console.log("first simple test OK!, media size = ", MEDIA_SIZE);
    }else{
        console.log("first simple test FAILED !!!");
    }
}
function test_is_good_elems(media_data, proj_name){
    const MTYPE=0, MHEADER=2, MLINK1=5, MLINK2=6, MID=7;
    const PROPS_INDEXES = [MTYPE, MHEADER, MLINK1, MLINK2, MID];
    //const MTYPES = new Map(), MHEADERS = new Map(), MLINKS1 = new Map(), MLINKS2 = new Map(), MIDS = new Map();
    const MTYPES = {}, MHEADERS = {}, MLINKS1 = {}, MLINKS2 = {}, MIDS = {};
    const PROPS_DTOS = [MTYPES, MHEADERS, MLINKS1, MLINKS2, MIDS];
    const PROPS_NAMES = ["types", "headers", "links1", "links2", "ids"];
    //@------------------------------------------
    media_data.forEach(elem=>{
        for(let i=0; i<PROPS_DTOS.length; i++){
            accum_prop_dto(elem, PROPS_DTOS[i], PROPS_INDEXES[i]);    
        }
    });
    let media_report = "";
    for(let i=0; i<PROPS_DTOS.length; i++){
        media_report += display_prop_collection(PROPS_DTOS[i], PROPS_NAMES[i]);
        //console.log(i, "dto=",PROPS_DTOS[i]);
    }
    fs.writeFileSync("./"+proj_name+"media_inspected.txt", media_report);
    //@------------------------------------------
    function accum_prop_dto(elem, accum_dto, prop_numb){
        const accum_arr = Object.keys(accum_dto);
        const prop = elem[prop_numb];
        if(accum_arr.includes(prop)){
            accum_dto[prop] = accum_dto[prop] + 1;
        }else{
            accum_dto[prop] = 1;
        }
    }
    function accum_prop_map(elem, accum_map, prop_numb){
        //const accum_arr = Object.keys(accum_dto);
        const prop = elem[prop_numb];
        if(accum_map.has(prop)){
            accum_map.set(prop, accum_map.get(prop) + 1);
        }else{
            accum_map.set(prop, 1);
        }
    }
    function display_prop_collection(accum_dto, name){
        let str_res = "";
        str_res += "----------------------------------------------" + os.EOL;
        const keys_arr = Object.keys(accum_dto);
        str_res += name + " length= " + keys_arr.length + os.EOL;
        const repeated = {};
        let COUNTER = 0;
        for(let i=0; i<keys_arr.length; i++){
            const key_name = keys_arr[i];
            if(accum_dto[key_name] > 1){
                repeated[key_name] = accum_dto[key_name];
            }
            COUNTER += accum_dto[key_name];
        }
        str_res += name + " ALL elems count= " + COUNTER + os.EOL;
        str_res += name + " repeated elems= " + JSON.stringify(repeated, null, 2);
        return str_res;
    }
}