/*! RESOURCE: /scripts/sp-tinymce/decorator.uiTinymce.js */
angular.module('ui.tinymce').config(function($provide) {
  $provide.decorator('uiTinymceDirective', function($delegate) {
    tinyMCE.baseURL = "/scripts/sp-tinymce";
    tinyMCE.suffix = '.min';
    $delegate[0].priority = 10;
    return $delegate;
  })
});;