'use strict'

const crypto = require('crypto');
const conf = require('./FPConfig');

class FPEncryptor{
    constructor(fppkg){
        this._pubKey = null;
        this._iv = null;
        this._key = null;
        this._strength = null;
        this._streamMode = false;
        this._crypto = false;
        this._cryptoed = false;

        this._pkg = fppkg;
    }

    encryptor(pemData, curveName, strength, streamMode){
        if (conf.CRYPTO_CURVES.indexOf(curveName) == -1){
            curveName = conf.CRYPTO_CURVES[0];
        }

        if (strength != 128 && strength != 256){
            strength = 128;
        }

        if (streamMode === undefined){
            streamMode = false; 
        }

        this._streamMode = streamMode;
        this._strength = strength;

        let ecdh = crypto.createECDH(curveName);
        let keys = ecdh.generateKeys();

        let pbuf = ecdh.getPublicKey();
        this._pubKey = Buffer.allocUnsafe(64);

        pbuf.copy(this._pubKey, 0, 1); 

        let secret = ecdh.computeSecret(pemData);
        this._iv = md5.call(this, secret);

        if (this._strength == 128){
            this._key = Buffer.allocUnsafe(16);
            secret.copy(this._key, 0, 0, 16);
        }

        if (this._strength == 256){
            if (secret.length == 32){
                this._key = Buffer.allocUnsafe(32);
                secret.copy(this._key, 0, 0); 
            }else{
                this.key = sha256.call(this, secret);
            }
        }
        this._crypto = true;
    }

    get pubKey(){
        return this._pubKey;
    }

    get key(){
        return this._key;
    }

    get iv(){
        return this._iv;
    }

    get strength(){
        return this._strength;
    }

    get streamMode(){
        return this._streamMode;
    }

    get crypto(){
        return this._crypto;
    }

    get cryptoed(){
        return this._cryptoed;
    }

    set cryptoed(value){
        this._cryptoed = value;
    }

    deCode(buf){
        if (this._cryptoed && !this._streamMode){
            return cryptoDecode.call(this, buf);
        }

        return buf;
    }

    enCode(buf){
        if (this._cryptoed && !this._streamMode){
            return cryptoEncode.call(this, buf);
        }

        return buf;
    }

    peekHead(buf){
        if (!this._cryptoed){
            return commonPeekHead.call(this, buf);
        }

        if (this.cryptoed && this._streamMode){
            return streamPeekHead.call(this, buf);
        } 

        if (this._cryptoed && !this._streamMode){
            return cryptoPeekHead.call(this, buf);
        }

        return null;
    }
}

function cryptoDecode(buf){
    let algorithm = conf.CRYPTO_ALGORITHM[0];

    if (this._strength == 256){
        algorithm = conf.CRYPTO_ALGORITHM[1];
    }

    let encrypted = Buffer.allocUnsafe(buf.length - 4);
    buf.copy(encrypted, 0, 4); 

    let decipher = crypto.createDecipheriv(algorithm, this._key, this._iv);
    let decrypted = decipher.update(encrypted);
    let final = decipher.final();

    return Buffer.concat([decrypted, final], decrypted.length + final.length);
}

function streamDecode(buf){
    //TODO
}

function cryptoEncode(buf){
    let algorithm = conf.CRYPTO_ALGORITHM[0];

    if (this._strength == 256){
        algorithm = conf.CRYPTO_ALGORITHM[1];
    }

    let cipher = crypto.createCipheriv(algorithm, this._key, this._iv);
    let encrypted = cipher.update(buf);
    let final = cipher.final();

    buf = Buffer.concat([encrypted, final], encrypted.length + final.length);
    let cbuf = Buffer.allocUnsafe(buf.length + 4);

    cbuf.writeUInt32LE(buf.length, 0); 
    buf.copy(cbuf, 4, 0);
    return cbuf;
}

function streamEncode(buf){
    //TODO
}

function commonPeekHead(buf){
    let data = null;

    if (buf.length >= 12){
        data = this._pkg.peekHead(buf);

        if (!checkHead.call(this, data)){
            return null;
        }

        if (this._pkg.isOneWay(data)){
            data.pkgLen = 12 + data.ss + data.psize;
        }

        if (this._pkg.isTwoWay(data)){
            data.pkgLen = 16 + data.ss + data.psize;
        }

        if (this._pkg.isAnswer(data)){
            data.pkgLen = 16 + data.psize;
        }
    }

    return data;
}

function cryptoPeekHead(buf){
    let data = null;

    if (buf.length >= 4){
        data = { pkgLen: buf.readUInt32LE(0) + 4 };

        if (data.pkgLen > 8 * 1024 * 1024){
            return null;
        }
    }

    return data;
}

function streamPeekHead(buf){
    //TODO
}

function checkHead(data){
    if (!conf.TCP_MAGIC.equals(data.magic) && !conf.HTTP_MAGIC.equals(data.magic)){
        return false;
    }

    if (data.version < 0 || data.version >= conf.FPNN_VERSION.length){
        return false;
    }

    if (data.flag < 0 || data.flag >= conf.FP_FLAG.length){
        return false;
    }
    
    if (data.mtype < 0 || data.mtype >= conf.FP_MESSAGE_TYPE.length){
        return false;
    }

    return true;
}

function md5(data){
    let hash = crypto.createHash('md5');
    hash.update(data);
    return hash.digest();
}

function sha256(data){
    let hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest();
}

module.exports = FPEncryptor;