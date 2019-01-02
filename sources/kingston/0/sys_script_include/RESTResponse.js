var RESTResponse = Class.create();
RESTResponse.prototype = {

    initialize: function(response) {
        this.response = response;
        this.errorCode = '';
        this.errorMessage = '';
    },

    getHttpMethod: function() {
        return this.response ? this.response.getHttpMethod() : null;
    },

    getStatusCode: function() {
        return this.response ? this.response.getStatusCode() : this.errorCode;
    },

    getHeader: function(name) {
        return this.response ? this.response.getHeader(name) : '';
    },

    getHeaders: function() {
        return this.response ? this.response.getHeaders() : null;
    },

    getBody: function() {
        return this.response ? this.response.getBody() : this.getErrorMessage();
    },

    haveError: function() {
        return this.response ? this.response.haveError() : true;
    },

    getErrorCode: function() {
        return this.response ? this.response.getErrorCode() : this.errorCode;
    },

    getErrorMessage: function() {
        return this.response ? this.response.getErrorMessage() : this.errorMessage;
    },

    getContent: function() {
        return this.content ? this.content : '';
    },

    getEndpoint: function() {
        return this.endpoint ? this.endpoint : '';
    },

    getParameters: function() {
        return this.parameters ? this.parameters : '';
    },

    setContent: function(content) {
        this.content = content;
    },

    setEndpoint: function(endpoint) {
        this.endpoint = endpoint;
    },

    setError: function(errorMessage) {
        this.errorMessage = errorMessage;
    },

    setParameters: function(parameters) {
        this.parameters = parameters;
    },

    type: 'RESTResponse'
}