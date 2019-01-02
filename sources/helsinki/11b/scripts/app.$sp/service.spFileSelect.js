/*! RESOURCE: /scripts/app.$sp/service.spFileSelect.js */
angular.module('sn.$sp').factory('spFileSelect', ['$rootScope', '$upload', '$timeout', function($rootScope, $upload, $timeout) {
  'use strict';
  var imageFile = {};
  return {
    onFileSelect: function($files, field) {
      imageFile[field.name] = null;
      if ($files.length == 1 && window.FileReader && $files[0].type.indexOf('image') > -1) {
        field.image = null;
        imageFile[field.name] = $files[0];
        var fileReader = new FileReader();
        fileReader.readAsDataURL(imageFile[field.name]);
        fileReader.onload = function(e) {
          field.value = e.target.result;
        }
        $upload.upload({
          url: 'upload',
          data: {},
          formDataAppender: function(formData, key, val) {
            if (angular.isArray(val))
              angular.forEach(val, function(v) {
                formData.append(key, v);
              });
            else
              formData.append(key, val);
          },
          file: imageFile[field.name],
          fileFormDataName: 'myFile'
        })
      }
    }
  }
}]);