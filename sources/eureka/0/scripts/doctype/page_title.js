$j(function($) {
  var title = $('[data-form-title]').first().attr('data-form-title');
  if (!title)
    title = $('.list_title').first().text();
  if (!title)
    return;
  document.title = title + ' | ' + document.title;
});