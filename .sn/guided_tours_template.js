/*! RESOURCE: /scripts/app.guided_tours/guided_tours_template.js */
var GuidedToursCallout = {};
GuidedToursCallout.template = function(obj) {
    obj || (obj = {});
    var escape = function(str) {
        if (customEscape) {
            return customEscape(str);
        }
        if (str == null) return '';
        return ('' + str).replace(new RegExp('[&<>"\']', 'g'), function(match) {
            if (match == '&') {
                return '&amp;'
            }
            if (match == '<') {
                return '&lt;'
            }
            if (match == '>') {
                return '&gt;'
            }
            if (match == '"') {
                return '&quot;'
            }
            if (match == "'") {
                return '&#x27;'
            }
        });
    }
    var temp, result = '';
    with(obj) {
        function optEscape(str, unsafe) {
            if (unsafe) {
                return escape(str);
            }
            return str;
        };
        result += '\n<div class="hopscotch-bubble-container" role="dialog" aria-labelledby="hopscotch-content" style="width: ' +
            ((temp = (step.width)) == null ? '' : temp) +
            'px;">\n  ';
        if (tour.isTour) {
            result += '<span class="hopscotch-bubble-number"><b>' +
                ((temp = (i18n.stepNum)) == null ? '' : temp) +
                ' / ' +
                ((temp = (tour.numSteps)) == null ? '' : temp) +
                '</b></span>';
        }
        result += '\n  <div class="hopscotch-bubble-content">\n    ';
        if (step.content !== '') {
            result += '<div class="hopscotch-content" id="hopscotch-content">' +
                ((temp = (optEscape(step.content, tour.unsafe))) == null ? '' : temp) +
                '</div>';
        }
        result += '\n  </div>\n  <div class="hopscotch-actions">\n    ';
        if (buttons.showPrev) {
            result += '<button class="hopscotch-nav-button prev hopscotch-prev">' +
                ((temp = (i18n.prevBtn)) == null ? '' : temp) +
                '</button>';
        }
        result += '\n    ';
        if (buttons.showCTA) {
            result += '<button class="hopscotch-nav-button next hopscotch-cta">' +
                ((temp = (buttons.ctaLabel)) == null ? '' : temp) +
                '</button>';
        }
        result += '\n    ';
        if (buttons.showNext) {
            result += '<button class="hopscotch-nav-button next hopscotch-next"' +
                'aria-label="Next Step" tabindex="0">' +
                ((temp = (i18n.nextBtn)) == null ? '' : temp) +
                '</button>';
        }
        result += '\n  </div>\n  ';
        if (buttons.showClose) {
            result += '<button class="hopscotch-bubble-close hopscotch-close"' +
                'aria-label="Cancel Tour" tabindex="0">' +
                '<span class="icon icon-cross"></span>' +
                '</button>';
        }
        result += '\n</div>\n<div class="hopscotch-bubble-arrow-container hopscotch-arrow">\n  <div class="hopscotch-bubble-arrow-border"></div>\n  <div class="hopscotch-bubble-arrow"></div>\n</div>';
    }
    return result;
};;