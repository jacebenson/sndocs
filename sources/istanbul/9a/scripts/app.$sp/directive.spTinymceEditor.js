/*! RESOURCE: /scripts/app.$sp/directive.spTinymceEditor.js */
angular.module('sn.$sp').directive('spTinymceEditor', function(getTemplateUrl, snAttachmentHandler, $timeout) {
  return {
    templateUrl: getTemplateUrl('sp_tinymce_editor.xml'),
    restrict: 'E',
    replace: true,
    scope: {
      model: "=ngModel",
      options: "=ngModelOptions",
      snBlur: '&',
      snDisabled: '=?'
    },
    controller: function($scope) {
      $scope.options = $scope.options || {};
      var thisEditor = {};
      var langs = 'cs,de,en,es,fi,fr,he,it,ja,ko,nl,pl,pt,ru,zh,zt';
      var userLanguage = g_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = g_system_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = 'en';
      $scope.tinyMCEOptions = {
        skin: 'lightgray',
        theme: 'modern',
        menubar: false,
        language: userLanguage,
        statusbar: false,
        plugins: "codesample code",
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image | codesample code',
        setup: function(ed) {
          thisEditor = ed;
          ed.addCommand('imageUpload', function(ui, v) {
            $scope.clickAttachment();
          });
          ed.addButton('image', {
            icon: 'image',
            tooltip: 'Insert image',
            onclick: function(e) {
              ed.execCommand('imageUpload');
            },
            stateSelector: 'img:not([data-mce-object],[data-mce-placeholder])'
          });
          ed.on('blur', function() {
            if (angular.isDefined($scope.snBlur))
              $scope.snBlur();
          });
          $scope.registerPasteHandler();
        }
      };
      $scope.attachFiles = function(data) {
        snAttachmentHandler.create("kb_social_qa_question", "-1").uploadAttachment(data.files[0], null, {}).then(function(response) {
          var args = tinymce.extend({}, {
            src: encodeURI("/" + response.sys_id + ".iix"),
            style: "max-width: 100%; max-height: 480px;"
          });
          thisEditor.execCommand('mceInsertContent', false, thisEditor.dom.createHTML('img', args), {
            skip_undo: 1
          });
        });
      };
      $scope.$watch('snDisabled', function(newValue) {
        if (angular.isDefined(newValue) && typeof thisEditor.setMode == "function")
          thisEditor.setMode(newValue ? 'readonly' : 'design');
      });
    },
    link: function(scope, element, attrs) {
      scope.attrs = attrs;
      scope.clickAttachment = function() {
        element.find("input").click();
      };
      scope.registerPasteHandler = function() {
        $timeout(function() {
          element.find('iframe').contents().find('body').bind('paste', function(e) {
            e = e.originalEvent;
            var files = [];
            for (var i = 0; i < e.clipboardData.items.length; i++) {
              var item = e.clipboardData.items[i];
              if (item.kind && item.kind === "file") {
                var file = item.getAsFile();
                Object.defineProperty(file, "name", {
                  value: "Pasted File - " + new Date()
                });
                files.push(file);
              }
            }
            if (files.length > 0) {
              e.stopPropagation();
              e.preventDefault();
              scope.attachFiles({
                files: files
              });
            }
          });
        });
      };
    }
  }
});