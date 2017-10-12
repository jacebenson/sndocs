/*! RESOURCE: /scripts/angularjs-1.4/thirdparty/angular-ui-bootstrap/ui-bootstrap-tpls-1.1.2.js */
angular.module("ui.bootstrap", ["ui.bootstrap.tpls", "ui.bootstrap.collapse", "ui.bootstrap.accordion", "ui.bootstrap.alert", "ui.bootstrap.buttons", "ui.bootstrap.carousel", "ui.bootstrap.dateparser", "ui.bootstrap.isClass", "ui.bootstrap.position", "ui.bootstrap.datepicker", "ui.bootstrap.debounce", "ui.bootstrap.dropdown", "ui.bootstrap.stackedMap", "ui.bootstrap.modal", "ui.bootstrap.paging", "ui.bootstrap.pager", "ui.bootstrap.pagination", "ui.bootstrap.tooltip", "ui.bootstrap.popover", "ui.bootstrap.progressbar", "ui.bootstrap.rating", "ui.bootstrap.tabs", "ui.bootstrap.timepicker", "ui.bootstrap.typeahead"]);
angular.module("ui.bootstrap.tpls", ["uib/template/accordion/accordion-group.html", "uib/template/accordion/accordion.html", "uib/template/alert/alert.html", "uib/template/carousel/carousel.html", "uib/template/carousel/slide.html", "uib/template/datepicker/datepicker.html", "uib/template/datepicker/day.html", "uib/template/datepicker/month.html", "uib/template/datepicker/popup.html", "uib/template/datepicker/year.html", "uib/template/modal/backdrop.html", "uib/template/modal/window.html", "uib/template/pager/pager.html", "uib/template/pagination/pagination.html", "uib/template/tooltip/tooltip-html-popup.html", "uib/template/tooltip/tooltip-popup.html", "uib/template/tooltip/tooltip-template-popup.html", "uib/template/popover/popover-html.html", "uib/template/popover/popover-template.html", "uib/template/popover/popover.html", "uib/template/progressbar/bar.html", "uib/template/progressbar/progress.html", "uib/template/progressbar/progressbar.html", "uib/template/rating/rating.html", "uib/template/tabs/tab.html", "uib/template/tabs/tabset.html", "uib/template/timepicker/timepicker.html", "uib/template/typeahead/typeahead-match.html", "uib/template/typeahead/typeahead-popup.html"]);
angular.module('ui.bootstrap.collapse', [])
  .directive('uibCollapse', ['$animate', '$q', '$parse', '$injector', function($animate, $q, $parse, $injector) {
    var $animateCss = $injector.has('$animateCss') ? $injector.get('$animateCss') : null;
    return {
      link: function(scope, element, attrs) {
        var expandingExpr = $parse(attrs.expanding),
          expandedExpr = $parse(attrs.expanded),
          collapsingExpr = $parse(attrs.collapsing),
          collapsedExpr = $parse(attrs.collapsed);
        if (!scope.$eval(attrs.uibCollapse)) {
          element.addClass('in')
            .addClass('collapse')
            .attr('aria-expanded', true)
            .attr('aria-hidden', false)
            .css({
              height: 'auto'
            });
        }

        function expand() {
          if (element.hasClass('collapse') && element.hasClass('in')) {
            return;
          }
          $q.resolve(expandingExpr(scope))
            .then(function() {
              element.removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', true)
                .attr('aria-hidden', false);
              if ($animateCss) {
                $animateCss(element, {
                  addClass: 'in',
                  easing: 'ease',
                  to: {
                    height: element[0].scrollHeight + 'px'
                  }
                }).start()['finally'](expandDone);
              } else {
                $animate.addClass(element, 'in', {
                  to: {
                    height: element[0].scrollHeight + 'px'
                  }
                }).then(expandDone);
              }
            });
        }

        function expandDone() {
          element.removeClass('collapsing')
            .addClass('collapse')
            .css({
              height: 'auto'
            });
          expandedExpr(scope);
        }

        function collapse() {
          if (!element.hasClass('collapse') && !element.hasClass('in')) {
            return collapseDone();
          }
          $q.resolve(collapsingExpr(scope))
            .then(function() {
              element
                .css({
                  height: element[0].scrollHeight + 'px'
                })
                .removeClass('collapse')
                .addClass('collapsing')
                .attr('aria-expanded', false)
                .attr('aria-hidden', true);
              if ($animateCss) {
                $animateCss(element, {
                  removeClass: 'in',
                  to: {
                    height: '0'
                  }
                }).start()['finally'](collapseDone);
              } else {
                $animate.removeClass(element, 'in', {
                  to: {
                    height: '0'
                  }
                }).then(collapseDone);
              }
            });
        }

        function collapseDone() {
          element.css({
            height: '0'
          });
          element.removeClass('collapsing')
            .addClass('collapse');
          collapsedExpr(scope);
        }
        scope.$watch(attrs.uibCollapse, function(shouldCollapse) {
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
  .constant('uibAccordionConfig', {
    closeOthers: true
  })
  .controller('UibAccordionController', ['$scope', '$attrs', 'uibAccordionConfig', function($scope, $attrs, accordionConfig) {
    this.groups = [];
    this.closeOthers = function(openGroup) {
      var closeOthers = angular.isDefined($attrs.closeOthers) ?
        $scope.$eval($attrs.closeOthers) : accordionConfig.closeOthers;
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
  .directive('uibAccordion', function() {
    return {
      controller: 'UibAccordionController',
      controllerAs: 'accordion',
      transclude: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/accordion/accordion.html';
      }
    };
  })
  .directive('uibAccordionGroup', function() {
    return {
      require: '^uibAccordion',
      transclude: true,
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/accordion/accordion-group.html';
      },
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
        scope.openClass = attrs.openClass || 'panel-open';
        scope.panelClass = attrs.panelClass || 'panel-default';
        scope.$watch('isOpen', function(value) {
          element.toggleClass(scope.openClass, !!value);
          if (value) {
            accordionCtrl.closeOthers(scope);
          }
        });
        scope.toggleOpen = function($event) {
          if (!scope.isDisabled) {
            if (!$event || $event.which === 32) {
              scope.isOpen = !scope.isOpen;
            }
          }
        };
        var id = 'accordiongroup-' + scope.$id + '-' + Math.floor(Math.random() * 10000);
        scope.headingId = id + '-tab';
        scope.panelId = id + '-panel';
      }
    };
  })
  .directive('uibAccordionHeading', function() {
    return {
      transclude: true,
      template: '',
      replace: true,
      require: '^uibAccordionGroup',
      link: function(scope, element, attrs, accordionGroupCtrl, transclude) {
        accordionGroupCtrl.setHeading(transclude(scope, angular.noop));
      }
    };
  })
  .directive('uibAccordionTransclude', function() {
    return {
      require: '^uibAccordionGroup',
      link: function(scope, element, attrs, controller) {
        scope.$watch(function() {
          return controller[attrs.uibAccordionTransclude];
        }, function(heading) {
          if (heading) {
            element.find('span').html('');
            element.find('span').append(heading);
          }
        });
      }
    };
  });
angular.module('ui.bootstrap.alert', [])
  .controller('UibAlertController', ['$scope', '$attrs', '$interpolate', '$timeout', function($scope, $attrs, $interpolate, $timeout) {
    $scope.closeable = !!$attrs.close;
    var dismissOnTimeout = angular.isDefined($attrs.dismissOnTimeout) ?
      $interpolate($attrs.dismissOnTimeout)($scope.$parent) : null;
    if (dismissOnTimeout) {
      $timeout(function() {
        $scope.close();
      }, parseInt(dismissOnTimeout, 10));
    }
  }])
  .directive('uibAlert', function() {
    return {
      controller: 'UibAlertController',
      controllerAs: 'alert',
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/alert/alert.html';
      },
      transclude: true,
      replace: true,
      scope: {
        type: '@',
        close: '&'
      }
    };
  });
angular.module('ui.bootstrap.buttons', [])
  .constant('uibButtonConfig', {
    activeClass: 'active',
    toggleEvent: 'click'
  })
  .controller('UibButtonsController', ['uibButtonConfig', function(buttonConfig) {
    this.activeClass = buttonConfig.activeClass || 'active';
    this.toggleEvent = buttonConfig.toggleEvent || 'click';
  }])
  .directive('uibBtnRadio', ['$parse', function($parse) {
    return {
      require: ['uibBtnRadio', 'ngModel'],
      controller: 'UibButtonsController',
      controllerAs: 'buttons',
      link: function(scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        var uncheckableExpr = $parse(attrs.uibUncheckable);
        element.find('input').css({
          display: 'none'
        });
        ngModelCtrl.$render = function() {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, scope.$eval(attrs.uibBtnRadio)));
        };
        element.on(buttonsCtrl.toggleEvent, function() {
          if (attrs.disabled) {
            return;
          }
          var isActive = element.hasClass(buttonsCtrl.activeClass);
          if (!isActive || angular.isDefined(attrs.uncheckable)) {
            scope.$apply(function() {
              ngModelCtrl.$setViewValue(isActive ? null : scope.$eval(attrs.uibBtnRadio));
              ngModelCtrl.$render();
            });
          }
        });
        if (attrs.uibUncheckable) {
          scope.$watch(uncheckableExpr, function(uncheckable) {
            attrs.$set('uncheckable', uncheckable ? '' : null);
          });
        }
      }
    };
  }])
  .directive('uibBtnCheckbox', function() {
    return {
      require: ['uibBtnCheckbox', 'ngModel'],
      controller: 'UibButtonsController',
      controllerAs: 'button',
      link: function(scope, element, attrs, ctrls) {
        var buttonsCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        element.find('input').css({
          display: 'none'
        });

        function getTrueValue() {
          return getCheckboxValue(attrs.btnCheckboxTrue, true);
        }

        function getFalseValue() {
          return getCheckboxValue(attrs.btnCheckboxFalse, false);
        }

        function getCheckboxValue(attribute, defaultValue) {
          return angular.isDefined(attribute) ? scope.$eval(attribute) : defaultValue;
        }
        ngModelCtrl.$render = function() {
          element.toggleClass(buttonsCtrl.activeClass, angular.equals(ngModelCtrl.$modelValue, getTrueValue()));
        };
        element.on(buttonsCtrl.toggleEvent, function() {
          if (attrs.disabled) {
            return;
          }
          scope.$apply(function() {
            ngModelCtrl.$setViewValue(element.hasClass(buttonsCtrl.activeClass) ? getFalseValue() : getTrueValue());
            ngModelCtrl.$render();
          });
        });
      }
    };
  });
angular.module('ui.bootstrap.carousel', [])
  .controller('UibCarouselController', ['$scope', '$element', '$interval', '$timeout', '$animate', function($scope, $element, $interval, $timeout, $animate) {
    var self = this,
      slides = self.slides = $scope.slides = [],
      SLIDE_DIRECTION = 'uib-slideDirection',
      currentIndex = -1,
      currentInterval, isPlaying, bufferedTransitions = [];
    self.currentSlide = null;
    var destroyed = false;
    self.addSlide = function(slide, element) {
      slide.$element = element;
      slides.push(slide);
      if (slides.length === 1 || slide.active) {
        if ($scope.$currentTransition) {
          $scope.$currentTransition = null;
        }
        self.select(slides[slides.length - 1]);
        if (slides.length === 1) {
          $scope.play();
        }
      } else {
        slide.active = false;
      }
    };
    self.getCurrentIndex = function() {
      if (self.currentSlide && angular.isDefined(self.currentSlide.index)) {
        return +self.currentSlide.index;
      }
      return currentIndex;
    };
    self.next = $scope.next = function() {
      var newIndex = (self.getCurrentIndex() + 1) % slides.length;
      if (newIndex === 0 && $scope.noWrap()) {
        $scope.pause();
        return;
      }
      return self.select(getSlideByIndex(newIndex), 'next');
    };
    self.prev = $scope.prev = function() {
      var newIndex = self.getCurrentIndex() - 1 < 0 ? slides.length - 1 : self.getCurrentIndex() - 1;
      if ($scope.noWrap() && newIndex === slides.length - 1) {
        $scope.pause();
        return;
      }
      return self.select(getSlideByIndex(newIndex), 'prev');
    };
    self.removeSlide = function(slide) {
      if (angular.isDefined(slide.index)) {
        slides.sort(function(a, b) {
          return +a.index > +b.index;
        });
      }
      var bufferedIndex = bufferedTransitions.indexOf(slide);
      if (bufferedIndex !== -1) {
        bufferedTransitions.splice(bufferedIndex, 1);
      }
      var index = slides.indexOf(slide);
      slides.splice(index, 1);
      $timeout(function() {
        if (slides.length > 0 && slide.active) {
          if (index >= slides.length) {
            self.select(slides[index - 1]);
          } else {
            self.select(slides[index]);
          }
        } else if (currentIndex > index) {
          currentIndex--;
        }
      });
      if (slides.length === 0) {
        self.currentSlide = null;
        clearBufferedTransitions();
      }
    };
    self.select = $scope.select = function(nextSlide, direction) {
      var nextIndex = $scope.indexOfSlide(nextSlide);
      if (direction === undefined) {
        direction = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
      }
      if (nextSlide && nextSlide !== self.currentSlide && !$scope.$currentTransition) {
        goNext(nextSlide, nextIndex, direction);
      } else if (nextSlide && nextSlide !== self.currentSlide && $scope.$currentTransition) {
        bufferedTransitions.push(nextSlide);
        nextSlide.active = false;
      }
    };
    $scope.indexOfSlide = function(slide) {
      return angular.isDefined(slide.index) ? +slide.index : slides.indexOf(slide);
    };
    $scope.isActive = function(slide) {
      return self.currentSlide === slide;
    };
    $scope.pause = function() {
      if (!$scope.noPause) {
        isPlaying = false;
        resetTimer();
      }
    };
    $scope.play = function() {
      if (!isPlaying) {
        isPlaying = true;
        restartTimer();
      }
    };
    $scope.$on('$destroy', function() {
      destroyed = true;
      resetTimer();
    });
    $scope.$watch('noTransition', function(noTransition) {
      $animate.enabled($element, !noTransition);
    });
    $scope.$watch('interval', restartTimer);
    $scope.$watchCollection('slides', resetTransition);

    function clearBufferedTransitions() {
      while (bufferedTransitions.length) {
        bufferedTransitions.shift();
      }
    }

    function getSlideByIndex(index) {
      if (angular.isUndefined(slides[index].index)) {
        return slides[index];
      }
      for (var i = 0, l = slides.length; i < l; ++i) {
        if (slides[i].index === index) {
          return slides[i];
        }
      }
    }

    function goNext(slide, index, direction) {
      if (destroyed) {
        return;
      }
      angular.extend(slide, {
        direction: direction,
        active: true
      });
      angular.extend(self.currentSlide || {}, {
        direction: direction,
        active: false
      });
      if ($animate.enabled($element) && !$scope.$currentTransition &&
        slide.$element && self.slides.length > 1) {
        slide.$element.data(SLIDE_DIRECTION, slide.direction);
        if (self.currentSlide && self.currentSlide.$element) {
          self.currentSlide.$element.data(SLIDE_DIRECTION, slide.direction);
        }
        $scope.$currentTransition = true;
        $animate.on('addClass', slide.$element, function(element, phase) {
          if (phase === 'close') {
            $scope.$currentTransition = null;
            $animate.off('addClass', element);
            if (bufferedTransitions.length) {
              var nextSlide = bufferedTransitions.pop();
              var nextIndex = $scope.indexOfSlide(nextSlide);
              var nextDirection = nextIndex > self.getCurrentIndex() ? 'next' : 'prev';
              clearBufferedTransitions();
              goNext(nextSlide, nextIndex, nextDirection);
            }
          }
        });
      }
      self.currentSlide = slide;
      currentIndex = index;
      restartTimer();
    }

    function resetTimer() {
      if (currentInterval) {
        $interval.cancel(currentInterval);
        currentInterval = null;
      }
    }

    function resetTransition(slides) {
      if (!slides.length) {
        $scope.$currentTransition = null;
        clearBufferedTransitions();
      }
    }

    function restartTimer() {
      resetTimer();
      var interval = +$scope.interval;
      if (!isNaN(interval) && interval > 0) {
        currentInterval = $interval(timerFn, interval);
      }
    }

    function timerFn() {
      var interval = +$scope.interval;
      if (isPlaying && !isNaN(interval) && interval > 0 && slides.length) {
        $scope.next();
      } else {
        $scope.pause();
      }
    }
  }])
  .directive('uibCarousel', function() {
    return {
      transclude: true,
      replace: true,
      controller: 'UibCarouselController',
      controllerAs: 'carousel',
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/carousel/carousel.html';
      },
      scope: {
        interval: '=',
        noTransition: '=',
        noPause: '=',
        noWrap: '&'
      }
    };
  })
  .directive('uibSlide', function() {
    return {
      require: '^uibCarousel',
      transclude: true,
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/carousel/slide.html';
      },
      scope: {
        active: '=?',
        actual: '=?',
        index: '=?'
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
  })
  .animation('.item', ['$animateCss',
    function($animateCss) {
      var SLIDE_DIRECTION = 'uib-slideDirection';

      function removeClass(element, className, callback) {
        element.removeClass(className);
        if (callback) {
          callback();
        }
      }
      return {
        beforeAddClass: function(element, className, done) {
          if (className === 'active') {
            var stopped = false;
            var direction = element.data(SLIDE_DIRECTION);
            var directionClass = direction === 'next' ? 'left' : 'right';
            var removeClassFn = removeClass.bind(this, element,
              directionClass + ' ' + direction, done);
            element.addClass(direction);
            $animateCss(element, {
                addClass: directionClass
              })
              .start()
              .done(removeClassFn);
            return function() {
              stopped = true;
            };
          }
          done();
        },
        beforeRemoveClass: function(element, className, done) {
          if (className === 'active') {
            var stopped = false;
            var direction = element.data(SLIDE_DIRECTION);
            var directionClass = direction === 'next' ? 'left' : 'right';
            var removeClassFn = removeClass.bind(this, element, directionClass, done);
            $animateCss(element, {
                addClass: directionClass
              })
              .start()
              .done(removeClassFn);
            return function() {
              stopped = true;
            };
          }
          done();
        }
      };
    }
  ]);
angular.module('ui.bootstrap.dateparser', [])
  .service('uibDateParser', ['$log', '$locale', 'dateFilter', 'orderByFilter', function($log, $locale, dateFilter, orderByFilter) {
    var SPECIAL_CHARACTERS_REGEXP = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
    var localeId;
    var formatCodeToRegex;
    this.init = function() {
      localeId = $locale.id;
      this.parsers = {};
      this.formatters = {};
      formatCodeToRegex = [{
          key: 'yyyy',
          regex: '\\d{4}',
          apply: function(value) {
            this.year = +value;
          },
          formatter: function(date) {
            var _date = new Date();
            _date.setFullYear(Math.abs(date.getFullYear()));
            return dateFilter(_date, 'yyyy');
          }
        },
        {
          key: 'yy',
          regex: '\\d{2}',
          apply: function(value) {
            this.year = +value + 2000;
          },
          formatter: function(date) {
            var _date = new Date();
            _date.setFullYear(Math.abs(date.getFullYear()));
            return dateFilter(_date, 'yy');
          }
        },
        {
          key: 'y',
          regex: '\\d{1,4}',
          apply: function(value) {
            this.year = +value;
          },
          formatter: function(date) {
            var _date = new Date();
            _date.setFullYear(Math.abs(date.getFullYear()));
            return dateFilter(_date, 'y');
          }
        },
        {
          key: 'M!',
          regex: '0?[1-9]|1[0-2]',
          apply: function(value) {
            this.month = value - 1;
          },
          formatter: function(date) {
            var value = date.getMonth();
            if (/^[0-9]$/.test(value)) {
              return dateFilter(date, 'MM');
            }
            return dateFilter(date, 'M');
          }
        },
        {
          key: 'MMMM',
          regex: $locale.DATETIME_FORMATS.MONTH.join('|'),
          apply: function(value) {
            this.month = $locale.DATETIME_FORMATS.MONTH.indexOf(value);
          },
          formatter: function(date) {
            return dateFilter(date, 'MMMM');
          }
        },
        {
          key: 'MMM',
          regex: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
          apply: function(value) {
            this.month = $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value);
          },
          formatter: function(date) {
            return dateFilter(date, 'MMM');
          }
        },
        {
          key: 'MM',
          regex: '0[1-9]|1[0-2]',
          apply: function(value) {
            this.month = value - 1;
          },
          formatter: function(date) {
            return dateFilter(date, 'MM');
          }
        },
        {
          key: 'M',
          regex: '[1-9]|1[0-2]',
          apply: function(value) {
            this.month = value - 1;
          },
          formatter: function(date) {
            return dateFilter(date, 'M');
          }
        },
        {
          key: 'd!',
          regex: '[0-2]?[0-9]{1}|3[0-1]{1}',
          apply: function(value) {
            this.date = +value;
          },
          formatter: function(date) {
            var value = date.getDate();
            if (/^[1-9]$/.test(value)) {
              return dateFilter(date, 'dd');
            }
            return dateFilter(date, 'd');
          }
        },
        {
          key: 'dd',
          regex: '[0-2][0-9]{1}|3[0-1]{1}',
          apply: function(value) {
            this.date = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'dd');
          }
        },
        {
          key: 'd',
          regex: '[1-2]?[0-9]{1}|3[0-1]{1}',
          apply: function(value) {
            this.date = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'd');
          }
        },
        {
          key: 'EEEE',
          regex: $locale.DATETIME_FORMATS.DAY.join('|'),
          formatter: function(date) {
            return dateFilter(date, 'EEEE');
          }
        },
        {
          key: 'EEE',
          regex: $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
          formatter: function(date) {
            return dateFilter(date, 'EEE');
          }
        },
        {
          key: 'HH',
          regex: '(?:0|1)[0-9]|2[0-3]',
          apply: function(value) {
            this.hours = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'HH');
          }
        },
        {
          key: 'hh',
          regex: '0[0-9]|1[0-2]',
          apply: function(value) {
            this.hours = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'hh');
          }
        },
        {
          key: 'H',
          regex: '1?[0-9]|2[0-3]',
          apply: function(value) {
            this.hours = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'H');
          }
        },
        {
          key: 'h',
          regex: '[0-9]|1[0-2]',
          apply: function(value) {
            this.hours = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'h');
          }
        },
        {
          key: 'mm',
          regex: '[0-5][0-9]',
          apply: function(value) {
            this.minutes = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'mm');
          }
        },
        {
          key: 'm',
          regex: '[0-9]|[1-5][0-9]',
          apply: function(value) {
            this.minutes = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'm');
          }
        },
        {
          key: 'sss',
          regex: '[0-9][0-9][0-9]',
          apply: function(value) {
            this.milliseconds = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'sss');
          }
        },
        {
          key: 'ss',
          regex: '[0-5][0-9]',
          apply: function(value) {
            this.seconds = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 'ss');
          }
        },
        {
          key: 's',
          regex: '[0-9]|[1-5][0-9]',
          apply: function(value) {
            this.seconds = +value;
          },
          formatter: function(date) {
            return dateFilter(date, 's');
          }
        },
        {
          key: 'a',
          regex: $locale.DATETIME_FORMATS.AMPMS.join('|'),
          apply: function(value) {
            if (this.hours === 12) {
              this.hours = 0;
            }
            if (value === 'PM') {
              this.hours += 12;
            }
          },
          formatter: function(date) {
            return dateFilter(date, 'a');
          }
        },
        {
          key: 'Z',
          regex: '[+-]\\d{4}',
          apply: function(value) {
            var matches = value.match(/([+-])(\d{2})(\d{2})/),
              sign = matches[1],
              hours = matches[2],
              minutes = matches[3];
            this.hours += toInt(sign + hours);
            this.minutes += toInt(sign + minutes);
          },
          formatter: function(date) {
            return dateFilter(date, 'Z');
          }
        },
        {
          key: 'ww',
          regex: '[0-4][0-9]|5[0-3]',
          formatter: function(date) {
            return dateFilter(date, 'ww');
          }
        },
        {
          key: 'w',
          regex: '[0-9]|[1-4][0-9]|5[0-3]',
          formatter: function(date) {
            return dateFilter(date, 'w');
          }
        },
        {
          key: 'GGGG',
          regex: $locale.DATETIME_FORMATS.ERANAMES.join('|').replace(/\s/g, '\\s'),
          formatter: function(date) {
            return dateFilter(date, 'GGGG');
          }
        },
        {
          key: 'GGG',
          regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
          formatter: function(date) {
            return dateFilter(date, 'GGG');
          }
        },
        {
          key: 'GG',
          regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
          formatter: function(date) {
            return dateFilter(date, 'GG');
          }
        },
        {
          key: 'G',
          regex: $locale.DATETIME_FORMATS.ERAS.join('|'),
          formatter: function(date) {
            return dateFilter(date, 'G');
          }
        }
      ];
    };
    this.init();

    function createParser(format, func) {
      var map = [],
        regex = format.split('');
      var quoteIndex = format.indexOf('\'');
      if (quoteIndex > -1) {
        var inLiteral = false;
        format = format.split('');
        for (var i = quoteIndex; i < format.length; i++) {
          if (inLiteral) {
            if (format[i] === '\'') {
              if (i + 1 < format.length && format[i + 1] === '\'') {
                format[i + 1] = '$';
                regex[i + 1] = '';
              } else {
                regex[i] = '';
                inLiteral = false;
              }
            }
            format[i] = '$';
          } else {
            if (format[i] === '\'') {
              format[i] = '$';
              regex[i] = '';
              inLiteral = true;
            }
          }
        }
        format = format.join('');
      }
      angular.forEach(formatCodeToRegex, function(data) {
        var index = format.indexOf(data.key);
        if (index > -1) {
          format = format.split('');
          regex[index] = '(' + data.regex + ')';
          format[index] = '$';
          for (var i = index + 1, n = index + data.key.length; i < n; i++) {
            regex[i] = '';
            format[i] = '$';
          }
          format = format.join('');
          map.push({
            index: index,
            key: data.key,
            apply: data[func],
            matcher: data.regex
          });
        }
      });
      return {
        regex: new RegExp('^' + regex.join('') + '$'),
        map: orderByFilter(map, 'index')
      };
    }
    this.filter = function(date, format) {
      if (!angular.isDate(date) || isNaN(date) || !format) {
        return '';
      }
      format = $locale.DATETIME_FORMATS[format] || format;
      if ($locale.id !== localeId) {
        this.init();
      }
      if (!this.formatters[format]) {
        this.formatters[format] = createParser(format, 'formatter');
      }
      var parser = this.formatters[format],
        map = parser.map;
      var _format = format;
      return map.reduce(function(str, mapper, i) {
        var match = _format.match(new RegExp('(.*)' + mapper.key));
        if (match && angular.isString(match[1])) {
          str += match[1];
          _format = _format.replace(match[1] + mapper.key, '');
        }
        if (mapper.apply) {
          return str + mapper.apply.call(null, date);
        }
        return str;
      }, '');
    };
    this.parse = function(input, format, baseDate) {
      if (!angular.isString(input) || !format) {
        return input;
      }
      format = $locale.DATETIME_FORMATS[format] || format;
      format = format.replace(SPECIAL_CHARACTERS_REGEXP, '\\$&');
      if ($locale.id !== localeId) {
        this.init();
      }
      if (!this.parsers[format]) {
        this.parsers[format] = createParser(format, 'apply');
      }
      var parser = this.parsers[format],
        regex = parser.regex,
        map = parser.map,
        results = input.match(regex),
        tzOffset = false;
      if (results && results.length) {
        var fields, dt;
        if (angular.isDate(baseDate) && !isNaN(baseDate.getTime())) {
          fields = {
            year: baseDate.getFullYear(),
            month: baseDate.getMonth(),
            date: baseDate.getDate(),
            hours: baseDate.getHours(),
            minutes: baseDate.getMinutes(),
            seconds: baseDate.getSeconds(),
            milliseconds: baseDate.getMilliseconds()
          };
        } else {
          if (baseDate) {
            $log.warn('dateparser:', 'baseDate is not a valid date');
          }
          fields = {
            year: 1900,
            month: 0,
            date: 1,
            hours: 0,
            minutes: 0,
            seconds: 0,
            milliseconds: 0
          };
        }
        for (var i = 1, n = results.length; i < n; i++) {
          var mapper = map[i - 1];
          if (mapper.matcher === 'Z') {
            tzOffset = true;
          }
          if (mapper.apply) {
            mapper.apply.call(fields, results[i]);
          }
        }
        var datesetter = tzOffset ? Date.prototype.setUTCFullYear :
          Date.prototype.setFullYear;
        var timesetter = tzOffset ? Date.prototype.setUTCHours :
          Date.prototype.setHours;
        if (isValid(fields.year, fields.month, fields.date)) {
          if (angular.isDate(baseDate) && !isNaN(baseDate.getTime()) && !tzOffset) {
            dt = new Date(baseDate);
            datesetter.call(dt, fields.year, fields.month, fields.date);
            timesetter.call(dt, fields.hours, fields.minutes,
              fields.seconds, fields.milliseconds);
          } else {
            dt = new Date(0);
            datesetter.call(dt, fields.year, fields.month, fields.date);
            timesetter.call(dt, fields.hours || 0, fields.minutes || 0,
              fields.seconds || 0, fields.milliseconds || 0);
          }
        }
        return dt;
      }
    };

    function isValid(year, month, date) {
      if (date < 1) {
        return false;
      }
      if (month === 1 && date > 28) {
        return date === 29 && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0);
      }
      if (month === 3 || month === 5 || month === 8 || month === 10) {
        return date < 31;
      }
      return true;
    }

    function toInt(str) {
      return parseInt(str, 10);
    }
    this.toTimezone = toTimezone;
    this.fromTimezone = fromTimezone;
    this.timezoneToOffset = timezoneToOffset;
    this.addDateMinutes = addDateMinutes;
    this.convertTimezoneToLocal = convertTimezoneToLocal;

    function toTimezone(date, timezone) {
      return date && timezone ? convertTimezoneToLocal(date, timezone) : date;
    }

    function fromTimezone(date, timezone) {
      return date && timezone ? convertTimezoneToLocal(date, timezone, true) : date;
    }

    function timezoneToOffset(timezone, fallback) {
      var requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
      return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
    }

    function addDateMinutes(date, minutes) {
      date = new Date(date.getTime());
      date.setMinutes(date.getMinutes() + minutes);
      return date;
    }

    function convertTimezoneToLocal(date, timezone, reverse) {
      reverse = reverse ? -1 : 1;
      var timezoneOffset = timezoneToOffset(timezone, date.getTimezoneOffset());
      return addDateMinutes(date, reverse * (timezoneOffset - date.getTimezoneOffset()));
    }
  }]);
