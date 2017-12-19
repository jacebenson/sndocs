var PwdAjaxEnrollmentProcessor  = Class.create();

PwdAjaxEnrollmentProcessor.prototype = Object.extendsObject(PwdAjaxRequestProcessor, {

   enroll: function() {	   
	   var map ={}; 
	   
	   // total count.
	   var total = this.getParameter("sysparm_total_count");
	   
	   for(var i = 0; i < total ; i++) {
		   var name = 'sysparm_param_'+i;
		   var data = this.getParameter(name);
		   this._parseData(data,map);
	   }
	   
	   var formCnt = this.getParameter('sysparm_form_count');
	   var userId = gs.getUserID();
	   
	   for(i = 0; i < formCnt ; i++) {
		   var dataFormName = 'sysparm_macro_'+i+'_data';
		   var dataEntryMap = map[dataFormName];
		   
		   var infoName = 'sysparm_macro_'+i+'_info';
		   var infoEntryMap = map[infoName];
		   var processor = infoEntryMap['enrollment_processor'];
		   var verificationId = infoEntryMap['verificationId'];
		   
		   try
		   {
			   // status 0 : in progress.
			   var enrollmentId = this._updateEnrollmentRecord(userId, verificationId, '0');
			   
			   // Call the processor script and process it.
               var extScript = new GlideRecord('sys_script_include');
               extScript.addQuery('name', processor);
               extScript.addQuery('script', 'CONTAINS', 'category: \'password_reset.extension.enrollment_form_processor\'');
               extScript.query();
               
               // if we can't find the script, just notify and abort
               // Since there is no unique constraint on name on sys_script_include, we're jut going to take the first record
               if (!extScript.next()) {
                   this._setErrorResponse(verificationId, gs.getMessage('Cannot find enrollment processor extension: {0}', processor));
                   continue;
               }
             
               // published interface for password_reset.extension.enrollment_check extension type are:
               // @param params.userId         The sys-id of the user being checked (table: sys_user)
               // @param params.verificationId The sys-id of the verification being checked (table: pwd_verification)
               // @param enrollmentId -        The sys-id of this enrollment process.
               // @param request               The form request object. fields in the form can be accessed using: request.getParameter('<element-id>')
               // @return boolean telling whether the user was successfully enrolled           
               var extension = new SNC.PwdExtensionScript(extScript.getValue('sys_id'));
               var extensionParams = new SNC.PwdExtensionScriptParameter();
               extensionParams.userId = userId;
               extensionParams.enrollmentId = enrollmentId;
               extensionParams.verificationId = verificationId;
               
			   //populate the form parameters:
			   this._popluateFormContextParams(dataEntryMap, extensionParams);

               var response = extension.process(extensionParams);  
			   
			   // If the response is not ok, 
			   // then create a response message and continue.
			   if (response.result == 'success') {
				   //Update the enrollment record to update the status "1" : active. 
				   this._updateEnrollmentRecord(userId, verificationId, '1');
			   }
			   //Sets the ajax response from the processor response.
			   this._setResponse(verificationId, response);
		   } catch(err) {
			   this._setErrorResponse(verificationId,err.message);
		   }
	   }//end of for.
	},
	
	/**
	 * Sets the runtime error response
	 */
	_setErrorResponse: function(verificationId, msg) {
		var response = this.newItem(verificationId);
		response.setAttribute('status', 'failure');
		response.setAttribute('message', msg);
	},
		
	/**
	 * Parsing the data.
	 */
	_parseData: function(data, map) {
		var formId = this._getFormId(data);
		var entry = map[formId];
		if(entry==undefined) {
			entry = {}; 
			map[formId]= entry;
		}
		var name = this._getElementName(data);
		var value = this._getElementValue(data);
		
		entry[name]=value;
	},
	
	/**
	 * Returns the from Id from the data. 
	 */
	_getFormId: function(data) {
		var val = data;
		var index = val.indexOf(":");
		return val.substring(0,index);
	},
	
	/**
	 * Returns the element name from the data.
	 */
	_getElementName: function(data) {
		var val = data;
		var index = val.indexOf(':');
		val = val.substring(index+1);
		index = val.indexOf("=");
		return val.substring(0,index);
	},
	
	/**
	 * Returns the element value from the data.
	 */
	_getElementValue: function(data) {
		var val = data;
		var index = val.indexOf('=');
		try
		{
			return val.substring(index+1);
		}
		catch(err)
		{
			return '';
		}
	},
	
	/**
	 * Returns the size 
	 */
	_getSize: function(obj) {
		var size = 0;
	    for (var key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	},
	
	_popluateFormContextParams: function(obj, extensionParams) {
		var value;
		for (var key in obj) {
			value = obj[key];
			extensionParams.setFormParameter(key, value);
		}
	},

	
	 /**
     * Returns true if an enrollment record already exists (separate 'update' from 'insert')
     */
    _doesEnrollmentRecordExist:function (userId, verificationId) {
		var gr = new GlideRecord('pwd_enrollment');
		gr.addQuery('verification', verificationId);
		gr.addQuery('user', userId);
		gr.query();
		return gr.hasNext();
    },
    
    /**
     * Updates the record with userId and verification Id.
     */
    _updateEnrollmentRecord:function (userId, verificationId, status) {
        var sysId;
        if (this._doesEnrollmentRecordExist(userId, verificationId)) {
            sysId = new SNC.PwdEnrollmentManager().updateEnrollment(userId, verificationId, status);
        } else {
            sysId =  new SNC.PwdEnrollmentManager().createEnrollment(userId, verificationId, status);
        }
        return sysId;
    },
    
	/**
	 * Sets the response message.
	 */
	_setResponse:function(verificationId, response) {
	    var res = this.newItem("_" + verificationId);
		res.setAttribute('status' , response.result);
		res.setAttribute('message', response.message);
	},
	
	type:PwdAjaxEnrollmentProcessor
});