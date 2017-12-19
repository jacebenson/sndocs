var CSSClassDecorator = Class.create();
CSSClassDecorator.prototype = {
  initialize: function(className) {
    this._className = className;
  },
  on: function(el) {
    el.addClassName(this._className);
  },
  off: function(el) {
    el.removeClassName(this._className);
  },
  type: 'CSSClassDecorator'
}