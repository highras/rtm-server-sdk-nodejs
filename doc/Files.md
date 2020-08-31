# FPNN RTM Node.js SDK Files API #

* `fileToken(from, cmd, tos, to, rid, gid, timeout, callback)`: 获取发送文件的token
    * `from`: **(Required | Int64BE)** 发送方 id
    * `cmd`: **(Required | string)** 文件发送方式`sendfile | sendfiles | sendroomfile | sendgroupfile | broadcastfile`
    * `tos`: **(Optional | array[Int64BE])** 接收方 uids
    * `to`: **(Optional | Int64BE)** 接收方 uid
    * `rid`: **(Optional | Int64BE)** Room id
    * `gid`: **(Optional | Int64BE)** Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(token:string,endpoint:string))** 

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
        * `err`: **(FPError)** 
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
        * `err`: **(FPError)** 
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
        * `err`: **(FPError)** 
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
        * `err`: **(FPError)** 
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
        * `err`: **(FPError)** 
        * `data`: **(object(mid:Int64BE,payload:object(mtime:Int64BE)))** 