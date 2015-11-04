var GameStorage = function (main_key){
    this.main_key = main_key || "game_1";
    this.is_support = this.support();
    if (!this.is_support){ console.log("storage is not support!")}
};

GameStorage.prototype.support = function(){
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    }
    catch (e) {
        return false;
    }
};

GameStorage.prototype.get = function(key){
    if (!this.is_support) return null;
    return window.localStorage[this.main_key + "_" + key];
};

GameStorage.prototype.set = function(key, obj){
    if (!this.is_support) return;
    window.localStorage[this.main_key + "_" + key] = obj;
};