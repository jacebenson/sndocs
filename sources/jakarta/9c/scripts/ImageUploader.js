/*! RESOURCE: /scripts/ImageUploader.js */
var ImageUploader = Class.create(Uploader, {
  initialize: function($super, containerName, tableName, sys_id) {
    $super(containerName, tableName, sys_id);
  },
  _onFileChange: function($super, input) {
    if (!this._isFileNameValid(input.value))
      return;
    $super(input);
  },
  _isFileNameValid: function(filename) {
    if (endsWithImageExtension(filename))
      return true;
    var message = getMessage('Name is not a recognized image file format');
    alert(message);
    return false;
  }
});;