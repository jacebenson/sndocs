/*! RESOURCE: /scripts/classes/doctype/GlideHeaderSearch.js */
$j(function($) {
  'use strict';
  if (window.NOW.headerSearchLoaded)
    return;
  window.NOW.headerSearchLoaded = true;
  var keyEvents = isMSIE9 || isMSIE10 ? "keydown" : "keyup"
  $(document).on(keyEvents, "INPUT.list_header_search", function(evt) {
    $(this).addClass('modified');
    var choiceType = $(this).closest('[data-choice]').attr('data-choice');
    var isReference = $(this).closest('[data-glide-type="reference"]').length > 0;
    if (!isReference && (choiceType == '1' || choiceType == '3')) {
      parseChoice($(this).closest('[data-choice]'));
    }
    if (evt.keyCode != 13)
      return;
    evt.preventDefault();
    submitHeaderSearch(this);
  });

  function submitHeaderSearch(el) {
    var $table = $(el).closest('table.list_table');
    if ($table.data('choice_query_active')) {
      $table.data('choice_query_submit_onresponse', true);
      return;
    }
    var listID = $table.attr('data-list_id');
    var list = GlideList2.get(listID);
    var query = getQueryFromTable($table);
    var extraParms = {
      sysparm_choice_query_raw: getRawChoiceQuery($table),
      sysparm_list_header_search: true
    };
    list.setFilter(query);
    list.refresh(1, extraParms);
  }

  function parseChoice($el) {
    var $table = $el.closest('table.list_table');
    var table = $table.attr('glide_table');
    var field = $el.attr('name');
    var $input = $el.find('input.list_header_search.modified');
    var value = $input.val();
    if (!value) {
      $input.data('choice_query', null);
      return;
    }
    $table.data('choice_query_active', true);
    var term = buildTerm(field, value)
    var partialTerm = term.operator + term.value;
    translateChoiceListQuery(table, field, partialTerm, function onSuccess(values) {
      term.operator = 'IN';
      term.value = values.join(',');
      $input.data('choice_query', term);
      submitIfNecessary($table);
    }, function onError() {
      submitIfNecessary($table);
    });
  }

  function submitIfNecessary($table) {
    $table.data('choice_query_active', false);
    if ($table.data('choice_query_submit_onresponse'))
      submitHeaderSearch($table);
  }

  function getRawChoiceQuery($table) {
    var query = [];
    $table.find('tr.list_header_search_row td').each(function(index, el) {
      var choiceType = el.getAttribute('data-choice');
      var isReference = el.getAttribute('data-glide-type') == "reference";
      if (isReference || (choiceType != '1' && choiceType != '3'))
        return;
      var field = el.getAttribute('name');
      var $input = $(el).find('input.list_header_search');
      if (!$input.val())
        return;
      var term = buildTerm(field, $input.val())
      query.push(term.field + term.operator + term.value);
    });
    return query.join('^');
  }

  function loadFromTables() {
    $('TABLE.list_table').each(function(index, table) {
      var $table = $(table);
      var query = $table.attr('query');
      if (typeof query === 'undefined')
        return;
      var filterEnabled = isFilterEnabled($table);
      if (query.indexOf('^NQ') != -1 || query.indexOf('^OR') != -1 || !filterEnabled) {
        var orMatches = query.match(/\^OR/g) !== null ? query.match(/\^OR/g).length : 0;
        var orderByMatches = query.match(/\^ORDERBY/g) !== null ? query.match(/\^ORDERBY/g).length : 0;
        if (orMatches != orderByMatches || query.indexOf('^NQ') != -1 || !filterEnabled) {
          $j($table).find('button.list_header_search_toggle')
            .attr('disabled', true)
            .closest('th')
            .attr('title', getMessage('This filter query cannot be edited'))
            .addClass('disabled')
            .css('cursor', 'not-allowed')
            .tooltip()
            .hideFix();
          $table.addClass('list_header_search_disabled');
        }
      }
      var listID = $table.attr('data-list_id');
      var enc = new GlideEncodedQuery(listID, query);
      enc.partsXML = loadXML($table.attr('parsed_query'));
      enc.terms = [];
      enc.parseXML();
      var parts = enc.getTerms();
      var encChoice = new GlideEncodedQuery(listID, $table.attr('choice_query'));
      encChoice.partsXML = loadXML($table.attr('parsed_choice_query'));
      encChoice.terms = [];
      encChoice.parseXML();
      parts = parts.concat(encChoice.getTerms());
      var hasHeaderQueries = false;
      var hasGotoQuery = false;
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var value = p.displayValue || p.value;
        if (value && value.indexOf('javascript:') == 0) {
          p.script = true;
          continue;
        }
        if (p.Goto == 'true')
          hasGotoQuery = true;
        if (setInputValue($table, p.field, buildDisplayValue(p.operator, value)))
          hasHeaderQueries = true;
      }
      showHeaderSearchRow($table, hasHeaderQueries, hasGotoQuery);
      disableUnsupportedFields($table);
      $table.data('g_enc_query', enc);
      if ($table.hasClass('list_header_search_disabled') && $table.hasClass('list_header_search'))
        $table.removeClass('list_header_search');
    });
  }

  function setInputValue($table, field, value) {
    if (!value)
      return false;
    var columnInput = $table.find('.list_header_search_row td[name="' + field + '"] input');
    if (columnInput.length == 0 && field.indexOf('.') > -1) {
      var lastDot = field.lastIndexOf('.');
      var refField = field.substring(0, lastDot);
      var refFieldDisplay = field.substring(lastDot + 1);
      columnInput = $table.find('.list_header_search_row ' +
        'td[name=\'' + refField + '\']' +
        '[data-glide-type=reference]' +
        '[data-glide-reference-name=' + refFieldDisplay + ']' +
        ' input');
    }
    columnInput.val(value);
    return columnInput.length > 0;
  }

  function getQueryFromTable($table) {
    var enc_query = $table.data('g_enc_query');
    var terms = enc_query ? enc_query.getTerms() : [];
    $table.find('tr.list_header_search_row td').each(function(index, el) {
      var field = el.getAttribute('name');
      var type = el.getAttribute('data-glide-type');
      var baseField = "";
      var reference_name = el.getAttribute('data-glide-reference-name');
      if (reference_name) {
        baseField = field;
        field = field + '.' + reference_name;
      }
      var $input = $(el).find('input.list_header_search.modified');
      if ($input.length === 0)
        return;
      var value = $input.val() || '';
      var newTerm;
      var choiceQuery = $input.data('choice_query');
      if (choiceQuery)
        newTerm = choiceQuery;
      else
        newTerm = buildTerm(field, value);
      var found = false;
      for (var i = terms.length - 1; i >= 0; i--) {
        if ((terms[i].field == newTerm.field || terms[i].field == baseField) &&
          terms[i].script !== true) {
          found = true;
          if (newTerm.value || value)
            terms[i] = newTerm;
          else
            terms.splice(i, 1);
          break;
        }
      }
      if (!found && value)
        terms.push(newTerm);
    });
    var query = "";
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t.field)
        continue;
      query += '^' + t.field + t.operator + t.value;
    }
    return query;
  }

  function buildTerm(field, value) {
    var operator = 'STARTSWITH';
    if (value.indexOf('*') == 0 || value.indexOf('.') == 0) {
      operator = 'LIKE';
      value = value.substring(1);
    } else if (value.indexOf('=') == 0) {
      operator = '=';
      value = value.substring(1);
    } else if (value.indexOf('!=') == 0) {
      operator = '!=';
      value = value.substring(2);
    } else if (value.indexOf('%') == 0) {
      if (value.charAt(value.length - 1) == '%') {
        operator = 'LIKE';
        value = value.substring(1, value.length - 1);
      } else {
        operator = 'ENDSWITH';
        value = value.substring(1);
      }
    } else if (value.charAt(value.length - 1) == '%') {
      operator = 'STARTSWITH';
      value = value.substring(0, value.length - 1);
    } else if (value.indexOf('!*') == 0) {
      operator = 'NOT LIKE';
      value = value.substring(2);
    }
    return {
      field: field,
      operator: operator,
      value: value
    }
  }

  function buildDisplayValue(operator, value) {
    switch (operator) {
      case 'LIKE':
        return '*' + value;
      case 'STARTSWITH':
        return value;
      case 'NOT LIKE':
        return '!*' + value;
      case 'ENDSWITH':
        return '%' + value;
      case '=':
      case '!=':
        return operator + value;
    }
    return '';
  }
  $(document).on("click", "button.list_header_search_toggle", function(evt) {
    var $table = $(this).closest('TABLE')
    if ($table.hasClass('list_header_search_disabled'))
      return;
    var isActive;
    if ($table.hasClass('list_header_search')) {
      isActive = false;
      $table.removeClass('list_header_search');
    } else {
      isActive = true;
      disableUnsupportedFields($table);
      $table.addClass('list_header_search');
    }
    if (canUseListSearchPreference())
      setPreference('glide.ui.list_header_search.open', isActive);
    CustomEvent.fire('listheadersearch.show_hide');
    _frameChanged();
    evt.preventDefault();
  })

  function translateChoiceListQuery(table, field, filter, callback, callbackError) {
    $.ajax({
      url: 'xmlhttp.do?sysparm_processor=com.glide.ui.ChoiceListSearchProcessor',
      data: {
        table: table,
        field: field,
        filter: filter
      },
      headers: {
        'X-UserToken': window.g_ck
      },
      success: function(response) {
        if (response) {
          var responseJSON = JSON.parse(response.documentElement.getAttribute('answer'));
          callback.call(null, responseJSON.result);
        } else {
          callbackError.call(null);
        }
      },
      error: function() {
        callbackError.call(null);
      }
    })
  }

  function showHeaderSearchRow($table, hasHeaderQueries, hasGoto) {
    if (window.g_report)
      return;
    var preferenceValue = $table.find('tr.list_header_search_row').attr('data-open-onload') == 'true' &&
      canUseListSearchPreference();
    if (preferenceValue) {
      $table.addClass('list_header_search');
      CustomEvent.fire('listheadersearch.show_hide');
      return;
    }
    var cameFromNavigator = location.search.indexOf('sysparm_userpref_module=') != -1;
    if (cameFromNavigator)
      return;
    var onLoadShowSearch = $table.attr('data-search-show') == 'true';
    var openWithGoto = $table.find('tr.list_header_search_row').attr('data-open-ongoto') == 'true';
    if ((onLoadShowSearch && hasHeaderQueries) || (hasGoto && openWithGoto))
      $table.addClass('list_header_search');
  }

  function isFilterEnabled($table) {
    if (!window.GlideListWidgets)
      return false;
    var listID = $table.attr('data-list_id');
    for (var i in GlideListWidgets) {
      var glw = GlideListWidgets[i];
      if (glw.listID == listID && glw._isFilterEnabled)
        return true;
    }
    return false;
  }

  function disableUnsupportedFields($table) {
    $table.find('tr.list_header_search_row td').each(function(index, el) {
      var type = el.getAttribute('data-glide-type');
      if (type == 'user_roles' || type == 'glide_list' || type == 'related_tags' || type == 'sys_class_name')
        $(el).find('input.list_header_search').prop('disabled', true);
    })
  }

  function canUseListSearchPreference() {
    return !window.g_form;
  }
  loadFromTables();
  CustomEvent.observe('partial.page.reload', loadFromTables);
});;