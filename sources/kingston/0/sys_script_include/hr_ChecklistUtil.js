var hr_ChecklistUtil = Class.create();
hr_ChecklistUtil.prototype = {
    initialize: function() {
    },
	
	getChecklistItems: function(documentId) {
		var cl = this._getChecklist(documentId);
		var items = [];
		if(cl){
			var cli = new GlideRecord('checklist_item');
			cli.addQuery('checklist',String(cl.sys_id));
			cli.orderBy('order');
			cli.query();
			while(cli.next())
				items.push(
					{
						name: String(cli.name), 
						complete: String(cli.complete)=='true',
						id: String(cli.sys_id)
					}
				);
		}
		return items;
	},
	
	updateChecklist: function(documentId, checklistInfo, checklistTable){
		var cl = this._getChecklist(documentId,checklistTable);
		var cli = new GlideRecord('checklist_item');
 		cli.addQuery('checklist',cl.sys_id+'');
		
		for(var item in checklistInfo){
			if(checklistInfo[item].name){
				this._updateItem(checklistInfo[item],String(cl.sys_id));
				cli.addQuery('name',"!=", checklistInfo[item].name);
			}
		}
		cli.deleteMultiple();
	},
	
	toggleItem: function(itemId) {
		var cli = new GlideRecord('checklist_item');
		if(cli.get(itemId)){
			cli.setValue('complete',String(cli.complete)!='true');
			cli.update();
		}
	},
	
	/*************Private Methods***************/
	
	_getChecklist: function(documentId, checklistTable) {
		var cl = new GlideRecord('checklist');
		cl.addQuery('document',documentId);
		cl.query();
		if(cl.next())		
			return cl;
		else if(checklistTable)
			return this._createChecklist(documentId,checklistTable);
	},
	
	_createChecklist: function(documentId,checklistTable) {
		var cl = new GlideRecord('checklist');
		cl.setValue('document',documentId);
		cl.setValue('table',checklistTable);
		cl.insert();
		return cl;
	},
	
	_updateItem: function(item,checklistId) {
		var cli = new GlideRecord('checklist_item');
		if(item.id){
			if(!cli.get(item.id))
				gs.error("Checklist item not found");
		} else {
			cli.addQuery('name',item.name);
			cli.addQuery('checklist',checklistId);
			cli.query();
			if(!cli.next()) {
				cli.initialize();
				cli.setValue('checklist',checklistId);
			}
		}
		cli.setValue('complete',item.complete);
		cli.setValue('name',item.name);
		cli.setValue('order',item.order);
		cli.update();
	},

    type: 'hr_ChecklistUtil'
};