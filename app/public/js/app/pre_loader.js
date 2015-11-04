define(["app_params"], function(app_params){
    return {
        set_progress_text: function(txt){
            document.getElementById(app_params.progress_text_id).innerHTML = txt;
        }
    };
});