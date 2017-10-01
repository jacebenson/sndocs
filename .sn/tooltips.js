/*! RESOURCE: /scripts/heisenberg/custom/tooltips.js */
(function($) {
    "use strict";
    var bsTooltip = $.fn.tooltip.Constructor;
    bsTooltip.DEFAULTS.placement = 'auto';
    bsTooltip.DEFAULTS.delay = {
        'show': 500,
        'hide': 100
    };
    var SN_TOOLTIP_SELECTOR = '.sn-tooltip-basic, *[title]:not(.accessibility_no_tooltip)';
    $(function() {
        if ('ontouchstart' in document.documentElement)
            return;
        var $tooltips = $('.sn-tooltip-basic, *[title]:not(.accessibility_no_tooltip)');
        (function setupTooltips() {
            $tooltips.each(function() {
                var $this = $(this);
                $this.hideFix();
                if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
                    this.setAttribute('data-original-title', this.getAttribute('title'));
            })
        })();
        $(document.body).on('mouseenter focus', SN_TOOLTIP_SELECTOR, function(evt) {
            if (this.tagName == 'IFRAME' || this.tagName == 'OPTION')
                return;
            var $this = $(this);
            if ($this.data('bs.tooltip'))
                return;
            $this.hideFix();
            if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
                this.setAttribute('data-original-title', this.getAttribute('title'));
            $this.tooltip({
                container: $this.attr('data-container') || 'body'
            });
            $this.on('click', function() {
                $this.tooltip('hide');
            });
            $this.on('shown.bs.tooltip', function() {
                setTimeout(function() {
                    $this.tooltip('hide');
                }, 10000);
            });
            $this.data('hover', setTimeout(function() {
                $this.tooltip('show');
            }, bsTooltip.DEFAULTS.delay.show));
        });
        $(document.body).on('mouseleave blur', SN_TOOLTIP_SELECTOR, function() {
            var $this = $(this);
            var hover = $this.data('hover');
            if (hover) {
                clearTimeout($this.data('hover'));
                $this.removeData('hover')
            }
        });
        $(document).bind('mouseleave', function(evt) {
            if ($('.tooltip').length === 0)
                return;
            $('.sn-tooltip-basic, *[title]').each(function() {
                if (this.tagName == 'IFRAME')
                    return;
                var $this = $(this);
                if ($this.data('bs.tooltip'))
                    $this.tooltip('hide');
            })
        })
    });
})(jQuery);;