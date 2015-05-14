import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';
import layout from '../templates/components/widget-collection-map';
import L from 'ember-leaflet-hurry';


export default WidgetCollection.extend({
    layout: layout,

    label: Ember.computed.alias('config.label'),

    titleProperty: Ember.computed('config.titleProperty', function() {
        return this.getWithDefault('config.titleProperty', 'title');
    }),


    latitudeProperty: Ember.computed('config.latitudeProperty', function() {
        return this.getWithDefault('config.latitudeProperty', 'latitude');
    }),

    longitudeProperty: Ember.computed('config.longitudeProperty', function() {
        return this.getWithDefault('config.longitudeProperty', 'longitude');
    }),

    zoom: Ember.computed('config.zoom', function() {
        return this.getWithDefault('config.zoom', 5);
    }),

    minZoom: Ember.computed('config.minZoom', function() {
        return this.getWithDefault('config.minZoom', 2);
    }),

    maxZoom: Ember.computed('config.maxZoom', function() {
        return this.getWithDefault('config.maxZoom', 20);
    }),

    /** map height in px **/
    mapStyle: Ember.computed('config.height', function() {
        var mapHeight = this.getWithDefault('config.height', 300);
        mapHeight = parseInt(mapHeight, 10);
        return new Ember.Handlebars.SafeString(`height:${mapHeight}px;text-align:center`);
        // return ("height: " + mapHeight + 'px').htmlSafe();
    }),

    /** mapProvider
     * see http://leaflet-extras.github.io/leaflet-providers/preview/index.html for all
     * layer available
     */
    mapProvider: Ember.computed('config.mapProvider', 'displaySatelliteMap', function() {
        // ex: 'Esri.WorldImagery'
        var provider = 'MapQuestOpen.OSM';
        if (this.get('displaySatelliteMap')) {
            provider = 'Esri.WorldImagery';
        }
        return this.getWithDefault('config.mapProvider', provider);
    }),

    _map: null,

    collection:  Ember.computed('routeModel.query.hasChanged', 'store', function() {
        var query = this.get('routeModel.query')._toObject();
        query._asJSONArray = true;
        return this.get('store').stream(query);
    }),

    // updateProgressBar: function(processed, total, elapsed, layersArray) {
    //     var progress = this.get('progress');
    //     var progressBar = this.get('progressBar');
    //     if (elapsed > 1000) {
    //         // if it takes more than a second to load, display the progress bar:
    //         progress.style.display = 'block';
    //         progressBar.style.width = Math.round(processed/total*100) + '%';
    //     }

    //     if (processed === total) {
    //         // all markers processed - hide the progress bar:
    //         progress.style.display = 'none';
    //     }
    // },


    renderMap: Ember.observer(
        'collection.[]', 'latitudeProperty', 'longitudeProperty',
        'titleProperty', 'zoom', 'mapProvider', function() {
        var map = this.get('_map');
        if (!map) {
            map = this.initializeMap();
            this.set('_map', map);
        } else {
            map.eachLayer(function (layer) {
                map.removeLayer(layer);
            });
        }

        var zoom = this.get('zoom');
        var mapProvider = this.get('mapProvider');

        var markers = L.markerClusterGroup();
        // var markers = L.markerClusterGroup({ chunkedLoading: true, chunkProgress: this.updateProgressBar })

        var latitudePropertyName = this.get('latitudeProperty');
        var longitudePropertyName = this.get('longitudeProperty');
        var titlePropertyName = this.get('titleProperty');

        var pinIcon = L.icon({
            iconUrl: '/images/leaflet/marker-icon.png',
            iconRetinaUrl: '/images/leaflet/marker-icon-2x.png',
            iconAnchor: [12.5, 41] // needed to position the marker correctly
        });

        var latLongs = [];
        this.get('collection').then(function(data) {
            data.forEach(function(item) {
                let latitude = Ember.get(item, latitudePropertyName);
                let longitude = Ember.get(item, longitudePropertyName);
                let title = Ember.get(item, titlePropertyName);
                if (latitude && longitude) {
                    let latLong = new L.LatLng(latitude, longitude);
                    latLongs.push(latLong);
                    let marker = L.marker(latLong, {title: title, icon: pinIcon});
                    marker.bindPopup(title);
                    markers.addLayer(marker);
                }
            });

            // center the map into markers
            if (latLongs.length) {
                map.fitBounds(new L.LatLngBounds(latLongs));
                L.tileLayer.provider(mapProvider).addTo(map);
                map.addLayer(markers);
            }
        });
    }),

    initializeMap: function() {
        var minZoom = this.get('minZoom');
        var maxZoom = this.get('maxZoom');
        var zoom = this.get('zoom');

        var map = L.map(this.$('.map-body')[0], {
            center: [20.0, 5.0],
            // zoom: zoom,
            // minZoom: minZoom,
            // maxZoom: maxZoom
        });

        // this.set('progress', this.$('.map-progress'));
        // this.set('progressBar', this.$('.map-progress-bar'));

        map.scrollWheelZoom.disable();

        map.on('popupopen', function(e) {
            var px = map.project(e.popup._latlng);
            px.y -= e.popup._container.clientHeight/2;
            map.panTo(map.unproject(px),{animate: true});
        });
        return map;
    },

    tearDownMap: Ember.on('willDestroy', function() {
        if (this.get('_map')) {
            this.get('_map').remove();
            this.set('_map', null);
        }
    })

});
