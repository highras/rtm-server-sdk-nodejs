# FPNN RTM Node.js SDK #

#### PushService #### 
* `RTMProcessor::addPushService(name, callback)`: 添加推送回调
    * `name`: **(string)** 推送服务类型, 参考`RTMConfig.SERVER_PUSH`成员
    * `callback`: **(function)** 回调方法

* `RTMProcessor::removePushService(name)`: 删除推送回调
    * `name`: **(string)** 推送服务类型, 参考`RTMConfig.SERVER_PUSH`成员

* `RTMProcessor::hasPushService(name)`: 是否存在推送回调
    * `name`: **(string)** 推送服务类型, 参考`RTMConfig.SERVER_PUSH`成员

> action push

* `ping`: RTM主动ping, 依赖于监听`pushevent`事件
    * `data`: **(object)**

* `pushevent`: RTM主动推送事件
	* `data`: **(object)**
    	* `data.pid`: **(number)** 应用编号
    	* `data.event`: **(string)** 事件名称, 请参考 `RTMConfig.SERVER_EVENT` 成员
    	* `data.uid`: **(Int64BE)** 触发者 id
    	* `data.time`: **(number)** 触发时间(s)
    	* `data.endpoint`: **(string)** 对应的RTMGate地址
    	* `data.data`: **(string)** `预留`

> message push

* `pushmsg`: RTM主动推送P2P业务消息
	* `data`: **(object)**
    	* `data.from`: **(Int64BE)** 发送者 id
	    * `data.to`: **(Int64BE)** 接收者 id
	    * `data.mtype`: **(number)** 业务消息类型
	    * `data.mid`: **(Int64BE)** 业务消息 id, 当前链接会话内唯一
	    * `data.msg`: **(string)** 业务消息内容
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

* `pushgroupmsg`: RTM主动推送Group业务消息
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.gid`: **(Int64BE)** Group id
	    * `data.mtype`: **(number)** 业务消息类型
	    * `data.mid`: **(Int64BE)** 业务消息 id, 当前链接会话内唯一
	    * `data.msg`: **(string)** 业务消息内容
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

* `pushroommsg`: RTM主动推送Room业务消息
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.rid`: **(Int64BE)** Room id
	    * `data.mtype`: **(number)** 业务消息类型
	    * `data.mid`: **(Int64BE)** 业务消息 id, 当前链接会话内唯一
	    * `data.msg`: **(string)** 业务消息内容
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

> file push

* `pushfile`: RTM主动推送P2P文件
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.to`: **(Int64BE)** 接收者 id
	    * `data.mtype`: **(number)** 文件类型, 请参考`RTMConfig.FILE_TYPE`成员
	    * `data.mid`: **(Int64BE)** 业务文件消息 id, 当前链接会话内唯一
	    * `data.fileInfo`: **(object)** 为文件/语音消息时存在
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

* `pushgroupfile`: RTM主动推送Group文件
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.gid`: **(Int64BE)** Group id
	    * `data.mtype`: **(number)** 文件类型, 请参考`RTMConfig.FILE_TYPE`成员
	    * `data.mid`: **(Int64BE)** 业务文件消息 id, 当前链接会话内唯一
	    * `data.fileInfo`: **(object)** 为文件/语音消息时存在
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

* `pushroomfile`: RTM主动推送Room文件
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.rid`: **(Int64BE)** Room id
	    * `data.mtype`: **(number)** 文件类型, 请参考`RTMConfig.FILE_TYPE`成员
	    * `data.mid`: **(Int64BE)** 业务文件消息 id, 当前链接会话内唯一
	    * `data.fileInfo`: **(object)** 为文件/语音消息时存在
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

> chat push

* `pushchat`: RTM主动推送P2P聊天消息
	* `data`: **(object)**
    	* `data.from`: **(Int64BE)** 发送者 id
	    * `data.to`: **(Int64BE)** 接收者 id
	    * `data.mid`: **(Int64BE)** 聊天消息 id, 当前链接会话内唯一
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**
	    * `data.msg`: **(JsonString)** 聊天消息内容
	   		* `source`: **(string)** 原始聊天消息语言类型, 参考`RTMConfig.TRANS_LANGUAGE`成员
            * `target`: **(string)** 翻译后的语言类型, 参考`RTMConfig.TRANS_LANGUAGE`成员
            * `sourceText`: **(string)** 原始聊天消息
            * `targetText`: **(string)** 翻译后的聊天消息 

* `pushgroupchat`: RTM主动推送Group聊天消息
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.gid`: **(Int64BE)** Group id
	    * `data.mid`: **(Int64BE)** 聊天消息 id, 当前链接会话内唯一
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**
	    * `data.msg`: **(JsonString)** 聊天消息内容
	   		* `source`: **(string)** 原始聊天消息语言类型, 参考`RTMConfig.TRANS_LANGUAGE`成员
            * `target`: **(string)** 翻译后的语言类型, 参考`RTMConfig.TRANS_LANGUAGE`成员
            * `sourceText`: **(string)** 原始聊天消息
            * `targetText`: **(string)** 翻译后的聊天消息 

* `pushroomchat`: RTM主动推送Room聊天消息
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.rid`: **(Int64BE)** Room id
	    * `data.mid`: **(Int64BE)** 聊天消息 id, 当前链接会话内唯一
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**
	    * `data.msg`: **(JsonString)** 聊天消息内容
	   		* `source`: **(string)** 原始聊天消息语言类型, 参考`RTMConfig.TRANS_LANGUAGE`成员
            * `target`: **(string)** 翻译后的语言类型, 参考`RTMConfig.TRANS_LANGUAGE`成员
            * `sourceText`: **(string)** 原始聊天消息
            * `targetText`: **(string)** 翻译后的聊天消息 

> cmd push

* `pushcmd`: RTM主动推送聊天命令
	* `data`: **(object)**
    	* `data.from`: **(Int64BE)** 发送者 id
	    * `data.to`: **(Int64BE)** 接收者 id
	    * `data.mid`: **(Int64BE)** 命令消息 id, 当前链接会话内唯一
	    * `data.msg`: **(string)** 命令内容
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

* `pushgroupcmd`: RTM主动推送Group聊天命令
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.gid`: **(Int64BE)** Group id
	    * `data.mid`: **(Int64BE)** 命令消息 id, 当前链接会话内唯一
	    * `data.msg`: **(string)** 命令内容
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**

* `pushroomcmd`: RTM主动推送Room聊天命令
	* `data`: **(object)**
	    * `data.from`: **(Int64BE)** 发送者 id
	    * `data.rid`: **(Int64BE)** Room id
	    * `data.mid`: **(Int64BE)** 命令消息 id, 当前链接会话内唯一
	    * `data.msg`: **(string)** 命令内容
	    * `data.attrs`: **(string)** 发送时附加的自定义内容
	    * `data.mtime`: **(Int64BE)**
