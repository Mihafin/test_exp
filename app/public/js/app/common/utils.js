define(["app_params", "common/sound_utils", "common/text_utils", "common/storage", "common/common_utils"], function(AppParams){
    return {
        sound: new SoundUtils(),
        text: new TextUtils(),
        store: new GameStorage(AppParams.app_name),
        common: new CommonUtils()
    }
});