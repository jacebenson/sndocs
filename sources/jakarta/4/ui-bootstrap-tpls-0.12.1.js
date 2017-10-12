/*! RESOURCE: /scripts/angularjs-1.4/thirdparty/angular-ui-bootstrap/ui-bootstrap-tpls-0.12.1.js */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.transition", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.bindHtml", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.dropdown", "ui.bootstrap.modal", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["template/accordion/accordion-group.html", "template/accordion/accordion.html", "template/alert/alert.html", "template/carousel/carousel.html", "template/carousel/slide.html", "template/datepicker/datepicker.html", "template/datepicker/day.html", "template/datepicker/month.html", "template/datepicker/popup.html", "template/datepicker/year.html", "template/modal/backdrop.html", "template/modal/window.html", "template/pagination/pager.html", "template/pagination/pagination.html", "template/tooltip/tooltip-html-unsafe-popup.html", "template/tooltip/tooltip-popup.html", "template/popover/popover.html", "template/progressbar/bar.html", "template/progressbar/progress.html", "template/progressbar/progressbar.html", "template/rating/rating.html", "template/tabs/tab.html", "template/tabs/tabset.html", "template/timepicker/timepicker.html", "template/typeahead/typeahead-match.html", "template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.transition', [])
  .factory('$transition', ['$q', '$timeout', '$rootScope', function($q, $timeout, $rootScope) {
    var $transition = function(element, trigger, options) {
      options = options || {};
      var deferred = $q.defer();
      var endEventName = $transition[options.animation ? 'animationEndEventName' : 'transitionEndEventName'];
      var transitionEndHandler = function(event) {
        $rootScope.$apply(function() {
          element.unbind(endEventName, transitionEndHandler);
          deferred.resolve(element);
        });
      };
      if (endEventName) {
        element.bind(endEventName, transitionEndHandler);
      }
      $timeout(function() {
        if (angular.isString(trigger)) {
          element.addClass(trigger);
        } else if (angular.isFunction(trigger)) {
          trigger(element);
        } else if (angular.isObject(trigger)) {
          element.css(trigger);
        }
        if (!endEventName) {
          deferred.resolve(element);
        }
      });
      deferred.promise.cancel = function() {
        if (endEventName) {
          element.unbind(endEventName, transitionEndHandler);
        }
        deferred.reject('Transition cancelled');
      };
      return deferred.promise;
    };
    var transElement = document.createElement('trans');
    var transitionEndEventNames = {
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'oTransitionEnd',
      'transition': 'transitionend'
    };
    var animationEndEventNames = {
      'WebkitTransition': 'webkitAnimationEnd',
      'MozTransition': 'animationend',
      'OTransition': 'oAnimationEnd',
      'transition': 'animationend'
    };

    function findEndEventName(endEventNames) {
      for (var name in endEventNames) {
        if (transElement.style[name] !== undefined) {
          return endEventNames[name];
        }
      }
    }
    $transition.transitionEndEventName = findEndEventName(transitionEndEventNames);
    $transition.animationEndEventName = findEndEventName(animationEndEventNames);
    return $transition;
  }]);
angular.module('ui.bootstrap.collapse', ['ui.bootstrap.transition'])
  .directive('collapse', ['$transition', function($transition) {
    return {
      link: function(scope, element, attrs) {
        var initialAnimSkip = true;
        var currentTransition;

        function doTransition(change) {
          var newTransition = $transition(element, change);
          if (currentTransition) {
            currentTransition.cancel();
          }
          currentTransition = newTransition;
          newTransition.then(newTransitionDone, newTransitionDone);
          return newTransition;

          function newTransitionDone() {
            if (currentTransition === newTransition) {
              currentTransition = undefined;
            }
          }
        }

        function expand() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            expandDone();
          } else {
            element.removeClass('collapse').addClass('collapsing');
            doTransition({
              height: element[0].scrollHeight + 'px'
            }).then(expandDone);
          }
        }

        function expandDone() {
          element.removeClass('collapsing');
          element.addClass('collapse in');
          element.css({
            height: 'auto'
          });
        }

        function collapse() {
          if (initialAnimSkip) {
            initialAnimSkip = false;
            collapseDone();
            element.css({
              height: 0
            });
          } else {
            element.css({
              height: element[0].scrollHeight + 'px'
            });
            var x = element[0].offsetWidth;
            element.removeClass('collapse in').addClass('collapsing');
            doTransition({
              height: 0
            }).then(collapseDone);
          }
        }

        function collapseDone() {
          element.removeClass('collapsing');
          element.addClass('collapse');
        }
        scope.$watch(attrs.collapse, function(shouldCollapse) {
          if (shouldCollapse) {
            collapse();
          } else {
            expand();
          }
        });
      }
    };
  }]);