angular.module('ui.bootstrap.isClass', [])
  .directive('uibIsClass', [
    '$animate',
    function($animate) {
      var ON_REGEXP = /^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/;
      var IS_REGEXP = /^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;
      var dataPerTracked = {};
      return {
        restrict: 'A',
        compile: function(tElement, tAttrs) {
          var linkedScopes = [];
          var instances = [];
          var expToData = {};
          var lastActivated = null;
          var onExpMatches = tAttrs.uibIsClass.match(ON_REGEXP);
          var onExp = onExpMatches[2];
          var expsStr = onExpMatches[1];
          var exps = expsStr.split(',');
          return linkFn;

          function linkFn(scope, element, attrs) {
            linkedScopes.push(scope);
            instances.push({
              scope: scope,
              element: element
            });
            exps.forEach(function(exp, k) {
              addForExp(exp, scope);
            });
            scope.$on('$destroy', removeScope);
          }

          function addForExp(exp, scope) {
            var matches = exp.match(IS_REGEXP);
            var clazz = scope.$eval(matches[1]);
            var compareWithExp = matches[2];
            var data = expToData[exp];
            if (!data) {
              var watchFn = function(compareWithVal) {
                var newActivated = null;
                instances.some(function(instance) {
                  var thisVal = instance.scope.$eval(onExp);
                  if (thisVal === compareWithVal) {
                    newActivated = instance;
                    return true;
                  }
                });
                if (data.lastActivated !== newActivated) {
                  if (data.lastActivated) {
                    $animate.removeClass(data.lastActivated.element, clazz);
                  }
                  if (newActivated) {
                    $animate.addClass(newActivated.element, clazz);
                  }
                  data.lastActivated = newActivated;
                }
              };
              expToData[exp] = data = {
                lastActivated: null,
                scope: scope,
                watchFn: watchFn,
                compareWithExp: compareWithExp,
                watcher: scope.$watch(compareWithExp, watchFn)
              };
            }
            data.watchFn(scope.$eval(compareWithExp));
          }

          function removeScope(e) {
            var removedScope = e.targetScope;
            var index = linkedScopes.indexOf(removedScope);
            linkedScopes.splice(index, 1);
            instances.splice(index, 1);
            if (linkedScopes.length) {
              var newWatchScope = linkedScopes[0];
              angular.forEach(expToData, function(data) {
                if (data.scope === removedScope) {
                  data.watcher = newWatchScope.$watch(data.compareWithExp, data.watchFn);
                  data.scope = newWatchScope;
                }
              });
            } else {
              expToData = {};
            }
          }
        }
      };
    }
  ]);
