/*! RESOURCE: /scripts/app.$sp/directive.spScriptEditor.js */
angular.module('sn.$sp').directive('spScriptEditor', function($rootScope, $http, spCodeEditorAutocomplete, defaultJSAutocomplete, $timeout) {
  return {
    template: '<textarea class="CodeMirror" name="{{::field.name}}" ng-model="v" style="width: 100%;" data-length="{{::dataLength}}" data-charlimit="false">' +
      '</textarea>',
    restrict: 'E',
    require: '^ngModel',
    replace: true,
    scope: {
      field: '=',
      dataLength: '@',
      options: '@?',
      snDisabled: '=?',
      snChange: '&',
      snBlur: '&',
      getGlideForm: '&glideForm'
    },
    link: function(scope, element, attrs, ctrl) {
      $timeout(function() {
        var g_form;
        var field = scope.field;
        if (typeof attrs.glideForm != "undefined") {
          g_form = scope.getGlideForm();
        }
        element[0].value = field.value;
        element[0].id = field.name + "_javascript_editor";
        var cmi = initializeCodeMirror(element[0]);
        var server;
        spCodeEditorAutocomplete.getConfig('sp_widget', field.name)
          .then(setupTernServer);
        ctrl.$viewChangeListeners.push(function() {
          scope.$eval(attrs.ngChange);
        });
        cmi.on('change', function(cm) {
          if (typeof field.stagedValue != "undefined") {
            field.stagedValue = cm.getValue();
            ctrl.$setViewValue(field.stagedValue);
          } else {
            field.value = cm.getValue();
            ctrl.$setViewValue(field.value);
          }
          if (angular.isDefined(scope.snChange))
            scope.snChange();
        });
        cmi.on('blur', function() {
          if (angular.isDefined(scope.snBlur))
            scope.snBlur();
        });
        if (g_form) {
          g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
            if (fieldName != field.name)
              return;
            if (propertyName == "readonly") {
              var isReadOnly = g_form.isReadOnly(fieldName);
              cmi.setOption('readOnly', isReadOnly);
              var cmEl = cmi.getWrapperElement();
              jQuery(cmEl).css("background-color", isReadOnly ? "#eee" : "");
            }
            g_form.$private.events.on('change', function(fieldName, oldValue, newValue) {
              if (fieldName != field.name)
                return;
              if (newValue != oldValue && !cmi.hasFocus())
                cmi.getDoc().setValue(newValue);
            });
          });
        } else {
          scope.$watch(function() {
            return field.value;
          }, function(newValue, oldValue) {
            if (newValue != oldValue && !cmi.hasFocus())
              cmi.getDoc().setValue(field.value);
          });
          scope.$watch('snDisabled', function(newValue) {
            if (angular.isDefined(newValue)) {
              cmi.setOption('readOnly', newValue);
            }
          });
        }
        cmi.on("keyup", function(cm, event) {
          var keyCode = ('which' in event) ? event.which : event.keyCode;
          var ternTooltip = document.getElementsByClassName('CodeMirror-Tern-tooltip')[0];
          if (keyCode == 190)
            if (event.shiftKey)
              return;
            else
              server.complete(cmi, server);
          if (keyCode == 57 && window.event.shiftKey && ternTooltip)
            angular.element(ternTooltip).show();
          if (keyCode == 27 && ternTooltip) {
            angular.element(ternTooltip).hide();
          }
        });
        cmi.on("startCompletion", function(cm) {
          var completion = cm.state.completionActive;
          completion.options.completeSingle = false;
          var pick = completion.pick;
          completion.pick = function(data, i) {
            var completion = data.list[i];
            CodeMirror.signal(cm, "codemirror_hint_pick", {
              data: completion,
              editor: cm
            });
            pick.apply(this, arguments);
          }
        });
        cmi.on("codemirror_hint_pick", function(i) {
          var data = i.data.data;
          var editor = i.editor;
          var cur = editor.getCursor();
          var token = data.type;
          if (token && token.indexOf('fn(') != -1) {
            if (editor.getTokenAt({
                ch: cur.ch + 1,
                line: cur.line
              }).string != '(') {
              editor.replaceRange('()', {
                line: cur.line,
                ch: cur.ch
              }, {
                line: cur.line,
                ch: cur.ch
              });
              if (token && token.substr(0, 4) !== 'fn()' && angular.element('div.CodeMirror-Tern-tooltip')[0]) {
                editor.execCommand('goCharLeft');
                setTimeout(function() {
                  var ternTooltip = document.getElementsByClassName('CodeMirror-Tern-tooltip')[0];
                  if (ternTooltip) {
                    angular.element(ternTooltip).show();
                  }
                }, 100)
              }
            } else if (token && token.substr(0, 4) !== 'fn()')
              editor.execCommand('goCharRight');
          }
        });

        function initializeCodeMirror(elem) {
          var options = {
            mode: "javascript",
            lineNumbers: true,
            lineWrapping: false,
            readOnly: scope.snDisabled === true,
            viewportMargin: Infinity,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers", "CodeMirror-foldgutter"],
            lint: {
              asi: true
            },
            indentWithTabs: true,
            indentUnit: 2,
            tabSize: 2,
            matchBrackets: true,
            autoCloseBrackets: true,
            theme: "snc"
          };
          if (scope.options) {
            Object.keys(scope.options).forEach(function(key) {
              options[key] = scope.options[key];
            });
          }
          var cm = CodeMirror.fromTextArea(elem, options);
          return cm;
        }

        function setupTernServer(data) {
          var plugins = {};
          if (field.name === "client_script")
            plugins = {
              "angular": "./"
            };
          server = new CodeMirror.TernServer({
            defs: [data, defaultJSAutocomplete],
            plugins: plugins
          });
          cmi.setOption("extraKeys", {
            "Ctrl-Space": function(cm) {
              server.complete(cm);
            },
            "Ctrl-I": function(cm) {
              server.showType(cm);
            },
            "Ctrl-O": function(cm) {
              server.showDocs(cm);
            },
            "Alt-.": function(cm) {
              server.jumpToDef(cm);
            },
            "Alt-,": function(cm) {
              server.jumpBack(cm);
            },
            "Ctrl-Q": function(cm) {
              server.rename(cm);
            },
            "Ctrl-.": function(cm) {
              server.selectName(cm);
            }
          });
          var extraKeys = {
            "Ctrl-M": function(cm) {
              cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function(cm) {
              if (cm.getOption("fullScreen"))
                cm.setOption("fullScreen", false);
            }
          }
          cmi.addKeyMap(extraKeys);
          cmi.on("cursorActivity", function(cm) {
            server.updateArgHints(cm);
          });
        }
      });
    }
  }
});