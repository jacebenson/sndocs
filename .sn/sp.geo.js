/*! RESOURCE: /scripts/sp.geo.js */
function spLoadMaps() {
    if (typeof g_google_maps_api_loaded == "undefined") {
        spLoadScript('https://maps.googleapis.com/maps/api/js?v=3.exp&signed_in=true&callback=initMap');
        g_google_maps_api_loaded = true;
    } else
        CustomEvent.fireAll('map.initialized');
}

function spLoadScript(url) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.body.appendChild(script);
}

function initMap() {
    CustomEvent.fireAll('map.initialized');
};