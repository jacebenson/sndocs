/*! RESOURCE: /scripts/concourse/dateTimeFormat.js */
(function() {
  CustomEvent.observe('cc_dateformat_set', function(preferences) {
    try {
      preferences = JSON.parse(preferences);
    } catch (ex) {
      preferences = {};
    }
    if (preferences.timeAgo === false && preferences.dateBoth === false)
      CustomEvent.fireAll('timeago_set', false);
    if (preferences.timeAgo === true && preferences.dateBoth === false)
      CustomEvent.fireAll('timeago_set', true);
    if (preferences.dateBoth === true)
      CustomEvent.fireAll('date_both', true);
  });
  CustomEvent.observe('cc_dateformat_compact_set', function(bool) {
    CustomEvent.fireAll('shortdates_set', bool);
  });
})();;