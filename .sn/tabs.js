/*! RESOURCE: /scripts/heisenberg/custom/tabs.js */
(function($) {
    "use strict";
    $.fn.tabs = (function() {
        return function() {
            var $elem = this;
            var api = {};
            $elem.data('sn.tabs', api);
            attachTabClickHandler($elem);
            attachFocusHandler($elem);
        };

        function attachTabClickHandler($elem) {
            $elem.on('click', 'li, [data-toggle=tab], [data-toggle=segmented]', function(e) {
                var $el = $(this);
                var $tabLi, $tabTrigger;
                if ($el.is('li')) {
                    $tabLi = $el;
                    $tabTrigger = $el.find('[data-toggle]').first();
                } else {
                    $tabTrigger = $el;
                    $tabLi = $el.closest('li');
                }
                if ($tabLi.hasClass('disabled'))
                    return;
                var $selectedTab = $tabLi.siblings('.active');
                var $selectedTabTrigger = $selectedTab.find('[data-toggle]').first();
                setTabDisplay($selectedTab, $selectedTabTrigger, false);
                setTabDisplay($tabLi, $tabTrigger, true);
                e.preventDefault();
            })
        }

        function attachFocusHandler($elem) {
            $elem.on('focusin focusout', '[data-toggle=tab], [data-toggle=segmented]', function(e) {
                var $el = $(this).closest('li');
                switch (e.type) {
                    case 'focusin':
                        $el.addClass('focus');
                        break;
                    case 'focusout':
                        $el.removeClass('focus');
                        break;
                }
            })
        }

        function setTabDisplay($tabLi, $tabTrigger, display) {
            $tabTrigger.attr('aria-selected', display ? 'true' : 'false');
            var selector = $tabTrigger.data('tab-target') || $tabTrigger.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '');
            var $tabpanel = $(selector);
            $tabpanel.attr('aria-hidden', display ? 'false' : 'true');
            if (display) {
                $tabLi.addClass('active justselected');
                $tabpanel.addClass('active');
                $tabLi.one('focusout', function() {
                    $tabLi.removeClass('justselected');
                })
            } else {
                $tabLi.removeClass('active');
                $tabpanel.removeClass('active');
            }
        }
    })();
    $(function() {
        $('.sn-tabs-basic').each(function() {
            var $this = $(this);
            if (!$this.data('sn.tabs'))
                $this.tabs();
        });
    });
})(jQuery);;