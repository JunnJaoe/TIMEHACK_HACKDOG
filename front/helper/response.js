exports.Success = function(data, msg, status){
    return {
        msg: msg,
        data: data,
        code: status,
        status: 1
    };
};

exports.Error = function(error, msg, status){
    return {
        msg: msg,
        error: error,
        code: status,
        status: 0
    };
};