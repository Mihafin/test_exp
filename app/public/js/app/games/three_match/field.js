define(["games/three_match/cube", "common/utils", "games/three_match/processor", "games/three_match/animator"],
function (Cube, Utils, Processor, animator) {
    var COLOR_CNT = 6;
    var COR_X = 0;
    var COR_Y = 0;
    var CUBE_WIDTH = 50;
    var CUBE_HEIGHT = 50;

    var ThreeMatchGameField = function () {
        PIXI.Container.call(this);

        this.items = null;
        this.items_by_id = null;
        this.item_on_mouse = {};

        this.buttonMode = true;
        this.interactive = true;
        this.swapping = false;

        this.animator = animator;
    };

    ThreeMatchGameField.prototype = Object.create(PIXI.Container.prototype);
    ThreeMatchGameField.prototype.constructor = ThreeMatchGameField;
    ThreeMatchGameField.prototype.pop_sound = "sounds/bubble_pop.mp3";
    ThreeMatchGameField.prototype.bell_sound = "sounds/bell1.mp3";

    ThreeMatchGameField.prototype.init = function (init_data, on_load, game) {
        this.game = game;
        this._init_data = init_data;
        this._on_load = on_load;
        this.load_art();
        Utils.sound.load_sound(this.pop_sound);
        Utils.sound.load_sound(this.bell_sound);

        this
            // events for drag start
            .on('mousedown', this.on_mousedown)
            .on('touchstart', this.on_mousedown)
            // events for drag end
            .on('mouseup', this.on_mouseup)
            .on('mouseupoutside', this.on_mouseup)
            .on('touchend', this.on_mouseup)
            .on('touchendoutside', this.on_mouseup)
            // events for drag move
            .on('mousemove', this.on_mousemove)
            .on('touchmove', this.on_mousemove);

        document.addEventListener('keydown', this.onKeyDown);
    };

    ThreeMatchGameField.prototype.onKeyDown = function(key){
        if (key.keyCode === 84 || key.keyCode === 116) { //T key
            console.log("ket T is pressed");

            var tst_fld = [
                "12121212",
                "21212121",
                "12133312",
                "21213121",
                "12123212",
                "21212121",
                "12121211",
                "21212121"
            ];
            var fld = [];
            for (var row=0; row < tst_fld.length; row++){
                fld[row] = [];
                for (var col=0; col < tst_fld[row].length; col++){
                    var t = tst_fld[row][col];
                    fld[row][col] = {row: row, col: col, disabled: t == '-', type: t};
                }
            }

            var p = new Processor({field: [[]]});
            console.log("fld=", fld);
            var s = new Date().valueOf();
            var pr = p.find_patterns(fld);
            var e = new Date().valueOf();
            console.log(e-s, pr);
        }
    };

    ThreeMatchGameField.prototype.dispatch_mouse_event = function (name, e) {
        switch (name) {
            case "on_mousedown":
            {
                var new_down_item = this.cube_on_mouse(e.data);
                if (new_down_item == null) return;

                if (this.item_on_mouse.sel_item != null) {
                    if (new_down_item != this.item_on_mouse.sel_item) {
                        this.swap_process(this.item_on_mouse.sel_item, new_down_item);
                    }
                    else {
                        new_down_item.unselect();
                        this.item_on_mouse = {};
                    }
                    return;
                }
                this.item_on_mouse = {down_item: new_down_item};
                new_down_item.select();
                break;
            }
            case "on_mouseup":
            {
                var up_item = this.cube_on_mouse(e.data);
                if (up_item == null) {
                    this.item_on_mouse = {sel_item: this.item_on_mouse.down_item};
                    return;
                }

                if (this.item_on_mouse.down_item && up_item == this.item_on_mouse.down_item)
                    this.item_on_mouse = {sel_item: up_item};
                else
                    this.item_on_mouse = {};
                break;
            }
            case "on_mousemove":
            {
                if (this.item_on_mouse.down_item == null) return;

                var old_move_item = this.item_on_mouse.move_item;
                var new_move_item = this.cube_on_mouse(e.data);
                this.item_on_mouse.move_item = new_move_item;
                if (new_move_item && new_move_item != this.item_on_mouse.down_item && old_move_item != new_move_item) {
                    this.swap_process(this.item_on_mouse.down_item, new_move_item);
                }
                break;
            }
        }
    };

    ThreeMatchGameField.prototype.swap_process = function (first, second) {
        this.proc.check_swap(first.cell, second.cell,
            this.swap.bind(this), this.renew_select.bind(this), this.fail_swap.bind(this)
        );
    };

    ThreeMatchGameField.prototype.get_cube = function(cell){
        return this.items[cell.row][cell.col];
    };

    ThreeMatchGameField.prototype.renew_select = function (old_cube, new_cube) {
        old_cube = this.get_cube(old_cube);
        new_cube = this.get_cube(new_cube);
        old_cube.unselect();
        new_cube.select();
        this.item_on_mouse = {down_item: new_cube};
    };

    ThreeMatchGameField.prototype.swap = function (c1, c2) {
        this.start_move();

        c1 = this.get_cube(c1);
        c2 = this.get_cube(c2);
        this.item_on_mouse = {};
        c1.unselect();
        c2.unselect();
        this.items[c1.row][c1.col] = c2;
        this.items[c2.row][c2.col] = c1;

        this.game.on_swap();
        this.animator.change_cubes(c1, c2, this.try_process_matches.bind(this));
        this.play_pop_sound();
    };

    ThreeMatchGameField.prototype.start_move = function(){
        this.swapping = true;
    };

    ThreeMatchGameField.prototype.stop_move = function(){
        var vars = this.proc.possible_variants();
        console.log(vars.length, vars);

        if (vars.length == 0){
            this.restart_field();
        }
        else{
            this.swapping = false;
            //console.log("children.length=", this.children.length);
        }
    };

    ThreeMatchGameField.prototype.restart_field = function () {
        //paly_anim

        //generate_new_field
        var cur_field_data = this.proc.copy_field();
        this.proc.generate_field();
        this.proc.apply_cell_data(cur_field_data);

        //render new field
        this.clear_field();
        this.render_field_canges([]);
    };

    ThreeMatchGameField.prototype.try_process_matches = function () {
        console.log("change_cubes end", this);

        var s = new Date().valueOf();
        var matched_patterns = this.proc.match_result(false);
        var e = new Date().valueOf();
        console.log("match_result generated in", e-s, "ms", "matched_patterns=", matched_patterns.length);

        var deleted_cells = [];
        var cur_cell = null;
        for (var i = 0; i < matched_patterns.length; i++){
            for (var j = 0; j < matched_patterns[i].cells.length; j++){
                cur_cell = matched_patterns[i].cells[j];
                if (deleted_cells.indexOf(cur_cell) == -1) deleted_cells.push(cur_cell);
            }
        }
        if (deleted_cells.length > 0){
            this.game.on_delete_cells(deleted_cells);
            this.render_field_canges(deleted_cells);
        }
        else
            this.stop_move();
    };

    ThreeMatchGameField.prototype.fail_swap = function (c1, c2) {
        c1 = this.get_cube(c1);
        c2 = this.get_cube(c2);
        this.item_on_mouse = {};
        c1.unselect();
        c2.unselect();

        this.animator.fail_animation(c1, c2, function(){});

        this.play_bell_sound();
    };

    ThreeMatchGameField.prototype.load_art = function () {
        if (PIXI.loader.resources['c1']) {
            this.on_art_loaded(this);
            return;
        }
        for (var i = 0; i < COLOR_CNT; i++) {
            PIXI.loader.add("c" + i, "imgs/cub" + (i + 1) + ".png");
        }
        PIXI.loader.load(this.on_art_loaded.bind(this));
    };

    ThreeMatchGameField.prototype.on_art_loaded = function () {
        //this.items = this.write_matrix();
        console.log("---- loaded --- ");
        this.proc = new Processor(this._init_data);
        this.proc.generate_field();
        this.render_field();
        this._on_load();
    };

    ThreeMatchGameField.prototype.render_field = function(){
        this.render_field_canges([]);
    };

    ThreeMatchGameField.prototype.render_field_canges = function(deleted_cells){
        var mods={
            new_cells: [],
            delete_cubes: [],
            move_cells: []
        };

        if (this.items == null) this.items = [];
        if (this.items_by_id == null) this.items_by_id = {};

        var cur_items = this.proc.get_field();
        for (var row = 0; row < cur_items.length; row++) {
            if (this.items[row] == null) this.items[row] = [];
            for (var col = 0; col < cur_items[row].length; col++) {
                var cell = cur_items[row][col];
                var exist_cube = this.items_by_id[cell.id];

                if (exist_cube == null){
                    var c = this.get_cub(cell);
                    this.items[row][col] = c;
                    this.items_by_id[cell.id] = c;
                    c.x = col * CUBE_WIDTH + COR_X;
                    c.y = row * CUBE_HEIGHT + COR_Y;
                    this.addChild(c);
                    c.alpha = 0;
                    mods.new_cells.push(c);
                }
                else if (exist_cube.row != cell.row){
                    mods.move_cells.push({c: exist_cube, prev_y: exist_cube.y});
                    exist_cube.y = row * CUBE_HEIGHT + COR_Y;
                    exist_cube.move_to(cell);
                    this.items[row][col] = exist_cube;
                }
            }
        }

        for (var d = 0; d < deleted_cells.length; d++){
            var deleted_cube = this.items_by_id[deleted_cells[d].id];
            //this.removeChild(deleted_cube); //remove by animator
            mods.delete_cubes.push(deleted_cube);
            delete this.items_by_id[deleted_cells[d].id];
        }

        console.log("mods=", mods);

        this.animator.animate_changes(mods, this.on_animate_end.bind(this));
    };

    ThreeMatchGameField.prototype.clear_field = function(){
        for (var row = 0; row < this.items.length; row++) {
            for (var col = 0; col < this.items[row].length; col++) {
                this.animator.delete_cube(this.items[row][col], 0);
            }
        }
        this.items = null;
        this.items_by_id = null;
    };

    ThreeMatchGameField.prototype.on_animate_end = function(){
        this.try_process_matches();
    };

    ThreeMatchGameField.prototype.is_valid_data = function () {
        return true;//todo realize
    };

    ThreeMatchGameField.prototype.get_cub = function (cell) {
        //console.log("cell=====", cell);
        return new Cube(cell);
    };

    ThreeMatchGameField.prototype.cube_on_mouse = function (data) {
        var inner_point = Utils.common.get_inner_coords(this, data.global);
        var col = Math.floor((inner_point.x - COR_X) / CUBE_WIDTH);
        var row = Math.floor((inner_point.y - COR_Y) / CUBE_HEIGHT);


        return this.items && this.items[row] ? this.items[row][col] : null;
    };

    ThreeMatchGameField.prototype.on_mousedown = function (e) {
        if (this.swapping) return;
        this.dispatch_mouse_event("on_mousedown", e);
    };

    ThreeMatchGameField.prototype.on_mouseup = function (e) {
        this.dispatch_mouse_event("on_mouseup", e);
    };

    ThreeMatchGameField.prototype.on_mousemove = function (e) {
        this.dispatch_mouse_event("on_mousemove", e);
    };

    ThreeMatchGameField.prototype.play_pop_sound = function () {
        Utils.sound.play_now(this.pop_sound);
    };

    ThreeMatchGameField.prototype.play_bell_sound = function () {
        Utils.sound.play_now(this.bell_sound);
    };

    return ThreeMatchGameField;
});
