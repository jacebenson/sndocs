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

  WebFontConfig = {
    google: { families: [ 'Open+Sans:400,300,700,600:latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();