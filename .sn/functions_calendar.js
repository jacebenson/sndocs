/*! RESOURCE: /scripts/functions_calendar.js */
function nextCalendarAction(duration, year, month, day, calendarID, styleField, event) {
    var form = document.getElementsByName('dash_form')[0];
    if (form) {
        var name = form.dashboard_name.value;
        var url = "sys_dashboard_template.do?";
        url += "sysparm_query=name=" + name;
        url += "&sysparm_calview=" + duration;
        url += "&sysparm_year=" + year;
        url += "&sysparm_month=" + month;
        url += "&sysparm_day=" + day;
        var viewwidget = form['sysparm_view'];
        if (viewwidget)
            url += '&sysparm_view=' + viewwidget.value;
        window.location = url;
    } else {
        form = document.getElementsByName('calendarform')[0];
        if (form == null) {
            if (typeof $j != "undefined" && calendarID != null && calendarID.length) {
                var element = event.srcElement;
                if (!element)
                    element = event.target;
                var content = $j(element).closest(".report_content");
                if (content.length) {
                    var cstyle = null;
                    media = document.getElementsByName('sysparm_calstyle_choice');
                    if (media != null) {
                        for (var i = 0; i < media.length; i++) {
                            var r = media[i];
                            if (r.checked) {
                                cstyle = r.value;
                                break;
                            }
                        }
                    }
                    if (!cstyle) {
                        media = $("sysparm_calstyle" + calendarID);
                        if (media != null)
                            cstyle = media.value;
                    }
                    var params = "sysparm_calview=" + duration;
                    params += "&sysparm_year=" + year;
                    params += "&sysparm_month=" + month;
                    params += "&sysparm_day=" + day;
                    params += "&sysparm_calstyle=" + cstyle;
                    drillReport(content.parent(), calendarID, "", params);
                    return;
                }
            }
            form = document.getElementsByName('reportform_control')[0];
        }
        if (form == null) {
            form = document.getElementsByName('history')[0];
            if (form != null) {
                addInput(form, 'HIDDEN', 'sysparm_stack', "no");
            }
        }
        if (form != null) {
            addInput(form, 'HIDDEN', 'sysparm_calview', duration);
            addInput(form, 'HIDDEN', 'sysparm_year', year);
            addInput(form, 'HIDDEN', 'sysparm_month', month);
            addInput(form, 'HIDDEN', 'sysparm_day', day);
            var media = $('sysparm_media');
            if (media != null) {
                addInput(form, 'HIDDEN', 'sysparm_media', media.value);
            }
            media = $('sysparm_view');
            if (media != null) {
                addInput(form, 'HIDDEN', 'sysparm_view', media.value);
            }
            media = document.getElementsByName('sysparm_calstyle_choice');
            if (media != null) {
                for (var i = 0; i < media.length; i++) {
                    var r = media[i];
                    if (r.checked) {
                        addInput(form, 'HIDDEN', 'sysparm_calstyle', r.value);
                        break;
                    }
                }
            }
            media = $('sysparm_calstyle');
            if (media != null) {
                addInput(form, 'HIDDEN', 'sysparm_calstyle', media.value);
            }
            if (typeof form.onsubmit == "function")
                form.onsubmit();
            form.submit();
        } else {
            var url = "calendar_view.do?";
            url += "sysparm_calview=" + duration;
            url += "&sysparm_year=" + year;
            url += "&sysparm_month=" + month;
            url += "&sysparm_day=" + day;
            if (styleField)
                url += "&sysparm_calstyle=" + styleField;
            window.location = url;
        }
    }
};