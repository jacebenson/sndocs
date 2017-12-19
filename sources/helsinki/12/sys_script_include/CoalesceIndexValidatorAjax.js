var CoalesceIndexValidatorAjax = Class.create();
CoalesceIndexValidatorAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	
	getIndexData : function(){
		var mapId = this.getParameter('sysparm_map_id') + '';
    	var validator = new SNC.CoalesceIndexValidator(mapId);
		var result = this.newItem("result");
    	var indexNeeded;
    	var targetTable;
    	var coalesceFieds;
		if(validator.isIndexRequired()){
			indexNeeded = "true";
		} 
		else{
			indexNeeded = "false";
		}
		targetTable = validator.getTargetTableName();
		coalesceFieds = validator.getCoalesceFields();
		result.setAttribute("indexNeeded", indexNeeded);
		result.setAttribute("coalesceFieds", coalesceFieds);
		result.setAttribute("targetTable",targetTable);
},

    type: 'CoalesceIndexValidatorAjax'
});