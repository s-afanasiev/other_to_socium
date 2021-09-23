//@ Претендует быть лучше чем test_all.js
const { report } = require('process');
main();
function main(){
    new App().run();
}
function App(){
    this.run=(file)=>{
        //const CATS_SRC = require("../project_data_datacenter.js").categories;
        const CATS_SRC = require("../project_data_fb.js").categories;
        //console.log("App.run() CATS_SRC=",CATS_SRC);
        const CATS_DST = require("../project_data_smart.js").categories;
        const LANGUAGE = "zh";
        return new AllCatsIteration(
            new CatStorage("src", CATS_SRC),            
            new CatStorage("dst", CATS_DST),
            new Report(),            
            new OneCatBypass(  
                new IfSameDstCatExists(//Есть ли в целевом проекте такая категория?
                    new CatsComparing(
                        new OneCat("src"),
                        new OneCat("dst"),
                        new CatType()
                            .with(new CatL0(), "lvl_0")
                            .with(new CatTransit(), "lvl_1_transit")
                            .with(new CatModal(), "modal")
                            .with(new CatModalMedia({constr_fields:false}), "modal_media"),
                        new TextComparing(),
                        new IfMediaCat(
                            new MediaComparing(
                                new ProjectdataMediaIds("src"),
                                new ProjectdataMediaIds("dst"),
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
                            )
                        )
                    )
                )
            )
        ).run();
    }
}

