/*! RESOURCE: /scripts/thirdparty/radio/radioButton.js */
var RadioButton = function(domNode, groupObj) {
  this.domNode = domNode;
  this.radioGroup = groupObj;
  this.keyCode = Object.freeze({
    'RETURN': 13,
    'SPACE': 32,
    'END': 35,
    'HOME': 36,
    'LEFT': 37,
    'UP': 38,
    'RIGHT': 39,
    'DOWN': 40
  });
};
RadioButton.prototype.init = function() {
  this.domNode.tabIndex = -1;
  this.domNode.setAttribute('aria-checked', 'false');
  this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
  this.domNode.addEventListener('click', this.handleClick.bind(this));
  this.domNode.addEventListener('focus', this.handleFocus.bind(this));
  this.domNode.addEventListener('blur', this.handleBlur.bind(this));
};
RadioButton.prototype.handleKeydown = function(event) {
    var tgt = event.currentTarget,
      flag = false,
      clickE