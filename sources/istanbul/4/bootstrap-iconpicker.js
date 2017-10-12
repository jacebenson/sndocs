/*! RESOURCE: /scripts/bootstrap-iconpicker.js */ ;
(function($) {
    "use strict";
    var Iconpicker = function(element, options) {
      this.$element = $(element);
      this.options = $.extend({}, Iconpicker.DEFAULTS, this.$element.data());
      this.options = $.extend({}, this.options, options);
    };
    Iconpicker.ICONSET_EMPTY = {
      iconClass: '',
      iconClassFix: '',
      icons: []
    };
    Iconpicker.ICONSET = {
      _custom: null,
      elusiveicon: $.iconset_elusiveicon || Iconpicker.ICONSET_EMPTY,
      fontawesome: $.iconset_fontawesome || Iconpicker.ICONSET_EMPTY,
      ionicon: $.iconset_ionicon || Iconpicker.ICONSET_EMPTY,
      glyphicon: $.iconset_glyphicon || Iconpicker.ICONSET_EMPTY,
      mapicon: $.iconset_mapicon || Iconpicker.ICONSET_EMPTY,
      materialdesign: $.iconset_materialdesign || Iconpicker.ICONSET_EMPTY,
      octicon: $.iconset_octicon || Iconpicker.ICONSET_EMPTY,
      typicon: $.iconset_typicon || Iconpicker.ICONSET_EMPTY,
      weathericon: $.iconset_weathericon || Iconpicker.ICONSET_EMPTY
    };
    Iconpicker.DEFAULTS = {
      align: 'center',
      arrowClass: 'btn-primary',
      arrowNextIconClass: 'glyphicon glyphicon-arrow-right',
      arrowPrevIconClass: 'glyphicon glyphicon-arrow-left',
      cols: 4,
      icon: '',
      iconset: 'glyphicon',
      header: true,
      labelHeader: '{0} / {1}',
      footer: true,
      labelFooter: '{0} - {1} of {2}',
      placement: 'bottom',
      rows: 4,
      search: true,
      searchText: 'Search icon',
      selectedClass: 'btn-warning',
      unselectedClass: 'btn-default'
    };
    Iconpicker.prototype.bindEvents = function() {
      var op = this.options;
      var el = this;
      op.table.find('.btn-previous, .btn-next').off('click').on('click', function(e) {
        e.preventDefault();
        var inc = parseInt($(this).val(), 10);
        el.changeList(op.page + inc);
      });
      op.table.find('.btn-icon').off('click').on('click', function(e) {
        e.preventDefault();
        el.select($(this).val());
        if (op.inline === false) {
          el.$element.popover('destroy');
        } else {
          op.table.find('i.' + $(this).val()).parent().addClass(op.selectedClass);
        }
      });
      op.table.find('.search-control').off('keyup').on('keyup', function() {
        el.changeList(1);
      });
    };
    Iconpicker.prototype.changeList = function(page) {
      this.filterIcons();
      this.updateLabels(page);
      this.updateIcons(page);
      this.options.page = page;
      this.bindEvents();
    };
    Iconpicker.prototype.filterIcons = function() {
      var op = this.options;
      var search = op.table.find('.search-control').val();
      if (search === "") {
        op.icons = Iconpicker.ICONSET[op.iconset].icons;
      } else {
        var result = [];
        $.each(Iconpicker.ICONSET[op.iconset].icons, function(i, v) {
          if (v.indexOf(search) > -1) {
            result.push(v);
          }
        });
        op.icons = result;
      }
    };
    Iconpicker.prototype.removeAddClass = function(target, remove, add) {
      this.options.table.find(target).removeClass(remove).addClass(add);
      return add;
    };
    Iconpicker.prototype.reset = function() {
      this.updatePicker();
      this.changeList(1);
    };
    Iconpicker.prototype.select = function(icon) {
      var op = this.options;
      var el = this.$element;
      op.selected = $.inArray(icon.replace(op.iconClassFix, ''), op.icons);
      if (op.selected === -1) {
        op.selected = 0;
        icon = op.iconClassFix + op.icons[op.selected];
      }
      if (icon !== '' && op.selected >= 0) {
        op.icon = icon;
        if (op.inline === false) {
          el.find('input').val(icon);
          el.find('i').attr('class', '').addClass(op.iconClass).addClass(icon);
        }
        if (icon === op.iconClassFix) {
          el.trigger({
            type: "change",
            icon: 'empty'
          });
        } else {
          el.trigger({
            type: "change",
            icon: icon
          });
        }
        op.table.find('button.' + op.selectedClass).removeClass(op.selectedClass);
      }
    };
    Iconpicker.prototype.switchPage = function(icon) {
      var op = this.options;
      op.selected = $.inArray(icon.replace(op.iconClassFix, ''), op.icons);
      if (op.selected >= 0) {
        var page = Math.ceil((op.selected + 1) / this.totalIconsPerPage());
        this.changeList(page);
      }
      if (icon === '') {
        op.table.find('i.' + op.iconClassFix).parent().addClass(op.selectedClass);
      } else {
        op.table.find('i.' + icon).parent().addClass(op.selectedClass);
      }
    };
    Iconpicker.prototype.totalPages = function() {
      return Math.ceil(this.totalIcons() / this.totalIconsPerPage());
    };
    Iconpicker.prototype.totalIcons = function() {
      return this.options.icons.length;
    };
    Iconpicker.prototype.totalIconsPerPage = function() {
      if (this.options.rows === 0) {
        return this.options.icons.length;
      } else {
        return this.options.cols * this.options.rows;
      }
    };
    Iconpicker.prototype.updateArrows = function(page) {
      var op = this.options;
      var total_pages = this.totalPages();
      if (page === 1) {
        op.table.find('.btn-previous').addClass('disabled');
      } else {
        op.table.find('.btn-previous').removeClass('disabled');
      }
      if (page === total_pages || total_pages === 0) {
        op.table.find('.btn-next').addClass('disabled');
      } else {
        op.table.find('.btn-next').removeClass('disabled');
      }
    };
    Iconpicker.prototype.updateIcons = function(page) {
      var op = this.options;
      var tbody = op.table.find('tbody').empty();
      var offset = (page - 1) * this.totalIconsPerPage();
      var length = op.rows;
      if (op.rows === 0) {
        length = op.icons.length;
      }
      for (var i = 0; i < length; i++) {
        var tr = $('<tr></tr>');
        for (var j = 0; j < op.cols; j++) {
          var pos = offset + (i * op.cols) + j;
          var btn = $('<button class="btn ' + op.unselectedClass + ' btn-icon"></button>').hide();
          if (pos < op.icons.length) {
            var v = op.iconClassFix + op.icons[pos];
            btn.val(v).attr('title', v).append('<i class="' + op.iconClass + ' ' + v + '"></i>').show();
            if (op.icon === v) {
              btn.addClass(op.selectedClass).addClass('btn-icon-selected');
            }
          }
          tr.append($('<td></td>').append(btn));
        }
        tbody.append(tr);
      }
    };
    Iconpicker.prototype.updateIconsCount = function() {
      var op = this.options;
      if (op.footer === true) {
        var icons_count = [
          '<tr>',
          '   <td colspan="' + op.cols + '" class="text-center">',
          '       <span class="icons-count"></span>',
          '   </td>',
          '</tr>'
        ];
        op.table.find('tfoot').empty().append(icons_count.join(''));
      }
    };
    Iconpicker.prototype.updateLabels = function(page) {
      var op = this.options;
      var total_icons = this.totalIcons();
      var total_pages = this.totalPages();
      op.table.find('.page-count').html(op.labelHeader.replace('{0}', (total_pages === 0) ? 0 : page).replace('{1}', total_pages));
      var offset = (page - 1) * this.totalIconsPerPage();
      var total = page * this.totalIconsPerPage();
      op.table.find('.icons-count').html(op.labelFooter.replace('{0}', total_icons ? offset + 1 : 0).replace('{1}', (total < total_icons) ? total : total_icons).replace('{2}', total_icons));
      this.updateArrows(page);
    };
    Iconpicker.prototype.updatePagesCount = function() {
      var op = this.options;
      if (op.header === true) {
        var tr = $('<tr></tr>');
        for (var i = 0; i < op.cols; i++) {
          var td = $('<td class="text-center"></td>');
          if (i === 0 || i === op.cols - 1) {
            var arrow = [
              '<button class="btn btn-arrow ' + ((i === 0) ? 'btn-previous' : 'btn-next') + ' ' + op.arrowClass + '" value="' + ((i === 0) ? -1 : 1) + '">',
              '<span class="' + ((i === 0) ? op.arrowPrevIconClass : op.arrowNextIconClass) + '"></span>',
              '</button>'
            ];
            td.append(arrow.join(''));
            tr.append(td);
          } else if (tr.find('.page-count').length === 0) {
            td.attr('colspan', op.cols - 2).append('<span class="page-count"></span>');
            tr.append(td);
          }
        }
        op.table.find('thead').empty().append(tr);
      }
    };
    Iconpicker.prototype.updatePicker = function() {
      var op = this.options;
      if (op.cols < 4) {
        throw 'Iconpicker => The number of columns must be greater than or equal to 4. [option.cols = ' + op.cols + ']';
      } else if (op.rows < 0) {
        throw 'Iconpicker => The number of rows must be greater than or equal to 0. [option.rows = ' + op.rows + ']';
      } else {
        this.updatePagesCount();
        this.updateSearch();
        this.updateIconsCount();
      }
    };
    Iconpicker.prototype.updateSearch = function() {
      var op = this.options;
      var search = [
        '<tr style="display: table-row;">',
        '   <td colspan="' + op.cols + '">',
        '       <input type="text" class="form-control search-control" style="width: ' + op.cols * 39 + 'px;" placeholder="' + op.searchText + '">',
        '   </td>',
        '</tr>'
      ];
      search = $(search.join(''));
      if (op.search === true) {
        search.show();
      } else {
        search.hide();
      }
      op.table.find('thead').append(search);
    };
    Iconpicker.prototype.setAlign = function(value) {
      this.$element.removeClass(this.options.align).addClass(value);
      this.options.align = value;
    };
    Iconpicker.prototype.setArrowClass = function(value) {
      this.options.arrowClass = this.removeAddClass('.btn-arrow', this.options.arrowClass, value);
    };
    Iconpicker.prototype.setArrowNextIconClass = function(value) {
      this.options.arrowNextIconClass = this.removeAddClass('.btn-next > span', this.options.arrowNextIconClass, value);
    };
    Iconpicker.prototype.setArrowPrevIconClass = function(value) {
      this.options.arrowPrevIconClass = this.removeAddClass('.btn-previous > span', this.options.arrowPrevIconClass, value);
    };
    Iconpicker.prototype.setCols = function(value) {
        this.options.cols = value;
        th