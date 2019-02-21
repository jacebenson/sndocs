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
        tour.onStart = ["scrollToView"];
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
          tour.steps[i].onShow = ["setFocus"];
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
          var stepNumber = hopscotchObj.getCurrStepNum();
          var step = self.currentTour.steps[stepNumber];
          self._adjustScroll(step, page);
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
        inlineFrames = [].filter.call(inlineFrames, function(inlineFrame) {
          return inlineFrame.src.indexOf(page.location.origin) >= 0;
        });
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
      _adjustScroll: function(step, page) {
        var stepPlacement = step.placement;
        var el = page.jQuery(step.target).get(0);
        var scrollParent = getScrollParent(el);
        var elBounds = el.getBoundingClientRect();
        var scrollMargin = 200;
        var topMargin = 100;
        if (scrollParent && scrollParent.nodeName === 'BODY')
          return;
        var isElementinView = isElementInViewport(el);
        var scrollBottom = scrollParent.scrollHeight - scrollParent.scrollTop - scrollParent.clientHeight;
        if (stepPlacement != "top" && elBounds.top > 500) {
          el.scrollIntoView(true);
          if (el.getBoundingClientRect().top < topMargin)
            scrollParent.scrollTop = scrollParent.scrollTop - scrollMargin;
        } else if (!isElementinView) {
          if (stepPlacement == 'top') {
            el.scrollIntoView(false);
            scrollParent.scrollTop = scrollParent.scrollTop + scrollMargin;
          } else {
            el.scrollIntoView(true);
            if (el.getBoundingClientRect().top < topMargin)
              scrollParent.scrollTop = scrollParent.scrollTop - scrollMargin;
          }
        } else if (stepPlacement == 'top' && el.getBoundingClientRect().top < scrollMargin) {
          el.scrollIntoView(false);
          scrollParent.scrollTop = scrollParent.scrollTop + scrollMargin;
        }

        function getScrollParent(node) {
          var isElement = node && node.nodeType === 1;
          var overflowY = isElement && window.getComputedStyle(node).overflowY;
          var isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
          if (!node) {
            return null;
          } else if (isScrollable && node.scrollHeight >= node.clientHeight) {
            return node;
          }
          return getScrollParent(node.parentNode) || document.body;
        }

        function isElementInViewport(el) {
          var rect = el.getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= el.ownerDocument.documentElement.clientHeight &&
            rect.right <= el.ownerDocument.documentElement.clientWidth
          );
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