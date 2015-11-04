define(function(){
    var CommonApi = function (on_init) {
        this.on_init = on_init;
        this.api_params = this.init_params();
        this.user_id = this.get_user_id();
    };

    CommonApi.prototype = Object.create(Object.prototype);
    CommonApi.prototype.constructor = CommonApi;

    CommonApi.prototype.init_params = function(){
        return get_url_params();
    };

    CommonApi.prototype.on_api_init = function(){
        //override and call on_api_init
    };

    CommonApi.prototype.on_api_init = function(){
        console.log("api initialization succeeded");
        this.on_init.call(null);
    };

    CommonApi.prototype.on_api_init_error = function(){
        console.log("api initialization failed");
    };

    CommonApi.prototype.load_profiles = function(profiles, cb){
        console.log("load_profiles call with", profiles, cb);
    };

    CommonApi.prototype.get_user_id = function(){
        return this.api_params["user_id"];
    };

    return CommonApi;
});