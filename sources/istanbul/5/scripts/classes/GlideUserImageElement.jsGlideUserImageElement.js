/*! RESOURCE: /scripts/classes/GlideUserImageElement.js */
var GlideUserImageElement = Class.create({
  initialize: function(name) {
    this.name = name;
    this._ieResize();
  },
  isTemplatable: function() {
    return false;
  },
  isReadOnly: function() {
    var $element = $(this.name);
    return $element.hasClassName('readonly');
  },
  setReadOnly: function(disabled) {
    var element = gel(this.name);
    var editButtons = gel("edit." + this.name);
    var addButton = gel("add." + this.name);
    var image = gel("image." + this.name);
    if (element)
      element.readOnly = disabled;
    if (disabled) {
      hideObject(editButtons);
      hideObject(addButton);
    } else {
      showObjectInline(editButtons);
      if (!image)
        showObjectInline(addButton);
    }
  },
  isDisabled: function() {
    var editButtons = $("edit." + this.name);
    if (editButtons && editButtons.visible())
      return false;
    var addButton = $("add." + this.name);
    if (addButton && addButton.visible())
      return false;
    return true;
  },
  _ieResize: function() {
    var iInput = gel("image." + this.name);
    if (isMSIE && iInput) {
      var image = $(iInput.value);
      var height = image.getLayout().get('height');
      var maxHeight = parseInt(image.getStyle('max-height').sub('px', ''), 10);
      var width = image.getLayout().get('width');
      var maxWidth = parseInt(image.getStyle('max-width').sub('px', ''), 10);
      if (height > maxHeight || width > maxWidth) {
        var widthRatio = width / maxWidth;
        var heightRatio = height / maxHeight;
        if (widthRatio > heightRatio)
          image.width = maxWidth;
        else
          image.height = maxHeight;
      }
    }
  }
});;