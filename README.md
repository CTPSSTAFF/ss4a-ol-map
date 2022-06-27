# ss4a-ol-map
OpenLayers map/app for SS4A grant application

## Software Dependencies
This application depends upon the following JavaScript libraries:
* [jQuery](https://jquery.com/)
* [OpenLayers](https://openlayers.org/)
* [Matt Walker's OpenLayers layer switcher add-on control](https://github.com/walkermatt/ol-layerswitcher).

The jQuery and OpenLayers libraries are loaded from a CDN; the OpenLayers layer switcher add-on library is loaded locally.

## Data Sources
* MassGIS Basemap
* OpenStreetMap
* Boundary of the Boston Region MPO: [MassGIS TOWNS_POLYM layer](https://www.mass.gov/info-details/massgis-data-municipalities),
 [CTPS list of Boston Region MPO towns](https://www.ctps.org/mpo_communities).
* Boundary of towns in MAPC, but not in Boston Region MPO: [MassGIS TOWNS_POLYM layer](https://www.mass.gov/info-details/massgis-data-municipalities), 
[MAPC website](https://www.mapc.org/).
* Crash data: TBD


## Data Analysis
The analytical method used to prepare the data for this application 
is found [here](https://github.com/CTPSSTAFF/ss4a-ol-map/blob/masterSS4A_processing.html).
