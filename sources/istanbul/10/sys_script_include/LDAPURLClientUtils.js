gs.include("LDAPURLUtils");
var LDAPURLClientUtils = Class.create();
LDAPURLClientUtils.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    
	getAccumURLWrapper: function() {
   	var serverSysId = this.getParameter("sysparm_serverSysId");
       this.setAnswer(new LDAPURLUtils().getAccumURL(serverSysId));
    },
    
    type: 'LDAPURLClientUtils'
});