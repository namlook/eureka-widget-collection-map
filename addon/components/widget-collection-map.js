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

    /** mapProvider
     * see http://leaflet-extras.github.io/leaflet-providers/preview/index.html for all
     * layer available
     */
    mapProvider: Ember.computed('config.mapProvider', function() {
        // ex: 'Esri.WorldImagery'
        return this.getWithDefault('config.mapProvider', 'MapQuestOpen.OSM');
    }),

    _map: null,

    collection:  Ember.computed('routeModel.query.hasChanged', 'store', function() {
        var query = this.get('routeModel.query')._toObject();
        return this.get('store').find(query);
    }),


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

        var latitudePropertyName = this.get('latitudeProperty');
        var longitudePropertyName = this.get('longitudeProperty');
        var titlePropertyName = this.get('titleProperty');

        var latLongs = [];
        this.get('collection').then(function(data) {
            data.forEach(function(item) {
                let latitude = Ember.get(item, latitudePropertyName);
                let longitude = Ember.get(item, longitudePropertyName);
                let title = Ember.get(item, titlePropertyName);
                if (latitude && longitude) {
                    let latLong = new L.LatLng(latitude, longitude);
                    latLongs.push(latLong);
                    let marker = L.marker(latLong, { title: title });
                    marker.bindPopup(title);
                    markers.addLayer(marker);
                }
            });

            // center the map into markers
            if (latLongs.length) {
                map.fitBounds(new L.LatLngBounds(latLongs));
                map.setZoom(zoom);
                L.tileLayer.provider(mapProvider).addTo(map);
                map.addLayer(markers);
            }
        });
    }),

    initializeMap: function() {
        var minZoom = this.get('minZoom');
        var maxZoom = this.get('maxZoom');
        var zoom = this.get('zoom');

        var map = L.map(this.$('.panel-body')[0], {
            center: [20.0, 5.0],
            zoom: zoom,
            minZoom: minZoom,
            maxZoom: maxZoom
        });

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