angular.module('ui.bootstrap.accordion', ['ui.bootstrap.collapse'])
  .constant('accordionConfig', {
    closeOthers: true
  })
  .controller('AccordionController', ['$scope', '$attrs', 'accordionConfig', function($scope, $attrs, accordionConfig) {
    this.groups = [];
    this.closeOthers = function(openGroup) {
      var closeOthers = angular.isDefined($attrs.closeOthers) ? $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
      if (closeOthers) {
        angular.forEach(this.groups, function(group) {
          if (group !== openGroup) {
            group.isOpen = false;
          }
        });
      }
    };
    this.addGroup = function(groupScope) {
      var that = this;
      this.groups.push(groupScope);
      groupScope.$on('$destroy', function(event) {
        that.removeGroup(groupScope);
      });
    };
    this.removeGroup = function(group) {
      var index = this.groups.indexOf(group);
      if (index !== -1) {
        this.groups.splice(index, 1);
      }
    };
  }])
  .directive('accordion', function() {
    return {
      restrict: 'EA',
      controller: 'AccordionController',
      transclude: true,
      replace: false,
      templateUrl: 'template/accordion/accordion.html'
    };
  })
  .directive('accordionGroup', function() {
    return {
      require: '^accordion',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/accordion/accordion-group.html',
      scope: {
        heading: '@',
        isOpen: '=?',
        isDisabled: '=?'
      },
      controller: function() {
        this.setHeading = function(element) {
          this.heading = element;
        };
      },
      link: function(scope, element, attrs, accordionCtrl) {
        accordionCtrl.addGroup(scope);
        scope.$watch('isOpen', function(value) {
          if (value) {
            accordionCtrl.closeOthers(scope);
          }
        });
        scope.toggleOpen = function() {
          if (!scope.isDisabled) {
            scope.isOpen = !scope.isOpen;
          }
        };
      }
    };
  })
  .directive('accordionHeading', function() {
    return {
      restrict: 'EA',
      transclude: true,
      template: '',
      replace: true,
      require: '^accordionGroup',
      link: function(scope, element, attr, accordionGroupCtrl, transclude) {
        accordionGroupCtrl.setHeading(transclude(scope, function() {}));
      }
    };
  })
  .directive('accordionTransclude', function() {
    return {
      require: '^accordionGroup',
      link: function(scope, element, attr, controller) {
        scope.$watch(function() {
          return controller[attr.accordionTransclude];
        }, function(heading) {
          if (heading) {
            element.html('');
            element.append(heading);
          }
        });
      }
    };
  });
angular.module('ui.bootstrap.alert', [])
  .controller('AlertController', ['$scope', '$attrs', function($scope, $attrs) {
    $scope.closeable = 'close' in $attrs;
    this.close = $scope.close;
  }])
  .directive('alert', function() {
    return {
      restrict: 'EA',
      controller: 'AlertController',
      templateUrl: 'template/alert/alert.html',
      transclude: true,
      replace: true,
      scope: {
        type: '@',
        close: '&'
      }
    };
  })
  .directive('dismissOnTimeout', ['$timeout', function($timeout) {
    return {
      require: 'alert',
      link: function(scope, element, attrs, alertCtrl) {
        $timeout(function() {
          alertCtrl.close();
        }, parseInt(attrs.dismissOnTimeout, 10));
      }
    };
  }]);
angular.module('ui.bootstrap.bindHtml', [])
  .directive('bindHtmlUnsafe', function() {
    return function(scope, element, attr) {
      element.addClass('ng-binding').data('$binding', attr.bindHtmlUnsafe);
      scope.$watch(attr.bindHtmlUnsafe, function bindHtmlUnsafeWatchAction(value) {
        element.html(value || '');
      });
    };
  });
