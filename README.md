# FPNN RTM Node.js SDK #

#### 依赖 ####
* [int64-buffer](https://github.com/kawanet/int64-buffer)
* [msgpack-lite](https://github.com/kawanet/msgpack-lite)

#### IPV6 ####
* `SOCKET`链接支持`IPV6`接口
* 兼容`DNS64/NAT64`网络环境

#### 其他 ####
* 消息发送接口仅支持`UTF-8`格式编码的`string`类型数据,`Binary`数据需进行`Base64`编解码
* 支持部分ES6特性`es-checker` / `babel-cli` / `babel-preset-es2015`, 参考:[node.green](https://node.green/)
* 支持动态转Promise接口, 参考:[Promise.promisifyAll](http://bluebirdjs.com/docs/api/promise.promisifyall.html)

#### 注意 ####

* 使用之前请确保服务器时间校准，否则可能导致签名失败

#### Events ####
* `event`:
    * `connect`: 连接成功 
    * `error`: 发生异常
        * `err`: **(Error)**
    * `close`: 连接关闭
        * `retry`: **(bool)** 是否执行自动重连

#### 一个例子 ####
```javascript
const Int64BE = require("int64-buffer").Int64BE;

//注册
RTMClient.RTMRegistration.register();

//构造
let client = new RTMClient({
    pid: 11000001,
    secret: 'ef3617e5-e886-4a4e-9eef-7263c0320628',
    host: 'rtm-nx-front.ifunplus.cn',
    port: 13315,
    reconnect: true,
    timeout: 20 * 1000,
    debug: true
});

//添加监听
client.on('connect', function() {
    console.log('connected!');
    //发送业务消息
    let from = new Int64BE(0, 1234);
    let to = new Int64BE(0, 5678);
    client.sendMessage(from, to, 8, 'hello !', '', new Int64BE(0), 10 * 1000, function(err, data) {
        if (err) {
            console.error(err.message);
            return;
        }
        if (data) {
            console.log(data);
        }
    });
});
client.on('error', function(err) {
    console.error(err.message);
});
client.on('close', function() {
    console.log('closed!');
});

//添加推送监听
let pushName = RTMConfig.SERVER_PUSH.recvMessage;
client.processor.addPushService(pushName, function(data) {
    console.log('[PUSH] ' + pushName + ': ', data);
});

// 开启连接
client.connect();

//destroy
//client.destroy();
//client = null;
```

#### 接口说明 ####
* [API-SDK接口](README-API.md)
* [PushService-RTM服务主动推送接口](README-PUSH.md)
