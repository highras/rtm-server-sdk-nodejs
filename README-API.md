# FPNN RTM Node.js SDK #

#### API ####
* `RTMClient::RTMRegistration::register()`: 注册服务

> constructor

* `constructor(options)`: 构造RTMClient
    * `options`: **(Required | object)**
    * `options.pid`: **(Required | number)** 应用编号, RTM提供
    * `options.secret`: **(Required | string)** 应用加密, RTM提供
    * `options.host`: **(Required | string)** 地址, RTM提供
    * `options.port`: **(Required | string)** 端口, RTM提供
    * `options.reconnect`: **(Optional | bool)** 是否自动重连, 默认: `true`
    * `options.timeout`: **(Optional | number)** 超时时间(ms), 默认: `30 * 1000`
    * `options.debug`: **(Optional | bool)** 是否自动重连, 默认: `false`

> action

* `processor`: **(RTMProcessor)** 监听PushService的句柄

* `destroy()`: 断开链接并销毁

* `connect()`: 开启连接(非加密模式) 

* `connect(peerPubData, options)`: 开启加密连接
    * `peerPubData`: **(Required | Buffer)** 加密公钥, RTM提供
    * `options`: **(Required | object)**
        * `options.curve`: **(Optional | string)** 加密协议, 默认: `secp256k1`
        * `options.strength`: **(Optional | number)** 加密强度, 默认: `128` 
        * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`

* `connect(peerPubData, options)`: 开启加密连接
    * `peerPubData`: **(Required | string)** 加密公钥文件路径, RTM提供
    * `options`: **(Required | object)**
        * `options.curve`: **(Optional | string)** 加密协议, 默认: `secp256k1`
        * `options.strength`: **(Optional | number)** 加密强度, 默认: `128` 
        * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`

* `getToken(uid, timeout, callback)`: 获取token
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(token:string))** 

* `kickout(uid, ce, timeout, callback)`: 踢掉一个用户或者一个链接
    * `uid`: **(Required | Int64BE)** 用户 id
    * `ce`: **(Optional | string)** 踢掉`ce`对应链接, 为`null`则踢掉该用户, 多点登录情况
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

* `removeToken(uid, timeout, callback)`: 删除一个用户的token
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)**
 
> message action

* `sendMessage(from, to, mtype, msg, attrs, mid, timeout, callback)`: 发送业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复业务消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))**

* `sendMessages(from, tos, mtype, msg, attrs, mid, timeout, callback)`: 发送多人业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendGroupMessage(from, gid, mtype, msg, attrs, mid, timeout, callback)`: 发送group业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendRoomMessage(from, rid, mtype, msg, attrs, timeout, callback)`: 发送room业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `broadcastMessage(from, mtype, msg, attrs, timeout, callback)`: 广播业务消息(andmin id)
    * `from`: **(Required | Int64BE)** admin id
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `getGroupMessage(gid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取Group历史业务消息
    * `gid`: **(Required | Int64BE)** Group id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(array(number))** 获取历史业务消息的类型集合
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(GroupMsg)))** 
            * `GroupMsg.id` **(Int64BE)**
            * `GroupMsg.from` **(Int64BE)**
            * `GroupMsg.mtype` **(number)**
            * `GroupMsg.mid` **(Int64BE)**
            * `GroupMsg.msg` **(string)**
            * `GroupMsg.attrs` **(string)**
            * `GroupMsg.mtime` **(Int64BE)**

* `getRoomMessage(rid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取Room历史业务消息
    * `rid`: **(Required | Int64BE)** Room id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(array(number))** 获取历史业务消息的类型集合
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(RoomMsg)))** 
            * `RoomMsg.id` **(Int64BE)**
            * `RoomMsg.from` **(Int64BE)**
            * `RoomMsg.mtype` **(number)**
            * `RoomMsg.mid` **(Int64BE)**
            * `RoomMsg.msg` **(string)**
            * `RoomMsg.attrs` **(string)**
            * `RoomMsg.mtime` **(Int64BE)**

