define(["pixi", "common/utils", "app_params"], function(__, Utils, AppParams){
    var Loader = function(){
        PIXI.Container.call(this);
        this.text_field = Utils.text.get_text("", 300);
        this.addChild(this.text_field);
    };

    Loader.prototype = Object.create(PIXI.Container.prototype);
    Loader.prototype.constructor = Loader;

    Loader.prototype.set_text = function(txt){
        this.text_field.text = txt;
        this.text_field.x = AppParams.width/2 - this.text_field.width/2;
        this.text_field.y = AppParams.height/2 - this.text_field.height/2;
    };

    return Loader;
});