define(["timeline_lite", "proton"], function (tl, prot) {
    var DEL_DELAY = 0.05;
    var DEL_TIME = 0.5;
    var MOVE_DELAY = 0.05;
    var MOVE_TIME = 0.2;
    var NEW_DELAY = 0.02;
    var NEW_TIME = 0.25;

    var Animator = function(){};

    Animator.prototype.change_cubes = function(c1, c2, on_end){
        var c1_pos = c1.copy_position();
        var c2_pos = c2.copy_position();

        c1.move_to(c2_pos);
        c2.move_to(c1_pos);

        var t = new TimelineLite();
        t.to(c1, 0.25, {x: c2_pos.x, y: c2_pos.y});

        var t2 = new TimelineLite({onComplete: function(){
            on_end();
        }});
        t2.to(c2, 0.25, {x: c1_pos.x, y: c1_pos.y});
    };

    Animator.prototype.fail_animation = function(c1, c2, on_end){
        if (c1 && c1.inner_object) {
            var t = new TimelineLite();
            t.to(c1.inner_object, 0.05, {rotation: Math.PI / 8});
            t.to(c1.inner_object, 0.05, {rotation: 0});
        }

        if (c2 && c2.inner_object) {
            var t2 = new TimelineLite();
            t2.to(c2.inner_object, 0.05, {rotation: Math.PI / 8});
            t2.to(c2.inner_object, 0.05, {rotation: 0});
        }
        on_end();
    };

    Animator.prototype.animate_changes = function(mods, on_end){
        //DELETE
        var wait_delete = 0;
        if (mods.delete_cubes.length > 0){
            for (var d = 0; d < mods.delete_cubes.length; d++){
                this.delete_cube(mods.delete_cubes[d], d * DEL_DELAY);
            }
            wait_delete = mods.delete_cubes.length * DEL_DELAY ;//+ DEL_TIME - 0.3;
        }

        //MOVE DOWN
        var wait_move = 0;
        if (mods.move_cells.length > 0){
            mods.move_cells.sort(this.cube_sorter2.bind(this));
            for (var m = 0; m < mods.move_cells.length; m++){
                this.move_cube(mods.move_cells[m].c, mods.move_cells[m].prev_y, wait_delete + m * MOVE_DELAY);
            }
            wait_move = mods.move_cells.length * MOVE_DELAY + MOVE_TIME;
        }

        //NEW CUBES
        var wait_new = 0;
        if (mods.new_cells.length > 0){
            mods.new_cells.sort(this.cube_sorter);
            for (var n = 0; n < mods.new_cells.length; n++){
                this.new_cube(mods.new_cells[n], wait_delete + wait_move + n * NEW_DELAY);
            }
            wait_new = mods.new_cells.length * NEW_DELAY + NEW_TIME;
        }

        setTimeout(on_end, (wait_delete + wait_move + wait_new) * 1000);
    };

    Animator.prototype.move_cube = function(cube, prev_y, delay){
        var t = new TimelineLite({delay: delay});
        t.from(cube, MOVE_TIME, {y: prev_y});
    };

    Animator.prototype.delete_cube = function(cube, delay){
        if (!cube.inner_object){
            on_complete();
            return;
        }
        var t = new TimelineLite({
            onComplete: on_complete,
            delay: delay
        });
        t.to(cube, DEL_TIME, {alpha: 0});

        var t3 = new TimelineLite({delay: delay});
        t3.to(cube.inner_object.scale, DEL_TIME * 2, {x: 0, y: 0});

        var t2 = new TimelineLite({delay: delay});
        t2.to(cube.inner_object, DEL_TIME * 2, {rotation: 3*Math.PI});

        function on_complete(){ if (cube.parent) cube.parent.removeChild(cube); }
    };

    Animator.prototype.new_cube = function(cube, delay){
        var t = new TimelineLite({delay: delay});
        t.to(cube, NEW_TIME, {alpha: 1});

        var t2 = new TimelineLite({delay: delay});
        t2.from(cube, NEW_TIME, {y: cube.y - 100});
    };

    Animator.prototype.cube_sorter2 = function(a, b) {
        var c1 = a.c;
        var c2 = b.c;

        return this.cube_sorter(c1, c2);
    };

    Animator.prototype.cube_sorter = function(c1, c2) {
        if (c1.row > c2.row){
            return -1;//-1 a в начале
        }
        if (c2.row > c1.row){
            return 1;
        }
        if (c1.col > c2.col){
            return -1;
        }
        if (c2.col > c1.col){
            return 1;
        }
        return 0;
    };


    Animator.prototype.show_particle = function(c1){

    };

    Animator.prototype.createProton = function() {
        var texture = new PIXI.Texture.fromImage("imgs/particle.png");
        this.proton = new Proton();
        var emitter = new Proton.BehaviourEmitter();
        emitter.rate = new Proton.Rate(new Proton.Span(15, 30), new Proton.Span(.2, .5));
        emitter.addInitialize(new Proton.Mass(1));
        emitter.addInitialize(new Proton.ImageTarget(texture));
        emitter.addInitialize(new Proton.Life(2, 3));
        emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 9), new Proton.Span(0, 30, true), 'polar'));
        emitter.addBehaviour(new Proton.Gravity(8));
        emitter.addBehaviour(new Proton.Scale(new Proton.Span(1, 3), 0.3));
        emitter.addBehaviour(new Proton.Alpha(1, 0.5));
        emitter.p.x = 100;
        emitter.p.y = 100;
        emitter.emit();
        this.proton.addEmitter(emitter);

        this.createRender();
    };

    Animator.prototype.createRender = function() {
        var renderer = new Proton.Renderer('other', this.proton);
        renderer.onProtonUpdate = function() { };

        renderer.onParticleCreated = function(particle) {
            particle.sprite = new PIXI.Sprite(particle.target);
            particle.sprite.tint = Math.round(Math.random() * 16777215);
            this.scene.addChild(particle.sprite);
        }.bind(this);

        renderer.onParticleUpdate = function(particle) {
            this.transformSprite(particle.sprite, particle);
        }.bind(this);

        renderer.onParticleDead = function(particle) {
            this.scene.removeChild(particle.sprite);
        }.bind(this);

        renderer.start();
    };

    Animator.prototype.transformSprite = function(particleSprite, particle) {
        particleSprite.position.x = particle.p.x;
        particleSprite.position.y = particle.p.y;
        particleSprite.scale.x = particle.scale;
        particleSprite.scale.y = particle.scale;
        particleSprite.anchor.x = 0.5;
        particleSprite.anchor.y = 0.5;
        particleSprite.alpha = particle.alpha;
        particleSprite.rotation = particle.rotation*Math.PI/180;
    };

    Animator.prototype.update = function(){
        if (this.proton) this.proton.update();
    };

    Animator.prototype.init = function(scene){
        this.scene = scene;
        //this.createProton();
    };

    return new Animator();
});


