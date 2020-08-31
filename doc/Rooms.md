# FPNN RTM Node.js SDK Rooms API #

* `addRoomBan(rid, uid, btime, timeout, callback)`: 阻止用户消息(Room)
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `removeRoomBan(rid, uid, timeout, callback)`: 取消阻止(Room)
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `isBanOfRoom(rid, uid, timeout, callback)`: 检查阻止(Room)
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(ok:bool))** 

* `addRoomMember(rid, uid, timeout, callback)`: 添加Room成员
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteRoomMember(rid, uid, timeout, callback)`: 删除Room成员
    * `rid`: **(Required | Int64BE)** Room id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `setRoomInfo(rid, oinfo, pinfo, timeout, callback)`: 设置Room的公开信息和私有信息
    * `rid`: **(Required | Int64BE)** room id
    * `oinfo`: **(Required | string)** 公开信息
    * `pinfo`: **(Required | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `getRoomInfo(rid, timeout, callback)`: 获取Room的公开信息和私有信息
    * `rid`: **(Required | Int64BE)** room id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(oinfo:string,pinfo:string))** 