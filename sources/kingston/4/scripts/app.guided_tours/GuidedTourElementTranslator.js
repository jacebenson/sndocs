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
          elementSelector = "a[id='" + element.relatedLinks + "']";
        } else if (element.formElement == 'related_list') {
          elementSelector = this.translateRelatedLists(element, checkListV3, checkRelatedListV3, checkTabbedForm);
        } else if (element.formElement == 'form_buttons') {
          if (element.formButtons == 'additional_actions') {
            elementSelector = "button.additional-actions-context-menu-button";
          } else if (element.formButtons == 'back_btn') {
            elementSelector = "button[data-original-title='Back']";
          } else if (element.formButtons == 'add_attachment') {
            elementSelector = "button[id='header_add_attachment']";
          } else if (element.formButtons == 'personalize_form') {
            elementSelector = "button[id='togglePersonalizeForm']";
          } else if (element.formButtons == 'activity_stream') {
            elementSelector = "button[id='form_stream']";
          } else if (element.formButtons == 'more_option') {
            elementSelector = "button[id='toggleMoreOptions']";
          }
        } else if (element.formElement == 'cxs_results') {
          if (element.searchResults == 'cxs_btn') {
            elementSelector = "button[id='cxs_maximize_results']";
          } else if (element.searchResults == 'cxs_link') {
            elementSelector = "td[class~='cxs_table_link']";
          } else if (element.searchResults == 'cxs_desc') {
            elementSelector = "td[class~='cxs_table_description']";
          } else if (element.searchResults == 'cxs_preview') {
            elementSelector = "button[class~='cxs_result']";
          } else if (element.searchResults == 'cxs_attach') {
            elementSelector = "button[class~='cxs_attach']";
          } else if (element.searchResults == 'cxs_order') {
            elementSelector = "button[class~='request_catalog_button_with_icon']";
          }
        }
        return elementSelector;
      },
      translateListHeader: function(element, checkListV3) {
        var elementSelector = "";
        if (checkListV3) {
          if (element.listHeader == 'list_search_input') {
            elementSelector = ".search-decoration-full select";
          } else if (element.listHeader == 'list_search_value') {
            elementSelector = ".search-decoration-full input[placeholder='Search']";
          } else if (element.listHeader == 'activity_stream') {
            elementSelector = ".icon-activity-stream";
          } else if (element.listHeader == 'nav_home_page') {
            elementSelector = "li[sn-key-code*='firstPage']";
          } else if (element.listHeader == 'nav_previous_page') {
            elementSelector = "li[sn-key-code*='previous']";
          } else if (element.listHeader == 'nav_next_page') {
            elementSelector = "li[sn-key-code*='next']";
          } else if (element.listHeader == 'nav_end_page') {
            elementSelector = "li[sn-key-code*='lastPage']";
          } else if (element.listHeader == 'v3_split_mode_btn') {
            elementSelector = ".mode-select button:nth-of-type(2)";
          } else if (element.listHeader == 'v3_grid_mode_btn') {
            elementSelector = ".mode-select button:nth-of-type(1)";
          }
        } else {
          if (element.listHeader == 'list_search_input') {
            elementSelector = ".input-group-select select";
          } else if (element.listHeader == 'list_search_value') {
            elementSelector = ".list_nav input[placeholder='Search']";
          } else if (element.listHeader == 'activity_stream') {
            elementSelector = ".icon-activity-stream";
          } else if (element.listHeader == 'nav_home_page') {
            elementSelector = "button[name='vcr_first']";
          } else if (element.listHeader == 'nav_previous_page') {
            elementSelector = "button[name='vcr_back']";
          } else if (element.listHeader == 'nav_next_page') {
            elementSelector = "button[name='vcr_next']";
          } else if (element.listHeader == 'nav_end_page') {
            elementSelector = "button[name='vcr_last']";
          } else if (element.listHeader == 'toggle_related_list') {
            elementSelector = "a[data-type='list2_toggle']:visible";
          }
        }
        return elementSelector;
      },
      translateFieldHeader: function(element, tableName, fieldName, checkListV3) {
        var elementSelector = "";
        if (checkListV3) {
          if (element.fieldHeader == '') {
            elementSelector = "th[data-column-name='" + fieldName + "']:visible";
          } else if (element.fieldHeader == 'select_all') {
            elementSelector = "label[for='checkbox_all-" + tableName + "']";
          } else if (element.fieldHeader == 'search_icon') {
            elementSelector = "button[class~='list-header-search']";
          } else if (element.fieldHeader == 'search_value') {
            elementSelector = "input[search-column='" + fieldName + "']";
          } else if (element.fieldHeader == 'select_item') {
            elementSelector = "td .input-group-checkbox label[for*='checkbox_']";
          } else if (element.fieldHeader == 'info_icon') {
            elementSelector = "sn-record-preview button[class~='icon-info']";
          } else if (element.fieldHeader == 'select_action') {
            elementSelector = "sn-list-choice-ui-actions button";
          }
        } else {
          if (element.fieldHeader == '') {
            elementSelector = "th[name='" + fieldName + "']:visible";
          } else if (element.fieldHeader == 'personalize_list') {
            elementSelector = "table[id='" + tableName + "_table'] i[class~='icon-cog']";
          } else if (element.fieldHeader == 'select_all') {
            elementSelector = "label[for='allcheck_" + tableName + "']";
          } else if (element.fieldHeader == 'search_icon') {
            elementSelector = "table[id='" + tableName + "_table'] button[class~='list_header_search_toggle']";
          } else if (element.fieldHeader == 'search_value') {
            elementSelector = "table[id='" + tableName + "_table'] td[name='" + fieldName + "'] input[type='search']";
          } else if (element.fieldHeader == 'select_item') {
            elementSelector = "label[for*='check_" + tableName + "']";
          } else if (element.fieldHeader == 'info_icon') {
            elementSelector = "table[id='" + tableName + "_table'] .icon-info[data-list_id='" + tableName + "']";
          } else if (element.fieldHeader == 'select_action') {
            elementSelector = "span[id='" + tableName + "_choice_actions'] select";
          }
        }
        return elementSelector;
      },
      translateCellTypes: function(element, checkListV3) {
        var elementSelector = "";
        if (checkListV3) {
          if (element.cellTypes == 'workflow') {
            elementSelector = "workflow-element";
          } else if (element.cellTypes == 'workflow_expand') {
            elementSelector = "workflow-element i";
          } else if (element.cellTypes == 'v3_headline') {
            elementSelector = "div[class~='sn-card-component_headline']";
          } else if (element.cellTypes == 'v3_desc') {
            elementSelector = "span[class~='sn-card-component-detail']";
          } else if (element.cellTypes == 'v3_avatar') {
            elementSelector = "[class*='avatar'] [style*='background-image']";
          }
        } else {
          if (element.cellTypes == 'workflow') {
            elementSelector = "table[id*='workflow']";
          } else if (element.cellTypes == 'workflow_expand') {
            elementSelector = "span[id*='workflowfilter']";
          }
        }
        return elementSelector;
      },
      translateCellEdit: function(element, checkListV3) {
        var elementSelector = "";
        if (checkListV3) {
          if (element.cellEdit == 'edit_input') {
            elementSelector = "[ng-model='field.value']";
          } else if (element.cellEdit == 'edit_reference') {
            elementSelector = "input[ng-model='field.displayValue'][datasets=referenceData]";
          } else if (element.cellEdit == 'edit_lookup') {
            elementSelector = "button[id*='lookup']";
          } else if (element.cellEdit == 'edit_save') {
            elementSelector = "form[name='listEditing'] button[type='submit']";
          } else if (element.cellEdit == 'edit_header') {
            elementSelector = "form[name='listEditing'] h4";
          }
        } else {
          if (element.cellEdit == 'edit_input') {
            elementSelector = "#cell_edit_value";
          } else if (element.cellEdit == 'edit_reference') {
            elementSelector = "input[id*='sys_display.LIST_EDIT']";
          } else if (element.cellEdit == 'edit_lookup') {
            elementSelector = "#list-edit-span";
          } else if (element.cellEdit == 'edit_save') {
            elementSelector = "a[id='cell_edit_ok']";
          } else if (element.cellEdit == 'edit_cancel') {
            elementSelector = "a[id='cell_edit_cancel']";
          }
        }
        return elementSelector;
      },
      translateRelatedLists: function(element, checkListV3, checkRelatedListV3, checkTabbedForm) {
        var elementSelector = "";
        var relatedListSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] ";
        if (element.relatedListElement == 'tab_section') {
          if (checkTabbedForm && element.multipleTabSections) {
            elementSelector = "div[id='tabs2_list'] .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
          } else {
            elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "']";
          }
        } else if (element.relatedListElement == 'tab_section_tab_only') {
          if (checkTabbedForm && element.multipleTabSections) {
            elementSelector = "div[id='tabs2_list'] .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
          } else {
            elementSelector = "SKIP";
          }
        } else if (element.relatedListElement == 'filters') {
          elementSelector = relatedListSelector + this.translateFilters(element, checkListV3, checkRelatedListV3);
        } else if (element.relatedListElement == 'field_header') {
          elementSelector = relatedListSelector + this.translateFieldHeader(element, element.table + "." + element.relatedLists, element.relatedField, (checkListV3 && checkRelatedListV3));
        } else if (element.relatedListElement == 'list_header') {
          elementSelector = relatedListSelector + this.translateListHeader(element, (checkListV3 && checkRelatedListV3));
        } else if (element.relatedListElement == 'cell_types') {
          elementSelector = relatedListSelector + this.translateCellTypes(element, (checkListV3 && checkRelatedListV3));
        } else if (element.relatedListElement == 'cell_edit') {
          elementSelector = this.translateCellEdit(element, (checkListV3 && checkRelatedListV3));
        } else {
          if (checkListV3 && checkRelatedListV3) {
            if (element.relatedListElement == 'ui_action') {
              elementSelector = relatedListSelector + "button[data-action-name='" + element.uiAction + "']";
            }
          } else {
            if (element.relatedListElement == 'ui_action') {
              elementSelector = relatedListSelector + "button[id='" + element.uiAction + "']";
            }
          }
        }
        return elementSelector;
      },
      translateFilters: function(element, checkListV3, checkRelatedListV3) {
        var elementSelector = '';
        var useListV3 = checkListV3;
        if (element.relatedLists != '' && !checkRelatedListV3) {
          useListV3 = false;
        }
        if (useListV3) {
          if (element.filters == 'filter_icon') {
            elementSelector = "button[class~='list-filter-button']";
          } else if (element.filters == 'filter_breadcrumbs') {
            elementSelector = "div[class='breadcrumb-container']";
          } else if (element.filters == 'filter_run_btn') {
            elementSelector = "button[id='" + element.table + "-run-filter-button']";
          } else if (element.filters == 'filter_save_btn') {
            elementSelector = "button[id='" + element.table + "-save-filter-button']";
          } else if (element.filters == 'filter_and_btn') {
            elementSelector = "button[class~='btn-and-condition']";
          } else if (element.filters == 'filter_or_btn') {
            elementSelector = "button[class~='btn-or-condition']";
          } else if (element.filters == 'filter_add_sort_btn') {
            elementSelector = "button[id='" + element.table + "-sort-filter-button']";
          } else if (element.filters == 'filter_select_field') {
            elementSelector = "span[class~='ng-filter-widget-column'][class~='field-col']";
          } else if (element.filters == 'filter_select_operator') {
            elementSelector = "span[class~='ng-filter-widget-column'][class~='operator-col']";
          } else if (element.filters == 'filter_select_value') {
            elementSelector = "ng-switch[class~='ng-filter-widget-column_multi']";
          } else if (element.filters == 'filter_delete_btn') {
            elementSelector = "button[class~='remove-conditions-row']";
          } else if (element.filters == 'filter_v3_load_btn') {
            elementSelector = "button[id='" + element.table + "-load-filter-button']";
          } else if (element.filters == 'filter_v3_clear_all_btn') {
            elementSelector = "button[id='" + element.table + "-clear-filter-button']";
          } else if (element.filters == 'filter_v3_close_icon') {
            elementSelector = "button[id='" + element.table + "-close-filter-button']";
          } else if (element.filters == 'filter_v3_new_criteria_btn') {
            elementSelector = "button[id='" + element.table + "-add-new-section']";
          } else {
            elementSelector = "button[class~='list-filter-button']";
          }
        } else {
          if (element.relatedLists != '') {
            elementSelector = "a[id*='filter_toggle_image']";
            if (element.filters == 'filter_icon') {
              elementSelector = "a[id*='filter_toggle_image']";
            } else if (element.filters == 'filter_breadcrumbs') {
              elementSelector = "span[id*='_breadcrumb']";
            } else if (element.filters == 'filter_pin_btn') {
              elementSelector = "button[id='" + element.table + "." + element.relatedLists + "_pin']";
            }
          } else {
            elementSelector = "a[id='" + element.table + "_filter_toggle_image']";
            if (element.filters == 'filter_icon') {
              elementSelector = "a[id='" + element.table + "_filter_toggle_image']";
            } else if (element.filters == 'filter_breadcrumbs') {
              elementSelector = "span[id='" + element.table + "_breadcrumb']";
            } else if (element.filters == 'filter_pin_btn') {
              elementSelector = "button[id='" + element.table + "_pin']";
            }
          }
          if (element.filters == 'filter_run_btn') {
            elementSelector = "button[id='test_filter_action_toolbar_run']";
          } else if (element.filters == 'filter_save_btn') {
            elementSelector = "button[id='test_filter_action_toolbar_save']";
          } else if (element.filters == 'filter_and_btn') {
            elementSelector = "button[class~='filter_and_filter']";
          } else if (element.filters == 'filter_or_btn') {
            elementSelector = "button[class~='filter_add_filter']";
          } else if (element.filters == 'filter_add_sort_btn') {
            elementSelector = "button[class~='filter_add_sort']";
          } else if (element.filters == 'filter_select_field') {
            elementSelector = "td[class~='sn-filter-top'][id='field']";
          } else if (element.filters == 'filter_select_operator') {
            elementSelector = "td[class~='sn-filter-top'][id='oper']";
          } else if (element.filters == 'filter_select_value') {
            elementSelector = "td[class~='sn-filter-top'][id='value']";
          } else if (element.filters == 'filter_delete_btn') {
            elementSelector = "button[class~='filerTableAction'][class~='deleteButton']";
          } else if (element.filters == 'filter_default_btn') {
            elementSelector = "button[class~='filter_action']";
          }
        }
        return elementSelector;
      },
      translateFramesetType: function(element, checkUI16) {
        var elementSelector = "";
        if (checkUI16) {
          if (element.frameset == 'nav_filter') {
            elementSelector = "input[id='filter']";
          } else if (element.frameset == 'search') {
            elementSelector = "input[id='sysparm_search']";
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
    top.NOW.guidedTourElementTranslator = GuidedTourElementTranslator;
  })();
};