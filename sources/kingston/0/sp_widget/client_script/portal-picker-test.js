function ($scope, $location, $sce) {
	c = this;
	c.data.dropDownText = "Pick a directive";
	c.data.directive = "";
	c.useDirective = function(directive){
		c.data.directive = directive;
		c.data.directive_html = '';
		//c.data.directive_html += '<directive ' + directiveObj.options+ '>';
		c.data.directive_html += '<' + directive + '>';
		//c.data.directive_html += 'test';
		c.data.directive_html += '</' + directive + '>';
		c.data.directive_html = $sce.trustAsHtml(c.data.directive_html);
	};
	c.setDirective = function(directive){
	};
	c.data.directives = [
		"as-sortable",
		"as-sortable-item",
		"as-sortable-item-handle",
		"body",
		"button",
		"contenteditable",
		"context-menu",
		"fa",
		"fa-stack",
		"footer",
		"form",
		"form-stream-entry",
		"glide-form-field",
		"glyph",
		"img",
		"input",
		"mentio",
		"mentio-menu",
		"mentio-menu-item",
		"nav",
		"ng-file-drop",
		"ng-file-drop-available",
		"ng-file-select",
		"ng-no-file-drop",
		"now-attachments-list",
		"now-message",
		"recursive-helper",
		"role",
		"scroll-form",
		"sn-attachment-list",
		"sn-attachment-list-item",
		"sn-attachment-preview",
		"sn-avatar",
		"sn-avatar-popover",
		"sn-bind-i18n",
		"sn-bind-once",
		"sn-bind-popover-selection",
		"sn-blur-on-enter",
		"sn-bootstrap-popover",
		"sn-choice-list",
		"sn-cloak",
		"sn-complex-popover",
		"sn-composing",
		"sn-confirm-modal",
		"sn-dialog",
		"sn-expanded-email",
		"sn-field-list-element",
		"sn-file-upload-input",
		"sn-flyout",
		"sn-focus",
		"sn-focus-esc",
		"sn-glyph",
		"sn-group-avatar",
		"sn-image-uploader",
		"sn-link-content",
		"sn-link-content-article",
		"sn-link-content-attachment",
		"sn-link-content-error",
		"sn-link-content-image",
		"sn-link-content-record",
		"sn-link-content-soundcloud",
		"sn-link-content-youtube",
		"sn-mention-popover",
		"sn-modal",
		"sn-modal-show",
		"sn-notification",
		"sn-paste-file-handler",
		"sn-presense",
		"sn-record-picker",
		"sn-reference-picker",
		"sn-resize-height",
		"sn-select-basic",
		"sn-sticky-headers",
		"sn-stream",
		"sn-sync-with",
		"sn-tab",
		"sn-table-reference",
		"sn-tabs",
		"sn-text-expander",
		"sn-time-ago",
		"sn-user-profile",
		"spa11y",
		"span",
		"sp-aria",
		"sp-aria-live",
		"sp-aria-page-title",
		"sp-attachment-button",
		"sp-cat-item",
		"sp-choice-list",
		"sp-c-link",
		"sp-code-mirror",
		"sp-color-picker",
		"sp-context-menu",
		"sp-css-editor",
		"sp-currency-element",
		"sp-date-picker",
		"sp-dropdown-tree",
		"sp-duration-element",
		"sp-editable-field",
		"sp-editable-field2",
		"sp-email-element",
		"sp-focus-if",
		"sp-form-field",
		"sp-glyph-picker",
		"sp-html-content",
		"sp-html-editor",
		"sp-message-dialog",
		"sp-model",
		"sp-navbar-toggle",
		"sp-notifications",
		"sp-on-transition",
		"sp-page-row",
		"sp-panel",
		"sp-reference-element",
		"sp-reference-field",
		"sp-script-editor",
		"sp-scroll",
		"sp-textarea",
		"sp-tinymcy-editor",
		"sp-variable-layout",
		"sp-widget",
		"textarea",
		"uib-accordion",
		"uib-accordion-group",
		"uib-accordion-heading",
		"uib-accordion-transclude",
		"uib-alert",
		"uib-bar",
		"uib-btn-checkbox",
		"uib-btn-radio",
		"uib-carousel",
		"uib-collapse",
		"uib-date-picker",
		"uib-date-picker-popup",
		"uib-date-picker-popup-wrap",
		"uib-day-picker",
		"uib-dropdown",
		"uib-dropdown-menu",
		"uib-dropdown-toggle",
		"uib-is-class",
		"uib-modal-animation-class",
		"uib-modal-backdrop",
		"uib-modal-transclude",
		"uib-modal-window",
		"uib-month-picker",
		"uib-pager",
		"uib-pagination",
		"uib-popover",
		"uib-popover-html-popup",
		"uib-popover-popup",
		"uib-popover-template",
		"uib-popover-template-popup",
		"uib-progress",
		"uib-progressbar",
		"uib-rating",
		"uib-slide",
		"uib-tab",
		"uib-tab-content-transclude",
		"uib-tab-heading-transclude",
		"uib-tabset",
		"uib-timepicker",
		"uib-tooltip",
		"uib-tooltip-classes",
		"uib-tooltip-html",
		"uib-tooltip-html-popup",
		"uib-tooltip-popup",
		"uib-tooltip-template",
		"uib-tooltip-template-popup",
		"uib-tooltip-template-transclude",
		"uib-typeahead",
		"uib-typeahead-match",
		"uib-typeahead-popup",
		"uib-year-picker",
		"ui-tinymce"
	];
	
	$scope.items = [
                    {
                        name: "item1",
                        desc: "Item 1",
                        subitems: [
                            {
                                name: "subitem1",
                                desc: "Sub-Item 1"
                            },
                            {
                                name: "subitem2",
                                desc: "Sub-Item 2"
                            },
                            {
                                name: "subitem2",
                                desc: "Sub-Item 2"
                            }]
                    },
                    {
                        name: "item2",
                        desc: "Item 2",
                        subitems: [
                            {
                                name: "subitem1",
                                desc: "Sub-Item 1"
                            },
                            {
                                name: "subitem2",
                                desc: "Sub-Item 2"
                            },
                            {
                                name: "subitem2",
                                desc: "Sub-Item 2"
                            }]
                    },
                    {
                        name: "item3",
                        desc: "Item 3",
                        subitems: [
                            {
                                name: "subitem1",
                                desc: "Sub-Item 1"
                            },
                            {
                                name: "subitem2",
                                desc: "Sub-Item 2"
                            },
                            {
                                name: "subitem2",
                                desc: "Sub-Item 2"
                            }]
                    }
                ];

$scope.default = $scope.items[2];
	$scope.isopen = (scope.default === scope.item);

	$scope.$watch('isopen', function (newvalue, oldvalue, scope) {
		$scope.isopen = newvalue;
	});
	$scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function() {
    $scope.dt = null;
  };

  $scope.inlineOptions = {
    customClass: getDayClass,
    minDate: new Date(),
    showWeeks: true
  };

  $scope.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    startingDay: 1
  };

  // Disable weekend selection
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }

  $scope.toggleMin = function() {
    $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
    $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
  };

  $scope.toggleMin();

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 1);
  $scope.events = [
    {
      date: tomorrow,
      status: 'full'
    },
    {
      date: afterTomorrow,
      status: 'partially'
    }
  ];

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  }
}