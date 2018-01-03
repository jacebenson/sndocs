/*! RESOURCE: /scripts/js_includes_customer.js */
/*! RESOURCE: Validate Client Script Functions */
function validateFunctionDeclaration(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var patternString = "function(\\s+)" + functionName + "((\\s+)|\\(|\\[\r\n])";
  var validatePattern = new RegExp(patternString);
  if (!validatePattern.test(code)) {
    var msg = new GwtMessage().getMessage('Missing function declaration for') + ' ' + functionName;
    g_form.showErrorBox(fieldName, msg);
    return false;
  }
  return true;
}

function validateNoServerObjectsInClientScript(fieldName) {
  var code = g_form.getValue(fieldName);
  if (code == "")
    return true;
  code = removeCommentsFromClientScript(code);
  var doubleQuotePattern = /"[^"\r\n]*"/g;
  code = code.replace(doubleQuotePattern, "");
  var singleQuotePattern = /'[^'\r\n]*'/g;
  code = code.replace(singleQuotePattern, "");
  var rc = true;
  var gsPattern = /(\s|\W)gs\./;
  if (gsPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "gs" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  var currentPattern = /(\s|\W)current\./;
  if (currentPattern.test(code)) {
    var msg = new GwtMessage().getMessage('The object "current" should not be used in client scripts.');
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateUIScriptIIFEPattern(fieldName, scopeName, scriptName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  if ("global" == scopeName)
    return rc;
  code = removeCommentsFromClientScript(code);
  code = removeSpacesFromClientScript(code);
  code = removeNewlinesFromClientScript(code);
  var requiredStart = "var" + scopeName + "=" + scopeName + "||{};" + scopeName + "." + scriptName + "=(function(){\"usestrict\";";
  var requiredEnd = "})();";
  if (!code.startsWith(requiredStart)) {
    var msg = new GwtMessage().getMessage("Missing closure assignment.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  if (!code.endsWith(requiredEnd)) {
    var msg = new GwtMessage().getMessage("Missing immediately-invoked function declaration end.");
    g_form.showErrorBox(fieldName, msg);
    rc = false;
  }
  return rc;
}

function validateNotCallingFunction(fieldName, functionName) {
  var code = g_form.getValue(fieldName);
  var rc = true;
  var reg = new RegExp(functionName, "g");
  var matches;
  code = removeCommentsFromClientScript(code);
  if (code == '')
    return rc;
  matches = code.match(reg);
  rc = (matches && (matches.length == 1));
  if (!rc) {
    var msg = "Do not explicitly call the " + functionName + " function in your business rule. It will be called automatically at execution time.";
    msg = new GwtMessage().getMessage(msg);
    g_form.showErrorBox(fieldName, msg);
  }
  return rc;
}

function removeCommentsFromClientScript(code) {
  var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
  code = code.replace(pattern1, "");
  var pattern2 = /\/\/.*/g;
  code = code.replace(pattern2, "");
  return code;
}

function removeSpacesFromClientScript(code) {
  var pattern = /\s*/g;
  return code.replace(pattern, "");
}

function removeNewlinesFromClientScript(code) {
  var pattern = /[\r\n]*/g;
  return code.replace(pattern, "");
}
/*! RESOURCE: snd_ui16_developer_patch */
if (!window.top.hasOwnProperty('snd_ui16_developer_patch')) {
  jslog('snd_ui16_developer_patch loading in top window.');
  (function(t) {
    var i;
    t.snd_ui16_developer_patch = null;
    i = setInterval(function() {
      if (typeof t.jQuery === 'function') {
        t.jQuery.getScript('/snd_ui16_developer_patch.jsdbx');
        clearInterval(i);
      }
    }, 500);
  })(window.top);
} else if (window.top.snd_ui16_developer_patch != null) {} else if (window == window.top) {
  (function($, window) {
    var config = {
      navigator_context: {
        active: "true" == "true",
      },
      picker_width: {
        active: "true" == "true",
        max_width: parseInt("300", 10) || 300,
        min_width: parseInt("30", 10) || 60,
        load_timeout: parseInt("2000", 10) || 2000,
        max_search_width: parseInt("", 10) || 150
      },
      picker_icon: {
        active: "true" == "true",
        domain_table: "" || "domain"
      },
      profile_menu: {
        active: "true" == "true",
        check_impersonation: "true" == "true",
      }
    };
    $.fn.snd_ui16dp_menu = (function() {
      var menus = {},
        loaded = false;

      function getMenuPosition($menu, mouse, direction, scrollDir) {
        var win = $(window)[direction](),
          scroll = $(window)[scrollDir](),
          menu = $menu[direction](),
          position = mouse + scroll;
        if (mouse + menu > win && menu < mouse) position -= menu;
        return position;
      }

      function closeAll() {
        for (var id in menus) {
          $(id).hide();
        }
      }
      return function(settings) {
        menus[settings.menu_id] = true;
        if (!loaded) {
          $(document).click(function() {
            closeAll();
          });
          $('iframe').on('load', function() {
            $(this).contents().on('click', function() {
              closeAll();
            });
          });
          loaded = true;
        }
        return this.each(function() {
          $(this).on(settings.event || 'click', settings.selector, function(e) {
            var $menu;
            closeAll();
            if (e.ctrlKey) return;
            $menu = $(settings.menu_id);
            $menu.data("invokedOn", $(e.target))
              .show()
              .css({
                position: "absolute",
                left: getMenuPosition($menu, e.clientX, 'width', 'scrollLeft'),
                top: getMenuPosition($menu, e.clientY, 'height', 'scrollTop')
              })
              .off('click')
              .on('click', 'a', function(e) {
                $menu.hide();
                var $invokedOn = $menu.data("invokedOn");
                var $selectedMenu = $(e.target);
                settings.callback.call(this, $invokedOn, $selectedMenu);
              });
            return false;
          });
        });
      };
    })();

    function isUI16() {
      if (!window.top.angular) return false;
      var a = window.top.angular.element('overviewhelp').attr('page-name');
      return a == 'ui16' || a == 'helsinki';
    }

    function createContextMenu(id, items) {
      var menu, i;
      menu = '<ul id="' + id + '" class="dropdown-menu" role="menu" ' +
        'style="display: none; z-index: 999;">';
      for (i = 0; i < items.length; i++) {
        if (items[i] === '-') {
          menu += '<li class="divider"></li>';
        } else {
          menu += '<li><a href="#" tabindex="-1">' + items[i] + '</a></li>';
        }
      }
      menu += '</ul>';
      $('body').append(menu);
    }

    function navigatorPatch() {
      if (!userHasRole('teamdev_configure_instance')) {
        return;
      }
      createContextMenu('snd_ui16dp_navigator_module_menu', [
        'Edit module'
      ]);
      $('#gsft_nav').snd_ui16dp_menu({
        event: 'contextmenu',
        selector: 'a[data-id]',
        menu_id: "#snd_ui16dp_navigator_module_menu",
        callback: function(invokedOn, selectedMenu) {
          var id = invokedOn.attr('data-id'),
            url = '/sys_app_module.do';
          if (!id) {
            jslog('No data id.');
            return;
          }
          if (selectedMenu.text() == 'Edit module') {
            if (invokedOn.hasClass('nav-app')) {
              url = '/sys_app_application.do';
            }
            jslog('snd_ui16_developer_patch opening navigation module');
            openLink(url + '?sys_id=' + id);
          } else {
            jslog('Unknown item selected.');
          }
        }
      });
      jslog('snd_ui16_developer_patch navigator patch applied');
    }

    function pickerWidthPatch(offset) {
      var max_w = config.picker_width.max_width,
        min_w = config.picker_width.min_width,
        pickers = $('.navpage-pickers .selector:has(select)'),
        nav_w,
        logo_w,
        float_w,
        diff,
        size;
      if (!pickers.length) {
        jslog('snd_ui16_developer_patch picked width patch failed. No pickers found.');
        return;
      }
      $('.navpage-pickers').css('display', '');
      pickers.css('width', '');
      nav_w = $('header.navpage-header').width();
      logo_w = $('div.navbar-header').outerWidth();
      float_w = $('div.navbar-right').outerWidth();
      diff = nav_w - logo_w - float_w - (offset || 0);
      size = 100 + (diff / pickers.length);
      size = size > max_w ? max_w : size;
      if (size < min_w) {
        $('.navpage-pickers').css('display', 'none');
        jslog('snd_ui16_developer_patch pickers hidden as less than minimum width (' + size + ' < ' + min_w + ')');
      } else {
        pickers.css('width', size);
        jslog('snd_ui16_developer_patch picker width patch applied (diff: ' + diff + '; size: ' + size + ')');
      }
    }

    function patchIcon(name, className, items, callback) {
      var id = 'snd_ui16dp_' + name + '_menu',
        icon;
      createContextMenu(id, items);
      icon = $('.' + className + ' span.label-icon');
      if (icon.length) {
        icon.snd_ui16dp_menu({
          menu_id: "#" + id,
          callback: callback
        }).css('cursor', 'pointer');
        jslog('snd_ui16_developer_patch icon picker patch applied to ' + name + ' picker.');
      } else {
        jslog('snd_ui16_developer_patch icon picker patch unable to find ' + name + ' picker.');
      }
    }

    function pickerIconPatch() {
      var is_admin = userHasRole(),
        domain_table = config.picker_icon.domain_table,
        callback,
        items;
      items = [];
      items.push('View Current');
      items.push('Create New');
      items.push('-');
      items.push('View All');
      items.push('View In Progress');
      if (is_admin) items.push('View Retrieved');
      items.push('-');
      items.push('Refresh');
      if (is_admin) items.push('Import from XML');
      callback = function(invokedOn, selectedMenu) {
        switch (selectedMenu.text()) {
          case 'View Current':
            var sys_id = $('#update_set_picker_select').val();
            if (sys_id) {
              sys_id = sys_id.split(':').pop();
              openLink('/sys_update_set.do?sys_id=' + sys_id);
            }
            break;
          case 'Create New':
            openLink('/sys_update_set.do?sys_id=-1');
            break;
          case 'View All':
            openLink('sys_update_set_list.do');
            break;
          case 'View In Progress':
            openLink('sys_update_set_list.do?sysparm_query=state%3Din%20progress');
            break;
          case 'View Retrieved':
            openLink('sys_remote_update_set_list.do');
            break;
          case 'Import from XML':
            var url = 'upload.do';
            url += '?';
            url += 'sysparm_referring_url=sys_remote_update_set_list.do';
            url += '&';
            url += 'sysparm_target=sys_remote_update_set';
            openLink(url);
            break;
          case 'Refresh':
            refreshPickers();
            break;
          default:
            jslog('Unknown item selected.');
        }
      };
      patchIcon('updateset', 'concourse-update-set-picker', items, callback);
      items = [];
      items.push('View Current');
      items.push('Create New');
      items.push('-');
      items.push('View All');
      items.push('App Manager');
      items.push('-');
      items.push('Refresh');
      callback = function(invokedOn, selectedMenu) {
        switch (selectedMenu.text()) {
          case 'View Current':
            var sys_id = $('#application_picker_select').val();
            if (sys_id) {
              sys_id = sys_id.split(':').pop();
              openLink('/sys_scope.do?sys_id=' + sys_id);
            }
            break;
          case 'Create New':
            openLink('$sn_appcreator.do');
            break;
          case 'View All':
            openLink('sys_scope_list.do');
            break;
          case 'App Manager':
            openLink('$myappsmgmt.do');
            break;
          case 'Refresh':
            refreshPickers();
            break;
          default:
            jslog('Unknown item selected.');
        }
      };
      patchIcon('application', 'concourse-application-picker', items, callback);
      if (userHasRole('domain_admin')) {
        items = [];
        items.push('View Current');
        items.push('Create New');
        items.push('-');
        items.push('View All');
        items.push('Domain Map');
        items.push('-');
        items.push('Refresh');
        callback = function(invokedOn, selectedMenu) {
          switch (selectedMenu.text()) {
            case 'View Current':
              var sys_id = $('#domain_picker_select').val();
              if (sys_id) {
                sys_id = sys_id.split(':').pop();
                if (sys_id == 'global') {
                  alert('The global domain does not exist as a domain record.');
                } else {
                  openLink('/' + domain_table + '.do?sys_id=' + sys_id);
                }
              }
              break;
            case 'Create New':
              openLink(domain_table + '.do?sys_id=-1');
              break;
            case 'View All':
              openLink(domain_table + '_list.do');
              break;
            case 'Domain Map':
              openLink('domain_hierarchy.do?sysparm_stack=no&sysparm_attributes=record=domain,parent=parent,title=name,description=description,baseid=javascript:getPrimaryDomain();');
              break;
            case 'Refresh':
              refreshPickers();
              break;
            default:
              jslog('Unknown item selected.');
          }
        };
        patchIcon('domain', 'concourse-domain-picker', items, callback);
      }
    }

    function profileMenuPatch() {
      var impersonate_item;

      function addUnimpersonateItem() {
        impersonate_item.parent().after('<li><a href="snd_ui16dp_unimpersonate.do"' +
          ' target="gsft_main">Unimpersonate</a>');
        jslog('snd_ui16_developer_patch user menu patch applied.');
      }
      impersonate_item = $('#user_info_dropdown').next('ul').find('[sn-modal-show="impersonate"]');
      if (impersonate_item) {
        if (config.profile_menu.check_impersonation) {
          $.ajax({
            url: '/snd_ui16dp.do?action=getImpersonationDetails',
            type: 'GET',
            dataType: 'JSON'
          }).done(function(data) {
            if (data.result && data.result.is_impersonating) {
              addUnimpersonateItem();
            } else {
              jslog('snd_ui16_developer_patch confirmed user is not impersonating.');
            }
          }).fail(function() {
            jslog('snd_ui16_developer_patch failed to check impersonation details.');
          });
        } else {
          addUnimpersonateItem();
        }
      }
    }

    function openLink(target) {
      jslog('snd_ui16_developer_patch opening target: ' + target);
      var frame = $('#gsft_main');
      if (frame.length) {
        frame[0].src = target;
      } else {
        jslog('> gsftMain frame not found.');
      }
    }

    function refreshPickers() {
      var injector = angular.element('body').injector();
      try {
        injector.get('snCustomEvent').fire('sn:refresh_update_set');
      } catch (e) {}
      try {
        injector.get('applicationService').getApplicationList();
      } catch (e) {}
      try {
        injector.get('domainService').getDomainList();
      } catch (e) {}
    }

    function patch() {
      var interval;
      if (config.navigator_context.active) {
        navigatorPatch();
      }
      if (config.picker_width.active) {
        $('.navpage-pickers').removeClass('hidden-md');
        setTimeout(function() {
          pickerWidthPatch();
          interval = setInterval(function() {
            pickerWidthPatch();
          }, 1000);
          setTimeout(function() {
            clearInterval(interval);
          }, config.picker_width.load_timeout);
        }, config.picker_width.load_timeout);
        angular.element(window).on('resize', function() {
          pickerWidthPatch();
        });
        $('input#sysparm_search').focus(function() {
          pickerWidthPatch(config.picker_width.max_search_width);
        });
        $('input#sysparm_search').blur(function() {
          setTimeout(function() {
            pickerWidthPatch();
          }, 500);
        });
      }
      if (config.picker_icon.active) {
        pickerIconPatch();
      }
      if (config.profile_menu.active) {
        profileMenuPatch();
      }
    }

    function userHasRole(role) {
      var roles = (',' + window.NOW.user.roles + ','),
        is_admin = roles.indexOf(',admin,') > -1;
      if (roles) {
        return is_admin || roles.indexOf(',' + role + ',') > -1;
      }
      return is_admin;
    }
    $(document).ready(function() {
      try {
        if (!isUI16()) {
          window.snd_ui16_developer_patch = false;
          jslog('snd_ui16_developer_patch ignored. Not UI16.');
        } else {
          jslog('Running snd_ui16_developer_patch...');
          patch();
          window.snd_ui16_developer_patch = true;
        }
      } catch (e) {
        jslog('SND Developer Patch UI16 mod failure: ' + e);
      }
    });
  })(jQuery, window);
}
/*! RESOURCE: Knowledge ESS fix */
(function() {
  var essUrl = '/ess/knowledge_splash.do';
  var pollingDelay = 1000;
  var kbIframeHeight = 0;
  var resizeIframeFix = function() {
    setTimeout(function() {
      var height;
      if ($j('.form_body').length != 0) {
        height = $j('.section_header_div_no_scroll').height() + $j('.form_body').height() + $j('.navbar-fixed-bottom ').height() + $j('.tabs2_spacer').height() + $j('.tabs2_list').height() + 100;
      }
      if (window.location.href.indexOf('com.glideapp.servicecatalog_cat_item_view.do') != -1) {
        height = $j('body > table:nth-of-type(1)').height() + $j('#item_table').height() + $j('body > table:nth-of-type(3)').height() + 100;
      }
      top.window.$j('#gsft_main').height(height);
      resizeIframeFix();
    }, pollingDelay);
  };
  var resizeIframeFixAngularKB = function() {
    setTimeout(function() {
      if ($('gsft_main').contentWindow.$j) {
        var height = $('gsft_main').contentWindow.$j('.application').height();
        if (kbIframeHeight != height) {
          $j('#gsft_main').height(height);
          kbIframeHeight = $('gsft_main').contentWindow.$j('.application').height();
        }
        if ($('gsft_main').contentWindow.$j('body').css('overflow') != 'hidden') {
          $('gsft_main').contentWindow.$j('body').css('overflow', 'hidden');
        }
      }
      resizeIframeFixAngularKB();
    }, pollingDelay);
  };
  if (top.window.location.href.indexOf(essUrl) != -1 && top != window) {
    resizeIframeFix();
  }
  if (top == window && window.location.href.indexOf(essUrl) != -1) {
    addAfterPageLoadedEvent(function() {
      if ($('gsft_main')) {
        if ($('gsft_main').src.indexOf('$knowledge.do') != -1 || $('gsft_main').src.indexOf('knowledge_home_launcher.do') != -1) {
          resizeIframeFixAngularKB();
        }
      }
    });
  }
})();
/*! RESOURCE: UI Action Context Menu */
function showUIActionContext(event) {
  if (!g_user.hasRole("ui_action_admin"))
    return;
  var element = Event.element(event);
  if (element.tagName.toLowerCase() == "span")
    element = element.parentNode;
  var id = element.getAttribute("gsft_id");
  var mcm = new GwtContextMenu('context_menu_action_' + id);
  mcm.clear();
  mcm.addURL(getMessage('Edit UI Action'), "sys_ui_action.do?sys_id=" + id, "gsft_main");
  contextShow(event, mcm.getID(), 500, 0, 0);
  Event.stop(event);
}
addLoadEvent(function() {
  document.on('contextmenu', '.action_context', function(evt, element) {
    showUIActionContext(evt);
  });
});
/*! RESOURCE: MoveUpdateSetPicker */
addLoadEvent(moveUpdateSetPicker);

function moveUpdateSetPicker() {
  try {
    if ($('navpage_header_control_button')) {
      $('update_set_picker_select').className = '';
      if ($('update_set_picker').select('li')[0]) {
        $('update_set_picker').select('li')[0].className = '';
        $('update_set_picker').style.color = "#000";
      }
      if ($('update_set_picker').select('legend')[0]) {
        $('update_set_picker').select('legend')[0].remove();
      }
      $('nav_header_stripe_decorations').insert({
        top: $('update_set_picker')
      });
      $('update_set_picker').id = 'update_set_picker_new';
      $('update_set_picker_select_title').id = 'update_set_picker_select_title_new';
    }
  } catch (e) {}
}
/*! RESOURCE: test banner */
addLoadEvent(bannerchange);

function bannerchange() {
  if (window.jQuery) {
    $j('#mainBannerImage').css('zoom', '140%');
  }
}
/*! RESOURCE: AddUnimpersonate Button */
addLoadEvent(addUnimpersonateButton);

function addUnimpersonateButton() {
  try {
    if ($('impersonating_toggle_id').value != '') {
      $('impersonate_span').insert({
        after: '<span id="unimpersonate_span"><img onclick="unimpersonateMe();" title="End impersonation" src="images/icons/stop.gifx" style="cursor:pointer;cursor:hand"></img></span>'
      });
    }
  } catch (e) {}
}

function unimpersonateMe() {
  top.location.href = 'ui_page_process.do?sys_id=b071b5dc0a0a0a7900846d21db8e4db6&sys_user=' + $('impersonating_toggle_id').value;
}
/*! RESOURCE: /scripts/lib/jquery/jquery_clean.js */
(function() {
  if (!window.jQuery)
    return;
  if (!window.$j_glide)
    window.$j = jQuery.noConflict();
  if (window.$j_glide && jQuery != window.$j_glide) {
    if (window.$j_glide)
      jQuery.noConflict(true);
    window.$j = window.$j_glide;
  }
})();;;