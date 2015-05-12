# Eureka-widget-collection-map

Display an Eureka collection on a map. Usage:

{
    type: 'collection-map',

    // the model property name that represente the latitude
    latitudeProperty: 'latitude',

    // the model property name that represente the longitude
    longitudeProperty: 'longitude',

    // the model property name to represente the record
    titleProperty: 'title',

    // the panel header label
    label: null

    // initial zoom
    zoom: 5,

    // the minimal zoom allowed
    minZoom: 2,

    // the maximal zoom allowed
    maxZoom: 20,

    // the name of the map provider.
    // see http://leaflet-extras.github.io/leaflet-providers/preview/index.html
    // for all layers available
    mapProvider: ''MapQuestOpen.OSM''
}

**NOTE: this addon requires the ember-leaflet-hurry addon.**

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
