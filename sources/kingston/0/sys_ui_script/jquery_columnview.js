// Adds input box text range selection
if (!jQuery.fn.selectRange) {
    jQuery.fn.selectRange = function(start, end) {
        if(!end) end = start;
        return this.each(function() {
            if (this.setSelectionRange) {
                this.focus();
                this.setSelectionRange(start, end);
            } else if (this.createTextRange) {
                var range = this.createTextRange();
                range.collapse(true);
                range.moveEnd('character', end);
                range.moveStart('character', start);
                range.select();
            }
        });
    };
}

// checks the end of a string
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

/*!
 * mapAttributes jQuery Plugin v1.0.0
 *
 * Copyright 2010, Michael Riddle
 * Licensed under the MIT
 * http://jquery.org/license
 *
 * Date: Sun Mar 28 05:49:39 2010 -0900
 */
if (!jQuery.fn.mapAttributes) {
    jQuery.fn.mapAttributes = function(prefix) {
        var maps = [];
        $(this).each(function() {
            var map = {};
            for (var key in this.attributes) {
                if (!isNaN(key)) {
                    if (!prefix || this.attributes[key].name.substr(0,prefix.length) == prefix) {
                        map[this.attributes[key].name] = this.attributes[key].value;
                    }
                }
            }
            maps.push(map);
        });
        return (maps.length > 1 ? maps : maps[0]);
    };
}

/**
 * jquery.columnview-1.3.js
 *
 * Created by Chris Yates on 2009-02-26.
 * http://christianyates.com
 *
 * Copyright 2009 Christian Yates and ASU Mars Space Flight Facility. All rights reserved.
 * Copyright 2011 Manuel Odendahl <wesen@ruinwesen.com>
 * Copyright 2012 James Roberts <feedthefire@gmail.com>
 *
 * Supported under jQuery 1.5.x or later
 *
 * Dual licensed under MIT and GPL.
 *
 * 90% modified to meet SN features requirements.
 */
