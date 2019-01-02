gs.include("PrototypeServer");

var CatalogLabelEvaluator = Class.create();

CatalogLabelEvaluator.prototype = {
   initialize : function(/* GlideRecord */ gr) {
      this.cartItem = gr;
   },
   
   getLabels: function() {
		var returnArray = [];
		var variable_set = new GlideappVariablePoolQuestionSet();
		variable_set.setCartID(this.cartItem.sys_id);
		variable_set.load();
		var question_list = variable_set.getSummaryVisibleQuestions();
		for (var i=0; i<question_list.size(); i++) {
			var question = question_list.get(i);
			var optionArray = [];
			optionArray.push(question.getLabel());
			optionArray.push(question.getDisplayValue());
			optionArray.push(question.getSummaryMacro());
			optionArray.push(question.getId());
			returnArray.push(optionArray);
		}
		return returnArray;
   },
   
   getDisplayValue: function(question, questionType, value) {
      if (questionType != 18 && questionType != 22)
         return question.getDisplayValue();
      
      var lookupTable = question.getLookupTable();
      var lookupValue = question.getLookupValue();
      if (lookupTable.isEmpty() || lookupValue.isEmpty())
         return question.getDisplayValue();
      
      var lookupLabel = question.getLookupLabel();
      var l = new GlideRecord(lookupTable);
      if (l.get(lookupValue, value)) {
		  if (lookupLabel == "") {
			var label = l.getDisplayValue(lookupValue);
			if (label.isEmpty())
				label = l.getDisplayValue();
            return label;
		  }
         
         var labels = lookupLabel.split(',');
         var activeLabel = null;
         for (var i = 0; i < labels.length; i++) {
            var label = l.getDisplayValue(labels[i].trim());
            if (label == "")
               label = 'null';
            
            if (i == 0)
               activeLabel = label;
            else
               activeLabel += " | " + label;
         }
         
         return activeLabel;
      }
      
      return question.getDisplayValue();
   }
}