angular.module('ui.bootstrap.position', [])
  .factory('$uibPosition', ['$document', '$window', function($document, $window) {
    var SCROLLBAR_WIDTH;
    var OVERFLOW_REGEX = {
      normal: /(auto|scroll)/,
      hidden: /(auto|scroll|hidden)/
    };
    var PLACEMENT_REGEX = {
      auto: /\s?auto?\s?/i,
      primary: /^(top|bottom|left|right)$/,
      secondary: /^(top|bottom|left|right|center)$/,
      vertical: /^(top|bottom)$/
    };
    return {
      getRawNode: function(elem) {
        return elem[0] || elem;
      },
      parseStyle: function(value) {
        value = parseFloat(value);
        return isFinite(value) ? value : 0;
      },
      offsetParent: function(elem) {
        elem = this.getRawNode(elem);
        var offsetParent = elem.offsetParent || $document[0].documentElement;

        function isStaticPositioned(el) {
          return ($window.getComputedStyle(el).position || 'static') === 'static';
        }
        while (offsetParent && offsetParent !== $document[0].documentElement && isStaticPositioned(offsetParent)) {
          offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || $document[0].documentElement;
      },
      scrollbarWidth: function() {
        if (angular.isUndefined(SCROLLBAR_WIDTH)) {
          var scrollElem = angular.element('<div style="position: absolute; top: -9999px; width: 50px; height: 50px; overflow: scroll;"></div>');
          $document.find('body').append(scrollElem);
          SCROLLBAR_WIDTH = scrollElem[0].offsetWidth - scrollElem[0].clientWidth;
          SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
          scrollElem.remove();
        }
        return SCROLLBAR_WIDTH;
      },
      scrollParent: function(elem, includeHidden) {
        elem = this.getRawNode(elem);
        var overflowRegex = includeHidden ? OVERFLOW_REGEX.hidden : OVERFLOW_REGEX.normal;
        var documentEl = $document[0].documentElement;
        var elemStyle = $window.getComputedStyle(elem);
        var excludeStatic = elemStyle.position === 'absolute';
        var scrollParent = elem.parentElement || documentEl;
        if (scrollParent === documentEl || elemStyle.position === 'fixed') {
          return documentEl;
        }
        while (scrollParent.parentElement && scrollParent !== documentEl) {
          var spStyle = $window.getComputedStyle(scrollParent);
          if (excludeStatic && spStyle.position !== 'static') {
            excludeStatic = false;
          }
          if (!excludeStatic && overflowRegex.test(spStyle.overflow + spStyle.overflowY + spStyle.overflowX)) {
            break;
          }
          scrollParent = scrollParent.parentElement;
        }
        return scrollParent;
      },
      position: function(elem, includeMagins) {
        elem = this.getRawNode(elem);
        var elemOffset = this.offset(elem);
        if (includeMagins) {
          var elemStyle = $window.getComputedStyle(elem);
          elemOffset.top -= this.parseStyle(elemStyle.marginTop);
          elemOffset.left -= this.parseStyle(elemStyle.marginLeft);
        }
        var parent = this.offsetParent(elem);
        var parentOffset = {
          top: 0,
          left: 0
        };
        if (parent !== $document[0].documentElement) {
          parentOffset = this.offset(parent);
          parentOffset.top += parent.clientTop - parent.scrollTop;
          parentOffset.left += parent.clientLeft - parent.scrollLeft;
        }
        return {
          width: Math.round(angular.isNumber(elemOffset.width) ? elemOffset.width : elem.offsetWidth),
          height: Math.round(angular.isNumber(elemOffset.height) ? elemOffset.height : elem.offsetHeight),
          top: Math.round(elemOffset.top - parentOffset.top),
          left: Math.round(elemOffset.left - parentOffset.left)
        };
      },
      offset: function(elem) {
        elem = this.getRawNode(elem);
        var elemBCR = elem.getBoundingClientRect();
        return {
          width: Math.round(angular.isNumber(elemBCR.width) ? elemBCR.width : elem.offsetWidth),
          height: Math.round(angular.isNumber(elemBCR.height) ? elemBCR.height : elem.offsetHeight),
          top: Math.round(elemBCR.top + ($window.pageYOffset || $document[0].documentElement.scrollTop)),
          left: Math.round(elemBCR.left + ($window.pageXOffset || $document[0].documentElement.scrollLeft))
        };
      },
      viewportOffset: function(elem, useDocument, includePadding) {
        elem = this.getRawNode(elem);
        includePadding = includePadding !== false ? true : false;
        var elemBCR = elem.getBoundingClientRect();
        var offsetBCR = {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        };
        var offsetParent = useDocument ? $document[0].documentElement : this.scrollParent(elem);
        var offsetParentBCR = offsetParent.getBoundingClientRect();
        offsetBCR.top = offsetParentBCR.top + offsetParent.clientTop;
        offsetBCR.left = offsetParentBCR.left + offsetParent.clientLeft;
        if (offsetParent === $document[0].documentElement) {
          offsetBCR.top += $window.pageYOffset;
          offsetBCR.left += $window.pageXOffset;
        }
        offsetBCR.bottom = offsetBCR.top + offsetParent.clientHeight;
        offsetBCR.right = offsetBCR.left + offsetParent.clientWidth;
        if (includePadding) {
          var offsetParentStyle = $window.getComputedStyle(offsetParent);
          offsetBCR.top += this.parseStyle(offsetParentStyle.paddingTop);
          offsetBCR.bottom -= this.parseStyle(offsetParentStyle.paddingBottom);
          offsetBCR.left += this.parseStyle(offsetParentStyle.paddingLeft);
          offsetBCR.right -= this.parseStyle(offsetParentStyle.paddingRight);
        }
        return {
          top: Math.round(elemBCR.top - offsetBCR.top),
          bottom: Math.round(offsetBCR.bottom - elemBCR.bottom),
          left: Math.round(elemBCR.left - offsetBCR.left),
          right: Math.round(offsetBCR.right - elemBCR.right)
        };
      },
      parsePlacement: function(placement) {
        var autoPlace = PLACEMENT_REGEX.auto.test(placement);
        if (autoPlace) {
          placement = placement.replace(PLACEMENT_REGEX.auto, '');
        }
        placement = placement.split('-');
        placement[0] = placement[0] || 'top';
        if (!PLACEMENT_REGEX.primary.test(placement[0])) {
          placement[0] = 'top';
        }
        placement[1] = placement[1] || 'center';
        if (!PLACEMENT_REGEX.secondary.test(placement[1])) {
          placement[1] = 'center';
        }
        if (autoPlace) {
          placement[2] = true;
        } else {
          placement[2] = false;
        }
        return placement;
      },
      positionElements: function(hostElem, targetElem, placement, appendToBody) {
        hostElem = this.getRawNode(hostElem);
        targetElem = this.getRawNode(targetElem);
        var targetWidth = angular.isDefined(targetElem.offsetWidth) ? targetElem.offsetWidth : targetElem.prop('offsetWidth');
        var targetHeight = angular.isDefined(targetElem.offsetHeight) ? targetElem.offsetHeight : targetElem.prop('offsetHeight');
        placement = this.parsePlacement(placement);
        var hostElemPos = appendToBody ? this.offset(hostElem) : this.position(hostElem);
        var targetElemPos = {
          top: 0,
          left: 0,
          placement: ''
        };
        if (placement[2]) {
          var viewportOffset = this.viewportOffset(hostElem);
          var targetElemStyle = $window.getComputedStyle(targetElem);
          var adjustedSize = {
            width: targetWidth + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginLeft) + this.parseStyle(targetElemStyle.marginRight))),
            height: targetHeight + Math.round(Math.abs(this.parseStyle(targetElemStyle.marginTop) + this.parseStyle(targetElemStyle.marginBottom)))
          };
          placement[0] = placement[0] === 'top' && adjustedSize.height > viewportOffset.top && adjustedSize.height <= viewportOffset.bottom ? 'bottom' :
            placement[0] === 'bottom' && adjustedSize.height > viewportOffset.bottom && adjustedSize.height <= viewportOffset.top ? 'top' :
            placement[0] === 'left' && adjustedSize.width > viewportOffset.left && adjustedSize.width <= viewportOffset.right ? 'right' :
            placement[0] === 'right' && adjustedSize.width > viewportOffset.right && adjustedSize.width <= viewportOffset.left ? 'left' :
            placement[0];
          placement[1] = placement[1] === 'top' && adjustedSize.height - hostElemPos.height > viewportOffset.bottom && adjustedSize.height - hostElemPos.height <= viewportOffset.top ? 'bottom' :
            placement[1] === 'bottom' && adjustedSize.height - hostElemPos.height > viewportOffset.top && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom ? 'top' :
            placement[1] === 'left' && adjustedSize.width - hostElemPos.width > viewportOffset.right && adjustedSize.width - hostElemPos.width <= viewportOffset.left ? 'right' :
            placement[1] === 'right' && adjustedSize.width - hostElemPos.width > viewportOffset.left && adjustedSize.width - hostElemPos.width <= viewportOffset.right ? 'left' :
            placement[1];
          if (placement[1] === 'center') {
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
              var xOverflow = hostElemPos.width / 2 - targetWidth / 2;
              if (viewportOffset.left + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.right) {
                placement[1] = 'left';
              } else if (viewportOffset.right + xOverflow < 0 && adjustedSize.width - hostElemPos.width <= viewportOffset.left) {
                placement[1] = 'right';
              }
            } else {
              var yOverflow = hostElemPos.height / 2 - adjustedSize.height / 2;
              if (viewportOffset.top + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.bottom) {
                placement[1] = 'top';
              } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSize.height - hostElemPos.height <= viewportOffset.top) {
                placement[1] = 'bottom';
              }
            }
          }
        }
        switch (placement[0]) {
          case 'top':
            targetElemPos.top = hostElemPos.top - targetHeight;
            break;
          case 'bottom':
            targetElemPos.top = hostElemPos.top + hostElemPos.height;
            break;
          case 'left':
            targetElemPos.left = hostElemPos.left - targetWidth;
            break;
          case 'right':
            targetElemPos.left = hostElemPos.left + hostElemPos.width;
            break;
        }
        switch (placement[1]) {
          case 'top':
            targetElemPos.top = hostElemPos.top;
            break;
          case 'bottom':
            targetElemPos.top = hostElemPos.top + hostElemPos.height - targetHeight;
            break;
          case 'left':
            targetElemPos.left = hostElemPos.left;
            break;
          case 'right':
            targetElemPos.left = hostElemPos.left + hostElemPos.width - targetWidth;
            break;
          case 'center':
            if (PLACEMENT_REGEX.vertical.test(placement[0])) {
              targetElemPos.left = hostElemPos.left + hostElemPos.width / 2 - targetWidth / 2;
            } else {
              targetElemPos.top = hostElemPos.top + hostElemPos.height / 2 - targetHeight / 2;
            }
            break;
        }
        targetElemPos.top = Math.round(targetElemPos.top);
        targetElemPos.left = Math.round(targetElemPos.left);
        targetElemPos.placement = placement[1] === 'center' ? placement[0] : placement[0] + '-' + placement[1];
        return targetElemPos;
      },
      positionArrow: function(elem, placement) {
        elem = this.getRawNode(elem);
        var innerElem = elem.querySelector('.tooltip-inner, .popover-inner');
        if (!innerElem) {
          return;
        }
        var isTooltip = angular.element(innerElem).hasClass('tooltip-inner');
        var arrowElem = isTooltip ? elem.querySelector('.tooltip-arrow') : elem.querySelector('.arrow');
        if (!arrowElem) {
          return;
        }
        placement = this.parsePlacement(placement);
        if (placement[1] === 'center') {
          angular.element(arrowElem).css({
            top: '',
            bottom: '',
            right: '',
            left: '',
            margin: ''
          });
          return;
        }
        var borderProp = 'border-' + placement[0] + '-width';
        var borderWidth = $window.getComputedStyle(arrowElem)[borderProp];
        var borderRadiusProp = 'border-';
        if (PLACEMENT_REGEX.vertical.test(placement[0])) {
          borderRadiusProp += placement[0] + '-' + placement[1];
        } else {
          borderRadiusProp += placement[1] + '-' + placement[0];
        }
        borderRadiusProp += '-radius';
        var borderRadius = $window.getComputedStyle(isTooltip ? innerElem : elem)[borderRadiusProp];
        var arrowCss = {
          top: 'auto',
          bottom: 'auto',
          left: 'auto',
          right: 'auto',
          margin: 0
        };
        switch (placement[0]) {
          case 'top':
            arrowCss.bottom = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'bottom':
            arrowCss.top = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'left':
            arrowCss.right = isTooltip ? '0' : '-' + borderWidth;
            break;
          case 'right':
            arrowCss.left = isTooltip ? '0' : '-' + borderWidth;
            break;
        }
        arrowCss[placement[1]] = borderRadius;
        angular.element(arrowElem).css(arrowCss);
      }
    };
  }]);
