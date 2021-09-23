//@ модуль сравнивает файлы медиа (media_data) двух проектов
const fs = require('fs');
const os = require('os');
const { report } = require('process');
main();
function main(){
    new App().run();
}
function App(){
    this.run=(file)=>{
        //const CATS_SRC = require("../project_data_datacenter.js").categories;
        const CATS_DST = require("../project_data_abbfb.js").categories;
        //const CATS_SRC = require("../project_data_mobility.js").categories;
        //console.log("App.run() CATS_SRC=",CATS_SRC);
        const CATS_SRC = require("../project_data_smart.js").categories;
        const MEDIADATA_DST = require("../media_data_abbfb.js");
        //const MEDIADATA_SRC = require("../media_data_mobility.js");
        //const MEDIADATA_SRC = require("../media_data_datacenter.js");
        const MEDIADATA_SRC = require("../media_data_smart.js");
        return new CategoriesDirectPass(
            new CatStorage(),
            new CatTypes()
                .with(new CatL0(), "lvl_0")
                .with(new CatTransit(), "lvl_1_transit")
                .with(new CatModal(), "modal")
                .with(new CatModalMedia({constr_fields:false}), "modal_media"),
            new OneCatBypass(            
                new IfMediaCat(
                    new CatTypeRecognize(),
                    new MediaCatBypass(
                        new BothProjectdataMediaIds( // get and control all media ids of some category
                            new FinalRevealExtraMediaIds( // in the end of iteration through  media ids array of one cat of Src project
                                new SrcProjMedIdArrayIteration( // process one media id of all media ids of some category
                                    new IfProjArrayIntersectMedfileIds( // проверка, пересекается ли множество найденных ссылок в dst_mediadata с множеством media_ids целевой "прожект_дата"
                                        new DstMedfileIdsByLink( // Получение множества идентификаторов Медиа_ids из целевого файла media_data
                                            new SrcMediafileLinkById({}), // Получение ссылки по ID файла-источника media_data
                                            {}
                                        ),
                                        {}
                                    ),
                                    {}
                                ),
                                {}
                            ),
                            new DstProjMedArrayShadow(),
                            {}
                        ),
                        MEDIADATA_SRC,
                        MEDIADATA_DST,
                        {order:1, only_china: false, exclude_pictures_media: true, langs_need: ['en', 'zh', 'all'], langs_lettters:['en','it','zh','es','pt','fr','tr','de','hu','ru','all','pl'], langs_ids:[2,3,4,5,6,7,8,9,10,11,12,13]}
                    ),
                    {}
                )
            ),
            new Report()
        ).run(CATS_SRC, CATS_DST);
    }
}
function Report(){
    let _report = "";
    this.run=()=>{
        _report = "";
        return this;
    }
    this.write=(line)=>{
        //console.log("Report.write(): line=", line)
        _report += line + os.EOL;
    }
    this.final=()=>{
        console.log("===========> FINAL REPORT LEN =", _report.length)
        fs.writeFileSync("./out/MEDIA_REPORT.txt", _report);
    }
}
function CategoriesDirectPass(catStorage, catTypes, oneCatBypass, report){
    //let _report = "";
    this.run=(CATS_SRC, CATS_DST)=>{
        catStorage.run();
        const cat_types = catTypes.run().types();
        Object.keys(CATS_SRC).forEach(src_cat_key=>{
            if(src_cat_key != "home"){
                //catStorage[src_cat_key] = oneCatBypass.instance().run(cat_types, CATS_SRC, src_cat_key, CATS_DST);
                oneCatBypass.instance().run(cat_types, CATS_SRC, src_cat_key, CATS_DST, report);
            }
        });
        report.final();
        return this;
    }
}
function OneCatBypass(ifMediaCat, id){
    const _id = id || 1;
    //let _report = "";
    //@ param {Object<hashtable>} cat_types, like {"lvl_0": CatL0, "lvl_1_transit": CatTransit, "modal": CatModal, "modal_media": CatModalMedia }
    this.instance=()=>{
        return new OneCatBypass(ifMediaCat, _id+1);
    }
    //this.report=()=>{return _report}
    this.run=(cat_types, CATS_SRC, src_cat_key, CATS_DST, report)=>{
        //_report = ifMediaCat.instance().run(cat_types, CATS_SRC, src_cat_key, CATS_DST).report();
        ifMediaCat.instance().run(cat_types, CATS_SRC, src_cat_key, CATS_DST, report);
        // if(_id == 2){
        //     fs.writeFileSync("Media_Report__id_2.txt", _report);
        // }
        return this;
    }
}
function IfMediaCat(catTypeRecognize, mediaCatBypass, options){
    const MODAL_MEDIA_TYPE = "modal_media";
    let _report = "";
    // this.report=()=>{return _report;}
    this.instance=()=>{return new IfMediaCat(catTypeRecognize, mediaCatBypass, options)}
    this.run=(cat_types, CATS_SRC, src_cat_key, CATS_DST, report)=>{
        const cat_type = catTypeRecognize.instance().run(CATS_SRC[src_cat_key]).type();
        //_current_category = catChinaBypass.run(CATS_SRC, src_cat_key, CATS_DST);
        if(cat_type == MODAL_MEDIA_TYPE){
            //console.log("IfMediaCat: media category:", src_cat_key);
            //_report = mediaCatBypass.instance(options).run(CATS_SRC, src_cat_key, CATS_DST).report();
            mediaCatBypass.instance(options).run(CATS_SRC, src_cat_key, CATS_DST, report)
        }
        return this;
    }
}
function CatChinaBypass(catTypeRecognize, chinaDiffs){
    //@ method-builder returns {String} -type of category 
    this.type=()=>{return catTypeRecognize.type();}
    this.instance=()=>{return new CatChinaBypass(catTypeRecognize, chinaDiffs);}
}
function CatTypeRecognize(){
    let _type = "";
    //this.catFactory = catFactory;
    //@ method-builder returns {String} -type of category
    this.type=()=>{return _type;}
    this.instance=()=>{return new CatTypeRecognize();}
    //@ method-manipulator - returns {CatTypeRecognize} with defined type of category
    this.run=(cat_dto)=>{
        const cat_types = ["lvl_0", "lvl_1_transit", "modal", "modal_media"];
        //@ В Жрачке(abbfb.com) любая категория имеет свойство languages и внутри language__zh(китайский)
        const fb_lang_zh = cat_dto.languages.language__zh;
        //@ таких будет 8 (категории уровня L0: "Sugar beet", "Beef", "Poultry" и прочие)
        if(fb_lang_zh.menu_data){
            _type = cat_types[0];
        }else if(cat_dto.modal_w_data.navigation_menu){
            //@ У всех модальных окон есть такое свойство (1634 шт. в Жрачке)
            //@ Есть или нету каких-либо ссылок в модальной категории
            if(cat_dto.modal_w_data.media_data.length > 0){
                _type = cat_types[3];
            }else{
                _type = cat_types[2];
            }
        }else if(cat_dto.buttons.length>1){
            //@Типа если там больше чем одна кнопок, значит это транзитная категория
            _type = cat_types[1];
        }
        return this;
    }
}
//@ param {Object} bothProjectdataMediaIds - contain two arrays e.g.: {src: [310, 500, 201], dst: [467, 708]}
function MediaCatBypass(bothProjectdataMediaIds, MEDIADATA_SRC, MEDIADATA_DST, options){
    this.bothProjectdataMediaIds = bothProjectdataMediaIds;
    options.order = options.order || 1;
    let _report = "";
    // this.report=()=>{return _report;}
    this.run=(CATS_SRC, src_cat_key, CATS_DST, report)=>{
        //_report = this.bothProjectdataMediaIds.instance(options).run(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST).report();
        this.bothProjectdataMediaIds.instance(options).run(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST, report);
        return this;
    }
    this.instance=()=>{
        options.order++;
        return new MediaCatBypass(bothProjectdataMediaIds, MEDIADATA_SRC, MEDIADATA_DST, options);
    }
}
//@ Функция достаёт массивы media_data для одной Категории из файлов Project_data Целевого проекта и проекта-источника. Также функция работает как посредник, получив ID, найденные в файла Media.js передаёт их объектам "на пересечение" и " на остаток лишних"
//@ param {FinalRevealExtraMediaIds} finalRevealExtraMediaIds - это объект-обертка над итерацией по всем Медиа-ID одной категории, который, в итоге вычислит лишние ID, которых нет в проекте-источнике, но есть в целевом проекте.
//@ param {DstProjMedArrayShadow} dstProjMedArrayShadow - объект хранит копию массива Медиа-id одной категории целевого проекта и он удалет из своего массива элементы по мере того, как итерация по всем ID находит совпадения.
function BothProjectdataMediaIds(finalRevealExtraMediaIds, dstProjMedArrayShadow, options){
    let _report = "";
    this.src_proj_ids = [];
    this.dst_proj_ids = [];
    this.dst_proj_shadow = [];
    this.finalRevealExtraMediaIds = finalRevealExtraMediaIds;
    this.dstProjMedArrayShadow = dstProjMedArrayShadow;
    this.report=()=>{return _report;}
    this.instance=(options)=>{
        return new BothProjectdataMediaIds(this.finalRevealExtraMediaIds, this.dstProjMedArrayShadow, options);
    }
    this.run=(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST, report)=>{
        //console.log("BothProjectdataMediaIds.run(): report=", report);
        this.src_proj_ids = _get_src_media_ids(CATS_SRC, src_cat_key, options, MEDIADATA_SRC);
        //console.log("BothProjectdataMediaIds: this.src_proj_ids=",this.src_proj_ids);
        this.dst_proj_ids = _get_dst_media_ids(CATS_DST, src_cat_key, options, MEDIADATA_DST);
        const dst_proj_media_ids_shadow = JSON.parse(JSON.stringify(this.dst_proj_ids));
        if(this.src_proj_ids.length == 0){
            //console.log("BothProjectdataMediaIds.run(): категория с медиа ссылками, но китайских нет")
            if(options && options.only_china){
                //@ Это нормально! Т.е. категория хоть и была типа "Media" (имела массив айдишников), но китайских не было
            }else{
                console.error("BothProjectdataMediaIds.run(): empty media_data in cat:", src_cat_key)
            }
        }else{
            //@ в рамках одного массива Media-id
            this.dstProjMedArrayShadow = this.dstProjMedArrayShadow.instance().run(dst_proj_media_ids_shadow, MEDIADATA_DST, src_cat_key, report);
            //_report += this.finalRevealExtraMediaIds.instance(options).run(this.src_proj_ids, this.dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, this.dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC).report();      
            this.finalRevealExtraMediaIds.instance(options).run(this.src_proj_ids, this.dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, this.dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC, report)     
        }
        return this;
    }
    //@ find and delete from dst_proj_shadow array value of id
    const _clear_dst_proj_shadow=function(dst_proj_shadow, id){
        const index_id = dst_proj_shadow.indexOf(id);
        if(index_id > -1){
            dst_proj_shadow.splice(index_id, 1);
        }    
    }
    const _get_src_media_ids=function(CATS_SRC, src_cat_key, options, MEDIADATA_SRC){
        const _ID_INDEX = 7;
        const _LINK_INDEX = 5;
        const _LANGS_INDEX = 10;
        const _EN_LANG_INDEX = 2;
        const _CHINA_LANG_INDEX = 4;
        const _ALL_LANG_INDEX = 12;
        let media_data = [];
        try{
            //@ e.g. media_data = [527, 3285]
            media_data = CATS_SRC[src_cat_key].modal_w_data.media_data;
        }catch(er){
            console.error("ERROR: BothProjectdataMediaIds: expected src category with media_data")
        }
        //@ Если в media_data будет например 3 элемента, то в only_china_ids_from_mediadata элементов должно быть меньше или равно
        const all_and_other_langs_sorted_from_media = [];
        for(let i=0; i<media_data.length; i++){
            for(let j=0; j<MEDIADATA_SRC.length; j++){
                const cur_id = MEDIADATA_SRC[j][_ID_INDEX];
                //@ Нашли тот, который совпадает, теперь ещё надо проверить, входит ли он в Китайский
                if(media_data[i] ==cur_id){
                    const langs_list = MEDIADATA_SRC[j][_LANGS_INDEX];
                    const is_lang_en_specified = langs_list.includes(_EN_LANG_INDEX);
                    const is_lang_zh_specified = langs_list.includes(_CHINA_LANG_INDEX);
                    const is_china_need = options.only_china && is_lang_zh_specified;
                    const is_lang_all_specified = langs_list.includes(_ALL_LANG_INDEX);
                    if(is_lang_en_specified || is_lang_zh_specified || is_lang_all_specified){
                        all_and_other_langs_sorted_from_media.push(media_data[i]);
                    }
                }
            }
        }
        //console.log("all_and_other_langs_sorted_from_media=", all_and_other_langs_sorted_from_media)
        media_data = all_and_other_langs_sorted_from_media;
        return media_data;
    }
    const _get_dst_media_ids=function(CATS_DST, src_cat_key, options, MEDIADATA_DST){
        const _ID_INDEX = 7;
        const _LINK_INDEX = 5;
        const _LANGS_INDEX = 10;
        const _EN_LANG_INDEX = 2;
        const _CHINA_LANG_INDEX = 4;
        const _ALL_LANG_INDEX = 12;
        let media_data = [];
        try{
            media_data = CATS_DST[src_cat_key].modal_w_data.media_data;
        }catch(er){
            console.error("REPORT: BothProjectdataMediaIds: No media_data in dst category")
        }
        //@ Если в media_data будет например 3 элемента, то в all_and_other_langs_sorted_from_media элементов должно быть меньше или равно
        const all_and_other_langs_sorted_from_media = [];
        //@ например media_data = [513, 440, 235]
        for(let i=0; i<media_data.length; i++){
            for(let j=0; j<MEDIADATA_DST.length; j++){
                const cur_id = MEDIADATA_DST[j][_ID_INDEX];
                //@ Нашли тот, который совпадает, теперь ещё надо проверить, входит ли он в Китайский
                if(media_data[i] == cur_id){
                    const langs_list = MEDIADATA_DST[j][_LANGS_INDEX];
                    const is_lang_en_specified = langs_list.includes(_EN_LANG_INDEX);
                    const is_lang_zh_specified = langs_list.includes(_CHINA_LANG_INDEX);
                    const is_china_need = options.only_china && is_lang_zh_specified;
                    const is_lang_all_specified = langs_list.includes(_ALL_LANG_INDEX);
                    if(is_lang_en_specified || is_lang_zh_specified || is_lang_all_specified){
                        all_and_other_langs_sorted_from_media.push(media_data[i]);
                    }
                }
            }
        }
        media_data = all_and_other_langs_sorted_from_media;
        return media_data;
    }
}
function FinalRevealExtraMediaIds(srcProjMedIdArrayIteration, options){
    this.srcProjMedIdArrayIteration = srcProjMedIdArrayIteration;
    let _report = "";
    this.report=()=>{return _report;}
    this.instance=(options)=>{return new FinalRevealExtraMediaIds(this.srcProjMedIdArrayIteration, options)}
    this.run=(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC, report)=>{
        //console.log("FinalRevealExtraMediaIds.run(): report=", report);
        this.srcProjMedIdArrayIteration.instance(options).run(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC, report);
        //@ Кончились итерации
        //_report += srcProjMedArrayIteration.report();
        //_report += dstProjMedArrayShadow.extra_report();
        dstProjMedArrayShadow.do("extra_report");
        return this;
    }
}
function SrcProjMedIdArrayIteration(ifProjArrayIntersectMedfileIds, options){
    this.ifProjArrayIntersectMedfileIds = ifProjArrayIntersectMedfileIds;
    let _report = "";
    //this.report=()=>{return _report;}
    this.instance=(options)=>{return new SrcProjMedIdArrayIteration(this.ifProjArrayIntersectMedfileIds, options)}
    this.run=(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC, report)=>{
        //console.log("SrcProjMedIdArrayIteration.run(): report=", report);
        this.ifProjArrayIntersectMedfileIds = this.ifProjArrayIntersectMedfileIds.instance(options)
        if(src_proj_ids.length > 0){
            src_proj_ids.forEach(src_one_media_id=>{
                this.ifProjArrayIntersectMedfileIds.run(src_one_media_id, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC, report);
            });
            //_report += this.ifProjArrayIntersectMedfileIds.report();
        } else {
            report.write("ERROR:No media_data in src category:" + src_cat_key);
        }
        return this;
    }
}
//@ это теневая копия массива айдишников одной категории целевого проекта, которая удаляет из себя те айдишники, которым нашлось соответствие с категорией проекта-источника. Соответственно в конце останутся те, id, который являются лишними, т.е. в проекте-источнике их нет, а в целевом - есть, которую по сути надо удалить, если требуется полное соответствие проектов.
function DstProjMedArrayShadow(){
    let _report = undefined;//run
    this.dst_proj_media_ids_shadow = undefined;
    this.MEDIADATA_DST = undefined; //run
    this.src_cat_key = undefined; //run
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    //this.report=()=>{return this._report;}
    this.instance=()=>{return new DstProjMedArrayShadow();}
    this.run=(dst_proj_media_ids_shadow, MEDIADATA_DST, src_cat_key, report)=>{
        _report = report;
        this.dst_proj_media_ids_shadow = dst_proj_media_ids_shadow;
        this.MEDIADATA_DST = MEDIADATA_DST;
        this.src_cat_key = src_cat_key;
        this.MEDIADATA_DST_FLAT_IDS = MEDIADATA_DST.map(arr=>arr[_ID_INDEX]);
        this.MEDIADATA_DST_FLAT_LINKS = MEDIADATA_DST.map(arr=>arr[_LINK_INDEX]);
        return this;
    }
    this.do=(act)=>{
        if(act == "extra_report"){
            //console.log("DstProjMedArrayShadow: dst_proj_media_ids_shadow=", this.dst_proj_media_ids_shadow)
            const links = this.dst_proj_media_ids_shadow.map(id=>{
                //console.log("shadow id=", id)
                const id_index = this.MEDIADATA_DST_FLAT_IDS.indexOf(id);
                //console.log("shadow id_index=", id_index)
                if(id_index > -1) 
                    return this.MEDIADATA_DST_FLAT_LINKS[id_index]
            })
            if(links.length>0){
                //this._report += this.src_cat_key + "-->" + links + "-->" + this.dst_proj_media_ids_shadow + "-->Excess links" + os.EOL;    
            }
            //return this._report;
        }else{
            console.error("DstProjMedArrayShadow.do() unknown action: ", act);
        }
    }
    this.del=(ids)=>{
        //console.log("DstProjMedArrayShadow.del(): before:",this.dst_proj_media_ids_shadow);
        if(Array.isArray(this.dst_proj_media_ids_shadow)){
            ids.forEach(id=>{
                const id_index = this.dst_proj_media_ids_shadow.indexOf(id);
                if(id_index > -1){
                    this.dst_proj_media_ids_shadow.splice(id_index, 1);
                }
            })
        }else{
            //console.error("ERROR: DstProjMedArrayShadow.del(): dst_proj_media_ids_shadow is NOT an Array!")
            _report.write("ERROR: DstProjMedArrayShadow.del(): dst_proj_media_ids_shadow is NOT an Array!");
        }
        console.log("DstProjMedArrayShadow.del(): after:",this.dst_proj_media_ids_shadow);
    }
}
//@ Проверяет в целевом проекте: содержит ли массив медиа айдишников рассматриваемой категории id из файла media_data, которые соответствуют ссылкам в проекте-источнике
function IfProjArrayIntersectMedfileIds(dstMedfileIdsByLink, options){
    this.dstMedfileIdsByLink = dstMedfileIdsByLink;
    this.dstProjMedArrayShadow = undefined;
    let _dst_projectfile_media_ids =[];
    let _report = "";
    let _link = "";
    let _title = undefined;
    let _langs = undefined;
    this.link=()=>{return _link;}
    this.report=()=>{return _report;}
    this.instance=(options)=>{return new IfProjArrayIntersectMedfileIds(this.dstMedfileIdsByLink, options)}
    //@ Надо сравнить DST Projectfile media_array of some category И найденные в DST Mediafile айдишники по Link
    this.intersected=(dst_media_finded_ids)=>{
        //@ intersection - always array, empty or not
        let intersection = dst_media_finded_ids.filter(x => _dst_projectfile_media_ids.includes(x));
        if(intersection.length>0){return true}
        else{return false;}
    }
    const make_breadcrumbs=function(cat_id, src_cats_dto){
        const fut_reverse = [];
        let parent;
        fut_reverse.push(src_cats_dto[cat_id].valid_hash_name);
        try{
            parent = src_cats_dto[cat_id].parent;
        }catch(err){
            console.log("ERROR: make_breadcrumbs(): cat_id=",cat_id, "src_cats_dto[cat_id]=",src_cats_dto[cat_id])
        }
        if(parent){
            while(src_cats_dto[parent]){
                const data = src_cats_dto[parent].valid_hash_name || src_cats_dto[parent].category_placeholder;
                parent = src_cats_dto[parent].parent;
                if(src_cats_dto[parent]){
                    fut_reverse.push(data);
                }
            }
        }
        let stack = "";
        for (let i=fut_reverse.length-1; i>=0; i--){
            stack += fut_reverse[i] + " -> "
        }
        return stack;
    }
    this.run=(src_one_media_id, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC, report)=>{
        //console.log("IfProjArrayIntersectMedfileIds.run(): report=", report);
        _dst_projectfile_media_ids = dst_proj_ids;
        this.dstProjMedArrayShadow = dstProjMedArrayShadow;
        const dstMedfileIds = this.dstMedfileIdsByLink.instance(options).run(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id, report);
        _link = dstMedfileIds.link();
        _title = dstMedfileIds.title();
        _langs = dstMedfileIds.langs();
        const _dst_medfile_ids = dstMedfileIds.ids();
        //@ вложенный объект dstMedfileIdsByLink, который искал ссылку по ID, ничего не нашёл. Такое возможно, если например искали только на китайском языке.
        if(_dst_medfile_ids.length == 0){
            //_report += "do nothing" + os.EOL;
            console.log("no intersection in cat:", src_one_media_id)
        }else if(this.intersected(_dst_medfile_ids)){
            //@ it's good scenario. Это значит, что в целевом проекте, в рассматриваемой категории есть соответствующая ссылка, как и в проекте-источнике
            this.dstProjMedArrayShadow.del(_dst_medfile_ids);
        }else{
            //@ Случай, когда одна медиа одной категории в проекте-источнике не нашла отражения в целевом проекте. Другими словами, в целевой проект нужно будет добавить недостающую ссылку
            //console.log("IfProjArrayIntersectMedfileIds.run(): NOT MATCH!");
            const report2 = make_breadcrumbs(src_cat_key, CATS_SRC);
            //_report += src_cat_key + "-->" + this.link() + "->NO in dst" + os.EOL;
            report.write(report2 + this.link() + " -> " + src_cat_key + " -> NO in dst -> title: " + dstMedfileIds.title() + " -> langs: "+ dstMedfileIds.langs());
        }
        return this;
    }
}
function DstMedfileIdsByLink(srcMediafileLinkById, options){
    let _report = "";
    let _options = options;
    let _link = undefined;
    let _title = undefined;
    let _langs = undefined;
    this.src_one_media_id = undefined;
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    const _LANGS_INDEX = 10;
    const _ENGLISH_LANG_INDEX = 2;
    const _CHINA_LANG_INDEX = 4;
    const _ALL_LANG_INDEX = 12;
    let _matched_ids = [];
    this.link=()=>{return _link;}
    this.title=()=>{return _title;}
    this.langs=()=>{return _langs;}
    this.report=()=>{return _report;}
    this.instance=(options)=>{
        return new DstMedfileIdsByLink(srcMediafileLinkById, options);
    }
    this.ids=()=>{return _matched_ids;}
    this.run=(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id, report)=>{
        this.src_one_media_id = src_one_media_id;
        const srcMediafileLink = srcMediafileLinkById.instance(options).run(MEDIADATA_SRC, this.src_one_media_id, report);
        _link = srcMediafileLink.link();
        _title = srcMediafileLink.title();
        _langs = srcMediafileLink.langs();
        _matched_ids = _get_matched_ids(srcMediafileLink, MEDIADATA_DST);
        //console.log("DstMedfileIdsByLink: _matched_ids=",_matched_ids)
        return this;
    }
    const _get_matched_ids=function(srcMediafileLink, MEDIADATA_DST){
        let _matched_ids = []
        //@ Вообще ссылка есть всегда, просто сюда может вернуться undefined по причине того, что ссылка не относится к китайскому языку
        const media_is_picture = (typeof srcMediafileLink.link() == 'string' && srcMediafileLink.link().startsWith("https://abbsmartsocieties.com/media/"));
        if(_options.exclude_pictures_media && media_is_picture) {
            //@ do nothing, skip any actions.
            //console.log("skipping media picture:", srcMediafileLink.link());
        }else if(srcMediafileLink.link()){
            //@ ищем в Целевом файле Media_data Элементы, у которых есть такая ССылка, как _link
            for(let i=0; i<MEDIADATA_DST.length; i++){
                if(MEDIADATA_DST[i][_LINK_INDEX] == srcMediafileLink.link()){
                    const langs_array = MEDIADATA_DST[i][_LANGS_INDEX];
                    const is_en_lang_specified = options.langs_need.includes("en");
                    const is_zh_lang_specified = options.langs_need.includes("zh");
                    const is_all_lang_specified = options.langs_need.includes("all");
                    const is_en_lang_in_media = langs_array.includes(_ENGLISH_LANG_INDEX);
                    const is_zh_lang_in_media = langs_array.includes(_CHINA_LANG_INDEX);
                    const is_all_lang_in_media = langs_array.includes(_ALL_LANG_INDEX);
                    const is_en_lang_ensure = is_en_lang_specified && is_en_lang_in_media;
                    const is_zh_lang_ensure = is_zh_lang_specified && is_zh_lang_in_media;
                    const is_all_lang_ensure = is_all_lang_specified && is_all_lang_in_media;
                    if(is_en_lang_ensure || is_zh_lang_ensure || is_all_lang_ensure){
                        _matched_ids.push(MEDIADATA_DST[i][_ID_INDEX]);
                    }
                }
            }
        }
        return _matched_ids;
    }
}
function SrcMediafileLinkById(options){
    let _link = undefined;
    let _title = undefined;
    let _langs = undefined;
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    const _TITLE_INDEX = 2;
    const _LANGS_INDEX = 10;
    const _ENGLISH_LANG_INDEX = 2;
    const _CHINA_LANG_INDEX = 4;
    const _ALL_LANG_INDEX = 12;
    this.link=()=>{return _link;}
    this.title=()=>{return _title;}
    this.langs=()=>{return _langs;}
    this.instance=(options)=>{return new SrcMediafileLinkById(options);}
    //@ param {Number}  src_one_media_id - e.g. 520 - идентифакатор медиа, который взят из массива медиа айдишников в описании одной из категорий
    this.run=(MEDIADATA_SRC, src_one_media_id, report)=>{
        //console.log("SrcMediafileLinkById.run() src_one_media_id=",src_one_media_id);
        //@ проход по всем элементам файла media_data проекта-источника
        for(let i=0; i<MEDIADATA_SRC.length; i++){
            //@ если нашли медиа по id
            if(MEDIADATA_SRC[i][_ID_INDEX] == src_one_media_id){
                //console.log("SrcMediafileLinkById.run(): src_one_media_id=",src_one_media_id);
                //@ Костыль - условие чтобы сравнивались медиа только на китайском
                const langs_array = MEDIADATA_SRC[i][_LANGS_INDEX];
                const is_en_lang_specified = options.langs_need.includes("en");
                const is_zh_lang_specified = options.langs_need.includes("zh");
                const is_all_lang_specified = options.langs_need.includes("all");
                const is_en_lang_in_media = langs_array.includes(_ENGLISH_LANG_INDEX);
                const is_zh_lang_in_media = langs_array.includes(_CHINA_LANG_INDEX);
                const is_all_lang_in_media = langs_array.includes(_ALL_LANG_INDEX);
                const is_en_lang_ensure = is_en_lang_specified && is_en_lang_in_media;
                const is_zh_lang_ensure = is_zh_lang_specified && is_zh_lang_in_media;
                const is_all_lang_ensure = is_all_lang_specified && is_all_lang_in_media;
                //console.log("langs_array=",langs_array);
                if(is_en_lang_ensure || is_zh_lang_ensure || is_all_lang_ensure){
                    _link = MEDIADATA_SRC[i][_LINK_INDEX];
                    //console.log("SrcMediafileLinkById.run() finded link=",_link);
                    _langs = MEDIADATA_SRC[i][_LANGS_INDEX];
                    _title = MEDIADATA_SRC[i][_TITLE_INDEX];
                }
                break;
            }
        }
        return this;
    }
}
//@ function - factory of unique Categories
function CatTypes(){
    //this.catTypeRecognize = catTypeRecognize;
    //this.catStorage = catStorage;
    const _types_collection = {};
    let _current_type = undefined;
    this.uniq_names_stor = {};
    this.with=(catType, cat_type_key)=>{
        _types_collection[cat_type_key] = catType;
        return this;
    }
    //@ param {String} src_cat_id - category name e.g. "sugar_beet__safety"
    //@ param {Object} src_cat_dto - src category object {placeholder, width, buttons}
    //@ param {Object} dst_all_cats_dto - all smart structure object
    this.run=(src_cat_id, src_cat_dto, dst_all_cats_dto)=>{
        // this.catStorage.save(
        //     src_cat_key, 
        //     _types_collection[catTypeRecognize.instance(src_cat_dto).run().type()].instance(src_cat_id)
        // )
        return this;
    }
    this.types=()=>{
        return _types_collection;
    }
    this.cat=(uniq_name)=>{
        if(!uniq_name){console.log("")}
        if((Object.keys(this.uniq_names_stor)).includes(uniq_name)){
            return this.uniq_names_stor[uniq_name];
        }else{
            const newCat = this.category.instance(uniq_name);
            this.uniq_names_stor[uniq_name] = newCat;
            return newCat;
        }
    }
}
function CatStorage(){
    const _stor = {}
    this.run=()=>{return this}
    this.save=(cat_id, catSpecial)=>{
        if(this.exist(cat_id)){
            catSpecial.category.twice_call()
        }
    }
    this.exist=(cat_id)=>{
        if(_stor[cat_id]){
            return true;
        }else{
            return false;
        }
    }
}
function CatL0(category){
    this.category = category;
    this.instance=(cat_id)=>{
        return new CatL0(new Category(cat_id));
    }
    this.run=()=>{
        this.category.run();
        return this;
    }
}
function CatTransit(category){
    this.category = category;
    this.instance=(cat_id)=>{
        return new CatTransit(new Category(cat_id));
    }
    this.run=()=>{
        this.category.run();
        return this;
    }
}
function CatModal(category){
    this.category = category;
    this.instance=(cat_id)=>{
        return new CatModal(new Category(cat_id));
    }
    this.run=()=>{
        this.category.run();
        return this;
    }
}
function CatModalMedia(constr, mediaCatBypass){
    this.mediaCatBypass = mediaCatBypass;
    if(constr.category){
        this.category = constr.category;
    }
    this.run=()=>{
        this.mediaCatBypass.instance().run(this);
    }
    this.instance=(cat_id)=>{
        return new CatModalMedia({category: new Category(cat_id)}, mediaCatBypass);
    }
}
function Category(uniq_name, mediable){
    //@ unique name, e.g.: 'infrastructure__home'
    this.uniq_name = uniq_name || "";
    this.times = 0;
    this.last_parent = "";
    this.chain = [];
    this.run=(prev_chain)=>{
        //@ clone parent's chain and add current category to the chain
        this.chain = Object.assign([], prev_chain);
        this.chain.push(this.uniq_name)
    }
    this.instance=(uniq_name)=>{
        return new Category(uniq_name);
    }
    this.twice_call=()=>{
        this.times++;
    }
}