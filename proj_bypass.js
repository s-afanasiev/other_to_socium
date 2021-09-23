//@ Данный модуль сравнивает два проекта на предмет расхождения текстового контента ( БЕЗ МЕДИА) и сохраняет новый целевой файл project_data с изменениями.
const fs = require('fs');
const os = require('os');
const FB_PATH = "../project_data_abbfb.js";
const DC_PATH = "../project_data_datacenter.js";
const MOB_PATH = "../project_data_mobility.js";
const SMART_PATH = "../project_data_smart.js";
//const SMART_PATH = "../new_smart_with_fb.js";
FB_MEDIA_PATH = "../media_data_abbfb.js";
MOB_MEDIA_PATH = "../media_data_mobility.js";
DC_MEDIA_PATH = "../media_data_datacenter.js";
SMART_MEDIA_PATH = "../media_data_smart.js";
//--------------------------------------------------------------
const SRC_DATA  = require(FB_PATH).categories;
const SRC_MEDIA  = require(FB_MEDIA_PATH);
const SMART_DATA  = require(SMART_PATH).categories;
const SMART_MEDIA  = require(SMART_MEDIA_PATH);
//------------------------------------------------------------
const SRC_MEDIA_LINKS = SRC_MEDIA.filter(arr=>arr[0]=="link");
console.log("SRC_MEDIA length=", SRC_MEDIA.length);
console.log("SRC_MEDIA_LINKS length=", SRC_MEDIA_LINKS.length);
const SIGNIFICANT_FIELDS = [];
console.log(Object.keys(SRC_DATA).length);
console.log(Object.keys(SMART_DATA).length);
const FB_ARR = Object.keys(SRC_DATA);

main();
//rejson_project_data(SMART_DATA)

