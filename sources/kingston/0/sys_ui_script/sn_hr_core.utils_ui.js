function _ajaxRecordSet(tableName,query,sysparmName, process){
	var link = "/api/sn_hr_core/utils/getGlideRecord?sysparm_name=" + sysparmName +"&sysparm_tableName="+tableName +"&sysparm_query="+query;
	jQuery.ajax({
		url: link,
		success: function (answer) {
			if (answer) {
				var gr = JSON.parse(answer.result);
				return process(gr);
			}
		},
		error: function(){
			console.warn("ERROR: #Invalid url : " + link);
		}
	});	
}

function getGlideRecord(tableName,sysId,process){
	this._ajaxRecordSet(tableName,sysId,'getGlideRecordSecureData',process);	
}	

function getGlideRecordSet(tableName,query,process){
	this._ajaxRecordSet(tableName,query,'getGlideRecordSecureSetData',process);	
}

function validateDirectDeposit(current, process) {
	var link = "/api/sn_hr_core/utils/validateDirectDeposit?sysparm_name=" + "directDepositValidation" +"&sysparm_current="+JSON.stringify(current);
	jQuery.ajax({
		url: link,
		success: function (answer) {
			if (answer) {
				var gr = JSON.parse(answer.result);
				return process(gr);
			}
		},
		error: function(){
			console.warn("ERROR: #Invalid url : " + link);
		}
	});	
}

function getOpenChildCases(parentID, process) {
	this.getGlideRecordSet('sn_hr_core_case', 'active=true^stateNOT IN1,3,4,7^parent=' + parentID, process);
}