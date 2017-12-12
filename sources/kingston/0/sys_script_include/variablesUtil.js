var variablesUtil = Class.create();
variablesUtil.prototype = {
    initialize: function() {
    },
	questionTypes: {
		"1" : {type: "Yes / No", render: true},
		"2" : {type: "Multi Line Text", render: true},
		"3" : {type: "Multiple Choice", render: true},
		"4" : {type: "Numeric Scale", render: true},
		"5" : {type: "Select Box", render: true},
		"6" : {type: "Single Line Text", render: true},
		"7" : {type: "Check Box", render: true},
		"8" : {type: "Reference", render: true},
		"9" : {type: "Date", render: true},
		"10": {type: "Date / Time", render: true},
		"11": {type: "Label", render: true},
		"12": {type: "Break", render: false},
		"13": {type: "", render: false},
		"14": {type: "Macro", render: false},
		"15": {type: "UI Page", render: false},
		"16": {type: "Wide Single Line Text", render: true},
		"17": {type: "Macro with Label", render: false},
		"18": {type: "Lookup Select Box", render: true},
		"19": {type: "Container Start", render: false},
		"20": {type: "Container End", render: false},
		"21": {type: "List Collector", render: true},
		"22": {type: "Lookup Multiple Choice", render: true}
	},
	getQuestionsAnswers: function(taskSysid){
		var questions = [];
		var question_answers = new GlideRecord('sc_item_option_mtom');
		question_answers.addQuery('request_item', taskSysid);
		question_answers.orderBy('sc_item_option.order');
		question_answers.query();
		while(question_answers.next()){
		    var question = this.questionTypes[question_answers.sc_item_option.item_option_new.type];
		    if(question.render){
		        if(question.type === "Reference"){
					var referencegr = new GlideRecord(question_answers.sc_item_option.item_option_new.reference);  
					referencegr.addQuery('sys_id', '=', question_answers.sc_item_option.value);  
					referencegr.query();  
					while (referencegr.next()) {  
						questions.push({
							label   : question_answers.sc_item_option.item_option_new.getDisplayValue(),
							value   : referencegr.getDisplayValue(),
							type    : "string"
						});
					}  
		        } else if (question.type === "Lookup Select Box"){
					var lsbgr = new GlideRecord(question_answers.sc_item_option.item_option_new.lookup_table);  
					lsbgr.addQuery('sys_id', '=', question_answers.sc_item_option.value);  
					lsbgr.query();  
					while (lsbgr.next()) {  
						questions.push({
							label   : question_answers.sc_item_option.item_option_new.getDisplayValue(),
							value   : lsbgr.getDisplayValue(),
							type    : "string"
						});
					}  
		        //} else if (question.type === "Lookup Multiple Choice"){
		        } else if (question.type === "List Collector"){
					var list = question_answers.sc_item_option.value.getDisplayValue();  
					var listarray = list.split(',');
		            var listvalues = [];
					for (i = 0; i != listarray.length; i = i + 1) {  
						var igr = new GlideRecord(question_answers.sc_item_option.item_option_new.list_table);  
						igr.addQuery('sys_id', '=', listarray[i]);  
						igr.query();  
						while (igr.next()) {  
		                    listvalues.push(igr.getDisplayValue());
						}  
					}
					questions.push({
						label   : question_answers.sc_item_option.item_option_new.getDisplayValue(),
						value   : listvalues.toString(),
						type    : "string"
					});
		        } else if (question.type === "Check Box"){
					questions.push({
						label   : question_answers.sc_item_option.item_option_new.getDisplayValue(),
						value   : question_answers.sc_item_option.value.getDisplayValue(),
						type    : "boolean"
					});
				} else {
					questions.push({
						label   : question_answers.sc_item_option.item_option_new.getDisplayValue(),
						value   : question_answers.sc_item_option.value.getDisplayValue(),
						type    : "string"
					});
		        }
		    }
		}
		return questions;
	},
    type: 'variablesUtil'
};