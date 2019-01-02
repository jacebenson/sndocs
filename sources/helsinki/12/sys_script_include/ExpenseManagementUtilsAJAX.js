var ExpenseManagementUtilsAJAX = Class.create();
ExpenseManagementUtilsAJAX.prototype = Object.extendsObject(AbstractAjaxProcessor, {
   /*
    * calculate and return the amount of tax and the
    * new total based on the values supplied
    */
   getTaxAmount: function () {
	  var base = this.getParameter('sysparm_compoundAmount');
      var saleTax = this.getParameter('sysparm_salesTax') == 'true';
	  var taxRate = this.getParameter('sysparm_taxRate').replace(",","");
      
	  var totalCosts = new ExpenseManagementUtils().getTaxAmount(saleTax, base, taxRate);
	  var result = this.newItem("result");
	  result.setAttribute("taxRate", totalCosts.taxRate);
	  result.setAttribute("taxCost", totalCosts.taxCost);
	  result.setAttribute("currency", totalCosts.currency);
	  result.setAttribute("symbol", totalCosts.symbol);
	  result.setAttribute("amount", totalCosts.amount);
   },
   
   fetchValues: function () {
	  var record = this.getParameter('sysparm_record');
      var table = this.getParameter('sysparm_table');
      
	  var values = new ExpenseManagementUtils().fetchValues(record, table);
	  var result = this.newItem("result");
	  result.setAttribute("task", values.task);
	  result.setAttribute("ci", values.ci);
	  result.setAttribute("asset", values.asset);
	  result.setAttribute("user", values.user);
	  result.setAttribute("cost_center", values.cost_center);
	  result.setAttribute("contract", values.contract);
   }
});
