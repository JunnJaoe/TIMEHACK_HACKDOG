module.exports = {
  get: function (tag) {
    var errors = {
      MISSING_INVALID_PARAMS: { 
        status: 400, 
        error: { 
          code: -1, 
          message: 'Missing/invalid parameters.', 
          params: [] 
        } 
      },
      INTERNAL_SERVER_ERROR: {
        status: 500, 
        error: {
          code: -2, 
          message: 'Internal server error.'
        }
      },
      NOT_FOUND: {
        status: 404, 
        error: { 
          code: -3, 
          message: "Not found."
        }
      },
      SERVER_ERROR: {
        status: 500,
        error: {
          code: -4,
          message: 'Server unreachable.'
        }
      },
      SERVICE_ERROR: {
        status: 500,
        error: {
          code: -5,
          message: 'Service error/unavailable.'
        }
      },
      UNAUTHORIZED_ACCESS: {
        status: 401,
        error: {
          code: -6,
          message: 'Unauthorized Access.'
        }
      }
    };
    return errors[tag];
  },
  raise: function (e) {
    var error = JSON.parse(JSON.stringify(this.get(e)));
    return error;
  },
  getParam: function (tag) {
    var params = {
      biller_id: {
        field: 'biller_id',
        desc: 'Enter a valid biller id.'
      },
    };
    return params[tag];
  },
  getSpiel: function (tag) {
    var spiels = {
      SERVICE_UNAVAILABLE: 'We could not connect you to the service at the moment, please try again in a few minutes.',
      SERVICE_ERROR: 'We had a problem processing your request, please try again in a few minutes.',
    };
    return spiels[tag];
  }
};