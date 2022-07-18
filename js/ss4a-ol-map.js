// OpenLayers map for SS4A grant application
//
// Author: Ben  Krepp (bkrepp@ctps.org)


// URLs for MassGIS basemap layer services
var mgis_serviceUrls = { 
    'topo_features'     :  "https://tiles.arcgis.com/tiles/hGdibHYSPO59RG1h/arcgis/rest/services/MassGIS_Topographic_Features_for_Basemap/MapServer",
    'basemap_features'  :  "https://tiles.arcgis.com/tiles/hGdibHYSPO59RG1h/arcgis/rest/services/MassGIS_Basemap_Detailed_Features/MapServer",
    'structures'        :  "https://tiles.arcgis.com/tiles/hGdibHYSPO59RG1h/arcgis/rest/services/MassGIS_Structures/MapServer",
    'parcels'           :  "https://tiles.arcgis.com/tiles/hGdibHYSPO59RG1h/arcgis/rest/services/MassGIS_Level3_Parcels/MapServer"
};

// OpenLayers layers for MassGIS basemap layers used in our map
var mgis_basemap_layers = { 'topo_features'     : null,     // bottom layer
                            'structures'        : null,     
                            'basemap_features'  : null,     // on top of 'structures' so labels aren't obscured
                            'parcels'           : null      // unused; not populated
};

// OpenLayers layers for OpenStreetMap, Stamen, and MAPC basesmap layers
var osm_basemap_layer = null,
    stamen_basemap_layer = nulll,
    mapc_basemap_layer = null;

// Varioius things for WMS and WFS layers
// First, folderol to allow the app to run on appsrvr3 as well as "in the wild"
var szServerRoot = location.protocol + '//' + location.hostname;
var nameSpace;
if (location.hostname.includes('appsrvr3')) {   
    szServerRoot += ':8080/geoserver/';  
	nameSpace = 'ctps_pg';
} else {
	// Temp hack to allow working from home
    // szServerRoot += '/maploc/';
	szServerRoot = 'https://www.ctps.org/maploc/';
	nameSpace = 'postgis';
}
var szWMSserverRoot = szServerRoot + '/wms'; 
var szWFSserverRoot = szServerRoot + '/wfs'; 

// OpenLayers 'map' object:
var ol_map = null;
var initMapCenter = ol.proj.fromLonLat([-71.0589, 42.3601]);
var initMapZoom = 10;
var initMapView =  new ol.View({ center: initMapCenter, zoom:  initMapZoom });

// Elements that make up an OpenLayers popup 'overlay'
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
// Add a click handler to hide the popup
closer.onclick = function () { 
	overlay.setPosition(undefined);
	closer.blur();
	return false;
};
// Create an overlay to anchor the popup to the map
var overlay = new ol.Overlay({ element: container,
                               autoPan: { animation: { duration: 250 } }
                             });
// Sledgehammer to enable/disable creation of popup
var popup_on = true;

// On-change event handler for radio buttons to chose basemap
function toggle_basemap(e) {
    switch($(this).val()) {
		case 'stamen_basemap':
            mgis_basemap_layers['topo_features'].setVisible(false);
            mgis_basemap_layers['structures'].setVisible(false);
            mgis_basemap_layers['basemap_features'].setVisible(false);
			osm_basemap_layer.setVisible(false);
			mapc_basemap_layer.setVisible(false);
			
			stamen_basemap_layer.setVisible(true);
			break;
		case 'mapc_basemap':
		    mgis_basemap_layers['topo_features'].setVisible(false);
            mgis_basemap_layers['structures'].setVisible(false);
            mgis_basemap_layers['basemap_features'].setVisible(false);
			stamen_basemap_layer.setVisible(false);
			osm_basemap_layer.setVisible(false);
			
			mapc_basemap_layer.setVisible(true);
			break;
        case 'massgis_basemap' :
			mapc_basemap_layer.setVisible(false);
			stamen_basemap_layer.setVisible(false);
            osm_basemap_layer.setVisible(false); 
			
            mgis_basemap_layers['topo_features'].setVisible(true);
            mgis_basemap_layers['structures'].setVisible(true);
            mgis_basemap_layers['basemap_features'].setVisible(true);
            break;        
        case 'osm_basemap' :
            mgis_basemap_layers['topo_features'].setVisible(false);
            mgis_basemap_layers['structures'].setVisible(false);
            mgis_basemap_layers['basemap_features'].setVisible(false);
			mapc_basemap_layer.setVisible(false);
			stamen_basemap_layer.setVisible(false);
			
            osm_basemap_layer.setVisible(true); 
            break;
        default:
            break;
    }   
} // toggle_basemap()


