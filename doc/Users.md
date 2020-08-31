# FPNN RTM Node.js SDK Users API #

* `getOnlineUsers(uids, timeout, callback)`: 获取在线用户, 每次最多获取200个
    * `uids`: **(Required | array[Int64BE])** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(array(Int64BE))** 

* `addProjectBlack(uid, btime, timeout, callback)`: 阻止用户消息(project)
    * `uid`: **(Required | Int64BE)** 用户 id
    * `btime`: **(Required | number)** 阻止时间(s)
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `removeProjectBlack(uid, timeout, callback)`: 取消阻止(project)
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `isProjectBlack(uid, timeout, callback)`: 检查阻止(project)
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(ok:bool))** 

* `setUserInfo(uid, oinfo, pinfo, timeout, callback)`: 设置用户的公开信息和私有信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `oinfo`: **(Required | string)** 公开信息
    * `pinfo`: **(Required | string)** 私有信息
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `getUserInfo(uid, timeout, callback)`: 获取用户的公开信息和私有信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(oinfo:string,pinfo:string))** 

* `getUserOpenInfo(uids, timeout, callback)`: 获取其他用户的公开信息, 每次最多获取100人
    * `uids`: **(Required | array(Int64BE))** 多个用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(string,string))** 