/*! RESOURCE: /scripts/app.$sp/directive.spModel.js */
angular.module('sn.$sp').directive('spModel', function($timeout, spUtil, glideFormFactory, glideUserSession, catalogItemFactory, glideFormEnvironmentFactory, catalogGlideFormFactory, spUIActionFactory, glideModalFactory, $uibModal,
  spModal, glideListFactory) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_model.xml',
    replace: true,
    scope: {
      formModel: "=",
      mandatory: '=',
      isInlineForm: '=?'
    },
    controller: function($element, $scope) {
      var g_form;
      var flatFields;
      var isCatalogItem;
      var debounceFieldChange;
      var formModel;
      $scope.$watch('formModel', function(newValue) {
        if (angular.isDefined(newValue))
          init();
      });
      $scope.shouldPullRight = function(layout, rightCol) {
        return layout == "2across" && rightCol;
      };;

      function onChange(fieldName, oldValue, newValue) {
        if (!(fieldName in formModel._fields))
          return;
        $timeout.cancel(debounceFieldChange[fieldName]);
        debounceFieldChange[fieldName] = $timeout(function() {
          var field = formModel._fields[fieldName];
          if (isCatalogItem) {
            if (field._pricing) {
              setPrices(field, newValue);
              setBoolean(field, newValue);
              calcPrice();
            }
          }
          populateMandatory();
          var p = {
            field: field,
            oldValue: oldValue,
            newValue: newValue
          };
          $scope.$emit("field.change", p);
          $scope.$emit("field.change." + field.name, p);
        });
      }

      function populateMandatory() {
        var mandatory = [];
        var field;
        for (var f in flatFields) {
          field = flatFields[f];
          if (typeof field.mandatory_filled == 'undefined')
            continue;
          if (field.mandatory_filled())
            continue;
          if (field.visible && field.isMandatory())
            mandatory.push(field);
        }
        $scope.mandatory = mandatory;
        $scope.$emit("variable.mandatory.change");
      }

      function uiMessageHandler(g_form, type, message) {
        switch (type) {
          case 'infoMessage':
            spUtil.addInfoMessage(message);
            break;
          case 'errorMessage':
            spUtil.addErrorMessage(message);
            break;
          case 'clearMessages':
            break;
          default:
            return false;
        }
      }

      function getFlatFieldsFromView(formModel) {
        var fields = [],
          field;
        var sections = formModel._sections;
        if (sections != null) {
          try {
            var section, col, container, contField;
            for (var s in sections) {
              section = sections[s];
              if (hasVariablePrefix(section.id))
                fields.push(formModel._fields[section.id]);
              for (var c in section.columns) {
                col = section.columns[c];
                for (var f in col.fields) {
                  field = col.fields[f];
                  if (formModel._fields[field.name])
                    fields.push(formModel._fields[field.name]);
                  for (var c in field.containers) {
                    container = field.containers[c];
                    for (var cont in container.fields) {
                      contField = container.fields[cont];
                      if (formModel._fields[contField.name])
                        fields.push(formModel._fields[contField.name]);
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('spModel.getFlatFieldsFromView() - Error getting fields from _sections -> columns -> fields.', e, formModel);
          }
        } else {
          for (var f in formModel._view) {
            field = formModel._view[f];
            if (formModel._fields[field.name])
              fields.push(formModel._fields[field.name]);
          }
        }
        return fields;
      }

      function hasCatalogVariable(flatFields) {
        for (var f in flatFields) {
          if (flatFields[f].hasOwnProperty('_cat_variable'))
            return true;
        }
        return false
      }

      function calcPrice() {
        var price = 0;
        var recurring_price = 0;
        angular.forEach(formModel._fields, function(field) {
          if (field.price)
            price += Number(field.price);
          if (field.recurring_price)
            recurring_price += Number(field.recurring_price);
        });
        var o = {
          price: price,
          recurring_price: recurring_price
        };
        $scope.$emit("variable.price.change", o);
      }

      function setBoolean(field, value) {
        if (field.type != 'boolean')
          return;
        if (value == true || value == 'true') {
          field.price = field._pricing.price_if_checked;
          field.recurring_price = field._pricing.rec_price_if_checked;
        } else
          field.price = field.recurring_price = 0;
      }

      function setPrices(field, value) {
        if (!field.choices)
          return;
        field.choices.forEach(function(c) {
          if (c.value != value)
            return;
          field.price = c.price;
          field.recurring_price = c.recurring_price;
        });
      }
      $scope.getGlideForm = function() {
        return g_form;
      };

      function hasVariablePrefix(v) {
        return v.indexOf("IO:") == 0;
      }
      $scope.getVarID = function(v) {
        if (hasVariablePrefix(v.name))
          return v.name.substring(3);
        return v.name;
      };

      function initGlideForm() {
        var uiActions = spUIActionFactory.create(formModel._ui_actions || [], {
          attachmentGUID: formModel._attachmentGUID,
          uiActionNotifier: function(actionName, uiActionPromise) {
            uiActionPromise.then(function(response) {
              $scope.$emit("spModel.uiActionComplete", response);
            });
          }
        });
        g_form = glideFormFactory.create($scope, formModel.table, formModel.sys_id, flatFields, uiActions, {
          uiMessageHandler: uiMessageHandler,
          relatedLists: formModel._related_lists,
          sections: formModel._sections
        });
        g_form.getControl = getControl;
        g_form.getField = function(fieldName) {
          for (var i = 0, iM = flatFields.length; i < iM; i++) {
            var field = flatFields[i];
            if (field.variable_name === fieldName || field.name === fieldName) {
              return field;
            }
          }
          if (g_form._options.getMappedField) {
            var mapped = g_form._options.getMappedField(fieldName);
            if (mapped) {
              return mapped;
            }
          }
        };
        g_form.showFieldMsg0 = g_form.showFieldMsg;
        g_form.showFieldMsg = function() {
          g_form.showFieldMsg0.apply(this, arguments);
          if (!$scope.$root.$$phase) {
            $scope.$apply();
          }
        };
        g_form.$private.events.on('change', onChange);
        g_form.$private.events.on('propertyChange', function(type, fieldName, propertyName) {
          if (propertyName == "mandatory")
            populateMandatory();
          if (isCatalogItem && propertyName == "visible")
            setSectionDisplay(fieldName);
        });
        $scope.$on("sp.spFormField.stagedValueChange", function() {
          populateMandatory();
        });
      }

      function setSectionDisplay(v) {
        for (var s in formModel._sections) {
          if (formModel._sections[s].id == v) {
            $scope.$evalAsync(function() {
              formModel._sections[s].visible = formModel._fields[v].visible;
            });
            return;
          }
        }
      }

      function massageView() {
        if (formModel._sections == null) {
          formModel._sections = [{
            _bootstrap_cells: 12,
            visible: true,
            columns: [{
              fields: formModel._view
            }]
          }];
        }
        var section, col, field;
        for (var s in formModel._sections) {
          section = formModel._sections[s];
          for (var c in section.columns) {
            col = section.columns[c];
            for (var f in col.fields) {
              field = col.fields[f];
              if (field.type == 'field' && !formModel._fields[field.name])
                col.fields.splice(f, 1);
            }
            if (col.fields.length == 0)
              section.columns.splice(c, 1);
          }
          if (section.columns.length == 0) {
            formModel._sections.splice(s, 1);
          }
        }
      }

      function init() {
        $scope.mandatory = [];
        debounceFieldChange = {};
        formModel = $scope.formModel;
        flatFields = getFlatFieldsFromView(formModel);
        isCatalogItem = hasCatalogVariable(flatFields);
        massageView();
        initGlideForm();
      }
      $scope.execItemScripts = function() {
        $scope.$emit("spModel.fields.rendered");
        $timeout(function() {
          glideUserSession.loadCurrentUser().then(onUserLoad);
        });

        function onUserLoad(user) {
          populateMandatory();
          var g_modal = glideModalFactory.create({
            alert: modalAlert,
            confirm: modalConfirm
          });
          var gfConfig = glideFormEnvironmentFactory.createWithConfiguration(g_form, user, formModel.g_scratchpad, formModel.client_script || [], formModel.policy || [], g_modal);
          if (isCatalogItem) {
            gfConfig.g_env.registerExtensionPoint('g_service_catalog', {
              'isOrderGuide': function() {
                return formModel.isOrderGuideItem;
              }
            });
            catalogGlideFormFactory.addItemEditor(g_form, formModel.sys_id, null, formModel.sys_id, flatFields);
            calcPrice();
          }
          gfConfig.g_env.registerExtensionPoint('spModal', spModal);
          gfConfig.g_env.registerExtensionPoint('g_list', glideListFactory.init(g_form, flatFields));
          gfConfig.initialize();
          $scope.$emit("spModel.gForm.initialized", g_form);
        }
      };
      $scope.$on('$destroy', function() {
        if (g_form)
          $scope.$emit("spModel.gForm.destroyed", formModel.sys_id);
      });

      function modalAlert(title, message, done) {
        spModal.alert(message).then(done);
      }

      function modalConfirm(title, message, done) {
        spModal.confirm(message).then(
          function() {
            done(true)
          },
          function() {
            done(false)
          }
        );
      }
    }
  }

  function getControl(name) {
    var names = this.getFieldNames();
    if (names.indexOf(name) == -1)
      return null;
    return new GlideFormControl(this, name);

    function GlideFormControl(g_form, name) {
      this.g_form = g_form;
      this.name = name;
      this.options = [];
      this.focus = function focus() {
        console.log(">> focus not implemented for " + this.name)
      }
      Object.defineProperty(this, 'value', {
        get: function() {
          return this.g_form.getValue(this.name);
        },
        set: function(val) {
          this.g_form.setValue(this.name, val);
        }
      })
    }
  }
});;