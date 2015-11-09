define(["pixi", "ui/settings", "games/three_match_game", "app_params" ], function(__, SettingsBar, tmg, AppParams){
    var Game = function(){
        PIXI.Container.call(this);

        this.game_layer = new PIXI.Container();
        //this.map_layer = new PIXI.Container();
        this.gui_layer = new PIXI.Container();
    };

    Game.prototype = Object.create(PIXI.Container.prototype);
    Game.prototype.constructor = Game;

    Game.prototype.init = function (){
        console.log("game init");
        this.addChild(this.game_layer);

        this.setting_bar = new SettingsBar();
        this.setting_bar.x = 20;
        this.setting_bar.y = 20;
        this.gui_layer.addChild(this.setting_bar);
        this.addChild(this.gui_layer);

        //this.start_test_game();
    };

    Game.prototype.start_test_game = function(){
        //----test game----
        var game_data = {name: "three_match_game",
            field: [
                "11111100",
                "11111111",
                "11111100",
                "11111111",
                "11111100",
                "11111111",
                "11111100",
                "11111111"
            ],
            possible_types: [
                {type: 1, match_types: [1], prob: 1},
                {type: 2, match_types: [2], prob: 1},
                {type: 3, match_types: [3], prob: 1},
                {type: 4, match_types: [4], prob: 1},
                {type: 5, match_types: [5], prob: 1},
                {type: 6, match_types: [6], prob: 1}
            ]
        };
        this.start_game(game_data);
        //--------
    };

    Game.prototype.start_game = function(data){
        console.log("start game", data);
        if (this.current_game){
            this.game_over();
        }
        //
        //this.show_load();
        var game_class = this.get_game_class(data["name"]);
        this.current_game = new game_class();
        this.current_game.init(data, this.game_inited.bind(this), this.game_over.bind(this));
    };

    Game.prototype.game_inited = function(){
        //console.log("game_inited", this.current_game._init_data);
        //this.hide_load();
        this.game_layer.addChild(this.current_game);
        this.current_game.x = AppParams.width / 2 - this.current_game.width / 2;
        this.current_game.y = AppParams.height / 2 - this.current_game.height / 2;
        //TweenLite.from(this.current_game, 1, {alpha: 0, y: -500});
    };

    Game.prototype.game_over = function(game_result){
        console.log("game_result=", game_result);
        this.game_layer.removeChild(this.current_game);
    };

    Game.prototype.get_game_class = function (name) {
        return require("games/" + name);
    };

    return Game;
});