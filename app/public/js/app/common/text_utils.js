var TextUtils = function (){};

TextUtils.prototype.get_text = function(text, width){
    var style1 = {
        font: "bold 50px Podkova",
        fill: "#cc00ff",
        stroke: "#FFFFFF",
        strokeThickness: 6
    };
    var style = {
        font: '24px Arial',
        fill: '#000000',
        stroke: '#ffffff',
        strokeThickness: 1,
        //dropShadow : true,
        //dropShadowColor : '#000000',
        //dropShadowAngle : Math.PI / 6,
        //dropShadowDistance : 2,
        wordWrap: true,
        wordWrapWidth: width
    };

    return new PIXI.Text(text, style1);
};

TextUtils.prototype.substitute = function(txt, args){
    args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0; i < args.length; i++){
        txt = txt.replace("{"+i+"}", args[i])
    }
    return txt;
};

if (typeof String.prototype.toCamel !== 'function') {
    String.prototype.toCamel = function(){
        var str = this.replace(/[-_]([a-z])/g, function (g) { return g[1].toUpperCase(); });
        return str.charAt(0).toUpperCase() + str.substring(1);
    };
}