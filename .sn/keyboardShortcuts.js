/*! RESOURCE: /scripts/concourse/keyboardShortcuts.js */
(function($) {
    if (window.top != window.self)
        return;
    $('document').ready(function() {
        var keyboardRegistry = SingletonKeyboardRegistry.getInstance();
        keyboardRegistry.bind('ctrl + alt + g', function(evt, keys, combo) {
            $('#sysparm_search').focus();
        }).selector(null, true);
        keyboardRegistry.bind('ctrl + alt + c', function(evt, keys, combo) {
            CustomEvent.fireAll('magellan_collapse.toggle');
        }).selector(null, true);
        keyboardRegistry.bind('ctrl + alt + f', function(evt, keys, combo) {
            if ($('.navpage-layout').hasClass('navpage-nav-collapsed')) {
                CustomEvent.fireAll('magellan_collapse.toggle');
                $(document).one("nav.expanded", function() {
                    $('#filter').focus();
                });
            } else {
                if (!$('.navpage-layout').hasClass('magellan-edit-mode')) {
                    $('#filter').focus();
                }
            }
        }).selector(null, true);
    });
})(jQuery);;