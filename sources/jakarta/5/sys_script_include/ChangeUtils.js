var ChangeUtils = Class.create();
ChangeUtils.prototype = Object.extendsObject(ChangeUtilsSNC, {

	initialize: function(request, responseXML, gc) {
		ChangeUtilsSNC.prototype.initialize.call(this, request, responseXML, gc);
	},

	/***************************
	 *
	 *Add customer changes below
	 *
	 ****************************/


	type: 'ChangeUtils'
});

/********************************************************************
 *The function below is written in this way to provide access via the
 *signature ChangeUtils.isCopyChangeEnabled() from UI Action -
 *'Copy Change' > Condition.
 *
 *Customers are suggested to override methods inside the body of
 *ChangeUtils' object definition.
 ********************************************************************/

ChangeUtils.isCopyChangeEnabled = function(current) {

	var changeUtils = new ChangeUtils();

	if (changeUtils.isCopyFlagValid() && changeUtils.isCopyRulesValid(current)) {
		return true;
	} else {
		return false;
	}

};