angular.module('ui.bootstrap.datepicker', ['ui.bootstrap.dateparser', 'ui.bootstrap.isClass', 'ui.bootstrap.position'])
  .value('$datepickerSuppressError', false)
  .constant('uibDatepickerConfig', {
    datepickerMode: 'day',
    formatDay: 'dd',
    formatMonth: 'MMMM',
    formatYear: 'yyyy',
    formatDayHeader: 'EEE',
    formatDayTitle: 'MMMM yyyy',
    formatMonthTitle: 'yyyy',
    maxDate: null,
    maxMode: 'year',
    minDate: null,
    minMode: 'day',
    ngModelOptions: {},
    shortcutPropagation: false,
    showWeeks: true,
    yearColumns: 5,
    yearRows: 4
  })
  .controller('UibDatepickerController', ['$scope', '$attrs', '$parse', '$interpolate', '$locale', '$log', 'dateFilter', 'uibDatepickerConfig', '$datepickerSuppressError', 'uibDateParser',
    function($scope, $attrs, $parse, $interpolate, $locale, $log, dateFilter, datepickerConfig, $datepickerSuppressError, dateParser) {
      var self = this,
        ngModelCtrl = {
          $setViewValue: angular.noop
        },
        ngModelOptions = {},
        watchListeners = [];
      this.modes = ['day', 'month', 'year'];
      if ($attrs.datepickerOptions) {
        angular.forEach([
          'formatDay',
          'formatDayHeader',
          'formatDayTitle',
          'formatMonth',
          'formatMonthTitle',
          'formatYear',
          'initDate',
          'maxDate',
          'maxMode',
          'minDate',
          'minMode',
          'showWeeks',
          'shortcutPropagation',
          'startingDay',
          'yearColumns',
          'yearRows'
        ], function(key) {
          switch (key) {
            case 'formatDay':
            case 'formatDayHeader':
            case 'formatDayTitle':
            case 'formatMonth':
            case 'formatMonthTitle':
            case 'formatYear':
              self[key] = angular.isDefined($scope.datepickerOptions[key]) ? $interpolate($scope.datepickerOptions[key])($scope.$parent) : datepickerConfig[key];
              break;
            case 'showWeeks':
            case 'shortcutPropagation':
            case 'yearColumns':
            case 'yearRows':
              self[key] = angular.isDefined($scope.datepickerOptions[key]) ?
                $scope.datepickerOptions[key] : datepickerConfig[key];
              break;
            case 'startingDay':
              if (angular.isDefined($scope.datepickerOptions.startingDay)) {
                self.startingDay = $scope.datepickerOptions.startingDay;
              } else if (angular.isNumber(datepickerConfig.startingDay)) {
                self.startingDay = datepickerConfig.startingDay;
              } else {
                self.startingDay = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 8) % 7;
              }
              break;
            case 'maxDate':
            case 'minDate':
              if ($scope.datepickerOptions[key]) {
                $scope.$watch(function() {
                  return $scope.datepickerOptions[key];
                }, function(value) {
                  if (value) {
                    if (angular.isDate(value)) {
                      self[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
                    } else {
                      self[key] = new Date(dateFilter(value, 'medium'));
                    }
                  } else {
                    self[key] = null;
                  }
                  self.refreshView();
                });
              } else {
                self[key] = datepickerConfig[key] ? dateParser.fromTimezone(new Date(datepickerConfig[key]), ngModelOptions.timezone) : null;
              }
              break;
            case 'maxMode':
            case 'minMode':
              if ($scope.datepickerOptions[key]) {
                $scope.$watch(function() {
                  return $scope.datepickerOptions[key];
                }, function(value) {
                  self[key] = $scope[key] = angular.isDefined(value) ? value : datepickerOptions[key];
                  if (key === 'minMode' && self.modes.indexOf($scope.datepickerMode) < self.modes.indexOf(self[key]) ||
                    key === 'maxMode' && self.modes.indexOf($scope.datepickerMode) > self.modes.indexOf(self[key])) {
                    $scope.datepickerMode = self[key];
                  }
                });
              } else {
                self[key] = $scope[key] = datepickerConfig[key] || null;
              }
              break;
            case 'initDate':
              if ($scope.datepickerOptions.initDate) {
                this.activeDate = dateParser.fromTimezone($scope.datepickerOptions.initDate, ngModelOptions.timezone) || new Date();
                $scope.$watch(function() {
                  return $scope.datepickerOptions.initDate;
                }, function(initDate) {
                  if (initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)) {
                    self.activeDate = dateParser.fromTimezone(initDate, ngModelOptions.timezone);
                    self.refreshView();
                  }
                });
              } else {
                this.activeDate = new Date();
              }
          }
        });
      } else {
        angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle'], function(key) {
          self[key] = angular.isDefined($attrs[key]) ? $interpolate($attrs[key])($scope.$parent) : datepickerConfig[key];
        });
        angular.forEach(['showWeeks', 'yearRows', 'yearColumns', 'shortcutPropagation'], function(key) {
          self[key] = angular.isDefined($attrs[key]) ?
            $scope.$parent.$eval($attrs[key]) : datepickerConfig[key];
        });
        if (angular.isDefined($attrs.startingDay)) {
          self.startingDay = $scope.$parent.$eval($attrs.startingDay);
        } else if (angular.isNumber(datepickerConfig.startingDay)) {
          self.startingDay = datepickerConfig.startingDay;
        } else {
          self.startingDay = ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 8) % 7;
        }
        angular.forEach(['minDate', 'maxDate'], function(key) {
          if ($attrs[key]) {
            watchListeners.push($scope.$parent.$watch($attrs[key], function(value) {
              if (value) {
                if (angular.isDate(value)) {
                  self[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
                } else {
                  self[key] = new Date(dateFilter(value, 'medium'));
                }
              } else {
                self[key] = null;
              }
              self.refreshView();
            }));
          } else {
            self[key] = datepickerConfig[key] ? dateParser.fromTimezone(new Date(datepickerConfig[key]), ngModelOptions.timezone) : null;
          }
        });
        angular.forEach(['minMode', 'maxMode'], function(key) {
          if ($attrs[key]) {
            watchListeners.push($scope.$parent.$watch($attrs[key], function(value) {
              self[key] = $scope[key] = angular.isDefined(value) ? value : $attrs[key];
              if (key === 'minMode' && self.modes.indexOf($scope.datepickerMode) < self.modes.indexOf(self[key]) ||
                key === 'maxMode' && self.modes.indexOf($scope.datepickerMode) > self.modes.indexOf(self[key])) {
                $scope.datepickerMode = self[key];
              }
            }));
          } else {
            self[key] = $scope[key] = datepickerConfig[key] || null;
          }
        });
        if (angular.isDefined($attrs.initDate)) {
          this.activeDate = dateParser.fromTimezone($scope.$parent.$eval($attrs.initDate), ngModelOptions.timezone) || new Date();
          watchListeners.push($scope.$parent.$watch($attrs.initDate, function(initDate) {
            if (initDate && (ngModelCtrl.$isEmpty(ngModelCtrl.$modelValue) || ngModelCtrl.$invalid)) {
              self.activeDate = dateParser.fromTimezone(initDate, ngModelOptions.timezone);
              self.refreshView();
            }
          }));
        } else {
          this.activeDate = new Date();
        }
      }
      $scope.datepickerMode = $scope.datepickerMode || datepickerConfig.datepickerMode;
      $scope.uniqueId = 'datepicker-' + $scope.$id + '-' + Math.floor(Math.random() * 10000);
      $scope.disabled = angular.isDefined($attrs.disabled) || false;
      if (angular.isDefined($attrs.ngDisabled)) {
        watchListeners.push($scope.$parent.$watch($attrs.ngDisabled, function(disabled) {
          $scope.disabled = disabled;
          self.refreshView();
        }));
      }
      $scope.isActive = function(dateObject) {
        if (self.compare(dateObject.date, self.activeDate) === 0) {
          $scope.activeDateId = dateObject.uid;
          return true;
        }
        return false;
      };
      this.init = function(ngModelCtrl_) {
        ngModelCtrl = ngModelCtrl_;
        ngModelOptions = ngModelCtrl_.$options || datepickerConfig.ngModelOptions;
        if (ngModelCtrl.$modelValue) {
          this.activeDate = ngModelCtrl.$modelValue;
        }
        ngModelCtrl.$render = function() {
          self.render();
        };
      };
      this.render = function() {
        if (ngModelCtrl.$viewValue) {
          var date = new Date(ngModelCtrl.$viewValue),
            isValid = !isNaN(date);
          if (isValid) {
            this.activeDate = dateParser.fromTimezone(date, ngModelOptions.timezone);
          } else if (!$datepickerSuppressError) {
            $log.error('Datepicker directive: "ng-model" value must be a Date object');
          }
        }
        this.refreshView();
      };
      this.refreshView = function() {
        if (this.element) {
          $scope.selectedDt = null;
          this._refreshView();
          if ($scope.activeDt) {
            $scope.activeDateId = $scope.activeDt.uid;
          }
          var date = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
          date = dateParser.fromTimezone(date, ngModelOptions.timezone);
          ngModelCtrl.$setValidity('dateDisabled', !date ||
            this.element && !this.isDisabled(date));
        }
      };
      this.createDateObject = function(date, format) {
        var model = ngModelCtrl.$viewValue ? new Date(ngModelCtrl.$viewValue) : null;
        model = dateParser.fromTimezone(model, ngModelOptions.timezone);
        var dt = {
          date: date,
          label: dateParser.filter(date, format),
          selected: model && this.compare(date, model) === 0,
          disabled: this.isDisabled(date),
          current: this.compare(date, new Date()) === 0,
          customClass: this.customClass(date) || null
        };
        if (model && this.compare(date, model) === 0) {
          $scope.selectedDt = dt;
        }
        if (self.activeDate && this.compare(dt.date, self.activeDate) === 0) {
          $scope.activeDt = dt;
        }
        return dt;
      };
      this.isDisabled = function(date) {
        return $scope.disabled ||
          this.minDate && this.compare(date, this.minDate) < 0 ||
          this.maxDate && this.compare(date, this.maxDate) > 0 ||
          $attrs.dateDisabled && $scope.dateDisabled({
            date: date,
            mode: $scope.datepickerMode
          });
      };
      this.customClass = function(date) {
        return $scope.customClass({
          date: date,
          mode: $scope.datepickerMode
        });
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
          var dt = ngModelCtrl.$viewValue ? dateParser.fromTimezone(new Date(ngModelCtrl.$viewValue), ngModelOptions.timezone) : new Date(0, 0, 0, 0, 0, 0, 0);
          dt.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
          dt = dateParser.toTimezone(dt, ngModelOptions.timezone);
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
        if ($scope.datepickerMode === self.maxMode && direction === 1 ||
          $scope.datepickerMode === self.minMode && direction === -1) {
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
        self.element[0].focus();
      };
      $scope.$on('uib:datepicker.focus', focusElement);
      $scope.keydown = function(evt) {
        var key = $scope.keys[evt.which];
        if (!key || evt.shiftKey || evt.altKey || $scope.disabled) {
          return;
        }
        evt.preventDefault();
        if (!self.shortcutPropagation) {
          evt.stopPropagation();
        }
        if (key === 'enter' || key === 'space') {
          if (self.isDisabled(self.activeDate)) {
            return;
          }
          $scope.select(self.activeDate);
        } else if (evt.ctrlKey && (key === 'up' || key === 'down')) {
          $scope.toggleMode(key === 'up' ? 1 : -1);
        } else {
          self.handleKeyDown(key, evt);
          self.refreshView();
        }
      };
      $scope.$on("$destroy", function() {
        while (watchListeners.length) {
          watchListeners.shift()();
        }
      });
    }
  ])
  .controller('UibDaypickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
    var DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    this.step = {
      months: 1
    };
    this.element = $element;

    function getDaysInMonth(year, month) {
      return month === 1 && year % 4 === 0 &&
        (year % 100 !== 0 || year % 400 === 0) ? 29 : DAYS_IN_MONTH[month];
    }
    this.init = function(ctrl) {
      angular.extend(ctrl, this);
      scope.showWeeks = ctrl.showWeeks;
      ctrl.refreshView();
    };
    this.getDates = function(startDate, n) {
      var dates = new Array(n),
        current = new Date(startDate),
        i = 0,
        date;
      while (i < n) {
        date = new Date(current);
        dates[i++] = date;
        current.setDate(current.getDate() + 1);
      }
      return dates;
    };
    this._refreshView = function() {
      var year = this.activeDate.getFullYear(),
        month = this.activeDate.getMonth(),
        firstDayOfMonth = new Date(this.activeDate);
      firstDayOfMonth.setFullYear(year, month, 1);
      var difference = this.startingDay - firstDayOfMonth.getDay(),
        numDisplayedFromPreviousMonth = difference > 0 ?
        7 - difference : -difference,
        firstDate = new Date(firstDayOfMonth);
      if (numDisplayedFromPreviousMonth > 0) {
        firstDate.setDate(-numDisplayedFromPreviousMonth + 1);
      }
      var days = this.getDates(firstDate, 42);
      for (var i = 0; i < 42; i++) {
        days[i] = angular.extend(this.createDateObject(days[i], this.formatDay), {
          secondary: days[i].getMonth() !== month,
          uid: scope.uniqueId + '-' + i
        });
      }
      scope.labels = new Array(7);
      for (var j = 0; j < 7; j++) {
        scope.labels[j] = {
          abbr: dateFilter(days[j].date, this.formatDayHeader),
          full: dateFilter(days[j].date, 'EEEE')
        };
      }
      scope.title = dateFilter(this.activeDate, this.formatDayTitle);
      scope.rows = this.split(days, 7);
      if (scope.showWeeks) {
        scope.weekNumbers = [];
        var thursdayIndex = (4 + 7 - this.startingDay) % 7,
          numWeeks = scope.rows.length;
        for (var curWeek = 0; curWeek < numWeeks; curWeek++) {
          scope.weekNumbers.push(
            getISO8601WeekNumber(scope.rows[curWeek][thursdayIndex].date));
        }
      }
    };
    this.compare = function(date1, date2) {
      var _date1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
      var _date2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
      _date1.setFullYear(date1.getFullYear());
      _date2.setFullYear(date2.getFullYear());
      return _date1 - _date2;
    };

    function getISO8601WeekNumber(date) {
      var checkDate = new Date(date);
      checkDate.setDate(checkDate.getDate() + 4 - (checkDate.getDay() || 7));
      var time = checkDate.getTime();
      checkDate.setMonth(0);
      checkDate.setDate(1);
      return Math.floor(Math.round((time - checkDate) / 86400000) / 7) + 1;
    }
    this.handleKeyDown = function(key, evt) {
      var date = this.activeDate.getDate();
      if (key === 'left') {
        date = date - 1;
      } else if (key === 'up') {
        date = date - 7;
      } else if (key === 'right') {
        date = date + 1;
      } else if (key === 'down') {
        date = date + 7;
      } else if (key === 'pageup' || key === 'pagedown') {
        var month = this.activeDate.getMonth() + (key === 'pageup' ? -1 : 1);
        this.activeDate.setMonth(month, 1);
        date = Math.min(getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth()), date);
      } else if (key === 'home') {
        date = 1;
      } else if (key === 'end') {
        date = getDaysInMonth(this.activeDate.getFullYear(), this.activeDate.getMonth());
      }
      this.activeDate.setDate(date);
    };
  }])
  .controller('UibMonthpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
    this.step = {
      years: 1
    };
    this.element = $element;
    this.init = function(ctrl) {
      angular.extend(ctrl, this);
      ctrl.refreshView();
    };
    this._refreshView = function() {
      var months = new Array(12),
        year = this.activeDate.getFullYear(),
        date;
      for (var i = 0; i < 12; i++) {
        date = new Date(this.activeDate);
        date.setFullYear(year, i, 1);
        months[i] = angular.extend(this.createDateObject(date, this.formatMonth), {
          uid: scope.uniqueId + '-' + i
        });
      }
      scope.title = dateFilter(this.activeDate, this.formatMonthTitle);
      scope.rows = this.split(months, 3);
    };
    this.compare = function(date1, date2) {
      var _date1 = new Date(date1.getFullYear(), date1.getMonth());
      var _date2 = new Date(date2.getFullYear(), date2.getMonth());
      _date1.setFullYear(date1.getFullYear());
      _date2.setFullYear(date2.getFullYear());
      return _date1 - _date2;
    };
    this.handleKeyDown = function(key, evt) {
      var date = this.activeDate.getMonth();
      if (key === 'left') {
        date = date - 1;
      } else if (key === 'up') {
        date = date - 3;
      } else if (key === 'right') {
        date = date + 1;
      } else if (key === 'down') {
        date = date + 3;
      } else if (key === 'pageup' || key === 'pagedown') {
        var year = this.activeDate.getFullYear() + (key === 'pageup' ? -1 : 1);
        this.activeDate.setFullYear(year);
      } else if (key === 'home') {
        date = 0;
      } else if (key === 'end') {
        date = 11;
      }
      this.activeDate.setMonth(date);
    };
  }])
  .controller('UibYearpickerController', ['$scope', '$element', 'dateFilter', function(scope, $element, dateFilter) {
    var columns, range;
    this.element = $element;

    function getStartingYear(year) {
      return parseInt((year - 1) / range, 10) * range + 1;
    }
    this.yearpickerInit = function() {
      columns = this.yearColumns;
      range = this.yearRows * columns;
      this.step = {
        years: range
      };
    };
    this._refreshView = function() {
      var years = new Array(range),
        date;
      for (var i = 0, start = getStartingYear(this.activeDate.getFullYear()); i < range; i++) {
        date = new Date(this.activeDate);
        date.setFullYear(start + i, 0, 1);
        years[i] = angular.extend(this.createDateObject(date, this.formatYear), {
          uid: scope.uniqueId + '-' + i
        });
      }
      scope.title = [years[0].label, years[range - 1].label].join(' - ');
      scope.rows = this.split(years, columns);
      scope.columns = columns;
    };
    this.compare = function(date1, date2) {
      return date1.getFullYear() - date2.getFullYear();
    };
    this.handleKeyDown = function(key, evt) {
      var date = this.activeDate.getFullYear();
      if (key === 'left') {
        date = date - 1;
      } else if (key === 'up') {
        date = date - columns;
      } else if (key === 'right') {
        date = date + 1;
      } else if (key === 'down') {
        date = date + columns;
      } else if (key === 'pageup' || key === 'pagedown') {
        date += (key === 'pageup' ? -1 : 1) * range;
      } else if (key === 'home') {
        date = getStartingYear(this.activeDate.getFullYear());
      } else if (key === 'end') {
        date = getStartingYear(this.activeDate.getFullYear()) + range - 1;
      }
      this.activeDate.setFullYear(date);
    };
  }])
  .directive('uibDatepicker', function() {
    return {
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/datepicker/datepicker.html';
      },
      scope: {
        datepickerMode: '=?',
        datepickerOptions: '=?',
        dateDisabled: '&',
        customClass: '&',
        shortcutPropagation: '&?'
      },
      require: ['uibDatepicker', '^ngModel'],
      controller: 'UibDatepickerController',
      controllerAs: 'datepicker',
      link: function(scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        datepickerCtrl.init(ngModelCtrl);
      }
    };
  })
  .directive('uibDaypicker', function() {
    return {
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/datepicker/day.html';
      },
      require: ['^uibDatepicker', 'uibDaypicker'],
      controller: 'UibDaypickerController',
      link: function(scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0],
          daypickerCtrl = ctrls[1];
        daypickerCtrl.init(datepickerCtrl);
      }
    };
  })
  .directive('uibMonthpicker', function() {
    return {
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/datepicker/month.html';
      },
      require: ['^uibDatepicker', 'uibMonthpicker'],
      controller: 'UibMonthpickerController',
      link: function(scope, element, attrs, ctrls) {
        var datepickerCtrl = ctrls[0],
          monthpickerCtrl = ctrls[1];
        monthpickerCtrl.init(datepickerCtrl);
      }
    };
  })
  .directive('uibYearpicker', function() {
    return {
      replace: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/datepicker/year.html';
      },
      require: ['^uibDatepicker', 'uibYearpicker'],
      controller: 'UibYearpickerController',
      link: function(scope, element, attrs, ctrls) {
        var ctrl = ctrls[0];
        angular.extend(ctrl, ctrls[1]);
        ctrl.yearpickerInit();
        ctrl.refreshView();
      }
    };
  })
  .constant('uibDatepickerPopupConfig', {
    altInputFormats: [],
    appendToBody: false,
    clearText: 'Clear',
    closeOnDateSelection: true,
    closeText: 'Done',
    currentText: 'Today',
    datepickerPopup: 'yyyy-MM-dd',
    datepickerPopupTemplateUrl: 'uib/template/datepicker/popup.html',
    datepickerTemplateUrl: 'uib/template/datepicker/datepicker.html',
    html5Types: {
      date: 'yyyy-MM-dd',
      'datetime-local': 'yyyy-MM-ddTHH:mm:ss.sss',
      'month': 'yyyy-MM'
    },
    onOpenFocus: true,
    showButtonBar: true
  })
  .controller('UibDatepickerPopupController', ['$scope', '$element', '$attrs', '$compile', '$parse', '$document', '$rootScope', '$uibPosition', 'dateFilter', 'uibDateParser', 'uibDatepickerPopupConfig', '$timeout', 'uibDatepickerConfig',
    function(scope, element, attrs, $compile, $parse, $document, $rootScope, $position, dateFilter, dateParser, datepickerPopupConfig, $timeout, datepickerConfig) {
      var cache = {},
        isHtml5DateInput = false;
      var dateFormat, closeOnDateSelection, appendToBody, onOpenFocus,
        datepickerPopupTemplateUrl, datepickerTemplateUrl, popupEl, datepickerEl,
        ngModel, ngModelOptions, $popup, altInputFormats, watchListeners = [];
      scope.watchData = {};
      this.init = function(_ngModel_) {
        ngModel = _ngModel_;
        ngModelOptions = _ngModel_.$options || datepickerConfig.ngModelOptions;
        closeOnDateSelection = angular.isDefined(attrs.closeOnDateSelection) ? scope.$parent.$eval(attrs.closeOnDateSelection) : datepickerPopupConfig.closeOnDateSelection;
        appendToBody = angular.isDefined(attrs.datepickerAppendToBody) ? scope.$parent.$eval(attrs.datepickerAppendToBody) : datepickerPopupConfig.appendToBody;
        onOpenFocus = angular.isDefined(attrs.onOpenFocus) ? scope.$parent.$eval(attrs.onOpenFocus) : datepickerPopupConfig.onOpenFocus;
        datepickerPopupTemplateUrl = angular.isDefined(attrs.datepickerPopupTemplateUrl) ? attrs.datepickerPopupTemplateUrl : datepickerPopupConfig.datepickerPopupTemplateUrl;
        datepickerTemplateUrl = angular.isDefined(attrs.datepickerTemplateUrl) ? attrs.datepickerTemplateUrl : datepickerPopupConfig.datepickerTemplateUrl;
        altInputFormats = angular.isDefined(attrs.altInputFormats) ? scope.$parent.$eval(attrs.altInputFormats) : datepickerPopupConfig.altInputFormats;
        scope.showButtonBar = angular.isDefined(attrs.showButtonBar) ? scope.$parent.$eval(attrs.showButtonBar) : datepickerPopupConfig.showButtonBar;
        if (datepickerPopupConfig.html5Types[attrs.type]) {
          dateFormat = datepickerPopupConfig.html5Types[attrs.type];
          isHtml5DateInput = true;
        } else {
          dateFormat = attrs.uibDatepickerPopup || datepickerPopupConfig.datepickerPopup;
          attrs.$observe('uibDatepickerPopup', function(value, oldValue) {
            var newDateFormat = value || datepickerPopupConfig.datepickerPopup;
            if (newDateFormat !== dateFormat) {
              dateFormat = newDateFormat;
              ngModel.$modelValue = null;
              if (!dateFormat) {
                throw new Error('uibDatepickerPopup must have a date format specified.');
              }
            }
          });
        }
        if (!dateFormat) {
          throw new Error('uibDatepickerPopup must have a date format specified.');
        }
        if (isHtml5DateInput && attrs.uibDatepickerPopup) {
          throw new Error('HTML5 date input types do not support custom formats.');
        }
        popupEl = angular.element('<div uib-datepicker-popup-wrap><div uib-datepicker></div></div>');
        scope.ngModelOptions = angular.copy(ngModelOptions);
        scope.ngModelOptions.timezone = null;
        popupEl.attr({
          'ng-model': 'date',
          'ng-model-options': 'ngModelOptions',
          'ng-change': 'dateSelection(date)',
          'template-url': datepickerPopupTemplateUrl
        });
        datepickerEl = angular.element(popupEl.children()[0]);
        datepickerEl.attr('template-url', datepickerTemplateUrl);
        if (isHtml5DateInput) {
          if (attrs.type === 'month') {
            datepickerEl.attr('datepicker-mode', '"month"');
            datepickerEl.attr('min-mode', 'month');
          }
        }
        if (scope.datepickerOptions) {
          angular.forEach(scope.datepickerOptions, function(value, option) {
            if (['minDate', 'maxDate', 'minMode', 'maxMode', 'initDate', 'datepickerMode'].indexOf(option) === -1) {
              datepickerEl.attr(cameltoDash(option), value);
            } else {
              datepickerEl.attr(cameltoDash(option), 'datepickerOptions.' + option);
            }
          });
        }
        angular.forEach(['minMode', 'maxMode', 'datepickerMode', 'shortcutPropagation'], function(key) {
          if (attrs[key]) {
            var getAttribute = $parse(attrs[key]);
            var propConfig = {
              get: function() {
                return getAttribute(scope.$parent);
              }
            };
            datepickerEl.attr(cameltoDash(key), 'watchData.' + key);
            if (key === 'datepickerMode') {
              var setAttribute = getAttribute.assign;
              propConfig.set = function(v) {
                setAttribute(scope.$parent, v);
              };
            }
            Object.defineProperty(scope.watchData, key, propConfig);
          }
        });
        angular.forEach(['minDate', 'maxDate', 'initDate'], function(key) {
          if (attrs[key]) {
            var getAttribute = $parse(attrs[key]);
            watchListeners.push(scope.$parent.$watch(getAttribute, function(value) {
              if (key === 'minDate' || key === 'maxDate') {
                if (value === null) {
                  cache[key] = null;
                } else if (angular.isDate(value)) {
                  cache[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
                } else {
                  cache[key] = new Date(dateFilter(value, 'medium'));
                }
                scope.watchData[key] = value === null ? null : cache[key];
              } else {
                scope.watchData[key] = dateParser.fromTimezone(new Date(value), ngModelOptions.timezone);
              }
            }));
            datepickerEl.attr(cameltoDash(key), 'watchData.' + key);
          }
        });
        if (attrs.dateDisabled) {
          datepickerEl.attr('date-disabled', 'dateDisabled({ date: date, mode: mode })');
        }
        angular.forEach(['formatDay', 'formatMonth', 'formatYear', 'formatDayHeader', 'formatDayTitle', 'formatMonthTitle', 'showWeeks', 'startingDay', 'yearRows', 'yearColumns'], function(key) {
          if (angular.isDefined(attrs[key])) {
            datepickerEl.attr(cameltoDash(key), attrs[key]);
          }
        });
        if (attrs.customClass) {
          datepickerEl.attr('custom-class', 'customClass({ date: date, mode: mode })');
        }
        if (!isHtml5DateInput) {
          ngModel.$$parserName = 'date';
          ngModel.$validators.date = validator;
          ngModel.$parsers.unshift(parseDate);
          ngModel.$formatters.push(function(value) {
            if (ngModel.$isEmpty(value)) {
              scope.date = value;
              return value;
            }
            scope.date = dateParser.fromTimezone(value, ngModelOptions.timezone);
            if (angular.isNumber(scope.date)) {
              scope.date = new Date(scope.date);
            }
            return dateParser.filter(scope.date, dateFormat);
          });
        } else {
          ngModel.$formatters.push(function(value) {
            scope.date = dateParser.fromTimezone(value, ngModelOptions.timezone);
            return value;
          });
        }
        ngModel.$viewChangeListeners.push(function() {
          scope.date = parseDateString(ngModel.$viewValue);
        });
        element.on('keydown', inputKeydownBind);
        $popup = $compile(popupEl)(scope);
        popupEl.remove();
        if (appendToBody) {
          $document.find('body').append($popup);
        } else {
          element.after($popup);
        }
        scope.$on('$destroy', function() {
          if (scope.isOpen === true) {
            if (!$rootScope.$$phase) {
              scope.$apply(function() {
                scope.isOpen = false;
              });
            }
          }
          $popup.remove();
          element.off('keydown', inputKeydownBind);
          $document.off('click', documentClickBind);
          while (watchListeners.length) {
            watchListeners.shift()();
          }
        });
      };
      scope.getText = function(key) {
        return scope[key + 'Text'] || datepickerPopupConfig[key + 'Text'];
      };
      scope.isDisabled = function(date) {
        if (date === 'today') {
          date = new Date();
        }
        return scope.watchData.minDate && scope.compare(date, cache.minDate) < 0 ||
          scope.watchData.maxDate && scope.compare(date, cache.maxDate) > 0;
      };
      scope.compare = function(date1, date2) {
        return new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()) - new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
      };
      scope.dateSelection = function(dt) {
        if (angular.isDefined(dt)) {
          scope.date = dt;
        }
        var date = scope.date ? dateParser.filter(scope.date, dateFormat) : null;
        element.val(date);
        ngModel.$setViewValue(date);
        if (closeOnDateSelection) {
          scope.isOpen = false;
          element[0].focus();
        }
      };
      scope.keydown = function(evt) {
        if (evt.which === 27) {
          evt.stopPropagation();
          scope.isOpen = false;
          element[0].focus();
        }
      };
      scope.select = function(date) {
        if (date === 'today') {
          var today = new Date();
          if (angular.isDate(scope.date)) {
            date = new Date(scope.date);
            date.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
          } else {
            date = new Date(today.setHours(0, 0, 0, 0));
          }
        }
        scope.dateSelection(date);
      };
      scope.close = function() {
        scope.isOpen = false;
        element[0].focus();
      };
      scope.disabled = angular.isDefined(attrs.disabled) || false;
      if (attrs.ngDisabled) {
        watchListeners.push(scope.$parent.$watch($parse(attrs.ngDisabled), function(disabled) {
          scope.disabled = disabled;
        }));
      }
      scope.$watch('isOpen', function(value) {
        if (value) {
          if (!scope.disabled) {
            scope.position = appendToBody ? $position.offset(element) : $position.position(element);
            scope.position.top = scope.position.top + element.prop('offsetHeight');
            $timeout(function() {
              if (onOpenFocus) {
                scope.$broadcast('uib:datepicker.focus');
              }
              $document.on('click', documentClickBind);
            }, 0, false);
          } else {
            scope.isOpen = false;
          }
        } else {
          $document.off('click', documentClickBind);
        }
      });

      function cameltoDash(string) {
        return string.replace(/([A-Z])/g, function($1) {
          return '-' + $1.toLowerCase();
        });
      }

      function parseDateString(viewValue) {
        var date = dateParser.parse(viewValue, dateFormat, scope.date);
        if (isNaN(date)) {
          for (var i = 0; i < altInputFormats.length; i++) {
            date = dateParser.parse(viewValue, altInputFormats[i], scope.date);
            if (!isNaN(date)) {
              return date;
            }
          }
        }
        return date;
      }

      function parseDate(viewValue) {
        if (angular.isNumber(viewValue)) {
          viewValue = new Date(viewValue);
        }
        if (!viewValue) {
          return null;
        }
        if (angular.isDate(viewValue) && !isNaN(viewValue)) {
          return viewValue;
        }
        if (angular.isString(viewValue)) {
          var date = parseDateString(viewValue);
          if (!isNaN(date)) {
            return dateParser.toTimezone(date, ngModelOptions.timezone);
          }
        }
        return ngModel.$options && ngModel.$options.allowInvalid ? viewValue : undefined;
      }

      function validator(modelValue, viewValue) {
        var value = modelValue || viewValue;
        if (!attrs.ngRequired && !value) {
          return true;
        }
        if (angular.isNumber(value)) {
          value = new Date(value);
        }
        if (!value) {
          return true;
        }
        if (angular.isDate(value) && !isNaN(value)) {
          return true;
        }
        if (angular.isString(value)) {
          return !isNaN(parseDateString(viewValue));
        }
        return false;
      }

      function documentClickBind(event) {
        if (!scope.isOpen && scope.disabled) {
          return;
        }
        var popup = $popup[0];
        var dpContainsTarget = element[0].contains(event.target);
        var popupContainsTarget = popup.contains !== undefined && popup.contains(event.target);
        if (scope.isOpen && !(dpContainsTarget || popupContainsTarget)) {
          scope.$apply(function() {
            scope.isOpen = false;
          });
        }
      }

      function inputKeydownBind(evt) {
        if (evt.which === 27 && scope.isOpen) {
          evt.preventDefault();
          evt.stopPropagation();
          scope.$apply(function() {
            scope.isOpen = false;
          });
          element[0].focus();
        } else if (evt.which === 40 && !scope.isOpen) {
          evt.preventDefault();
          evt.stopPropagation();
          scope.$apply(function() {
            scope.isOpen = true;
          });
        }
      }
    }
  ])
  .directive('uibDatepickerPopup', function() {
    return {
      require: ['ngModel', 'uibDatepickerPopup'],
      controller: 'UibDatepickerPopupController',
      scope: {
        datepickerOptions: '=?',
        isOpen: '=?',
        currentText: '@',
        clearText: '@',
        closeText: '@',
        dateDisabled: '&',
        customClass: '&'
      },
      link: function(scope, element, attrs, ctrls) {
        var ngModel = ctrls[0],
          ctrl = ctrls[1];
        ctrl.init(ngModel);
      }
    };
  })
  .directive('uibDatepickerPopupWrap', function() {
    return {
      replace: true,
      transclude: true,
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/datepicker/popup.html';
      }
    };
  });
