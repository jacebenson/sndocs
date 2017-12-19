addLoadEvent(function() {
  $(document).on('keyup', '*[tabindex], .glide_ref_item_link', function(event) {
    if (event.keyCode != Event.KEY_RETURN)
      return;
    var element = event.element();
    if (!element.hasAttribute('tabindex'))
      return;
    element.click();
    event.stop();
  });
});