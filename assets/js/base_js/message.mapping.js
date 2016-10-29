(function(win){
    win.mapping = {
        _mappingList: {
            10010219: {
                decode:{ 
                    _a:"mark",
                    _b:"songName",
                    _c:"nickname"
                },
                encode: {
                    _a:"songId"
                }
            },
            10010220: {
                decode:{
                    _a:"dedicatedSongList",
                    a:{
                        _a:"mark",
                        _b:"songName",
                        _c:"nickname",
                        _d:"state"
                    }
                },
                encode:{}
            },
            10010221: {
                _a:"mark",
                _b:"songName",
                _c:"nickname"
            },
            10010241:{
                encode:{
                    _a:"adventureName"
                },
                decode:{
                    _a:"adventureId",
                    _b:"adventureName"
                }
            },
            10010242: {
                _a:"adventureId"
            },
            10010243:{
                encode:{},
                decode:{
                    _a:"adventureList",
                    a:{
                        _a:"adventureId",
                        _b:"adventureName"
                    }
                }
            },
            10010244:{
                encode:{
                    _a:"adventureId"
                },
                decode:{
                    _a:"mark",
                    _b:"adventureName",
                    _c:"nickname"
                }
            },
            10010245:{
                encode:{
                    _a:"mark"
                },
                decode:{
                    _a:"mark",
                    _b:"adventureName",
                    _c:"nickname"
                }
            },
            10010246:{
                encode:{},
                decode:{
                    _a:"adventureList",
                    a:{
                        _a:"mark",
                        _b:"adventureName",
                        _c:"nickname",
                        _d:"state"
                    }
                }
            },
            10010247:{
                _a:"messageContent",
                _b:"messageHref"
            },
            10010248:{
                encode:{},
                decode:{
                    _a:"messageContent",
                    _b:"messageHref"
                }
            },
            10010250:{
                _a: "state"  
            }
        },
        
        _decode: function(obj, mappingTable){
            for(var shortKey in mappingTable){
                var res = /^_(\w+)$/ig.exec(shortKey);    
                if (!res){
                    continue;
                }
                shortKey = res[1];
                res = null;
                var value = obj[shortKey];
                if (value instanceof  Array){
                    var myMappingTable = mappingTable[shortKey];
                    for (var i = 0; i < value.length ; i++){
                        this._decode(value[i], myMappingTable);
                    }
                }
                else if (value instanceof  Object){
                    this._decode(value, mappingTable[shortKey]);
                }
                var longKey = mappingTable["_" + shortKey];
                obj[longKey] =  value;
                obj[shortKey] = null;
                delete  obj[shortKey];
            }
        },
        decode:function(obj){
            if (typeof obj != "object"){
                throw new Error('Illegal Argument Exception');
                return;
            }
            var mappingTable = this._mappingList[obj.MsgTag];
            if (mappingTable){
                this._decode(obj, mappingTable.decode || mappingTable);
            }
        },
        _encode: function(obj, mappingTable){
            for(var shortKey in mappingTable){
                var res = /^_(\w+)$/ig.exec(shortKey);    
                if (!res){
                    continue;
                }
                shortKey = res[1];
                res = null;
                var longKey = mappingTable["_"+ shortKey];
                var value = obj[longKey];
                if (value instanceof  Array){
                    var myMappingTable = mappingTable[shortKey];
                    for (var i = 0; i < value.length ; i++){
                        this._encode(value[i], myMappingTable);
                    }
                }
                else if (value instanceof  Object){
                    this._encode(value, mappingTable[shortKey]);
                }

                obj[shortKey] =  value;
                obj[longKey] = null;
                delete  obj[longKey];
            }
        },
        encode:function(obj){
            if (typeof obj != "object"){
                throw new Error('Illegal Argument Exception');
                return;
            }
            var mappingTable = this._mappingList[obj.MsgTag];
            if (mappingTable){
                this._encode(obj, mappingTable.encode || mappingTable);
            }
        }
    }

  module.exports = win.mapping;

})(window)
