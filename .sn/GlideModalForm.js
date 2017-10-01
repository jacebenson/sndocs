/*! RESOURCE: /scripts/classes/doctype/GlideModalForm.js */
(function(global, $) {
    "use strict";
    var GlideModalForm = function() {
        GlideModalForm.prototype.init.apply(this, arguments);
    };
    GlideModalForm.prototype = $.extend({}, GlideModal.prototype, {
        IGNORED_PREFERENCES: {
            'renderer': true,
            'type': true,
            'table': true
        },
        init: function(title, tableName, onCompletionCallback, readOnly) {
            this.initialize.call(this, tableName, readOnly, 800);
            this.tableName = tableName;
            if (title) {
                this.setTitle(title);
            }
            if (onCompletionCallback) {
                this.setCompletionCallback(onCompletionCallback);
            }
        },
        setSize: function(width) {
            this.size = 'modal-95';
        },
        setFooter: function(bool) {
            this.hasFooter = !!bool;
        },
        setSysID: function(id) {
            this.setPreference('sys_id', id);
        },
        setType: function(type) {
            this.setPreference('type', type);
        },
        setTemplate: function(template) {
            this.template = template;
        },
        setCompletionCallback: function(func) {
            this.onCompletionFunc = func;
        },
        setOnloadCallback: function(func) {
            this.onFormLoad = func;
        },
        render: function() {
            this._createModal();
            var body = $('.modal-body', this.$window)[0];
            body.innerHTML = getFormTemplate();
            var frame = $('.modal-frame', this.$window);
            frame.on('load', function() {
                this._formLoaded();
            }.bind(this));
            this.$window.modal({
                backdrop: 'static'
            });
            this._bodyHeight = $('#' + this.id)[0].getHeight();
            var margin = $('.modal-dialog', this.$window)[0].offsetTop * 2;
            margin += frame.offset().top;
            if (this._bodyHeight > margin)
                this._bodyHeight -= margin;
            if (this.hasFooter) {
                this._bodyHeight = this._bodyHeight - 40;
            }
            frame.css('height', this._bodyHeight);
            var $doc = frame[0].contentWindow ? frame[0].contentWindow.document : frame[0].contentDocument;
            var $body = $($doc.body);
            $body.html('');
            $body.append($('link').clone());
            $body.append('<center>' + getMessage('Loading') + '... <br/><img src="images/ajax-loader.gifx"/></center></span>');
            var f = $('.modal_dialog_form_poster', this.$window)[0];
            f.action = this.getPreference('table') + '.do';
            addHidden(f, 'sysparm_clear_stack', 'true');
            addHidden(f, 'sysparm_nameofstack', 'formDialog');
            addHidden(f, 'sysparm_titleless', 'true');
            addHidden(f, 'sysparm_is_dialog_form', 'true');
            var sysId = this.getPreference('sys_id');
            if (!sysId)
                sysId = '';
            addHidden(f, 'sys_id', sysId);
            var targetField = '';
            if (this.fieldIDSet)
                targetField = this.getPreference('sysparm_target_field');
            for (var id in this.preferences) {
                if (!this.IGNORED_PREFERENCES[id])
                    addHidden(f, id, this.preferences[id]);
            }
            var parms = [];
            parms.push('sysparm_skipmsgs=true');
            parms.push('sysparm_nostack=true');
            parms.push('sysparm_target_field=' + targetField);
            parms.push('sysparm_returned_action=$action');
            parms.push('sysparm_returned_sysid=$sys_id');
            parms.push('sysparm_returned_value=$display_value');
            addHidden(f, 'sysparm_goto_url', 'modal_dialog_form_response.do?' + parms.join('&'));
            f.submit();
        },
        switchView: function(newView) {
            this.setPreferenceAndReload({
                'sysparm_view': newView
            });
        },
        setPreferenceAndReload: function(params) {
            for (var key in params)
                this.preferences[key] = params[key];
            this.render();
        },
        _formLoaded: function() {
            var frame = $('.modal-frame', this.$window);
            var pathname = frame.contents().get(0).location.pathname.indexOf('modal_dialog_form_response.do');
            if (pathname == 0 || pathname == 1) {
                if (this.onCompletionFunc) {
                    var f = $('.modal_dialog_form_response form', frame.contents())[0];
                    this.onCompletionFunc(f.action.value, f.sysid.value, this.tableName, f.value.value);
                }
                this.destroy();
                return;
            }
            if (this.onFormLoad)
                this.onFormLoad(this);
        },
        addParm: function(k, v) {
            this.setPreference(k, v);
        }
    });

    function getFormTemplate() {
        return '<form class="modal_dialog_form_poster" target="dialog_frame" method="POST" style="display: inline;"/>' +
            '<iframe id="dialog_frame" name="dialog_frame" class="modal-frame" style="width:100%;height:100%;" frameborder="no" />';
    }
    global.GlideModalForm = GlideModalForm;
})(window, jQuery);;