* `getBroadcastMessage(desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取广播历史业务消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(array(number))** 获取历史业务消息的类型集合
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(BroadcastMsg)))** 
            * `BroadcastMsg.id` **(Int64BE)**
            * `BroadcastMsg.from` **(Int64BE)**
            * `BroadcastMsg.mtype` **(number)**
            * `BroadcastMsg.mid` **(Int64BE)**
            * `BroadcastMsg.msg` **(string)**
            * `BroadcastMsg.attrs` **(string)**
            * `BroadcastMsg.mtime` **(Int64BE)**

* `getP2PMessage(uid, ouid, desc, num, begin, end, lastid, timeout, callback)`: 获取P2P历史业务消息
    * `uid`: **(Required | Int64BE)** 获取和两个用户之间的历史消息
    * `ouid`: **(Required | Int64BE)** 获取和两个用户之间的历史消息
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(array(number))** 获取历史业务消息的类型集合
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(P2PMsg)))** 
            * `P2PMsg.id` **(Int64BE)**
            * `P2PMsg.direction` **(number)**
            * `P2PMsg.mtype` **(number)**
            * `P2PMsg.mid` **(Int64BE)**
            * `P2PMsg.msg` **(string)**
            * `P2PMsg.attrs` **(string)**
            * `P2PMsg.mtime` **(Int64BE)**

* `getMessage(mid, from, xid, type, timeout, callback)`: 获取消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `xid`: **(Required | Int64BE)** to/gid/rid
    * `type`: **(Required | number)** 1,p2p; 2,group; 3, room; 4, broadcast
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getChat(mid, from, xid, type, timeout, callback)`: 获取聊天
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `xid`: **(Required | Int64BE)** to/gid/rid
    * `type`: **(Required | number)** 1,p2p; 2,group; 3, room; 4, broadcast
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteMessage(mid, from, to, timeout, callback)`: 删除P2P业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 业务消息接收方User id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroupMessage(mid, from, gid, timeout, callback)`: 删除Gourp业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** 业务消息接收方Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteRoomMessage(mid, from, rid, timeout, callback)`: 删除Room业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** 业务消息接收方Room id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteBroadcastMessage(mid, from, timeout, callback)`: 删除广播业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** admin id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

> chat action

* `sendChat(from, to, msg, attrs, mid, timeout, callback)`: 发送聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复业务消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))**

* `sendAudio(from, to, audio, attrs, mid, timeout, callback)`: 发送聊天语音, 消息类型`RTMConfig.CHAT_TYPE.audio`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `audio`: **(Required | Buffer)** 语音数据
    * `attrs`: **(Required | string)** 附加信息, `Json`字符串, 至少带两个参数(`lang`: 语言类型, `duration`: 语音长度 ms)
    * `mid`: **(Optional | Int64BE)** 语音消息 id, 用于过滤重复聊天语音, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))**

* `sendCmd(from, to, msg, attrs, mid, timeout, callback)`: 发送聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复业务消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))**

* `sendChats(from, tos, msg, attrs, mid, timeout, callback)`: 发送多人聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))**

