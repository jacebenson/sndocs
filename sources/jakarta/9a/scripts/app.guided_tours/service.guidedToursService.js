/*! RESOURCE: /scripts/app.guided_tours/service.guidedToursService.js */
if (typeof top.NOW.guidedToursService == 'undefined') {
  (function() {
    var GuidedToursService = {
      tourErrorMessage: "Tour ended because the next step was not found.",
      currentTour: null,
      currentSysId: null,
      currentStep: 0,
      isImplicit: false,
      enableLogging: false,
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
        sessionStorage.removeItem('guided_tour:tour.state');
        sessionStorage.removeItem('guided_tour:tour.implicit');
        this.currentTour = null;
        this.currentSysId = null
        this.currentStep = 0;
        this.isImplicit = false;
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
        tour.onClose = ["broadcastEnd"];
        tour.onEnd = ["broadcastEnd"];
        this._addOptions(tour, data.options);
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
            this._throwError(this.tourErrorMessage);
          }
        } else {
          var viewURL = this._getViewURL(tour, step);
          if (viewURL.length != 0) {
            sessionStorage.setItem('guided_tour:tour.state', tour.id + ":" + step);
            viewURL[0].location.href = viewURL[1];
            return;
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
        this._startHopscotch(tour, step);
      },
      _startHopscotch: function(tour, step) {
        if (tour.steps[step].action) {
          this._addActionEvent(tour.steps[step].actionTarget, tour.steps[step].actionEvent, tour.steps[step].implicit);
        }
        this.isImplicit = tour.steps[step].implicit;
        sessionStorage.setItem('guided_tour:tour.implicit', this.isImplicit);
        this._getTargetWindow(window, tour.steps[step].target).hopscotch.startTour(tour, step);
        sessionStorage.setItem('guided_tour:tour.state', this._getTargetWindow(window, tour.steps[step].target).hopscotch.getState());
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
          CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
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
          return true;
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
        if (top.angular != undefined) {
          try {
            var notification = top.angular.element(document.body).injector().get('snNotification');
            notification.show('error', msg);
          } catch (err) {
            this.log('Could not find snNotification: ' + msg);
          }
        } else if (top.g_GlideUI != undefined) {
          top.g_GlideUI.addOutputMessage({
            'msg': msg,
            'type': 'error'
          });
        } else {
          this.log('Error: ' + msg);
        }
        CustomEvent.fireTop(EmbeddedHelpEvents.TOUR_END);
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
    top.NOW.guidedToursService = GuidedToursService;
  })();
};