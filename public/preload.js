'use strict';

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

/**
 * this code is generated by AI basically
 */


// 本地服务器类
class LocalServer {
    constructor(componentId, userId, dataDirectory = './data') {
        this.componentId = componentId;
        this.userId = userId;
        this.dataDirectory = dataDirectory;
        this.userDataDirectory = path.join(dataDirectory, componentId, userId);
        
        // 确保目录存在
        this.ensureDirectoriesExist();
    }

    // 确保数据目录存在
    ensureDirectoriesExist() {
        try {
            fs.mkdirSync(this.userDataDirectory, { recursive: true });
        } catch (error) {
            console.error('创建目录失败:', error);
        }
    }

    // 获取文件路径
    getFilePath(key) {
        const fileName = `${key}.json`;
        return path.join(this.userDataDirectory, fileName);
    }

    // 保存数据到文件
    save(key, data) {
        try {
            this.ensureDirectoriesExist();
            
            const filePath = this.getFilePath(key);
            const jsonData = JSON.stringify(data, null, 2);
            
            fs.writeFileSync(filePath, jsonData, 'utf8');
            
            console.log(`[LocalServer] 保存成功: ${this.componentId}/${this.userId}/${key}`);
            return true;
        } catch (error) {
            console.error(`[LocalServer] 保存失败 ${key}:`, error);
            throw error;
        }
    }    
    
    // 从文件加载数据
    load(key) {
        try {
            const filePath = this.getFilePath(key);
            
            // 检查文件是否存在
            try {
                fs.accessSync(filePath);
            } catch {
                // 文件不存在，静默返回null
                return null;
            }
            
            const jsonData = fs.readFileSync(filePath, 'utf8');
            const data = JSON.parse(jsonData);
            
            console.log(`[LocalServer] 加载成功: ${this.componentId}/${this.userId}/${key}`);
            return data;
        } catch (error) {
            console.error(`[LocalServer] 加载失败 ${key}:`, error);
            return null;
        }
    }

    // 删除数据文件
    delete(key) {
        try {
            const filePath = this.getFilePath(key);
            fs.unlinkSync(filePath);
            console.log(`[LocalServer] 删除成功: ${this.componentId}/${this.userId}/${key}`);
            return true;
        } catch (error) {
            console.error(`[LocalServer] 删除失败 ${key}:`, error);
            return false;
        }
    }

    // 列出所有存储的键
    listKeys() {
        try {
            this.ensureDirectoriesExist();
            const files = fs.readdirSync(this.userDataDirectory);
            const keys = files
                .filter(file => file.endsWith('.json'))
                .map(file => file.replace('.json', ''));
            
            console.log(`[LocalServer] 找到 ${keys.length} 个数据文件: ${this.componentId}/${this.userId}`);
            return keys;
        } catch (error) {
            console.error(`[LocalServer] 列出键失败:`, error);
            return [];
        }
    }

    // 清空用户的所有数据
    clearAll() {
        try {
            const keys = this.listKeys();
            for (const key of keys) {
                this.delete(key);
            }
            console.log(`[LocalServer] 清空完成: ${this.componentId}/${this.userId}`);
            return true;
        } catch (error) {
            console.error(`[LocalServer] 清空失败:`, error);
            return false;
        }
    }

    // 获取数据文件信息
    getFileInfo(key) {
        try {
            const filePath = this.getFilePath(key);
            const stats = fs.statSync(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                path: filePath
            };
        } catch (error) {
            console.error(`[LocalServer] 获取文件信息失败 ${key}:`, error);
            return null;
        }
    }
}

