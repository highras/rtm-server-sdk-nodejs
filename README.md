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

#### Promise支持 ####
* 支持动态转Promise接口
* 参考:[Promise.promisifyAll](http://bluebirdjs.com/docs/api/promise.promisifyall.html)

#### 一个例子 ####
```javascript

const Int64BE = require("int64-buffer").Int64BE;

// 创建Client
let options = {
    host: 'rtm-nx-front.ifunplus.cn',
    port: 13315,
    autoReconnect: true,
    connectionTimeout: 10 * 1000,
    pid: 11000001,
    secretKey: 'ef3617e5-e886-4a4e-9eef-7263c0320628'
}

let client = new RTMClient(options);

// 连接成功并发送消息
client.on('connect', function() {
    
    let from = new Int64BE(0, 778898);
    let to = new Int64BE(0, 778899);

    client.sendMessage(from, to, 8, 'hello !', '', new Int64BE(0), 10 * 1000, function(err, data) {
        
        console.log(data, err);
    });
});

// 异常
client.on('error', function(err) {

    console.error(err);
});

// 关闭
client.on('close', function() {

    console.log('closed!');
});

//push service
let pushName = RTMConfig.SERVER_PUSH.recvMessage;
client.processor.on(pushName, function(data) {

    console.log('\n[PUSH] ' + pushName + ':\n', data);
});

// 开启连接
client.enableConnect();

//destroy
//client.destroy();
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
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.to`: **(Int64BE)** 接收者 id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushgroupmsg`: RTMGate主动推送Group消息
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushroommsg`: RTMGate主动推送Room消息
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mtype`: **(number)** 消息类型
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 消息内容
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushfile`: RTMGate主动推送P2P文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.to`: **(Int64BE)** 接收者 id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushgroupfile`: RTMGate主动推送Group文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.gid`: **(Int64BE)** Group id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
    * `data.mid`: **(Int64BE)** 消息 id, 当前链接会话内唯一
    * `data.msg`: **(string)** 文件获取地址(url)
    * `data.attrs`: **(string)** 发送时附加的自定义内容

* `pushroomfile`: RTMGate主动推送Room文件
    * `data.from`: **(Int64BE)** 发送者 id
    * `data.rid`: **(Int64BE)** Room id
    * `data.mtype`: **(number)** 文件类型, 请参考 `RTMConfig.FILE_TYPE` 成员
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

* `destroy()`: 断开链接并销毁

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
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64BE, error:Error])** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `sendMessages(from, tos, mtype, msg, attrs, timeout, callback)`: 发送多人消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64BE, error:Error])** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `sendGroupMessage(from, gid, mtype, msg, attrs, timeout, callback)`: 发送Group消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64BE, error:Error])** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `sendRoomMessage(from, rid, mtype, msg, attrs, timeout, callback)`: 发送Room消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64BE, error:Error])** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `broadcastMessage(from, mtype, msg, attrs, timeout, callback)`: 广播消息(andmin id)
    * `from`: **(Required | Int64BE)** admin id
    * `mtype`: **(Required | number)** 消息类型
    * `msg`: **(Required | string)** 消息内容
    * `attrs`: **(Required | string)** 消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object[mid:Int64BE, error:Error])** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `addFriends(uid, friends, timeout, callback)`: 添加好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteFriends(uid, friends, timeout, callback)`: 删除好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getFriends(uid, timeout, callback)`: 获取好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `isFriend(uid, fuid, timeout, callback)`: 是否好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `fuid`: **(Required | Int64BE)** 好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `isFriends(uid, fuids, timeout, callback)`: 是否好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `fuids`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `addGroupMembers(gid, uids, timeout, callback)`: 添加Group成员
    * `gid`: **(Required | Int64BE)** Group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroupMembers(gid, uids, timeout, callback)`:  删除Group成员
    * `gid`: **(Required | Int64BE)** Group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroup(gid, timeout, callback)`: 删除Group
    * `gid`: **(Required | Int64BE)** Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getGroupMembers(gid, timeout, callback)`: 获取Group成员
    * `gid`: **(Required | Int64BE)** Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `isGroupMember(gid, uid, timeout, callback)`: 是否Group成员
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `getUserGroups(uid, timeout, callback)`: 获取用户的Group
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `getToken(uid, timeout, callback)`: 获取token
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(string)** 

* `getOnlineUsers(uids, timeout, callback)`: 获取在线用户
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array[Int64BE])** 