function rejson_project_data(SMART_DATA){
    var wrap1 = {}
    wrap1.current_location = "home";
    wrap1.categories = SMART_DATA;
    fs.writeFileSync("rejsoned_smart_project_data.js", JSON.stringify(wrap1, null, 2));
}
function main(){
    const cat_types_counter = {"lvl_0": 0, "lvl_1_transit": 0, "modal": 0, "modal_media":0};
    let ne_popal_counter = 0;
    let all_matches_counter = 0;
    let report = "";
    const SRC_ALL_IDS = SRC_MEDIA.map(arr=>arr[7]);
    const SMART_ALL_LINKS = SMART_MEDIA.map(arr=>arr[5]);
    //console.log("SRC_ALL_IDS=",SRC_ALL_IDS);
    FB_ARR.forEach((cat_id)=>{
        //@ категорию home пропускаем
        if(cat_id != "home"){
            //@ если есть соответствующая категория в "умном обществе"
            //@ Всего совпадающих категорий с abbfb: 1902. Модальных категори, содержащих ссылки медиа: 328.
            if(SMART_DATA[cat_id]){
                all_matches_counter++
                const cat_type = define_cat_type(SRC_DATA[cat_id]);
                if(cat_type){
                    cat_types_counter[cat_type]++;
                    report += compare_cats(SRC_DATA[cat_id], SMART_DATA[cat_id], cat_type, SRC_ALL_IDS, SMART_ALL_LINKS);
                }else{
                    ne_popal_counter++
                    console.error("cat type recognizing Error at: ", cat_id);
                }
            }
        }
    });
    fs.writeFileSync("report.txt", report);
    //@----- rewrite SMART DATA
    var wrap1 = {}
    wrap1.current_location = "home";
    wrap1.categories = SMART_DATA;
    //fs.writeFileSync("new_smart_with_datacenter.js", JSON.stringify(wrap1, null, 2));
    //@----------------------
    console.log("cat_types_counter=", cat_types_counter);
    console.log("ne_popal_counter=", ne_popal_counter);
    console.log("all_matches_counter=", all_matches_counter);
}
//@--------------------------------------------------------------------
//@--------------------------------------------------------------------
//@--------------------------------------------------------------------
//@ param {Object} cat_dto_from - object-structure of some category which considered like standard sample
//@ param {Object} cat_dto_to - object-structure of some category which should be compared with cat_dto_from
//@ param {String} cat_type - one of values ["lvl_0", "lvl_1_transit", "modal", "modal_media"]
function compare_cats(cat_dto_from, cat_dto_to, cat_type, SRC_ALL_IDS, SMART_ALL_LINKS){
    const cat_types = ["lvl_0", "lvl_1_transit", "modal", "modal_media"];
    let report = "";
    //@--------------------------------------
    if(cat_type == cat_types[0]){
        report += compare_cats_type_0(cat_dto_from, cat_dto_to);
    }
    //@--------------------------------------
    else if(cat_type == cat_types[1]){
        report += compare_cats_type_transit(cat_dto_from, cat_dto_to);
    }
    //@--------------------------------------
    else if(cat_type == cat_types[2]){
        report += compare_cats_type_modal(cat_dto_from, cat_dto_to);
    }
    //@--------------------------------------
    else if(cat_type == cat_types[3]){
        report += compare_cats_type_modal_media(cat_dto_from, cat_dto_to, SRC_ALL_IDS, SMART_ALL_LINKS);
    }
    return report;
    //@ ------SUB FUNTIONS--------
    function compare_cats_type_modal_media(cat_dto_from, cat_dto_to, SRC_ALL_IDS, SMART_ALL_LINKS){
        let report = "";
        //@ do the same things like with modal window
        report += compare_cats_type_modal(cat_dto_from, cat_dto_to);
        //@ And also do things with media links
        /*
        const media_arr_from = cat_dto_from.modal_w_data.media_data;
        const media_arr_to = cat_dto_to.modal_w_data.media_data;
        media_arr_from.forEach(media_id=>{
            const index_media_from = SRC_ALL_IDS.indexOf(media_id);
            if(index_media_from > -1){
                const LINK = 5;
                const link_from = SRC_MEDIA[index_media_from][LINK];
                const index_link_to = SMART_ALL_LINKS.indexOf(link_from);
                if(index_link_to > -1){
                    const smart_id = SMART_MEDIA[index_link_to][7];
                    console.log("FB id: ", media_id, " is the same id",smart_id, "in SMART. link = ",link_from);
                    report += "FB id: "+ media_id + " = id: "+smart_id+ " in SMART. link= "+link_from + os.EOL;
                }else{
                    //@ TODO: add handly through WISYWIG new link
                    console.error("Cant find FB link: ", link_from);
                    report += "Cant find FB link: " + link_from;
                }

                //console.log("SRC_ALL_IDS includes ", media_id, "link=", link_from);
            }else{
                report += "WARNING: media_id "+ media_id +"has not founded in SRC_MEDIA"
                console.error("Cant find media ID: ", media_id);
                //throw new Error("Cant find category ID !!!");
            }
        })
        */
        //@-------------------------------
        return report;
    }
    function compare_cats_type_modal(cat_dto_from, cat_dto_to){
        let report = "";
        //@------------ 1. ПРоверить в поле buttons---------------
        //@ Кнопка скорее всего будет одна - Back, потому что вложенные категории лежат в "navigation_menu"
        const btns_from = cat_dto_from.buttons;
        const btns_to = cat_dto_to.buttons;
        if(btns_from.length > 1 || btns_to.length > 1){
            console.log("WARNING! More than one 'back' button inside modal category!")
            throw new Error("More than one 'back' button inside modal category!")
        }else if(btns_from.length == 0 || btns_to.length == 0){
            console.log("WARNING! Nor 'back' nor some buttons inside modal category!")
            throw new Error("WARNING! Nor 'back' nor some buttons inside modal category!")
        }else if(btns_from.length == 1 && btns_to.length == 1){
            if(btns_from[0][4] && btns_from[0][4].languages && btns_from[0][4].languages.language__zh){
                if(!btns_to[0][4].languages){ btns_to[0][4].languages = {} }
                if(!btns_to[0][4].languages.language__zh){ btns_to[0][4].languages.language__zh = {} }
                const china_dto_from = btns_from[0][4].languages.language__zh;
                const china_dto_to = btns_to[0][4].languages.language__zh;
                if(china_dto_from.button_name__unbo){
                    if(china_dto_to.button_name__unbo != china_dto_from.button_name__unbo){
                        report += "button_name__unbo at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                    }
                    //@ Присвоить целевой категории значение источника
                    china_dto_to.button_name__unbo = china_dto_from.button_name__unbo; 
                }
                if(china_dto_from.button_title){
                    if(china_dto_to.button_title != china_dto_from.button_title){
                        report += "button_title at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                    }
                    //@ Присвоить целевой категории значение источника
                    china_dto_to.button_title = china_dto_from.button_title;
                } 
            }
        }else{
            console.log("WTF!!! compare_cats_type_modal - cant define number of btna inside modal category!")
            throw new Error("WTF!!! compare_cats_type_modal - cant define number of btna inside modal category!")
        }
        //@------------ 2. ПРоверить в поле languages----------------
        const lang_from = cat_dto_from.languages.language__zh;
        if(lang_from.modal_w_data){
            if(!cat_dto_to.languages) { cat_dto_to.languages = {}; }
            if(!cat_dto_to.languages.language__zh){ cat_dto_to.languages.language__zh }
            if(!cat_dto_to.languages.language__zh.modal_w_data){ cat_dto_to.languages.language__zh.modal_w_data = {} }
            const lang_to = cat_dto_to.languages.language__zh;
            //@===========Отследить были ли изменения !?==========
            const modal_w_data_keys_from = Object.keys(lang_from.modal_w_data);
            const modal_w_data_keys_to = Object.keys(lang_to.modal_w_data);
            //@ modal_w_data_keys_from = ["title", "overview_text"]
            for(let i=0; i<modal_w_data_keys_from.length; i++){
                //@------ Блок кода проверяет, на случай если в целевой категории был изменен порядок полей
                let modaldata_index_to = -1;
                modal_w_data_keys_to.forEach((key_to, index)=>{
                    if(key_to == modal_w_data_keys_from[i]){
                        modaldata_index_to = index;
                    }
                });
                if(modaldata_index_to == -1){
                    report += "NO "+modal_w_data_keys_from[i]+" at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                }else if(modaldata_index_to != i){
                    report += "Order changes: "+modal_w_data_keys_from[i]+" at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                }
                //@=============ВНЕСТИ ИЗМЕНЕНИЯ==========
                const key = modal_w_data_keys_from[i];
                const value = lang_from.modal_w_data[key];
                lang_to.modal_w_data[key] = value;
            }
        }

        //@ -------return
        return report;
    }
    function compare_cats_type_transit(cat_dto_from, cat_dto_to){
        let report= "";
        //@ 1. Проверить китайский в кнопках
        const btns_from = cat_dto_from.buttons;
        const btns_to = cat_dto_to.buttons;
        let situation = 0;
        //@ Проходим по кнопкам источника
        for(let index_from=0;index_from<btns_from.length; index_from++){
            const one_btn_from = btns_from[index_from];
            if(one_btn_from[0] == 'home') {continue;}
        //btns_from.forEach((one_btn_from, index_from)=>{
            //@ one_btn_from = ["home", 45, 1015, "", {<fileds with china exists here>} ]
            //@ Если в данной кнопке есть Китайский язык
            else if(one_btn_from[4] && one_btn_from[4].languages && one_btn_from[4].languages.language__zh){
                //const btn_arr_to = find_same_btn_arr();
                //@
                //@ Получается, что если мы не находим в целевом проекте...
                let btn_index_to = -1;
                const BTN_ID = 0;
                btns_to.forEach((one_btn_to, index)=>{
                    if(one_btn_to[0] == one_btn_from[0]){
                        btn_index_to = index;
                    }
                });
                if(btn_index_to == -1){
                    console.error("AHTUNG! compare_cats_type_transit():")
                    throw new Error("AHTUNG! compare_cats_type_transit()");
                }
                if(index_from != btn_index_to){
                    console.log("compare_cats_type_transit() indexes dismatch:",index_from, btn_index_to, ". At '"+cat_dto_from.category_placeholder+"'")
                }
                const china_dto_from = one_btn_from[4].languages.language__zh;
                if(!btns_to[btn_index_to][4].languages){
                    btns_to[btn_index_to][4].languages = {}
                }
                if(!btns_to[btn_index_to][4].languages.language__zh){
                    btns_to[btn_index_to][4].languages.language__zh = {}
                }
                const china_dto_to = btns_to[btn_index_to][4].languages.language__zh;
                //@ Если херня есть в источнике
                if(china_dto_from.button_name__unbo){
                    //@ И если она есть в назначении
                    if(china_dto_to.button_name__unbo){
                        if(china_dto_to.button_name__unbo != china_dto_from.button_name__unbo){
                            report += "button_name__unbo at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                            //@ Присвоить целевой категории значение источника
                            china_dto_to.button_name__unbo = china_dto_from.button_name__unbo;
                        }
                    }else{
                        report += "NO button_name__unbo at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                        //@ Присвоить целевой категории значение источника
                        china_dto_to.button_name__unbo = china_dto_from.button_name__unbo;
                    }  
                }
                if(china_dto_from.button_title){
                    if(china_dto_to.button_title){
                        if(china_dto_to.button_title != china_dto_from.button_title){
                            report += "button_title at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                            //@ Присвоить целевой категории значение источника
                            china_dto_to.button_title = china_dto_from.button_title;
                        }
                    }else{
                        report += "NO button_title at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                        //@ Присвоить целевой категории значение источника
                        china_dto_to.button_title = china_dto_from.button_title;
                    }
                } 
            }
        }
        //@ 2. Проверить китайский в поле "languages". Но, заведомо известно, что для транзитных категорий 1 уровня это поле всегда пустое! Так устроено в проекте "Food" Но не в Mobility
        const lang_from = cat_dto_from.languages.language__zh;
        //@ Но если вдруг у какой-то категории это поле всё же не пустое, то вывести информацию об этом в консоль
        if(Object.keys(lang_from).length > 0){
            const lang_to = cat_dto_to.languages.language__zh;
            if(!cat_dto_to.languages){
                cat_dto_to.languages = {}
            }
            if(!cat_dto_to.languages.language__zh){
                cat_dto_to.languages.language__zh = {}
            }
            cat_dto_to.languages.language__zh = lang_from;
            console.log("TODO: compare_cats_type_transit(): lang_from:", lang_from);
            //console.log("parent:", cat_dto_from);
            //throw new Error("TODO: compare_cats_type_transit(): lang_from!");
        }
        return report;
    }
    function compare_cats_type_0(cat_dto_from, cat_dto_to){
        let report = "";
        const compared_block_from = cat_dto_from.languages.language__zh.menu_data;
        const keys_from = Object.keys(compared_block_from);
        const compared_block_to = cat_dto_to.languages.language__zh.menu_data;
        //@ keys_from = ["Key drivers", "Solutions", "Services", "Digital"]
        keys_from.forEach(lang_key=>{
            //@ Например lang_key = "Key drivers"
            //@ в smart'е compared_block_to может быть undefined
            if(compared_block_to){
                //@ inner_contain_from = {"Safety": ["Poultry__Key_drivers__Safety", "安全"], "Flexibility": [<english>, <china>]}
                const inner_contain_from = compared_block_from[lang_key][0];
                const inner_contain_to = compared_block_to[lang_key][0];
                //@ inner_contain_keys_from = ["Safety", "Flexibility", "..."]
                const inner_contain_keys_from =Object.keys(inner_contain_from);
                inner_contain_keys_from.forEach(key=>{
                    //@ Например key = "Safety" или "Flexibility"
                    //@ english_str = "Poultry__Key_drivers__Safety"
                    const english_str = inner_contain_from[key][0];
                    //@ china_str = "安全"
                    const china_from = inner_contain_from[key][1];
                    const china_to = inner_contain_to[key][1];
                    if(china_from != china_to){
                        report += "CHINA DISMATCH: " + key + " at: " + cat_dto_from.category_placeholder + ", server_category_id in SRC Project: " + cat_dto_from.server_category_id + os.EOL;
                    }
                });
                const self_name_from = compared_block_from[lang_key][1];
                const self_name_to = compared_block_to[lang_key][1];
                if(self_name_from != self_name_to){
                    report += "self_name_from at: " + cat_dto_from.category_placeholder + ", server_id: " + cat_dto_from.server_category_id + os.EOL;
                }
            }
        });
        return report;
    }
}
function define_cat_type(cat_dto){
    const cat_types = ["lvl_0", "lvl_1_transit", "modal", "modal_media"];
    //@ В Жрачке(abbfb.com) любая категория имеет свойство languages и внутри language__zh(китайский)
    const fb_lang_zh = cat_dto.languages.language__zh;
    //@ таких будет 8 (категории уровня L0: "Sugar beet", "Beef", "Poultry" и прочие)
    if(fb_lang_zh.menu_data){
        return cat_types[0];
    }
    //@ У всех модальных окон есть такое свойство (1634 шт. в Жрачке)
    else if(cat_dto.modal_w_data.navigation_menu){
        //@ Есть или нету каких-либо ссылок в модальной категории
        if(cat_dto.modal_w_data.media_data.length > 0){
            return cat_types[3];
        }else{
            return cat_types[2];
        }
    }
    //@Типа если там больше чем одна кнопок, значит это транзитная категория
    else if(cat_dto.buttons.length>1){
        return cat_types[1];
    }
}