// 工厂函数 - 每次都创建新实例
function loadLocalServer(componentId, userId, dataDirectory = './data') {
    return new LocalServer(componentId, userId, dataDirectory);
}

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
            }else {
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
                }else {
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
            
        }else {
            let result =  updateTime1 > updateTime2 ? obj1 : obj2;
            return {updateTime: Math.max(updateTime1, updateTime2), obj: result};
        }
    }
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
            }else {
                let key = current[i]._dataStorage_arrayElementKey;
                if(map.has(key)){
                    current[i] = diffAndPairWithUpdateTime(map.get(key), current[i], time);
                }else {
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
    }else {
        if(last && current == last.obj){
            return {updateTime: last.updateTime, obj: current};
        }else {
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

/**
 * RemoteClient.preload.js - 专为 Electron Preload 环境优化的远程数据存储客户端
 * 使用 token 认证替代 cookie 机制
 */

const { ipcRenderer } = require('electron');

// 配置管理 - 简化版本
const defaultConfig = {
    server: {
        host: "8.134.57.51",
        port: 3333
    },
    client: {
        defaultServerUrl: "http://8.134.57.51:3333",
        timeout: 30000,
        retryAttempts: 3
    },
    websocket: {
        url: "ws://8.134.57.51:3333/ws",
        reconnectInterval: 5000,
        maxReconnectAttempts: 10
    }
};

function getConfig() {
    return defaultConfig;
}

// RemoteClient类 - 使用 token 作为请求参数
class RemoteClient {
    constructor(componentId, userId, serverUrl = null) {
        if (!serverUrl) {
            const config = getConfig();
            serverUrl = config.client.defaultServerUrl;
        }
        
        this.componentId = componentId;
        this.userId = userId;
        this.serverUrl = serverUrl;
        this.apiBase = `${serverUrl}/api`;
        this.ws = null;
        this.connected = false;
        this.authenticated = false;
        this.updateListeners = new Map();
        
        // Token 管理 - 作为请求参数传递
        this.authToken = null;
        this.tokenStorageKey = `authToken_${componentId}`;
        
        // 设置 IPC 监听器
        this.setupIpcListeners();
        
        // 恢复已保存的 token
        this.restoreToken();
        
        console.log(`[RemoteClient] Token认证环境初始化完成`);
        
        // 自动检查登录状态
        this.checkLoginStatus().catch(err => console.error('[RemoteClient] 初始化登录检查失败:', err));
    }

    // 设置 IPC 监听器
    setupIpcListeners() {
        // 监听 WebSocket 消息
        ipcRenderer.on('websocket-message', (event, message) => {
            this.handleWebSocketMessage(message);
        });
        
        // 监听 WebSocket 连接状态
        ipcRenderer.on('websocket-status', (event, status) => {
            this.connected = status.connected;
            console.log(`[RemoteClient] WebSocket状态: ${status.connected ? '已连接' : '已断开'}`);
        });
        
        // 监听 HTTP 响应
        ipcRenderer.on('http-response', (event, data) => {
            if (this.pendingRequests && this.pendingRequests.has(data.requestId)) {
                const { resolve, reject } = this.pendingRequests.get(data.requestId);
                this.pendingRequests.delete(data.requestId);
                
                if (data.error) {
                    reject(new Error(data.error));
                } else {
                    resolve(data.response);
                }
            }
        });
        
        // 初始化待处理请求 Map
        this.pendingRequests = new Map();
        this.requestIdCounter = 0;
    }

    // 通过 IPC 发送 HTTP 请求 - token作为请求体参数
    async electronRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const requestId = ++this.requestIdCounter;
            
            // 如果有token且是POST请求，将token添加到请求体中
            if (this.authToken && options.method === 'POST') {
                const currentBody = options.body ? JSON.parse(options.body) : {};
                currentBody.token = this.authToken;
                options.body = JSON.stringify(currentBody);
            }
            
            // 设置超时
            const timeout = setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    reject(new Error('请求超时'));
                }
            }, options.timeout || 30000);
            
            // 直接存储包装后的 resolve/reject 函数
            this.pendingRequests.set(requestId, { 
                resolve: (response) => {
                    clearTimeout(timeout);
                    resolve(response);
                },
                reject: (error) => {
                    clearTimeout(timeout);
                    reject(error);
                }
            });
            
            // 发送 IPC 请求到主进程
            ipcRenderer.send('http-request', {
                requestId,
                url,
                options
            });
        });
    }

    // 修改 fetchWithCredentials 方法中的响应处理
    async fetchWithCredentials(url, options = {}, retryCount = 0) {
        const maxRetries = 2;
        
        try {
            console.log(`[RemoteClient] 开始请求: ${options.method || 'GET'} ${url} (重试: ${retryCount}/${maxRetries})`);
            const response = await this.electronRequest(url, options);
            console.log(`[RemoteClient] 请求完成: ${response.status}`);
            
            // 创建兼容的响应对象
            const compatibleResponse = {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                json: async () => {
                    if (response.data !== null && response.data !== undefined) {
                        return response.data;
                    } else {
                        throw new Error('响应不是有效的 JSON');
                    }
                },
                text: async () => response.text || ''
            };
            
            return compatibleResponse;
        } catch (error) {
            console.error(`[RemoteClient] 请求失败 (${retryCount}/${maxRetries}):`, error.message);
            
            // 如果是超时错误且还有重试次数，则重试
            if (retryCount < maxRetries && error.message.includes('超时')) {
                console.log(`[RemoteClient] 重试请求 (${retryCount + 1}/${maxRetries}): ${url}`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
                return this.fetchWithCredentials(url, options, retryCount + 1);
            }
            
            throw error;
        }
    }

    // 保存 token 到 localStorage
    saveToken() {
        if (!this.authToken) return;
        
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(this.tokenStorageKey, this.authToken);
                console.log('[RemoteClient] Token已保存到localStorage');
            }
        } catch (error) {
            console.error('[RemoteClient] 保存token失败:', error);
        }
    }

    // 从 localStorage 恢复 token
    async restoreToken() {
        try {
            if (typeof localStorage !== 'undefined') {
                const savedToken = localStorage.getItem(this.tokenStorageKey);
                if (savedToken) {
                    this.authToken = savedToken;
                    console.log('[RemoteClient] Token已从localStorage恢复');
                }
            }
        } catch (error) {
            console.warn('[RemoteClient] 恢复token失败:', error.message);
        }
    }

    // 清除 token
    async clearToken() {
        try {
            this.authToken = null;
            
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(this.tokenStorageKey);
                console.log('[RemoteClient] localStorage token已清除');
            }
        } catch (error) {
            console.error('[RemoteClient] 清除token失败:', error);
        }
    }

    // 初始化WebSocket连接 - 通过 IPC 请求主进程建立连接
    initWebSocket() {
        const config = getConfig();
        const wsUrl = config.websocket.url;
        
        console.log('[RemoteClient] 请求主进程建立WebSocket连接');
        ipcRenderer.send('websocket-connect', {
            url: wsUrl,
            componentId: this.componentId,
            userId: this.userId,
            token: this.authToken
        });
    }
    
    // 处理从主进程接收的 WebSocket 消息
    handleWebSocketMessage(message) {
        try {
            switch (message.type) {
                case 'welcome':
                    console.log('[RemoteClient] 服务器欢迎消息:', message.message);
                    break;
                    
                case 'auth_result':
                    if (message.success) {
                        console.log('[RemoteClient] WebSocket认证成功');
                    } else {
                        console.error('[RemoteClient] WebSocket认证失败:', message.message);
                    }
                    break;
                    
                case 'dataUpdate':
                    this.handleDataUpdate(message);
                    break;
                    
                case 'error':
                    console.error('[RemoteClient] 服务器错误:', message.message);
                    break;
                    
                default:
                    console.log('[RemoteClient] 收到未知类型消息:', message);
            }
        } catch (error) {
            console.error('[RemoteClient] 处理WebSocket消息出错:', error);
        }
    }
    
    // 处理数据更新消息
    handleDataUpdate(message) {
        const { key } = message;
        console.log(`[RemoteClient] 数据更新通知: ${this.componentId}/${key}`);
        
        this.triggerUpdateListeners(`update:${key}`, { key, ...message });
        this.triggerUpdateListeners('update', { key, ...message });
    }
    
    // 触发更新事件监听器
    triggerUpdateListeners(event, data) {
        if (this.updateListeners.has(event)) {
            this.updateListeners.get(event).forEach(callback => {
                try {
                    callback(data.key);
                } catch (error) {
                    console.error(`[RemoteClient] 事件处理器错误 (${event}):`, error);
                }
            });
        }
    }
    
    // 检查登录状态 - 改为POST
    async checkLoginStatus() {
        try {
            console.log('[RemoteClient] 检查登录状态...');
            const response = await this.fetchWithCredentials(`${this.apiBase}/auth/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.authToken })
            });
            const data = await response.json();
            
            console.log('[RemoteClient] 登录状态检查结果:', data);
            this.authenticated = data.loggedIn;
            
            if (data.loggedIn) {
                // 更新token（如果服务器返回了新的token）
                if (data.token && data.token !== this.authToken) {
                    this.authToken = data.token;
                    this.saveToken();
                }
                
                if (!this.connected) {
                    this.initWebSocket();
                }
            } else {
                // 登录状态失效，清除本地token
                // await this.clearToken();
            }
            
            return data;
        } catch (error) {
            console.error('[RemoteClient] 检查登录状态失败:', error);
            return { loggedIn: false };
        }
    }

    async isLoggedIn() {
        try {
            const response = await this.fetchWithCredentials(`${this.apiBase}/auth/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.authToken })
            });
            const data = await response.json();
            return data.loggedIn;
        } catch (error) {
            console.error('[RemoteClient] 检查登录状态失败:', error);
            return false;
        }
    }
    
    // 登录 - 获取并保存 token
    async login(username, password) {
        this.clearToken();
        try {
            console.log('[RemoteClient] 开始登录，用户名:', username);
            
            // 确保请求体格式正确
            const requestBody = { username, password };
            const requestOptions = {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            };
            
            console.log('[RemoteClient] 请求体:', requestBody);
            console.log('[RemoteClient] 请求选项:', requestOptions);
            
            const response = await this.fetchWithCredentials(`${this.apiBase}/auth/login`, requestOptions);
            
            console.log('[RemoteClient] 响应状态:', response.status);
            const data = await response.json();
            console.log('[RemoteClient] 登录响应:', data);
            
            if (data.success) {
                this.authenticated = true;
                this.userId = data.userId || username;
                this.password = password;
                
                // 保存认证token
                this.authToken = data.token;
                this.saveToken();
                
                console.log(`[RemoteClient] Token已保存: ${this.authToken.substring(0, 8)}...`);
                
                // 初始化WebSocket连接
                this.initWebSocket();
            } else {
                this.authenticated = false;
                await this.clearToken();
            }
            
            return data;
        } catch (error) {
            console.error('[RemoteClient] 登录失败:', error);
            return { success: false, message: '网络错误: ' + error.message };
        }
    }
    
    // 登出 - 清除 token
    async logout() {
        try {
            console.log('[RemoteClient] 开始登出...');
            
            const response = await this.fetchWithCredentials(`${this.apiBase}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.authToken })
            });
            
            const data = await response.json();
            console.log('[RemoteClient] 登出响应:', data);
            
            if (data.success) {
                this.authenticated = false;
                this.userId = null;
                
                // 清除 token
                await this.clearToken();
                
                // 关闭WebSocket连接
                ipcRenderer.send('websocket-disconnect');
            }
            
            return data;
        } catch (error) {
            console.error('[RemoteClient] 登出失败:', error);
            return { success: false, message: '网络错误' };
        }
    }
    
    // ----- 以下是与LocalServer兼容的API -----
    
    // 保存数据
    async save(key, data) {
        await this.ensureAuthenticated();
        
        try {
            const response = await this.fetchWithCredentials(`${this.apiBase}/data/${this.componentId}/${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    data: data,
                    token: this.authToken 
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`[RemoteClient] 保存成功: ${this.componentId}/${key}`);
                return true;
            } else {
                console.error(`[RemoteClient] 保存失败 ${key}:`, result.message);
                throw new Error(result.message || '保存失败');
            }
        } catch (error) {
            console.error(`[RemoteClient] 保存错误 ${key}:`, error);
            throw error;
        }
    }
    
    // 加载数据
    async load(key) {
        await this.ensureAuthenticated();
        
        try {
            const response = await this.fetchWithCredentials(`${this.apiBase}/data/${this.componentId}/${key}/load`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.authToken })
            });
            
            if (response.status === 404) {
                return null;
            }
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`[RemoteClient] 加载成功: ${this.componentId}/${key}`);
                return result.data;
            } else {
                console.error(`[RemoteClient] 加载失败 ${key}:`, result.message);
                return null;
            }
        } catch (error) {
            console.error(`[RemoteClient] 加载错误 ${key}:`, error);
            return null;
        }
    }
    
    // 删除数据
    async delete(key) {
        await this.ensureAuthenticated();
        
        try {
            const response = await this.fetchWithCredentials(`${this.apiBase}/data/${this.componentId}/${key}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.authToken })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`[RemoteClient] 删除成功: ${this.componentId}/${key}`);
                return true;
            } else {
                console.error(`[RemoteClient] 删除失败 ${key}:`, result.message);
                return false;
            }
        } catch (error) {
            console.error(`[RemoteClient] 删除错误 ${key}:`, error);
            return false;
        }
    }
    
    // 列出所有键
    async listKeys() {
        await this.ensureAuthenticated();
        
        try {
            const response = await this.fetchWithCredentials(`${this.apiBase}/keys/${this.componentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: this.authToken })
            });
            const result = await response.json();
            
            if (result.success) {
                console.log(`[RemoteClient] 列出键成功: ${this.componentId}`);
                return result.keys || [];
            } else {
                console.error('[RemoteClient] 列出键失败:', result.message);
                return [];
            }
        } catch (error) {
            console.error('[RemoteClient] 列出键错误:', error);
            return [];
        }
    }
    
    // 清空所有数据
    async clearAll() {
        const keys = await this.listKeys();
        let success = true;
        
        for (const key of keys) {
            const result = await this.delete(key);
            if (!result) success = false;
        }
        
        if (success) {
            console.log(`[RemoteClient] 清空数据成功: ${this.componentId}`);
        } else {
            console.error(`[RemoteClient] 清空数据部分失败: ${this.componentId}`);
        }
        
        return success;
    }
    
    // 获取文件信息（简化版本）
    async getFileInfo(key) {
        const exists = await this.load(key) !== null;
        
        return {
            exists: exists,
            remote: true,
            componentId: this.componentId,
            key: key,
            userId: this.userId,
            environment: 'Electron-Token-Auth'
        };
    }
    
    // ----- 事件订阅机制 -----
    
    onUpdate(callback) {
        this.registerUpdateListener('update', callback);
        return this;
    }
    
    onKeyUpdate(key, callback) {
        this.registerUpdateListener(`update:${key}`, callback);
        return this;
    }
    
    registerUpdateListener(event, callback) {
        if (!this.updateListeners.has(event)) {
            this.updateListeners.set(event, new Set());
        }
        this.updateListeners.get(event).add(callback);
    }
    
    unregisterUpdateListener(event, callback) {
        if (this.updateListeners.has(event)) {
            this.updateListeners.get(event).delete(callback);
        }
    }
    
    // 确保已登录
    async ensureAuthenticated() {
        if (!this.authenticated || !this.authToken) {
            const status = await this.checkLoginStatus();
            if (!status.loggedIn) {
                throw new Error('未登录');
            }
        }
        
        // 等待 WebSocket 连接
        if (!this.connected) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}

