var CompositeNameElement = Class.create({
  initialize: function(name) {
    this.name = name;
  },
  setReadOnly: function(disabled) {
    var tn = gel('ni_tn_' + this.name);
    var fn = gel('ni_fn_' + this.name);
    tn.disabled = disabled;
    fn.disabled = disabled;
  }
});