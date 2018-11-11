/*! RESOURCE: /scripts/app.guided_tours/js_guided_tours_includes.js */
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
/*! RESOURCE: /scripts/app.embedded_help/constants_embedded_help.js */
var EmbeddedHelpEvents = {};
EmbeddedHelpEvents.GUIDED_SETUP_ENABLE = "embedded_help.guided_setup.enable";
EmbeddedHelpEvents.GUIDED_SETUP_DISABLE = "embedded_help.guided_setup.disable";
EmbeddedHelpEvents.GUIDED_SETUP_ACTIONS_CHANGE = "embedded_help.guided_setup.actions_change";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_COMPLETE = "guided_setup:complete";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_INCOMPLETE = "guided_setup:incomplete";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_SKIP = "guided_setup:skip";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_EXIT = "guided_setup:exit";
EmbeddedHelpEvents.GUIDED_SETUP_ACTION_BACK = "guided_setup:back";
EmbeddedHelpEvents.TOUR_START = "embedded_help:tour.start";
EmbeddedHelpEvents.TOUR_END = "embedded_help:tour.end"
EmbeddedHelpEvents.TOUR_STATE = "embedded_help:tour:state"
EmbeddedHelpEvents.HOPSCOTCH_TOUR_START = "hopscotch.tour.start";
EmbeddedHelpEvents.HOPSCOTCH_TOUR_END = "hopscotch.tour.end";
EmbeddedHelpEvents.PANE_NAME = "embedded_help:help_pane";
EmbeddedHelpEvents.PANE_STATE = "embedded_help:help_pane:state";
EmbeddedHelpEvents.PANE_TOGGLE = "embedded_help:help_pane.toggle";
EmbeddedHelpEvents.PANE_LOAD = "magellanNavigator.permalink.set";
EmbeddedHelpEvents.CONTENT_LOAD = "embedded_help:content.load";
EmbeddedHelpEvents.DOCUMENT_LINK_CHANGE = "embedded_help:document_link.change";
EmbeddedHelpEvents.LOAD_EMBEDDED_HELP = "embedded_help:load_embedded_help";
var WebaEvents = {};
WebaEvents.CATEGORY = "EmbeddedHelp";
WebaEvents.TOUR_KEY = "Tour button";
WebaEvents.TOUR_VALUE = "Take a tour button clicked";
WebaEvents.HELP_PANE_KEY = "Help panel";
WebaEvents.HELP_PANE_VALUE = "Help panel opened";
WebaEvents.USER_GUIDE_KEY = "User guide";
WebaEvents.USER_GUIDE_VALUE = "User guide link clicked";
WebaEvents.SEARCH_DOC_KEY = "Search documentation";
WebaEvents.SEARCH_DOC_VALUE = "Search documentation link clicked";;
/*! RESOURCE: /scripts/app.guided_tours/controller.guidedTours.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedToursService == 'undefined') {
  function processUrlParameters(paramString) {
    var paramsArr = paramString.split('&');
    var params = {};
    paramsArr.forEach(function(p) {
      var keyval = p.split('=');
      params[keyval[0]] = keyval[1];
    });
    if (top.NOW.guidedToursAnalytics) top.NOW.guidedToursAnalytics.isEnabled = (params.mode === 'preview') ? false : true;
  }
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_START, function(args) {
    if (Array.isArray(args)) {
      top.NOW.guidedToursService.log("observing hopscotch: " + args[0] + " " + args[1]);
      top.NOW.guidedToursService.startTour(args[0], Number(args[1]));
    } else {
      top.NOW.guidedToursService.startTour(args, 0);
    }
  });
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_END, function() {
    top.NOW.guidedToursService.endTour();
  });
  CustomEvent.observe("page_loaded_fully", function(args) {
    if (args.location && args.location.search) {
      processUrlParameters(args.location.search.substring(1));
    }
    if (sessionStorage.getItem('guided_tour:tour.state') != null) {
      top.NOW.guidedToursService.startTourFromState(sessionStorage.getItem('guided_tour:tour.state'));
    } else if (top.hopscotch !== undefined) {
      top.NOW.guidedToursService.log("page_loaded_fully event: hopscotch state is: " + hopscotch.getState());
      if (top.hopscotch.getState() !== null) {
        top.NOW.guidedToursService.startTourFromState(hopscotch.getState());
      } else {
        if (top.NOW.user && top.NOW.user.name && top.NOW.user.name != "" && top.NOW.user.name != "guest") {
          sessionStorage.removeItem('guided_tour:auto_launch_tour');
          var currentPage = args.location.pathname;
          var context = currentPage.substr(1, currentPage.indexOf('.do') - 1);
          top.NOW.guidedToursService.autoLaunchTour(context);
        }
      }
    }
  });
};
/*! RESOURCE: /scripts/app.guided_tours/guided_tours_template.js */
var GuidedToursCallout = {};
GuidedToursCallout.template = function(obj) {
  obj || (obj = {});
  var escape = function(str) {
    if (customEscape) {
      return customEscape(str);
    }
    if (str == null) return '';
    return ('' + str).replace(new RegExp('[&<>"\']', 'g'), function(match) {
      if (match == '&') {
        return '&amp;'
      }
      if (match == '<') {
        return '&lt;'
      }
      if (match == '>') {
        return '&gt;'
      }
      if (match == '"') {
        return '&quot;'
      }
      if (match == "'") {
        return '&#x27;'
      }
    });
  }
  var temp, result = '';
  with(obj) {
    function optEscape(str, unsafe) {
      if (unsafe) {
        return escape(str);
      }
      return str;
    };
    result += '\n<div class="hopscotch-bubble-container" role="dialog" aria-labelledby="hopscotch-content" style="width: ' +
      ((temp = (step.width)) == null ? '' : temp) +
      'px;">\n  ';
    if (tour.isTour) {
      result += '<span class="hopscotch-bubble-number"><b>' +
        ((temp = (i18n.stepNum)) == null ? '' : temp) +
        ' / ' +
        ((temp = (tour.numSteps)) == null ? '' : temp) +
        '</b></span>';
    }
    result += '\n  <div class="hopscotch-bubble-content">\n    ';
    if (step.content !== '') {
      result += '<div class="hopscotch-content" id="hopscotch-content">' +
        ((temp = (optEscape(step.content, tour.unsafe))) == null ? '' : temp) +
        '</div>';
    }
    result += '\n  </div>\n  <div class="hopscotch-actions">\n    ';
    if (buttons.showPrev) {
      result += '<button class="hopscotch-nav-button prev hopscotch-prev">' +
        ((temp = (i18n.prevBtn)) == null ? '' : temp) +
        '</button>';
    }
    result += '\n    ';
    if (buttons.showCTA) {
      result += '<button class="hopscotch-nav-button next hopscotch-cta">' +
        ((temp = (buttons.ctaLabel)) == null ? '' : temp) +
        '</button>';
    }
    result += '\n    ';
    if (buttons.showNext) {
      result += '<button class="hopscotch-nav-button next hopscotch-next"' +
        'aria-label="Next Step" tabindex="0">' +
        ((temp = (i18n.nextBtn)) == null ? '' : temp) +
        '</button>';
    }
    result += '\n  </div>\n  ';
    if (buttons.showClose) {
      result += '<button class="hopscotch-bubble-close hopscotch-close"' +
        'aria-label="Cancel Tour" tabindex="0">' +
        '<span class="icon icon-cross"></span>' +
        '</button>';
    }
    result += '\n</div>\n<div class="hopscotch-bubble-arrow-container hopscotch-arrow">\n  <div class="hopscotch-bubble-arrow-border"></div>\n  <div class="hopscotch-bubble-arrow"></div>\n</div>';
  }
  return result;
};;
/*! RESOURCE: /scripts/app.guided_tours/lib/events.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.gtaEvents == 'undefined') {
  (function(top) {
    var root = top,
      nativeForEach = Array.prototype.forEach,
      hasOwnProperty = Object.prototype.hasOwnProperty,
      slice = Array.prototype.slice,
      idCounter = 0;

    function miniscore() {
      return {
        keys: Object.keys || function(obj) {
          if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
            throw new TypeError("keys() called on a non-object");
          }
          var key, keys = [];
          for (key in obj) {
            if (obj.hasOwnProperty(key)) {
              keys[keys.length] = key;
            }
          }
          return keys;
        },
        uniqueId: function(prefix) {
          var id = ++idCounter + '';
          return prefix ? prefix + id : id;
        },
        has: function(obj, key) {
          return hasOwnProperty.call(obj, key);
        },
        each: function(obj, iterator, context) {
          if (obj == null) return;
          if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
          } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
              iterator.call(context, obj[i], i, obj);
            }
          } else {
            for (var key in obj) {
              if (this.has(obj, key)) {
                iterator.call(context, obj[key], key, obj);
              }
            }
          }
        },
        once: function(func) {
          var ran = false,
            memo;
          return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
          };
        }
      };
    }
    var _ = miniscore(),
      Events;
    Events = {
      on: function(name, callback, context) {
        if (!eventsApi(this, 'on', name, [callback, context]) || !callback) return this;
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({
          callback: callback,
          context: context,
          ctx: context || this
        });
        return this;
      },
      once: function(name, callback, context) {
        if (!eventsApi(this, 'once', name, [callback, context]) || !callback) return this;
        var self = this;
        var once = _.once(function() {
          self.off(name, once);
          callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
      },
      off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
        if (!name && !callback && !context) {
          this._events = {};
          return this;
        }
        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
          name = names[i];
          if (events = this._events[name]) {
            this._events[name] = retain = [];
            if (callback || context) {
              for (j = 0, k = events.length; j < k; j++) {
                ev = events[j];
                if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                  (context && context !== ev.context)) {
                  retain.push(ev);
                }
              }
            }
            if (!retain.length) delete this._events[name];
          }
        }
        return this;
      },
      trigger: function(name) {
        if (!this._events) return this;
        var args = slice.call(arguments, 1);
        if (!eventsApi(this, 'trigger', name, args)) return this;
        var events = this._events[name];
        var allEvents = this._events.all;
        if (events) triggerEvents(events, args);
        if (allEvents) triggerEvents(allEvents, arguments);
        return this;
      },
      stopListening: function(obj, name, callback) {
        var listeners = this._listeners;
        if (!listeners) return this;
        var deleteListener = !name && !callback;
        if (typeof name === 'object') callback = this;
        if (obj)(listeners = {})[obj._listenerId] = obj;
        for (var id in listeners) {
          listeners[id].off(name, callback, this);
          if (deleteListener) delete this._listeners[id];
        }
        return this;
      }
    };
    var eventSplitter = /\s+/;
    var eventsApi = function(obj, action, name, rest) {
      if (!name) return true;
      if (typeof name === 'object') {
        for (var key in name) {
          obj[action].apply(obj, [key, name[key]].concat(rest));
        }
        return false;
      }
      if (eventSplitter.test(name)) {
        var names = name.split(eventSplitter);
        for (var i = 0, l = names.length; i < l; i++) {
          obj[action].apply(obj, [names[i]].concat(rest));
        }
        return false;
      }
      return true;
    };
    var triggerEvents = function(events, args) {
      var ev, i = -1,
        l = events.length,
        a1 = args[0],
        a2 = args[1],
        a3 = args[2];
      switch (args.length) {
        case 0:
          while (++i < l)(ev = events[i]).callback.call(ev.ctx);
          return;
        case 1:
          while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1);
          return;
        case 2:
          while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2);
          return;
        case 3:
          while (++i < l)(ev = events[i]).callback.call(ev.ctx, a1, a2, a3);
          return;
        default:
          while (++i < l)(ev = events[i]).callback.apply(ev.ctx, args);
      }
    };
    var listenMethods = {
      listenTo: 'on',
      listenToOnce: 'once'
    };
    _.each(listenMethods, function(implementation, method) {
      Events[method] = function(obj, name, callback) {
        var listeners = this._listeners || (this._listeners = {});
        var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
        listeners[id] = obj;
        if (typeof name === 'object') callback = this;
        obj[implementation](name, callback, this);
        return this;
      };
    });
    Events.bind = Events.on;
    Events.unbind = Events.off;
    Events.emit = Events.trigger;
    Events.mixin = function(proto) {
      var exports = ['on', 'once', 'off', 'trigger', 'stopListening', 'listenTo',
        'listenToOnce', 'bind', 'unbind', 'emit'
      ];
      _.each(exports, function(name) {
        proto[name] = this[name];
      }, this);
      return proto;
    };
    root.NOW.gtaEvents = Events;
  })(top);
};
/*! RESOURCE: /scripts/app.guided_tours/constants.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedTourConstants == 'undefined') {
  top.NOW.guidedTourConstants = {};
  top.NOW.guidedTourConstants.events = {
    started: 'started',
    completed: 'completed',
    failed: 'failed',
    dismissed: 'dismissed',
    stepStarted: 'step_started'
  };
  top.NOW.guidedTourConstants.eventStreamName = 'gt-event';
};
/*! RESOURCE: /scripts/app.guided_tours/service.analytics.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedToursAnalytics == 'undefined') {
  var eventNames = top.NOW.guidedTourConstants.events;
  var sessionKey = 'play_id';
  var sessionStoreKey = 'guided_tour_analytics' + sessionKey;

  function AnalyticsService() {
    this.sessionId = sessionStorage.getItem(sessionStoreKey) || null;
    this.buffer = [];
    this.url = '/api/now/guided_tours/analytics';
    this.isEnabled = true;
  }
  AnalyticsService.prototype.queue = function(data) {
    var self = this;
    if (data.event === eventNames.started) {
      this.send({
        event: data.event,
        tour: data.tour,
        timestamp: data.timestamp
      }, function(e, d) {
        if (!e && d[sessionKey]) {
          self.sessionId = d[sessionKey];
          sessionStorage.setItem(sessionStoreKey, self.sessionId);
          while (self.buffer.length > 0) {
            var d = self.buffer.shift();
            d[sessionKey] = self.sessionId;
            self.send(d);
          }
        }
      });
    } else {
      this.buffer.push(data);
    }
  };
  AnalyticsService.prototype.send = function(data, cb) {
    window.jQuery.ajax(this.url, {
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      method: 'POST',
      processData: false,
      success: function(d) {
        cb && cb(null, d.result);
      },
      error: function(e) {
        cb && cb(e);
      }
    });
  };
  AnalyticsService.prototype.listenTo = function(eventEmitter, eventName) {
    var self = this;
    eventEmitter.on(eventName, function(d) {
      if (!self.isEnabled) {
        return;
      }
      if (!d) return;
      if (!d.timestamp) {
        d.timestamp = Date.now();
      }
      if (!self.sessionId) {
        self.queue(d);
      } else {
        d[sessionKey] = self.sessionId;
        self.send(d);
      }
      if (d.event === eventNames.completed || d.event === eventNames.dismissed || d.event === eventNames.failed) {
        sessionStorage.removeItem(sessionStoreKey)
        self.sessionId = null;
      }
    });
  };
  top.NOW.guidedToursAnalytics = new AnalyticsService();
};
/*! RESOURCE: /scripts/app.guided_tours/helper.events.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedToursEventsHelper == 'undefined') {
  top.NOW.guidedToursEventsHelper = {};
  var eventNames = top.NOW.guidedTourConstants.events;
  top.NOW.guidedToursEventsHelper.createEventData = function(name, service, options) {
    var evtObj = {
      event: name,
      tour: service.currentSysId,
      timestamp: Date.now(),
      details: ''
    };
    switch (name) {
      case eventNames.stepStarted:
        if (options && typeof(options.step) !== 'undefined') {
          evtObj.attribute = options.step;
        }
        break;
      case eventNames.started:
      case eventNames.completed:
      case eventNames.failed:
      case eventNames.dismissed:
        break;
      default:
        return null;
    }
    return evtObj;
  }
};
/*! RESOURCE: /scripts/app.guided_tours/service.guidedToursService.js */
if (typeof top.NOW != 'undefined' && typeof top.NOW.guidedToursService == 'undefined') {
  (function() {
    var eventStreamName = top.NOW.guidedTourConstants.eventStreamName;
    var eventNames = top.NOW.guidedTourConstants.events;
    var eventEmitter = top.NOW.gtaEvents.mixin({});
    var eventCreationHelper = top.NOW.guidedToursEventsHelper;
    var GuidedToursService = {
      tourErrorMessage: "Tour ended because the next step was not found.",
      autoTourDisableMessage: "This tour has now been disabled for auto-launch",
      currentTour: null,
      currentContext: null,
      currentSysId: null,
      currentStep: 0,
      isImplicit: false,
      enableLogging: false,
      currentAutoLaunchTour: null,
      dismissAutoLaunchModal: {},
      TOUR_DELAY: 500,
      MAX_ATTEMPTS: 10,
      isIE: false || !!document.documentMode,
      _isDocumentStateComplete: function(page) {
        var result = true;
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          result = result && this._isDocumentStateComplete(inlineFrames[i].contentWindow);
        }
        if (page.document.readyState !== 'complete') {
          return false;
        }
        return result;
      },
      _waitForComplete: function() {
        var self = this;
        var count = 1;
        var wait = setInterval(function() {
          if (self._isDocumentStateComplete(window)) {
            self._getRestData();
            clearInterval(wait);
          }
          if (count >= self.MAX_ATTEMPTS) {
            self._throwError(self.tourErrorMessage);
            clearInterval(wait);
          }
          count++;
        }, self.TOUR_DELAY);
      },
      startTour: function(sys_id, step) {
        this.currentSysId = sys_id;
        this.currentStep = step;
        if (this._isDocumentStateComplete(window)) {
          this._getRestData();
        } else {
          this._waitForComplete();
        }
      },
      startTourFromState: function(tourState) {
        var re = /tour_(\w+):(\d+)/;
        var state = re.exec(tourState);
        var step = Number(state[2]);
        if (this.isImplicitNext() || (sessionStorage.getItem('guided_tour:tour.implicit') == 'true')) {
          step++;
        }
        this.startTour(state[1], step);
      },
      _getRestData: function() {
        var self = this;
        if (self.currentTour == null && self.currentSysId != null) {
          window.jQuery.getJSON(
              "/api/now/guidedtour/" + self.currentSysId)
            .done(function(response) {
              var data = response;
              if (data.result != undefined) {
                self.currentTour = self._createTour(self._translateElementTargets(data.result[0]));
                self._checkIfHopscotchIsLoaded();
              } else {
                self.log("No guided tour info");
                self._throwError(self.tourErrorMessage);
              }
            }).fail(function(response) {
              self.log("Error getting tour guide info");
              self._throwError(self.tourErrorMessage);
            });
        } else if (self.currentTour != null) {
          self._checkIfHopscotchIsLoaded();
        } else {
          self._throwError(self.tourErrorMessage);
        }
      },
      _checkIfHopscotchIsLoaded: function() {
        if (this._isHopscotchLoaded(window)) {
          this._launchTour();
        } else {
          this._loadHopscotch(window);
        }
      },
      endTour: function() {
        if (!this.hasFailed && !this.isDismissed) {
          eventEmitter.emit(eventStreamName, eventCreationHelper.createEventData(eventNames.completed, this));
        }
        sessionStorage.removeItem('guided_tour:tour.state');
        sessionStorage.removeItem('guided_tour:tour.implicit');
        this.currentTour = null;
        this.currentContext = null;
        this.currentSysId = null
        this.currentStep = 0;
        this.isImplicit = false;
        this.currentAutoLaunchTour = null;
        this._endAllTours(window, false);
      },
      isTourRunning: function() {
        return window.hopscotch !== undefined && window.hopscotch.getState() != null;
      },
      _createTour: function(data) {
        var tour = new Object();
        tour.sys_id = data.sysID;
        tour.id = "tour_" + tour.sys_id;
        tour.onError = ["errorLog"];
        tour.onClose = ["broadcastDismissed", "broadcastEnd"];
        tour.onEnd = ["broadcastEnd"];
        this._addOptions(tour, data.options);
        tour.i18n = new Object();
        tour.i18n.nextBtn = data.nextBtn;
        tour.i18n.doneBtn = data.doneBtn;
        tour.steps = new Array();
        for (var i = 0; i < data.steps.length; i++) {
          var step = new Object();
          if (data.steps[i].target == 'SKIP') {
            continue;
          }
          step.target = data.steps[i].target;
          step.placement = data.steps[i].placement;
          step.content = data.steps[i].content;
          step.window = data.steps[i].window;
          step.view = data.steps[i].view;
          step.link = data.steps[i].link;
          step.implicit = data.steps[i].implicit;
          step.action = data.steps[i].action;
          step.actionTarget = data.steps[i].actionTarget;
          step.actionEvent = data.steps[i].actionEvent;
          step.options = data.steps[i].options;
          step.onNext = [];
          tour.steps.push(step);
        }
        for (var i = 0; i < tour.steps.length; i++) {
          tour.steps[i].multipage = true;
          if (tour.steps[i].implicit || tour.steps[i].action) {
            tour.steps[i].showNextButton = false;
          }
          if (tour.steps[i].link !== '') {
            tour.steps[i].onNext.push(["followLink", tour.steps[i].link]);
          }
          if (!tour.steps[i].action) {
            tour.steps[i].onNext.push(["switchFrame", tour.sys_id, i + 1]);
          } else {
            if (tour.steps[i + 1] !== undefined) {
              if (tour.steps[i].window == tour.steps[i + 1].window && tour.steps[i].implicit) {} else if (tour.steps[i].window == tour.steps[i + 1].window) {
                tour.steps[i].onNext.push(["switchFrame", tour.sys_id, i + 1]);
              }
            }
          }
          tour.steps[i].onShow = [
            ["scrollToView"],
            ["setFocus"]
          ];
          this._addOptions(tour.steps[i], tour.steps[i].options);
        }
        this.log(JSON.stringify(tour));
        return tour;
      },
      _addOptions: function(tour, options) {
        if (options !== '') {
          var optionsObj = JSON.parse(options);
          for (var key in optionsObj) {
            if (optionsObj.hasOwnProperty(key)) {
              tour[key] = optionsObj[key];
            }
          }
        }
      },
      _translateElementTargets: function(data) {
        if (this._findTarget(".view-tabs", window.top) != null || this._findTarget("#dropUpRange", window.top) != null) {
          for (var i in data.steps) {
            data.steps[i].listV3Compatibility = data.steps[i].relatedListV3Compatibility = true;
          }
        }
        var translatedTargets = window.NOW.guidedTourElementTranslator.translateTargets(data);
        this.log("translated Targets: " + translatedTargets.join());
        var translatedActionTargets = window.NOW.guidedTourElementTranslator.translateActionTargets(data);
        this.log("translated Action Targets: " + translatedActionTargets.join());
        var updatedData = data;
        for (var i = 0; i < updatedData.steps.length; i++) {
          if (translatedTargets[i] != "") {
            if (translatedTargets[i] == "SKIP") {
              updatedData.steps[i].skip = true;
            }
            updatedData.steps[i].target = translatedTargets[i];
          }
          if (translatedActionTargets[i] != "")
            updatedData.steps[i].actionTarget = translatedActionTargets[i];
        }
        return updatedData;
      },
      _loadHopscotch: function(page) {
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          this._loadHopscotch(inlineFrames[i].contentWindow);
        }
        var self = this;
        if (page.hopscotch === undefined) {
          this._loadCSSInFrame(page, "/styles/hopscotch.min.css");
          this._loadCSSInFrame(page, "/styles/hopscotch.glide.css");
          this._loadCSSInFrame(page, "/styles/app.guided_tours/guided_tours.css");
          var scriptElement = document.createElement('script');
          scriptElement.setAttribute('src', '/scripts/hopscotch.min.js');
          scriptElement.onload = function() {
            if (self._isHopscotchLoaded(window)) {
              self._launchTour();
            }
          }
          var headTag = page.document.head || page.document.findElementsByTagName('head')[0];
          headTag.appendChild(scriptElement);
        }
      },
      _isHopscotchLoaded: function(page) {
        var result = true;
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          result = result && this._isHopscotchLoaded(inlineFrames[i].contentWindow);
        }
        if (page.hopscotch === undefined) {
          return false;
        }
        return result;
      },
      _launchTour: function() {
        this.hasFailed = false;
        this.isDismissed = false;
        this._addScrollHandler(window);
        this._registerPageHelpers(window);
        this._launchTourAttempt(this.currentTour, this.currentStep, true);
      },
      _launchTourAttempt: function(tour, step, isFirstAttempt) {
        this.log("Attempting to start tour " + tour.id + " at step " + step);
        var pagePattern = new RegExp(tour.steps[step].window);
        if (!(tour.steps[step].window == '' || this._isOnPage(window, pagePattern))) {
          this.log("Error: Current window " + tour.steps[step].window + " does not match tour step");
          if (step + 1 < tour.steps.length && isFirstAttempt) {
            this._launchTourAttempt(tour, step + 1, false);
          } else {
            if (!top.opener) {
              this._throwError(this.tourErrorMessage);
            } else {
              CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
            }
          }
        } else {
          var viewURL = this._getViewURL(tour, step);
          if (viewURL.length != 0) {
            sessionStorage.setItem('guided_tour:tour.state', tour.id + ":" + step);
            viewURL[0].location.href = viewURL[1];
            return;
          }
          var formIFrame = document.getElementById("gsft_main")
          if (formIFrame) {
            formIFrame = document.getElementById("gsft_main").contentDocument;
            var relatedListTriggerBtn = formIFrame.getElementsByClassName("related-list-trigger")[0];
            if (relatedListTriggerBtn && relatedListTriggerBtn.getBoundingClientRect) {
              var boundingRect = relatedListTriggerBtn.getBoundingClientRect();
              if (boundingRect.left != 0 && boundingRect.right != 0 && boundingRect.top != 0 && boundingRect.bottom != 0)
                relatedListTriggerBtn.click();
            }
          }
          if (this._doesElementExist(tour.steps[step].target, window)) {
            this._checkForActionElement(tour, step);
          } else {
            this._waitForElementToExist(tour.steps[step].target, true, tour, step);
          }
        }
      },
      _checkForActionElement: function(tour, step) {
        if (tour.steps[step].action && tour.steps[step].actionTarget !== tour.steps[step].target) {
          if (!this._doesElementExist(tour.steps[step].actionTarget, window)) {
            this._waitForElementToExist(tour.steps[step].actionTarget, false, tour, step);
            return;
          }
        }
        if (step === 0)
          eventEmitter.emit(eventStreamName, eventCreationHelper.createEventData(eventNames.started, this, {
            tour: tour,
            step: step
          }));
        eventEmitter.emit(eventStreamName, eventCreationHelper.createEventData(eventNames.stepStarted, this, {
          tour: tour,
          step: step
        }));
        this._startHopscotch(tour, step);
      },
      _startHopscotch: function(tour, step) {
        if (tour.steps[step].action) {
          this._addActionEvent(tour.steps[step].actionTarget, tour.steps[step].actionEvent, tour.steps[step].implicit);
        }
        this.isImplicit = tour.steps[step].implicit;
        sessionStorage.setItem('guided_tour:tour.implicit', this.isImplicit);
        if (this._getTargetWindow(window, tour.steps[step].target).hopscotch) {
          this._getTargetWindow(window, tour.steps[step].target).hopscotch.startTour(tour, step);
          sessionStorage.setItem('guided_tour:tour.state', this._getTargetWindow(window, tour.steps[step].target).hopscotch.getState());
        }
      },
      _getViewURL: function(tour, step) {
        if (typeof tour.steps[step].view != 'undefined' && tour.steps[step].view != '') {
          var page = this._getTargetWindow(window, tour.steps[step].target);
          if (page == null) {
            page = window;
            if (tour.steps[step].window != '') {
              var re = new RegExp(tour.steps[step].window);
              page = this._getInnerWindow(window, re);
              if (page == null) {
                page = window;
              }
            }
          }
          var pagePattern = new RegExp("sysparm_view(=|\%3D)" + tour.steps[step].view);
          if (!pagePattern.test(page.location.href)) {
            pagePattern = new RegExp("sysparm_view_forced");
            if (pagePattern.test(page.location.href)) {
              return [];
            }
            var AMPERSAND = "&";
            var EQUALS = "=";
            pagePattern = new RegExp("\%2F");
            if (pagePattern.test(page.location.href)) {
              AMPERSAND = "%26";
              EQUALS = "%3D";
            }
            pagePattern = new RegExp("sysparm_view");
            if (!pagePattern.test(page.location.href)) {
              return [page, page.location.href + AMPERSAND + "sysparm_view" + EQUALS + tour.steps[step].view];
            }
            var urlArray = page.location.href.split(AMPERSAND);
            for (var i = 0; i < urlArray.length; i++) {
              if (pagePattern.test(urlArray[i])) {
                var viewParameter = urlArray[i].split(EQUALS);
                viewParameter[1] = tour.steps[step].view;
                urlArray[i] = viewParameter.join(EQUALS);
              }
            }
            return [page, urlArray.join(AMPERSAND)];
          }
        }
        return [];
      },
      registerHelpers: function(hopscotchObj, page) {
        var self = this;
        hopscotchObj.registerHelper('switchFrame', function(tour, step) {
          CustomEvent.fireTop(EmbeddedHelpEvents.HOPSCOTCH_TOUR_START, [tour, step]);
        });
        hopscotchObj.registerHelper('followLink', function(href) {
          var frameCtx = document.getElementById('gsft_main').contentWindow;
          frameCtx.location.href = href;
        });
        hopscotchObj.registerHelper('errorLog', function() {
          self.log("Hopscotch error: Could not find target element on " + page.location.pathname);
          self._throwError(self.tourErrorMessage);
        });
        hopscotchObj.registerHelper('broadcastEnd', function() {
          var step = hopscotchObj.getCurrStepNum();
          var target = page.jQuery(self.currentTour.steps[step].target);
          target.off("keydown.guided_tours_wcag");
          var currentAutoLaunchTour = GuidedToursService.currentAutoLaunchTour;
          if (currentAutoLaunchTour != null) {
            var data = {};
            data.tour = currentAutoLaunchTour;
            self._overrideAutoLaunchTour(data);
          }
          CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
        });
        hopscotchObj.registerHelper('broadcastDismissed', function() {
          var currentAutoLaunchTour = GuidedToursService.currentAutoLaunchTour;
          if (currentAutoLaunchTour != null) {
            self._dismissAutoLaunchTour();
          } else {
            eventEmitter.emit(eventStreamName, eventCreationHelper.createEventData(eventNames.dismissed, self));
            self.isDismissed = true;
          }
        });
        hopscotchObj.registerHelper('scrollToView', function() {
          if (!self.isIE) {
            var step = hopscotchObj.getCurrStepNum();
            page.jQuery(self.currentTour.steps[step].target).get(0).scrollIntoView(false);
          }
        });
        hopscotchObj.registerHelper('setFocus', function() {
          page.setTimeout(function() {
            var step = hopscotchObj.getCurrStepNum();
            var nextButton = page.jQuery('.hopscotch-next');
            var closeButton = page.jQuery('.hopscotch-close');
            var target = page.jQuery(self.currentTour.steps[step].target);
            var showNext = nextButton.length != 0;
            if (showNext) {
              nextButton.focus();
            } else {
              closeButton.focus();
            }
            target.off("keydown.guided_tours_wcag");
            target.on("keydown.guided_tours_wcag", function(ev) {
              if (ev.which == 9) {
                ev.preventDefault();
                if (ev.shiftKey || !showNext) {
                  closeButton.focus();
                } else {
                  nextButton.focus();
                }
              }
            });
            if (showNext) {
              nextButton.off("keydown.guided_tours_wcag");
              nextButton.on("keydown.guided_tours_wcag", function(ev) {
                if (ev.which == 9) {
                  ev.preventDefault();
                  if (ev.shiftKey) {
                    target.focus();
                  } else {
                    closeButton.focus();
                  }
                }
              });
            }
            closeButton.off("keydown.guided_tours_wcag");
            closeButton.on("keydown.guided_tours_wcag", function(ev) {
              if (ev.which == 9) {
                ev.preventDefault();
                if (ev.shiftKey && showNext) {
                  nextButton.focus();
                } else {
                  target.focus();
                }
              }
            });
          }, 200);
        });
        hopscotchObj.setRenderer(GuidedToursCallout.template);
      },
      _dismissAutoLaunchTour: function() {
        var self = this;
        var currentAutoLaunchTour = GuidedToursService.currentAutoLaunchTour;
        var currentAutoLaunchPage = GuidedToursService.currentContext;
        var gsft = document.getElementById("gsft_main");
        var win = gsft.contentWindow;
        var dismissModalTranslations;
        if (win.getMessage) {
          dismissModalTranslations = win.getMessages(['Stop Guided Tour', 'Do you want to stop this tour from auto launching again?', 'Apply for all tours on this page', 'Yes', 'No']);
          self.launchDimissModal(dismissModalTranslations);
        } else if (win.g_i18n)
          dismissModalTranslations = win.g_i18n.getMessages(['Stop Guided Tour', 'Do you want to stop this tour from auto launching again?', 'Apply for all tours on this page', 'Yes', 'No'], self.launchDimissModal.bind(self));
        else
          self.launchDimissModal('Stop Guided Tour');
      },
      launchDimissModal: function(translatedText) {
        var self = this;
        var gsft = document.getElementById("gsft_main");
        var win = gsft.contentWindow;
        var currentAutoLaunchTour = GuidedToursService.currentAutoLaunchTour;
        var currentAutoLaunchPage = GuidedToursService.currentContext;
        var modalTile;
        var obj = {};
        if (typeof(translatedText) === "object") {
          modalTile = translatedText['Stop Guided Tour'];
          obj.confirmationMessage = translatedText['Do you want to stop this tour from auto launching again?'];
          obj.applyAllTours = translatedText['Apply for all tours on this page'];
          obj.yes = translatedText['Yes'];
          obj.no = translatedText['No'];
        } else {
          modalTile = translatedText;
          obj.confirmationMessage = 'Do you want to stop this tour from auto launching again?';
          obj.applyAllTours = 'Apply for all tours on this page';
          obj.yes = 'Yes';
          obj.no = 'No';
        }
        var dismissAutoLaunchModal = new win.GlideModal('');
        dismissAutoLaunchModal.setTitle(modalTile);
        dismissAutoLaunchModal.renderWithContent(DismissAutoLaunch.template(obj));
        var doc = gsft.contentDocument;
        doc.getElementById('close_dismiss_modal').addEventListener('click', function() {
          dismissAutoLaunchModal.destroy();
        });
        doc.getElementById('do_not_autolaunch').addEventListener('click', function() {
          var data = {};
          if (doc.getElementById('apply_to_all').checked == true)
            data.page = currentAutoLaunchPage;
          else
            data.tour = currentAutoLaunchTour;
          self._overrideAutoLaunchTour(data);
          dismissAutoLaunchModal.destroy();
        });
        CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
      },
      _overrideAutoLaunchTour: function(data) {
        var self = this;
        var url = "/api/now/guided_tours/autolaunch/override";
        window.jQuery.ajax(url, {
          data: JSON.stringify(data),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          method: 'POST',
          processData: false,
          success: function() {
            self.log("Tour override successful");
          },
          error: function() {
            self.log("Error in overriding tour info");
          }
        });
      },
      _loadCSSInFrame: function(frame, filename) {
        var fileref = document.createElement("link");
        fileref.setAttribute("rel", "stylesheet");
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("href", filename);
        frame.document.head.appendChild(fileref);
      },
      _addActionEvent: function(cssSelector, eventType, implicit) {
        var self = this;
        var target = this._findTarget(cssSelector, window);
        if (target != null) {
          var hopscotchObj = this._getTargetWindow(window, cssSelector).hopscotch;
          this.log("Adding " + eventType + " for " + cssSelector);
          if (eventType.indexOf('_') != -1) {
            var arr = eventType.split('_');
            var parsedEvent = arr[0];
            var option = arr[1];
            target.off(parsedEvent + ".guided_tours");
            target.on(parsedEvent + ".guided_tours", function(ev) {
              if (ev.which == option) {
                self._onAction(hopscotchObj, implicit);
                target.off(parsedEvent + ".guided_tours");
              }
            });
          } else {
            target.off(eventType + ".guided_tours");
            target.one(eventType + ".guided_tours", function() {
              self._onAction(hopscotchObj, implicit);
            });
          }
        } else {
          this.log("Could not find action target " + cssSelector);
          this._throwError(this.tourErrorMessage);
        }
      },
      _onAction: function(hopscotchObj, implicit) {
        if (!implicit) {
          this.log("Firing next event from action");
          hopscotchObj.nextStep();
          sessionStorage.setItem('guided_tour:tour.state', hopscotchObj.getState());
        }
      },
      _findTarget: function(cssSelector, page) {
        if (page.jQuery == undefined) {
          return null;
        }
        var target = page.jQuery(cssSelector);
        if (target.length != 0) {
          return target;
        }
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          target = this._findTarget(cssSelector, inlineFrames[i].contentWindow);
          if (target != null) {
            return target;
          }
        }
        return null;
      },
      _doesElementExist: function(cssSelector, page) {
        var result = false;
        if (page.jQuery == undefined) {
          return false
        }
        var target = page.jQuery(cssSelector);
        if (target.length != 0) {
          var e = target[0];
          var visible = !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length);
          return visible;
        }
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          result = result || this._doesElementExist(cssSelector, inlineFrames[i].contentWindow);
        }
        return result;
      },
      _waitForElementToExist: function(cssSelector, checkAction, tour, step) {
        var self = this;
        var count = 1;
        var wait = setInterval(function() {
          if (self._doesElementExist(cssSelector, window)) {
            if (checkAction) {
              self._checkForActionElement(tour, step);
            } else {
              self._startHopscotch(tour, step);
            }
            clearInterval(wait);
          }
          if (count >= self.MAX_ATTEMPTS) {
            self._throwError(self.tourErrorMessage);
            clearInterval(wait);
          }
          count++;
        }, self.TOUR_DELAY);
      },
      _endAllTours: function(page, doCallbacks) {
        if (page.hopscotch != undefined) {
          try {
            page.hopscotch.endTour(true, doCallbacks);
          } catch (err) {
            this.log("problems ending hopscotch: " + err);
          }
        }
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          this._endAllTours(inlineFrames[i].contentWindow, doCallbacks);
        }
      },
      _registerPageHelpers: function(page) {
        if (page.hopscotch !== undefined) {
          this.registerHelpers(page.hopscotch, page);
        }
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          this._registerPageHelpers(inlineFrames[i].contentWindow);
        }
      },
      _getTargetWindow: function(page, cssSelector) {
        if (page.jQuery == undefined) {
          return null;
        }
        var target = page.jQuery(cssSelector);
        if (target.length != 0) {
          return page;
        }
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          var result = this._getTargetWindow(inlineFrames[i].contentWindow, cssSelector);
          if (result != null) {
            return result;
          }
        }
        return null;
      },
      _isOnPage: function(page, re) {
        if (re.test(page.location.href)) {
          return true;
        }
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          var result = this._isOnPage(inlineFrames[i].contentWindow, re);
          if (result) {
            return result;
          }
        }
        return false;
      },
      _getInnerWindow: function(page, re) {
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          var result = this._getInnerWindow(inlineFrames[i].contentWindow, re);
          if (result !== null) {
            return result;
          }
        }
        if (re.test(page.location.href)) {
          return page;
        }
        return null;
      },
      _findInlineFrameElements: function(page) {
        var inlineFrames = page.document.getElementsByTagName('iframe');
        var frameArray = [];
        for (var i = 0; i < inlineFrames.length; i++) {
          if (page.jQuery !== undefined) {
            frameArray.push(inlineFrames[i]);
          }
        }
        return frameArray;
      },
      isImplicitNext: function() {
        return this.isImplicit;
      },
      _throwError: function(msg) {
        eventEmitter.emit(eventStreamName, eventCreationHelper.createEventData(eventNames.failed, this, {
          message: msg
        }));
        this.hasFailed = true;
        this._displayMessage('error', msg);
        CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
      },
      _displayMessage: function(msgType, msg) {
        if (top.angular != undefined) {
          try {
            var notification = top.angular.element(document.body).injector().get('snNotification');
            notification.show(msgType, msg);
          } catch (err) {
            this.log('Could not find snNotification: ' + msg);
          }
        } else if (top.g_GlideUI != undefined) {
          top.g_GlideUI.addOutputMessage({
            'msg': msg,
            'type': msgType
          });
        } else {
          this.log(msgType + ': ' + msg);
        }
      },
      setLogging: function(enable) {
        this.enableLogging = enable;
      },
      log: function(msg) {
        if (this.enableLogging) {
          jslog("Guided Tours: " + msg);
        }
      },
      _addScrollHandler: function(page) {
        if (page.jQuery) {
          var scrollFrame = page.jQuery("div[id*='form_scroll']");
          if (scrollFrame.length == 0) {
            scrollFrame = page.jQuery(page);
          }
          scrollFrame.off("scroll.guided_tours");
          scrollFrame.on("scroll.guided_tours", function() {
            if (hopscotch.getState() != null) {
              page.hopscotch.refreshBubblePosition();
            }
          });
        }
        var inlineFrames = this._findInlineFrameElements(page);
        for (var i = 0; i < inlineFrames.length; i++) {
          this._addScrollHandler(inlineFrames[i].contentWindow);
        }
      },
      autoLaunchTour: function(page) {
        var url = "/api/now/guided_tours/autolaunch/get?page=" + page;
        this.currentContext = page;
        window.jQuery.ajax(url, {
          dataType: "json",
          method: 'GET',
          success: this.runAutoLaunchTour,
          error: function() {}
        });
      },
      runAutoLaunchTour: function(response) {
        var tour = response.result;
        var autoLaunchTourId = tour.tourId;
        var routeViaPlayButtonFromGTD = sessionStorage.getItem('AUTOSTART');
        if (autoLaunchTourId != null && routeViaPlayButtonFromGTD == null) {
          GuidedToursService.currentAutoLaunchTour = autoLaunchTourId;
          sessionStorage.setItem('AUTOSTART', autoLaunchTourId);
          sessionStorage.setItem('TOURNAME', tour.name);
          CustomEvent.fireTop(EmbeddedHelpEvents.LOAD_EMBEDDED_HELP, '');
        }
      },
      getTourStepTarget: function(sys_id, step, callback) {
        var self = this;
        window.jQuery.getJSON(
            "/api/now/guidedtour/" + sys_id + "/" + step)
          .done(function(response) {
            var data = response.result;
            if (data.length) {
              if (typeof data[0] !== 'string') {
                var tourElement = data[0];
                var checkListV3 = data[1];
                var checkRelatedListV3 = data[2];
                var checkUI16 = data[3];
                var checkTabbedForm = data[4];
                var translatedElement = window.NOW.guidedTourElementTranslator.
                translateSingleStep(tourElement, checkListV3, checkRelatedListV3, checkUI16, checkTabbedForm);
                callback(translatedElement);
              } else {
                self.log(data[0]);
                callback(null);
              }
            } else {
              self.log("Error: Translation failed for tour " + sys_id + ", step " + step);
              callback(null);
            }
          }).fail(function(response) {
            self.log("Error getting tour step target info");
            callback(null);
          });
      }
    };
    GuidedToursService.events = eventEmitter;
    top.NOW.guidedToursAnalytics.listenTo(GuidedToursService.events, eventStreamName);
    top.NOW.guidedToursService = GuidedToursService;
  })();
};
/*! RESOURCE: /scripts/app.guided_tours/dismiss_auto_launch_modal.js */
var DismissAutoLaunch = {};
DismissAutoLaunch.template = function(obj) {
  obj || (obj = {});
  var temp, result = '';
  with(obj) {
    result += '<div class="row">';
    result += '<div class="col-sm-12">';
    result += '<span><p>';
    result += obj.confirmationMessage;
    result += '</p></span>';
    result += '</div>';
    result += '</div>';
    result += '</div>';
    result += '<div class="modal-footer">';
    result += '<div class="row">';
    result += '<div class="col-sm-6" style="text-align: left;padding: 7px;">';
    result += '<input id="apply_to_all" type="checkbox" style="margin: 0px;" name="apply_to_all" value="all_tours"/>';
    result += '&nbsp';
    result += '&nbsp';
    result += '<span>';
    result += obj.applyAllTours;
    result += '</span>';
    result += '</div>';
    result += '<div class="col-sm-6">';
    result += '<button id="close_dismiss_modal" class="btn btn-default">' + obj.no + '</button>';
    result += '<button id="do_not_autolaunch" class="btn btn-primary">' + obj.yes + '</button>';
    result += '</div>';
    result += '</div>';
  }
  return result;
};;;