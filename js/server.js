"use strict";
var request = require('request');
var fs = require('fs');
/**
*	This code pulls an existing GeoJSON document from the web, compares it against its copy on its local filesystem
*	And aggregates (pushes) values to an array. Its intended use was to pull and transform a GeoJSON file of parking
*	data from the web and send it to an api.
*
*   Whilst a nice feed of the available parking spaces is available as GeoJSON, the dimensions of the parking spaces
*   are not shown: data is represented as points. In AMS_empty a small number of polygons have been added.
*
*	For more information see the Common Sense project by TNO, the Dutch Institute for Applied Scientific Research.
*	https://github.com/TNOCS/csWeb
*/
//------------------------- GeoJSON --------------------
/**
 * Geojson definition
 */
var FeatureCollection = (function () {
    function FeatureCollection() {
        this.features = [];
    }
    return FeatureCollection;
})();
exports.FeatureCollection = FeatureCollection;
/**
 * Geojson geometry definition
 */
var Geometry = (function () {
    function Geometry() {
    }
    return Geometry;
})();
exports.Geometry = Geometry;
/**
 * Properties definition
 */
var Properties = (function () {
    function Properties() {
    }
    return Properties;
})();
exports.Properties = Properties;
/**
 * Geojson feature definition
 */
var Feature = (function () {
    function Feature() {
    }
    return Feature;
})();
exports.Feature = Feature;
/**
 * Sensor data definition
 */
var Sensors = (function () {
    function Sensors() {
    }
    return Sensors;
})();
exports.Sensors = Sensors;
//------------------ End of GeoJSON -------
var fetchData = (function () {
    function fetchData() {
    }
    fetchData.prototype.init = function (url) {
        console.log("Initialized fetcher");
        this.url = url;
        this.fetchAndTransform();
    };
    fetchData.prototype.fetchAndTransform = function () {
        console.time("Exectime");
        console.log("GET " + this.url);
        try {
            request(this.url, function (err, res, body) {
                // fetch what we have on disk
                var geoJSON = new FeatureCollection();
                try {
                    //try obtaining the file we created before, if it is there
                    geoJSON = JSON.parse(fs.readFileSync('Ams.json', 'utf8'));
                }
                catch (error) {
                    console.log("first time encountering this data source - creating it from scratch!");
                    geoJSON = JSON.parse(fs.readFileSync('Ams_empty.json', 'utf8'));
                }
                // create a FeatureCollection to store our result
                var result = new FeatureCollection();
                result = JSON.parse(body);
                if (geoJSON.timestamps) {
                    geoJSON.timestamps.push(Date.now());
                }
                else {
                    geoJSON.timestamps = [Date.now()];
                }
                geoJSON.url = this.url;
                geoJSON.features.forEach(function (feature) {
                    // this code will be a bottleneck with large files. If we can expect the GeoJSON to always 
                    // be the same ordered list, this code can be made a lot faster
                    result.features.forEach(function (f) {
                        if (f.Id === feature.Id) {
                            if (feature.sensors && feature.sensors.FreeSpaceLong) {
                                feature.sensors.FreeSpaceLong.push(Number(f.properties.FreeSpaceLong));
                                feature.sensors.FreeSpaceShort.push(Number(f.properties.FreeSpaceShort));
                                feature.sensors.percAvailable.push(Number(f.properties.FreeSpaceShort) / Number(f.properties.ShortCapacity));
                                feature.properties = f.properties;
                                feature.properties.percAvailable = Number(f.properties.FreeSpaceShort) / Number(f.properties.ShortCapacity);
                                feature.properties.FreeSpaceLong = Number(feature.properties.FreeSpaceLong);
                                feature.properties.FreeSpaceShort = Number(feature.properties.FreeSpaceShort);
                                feature.properties.LongCapacity = Number(feature.properties.LongCapacity);
                                feature.properties.ShortCapacity = Number(feature.properties.ShortCapacity);
                            }
                            else {
                                var sensorData = new Sensors;
                                sensorData.FreeSpaceLong = [Number(f.properties.FreeSpaceLong)];
                                sensorData.FreeSpaceShort = [Number(f.properties.FreeSpaceShort)];
                                sensorData.percAvailable = [(Number(f.properties.FreeSpaceShort) / Number(f.properties.ShortCapacity))];
                                feature.sensors = sensorData;
                            }
                        }
                    });
                });
                fs.writeFile('Ams.json', JSON.stringify(geoJSON), function (err) {
                    if (err)
                        throw err;
                    console.log("Data has been saved to disk!");
                    console.timeEnd("Exectime");
                });
            });
        }
        catch (err) {
            //console.log(err)
            console.log("Error! Will re-try to retrieve information");
        }
    };
    return fetchData;
})();
exports.fetchData = fetchData;
var fetcher = new fetchData();
var refreshRate;
// a little bit of setting-up
refreshRate = 300000;
// calling init every time seems pretty silly, would rather do this inside init
fetcher.init("http://opd.it-t.nl/data/amsterdam/ParkingLocation.json");
setInterval(function () { fetcher.init("http://opd.it-t.nl/data/amsterdam/ParkingLocation.json"); }, refreshRate);
//# sourceMappingURL=server.js.map