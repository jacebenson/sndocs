/*! RESOURCE: /scripts/app.guided_tours/service.guidedToursService.js */
angular.module('sn.guided_tours').service('guidedToursService', ['$http', 'i18n', 'snNotification', function($http, i18n, snNotification) {
        var MAIN_IFRAMES = ["gsft_main", "gsft_list_form_pane"];
        var tourErrorMessage = i18n.getMessage("Tour ended because the next step was not found.");
        var currentTour = null;
        var isImplicit = false;
        var enableLogging = false;
        var isIE = false || !!document.documentMode;
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
              this.log("Error: