'use strict';

let osmmap;

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

document.addEventListener('DOMContentLoaded', function() {
    createMap();
    requestReadyState();
}, false);