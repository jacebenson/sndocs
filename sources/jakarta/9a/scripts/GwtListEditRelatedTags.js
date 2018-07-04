/*! RESOURCE: /scripts/GwtListEditRelatedTags.js */
var GwtListEditRelatedTags = Class.create(GwtListEditWindow, {
      createOkCancel: function() {
        var save = createImage('images/icons/nav_clear_2.png', this.msgSaveButton, this, this.saveEvent);
        save.id = 'cell_edit_ok';
        save.width = 18;
        save.height = 18;
        this.addDecoration(save);
      },
      save: function() {},
      createEditControls: function() {
          var $ = $j;
          var that = this;
          var tags = new Element("ul", {
            "id": "tag_cell_edit"
          });
          this.setTitle(tags);
          $dt = $('#tag_cell_edit');
          var url = new GlideURL("data_table.do");
          url.addParam('sysparm_type', 'labels');
          url.addParam('sysparm_table', this.editor.table);
          url.addParam('sysparm_sys_id', this.editor.getCanWriteIds().toString());
          url.addParam('sysparm_action', 'common_labels');
          url.addParam('nocache', (new Date().getTime().toString()));
          url = url.getURL();
          $.ajax({
            dataType: "json",
            url: url,
            success: initializeResponse
          });

          function labelTypeAhead(table, search, showChoices) {
            var url = new GlideURL("data_table.do");
            url.addParam('sysparm_type', 'labels');
            url.addParam('sysparm_table', table);
            url.addParam('sysparm_action', 'available_labels');
            url.addParam('sysparm_prefix', search.term);
            url = url.getURL();
            $.ajax({
              dataType: "json",
              url: url,
              success: function() {
                var t = arguments[2].responseText;
                var response = JSON.parse(t);
                showChoices(response.availableLabels);
              }
            });
          }

          function initializeResponse() {
            var labels = JSON.parse(arguments[2].responseText);
            $dt.html += "<li></li>";
            $dt.newtagit({
              allowSpaces: true,
              afterTagAdded: onTagAdded,
              afterTagRemoved: onTagRemoved,
              showAutocompleteOnFocus: false,
              animate: false,
              placeholderText: getMessage("Add Tag..."),
              table: labels.table,
              labelsListString: JSON.stringify(labels),
              autocomplete: {
                source: function(search, showChoices) {
                  labelTypeAhead(labels.table, search, showChoices);
                }
              },
              query: "",
              context: "cellEdit",
              rowId: that.getAnchorSysId(),
              fieldName: "documentTags"
            });
            $dt.css("display", "inline-block");
          }

          function onTagAdded(evt, ui) {
            if (ui.duringInitialization)
              return;
            var rowIds = that.editor.getCanWriteIds();
            var validRowIds = [];
            for (var i = 0; i < rowIds.length; i++) {
              var row = $("tr[sys_id='" + rowIds[i] + "']");
              var labelNames = row.find(".tagit-label:contains(" + ui.tagLabel + ")")
                .filter(function() {
                  return this.text == ui.tagLabel
                });
              if (labelNames.length != 0)
                continue;
              row.find("input.ui-widget-content").parent().before(ui.tag.clone(true));
              validRowIds.push(rowIds[i]);
            }
            labelSet('add', ui.tagLabel, ui.table, validRowIds);
          }

          function onTagRemoved(evt, ui) {
            if (ui.duringInitialization)
              return;
            var rowIds = that.editor.getCanWriteIds();
            var validRowIds = [];
            for (var i = 0; i < rowIds.length; i++) {
              var label = $("tr[sys_id='" + rowIds[i] + "']").find("li[id='" + ui.tag + "']");
              if (label.length != 0) {
                label.remove();
                validRowIds.push(rowIds[i]);
              }
            }
            labelSet('removeById', ui.tag, ui.table, validRowIds);
          }

          function labelSet(action, label, table, rowId) {
            var url = new GlideURL("data_table.do");
            url.addParam('sysparm_type', 'labels');
            url.addParam('sysparm_table', table);
            url.addParam('sysparm_sys_id', rowId.toString());
            url.addParam('sysparm_label', label);
            url.addParam('sysparm_action', action);
            url = url.getURL();
            $.ajax({
              dataType: "json",
              url: url,
              success: labelResponse
            });
          }

          function labelResponse() {
            if (g_enhanced_activated == 'false') return;
            if (arguments == null || arguments[2] == null) return;
            var t = arguments[2].responseText;
            if (t == "" || t == null) return;
            var json = JSON.parse(t);
            var share = $dt.find('[id=\'' + json.label + '\'].tagit-share');
            share.parent().attr("id", json.sysId).css({
              "background-color": json.bgcolor,
              "color": json.tcolor
            });
            share.parent().find(".tagit-label").unbind('click').click(function() {
              window.location.href = json.table + "_list.do?sysparm_query=" + json.query
            });
            if (json.owner != true) {
              share.removeClass("pointerhand");
              share.unbind("click");
            }
            var icon = (json.type == 'SHARED') ? 'icon-user-group' : 'icon-user';
            share = share.children();
            share.removeClass("icon-user-group icon-user").addClass(icon);
            v