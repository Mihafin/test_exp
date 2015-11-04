define(["api/common", "//vk.com/js/api/xd_connection.js?2"], function(CommonApi){

    var SocialApi = function (on_init) {
        CommonApi.call(this, on_init);
    };

    SocialApi.prototype = Object.create(CommonApi.prototype);
    SocialApi.prototype.constructor = SocialApi;

    SocialApi.prototype.init_api = function(){
        VK.init(
            function(){ this.on_api_init();}.bind(this),
            function(){ this.on_api_init_error(); }.bind(this),
            '5.37'
        );
    };

    SocialApi.prototype.load_profiles = function(profiles, cb){
        VK.api('users.get',{user_ids: profiles.join(","), fields: "first_name,last_name,sex,photo_50"},
            function(data) {
                if (data.response) {
                    var profiles = this.convert_profiles(data.response);
                    //this.cache_profiles(profiles);
                    cb.call(null, profiles);
                }
                else{
                    //Game.error(data.error);
                    console.log("error api:", data);
                }
            }.bind(this)
        );
    };

    SocialApi.prototype.convert_profiles = function(profiles){
        var res = [];
        profiles.forEach(function(social_profile){
            var prof = new UserProfile();
            prof.first_name = social_profile.first_name;
            prof.last_name = social_profile.last_name;
            prof.img50 = social_profile.photo_50;
            prof.sex = social_profile.sex;
            res.push(prof);
        });
        return res;
    };

    return SocialApi;
});

