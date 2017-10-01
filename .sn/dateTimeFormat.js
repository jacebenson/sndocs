/*! RESOURCE: /scripts/concourse/dateTimeFormat.js */
(function() {
    CustomEvent.observe('cc_dateformat_set', function(preferences) {
        preferences = parsePreferences(preferences);
        if (preferences.timeAgo == false && preferences.dateBoth == false)
            CustomEvent.fireAll('timeago_set', false);
        if (preferences.timeAgo == true && preferences.dateBoth == false)
            CustomEvent.fireAll('timeago_set', true);
        if (preferences.dateBoth == true)
            CustomEvent.fireAll('date_both', true);
    });
    CustomEvent.observe('cc_dateformat_compact_set', function(bool) {
        CustomEvent.fireAll('shortdates_set', bool);
    });

    function parsePreferences(p) {
        var o = {};
        p = p.replace(/\s+/g, '');
        p = p.substring(1, p.length - 1).split(',');
        for (var i = 0; i < p.length; i++)
            o[p[i].split(':')[0]] = JSON.parse(p[i].split(':')[1]);
        return o;
    }
})();;