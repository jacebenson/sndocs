var Utils = Class.create();
Utils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	body: {
			user: {
				login: "", 
				firstname: "", 
				lastname: "", 
				mail: "test@fico.com", 
				role_ids: [],
				location_ids: [], 
				organization_ids: ["3"],
				password: "[FILTERED]", 
				password_confirmation: "[FILTERED]", 
				auth_source_id: "8", 
				default_location_id: "",
				mail_enabled: "1", 
				admin: "0", 
				locale: "", 
				timezone: ""
			}
	},
	getEnvironments: function(){
		/*
		* Used by client script to get appropriate Environments
		*/
		var returnArr = [];
		var environments = new GlideRecord('x_fair_foreman_environment');
		environments.addQuery('active','true');
		environments.orderBy('order');
		environments.query();
		while(environments.next()){
			returnArr.push({
				name: environments.getValue('name'),
				sys_id: environments.getValue('sys_id')
			});
		}
		return JSON.stringify(returnArr);
	},
	getRoleQualifer: function(environment){
		var returnStr = '';
		if(environment){
			returnStr += 'active=true';
			returnStr += '^environment=' + environment;
		} else {
			returnStr = 'sys_id=-1';
		}
		return returnStr;
	},
	getLocationQualifer: function(environment){
		var returnStr = '';
		if(environment){
			returnStr += 'active=true';
			returnStr += '^environment=' + environment;
		} else {
			returnStr = 'sys_id=-1';
		}
		return returnStr;
	},
	callForeman: function(current){
		var body = this.body;
		var locations = new GlideRecord('x_fair_foreman_location');
		locations.addEncodedQuery('sys_idIN' + current.variables.locations);
		locations.query();
		while(locations.next()){
			body.user.location_ids.push(locations.getValue('id'));
		}
		var roles = new GlideRecord('x_fair_foreman_role');
		roles.addEncodedQuery('sys_idIN' + current.variables.roles);
		roles.query();
		while(roles.next()){
			body.user.role_ids.push(roles.getValue('id'));
		}
		var user = new GlideRecord('sys_user');
		if(user.get(current.variables.requested_for)){
			body.user.firstname = user.getValue('first_name');
			body.user.lastname = user.getValue('last_name');
			body.user.mail = user.getValue('email');
			body.user.login = user.getValue('user_name');
		}
		//now the body is all set...
		body = JSON.stringify(body,'','  ');
		//gs.info(body);
		var environment = new GlideRecord('x_fair_foreman_environment');
		environment.addQuery('sys_id',current.variables.environment);
		environment.query();
		if(environment.next()){
			var endpoint = environment.endpoint + "/users";
			var restMessage = new sn_ws.RESTMessageV2();
			//var encrypter = new GlideEncrypter();
			//var decrypted = encrypter.decrypt(environment.getValue('password'));
			var decrypted = environment.password.getDecryptedValue();
			restMessage.setBasicAuth(environment.getValue('user'), decrypted);
			restMessage.setRequestHeader("content-type","application/json");
			restMessage.setHttpMethod("post");
			restMessage.setEndpoint(environment.endpoint + "/users");
			restMessage.setMIDServer(environment.midserver.name);
			restMessage.setRequestBody(body);
			var x_fair_foreman_log = new GlideRecord('x_fair_foreman_log');
			x_fair_foreman_log.newRecord();
			x_fair_foreman_log.setValue('endpoint', restMessage.getEndpoint());
			x_fair_foreman_log.setValue('post_body', body);
			x_fair_foreman_log.setValue('headers', JSON.stringify(restMessage.getRequestHeaders(),'','  '));
			x_fair_foreman_log.setValue('task', current.getValue('sys_id'));
			var logID = x_fair_foreman_log.insert();
			restMessage.setEccCorrelator(logID);
			var response = restMessage.execute();
			response.waitForResponse(60);// In seconds. Wait at most 60 seconds to get response
			var responseBody = JSON.parse(response.getBody());
			var responseError = response.haveError() ? response.getErrorMessage() : '';
			var responseCode = response.getStatusCode();
			var x_fair_foreman_log2 = new GlideRecord('x_fair_foreman_log');
			if(x_fair_foreman_log2.get(logID)){
				x_fair_foreman_log2.setValue('response_body', JSON.stringify(responseBody,'','  '));
				x_fair_foreman_log2.setValue('response_code', parseInt(responseCode,10));
				if(responseError != ''){
					var ecc = new GlideRecord('ecc_queue');
					ecc.addQuery('queue', 'input');
					ecc.addQuery('agent_correlator', logID);
					ecc.query();
					if(ecc.next()){
						var xmldoc = new XMLDocument2();
						xmldoc.parseXML(ecc.getValue('payload'));
						var outputObj = JSON.parse(xmldoc.getNodeText('//output'));
						responseError = JSON.stringify(outputObj,'','  ');
						current.work_notes = "Error: " + outputObj.error.full_messages[0];
						current.correlation_id = '';
						current.update();
					}
				}
				x_fair_foreman_log2.setValue('error', responseError);
				var now = new GlideDateTime();
				x_fair_foreman_log2.setValue('response_received', now);
				x_fair_foreman_log2.update();
			}
		}
	},
	type: 'Utils'
});