// Definition of vector 'overlay' layers:
// In practice, we may wind up using WMS/WFS layers instead of Vector layers for some/all of these,
// but they are nonetheless valuable for use during development and debugging.
// 
// Vector polygon layer for BRMPO region
var brmpo_style = new ol.style.Style({ fill:   new ol.style.Fill({ color: 'rgba(70, 130, 180, 0.3)' }), 
                                       stroke: new ol.style.Stroke({ color: 'rgba(0, 0, 255,1.0)', width: 0.1})
				});
var brmpo = new ol.layer.Vector({ title: 'Boston Region MPO (BRMPO)',
								  source: new ol.source.Vector({  url: 'data/geojson/ctps_brmpo_boundary_poly.geojson',
								                                  format: new ol.format.GeoJSON()
																}),
								  style: brmpo_style
								});

// Vector polygon layer for MAPC area not in BRMPO
var mapc_non_mpo_style = new ol.style.Style({ fill:   new ol.style.Fill({ color: 'rgba(109, 5, 245, 0.3)' }), 
                                              stroke: new ol.style.Stroke({ color: 'rgba(109, 5, 245, 1.0)', width: 0.1})
				});
var mapc_non_mpo = new ol.layer.Vector({ title: 'MAPC area not within Boston Region MPO',
										 source: new ol.source.Vector({ url: 'data/geojson/mapc_non_mpo_boundary_poly.geojson',
										                                format: new ol.format.GeoJSON()
																       }),
										 style: mapc_non_mpo_style
									});
									
// Vector polygone layer for underserved 2010 Census tracts
var underserved_2010_style = new ol.style.Style({ fill:   new ol.style.Fill({ color: 'rgba(255, 234, 190, 0.6)' }), 
                                                  stroke: new ol.style.Stroke({ color: 'rgba(255, 255, 255, 1.0)', width: 0.2})
				});
var underserved_2010 = new ol.layer.Vector({ title: 'Underserved Census Tracts 2010',
										     source: new ol.source.Vector({ url: 'data/geojson/underserved_mapc_tracts_2010_epsg4326.geojson',
										                                   format: new ol.format.GeoJSON()
																       }),
										     style: underserved_2010_style
									});

// Vector point layer for accidents in BRMPO area in 2016-2020
var brmpo_crash_style = new ol.style.Style({ image: new ol.style.Circle({ radius: 2.5,
                                                                          fill: new ol.style.Fill({color: 'red'}) })
                                                                        });

var brmpo_crashes = new ol.layer.Vector({ title: 'Fatal crashes in BRMPO',
								          source: new ol.source.Vector({  url: 'data/geojson/fatal_crashes_brmpo_2016_2020.geojson',
								                                          format: new ol.format.GeoJSON()
																}),
								          style: brmpo_crash_style
								});

// Vector point layer for accidents in MAPC area not in BRMPO in 2016-2020
var mapc_non_brmpo_crash_style = new ol.style.Style({ image: new ol.style.Circle({ radius: 2.5,
                                                                                   fill: new ol.style.Fill({color: 'yellow'}) })
                                                                                 });
var mapc_non_brmpo_crashes = new ol.layer.Vector({ title: 'Fatal crashes in MAPC area, not in BRMPO',
								                   source: new ol.source.Vector({  url: 'data/geojson/fatal_crashes_mapc_non_brmpo_2016_2020.geojson',
								                                                   format: new ol.format.GeoJSON()
																}),
								                   style: mapc_non_brmpo_crash_style
		});

