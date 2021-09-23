//@ Модуль не доделан. Претендует на самю полную версию по сравниванию двух проектов как в части текстов, так и медиа.
const fs = require('fs');
const os = require('os');
main();
function main(){
    new App().run();
}
function App(){
    this.run=(file)=>{
        const CATS_SRC = require("../project_data_fb.js").categories;
        //const CATS_SRC = require("../project_data_mobility.js").categories;
        //const CATS_SRC = require("../project_data_datacenter.js").categories;
        const CATS_DST = require("../project_data_smart.js").categories;
        const MEDIADATA_SRC = require("../media_data_fb.js");
        //const MEDIADATA_SRC = require("../media_data_mobility.js");
        //const MEDIADATA_SRC = require("../media_data_datacenter.js");
        const MEDIADATA_DST = require("../media_data_smart.js");
        return new CategoriesDirectPass(
            new CatsSrc(CATS_SRC),
            new CatsDst(CATS_DST),
            new CatTypes(
                new CatTypeRecognize(),
                new CatStorage()
            )
                .with(new CatL0(), "lvl_0")
                .with(new CatTransit(), "lvl_1_transit")
                .with(new CatModal(), "modal")
                .with(new CatModalMedia({constr_fields:false}), "modal_media"),
            new OneCatBypass(            
                new CatChinaBypass(
                    //new ChinaDiffs()                        
                ),
                new IfMediaCat(
                    new MediaCatBypass(
                        {order:1},
                        new BothProjectdataMediaIds( // get and control all media ids of some category
                            new FinalRevealExtraMediaIds( // in the end of iteration through  media ids array of one cat of Src project
                                new SrcProjMedIdArrayIteration( // process one media id of all media ids of some category
                                    new IfProjArrayIntersectMedfileIds( // проверка, пересекается ли множество найденных ссылок в dst_mediadata с множеством media_ids целевой "прожект_дата"
                                        new DstMedfileIdsByLink( // Получение множества идентификаторов Медиа_ids из целевого файла media_data
                                            new SrcMediafileLinkById() // Получение ссылки по ID файла-источника media_data
                                        )
                                    )
                                )
                            ),
                            new DstProjMedArrayShadow() 
                        ),
                        //new MediadataSrc(MEDIADATA_SRC),
                        //new MediadataDst(MEDIADATA_DST)
                    )
                ),
                0
            )
        ).run();
    }
}

