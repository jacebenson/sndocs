var ChoiceList = Class.create();

ChoiceList.prototype = {
  initialize : function(tableName, fieldName) {
     this.tableName = tableName;
     this.fieldName = fieldName;
  },

  getValue: function(label) {
     var choiceList =  GlideChoiceList.getChoiceList(this.tableName, this.fieldName);
     return choiceList.getValueOf(label); 
  },

  getLabel: function(value) {
     var choiceList =  GlideChoiceList.getChoiceList(this.tableName, this.fieldName);
     return choiceList.getLabelOf(value); 
  }
}