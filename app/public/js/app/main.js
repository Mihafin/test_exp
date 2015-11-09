requirejs.config({
    baseUrl: "js/app",
    paths: {
        //social_api: 'api/vk',
        social_api: 'api/local',


        jquery: '../core/jquery.min',
        pixi: '../core/pixi.min',
        i18n: '../core/i18n',
        stats: '../core/stats.min',
        timeline_lite: '../core/TimelineLite.min',
        tween_lite: '../core/TweenLite.min',
        timeline_max: '../core/TimelineMax.min',
        tween_max: '../core/TweenMax.min',
        proton: '../core/proton'
    },
    shim: {
        timeline_lite:{ deps: ['tween_lite'] },
        timeline_max:{ deps: ['tween_max'] }
    },
    waitSeconds: 0
    //urlArgs: "%_RevisionNum_%" #some proxy ignore url_params, better change baseUrl or use prefix
});

requirejs(["app"], function(App) {
    var app = new App();
    app.init();
});
