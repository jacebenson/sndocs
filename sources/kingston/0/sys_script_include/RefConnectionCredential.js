var RefConnectionCredential = Class.create();

RefConnectionCredential.showCredsbyConnectionType = function(connectionGr) {	
	var connectionType = connectionGr.sys_class_name+"";	
	var answer = "type=";
	
	if(connectionType == "jdbc_connection")
		return answer+"jdbc";
	else if(connectionType == "orch_jms_ds")
		return answer+"jms";
	else
		return "";

};

RefConnectionCredential.showAliasbyConnectionType = function(connectionGr) {	
	var connectionType = connectionGr.sys_class_name+"";	
	return "type=connection^connection_type="+connectionType;
	
};