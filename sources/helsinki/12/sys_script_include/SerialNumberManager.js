// Discovery

var SerialNumberManager = Class.create();

SerialNumberManager.prototype = {
  initialize : function() {
      this._serials = {};
      this._serialArray = [];
  },

  add: function(sType, value) {
      if (JSUtil.nil(value))
          return;

      this._serials[sType] = value;
      this._serialArray.push(value);
  },

  getSerialNumber: function() {
      var sn =  new SncSerialNumber(this._serialArray);
      return sn.get();
  }, 

  getSerialsForCIData: function() {
      var srlArray = [];
      for (var sType in this._serials) {
          var value = this._serials[sType];

          var sr = {};
          sr['serial_number_type'] = sType;
          sr['serial_number']      = value;
          sr['valid']              = this.isValid(value);

          srlArray.push(sr);
      }
          
      return srlArray;
  },

  isValid: function(value) {
      var sn =  new SncSerialNumber();
      return sn.isValid(value);
  },

}