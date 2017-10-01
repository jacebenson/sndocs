/*! RESOURCE: /scripts/doctype/page_title.js */
$j(function($) {
    var title = $('[data-form-title]').first().attr('data-form-title');
    if (!title || title == "null")
        title = $(".tabs2_section").first().attr('tab_caption');
    if (!title || title == "null")
        title = $('.list_title').first().text();
    if (!title || title == "null")
        return;
    document.title = title + ' | ' + document.title;
});;