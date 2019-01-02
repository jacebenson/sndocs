var CSMUtil = Class.create();
CSMUtil.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	initialize:function(){
		
	},
	isDebugOn:function(){
		var log = GlideProperties.get("CSM_debug_log",false);
		if(log == "true"){
			return true;
		}
		return false;
	},
    type: 'CSMUtil'
});