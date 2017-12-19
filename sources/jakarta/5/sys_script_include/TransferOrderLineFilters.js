var TransferOrderLineFilters = Class.create();
TransferOrderLineFilters.prototype = {
   initialize : function() {
   },
   
   /*
    * Description: Used as RefQual for Asset list in Transfer Order Line,
    * return Assets with a given Model
    */
   getAssetItem : function(transferOrderLine) {
	  
      var fromStockroom = null;
      if (!transferOrderLine.transfer_order.nil())
         fromStockroom = transferOrderLine.transfer_order.from_stockroom;
      else if (!transferOrderLine.from_stockroom.nil())
         fromStockroom = transferOrderLine.from_stockroom;
      
      var ci = new GlideRecord('alm_asset');
      if (fromStockroom)
	      ci.addQuery('stockroom', fromStockroom);
      ci.addQuery('install_status', '6');
      ci.addQuery('substatus', 'available').addOrCondition('substatus',
      'pre_allocated');
      ci.addQuery('active_to', 'false').addOrCondition('active_to', null);
      if (!transferOrderLine.model.nil())
         ci.addQuery('model', transferOrderLine.model);
      ci.query();
      
      var strQuery = 'sys_idIN';
      while (ci.next())
         strQuery += ',' + ci.sys_id;
      
      return strQuery;
   },
   
   /*
    * Description: Used as RefQual for Model list in Transfer Order Line,
    * return Models for stockroom
    */
   getModels : function(transferOrderLine) {
	  
      var fromStockroom = null;
      if (!transferOrderLine.transfer_order.nil())
         fromStockroom = transferOrderLine.transfer_order.from_stockroom;
      else if (!transferOrderLine.from_stockroom.nil())
         fromStockroom = transferOrderLine.from_stockroom;
      
      var ci = new GlideAggregate('alm_asset');
      if (fromStockroom)
	      ci.addQuery('stockroom', fromStockroom);
      ci.addQuery('install_status', '6');
      ci.addQuery('substatus', 'available').addOrCondition('substatus',
      'pre_allocated');
      ci.addQuery('active_to', 'false').addOrCondition('active_to', null);
      if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management') && !transferOrderLine.part_requirement.nil()) {
      	var modelList = transferOrderLine.part_requirement.model;
      	var substitutes = new GlideRecord('cmdb_m2m_model_substitute');
      	substitutes.addQuery('model', transferOrderLine.part_requirement.model);
      	substitutes.query();
      	while (substitutes.next())	{
      		modelList += ',' + substitutes.substitute;
      	}
      
      	ci.addEncodedQuery('modelIN' + modelList);
      }
      ci.groupBy('model');
      ci.query();
      
      var strQuery = 'sys_idIN';
      while (ci.next())
         strQuery += ',' + ci.model;
      
      return strQuery;
   },
   
   /*
    * Description: Used as RefQual for From Stockrom list in Transfer Order
    * Line
    */
   getFromStockrooms : function(transferOrderLine) {	  
	   if(transferOrderLine.asset != '')
			return 'sys_idIN'+transferOrderLine.asset.stockroom;
	   var fieldAgentTypeId = 'e2aa2b3f3763100044e0bfc8bcbe5dde';
	   var sr = new GlideAggregate('alm_asset');
	   if (!transferOrderLine.model.nil())
		   sr.addQuery('model', transferOrderLine.model);
	   sr.addQuery('install_status', '6');
	   sr.addQuery('substatus', 'available').addOrCondition('substatus', 'pre_allocated');
	   
	   // If the des is not empty, get the general stockroom that contains the asset
	   if(!transferOrderLine.to_stockroom.nil()){
		   sr.addQuery('stockroom.type', '!=', fieldAgentTypeId);
	   }
		   
	   sr.groupBy('stockroom');
	   sr.query();
	   
	   var strQuery = 'sys_idIN';
	   while (sr.next()){
		   strQuery += ',' + sr.stockroom;  
		}
	  
		var sr2 = new GlideAggregate('alm_asset');
		if (!transferOrderLine.model.nil())
			sr2.addQuery('model', transferOrderLine.model);
		sr2.addQuery('install_status', '6');
		sr2.addQuery('substatus', 'available').addOrCondition('substatus', 'pre_allocated');
		sr2.addQuery('stockroom.type', fieldAgentTypeId);
		
		sr2.groupBy('stockroom');
		sr2.query();
		
		while (sr2.next()){
			if (!transferOrderLine.to_stockroom.nil()){
				if (transferOrderLine.to_stockroom == sr2.stockroom)
					return 'sys_id=' + transferOrderLine.to_stockroom + '^OR' + strQuery;
			}else{
				if (!transferOrderLine.part_requirement.service_order_task.assigned_to.nil()){
				   if (transferOrderLine.part_requirement.service_order_task.assigned_to == sr2.stockroom.manager)
					   return strQuery + '^type!=' + fieldAgentTypeId + '^ORmanager=' + transferOrderLine.part_requirement.service_order_task.assigned_to;
					else continue;
				}
			}
			
		}
	   if (!transferOrderLine.part_requirement.service_order_task.assigned_to.nil())
		   return strQuery + '^type!=' + fieldAgentTypeId;
	   return strQuery;
   },
   
   /*
    * Description: Used as RefQual for From Stockrom list in Transfer Order
    * Line
    */
   getToStockrooms : function(transferOrderLine) {
	   var fieldAgentTypeId = 'e2aa2b3f3763100044e0bfc8bcbe5dde';
	   if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.work_management')){
   
		   var sr3 = new GlideRecord('alm_stockroom')
	       sr3.addQuery('type', '!=', fieldAgentTypeId);
		   sr3.query();
		   
           var strQuery2 = 'sys_idIN';
		   while (sr3.next()){
		       strQuery2 += ',' + sr3.sys_id;  
		   }
		   var sr4 = new GlideRecord('alm_asset');
		   if (!transferOrderLine.model.nil())
			   sr4.addQuery('model', transferOrderLine.model);
			sr4.addQuery('install_status', '6');
			sr4.addQuery('substatus', 'available').addOrCondition('substatus', 'pre_allocated');
			sr4.addQuery('stockroom.type', fieldAgentTypeId);
			sr4.groupBy('stockroom');
			sr4.query();
		   var strQuery3 = 'sys_idIN';
		   while(sr4.next()){
				strQuery3 += ',' + sr4.stockroom; 
			   if (sr4.stockroom == transferOrderLine.from_stockroom)
				   return "sys_id=" + transferOrderLine.from_stockroom;
		   }
		   if ( !transferOrderLine.part_requirement.service_order_task.assigned_to.nil())
			      return 'manager=' + transferOrderLine.part_requirement.service_order_task.assigned_to + '^OR' + strQuery2;
		   return;
	   }
      else if (SNC.AssetMgmtUtil.isPluginRegistered('com.snc.field_service_management'))
         return 'sys_id!=' + transferOrderLine.from_stockroom + '^type!=' + fieldAgentTypeId + '^ORmanager=' + transferOrderLine.part_requirement.service_order.assigned_to;
   },
   
   type : 'TransferOrderLineFilters'
};