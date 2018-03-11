# FPNN RTM Node.js SDK #

#### 安装依赖 ####

```
npm install co --save
npm install co-defer --save
npm install co-wait --save

npm install int64-buffer --save
npm install msgpack-lite --save
```

` package.json `:

```
"dependencies": {
    "co": "^4.6.0",
    "co-defer": "^1.0.0",
    "co-wait": "0.0.0",
    "int64-buffer": "^0.1.10",
    "msgpack-lite": "^0.1.26"
}
```

#### ES6支持 ####
* 需要支持部分ES6特性，如遇问题请参考:http://node.green/
* 参考es-checker / babel-cli / babel-preset-es2015

#### 一个例子 ####
```javascript

const Uint64BE = require("int64-buffer").Uint64BE;

// 创建Client
let options = {
    host: '10.0.0.1',
    port: 11100,
    autoReconnect: true,
    connectionTimeout: 10 * 1000,
    pid: 1000001,
    secretKey: '3a0023b6-bc80-488d-b312-c4a139b5ab1a'
}

let client = new RTMClient(options);

// 开启连接
client.enableConnect();

// 连接成功并发送消息
client.on('connect', () => {
    let from = new Uint64BE(0, 778898);
    let to = new Uint64BE(0, 778899);

    client.sendMessage(from, to, 8, 'hello !', '', (err, data) => {
        console.log(data, err);
    });
});

// 异常
client.on('error', (err) => {
    console.error(err);
});

```

#### 接口 ####

* `event`:
    * `connect`: 连接成功 
    * `error`: 发生异常

* `constructor(options)`: 构造RTMClient
    * `options.pid`: **(Required | number)** 应用编号, RTM提供
    * `options.secretKey`: **(Required | string)** 应用加密, RTM提供
    * `options.host`: **(Required | string)** 地址, RTM提供
    * `options.port`: **(Required | string)** 端口, RTM提供
    * `options.autoReconnect`: **(Optional | bool)** 是否自动重连, 默认: `false`
    * `options.connectionTimeout`: **(Optional | number)** 超时时间(ms), 默认: `30 * 1000`

* `enableConnect()`: 开启连接(非加密模式) 

* `enableEncryptorByData(peerPubData, options)`: 开启加密连接
    * `peerPubData`: **(Required | Buffer)** 加密公钥, RTM提供
    * `options.curveName`: **(Optional | string)** 加密协议, 默认: `secp256k1`
    * `options.strength`: **(Optional | number)** 加密强度, 默认: `128` 
    * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`

* `enableEncryptorByFile(peerPubPath, options)`: 开启加密连接
    * `peerPubPath`: **(Required | Buffer)** 加密公钥, RTM提供
    * `options.curveName`: **(Optional | string)** 加密协议, 默认: `secp256k1`
    * `options.strength`: **(Optional | number)** 加密长度, 默认: `128` 
    * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`

* `sendMessage(from, to, mtype, msg, attrs, callback, timeout)`: 发送消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `to`: **(Required | Uint64BE)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendMessages(from, tos, mtype, msg, attrs, callback, timeout)`: 发送多人消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `tos`: **(Required | array[Uint64BE])** 接收方uids
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendGroupMessage(from, gid, mtype, msg, attrs, callback, timeout)`: 发送group消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `gid`: **(Required | Uint64BE)** group id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendRoomMessage(from, rid, mtype, msg, attrs, callback, timeout)`: 发送room消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `rid`: **(Required | Uint64BE)** room id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `broadcastMessage(from, mtype, msg, attrs, callback, timeout)`: 广播消息(andmin id)
    * `from`: **(Required | Uint64BE)** admin id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addfriends(uid, friends, callback, timeout)`: 添加好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `friends`: **(Required | array[Uint64BE])** 多个好友 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `delFriends(uid, friends, callback, timeout)`: 删除好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `friends`: **(Required | array[Uint64BE])** 多个好友 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getFriends(uid, callback, timeout)`: 获取好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Uint64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `isFriend(uid, fuid, callback, timeout)`: 是否好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `fuid`: **(Required | Uint64BE)** 好友 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(bool)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `isFriends(uid, fuids, callback, timeout)`: 是否好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `fuids`: **(Required | array[Uint64BE])** 多个好友 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Uint64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addGroupMembers(gid, uids, callback, timeout)`: 添加group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `deleteGroupMembers(gid, uids, callback, timeout)`:  删除group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `deleteGroup(gid, callback, timeout)`: 删除group
    * `gid`: **(Required | Uint64BE)** group id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getGroupMembers(gid, callback, timeout)`: 获取group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Uint64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `isGroupMember(gid, uid, callback, timeout)`: 是否group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(bool)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getUserGroups(uid, callback, timeout)`: 获取用户的group
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(bool)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getToken(uid, callback, timeout)`: 获取token
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(string)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getOnlineUsers(uids, callback, timeout)`: 获取在线用户
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[Uint64BE])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addGroupBan(gid, uid, btime, callback, timeout)`: 阻止用户消息(group)
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `removeGroupBan(gid, uid, callback, timeout)`: 取消阻止(group)
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addRoomBan(rid, uid, btime, callback, timeout)`: 阻止用户消息(room)
    * `rid`: **(Required | Uint64BE)** room id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `removeRoomBan(rid, uid, callback, timeout)`: 取消阻止(room)
    * `rid`: **(Required | Uint64BE)** room id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `addProjectBlack(uid, btime, callback, timeout)`: 阻止用户消息(project)
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `removeProjectBlack(uid, callback, timeout)`: 取消阻止(project)
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `isBanOfGroup(gid, uid, callback, timeout)`: 检查阻止(group)
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(bool)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `isBanOfRoom(rid, uid, callback, timeout)`: 检查阻止(room)
    * `rid`: **(Required | Uint64BE)** room id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(bool)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `isProjectBlack(uid, callback, timeout)`: 检查阻止(project)
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(bool)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `setPushName(uid, pushname, callback, timeout)`: 设置名字
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `pushname`: **(Required | string)** 名字
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getPushName(uid, callback, timeout)`: 获取名字
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(string)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `setGeo(uid, lat, lng, callback, timeout)`: 设置位置
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `lat`: **(Required | number)** 纬度
    * `lng`: **(Required | number)** 经度
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getGeo(uid, callback, timeout)`: 获取位置
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object[lat:number, lng:number])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `getGeos(uids, callback, timeout)`: 获取位置
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(array[array[uid:Uint64BE,lat:number,lng:number])** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`

* `sendFile(from, to, mtype, filePath, callback, timeout)`: 发送文件
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `to`: **(Required | Uint64BE)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `filePath`: **(Required | string)** 文件路径 
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object)** 
        * `data`: **(object)** 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `5 * 1000`