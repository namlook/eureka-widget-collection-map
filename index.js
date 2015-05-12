/* jshint node: true */
'use strict';

module.exports = {
    name: 'eureka-widget-collection-map',

    included: function(app) {
        this._super.included(app);

        app.import(app.bowerDirectory + '/leaflet.markercluster/dist/leaflet.markercluster.js');
        app.import(app.bowerDirectory + '/leaflet.markercluster/dist/MarkerCluster.css');
        app.import(app.bowerDirectory + '/leaflet.markercluster/dist/MarkerCluster.Default.css');

    }
};
