/*! RESOURCE: /scripts/concourse/directive.navBannerLogo.js */
angular.module('sn.concourse').directive('navBannerLogo', function(snCustomEvent, $sanitize) {
      "use strict";
      return {
        restrict: 'A',
        link: function($scope, $element) {
            $scope.setNavigatingState = function(state) {
              top.NOW.magellan && top.NOW.magellan.setNavigatingState && top.NOW.magellan.setNavigatingState(state);
            };
            snCustomEvent.observe('glide.product.image.light', function(value) {
              if (value)
                $element.find('[data-sys-properties="glide.product.image.light"]').css('background-image', 'url(' + value + ')');
            });
            snCustomEvent.observe('glide.product.description', function(value) {
              if (value)
                $element.find('[data-sys-properties="glide.product.description"]').html($sanitize(value));
            });
            snCustomEvent.observe('css.$navpage-header-bg', function(value) {
              if (value) {
                var props = {
                  'background-color': [
                    '.navpage-header',
                    '.tabs-container ul li',
                    '.panel-tool-icons',
                    '.sn-connect-aside.sn-aside_inverted .sn-aside-group-title',
                    '.nav-body .nav-favorites-show-application .nav-favorites-show-application-title',
                    '.nav-body .nav-favorites-show-application .nav-favorites-show-more-title',
                    '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-title',
                    '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-title',
                    '.sn-frameset-header'
                  ],
                  'border-color': ['.sn-navhub.sn-connect-aside-navhub']
                };
                for (var prop in props) {
                  jQuery(props[prop].join(',')).css(prop, value);
                }
                var bannerImageContainer = jQuery('iFrame').contents().find('.header_color');
                if (bannerImageContainer)
                  bannerImageContainer.css('background-color', value);
              }
            });
            snCustomEvent.observe('css.$navpage-header-color', function(value) {
              if (value) {
                var selectors = [
                  '.sn-frameset-header .sysparm-search-icon:before',
                  '.navpage-pickers .label-icon',
                  '.tabs-container ul li a',
                  '.sn-connect-aside.sn-aside_inverted',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li:active .sn-widget-list-title',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li:active .sn-widget-list-details',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-title',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-content',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-details',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-members-list-btn-close',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-title span',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-content span',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-list-details span',
                  '.sn-connect-aside.sn-aside_inverted .sn-widget-list li .sn-widget-list-bg_active .sn-widget-members-list-btn-close span',
                  '.nav-body .nav-favorites-show-application .nav-favorites-show-application-title',
                  '.nav-body .nav-favorites-show-application .nav-favorites-show-more-title',
                  '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-title',
                  '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-title',
                  '.nav-body ul.nav-application-tree .app-node:hover > .nav-favorite-app',
                  '.nav-body ul.nav-history-list li a:hover span',
                  '.sn-frameset-header .banner-text',
                  '.current-user-dropdown'
                ];
                jQuery(selectors.join(',')).css('color', value);
              }
            });
            snCustomEvent.observe('css.$navpage-header-divider-color', function(value) {
              if (value) {
                var selectors = '.navpage-layout .navbar-divider';
                jQuery(selectors).css('background-color', value);
              }
            });
            snCustomEvent.observe('css.$navpage-nav-bg', function(value) {
              if (value) {
                var props = {
                  'background-color': [
                    '.navpage-nav',
                    '.navpage-right',
                    '.tabs-container',
                    '.sn-connect-aside.sn-aside_inverted',
                    '.sn-navhub.sn-connect-aside-navhub',
                    '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons',
                    '#favorite_preview',
                    '.nav-edit-favorites-icon-grid > a.selected',
                    '.magellan_navigator',
                    '.nav-header input[name=filter]',
                    '.nav-header input[name=filter]:focus',
                    '.nav-body .nav-favorites-show-more',
                    '.nav-body .nav-favorites-show-application .nav-favorites-show-application-inner',
                    '.nav-body .nav-favorites-show-application .nav-favorites-show-more-inner',
                    '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-inner',
                    '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-inner',
                    '.nav-body .nav-favorites-show-application .nav-favorites-show-application-inner .nav-favorite-group-title',
                    '.nav-body .nav-favorites-show-application .nav-favorites-show-more-inner .nav-favorite-group-title',
                    '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-inner .nav-favorite-group-title',
                    '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-inner .nav-favorite-group-title',
                    '.nav-body ul.nav-favorites-list',
                    '.nav-body ul.nav-favorites-list .nav-favorite-group .nav-favorite-group-title',
                    '.nav-footer',
                    '.navpage-history ul > li',
                    '.sn-pane-footer',
                    '.sn-live-search'
                  ],
                  'border-color': [
                    '.create-favorite .nav-edit-favorites-icon-grid > a.selected',
                    '#icon_colors a.color-bg-white:focus, #icon_colors a.color-bg-white:active',
                    '#icon_colors a:focus, #icon_colors a:active',
                    '.favorite-preview',
                    '.nav-edit-favorites-icon-grid > a:focus, .nav-edit-favorites-icon-grid > a:active'
                  ],
                  'border-right-color': [
                    '.nav-body .nav-favorites-show-application .arrow',
                    '.nav-body .nav-favorites-show-more-panel .arrow'
                  ]
                };
                for (var prop in props) {
                  jQuery(props[prop].join(',')).css(prop, value);
                }
              }
            });
            snCustomEvent.observe('css.$navpage-nav-bg-sub', function(value) {
                  if (value) {
                    var props = {
                        'background-color': [
                            '.sn-connect-aside.sn-aside_inverted',
                            '.sn-navhub.sn-connect-aside-navhub',
                            '.favorite-preview',
                            '.nav-edit-favorites-icon-grid > a.selected',
                            '.nav-body .nav-favorites-show-application .nav-favorites-show-application-inner',
                            '.nav-body .nav-favorites-show-application .nav-favorites-show-more-inner',
                            '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-application-inner',
                            '.nav-body .nav-favorites-show-more-panel .nav-favorites-show-more-inner',
                            '.nav-body ul.nav-favorites-list',
                            '.navpage-history ul > 