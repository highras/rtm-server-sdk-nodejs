'use strict'

class RTMConfig {
	static get VERSION() {
		return '1.0.6';
	}

	static get API_VERSION() {
		return '2.1.0';
	}

	static get MID_TTL() {
		//MID缓存超时时间(ms)
		return 5 * 1000;
	}

	static get RECONN_COUNT_ONCE() {
		//一次重新连接流程中的尝试次数
		return 1;
	}

	static get CONNCT_INTERVAL() {
		//尝试重新连接的时间间隔(ms)
		return 1 * 1000;
	}

	static get RECV_PING_TIMEOUT() {
		//收到Ping超时时间(ms)
		return 40 * 1000;
	}

	static get FILE_TYPE() {
		return FILE_TYPE;
	}

	static get CHAT_TYPE() {
		return CHAT_TYPE;
	}

	static get SERVER_PUSH() {
		return SERVER_PUSH;
	}

	static get SERVER_EVENT() {
		return SERVER_EVENT;
	}

	static get TRANS_LANGUAGE() {
		return TRANS_LANGUAGE;
	}

	static get ERROR_CODE() {
		return ERROR_CODE;
	}
}

const FILE_TYPE = {
	image: 40, 				//图片
	audio: 41,  			//语音
	video: 42, 				//视频
	file: 50 				//泛指文件，服务器会修改此值（如果服务器可以判断出具体类型的话，仅在mtype=50的情况下）
};

const CHAT_TYPE = {
    text: 30,             	//文本
    audio: 31,           	//语音
    cmd: 32              	//命令
};


const SERVER_PUSH = {
	recvPing: 'ping',
	recvEvent: 'pushevent',

	recvMessage: 'pushmsg',
	recvGroupMessage: 'pushgroupmsg',
	recvRoomMessage: 'pushroommsg',

	recvFile: 'pushfile',
	recvGroupFile: 'pushgroupfile',
	recvRoomFile: 'pushroomfile',

	recvChat: 'pushchat',
    recvGroupChat: 'pushgroupchat',
    recvRoomChat: 'pushroomchat',

    recvAudio: 'pushaudio',
    recvGroupAudio: 'pushgroupaudio',
    recvRoomAudio: 'pushroomaudio',

    recvCmd: 'pushcmd',
    recvGroupCmd: 'pushgroupcmd',
    recvRoomCmd: 'pushroomcmd'
};

const SERVER_EVENT = {
	login: 'login',
	logout: 'logout'
};

const TRANS_LANGUAGE = {
	ar: 'ar',             //阿拉伯语
    nl: 'nl',             //荷兰语
    en: 'en',             //英语
    fr: 'fr',             //法语
    de: 'de',             //德语
    el: 'el',             //希腊语
    id: 'id',             //印度尼西亚语
    it: 'it',             //意大利语
    ja: 'ja',             //日语
    ko: 'ko',             //韩语
    no: 'no',             //挪威语
    pl: 'pl',             //波兰语
    pt: 'pt',             //葡萄牙语
    ru: 'ru',             //俄语
    es: 'es',             //西班牙语
    sv: 'sv',             //瑞典语
    tl: 'tl',             //塔加路语（菲律宾语）
    th: 'th',             //泰语
    tr: 'tr',             //土耳其语
    vi: 'vi',             //越南语
    zh_cn: 'zh-CN',       //中文（简体）
    zh_tw: 'zh-TW'        //中文（繁体）
};

const ERROR_CODE = {
	RTM_EC_INVALID_PROJECT_ID_OR_USER_ID: 200001,
	RTM_EC_INVALID_PROJECT_ID_OR_SIGN: 200002,
	RTM_EC_INVALID_FILE_OR_SIGN_OR_TOKEN: 200003,
	RTM_EC_ATTRS_WITHOUT_SIGN_OR_EXT: 200004,

	RTM_EC_API_FREQUENCY_LIMITED: 200010,
	RTM_EC_MESSAGE_FREQUENCY_LIMITED: 200011,

	RTM_EC_FORBIDDEN_METHOD: 200020,
	RTM_EC_PERMISSION_DENIED: 200021,
	RTM_EC_UNAUTHORIZED: 200022,
	RTM_EC_DUPLCATED_AUTH: 200023,
	RTM_EC_AUTH_DENIED: 200024,
	RTM_EC_ADMIN_LOGIN: 200025,
	RTM_EC_ADMIN_ONLY: 200026,

	RTM_EC_LARGE_MESSAGE_OR_ATTRS: 200030,
	RTM_EC_LARGE_FILE_OR_ATTRS: 200031,
	RTM_EC_TOO_MANY_ITEMS_IN_PARAMETERS: 200032,
	RTM_EC_EMPTY_PARAMETER: 200033,

	RTM_EC_NOT_IN_ROOM: 200040,
	RTM_EC_NOT_GROUP_MEMBER: 200041,
	RTM_EC_MAX_GROUP_MEMBER_COUNT: 200042,
	RTM_EC_NOT_FRIEND: 200043,
	RTM_EC_BANNED_IN_GROUP: 200044,
	RTM_EC_BANNED_IN_ROOM: 200045,
	RTM_EC_EMPTY_GROUP: 200046,
	RTM_EC_ENTER_TOO_MANY_ROOMS: 200047,

	RTM_EC_UNSUPPORTED_LANGUAGE: 200050,
	RTM_EC_EMPTY_TRANSLATION: 200051,
	RTM_EC_SEND_TO_SELF: 200052,
	RTM_EC_DUPLCATED_MID: 200053,
	RTM_EC_SENSITIVE_WORDS: 200054,

	RTM_EC_UNKNOWN_ERROR: 200999
};

module.exports = RTMConfig;