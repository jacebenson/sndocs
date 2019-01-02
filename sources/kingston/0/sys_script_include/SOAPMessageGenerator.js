var SOAPMessageGenerator = Class.create();
SOAPMessageGenerator.prototype = {
    
    /**
    * Constructor takes a sys_soap_message GlideRecord as argument call the
    * process method after constructing this object
    */
	
    initialize : function(soapMessageGR) {
        if (!soapMessageGR) {
            return;
        }

        this.soapMessageGR = soapMessageGR;
        this.fWSClient = new GlideWSClient();

        if (!this.soapMessageGR.download_wsdl) {
            // construct the WSClient using static WSDL from the field
            this.loadWSDLFromDB();
            this.loadImportsFromDB();
            this.fWSClient.parse();
        } else {
            // construct the WSClient by downloading the WSDL
            //Set Wsdl URL
            this.fWSClient.setWSDLUrl(this._getModifiedURL(this.soapMessageGR.wsdl));
            var userPassword="";
            var Encrypter = new GlideEncrypter();

            if(this.soapMessageGR.authentication_type == 'basic') {
            // Basic Auth profile
            var profileRecord = this._getBasicAuthProfile(this.soapMessageGR.basic_auth_profile);
                if(profileRecord.isValidRecord()) {
                    userPassword = Encrypter.decrypt(profileRecord.password);
                    this.fWSClient.setBasicAuth(profileRecord.username, userPassword);
                }
            } else if (this.soapMessageGR.use_basic_auth) {
                // there is basic auth
                userPassword = Encrypter.decrypt(this.soapMessageGR.basic_auth_password);
                this.fWSClient.setBasicAuth(this.soapMessageGR.basic_auth_user, userPassword);
            }

            this.fWSClient.parse();
            if (this.fWSClient.isValid()) {
                this.saveWSDLToDB();
                this.saveImportsToDB();
            }
        }
    },
    
    /**
    * Save WSDL to GlideRecord
    */
    saveWSDLToDB : function() {
        var wsdl_xml = this.fWSClient.getWSDL();
        if (wsdl_xml == null || wsdl_xml == "")
            return;
        
        this.soapMessageGR.wsdl_xml = wsdl_xml;
        this.soapMessageGR.update();
    },
    
    
    /**
    * Load WSDL from GlideRecord
    */
    loadWSDLFromDB : function() {
        this.fWSClient.loadWSDLDocument(null, this.soapMessageGR.wsdl_xml);
    },
    
    /**
    * Load imported documents from GlideRecord
    */
    loadImportsFromDB : function() {
        var importGr = new GlideRecord("sys_soap_message_import");
        importGr.addQuery("soap_message", this.soapMessageGR.sys_id);
        importGr.query();

        try {
            while (importGr.hasNext()) {
                importGr.next();
                this.fWSClient.loadImportDocument(importGr.schema_location, importGr.external_document);
            }
        } catch (e) {
            gs.log("Error loading import documents: " + e.toString());
            gs.addInfoMessage(gs.getMessage("Error loading import documents: " + e.getMessage()));
        }
    },

    /**
    * get imported documents and save them into GlideRecord
    */
    saveImportsToDB : function() {
        var schemaLocations = this.fWSClient.listSchemaLocations();
        if (schemaLocations == null)
            return; // nothing to do

        for ( var i = 0; i < schemaLocations.length; i++)
            this.saveImportedDocument(schemaLocations[i]);

    },

    saveImportedDocument : function(url) {
        var xml = this.fWSClient.getImportedDocument(url);
        if (xml == null || xml == "")
            return; // nothing to do

        var importGr = new GlideRecord("sys_soap_message_import");
        importGr.addQuery("soap_message", this.soapMessageGR.sys_id);
        importGr.addQuery("schema_location", url);
        importGr.query();
        if (importGr.next()) {
            if (importGr.lock == true)
                return; // do not update

            importGr.setValue("external_document", xml);
            importGr.update();
        } else {
            importGr.initialize();
            importGr.setValue("schema_location", url);
            importGr.setValue("external_document", xml);
            importGr.setValue("soap_message", this.soapMessageGR.sys_id);
            importGr.insert();
        }
    },

    /**
    * entry point to class, creates SOAP messages from sys_soap_message record
    */
    process : function() {
        // if the WSDL is alright, generate the sample SOAP messages
        // or else output the error message
        if (this.fWSClient.isValid()) {
            // generate sample SOAP messages
            this.createSOAPMessages(this.soapMessageGR.sys_id);
            gs.addInfoMessage(gs.getMessage("SOAP messages generated"));
        } else {
            // output error message
            var msg = this.fWSClient.getErrorMessage();
            gs.addInfoMessage(gs.getMessage("Unable to load WSDL"));
        }
    },

    /**
    * create SOAP messages from a sys_soap_message record
    */
    createSOAPMessages : function(soapMessageSysId) {
        var functions = this.fWSClient.listMethods();

        for (i = 0; i < functions.length; i++) {
            var funcName = functions[i];
            this.createSOAPMessage(funcName, soapMessageSysId);
        }
    },

    /**
    * create a SOAP message from a sys_soap_message_function record
    */
    createSOAPMessage : function(functionName, soapMessageSysId) {
        gs.log("creating SOAP message: " + functionName);
        var sgr = new GlideRecord("sys_soap_message_function");
        sgr.addQuery("function_name", functionName);
        sgr.addQuery("soap_message", soapMessageSysId);
        sgr.query();
        if (sgr.next()) {
            if (sgr.lock == true) {
                return; // do not update if function is locked
            }

            this.setSOAPMessageValues(sgr, functionName, soapMessageSysId);
            sgr.update();
        } else {
            sgr.initialize();
            this.setSOAPMessageValues(sgr, functionName, soapMessageSysId);
            sgr.insert();
        }
    },

    /**
    * set values for sys_soap_message_function record
    */
    setSOAPMessageValues : function(sgr, functionName, soapMessageSysId) {
        var action = this.fWSClient.getSoapAction(functionName);
        sgr.soap_action = action;
        sgr.setValue("function_name", functionName);
        sgr.setValue("soap_message", soapMessageSysId);
        sgr.envelope = this.fWSClient.createSoapRequest(functionName);
        sgr.soap_endpoint = this.fWSClient.getSoapEndpoint(functionName);
    },

    /**
    * Test UI action code
    */
    test : function(cur, envelope) {
        var request;
        var responseBody;
        var status;
		var scope = cur.soap_message.sys_scope ? cur.soap_message.sys_scope.scope : null;
		var soapMesssageName = scope ? scope + "." + cur.soap_message.name : cur.soap_message.name;

        try{
            var sm = new sn_ws.SOAPMessageV2(soapMesssageName, cur.function_name);
            if (envelope == null) {
                var pgr = new GlideRecord("sys_soap_message_parameters");
                pgr.addQuery("soap_function", cur.sys_id);
                pgr.query();
                while (pgr.next()) {
                    if (pgr.type == "string")
                        sm.setStringParameter(pgr.name, pgr.value);
                    else
                        sm.setStringParameterNoEscape(pgr.name, pgr.value);
                }
            } else {
                sm.setRequestBody(envelope);
            }

            response = sm.execute();
            if (!cur.use_mid_server.nil()) {
                response.waitForResponse(60);// Wait at most 60 seconds to get response if required
            }
            responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
            status = response.getStatusCode();
        }catch(ex){
            responseBody = ex.getMessage();
            status = '500';
        } finally{
            request = sm ? sm.getRequestBody() : null;
        }

        return this.logSOAPTest(cur, request, responseBody, status);
    },

    logSOAPTest : function(cur, request, response, status) {
        var tgr = new GlideRecord("sys_soap_message_test");
        tgr.initialize();
        tgr.soap_function = cur.getValue("sys_id");
        tgr.request = request;
        tgr.response = response;
        tgr.http_status = status;
        tgr.insert();

        return tgr;
    },

    _getModifiedURL : function(url) {
        var modifiedUrl = url;
        if (this.soapMessageGR.enable_mutual_auth) {
            var mAuthProtocol = '' + this.soapMessageGR.getDisplayValue('protocol_profile');
            if (!JSUtil.nil(url) && !JSUtil.nil(mAuthProtocol)) {
                var currentProtocolIndex= url.indexOf('://');
                if(currentProtocolIndex <= 0)
                    mAuthProtocol += '://';
                modifiedUrl = url.replace(url.substring(0, currentProtocolIndex), mAuthProtocol);
            }
        }
        return modifiedUrl;
    },
    _getBasicAuthProfile:function(profileId) {
        var profileRecord = new GlideRecord('sys_auth_profile_basic');
        profileRecord.get(profileId);
        return profileRecord;
    }
}
