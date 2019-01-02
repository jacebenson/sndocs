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
    var debounce = (function() {
      var timeout;
      return function(fn, threshold, fireOnStart) {
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
    })();
    $(window).on('resize', function() {
      debounce(hideOpenPopovers, 0, true);
      debounce(resetContainer);
    });
    $('html').on('click', function(e) {
      function eventTargetInElement(elem) {
        return elem.is(e.target) || elem.has(e.target).length !== 0
      }
      $('.sn-popover-basic').each(function() {
        var $popoverButton = $(this);
        var $popoverContent = $($popoverButton.data('target'));
        if (!$popoverContent.is(':visible'))
          return;
        if (eventTargetInElement($popoverButton) || eventTargetInElement($popoverContent))
          return;
        if ($popoverButton.data('auto-close') === false && !$(e.target).is('.sn-popover-basic'))
          return;
        $popoverButton.popover('hide');
      });
    });
  });
  $(document).on('show.bs.popover hide.bs.popover', function() {
    if (window._frameChanged)
      _frameChanged();
  })
})(jQuery);;