# FPNN RTM Node.js SDK System API #

* `kickout(uid, timeout, callback)`: 踢掉一个用户或者一个链接
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `addDevice(uid, apptype, devicetoken, timeout, callback)`: 添加设备, 应用信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `apptype`: **(Required | string)** 应用信息
    * `devicetoken`: **(Required | string)** 设备 token
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 
        
* `removeDevice(uid, devicetoken, timeout, callback)`: 删除设备, 应用信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `devicetoken`: **(Required | string)** 设备 token
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)**

* `addDevicePushOption(uid, type, xid, mtypes, timeout, callback)`: 设置设备推送属性
    * `uid`: **(Required | Int64BE)** 用户 id
    * `type`: **(Required | number)** 0: p2p, 1: group
    * `xid`: **(Required | Int64BE)** from 或 gid
    * `mtypes`: **(Optional | [number])**  mtypes为空，则所有mtype均不推送，其他值，则指定mtype不推送
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `removeDevicePushOption(uid, type, xid, mtypes, timeout, callback)`: 取消设备推送属性
    * `uid`: **(Required | Int64BE)** 用户 id
    * `type`: **(Required | number)** 0: p2p, 1: group
    * `xid`: **(Required | Int64BE)** from 或 gid
    * `mtypes`: **(Optional | [number])**  mtypes为空，则所有mtype均不推送，其他值，则指定mtype不推送
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `getDevicePushOption(uid, timeout, callback)`: 获取设备推送属性
    * `uid`: **(Required | Int64BE)** 用户 id
    * `type`: **(Required | number)** 0: p2p, 1: group
    * `xid`: **(Required | Int64BE)** from 或 gid
    * `mtypes`: **(Optional | [number])**  mtypes为空，则所有mtype均不推送，其他值，则指定mtype不推送
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(p2p:map<string, set<int8>>, group:map<string, set<int8>>)** 