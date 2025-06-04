import { loadLocalServer } from './LocalServer.js';
import { merge } from './MergeTest.js';
import { bindNewArrayElement } from './MergeTest.js';
import { diffAndPairWithUpdateTime, removeUpdateTime } from './Diff.js';
import { default as _loadRemoteClient } from './RemoteClient.js';

export default loadDataStorage


let remoteClients = new Map();
let dataStorages  = new Map();

function loadRemoteClient(componentId, userId){
    if(remoteClients.has(componentId)) return remoteClients.get(componentId);
    remoteClients.set(componentId, _loadRemoteClient(componentId, userId));
    return remoteClients.get(componentId);
}

function loadDataStorage(componentId, userId="user1") {

if(dataStorages.has(componentId)) return dataStorages.get(componentId);

let localServer = loadLocalServer(componentId, userId);
let remoteClient = loadRemoteClient(componentId, userId);

loginAndSync(remoteClient, userId)

let keyEvents = new Map();
let events = new Array();

let callEvents = ()=>{
    events.forEach(callback => {
        callback();
    })
};
remoteClient.onUpdate(callEvents);
let callKeyEvents = (key)=>{
    keyEvents.get(key).forEach(callback => {
        callback();
    })
}
remoteClient.onKeyUpdate(callKeyEvents);

async function syncDataFromRemote(key) {
    if( await remoteClient.isLoggedIn() ){
        let data = await remoteClient.load(key);
        if(data != null) localServer.save(key, data);
    }
}

async function sendDataToRemote(key) {
    if( await remoteClient.isLoggedIn() ){
        let data = localServer.load(key);
        await remoteClient.save(key, data);
    }
}

let result = {
    save(key, data) {
        bindNewArrayElement(data);

        let lastData = localServer.load(key);
        data = diffAndPairWithUpdateTime(lastData, data, new Date().getTime());

        data = merge(lastData, data);

        localServer.save(key, data);

        sendDataToRemote(key);

        callKeyEvents(key);
    },

    load(key) {
        syncDataFromRemote(key);

        let data = localServer.load(key);
        
        return removeUpdateTime(data);
    },




    registerUpdateEvent(callback){
        events.push(callback);
    },

    registerUpdateEventWithKey(key, callback){
        if(keyEvents.has(key)) keyEvents.get(key).push(callback);
        else {
            keyEvents.set(key, new Array());
            keyEvents.get(key).push(callback);
        }
    },

    // registerRemoteUpdateEvent(callback){

    // },

    // registerRemoteUpdateEventWithKey(key, callback){

    // },

};

async function loginAndSync(remoteClient, userId){
    await remoteClient.login(userId, "123456");
    let keys = await remoteClient.listKeys();

    keys.forEach(key => {
        syncDataFromRemote(key);
    });
}

dataStorages.set(componentId, result);
return result;
}