(function($) {
    var defaults = {
        height:     '150px',    // Height of colview-container
        maxWidth: false, // maximum width of the main container div. Columns will scroll horizontally.
        preview:    true,       // Handler for preview pane
        attrs: [],              // attributes to pull from original items
        autoFocus: true,        // focus to column onclick
        getSubtree: undefined,  // callback for getting new data
        onChange:   undefined,  // callback for onclick
        columnMargin: 5, // css margin between column border and inner text.
        isRtl: $j("html").hasClass("rtl"),
        jsonData: false,
        isQuirksMode: (document.compatMode !== 'CSS1Compat'), // true for IE7/8 and when glide.ui.doctype == false, but false for IE9
        isOldIE: isMSIE7 || isMSIE8 || isMSIE9, // IE 7, 8 and 9 are treated the same because their lack of support for pseudo css classes.
        isIE: isIE(), // is any IE version, even newer Trident engines.
        idValue: false, // value of current element ID to be displayed
        pathSeparator: ' || ',
        blockEditing: false // to be set by caller.
    };

    /** Detects all IE versions, even the ones identifying as "Trident" such as IE11.
     * (isMSIE doesn't detect Trident engines properly)
     */
    function isIE() {
        var isNetscape = navigator.appName == 'Netscape';
        var isTrident = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null;
        return ((navigator.appName == 'Microsoft Internet Explorer') || (isNetscape && isTrident));
    }

    // last event data when adding or modifying a menu item.
    var lastEvent = false;

    /**
     * default subtree function, returns child elements of the original list.
     **/
    var getSubtree = function (elt) {
        var children = $j(elt).data("sub");
        if (children) {
            return children.children('li');
        } else {
            return $j(elt).children('li');
        }
    };

    function createNewCatInput() {
        return $j('<input id="newCategoryInput"/>').addClass('labelInput');
    }

    function init(options) {
        var $this = $j(this);
        var data = $this.data("columnview");

        if (data) {
            /* plugin has already been initialized */
            return $this;
        }

        var settings = $.extend({}, defaults, options);

        if (typeof settings.jsonData === 'string') {
            settings.jsonData = $j.parseJSON(settings.jsonData);
        }

        /* fix order of declaration */
        if (!settings.getSubtree) {
            settings.getSubtree = getSubtree;
        }

        if (settings.maxWidth && !(''+settings.maxWidth).endsWith('px')) {
            settings.maxWidth += 'px';
        }
        defaults = settings;

        addCSS(settings);

        // Hide original list
        $this.hide();

        defaults.containerId = $this.attr('id') + '-columnview-container';
        data = {
            settings: settings,
            origElt: $this
        };

        // Create new top container
        var $container = $j('<div/>').addClass('colview-container').css({'height':settings.height}).attr({'id': defaults.containerId}).insertAfter($this);
        $container.addClass((defaults.blockEditing) ? 'block-edit' : 'allow-edit');
        $container.data('columnview', data);

        /* populate the first column */
        var columnDiv = buildList(settings.jsonData, $container);
        columnDiv.attr('class', 'top column');
        addPlusButtons();

        /* bind events on the newly created column entries */
        $container.click(handleClickEvent);

        // set page-global events
        if (defaults.isOldIE)
            $j(document).on('keyup', handleKeyEvent);
        else
            $j(window).on('keyup', handleKeyEvent);

        if (settings.idValue) {
            setTimeout(function() {
                var idPath = findPathById(settings.jsonData, settings.idValue, settings.pathSeparator);
                idPath = idPath.split(settings.pathSeparator);
                drillIntoPath(idPath, $container);
            }, 150);
        }

        // hijack ok/cancel button event handlers.
        var $okBtn = $j('#body_kb_categories_dialog .btn.btn-primary.category-ok-btn');
        var okFncOnClick = $okBtn[0].onclick;
        $okBtn[0].onclick = null;
        var $cancelBtn = $j('#body_kb_categories_dialog .btn.btn-default');

        // hook on the OK button
        $okBtn.click(function(evt) {
            destroy();
            disableOkCancel();
            fireIeBlurEvent(this);
            if (lastEvent) {
                var defer = $j.Deferred();
                var deferredFnc = defer.then(function() {
                    // defer processing the original click event until after the data has been processed.
                    okFncOnClick(evt.originalEvent);
                });
                processLastEvent(deferredFnc);
            } else {
                okFncOnClick(evt.originalEvent);
            }
        });

        // hook on the Cancel button
        $cancelBtn.click(function(evt) {
            destroy();
            if (window.blurTimeout) clearTimeout(blurTimeout);
            disableOkCancel();
        });

        var maxWidth = $container.parent().width() - 5;
        $container.css('max-width', maxWidth);
        if (defaults.isOldIE) {
            $container.width(maxWidth);
        }

        return $this;
    }

    // remove page-golbal events
    function destroy() {
        if (defaults.isOldIE)
            $j(document).off('keyup', handleKeyEvent);
        else
            $j(window).off('keyup', handleKeyEvent);
    };

    /**
     * Handle a click event on an item inside the menu.
     */
    
    
    function handleClickEvent(event) {
        lastEvent = false;
        var $target = $j(event.target);
        var $newItem = $j('#newCategoryInput');
        
        //Handle a click outside of the items and will focus on errored input
        if (!$target.is('.list-item, .label') || $newItem.length != 0) {         
            $newItem.focus();       
            return;
        }

        processLastEvent();

        var $container = $j('#' + defaults.containerId);
        var data = $container.data('columnview');
        var settings = data.settings;
        var $self = $target.is('.label') ? $target.parent() : $target;
        $self.focus();

        /** if element already active, go into edit mode:
         *  hide the element, show the input field, bind an event to handle the new input value
         */
        if (!defaults.blockEditing && $self.hasClass("colview-active")) {
            $self.addClass('pen-icon');
            var label = $self.find('.label').eq(0);
            label.css('display', 'none');
            var content = label.text();
            var input = createNewCatInput();
            input.val(content);

            if (defaults.isQuirksMode && defaults.isOldIE) {
                input.css('height', '26px');
                input.css('line-height', '26px');
            }

            input.appendTo($self);
            input.focus();
            input.selectRange(0, content.length);

            if (defaults.isQuirksMode && defaults.isOldIE) {
                input.width($self.width()-20);
            }

            setInputHandlers(input, {
                type: 'update',
                originElId: data.origElt.attr('id')
            });
        } else {
            var level = $j('.column', $container).index($self.parents('.column'));
            /** Remove blocks to the right in the tree, and 'deactivate' other
             * links within the same level, if metakey is not being used
             */
            $j('.column:gt('+level+')', $container).remove();
            $j('.column:eq('+level+') .list-item', $container).removeClass('colview-active inpath');
            $j('.colview-active', $container).addClass('inpath');
            $j('.column:lt('+level+') .list-item', $container).removeClass('colview-active');

            $self.addClass('colview-active');
            var item = findItemById(data.settings.jsonData, $self.data('id'));

            if (item.items.length) {
                // Menu has children, so add another submenu
                addSubmenu($container, $self);
                addPlusButtons();
                return;
            } else {
                // No children, show title instead (if it exists, or a link)
                addLastColumn($container);
            }

            var activeElem = $container.find(".colview-active").eq(0);
            data.origElt.trigger("columnview_select", {
                'id': activeElem.data('id'),
                'value': activeElem.data('label')
            });
        }

        if (settings.onChange)
            settings.onChange($container.find('.colview-active'));

        if (settings.autoFocus)
            $container.scrollLeft($self.offsetParent().offset().left);

        event.preventDefault();
    }

    /**
     * Handle Keyboard navigation
     */
    function handleKeyEvent(event) {
        // not while editing a list item
        if ($j(event.target).is('.labelInput')) {
            return;
        }
        var $container = $j('#' + defaults.containerId);
        var $self = $container.find('.colview-active');
        var keyCode = event.which;
        if (defaults.isRtl) {
            // swap left and right key code when running in rtl mode.
            if (keyCode == 37) keyCode = 39;
            else if (keyCode == 39) keyCode = 37;
        }
        switch (keyCode) {
            case (37): //left
                event.preventDefault();
                $self.parent().prev().children('.inpath').focus().trigger('click');
                break;
            case (38): //up
                event.stopImmediatePropagation();
                event.preventDefault();
                $self.prev().focus().trigger('click');
                break;
            case (39): //right
                event.preventDefault();
                if ($self.hasClass('arrow')) {
                    $self.parent().next().children('.list-item:first').focus().trigger('click');
                }
                break;
            case (40): //down
                event.stopImmediatePropagation();
                event.preventDefault();
                $self.next().focus().trigger('click');
                break;
        }
    }

    /**
     * Dispatcher method for the jQuery plugin. Call without arguments
     * or options to call the initializer, or pass a method name and
     * arguments:
     *
     * $j(elt).columnview();
     *
     */
    $j.fn.columnview = function(arg) {
        if (typeof arg === 'object') {
            return init.apply(this, arguments);
        } else {
            $j.error('jQuery.columnview needs a json object literal as argument');
        }
    };

    function disableOkCancel() {
        $j('#body_kb_categories_dialog .btn.btn-primary.category-ok-btn').attr('disabled', true);
        $j('#body_kb_categories_dialog .btn.btn-default').attr('disabled', true);
    }

    function fireIeBlurEvent(srcElement) {
        if (defaults.isQuirksMode || defaults.isOldIE) {
            var elem = $j('#newCategoryInput')[0];
            if (elem) {
                var evObj = document.createEventObject();
                evObj.button = 0;
                evObj.srcElement = srcElement;
                evObj.relatedTarget = srcElement;
                evObj.target = elem;
                elem.fireEvent('onblur', evObj);
            }
        }
    }

    /**
     * When an item was added or modified a "lastEvent" was memorized.
     */
    function processLastEvent(deferredFnc) {
        if (!lastEvent) {
            return;
        }
        var params = false;

        if (lastEvent.type === 'update') {
            params = {
                id: lastEvent.id,
                value: lastEvent.value,
                deferredFnc: deferredFnc,
                callback: function(id, params) {
                    if (params.deferredFnc) params.deferredFnc.done();
                }
            };
        } else if (lastEvent.type === 'create') {
            params = {
                id: lastEvent.id,
                value: lastEvent.value,
                newItem: lastEvent.newItem,
                deferredFnc: deferredFnc,
                callback: function(id, params) {
                    params.newItem.id = id;
                    var activeElem = $j('#' + defaults.containerId).find(".colview-active").eq(0);
                    activeElem.data('id', id);
                    if (params.deferredFnc) params.deferredFnc.done();
                }
            };
        }

        if (params) {
            $j(lastEvent.triggerTarget).trigger(lastEvent.triggerEvent, params);
        }

        lastEvent = false;
    }

    function addLastColumn($container) {
        var lastColumn = $j('<div/>').addClass('column last-column').appendTo($container);
        addPlusButton(lastColumn);
        setHoverEvents(lastColumn, mouseenterColumn, mouseleaveColumn);
    }

    /**
     * removes "edit mode" input box and reset styling.
     */
    function discardInputElement(event, removeAll) {
        var inputEl = $j('#newCategoryInput');
        var itemEl = inputEl.parent();
        var labelEl = inputEl.prev();

        if (removeAll) {
            inputEl.remove();
            labelEl.remove();
            itemEl.remove();
        } else {
            itemEl.removeClass('pen-icon');
            labelEl.removeAttr('style');
            inputEl.remove();
        }
        itemEl.focus();
    }

    function checkErrors(evt,newVal,oldVal,removeAll)
    {
        if(!newVal.trim().length)
        {
            if(evt.data.type == 'create')
                discardInputElement(evt, true);
            else
                discardInputElement(evt, false);
        }
        else if(newVal == oldVal)
            discardInputElement(evt, false);
        else if(!removeAll)
            discardInputElement(evt, removeAll);    

        if($j('#newCategoryInput').length)
        {
            var catName = newVal;
            var err_message = getMessage('The Category, {0}, already exists at this level. Please enter a unique category.');
            err_message = err_message.replace("{0}",catName);
            $j('#err_message').text(err_message).css('display','block');    
        }
        else
            $j('#err_message').css('display','none');
    }
    
    
    /**
     * the event listeners set here will be removed when the input field is removed by jquery.
     */
    function setInputHandlers(input, paramObj) {
        input.blur(paramObj, function(evt) {
            var blurExec = function() {
                var $newItem = $j('#newCategoryInput');
                var newVal = $newItem.val();
                var oldVal = $newItem.prev().text();
                updateEvtHandler(evt);
                var removeAll = (lastEvent === false);
                processLastEvent();
                checkErrors(evt,newVal,oldVal,removeAll);
            };

            if (defaults.isOldIE) {
                /*
                delayed execution for legacy IE versions: if the cancel button is clicked it will cancel this
                execution, any other cause for the blur event will let the execution complete.
                */
                window.blurTimeout = setTimeout(blurExec, 250);
            } else if (!evt.relatedTarget || evt.relatedTarget.id === 'kb_categories_dialog' || evt.relatedTarget.id === 'ok_button' || $j(evt.relatedTarget).is('.list-item')) {
                /*
                We don't save the last change if Cancel was clicked.
                We only save the current changes if either no DLG button was clicked,
                or when another list-item was clicked, or when the OK button was clicked.
                */
                blurExec(evt);
            } else if (evt.relatedTarget.id === 'cancel_button') {
                // NoOp
            } else {
                // special edge cases are hard to track without this.
                throw 'unexpected onblur case';
            }
        });

        input.keydown(paramObj, function(evt) {
            var keyCode = event.which;
            switch (keyCode) {
                case (27): {
                    // ESC
                    evt.stopImmediatePropagation();
                    evt.preventDefault();
                    var removeAll = (evt.data.type === 'create');
                    discardInputElement(evt, removeAll);
                    break;
                }
                case (13): {
                    // ENTER
                    var $newItem = $j('#newCategoryInput');
                    var newVal = $newItem.val();
                    var oldVal = $newItem.prev().text();
                    evt.stopImmediatePropagation();
                    evt.preventDefault();
                    updateEvtHandler(evt);
                    var removeAll = (lastEvent === false);
                    processLastEvent();
                    checkErrors(evt,newVal,oldVal,removeAll);
                    break;
                }
            }
        });
    }

    /**
     * Event handler to create or update items in a list.
     * The 'event' argument is expected to have a 'data' object containing 'originElId' and 'type'
     */
    function updateEvtHandler(event) {
        var $activeInput = $j('#newCategoryInput');
        var $activeElem = $activeInput.parent();
        var $activeLabel = $activeInput.prev();

        var oldValue = $activeLabel.text();
        var newValue = $activeInput.val();
        if (newValue && newValue.trim().length && newValue !== oldValue) {
            

            var $colviewContainer = $j('#' + defaults.containerId);
            var settings = $colviewContainer.data('columnview').settings;

            if (event.data.type === 'update') {
                var sysId = $activeElem.data('id');
                var dataItem = findDuplicateItemById(settings.jsonData, sysId,newValue);
                if(dataItem && dataItem.label)
                {
                    $activeLabel.html(newValue);
                    $activeElem.data('label', newValue);
                    dataItem.label = newValue;
                    lastEvent = {
                        type: 'update',
                        id: sysId,
                        value: newValue,
                        triggerTarget: '#' + event.data.originElId,
                        triggerEvent: 'columnview_update'
                    };
                }
                else
                    lastEvent = false;
            } else if (event.data.type === 'create') {
                var parentItem = getParentListItem($activeElem);
                var parentItemId = parentItem.data('id');
                var newItem = addItemToParentId(settings.jsonData, parentItemId, newValue);
                if(newItem && newItem.label)
                {
                    addArrow(parentItem);
                    addLastColumn($colviewContainer);
                    $activeLabel.html(newValue);
                    $activeElem.data('label', newValue);
                    lastEvent = {
                        type: 'create',
                        id: parentItemId,
                        value: newValue,
                        newItem: newItem,
                        triggerTarget: '#' + event.data.originElId,
                        triggerEvent: 'columnview_create'
                    };
                }
                else
                    lastEvent = false;
            }
        }
    }

    function getParentListItem(elem) {
        var parent = elem.closest('.column').prev();
        parent = parent.find('.inpath, .colview-active').eq(0);
        return parent;
    }

    function findDuplicateItemById(items,id,newValue) {
        for (var i = 0; i < items.length; i++) {
            var obj = items[i];
            if (obj.id == id) {
                for(var j=0;j<items.length;j++)
                {
                    if(j != i && items[j].label.toLowerCase().trim() == newValue.toLowerCase().trim())
                    {
                        return {};
                    }
                }
                return obj;
            } 
            else if (obj.items.length) {
                var result = findDuplicateItemById(obj.items,id,newValue);
                if (result) return result;
            }
        }
    }
    
    function findItemById(items, id) {
        for (var i = 0; i < items.length; i++) {
            var obj = items[i];
            if (obj.id == id) {
                return obj;
            } else if (obj.items.length) {
                var result = findItemById(obj.items, id);
                if (result) return result;
            }
        }
    }

    function findPathById(items, id, pathSeparator) {
        for (var i = 0; i < items.length; i++) {
            var obj = items[i];
            if (obj.id == id) {
                return obj.id;
            } else if (obj.items.length) {
                var result = findPathById(obj.items, id, pathSeparator);
                if (result && result.length) return obj.id + pathSeparator + result;
            }
        }
    }

    function drillIntoPath(idArray, container) {
        for (var j = 0; j < idArray.length; j++) {
            var id = idArray[j];
            var listItems = container.find('.column').last().find('.list-item');
            for (var k = 0; k < listItems.length; k++) {
                var listItem = listItems.eq(k);
                if (id  == listItem.data('id')) {
                    listItem.click();
                    break;
                }
            }
        }
    }

    
    function validateNewItem(items,newItem,newLabel)
    {
        for(var i=0;i<items.length;i++)
        {
            if(items[i].label.toLowerCase().trim() == newLabel.toLowerCase().trim())
            {
                return {};
            }
        }
        return newItem;
    }
    
    function addItemToParentId(items, parentItemId, newLabel, newId) {
        var newItem = {
            label: newLabel,
            id: newId || newLabel,
            items: []
        };
        var item = findItemById(items, parentItemId);
        var obj;
        if (item) // add new item to parent item.
        {
            obj = validateNewItem(item.items,newItem,newLabel);
            if(obj && obj.label)
            {
                item.items.push(newItem);
            }
        }
        else // when no parent item found, add to array of first level items.
        {
            obj = validateNewItem(items,newItem,newLabel);
            if(obj && obj.label)
                items.push(newItem);
        }
        return obj;
    }

    function buildList(items, container) {
        var columnDiv = $j('<div class="column"></div>');
        for (var i = 0; i < items.length; i++) {
            var obj = items[i];
            var listItem = $j('<div>').addClass('list-item').attr('tabindex', '0').data({
                id: obj.id,
                label: obj.label
            }).appendTo(columnDiv);
            addEditImg(listItem);
            if (obj.items.length) {
                listItem.addClass('arrow');
                addArrow(listItem);
            }
            var span = $j('<span class="label"></span>').html(obj.label);
            listItem.append(span);
            setHoverEvents(listItem, mouseenterActiveItem, mouseleaveActiveItem);
        }
        columnDiv.appendTo(container);
        setHoverEvents(columnDiv, mouseenterColumn, mouseleaveColumn);
        return columnDiv;
    }

    function addPlusButtons() {
        // Insert a [+] button in each column.
        var colviewCntrItems = $j('.colview-container .column');
        for (var i = 0; i < colviewCntrItems.length; i++) {
            addPlusButton($j(colviewCntrItems[i]));
        }
    }

    function addPlusButton(container) {
        if (!defaults.blockEditing && !(container.has('.btn-add-cat').length)) {
            // list-item-spacer prevents button from potentially tucking under horizontal scrollbar.
            var spacer = $j('<div>').addClass('list-item-spacer').html(' ');
            spacer.appendTo(container);
            var btnCnt = $j('<div>').addClass('btn-add-cat').html(' ');
            if (defaults.isQuirksMode || defaults.isOldIE) {
                btnCnt.html('+'); // IE fallback solution for unsupported web fonts.
            } else {
                btnCnt.addClass('icon-add');
            }
            btnCnt.appendTo(container);
            btnCnt.click(function(event) {
                processLastEvent();
                newItemInput(event);
            });
            // reposition the buttons along the bottom border when the container scrolls.
            container.scroll(function (evt) {
                $j(evt.currentTarget).find('.btn-add-cat').css('bottom', container.scrollTop() * -1);
            });
        }
    }

    // create new input field to entering a new list item label.
    function newItemInput(event) {
        var $newItem = $j('#newCategoryInput');

        if($newItem.length != 0)
        {
            $newItem.focus();
            return;
        }
        
        var target = $j(event.currentTarget);
        var columnDiv = target.parent('.column');
        var input = columnDiv.find('.labelInput');

        if (input.length) {
            input.eq(0).focus();
        } else {
            columnDiv.nextAll().remove();
            var container = $j('#' + defaults.containerId);
            // grey out items in selection path.
            container.find('.colview-active').toggleClass('colview-active inpath');
            columnDiv.find('.inpath').removeClass('inpath'); // remove selection in same column.
            // create list item.
            var listItem = $j('<div>').addClass('list-item colview-active pen-icon').attr('tabindex', '0').insertBefore(columnDiv.find('.list-item-spacer').eq(0));
            // create span label
            $j('<span/>').addClass('label').css('display', 'none').appendTo(listItem);
            // create input field.
            input = createNewCatInput();
            input.appendTo(listItem).focus();
            if (defaults.isQuirksMode || defaults.isOldIE) {
                input.css('height', '26px');
                input.css('line-height', '26px');
                input.width(listItem.width() - 20);
            }
            var origElt = container.data('columnview').origElt;
            // bind event handlers.
            setInputHandlers(input, {
                type: 'create',
                originElId: origElt.attr('id')
            });
        }
        // scroll to bottom to reveal input field.
        columnDiv.scrollTop(columnDiv[0].scrollHeight);
    }

    /**
     * The :hover pseudo class isn't supported when operating in quirks mode hence we need a JS substitute.
     */
    function setHoverEvents(container, onEnter, onLeave) {
        if (!defaults.blockEditing && defaults.isQuirksMode) {
            container.mouseenter(onEnter).mouseleave(onLeave);
        }
    }

    /**
     * Series of event handlers for IE in Quirks Mode only.
     */
    function mouseenterColumn(event) {
        $j(event.currentTarget).find('.btn-add-cat, .list-item-spacer').css('display', 'block');
    }

    function mouseleaveColumn(event) {
        $j(event.currentTarget).find('.btn-add-cat, .list-item-spacer').css('display', 'none');
    }

    function mouseenterActiveItem(event) {
        var target = $j(event.currentTarget);
        if (target.is('.colview-active')) {
            target.find('.arrow').css('display', 'none');
            target.find('.pen-image').css('display', 'block');
        }
    }

    function mouseleaveActiveItem(event) {
        var target = $j(event.currentTarget);
        if (target.is('.colview-active')) {
            target.find('.pen-image').removeAttr('style');
            target.find('.arrow').removeAttr('style');
        }
    }


    /**
     * Generate deeper level item columns and items.
     */
    function addSubmenu($container, node) {
        var data = $container.data("columnview");
        var settings  = data.settings;
        var sysId = node.data('id');
        var item = findItemById(settings.jsonData, sysId);
        var submenu = buildList(item.items, $container);

        if (defaults.isQuirksMode) {
            submenu.css({'top': 0, 'width': '150px'});
            submenu.children('.label').css({
                'text-overflow': 'ellipsis',
                '-o-text-overflow': 'ellipsis',
                '-ms-text-overflow': 'ellipsis'
            });
        }

        // Trigger item selection callback.
        data.origElt.trigger("columnview_select", {
            'id': sysId,
            'value': node.data('label')
        });
    }

    /**
     * IE in Quirks Mode only.
     * Adds an arrow next to the anchor tag if it has child items.
     * @param elem element
     */
    function addArrow(elem) {
        // IE7 needs old school html since it doesn't support modern CSS selectors.
        // IE8 is just as bad because our platform is forcing it to use Quirks mode.
        // IE9 doesn't support setting text-decoration on :after and :before
        // Setting glide.ui.doctype to false disables support for font icons in Chrome and require images to be used instead.
        if (defaults.isQuirksMode) {
            var arrow = $j("<span></span>").addClass('arrow');
            if (defaults.isRtl) {
                arrow.html("◄");
                arrow.prependTo(elem);
            } else {
                arrow.html("►");
                arrow.appendTo(elem);
            }
        } else {
            // Modern browsers, IE10 and up, and glide.ui.doctype=true support more CSS pseudo classes which makes it way simpler.
            elem.addClass("arrow");
        }
    }

    /**
     * IE in Quirks Mode only.
     * @param elem element
     */
    function addEditImg(elem) {
        if (!defaults.blockEditing && defaults.isQuirksMode) {
            var edit = $j("<span></span>").addClass('pen-image').html('&nbsp;');
            if (defaults.isRtl) {
                edit.prependTo(elem);
            } else {
                edit.appendTo(elem);
            }
        }
    }

    function getIconContent(iconName) {
        var iconContent = '';
        if (!defaults.isQuirksMode && window.getComputedStyle) {
            var elem = $j('span.' + iconName)[0];
            iconContent = getComputedStyle(elem, ':before').getPropertyValue('content');
            iconContent = iconContent.replace(/"/g, ''); // strip the double quotes included by some browsers in the content.
        }
        return iconContent;
    }

    function addCSS(settings) {
        // As the hex values of the Heisenberg icons keep changing it's impossible to reliably set the "content" CSS
        // attribute of the :hover:after pseudo class in the stylesheet in order to display a full star instead of an
        // empty one when hovering over with the mouse.
        var penIconContent = getIconContent('icon-edit');
        var arrowLeftIconContent = getIconContent('icon-chevron-left');
        var arrowRightIconContent = getIconContent('icon-chevron-right');

        // Add stylesheet, but only once
        if (!$j('.colview-container').get(0)) {
            $j('head').prepend('\
    <style type="text/css" media="screen">\
    HTML .drag_section_picker {\
        padding: 14px;\
        border: 1px solid rgb(213, 213, 213);\
        border-radius: 3px;\
        -webkit-box-shadow: 0 2px 40px 0 rgba(0, 0, 0, 0.4);\
        -moz-box-shadow: 0 2px 40px 0 rgba(0, 0, 0, 0.4);\
        box-shadow: 0 2px 40px 0 rgba(0, 0, 0, 0.4);\
    }\
    .drag_section_picker > tbody > tr:nth-child(1) > td:first-child {\
        padding: 0 6px;\
    }\
    .drag_section_header {\
        margin-bottom: 10px;\
        font-size: 16px;\
        font-family: Arial;\
    }\
    .ltr #dialog_buttons {\
        text-align: right;\
    }\
    .colview-container .list-item.arrow:after,\
    .colview-container .list-item.arrow:before {\
        text-decoration: none;\
        position: absolute;\
        margin-top: 5px;\
    }\
    .colview-container .list-item.arrow:after {\
        font-family: "retina_icons";\
        content: "' + arrowRightIconContent + '";\
        right: 5px;\
    }\
    span.arrow {\
        position: absolute;\
        margin-top: 5px;\
    }\
    .ltr span.arrow {\
        right: 0px;\
    }\
    .pen-image {\
        display: none;\
        position: absolute;\
        background: url(images/list_edit.pngx) no-repeat;\
        margin-top: 5px;\
        width: 13px;\
    }\
    .ltr span.pen-image {\
        right: 0px;\
    }\
    .colview-container {\
        box-sizing: border-box;\
        border: 1px solid #ccc;\
        border-radius: 3px;\
        overflow-x: ' + (defaults.isIE ? 'scroll' : 'visible') + ';\
        overflow-y: hidden;\
        white-space: nowrap;\
        position: relative;\
        margin-bottom: 20px;\
        width: 100%;\
        cursor: default;\
    }\
    .colview-container .column {\
        position: relative;\
        display: inline-block;\
        height: 100%;\
        overflow-y: ' + (defaults.isOldIE ? 'scroll' : 'auto') + ';\
        overflow-x: hidden;\
        border-right: 1px solid rgb(204, 204, 204);\
        vertical-align: top;\
        min-width: 150px;\
    }\
    .msie7 .colview-container .column, \
    .msie8 .colview-container .column {\
        position: relative;\
        display: inline;\
        width: 150px;\
    }\
    .colview-container .feature,\
    .rtl .colview-container .feature {\
        border: 0 none;\
    }\
    .colview-container .list-item .label {\
        display: inline-block;\
        margin: 5px 15px 5px 5px;\
        color: #485563;\
        font-weight: normal;\
        font-size: 1em;\
    }\
    .colview-container .list-item.colview-active span.label {\
        color: #fff;\
    }\
    .colview-container .list-item {\
        position: relative;\
        display: block;\
        width: 100%;\
        text-decoration: none;\
        white-space: nowrap;\
        clear: both;\
        padding-right: 15px;\
        ' + (defaults.isOldIE ? '' : 'overflow: hidden;') + '\
    }\
    .colview-container .list-item:hover {\
        background-color: #F0F0F0;\
    }\
    .colview-container .list-item:focus:hover {\
        outline: none;\
    }\
    .colview-container .list-item:focus.colview-active,\
    .colview-container .list-item.colview-active,\
    .colview-container .list-item:hover.colview-active {\
        background-color: #3671cf;\
        color: #fff;\
        outline: none;\
    }\
    .colview-container .inpath {\
        background-color: #d0d0d0;\
        color: #000;\
    }\
    HTML .colview-container .list-item .labelInput, HTML .colview-container .list-item .labelInput:focus {\
        background-color: #3671cf;\
        color: #fff;\
        border: 0 none;\
        outline: none;\
        box-shadow: none;\
        box-sizing: border-box;\
        height: 29px;\
        padding: 0 5px;\
    }\
    .colview-container .column:hover .btn-add-cat,\
    .colview-container .column:hover .list-item-spacer,\
    .allow-edit .pen-icon .pen-image {\
        display: block;\
    }\
    .colview-container .column .list-item-spacer {\
        display: none;\
        position: relative;\
        box-sizing: border-box;\
        height: 25px;\
        width: 1px;\
        margin: 0px;\
        padding: 0px;\
        border: 0 none;\
    }\
    .colview-container .column .btn-add-cat {\
        display: none;\
        position: absolute;\
        box-sizing: border-box;\
        bottom: 0px;\
        height: auto;\
        width: 100%;\
        border: 0 none;\
        text-align: center;\
        background-color: rgb(211, 211, 211);\
        cursor: pointer;\
        margin: 0px;\
        padding: 3px 0;\
    }\
    .allow-edit .pen-icon .arrow,\
    .colview-container input::-ms-clear {\
        display: none;\
    }\
    .allow-edit .column .colview-active:hover:after,\
    .allow-edit .column .colview-active.arrow.pen-icon:after {\
        right: 5px;\
    }\
    .allow-edit .column .colview-active:hover:after,\
    .allow-edit .column .colview-active.arrow.pen-icon:after,\
    .rtl .allow-edit .column .colview-active:hover:before,\
    .rtl .allow-edit .column .colview-active.arrow.pen-icon:before {\
        position: absolute;\
        text-decoration: none;\
        font-family: "retina_icons";\
        speak: none;\
        font-style: normal;\
        font-weight: normal;\
        font-variant: normal;\
        text-transform: none;\
        line-height: 1;\
        -webkit-font-smoothing: antialiased;\
        -moz-osx-font-smoothing: grayscale;\
        margin-top: 8px;\
        content: "' + penIconContent + '";\
    }\
    .rtl .allow-edit .column .colview-active:hover:after,\
    .rtl .allow-edit .column .colview-active.arrow.pen-icon:after {\
        right: auto;\
        left: 5px;\
    }\
    .rtl .allow-edit .column .colview-active:hover:before,\
    .rtl .allow-edit .column .colview-active.arrow.pen-icon:before {\
        content: "";\
    }\
    .rtl div.list-item.arrow:after {\
        content: "";\
        right: auto;\
    }\
    .rtl div.list-item.arrow:before {\
        font-family: "retina_icons";\
        content: "' + arrowLeftIconContent + '";\
        left: 5px;\
     }\
    .rtl span.arrow {\
        left: 0px;\
    }\
    .rtl span.pen-image {\
        left: 0px;\
    }\
    .rtl .colview-container .list-item {\
        padding-right: 0;\
        ' + (defaults.isOldIE ? '' : 'padding-left: 15px;') + '\
    }\
    .rtl .colview-container .column {\
        border: 0 none;\
        ' + (defaults.isOldIE ? '' : 'border-left: 1px solid rgb(204, 204, 204);') + '\
    }\
    .rtl .colview-container .list-item .label {\
        margin-left: 0px;\
        margin-right: 5px;\
    }\
    </style>');
        }
    }

})(jQuery);
