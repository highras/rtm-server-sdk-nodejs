# FPNN RTM Node.js SDK #

#### 安装依赖 ####

```
yarn add int64-buffer
yarn add msgpack-lite
```

` package.json `:

```
"dependencies": {
    "int64-buffer": "^0.1.10",
    "msgpack-lite": "^0.1.26"
}
```

#### ES6支持 ####
* 需要支持部分ES6特性，如遇问题请参考:http://node.green/
* 参考es-checker / babel-cli / babel-preset-es2015

#### 一个例子 ####
```javascript

const Uint64BE = require("int64-buffer").Uint64BE;

// 创建Client
let options = {
    host: '10.0.0.1',
    port: 11100,
    autoReconnect: true,
    connectionTimeout: 10 * 1000,
    pid: 1000001,
    secretKey: '3a0023b6-bc80-488d-b312-c4a139b5ab1a'
}

let client = new RTMClient(options);

// 开启连接
client.enableConnect();

//push service
let pushName = client.rtmConfig.SERVER_PUSH.recvMessage;
client.processor.on(pushName, function(data){
    console.log('\n[PUSH] ' + pushName + ':\n', data);
});

// 连接成功并发送消息
client.on('connect', function(){
    let from = new Uint64BE(0, 778898);
    let to = new Uint64BE(0, 778899);

    client.sendMessage(from, to, 8, 'hello !', '', 10 * 1000, function(err, data){
        console.log(data, err);
    });
});

// 异常
client.on('error', function(err){
    console.error(err);
});

// 关闭
client.on('close', function(){
    console.log('closed!');
});

```

#### 测试 ####
```
yarn install
yarn test
```

#### Events ####
* `event`:
    * `connect`: 连接成功 

    * `error`: 发生异常
        * `err`: **(Error)**

    * `close`: 连接关闭

#### PushService #### 
请参考 `RTMConfig.SERVER_PUSH` 成员

* `ping`: RTMGate主动ping
    * `data`: **(object)**

* `pushmsg`: RTMGate主动推送P2P消息
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.to`: **(Int64BE)** 接收者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushmsgs`: RTMGate主动推送多个接收者P2P消息
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.tos`: **(array[Int64BE])** 多个接收者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushgroupmsg`: RTMGate主动推送Group消息
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushroommsg`: RTMGate主动推送Room消息
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushfile`: RTMGate主动推送P2P文件
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.to`: **(Int64BE)** 接收者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushfiles`: RTMGate主动推送多个接收者P2P文件
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.tos`: **(array[Int64BE])** 多个接收者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushgroupfile`: RTMGate主动推送Group文件
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushroomfile`: RTMGate主动推送Room文件
    * `data.pid`: **(number)** 应用编号
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.ftype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushevent`: RTMGate主动推送事件 
    * `data.pid`: **(number)** 应用编号
    * `data.event`: **(string)** 事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `data.uid`: **(Int64BE)** 触发者 id
    * `data.time`: **(number)** 触发时间(s)
    * `data.endpoint`: **(string)** 对应的RTMGate地址
    * `data.data`: **(string)** `预留`

#### API ####
* `constructor(options)`: 构造RTMClient
    * `options.pid`: **(Required | number)** 应用编号, RTM提供
    * `options.secretKey`: **(Required | string)** 应用加密, RTM提供
    * `options.host`: **(Required | string)** 地址, RTM提供
    * `options.port`: **(Required | string)** 端口, RTM提供
    * `options.autoReconnect`: **(Optional | bool)** 是否自动重连, 默认: `false`
    * `options.connectionTimeout`: **(Optional | number)** 超时时间(ms), 默认: `30 * 1000`

* `processor`: **(RTMProcessor)** 监听PushService的句柄

* `rtmConfig`: **(object)** 请参考 `RTMConfig` 成员

* `enableConnect()`: 开启连接(非加密模式) 

* `enableEncryptorByData(peerPubData, options)`: 开启加密连接
    * `peerPubData`: **(Required | Buffer)** 加密公钥, RTM提供
    * `options.curveName`: **(Optional | string)** 加密协议, 默认: `secp256k1`
    * `options.strength`: **(Optional | number)** 加密强度, 默认: `128` 
    * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`

* `enableEncryptorByFile(peerPubPath, options)`: 开启加密连接
    * `peerPubPath`: **(Required | Buffer)** 加密公钥, RTM提供
    * `options.curveName`: **(Optional | string)** 加密协议, 默认: `secp256k1`
    * `options.strength`: **(Optional | number)** 加密长度, 默认: `128` 
    * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`

