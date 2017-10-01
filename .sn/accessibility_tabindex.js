/*! RESOURCE: /scripts/accessibility_tabindex.js */
addLoadEvent(function() {
    $(document).on('keydown', '*[tabindex], .glide_ref_item_link', function(event) {
        if (event.keyCode != Event.KEY_RETURN)
            return;
        var element = event.element();
        if (!element.hasAttribute('tabindex'))
            return;
        if (element.click)
            element.click();
        event.stop();
    });
    if (typeof jQuery != 'undefined') {
        jQuery('[click-on-enter]').on('keydown', function(event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode != 13)
                return;
            var $this = jQuery(this);
            setTimeout(function() {
                $this.trigger('click');
            }, 200);
        });
    }
});;