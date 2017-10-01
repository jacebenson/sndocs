/*! RESOURCE: /scripts/heisenberg/custom/popovers.js */
(function($) {
    "use strict";
    $(function() {
        $('.sn-popover-basic').each(function() {
            var $this = $(this);
            if (!$this.data('bs.popover'))
                $(this).popover();
        });

        function hideOpenPopovers() {
            $('.sn-popover-basic').each(function() {
                var $this = $(this);
                if ($this.attr('aria-describedby') !== undefined)
                    $this.popover('hide');
            });
        }

        function resetContainer() {
            $('.sn-popover-basic').each(function() {
                var $this = $(this);
                $this.popover({
                    container: $this.data('container')
                });
            });
        }

        function debounce(fn, threshold, fireOnStart) {
            var timeout;
            return function() {
                var obj = this,
                    args = arguments;
                threshold = (threshold !== undefined) ? threshold : 500;

                function delayed() {
                    if (!fireOnStart)
                        fn.apply(obj, args);
                    timeout = null;
                }
                if (timeout)
                    clearTimeout(timeout);
                else if (fireOnStart)
                    fn.apply(obj, args);
                timeout = setTimeout(delayed, threshold);
            };
        }

        function closeOnBlur(e) {
            function eventTargetInElement(elem) {
                return elem.is(e.target) || elem.has(e.target).length !== 0
            }
            $('.sn-popover-basic').each(function() {
                var $popoverButton = $(this);
                var $popoverContent = $($popoverButton.data('target'));
                if (!$popoverButton.hasClass('active'))
                    return;
                if (eventTargetInElement($popoverButton) || eventTargetInElement($popoverContent))
                    return;
                if ($popoverButton.data('auto-close') === false && !$(e.target).is('.sn-popover-basic'))
                    return;
                $popoverButton.popover('hide');
            });
        }
        var debouncedResetContainer = debounce(resetContainer);
        var debouncedHideOpenPopovers = debounce(hideOpenPopovers, 0, true);
        var debouncedCloseOnBlur = debounce(closeOnBlur, 10);
        $(window).on('resize', function() {
            if ('ontouchstart' in document.documentElement && document.activeElement.type === 'text')
                return;
            debouncedHideOpenPopovers();
            debouncedResetContainer();
        });
        $('html').on('click', function(e) {
            debouncedCloseOnBlur(e);
        });
        if (CustomEvent && CustomEvent.observe) {
            CustomEvent.observe('body_clicked', function(e) {
                debouncedCloseOnBlur(e);
            });
        }
    });
    $(document).on('show.bs.popover hide.bs.popover', function() {
        if (window._frameChanged)
            _frameChanged();
    })
})(jQuery);;