module.exports = {
  description: '',

  normalizeEntityName: function() {
    // allows us to run ember -g eureka-widget-collection-map and not blow up
    // because ember cli normally expects the format
    // ember generate <entitiyName> <blueprint>
  },

  afterInstall: function() {
    return this.addBowerPackageToProject('leaflet.markercluster');
  }
};