* `sendAudios(from, tos, audio, attrs, mid, timeout, callback)`: 发送多人聊天语音, 消息类型`RTMConfig.CHAT_TYPE.audio`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `audio`: **(Required | Buffer)** 语音数据
    * `attrs`: **(Required | string)** 附加信息, `Json`字符串, 至少带两个参数(`lang`: 语言类型, `duration`: 语音长度 ms)
    * `mid`: **(Optional | Int64BE)** 语音消息 id, 用于过滤重复聊天语音, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendCmds(from, tos, msg, attrs, mid, timeout, callback)`: 发送多人聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))**

* `sendGroupChat(from, gid, msg, attrs, mid, timeout, callback)`: 发送group聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)**聊天消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendGroupAudio(from, gid, audio, attrs, mid, timeout, callback)`: 发送group聊天语音, 消息类型`RTMConfig.CHAT_TYPE.audio`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `audio`: **(Required | Buffer)** 语音数据
    * `attrs`: **(Required | string)** 附加信息, `Json`字符串, 至少带两个参数(`lang`: 语言类型, `duration`: 语音长度 ms)
    * `mid`: **(Optional | Int64BE)** 语音消息 id, 用于过滤重复聊天语音, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendGroupCmd(from, gid, msg, attrs, mid, timeout, callback)`: 发送group聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendRoomChat(from, rid, msg, attrs, timeout, callback)`: 发送room聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendRoomAudio(from, rid, audio, attrs, timeout, callback)`: 发送room聊天语音, 消息类型`RTMConfig.CHAT_TYPE.audio`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `audio`: **(Required | Buffer)** 语音数据
    * `attrs`: **(Required | string)** 附加信息, `Json`字符串, 至少带两个参数(`lang`: 语言类型, `duration`: 语音长度 ms)
    * `mid`: **(Optional | Int64BE)** 语音消息 id, 用于过滤重复聊天语音, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendRoomCmd(from, rid, msg, attrs, timeout, callback)`: 发送room聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `broadcastChat(from, msg, attrs, timeout, callback)`: 广播聊天消息(andmin id), 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** admin id
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `broadcastAudio(from, audio, attrs, timeout, callback)`: 广播聊天语音(andmin id), 消息类型`RTMConfig.CHAT_TYPE.audio`
    * `from`: **(Required | Int64BE)** admin id
    * `audio`: **(Required | Buffer)** 语音数据
    * `attrs`: **(Required | string)** 附加信息, `Json`字符串, 至少带两个参数(`lang`: 语言类型, `duration`: 语音长度 ms)
    * `mid`: **(Optional | Int64BE)** 语音消息 id, 用于过滤重复聊天语音, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `broadcastCmd(from, msg, attrs, timeout, callback)`: 广播聊天命令(andmin id), 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** admin id
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:Error))** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `getGroupChat(gid, desc, num, begin, end, lastid, timeout, callback)`: 获取Group历史聊天消息, `mtypes=Arrays.asList((byte)30)`
    * `gid`: **(Required | Int64BE)** Group id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(GroupMsg)))** 
            * `GroupMsg.id` **(Int64BE)**
            * `GroupMsg.from` **(Int64BE)**
            * `GroupMsg.mtype` **(number)**
            * `GroupMsg.mid` **(Int64BE)**
            * `GroupMsg.msg` **(string)**
            * `GroupMsg.attrs` **(string)**
            * `GroupMsg.mtime` **(Int64BE)**

* `getRoomChat(rid, desc, num, begin, end, lastid, timeout, callback)`: 获取Room历史聊天消息, `mtypes=Arrays.asList((byte)30)`
    * `rid`: **(Required | Int64BE)** Room id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(RoomMsg)))** 
            * `RoomMsg.id` **(Int64BE)**
            * `RoomMsg.from` **(Int64BE)**
            * `RoomMsg.mtype` **(number)**
            * `RoomMsg.mid` **(Int64BE)**
            * `RoomMsg.msg` **(string)**
            * `RoomMsg.attrs` **(string)**
            * `RoomMsg.mtime` **(Int64BE)**

* `getBroadcastChat(desc, num, begin, end, lastid, timeout, callback)`: 获取广播历史聊天消息, `mtypes=Arrays.asList((byte)30)`
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(BroadcastMsg)))** 
            * `BroadcastMsg.id` **(Int64BE)**
            * `BroadcastMsg.from` **(Int64BE)**
            * `BroadcastMsg.mtype` **(number)**
            * `BroadcastMsg.mid` **(Int64BE)**
            * `BroadcastMsg.msg` **(string)**
            * `BroadcastMsg.attrs` **(string)**
            * `BroadcastMsg.mtime` **(Int64BE)**

