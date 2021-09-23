//@ Модуль проходит по одному проекту и находит все уникальные категории с точкие зрения уникального набора ключей этой категории
module.exports = function App(){
    this.different_cats=(all_cats_dto)=>{
        return new AllCatsIter(
            new AllKits(),
            new IfKeysKitUniq(
                new CatKeys()
            )
        ).run(all_cats_dto).kits();
    }
}

function AllCatsIter(allKits, ifKeysKitUniq){
    this.kits=()=>{return allKits.kits();}
    this.run=(all_cats_dto)=>{
        allKits.run();
        Object.keys(all_cats_dto).forEach(cat_id=>{
            ifKeysKitUniq.run(all_cats_dto[cat_id], cat_id, allKits);
        });
        console.log("allKits.kits()=",allKits.kits());
        return this;
    }
}
function AllKits(){
    const _uniq_kits = {};
    let _counter = 0;
    this.kits=()=>{return _uniq_kits;}
    this.run=()=>{return this;}
    this.compare=(keys_arr, cat_id)=>{
        if(Object.keys(_uniq_kits).length == 0){
            _uniq_kits[cat_id] = keys_arr;
        }
        let is_same_finded = false;
        Object.keys(_uniq_kits).forEach(numb=>{
            const kit = _uniq_kits[numb];
            const intersec_1 = kit.filter(x=>keys_arr.includes(x));
            //const intersec_2 = keys_arr.filter(x=>kit.includes(x));
            //console.log("AllKits.compare(): intersec_1=", intersec_1)
            //console.log("AllKits.compare(): intersec_2=", intersec_2)
            if(intersec_1.length == kit.length && intersec_1.length == keys_arr.length){
                is_same_finded = true;
            }else{
            }
        });
        if(!is_same_finded){
            console.log("!is_same_finded");
            _uniq_kits[cat_id] = keys_arr;
        }
    }
}
function IfKeysKitUniq(catKeys, writedUniqKit){
    let _kit = undefined;
    this.kit=()=>{return _kit}
    this.run=(cat_dto, cat_id, allKits)=>{
        if(cat_dto.menu_data){
            //console.log("IfKeysKitUniq: ", cat_id, Object.keys(cat_dto));
        }
        allKits.compare(catKeys.instance().run(cat_dto).keys(), cat_id);
        return this;
    }
}
function CatKeys(){
    let _keys = [];
    this.keys=()=>{return _keys;}
    this.instance=()=>{return new CatKeys();}
    this.run=(cat_dto)=>{
        if(typeof cat_dto == 'object'){
            _keys = Object.keys(cat_dto)
        }
        return this;
    }
}