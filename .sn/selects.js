/*! RESOURCE: /scripts/heisenberg/custom/selects.js */
jQuery(function($) {
    "use strict";
    window.NOW = window.NOW || {};
    var $select2 = $('select.select2, select.sn-select-basic');
    $select2
        .each(function() {
            var required = $(this).prop('required');
            if (required)
                $(this).addClass('required');
        })
        .select2()
        .bind('select2-focus', function() {
            NOW.select2LabelWorkaround($(this));
        });
    $(window).bind('blur', function() {
        $select2.select2('close');
    });
    window.NOW.select2LabelWorkaround = function($select2Element) {
        var $cont = $select2Element.select2('container');
        var $label = $cont.find('label').first();
        if ($label.length == 0)
            return;
        var id = $label.attr('id');
        if (!id) {
            window.select_id_counter = window.select_id_counter || 0;
            id = 'select-label-' + ++window.select_id_counter;
            $label.attr('id', id);
        }
        var focusser = $cont.find('#' + $label.attr('for'));
        var focusserAttr = focusser.attr('aria-labelledby');
        if (!focusserAttr.startsWith(id + ' '))
            focusser.attr('aria-labelledby', id + ' ' + focusserAttr);
        if ($select2Element.attr('aria-required'))
            focusser.attr('aria-required', $select2Element.attr('aria-required'));
    }
});;