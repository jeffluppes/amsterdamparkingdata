## Introduction
This is a short script to gather information from an open data API hosted at http://opd.it-t.nl/data/amsterdam/ParkingLocation.json. For more information on the data itself see http://www.amsterdamopendata.nl/data?dataset=actuele_beschikbaarheid_parkeergarages. 
The script copies data from the url, holds it against a local copy of the locations and finally adds the new data.

## files
- Server.ts: the script to fetch data
- ams_empty.json: An 'empty' format for the data. Includes a small number of polygons around the Amsterdam Arena.
- /node_modules/: Node.js modules
- /typings/: typescript typings
- /js/: compiled javascript from the typescript source file(s).

## How to use
Use server.ts in your environment of choice, alternatively you could move ams_empty to the /js/ folder and run `node server.js` to run the compiled javascript directly