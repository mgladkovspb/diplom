'use strict';

let osmmap, verticesLayer, edgesLayer;

function addPath(data) {
    let myStyle = {
        "color": "#2c3e50",
        "weight": 5,
        "opacity": 0.65
    };

    osmmap.removeLayer('path');
    osmmap.addLayer('path', L.geoJSON(data, {
        style: myStyle
    }));
}

function calculatePath(query) {
    $.ajax({
        type: "POST",
        url: '/api/calc',
        contentType: 'application/json',
        data: JSON.stringify(query),
        success: addPath,
        dataType: 'json'
    });
}

function getPointAsGeoJSON(latlng) {
    return {
        type: "Point", 
        coordinates: [latlng.lng, latlng.lat]
    }
}

function onPositionChange(event) {
    let query = {
        start: getPointAsGeoJSON(osmmap.getMarker('start').getLatLng()),
        finish: getPointAsGeoJSON(osmmap.getMarker('finish').getLatLng())
    };

    calculatePath(query);
}

document.addEventListener('DOMContentLoaded', function () {
    osmmap = new MyMap();
    
    let start  = new L.marker([59.962679, 30.368535], { draggable: 'true' })
      , finish = new L.marker([59.929566, 30.314861], { draggable: 'true' });

    start.on('dragend', onPositionChange);
    finish.on('dragend', onPositionChange);

    osmmap.addMarker('start', start);
    osmmap.addMarker('finish', finish);
}, false);