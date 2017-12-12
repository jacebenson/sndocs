var hr_MySubjectStats = Class.create();
hr_MySubjectStats.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	initialize : function(request, responseXML, gc) {
		global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
	},
	
	getCurrentSelections: function(subject, userId){
		var benefit_tables = ["sn_hr_core_dental_benefit","sn_hr_core_disability_benefit","sn_hr_core_insurance_benefit","sn_hr_core_medical_benefit","sn_hr_core_pharmacy_benefit","sn_hr_core_retirement_benefit","sn_hr_core_vision_benefit"];
		var gr = new GlideRecord(subject);
		gr.addQuery('employee', userId);
		gr.orderByDesc('sys_updated_on');
		gr.query();
		
		if (gr.next()) {
			if (gr.canRead()) {
				if (this._arrayContains(benefit_tables, subject)) {
					var providerId = gr.getValue('provider');
					var provider = new GlideRecord('sn_hr_core_benefit_provider');
					if (provider.get(providerId)) 
						return provider.getValue('plan_name');
				}
			}
		}
		return null;
	},
	
	_arrayContains: function(ary, seed) {
		for (var i = 0; i < ary.length; i++)
			if (ary[i] == seed)
			return true;
		return false;
	},
	
	getStats: function(){
		var subject = this.getParameter('sysparm_subject');
		var sysId = this.getParameter('sysparm_sysId');
		var myStats =  this.getStatsFromSubject(subject, sysId);
		return new global.JSON().encode(myStats);
	},
	
	getStatsFromSubject: function(subject, sysId) {
		var myStats = [];
		if(subject == '401(k)') {
			
			var gr = new GlideRecord('sn_hr_core_retirement_benefit');
			gr.addActiveQuery();
			gr.addQuery('employee', gs.getUserID());
			gr.query();
			if (gr.next() && gr.canRead()){
				var fields = ['employee', 'provider', 'employee_contribution_per_paycheck', 'start_date', 'end_date', 'ytd_employee_contribution_amount'];
				for(var i = 0; i<fields.length; i++) {
					var myStat = {};
					myStat.name = gr.getElement(fields[i]).getLabel();
					myStat.value = gr.getDisplayValue(fields[i]);
					myStats.push(myStat);
				}
			}
		}
		
		if (subject == 'direct_deposit_stats') {
			var grDirectDeposit = new GlideRecord('sn_hr_core_direct_deposit');
			grDirectDeposit.addActiveQuery();
			grDirectDeposit.addQuery('employee', sysId);
			grDirectDeposit.query();
			if(grDirectDeposit.canRead()){
				while (grDirectDeposit.next()) {
					var accnt_number = grDirectDeposit.bank_account.account_number_display.toString();
					var deposit = {account_nickname:grDirectDeposit.bank_account.account_nickname.toString(),
					deposit_percent:grDirectDeposit.deposit_percent.toString(),
					deposit_amount:grDirectDeposit.deposit_amount.toString(),
					account_type:grDirectDeposit.bank_account.account_type.getDisplayValue().toString(),
					account_number:accnt_number,
					record_id:grDirectDeposit.sys_id.toString()
				};
				myStats.push(deposit);
			}
		}
	}
	
	if (subject == 'direct_deposit') {
		var key;
		var field;
		var deposit_record = {};
		var hrPayroll = new hr_Payroll();
		var map = hrPayroll.depositFieldMap;
		var deposit_fields = hrPayroll.deposit_fields;
		var bank_fields = hrPayroll.bank_fields;
		
		var grDeposit = new GlideRecordSecure('sn_hr_core_direct_deposit');
		grDeposit.addQuery("sys_id",sysId);
		grDeposit.query();
		grDeposit.next();
		for (var x in deposit_fields) {
			key = deposit_fields[x];
			field = (map && map[key]) ? map[key] : key;
			if (grDeposit.isValidField(field)) {
				if (grDeposit.getValue(field))
					deposit_record[key]=grDeposit.getValue(field).toString();
				else
					deposit_record[key]= '';
			}
		}
		var grBankAccnt = new GlideRecordSecure('sn_hr_core_profile_bank_account');
		grBankAccnt.get(grDeposit.getValue('bank_account'));
		for (x in bank_fields) {
			key = bank_fields[x];
			field = (map && map[key]) ? map[key] : key;
			if (grBankAccnt.isValidField(field)) {
				if (grBankAccnt.getValue(field)) {
					if (field == "account_number")
						deposit_record[key]=grBankAccnt.getValue('account_number_display').toString();
					else
						deposit_record[key]=grBankAccnt.getValue(field).toString();
				}
				else
					deposit_record[key] = '';
			}
		}
		myStats.push(deposit_record);
	}
	return myStats;
},

type: 'hr_MySubjectStats'
});