* `sendMessage(from, to, mtype, msg, attrs, timeout, callback)`: 发送消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `to`: **(Required | Uint64BE)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendMessages(from, tos, mtype, msg, attrs, timeout, callback)`: 发送多人消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `tos`: **(Required | array[Uint64BE])** 接收方uids
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendGroupMessage(from, gid, mtype, msg, attrs, timeout, callback)`: 发送group消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `gid`: **(Required | Uint64BE)** group id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendRoomMessage(from, rid, mtype, msg, attrs, timeout, callback)`: 发送room消息
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `rid`: **(Required | Uint64BE)** room id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `broadcastMessage(from, mtype, msg, attrs, timeout, callback)`: 广播消息(andmin id)
    * `from`: **(Required | Uint64BE)** admin id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addFriends(uid, friends, timeout, callback)`: 添加好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `friends`: **(Required | array[Uint64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteFriends(uid, friends, timeout, callback)`: 删除好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `friends`: **(Required | array[Uint64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getFriends(uid, timeout, callback)`: 获取好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Uint64BE])** 

* `isFriend(uid, fuid, timeout, callback)`: 是否好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `fuid`: **(Required | Uint64BE)** 好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `isFriends(uid, fuids, timeout, callback)`: 是否好友
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `fuids`: **(Required | array[Uint64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Uint64BE])** 

* `addGroupMembers(gid, uids, timeout, callback)`: 添加group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroupMembers(gid, uids, timeout, callback)`:  删除group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroup(gid, timeout, callback)`: 删除group
    * `gid`: **(Required | Uint64BE)** group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getGroupMembers(gid, timeout, callback)`: 获取group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Uint64BE])** 

* `isGroupMember(gid, uid, timeout, callback)`: 是否group成员
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `getUserGroups(uid, timeout, callback)`: 获取用户的group
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `getToken(uid, timeout, callback)`: 获取token
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(string)** 

* `getOnlineUsers(uids, timeout, callback)`: 获取在线用户
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Uint64BE])** 

* `addGroupBan(gid, uid, btime, timeout, callback)`: 阻止用户消息(group)
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeGroupBan(gid, uid, timeout, callback)`: 取消阻止(group)
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addRoomBan(rid, uid, btime, timeout, callback)`: 阻止用户消息(room)
    * `rid`: **(Required | Uint64BE)** room id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeRoomBan(rid, uid, timeout, callback)`: 取消阻止(room)
    * `rid`: **(Required | Uint64BE)** room id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addProjectBlack(uid, btime, timeout, callback)`: 阻止用户消息(project)
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeProjectBlack(uid, timeout, callback)`: 取消阻止(project)
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `isBanOfGroup(gid, uid, timeout, callback)`: 检查阻止(group)
    * `gid`: **(Required | Uint64BE)** group id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `isBanOfRoom(rid, uid, timeout, callback)`: 检查阻止(room)
    * `rid`: **(Required | Uint64BE)** room id
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `isProjectBlack(uid, timeout, callback)`: 检查阻止(project)
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `setGeo(uid, lat, lng, timeout, callback)`: 设置位置
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `lat`: **(Required | number)** 纬度
    * `lng`: **(Required | number)** 经度
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getGeo(uid, timeout, callback)`: 获取位置
    * `uid`: **(Required | Uint64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[lat:number, lng:number])** 

* `getGeos(uids, timeout, callback)`: 获取位置
    * `uids`: **(Required | array[Uint64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[array[uid:Uint64BE,lat:number,lng:number])** 

* `sendFile(from, to, mtype, filePath, timeout, callback)`: 发送文件
    * `from`: **(Required | Uint64BE)** 发送方 id
    * `to`: **(Required | Uint64BE)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `filePath`: **(Required | string)** 文件路径 
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addEvtListener(opts, timeout, callback)`: 添加 `事件` / `消息` 监听
    * `opts.gids`: **(Optional | array[Uint64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Uint64BE])** 多个Room id
    * `opts.p2p`: **(Optional | bool)** P2P消息
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeEvtListener(opts, timeout, callback)`: 删除 `事件` / `消息` 监听
    * `opts.gids`: **(Optional | array[Uint64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Uint64BE])** 多个Room id
    * `opts.p2p`: **(Optional | bool)** P2P消息
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `setEvtListener(opts, timeout, callback)`: 更新 `事件` / `消息` 监听
    * `opts`: **(Optional | [bool | object])** `true`: 监听所有 `事件` / `消息`, `false`: 取消所有 `事件` / `消息` 监听
    * `opts.gids`: **(Optional | array[Uint64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Uint64BE])** 多个Room id
    * `opts.p2p`: **(Optional | bool)** P2P消息, `true`: 监听, `false`: 取消监听
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addDevice(uid, apptype, devicetoken, timeout, callback)`: 添加设备, 应用信息
    * `uid`: **(Required | Uint64BE])** 用户 id
    * `apptype`: **(Required | string)** 应用信息
    * `devicetoken`: **(Required | string)** 设备 token
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
        
* `removeDevice(uid, devicetoken, timeout, callback)`: 删除设备, 应用信息
    * `uid`: **(Required | Uint64BE])** 用户 id
    * `devicetoken`: **(Required | string)** 设备 token
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 