# FPNN RTM Node.js SDK Data API #

* `dataGet(uid, key, timeout, callback)`: 获取存储的数据信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(val:string))** 

* `dataSet(uid, key, val, timeout, callback)`: 设置存储的数据信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128字节`
    * `val`: **(Required | string)** 存储数据实际内容, 最长`65535字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `dataDelete(uid, key, timeout, callback)`: 删除存储的数据信息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `key`: **(Required | string)** 存储数据对应键值, 最长`128字节`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 