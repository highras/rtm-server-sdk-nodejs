# FPNN RTM Node.js SDK Friends API #

* `addFriends(uid, friends, timeout, callback)`: 添加好友, 每次最多添加100人
    * `uid`: **(Required | Int64BE)** 用户 id
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteFriends(uid, friends, timeout, callback)`: 删除好友, 每次最多删除100人
    * `uid`: **(Required | Int64BE)** 用户 id
    * `friends`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `getFriends(uid, timeout, callback)`: 获取好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(array(Int64BE))** 

* `isFriend(uid, fuid, timeout, callback)`: 判断好友关系
    * `uid`: **(Required | Int64BE)** 用户 id
    * `fuid`: **(Required | Int64BE)** 好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(ok:bool))** 

* `isFriends(uid, fuids, timeout, callback)`: 是否好友
    * `uid`: **(Required | Int64BE)** 用户 id
    * `fuids`: **(Required | array[Int64BE])** 多个好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(array(Int64BE))** 

* `addBlacks(uid, blacks, timeout, callback)`: 拉黑用户，每次最多添加100人，拉黑后对方不能给自己发消息，自己可以给对方发，双方能正常获取session及历史消息
    * `uid`: **(Required | Int64BE)** 用户 id
    * `blacks`: **(Required | array[Int64BE])** 多个用户id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `deleteBlacks(uid, blacks, timeout, callback)`: 解除拉黑，每次最多解除100人
    * `uid`: **(Required | Int64BE)** 用户 id
    * `blacks`: **(Required | array[Int64BE])** 多个用户id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `getBlacks(uid, timeout, callback)`: 获取被uid拉黑的用户列表
    * `uid`: **(Required | Int64BE)** 用户 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(array(Int64BE))** 

* `isBlack(uid, buid, timeout, callback)`: 判断拉黑关系，uid是否被buid的用户拉黑，用在发送单人消息的时候
    * `uid`: **(Required | Int64BE)** 用户 id
    * `buid`: **(Required | Int64BE)** 对方uid
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(ok:bool))** 

* `isBlacks(uid, buids, timeout, callback)`: 判断拉黑关系，每次最多获取100人的好友关系，uid是否被buids中的用户拉黑，用在发送多人消息的时候
    * `uid`: **(Required | Int64BE)** 用户 id
    * `buids`: **(Required | array[Int64BE])** 对方好友 id
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(array(Int64BE))** 