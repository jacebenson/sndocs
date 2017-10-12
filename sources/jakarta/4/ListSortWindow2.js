/*! RESOURCE: /scripts/classes/sort/ListSortWindow2.js */
var ListSortWindow = Class.create({
      initialize: function() {
        this.dropInClickedOrder = false;
        this.scratchPadItems = {};
        this.scratchPadItemDrs = {};
      },
      promptOK: function(title, message, callback) {
        SortUtil.getInstance().promptOK(this.template, "window." + this.template, "prompt_window", title, markup, "sort_prompt", false);
      },
      _commitChanges: function(sysIDs, targetSysID, targetInsertLocation) {
        this.processingDialog = SortUtil.getInstance().createDialog(this.template, "window." + this.template, "processing_window", getMessage("Processing"), "<br/><table style='width: 100%'><tr><td style='text-align: center'>Processing changes</td></tr></table><br/>", "sort_submit", true);
        var thisSortWindow = this;
        SortUtil.getInstance().commitChanges(sysIDs, targetSysID, targetInsertLocation, function() {
          var list = GlideList2.get(thisSortWindow.listID);
          list.setSubmitValue("sysparm_order", thisSortWindow.sysParms["sysparm_index_column"]);
          list.setSubmitValue("sysparm_order_direction", "");
          list.refresh();
        }, this.sysParms, this.sourceContainerID, this.targetContainerID, function() {
          var list = GlideList2.get(thisSortWindow.listID);
          list.setSubmitValue("sysparm_order", thisSortWindow.sysParms["sysparm_index_column"]);
          list.setSubmitValue("sysparm_order_direction", "");
          list.refresh();
        });
      },
      sortAllBySpecificColumn: function(column) {},
      shouldPromptAboutFilter: function(table, selected) {
        return false;
      },
      processDrop: function(table, target, selected, targetSysID, targetInsertLocation) {
        if (!this.dropInClickedOrder)
          selected = SortUtil.getInstance().getSelectedOrdered(selected);
        if (this.listID + "_table" == table.getAttribute("id")) {
          var thisSortWindow = this;
          var sysIDs = SortUtil.getInstance().getSysIDArray(selected, function(elem, sysID) {
            if (thisSortWindow.scratchPadItems[sysID]) {
              elem.parentNode.removeChild(elem);
              thisSortWindow.scratchPadItemDrs[sysID] = null;
              thisSortWindow.scratchPadItems[sysID] = null;
            }
          });
          var count = 0;
          for (var key in this.scratchPadItems)
            if (this.scratchPadItems[key])
              count++;
          if (count == 0)
            $(this.targetTableID).style.display = "none";
          if (targetSysID && targetInsertLocation)
            this._commitChanges(sysIDs, targetSysID, targetInsertLocation);
        } else {
          for (var i = 0; i < selected.length; i++) {
            var dr = selected[i];
            var sysID = dr.getSysID();
            if (!this.scratchPadItems[sysID]) {
              this.scratchPadItemDrs[sysID] = dr;
              var clone = GlideList2.get(this.listID).getRow(sysID).clone(true);
              this.scratchPadItems[sysID] = clone;
              clone.setAttribute("id", clone.getAttribute("id") + "_clone");
              clone.removeClassName("dndHighlightItem");
              if (target)
                target.insert({
                  before: clone
                });
              else
                $(this.targetTableID).select("TBODY")[0].appendChild(clone);
              if (!isMSIE7) {
                $("scratch_pad_table").style.borderLeft = "1px solid #DDD";
                $("scratch_pad_table").style.borderRight = "1px solid #DDD";
              }
              dr.disable();
            } else if (dr.dr.getElem().getAttribute("id").endsWith("_clone")) {
              var elem = dr.dr.getElem();
              elem.parentNode.removeChild(elem);
              if (target)
                target.insert({
                  before: elem
                });
              else
                $(this.targetTableID).select("TBODY")[0].appendChild(elem);
            }
            if (isMSIE6)
              $(this.targetTableID).style.display = "";
            else
              $(this.targetTableID).style.display = "table";
          }
        }
        this.handleListSelectionChange();
        this.sortScratchPadZebra();
        this.setupDND();
      },
      sortScratchPadZebra: function() {
        var flip = false;
        $(this.targetTableID).select("tr").each(function(row) {
          if (row.hasClassName("list_row")) {
            if (flip) {
              if (row.hasClassName("list_odd"))
                row.removeClassName("list_odd");
              if (!row.hasClassName("list_even"))
                row.addClassName("list_even");
            } else {
              if (row.hasClassName("list_even"))
                row.removeClassName("list_even");
              if (!row.hasClassName("list_odd"))
                row.addClassName("list_odd");
            }
            flip = !flip;
          }
        });
      },
      sortScratchPadByColumn: function(column) {
        var fields = GlideList2.get(this.listID).fields.split(",");
        var index = -1;
        for (var i = 0; i < fields.length; i++) {
          if (fields[i] == column) {
            index = i;
            break;
          }
        }
        var list = [];
        var parentNode;
        var row = $(this.targetTableID).down("tr");
        while (row) {
          var cell = row.select("td")[0].nextSiblings()[index];
          var obj = new Object();
          obj.row = row;
          if (document.all)
            obj.value = cell.innerText;
          else
            obj.value = cell.textContent;
          parentNode = row.parentNode;
          list[list.length] = obj;
          row = row.next();
        };
        if (parentNode) {
          var sortedList = list.sortBy(function(item) {
            return item.value;
          });
          for (var i = 0; i < sortedList.length; i++)
            parentNode.removeChild(sortedList[i].row);
          for (var i = 0; i < sortedList.length; i++)
            parentNode.appendChild(sortedList[i].row);
        }
        this.sortScratchPadZebra();
      },
      openSortWindowWithParams: function(title, contextId, contextColumn, contextTable, recordTable, indexColumn, attributes, theList) {
        document.onselectstart = function() {
          return false;
        };
        document.body.onselectstart = function() {
          return false;
        };
        var params = {};
        params['sysparm_context_id'] = contextId;
        params['sysparm_context_column'] = contextColumn;
        params['sysparm_context_table'] = contextTable;
        params['sysparm_table'] = recordTable;
        params['sysparm_index_column'] = indexColumn;
        params['sysparm_attributes'] = attributes;
        params['sysparm_source_query'] = theList.getQuery();
        this.openSortWindow(document.body, params, title,
          function() {
            document.onselectstart = function() {
              return true;
            };
            document.body.onselectstart = function() {
              return true;
            };
            Utility.getInstance().hideBackground();
            theList.refresh();
          },
          $(theList.listID + '_table').up('.section_header_body_no_scroll') != null, true, true);
      },
      openSortWindow: function(containerId, sysParms, title, closeFunc, useBodyWindow, useSynchBackFunc, disableRowAdd) {
          Draggable.startDisabled = false;
          if (disableRowAdd)
            for (var key in GlideLists2)
              GlideLists2[key].disableRowAdd = true;
          sysParms['sysparm_view'] = "ranking";
          this.scratchPadItems = {};
          this.scratchPadItemDrs = {};
          this.containerId = containerId;
          this.targetContainerID = "rightPane";
          this.sourceContainerID = "leftPane";
          this.targetTableID = "scratch_pad_table";
          this.template = "sort_page";
          this.sysParms = sysParms;
          this.processingDialog = null;
          this.useSynchBackFunc = useSynchBackFunc;
          var thisSortWindow = this;
          this.loadedFunc = function(table, list) {
            if (!list)
              return;
            if (list.listID == thisSortWindow.listID)
              thisSortWindow.processListLoad();
          };
          CustomEvent.observe("list.loaded", this.loadedFunc);
          CustomEvent.observe("partial.page.reload", this.loadedFunc);
          var viewport = document.viewport.getDimensions();
          var dialog;
          if (useBodyWindow)
            dialog = new BodyGlideDialogWindow(this.template, false, null, null, $(document.body));
          else
            dialog = new GlideDialogWindow(this.template, false);
          this.overrideEventHandlers = useBodyWindow;
          this.dialog = dialog;
          for (var key in this.sysParms)
            dialog.setPreference(key, this.sysParms[key]);
          dialog.setTitle(title);
          dialog.setSize(viewport.width - 40, viewport.height - 40);
          if (useBodyWindow)
            dialog.moveTo(15, 15);
          else
            dialog.moveTo(getScrollX() + 15, getScrollY() + 15);
          dialog.adjustBodySize();
          dialog.on("body