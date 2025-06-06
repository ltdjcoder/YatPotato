export { diffAndPairWithUpdateTime, removeUpdateTime };

function diffAndPairWithUpdateTime(
    last, current, time
){
    if(current instanceof Array){
        let updateTime = last?last.updateTime:0;

        let map = new Map();
        if(last && last.obj){
            for(let i = 0; i < last.obj.length; i++){
                let arrayElment = last.obj[i];

                if(arrayElment._dataStorage_isArrayElement){
                    let key = arrayElment._dataStorage_arrayElementKey;
                    map.set(key, arrayElment);
                }
            }
        }

        for(let i = 0; i < current.length; i++){
            if(!current[i]._dataStorage_isArrayElement){
                current[i] = diffAndPairWithUpdateTime(null, current[i], time);
            }else{
                let key = current[i]._dataStorage_arrayElementKey;
                if(map.has(key)){
                    current[i] = diffAndPairWithUpdateTime(map.get(key), current[i], time);
                }else{
                    current[i] = diffAndPairWithUpdateTime(null, current[i], time);
                }
            }
            updateTime = Math.max(updateTime, current[i].updateTime);
        }
        return {updateTime: updateTime, obj: current};
    }else if(current instanceof Object){
        let updateTime = last?last.updateTime:0;
        for(let key in current){
            if(key == "_dataStorage_isArrayElement" || key == "_dataStorage_arrayElementKey") continue;
            current[key] = diffAndPairWithUpdateTime(last?last.obj[key]:null, current[key], time);
            updateTime = Math.max(updateTime, current[key].updateTime);
        }
        return {updateTime: updateTime, obj: current};
    }else{
        if(last && current == last.obj){
            return {updateTime: last.updateTime, obj: current};
        }else{
            return {updateTime: time, obj: current};
        }
    }
}

function removeUpdateTime(originData){
    if(originData == null) return null;

    let obj = originData.obj;
    if(obj instanceof Array){
        for(let i = 0; i < obj.length; i++){
            obj[i] = removeUpdateTime(obj[i]);
        }
        return obj;
    }else if(obj instanceof Object){
        for(let key in obj){
            if(key == "_dataStorage_isArrayElement" || key == "_dataStorage_arrayElementKey") continue;
            obj[key] = removeUpdateTime(obj[key]);
        }
        return obj;
    }
    return obj;
}
