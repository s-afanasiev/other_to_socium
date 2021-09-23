//@ Обрубок, не делающий практичски ничего полезного. Смотрит во всех ли категориях в разделе с китайским языком  есть поле 'title'
const fs = require('fs');
const os = require('os');
const FB_DATA  = require("./../project_data_abbfb.js").categories;
const SMART_DATA  = require("./../project_data_smart_v2.js").categories;
const SIGNIFICANT_FIELDS = [];
console.log(Object.keys(FB_DATA).length);
console.log(Object.keys(SMART_DATA).length);
const FB_ARR = Object.keys(FB_DATA);
const SMART_ARR = Object.keys(SMART_DATA);

const cat_types_counter = {"lvl_0": 0, "lvl_1_transit": 0, "modal": 0, "modal_media":0};
let ne_popal_counter = 0;
let all_matches_counter = 0;
let matches_btn_back = 0;
let matches_modal = 0;
let report = "";
const uniq_server_ids = {};
let is_uniq_server_ids = true;
FB_ARR.forEach((cat_id)=>{
    //@ категорию home пропускаем
    if(cat_id != "home"){
        //@ если есть соответствующая категория в "умном обществе"
        //@ Всего совпадающих категорий с abbfb: 1902. Модальных категори, содержащих ссылки медиа: 328.
        if(SMART_DATA[cat_id]){
            all_matches_counter++
            const cat_type = define_cat_type(FB_DATA[cat_id]);
            if(cat_type == "modal"){
                matches_modal++
                const modal_data = FB_DATA[cat_id].languages.language__zh.modal_w_data;
                if(modal_data){
                    Object.keys(modal_data).forEach(key=>{
                        if(key != "title"){
                            console.log("key=<"+key+">")
                        }
                    })
                }
            }
        }
    }
})
console.log("all_matches_counter=", all_matches_counter);
console.log("matches_btn_back=", matches_btn_back);
console.log("matches_modal=", matches_modal);

//@--------------------------------------------------------------------
//@--------------------------------------------------------------------
//@--------------------------------------------------------------------
//@ param {Object} cat_dto_from - object-structure of some category which considered like standard sample
//@ param {Object} cat_dto_to - object-structure of some category which should be compared with cat_dto_from
//@ param {String} cat_type - one of values ["lvl_0", "lvl_1_transit", "modal", "modal_media"]
function compare_cats(cat_dto_from, cat_dto_to, cat_type){
    const cat_types = ["lvl_0", "lvl_1_transit", "modal", "modal_media"];
    let report = "";
    //@--------------------------------------
    if(cat_type == cat_types[0]){
        const compared_block_from = cat_dto_from.languages.language__zh.menu_data;
        const keys_from = Object.keys(compared_block_from);
        const compared_block_to = cat_dto_to.languages.language__zh.menu_data;
        //@ keys_from = ["Key drivers", "Solutions", "Services", "Digital"]
        keys_from.forEach(lang_key=>{
            //@ в smart'е compared_block_to может быть undefined
            if(compared_block_to){
                const inner_contain_from = compared_block_from[lang_key][0];
                const inner_contain_to = compared_block_to[lang_key][0];
                const self_name_from = compared_block_from[lang_key][1];
                const self_name_to = compared_block_to[lang_key][1];
                if(self_name_from != self_name_to){
                    report += ""
                }
            }
        })
    }
    //@--------------------------------------
    else if(cat_type == cat_types[1]){

    }
    //@--------------------------------------
    else if(cat_type == cat_types[2]){

    }
    //@--------------------------------------
    else if(cat_type == cat_types[3]){

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
