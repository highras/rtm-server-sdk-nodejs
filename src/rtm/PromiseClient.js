'use strict'

const RTMClient = require('./RTMClient');

class PromiseClient{
    constructor(options){
        this._rtmClient = new RTMClient(options);
    }

    get rtmClient(){
        return this._rtmClient;
    }

    enableConnect(){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.enableConnect();

            self._rtmClient.on('connect', () => {
                resolve();
            });

            self._rtmClient.on('error', (err) => {
                reject(err); 
            });
        });
    }
    
    enableEncryptorByData(peerPubData, options){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.enableEncryptorByData(peerPubData, options);

            self._rtmClient.on('connect', () => {
                resolve();
            });

            self._rtmClient.on('error', (err) => {
                reject(err); 
            });
        });
    }

    enableEncryptorByFile(peerPubPath, options){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.enableEncryptorByFile(peerPubPath, options);

            self._rtmClient.on('connect', () => {
                resolve();
            });

            self._rtmClient.on('error', (err) => {
                reject(err); 
            });
        });
    }

    sendMessage(from, to, mtype, msg, attrs, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.sendMessage(from, to, mtype, msg, attrs, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    sendMessages(from, tos, mtype, msg, attrs, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.sendMessages(from, tos, mtype, msg, attrs, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    sendGroupMessage(from, gid, mtype, msg, attrs, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.sendGroupMessage(from, gid, mtype, msg, attrs, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    sendRoomMessage(from, rid, mtype, msg, attrs, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.sendRoomMessage(from, rid, mtype, msg, attrs, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    broadcastMessage(from, mtype, msg, attrs, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.broadcastMessage(from, mtype, msg, attrs, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    addFriends(uid, friends, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.addFriends(uid, friends, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    deleteFriends(uid, friends, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.deleteFriends(uid, friends, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    getFriends(uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getFriends(uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    isFriend(uid, fuid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.isFriend(uid, fuid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    isFriends(uid, fuids, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.isFriends(uid, fuids, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    addGroupMembers(gid, uids, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.addGroupMembers(gid, uids, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    deleteGroupMembers(gid, uids, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.deleteGroupMembers(gid, uids, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    deleteGroup(gid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.deleteGroup(gid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    getGroupMembers(gid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getGroupMembers(gid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    isGroupMember(gid, uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.isGroupMember(gid, uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    getUserGroups(uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getUserGroups(uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    getToken(uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getToken(uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    getOnlineUsers(uids, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getOnlineUsers(uids, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    addGroupBan(gid, uid, btime, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.addGroupBan(gid, uid, btime, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    removeGroupBan(gid, uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.removeGroupBan(gid, uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    addRoomBan(rid, uid, btime, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.addRoomBan(rid, uid, btime, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    removeRoomBan(rid, uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.removeRoomBan(rid, uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    addProjectBlack(uid, btime, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.addProjectBlack(uid, btime, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    removeProjectBlack(uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.removeProjectBlack(uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    isBanOfGroup(gid, uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.isBanOfGroup(gid, uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    isBanOfRoom(rid, uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.isBanOfRoom(rid, uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    isProjectBlack(uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.isProjectBlack(uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    setPushName(uid, pushname, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.setPushName(uid, pushname, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    getPushName(uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getPushName(uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    setGeo(uid, lat, lng, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.setGeo(uid, lat, lng, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    getGeo(uid, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getGeo(uid, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }

    getGeos(uids, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.getGeos(uids, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
    
    sendFile(from, to, mtype, filePath, timeout){
        let self = this;
        return new Promise(function(resolve, reject){
            self._rtmClient.sendFile(from, to, mtype, filePath, (err, data) => {
                if (data){
                    resolve(data);
                }
                if (err){
                    reject(err);
                }
            }, timeout);
        });
    }
}

module.exports = PromiseClient;

