'use strict';

function MyMap(divid = 'map') {
    this._mymap   = undefined;
    this._layers  = new Map();
    this._markers = new Map();

    this._init = (divid) => {
        this._mymap = L.map(divid, {
            zoomControl: false,
            maxZoom: 18
        }).setView([59.940878, 30.334021], 13);
    
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this._mymap);
    }

    this.addMarker = (key, marker) => {
        this._markers.set(key, marker);
        marker.addTo(this._mymap);
    }

    this.addLayer = (key, layer) => {
        this._layers.set(key, layer);
        layer.addTo(this._mymap);
    }

    this.removeMarker = (key) => {
        let marker = this._markers.get(key);
        this._mymap.removeLayer(marker);
    }

    this.removeLayer = (key) => {
        let layer = this._layers.get(key);
        if(layer !== undefined)
            this._mymap.removeLayer(layer);
    }

    this.getMarker = (key) => {
        return this._markers.get(key);
    }

    this.zoomIn = () => {
        this._mymap.setZoom(
            this._mymap.getZoom() + 1
        );
    }

    this.zoomOut = () => {
        this._mymap.setZoom(
            this._mymap.getZoom() - 1
        );
    }

    this._init(divid);
}
