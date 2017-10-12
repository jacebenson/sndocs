/*! RESOURCE: /scripts/app.guided_tours/GuidedTourElementTranslator.js */
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
        if (listElement != undefined) {
          switch (listElement.type) {
            case 'list':
              translatedElements[i] = this.translateListType(listElement, checkListV3);
              break;
            case 'form':
              translatedElements[i] = this.translateFormType(listElement, checkListV3, checkRelatedListV3, checkTabbedForm);
              break;
            case 'frameset':
              translatedElements[i] = this.translateFramesetType(listElement, checkUI16);
              break;
            case 'manual_css':
              translatedElements[i] = listElement.manualCss;
              break;
            default:
              break;
          }
        }
      }
      return translatedElements;
    },
    translateListType: function(element, checkListV3) {
      var elementSelector = "";
      if (checkListV3) {
        if (element.listElement == 'list_search') {
          elementSelector = ".search-decoration-full input[placeholder='Search']";
        } else if (element.listElement == 'ui_action') {
          elementSelector = "button[data-action-name='" + element.uiAction + "']";
        } else if (element.listElement == 'list_record') {
          elementSelector = "tr[record-id='" + element.recordId + "']";
        } else if (element.listElement == 'grid') {
          elementSelector = ".list-container .data_row:nth-of-type(" + element.row + ") td:nth-of-type(" + element.col + ")";
        } else if (element.listElement == 'field_header') {
          elementSelector = "th[data-column-name='" + element.field + "']:visible";
        } else if (element.listElement == 'filter_button') {
          elementSelector = ".list-filter-button";
        } else if (element.listElement == 'activity_stream') {
          elementSelector = ".icon-activity-stream";
        }
      } else {
        if (element.listElement == 'list_search') {
          elementSelector = ".list_nav input[placeholder='Search']";
        } else if (element.listElement == 'ui_action') {
          elementSelector = "button[id='" + element.uiAction + "']";
        } else if (element.listElement == 'list_record') {
          elementSelector = "tr[sys_id='" + element.recordId + "']";
        } else if (element.listElement == 'grid') {
          elementSelector = ".list2_body tr[data-type='list2_row']:nth-of-type(" + element.row + ") td:nth-of-type(" + element.col + ")";
        } else if (element.listElement == 'field_header') {
          elementSelector = "th[name='" + element.field + "']:visible";
        } else if (element.listElement == 'filter_button') {
          elementSelector = ".list_filter_toggle";
        } else if (element.listElement == 'activity_stream') {
          elementSelector = ".icon-activity-stream";
        }
      }
      return elementSelector;
    },
    translateFormType: function(element, checkListV3, checkRelatedListV3, checkTabbedForm) {
      var elementSelector = "";
      if (checkListV3) {
        if (element.formElement == 'field') {
          if (element.fieldType == "string" || element.fieldType == "integer" || element.fieldType == "translated_field" ||
            element.fieldType == "password" || element.fieldType.indexOf('text') > -1) {
            elementSelector = "input[id='" + element.table + "." + element.field + "']";
          } else if (element.fieldType == "reference") {
            elementSelector = "input[name='sys_display." + element.table + "." + element.field + "']";
          } else if (element.fieldType == "select" || element.fieldType == "field_name") {
            elementSelector = "select[id='" + element.table + "." + element.field + "']";
          } else if (element.fieldType == "table_name") {
            elementSelector = "div[id='s2id_" + element.table + "." + element.field + "']";
          } else if (element.fieldType == "boolean") {
            elementSelector = "label[id='label.ni." + element.table + "." + element.field + "']";
          } else if (element.fieldType == "journal_input") {
            elementSelector = "textarea[id='activity-stream-textarea']";
          } else if (element.fieldType.indexOf('html') > -1) {
            elementSelector = ".mce-tinymce";
          } else if (element.fieldType == "template_value") {
            elementSelector = " label[for='" + element.table + ".template']";
          } else if (element.fieldType == "user_image") {
            elementSelector = "a[id='add." + element.table + "." + element.field + "']";
          } else {
            elementSelector = "label[for='" + element.table + "." + element.field + "'] .label-text";
          }
        } else if (element.formElement == 'field_label') {
          if (element.fieldType == "boolean") {
            elementSelector = "label[for='ni." + element.table + "." + element.field + "'] .label-text";
          } else {
            elementSelector = "label[for='" + element.table + "." + element.field + "'] .label-text";
          }
        } else if (element.formElement == 'ui_action') {
          elementSelector = "button[data-action-name='" + element.uiAction + "']";
        } else if (element.formElement == 'form_section') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_section'] .tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = ".tabs2_section_" + element.formSection;
          }
        } else if (element.formElement == 'form_section_tab_only') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_section'] .tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = "SKIP";
          }
        } else if (element.formElement == 'related_list') {
          elementSelector = this.translateRelatedLists(element, checkListV3, checkRelatedListV3, checkTabbedForm);
        } else if (element.formElement == 'form_buttons') {
          if (element.formButtons == 'additional_actions') {
            elementSelector = "button[data-original-title='Additional actions']";
          } else if (element.formButtons == 'add_attachment') {
            elementSelector = "button[id='header_add_attachment']";
          } else if (element.formButtons == 'personalize_form') {
            elementSelector = "button[id='togglePersonalizeForm']";
          }
        }
      } else {
        if (element.formElement == 'field') {
          if (element.fieldType == "string" || element.fieldType == "integer" || element.fieldType == "translated_field" ||
            element.fieldType == "password" || element.fieldType.indexOf('text') > -1) {
            elementSelector = "input[id='" + element.table + "." + element.field + "']";
          } else if (element.fieldType == "reference") {
            elementSelector = "input[name='sys_display." + element.table + "." + element.field + "']";
          } else if (element.fieldType == "select") {
            elementSelector = "select[id='" + element.table + "." + element.field + "']";
          } else if (element.fieldType == "table_name") {
            elementSelector = "div[id='s2id_" + element.table + "." + element.field + "']";
          } else if (element.fieldType == "boolean") {
            elementSelector = "label[id='label.ni." + element.table + "." + element.field + "']";
          } else if (element.fieldType == "journal_input") {
            elementSelector = "textarea[id='activity-stream-textarea']";
          } else if (element.fieldType.indexOf('html') > -1) {
            elementSelector = ".mce-tinymce";
          } else if (element.fieldType == "template_value") {
            elementSelector = " label[for='" + element.table + ".template']";
          } else if (element.fieldType == "user_image") {
            elementSelector = "a[id='add." + element.table + "." + element.field + "']";
          } else {
            elementSelector = "label[for='" + element.table + "." + element.field + "'] .label-text";
          }
        } else if (element.formElement == 'field_label') {
          if (element.fieldType == "boolean") {
            elementSelector = "label[for='ni." + element.table + "." + element.field + "'] .label-text";
          } else {
            elementSelector = "label[for='" + element.table + "." + element.field + "'] .label-text";
          }
        } else if (element.formElement == 'ui_action') {
          elementSelector = "button[id='" + element.uiAction + "']";
        } else if (element.formElement == 'form_section') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_section'] .tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = ".tabs2_section_" + element.formSection;
          }
        } else if (element.formElement == 'form_section_tab_only') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_section'] .tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = "SKIP";
          }
        } else if (element.formElement == 'related_list') {
          elementSelector = this.translateRelatedLists(element, checkListV3, checkRelatedListV3, checkTabbedForm);
        } else if (element.formElement == 'form_buttons') {
          if (element.formButtons == 'additional_actions') {
            elementSelector = "button[data-original-title='Additional actions']";
          } else if (element.formButtons == 'add_attachment') {
            elementSelector = "button[id='header_add_attachment']";
          } else if (element.formButtons == 'personalize_form') {
            elementSelector = "button[id='togglePersonalizeForm']";
          }
        }
      }
      return elementSelector;
    },
    translateRelatedLists: function(element, checkListV3, checkRelatedListV3, checkTabbedForm) {
      var elementSelector = "";
      if (checkListV3 && checkRelatedListV3) {
        if (element.relatedListElement == 'ui_action') {
          elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] button[data-action-name='" + element.uiAction + "']";
        } else if (element.relatedListElement == 'tab_section') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_list'] .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
          } else {
            elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "']";
          }
        } else if (element.relatedListElement == 'tab_section_tab_only') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_list'] .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
          } else {
            elementSelector = "SKIP";
          }
        } else if (element.relatedListElement == 'list_search') {
          elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] input[placeholder='Search']";
        }
      } else {
        if (element.relatedListElement == 'ui_action') {
          elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] button[id='" + element.uiAction + "']";
        } else if (element.relatedListElement == 'tab_section') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_list'] .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
          } else {
            elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "']";
          }
        } else if (element.relatedListElement == 'tab_section_tab_only') {
          if (checkTabbedForm) {
            elementSelector = "div[id='tabs2_list'] .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
          } else {
            elementSelector = "SKIP";
          }
        } else if (element.relatedListElement == 'list_search') {
          elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] input[placeholder='Search']";
        }
      }
      return elementSelector;
    },
    translateFramesetType: function(element) {
      var elementSelector = "";
      if (this.checkUI16) {
        if (element.frameset == 'nav_filter') {
          elementSelector = "input[id='filter']";
        } else if (element.frameset == 'search') {
          elementSelector = "form[action='textsearch.do']";
        } else if (element.frameset == 'connect') {
          elementSelector = ".icon-collaboration";
        } else if (element.frameset == 'nav_settings') {
          elementSelector = "button[id='nav-settings-button']";
        }
      } else {
        if (element.frameset == 'nav_filter') {
          elementSelector = "input[id='filter']";
        } else if (element.frameset == 'search') {
          elementSelector = "form[id='sysparm_search']";
        } else if (element.frameset == 'connect') {
          elementSelector = "button[id='connect-toggle-button']";
        } else if (element.frameset == 'nav_settings') {
          elementSelector = "button[id='navpage_header_control_button']";
        }
      }
      return elementSelector;
    }
  };
  window.NOW.guidedTourElementTranslator = GuidedTourElementTranslator;
})();;