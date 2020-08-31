# FPNN RTM Node.js SDK #

#### API ####
* `RTMClient::RTMRegistration::register()`: 注册服务

> constructor

* `constructor(options)`: 构造RTMClient
    * `options`: **(Required | object)**
    * `options.pid`: **(Required | number)** 应用编号, RTM提供
    * `options.secret`: **(Required | string)** 应用加密, RTM提供
    * `options.host`: **(Required | string)** 地址, RTM提供
    * `options.port`: **(Required | string)** 端口, RTM提供
    * `options.reconnect`: **(Optional | bool)** 是否自动重连, 默认: `true`
    * `options.timeout`: **(Optional | number)** 超时时间(ms), 默认: `30 * 1000`
    * `options.debug`: **(Optional | bool)** 是否自动重连, 默认: `false`

> action

* `processor`: **(RTMProcessor)** 监听PushService的句柄

* `destroy()`: 断开链接并销毁

* `connect()`: 开启连接(非加密模式) 

* `connect(peerPubData, options)`: 开启加密连接
    * `peerPubData`: **(Required | Buffer)** 加密公钥, RTM提供
    * `options`: **(Required | object)**
        * `options.curve`: **(Optional | string)** 加密协议, 默认: `secp256k1`
        * `options.strength`: **(Optional | number)** 加密强度, 默认: `128` 
        * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`

* `connect(peerPubData, options)`: 开启加密连接
    * `peerPubData`: **(Required | string)** 加密公钥文件路径, RTM提供
    * `options`: **(Required | object)**
        * `options.curve`: **(Optional | string)** 加密协议, 默认: `secp256k1`
        * `options.strength`: **(Optional | number)** 加密强度, 默认: `128` 
        * `options.streamMode`: **(Optional | bool)** 加密模式, 默认: `package`



> 业务接口

### Token Functions

Please refer [Token Functions](doc/Token.md)



### Chat Functions

Please refer [Chat Functions](doc/Chat.md)



### Messages Functions

Please refer [Messages Functions](doc/Messages.md)



### Files Functions

Please refer [Files Functions](doc/Files.md)



### Friends Functions

Please refer [Friends Functions](doc/Friends.md)



### Groups Functions


Please refer [Groups Functions](doc/Groups.md)



### Rooms Functions

Please refer [Rooms Functions](doc/Rooms.md)



### Users Functions

Please refer [Users Functions](doc/Users.md)



### Data Functions

Please refer [Data Functions](doc/Data.md)



### ValueAdded Functions

Please refer [ValueAdded Functions](doc/ValueAdded.md)
