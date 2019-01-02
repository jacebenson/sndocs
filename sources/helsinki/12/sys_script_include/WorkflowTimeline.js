var TimelineItem = GlideTimelineItem;

var WorkflowTimeline = Class.create();
WorkflowTimeline.prototype = Object.extendsObject(AbstractTimelineSchedulePage, {

    getItems: function() {
        var history = this.getParameter('sysparm_timeline_history');
        var au = new ArrayUtil();
              
        if (JSUtil.notNil(history)) {
            var contexts = this._getContexts(history);
            this._constructPageTitle(contexts);

            for (var context in contexts) {
                var contextItem = new TimelineItem(new Date().getTime());
                contextItem.setLeftLabelText(this._getLabelForRecord(context));
                contextItem.setImage('images/workflow/wkfl_all.gif');
                contextItem.setTextBold(true);
                var contextId = contextItem.getSysId();
                this.add(contextItem);
                var model = new WorkflowModelManager(context);
                
                var activities = model.getExecutedHistory();
                var list = contexts[context];
                var activity = model.begin;
                
                while (activity != null) {
                    // This basically says if we don't have a list of activities, it means we got a workflow
                    // context, not a list of history items, so just include all items, otherwise go and see
                    // if the history item was a selected history item before displaying it
                    if (gs.nil(list) || au.contains(list, activity.sys_id)) {
                        var item = this._getItem(activity);
                        item.contextItem = contextId;
    
                        var previous = model.getPreviousByTransition(activity);
                        
                        if (!gs.nil(previous)) {
                            var parents = item.parents;
                            for (var p = 0; p < previous.length; p++)
                                if (gs.nil(list) || au.contains(list, previous[p].sys_id))
                                    parents.push(previous[p].sys_id);
                        }
                        
                        this._item_map[item.sysId] = item;
                    }
                    
                    activity = model.getNextByExecutedOrder(activity);
                }
            }
             
            // Now render the list of items
            this._treeify();
            
            for (var item in this._item_map)
                this._renderItem(this._item_map[item]);         
        }
    },
    
    _getContexts: function(history) {
        var contexts = {};
        
        // If the history variable is for wf_history and has a comma in it, we're getting the sys ids for multiple
        // individual history records, so fetch those records, otherwise get all of them for the given workflow context
        if (history.indexOf('wf_history') > -1) {
            var gr = new GlideRecord('wf_history');
            history = history.substring(10);
            var list = new Packages.java.util.ArrayList();
            var histids = [];
            if (history.indexOf(',') > -1) {
                var ids = history.split(',');
                
                for (var i = 0; i < ids.length; i++) {
                    list.add('' + ids[i]);
                    histids.push('' + ids[i]);
                }
            } else {
                list.add(history);
                histids.push(history);
            }
                
            gr.addQuery('sys_id', list);
            gr.query();
            
            while (gr.next()) {
                var id = '' + gr.context.sys_id;
                if (gs.nil(contexts[id]))
                    contexts[id] = histids;
            }
        } else
            contexts[history] = null;
               
        return contexts;
    },
  
    _constructPageTitle: function(contexts) {
        var pageTitle = 'Workflow context';
        var contextCount = 0;
        for (var c in contexts)
            contextCount++;

        if (contextCount == 1) {
            var gr = new GlideRecord('wf_context');
            for (var c in contexts) {
                if (gr.get(c))  {
                    pageTitle += ': ' + gr.workflow_version.name;
    
                    if (JSUtil.notNil(gr.table)) {
                        pageTitle += ', ' + GlideTableDescriptor.get(gr.table).getLabel();
                        var displayValue = JSUtil.notNil(gr.id.getDisplayValue()) ? gr.id.getDisplayValue() : gr.id;
                        pageTitle += ': ' + displayValue;
                    }
                }
                else
                    pageTitle += ': UNKNOWN';
            }
        } else
            pageTitle += ': Multiple contexts';

        this.setPageTitle(pageTitle);
    },
    
    _getLabelForRecord: function(recordId) {
        var label = '';
        if (!gs.nil(recordId)) {
            var gr = new GlideRecord('wf_context');
            if (gr.get(recordId))
                label = gr.workflow_version.name;
            
            if (JSUtil.notNil(gr.table)) {
                label += ', ' + GlideTableDescriptor.get(gr.table).getLabel();
                var displayValue = JSUtil.notNil(gr.id.getDisplayValue()) ? gr.id.getDisplayValue() : gr.id;
                label += ': ' + displayValue;
            }
        }
        
        return label;
    },

    _renderItem: function(queueItem) {
        var item = new TimelineItem('wf_history', queueItem.sysId);
        item.setParent(queueItem.contextItem);
        var span = item.createTimelineSpan('wf_history', queueItem.sysId);
        span.setTimeSpan(queueItem.startTime, queueItem.endTime);
        span.setSpanText(queueItem.text);
        span.setSpanColor(queueItem.spanColor);
        span.setInnerSegmentTimeSpan(queueItem.innerSegStartTime, queueItem.innerSegEndTime);
        span.setInnerSegmentClass(queueItem.innerClass);
        item.setLeftLabelText(queueItem.text);

        var image = this._getActivityImage(queueItem.activityId);
        if (image)
            item.setImage(image);
 
        for (var i = 0; i < queueItem.parents.length; i++) {
            span.addPredecessor(queueItem.parents[i]);
            item.setParent(queueItem.parents[i]);
        }

        var tooltip = '';
        
        for (var i = 0; i < queueItem.tips.length; i++) {
            var tip = queueItem.tips[i];
            tooltip += '<strong>' + tip.title + ': </strong>' + tip.value + '<br/>';
        }
    
        if (tooltip)
            span.setTooltip(tooltip);
    
        // Finally, add the item (which contains the span).
        this.add(item);
    },

    //////////////////////////////////////////////////////////////////////////////////////////////////
    // CORE OBJECT
    //////////////////////////////////////////////////////////////////////////////////////////////////
  
    // map of items by sys_id
    _item_map: {},
 
    _addTooltips: function(item, activity) {
        this._addTooltip(item, "Name", activity.wfaName);
        this._addTooltip(item, "Activity definition name", activity.adName); 
        var processedTime = this._getProcessedTime(item, activity);
        this._addTooltip(item, "Activity processing time", processedTime);
        this._addTooltip(item, "Start time", this._getTimeDisplay(activity.startTime));
        this._addTooltip(item, "End time", this._getTimeDisplay(activity.endTime));
    },
 
    _getItem: function(activity) {
        var item = {};
        item.sysId = activity.sys_id;
        item.startTime = activity.startTime;
        item.endTime = activity.endTime;
        item.innerSegStartTime = activity.startTime;
        item.innerSegEndTime = activity.endTime;
        item.text = activity.wfaName;
        item.innerClass = activity.adName == 'Workflow' ? 'blue' : 'green';
        item.spanColor = 'tomato';
        item.activityId = activity.adId;
        item.tips = [];
        item.kids = [];
        item.parents = [];
                
        this._addTooltips(item, activity);
                           
        return item;
    },
      
    _treeify: function() {
        for (var sys_id in this._item_map) {
            var item = this._item_map[sys_id];
            
            for (var i = 0; i < item.parents.length; i++) {
                var parent = this._item_map[item.parents[i]];
                if (parent)
                    parent.kids.push(item);
            }
        }
    },
    
    _getActivityImage: function(activityId) {
        if (gs.nil(activityId))
            return null;
            
        var gr = new GlideRecord('wf_activity_definition');
        if (gr.get(activityId))
            return gr.image;
            
        return null;
    },
    
    _getTimeDisplay: function(time) {
        var gdt = new GlideDateTime();
        gdt.setNumericValue(time);
        return gdt.getDisplayValue();        
    },

    _getProcessedTime: function(activity) {
        var timeStart     = parseInt(activity.startTime, 10);
        var timeEnd       = parseInt(activity.endTime, 10);
        
        return this._getTimeDurationDisplay(timeEnd - timeStart); 
    },

    _getTimeDurationDisplay: function(timeDuration) {
        var d = new GlideDuration(); 
        d.setNumericValue(timeDuration);
        return d.getDisplayValue();
    },

    _addTooltip: function(item, title, value) {
        var tip = {};
        tip.title = title;
        tip.value = value;
        item.tips.push(tip);
    },
  
    type: 'WorkflowTimeline'
});