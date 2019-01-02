var hr_Payroll = Class.create();
hr_Payroll.prototype = {
    initialize : function(_gr, _gs) {
		//this._log = new GSLog(sn_hr_core.hr.LOG, this.type).setLog4J();
		this._gr = _gr;
		this._gs = _gs || gs;
		
		
		// Other object scripts have a reference here as they are used throughout
		this.hrUtil = new sn_hr_core.hr_Utils();

		this.depositFieldMap = {
		};
		
		this.bankFieldMap = {
		};
		
		//Record Producer fields
		this.deposit_fields = [
				'deposit_percent',
				'deposit_amount'
			];
		
		this.bank_fields =[
				'bank_name',
				'routing_number',
				'account_number',
				'account_type',
				'account_holder',
				'account_nickname'
			];
	},
	
	_createBankAccountFromParameters: function(parameters, currentAccount){
		var grBankAccount = new GlideRecord("sn_hr_core_profile_bank_account");
		var recFound = false;
		if (currentAccount)
			recFound = grBankAccount.get(currentAccount);
		if (!recFound)
			grBankAccount.initialize();
		else 
			if (grBankAccount.getValue('account_number_display').toString() == parameters.account_number.toString())
			parameters.account_number = grBankAccount.account_number;
		grBankAccount.user = gs.getUserID();
		this.hrUtil.fillInFromMap(grBankAccount, parameters, this.bankFieldMap);
		return recFound?grBankAccount.update():grBankAccount.insert();
	},
	
	createDirectDepositRecord: function(parameters){
		var grDirectDesposit = new GlideRecord("sn_hr_core_direct_deposit");
		var existingRecord = parameters.current_deposit_record;
		var recFound = false;
		if (existingRecord)
			recFound = grDirectDesposit.get(existingRecord);
		if (!recFound)
			grDirectDesposit.initialize();
		grDirectDesposit.employee = gs.getUserID();
		this.hrUtil.fillInFromMap(grDirectDesposit, parameters, this.depositFieldMap);
		if (grDirectDesposit.bank_account)
			grDirectDesposit.bank_account = this._createBankAccountFromParameters(parameters, grDirectDesposit.bank_account);
		else 
			grDirectDesposit.bank_account = this._createBankAccountFromParameters(parameters);
		return recFound ? grDirectDesposit.update() : grDirectDesposit.insert();
	},
	
	maskAccountNumber: function (str){
		var trailingCharsIntactCount = 4;
		str = str.toString();
		var newstr = str;

		if (str.length > 4){
			newstr = str.substring(0, str.length - trailingCharsIntactCount );
			newstr = newstr.replace(/\d/g,'x') + str.slice( -trailingCharsIntactCount);

		}
		return newstr;
	},
	
    type: 'hr_Payroll'
};