// 工厂函数
function loadRemoteClient$1(componentId, userId, serverUrl = null) {
    if (!serverUrl) {
        const config = getConfig();
        serverUrl = config.client.defaultServerUrl;
    }
    return new RemoteClient(componentId, userId, serverUrl);
}

// 这个文件尽可能不要用AI修改
// this file don't modify by AI as possible



let remoteClients = new Map();
let dataStorages  = new Map();

function loadRemoteClient(componentId, userId){
    if(remoteClients.has(componentId)) return remoteClients.get(componentId);
    remoteClients.set(componentId, loadRemoteClient$1(componentId, userId));
    return remoteClients.get(componentId);
}

function loadDataStorage(componentId, userId="user1") {

if(dataStorages.has(componentId)) return dataStorages.get(componentId);

let localServer = loadLocalServer(componentId, userId);
let remoteClient = loadRemoteClient(componentId, userId);

loginAndSync(remoteClient, userId).catch();

let keyEvents = new Map();
let events = new Array();

let callEvents = ()=>{
    events.forEach(callback => {
        callback();
    });
};
remoteClient.onUpdate(callEvents);
let callKeyEvents = (key)=>{
    if(keyEvents.get(key) == null) return;
    keyEvents.get(key).forEach(callback => {
        callback();
    });
};
// remoteClient.onKeyUpdate(callKeyEvents);

async function syncDataFromRemote(key) {
    if( await remoteClient.isLoggedIn() ){
        let data = await remoteClient.load(key);
        if(data != null) {
            // localServer.save(key, data);
            // 不能直接这样save，因为本地数据被覆盖导致没有联网上传的数据消失，本地数据也可以覆盖远程数据
            // save(key, data);
            // 死循环 /(ㄒoㄒ)/~~

            localServer.save(key, data);
            // 就这样先了，后面处理一下记得
            callKeyEvents(key);
        }
    }
}

async function sendDataToRemote(key) {
    if( await remoteClient.isLoggedIn() ){
        let data = localServer.load(key);
        await remoteClient.save(key, data);
    }
}

function save(key, data) {
    bindNewArrayElement(data);

    let lastData = localServer.load(key);
    data = diffAndPairWithUpdateTime(lastData, data, new Date().getTime());

    data = merge(lastData, data);

    localServer.save(key, data);

    sendDataToRemote(key).catch();

    callKeyEvents(key);
}

function load(key) {
    // syncDataFromRemote(key).catch();

    let data = localServer.load(key);
    
    return removeUpdateTime(data);
}

let result = {

    save,

    load,


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

    async function dealDataUpdate(key) {
        await syncDataFromRemote(key);
        callKeyEvents(key);
    }

    keys.forEach(key => {
        remoteClient.onKeyUpdate(key, dealDataUpdate);
        syncDataFromRemote(key);
    });
}

dataStorages.set(componentId, result);
return result;
}

module.exports = loadDataStorage;
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('DataStorage', {
    loadDataStorage: (componentId) => loadDataStorage(componentId),
})