function CategoriesDirectPass(catsSrc, catsDst, catTypes, oneCatBypass){
    let _report = "";
    this.run=()=>{
        const ExploreCatsDiff = require("./ExploreCatsDiff.js");
        new ExploreCatsDiff().different_cats(catsSrc.all_cats_dto())
        //catsSrc.run().keys().forEach(src_cat_id=>{
            //if(src_cat_id != "home"){
                //_report += oneCatBypass.instance().run(catsSrc.set_current(src_cat_id), catsDst.run(), catTypes.run()).report();
                //const cats_with_diff_keys = new require("./explore_cats_diff.js").different_cats(catsSrc.all_cats_dto());
                
            //}
        //});
        console.log("===========> FINAL REPORT LEN =", _report.length)
        //fs.writeFileSync("./out/MEDIA_REPORT.txt", _report);
        return this;
    }
}
function CatsSrc(CATS_SRC){
    this._keys = [];
    this._current = "";
    this.keys=()=>{return this._keys;}
    this.all_cats_dto=()=>{return CATS_SRC;}
    this.run=()=>{
        if(this._keys.length == 0){
            this._keys = Object.keys(CATS_SRC);
        }
        return this;
    }
    this.current_id=()=>{
        return this._current;
    }
    this.generator= function*(){
        for(let i=0; i<this._keys.length; i++){
            yield this._current = this._keys[i];
        }
        return true;
    }
}
function CatsDst(CATS_DST){
    this.run=()=>{
        return this;
    }
    this.current_id=(id)=>{}
}
//@ function - factory of unique Categories
function CatTypes(catTypeRecognize){
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
    this.type_by_cat_dto=(cat_dto)=>{
        return catTypeRecognize.instance().run(cat_dto).type();
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
function OneCatBypass(catTypeRecognize, catChinaBypass, ifMediaCat, id){
    const _id = id || 1;
    let _report = "";
    this.instance=()=>{
        return new OneCatBypass(catTypeRecognize, catChinaBypass, ifMediaCat, _id+1);
    }
    this.report=()=>{return _report}
    //@ param {CatTypes} catTypes - catTypes.types() = {"lvl_0": CatL0, "lvl_1_transit": CatTransit, "modal": CatModal, "modal_media": CatModalMedia }
    //@ param {String} src_cat_id - one category id of src project, e.g. "tr_tunnels__modal_category__100"
    this.run=(CATS_SRC, CATS_DST, catTypes, src_cat_id)=>{
        // catTypes contains method 'type_by_cat_dto'
        _report += ifMediaCat.instance().run(CATS_SRC, CATS_DST, catTypes, src_cat_id).report();
        _report += catChinaBypass.instance().run(CATS_SRC, CATS_DST, catTypes, src_cat_id).report();
        return this;
    }
}
function IfMediaCat(catTypeRecognize, mediaCatBypass){
    const MODAL_MEDIA_TYPE = "modal_media";
    let _report = "";
    this.report=()=>{return _report;}
    this.instance=()=>{return new IfMediaCat(catTypeRecognize, mediaCatBypass)}
    this.run=(cat_types, CATS_SRC, src_cat_key, CATS_DST)=>{
        const cat_type = catTypeRecognize.instance().run(CATS_SRC[src_cat_key]).type();
        //_current_category = catChinaBypass.run(CATS_SRC, src_cat_key, CATS_DST);
        if(cat_type == MODAL_MEDIA_TYPE){
            console.log("IfMediaCat: media category:", src_cat_key);
            _report = mediaCatBypass.instance().run(CATS_SRC, src_cat_key, CATS_DST).report();
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
function MediaCatBypass(options, bothProjectdataMediaIds, MEDIADATA_SRC, MEDIADATA_DST){
    this.bothProjectdataMediaIds = bothProjectdataMediaIds;
    const _order = options.order || 1;
    let _report = "";
    this.report=()=>{return _report;}
    this.run=(CATS_SRC, src_cat_key, CATS_DST)=>{
        _report = this.bothProjectdataMediaIds.instance().run(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST).report();
        return this;
    }
    this.instance=()=>{
        return new MediaCatBypass({order:_order+1}, bothProjectdataMediaIds, MEDIADATA_SRC, MEDIADATA_DST);
    }
}
//@ Функция достаёт массивы Media_data для одной Категории из файлов Project_data Целевого проекта и проекта-источника. Также функция работает как посредник, получив ID, найденные в файла Media.js передаёт их объектам "на пересечение" и " на остаток лишних"
//@ param {FinalRevealExtraMediaIds} finalRevealExtraMediaIds - это объект-обертка над итерацией по всем Медиа-ID одной категории, который, в итоге вычислит лишние ID, которых нет в проекте-источнике, но есть в целевом проекте.
//@ param {DstProjMedArrayShadow} dstProjMedArrayShadow - объект хранит копию массива Медиа-id одной категории целевого проекта и он удалет из своего массива элементы по мере того, как итерация по всем ID находит совпадения.
function BothProjectdataMediaIds(finalRevealExtraMediaIds, dstProjMedArrayShadow){
    let _report = "";
    this.src_proj_ids = [];
    this.dst_proj_ids = [];
    this.dst_proj_shadow = [];
    this.finalRevealExtraMediaIds = finalRevealExtraMediaIds;
    this.dstProjMedArrayShadow = dstProjMedArrayShadow;
    this.report=()=>{return _report;}
    this.instance=()=>{
        return new BothProjectdataMediaIds(this.finalRevealExtraMediaIds, this.dstProjMedArrayShadow);
    }
    this.run=(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST)=>{
        this.src_proj_ids = _get_src_media_ids(CATS_SRC, src_cat_key);
        console.log("BothProjectdataMediaIds: this.src_proj_ids=",this.src_proj_ids);
        this.dst_proj_ids = _get_dst_media_ids(CATS_DST, src_cat_key);
        const dst_proj_media_ids_shadow = JSON.parse(JSON.stringify(this.dst_proj_ids));
        //@ в рамках одного массива Media-id
        this.dstProjMedArrayShadow = this.dstProjMedArrayShadow.instance().run(dst_proj_media_ids_shadow, MEDIADATA_DST, src_cat_key);
        _report = this.finalRevealExtraMediaIds.instance().run(this.src_proj_ids, this.dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, this.dstProjMedArrayShadow, src_cat_key, CATS_DST).report();      
        return this;
    }
    //@ find and delete from dst_proj_shadow array value of id
    const _clear_dst_proj_shadow=function(dst_proj_shadow, id){
        const index_id = dst_proj_shadow.indexOf(id);
        if(index_id > -1){
            dst_proj_shadow.splice(index_id, 1);
        }
        
    }
    const _get_src_media_ids=function(CATS_SRC, src_cat_key){
        let media_data = [];
        try{
            media_data = CATS_SRC[src_cat_key].modal_w_data.media_data;
        }catch(er){
            console.error("ERROR: BothProjectdataMediaIds: expected src category with media_data")
        }
        return media_data;
    }
    const _get_dst_media_ids=function(CATS_DST, src_cat_key){
        let media_data = [];
        try{
            media_data = CATS_DST[src_cat_key].modal_w_data.media_data;
        }catch(er){
            console.error("REPORT: BothProjectdataMediaIds: No media_data in dst category")
        }
        return media_data;
    }
}
function FinalRevealExtraMediaIds(srcProjMedIdArrayIteration){
    this.srcProjMedIdArrayIteration = srcProjMedIdArrayIteration;
    let _report = "";
    this.report=()=>{return _report;}
    this.instance=()=>{return new FinalRevealExtraMediaIds(this.srcProjMedIdArrayIteration)}
    this.run=(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST)=>{
        const srcProjMedArrayIteration = this.srcProjMedIdArrayIteration.instance().run(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST);
        //@ Кончились итерации
        _report += srcProjMedArrayIteration.report();
        _report += dstProjMedArrayShadow.extra_report();
        return this;
    }
}
function SrcProjMedIdArrayIteration(ifProjArrayIntersectMedfileIds){
    this.ifProjArrayIntersectMedfileIds = ifProjArrayIntersectMedfileIds;
    let _report = "";
    this.report=()=>{return _report;}
    this.instance=()=>{return new SrcProjMedIdArrayIteration(this.ifProjArrayIntersectMedfileIds)}
    this.run=(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST)=>{
        this.ifProjArrayIntersectMedfileIds = this.ifProjArrayIntersectMedfileIds.instance()
        
        if(src_proj_ids.length > 0){
            src_proj_ids.forEach(src_one_media_id=>{
                this.ifProjArrayIntersectMedfileIds.run(
                    src_one_media_id, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST
                );
            });
            _report += this.ifProjArrayIntersectMedfileIds.report();
        } else {
            _report += "ERROR:No media_data in src category:" + src_cat_key + os.EOL;
        }
        return this;
    }
}
function DstProjMedArrayShadow(){
    this._report = "";
    this.dst_proj_media_ids_shadow = undefined;
    this.MEDIADATA_DST = undefined; //run
    this.src_cat_key = undefined; //run
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    this.report=()=>{return this._report;}
    this.instance=()=>{return new DstProjMedArrayShadow();}
    this.run=(dst_proj_media_ids_shadow, MEDIADATA_DST, src_cat_key)=>{
        this.dst_proj_media_ids_shadow = dst_proj_media_ids_shadow;
        this.MEDIADATA_DST = MEDIADATA_DST;
        this.src_cat_key = src_cat_key;
        this.MEDIADATA_DST_FLAT_IDS = MEDIADATA_DST.map(arr=>arr[_ID_INDEX]);
        this.MEDIADATA_DST_FLAT_LINKS = MEDIADATA_DST.map(arr=>arr[_LINK_INDEX]);
        return this;
    }
    this.extra_report=()=>{
        //console.log("DstProjMedArrayShadow: dst_proj_media_ids_shadow=", this.dst_proj_media_ids_shadow)
        const links = this.dst_proj_media_ids_shadow.map(id=>{
            //console.log("shadow id=", id)
            const id_index = this.MEDIADATA_DST_FLAT_IDS.indexOf(id);
            //console.log("shadow id_index=", id_index)
            if(id_index > -1) 
                return this.MEDIADATA_DST_FLAT_LINKS[id_index]
        })
        if(links.length>0){
            this._report += this.src_cat_key + "-->" + links + "-->" + this.dst_proj_media_ids_shadow + "-->Excess links" + os.EOL;    
        }
        return this._report;
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
            this._report += "ERROR: DstProjMedArrayShadow.del(): dst_proj_media_ids_shadow is NOT an Array!" + os.EOL;
        }
        console.log("DstProjMedArrayShadow.del(): after:",this.dst_proj_media_ids_shadow);
    }
}
function IfProjArrayIntersectMedfileIds(dstMedfileIdsByLink){
    this.dstMedfileIdsByLink = dstMedfileIdsByLink;
    this.dstProjMedArrayShadow = undefined;
    let _dst_projectfile_media_ids =[];
    let _report = "";
    let _link = "";
    this.link=()=>{return _link;}
    this.report=()=>{return _report;}
    this.instance=()=>{return new IfProjArrayIntersectMedfileIds(this.dstMedfileIdsByLink)}
    //@ Надо сравнить DST Projectfile media_array of some category И найденные в DST Mediafile айдишники по Link
    this.intersected=(dst_media_finded_ids)=>{
        //@ intersection - always array, empty or not
        let intersection = dst_media_finded_ids.filter(x => _dst_projectfile_media_ids.includes(x));
        if(intersection.length>0){return true}
        else{return false;}
    }
    this.run=(src_one_media_id, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST)=>{
        _dst_projectfile_media_ids = dst_proj_ids;
        this.dstProjMedArrayShadow = dstProjMedArrayShadow;
        const dstMedfileIds = this.dstMedfileIdsByLink.instance().run(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id);
        _link = dstMedfileIds.link();
        const _dst_medfile_ids = dstMedfileIds.ids();
        if(this.intersected(_dst_medfile_ids)){
            //@ it's good scenario. Это значит, что в целевом проекте, в рассматриваемой категории есть соответствующая ссылка, как и в проекте-источнике
            // TODO: Отключили оповещение о хороших совпдаающих ссылках
            // const msg = "GOOD: Link "+this.link() + " has ID: " + src_one_media_id + " in SRC Project and ID: " + _dst_medfile_ids + " in DST Project" + os.EOL;
            // _report += msg;
            // console.log(msg);
            console.log("IfProjArrayIntersectMedfileIds.run(): intersected!");
            this.dstProjMedArrayShadow.del(_dst_medfile_ids);
        }else{
            _report += src_cat_key + "-->" + this.link() + "->NO in dst" + os.EOL;
        }
        return this;
    }
}
function DstMedfileIdsByLink(srcMediafileLinkById){
    let _report = "";
    let _link = "";
    this.src_one_media_id = undefined;
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    let _matched_ids = [];
    this.link=()=>{return _link;}
    this.report=()=>{return _report;}
    this.instance=()=>{
        return new DstMedfileIdsByLink(srcMediafileLinkById);
    }
    this.ids=()=>{return _matched_ids;}
    this.run=(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id)=>{
        this.src_one_media_id = src_one_media_id;
        const srcMediafileLink = srcMediafileLinkById.instance().run(MEDIADATA_SRC, this.src_one_media_id);
        _link = srcMediafileLink.link();
        _matched_ids = _get_matched_ids(srcMediafileLink, MEDIADATA_DST);
        //console.log("DstMedfileIdsByLink: _matched_ids=",_matched_ids)
        return this;
    }
    const _get_matched_ids=function(srcMediafileLink, MEDIADATA_DST){
        if(srcMediafileLink.link()){
            const _link = srcMediafileLink.link();
            //@ ищем в Целевом файле Media_data Элементы, у которых есть такая ССылка, как _link
            for(let i=0; i<MEDIADATA_DST.length; i++){
                if(MEDIADATA_DST[i][_LINK_INDEX] == _link){
                    _matched_ids.push(MEDIADATA_DST[i][_ID_INDEX])
                }
            }
            //console.log("DstMedfileIdsByLink.run(): matched_ids=",_matched_ids)
            //TODO
        }else{
            console.error("ERROR: DstMedfileIdsByLink.run(): cant find link by Id "+this.src_one_media_id)
            _report += "ERROR: DstMedfileIdsByLink.run(): cant find link by Id "+this.src_one_media_id + os.EOL;
        }
        return _matched_ids;
    }
}
function SrcMediafileLinkById(){
    let _report = "";
    let _link = undefined;
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    this.report=()=>{return _report;}
    this.link=()=>{return _link;}
    this.instance=()=>{return new SrcMediafileLinkById();}
    //@ param {Number}  src_one_media_id - e.g. 520
    this.run=(MEDIADATA_SRC, src_one_media_id)=>{
        for(let i=0; i<MEDIADATA_SRC.length; i++){
            if(MEDIADATA_SRC[i][_ID_INDEX] == src_one_media_id){
                _link = MEDIADATA_SRC[i][_LINK_INDEX];
                break;
            }
        }
        return this;
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