function AllCatsIteration(catStorageSrc, catStorageDst, report, oneCatBypass){
    this.cats_counter = 0;
    this.run=()=>{
        take_next_cat(catStorageSrc.run(), catStorageDst.run(), report, oneCatBypass)
        return this;
    }
    const take_next_cat=(catStorSrc, catStorDst, report, oneCatBypass)=>{
        if(catStorSrc.has_next()){
            this.cats_counter++;
            oneCatBypass.instance(cat_name).run(catStorSrc, catStorDst).report(report);
            take_next_cat(catStorSrc, catStorDst, report, oneCatBypass);
        }else{
            console.log("AllCatsIteration: saving result, categories count:", this.cats_counter);
            report.save("../out/out_test_text_content.txt");
        }
    }
}
//@param {String} src_or_dst = "src" || "dst"
//@param {Object} CATS_SRC = js-object from file e.g. 'project_data_fb.js'
function CatStorage(src_or_dst, CATS_SRC){
    this._id = src_or_dst;
    this.keys = [];
    this.current_cat_name = "";
    this.cat_name=()=>{return this.current_cat_name}
    this.current_cat_dto = {};
    this.cat_dto=()=>{return this.current_cat_dto}
    this.pointer = 0;
    this.run=()=>{
        if(typeof CATS_SRC == 'object'){
            this.keys = Object.keys(CATS_SRC);
        }
        return this;
    }
    this.has_next=()=>{
        if(this.keys.length == 0){return false}
        else if(this.pointer >= this.keys.length){return false}
        else if(this.pointer++ < this.keys.length){
            this.current_cat_name = this.keys[this.pointer];
            this.current_cat_dto = CATS_SRC[this.current_cat_name];
            return true;
        }
    }
}
//@param {Object} ifSameDstCatExists - проверяет существует ли категориявцелевом проекте. Если нет - вернёт соотв. отчёт
//@param {String} cat_name - по сути уникальный идентификатор, т.к. на каждую категорию свой объект
function Report(){
    let fs = undefined;
    let os = undefined;
    this.report = "";
    this.init=()=>{
        fs = require('fs');
        os = require('os');
        this.report = "report:" + os.EOL;
        return this;
    }
    this.add=()=>{}
    this.save=(savepath)=>{
        this.fs.writeFileSync(savepath || "out_test_text_content.txt", this.report)
    }
}
function OneCatBypass(ifSameDstCatExists, cat_name){
    this._report = "";
    this._id = cat_name;
    this.id = ()=>{return this._id;}
    this.instance=(cat_name)=>{return new OneIterReport(ifSameDstCatExists, cat_name)}
    //@param {Object} catStorSrc - имеет API: методы has_next(), cat_name(), cat_dto()
    this.run=(catStorSrc, catStorDst)=>{
        this._report = ifSameDstCatExists.instance(cat_name).run(catStorSrc, catStorDst).report();
        return this;
    }
    this.report=()=>{return this._report;}
}
function IfSameDstCatExists(catsComparing, cat_name){
    this._report = "";
    this.report=()=>{return this._report;}
    this._id = cat_name;
    this.id = ()=>{return this._id}
    this.instance=(cat_name)=>{return new IfSameDstCatExists(catsComparing, cat_name)}
    this.run=(catStorSrc, catStorDst)=>{
        if(_catStorDst[cat_name]){
            this._report = catsComparing.instance(cat_name).run(catStorSrc, catStorDst).report();
        }else{
            this._report = "No Such category: '"+cat_name+"' in Dst Project";
        }
        return this;
    }
}
function CatsComparing(oneCatSrc, oneCatDst, catType, textComparing, ifMediaCat, cat_name){
    this._report = "";
    this.report=()=>{return this._report;}
    this._id = cat_name;
    this.id = ()=>{return this._id}
    let _catStorSrc = undefined;//run
    let _catStorDst = undefined;//run
    this.instance=(cat_name)=>{return new CatsComparing(oneCatSrc, oneCatDst, catType, textComparing, ifMediaCat, cat_name)}
    this.run=(catStorSrc, catStorDst)=>{
        _catStorSrc = catStorSrc;
        _catStorDst = catStorDst;
        const catSrc = oneCatSrc.instance(cat_name).run(catStorSrc);
        const catDst = oneCatDst.instance(cat_name).run(catStorDst);
        const _catType = catType.instance(cat_name).run(catStorSrc, catStorDst);
        //@ Доп проверка, скорее всего лишняя, на случай, если вдруг в источнике и целевом проекте различает тип категории с одинаковым именем
        if(_catType.is_same_type_in_src_and_dst()){
            
        }else{
            this._report = "an almost impossible situation: category with name: '"+cat_name+"' has different types in Src and Dst Projects";
        }
    }
    this.exists=()=>{
        if(_catStorSrc[cat_name]){return true;}
        else{return false;}
    }
}
function OneCatBypass(ifMediaCat, id){
    const _id = id || 1;
    let _report = "";
    //@ param {Object<hashtable>} cat_types, like {"lvl_0": CatL0, "lvl_1_transit": CatTransit, "modal": CatModal, "modal_media": CatModalMedia }
    this.instance=()=>{
        return new OneCatBypass(ifMediaCat, _id+1);
    }
    this.report=()=>{return _report}
    this.run=(cat_types, CATS_SRC, src_cat_key, CATS_DST)=>{
        _report = ifMediaCat.instance().run(cat_types, CATS_SRC, src_cat_key, CATS_DST).report();
        // if(_id == 2){
        //     fs.writeFileSync("Media_Report__id_2.txt", _report);
        // }
        return this;
    }
}
function IfMediaCat(options, catTypeRecognize, mediaCatBypass){
    const MODAL_MEDIA_TYPE = "modal_media";
    let _report = "";
    this.report=()=>{return _report;}
    this.instance=()=>{return new IfMediaCat(options, catTypeRecognize, mediaCatBypass)}
    this.run=(cat_types, CATS_SRC, src_cat_key, CATS_DST)=>{
        const cat_type = catTypeRecognize.instance().run(CATS_SRC[src_cat_key]).type();
        //_current_category = catChinaBypass.run(CATS_SRC, src_cat_key, CATS_DST);
        if(cat_type == MODAL_MEDIA_TYPE){
            console.log("IfMediaCat: media category:", src_cat_key);
            _report = mediaCatBypass.instance(options).run(CATS_SRC, src_cat_key, CATS_DST).report();
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
function BothProjectdataMediaIds(options, finalRevealExtraMediaIds, dstProjMedArrayShadow){
    let _report = "";
    this.src_proj_ids = [];
    this.dst_proj_ids = [];
    this.dst_proj_shadow = [];
    this.finalRevealExtraMediaIds = finalRevealExtraMediaIds;
    this.dstProjMedArrayShadow = dstProjMedArrayShadow;
    this.report=()=>{return _report;}
    this.instance=()=>{
        return new BothProjectdataMediaIds(options, this.finalRevealExtraMediaIds, this.dstProjMedArrayShadow);
    }
    this.run=(CATS_SRC, src_cat_key, CATS_DST, MEDIADATA_SRC, MEDIADATA_DST)=>{
        this.src_proj_ids = _get_src_media_ids(CATS_SRC, src_cat_key, options, MEDIADATA_SRC);
        console.log("BothProjectdataMediaIds: this.src_proj_ids=",this.src_proj_ids);
        this.dst_proj_ids = _get_dst_media_ids(CATS_DST, src_cat_key, options, MEDIADATA_DST);
        const dst_proj_media_ids_shadow = JSON.parse(JSON.stringify(this.dst_proj_ids));
        if(this.src_proj_ids.length == 0){
            console.log("BothProjectdataMediaIds.run(): категория с медиа ссылками, но китайских нет")
            if(options && options.only_china){
                //@ Это нормально! Т.е. категория хоть и была типа "Media" (имела массив айдишников), но китайских не было
            }else{
                //@ Такое не должно произойти
                console.log("BothProjectdataMediaIds.run(): Такое не должно произойти")
            }
        }else{
            //@ в рамках одного массива Media-id
            this.dstProjMedArrayShadow = this.dstProjMedArrayShadow.instance().run(dst_proj_media_ids_shadow, MEDIADATA_DST, src_cat_key);
            _report = this.finalRevealExtraMediaIds.instance().run(this.src_proj_ids, this.dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, this.dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC).report();      
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
        let media_data = [];
        const _ID_INDEX = 7;
        const _LINK_INDEX = 5;
        const _LANGS_INDEX = 10;
        const _CHINA_LANG_INDEX = 4;
        const _ALL_LANG_INDEX = 12;
        try{
            media_data = CATS_SRC[src_cat_key].modal_w_data.media_data;
        }catch(er){
            console.error("ERROR: BothProjectdataMediaIds: expected src category with media_data")
        }
        if(options && options.only_china){
            //@ Если в media_data будет например 3 элемента, то в only_china_ids_from_mediadata элементов должно быть меньше или равно
            const only_china_ids_from_mediadata = [];
            for(let i=0; i<media_data.length; i++){
                for(let j=0; j<MEDIADATA_SRC.length; j++){
                    const cur_id = MEDIADATA_SRC[j][_ID_INDEX];
                    //@ Нашли тот, который совпадает, теперь ещё надо проверить, входит ли он в Китайский
                    if(media_data.includes(cur_id)){
                        const finding_china_arr = MEDIADATA_SRC[j][_LANGS_INDEX];
                        if(finding_china_arr.includes(_CHINA_LANG_INDEX) || finding_china_arr.includes(_ALL_LANG_INDEX)){
                            only_china_ids_from_mediadata.push(media_data[i]);
                        }
                    }
                }
            }
            media_data = only_china_ids_from_mediadata;
        }
        return media_data;
    }
    const _get_dst_media_ids=function(CATS_DST, src_cat_key, options, MEDIADATA_DST){
        let media_data = [];
        const _ID_INDEX = 7;
        const _LINK_INDEX = 5;
        const _LANGS_INDEX = 10;
        const _CHINA_LANG_INDEX = 4;
        const _ALL_LANG_INDEX = 12;
        try{
            media_data = CATS_DST[src_cat_key].modal_w_data.media_data;
        }catch(er){
            console.error("REPORT: BothProjectdataMediaIds: No media_data in dst category")
        }
        if(options && options.only_china){
            //@ Если в media_data будет например 3 элемента, то в only_china_ids_from_mediadata элементов должно быть меньше или равно
            const only_china_ids_from_mediadata = [];
            for(let i=0; i<media_data.length; i++){
                for(let j=0; j<MEDIADATA_DST.length; j++){
                    const cur_id = MEDIADATA_DST[j][_ID_INDEX];
                    //@ Нашли тот, который совпадает, теперь ещё надо проверить, входит ли он в Китайский
                    if(media_data.includes(cur_id)){
                        const finding_china_arr = MEDIADATA_DST[j][_LANGS_INDEX];
                        if(finding_china_arr.includes(_CHINA_LANG_INDEX) || finding_china_arr.includes(_ALL_LANG_INDEX)){
                            only_china_ids_from_mediadata.push(media_data[i]);
                        }
                    }
                }
            }
            media_data = only_china_ids_from_mediadata;
        }
        return media_data;
    }
}
function FinalRevealExtraMediaIds(srcProjMedIdArrayIteration){
    this.srcProjMedIdArrayIteration = srcProjMedIdArrayIteration;
    let _report = "";
    this.report=()=>{return _report;}
    this.instance=()=>{return new FinalRevealExtraMediaIds(this.srcProjMedIdArrayIteration)}
    this.run=(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC)=>{
        const srcProjMedArrayIteration = this.srcProjMedIdArrayIteration.instance().run(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC);
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
    this.run=(src_proj_ids, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC)=>{
        this.ifProjArrayIntersectMedfileIds = this.ifProjArrayIntersectMedfileIds.instance()
        
        if(src_proj_ids.length > 0){
            src_proj_ids.forEach(src_one_media_id=>{
                this.ifProjArrayIntersectMedfileIds.run(
                    src_one_media_id, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC
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
            //this._report += this.src_cat_key + "-->" + links + "-->" + this.dst_proj_media_ids_shadow + "-->Excess links" + os.EOL;    
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
    let _title = undefined;
    let _langs = undefined;
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
    const make_breadcrumbs=function(cat_id, src_cats_dto){
        let stack = "";
        const fut_reverse = [];
        let parent;
        fut_reverse.push(src_cats_dto[cat_id].category_placeholder);
        try{
            parent = src_cats_dto[cat_id].parent;
        }catch(err){
            console.log("ERROR: make_breadcrumbs(): cat_id=",cat_id, "src_cats_dto[cat_id]=",src_cats_dto[cat_id])
        }
        try{
            fut_reverse.push(src_cats_dto[parent].category_placeholder);
        }catch(err){
            console.log("ERROR: make_breadcrumbs(): src_cats_dto[parent]=",src_cats_dto[parent])
        }
        while(src_cats_dto[parent]){
            parent = src_cats_dto[parent].parent;
            if(src_cats_dto[parent]){
                fut_reverse.push(src_cats_dto[parent].category_placeholder);
            }
        }
        for (let i=fut_reverse.length-1; i>=0; i--){
            stack += fut_reverse[i] + " -> "
        }
        return stack;
    }
    this.run=(src_one_media_id, dst_proj_ids, MEDIADATA_SRC, MEDIADATA_DST, dstProjMedArrayShadow, src_cat_key, CATS_DST, CATS_SRC)=>{
        _dst_projectfile_media_ids = dst_proj_ids;
        this.dstProjMedArrayShadow = dstProjMedArrayShadow;
        const dstMedfileIds = this.dstMedfileIdsByLink.instance().run(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id);
        _link = dstMedfileIds.link();
        _title = dstMedfileIds.title();
        _langs = dstMedfileIds.langs();
        const _dst_medfile_ids = dstMedfileIds.ids();
        //@ Костыль: Если вернулся False, значит тут не надо ничего искать. Это произошло потому что инкапсулированный объект, который искал сслыку по ID, не вернул ссылку, потому что её нет именно в китайском языке.
        console.log("_dst_medfile_ids=",_dst_medfile_ids)
        if(_dst_medfile_ids === false){
            //_report += "do nothing" + os.EOL;
            console.log("huy!")
        }
        else if(this.intersected(_dst_medfile_ids)){
            //@ it's good scenario. Это значит, что в целевом проекте, в рассматриваемой категории есть соответствующая ссылка, как и в проекте-источнике
            // TODO: Отключили оповещение о хороших совпдаающих ссылках
            // const msg = "GOOD: Link "+this.link() + " has ID: " + src_one_media_id + " in SRC Project and ID: " + _dst_medfile_ids + " in DST Project" + os.EOL;
            // _report += msg;
            // console.log(msg);
            console.log("huy2!")
            console.log("IfProjArrayIntersectMedfileIds.run(): intersected!");
            this.dstProjMedArrayShadow.del(_dst_medfile_ids);
        }else{
            console.log("huy3!")
            const report2 = make_breadcrumbs(src_cat_key, CATS_SRC);
            //_report += src_cat_key + "-->" + this.link() + "->NO in dst" + os.EOL;
            _report += report2 + this.link() + " -> " + src_cat_key + " -> NO in dst -> title: " + dstMedfileIds.title() + " -> langs: "+ dstMedfileIds.langs() + os.EOL;
        }
        return this;
    }
}
function DstMedfileIdsByLink(options, srcMediafileLinkById){
    let _report = "";
    let _link = undefined;
    let _title = undefined;
    let _langs = undefined;
    this.src_one_media_id = undefined;
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    const _LANGS_INDEX = 10;
    const _CHINA_LANG_INDEX = 4;
    const _ALL_LANG_INDEX = 12;
    let _matched_ids = [];
    this.link=()=>{return _link;}
    this.title=()=>{return _title;}
    this.langs=()=>{return _langs;}
    this.report=()=>{return _report;}
    this.instance=()=>{
        return new DstMedfileIdsByLink(options, srcMediafileLinkById);
    }
    this.ids=()=>{return _matched_ids;}
    this.run=(MEDIADATA_SRC, MEDIADATA_DST, src_one_media_id)=>{
        this.src_one_media_id = src_one_media_id;
        const srcMediafileLink = srcMediafileLinkById.instance().run(MEDIADATA_SRC, this.src_one_media_id);
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
        if(srcMediafileLink.link()){
            //@ ищем в Целевом файле Media_data Элементы, у которых есть такая ССылка, как _link
            for(let i=0; i<MEDIADATA_DST.length; i++){
                if(MEDIADATA_DST[i][_LINK_INDEX] == srcMediafileLink.link()){
                    if(options && options.only_china){
                        const langs_array = MEDIADATA_DST[i][_LANGS_INDEX];
                        if(langs_array.includes(_CHINA_LANG_INDEX) || langs_array.includes(_ALL_LANG_INDEX)){
                            _matched_ids.push(MEDIADATA_DST[i][_ID_INDEX]);
                        }
                    }
                }
            }
            //console.log("DstMedfileIdsByLink.run(): matched_ids=",_matched_ids)
            //TODO
        }else{
            if(!options.only_china){
                console.error("ERROR: DstMedfileIdsByLink.run(): cant find src link by id "+this.src_one_media_id);
                _report += "ERROR: DstMedfileIdsByLink.run(): cant find src link by id "+this.src_one_media_id + os.EOL;
            }
            //@ Костыль, чтобы различать, по какой причине массив совпадений пустой
            _matched_ids = false;
        }
        return _matched_ids;
    }
}
function SrcMediafileLinkById(options){
    let _report = "";
    let _link = undefined;
    let _title = undefined;
    let _langs = undefined;
    const _ID_INDEX = 7;
    const _LINK_INDEX = 5;
    const _TITLE_INDEX = 2;
    const _LANGS_INDEX = 10;
    const _CHINA_LANG_INDEX = 4;
    const _ALL_LANG_INDEX = 12;
    this.report=()=>{return _report;}
    this.link=()=>{return _link;}
    this.title=()=>{return _title;}
    this.langs=()=>{return _langs;}
    this.instance=()=>{return new SrcMediafileLinkById(options);}
    //@ param {Number}  src_one_media_id - e.g. 520
    this.run=(MEDIADATA_SRC, src_one_media_id)=>{
        for(let i=0; i<MEDIADATA_SRC.length; i++){
            if(MEDIADATA_SRC[i][_ID_INDEX] == src_one_media_id){
                console.log("SrcMediafileLinkById.run(): src_one_media_id=",src_one_media_id);
                if(options && options.only_china){
                    const langs_array = MEDIADATA_SRC[i][_LANGS_INDEX];
                    console.log("langs_array=",langs_array);
                    if(langs_array.includes(_CHINA_LANG_INDEX) || langs_array.includes(_ALL_LANG_INDEX)){
                        _link = MEDIADATA_SRC[i][_LINK_INDEX];
                        _langs = MEDIADATA_SRC[i][_LANGS_INDEX];
                        _title = MEDIADATA_SRC[i][_TITLE_INDEX];
                    }
                }
                break;
            }
        }
        return this;
    }
}
//@ function - factory of unique Categories
function CatType(){
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
function CatStorageSrc(){
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