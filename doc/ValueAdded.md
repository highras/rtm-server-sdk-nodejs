# FPNN RTM Node.js SDK ValueAdded API #

* `translate(text, src, dst, type, profanity, uid, timeout, callback)`: 翻译消息, 需启用翻译服务, 返回{source:原始聊天消息语言类型,target:翻译后的语言类型,sourceText:原始聊天消息,targetText:翻译后的聊天消息}
    * `text`: **(Required | string)** 待翻译的原始聊天消息
    * `src`: **(Required | string)** 待翻译的聊天消息的语言类型, 参考RTMConfig.TRANS_LANGUAGE成员
    * `dst`: **(Required | string)** 本次翻译的目标语言类型, 参考RTMConfig.TRANS_LANGUAGE成员
    * `type`: **(Required | string)** 可选值为`chat`或`mail`, 默认:`chat`
    * `profanity`: **(Required | string)** 敏感语过滤, 设置为以下项之一: `off`  `censor`
    * `uid`: **(Optional | number)** 用户ID
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(source:string,target:string,sourceText:string,targetText:string))** 

* `textCheck(text, uid, timeout, callback)`: 文本审核
    * `text`: **(Required | string)** 待检查文本
    * `uid`: **(Optional | number)** 用户ID
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(result:number, text:string, tags:list<string>, wlist:list<string>))** 
            * `result`: 0: 通过，2，不通过
            * `text`: 敏感词过滤后的文本内容，含有的敏感词会被替换为*，如果没有被标星，则无此字段
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类
            * `wlist`: 敏感词列表

* `imageCheck(image, type, uid, timeout, callback)`: 图片审核
    * `image`: **(Required | string)** 图片的url 或者内容
    * `type`: **(Required | number)** 1, url, 2, 内容
    * `uid`: **(Optional | number)** 用户ID
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(result: int32, ?tags:list<string>))** 
            * `result`: 0: 通过，2，不通过
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类

* `audioCheck(audio, type, lang, codec, srate, uid, timeout, callback)`: 音频审核
    * `audio`: **(Required | string)** 音频的url 或者内容
    * `type`: **(Required | number)** 1, url, 2, 内容
    * `lang`: **(Required | string)** 音频语言类别
    * `codec`: **(Optional | string)** 为空则默认为AMR_WB
    * `srate`: **(Optional | number)** 为0或者空则默认为16000
    * `uid`: **(Optional | number)** 用户ID
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(result: int32, ?tags:list<string>))** 
            * `result`: 0: 通过，2，不通过
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类

* `videoCheck(video, type, videoName, uid, timeout, callback)`: 视频审核
    * `video`: **(Required | string)** 视频的url 或者内容
    * `type`: **(Required | number)** 1, url, 2, 内容
    * `videoName`: **(Required | string)** 视频名字
    * `uid`: **(Optional | number)** 用户ID
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(result: int32, ?tags:list<string>))** 
            * `result`: 0: 通过，2，不通过
            * `tags`: 触发的分类，比如涉黄涉政等等，具体见文本审核分类

* `speech2Text(audio, type, lang, codec, srate, uid, timeout, callback)`: 语音转文字
    * `audio`: **(Required | string)** 语音的url 或者内容
    * `type`: **(Required | number)** 1, url, 2, 内容
    * `lang`: **(Required | string)** 音频语言类别
    * `codec`: **(Optional | string)** 为空则默认为AMR_WB
    * `srate`: **(Optional | number)** 为0或者空则默认为16000
    * `uid`: **(Optional | number)** 用户ID
    * `timeout`: **(Optional | number)** 超时时间(ms), 默认: `20 * 1000`
    * `callback`: **(Optional | function)** 回调方法, `callback(err, data)`
        * `err`: **(FPError)** 
        * `data`: **(object(text: string, lang: string))** 