angular.module('ui.bootstrap.debounce', [])
  .factory('$$debounce', ['$timeout', function($timeout) {
    return function(callback, debounceTime) {
      var timeoutPromise;
      return function() {
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        if (timeoutPromise) {
          $timeout.cancel(timeoutPromise);
        }
        timeoutPromise = $timeout(function() {
          callback.apply(self, args);
        }, debounceTime);
      };
    };
  }]);
angular.module('ui.bootstrap.dropdown', ['ui.bootstrap.position'])
  .constant('uibDropdownConfig', {
    appendToOpenClass: 'uib-dropdown-open',
    openClass: 'open'
  })
  .service('uibDropdownService', ['$document', '$rootScope', function($document, $rootScope) {
    var openScope = null;
    this.open = function(dropdownScope) {
      if (!openScope) {
        $document.on('click', closeDropdown);
        $document.on('keydown', keybindFilter);
      }
      if (openScope && openScope !== dropdownScope) {
        openScope.isOpen = false;
      }
      openScope = dropdownScope;
    };
    this.close = function(dropdownScope) {
      if (openScope === dropdownScope) {
        openScope = null;
        $document.off('click', closeDropdown);
        $document.off('keydown', keybindFilter);
      }
    };
    var closeDropdown = function(evt) {
      if (!openScope) {
        return;
      }
      if (evt && openScope.getAutoClose() === 'disabled') {
        return;
      }
      if (evt && evt.which === 3) {
        return;
      }
      var toggleElement = openScope.getToggleElement();
      if (evt && toggleElement && toggleElement[0].contains(evt.target)) {
        return;
      }
      var dropdownElement = openScope.getDropdownElement();
      if (evt && openScope.getAutoClose() === 'outsideClick' &&
        dropdownElement && dropdownElement[0].contains(evt.target)) {
        return;
      }
      openScope.isOpen = false;
      if (!$rootScope.$$phase) {
        openScope.$apply();
      }
    };
    var keybindFilter = function(evt) {
      if (evt.which === 27) {
        openScope.focusToggleElement();
        closeDropdown();
      } else if (openScope.isKeynavEnabled() && [38, 40].indexOf(evt.which) !== -1 && openScope.isOpen) {
        evt.preventDefault();
        evt.stopPropagation();
        openScope.focusDropdownEntry(evt.which);
      }
    };
  }])
  .controller('UibDropdownController', ['$scope', '$element', '$attrs', '$parse', 'uibDropdownConfig', 'uibDropdownService', '$animate', '$uibPosition', '$document', '$compile', '$templateRequest', function($scope, $element, $attrs, $parse, dropdownConfig, uibDropdownService, $animate, $position, $document, $compile, $templateRequest) {
    var self = this,
      scope = $scope.$new(),
      templateScope,
      appendToOpenClass = dropdownConfig.appendToOpenClass,
      openClass = dropdownConfig.openClass,
      getIsOpen,
      setIsOpen = angular.noop,
      toggleInvoker = $attrs.onToggle ? $parse($attrs.onToggle) : angular.noop,
      appendToBody = false,
      appendTo = null,
      keynavEnabled = false,
      selectedOption = null,
      body = $document.find('body');
    $element.addClass('dropdown');
    this.init = function() {
      if ($attrs.isOpen) {
        getIsOpen = $parse($attrs.isOpen);
        setIsOpen = getIsOpen.assign;
        $scope.$watch(getIsOpen, function(value) {
          scope.isOpen = !!value;
        });
      }
      if (angular.isDefined($attrs.dropdownAppendTo)) {
        var appendToEl = $parse($attrs.dropdownAppendTo)(scope);
        if (appendToEl) {
          appendTo = angular.element(appendToEl);
        }
      }
      appendToBody = angular.isDefined($attrs.dropdownAppendToBody);
      keynavEnabled = angular.isDefined($attrs.keyboardNav);
      if (appendToBody && !appendTo) {
        appendTo = body;
      }
      if (appendTo && self.dropdownMenu) {
        appendTo.append(self.dropdownMenu);
        $element.on('$destroy', function handleDestroyEvent() {
          self.dropdownMenu.remove();
        });
      }
    };
    this.toggle = function(open) {
      return scope.isOpen = arguments.length ? !!open : !scope.isOpen;
    };
    this.isOpen = function() {
      return scope.isOpen;
    };
    scope.getToggleElement = function() {
      return self.toggleElement;
    };
    scope.getAutoClose = function() {
      return $attrs.autoClose || 'always';
    };
    scope.getElement = function() {
      return $element;
    };
    scope.isKeynavEnabled = function() {
      return keynavEnabled;
    };
    scope.focusDropdownEntry = function(keyCode) {
      var elems = self.dropdownMenu ?
        angular.element(self.dropdownMenu).find('a') :
        $element.find('ul').eq(0).find('a');
      switch (keyCode) {
        case 40:
          {
            if (!angular.isNumber(self.selectedOption)) {
              self.selectedOption = 0;
            } else {
              self.selectedOption = self.selectedOption === elems.length - 1 ?
                self.selectedOption :
                self.selectedOption + 1;
            }
            break;
          }
        case 38:
          {
            if (!angular.isNumber(self.selectedOption)) {
              self.selectedOption = elems.length - 1;
            } else {
              self.selectedOption = self.selectedOption === 0 ?
                0 : self.selectedOption - 1;
            }
            break;
          }
      }
      elems[self.selectedOption].focus();
    };
    scope.getDropdownElement = function() {
      return self.dropdownMenu;
    };
    scope.focusToggleElement = function() {
      if (self.toggleElement) {
        self.toggleElement[0].focus();
      }
    };
    scope.$watch('isOpen', function(isOpen, wasOpen) {
      if (appendTo && self.dropdownMenu) {
        var pos = $position.positionElements($element, self.dropdownMenu, 'bottom-left', true),
          css,
          rightalign;
        css = {
          top: pos.top + 'px',
          display: isOpen ? 'block' : 'none'
        };
        rightalign = self.dropdownMenu.hasClass('dropdown-menu-right');
        if (!rightalign) {
          css.left = pos.left + 'px';
          css.right = 'auto';
        } else {
          css.left = 'auto';
          css.right = window.innerWidth -
            (pos.left + $element.prop('offsetWidth')) + 'px';
        }
        if (!appendToBody) {
          var appendOffset = $position.offset(appendTo);
          css.top = pos.top - appendOffset.top + 'px';
          if (!rightalign) {
            css.left = pos.left - appendOffset.left + 'px';
          } else {
            css.right = window.innerWidth -
              (pos.left - appendOffset.left + $element.prop('offsetWidth')) + 'px';
          }
        }
        self.dropdownMenu.css(css);
      }
      var openContainer = appendTo ? appendTo : $element;
      $animate[isOpen ? 'addClass' : 'removeClass'](openContainer, appendTo ? appendToOpenClass : openClass).then(function() {
        if (angular.isDefined(isOpen) && isOpen !== wasOpen) {
          toggleInvoker($scope, {
            open: !!isOpen
          });
        }
      });
      if (isOpen) {
        if (self.dropdownMenuTemplateUrl) {
          $templateRequest(self.dropdownMenuTemplateUrl).then(function(tplContent) {
            templateScope = scope.$new();
            $compile(tplContent.trim())(templateScope, function(dropdownElement) {
              var newEl = dropdownElement;
              self.dropdownMenu.replaceWith(newEl);
              self.dropdownMenu = newEl;
            });
          });
        }
        scope.focusToggleElement();
        uibDropdownService.open(scope);
      } else {
        if (self.dropdownMenuTemplateUrl) {
          if (templateScope) {
            templateScope.$destroy();
          }
          var newEl = angular.element('<ul class="dropdown-menu"></ul>');
          self.dropdownMenu.replaceWith(newEl);
          self.dropdownMenu = newEl;
        }
        uibDropdownService.close(scope);
        self.selectedOption = null;
      }
      if (angular.isFunction(setIsOpen)) {
        setIsOpen($scope, isOpen);
      }
    });
    $scope.$on('$locationChangeSuccess', function() {
      if (scope.getAutoClose() !== 'disabled') {
        scope.isOpen = false;
      }
    });
  }])
  .directive('uibDropdown', function() {
    return {
      controller: 'UibDropdownController',
      link: function(scope, element, attrs, dropdownCtrl) {
        dropdownCtrl.init();
      }
    };
  })
  .directive('uibDropdownMenu', function() {
    return {
      restrict: 'A',
      require: '?^uibDropdown',
      link: function(scope, element, attrs, dropdownCtrl) {
        if (!dropdownCtrl || angular.isDefined(attrs.dropdownNested)) {
          return;
        }
        element.addClass('dropdown-menu');
        var tplUrl = attrs.templateUrl;
        if (tplUrl) {
          dropdownCtrl.dropdownMenuTemplateUrl = tplUrl;
        }
        if (!dropdownCtrl.dropdownMenu) {
          dropdownCtrl.dropdownMenu = element;
        }
      }
    };
  })
  .directive('uibDropdownToggle', function() {
    return {
      require: '?^uibDropdown',
      link: function(scope, element, attrs, dropdownCtrl) {
        if (!dropdownCtrl) {
          return;
        }
        element.addClass('dropdown-toggle');
        dropdownCtrl.toggleElement = element;
        var toggleDropdown = function(event) {
          event.preventDefault();
          if (!element.hasClass('disabled') && !attrs.disabled) {
            scope.$apply(function() {
              dropdownCtrl.toggle();
            });
          }
        };
        element.bind('click', toggleDropdown);
        element.attr({
          'aria-haspopup': true,
          'aria-expanded': false
        });
        scope.$watch(dropdownCtrl.isOpen, function(isOpen) {
          element.attr('aria-expanded', !!isOpen);
        });
        scope.$on('$destroy', function() {
          element.unbind('click', toggleDropdown);
        });
      }
    };
  });
