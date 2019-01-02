/*! RESOURCE: /scripts/app.guided_tours/js_guided_tours_includes.js */
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
          element = [steps[i].actionTargetRecord, steps[i].listV3Compatibility];
          targetElements.push(element);
        } else if (!isAction && typeof steps[i].targetRecord != "undefined") {
          element = [steps[i].targetRecord, steps[i].listV3Compatibility];
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
              translatedElements[i] = this.translateFormType(listElement, checkListV3, checkTabbedForm);
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
    translateFormType: function(element, checkListV3, checkTabbedForm) {
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
            elementSelector = ".tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = ".tabs2_section_" + element.formSection;
          }
        } else if (element.formElement == 'form_section_tab_only') {
          if (checkTabbedForm) {
            elementSelector = ".tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = "SKIP";
          }
        } else if (element.formElement == 'related_list') {
          if (element.relatedListElement == 'ui_action') {
            elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] button[data-action-name='" + element.uiAction + "']";
          } else if (element.relatedListElement == 'tab_section') {
            if (checkTabbedForm) {
              elementSelector = ".sn-related-list-container .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
            } else {
              elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "']";
            }
          } else if (element.relatedListElement == 'tab_section_tab_only') {
            if (checkTabbedForm) {
              elementSelector = ".sn-related-list-container .tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
            } else {
              elementSelector = "SKIP";
            }
          } else if (element.relatedListElement == 'list_search') {
            elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] input[placeholder='Search']";
          }
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
            elementSelector = ".tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = ".tabs2_section_" + element.formSection;
          }
        } else if (element.formElement == 'form_section_tab_only') {
          if (checkTabbedForm) {
            elementSelector = ".tab_header:nth-of-type(" + element.formSection + ") .tabs2_tab";
          } else {
            elementSelector = "SKIP";
          }
        } else if (element.formElement == 'related_list') {
          if (element.relatedListElement == 'ui_action') {
            elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] button[id='" + element.uiAction + "']";
          } else if (element.relatedListElement == 'tab_section') {
            if (checkTabbedForm) {
              elementSelector = ".tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
            } else {
              elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "']";
            }
          } else if (element.relatedListElement == 'tab_section_tab_only') {
            if (checkTabbedForm) {
              elementSelector = ".tab_header:nth-of-type(" + (Number(element.relatedListPosition) + 1) + ") .tabs2_tab";
            } else {
              elementSelector = "SKIP";
            }
          } else if (element.relatedListElement == 'list_search') {
            elementSelector = "div[tab_list_name_raw='" + element.table + "." + element.relatedLists + "'] input[placeholder='Search']";
          }
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
/*! RESOURCE: /scripts/app.guided_tours/app_guided_tours.js */
angular.module('sn.guided_tours', ['sn.base',
  'ng.common',
  'ngSanitize',
  'sn.i18n'
]);;
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
EmbeddedHelpEvents.DOCUMENT_LINK_CHANGE = "embedded_help:document_link.change";;
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
    result += '\n<div class="hopscotch-bubble-container" style="width: ' +
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
      result += '<div class="hopscotch-content">' +
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
      result += '<button class="hopscotch-nav-button next hopscotch-next">' +
        ((temp = (i18n.nextBtn)) == null ? '' : temp) +
        '</button>';
    }
    result += '\n  </div>\n  ';
    if (buttons.showClose) {
      result += '<button class="hopscotch-bubble-close hopscotch-close">' +
        '<span class="icon icon-cross"></span>' +
        '</button>';
    }
    result += '\n</div>\n<div class="hopscotch-bubble-arrow-container hopscotch-arrow">\n  <div class="hopscotch-bubble-arrow-border"></div>\n  <div class="hopscotch-bubble-arrow"></div>\n</div>';
  }
  return result;
};;
/*! RESOURCE: /scripts/app.guided_tours/service.guidedToursService.js */
angular.module('sn.guided_tours').service('guidedToursService', ['$http', 'i18n', 'snNotification', function($http, i18n, snNotification) {
  var MAIN_IFRAMES = ["gsft_main", "gsft_list_form_pane"];
  var tourErrorMessage = i18n.getMessage("Tour ended because the next step was not found.");
  var currentTour = null;
  var isImplicit = false;
  var enableLogging = false;
  this._isDocumentStateComplete = function(page) {
    var result = true;
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      result = result && this._isDocumentStateComplete(inlineFrames[i].contentWindow);
    }
    if (page.document.readyState !== 'complete') {
      return false;
    }
    return result;
  }
  this._waitForComplete = function(page, sys_id, step) {
    if (page.document.readyState !== 'complete') {
      this.log("Waiting for complete ready state on " + page.name);
      var onStateChange = function() {
        onStateChange.page.document.removeEventListener('readystatechange', onStateChange);
        if (onStateChange.service._isDocumentStateComplete(window)) {
          onStateChange.service._getRestData(onStateChange.sys_id, onStateChange.step);
        } else {
          onStateChange.service._waitForComplete(onStateChange.page, onStateChange.sys_id, onStateChange.step);
        }
      };
      onStateChange.page = page;
      onStateChange.service = this;
      onStateChange.sys_id = sys_id;
      onStateChange.step = step;
      page.document.addEventListener('readystatechange', onStateChange);
    }
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      this._waitForComplete(inlineFrames[i].contentWindow, sys_id, step);
    }
  }
  this.startTour = function(sys_id, step) {
    if (this._isDocumentStateComplete(window)) {
      this._getRestData(sys_id, step);
    } else {
      this._waitForComplete(window, sys_id, step);
    }
  }
  this._getRestData = function(sys_id, step) {
    var self = this;
    $http.get(
      "/api/now/guidedtour/" + sys_id
    ).then(function(response) {
      var data = response.data;
      if (data.result.length) {
        if (self._isHopscotchLoaded(window)) {
          self._launchTour(data.result[0], step);
        } else {
          self._loadHopscotch(window, data.result[0], step);
        }
      } else {
        console.log("No guided tour info");
      }
    }, function(response) {
      console.log("Error getting tour guide info");
    });
  }
  this.endTour = function() {
    currentTour = null;
    implicit = false;
    this._endAllTours(window, false);
  }
  this.isTourRunning = function() {
    return hopscotch != null && hopscotch.getState() != null;
  }
  this._createTour = function(data) {
    var tour = new Object();
    tour.sys_id = data.sysID;
    tour.id = "tour_" + tour.sys_id;
    tour.onError = ["errorLog"];
    tour.onClose = ["broadcastEnd"];
    tour.onEnd = ["broadcastEnd"];
    this._addOptions(tour, data.options);
    tour.steps = new Array();
    for (var i = 0; i < data.steps.length; i++) {
      var step = new Object();
      if (data.steps[i].target == 'SKIP') {
        continue;
      }
      var targetArray = this._findTarget(data.steps[i].target, window);
      step.target = data.steps[i].target;
      if (targetArray != null) {
        step.targetFrame = targetArray[1];
      } else {
        step.targetFrame = null;
      }
      step.placement = data.steps[i].placement;
      step.content = data.steps[i].content;
      step.window = data.steps[i].window;
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
      if (tour.steps[i].implicit) {
        tour.steps[i].showNextButton = false;
      }
      if (tour.steps[i].action) {
        tour.steps[i].showNextButton = false;
        tour.steps[i].multipage = true;
        if (tour.steps[i + 1] !== undefined && tour.steps[i].targetFrame === tour.steps[i + 1].targetFrame) {
          tour.steps[i].multipage = false;
        }
      }
      if (tour.steps[i].link !== '') {
        tour.steps[i].multipage = true;
        tour.steps[i].onNext.push(["followLink", tour.steps[i].link]);
      }
      if (tour.steps[i + 1] !== undefined && (tour.steps[i].window == tour.steps[i + 1].window &&
          tour.steps[i].targetFrame !== tour.steps[i + 1].targetFrame &&
          tour.steps[i + 1].targetFrame !== null)) {
        tour.steps[i].multipage = true;
        if (tour.steps[i].onNext.length == 0) {
          tour.steps[i].onNext.push(["switchFrame", tour.sys_id, i + 1]);
        }
      }
      if (tour.steps[i].onNext.length == 0 && !tour.steps[i].multipage) {
        tour.steps[i].onNext.push(["checkActions"]);
      }
      tour.steps[i].onShow = ["scrollToView"];
      this._addOptions(tour.steps[i], tour.steps[i].options);
    }
    this.log(JSON.stringify(tour));
    return tour;
  }
  this._addOptions = function(tour, options) {
    if (options !== '') {
      var optionsObj = JSON.parse(options);
      for (var key in optionsObj) {
        if (optionsObj.hasOwnProperty(key)) {
          tour[key] = optionsObj[key];
        }
      }
    }
  }
  this._translateElementTargets = function(data) {
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
  }
  this._loadHopscotch = function(page, data, step) {
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      this._loadHopscotch(inlineFrames[i].contentWindow, data, step);
    }
    var self = this;
    if (page.hopscotch === undefined) {
      this._loadCSSInFrame(page, "/styles/hopscotch.min.css");
      this._loadCSSInFrame(page, "/styles/hopscotch.glide.css");
      this._loadCSSInFrame(page, "/styles/app.guided_tours/guided_tours.css");
      if (page.ScriptLoader !== undefined) {
        page.ScriptLoader.getScripts(["/scripts/hopscotch.min.js"], function() {
          if (self._isHopscotchLoaded(window)) {
            self._launchTour(data, step);
          }
        });
      }
    }
  }
  this._isHopscotchLoaded = function(page) {
    var result = true;
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      result = result && this._isHopscotchLoaded(inlineFrames[i].contentWindow);
    }
    if (page.hopscotch === undefined) {
      return false;
    }
    return result;
  }
  this._launchTour = function(data, step) {
    this._addScrollHandler(window);
    this._endAllTours(window, false);
    this._registerPageHelpers(window);
    var tour = this._createTour(this._translateElementTargets(data));
    this._launchTourAttempt(tour, step, true);
  }
  this._launchTourAttempt = function(tour, step, isFirstAttempt) {
    this.log("Attempting to start tour " + tour.id + " at step " + step);
    currentTour = tour;
    var runTour = true;
    if (tour.steps[step].targetFrame == null) {
      this.log("Error: target was null.  Did not find target " + tour.steps[step].target);
      runTour = false;
    }
    var pagePattern = new RegExp(tour.steps[step].window);
    if (!(tour.steps[step].window == '' || this._isOnPage(window, pagePattern))) {
      this.log("Error: Current window " + tour.steps[step].window + " does not match tour step");
      runTour = false;
    }
    if (runTour) {
      if (tour.steps[step].action) {
        this._addActionEvent(tour.steps[step].actionTarget, tour.steps[step].actionEvent);
      }
      isImplicit = tour.steps[step].implicit;
      this._getHopscotch(window, tour.steps[step].targetFrame).startTour(tour, step);
    } else {
      if (step + 1 < tour.steps.length && isFirstAttempt) {
        this._launchTourAttempt(tour, step + 1, false);
      } else {
        this._throwError(tourErrorMessage);
      }
    }
  }
  this.registerHelpers = function(hopscotchObj, page) {
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
    });
    hopscotchObj.registerHelper('broadcastEnd', function() {
      CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
    });
    hopscotchObj.registerHelper('checkActions', function() {
      var step = hopscotchObj.getCurrStepNum();
      if (currentTour != null && currentTour.steps[step].action) {
        self.log("Adding action in checkAction handler");
        self._addActionEvent(currentTour.steps[step].actionTarget, currentTour.steps[step].actionEvent);
      }
      isImplicit = currentTour.steps[step].implicit;
    });
    hopscotchObj.registerHelper('scrollToView', function() {
      var step = hopscotchObj.getCurrStepNum();
      page.jQuery(currentTour.steps[step].target).get(0).scrollIntoView(false);
    });
    hopscotchObj.setRenderer(GuidedToursCallout.template);
  }
  this._loadCSSInFrame = function(frame, filename) {
    var fileref = document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", filename);
    frame.document.head.appendChild(fileref);
  }
  this._addActionEvent = function(cssSelector, eventType) {
    var self = this;
    var targetArray = this._findTarget(cssSelector, window);
    if (targetArray != null && targetArray.length) {
      this.log("Adding " + eventType + " for " + cssSelector + " in " + targetArray[1]);
      targetArray[0].off(eventType + ".guided_tours");
      targetArray[0].one(eventType + ".guided_tours", function() {
        self.log("Firing next event from action");
        self._getHopscotch(window, targetArray[1]).nextStep();
      });
    } else {
      this.log("Could not find action target " + cssSelector);
      this._throwError(tourErrorMessage);
    }
  }
  this._findTarget = function(cssSelector, page) {
    if (page.jQuery == undefined) {
      return null;
    }
    var target = page.jQuery(cssSelector);
    if (target.length != 0) {
      return [target, page.name];
    }
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      target = this._findTarget(cssSelector, inlineFrames[i].contentWindow);
      if (target != null) {
        return target;
      }
    }
    return null;
  }
  this._endAllTours = function(page, doCallbacks) {
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
  }
  this._registerPageHelpers = function(page) {
    if (page.name !== '' && page.hopscotch !== undefined) {
      this.registerHelpers(page.hopscotch, page);
    }
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      this._registerPageHelpers(inlineFrames[i].contentWindow);
    }
  }
  this._getHopscotch = function(page, name) {
    if (page.name == name) {
      return page.hopscotch;
    }
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      var result = this._getHopscotch(inlineFrames[i].contentWindow, name);
      if (result != null) {
        return result;
      }
    }
    return null;
  }
  this._isOnPage = function(page, re) {
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
  }
  this._findInlineFrameElements = function(page) {
    var inlineFrames = page.document.getElementsByTagName('iframe');
    var frameArray = [];
    for (var i = 0; i < inlineFrames.length; i++) {
      if (MAIN_IFRAMES.indexOf(inlineFrames[i].getAttribute('name')) !== -1) {
        frameArray.push(inlineFrames[i]);
      }
    }
    return frameArray;
  }
  this.isImplicitNext = function() {
    return isImplicit;
  }
  this._throwError = function(msg) {
    snNotification.show("error", msg);
    CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
  }
  this.hasRelatedLists = function(page) {
    if (page.NOW !== undefined && page.NOW.g_relatedLists !== undefined) {
      return true;
    }
    var inlineFrames = this._findInlineFrameElements(page);
    for (var i = 0; i < inlineFrames.length; i++) {
      var result = this.hasRelatedLists(inlineFrames[i].contentWindow);
      if (result) {
        return result;
      }
    }
    return false;
  }
  this.setLogging = function(enable) {
    enableLogging = enable;
  }
  this.log = function(msg) {
    if (enableLogging) {
      jslog("Guided Tours: " + msg);
    }
  }
  this._addScrollHandler = function(page) {
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
  }
}]);;
/*! RESOURCE: /scripts/app.guided_tours/controller.guidedTours.js */
angular.module('sn.guided_tours').controller('guidedTours', function(guidedToursService, $http) {
  _startTour = function() {
    var re = /tour_(\w+):(\d+)/;
    var state = re.exec(hopscotch.getState());
    var step = Number(state[2]);
    if (guidedToursService.isImplicitNext()) {
      step++;
    }
    guidedToursService.startTour(state[1], step);
  };
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_START, function(args) {
    if (Array.isArray(args)) {
      guidedToursService.log("observing hopscotch: " + args[0] + " " + args[1]);
      guidedToursService.startTour(args[0], Number(args[1]));
    } else {
      guidedToursService.startTour(args, 0);
    }
  });
  CustomEvent.observe(EmbeddedHelpEvents.HOPSCOTCH_TOUR_END, function() {
    guidedToursService.endTour();
  });
  CustomEvent.observe("page_loaded_fully", function(args) {
    guidedToursService.log("page_loaded_fully event: hopscotch state is: " + hopscotch.getState());
    if (hopscotch.getState() !== null && !guidedToursService.hasRelatedLists(window)) {
      _startTour();
    }
  });
  CustomEvent.observe("related_lists.ready", function(args) {
    guidedToursService.log("related_lists.ready event: hopscotch state is: " + hopscotch.getState());
    if (hopscotch.getState() !== null && guidedToursService.hasRelatedLists(window)) {
      _startTour();
    }
  });
  guidedToursService.registerHelpers(hopscotch, window);
});;;