* `addGroupBan(gid, uid, btime, timeout, callback)`: 阻止用户消息(Group)
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeGroupBan(gid, uid, timeout, callback)`: 取消阻止(Group)
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addRoomBan(rid, uid, btime, timeout, callback)`: 阻止用户消息(Room)
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeRoomBan(rid, uid, timeout, callback)`: 取消阻止(Room)
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addProjectBlack(uid, btime, timeout, callback)`: 阻止用户消息(project)
    * `uid`: **(Required | Int64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeProjectBlack(uid, timeout, callback)`: 取消阻止(project)
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `isBanOfGroup(gid, uid, timeout, callback)`: 检查阻止(Group)
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `isBanOfRoom(rid, uid, timeout, callback)`: 检查阻止(Room)
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `isProjectBlack(uid, timeout, callback)`: 检查阻止(project)
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(bool)** 

* `fileToken(from, cmd, tos, to, rid, gid, timeout, callback)`: 获取发送文件的token
    * `from`: **(Required | Int64BE)** 发送方 id
    * `cmd`: **(Required | string)** 文件发送方式`sendfile | sendfiles | sendroomfile | sendgroupfile | broadcastfile`
    * `tos`: **(Optional | array[Int64BE])** 接收方 uids
    * `to`: **(Optional | Int64BE)** 接收方 uid
    * `rid`: **(Optional | Int64BE)** Room id
    * `gid`: **(Optional | Int64BE)** Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[token:string, endpoint:string])** 

* `getGroupMessage(gid, desc, num, begin, end, lastid, timeout, callback)`: 获取Group历史消息
    * `gid`: **(Required | Int64BE)** Group id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array[GroupMsg]])** 
            * `GroupMsg.id` **(Int64BE)**
            * `GroupMsg.from` **(Int64BE)**
            * `GroupMsg.mtype` **(number)**
            * `GroupMsg.mid` **(Int64BE)**
            * `GroupMsg.deleted` **(bool)**
            * `GroupMsg.msg` **(string)**
            * `GroupMsg.attrs` **(string)**
            * `GroupMsg.mtime` **(Int64BE)**

* `getRoomMessage(rid, desc, num, begin, end, lastid, timeout, callback)`: 获取Room历史消息
    * `rid`: **(Required | Int64BE)** Room id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array[RoomMsg]])** 
            * `RoomMsg.id` **(Int64BE)**
            * `RoomMsg.from` **(Int64BE)**
            * `RoomMsg.mtype` **(number)**
            * `RoomMsg.mid` **(Int64BE)**
            * `RoomMsg.deleted` **(bool)**
            * `RoomMsg.msg` **(string)**
            * `RoomMsg.attrs` **(string)**
            * `RoomMsg.mtime` **(Int64BE)**

* `getBroadcastMessage(desc, num, begin, end, lastid, timeout, callback)`: 获取广播历史消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array[BroadcastMsg]])** 
            * `BroadcastMsg.id` **(Int64BE)**
            * `BroadcastMsg.from` **(Int64BE)**
            * `BroadcastMsg.mtype` **(number)**
            * `BroadcastMsg.mid` **(Int64BE)**
            * `BroadcastMsg.deleted` **(bool)**
            * `BroadcastMsg.msg` **(string)**
            * `BroadcastMsg.attrs` **(string)**
            * `BroadcastMsg.mtime` **(Int64BE)**

* `getP2PMessage(uid, ouid, desc, num, begin, end, lastid, timeout, callback)`: 获取P2P历史消息
    * `uid`: **(Required | Int64BE)** 获取和两个用户之间的历史消息
    * `ouid`: **(Required | Int64BE)** 获取和两个用户之间的历史消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[num:number, lastid:Int64BE, begin:Int64BE, end:Int64BE, msgs:array[P2PMsg]])** 
            * `P2PMsg.id` **(Int64BE)**
            * `P2PMsg.direction` **(number)**
            * `P2PMsg.mtype` **(number)**
            * `P2PMsg.mid` **(Int64BE)**
            * `P2PMsg.deleted` **(bool)**
            * `P2PMsg.msg` **(string)**
            * `P2PMsg.attrs` **(string)**
            * `P2PMsg.mtime` **(Int64BE)**

* `addRoomMember(rid, uid, timeout, callback)`: 添加Room成员
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteRoomMember(rid, uid, timeout, callback)`: 删除Room成员
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addEvtListener(opts, timeout, callback)`: 添加 `事件` / `消息` 监听
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.p2p`: **(Optional | bool)** P2P消息
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeEvtListener(opts, timeout, callback)`: 删除 `事件` / `消息` 监听
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.p2p`: **(Optional | bool)** P2P消息
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `setEvtListener(opts, timeout, callback)`: 更新 `事件` / `消息` 监听
    * `opts`: **(Optional | [bool | object])** `true`: 监听所有 `事件` / `消息`, `false`: 取消所有 `事件` / `消息` 监听
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.p2p`: **(Optional | bool)** P2P消息, `true`: 监听, `false`: 取消监听
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `addDevice(uid, apptype, devicetoken, timeout, callback)`: 添加设备, 应用信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `apptype`: **(Required | string)** 应用信息
    * `devicetoken`: **(Required | string)** 设备 token
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
        
* `removeDevice(uid, devicetoken, timeout, callback)`: 删除设备, 应用信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `devicetoken`: **(Required | string)** 设备 token
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteMessage(mid, from, xid, type, timeout, callback)`: 删除消息
    * `mid`: **(Required | Int64BE)** 消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `xid`: **(Required | Int64BE)** 接收放 id, `rid/gid/to`
    * `type`: **(Required | number)** 消息发送分类 `1:P2P, 2:Group, 3:Room, 4:Broadcast`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `kickout(uid, ce, timeout, callback)`: 踢掉一个用户或者一个链接
    * `uid`: **(Required | Int64BE)** 用户 id
    * `ce`: **(Optional | string)** 踢掉`ce`对应链接, 多用户登录情况
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `sendFile(from, to, mtype, filePath, mid, timeout, callback)`: 发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方 uid
    * `mtype`: **(Required | number)** 文件类型
    * `filePath`: **(Required | string)** 文件路径 
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `sendFiles(from, tos, mtype, filepath, mid, timeout, callback)`: 给多人发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array<Int64BE>)** 接收方 uids
    * `mtype`: **(Required | number)** 文件类型
    * `filePath`: **(Required | string)** 文件路径 
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `sendGroupFile(from, gid, mtype, filepath, mid, timeout, callback)`: 给Group发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id 
    * `mtype`: **(Required | number)** 文件类型
    * `filePath`: **(Required | string)** 文件路径 
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `sendRoomFile(from, rid, mtype, filepath, mid, timeout, callback)`: 给Room发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id 
    * `mtype`: **(Required | number)** 文件类型
    * `filePath`: **(Required | string)** 文件路径 
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 

* `broadcastFile(from, mtype, filepath, mid, timeout, callback)`: 给整个Project发送文件
    * `from`: **(Required | Int64BE)** Admin id
    * `mtype`: **(Required | number)** 文件类型
    * `filePath`: **(Required | string)** 文件路径 
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object[mid:Int64BE, payload:object[mtime:Int64BE]])** 