* `getP2PChat(uid, ouid, desc, num, begin, end, lastid, timeout, callback)`: 获取P2P历史聊天消息, `mtypes=Arrays.asList((byte)30)`
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
        * `data`: **(object(num:number,lastid:Int64BE,begin:Int64BE,end:Int64BE,msgs:array(P2PMsg)))** 
            * `P2PMsg.id` **(Int64BE)**
            * `P2PMsg.direction` **(number)**
            * `P2PMsg.mtype` **(number)**
            * `P2PMsg.mid` **(Int64BE)**
            * `P2PMsg.msg` **(string)**
            * `P2PMsg.attrs` **(string)**
            * `P2PMsg.mtime` **(Int64BE)**

* `deleteChat(mid, from, to, timeout, callback)`: 删除P2P聊天消息
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 聊天消息接收方User id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroupChat(mid, from, gid, timeout, callback)`: 删除Group聊天消息
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** 聊天消息接收方Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteRoomChat(mid, from, rid, timeout, callback)`: 删除Room聊天消息
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** 聊天消息接收方Room id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteBroadcastChat(mid, from, timeout, callback)`: 删除广播聊天消息(admin id)
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** admin id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `translate(text, src, dst, type, profanity, timeout, callback)`: 翻译消息, 需启用翻译服务, 返回{source:原始聊天消息语言类型,target:翻译后的语言类型,sourceText:原始聊天消息,targetText:翻译后的聊天消息}
    * `text`: **(Required | string)** 待翻译的原始聊天消息
    * `src`: **(Required | string)** 待翻译的聊天消息的语言类型, 参考RTMConfig.TRANS_LANGUAGE成员
    * `dst`: **(Required | string)** 本次翻译的目标语言类型, 参考RTMConfig.TRANS_LANGUAGE成员
    * `type`: **(Required | string)** 可选值为`chat`或`mail`, 默认:`chat`
    * `profanity`: **(Required | string)** 敏感语过滤, 设置为以下三项之一: `off` `stop` `censor`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(source:string,target:string,sourceText:string,targetText:string))** 

* `profanity(text, action, timeout, callback)`: 敏感词过滤, 返回过滤后的字符串或者以错误形式返回, 需启用翻译服务
    * `text`: **(Required | string)** 待检查文本
    * `action`: **(Required | string)** 检查结果返回形式, `stop`: 以错误形式返回, `censor`: 用`*`替换敏感词
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(text:string))** 
            
* `transcribe(audio, lang, action, timeout, callback)`: 语音识别, 返回过滤后的字符串或者以错误形式返回, 需启用翻译服务, 设置超时时间不低于60s
    * `audio`: **(Required | Buffer)** 待识别语音数据
    * `lang`: **(Required | string)** 待识别语音的类型, 参考`RTMConfig.TRANS_LANGUAGE`成员
    * `action`: **(Required | string)** 检查结果返回形式, `stop`: 以错误形式返回, `censor`: 用`*`替换敏感词
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(text:string,lang:string))** 

> file token

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
        * `data`: **(object(token:string,endpoint:string))** 

> user action

* `getOnlineUsers(uids, timeout, callback)`: 获取在线用户, 每次最多获取200个
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array(Int64BE))** 

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

* `isProjectBlack(uid, timeout, callback)`: 检查阻止(project)
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(ok:bool))** 

* `setUserInfo(uid, oinfo, pinfo, timeout, callback)`: 设置用户的公开信息和私有信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `oinfo`: **(Required | string)** 公开信息
    * `pinfo`: **(Required | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getUserInfo(uid, timeout, callback)`: 获取用户的公开信息和私有信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(oinfo:string,pinfo:string))** 

* `getUserOpenInfo(uids, timeout, callback)`: 获取其他用户的公开信息, 每次最多获取100人
    * `uids`: **(Required | array(Int64BE))** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(string,string))** 

> friends action

