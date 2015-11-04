define(["games/three_match/field", "games/game_result", "common/utils"], function (ThreeMatchGameField, GameResult, Utils) {
    var ThreeMatchGame = function(){
        PIXI.Container.call(this);

        this._ready_cb = null;
        this._end_cb = null;
        this._init_data = null;
        this._game_field = null;
        this._counters = null;
        this.cnt = 0;
        this.points = 0;
    };

    ThreeMatchGame.prototype = Object.create(PIXI.Container.prototype);
    ThreeMatchGame.prototype.constructor = ThreeMatchGame;

    ThreeMatchGame.prototype.init = function(data, on_ready_cb, on_end_cb) {
        this._ready_cb = on_ready_cb;
        this._end_cb = on_end_cb;
        this._init_data = data;
        this._game_field = new ThreeMatchGameField();
        this._game_field.init(data, this.show_game.bind(this), this);

        this._counters = new PIXI.Container();
    };

    ThreeMatchGame.prototype.show_game = function(){
        var is_valid_data = this._game_field.is_valid_data();
        if (!is_valid_data) {
            console.log("check_field_data error", this._init_data);
            var result = GameResult.get_error_result("check_field_data_error");
            this._end_cb(result);
            return;
        }

        this.addChild(this._game_field);
        this.addChild(this._counters);
        this.draw_counters();
        this._ready_cb();
    };

    ThreeMatchGame.prototype.game_end = function(result){
        this.destroy();
        this._end_cb(result);
    };

    ThreeMatchGame.prototype.on_swap = function(){
        this.cnt++;
    };

    ThreeMatchGame.prototype.on_delete_cells = function(cells){
        console.log("cells====", cells);
        this.points += cells.length;
        this.draw_counters();
    };

    ThreeMatchGame.prototype.destroy = function(){
        console.log("destroy", this);
        if (this._game_field && this._game_field.parent == this){
            this.removeChild(this._game_field);
        }
    };

    ThreeMatchGame.prototype.draw_counters = function(){
        if (this._counters.children.length == 0){
            this._counter_text_field = Utils.text.get_text("", 400);
            this._counter_text_field.x = -100;
            this._counters.addChild(this._counter_text_field);
        }

        this._counter_text_field.text = "cnt=" + this.cnt + "\npnts=" + this.points;
    };

    return ThreeMatchGame;
});