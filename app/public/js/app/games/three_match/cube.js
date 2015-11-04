define(["pixi", "ui/filters/glow"], function() {

    var Cube = function (cell) {
        PIXI.Container.call(this);
        this.color = cell.type;
        this.col = cell.col;
        this.row = cell.row;
        this.disabled = cell.disabled;
        this.selected = false;

        this.cell = cell;
        if (this.disabled) return;

        var tx = PIXI.loader.resources['c' + (this.color-1)].texture;
        var sp = new PIXI.Sprite(tx);
        sp.anchor = new PIXI.Point(0.5, 0.5);
        sp.x = sp.width * 0.5;
        sp.y = sp.height * 0.5;
        this.addChild(sp);

        this.inner_object = sp;

        //var f = new PIXI.filters.TwistFilter();
        //f.radius = 0.5;
        //f.angle = 1;
        //f.offset.x = 0.4;
        //f.offset.y = 0.3;
        //this.filters = [f];
    };

    Cube.prototype = Object.create(PIXI.Container.prototype);
    Cube.prototype.constructor = Cube;

    Cube.prototype.select = function () {
        this.selected = true;
        if (!this.filters || this.filters.length == 0)
            this.filters = [new GlowFilter(1000, 1000, 15, 2, 1, 0xFFFFFF, 0.5)];
        //this.filters = [new PIXI.TwistFilter()];
        //var asd = new PIXI.filters.TwistFilter();
        //asd.gray = 0;
        //var dsa = new PIXI.BlurFilter();
        //dsa.blur = 0;
        //this.filters = [asd];
    };

    Cube.prototype.unselect = function () {
        this.selected = false;
        this.filters = null;
    };

    Cube.prototype.move_to = function (cube_position) {
        this.col = cube_position.col;
        this.row = cube_position.row;
    };

    Cube.prototype.copy_position = function () {
        return {col: this.col, row: this.row, x: this.x, y: this.y};
    };

    Cube.prototype.toString = function () {
        return "col=" + this.col + " row=" + this.row + " disabled=" + this.disabled + " color=" + this.color;
    };

    return Cube;
});

