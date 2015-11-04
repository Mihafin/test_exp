define(["pre_loader", "i18n!nls/loader"], function (loader, loader_texts){
    var App = function(){
        loader.set_progress_text(loader_texts.loading1);
    };

    App.prototype.init = function(){
        requirejs(["scene"], function(scene){
            scene.init();
        });
    };

    return App;
});

//todo:
// - подсчет баллов
// - завершение игры
// - ячейки с жизнями
// - бафы (убрать ячейку, взорвать 3х3, убрать все 1 типа)
// ---------------------------------
// - сопоставление шаблонов по match_types
// - вероятности
// - не появление новых под фиксед ячейками
// - вынести партиклы в отдельный класс
// - подсветка вариантов при простое
// - проталкивание объектов вниз поля

//particles:
// https://github.com/CloudKidStudio/PixiParticles
// http://www.a-jie.cn/proton/#example