// On-click event handler for overlay features, and associated machinery
//
var highlightStyle = new ol.style.Style({ stroke: new ol.style.Stroke({ color: 'rgba(255, 255, 255, 0.7)',
                                                                        width: 2
												                     })
                                       });
var featureOverlay = new ol.layer.Vector({ source: new ol.source.Vector(),
                                           map: ol_map,
                                           style: highlightStyle
                                        });
var highlight;
// Hit-test using vector layer's method
var displayFeatureInfoCoarse = function (evt) {
	console.log("Entered 'coarse' click event handler.");
	var pixel = evt.pixel;
	var coordinate = evt.coordinate;
	// var features, feature;
    // features = ol_map.getFeaturesAtPixel(pixel);
	underserved_2010.getFeatures(pixel).then(function (features) {
	    var feature = features.length ? features[0] : undefined;
		if (features.length) {
			var tract_id = 0, app = 'No', hdc = 'No';
			tract_id = feature.get('geoid10');
			app = feature.get('f_p____');
			hdc = feature.get('g_h____');
			var content = document.getElementById('popup-content');
			var s = '<p>Tract ID: &nbsp; ' + tract_id + '</p>';
			s += '<p>Area of persistent poverty: &nbsp; ' + app + '</p>';
			s += '<p>Historically disadvantaged community: &nbsp; ' + hdc + '</p>';
			console.log(s)
			content.innerHTML = s;
			overlay.setPosition(coordinate);
			// The following code is currently unused
			if (feature !== highlight) {
				if (highlight) {
					featureOverlay.getSource().removeFeature(highlight);
				}
				if (feature) {
					featureOverlay.getSource().addFeature(feature);
				}
			  highlight = feature;
			}
		}
	});
};


// Hit-test using map object's method
var displayFeatureInfoFine = function (evt) {
	console.log("Entered 'fine' click event handler.");
	var pixel = evt.pixel;
	var coordinate = evt.coordinate;
	var features, feature;
	// TODO: set hitTolerance based on map's zoom level
	var hitTolerance = 10;
    features = ol_map.getFeaturesAtPixel(pixel, { 'hitTolerance' : hitTolerance });
	var nfeatures = features.length;
	console.log('Number of features found: ' + nfeatures);
	if (nfeatures > 0) {
		feature = features[0];
		var tract_id = 0, app = 'No', hdc = 'No';
		tract_id = feature.get('geoid10');
		app = feature.get('f_p____');
		hdc = feature.get('g_h____');
		var content = document.getElementById('popup-content');
		var s = '<p>Tract ID: &nbsp; ' + tract_id + '<br/>';
		s += 'Area of persistent poverty: &nbsp; ' + app + '<br/>';
		s += 'Historically disadvantaged community: &nbsp; ' + hdc + '</p>';
		console.log(s)
		content.innerHTML = s;
		overlay.setPosition(coordinate);
		// The following code is currently unused
		if (feature !== highlight) {
			if (highlight) {
				featureOverlay.getSource().removeFeature(highlight);
			}
			if (feature) {
				featureOverlay.getSource().addFeature(feature);
			}
		  highlight = feature;
		}
	}
};

