define([], function () {
    var Cell = function(row, col, id) {
        this.row = row;
        this.col = col;
        this.type = -1;
        this.id = id;
        this.data = null;
    };

    Cell.prototype.init = function(disabled) {
        this.disabled = disabled;
    };

    Cell.prototype.set_cell = function(type) {
        this.type = type;
    };

    Cell.prototype.set_cell_data = function(data) {
        this.data = data;
    };

    Cell.prototype.toString = function(){
        if (this.disabled)
            return "(-----)";
        return "(" + (this.type == -1 ? "-":this.type) + ":" + this.row + "," + this.col + ")";
    };

    return Cell;
});