angular.module('ui.bootstrap.stackedMap', [])
  .factory('$$stackedMap', function() {
    return {
      createNew: function() {
        var stack = [];
        return {
          add: function(key, value) {
            stack.push({
              key: key,
              value: value
            });
          },
          get: function(key) {
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                return stack[i];
              }
            }
          },
          keys: function() {
            var keys = [];
            for (var i = 0; i < stack.length; i++) {
              keys.push(stack[i].key);
            }
            return keys;
          },
          top: function() {
            return stack[stack.length - 1];
          },
          remove: function(key) {
            var idx = -1;
            for (var i = 0; i < stack.length; i++) {
              if (key === stack[i].key) {
                idx = i;
                break;
              }
            }
            return stack.splice(idx, 1)[0];
          },
          removeTop: function() {
            return stack.splice(stack.length - 1, 1)[0];
          },
          length: function() {
            return stack.length;
          }
        };
      }
    };
  });
angular.module('ui.bootstrap.modal', ['ui.bootstrap.stackedMap'])
  .factory('$$multiMap', function() {
    return {
      createNew: function() {
        var map = {};
        return {
          entries: function() {
            return Object.keys(map).map(function(key) {
              return {
                key: key,
                value: map[key]
              };
            });
          },
          get: function(key) {
            return map[key];
          },
          hasKey: function(key) {
            return !!map[key];
          },
          keys: function() {
            return Object.keys(map);
          },
          put: function(key, value) {
            if (!map[key]) {
              map[key] = [];
            }
            map[key].push(value);
          },
          remove: function(key, value) {
            var values = map[key];
            if (!values) {
              return;
            }
            var idx = values.indexOf(value);
            if (idx !== -1) {
              values.splice(idx, 1);
            }
            if (!values.length) {
              delete map[key];
            }
          }
        };
      }
    };
  })
  .provider('$uibResolve', function() {
    var resolve = this;
    this.resolver = null;
    this.setResolver = function(resolver) {
      this.resolver = resolver;
    };
    this.$get = ['$injector', '$q', function($injector, $q) {
      var resolver = resolve.resolver ? $injector.get(resolve.resolver) : null;
      return {
        resolve: function(invocables, locals, parent, self) {
          if (resolver) {
            return resolver.resolve(invocables, locals, parent, self);
          }
          var promises = [];
          angular.forEach(invocables, function(value) {
            if (angular.isFunction(value) || angular.isArray(value)) {
              promises.push($q.resolve($injector.invoke(value)));
            } else if (angular.isString(value)) {
              promises.push($q.resolve($injector.get(value)));
            } else {
              promises.push($q.resolve(value));
            }
          });
          return $q.all(promises).then(function(resolves) {
            var resolveObj = {};
            var resolveIter = 0;
            angular.forEach(invocables, function(value, key) {
              resolveObj[key] = resolves[resolveIter++];
            });
            return resolveObj;
          });
        }
      };
    }];
  })
  .directive('uibModalBackdrop', ['$animateCss', '$injector', '$uibModalStack',
    function($animateCss, $injector, $modalStack) {
      return {
        replace: true,
        templateUrl: 'uib/template/modal/backdrop.html',
        compile: function(tElement, tAttrs) {
          tElement.addClass(tAttrs.backdropClass);
          return linkFn;
        }
      };

      function linkFn(scope, element, attrs) {
        if (attrs.modalInClass) {
          $animateCss(element, {
            addClass: attrs.modalInClass
          }).start();
          scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
            var done = setIsAsync();
            if (scope.modalOptions.animation) {
              $animateCss(element, {
                removeClass: attrs.modalInClass
              }).start().then(done);
            } else {
              done();
            }
          });
        }
      }
    }
  ])
  .directive('uibModalWindow', ['$uibModalStack', '$q', '$animate', '$animateCss', '$document',
    function($modalStack, $q, $animate, $animateCss, $document) {
      return {
        scope: {
          index: '@'
        },
        replace: true,
        transclude: true,
        templateUrl: function(tElement, tAttrs) {
          return tAttrs.templateUrl || 'uib/template/modal/window.html';
        },
        link: function(scope, element, attrs) {
          element.addClass(attrs.windowClass || '');
          element.addClass(attrs.windowTopClass || '');
          scope.size = attrs.size;
          scope.close = function(evt) {
            var modal = $modalStack.getTop();
            if (modal && modal.value.backdrop &&
              modal.value.backdrop !== 'static' &&
              evt.target === evt.currentTarget) {
              evt.preventDefault();
              evt.stopPropagation();
              $modalStack.dismiss(modal.key, 'backdrop click');
            }
          };
          element.on('click', scope.close);
          scope.$isRendered = true;
          var modalRenderDeferObj = $q.defer();
          attrs.$observe('modalRender', function(value) {
            if (value === 'true') {
              modalRenderDeferObj.resolve();
            }
          });
          modalRenderDeferObj.promise.then(function() {
            var animationPromise = null;
            if (attrs.modalInClass) {
              animationPromise = $animateCss(element, {
                addClass: attrs.modalInClass
              }).start();
              scope.$on($modalStack.NOW_CLOSING_EVENT, function(e, setIsAsync) {
                var done = setIsAsync();
                if ($animateCss) {
                  $animateCss(element, {
                    removeClass: attrs.modalInClass
                  }).start().then(done);
                } else {
                  $animate.removeClass(element, attrs.modalInClass).then(done);
                }
              });
            }
            $q.when(animationPromise).then(function() {
              if (!($document[0].activeElement && element[0].contains($document[0].activeElement))) {
                var inputWithAutofocus = element[0].querySelector('[autofocus]');
                if (inputWithAutofocus) {
                  inputWithAutofocus.focus();
                } else {
                  element[0].focus();
                }
              }
            });
            var modal = $modalStack.getTop();
            if (modal) {
              $modalStack.modalRendered(modal.key);
            }
          });
        }
      };
    }
  ])
  .directive('uibModalAnimationClass', function() {
    return {
      compile: function(tElement, tAttrs) {
        if (tAttrs.modalAnimation) {
          tElement.addClass(tAttrs.uibModalAnimationClass);
        }
      }
    };
  })
  .directive('uibModalTransclude', function() {
    return {
      link: function(scope, element, attrs, controller, transclude) {
        transclude(scope.$parent, function(clone) {
          element.empty();
          element.append(clone);
        });
      }
    };
  })
  .factory('$uibModalStack', ['$animate', '$animateCss', '$document',
    '$compile', '$rootScope', '$q', '$$multiMap', '$$stackedMap',
    function($animate, $animateCss, $document, $compile, $rootScope, $q, $$multiMap, $$stackedMap) {
      var OPENED_MODAL_CLASS = 'modal-open';
      var backdropDomEl, backdropScope;
      var openedWindows = $$stackedMap.createNew();
      var openedClasses = $$multiMap.createNew();
      var $modalStack = {
        NOW_CLOSING_EVENT: 'modal.stack.now-closing'
      };
      var focusableElementList;
      var focusIndex = 0;
      var tababbleSelector = 'a[href], area[href], input:not([disabled]), ' +
        'button:not([disabled]),select:not([disabled]), textarea:not([disabled]), ' +
        'iframe, object, embed, *[tabindex], *[contenteditable=true]';

      function backdropIndex() {
        var topBackdropIndex = -1;
        var opened = openedWindows.keys();
        for (var i = 0; i < opened.length; i++) {
          if (openedWindows.get(opened[i]).value.backdrop) {
            topBackdropIndex = i;
          }
        }
        return topBackdropIndex;
      }
      $rootScope.$watch(backdropIndex, function(newBackdropIndex) {
        if (backdropScope) {
          backdropScope.index = newBackdropIndex;
        }
      });

      function removeModalWindow(modalInstance, elementToReceiveFocus) {
        var modalWindow = openedWindows.get(modalInstance).value;
        var appendToElement = modalWindow.appendTo;
        openedWindows.remove(modalInstance);
        removeAfterAnimate(modalWindow.modalDomEl, modalWindow.modalScope, function() {
          var modalBodyClass = modalWindow.openedClass || OPENED_MODAL_CLASS;
          openedClasses.remove(modalBodyClass, modalInstance);
          appendToElement.toggleClass(modalBodyClass, openedClasses.hasKey(modalBodyClass));
          toggleTopWindowClass(true);
        }, modalWindow.closedDeferred);
        checkRemoveBackdrop();
        if (elementToReceiveFocus && elementToReceiveFocus.focus) {
          elementToReceiveFocus.focus();
        } else if (appendToElement.focus) {
          appendToElement.focus();
        }
      }

      function toggleTopWindowClass(toggleSwitch) {
        var modalWindow;
        if (openedWindows.length() > 0) {
          modalWindow = openedWindows.top().value;
          modalWindow.modalDomEl.toggleClass(modalWindow.windowTopClass || '', toggleSwitch);
        }
      }

      function checkRemoveBackdrop() {
        if (backdropDomEl && backdropIndex() === -1) {
          var backdropScopeRef = backdropScope;
          removeAfterAnimate(backdropDomEl, backdropScope, function() {
            backdropScopeRef = null;
          });
          backdropDomEl = undefined;
          backdropScope = undefined;
        }
      }

      function removeAfterAnimate(domEl, scope, done, closedDeferred) {
        var asyncDeferred;
        var asyncPromise = null;
        var setIsAsync = function() {
          if (!asyncDeferred) {
            asyncDeferred = $q.defer();
            asyncPromise = asyncDeferred.promise;
          }
          return function asyncDone() {
            asyncDeferred.resolve();
          };
        };
        scope.$broadcast($modalStack.NOW_CLOSING_EVENT, setIsAsync);
        return $q.when(asyncPromise).then(afterAnimating);

        function afterAnimating() {
          if (afterAnimating.done) {
            return;
          }
          afterAnimating.done = true;
          $animateCss(domEl, {
            event: 'leave'
          }).start().then(function() {
            domEl.remove();
            if (closedDeferred) {
              closedDeferred.resolve();
            }
          });
          scope.$destroy();
          if (done) {
            done();
          }
        }
      }
      $document.on('keydown', keydownListener);
      $rootScope.$on('$destroy', function() {
        $document.off('keydown', keydownListener);
      });

      function keydownListener(evt) {
        if (evt.isDefaultPrevented()) {
          return evt;
        }
        var modal = openedWindows.top();
        if (modal) {
          switch (evt.which) {
            case 27:
              {
                if (modal.value.keyboard) {
                  evt.preventDefault();
                  $rootScope.$apply(function() {
                    $modalStack.dismiss(modal.key, 'escape key press');
                  });
                }
                break;
              }
            case 9:
              {
                $modalStack.loadFocusElementList(modal);
                var focusChanged = false;
                if (evt.shiftKey) {
                  if ($modalStack.isFocusInFirstItem(evt) || $modalStack.isModalFocused(evt, modal)) {
                    focusChanged = $modalStack.focusLastFocusableElement();
                  }
                } else {
                  if ($modalStack.isFocusInLastItem(evt)) {
                    focusChanged = $modalStack.focusFirstFocusableElement();
                  }
                }
                if (focusChanged) {
                  evt.preventDefault();
                  evt.stopPropagation();
                }
                break;
              }
          }
        }
      }
      $modalStack.open = function(modalInstance, modal) {
        var modalOpener = $document[0].activeElement,
          modalBodyClass = modal.openedClass || OPENED_MODAL_CLASS;
        toggleTopWindowClass(false);
        openedWindows.add(modalInstance, {
          deferred: modal.deferred,
          renderDeferred: modal.renderDeferred,
          closedDeferred: modal.closedDeferred,
          modalScope: modal.scope,
          backdrop: modal.backdrop,
          keyboard: modal.keyboard,
          openedClass: modal.openedClass,
          windowTopClass: modal.windowTopClass,
          animation: modal.animation,
          appendTo: modal.appendTo
        });
        openedClasses.put(modalBodyClass, modalInstance);
        var appendToElement = modal.appendTo,
          currBackdropIndex = backdropIndex();
        if (!appendToElement.length) {
          throw new Error('appendTo element not found. Make sure that the element passed is in DOM.');
        }
        if (currBackdropIndex >= 0 && !backdropDomEl) {
          backdropScope = $rootScope.$new(true);
          backdropScope.modalOptions = modal;
          backdropScope.index = currBackdropIndex;
          backdropDomEl = angular.element('<div uib-modal-backdrop="modal-backdrop"></div>');
          backdropDomEl.attr('backdrop-class', modal.backdropClass);
          if (modal.animation) {
            backdropDomEl.attr('modal-animation', 'true');
          }
          $compile(backdropDomEl)(backdropScope);
          $animate.enter(backdropDomEl, appendToElement);
        }
        var angularDomEl = angular.element('<div uib-modal-window="modal-window"></div>');
        angularDomEl.attr({
          'template-url': modal.windowTemplateUrl,
          'window-class': modal.windowClass,
          'window-top-class': modal.windowTopClass,
          'size': modal.size,
          'index': openedWindows.length() - 1,
          'animate': 'animate'
        }).html(modal.content);
        if (modal.animation) {
          angularDomEl.attr('modal-animation', 'true');
        }
        $animate.enter($compile(angularDomEl)(modal.scope), appendToElement)
          .then(function() {
            $animate.addClass(appendToElement, modalBodyClass);
          });
        openedWindows.top().value.modalDomEl = angularDomEl;
        openedWindows.top().value.modalOpener = modalOpener;
        $modalStack.clearFocusListCache();
      };

      function broadcastClosing(modalWindow, resultOrReason, closing) {
        return !modalWindow.value.modalScope.$broadcast('modal.closing', resultOrReason, closing).defaultPrevented;
      }
      $modalStack.close = function(modalInstance, result) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, result, true)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.resolve(result);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };
      $modalStack.dismiss = function(modalInstance, reason) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow && broadcastClosing(modalWindow, reason, false)) {
          modalWindow.value.modalScope.$$uibDestructionScheduled = true;
          modalWindow.value.deferred.reject(reason);
          removeModalWindow(modalInstance, modalWindow.value.modalOpener);
          return true;
        }
        return !modalWindow;
      };
      $modalStack.dismissAll = function(reason) {
        var topModal = this.getTop();
        while (topModal && this.dismiss(topModal.key, reason)) {
          topModal = this.getTop();
        }
      };
      $modalStack.getTop = function() {
        return openedWindows.top();
      };
      $modalStack.modalRendered = function(modalInstance) {
        var modalWindow = openedWindows.get(modalInstance);
        if (modalWindow) {
          modalWindow.value.renderDeferred.resolve();
        }
      };
      $modalStack.focusFirstFocusableElement = function() {
        if (focusableElementList.length > 0) {
          focusableElementList[0].focus();
          return true;
        }
        return false;
      };
      $modalStack.focusLastFocusableElement = function() {
        if (focusableElementList.length > 0) {
          focusableElementList[focusableElementList.length - 1].focus();
          return true;
        }
        return false;
      };
      $modalStack.isModalFocused = function(evt, modalWindow) {
        if (evt && modalWindow) {
          var modalDomEl = modalWindow.value.modalDomEl;
          if (modalDomEl && modalDomEl.length) {
            return (evt.target || evt.srcElement) === modalDomEl[0];
          }
        }
        return false;
      };
      $modalStack.isFocusInFirstItem = function(evt) {
        if (focusableElementList.length > 0) {
          return (evt.target || evt.srcElement) === focusableElementList[0];
        }
        return false;
      };
      $modalStack.isFocusInLastItem = function(evt) {
        if (focusableElementList.length > 0) {
          return (evt.target || evt.srcElement) === focusableElementList[focusableElementList.length - 1];
        }
        return false;
      };
      $modalStack.clearFocusListCache = function() {
        focusableElementList = [];
        focusIndex = 0;
      };
      $modalStack.loadFocusElementList = function(modalWindow) {
        if (focusableElementList === undefined || !focusableElementList.length) {
          if (modalWindow) {
            var modalDomE1 = modalWindow.value.modalDomEl;
            if (modalDomE1 && modalDomE1.length) {
              focusableElementList = modalDomE1[0].querySelectorAll(tababbleSelector);
            }
          }
        }
      };
      return $modalStack;
    }
  ])
  .provider('$uibModal', function() {
    var $modalProvider = {
      options: {
        animation: true,
        backdrop: true,
        keyboard: true
      },
      $get: ['$rootScope', '$q', '$document', '$templateRequest', '$controller', '$uibResolve', '$uibModalStack',
        function($rootScope, $q, $document, $templateRequest, $controller, $uibResolve, $modalStack) {
          var $modal = {};

          function getTemplatePromise(options) {
            return options.template ? $q.when(options.template) :
              $templateRequest(angular.isFunction(options.templateUrl) ?
                options.templateUrl() : options.templateUrl);
          }
          var promiseChain = null;
          $modal.getPromiseChain = function() {
            return promiseChain;
          };
          $modal.open = function(modalOptions) {
            var modalResultDeferred = $q.defer();
            var modalOpenedDeferred = $q.defer();
            var modalClosedDeferred = $q.defer();
            var modalRenderDeferred = $q.defer();
            var modalInstance = {
              result: modalResultDeferred.promise,
              opened: modalOpenedDeferred.promise,
              closed: modalClosedDeferred.promise,
              rendered: modalRenderDeferred.promise,
              close: function(result) {
                return $modalStack.close(modalInstance, result);
              },
              dismiss: function(reason) {
                return $modalStack.dismiss(modalInstance, reason);
              }
            };
            modalOptions = angular.extend({}, $modalProvider.options, modalOptions);
            modalOptions.resolve = modalOptions.resolve || {};
            modalOptions.appendTo = modalOptions.appendTo || $document.find('body').eq(0);
            if (!modalOptions.template && !modalOptions.templateUrl) {
              throw new Error('One of template or templateUrl options is required.');
            }
            var templateAndResolvePromise =
              $q.all([getTemplatePromise(modalOptions), $uibResolve.resolve(modalOptions.resolve, {}, null, null)]);

            function resolveWithTemplate() {
              return templateAndResolvePromise;
            }
            var samePromise;
            samePromise = promiseChain = $q.all([promiseChain])
              .then(resolveWithTemplate, resolveWithTemplate)
              .then(function resolveSuccess(tplAndVars) {
                var providedScope = modalOptions.scope || $rootScope;
                var modalScope = providedScope.$new();
                modalScope.$close = modalInstance.close;
                modalScope.$dismiss = modalInstance.dismiss;
                modalScope.$on('$destroy', function() {
                  if (!modalScope.$$uibDestructionScheduled) {
                    modalScope.$dismiss('$uibUnscheduledDestruction');
                  }
                });
                var ctrlInstance, ctrlLocals = {};
                if (modalOptions.controller) {
                  ctrlLocals.$scope = modalScope;
                  ctrlLocals.$uibModalInstance = modalInstance;
                  angular.forEach(tplAndVars[1], function(value, key) {
                    ctrlLocals[key] = value;
                  });
                  ctrlInstance = $controller(modalOptions.controller, ctrlLocals);
                  if (modalOptions.controllerAs) {
                    if (modalOptions.bindToController) {
                      ctrlInstance.$close = modalScope.$close;
                      ctrlInstance.$dismiss = modalScope.$dismiss;
                      angular.extend(ctrlInstance, providedScope);
                    }
                    modalScope[modalOptions.controllerAs] = ctrlInstance;
                  }
                }
                $modalStack.open(modalInstance, {
                  scope: modalScope,
                  deferred: modalResultDeferred,
                  renderDeferred: modalRenderDeferred,
                  closedDeferred: modalClosedDeferred,
                  content: tplAndVars[0],
                  animation: modalOptions.animation,
                  backdrop: modalOptions.backdrop,
                  keyboard: modalOptions.keyboard,
                  backdropClass: modalOptions.backdropClass,
                  windowTopClass: modalOptions.windowTopClass,
                  windowClass: modalOptions.windowClass,
                  windowTemplateUrl: modalOptions.windowTemplateUrl,
                  size: modalOptions.size,
                  openedClass: modalOptions.openedClass,
                  appendTo: modalOptions.appendTo
                });
                modalOpenedDeferred.resolve(true);
              }, function resolveError(reason) {
                modalOpenedDeferred.reject(reason);
                modalResultDeferred.reject(reason);
              })['finally'](function() {
                if (promiseChain === samePromise) {
                  promiseChain = null;
                }
              });
            return modalInstance;
          };
          return $modal;
        }
      ]
    };
    return $modalProvider;
  });
