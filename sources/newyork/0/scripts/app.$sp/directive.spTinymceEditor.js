/*! RESOURCE: /scripts/app.$sp/directive.spTinymceEditor.js */
angular.module('sn.$sp').directive('spTinymceEditor', function(getTemplateUrl, snAttachmentHandler, $timeout, i18n, spAriaUtil, $rootScope, spUtil) {
  return {
    templateUrl: getTemplateUrl('sp_tinymce_editor.xml'),
    restrict: 'E',
    replace: true,
    scope: {
      model: '=ngModel',
      field: '=?',
      options: '=ngModelOptions',
      snBlur: '&',
      snDisabled: '=?',
      getGlideForm: '&glideForm',
      ngChange: '&',
      attachmentGuid: '=?',
      recordTableName: '=?',
      textId: '@?'
    },
    controller: function($scope, $element, $attrs) {
      $scope.accessibilityEnabled = spAriaUtil.g_accessibility === "true";
      $scope.onChangeModel = function() {
        $timeout(function() {
          $scope.ngChange();
        });
      }
      $scope.options = $scope.options || {};
      var thisEditor = {};
      var g_form;
      var field;
      if (typeof $attrs.glideForm != "undefined") {
        g_form = $scope.getGlideForm();
      }
      if (typeof $attrs.field != "undefined") {
        field = $scope.field;
      }
      var guID = new Date().valueOf();
      $scope.textareaId = ($scope.textId ? $scope.textId.replace('.', '-') : 'ui-tinymce-') + guID;
      var langs = 'cs,de,en,es,fi,fr,he,it,ja,ko,nl,pl,pt,ru,zh,zt';
      var userLanguage = g_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = g_system_lang;
      if (!userLanguage || langs.indexOf(userLanguage) == -1)
        userLanguage = 'en';
      var setMode = function() {
        var isReadOnly = g_form.isReadOnly(field.name);
        thisEditor.setMode(isReadOnly ? 'readonly' : 'design');
        var body = thisEditor.getDoc().body;
        body.style.backgroundColor = isReadOnly ? "#eeeeee" : "#fff";
        var doc = thisEditor.getDoc();
        doc.documentElement.style.height = '90%';
        doc.body.style.height = '90%';
        $timeout(function(i18n) {
          body.setAttribute('contenteditable', !isReadOnly);
          body.setAttribute('aria-label', $scope.field.label);
          body.setAttribute('aria-required', $scope.field.isMandatory());
        }, 1000);
      }
      var updateMode = function() {
        if (typeof thisEditor.setMode == "function") {
          if (thisEditor.getContainer()) {
            setMode();
          } else {
            thisEditor.on('init', function() {
              setMode();
            });
          }
        } else {
          $timeout(updateMode, 10);
        }
      }
      var removeScriptHost = true;
      if (typeof g_tinymce_remove_script_host !== "undefined")
        removeScriptHost = g_tinymce_remove_script_host;
      var convertURLs = false;
      if (typeof g_tinymce_convert_urls !== "undefined")
        convertURLs = g_tinymce_convert_urls;
      var relativeURLs = true;
      if (typeof g_tinymce_relative_urls !== "undefined")
        relativeURLs = g_tinymce_relative_urls;

      function getTableAndSysId() {
        var result = {};
        var form = $scope.getGlideForm();
        if (form) {
          var tableName = form.getTableName();
          var sysId = form.getSysId();
          if (tableName) {
            result.table = tableName;
            result.sys_id = sysId > -1 ? sysId : $scope.attachmentGuid;
          } else {
            result.table = form.recordTableName;
            result.sys_id = $scope.attachmentGuid || sysId;
          }
        } else {
          result.table = $scope.recordTableName;
          result.sys_id = $scope.attachmentGuid;
        }
        return result;
      }

      function update() {
        $scope.$applyAsync(function() {
          var rawValue = thisEditor.getContent({
            format: 'raw'
          });
          var textContent = thisEditor.getContent({
            format: 'text'
          }).trim();
          var content = (textContent || rawValue.indexOf('img') !== -1) ? rawValue : textContent;
          $scope.model = content;
          if ($scope.field) {
            $scope.field.value = $scope.field.stagedValue = content;
          }
        });
      }
      var toolbar = ["undo redo", "formatselect", "bold italic", "alignleft aligncenter alignright alignjustify", "bullist numlist outdent indent", "link unlink", "image", "codesample code"];
      $scope.tinyMCEOptions = {
        skin: 'lightgray',
        theme: 'modern',
        menubar: false,
        language: userLanguage,
        remove_script_host: removeScriptHost,
        convert_urls: convertURLs,
        relative_urls: relativeURLs,
        statusbar: false,
        plugins: "codesample code link paste",
        toolbar: toolbar.join(" | "),
        paste_data_images: true,
        browser_spellcheck: true,
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
            update();
            if (angular.isDefined($scope.snBlur))
              $scope.snBlur();
          });
          ed.on('ProgressState', function(e) {
            $rootScope.$emit('$sp.html.editor.progress', e);
          });
        },
        images_upload_handler: function(blobInfo, success, failure) {
          var blob = blobInfo.blob();
          var fileName = blobInfo.filename();
          blob.name = "Pasted image" + fileName.substr(fileName.lastIndexOf("."));
          var data = getTableAndSysId();
          if (data.table && data.sys_id) {
            thisEditor.setProgressState(true);
            snAttachmentHandler.create(data.table, data.sys_id).uploadAttachment(blob, null, {}).then(function(response) {
              success("/sys_attachment.do?sys_id=" + response.sys_id);
              update();
              thisEditor.setProgressState(false);
            });
          } else {
            console.warn("GlideForm or table and record id is not provided");
            failure();
          }
        }
      };
      if (spUtil.isMobile()) {
        $scope.tinyMCEOptions.toolbar = _.pull(toolbar, 'image').join(' | ');
      }
      $scope.attachFiles = function(result) {
        var data = getTableAndSysId();
        if (data.table && data.sys_id && result.files) {
          thisEditor.setProgressState(true);
          snAttachmentHandler.create(data.table, data.sys_id).uploadAttachment(result.files[0], null, {}).then(function(response) {
            var args = tinymce.extend({}, {
              src: encodeURI("/" + response.sys_id + ".iix"),
              style: "max-width: 100%; max-height: 480px;"
            });
            update();
            thisEditor.setProgressState(false);
            thisEditor.execCommand('mceInsertContent', false, thisEditor.dom.createHTML('img', args), {
              skip_undo: 1
            });
          });
        }
      };
      if (g_form && field) {
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (fieldName != field.name)
            return;
          updateMode();
        });
        updateMode();
      } else if (typeof $attrs.snDisabled != "undefined") {
        $scope.$watch('snDisabled', function(newValue) {
          if (angular.isDefined(newValue) && typeof thisEditor.setMode == "function") {
            if (thisEditor.getContainer())
              thisEditor.setMode(newValue ? 'readonly' : 'design');
            else {
              thisEditor.on('init', function() {
                thisEditor.setMode(newValue ? 'readonly' : 'design');
              });
            }
          }
        });
      }
    },
    link: function(scope, element, attrs) {
      scope.attrs = attrs;
      scope.clickAttachment = function() {
        element.find("input").click();
      };
    }
  }
});