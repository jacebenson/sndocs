gs.include("PrototypeServer");

var NumberManager = Class.create();

NumberManager.prototype = {
  initialize : function(objType) {
    this.objType = objType;
  },

  getNextObjNumber : function() {
    var answer = this.getNextObjNumberPadded();
    if (answer == null)
       answer = this.createNumberCategory();

    return answer;
  },

  getNextObjNumberPadded : function() {
    var answer = null;
    var hier = GlideDBObjectManager.getTables(this.objType); 
    for (var i = 0; i < hier.size(); i++) {
       answer = this.getNextNumber(hier.get(i));
       if (answer != null)
          break;
    }

    return answer;
  },

  // get the next number for a particular category
  getNextNumber : function(category) {  
    var answer = GlideNumberManager.getNumber(category);
    return answer;
  },

  createNumberCategory : function() {
    var n = new GlideRecord("sys_number");
    n.initialize();
    n.category = this.objType;
    n.number = 10001;
    n.prefix = this.getPrefix(this.objType);
    n.insert();

    return n.prefix + 10000;
  },

  getPrefix : function(table) {   
    var answer = table;
    var gr = new GlideRecord(table);
    gr.initialize();
    if (gr.isValid())
       answer = gr.getClassDisplayValue();

    return answer;
  },

  padObjNumber : function(number, digits) {
    var num = number + "";
    while (num.length < digits)
       num = "0" + num;

    return num;
  },

  padAllTableNumbers : function() {
    var number = new GlideRecord("sys_number");
    if (!number.isValid())
       return;
    number.addQuery("maximum_digits",">",2);
    number.query();
    while (number.next())
       this.padTableNumbers(number.category, number.maximum_digits);
  },

  padTableNumbers : function(table, digits) {
    var prefix = "";
    var currentNumber;
    var sys_number = new GlideRecord("sys_number");
    sys_number.addQuery("category",table);
    sys_number.query();
    if (sys_number.next()) {
       prefix = sys_number.prefix;
       if (digits == null)
          digits = sys_number.maximum_digits;
       if (sys_number.maximum_digits != digits) {
          sys_number.maximum_digits = digits;
          sys_number.update();
       }
    }
    if (prefix == "")
       return;

    var records = new GlideRecord(table);
    if (!records.isValid())
       return;

    records.setWorkflow(false);
    records.autoSysFields(false);
    records.query();
    var c = records.getRowCount() + "";
    var i = 0;
    while (records.next()) {
       if (++i%100 == 0)
          gs.print("Padded " + i + " of " + c + " " + table + " numbers due to sys_number.maximum_digits change");
       currentNumber = records.number.toString();
       if (currentNumber.indexOf(prefix) != 0)
          continue;
    
       currentNumber = currentNumber.split(prefix)[1];
       if (currentNumber.length < digits) {
          while (currentNumber.length < digits)
             currentNumber = "0" + currentNumber;
       } else if (currentNumber.length > digits) {
          while (currentNumber.length > digits && currentNumber.charAt(0) == "0")
             currentNumber = currentNumber.substring(1);
       }
       records.number = prefix + currentNumber;
       records.update();
    }
    gs.print("Padded " + i + " of " + c + " " + table + " numbers due to sys_number.maximum_digits change");
  }

}