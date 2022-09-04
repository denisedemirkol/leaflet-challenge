url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
tecplatesurl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json'


var quakesLayer = new L.LayerGroup();
var tectoLayer  = new L.LayerGroup();


function getcolor(pmag){
/* 0-1 green
   1-2 yellow
   2-3 between yellow and orange
   3-4 orange
   4-5 between orange - red
   5+  red
*/

var l_color = "";


try{
      switch (true) {
        case (pmag < 1):
            l_color = "#008000";
            break;
        case (pmag < 2):
            l_color = "#FFFF00";
            break;      
        case (pmag < 3):
            l_color = "#bfff00"; //Aquamarine
            break;
        case (pmag < 4):
            l_color = "#FF8000";
            break;       
        case (pmag < 5):
            l_color = "#FF4500";
            break;       
        case (pmag >= 5):
            l_color = "#FF0000";
            break;
                
        default:
            l_color = "#F8F8FF"; //ghost-white
            break;
            
        }
      }
catch(err) {
       console.log(err);
       console.log("error fetching colors ", error);
}    
      

  return(l_color);

}


/************************************************************************************************
 *                                     FETCHING DATA                                            *  
 ************************************************************************************************/


 /*
  * EARTHQUAKES
  */

 d3.json(url).then(
  
 data => {
  

  L.geoJSON(data.features, {
    pointToLayer: function (geoJsonPoint, latlng) {
        return L.circleMarker(latlng, { radius: (geoJsonPoint.properties.mag)*3 });
    },

    style: function (geoJsonFeature) {
        return {
            fillColor: getcolor(geoJsonFeature.properties.mag),
            fillOpacity: 0.8,
            weight: 0.2,
            color: 'yellow'
        }
    },

    onEachFeature: function (feature, layer) {

      formattedurl = '"'+feature.properties.url+'" target="_blank"';     
      newurl = "'<a href="+ formattedurl + "><h3> "+feature.properties.title+"</h3></a>'";

        layer.bindPopup(
            "<h4 style='text-align:center;'>" + new Date(feature.properties.time) +
            "</h4> <hr> <h5 style='text-align:center;'>" + newurl + "</h5>");
    }
}).addTo(quakesLayer);
createMap(quakesLayer);


 }
 

 ).catch(error => {
   console.log("error fetching url ", url," ",error);
}



);



 /*
  * TECTONIC PLATES
  */

 d3.json(tecplatesurl).then(
  
  data => {
    console.log("Tectonic Plates");
    console.log(data);

    L.geoJSON(data.features, {
      style: function (geoJsonFeature) {
          return {
              weight: 2,
              color: '#FF8000'
          }
      },

      onEachFeature: function (feature, layer) {

          console.log(feature.properties.PlateName);

          layer.bindPopup(
              "<h4 style='text-align:center;'> Plate Name: " + feature.properties.PlateName +"</h4>");
      }


  }).addTo(tectoLayer);
 
 
  }).catch(error => {
    console.log("error fetching url", url+" "+error);
 });



/************************************************************************************************
 *                                     CREATINF MAP                                             *  
 ************************************************************************************************/

 function createMap() {

 console.log("Create Map")

// Define Variables for Tile Layers
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "light-v10",
  accessToken: API_KEY
});


// Define baseMaps Object to Hold Base Layers
var baseMaps = {
  "Light Map": lightmap,
  "Satellite": satelliteMap
};



// Create an overlayMaps object to hold the bikeStations layer
var overlayMaps = {
  "Earthquakes": quakesLayer,
  "Tectonic Plates" : tectoLayer
};


  // Create the map object with options
  var map = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 2,
    layers: [lightmap, quakesLayer, tectoLayer]
  });


  console.log("map definition is complete")
  
  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);


  var legend = L.control({ position: 'bottomleft' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = ['0-1','1-2','2-3','3-4','4-5','5+']
            labels = ['<strong>Categories</strong>'];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"

        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
               '<i class="circle" style="background:' + getcolor(i) + '"></i> '  +
                 (magnitude[i] ?  magnitude[i] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(map);

}