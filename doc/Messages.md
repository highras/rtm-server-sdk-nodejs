# FPNN RTM Node.js SDK Friends API #

* `sendMessage(from, to, mtype, msg, attrs, mid, timeout, callback)`: 发送业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复业务消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))**

* `sendMessages(from, tos, mtype, msg, attrs, mid, timeout, callback)`: 发送多人业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `sendGroupMessage(from, gid, mtype, msg, attrs, mid, timeout, callback)`: 发送group业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `sendRoomMessage(from, rid, mtype, msg, attrs, timeout, callback)`: 发送room业务消息
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `broadcastMessage(from, mtype, msg, attrs, timeout, callback)`: 广播业务消息(andmin id)
    * `from`: **(Required | Int64BE)** admin id
    * `mtype`: **(Required | number)** 业务消息类型（请使用51-127，禁止使用50及以下的值）
    * `msg`: **(Required | string)** 业务消息内容
    * `attrs`: **(Required | string)** 业务消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 业务消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `getGroupMessage(uid, gid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取Group历史业务消息
    * `uid`: **(Required | Int64BE)** 用户id
    * `gid`: **(Required | Int64BE)** Group id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(array(number))** 获取历史业务消息的类型集合
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(count:number,lastCursorId:Int64BE,beginMsec:Int64BE,endMsec:Int64BE,messages:array(RTMMessage)))** 
            * `RTMMessage.cursorId` **(Int64BE)**
            * `RTMMessage.fromUid` **(Int64BE)**
            * `RTMMessage.toId` **(Int64BE)**
            * `RTMMessage.messageType` **(number)**
            * `RTMMessage.messageId` **(Int64BE)**
            * `RTMMessage.message` **(string)**
            * `RTMMessage.attrs` **(string)**
            * `RTMMessage.modifiedTime` **(Int64BE)**

* `getRoomMessage(uid, rid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取Room历史业务消息
    * `uid`: **(Required | Int64BE)** 用户id
    * `rid`: **(Required | Int64BE)** Room id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(array(number))** 获取历史业务消息的类型集合
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(count:number,lastCursorId:Int64BE,beginMsec:Int64BE,endMsec:Int64BE,messages:array(RTMMessage)))** 
            * `RTMMessage.cursorId` **(Int64BE)**
            * `RTMMessage.fromUid` **(Int64BE)**
            * `RTMMessage.toId` **(Int64BE)**
            * `RTMMessage.messageType` **(number)**
            * `RTMMessage.messageId` **(Int64BE)**
            * `RTMMessage.message` **(string)**
            * `RTMMessage.attrs` **(string)**
            * `RTMMessage.modifiedTime` **(Int64BE)**

* `getBroadcastMessage(uid, desc, num, begin, end, lastid, mtypes, timeout, callback)`: 获取广播历史业务消息
    * `uid`: **(Required | Int64BE)** 用户id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
    * `mtypes`: **(array(number))** 获取历史业务消息的类型集合
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(count:number,lastCursorId:Int64BE,beginMsec:Int64BE,endMsec:Int64BE,messages:array(RTMMessage)))** 
            * `RTMMessage.cursorId` **(Int64BE)**
            * `RTMMessage.fromUid` **(Int64BE)**
            * `RTMMessage.toId` **(Int64BE)**
            * `RTMMessage.messageType` **(number)**
            * `RTMMessage.messageId` **(Int64BE)**
            * `RTMMessage.message` **(string)**
            * `RTMMessage.attrs` **(string)**
            * `RTMMessage.modifiedTime` **(Int64BE)**

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
        * `err`: **(FPError)** 
        * `data`: **(object(count:number,lastCursorId:Int64BE,beginMsec:Int64BE,endMsec:Int64BE,messages:array(RTMMessage)))** 
            * `RTMMessage.cursorId` **(Int64BE)**
            * `RTMMessage.fromUid` **(Int64BE)**
            * `RTMMessage.toId` **(Int64BE)**
            * `RTMMessage.messageType` **(number)**
            * `RTMMessage.messageId` **(Int64BE)**
            * `RTMMessage.message` **(string)**
            * `RTMMessage.attrs` **(string)**
            * `RTMMessage.modifiedTime` **(Int64BE)**

* `getMessage(mid, from, xid, type, timeout, callback)`: 获取消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `xid`: **(Required | Int64BE)** to/gid/rid
    * `type`: **(Required | number)** 1,p2p; 2,group; 3, room; 4, broadcast
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `getChat(mid, from, xid, type, timeout, callback)`: 获取聊天
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `xid`: **(Required | Int64BE)** to/gid/rid
    * `type`: **(Required | number)** 1,p2p; 2,group; 3, room; 4, broadcast
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteMessage(mid, from, to, timeout, callback)`: 删除P2P业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 业务消息接收方User id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteGroupMessage(mid, from, gid, timeout, callback)`: 删除Gourp业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** 业务消息接收方Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteRoomMessage(mid, from, rid, timeout, callback)`: 删除Room业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** 业务消息接收方Room id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteBroadcastMessage(mid, from, timeout, callback)`: 删除广播业务消息
    * `mid`: **(Required | Int64BE)** 业务消息 id
    * `from`: **(Required | Int64BE)** admin id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 