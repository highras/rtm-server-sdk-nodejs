# FPNN RTM Node.js SDK Chat API #

* `sendChat(from, to, msg, attrs, mid, timeout, callback)`: 发送聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复业务消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))**

* `sendCmd(from, to, msg, attrs, mid, timeout, callback)`: 发送聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 接收方uid
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复业务消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))**

* `sendChats(from, tos, msg, attrs, mid, timeout, callback)`: 发送多人聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))**

* `sendCmds(from, tos, msg, attrs, mid, timeout, callback)`: 发送多人聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `tos`: **(Required | array[Int64BE])** 接收方uids
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 没有可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))**

* `sendGroupChat(from, gid, msg, attrs, mid, timeout, callback)`: 发送group聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)**聊天消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `sendGroupCmd(from, gid, msg, attrs, mid, timeout, callback)`: 发送group聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** Group id
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `sendRoomChat(from, rid, msg, attrs, timeout, callback)`: 发送room聊天消息, 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `sendRoomCmd(from, rid, msg, attrs, timeout, callback)`: 发送room聊天命令, 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** Room id
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `broadcastChat(from, msg, attrs, timeout, callback)`: 广播聊天消息(andmin id), 消息类型`RTMConfig.CHAT_TYPE.text`
    * `from`: **(Required | Int64BE)** admin id
    * `msg`: **(Required | string)** 聊天消息内容，附加修饰信息不要放这里，方便后继的操作，比如翻译，敏感词过滤等等
    * `attrs`: **(Required | string)** 聊天消息附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 聊天消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `broadcastCmd(from, msg, attrs, timeout, callback)`: 广播聊天命令(andmin id), 消息类型`RTMConfig.CHAT_TYPE.cmd`
    * `from`: **(Required | Int64BE)** admin id
    * `msg`: **(Required | string)** 聊天命令
    * `attrs`: **(Required | string)** 命令附加信息, 可传`''`
    * `mid`: **(Optional | Int64BE)** 命令消息 id, 用于过滤重复聊天消息, 非重发时为`Int64BE(0)`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(object(mid:Int64BE,error:FPError))** 
        * `data`: **(object(mid:Int64BE,mtime:Int64BE))** 

* `getGroupChat(uid, gid, desc, num, begin, end, lastid, timeout, callback)`: 获取Group历史聊天消息, `mtypes=Arrays.asList((byte)30)`
    * `uid`: **(Required | Int64BE)** 用户id
    * `gid`: **(Required | Int64BE)** Group id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
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

* `getRoomChat(uid, rid, desc, num, begin, end, lastid, timeout, callback)`: 获取Room历史聊天消息, `mtypes=Arrays.asList((byte)30)`
    * `uid`: **(Required | Int64BE)** 用户id
    * `rid`: **(Required | Int64BE)** Room id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
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

* `getBroadcastChat(uid, desc, num, begin, end, lastid, timeout, callback)`: 获取广播历史聊天消息, `mtypes=Arrays.asList((byte)30)`
    * `uid`: **(Required | Int64BE)** 用户id
    * `desc`: **(Required | bool)** `true`: 则从`end`的时间戳开始倒序翻页, `false`: 则从`begin`的时间戳顺序翻页
    * `num`: **(Required | number)** 获取数量, **一次最多获取20条, 建议10条**
    * `begin`: **(Optional | Int64BE)** 开始时间戳, 毫秒, 默认`0`, 条件：`>=`
    * `end`: **(Optional | Int64BE)** 结束时间戳, 毫秒, 默认`0`, 条件：`<=`
    * `lastid`: **(Optional | Int64BE)** 最后一条消息的id, 第一次默认传`0`, 条件：`> or <`
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

* `deleteChat(mid, from, to, timeout, callback)`: 删除P2P聊天消息
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `to`: **(Required | Int64BE)** 聊天消息接收方User id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteGroupChat(mid, from, gid, timeout, callback)`: 删除Group聊天消息
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `gid`: **(Required | Int64BE)** 聊天消息接收方Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteRoomChat(mid, from, rid, timeout, callback)`: 删除Room聊天消息
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** 发送方 id
    * `rid`: **(Required | Int64BE)** 聊天消息接收方Room id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteBroadcastChat(mid, from, timeout, callback)`: 删除广播聊天消息(admin id)
    * `mid`: **(Required | Int64BE)** 聊天消息 id
    * `from`: **(Required | Int64BE)** admin id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 