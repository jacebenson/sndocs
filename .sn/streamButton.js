/*! RESOURCE: /scripts/classes/doctype/streamButton.js */
$j(function($) {
    "use strict";
    var closeButtonPadding = 32;
    var isOpen = false;
    var wrapperSelector = '.list_wrap_n_scroll';
    $('.list_stream_button').click(function() {
        $('.list_stream_button').attr("aria-expanded", !isOpen);
        if (!isOpen) {
            isOpen = true;
            var table = $('table.list_table[data-list_id]');
            var listid = table.attr('data-list_id');
            var query = table.attr('query');
            query = encodeURIComponent(query);
            var url = "$stream.do?sysparm_table=" + listid + "&sysparm_nostack=yes&sysparm_query=" + query;
            var target = 'parent';
            if (shouldUseFormPane())
                target = 'form_pane';
            url += "&sysparm_link_target=" + target;
            createStreamReader(url);
        } else {
            isOpen = false;
            var $readerDiv = $('.list_stream_reader');
            closeStreamReader($readerDiv);
        }
    });
    $(document).on('click', '.form_stream_button', function() {
        var url = "$stream.do?sysparm_table=" + g_form.getTableName();
        url += "&sysparm_sys_id=" + g_form.getUniqueValue();
        url += "&sysparm_stack=no";
        createStreamReader(url);
    });

    function shouldUseFormPane() {
        try {
            if (self == top)
                return false;
            if (window.top.g_navManager)
                return !!window.top.g_navManager.options.formTarget;
        } catch (e) {}
        return false;
    }

    function createStreamReader(url) {
        if ($('.list_stream_reader').length)
            return;
        var frame = '	<iframe src="' + url + '" id="list_stream_reader_frame"></iframe>';
        var $div = $('<div class="list_stream_reader" role="region" aria-labelledby="stream_header">' +
            '<div class="list_stream_plank_header" role="heading">' +
            '<span class="list_stream_reader_close"><button id="list_stream_reader_close_button" aria-label="' + getMessage('Close Activity Stream') + '" class="plank_close_button icon-double-chevron-right"></button></span><h4 id="stream_header">' + getMessage('Activity Stream') + '</h4>' +
            '</div>' +
            frame +
            '</div>');
        $('body').append($div);
        $('#list_stream_reader_frame').bind('load', function() {
            if (NOW.compact) {
                $(this).contents().find('html').addClass('compact');
            }
            CustomEvent.observe('compact', function(newValue) {
                var method = newValue ? 'addClass' : 'removeClass';
                $('#list_stream_reader_frame').contents()
                    .find('html')[method]('compact');
            })
        });
        $('#list_stream_reader_close_button')[0].focus();
        resizeStreamReader($div);
        $(window).bind('resize.streamreader', function() {
            unfreezeTableWidth();
            if ($div.parent().length === 0) {
                $(window).unbind('resize.streamreader');
                return;
            }
            resizeStreamReader($div);
        })
    }

    function setListWrapperStyles(stylesObject) {
        var $listWrapper = $(wrapperSelector);
        if ($listWrapper.length === 0) {
            return;
        }
        $listWrapper.closest('body').css(stylesObject);
    }

    function resizeStreamReader($div) {
        freezeTableWidth();
        var width = $div.outerWidth() + closeButtonPadding;
        var listWrapperStyles = {
            'padding-right': width,
            'position': 'absolute'
        };
        setListWrapperStyles(listWrapperStyles);
        var top = 50;
        if (typeof g_form == 'undefined')
            top = $('.list_nav_spacer').offset().top;
        else
            top = $('.section_header_content_no_scroll').offset().top;
        $div.css('top', top);
        if ("ontouchstart" in window) {
            $div.css('absolute');
            window.scrollTo(0, top);
        }
    }
    $('body').on('click', '.list_stream_reader_close', function() {
        isOpen = false;
        var $readerDiv = $(this).closest('.list_stream_reader');
        closeStreamReader($readerDiv);
        var streamButton = $('.list_stream_button');
        if (streamButton.length > 0) {
            streamButton.attr("aria-expanded", isOpen);
            streamButton.focus();
        }
    });

    function closeStreamReader($readerDiv) {
        unfreezeTableWidth();
        $readerDiv.remove();
        var listWrapperStyles = {
            'position': '',
            'padding-right': 0
        };
        setListWrapperStyles(listWrapperStyles);
    }

    function freezeTableWidth() {
        $('table.list_table').each(function(index, el) {
            var $el = $(el);
            var width = $el.width();
            $el.css('width', width);
        })
    }

    function unfreezeTableWidth() {
        $('table.list_table').each(function(index, el) {
            $(el).css('width', '');
        })
    }
});;