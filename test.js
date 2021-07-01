main();
function main(){
    new App().run();
}
function App(){
    this.run=(file)=>{
        const CATS_SRC = require("./project_data_abbfb.js").categories;
        const CATS_DST = require("./project_data_smart_v2.js").categories;
        const MEDIADATA_SRC = require("./media_data_abbfb.js");
        const MEDIADATA_DST = require("./media_data_smart.js");
        return new CategoriesDirectPass(
            new CatStorage(),
            new CatTypes()
                .with(new CatL0(), "lvl_0")
                .with(new CatTransit(), "lvl_1_transit")
                .with(new CatModal(), "modal")
                .with(new CatModalMedia({constr_fields:false}), "modal_media"),
            new OneCatBypass(            
                new IfMediaCat(
                    new CatChinaBypass(
                        new CatTypeRecognize(),
                        new ChinaDiffs()                        
                    ),
                    new MediaCatBypass(
                        {order:1},
                        new BothProjectdataMediaIds( // get and control all media ids of some category
                            new FinalRevealExtraElements( // in the end of iteration through  media ids array of one cat of Src project
                                new SrcProjMedIdArrayIteration( // process one media id of all media ids of some category
                                    IfProjArrayIntersectMedfileIds( // проверка, пересекается ли множество найденных ссылок в dst_mediadata с множеством media_ids целевой "прожект_дата"
                                        new DstMedfileIdsByLink( // Получение множества идентификаторов Медиа_ids из целевого файла media_data
                                            new SrcMediafileLinkById() // Получение ссылки по ID файла-источника media_data
                                        )
                                    )
                                )
                            ),
                            new DstProjMedArrayShadow() 
                        ),
                        MEDIADATA_SRC,
                        MEDIADATA_DST
                    ),
                )
            )
        ).run(CATS_SRC, CATS_DST);
    }
}

