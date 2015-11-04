define(["pixi", "common/utils", "timeline_lite", "scene"], function(__, Utils, t, scene){
    var SettingsBar = function (){
        PIXI.Container.call(this);
        this.init_sound_icon();
    };

    SettingsBar.prototype = Object.create(PIXI.Container.prototype);
    SettingsBar.prototype.constructor = SettingsBar;

    SettingsBar.prototype.init_sound_icon = function(){
        this.sound_icon = new PIXI.Sprite.fromImage("assets/fullscreen.png");
        this.sound_icon.interactive = true;
        this.sound_icon.on('click', this.sound_icon_click.bind(this));
        this.sound_icon.buttonMode = true;
        this.sound_icon.anchor = new PIXI.Point(0.5, 0.5);
        this.addChild(this.sound_icon);

        this.show_sound_anim(Utils.sound.is_sound_on);
    };

    SettingsBar.prototype.sound_icon_click = function(){
        var new_state = scene.toggle_sound();
        this.show_sound_anim(new_state);
    };

    SettingsBar.prototype.show_sound_anim = function(is_on){
        var tl = new TimelineLite();
        tl.to(this.sound_icon, 0.5, {rotation: is_on ? 0 : Math.PI});
    };

    return SettingsBar;
});