angular.module('ui.bootstrap.buttons', [])
  .constant('buttonConfig', {
    activeClass: 'active',
    toggleEvent: 'click'
  })
  .controller('ButtonsController', ['buttonConfig', function(buttonConfig) {
    this.activeClass = buttonConfig.activeClass || 'active';
    this.toggleEvent = buttonConfig.toggleEvent || 'click';
  }])
  .directive('btnRadio', function() {
    return {
      require: ['btnRadio', 'ngModel'],
      controller: 'ButtonsController',
      link: function(scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        ngModelCtrl.$render = function() {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.btnRadio)));
        };
        element.bind(buttonsCtrl.toggleEvent, function() {
          var isActive = element.hasClass(buttonsCtrl.activeClass);
          if (!isActive || angular.isDefined(attrs.uncheckable)) {
            scope.$apply(function() {
              ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.btnRadio));
              ngModelCtrl.$render();
            });
          }
        });
      }
    };
  })
  .directive('btnCheckbox', function() {
    return {
      require: ['btnCheckbox', 'ngModel'],
      controller: 'ButtonsController',
      link: function(scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];

        function getTrueValue() {
          return getCheckboxValue(attrs.btnCheckboxTrue, true);
        }

        function getFalseValue() {
          return getCheckboxValue(attrs.btnCheckboxFalse, false);
        }

        function getCheckboxValue(attributeValue, defaultValue) {
          var val = scope.$eval(attributeValue);
          return angular.isDefined(val) ? val : defaultValue;
        }
        ngModelCtrl.$render = function() {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
        };
        element.bind(buttonsCtrl.toggleEvent, function() {
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
            ngModelCtrl.$render();
          });
        });
      }
    };
  });
angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
  .controller('CarouselController', ['$scope', '$timeout', '$interval', '$transition', function($scope, $timeout, $interval, $transition) {
    var self = this,
      slides = self.slides = $scope.slides = [],
      currentIndex = -1,
      currentInterval, isPlaying;
    self.currentSlide = null;
    var destroyed = false;
    self.select = $scope.select = function(nextSlide, direction) {
      var nextIndex = slides.indexOf(nextSlide);
      if (direction === undefined) {
        direction = nextIndex > currentIndex ? 'next' : 'prev';
      }
      if (nextSlide && nextSlide !== self.currentSlide) {
        if ($scope.$currentTransition) {
          $scope.$currentTransition.cancel();
          $timeout(goNext);
        } else {
          goNext();
        }
      }

      function goNext() {
        if (destroyed) {
          return;
        }
        if (self.currentSlide && angular.isString(direction) && !$scope.noTransition && nextSlide.$element) {
          nextSlide.$element.addClass(direction);
          var reflow = nextSlide.$element[0].offsetWidth;
          angular.forEach(slides, function(slide) {
            angular.extend(slide, {
              direction: '',
              entering: false,
              leaving: false,
              active: false
            });
          });
          angular.extend(nextSlide, {
            direction: direction,
            active: true,
            entering: true
          });
          angular.extend(self.currentSlide || {}, {
            direction: direction,
            leaving: true
          });
          $scope.$currentTransition = $transition(nextSlide.$element, {});
          (function(next, current) {
            $scope.$currentTransition.then(
              function() {
                transitionDone(next, current);
              },
              function() {
                transitionDone(next, current);
              }
            );
          }(nextSlide, self.currentSlide));
        } else {
          transitionDone(nextSlide, self.currentSlide);
        }
        self.currentSlide = nextSlide;
        currentIndex = nextIndex;
        restartTimer();
      }

      function transitionDone(next, current) {
        angular.extend(next, {
          direction: '',
          active: true,
          leaving: false,
          entering: false
        });
        angular.extend(current || {}, {
          direction: '',
          active: false,
          leaving: false,
          entering: false
        });
        $scope.$currentTransition = null;
      }
    };
    $scope.$on('$destroy', function() {
      destroyed = true;
    });
    self.indexOfSlide = function(slide) {
      return slides.indexOf(slide);
    };
    $scope.next = function() {
      var newIndex = (currentIndex + 1) % slides.length;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'next');
      }
    };
    $scope.prev = function() {
      var newIndex = currentIndex - 1 < 0 ? slides.length - 1 : currentIndex - 1;
      if (!$scope.$currentTransition) {
        return self.select(slides[newIndex], 'prev');
      }
    };
    $scope.isActive = function(slide) {
      return self.currentSlide === slide;
    };
    $scope.$watch('interval', restartTimer);
    $scope.$on('$destroy', resetTimer);

    function restartTimer() {
      resetTimer();
      var interval = +$scope.interval;
      if (!isNaN(interval) && interval > 0) {
        currentInterval = $interval(timerFn, interval);
      }
    }

    function resetTimer() {
      if (currentInterval) {
        $interval.cancel(currentInterval);
        currentInterval = null;
      }
    }

    function timerFn() {
      var interval = +$scope.interval;
      if (isPlaying && !isNaN(interval) && interval > 0) {
        $scope.next();
      } else {
        $scope.pause();
      }
    }
    $scope.play = function() {
      if (!isPlaying) {
        isPlaying = true;
        restartTimer();
      }
    };
    $scope.pause = function() {
      if (!$scope.noPause) {
        isPlaying = false;
        resetTimer();
      }
    };
    self.addSlide = function(slide, element) {
      slide.$element = element;
      slides.push(slide);
      if (slides.length === 1 || slide.active) {
        self.select(slides[slides.length - 1]);
        if (slides.length == 1) {
          $scope.play();
        }
      } else {
        slide.active = false;
      }
    };
    self.removeSlide = function(slide) {
      var index = slides.indexOf(slide);
      slides.splice(index, 1);
      if (slides.length > 0 && slide.active) {
        if (index >= slides.length) {
          self.select(slides[index - 1]);
        } else {
          self.select(slides[index]);
        }
      } else if (currentIndex > index) {
        currentIndex--;
      }
    };
  }])
  .directive('carousel', [function() {
    return {
      restrict: 'EA',
      transclude: true,
      replace: true,
      controller: 'CarouselController',
      require: 'carousel',
      templateUrl: 'template/carousel/carousel.html',
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '='
      }
    };
  }])
  .directive('slide', function() {
    return {
      require: '^carousel',
      restrict: 'EA',
      transclude: true,
      replace: true,
      templateUrl: 'template/carousel/slide.html',
      scope: {
        active: '=?'
      },
      link: function(scope, element, attrs, carouselCtrl) {
        carouselCtrl.addSlide(scope, element);
        scope.$on('$destroy', function() {
          carouselCtrl.removeSlide(scope);
        });
        scope.$watch('active', function(active) {
          if (active) {
            carouselCtrl.select(scope);
          }
        });
      }
    };
  });
