define(function () {
    var GameResult = {
        RESULT_OK: 'ok',
        RESULT_FAIL: 'fail',
        RESULT_ERROR: 'error',
        RESULT_UNKNOWN: 'unk'
    };

    GameResult.get_result = function(status, data){
        return {
            status: status,
            data: data
        };
    };

    GameResult.get_ok_result = function(data){
        return GameResult.get_result(GameResult.RESULT_OK, {data: data});
    };

    GameResult.get_fail_result = function(data){
        return GameResult.get_result(GameResult.RESULT_FAIL, {data: data});
    };

    GameResult.get_error_result = function(msg){
        return GameResult.get_result(GameResult.RESULT_ERROR, {msg: msg});
    };

    return GameResult;
});