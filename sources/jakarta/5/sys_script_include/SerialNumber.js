gs.include("PrototypeServer");

var SerialNumber = Class.create();

SerialNumber.prototype = {
  NUMBERS: [ "notfound", "0123456789", "tobefilled", "notspecified", "empty" ],

  initialize: function(number) {
      this.number = this._normalize(number);
  },

  isValid: function() {
      if(gs.nil(this.number))
          return false;

      for(var i = 0; i < this.NUMBERS.length; i++) {
          var n = this.NUMBERS[i].toLowerCase();
          if (this.number.indexOf(n) > -1)
              return false;
      }

      if (this._isRepetitive())
          return false

      return true;
  },

  get: function() {
      return this.number;
  },

  set: function(gr) {
      if (!this.isValid())
          return;

      gr.setValue("serial_number", this.get());
  },

  _isRepetitive: function() {
      for(var i = 0; i < this.number.length; i++) {
          if (i && this.number.charAt(i) != this.number.charAt(i-1))
              return false;
      }

      return true;
  },

  _normalize: function(number) {
      number = number.toLowerCase();
      number = number.replace(/ /g, "");
      return number;
  },

  type: "SerialNumber"
}