function CategoriesDirectPass(catStorage, catTypes, oneCatBypass){
    let _report = "";
    this.run=(CATS_SRC, CATS_DST)=>{
        const cat_types = catTypes.run().types();
        Object.keys(CATS_SRC).forEach(src_cat_key=>{
            if(src_cat_key != "home"){
                catStorage[src_cat_key] = oneCatBypass.instance().run(cat_types, CATS_SRC, src_cat_key, CATS_DST);
            }
        });
        return catStorage;
    }
}
function OneCatBypass(ifMediaCat){
    let _report = "";
    //@ param {Object<hashtable>} cat_types, like {"lvl_0": CatL0, "lvl_1_transit": CatTransit, "modal": CatModal, "modal_media": CatModalMedia }
    this.instance=()=>{
        return new OneCatBypass(ifMediaCat);
    }
    this.run=(cat_types, CATS_SRC, src_cat_key, CATS_DST)=>{
        _report = ifMediaCat.run(cat_types, CATS_SRC, src_cat_key, CATS_DST).report();
        return this;
    }
    this.report=()=>{return _report}
}
function CatTree(сatFactory){
    this.сatFactory = сatFactory;
    this.tree = {};
    this.category_list = [];
    this.curCategory = undefined;
    this.run=(file)=>{
        const home_cat = this.try_get_home_cat(file);
        if(home_cat){
            console.log("typeof home_cat=",typeof home_cat)
            console.log("isArray=",Array.isArray(home_cat))
            home_cat.buttons.forEach(btn=>{
                const BTN_ID = btn[0];
                //console.log(btn[0]);
                //@ create new Category
                this.curCategory = this.сatFactory.cat(BTN_ID);
                //@ Add new category to category list
                this.category_list.push(this.curCategory);
            });
            return this.make_result();
        }
    }
    this.make_result=()=>{
        const res = {};
        res.category_list = this.category_list;
        res.time = new Date().getTime();
        return JSON.stringify(res);
    }
    this.try_get_home_cat=(file)=>{
        try{
            return file.categories.home;
        }catch(er){
            console.error("CatTree.try_get_home_cat():", er);
        }
    }
}
function IfMediaCat(catChinaBypass, mediaCatBypass){
    let _current_category = undefined;
    let _report = "";
    this.run=(cat_types, CATS_SRC, src_cat_key, CATS_DST)=>{
        _current_category = catChinaBypass.run(CATS_SRC, src_cat_key, CATS_DST);
        if(_current_category.mediable()){
            _report += mediaCatBypass.instance().run(CATS_SRC, src_cat_key, CATS_DST).report();
        }
    }
    this.report=()=>{
        return _report;
    }
}
//@ param {Object} bothProjectdataMediaIds - contain two arrays e.g.: {src: [310, 500, 201], dst: [467, 708]}
function MediaCatBypass(options, bothProjectdataMediaIds, MEDIADATA_SRC, MEDIADATA_DST){
    const _order = options.order || 1;
    let _report = "";
    this.run=(CATS_SRC, src_cat_key, CATS_DST)=>{
        _report = bothProjectdataMediaIds.instance().run(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST).report();
        return this;
    }
    this.report=()=>{
        return _report;
    }
    this.instance=()=>{
        return new MediaCatBypass({order:_order+1});
    }
}
//@ Функция достаёт массивы Media_data для одной Категории из файлов Project_data Целевого проекта и проекта-источника. Также функция работает как посредник, получив ID, найденные в файла Media.js передаёт их объектам "на пересечение" и " на остаток лишних"
//@ param {FinalRevealExtraElements} finalRevealExtraElements - это объект-обертка над итерацией по всем Медиа-ID одной категории, который, в итоге вычислит лишние ID, которых нет в проекте-источнике, но есть в целевом проекте.
//@ param {DstProjMedArrayShadow} dstProjMedArrayShadow - объект хранит копию массива Медиа-id одной категории целевого проекта и он удалет из своего массива элементы по мере того, как итерация по всем ID находит совпадения.
function BothProjectdataMediaIds(finalRevealExtraElements, dstProjMedArrayShadow){
    let _report = "";
    this.src_proj = [];
    this.dst_proj = [];
    this.dst_proj_shadow = [];
    this.finalRevealExtraElements = finalRevealExtraElements;
    this.dstProjMedArrayShadow = dstProjMedArrayShadow;
    this.report=()=>{return _report;}
    this.instance=()=>{
        return new BothProjectdataMediaIds(finalRevealExtraElements, dstProjMedArrayShadow);
    }
    this.run=(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST)=>{
        this.src_proj = _get_src_media_ids(CATS_SRC, src_cat_key);
        this.dst_proj = _get_dst_media_ids(CATS_DST, src_cat_key);
        const dst_proj_media_ids_shadow = JSON.parse(JSON.stringify(this.dst_proj));
        this.dstProjMedArrayShadow = this.dstProjMedArrayShadow.instance().run(dst_proj_media_ids_shadow);
        if(this.src_proj.length > 0){
            this.src_proj.forEach(one_src_media_id=>{
                const srcProjectdataMediaId = srcProjectdataMediaIdProcessing.instance().dop(
                    one_src_media_id, 
                    src_cat_key, 
                    this.dstPojectfileMediaIdsSetEntering
                ).run(MEDIADATA_SRC, MEDIADATA_DST);
                _report += srcProjectdataMediaId.report();
                if(this.dstPojectfileMediaIdsSetEntering.intersected(srcProjectdataMediaId.finded_ids())){
                    _clear_dst_proj_shadow(this.dst_proj_shadow, srcProjectdataMediaId.finded_ids());
                    //@ it's good scenario. Это значит, что в целевом проекте, в рассматриваемой категории есть соответствующая ссылка, как и в проекте-источнике
                    _report += "GOOD: Link "+srcProjectdataMediaId.link() + " has ID: " + one_src_media_id + " in SRC Project and ID: " + srcProjectdataMediaId.id() + " in DST Project" + os.EOL;
                }else{
                    _report += "No Link " + srcProjectdataMediaId.link() + " in dst project at category:" + src_cat_key + os.EOL;
                }
            })
        } else {
            _report += "ERROR:No media_data in src category:" + src_cat_key + os.EOL;
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
function DstPojectfileMediaIdsSetEntering(){
    let _report = "";
    let _dst_projectfile_media_ids = undefined;
    this.instance=()=>{
        return new DstPojectfileMediaIdsSetEntering();
    }
    //@ param {String} src_cat_key - e.g. "sugar_beet__safety__modal_catedory__3__0"
    this.run=(dst_proj_media_ids)=>{
        _dst_projectfile_media_ids = dst_proj_media_ids;
        //@ array, e.g. [510, 245]
        return this;
    }
    this.intersected=(dst_media_finded_ids)=>{
        //@ intersection - always array, empty or not
        let intersection = dst_media_finded_ids.filter(x => _dst_projectfile_media_ids.includes(x));
        if(intersection.length>0){return true}
        else{return false;}
    }
    this.report=()=>{
        return _report;
    }
}
function SrcProjectdataMediaIdProcessing(dstMedfileIdsByLink){
    let _report = "";
    this.src_one_media_id = undefined; // 524
    this.src_cat_key = undefined; // "sugar_beet__safety"
    let _finded_ids = [];
    //@ ссылка на объект, который содержит массив медиа айдишников из целевого проекта project_data для одной категории
    this.dstPojectfileMediaIdsSetEntering = undefined; //@ dop
    this.report=()=>{
        return _report;
    }
    this.instance=()=>{
        return new SrcProjectdataMediaIdProcessing(dstMedfileIdsByLink);
    }
    this.dop=(src_one_media_id, src_cat_key, dstPojectfileMediaIdsSetEntering)=>{
        this.src_one_media_id = src_one_media_id;
        this.src_cat_key = src_cat_key;
        this.dstPojectfileMediaIdsSetEntering = dstPojectfileMediaIdsSetEntering;
        return this;
    }
    this.finded_ids=()=>{
        return _finded_ids;
    }
    this.run=(MEDIADATA_SRC, MEDIADATA_DST)=>{
        const dstMediafileIds = dstMedfileIdsByLink.instance().run(MEDIADATA_SRC, MEDIADATA_DST, this.src_one_media_id);
        _report = dstMediafileIds.report();
        //@ expecting that dstMediafileIds.ids() = [203] || [203, 207] || []
        _finded_ids = dstMediafileIds.ids();
        return this;
    }
}
function IfProjArrayIntersectMedfileIds(dstMedfileIdsByLink){
    this.dstMedfileIdsByLink = dstMedfileIdsByLink;
    this.dstProjMedArrayShadow = undefined;
    let _report = "";
    this.report=()=>{return _report;}
    this.instance=()=>{}
    this.dop=(dstProjMedArrayShadow)=>{
        this.dstProjMedArrayShadow = dstProjMedArrayShadow;
    }
    this.intersected=(dst_media_finded_ids)=>{
        //@ intersection - always array, empty or not
        let intersection = dst_media_finded_ids.filter(x => _dst_projectfile_media_ids.includes(x));
        if(intersection.length>0){return true}
        else{return false;}
    }
    this.run=(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id)=>{
        const _dst_medfile_ids = dstMedfileIdsByLink.instance().run(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id).ids();
    }
}
function DstMedfileIdsByLink(srcMediafileLinkById){
    let _report = "";
    this.src_one_media_id = undefined;
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    const _matched_ids = [];
    this.report=()=>{return _report;}
    this.instance=()=>{
        return new DstMedfileIdsByLink(srcMediafileLinkById);
    }
    this.ids=()=>{return _matched_ids;}
    this.run=(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id)=>{
        this.src_one_media_id = src_one_media_id;
        const srcMediafileLink = srcMediafileLinkById.instance().run(MEDIADATA_SRC, this.src_one_media_id);
        _matched_ids = _get_matched_ids(srcMediafileLink, MEDIADATA_DST);
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
            console.log("DstMedfileIdsByLink.run(): matched_ids=",_matched_ids)
            //TODO
        }else{
            console.error("ERROR: DstMedfileIdsByLink.run(): cant find link by Id "+this.src_one_media_id)
            _report += "ERROR: DstMedfileIdsByLink.run(): cant find link by Id "+this.src_one_media_id + os.EOL;
        }
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
function DstPojectfileMediaIdsShadow(srcProjectdataMediaIdProcessing){}
function CatChinaBypass(catTypeRecognize){
    const _tree = {};
    const _cat_types = {};
    //this.catFactory = catFactory;
    this.run=(CATS_SRC, src_cat_key, CATS_DST)=>{
        //@ cat_type - string with category type: "lvl_0" || "lvl_1_transit" || "modal" || "modal_media"
        const cat_type = catTypeRecognize.instance().run(CATS_SRC[src_cat_key]).type();
        const typedCat = _cat_types[cat_type];
        _tree[src_cat_key] = typedCat.instance().run(  
            src_cat_key,
            CATS_SRC[src_cat_key],
            CATS_DST
        ).cat();
        return this;
    }
    //@ param {Category} category - Объект категории содержащий некоторые состояния для одной категории
    //@ param {String} cat_type - условное разделение категорий по типам lvl_0, lvl_1_transit, modal, modal_media 
    this.with=(category, cat_type)=>{
        _cat_types[cat_type] = category;
    }
    this.tree=()=>{
        return _tree;
    }
}
function CatTypeRecognize(){
    let _type = "";
    //this.catFactory = catFactory;
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
    //@ method-builder returns {String} -type of category
    this.type=()=>{
        return _type;
    }
    this.instance=()=>{
        return new CatTypeRecognize();
    }
}
//@ function - factory of unique Categories
function CatTypes(catTypeRecognize, catStorage){
    this.catTypeRecognize = catTypeRecognize;
    this.catStorage = catStorage;
    const _types_collection = {};
    let _current_type = undefined;
    this.catTypeRecognize = catTypeRecognize;
    this.uniq_names_stor = {};
    this.with=(catType, cat_type_key)=>{
        _types_collection[cat_type_key] = catType;
        return this;
    }
    //@ param {String} src_cat_id - category name e.g. "sugar_beet__safety"
    //@ param {Object} src_cat_dto - src category object {placeholder, width, buttons}
    //@ param {Object} dst_all_cats_dto - all smart structure object
    this.run=(src_cat_id, src_cat_dto, dst_all_cats_dto)=>{
        this.catStorage.save(
            src_cat_key, 
            _types_collection[catTypeRecognize.instance(src_cat_dto).run().type()].instance(src_cat_id)
        )
        return this;
    }
    this.type=()=>{
        return _current_type;
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
function Category(uniq_name){
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
function CatTypeSelect(cat_dto){
    
}