angular.module('ui.bootstrap.paging', [])
  .factory('uibPaging', ['$parse', function($parse) {
    return {
      create: function(ctrl, $scope, $attrs) {
        ctrl.setNumPages = $attrs.numPages ? $parse($attrs.numPages).assign : angular.noop;
        ctrl.ngModelCtrl = {
          $setViewValue: angular.noop
        };
        ctrl._watchers = [];
        ctrl.init = function(ngModelCtrl, config) {
          ctrl.ngModelCtrl = ngModelCtrl;
          ctrl.config = config;
          ngModelCtrl.$render = function() {
            ctrl.render();
          };
          if ($attrs.itemsPerPage) {
            ctrl._watchers.push($scope.$parent.$watch($parse($attrs.itemsPerPage), function(value) {
              ctrl.itemsPerPage = parseInt(value, 10);
              $scope.totalPages = ctrl.calculateTotalPages();
              ctrl.updatePage();
            }));
          } else {
            ctrl.itemsPerPage = config.itemsPerPage;
          }
          $scope.$watch('totalItems', function(newTotal, oldTotal) {
            if (angular.isDefined(newTotal) || newTotal !== oldTotal) {
              $scope.totalPages = ctrl.calculateTotalPages();
              ctrl.updatePage();
            }
          });
        };
        ctrl.calculateTotalPages = function() {
          var totalPages = ctrl.itemsPerPage < 1 ? 1 : Math.ceil($scope.totalItems / ctrl.itemsPerPage);
          return Math.max(totalPages || 0, 1);
        };
        ctrl.render = function() {
          $scope.page = parseInt(ctrl.ngModelCtrl.$viewValue, 10) || 1;
        };
        $scope.selectPage = function(page, evt) {
          if (evt) {
            evt.preventDefault();
          }
          var clickAllowed = !$scope.ngDisabled || !evt;
          if (clickAllowed && $scope.page !== page && page > 0 && page <= $scope.totalPages) {
            if (evt && evt.target) {
              evt.target.blur();
            }
            ctrl.ngModelCtrl.$setViewValue(page);
            ctrl.ngModelCtrl.$render();
          }
        };
        $scope.getText = function(key) {
          return $scope[key + 'Text'] || ctrl.config[key + 'Text'];
        };
        $scope.noPrevious = function() {
          return $scope.page === 1;
        };
        $scope.noNext = function() {
          return $scope.page === $scope.totalPages;
        };
        ctrl.updatePage = function() {
          ctrl.setNumPages($scope.$parent, $scope.totalPages);
          if ($scope.page > $scope.totalPages) {
            $scope.selectPage($scope.totalPages);
          } else {
            ctrl.ngModelCtrl.$render();
          }
        };
        $scope.$on('$destroy', function() {
          while (ctrl._watchers.length) {
            ctrl._watchers.shift()();
          }
        });
      }
    };
  }]);
