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
                    } else if (viewportOffset.bottom + yOverflow < 0 && adjustedSiz