* `addFriends(uid, friends, timeout, callback)`: 添加好友, 每次最多添加100人
    * `uid`: **(Required | Int64BE)** 用户 id
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteFriends(uid, friends, timeout, callback)`: 删除好友, 每次最多删除100人
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
        * `data`: **(array(Int64BE))** 

* `isFriend(uid, fuid, timeout, callback)`: 判断好友关系
    * `uid`: **(Required | Int64BE)** 用户 id
    * `fuid`: **(Required | Int64BE)** 好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(ok:bool))** 

* `isFriends(uid, fuids, timeout, callback)`: 是否好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `fuids`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array(Int64BE))** 

> group action

* `addGroupMembers(gid, uids, timeout, callback)`: 添加group成员, 每次最多添加100人
    * `gid`: **(Required | Int64BE)** Group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `deleteGroupMembers(gid, uids, timeout, callback)`:  删除group成员, 每次最多删除100人
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
        * `data`: **(object(ok:bool))** 

* `getUserGroups(uid, timeout, callback)`: 获取用户的Group
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(array(Int64BE))** 

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

* `isBanOfGroup(gid, uid, timeout, callback)`: 检查阻止(Group)
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(ojbect(ok:bool))** 

* `setGroupInfo(gid, oinfo, pinfo, timeout, callback)`: 设置Group的公开信息和私有信息
    * `gid`: **(Required | Int64BE)** group id
    * `oinfo`: **(Required | string)** 公开信息
    * `pinfo`: **(Required | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(ojbect)** 

* `getGroupInfo(gid, timeout, callback)`: 获取Group的公开信息和私有信息
    * `gid`: **(Required | Int64BE)** group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(ojbect(oinfo:string,pinfo:string))** 

> room action

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

* `isBanOfRoom(rid, uid, timeout, callback)`: 检查阻止(Room)
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(ok:bool))** 

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

* `setRoomInfo(rid, oinfo, pinfo, timeout, callback)`: 设置Room的公开信息和私有信息
    * `rid`: **(Required | Int64BE)** room id
    * `oinfo`: **(Required | string)** 公开信息
    * `pinfo`: **(Required | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `getRoomInfo(rid, timeout, callback)`: 获取Room的公开信息和私有信息
    * `rid`: **(Required | Int64BE)** room id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(oinfo:string,pinfo:string))** 

> monitor action

* `addEvtListener(opts, timeout, callback)`: 添加 `事件` / `消息` 监听, 仅对当前链接有效, 增量添加
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.uids`: **(Optional | array[Int64BE])** 多个用户 id
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `removeEvtListener(opts, timeout, callback)`: 删除 `事件` / `消息` 监听, 仅对当前链接有效, 增量取消
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.uids`: **(Optional | array[Int64BE])** 多个用户 id
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `setEvtListener(opts, timeout, callback)`: 更新 `事件` / `消息` 监听, 仅对当前链接有效, 全量覆盖, 每个链接以本次设置为准
    * `opts.p2p`: **(Optional | bool)** `true`: 忽略uids, 监听全部p2p的 `事件` / `消息`,  `false`: 则只监听uids中的 `事件` / `消息`
    * `opts.group`: **(Optional | bool)** `true`: 忽略gids, 监听全部Group的 `事件` / `消息`,  `false`: 则只监听gids中的 `事件` / `消息`
    * `opts.room`: **(Optional | bool)** `true`: 忽略rids, 监听全部Room的 `事件` / `消息`,  `false`: 则只监听rids中的 `事件` / `消息`
    * `opts.ev`: **(Optional | bool)** `true`: 忽略events, 监听全部 `事件`,  `false`: 则只监听events中的 `事件`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `setEvtListener(opts, timeout, callback)`: 更新 `事件` / `消息` 监听, 仅对当前链接有效, 全量覆盖, 每个链接以本次设置为准
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.uids`: **(Optional | array[Int64BE])** 多个用户 id
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

> data sav

