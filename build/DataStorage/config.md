# 配置文件说明

## 基本配置文件 (config.json)

默认的配置文件，包含所有可配置的选项。

## 环境变量配置

你也可以通过环境变量来覆盖配置文件中的设置：

- `SERVER_PORT` - 服务器端口
- `SERVER_HOST` - 服务器主机
- `SERVER_URL` - 完整的服务器URL
- `WEBSOCKET_URL` - WebSocket URL
- `DATA_DIR` - 数据存储目录
- `SESSION_DIR` - 会话存储目录
- `SESSION_SECRET` - 会话密钥

## 使用示例

### 1. 本地开发环境
```json
{
  "server": {
    "url": "http://localhost:3000",
    "port": 3000,
    "host": "localhost"
  },
  "client": {
    "defaultServerUrl": "http://localhost:3000"
  },
  "websocket": {
    "url": "ws://localhost:3000/ws"
  }
}
```

### 2. 生产环境
```json
{
  "server": {
    "url": "https://yourserver.com",
    "port": 443,
    "host": "yourserver.com"
  },
  "client": {
    "defaultServerUrl": "https://yourserver.com"
  },
  "websocket": {
    "url": "wss://yourserver.com/ws"
  }
}
```

### 3. 自定义端口
```json
{
  "server": {
    "url": "http://192.168.1.100:8080",
    "port": 8080,
    "host": "192.168.1.100"
  },
  "client": {
    "defaultServerUrl": "http://192.168.1.100:8080"
  },
  "websocket": {
    "url": "ws://192.168.1.100:8080/ws"
  }
}
```

## 配置文件位置

配置文件应该放在项目根目录下，文件名为 `config.json`。

如果配置文件不存在，系统会使用默认配置（localhost:3000）。

## 在代码中使用

### 服务器端
服务器会自动加载配置文件并使用其中的设置。

### 客户端
```javascript
import { loadRemoteClient } from './RemoteClient.js';

// 使用配置文件中的默认服务器地址
const client = loadRemoteClient('myComponent', 'user1');

// 或者手动指定服务器地址
const client = loadRemoteClient('myComponent', 'user1', 'http://custom-server:3000');
```
