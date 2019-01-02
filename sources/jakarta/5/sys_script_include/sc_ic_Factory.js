var sc_ic_Factory = Class.create();
sc_ic_Factory.prototype = Object.extendsObject(sc_ic_BaseFactory,{
	initialize: function() {
		sc_ic_BaseFactory.prototype.initialize.apply(this,arguments);
		
		/* To use this factory you simply call the registerClass method with the name of the table you want to register it against
		 * and the name of the class that you want to register using the following syntax.
		
		this.registerClass(tableName,class);
		
		* You can register one class against a table.
		*/
	},
	
	type: "sc_ic_Factory"
});

sc_ic_Factory.wrap = function() {
	var fact = new sc_ic_Factory();
	return fact.wrap.apply(fact,arguments);
};

sc_ic_Factory.getWrapperClass = function() {
	var fact = new sc_ic_Factory();
	return fact.getWrapperClass.apply(fact,arguments);
};

sc_ic_Factory.getSecurityManager = function() {
	var fact = new sc_ic_Factory();
	return fact.getSecurityManager.apply(fact,arguments);
};