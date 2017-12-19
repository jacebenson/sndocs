gs.include("PrototypeServer");

var DetermineMobileDevice = Class.create();
DetermineMobileDevice.prototype = {
   
   initialize : function() {
   },
   
   /**
    * Determine whether the mobile interface should be used.
    *
    * Inputs: 
    *    A variable named "user_agent" contains the User Agent string from the browser.
    *
    * Returns:
    *    true - Use the mobile interface.
    *    false - do not use the mobile interface.
    */
   determine: function() {
      if (user_agent.indexOf("Windows CE") > -1) 
         return true;
      if (user_agent.indexOf("BlackBerry") > -1)
         return true;
      if (user_agent.indexOf("Android") > -1)
         return true;
      if (user_agent.indexOf("iPhone") > -1)
         return true;
      if (user_agent.indexOf("Opera Mini") > -1)
         return true;
      return false;
   },

   type: "DetermineMobileDevice"
}