* `dataGet(uid, key, timeout, callback)`: 获取存储的数据信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(val:string))** 

* `dataSet(uid, key, val, timeout, callback)`: 设置存储的数据信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128字节`
    * `val`: **(Required | string)** 存储数据实际内容, 最长`65535字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 

* `dataDelete(uid, key, timeout, callback)`: 删除存储的数据信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object)** 
        
> file send

* `sendFile(from, to, mtype, fileBytes, fileExt, fileName, mid, timeout, callback)`: 发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方 uid
    * `mtype`: **(Required | number)** 文件类型
    * `fileBytes`: **(Required | Buffer)** 文件内容 
    * `fileExt`: **(Optional | string)** 文件扩展名
    * `fileName`: **(Optional | string)** 文件名
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendFiles(from, tos, mtype, fileBytes, fileExt, fileName, mid, timeout, callback)`: 给多人发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array<Int64BE>)** 接收方 uids
    * `mtype`: **(Required | number)** 文件类型
    * `fileBytes`: **(Required | Buffer)** 文件内容 
    * `fileExt`: **(Optional | string)** 文件扩展名
    * `fileName`: **(Optional | string)** 文件名
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendGroupFile(from, gid, mtype, fileBytes, fileExt, fileName, mid, timeout, callback)`: 给Group发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id 
    * `mtype`: **(Required | number)** 文件类型
    * `fileBytes`: **(Required | Buffer)** 文件内容 
    * `fileExt`: **(Optional | string)** 文件扩展名
    * `fileName`: **(Optional | string)** 文件名
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `sendRoomFile(from, rid, mtype, fileBytes, fileExt, fileName, mid, timeout, callback)`: 给Room发送文件
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id 
    * `mtype`: **(Required | number)** 文件类型
    * `fileBytes`: **(Required | Buffer)** 文件内容 
    * `fileExt`: **(Optional | string)** 文件扩展名
    * `fileName`: **(Optional | string)** 文件名
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 

* `broadcastFile(from, mtype, fileBytes, fileExt, fileName, mid, timeout, callback)`: 给整个Project发送文件
    * `from`: **(Required | Int64BE)** Admin id
    * `mtype`: **(Required | number)** 文件类型
    * `fileBytes`: **(Required | Buffer)** 文件内容 
    * `fileExt`: **(Optional | string)** 文件扩展名
    * `fileName`: **(Optional | string)** 文件名
    * `mid`: **(Optional | Int64BE)** 消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 
        
> 增值服务

* `translate(text, src, dst, type, profanity, postProfanity, uid, timeout, callback)`: 翻译
    * `text`: **(Required | string)** 文本
    * `src`: **(Optional | string)** 原始语言类型
    * `dst`: **(Required | Buffer)** 目标语言类型
    * `type`: **(Optional | string)** 可选值为chat或mail。如未指定，则默认使用'chat'
    * `profanity`: **(Optional | string)** 敏感语过滤。设置为以下3项之一: off, stop, censor，默认：off
    * `postProfanity`: **(Optional | bool)** 是否把翻译后的文本过滤
    * `uid`: **(Optional | number)** 用户id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(source:string,target:string,sourceText:string,targetText:string))** 
        
* `profanity(text, classify, uid, timeout, callback)`: 文本检测
    * `text`: **(Required | string)** 文本
    * `classify`: **(Optional | bool)** 是否进行文本分类检测
    * `uid`: **(Optional | number)** 用户id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(text:string, classification:list<string>))** 
        
* `transcribe(audio, lang, uid, codec, srate, timeout, callback)`: 语音识别
    * `audio`: **(Required | string)** 声音数据
    * `lang`: **(Required | string)** 语言
    * `uid`: **(Optional | number)** 用户id
    * `codec`: **(Required | string)** 编码类型
    * `srate`: **(Required | number)** 采样率，默认16000
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(Error)** 
        * `data`: **(object(text:string, classification:list<string>))** 
