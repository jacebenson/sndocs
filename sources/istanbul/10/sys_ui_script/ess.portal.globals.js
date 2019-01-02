$(document).observe('dom:loaded', function() {


  $(document).on('click', '.popup_form_actions a', function(event, elem) {
    event.stop();
    var o = new GlideOverlay({
      title: elem.readAttribute('title'),
      //height:650,
      //width:550,
      iframe: elem.readAttribute('href')
    });
    o.render(); 
  });

});