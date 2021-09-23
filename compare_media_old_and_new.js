//@ сравнение двух файлов media_data одного проекта, но отличающихся по содержимому
const media_old_path = "../media_data_smart.js"
const media_old_arr = require(media_old_path);
const media_new_path = "../media_data_2_smart.js"
const media_new_arr = require(media_new_path);
const media_old_url = 5;
const media_new_url = "url";
const media_old_tags = 10;
const media_new_tags = "tags";
//@ 1. compare lengths
console.log("old length=", media_old_arr.length)
console.log("new length=", media_new_arr.length)
//@ 2. check unique values in old and new media
const uniq_old = check_uniq_old(media_old_arr)
const uniq_new = check_uniq_new(media_new_arr)
const intersected = compare_old_and_new(uniq_old, uniq_new);
check_if_ids_synchronized()

function check_if_ids_synchronized(){
	media_old_arr.forEach(one_old_media=>{
		//console.log("one_old_id=",one_old_media)
		old_id = one_old_media[7]
		const one_new_media = find_one_media_by_id(media_new_arr, old_id);
		if(one_new_media.url != one_old_media[5]){
			console.log("WARNING!!! links dismatch!")
			console.log("one_new_media.url=",one_new_media.url)
			console.log("one_old_media[5]=",one_old_media[5])
		}
		// const tags_instersected = new_media_dto.tags().filter(x=>{old_media_dto.tags().includes(x)});
		// console.log("new_media_dto.tags()=",new_media_dto.tags())
		// console.log("old_media_dto.tags()=",old_media_dto.tags())
		// console.log("tags_instersected=",tags_instersected)
	});
	function find_one_media_by_id(media_new_arr, old_id){
		let aim = false;
		for(let i=0; i<media_new_arr.length; i++){
			if (media_new_arr[i].id == old_id){
				aim = media_new_arr[i];
				break;
			}
		}
		return aim;
	}
}
//media_old_arr.filter(x=>)
function compare_old_and_new(uniq_old, uniq_new){
	const old_arr = Object.keys(uniq_old);
	const new_arr = Object.keys(uniq_new);
	const intersected = old_arr.filter(x=>new_arr.includes(x));
	const difference_in_old = old_arr.filter(x => !new_arr.includes(x));
	const difference_in_new = new_arr.filter(x => !old_arr.includes(x));
	return intersected
}
function check_uniq_new(media_new_arr){
	const uniq = {}
	media_new_arr.forEach(el=>{
		const link = el[media_new_url];
		if(uniq[link]){uniq[link]++}
		else{uniq[link] = 1}
	});
	const not_uniq = {}
	let sum = 0;
	Object.keys(uniq).forEach(key=>{
		const numb = uniq[key];
		if(numb > 1){
			not_uniq[key] = numb;
			sum += numb;
		}
	})
	console.log("new excess sum=",sum - Object.keys(not_uniq).length)
	return uniq
}
function check_uniq_old(media_old_arr){
	const uniq = {}
	media_old_arr.forEach(el=>{
		const link = el[media_old_url];
		if(uniq[link]){uniq[link]++}
		else{uniq[link] = 1}
	});
	const not_uniq = {}
	let sum = 0;
	Object.keys(uniq).forEach(key=>{
		const numb = uniq[key];
		if(numb > 1){
			not_uniq[key] = numb;
			sum += numb;
		}
	})
	console.log("old excess sum=",sum - Object.keys(not_uniq).length)
	return uniq
}