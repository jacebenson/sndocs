var ExpenseManagementUtils = Class.create();
ExpenseManagementUtils.prototype = {
   
   /*
    * Start
    */
   initialize: function(){
   },
   
   /*
    * calculate and return the amount of tax and the
    * new total based on the values supplied
    */
   getTaxAmount: function (/*Boolean*/salesTax, /*Float*/baseAmount, /*Float*/taxRate){
      var currency = baseAmount.substring(0,baseAmount.indexOf(";"));
      var baseCost = parseFloat(baseAmount.substring(baseAmount.indexOf(";")+1).replace(",",""), 10);
      var taxCost;
	  var amount;
      
	  if (salesTax == true) {
         taxCost = baseCost / 100 * taxRate;
         // rounding the taxCost to 2 digit after point
         taxCost = Math.round(taxCost * 100)/100;
         amount = taxCost + baseCost;
      } else {
         taxCost = 0;
		 taxRate = 0;
         amount = baseCost;
      }
	   // Format to 2 decimal positions
	  taxCost = taxCost.toFixed(2);
	  amount = amount.toFixed(2);

      var gr = new GlideRecord("fx_currency");
      gr.addQuery("code", currency);
      gr.query();
      gr.next();
      var symbol = gr.symbol;
      
      return {taxCost:taxCost, currency:currency, symbol:symbol, amount:amount, taxRate:taxRate};
   },
	
	fetchFixedAssset: function(asset) {
		var gr = new GlideRecord('m2m_fixed_asset_to_asset');
		gr.addQuery('asset', asset);
		gr.setLimit(1);
		gr.query();
		if (gr.next())
			return gr.fixed_asset;
		return null;
	}, 
   
   fetchValues: function(record, table, expenseLine) {
      var task = '';
      var ci = '';
      var asset = '';
	  var fixed_asset = '';
      var user = '';
      var cost_center = '';
      var contract = '';
      
      var baseTable = new TableUtils(table);
      gr = new GlideRecord(table);
      gr.get(record);
      
      if (baseTable.getAbsoluteBase() == 'cmdb_ci') {
         ci = gr.sys_id;
         asset = gr.asset;
		 fixed_asset = this.fetchFixedAssset(asset);
         user = gr.assigned_to;
         cost_center = gr.cost_center;
      } else if (baseTable.getAbsoluteBase() == 'task') {
         task = gr.sys_id;
         ci = gr.cmdb_ci;
         asset = gr.cmdb_ci.asset;
		 fixed_asset = this.fetchFixedAssset(asset);
         if (gr.isValidField('caller_id'))
            user = gr.caller_id;
         else if (gr.isValidField('requested_by'))
            user = gr.requested_by;
         cost_center = gr.cmdb_ci.cost_center;
      } else if (baseTable.getAbsoluteBase() == 'alm_asset') {
         ci = gr.ci;
		 asset = gr.sys_id;
		 fixed_asset = this.fetchFixedAssset(asset);
         user = gr.assigned_to;
         cost_center = gr.cost_center;
      } else if (table == 'ast_contract') {
         cost_center = gr.cost_center;
		 asset = expenseLine.asset;
		 fixed_asset = this.fetchFixedAssset(asset);
		 if (expenseLine.asset != '') {
		 	var assetRecord = new GlideRecord('alm_asset');
		 	assetRecord.get(asset);
		 	ci = assetRecord.ci;
		 }
		 user = expenseLine.user;
         contract = gr.sys_id;
      }
      
	   return {task:task, ci:ci, asset:asset, fixed_asset:fixed_asset, user:user, cost_center:cost_center, contract:contract};
   },
   
   TYPE: "ExpenseManagementUtils"
   
};