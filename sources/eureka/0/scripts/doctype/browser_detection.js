(function($j) {
  if (navigator.userAgent.indexOf('Windows') > -1)
    $j('html').addClass('windows');
  if (navigator.userAgent.indexOf('Chrome') > -1)
    $j('html').addClass('chrome');
  if (navigator.userAgent.indexOf('Firefox') > -1)
    $j('html').addClass('firefox');
  if (navigator.userAgent.indexOf('MSIE') > -1)
    $j('html').addClass('msie');
})(jQuery);