angular.module('ui.bootstrap.pager', ['ui.bootstrap.paging'])
  .controller('UibPagerController', ['$scope', '$attrs', 'uibPaging', 'uibPagerConfig', function($scope, $attrs, uibPaging, uibPagerConfig) {
    $scope.align = angular.isDefined($attrs.align) ? $scope.$parent.$eval($attrs.align) : uibPagerConfig.align;
    uibPaging.create(this, $scope, $attrs);
  }])
  .constant('uibPagerConfig', {
    itemsPerPage: 10,
    previousText: '« Previous',
    nextText: 'Next »',
    align: true
  })
  .directive('uibPager', ['uibPagerConfig', function(uibPagerConfig) {
    return {
      scope: {
        totalItems: '=',
        previousText: '@',
        nextText: '@',
        ngDisabled: '='
      },
      require: ['uibPager', '?ngModel'],
      controller: 'UibPagerController',
      controllerAs: 'pager',
      templateUrl: function(element, attrs) {
        return attrs.templateUrl || 'uib/template/pager/pager.html';
      },
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var paginationCtrl = ctrls[0],
          ngModelCtrl = ctrls[1];
        if (!ngModelCtrl) {
          return;
        }
        paginationCtrl.init(ngModelCtrl, uibPagerConfig);
      }
    };
  }]);
angular.module('ui.bootstrap.pagination', ['ui.bootstrap.paging'])
  .controller('UibPaginationController', ['$scope', '$attrs', '$parse', 'uibPaging', 'uibPaginationConfig', function($scope, $attrs, $parse, uibPaging, uibPaginationConfig) {
        var ctrl = this;
        var maxSize = angular.isDefined($attrs.maxSize) ? $scope.$parent.$eval($attrs.maxSize) : uibPaginationConfig.maxSize,
          rotate = angular.isDefined($attrs.rotate) ? $scope.$parent.$eval($attrs.rotate) : uibPaginationConfig.rotate,
          forceEllipses = angular.isDefined($attrs.forceEllipses) ? $scope.$parent.$eval($attrs.forceEllipses) : uibPaginationConfig.forceEllipses,
          boundaryLinkNumbers = angular.isDefined($attrs.boundaryLinkNumbers) ? $scope.$parent.$eval($attrs.boundaryLinkNumbers) : uibPaginationConfig.boundaryLinkNumbers;
        $scope.boundaryLinks = angular.isDefined($attrs.boundaryLinks) ? $scope.$parent.$eval($attrs.boundaryLinks) : uibPaginationConfig.boundaryLinks;
        $scope.directionLinks = angular.isDefined($attrs.directionLinks) ? $scope.$parent.$eval($attrs.directionLinks) : uibPaginationConfig.directionLinks;
        uibPaging.create(this, $scope, $attrs);
        if ($attrs.maxSize) {
          ctrl._watchers.push($scope.$parent.$watch($parse($attrs.maxSize), function(value) {
            maxSize = parseInt(value, 10);
            ctrl.render();
          }));
        }

        function makePage(number, text, isActive) {
          return {
            number: number,
            text: text,
            active: isActive
          };
        }

        function getPages(currentPage, totalPages) {
          var pages = [];
          var startPage = 1,
            endPage = totalPages;
          var isMaxSized = angular.isDefined(maxSize) && maxSize < totalPages;
          if (isMaxSized) {
            if (rotate) {
              startPage = Math.max(currentPage - Math.floor(maxSize / 2), 1);
              endPage = startPage + maxSize - 1;
              if (endPage > totalPages) {
                endPage = totalPages;
                startPage = endPage - maxSize + 1;
              }
            } else {
              startPage = (Math.ceil(currentPage / maxSize) - 1) * maxSize + 1;
              endPage = Math.min(startPage + maxSize - 1, totalPages);
            }
          }
          for (var number = startPage; number <= endPage; number++) {
            var page = makePage(number, number, number === currentPage);
            pages.push(page);
          }
          if (isMaxSized && maxSize > 0 && (!rotate || forceEllipses || boundaryLinkNumbers)) {
            if (startPage > 1) {
              if (!boundaryLinkNumbers || startPage > 3) {
                var previousPageSet = makePage(startPage - 1, '...', false);
                pages.unshift(pre