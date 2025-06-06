import crypto  from 'crypto';


export { merge };
export { lock, unlock, isLocked };
export { bindNewArrayElement };


/**
 * the parameter should be constructed as
 * {
 *   updateTime: new Date().getTime(), 
 *   obj: obj;
 * }
 */
function merge(
    originData1, originData2){

    // if(originData1 == null) originData1 = {updateTime: 0, obj: {}};
    // if(originData2 == null) originData2 = {updateTime: 0, obj: {}};

    if(originData1 == null) return originData2;
    if(originData2 == null) return originData1;

    let {updateTime: updateTime1, obj: obj1} = originData1;
    let {updateTime: updateTime2, obj: obj2} = originData2;

    if(obj1 == null) return { updateTime: updateTime2, obj: obj2 };
    if(obj2 == null) return { updateTime: updateTime1, obj: obj1 };
    
    if(isLocked(obj1) || isLocked(obj2)){
        let result =  updateTime1 > updateTime2 ? obj1 : obj2;
        return {updateTime: Math.max(updateTime1, updateTime2), obj: result};
    }else if(Array.isArray(obj1) || Array.isArray(obj2)){
        if(!Array.isArray(obj1)) return {updateTime: updateTime2, obj: obj2};
        if(!Array.isArray(obj2)) return {updateTime: updateTime1, obj: obj1};

        let result = [];

        let map = new Map();
        for(let i = 0; i < obj1.length; i++){
            let arrayElment = obj1[i];

            let key = arrayElment.obj._dataStorage_arrayElementKey;
            map.set(key, obj1[i]);
        }

        for(let i = 0; i < obj2.length; i++){  
            let arrayElment = obj2[i];

            let key = arrayElment.obj._dataStorage_arrayElementKey;
            if(map.has(key)){
                let arrayElment1 = map.get(key);
                let arrayElment2 = arrayElment;
                map.set(key, merge(arrayElment1, arrayElment2));
            }else{
                map.set(key, arrayElment);
            }
        }

        for(let i of map.keys()){
            result.push(map.get(i));
        }
        return {updateTime: Math.max(updateTime1, updateTime2), obj: result};
    }else {
        if(obj1 instanceof Object){
            let result = {};
            
            for(let key in obj1){
                if(key == "_dataStorage_isArrayElement" || key == "_dataStorage_arrayElementKey") result[key] = obj1[key];
                else if(obj2[key] == null){
                    result[key] = obj1[key];
                }else{
                    result[key] = merge(obj1[key], obj2[key]);
                }
            }
            for(let key in obj2){
                if(key == "_dataStorage_isArrayElement" || key == "_dataStorage_arrayElementKey") result[key] = obj2[key];
                else if(result[key] == null){
                    result[key] = obj2[key];
                }
            }
            return {updateTime: Math.max(updateTime1, updateTime2), obj: result};
            
        }else{
            let result =  updateTime1 > updateTime2 ? obj1 : obj2;
            return {updateTime: Math.max(updateTime1, updateTime2), obj: result};
        }
    }
}

function lock(obj){
    obj._dataStorage_isLocked = true;
}

function unlock(obj){
    obj._dataStorage_isLocked = false;
}

function isLocked(obj){
    return obj && (obj._dataStorage_isLocked && obj._dataStorage_isLocked == true);
}

function bindNewArrayElement(obj){
    if(Array.isArray(obj)) {
        for(let i = 0; i < obj.length; i++){
            if(!obj[i]._dataStorage_isArrayElement){
                bindAsArrayElement(obj[i]);
            }
            bindNewArrayElement(obj[i]);
        }
    }else if(obj instanceof Object){
        for(let key in obj){
            bindNewArrayElement(obj[key]);
        }
    }
}

function bindAsArrayElement(obj){
    obj._dataStorage_isArrayElement = true;
    obj._dataStorage_arrayElementKey = generateKey();
}

function generateKey(){
    return crypto.randomBytes(6).toString('hex');
}