angular.module('ui.bootstrap.dateparser', [])
  .service('dateParser', ['$locale', 'orderByFilter', function($locale, orderByFilter) {
    this.parsers = {};
    var formatCodeToRegex = {
      'yyyy': {
        regex: '\\d{4}',
        apply: function(value) {
          this.year = +value;
        }
      },
      'yy': {
        regex: '\\d{2}',
        apply: function(value) {
          this.year = +value + 2000;
        }
      },
      'y': {
        regex: '\\d{1,4}',
        apply: function(value) {
          this.year = +value;
        }
      },
      'MMMM': {
        regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
        apply: function(value) {
          this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value);
        }
      },
      'MMM': {
        regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
        apply: function(value) {
          this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value);
        }
      },
      'MM': {
        regex: '0[1-9]|1[0-2]',
        apply: function(value) {
          this.month = value - 1;
        }
      },
      'M': {
        regex: '[1-9]|1[0-2]',
        apply: function(value) {
          this.month = value - 1;
        }
      },
      'dd': {
        regex: '[0-2][0-9]{1}|3[0-1]{1}',
        apply: function(value) {
          this.date = +value;
        }
      },
      'd': {
        regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
        apply: function(value) {
          this.date = +value;
        }
      },
      'EEEE': {
        regex: $locale.DATETIME_FORMATS.DAY.join('|')
      },
      'EEE': {
        regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|')
      }
    };

    function createParser(format) {
      var map = [],
        regex = format.split('');
      angular.forEach(formatCodeToRegex, function(data, code) {
        var index = format.indexOf(code);
        if (index > -1) {
          format = format.split('');
          regex[index] = '(' + data.regex + ')';
          format[index] = '$';
          for (var i = index + 1, n = index + code.length; i < n; i++) {
            regex[i] = '';
            format[i] = '$';
          }
          format = format.join('');
          map.push({
            index: index,
            apply: data.apply
          });
        }
      });
      return {
        regex: new RegExp('^' + regex.join('') + '$'),
        map: orderByFilter(map, 'index')
      };
    }
    this.parse = function(input, format) {
      if (!angular.isString(input) || !format) {
        return input;
      }
      format = $locale.DATETIME_FORMATS[format] || format;
      if (!this.parsers[format]) {
        this.parsers[format] = createParser(format);
      }
      var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex);
      if (results && results.length) {
        var fields = {
            year: 1900,
            month: 0,
            date: 1,
            hours: 0
          },
          dt;
        for (var i = 1, n = results.length; i < n; i++) {
          var mapper = map[i - 1];
          if (mapper.apply) {
            mapper.apply.call(fields, results[i]);
          }
        }
        if (isValid(fields.year, fields.month, fields.date)) {
          dt = new Date(fields.year, fields.month, fields.date, fields.hours);
        }
        return dt;
      }
    };

    function isValid(year, month, date) {
      if (month === 1 && date > 28) {
        return date === 29 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
      }
      if (month === 3 || month === 5 || month === 8 || month === 10) {
        return date < 31;
      }
      return true;
    }
  }]);
