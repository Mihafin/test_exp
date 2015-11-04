var SoundUtils = function (){
    this.audio_context = null;
    this.sounds_cache = {};
    this.is_sound_on = true;
    this.init();
};

SoundUtils.prototype.init = function() {
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audio_context = new AudioContext();
        this.log("Sound inited!");
    }
    catch(e) {
        this.log('Web Audio API is not supported in this browser: ', e.message);
    }
};

SoundUtils.prototype.set_sound_state = function(val) {
    this.is_sound_on = val;
};

SoundUtils.prototype.is_sound_ready = function(url){
    return this.sounds_cache[url] != null && this.sounds_cache[url]['buffer'] != null;
};

SoundUtils.prototype.play_now = function(url){
    if (this.is_sound_ready(url)){
        this.play(this.sounds_cache[url]);
    }
    else{
        this.load_sound(url);
    }
};

SoundUtils.prototype.load_and_play_sound = function(url, loop){
    this.load_sound(url, function (sound_data){
        this.play(sound_data, loop);
    }.bind(this));
};

SoundUtils.prototype.play = function(sound_data, loop){
    if (!this.is_sound_on) return;

    try {
        var source = this.audio_context.createBufferSource();   // creates a sound source
        source.buffer = sound_data['buffer'];                   // tell the source which sound to play
        source.connect(this.audio_context.destination);         // connect the source to the context's destination (the speakers)
        source.start(0);                                        // play the source now // note: on older systems, may have to use deprecated noteOn(time);
        source.loop = !!loop;
    }
    catch (e){
        this.log("play sound error", e);
    }
};

SoundUtils.prototype.add_waiter = function (url, cb) {
    if (this.sounds_cache[url]['wait_cb'] == null) this.sounds_cache[url]['wait_cb'] = [];
    this.sounds_cache[url]['wait_cb'].push(cb);
};

SoundUtils.prototype.load_sound = function(url, cb){
    if (this.audio_context == null){
        this.log("SoundUtils is not inited!");
        return;
    }

    if (this.sounds_cache[url] != null && this.sounds_cache[url]['buffer'] != null) {
        if (cb) cb.apply(null, this.sounds_cache[url]);
        return;
    }

    if (this.sounds_cache[url] != null) {//already loaded
        this.add_waiter(url, cb);
        return;
    }

    try{
        if (this.sounds_cache[url] == null) this.sounds_cache[url] = {path: url};
        if (cb){
            this.add_waiter(url, cb);
        }

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        request.onload = function() {
            this.audio_context.decodeAudioData(request.response, function(buffer) {
                this.sounds_cache[url]['buffer'] = buffer;
                this.call_waiters(url);
            }.bind(this), this.log);
        }.bind(this);

        this.sounds_cache[url]['request'] = request;
        request.send();
    }
    catch(e) {
        this.log('Cant load sound:' + url, e.message);
    }
};

SoundUtils.prototype.call_waiters = function(url){
    if (this.sounds_cache[url] == null ||  this.sounds_cache[url]['wait_cb'] == null) return;

    var waiters = this.sounds_cache[url]['wait_cb'];
    for (var i=0; i < waiters.length; i++){
        if (waiters[i]) {
            var sound_data = this.sounds_cache[url];
            waiters[i].apply(null, [sound_data]);
        }
    }
    delete this.sounds_cache[url]['wait_cb'];
};

SoundUtils.prototype.log = function(){
    if (console) console.log.apply(console, arguments);
};