// Function: initialize()
//     0. Initialize the jQueryUI accordion control
//     1. Initialize OpenLayers map, gets MassGIS basemap service properties by executing AJAX request
//     2. Arm event handlers for UI controls
//
function initialize() {  
    // 1. Initialize OpenLayers map, gets MassGIS basemap service properties by executing AJAX request
    $.ajax({ url: mgis_serviceUrls['topo_features'], jsonp: 'callback', dataType: 'jsonp', data: { f: 'json' }, 
             success: function(config) {     
        // Body of "success" handler starts here.
        // Get resolutions
        var tileInfo = config.tileInfo;
        var resolutions = [];
        for (var i = 0, ii = tileInfo.lods.length; i < ii; ++i) {
            resolutions.push(tileInfo.lods[i].resolution);
        }               
        // Get projection
        var epsg = 'EPSG:' + config.spatialReference.wkid;
        var units = config.units === 'esriMeters' ? 'm' : 'degrees';
        var projection = ol.proj.get(epsg) ? ol.proj.get(epsg) : new ol.proj.Projection({ code: epsg, units: units });                              
        // Get attribution
        var attribution = new ol.control.Attribution({ html: config.copyrightText });               
        // Get full extent
        var fullExtent = [config.fullExtent.xmin, config.fullExtent.ymin, config.fullExtent.xmax, config.fullExtent.ymax];
        
        var tileInfo = config.tileInfo;
        var tileSize = [tileInfo.width || tileInfo.cols, tileInfo.height || tileInfo.rows];
        var tileOrigin = [tileInfo.origin.x, tileInfo.origin.y];
        var urls;
        var suffix = '/tile/{z}/{y}/{x}';
        urls = [mgis_serviceUrls['topo_features'] += suffix];               
        var width = tileSize[0] * resolutions[0];
        var height = tileSize[1] * resolutions[0];     
        var tileUrlFunction, extent, tileGrid;               
        if (projection.getCode() === 'EPSG:4326') {
            tileUrlFunction = function tileUrlFunction(tileCoord) {
                var url = urls.length === 1 ? urls[0] : urls[Math.floor(Math.random() * (urls.length - 0 + 1)) + 0];
                return url.replace('{z}', (tileCoord[0] - 1).toString()).replace('{x}', tileCoord[1].toString()).replace('{y}', (-tileCoord[2] - 1).toString());
            };
        } else {
            extent = [tileOrigin[0], tileOrigin[1] - height, tileOrigin[0] + width, tileOrigin[1]];
            tileGrid = new ol.tilegrid.TileGrid({ origin: tileOrigin, extent: extent, resolutions: resolutions });
        }     

        // MassGIS basemap Layer 1 - topographic features
        var layerSource;
        layerSource = new ol.source.XYZ({ attributions: [attribution], projection: projection,
                                          tileSize: tileSize, tileGrid: tileGrid,
                                          tileUrlFunction: tileUrlFunction, urls: urls });
                          
        mgis_basemap_layers['topo_features'] = new ol.layer.Tile();
        mgis_basemap_layers['topo_features'].setSource(layerSource);
        mgis_basemap_layers['topo_features'].setVisible(false);
        
        // We make the rash assumption that since this set of tiled basemap layers were designed to overlay one another,
        // their projection, extent, and resolutions are the same.
        
         // MassGIS basemap Layer 2 - structures
        urls = [mgis_serviceUrls['structures'] += suffix];  
        layerSource = new ol.source.XYZ({ attributions: [attribution], projection: projection,
                                          tileSize: tileSize, tileGrid: tileGrid,
                                          tileUrlFunction: tileUrlFunction, urls: urls });;
        mgis_basemap_layers['structures'] = new ol.layer.Tile();
        mgis_basemap_layers['structures'].setSource(layerSource); 
        mgis_basemap_layers['structures'].setVisible(false);
        
        // MassGIS basemap Layer 3 - "detailed" features - these include labels
        urls = [mgis_serviceUrls['basemap_features'] += suffix];  
        layerSource = new ol.source.XYZ({ attributions: [attribution], projection: projection,
                                          tileSize: tileSize, tileGrid: tileGrid,
                                          tileUrlFunction: tileUrlFunction, urls: urls });
        mgis_basemap_layers['basemap_features'] = new ol.layer.Tile();
        mgis_basemap_layers['basemap_features'].setSource(layerSource);
        mgis_basemap_layers['basemap_features'].setVisible(false);

                       
        // MassGIS basemap Layer 4 - parcels - WE (CURRENTLY) DO NOT USE THIS LAYER
        // Code retained for reference purposes only
/*
        urls = [mgis_serviceUrls['parcels'] += suffix];
        layerSource = new ol.source.XYZ({ attributions: [attribution], projection: projection,
                                          tileSize: tileSize, tileGrid: tileGrid,
                                          tileUrlFunction: tileUrlFunction, urls: urls });;
        mgis_basemap_layers['parcels'] = new ol.layer.Tile();
        mgis_basemap_layers['parcels'].setSource(layerSource);  
        mgis_basemap_layers['parcels'].setVisible(true);
*/

        // Create OpenStreetMap base layer
        osm_basemap_layer = new ol.layer.Tile({ source: new ol.source.OSM() });
		osm_basemap_layer.setVisible(false);
		
		// Create Stamen 'toner-lite' base layer
	    stamen_basemap_layer = new ol.layer.Tile({ source: new ol.source.Stamen({layer: 'toner-lite',
		                                                                          url: "https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png" }) });
		stamen_basemap_layer.setVisible(false);
		
		// MAPC base layer
		mapc_base_layer = new ol.layer.Tile({ source: new ol.source.TileWMS({ // layer: 'Basemap', 
		                                                                     url: "http://tiles.mapc.org/basemap/{Z}/{X}/{Y}.png" }) }) ;
		mapc_basemap_layer.setVisible(true);

		// Create WMS layers
		var brmpo_wms = new ol.layer.Tile({	source: new ol.source.TileWMS({ url		: szWMSserverRoot,
																			params	: { 'LAYERS': 'postgis:ctps_brmpo_boundary_poly', 
																						'STYLES': 'ss4a_brmpo_area',
																						'TRANSPARENT': 'true'
																					  }
																		}),
											title: 'Boston Region MPO (BRMPO)',	
											visible: true
										});	
										
		var mapc_non_brmpo_wms = new ol.layer.Tile({ source: new ol.source.TileWMS({ url		: szWMSserverRoot,
																	                 params	: { 'LAYERS': 'postgis:ctps_mapc_non_mpo_boundary_poly', 
																				                'STYLES': 'ss4a_mapc_non_brmpo_area',
																				                'TRANSPARENT': 'true'
																			                  }
																                   }),
									                 title: 'MAPC area not within Boston Region MPO',
													 visible: true
								                   });	

        // Create OpenLayers map
        ol_map = new ol.Map({ layers: [  stamen_basemap_layer, 
										 osm_basemap_layer,
                                         mgis_basemap_layers['topo_features'],
                                         mgis_basemap_layers['structures'],
                                         mgis_basemap_layers['basemap_features'],
										 brmpo_wms,
										 mapc_non_brmpo_wms,
										 underserved_2010,
										 brmpo_crashes,
										 mapc_non_brmpo_crashes
                                      ],
                               target: 'map',
                               view:   initMapView,
							   overlays: [overlay]
                            });

		// Proof-of-concept code to display 'popup' overlay:
		ol_map.on('singleclick', function(evt) { displayFeatureInfoFine(evt); });

							
		// Add layer switcher add-on conrol
		var layerSwitcher = new ol.control.LayerSwitcher({ tipLabel: 'Legend', // Optional label for button
                                                           groupSelectStyle: 'children', // Can be 'children' [default], 'group' or 'none'
														   activationMode: 'click',
                                                           startActive: true,
														   reverse: false // List layers in order they were added to the map
                                                         });
		ol_map.addControl(layerSwitcher);
    }});
	
    // 2. Arm event handlers for UI control(s)
    // Arm event handler for basemap selection
    $(".basemap_radio").change(toggle_basemap);
	
	$("#reset_map").click(function(e) {
		ol_map.getView().setCenter(initMapCenter);
		ol_map.getView().setZoom(initMapZoom);
		});

	// Help button
	function popup(url) {
		var popupWindow = window.open(url,'popUpWindow','height=700,width=800,left=10,top=10,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,directories=no,status=yes')
	} // popup()

	displaySupportingDoc = function() {
		popup('supporting_documentation.html');
	}; 
	// event handler
	$('#supporting_doc_button').bind('click', displaySupportingDoc);
} // initialize()
