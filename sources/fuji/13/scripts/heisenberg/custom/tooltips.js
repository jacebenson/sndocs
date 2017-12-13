/*! RESOURCE: /scripts/heisenberg/custom/tooltips.js */
(function($) {
  "use strict";
  var bsTooltip = $.fn.tooltip.Constructor;
  bsTooltip.DEFAULTS.placement = 'auto';
  $(function() {
    if ('ontouchstart' in document.documentElement)
      return;
    $('.sn-tooltip-basic, *[title]').each(function() {
      if (this.tagName == 'IFRAME' || this.tagName == 'OPTION')
        return;
      var $this = $(this);
      if (!$this.data('bs.tooltip')) {
        $this.tooltip({
          delay: {
            'show': 500,
            'hide': 100
          },
          container: $this.attr('data-container') || 'body',
          trigger: 'hover'
        });
        $this.hideFix();
        $this.on('click focus', function() {
          $this.tooltip('hide');
        });
        $this.on('shown.bs.tooltip', function() {
          setTimeout(function() {
            $this.tooltip('hide');
          }, 10000);
        });
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