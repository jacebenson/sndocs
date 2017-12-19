var TaskSLALogging = Class.create();
TaskSLALogging.prototype = {
    initialize: function() {
		this.gru = new GlideRecordUtil();
		this.json = new JSON();
    },
	 
	getBusinessRuleStackMsg: function() {
		var stackMsg = "Business rule stack: " + this.getBusinessRuleStack();

		return stackMsg;
	},
	
	getRecordContentMsg: function(record, recordLabel) {
		if (!record || !(record instanceof GlideRecord))
			return "No record supplied so content cannot be logged";

		if (!recordLabel)
			recordLabel = "";
		else
			recordLabel = " (" + recordLabel + ")";
		
		var recordContentMsg = "Field values for " + record.getRecordClassName() +
							   " " + record.getDisplayValue() +
							   recordLabel + ":\n" +
							   this.getRecordContent(record);

		return recordContentMsg;
	},
	
	getBusinessRuleStack: function() {
		return gs.getSession().getBusinessRuleStack();	
	},
	
	getRecordContent: function(record) {
		if (!record || !(record instanceof GlideRecord))
			return;
		
		var fieldData = {};
		this.gru.populateFromGR(fieldData, record);
		
		return this.json.encode(fieldData);
	},

    type: 'TaskSLALogging'
};