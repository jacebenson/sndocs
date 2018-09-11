/*! RESOURCE: /scripts/app.guided_tours/GuidedTourElementTranslator.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedTourElementTranslator == 'undefined') {
  (function() {
      var GuidedTourElementTranslator = {
          translateTargets: function(data) {
            var list = this.getTargetElement(data.steps, false);
            return this.translate(list, data.checkUI16, data.checkTabbedForm);
          },
          translateActionTargets: function(data) {
            var list = this.getTargetElement(data.steps, true);
            return this.translate(list, data.checkUI16, data.checkTabbedForm);
          },
          getTargetElement: function(steps, isAction) {
            var element = [];
            var targetElements = [];
            for (var i = 0; i < steps.length; i++) {
              if (isAction && typeof steps[i].actionTargetRecord != "undefined") {
                element = [steps[i].actionTargetRecord, steps[i].listV3Compatibility, steps[i].relatedListV3Compatibility];
                targetElements.push(element);
              } else if (!isAction && typeof steps[i].targetRecord != "undefined") {
                element = [steps[i].targetRecord, steps[i].listV3Compatibility, steps[i].relatedListV3Compatibility];
                targetElements.push(element);
              } else {
                targetElements.push("");
              }
            }
            return targetElements;
          },
          translate: function(list, checkUI16, checkTabbedForm) {
            var translatedElements = [];
            for (var i = 0; i < list.length; i++) {
              var listElement = list[i][0];
              var checkListV3 = list[i][1];
              var checkRelatedListV3 = list[i][2];
              translatedElements[i] = "";
              if (list[i] == "") {
                continue;
              }
              translatedElements[i] = this.translateSingleStep(listElement, checkListV3, checkRelatedListV3, checkUI16, checkTabbedForm);
            }
            return translatedElements;
          },
          translateSingleStep: function(tourElement, checkListV3, checkRelatedListV3, checkUI16, checkTabbedForm) {
            var translatedElement = null;
            if (tourElement != undefined) {
              switch (tourElement.type) {
                case 'list':
                  translatedElement = this.translateListType(tourElement, checkListV3);
                  break;
                case 'form':
                  translatedElement = this.translateFormType(tourElement, checkListV3, checkRelatedListV3, checkTabbedForm);
                  break;
                case 'frameset':
                  translatedElement = this.translateFramesetType(tourElement, checkUI16);
                  break;
                case 'manual_css':
                  translatedElement = tourElement.manualCss;
                  break;
                default:
                  break;
              }
            }
            return translatedElement;
          },
          translateListType: function(element, checkListV3) {
            var elementSelector = "";
            if (element.listElement == 'field_header') {
              elementSelector = this.translateFieldHeader(element, element.table, element.field, checkListV3);
            } else if (element.listElement == 'filters') {
              elementSelector = this.translateFilters(element, checkListV3, false);
            } else if (element.listElement == 'related_links') {
              elementSelector = "a[id='" + element.relatedLinks + "']";
            } else if (element.listElement == 'list_header') {
              elementSelector = this.translateListHeader(element, checkListV3);
            } else if (element.listElement == 'cell_types') {
              elementSelector = this.translateCellTypes(element, checkListV3);
            } else if (element.listElement == 'cell_edit') {
              elementSelector = this.translateCellEdit(element, checkListV3);
            } else {
              if (checkListV3) {
                if (element.listElement == 'ui_action') {
                  elementSelector = "button[data-action-name='" + element.uiAction + "']";
                } else if (element.listElement == 'list_record') {
                  elementSelector = "tr[record-id='" + element.recordId + "']";
                } else if (element.listElement == 'grid') {
                  elementSelector = ".list-container .data_row:nth-of-type(" + element.row + ") td:nth-of-type(" + element.col + ")";
                }
              } else {
                if (element.listElement == 'ui_action') {
                  elementSelector = "button[id='" + element.uiAction + "']";
                } else if (element.listElement == 'list_record') {
                  elementSelector = "tr[sys_id='" + element.recordId + "']";
                } else if (element.listElement == 'grid') {
                  elementSelector = ".list2_body tr[data-type='list2_row']:nth-of-type(" + element.row + ") td:nth-of-type(" + element.col + ")";
                }
              }
            }
            return elementSelector;
          },
          translateFormType: function(element, checkListV3, checkRelatedListV3, checkTabbedForm) {
              var elementSelector = "";
              if (element.formElement == 'field') {
                if (typeof element.fieldAction == "undefined" || element.fieldAction == '') {
                  if (element.fieldType == "string" || element.fieldType == "integer" || element.fieldType == "decimal" || element.fieldType == "translated_field" ||
                    element.fieldType == "password" || element.fieldType == "password2" || element.fieldType.indexOf('text') > -1 || element.fieldType.indexOf('glide_date') > -1) {
                    if (element.fieldLength < 256) {
                      elementSelector = "input[id$='" + element.table + "." + element.field + "']:visible";
                    } else {
                      elementSelector = "textarea[id$='" + element.table + "." + element.field + "']:visible";
                    }
                  } else if (element.fieldType == "reference") {
                    elementSelector = "input[id$='" + element.table + "." + element.field + "']:visible";
                  } else if (element.fieldType == "select" || element.fieldType == "field_name") {
                    var elementId = element.table + "." + element.field;
                    elementSelector = "select[id$='" + elementId + "']:visible";
                    elementSelector += ",input[id$='" + elementId + "']:visible";
                  } else if (element.fieldType == "table_name") {
                    elementSelector = "div[id='s2id_" + element.table + "." + element.field + "']";
                  } else if (element.fieldType == "boolean") {
                    elementSelector = "label[id='label.ni." + element.table + "." + element.field + "']";
                  } else if (element.fieldType == "journal_input") {
                    elementSelector = "textarea[id*='activity-stream'],textarea[id$='" + element.table + "." + element.field + "']:visible";
                  } else if (element.fieldType.indexOf('html') > -1) {
                    elementSelector = ".mce-tinymce";
                  } else if (element.fieldType == "template_value") {
                    elementSelector = " label[for='" + element.table + ".template']";
                  } else if (element.fieldType == "user_image") {
                    elementSelector = "a[id='add." + element.table + "." + element.field + "']";
                  } else if (element.fieldType == "currency" || element.fieldType == "price") {
                    elementSelector = "input[id*='" + element.table + "." + element.field + "']:visible";
                  } else {
                    elementSelector = "label[for$='" + element.table + "." + element.field + "']:visible .label-text";
                  }
                } else if (element.fieldAction == 'lookup') {
                  elementSelector = "a[id='lookup." + element.table + "." + element.field + "']";
                } else if (element.fieldAction == 'view') {
                  elementSelector = "a[id='view." + element.table + "." + element.field + "']";
                } else if (element.fieldAction == 'suggestion') {
                  elementSelector = "a[id='lookup." + element.table + "." + element.field + "']";
                } else if (element.fieldAction == 'edit_list') {
                  elementSelector = "button[id='" + element.table + "." + element.field + "_unlock']";
                } else if (element.fieldAction == 'add_me') {
                  elementSelector = "button[id='add_me_locked." + element.table + "." + element.field + "'],button[id*='" + element.table + "." + element.field + "'] span.icon-user-add";
                } else if (element.fieldAction == 'calendar') {
                  elementSelector = "a[id='" + element.table + "." + element.field + ".ui_policy_sensitive']:visible";
                } else if (element.fieldAction == 'currency_type') {
                  elementSelector = "select[id='" + element.table + "." + element.field + ".currency']";
                } else if (element.fieldAction == 'edit_link') {
                  elementSelector = "a[id='" + element.table + "." + element.field + ".editLink']";
                } else if (element.fieldAction == 'show_related_record_icon_tree_right') {
                  elementSelector = "a.icon-tree-right[id*='" + element.table + "." + element.field + "'] ";
                } else if (element.fieldAction == 'show_map_icon_tree') {
                  elementSelector = "span.icon-tree[id*='" + element.table + "." + element.field + "'] ";
                } else if (element.fieldAction == 'show_all_journal') {
                  elementSelector = " button.icon-stream-all-input";
                } else if (element.fieldAction == 'show_one_journal') {
                  elementSelector = " button.icon-stream-one-input";
                } else if (element.fieldAction == 'post_button_activity') {
                  elementSelector = "button.activity-submit";
                } else if (element.fieldAction == 'filter_activity') {
                  elementSelector = "button.icon-filter[data-target*='_field_filter_popover']";
                } else if (element.fieldAction == 'email_me') {
                  elementSelector = "button[onclick*='" + element.table + "." + element.field + "'] span.icon-mail";
                } else if (element.fieldAction == 'add_multiple_user') {
                  elementSelector = "button[onclick*='" + element.table + "." + element.field + "'] span.icon-user-group";
                } else if (element.fieldAction == 'search_knowledge_icon') {
                  elementSelector = "a.icon-book[data-for*='" + element.table + "." + element.field + "'] ";
                } else if (element.fieldAction == 'icon-database') {
                  elementSelector = "span.icon-database[id*='" + element.field + "'] ";
                } else if (element.fieldAction == 'show_related_task_warning') {
                  elementSelector = "a.icon-warning-circle[id*='" + element.field + "'] ";
                } else if (element.fieldAction == 'calendar_icon') {
                  elementSelector = "a[data-ref*='" + element.table + "." + element.field + "'] span.icon-calendar:visible";
                }
              } else if (element.formElement == 'field_label') {
                if (element.fieldType == "boolean") {
                  elementSelector = "label[for$='ni." + element.table + "." + element.field + "']:visible .label-text";
                } else {
                  elementSelector = "label[for$='" + element.table + "." + element.field + "']:visible .label-text";
                }
              } else if (element.formElement == 'ui_action') {
                if (checkListV3) {
                  elementSelector = "button[data-action-name='" + element.uiAction + "']";
                } else {
                  elementSelector = "button[id='" + element.uiAction + "']";
                }
              } else if (element.formElement == 'form_section') {
                if (checkTabbedForm && element.multipleTabSections) {
                  elementSelector = "div[id='tabs2_section'] .tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
                } else {
                  elementSelector = ".tabs2_section_" + element.formSection;
                }
              } else if (element.formElement == 'form_section_tab_only') {
                if (checkTabbedForm && element.multipleTabSections) {
                  elementSelector = "div[id='tabs2_section'] .tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
                } else {
                  elementSelector = "SKIP";
                }
              } else if (element.formElement == 'related_links') {
                elementSel