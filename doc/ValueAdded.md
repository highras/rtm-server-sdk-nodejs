# FPNN RTM Node.js SDK ValueAdded API #

* `translate(text, src, dst, type, profanity, timeout, callback)`: 翻译消息, 需启用翻译服务, 返回{source:原始聊天消息语言类型,target:翻译后的语言类型,sourceText:原始聊天消息,targetText:翻译后的聊天消息}
    * `text`: **(Required | string)** 待翻译的原始聊天消息
    * `src`: **(Required | string)** 待翻译的聊天消息的语言类型, 参考RTMConfig.TRANS_LANGUAGE成员
    * `dst`: **(Required | string)** 本次翻译的目标语言类型, 参考RTMConfig.TRANS_LANGUAGE成员
    * `type`: **(Required | string)** 可选值为`chat`或`mail`, 默认:`chat`
    * `profanity`: **(Required | string)** 敏感语过滤, 设置为以下三项之一: `off` `stop` `censor`
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(source:string,target:string,sourceText:string,targetText:string))** 

* `profanity(text, action, timeout, callback)`: 敏感词过滤, 返回过滤后的字符串或者以错误形式返回, 需启用翻译服务
    * `text`: **(Required | string)** 待检查文本
    * `action`: **(Required | string)** 检查结果返回形式, `stop`: 以错误形式返回, `censor`: 用`*`替换敏感词
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(text:string))** 
            
* `transcribe(audio, uid, profanityFilter, timeout, callback)`: 语音识别, 返回过滤后的字符串或者以错误形式返回, 需启用翻译服务, 设置超时时间不低于60s
    * `audio`: **(Required | Buffer)** 待识别语音数据
    * `uid`: **(Optional | Int64BE)** 用户id
    * `profanityFilter`: **(Optional | bool)** 是否开启过滤
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(text:string,lang:string))** 

* `transcribeMessage(mid, toId, type, profanityFilter, timeout, callback)`: 语音识别, 返回过滤后的字符串或者以错误形式返回, 需启用翻译服务, 设置超时时间不低于60s
    * `mid`: **(Required | Int64BE)** 消息id
    * `toId`: **(Optional | Int64BE)** uid/rid/gid
    * `profanityFilter`: **(Optional | bool)** 是否开启过滤
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(text:string,lang:string))** 