//var R = 150;
//Animator.prototype.createProton = function () {
//    //mouseObj = {
//    //    x : 1003 / 2,
//    //    y : 610 / 2
//    //};
//    //this.proton = new Proton();
//    //this.emitter1 = this.createImageEmitter(scene.renderer.view.width / 2 + R, scene.renderer.view.height / 2, '#4F1500', '#0029FF');
//    //emitter2 = createImageEmitter(canvas.width / 2 - R, canvas.height / 2, '#004CFE', '#6600FF');
//
//    //var renderer = new Proton.Renderer('webgl', this.proton, scene.renderer.view);
//    //renderer.blendFunc("SRC_ALPHA", "ONE");
//    //renderer.start();
//};
//
//Animator.prototype.createImageEmitter = function (x, y, color1, color2) {
//    var emitter = new Proton.Emitter();
//    emitter.rate = new Proton.Rate(new Proton.Span(5, 7), new Proton.Span(.01, .02));
//    emitter.addInitialize(new Proton.Mass(1));
//    emitter.addInitialize(new Proton.Life(1));
//    emitter.addInitialize(new Proton.ImageTarget(['assets/particle.png'], 32));
//    emitter.addInitialize(new Proton.Radius(40));
//    emitter.addBehaviour(new Proton.Alpha(1, 0));
//    emitter.addBehaviour(new Proton.Color(color1, color2));
//    emitter.addBehaviour(new Proton.Scale(3.5, 0.1));
//    emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, 1003, 610), 'dead'));
//    //var attractionBehaviour = new Proton.Attraction(mouseObj, 0, 0);
//    //attractionBehaviours.push(attractionBehaviour);
//    //emitter.addBehaviour(attractionBehaviour);
//
//    emitter.p.x = x;
//    emitter.p.y = y;
//    emitter.emit();
//    this.proton.addEmitter(emitter);
//    return emitter;
//};
//
//Animator.prototype.emitterRun = function () {
//    this.emitter1.p.x = scene.renderer.view.width / 2 + R * Math.sin(Math.PI / 2 + this.tha);
//    this.emitter1.p.y = scene.renderer.view.height / 2 + R * Math.cos(Math.PI / 2 + this.tha);
//    //emitter2.p.x = canvas.width / 2 + R * Math.sin(-Math.PI / 2 + tha);
//    //emitter2.p.y = canvas.height / 2 + R * Math.cos(-Math.PI / 2 + tha);
//    this.tha += .1;
//};
//
//Animator.prototype.tick = function() {
//    requestAnimationFrame(this.tick.bind(this));
//
//    this.emitterRun();
//    this.proton.update();
//};
//Scene.prototype.createProton = function() {
//    var texture = new PIXI.Texture.fromImage("assets/particle.png");
//    this.proton = new Proton();
//    var emitter = new Proton.BehaviourEmitter();
//    emitter.rate = new Proton.Rate(new Proton.Span(15, 30), new Proton.Span(.2, .5));
//    emitter.addInitialize(new Proton.Mass(1));
//    emitter.addInitialize(new Proton.ImageTarget(texture));
//    emitter.addInitialize(new Proton.Life(2, 3));
//    emitter.addInitialize(new Proton.Velocity(new Proton.Span(3, 9), new Proton.Span(0, 30, true), 'polar'));
//    emitter.addBehaviour(new Proton.Gravity(8));
//    //emitter.addBehaviour(new Proton.Color('#4F1500', '#0029FF'));
//    emitter.addBehaviour(new Proton.Scale(new Proton.Span(1, 3), 0.3));
//    emitter.addBehaviour(new Proton.Alpha(1, 0.5));
//    //emitter.addBehaviour(new Proton.Rotate(0, Proton.getSpan(-8, 9), 'add'));
//    emitter.p.x = 100;
//    emitter.p.y = 100;
//    emitter.emit();
//    this.proton.addEmitter(emitter);
//    //emitter.addSelfBehaviour(new Proton.Gravity(5));
//    //emitter.addSelfBehaviour(new Proton.RandomDrift(30, 30, .1));
//    //emitter.addSelfBehaviour(new Proton.CrossZone(new Proton.RectZone(50, 0, 953, 610), 'bound'));
//
//    this.createRender();
//};
//
//Scene.prototype.createRender = function() {
//    var renderer = new Proton.Renderer('other', this.proton);
//    renderer.onProtonUpdate = function() {
//    };
//    renderer.onParticleCreated = function(particle) {
//        if (!this.t){
//            this.t = true;
//            console.log(particle);
//        }
//        var particleSprite = new PIXI.Sprite(particle.target);
//        particle.sprite = particleSprite;
//        this.addChild(particle.sprite);
//    }.bind(this);
//    renderer.onParticleUpdate = function(particle) {
//        this.transformSprite(particle.sprite, particle);
//    }.bind(this);
//    renderer.onParticleDead = function(particle) {
//        this.removeChild(particle.sprite);
//    }.bind(this);
//    renderer.start();
//
//};
//
//Scene.prototype.transformSprite = function(particleSprite, particle) {
//    particleSprite.position.x = particle.p.x;
//    particleSprite.position.y = particle.p.y;
//    particleSprite.scale.x = particle.scale;
//    particleSprite.scale.y = particle.scale;
//    particleSprite.anchor.x = 0.5;
//    particleSprite.anchor.y = 0.5;
//    particleSprite.alpha = particle.alpha;
//    particleSprite.rotation = particle.rotation*Math.PI/180;
//};
//
//var R = 150;
//Scene.prototype.createProton2 = function () {
//    //mouseObj = {
//    //    x : 1003 / 2,
//    //    y : 610 / 2
//    //};
//    this.proton = new Proton();
//    this.emitter1 = this.createImageEmitter(this.renderer.view.width / 2 + R, this.renderer.view.height / 2, '#4F1500', '#0029FF');
//    //emitter2 = createImageEmitter(canvas.width / 2 - R, canvas.height / 2, '#004CFE', '#6600FF');
//
//    var renderer = new Proton.Renderer('webgl', this.proton, this.renderer.view);
//    renderer.blendFunc("SRC_ALPHA", "ONE");
//    renderer.start();
//};
//
//Scene.prototype.createImageEmitter = function (x, y, color1, color2) {
//    var emitter = new Proton.Emitter();
//    emitter.rate = new Proton.Rate(new Proton.Span(5, 7), new Proton.Span(.01, .02));
//    emitter.addInitialize(new Proton.Mass(1));
//    emitter.addInitialize(new Proton.Life(1));
//    emitter.addInitialize(new Proton.ImageTarget(['assets/particle.png'], 32));
//    emitter.addInitialize(new Proton.Radius(40));
//    emitter.addBehaviour(new Proton.Alpha(1, 0));
//    emitter.addBehaviour(new Proton.Color(color1, color2));
//    emitter.addBehaviour(new Proton.Scale(3.5, 0.1));
//    emitter.addBehaviour(new Proton.CrossZone(new Proton.RectZone(0, 0, 1003, 610), 'dead'));
//    //var attractionBehaviour = new Proton.Attraction(mouseObj, 0, 0);
//    //attractionBehaviours.push(attractionBehaviour);
//    //emitter.addBehaviour(attractionBehaviour);
//
//    emitter.p.x = x;
//    emitter.p.y = y;
//    emitter.emit();
//    this.proton.addEmitter(emitter);
//    return emitter;
//};
//
//Scene.prototype.emitterRun = function () {
//    this.emitter1.p.x = this.renderer.view.width / 2 + R * Math.sin(Math.PI / 2 + this.tha);
//    this.emitter1.p.y = this.renderer.view.height / 2 + R * Math.cos(Math.PI / 2 + this.tha);
//    this.tha += .1;
//};