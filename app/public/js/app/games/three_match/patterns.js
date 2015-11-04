define([], function () {
    //1 same type
    //0 movable cell
    //X any cell
    var X = -1;
    var VALID_PATTERNS = [
        {name: "LINE3_H", positions: [ [1,1,1] ]},
        {name: "LINE3_V", positions: [
            [1],
            [1],
            [1]
        ]},
        {name: "LINE4_H", positions: [ [1,1,1,1] ]},
        {name: "LINE4_V", positions: [
            [1],
            [1],
            [1],
            [1]
        ]},
        {name: "LINE5_H", positions: [ [1,1,1,1,1] ]},
        {name: "LINE5_V", positions: [
            [1],
            [1],
            [1],
            [1],
            [1]
        ]}
    ];

    var POSIBLE_PATTERNS = [
        //position vertical
        {name: "POS_V_DD", positions: [
            [1],
            [1],
            [0],
            [1]
        ]},
        {name: "POS_V_UU", positions: [
            [1],
            [0],
            [1],
            [1]
        ]},
        {name: "POS_V_CR", positions: [
            [1,X],
            [0,1],
            [1,X]
        ]},
        {name: "POS_V_CL", positions: [
            [X,1],
            [1,0],
            [X,1]
        ]},
        {name: "POS_V_UR", positions: [
            [0,1],
            [1,X],
            [1,X]
        ]},
        {name: "POS_V_UL", positions: [
            [1,0],
            [X,1],
            [X,1]
        ]},
        {name: "POS_V_DR", positions: [
            [1,X],
            [1,X],
            [0,1]
        ]},
        {name: "POS_V_DL", positions: [
            [X,1],
            [X,1],
            [1,0]
        ]},

        //position horizontal
        {name: "POS_H_RR", positions: [ [1,1,0,1] ]},
        {name: "POS_H_LL", positions: [ [1,0,1,1] ]},
        {name: "POS_H_CU", positions: [
            [X,1,X],
            [1,0,1]
        ]},
        {name: "POS_V_CD", positions: [
            [1,0,1],
            [X,1,X]
        ]},
        {name: "POS_H_RU", positions: [
            [X,X,1],
            [1,1,0]
        ]},
        {name: "POS_H_RD", positions: [
            [1,1,0],
            [X,X,1]
        ]},
        {name: "POS_H_LU", positions: [
            [1,X,X],
            [0,1,1]
        ]},
        {name: "POS_H_LD", positions: [
            [0,1,1],
            [1,X,X]
        ]}
    ];

    var Patterns = function(){ };

    Patterns.prototype.get_matches = function(field, patterns){
        patterns = patterns ? patterns : VALID_PATTERNS;
        var matches = [];
        var cur_cell = null;
        var cur_pattern = null;
        var max_row = 0;
        var max_col = 0;
        var check_result = null;

        var pattern_len = patterns.length;
        var i = pattern_len - 1;
        while (i >= 0){
            cur_pattern = patterns[i];
            max_row = field.length - cur_pattern.positions.length;
            max_col = field[0].length - cur_pattern.positions[0].length;

            for (var row = 0; row <= max_row; row++) {
                for (var col = 0; col <= max_col; col++) {
                    cur_cell = field[row][col];
                    check_result = this.check_pattern(cur_pattern, cur_cell, field);
                    if (check_result.is_mach){
                        matches.push({cur_cell: cur_cell, cells: check_result.cells, cur_pattern: cur_pattern});
                    }
                }
            }
            i--;
        }

        return matches;
    };

    Patterns.prototype.check_pattern = function(pattern, cell, field){
        var type = -1;
        var bad_res = {is_mach: false};
        var cells = [];

        for (var row = 0; row < pattern.positions.length; row++) {
            for (var col = 0; col < pattern.positions[row].length; col++) {
                if (pattern.positions[row][col] == X) continue;

                var field_cell = field[cell.row + row][cell.col + col];
                if (pattern.positions[row][col] == 0) {
                    if (field_cell.disabled) return bad_res;
                    else continue;
                }

                if (field_cell.disabled)
                    return bad_res;

                if (type == -1) {
                    type = field_cell.type;
                    cells.push(field_cell);
                    continue;
                }

                if (field_cell.type != type)
                    return bad_res;

                cells.push(field_cell);
            }
        }

        return {is_mach: true, type: type, cells: cells};
    };

    Patterns.prototype.possible_matched_cells = function(field){
        return this.calc_matched_cels(field, POSIBLE_PATTERNS);
    };

    Patterns.prototype.matched_cells = function(field){
        return this.calc_matched_cels(field, VALID_PATTERNS);
    };

    Patterns.prototype.calc_matched_cels = function(field, patterns){
        var uniq_ptrns = [];
        var all_cells = [];

        var ptrns = this.get_matches(field, patterns);
        for (var i=0; i<ptrns.length; i++){
            if (!this.has_all(ptrns[i].cells, all_cells)){
                uniq_ptrns.push(ptrns[i]);
                all_cells = all_cells.concat(ptrns[i].cells);
            }
        }
        return uniq_ptrns;
    };

    Patterns.prototype.has_all = function(find_cells, find_array){
        for (var i=0;i<find_cells.length;i++){
            if (find_array.indexOf(find_cells[i]) == -1) return false;
        }
        return true;
    };

    return Patterns;
});