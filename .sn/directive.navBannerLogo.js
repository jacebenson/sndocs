/*! RESOURCE: /scripts/concourse/directive.navBannerLogo.js */
angular.module('sn.concourse').directive('navBannerLogo', function(snCustomEvent, $sanitize) {
    "use strict";
    return {
        restrict: 'A',
        link: function($scope, $element) {
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
                            '.navpage-history ul > li',
                            '.sn-aside.sn-aside_themed',
                            '.sn-aside.sn-aside_themed .sn-widget-list_v2 .sn-widget-list-item:not(.module-node)'
                        ],
                        'border-color': [
                            '#icon_colors a.color-bg-white:focus, #icon_colors a.color-bg-white:active',
                            '#icon_colors a:focus, #icon_colors a:active',
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
            snCustomEvent.observe('css.$subnav-background-color', function(value) {
                if (value)
                    jQuery('.nav-body ul li ul').css('background-color', value);
            });
            snCustomEvent.observe('css.$navpage-nav-border', function(value) {
                if (value) {
                    var props = {
                        'border-color': [
                            '.sn-frameset-header #sysparm_search:focus',
                            '.sn-frameset-header .dropdown.open button',
                            '.nav-header input[name=filter]',
                            '.nav-header input[name=filter]:focus',
                            '.sn-live-search .twitter-typeahead input',
                            '.sn-live-search-flex .form-control',
                            '.sn-live-search-flex .form-control:focus'
                        ],
                        'border-top-color': [
                            '.nav-body .nav-favorites-show-more',
                            '.nav-footer',
                            '.sn-pane-footer',
                            '.panel-tool-icons'
                        ],
                        'border-left-color': [
                            '.panel-tool-icons'
                        ],
                        'border-bottom-color': [
                            '.navpage-nav-collapsed .nav-header',
                            '.navpage-nav-collapsed .nav-body ul.nav-favorites-list > li > a'
                        ]
                    };
                    for (var prop in props) {
                        jQuery(props[prop].join(',')).css(prop, value);
                    }
                }
            });
            snCustomEvent.observe('css.$navpage-nav-color-sub', function(value) {
                if (value) {
                    var selectors = [
                        '.magellan_navigator .sn-aside.sn-aside_themed .sn-widget-list_v2 li .sn-widget-list-action',
                        '.magellan_navigator .sn-aside.sn-aside_themed .sn-widget-list_v2 .sn-widget-list_v2 li .sn-widget-list-action',
                        '.magellan_navigator .sn-application-tree .sn-widget-list_v2 li .sn-widget-list-title',
                        '.magellan_navigator .sn-application-tree .sn-widget-list_v2 li .sn-widget-list-subtitle',
                        '.magellan_navigator .sn-application-tree .sn-widget-list_v2 li .sn-widget-list-action',
                        '.magellan_navigator .sn-widget-list_indentation .sn-widget-list_v2 .sn-aside-group-title'
                    ];
                    jQuery(selectors.join(',')).css('color', value);
                }
            });
            snCustomEvent.observe('css.$navpage-nav-unselected-color', function(value) {
                if (value) {
                    var selectors = [
                        '.magellan_navigator .sn-navhub.sn-navhub_themed .sn-navhub-btn::before'
                    ];
                    jQuery(selectors.join(',')).css('color', value);
                    try {
                        document.styleSheets[0].addRule('.magellan_navigator .sn-navhub.sn-navhub_themed .sn-navhub-btn::before', 'color: ' + value + ' !important;');
                    } catch (e) {}
                }
            });
            snCustomEvent.observe('css.$navpage-nav-selected-color', function(value) {
                if (value) {
                    var selectors = [
                        '.sn-connect-aside.sn-aside_inverted .sn-widget-list li:active',
                        '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn:active',
                        '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn.state-active',
                        '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn:active::before',
                        '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn.state-active::before',
                        '.magellan-edit-mode .selected',
                        '.magellan-edit-mode .selected .draggable',
                        '.magellan-edit-mode .selected .nav-favorite-group-title',
                        '.magellan-edit-mode .selected > a > div.nav-favorite-title',
                        '.nav-header .nav-segmented li.active',
                        '.nav-header .nav-segmented li.active a:focus',
                        '.nav-body ul.nav-history-list li a:hover',
                        '.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active'
                    ];
                    jQuery(selectors.join(',')).css('color', value);
                    try {
                        document.styleSheets[0].addRule('.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active::before', 'color: ' + value + ' !important;');
                    } catch (e) {}
                }
            });
            snCustomEvent.observe('css.$nav-highlight-main', function(value) {
                if (value) {
                    var selectors = [
                        '.nav-body a:hover',
                        '.nav-body a:focus',
                        '.nav-body .nav-expandable:hover',
                        '.nav-body .nav-app:hover, .nav-body .nav-app:focus',
                        '.nav-body .nav-highlight',
                        '.nav-body ul.nav-favorites-list > li > span:hover',
                        '.nav-body ul.nav-favorites-list > li > a:hover',
                        '.nav-body ul.nav-favorites-list .nav-favorite-group .nav-favorite-group-title:hover',
                        '.nav-body ul.nav-history-list li a:hover',
                        '.navpage-nav-collapsed .nav-body ul.nav-favorites-list > li .nav-favorite-group:hover'
                    ];
                    jQuery(selectors.join(',')).css('background-color', value);
                }
            });
            snCustomEvent.observe('css.$navpage-nav-selected-bg', function(value) {
                if (value) {
                    var selectors = [
                        '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn:active',
                        '.sn-navhub.sn-connect-aside-navhub .sn-navhub-buttons .btn.state-active',
                        '.magellan-edit-mode .selected',
                        '.magellan-edit-mode .selected .nav-favorite-group-title',
                        '.nav-header .nav-segmented li.active',
                        '.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active'
                    ];
                    jQuery(selectors.join(',')).css('background-color', value);
                    try {
                        document.styleSheets[0].addRule('.sn-navhub.sn-navhub_themed .sn-navhub-btn.state-active::before', 'background-color: ' + value + ' !important;');
                    } catch (e) {}
                }
            });
            snCustomEvent.observe('css.$nav-hr-color', function(value) {
                if (value)
                    jQuery('.sn-aside.sn-aside_themed .sn-widget-list_v2 .sn-widget-list-divider').css('background-color', value);
            });
        }
    }
});;