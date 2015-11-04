define(['games/three_match/cell_data', 'games/three_match/patterns'], function (Cell, Patterns) {
    //possible_types = [{
    //  type: int,
    //  match_types: [type, type], // [] - all, null - nothing
    //  prob: int
    //}, ..]
    //field = [[],[]] //field_mask 0/1
    var ThreeMatchGameProcessor = function (game_data) {
        this.game_data = game_data;
        this.field_width = game_data.field[0].length;
        this.field_height = game_data.field.length;

        this.patterns = new Patterns();

        console.log("w/h=", this.field_width, this.field_height);
        this.field = [];
    };

    ThreeMatchGameProcessor.prototype.new_id = function(){
        if (!this.__id__) this.__id__ = 0;
        return this.__id__++;
    };

    ThreeMatchGameProcessor.prototype.generate_field = function(){
        //var prob_sum = (function(_this){
        //    var res = 0;
        //    for (var i = 0; i < _this.game_data.possible_types.length; i++){
        //        res += _this.game_data.possible_types[i]['prob']
        //    }
        //    return res;
        //})(this);

        var s = new Date().valueOf();
        this.init_field();
        console.log("this.field=", this.field);
        this.fill_empty_cells(true);
        var e = new Date().valueOf();

        console.log("ms=", e-s);
    };

    ThreeMatchGameProcessor.prototype.init_field = function(){
        for (var row = 0; row < this.field_width; row++){
            this.field[row] = [];
            for (var col = 0; col < this.field_height; col++){
                var disabled = this.game_data.field[row][col] == "0";
                this.field[row][col] = disabled ? this.get_cell(row, col, true) : null;
            }
        }
    };

    ThreeMatchGameProcessor.prototype.fill_empty_cells = function(check_adjacent_same_type){
        var rnd_cell;

        for (var row = 0; row < this.field_width; row++){
            for (var col = 0; col < this.field_height; col++){
                var cell = this.field[row][col];
                if (cell == null){ // || !cell.disabled && !cell.has_type()
                    var types = this.game_data.possible_types.concat([]);
                    do {
                        rnd_cell = this.get_random_cell(cell, types);
                    }
                    while (check_adjacent_same_type && this.has_adjacent_same_type(row, col, rnd_cell));

                    //if (cell) cell.set_cell(rnd_cell.type, null);
                    this.field[row][col] = this.get_cell(row, col, false, rnd_cell.type);
                }
            }
        }
    };

    ThreeMatchGameProcessor.prototype.has_adjacent_same_type = function(row, col, rnd_cell){
        if (this.has_row_match(row, col, rnd_cell))
            return true;

        if (this.has_col_match(row, col, rnd_cell))
            return true;

        return false;
    };

    ThreeMatchGameProcessor.prototype.has_row_match = function(row, col, rnd_cell){
        var cnt = 1;

        var cell_type = rnd_cell.type;
        for (var _r = row - 2; _r < row + 2; _r++){
            if (_r < 0 || _r > this.field_height - 1 || _r == row) continue;
            if (this.field[_r] && this.field[_r][col] && this.field[_r][col].type == cell_type) cnt++;
        }

        return cnt >= 3;
    };

    ThreeMatchGameProcessor.prototype.has_col_match = function(row, col, rnd_cell){
        var cnt = 1;

        var cell_type = rnd_cell.type;
        for (var _c = col - 2; _c < col + 2; _c++){
            if (_c < 0 || _c > this.field_width - 1 || _c == col) continue;
            if (this.field[row] && this.field[row][_c] && this.field[row][_c].type == cell_type) cnt++;
        }

        return cnt >= 3;
    };

    ThreeMatchGameProcessor.prototype.get_random_cell = function(cell, types){
        //todo: random on probs
        var rnd_idx = Math.floor(Math.random() * types.length);
        var res = types[rnd_idx];
        types.splice(rnd_idx, 1);
        return res;
    };

    ThreeMatchGameProcessor.prototype.get_cell = function(row, col, disabled, type, data){
        //var pred_cells = this.game_data['predefined_cells']
        //if (pred_cells && pred_cells[x] &7 pred_cells[x][y]) { }

        var cell = new Cell(row, col, this.new_id());
        cell.init(Boolean(disabled));
        if (type) cell.set_cell(type);
        return cell;
    };

    ThreeMatchGameProcessor.prototype.get_field = function(){
        return this.field;
    };

    ThreeMatchGameProcessor.prototype.check_swap = function (c1, c2, success, distance_incorrect, fail) {
        //distance
        var dist_x = Math.abs(c1.col - c2.col);
        var dist_y = Math.abs(c1.row - c2.row);
        if (!((dist_y == 0 && dist_x == 1) || (dist_y == 1 && dist_x == 0))) {
            if (distance_incorrect) distance_incorrect(c1, c2);
            return;
        }
        //type
        if (c1.disabled || c2.disabled) {
            if (fail) fail(c1, c2);
            return;
        }
        //pattern
        this.change_cells(c1, c2, this.field);
        var patterns = this.find_patterns(this.field);

        if (patterns.length == 0) {
            this.change_cells(c1, c2, this.field);
            if (fail) fail(c1, c2);
            return;
        }

        if (success) success(c1, c2);
    };

    ThreeMatchGameProcessor.prototype.change_cells = function(c1, c2, field){
        var c1_r = c1.row;
        var c1_c = c1.col;

        c1.row = c2.row;
        c1.col = c2.col;

        c2.row = c1_r;
        c2.col = c1_c;

        field[c1.row][c1.col] = c1;
        field[c2.row][c2.col] = c2;
    };

    ThreeMatchGameProcessor.prototype.find_patterns = function(field){
        return this.patterns.get_matches(field)
    };

    //match_result - возвращает удаленные cell_data и формирует новое поле
    ThreeMatchGameProcessor.prototype.match_result = function(traces){
        var matched_patterns = this.patterns.matched_cells(this.field);

        this.remove_cells(matched_patterns);
        if (traces) this.print_field("after remove");

        this.move_cells_down(matched_patterns);
        if (traces) this.print_field("after move_cells_down");

        this.fill_empty_cells(false);
        if (traces) this.print_field("after fill_empty_cells");
        return matched_patterns;
    };

    ThreeMatchGameProcessor.prototype.move_cells_down = function(matched_patterns){
        var cur_cel = null;
        var first_null_row = -1;

        for (var col = 0; col < this.field_width; col++) {
            first_null_row = -1;
            for (var row = this.field_height - 1; row >= 0; row--) {
                cur_cel = this.field[row][col];
                if (cur_cel == null) {
                    if (first_null_row == -1) first_null_row = row;
                    continue;
                }
                if (cur_cel.disabled) continue;
                if (first_null_row == -1) continue;

                cur_cel.row = first_null_row;
                this.field[cur_cel.row][col] = cur_cel;
                this.field[row][col] = null;

                row = first_null_row;
                first_null_row = -1;
            }
        }
    };

    ThreeMatchGameProcessor.prototype.possible_variants = function(){
        return this.patterns.possible_matched_cells(this.field);
    };

    ThreeMatchGameProcessor.prototype.remove_cells = function(matched_patterns){
        var cur_cel = null;
        for (var i=0;i<matched_patterns.length;i++){
            for (var c=0;c<matched_patterns[i].cells.length;c++){
                cur_cel = matched_patterns[i].cells[c];
                //if more than 1 live just --, not nulled
                this.field[cur_cel.row][cur_cel.col] = null;
            }
        }
    };

    ThreeMatchGameProcessor.prototype.print_field = function(title){
        if (title) console.log(title);
        for (var row = 0; row < this.field.length; row++) {
            var cols = [];
            for (var col = 0; col < this.field[row].length; col++) {
                var cc = this.field[row][col];
                if (cc)
                    cols.push(this.field[row][col].toString());
                else
                    cols.push("(-nil-)");
            }
            console.log(row, cols.join(","));
        }
    };

    ThreeMatchGameProcessor.prototype.copy_field = function(){
        var res = [];
        for (var row = 0; row < this.field_width; row++){
            res[row] = [];
            for (var col = 0; col < this.field_height; col++){
                res[row][col] = this.field[row][col];
            }
        }
        return res;
    };

    ThreeMatchGameProcessor.prototype.apply_cell_data = function(old_field){
        for (var row = 0; row < this.field_width; row++){
            for (var col = 0; col < this.field_height; col++){
                if (old_field[row][col].data){
                    this.field[row][col].set_cell_data(old_field[row][col].data);
                }
            }
        }
    };

    return ThreeMatchGameProcessor;
});