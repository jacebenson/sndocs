/*! RESOURCE: /scripts/responsive_form_header.js */
(function($) {
  var cache = null;
  addLoadEvent(initializeFormHeader);

  function initializeFormHeader() {
    var $header = $('.section_header_div_no_scroll');
    if ($header.length === 0) {
      return;
    }
    CustomEvent.observe("frame.resized", adjustFormHeaderElements);
    Event.observe(window, "resize", adjustFormHeaderElements);
  }

  function adjustFormHeaderElements() {
    setupCache();
    fitUiActions();
    var headerHeight = cache.$header.height();
    cache.$spacer.css('top', headerHeight);
  }

  function setupCache() {
    if (cache == null) {
      cache = {};
      cache.$header = $('.section_header_div_no_scroll');
      cache.$spacer = $('div[data-position-below-header="true"]');
      cache.$navbar = $('nav.navbar-default:first');
      cache.$primaryContainer = cache.$navbar.find('.ui_action_container_primary');
      cache.$overflowContainer = cache.$navbar.find('.ui_action_container_overflow');
      cache.$uiActionContainer = cache.$primaryContainer.children(0);
      cache.$navbarDisplayValueElement = cache.$navbar.find('.navbar-header:first .navbar-title-display-value');
      cache.uiActionWidth = cache.$uiActionContainer.width();
      cache.navbarRightWidth = cache.$navbar.find('.navbar-right:first').width() - cache.uiActionWidth;
      cache.navbarTitleCaption = cache.$navbar.find('.navbar-header:first .navbar-title-caption').width();
      recalculateDynamicHeaderElements();
    }
  }

  function recalculateDynamicHeaderElements() {
    cache.navbarHeaderWidth = cache.$navbar.find('.navbar-header:first').width();
    cache.navbarDisplayWidth = cache.$navbar.find('.navbar-header:first .navbar-title-display-value').width();
  }

  function fitUiActions() {
    cache.$navbarDisplayValueElement.css('max-width', '');
    recalculateDynamicHeaderElements();
    var windowWidth = $(window).width();
    var navbarWidth = cache.$navbar.width();
    var headerSize = cache.navbarHeaderWidth + cache.navbarRightWidth + cache.uiActionWidth;
    if ((cache.navbarHeaderWidth + cache.navbarRightWidth) > windowWidth) {
      var maxWidth = cache.navbarDisplayWidth - (cache.navbarHeaderWidth - windowWidth) - 20;
      if (navbarWidth > headerSize - cache.navbarDisplayWidth)
        maxWidth -= cache.navbarRightWidth + cache.uiActionWidth;
      cache.$navbarDisplayValueElement.css('max-width', Math.max(maxWidth, cache.navbarTitleCaption));
      navbarWidth = cache.$navbar.width();
      recalculateDynamicHeaderElements();
    }
    headerSize = cache.navbarHeaderWidth + cache.navbarRightWidth + cache.uiActionWidth;
    var headerTooBig = headerSize > navbarWidth;
    if (headerTooBig) {
      if (cache.$uiActionContainer.parent().get(0) === cache.$primaryContainer.get(0))
        cache.$overflowContainer.append(cache.$uiActionContainer.detach());
    } else if (cache.$uiActionContainer.parent().get(0) === cache.$overflowContainer.get(0))
      cache.$primaryContainer.append(cache.$uiActionContainer.detach());
  }
})(jQuery);;