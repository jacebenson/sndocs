/*! RESOURCE: /scripts/doctype/page_title.js */
$j(function($) {
  var title = $('[data-form-title]').first().attr('data-form-title');
  if (!title)
    title = $(".tabs2_section").first().attr('tab_caption');
  if (!title)
    title = $('.list_title').first().text();
  if (!title)
    return;
  document.title = title + ' | ' + document.title;
});;