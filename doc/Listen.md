# FPNN RTM Node.js SDK Listen API #

* `addEvtListener(opts, timeout, callback)`: 添加 `事件` / `消息` 监听, 仅对当前链接有效, 增量添加
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.uids`: **(Optional | array[Int64BE])** 多个用户 id
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `removeEvtListener(opts, timeout, callback)`: 删除 `事件` / `消息` 监听, 仅对当前链接有效, 增量取消
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.uids`: **(Optional | array[Int64BE])** 多个用户 id
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `setEvtListener(opts, timeout, callback)`: 更新 `事件` / `消息` 监听, 仅对当前链接有效, 全量覆盖, 每个链接以本次设置为准
    * `opts.p2p`: **(Optional | bool)** `true`: 忽略uids, 监听全部p2p的 `事件` / `消息`,  `false`: 则只监听uids中的 `事件` / `消息`
    * `opts.group`: **(Optional | bool)** `true`: 忽略gids, 监听全部Group的 `事件` / `消息`,  `false`: 则只监听gids中的 `事件` / `消息`
    * `opts.room`: **(Optional | bool)** `true`: 忽略rids, 监听全部Room的 `事件` / `消息`,  `false`: 则只监听rids中的 `事件` / `消息`
    * `opts.ev`: **(Optional | bool)** `true`: 忽略events, 监听全部 `事件`,  `false`: 则只监听events中的 `事件`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 

* `setEvtListener(opts, timeout, callback)`: 更新 `事件` / `消息` 监听, 仅对当前链接有效, 全量覆盖, 每个链接以本次设置为准
    * `opts.gids`: **(Optional | array[Int64BE])** 多个Group id
    * `opts.rids`: **(Optional | array[Int64BE])** 多个Room id
    * `opts.uids`: **(Optional | array[Int64BE])** 多个用户 id
    * `opts.events`: **(Optional | array[string])** 多个事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object)** 