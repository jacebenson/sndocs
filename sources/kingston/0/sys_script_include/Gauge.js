gs.include("PrototypeServer");

var Gauge = Class.create();

Gauge.prototype = {
  initialize: function(id) {
     this.gauge = new GlideGauge(id);
     this.id = id;
  },

  setName: function(name) {
     this.gauge.setName(name);
     this.gauge.setTitle(name);
     this.gauge.update();
  },

  z: function() {}
}
