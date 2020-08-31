# FPNN RTM Node.js SDK Token API #

* `getToken(uid, timeout, callback)`: 获取token
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(token:string))** 

* `kickout(uid, ce, timeout, callback)`: 踢掉一个用户或者一个链接
    * `uid`: **(Required | Int64BE)** 用户 id
    * `ce`: **(Optional | string)** 踢掉`ce`对应链接, 为`null`则踢掉该用户, 多点登录情况
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

* `removeToken(uid, timeout, callback)`: 删除一个用户的token
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)**