/*! RESOURCE: /scripts/responsive_form_header.js */
(function($) {
  var cache = null;
  var MIN_HEADER_HEIGHT = 60;
  var DEFAULT_TIMEOUT_IN_MS = 100;
  addLoadEvent(initializeFormHeader);

  function initializeFormHeader() {
    if ($('.section_header_div_no_scroll').length === 0) {
      return;
    }
    setupCache();
    CustomEvent.observe("frame.resized", adjustFormHeaderElements);
    Event.observe(window, "resize", debounceAdjustFormHeaderElements);
  }

  function adjustFormHeaderElements() {
    if (!cache.hasLoaded && cache.$header.height() < MIN_HEADER_HEIGHT) {
      cache.hasLoaded = true;
      return;
    }
    recalculateDynamicHeaderElements();
    fitUiActions();
    cache.$content.css({
      height: cache.$window.innerHeight() - cache.$header.height()
    });
  }

  function debounceAdjustFormHeaderElements() {
    clearTimeout(cache.timeout);
    cache.timeout = setTimeout(adjustFormHeaderElements, DEFAULT_TIMEOUT_IN_MS);
  }

  function setupCache() {
    if (cache == null) {
      cache = {};
      cache.timeout = null;
      cache.hasLoaded = false;
      cache.$window = $(window);
      cache.$header = $('.section_header_div_no_scroll');
      cache.$content = $('.section_header_content_no_scroll');
      cache.$spacer = $('div[data-position-below-header="true"]');
      cache.$navbar = $('nav.navbar-default:first');
      cache.$primaryContainer = cache.$navbar.find('.ui_action_container_primary');
      cache.$overflowContainer = cache.$navbar.find('.ui_action_container_overflow');
      cache.$uiActionContainer = cache.$primaryContainer.children(0);
      cache.$navbarDisplayValueElement = cache.$navbar.find('.navbar-header:first .navbar-title-display-value');
      cache.uiActionWidth = cache.$uiActionContainer.width();
      cache.navbarRightWidth = cache.$navbar.find('.navbar-right:first').width() - cache.uiActionWidth;
      cache.navbarTitleCaption = cache.$navbar.find('.navbar-header:first .navbar-title-caption').width();
    }
  }

  function recalculateDynamicHeaderElements() {
    cache.navbarHeaderWidth = cache.$navbar.find('.navbar-header:first').width();
    cache.navbarDisplayWidth = cache.$navbar.find('.navbar-header:first .navbar-title-display-value').width();
  }

  function fitUiActions() {
    cache.$navbarDisplayValueElement.css('max-width', '');
    recalculateDynamicHeaderElements();
    var navbarWidth = cache.$navbar.width();
    var headerSize = cache.navbarHeaderWidth + cache.navbarRightWidth + cache.uiActionWidth;
    if ((cache.navbarHeaderWidth + cache.navbarRightWidth) > cache.$window.width()) {
      var maxWidth = cache.navbarDisplayWidth - (cache.navbarHeaderWidth - cache.$window.width) - 20;
      if (navbarWidth > headerSize - cache.navbarDisplayWidth) {
        maxWidth -= cache.navbarRightWidth + cache.uiActionWidth;
      }
      cache.$navbarDisplayValueElement.css('max-width', Math.max(maxWidth, cache.navbarTitleCaption));
      navbarWidth = cache.$navbar.width();
      recalculateDynamicHeaderElements();
    }
    headerSize = cache.navbarHeaderWidth + cache.navbarRightWidth + cache.uiActionWidth;
    if (headerSize > navbarWidth) {
      if (cache.$uiActionContainer.parent().get(0) === cache.$primaryContainer.get(0)) {
        cache.$overflowContainer.append(cache.$uiActionContainer.detach());
      }
    } else if (cache.$uiActionContainer.parent().get(0) === cache.$overflowContainer.get(0)) {
      cache.$primaryContainer.append(cache.$uiActionContainer.detach());
    }
  }
})(jQuery);;