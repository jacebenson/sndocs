var ExpenseLine = Class.create();
ExpenseLine.prototype = {

	EXPENSE_TABLE: "fm_expense_line",



	/*
	 * Start, requires source GlideRecord and amount values optional description
	 * and costSource
	 */
	initialize: function(/* GlideRecord */source, /* Decimal */ amount, /* String */ description){
		this.LOGGER = new FMLogger(this.TYPE);
		gs.include("JSUtil");

		this.amount = amount;
		this.source = source;
		this.description = description;
	},

	getAmount: function() {
		return this.amount;
	},

	/**
	 * set optional cost source
	 * @param GlideRecord costSource
	 */
	setCostSource: function(costSource){
		this.costSource = costSource;
	},
	
	/**
	 * set optional cost plan
	 * @param GlideRecord costPlan
	 */
	setCostPlan: function(costPlan){
		this.costPlan = costPlan;
	},
	
	/**
	 * set optional resource type
	 * @param GlideRecord resourceType
	 */
	setResourceType: function(resourceType){
		this.resourceType = resourceType;
	},
	
	/**
	 * set optional expense type
	 * @param GlideRecord expenseType
	 */
	setExpenseType: function(expenseType){
		this.expenseType = expenseType;
	},

	/**
	 * set optional cost center
	 * @param GlideRecord costCenter
	 */
	setCostCenter: function(costCenter){
		this.cost_center = costCenter;
	},

	/**
	 * optional, set category field on expense line
	 * @param String category
	 */
	setCategory: function(category){
		this.category = category;
	},

	/*
	 * set optional parent expense for inherited/indirect expenses
	 */
	setParent: function(/* String */expID){
		this.parent = expID;
	},

	/*
	 * set optional base expense for inherited/indirect expenses
	 * used when an expense triggers creation of other expenses
	 */
	setBaseExpense: function(/* String */ expID){
		this.baseExpense = expID;
	},

	/*
	 * set optional month string value
	 */
	setMonth: function(/* String */month){
		this.month = month;
	},

	/*
	 * set optional date value, otherwise its now
	 */
	setDate: function(/* GlideDate */d){
		this.date = d;
	},

	/*
	 * set optional recurring flag
	 */
	setRecurring: function(/* boolean */recurring){
		this.isRecurring = recurring;
	},

	/*
	 * set optional summary type
	 */
	setSummaryType: function(/* String */summaryType){
		this.summaryType = summaryType;
	},

	/*
	 * set appropriate source field based on given table
	 */
	setSourceField: function(sourceTable, sourceID) {
		switch (sourceTable) {
			case 'task':
				this.task = sourceID;
				break;
			case 'ast_contract':
				this.contract = sourceID;
				break;
			case 'cmdb_ci':
				this.ci = sourceID;
				break;
			case 'alm_asset':
				this.asset = sourceID;
				break;
			case 'sys_user':
				this.user = sourceID;
				break;
			case 'cmn_cost_center':
				this.cost_center = sourceID;
				break;
			case 'fm_rate_card':
				this.rate_card = sourceID;
				break;
		}
	},
	
	setRateType: function(rateType) {
		this.rateType = rateType;
	},

	/**
	 * creates expense line record
	 * @return GlideRecord expense line created
	 */
	createExpense: function() {
		this._debug("createExpense starting for " +
		this.source.getDisplayValue() +
		" for " +
		this.amount);
		var expense = new GlideRecord(this.EXPENSE_TABLE);
		expense.date = gs.now();
		expense.amount = this.amount;
		expense.source_table = this.source.getTableName();
		expense.source_id = this.source.getUniqueValue();

		if (this.isRecurring)
			expense.type = "recurring";
		else
			expense.type = "one-time";

		if (!this.description)
			expense.short_description = this.source.getDisplayValue();
		else
			expense.short_description = this.description;

		if (this.costSource && this.costSource.isValidRecord())
			expense.rate_card = this.costSource.getUniqueValue();

		if (this.category)
			expense.category = this.category;
		
		if (expense.isValidField('cost_plan') && this.costPlan)
			expense.cost_plan = this.costPlan;		

		if (expense.isValidField('resource_type') && this.resourceType)
			expense.resource_type = this.resourceType;		

		if (expense.isValidField('expense_type'))
			expense.expense_type = this.expenseType;		

		if (this.summaryType)
			expense.summary_type = this.summaryType;

		if (this.parent) {
			expense.parent = this.parent;
			expense.inherited = true;
		}

		if (this.baseExpense) {
			expense.base_expense = this.baseExpense;
		}

		if (this.asset)
			expense.asset = this.asset;
		if (this.task)
			expense.task = this.task;
		if (this.contract)
			expense.contract = this.contract;
		if (this.ci)
			expense.ci = this.ci;
		if (this.user)
			expense.user = this.user;
		if (this.cost_center)
			expense.cost_center = this.cost_center;
		if (this.rate_card)
			expense.rate_card = this.rate_card;

		if (this.date && this.date != "") {
			expense.date = this.date;
			this.month = new FMUtils().getMonthString(this.date);
		}
		else {
			var d = new GlideDate();
			d.setDisplayValue(gs.now());
			this.month = new FMUtils().getMonthString(d);
		}

		if (this.month && this.month != "") {
			expense.month = this.month;
		}

		expense.state = "pending";

		expense.sys_domain = this.source.sys_domain;

		if(this.rateType)
			expense.rate_type = this.rateType;
		
		if (expense.insert()) {
			this._debug(" _createExpense inserted " + expense.number + " for " +
			this.source.getDisplayValue());
			return expense;
		}
		else {
			this.LOGGER.logWarning("createExpense-failed to insert expense line for " +
			this.source.getDisplayValue(), this.TYPE);
			return null;
		}
	},

	_debug: function(msg){
		this.LOGGER.logDebug(msg, this.TYPE);
	},

	TYPE: "ExpenseLine"

};
