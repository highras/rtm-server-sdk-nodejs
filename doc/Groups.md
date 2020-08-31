# FPNN RTM Node.js SDK Friends API #

* `addGroupMembers(gid, uids, timeout, callback)`: 添加group成员, 每次最多添加100人
    * `gid`: **(Required | Int64BE)** Group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteGroupMembers(gid, uids, timeout, callback)`:  删除group成员, 每次最多删除100人
    * `gid`: **(Required | Int64BE)** Group id
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteGroup(gid, timeout, callback)`: 删除Group
    * `gid`: **(Required | Int64BE)** Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `getGroupMembers(gid, timeout, callback)`: 获取Group成员
    * `gid`: **(Required | Int64BE)** Group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(array[Int64BE])** 

* `isGroupMember(gid, uid, timeout, callback)`: 是否Group成员
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(ok:bool))** 

* `getUserGroups(uid, timeout, callback)`: 获取用户的Group
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(array(Int64BE))** 

* `addGroupBan(gid, uid, btime, timeout, callback)`: 阻止用户消息(Group)
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `removeGroupBan(gid, uid, timeout, callback)`: 取消阻止(Group)
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `isBanOfGroup(gid, uid, timeout, callback)`: 检查阻止(Group)
    * `gid`: **(Required | Int64BE)** Group id
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(ojbect(ok:bool))** 

* `setGroupInfo(gid, oinfo, pinfo, timeout, callback)`: 设置Group的公开信息和私有信息
    * `gid`: **(Required | Int64BE)** group id
    * `oinfo`: **(Required | string)** 公开信息
    * `pinfo`: **(Required | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(ojbect)** 

* `getGroupInfo(gid, timeout, callback)`: 获取Group的公开信息和私有信息
    * `gid`: **(Required | Int64BE)** group id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(ojbect(oinfo:string,pinfo:string))** 