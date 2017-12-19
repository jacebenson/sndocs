// NOTE:  When updating this code, be sure and run the tests for Glide List found in the com.snc.test_table plugin. 
// After activing the plugin navigate to Test Table -> Defaults & Client Scripts module and click the 
// "Test glide_list client scripts" button.
var ElementGlideListAjax = Class.create();

ElementGlideListAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  process: function() {
      if (this.getType() == "getDisplayValues")
          this.getDisplayValues(this.getValue());
  },

  // Get the display values for the table and sys_ids specified and return everything in the same order it came in
  // so onChange works correctly.
  getDisplayValues: function(tableAndIds) {
     var argArray = tableAndIds.split(",");
     var table = argArray[0];
     var allValues = argArray.slice(1);
     var displays = new Array(allValues.length);
     var gotDisplay = new Array(allValues.length); 
     var ids = [];

     // separate the email ids from sys_ids
     for (var i=0; i<allValues.length; i++) {
        var value = (allValues[i] + "").trim();
        if (this.isSysId(value))
           ids.push(value);
        else {
           displays[i] = value;
           gotDisplay[i] = true;
        }
     }

     var gr = new GlideRecord(table);
     gr.addQuery("sys_id", ids);
     gr.query();

     while (gr.next()) {
        var sysId = gr.getValue('sys_id');
        var displayValue = gr.getDisplayValue();

        // why can't we support prototype's Array.indexOf() method on our server-side scripts? The code below could be one line...
        var index = -1;
        for (var i=0; i<allValues.length; i++) {
           if ((allValues[i] + "").trim() == sysId) {
              index = i;
              break;
           }
        }

        if (index > -1) {
           displays[index] = displayValue;
           gotDisplay[index] = true;
        }
     }

     var count = 0;
     for (var i=0; i<allValues.length; i++) {
        if (gotDisplay[i] == true) { // if the sys_id does not exist anymore, just drop the value
           var item = this.newItem("reference");
           item.setAttribute('sys_id', (allValues[i] + "").trim());
           item.setAttribute('display', displays[i]);
           count++;
        }
     }
     return count;
  },

  isSysId: function(value) {
     if (value.trim().length == 32) {
        if (value.indexOf("@") == -1)
           return true;
     }
     return false;
  },

  type: "ElementGlideListAjax"
});