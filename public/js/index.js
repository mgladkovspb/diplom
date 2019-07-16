'use strict';

let osmmap, verticesLayer, edgesLayer;

function requestReadyState() {
    $.ajax({
        type: "POST",
        url: url,
        data: data,
        success: success,
        dataType: dataType
    });
}

function createMap() {
    osmmap = L.map('map', {
        zoomControl: false,
        maxZoom: 18
    }).setView([59.940878, 30.334021], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(osmmap);
}

function zoomIn() {
    osmmap.setZoom(
        osmmap.getZoom() + 1
    );
}

function zoomOut() {
    osmmap.setZoom(
        osmmap.getZoom() - 1
    );
}

function loadVertices(data) {
    let features = JSON.parse(data);

    verticesLayer = L.geoJSON(features, {
        style: function (feature) {
            return feature.properties && feature.properties.style;
        },

        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 4,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    createMap();
    $('input[name="vertices"]').on('click', (e) => {
        if(e.target.checked) {
            if(verticesLayer === undefined) {
                $.get('/api/vertices', (data) => { 
                    loadVertices(data);
                    verticesLayer.addTo(osmmap);
                });
            } else {
                verticesLayer.addTo(osmmap);
            }
        } else {
            osmmap.removeLayer(verticesLayer);
        }
    });

    $('input[name="edges"]').on('click', (e) => {
        console.log('edges');
    });
}, false);