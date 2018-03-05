/*! RESOURCE: /scripts/concourse_framebuster.js */
$j(function() {
  if (window.self != window.top && window.name.indexOf('sn_frame') == -1) {
    var path = window.location.pathname;
    if (path.indexOf('/navpage.do') != 0 && path != '/') {
      top.location.href = window.location.href;
      return;
    }
    var src = $j('iframe#gsft_main').attr('src');
    top.location.href = "/nav_to.do?uri=" + encodeURIComponent(src);
  }
});;