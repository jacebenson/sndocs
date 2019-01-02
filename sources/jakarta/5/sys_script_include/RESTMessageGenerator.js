var RESTMessageGenerator = Class.create();

RESTMessageGenerator.prototype = {

    /**
     * Constructor takes a sys_rest_message GlideRecord as argument
     * call the process method after constructing this object
     */
    initialize : function () {
    },

    /**
     * Test UI action code
     */
    test : function(cur) {
        var requestBody;
        var responseBody;
        var status;
        var endpoint;
        var query;
		var scope = cur.rest_message.sys_scope ? cur.rest_message.sys_scope.scope : null;
		var restMesssageName = scope ? scope + "." + cur.rest_message.name : cur.rest_message.name;

        try {
            var rm = new sn_ws.RESTMessageV2(restMesssageName, cur.function_name);
            var pgr = new GlideRecord('sys_rest_message_fn_parameters');
            pgr.addQuery('rest_message_function', cur.sys_id);
            pgr.query();
            while(pgr.next()) {
                if (pgr.type == 'string')
                    rm.setStringParameter(pgr.name, pgr.value);
                else
                    rm.setStringParameterNoEscape(pgr.name, pgr.value);
            }
            var response = rm.execute();
            endpoint = rm.getEndpoint();
            if (!cur.use_mid_server.nil()) {
                response.waitForResponse(60);// Wait at most 60 seconds to get response if required
            }
            responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
            status = response.getStatusCode();
            query = response.getQueryString();
        } catch(ex) {
            responseBody = ex.getMessage();
            status = "500";
        } finally{
            requestBody = rm ? rm.getRequestBody() : null;
        }

        return this.logRESTTest(cur, endpoint, query, requestBody, responseBody, status);
    },

    logRESTTest : function(cur, endpoint, query, requestBody, responseBody, status) {
        var tgr = new GlideRecord('sys_rest_message_fn_test');
        tgr.initialize();
        tgr.rest_message_function = cur.getValue('sys_id');
        tgr.endpoint = endpoint;
        tgr.parameters = query;
        tgr.content = requestBody;
        tgr.response = responseBody
        tgr.http_status = status;
        tgr.insert();

        return tgr;
    }
}