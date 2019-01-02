gs.include("PrototypeServer");
var SetChangeRisk = Class.create();

SetChangeRisk.prototype = {
   initialize : function() {
   },
   
   setRisk: function(current) {
      var calculate = new RiskCalculator(current);
      var ri = calculate.calculateRisk();
      
      var color = '<FONT COLOR="red">';
      var colorEnd = '</FONT>';
      
      var msg = "";
      
      if (ri != "") {
          msg += gs.getMessage('Risk Condition applied');
          if(ri.name) {
              var desc = GlideStringUtil.escapeHTML(ri.description).replaceAll('"','"');
              var name = GlideStringUtil.escapeHTML(ri.name).replaceAll('"','"');
              msg += ': ' + '<strong><span style="cursor:default;" title="' + 
                     desc + '">' + name + '</span></strong>';
          }
          if (ri.risk == "" || ri.risk == null)
              msg += '; ' + gs.getMessage('Risk unchanged');
          else {
              msg += '; ' + gs.getMessage('Risk: {0}{1}{2}', [color, ri.label, colorEnd]); 
              current.risk = ri.risk;
          }
      
          if (ri.impact == "" || ri.impact == null)
              msg += '; ' + gs.getMessage('Impact unchanged');
          else {
              msg += '; ' + gs.getMessage('Impact: {0}{1}{2}', [color, ri.impactLabel, colorEnd]); 
              current.impact = ri.impact;
          }
      
          gs.addInfoMessage(msg);
      }
   }

}