angular.module('ui.bootstrap.position', [])
  .factory('$position', ['$document', '$window', function($document, $window) {
    function getStyle(el, cssprop) {
      if (el.currentStyle) {
        return el.currentStyle[cssprop];
      } else if ($window.getComputedStyle) {
        return $window.getComputedStyle(el)[cssprop];
      }
      return el.style[cssprop];
    }

    function isStaticPositioned(element) {
      return (getStyle(element, 'position') || 'static') === 'static';
    }
    var parentOffsetEl = function(element) {
      var docDomEl = $document[0];
      var offsetParent = element.offsetParent || docDomEl;
      while (offsetParent && offsetParent !== docDomEl && isStaticPositioned(offsetParent)) {
        offsetParent = offsetParent.offsetParent;
      }
      return offsetParent || docDomEl;
    };
    return {
      position: function(element) {
        var elBCR = this.offset(element);
        var offsetParentBCR = {
          top: 0,
          left: 0
        };
        var offsetParentEl = parentOffsetEl(element[0]);
        if (offsetParentEl != $document[0]) {
          offsetParentBCR = this.offset(angular.element(offsetParentEl));
          offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
          offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: elBCR.top - offsetParentBCR.top,
          left: elBCR.left - offsetParentBCR.left
        };
      },
      offset: function(element) {
        var boundingClientRect = element[0].getBoundingClientRect();
        return {
          width: boundingClientRect.width || element.prop('offsetWidth'),
          height: boundingClientRect.height || element.prop('offsetHeight'),
          top: boundingClientRect.top + ($window.pageYOffset || $document[0].documentElement.scrollTop),
          left: boundingClientRect.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft)
        };
      },
      positionElements: function(hostEl, targetEl, positionStr, appendToBody) {
        var positionStrParts = positionStr.split('-');
        var pos0 = positionStrParts[0],
          pos1 = positionStrParts[1] || 'center';
        var hostElPos,
          targetElWidth,
          targetElHeight,
          targetElPos;
        hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);
        targetElWidth = targetEl.prop('offsetWidth');
        targetElHeight = targetEl.prop('offsetHeight');
        var shiftWidth = {
          center: function() {
            return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
          },
          left: function() {
            return hostElPos.left;
          },
          right: function() {
            return hostElPos.left + hostElPos.width;
          }
        };
        var shiftHeight = {
          center: function() {
            return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
          },
          top: function() {
            return hostElPos.top;
          },
          bottom: function() {
            return hostElPos.top + hostElPos.height;
          }
        };
        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }
        return targetElPos;
      }
    };
  }]);
angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.position'])
  .constant('datepickerConfig', {
    formatDay: 'dd',
    formatMonth: 'MMMM',
    formatYear: 'yyyy',
    formatDayHeader: 'EEE',
    formatDayTitle: 'MMMM yyyy',
    formatMonthTitle: 'yyyy',
    datepickerMode: 'day',
    minMode: 'day',
    maxMode: 'year',
    showWeeks: true,
    startingDay: 0,
    yearRange: 20,
    minDate: null,
    maxDate: null
  })
  .controller('DatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$timeout', '$log', 'dateFilter', 'datepickerConfig', function($scope, $attrs, $parse, $interpolate, $timeout, $log, dateFilter, datepickerConfig) {
    var self = this,
      ngModelCtrl = {
        $setViewValue: angular.noop
      };
    this.modes = ['day', 'month', 'year'];
    angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle',
      'minMode', 'maxMode', 'showWeeks', 'startingDay', 'yearRange'
    ], function(key, index) {
      self[key] = angular.isDefined($attrs[key]) ? (index < 8 ? $interpolate($attrs[key])($scope.$parent) : $scope.$parent.$eval($attrs[key])) : datepickerConfig[key];
    });
    angular.forEach(['minDate', 'maxDate'], function(key) {
      if ($attrs[key]) {
        $scope.$parent.$watch($parse($attrs[key]), function(value) {
          self[key] = value ? new Date(value) : null;
          self.refreshView();
        });
      } else {
        self[key] = datepickerConfig[key] ? new Date(datepickerConfig[key]) : null;
      }
    });
    $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
    $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
    this.activeDate = angular.isDefined($attrs.initDate) ? $scope.$parent.$eval($attrs.initDate) : new Date();
    $scope.isActive = function(dateObject) {
      if (self.compare(dateObject.date, self.activeDate) === 0) {
        $scope.activeDateId = dateObject.uid;
        return true;
      }
      return false;
    };
    this.init = function(ngModelCtrl_) {
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = function() {
        self.render();
      };
    };
    this.render = function() {
      if (ngModelCtrl.$modelValue) {
        var date = new Date(ngModelCtrl.$modelValue),
          isValid = !isNaN(date);
        if (isValid) {
          this.activeDate = date;
        } else {
          $log.error('Datepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
        }
        ngModelCtrl.$setValidity('date', isValid);
      }
      this.refreshView();
    };
    this.refreshView = function() {
      if (this.element) {
        this._refreshView();
        var date = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
        ngModelCtrl.$setValidity('date-disabled', !date || (this.element && !this.isDisabled(date)));
      }
    };
    this.createDateObject = function(date, format) {
      var model = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : null;
      return {
        date: date,
        label: dateFilter(date, format),
        selected: model && this.compare(date, model) === 0,
        disabled: this.isDisabled(date),
        current: this.compare(date, new Date()) === 0
      };
    };
    this.isDisabled = function(date) {
      return ((this.minDate && this.compare(date, this.minDate) < 0) || (this.maxDate && this.compare(date, this.maxDate) > 0) || ($attrs.dateDisabled && $scope.dateDisabled({
        date: date,
        mode: $scope.datepickerMode
      })));
    };
    this.split = function(arr, size) {
      var arrays = [];
      while (arr.length > 0) {
        arrays.push(arr.splice(0, size));
      }
      return arrays;
    };
    $scope.select = function(date) {
      if ($scope.datepickerMode === self.minMode) {
        var dt = ngModelCtrl.$modelValue ? new Date(ngModelCtrl.$modelValue) : new Date(0, 0, 0, 0, 0, 0, 0);
        dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        ngModelCtrl.$setViewValue(dt);
        ngModelCtrl.$render();
      } else {
        self.activeDate = date;
        $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) - 1];
      }
    };
    $scope.move = function(direction) {
      var year = self.activeDate.getFullYear() + direction * (self.step.years || 0),
        month = self.activeDate.getMonth() + direction * (self.step.months || 0);
      self.activeDate.setFullYear(year, month, 1);
      self.refreshView();
    };
    $scope.toggleMode = function(direction) {
      direction = direction || 1;
      if (($scope.datepickerMode === self.maxMode && direction === 1) || ($scope.datepickerMode === self.minMode && direction === -1)) {
        return;
      }
      $scope.datepickerMode = self.modes[self.modes.indexOf($scope.datepickerMode) + direction];
    };
    $scope.keys = {
      13: 'enter',
      32: 'space',
      33: 'pageup',
      34: 'pagedown',
      35: 'end',
      36: 'home',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };
    var focusElement = function() {
      $timeout(function() {
        self.element[0].focus();
      }, 0, false);
    };
    $scope.$on('datepicker.focus', focusElement);
    $scope.keydown = function(evt) {
      var key = $scope.keys[evt.which];
      if (!key || evt.shiftKey || evt.altKey) {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation();
      if (key === 'enter' || key === 'space') {
        if (self.isDisabled(self.activeDate)) {
          return;
        }
        $scope.select(self.activeDate);
        focusElement();
      } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
        $scope.toggleMode(key === 'up' ? 1 : -1);
        focusElement();
      } else {
        self.handleKeyDown(key, evt);
        self.refreshView();
      }
    };
  }])
  .directive('datepicker', function() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/datepicker.html',
      scope: {
        datepickerMode: '=?',
        dateDisabled: '&'
      },
      require: ['datepicker', '?^ngModel'],
      controller: 'DatepickerController',
      link: function(scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          datepickerCtrl.init(ngModelCtrl);
        }
      }
    };
  })
  .directive('daypicker', ['dateFilter', function(dateFilter) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/day.html',
      require: '^datepicker',
      link: function(scope, element, attrs, ctrl) {
        scope.showWeeks = ctrl.showWeeks;
        ctrl.step = {
          months: 1
        };
        ctrl.element = element;
        var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        function getDaysInMonth(year, month) {
          return ((month === 1) && (year % 4 === 0) && ((year % 100 !== 0) || (year % 400 === 0))) ? 29 : DAYS_IN_MONTH[month];
        }

        function getDates(startDate, n) {
          var dates = new Array(n),
            current = new Date(startDate),
            i = 0;
          current.setHours(12);
          while (i < n) {
            dates[i++] = new Date(current);
            current.setDate(current.getDate() + 1);
          }
          return dates;
        }
        ctrl._refreshView = function() {
          var year = ctrl.activeDate.getFullYear(),
            month = ctrl.activeDate.getMonth(),
            firstDayOfMonth = new Date(year, month, 1),
            difference = ctrl.startingDay - firstDayOfMonth.getDay(),
            numDisplayedFromPreviousMonth = (difference > 0) ? 7 - difference : -difference,
            firstDate = new Date(firstDayOfMonth);
          if (numDisplayedFromPreviousMonth > 0) {
            firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
          }
          var days = getDates(firstDate, 42);
          for (var i = 0; i < 42; i++) {
            days[i] = angular.extend(ctrl.createDateObject(days[i], ctrl.formatDay), {
              secondary: days[i].getMonth() !== month,
              uid: scope.uniqueId + '-' + i
            });
          }
          scope.labels = new Array(7);
          for (var j = 0; j < 7; j++) {
            scope.labels[j] = {
              abbr: dateFilter(days[j].date, ctrl.formatDayHeader),
              full: dateFilter(days[j].date, 'EEEE')
            };
          }
          scope.title = dateFilter(ctrl.activeDate, ctrl.formatDayTitle);
          scope.rows = ctrl.split(days, 7);
          if (scope.showWeeks) {
            scope.weekNumbers = [];
            var weekNumber = getISO8601WeekNumber(scope.rows[0][0].date),
              numWeeks = scope.rows.length;
            while (scope.weekNumbers.push(weekNumber++) < numWeeks) {}
          }
        };
        ctrl.compare = function(date1, date2) {
          return (new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
        };

        function getISO8601WeekNumber(date) {
          var checkDate = new Date(date);
          checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
          var time = checkDate.getTime();
          checkDate.setMonth(0);
          checkDate.setDate(1);
          return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
        }
        ctrl.handleKeyDown = function(key, evt) {
          var date = ctrl.activeDate.getDate();
          if (key === 'left') {
            date = date - 1;
          } else if (key === 'up') {
            date = date - 7;
          } else if (key === 'right') {
            date = date + 1;
          } else if (key === 'down') {
            date = date + 7;
          } else if (key === 'pageup' || key === 'pagedown') {
            var month = ctrl.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
            ctrl.activeDate.setMonth(month, 1);
            date = Math.min(getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth()), date);
          } else if (key === 'home') {
            date = 1;
          } else if (key === 'end') {
            date = getDaysInMonth(ctrl.activeDate.getFullYear(), ctrl.activeDate.getMonth());
          }
          ctrl.activeDate.setDate(date);
        };
        ctrl.refreshView();
      }
    };
  }])
  .directive('monthpicker', ['dateFilter', function(dateFilter) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/month.html',
      require: '^datepicker',
      link: function(scope, element, attrs, ctrl) {
        ctrl.step = {
          years: 1
        };
        ctrl.element = element;
        ctrl._refreshView = function() {
          var months = new Array(12),
            year = ctrl.activeDate.getFullYear();
          for (var i = 0; i < 12; i++) {
            months[i] = angular.extend(ctrl.createDateObject(new Date(year, i, 1), ctrl.formatMonth), {
              uid: scope.uniqueId + '-' + i
            });
          }
          scope.title = dateFilter(ctrl.activeDate, ctrl.formatMonthTitle);
          scope.rows = ctrl.split(months, 3);
        };
        ctrl.compare = function(date1, date2) {
          return new Date(date1.getFullYear(), date1.getMonth()) - new Date(date2.getFullYear(), date2.getMonth());
        };
        ctrl.handleKeyDown = function(key, evt) {
          var date = ctrl.activeDate.getMonth();
          if (key === 'left') {
            date = date - 1;
          } else if (key === 'up') {
            date = date - 3;
          } else if (key === 'right') {
            date = date + 1;
          } else if (key === 'down') {
            date = date + 3;
          } else if (key === 'pageup' || key === 'pagedown') {
            var year = ctrl.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
            ctrl.activeDate.setFullYear(year);
          } else if (key === 'home') {
            date = 0;
          } else if (key === 'end') {
            date = 11;
          }
          ctrl.activeDate.setMonth(date);
        };
        ctrl.refreshView();
      }
    };
  }])
  .directive('yearpicker', ['dateFilter', function(dateFilter) {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'template/datepicker/year.html',
      require: '^datepicker',
      link: function(scope, element, attrs, ctrl) {
        var range = ctrl.yearRange;
        ctrl.step = {
          years: range
        };
        ctrl.element = element;

        function getStartingYear(year) {
          return parseInt((year - 1) / range, 10) * range + 1;
        }
        ctrl._refreshView = function() {
          var years = new Array(range);
          for (var i = 0, start = getStartingYear(ctrl.activeDate.getFullYear()); i < range; i++) {
            years[i] = angular.extend(ctrl.createDateObject(new Date(start + i, 0, 1), ctrl.formatYear), {
              uid: scope.uniqueId + '-' + i
            });
          }
          scope.title = [years[0].label, years[range - 1].label].join(' - ');
          scope.rows = ctrl.split(years, 5);
        };
        ctrl.compare = function(date1, date2) {
          return date1.getFullYear() - date2.getFullYear();
        };
        ctrl.handleKeyDown = function(key, evt) {
          var date = ctrl.activeDate.getFullYear();
          if (key === 'left') {
            date = date - 1;
          } else if (key === 'up') {
            date = date - 5;
          } else if (key === 'right') {
            date = date + 1;
          } else if (key === 'down') {
            date = date + 5;
          } else if (key === 'pageup' || key === 'pagedown') {
            date += (key === 'pageup' ? -1 : 1) * ctrl.step.years;
          } else if (key === 'home') {
            date = getStartingYear(ctrl.activeDate.getFullYear());
          } else if (key === 'end') {
            date = getStartingYear(ctrl.activeDate.getFullYear()) + range - 1;
          }
          ctrl.activeDate.setFullYear(date);
        };
        ctrl.refreshView();
      }
    };
  }])
  .constant('datepickerPopupConfig', {
    datepickerPopup: 'yyyy-MM-dd',
    currentText: 'Today',
    clearText: 'Clear',
    closeText: 'Done',
    closeOnDateSelection: true,
    appendToBody: false,
    showButtonBar: true
  })
  .directive('datepickerPopup', ['$compile', '$parse', '$document', '$position', 'dateFilter', 'dateParser', 'datepickerPopupConfig',
      function($compile, $parse, $document, $position, dateFilter, dateParser, datepickerPopupConfig) {
        return {
          restrict: 'EA',
          require: 'ngModel',
          scope: {
            isOpen: '=?',
            currentText: '@',
            clearText: '@',
            closeText: '@',
            dateDisabled: '&'
          }