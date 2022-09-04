url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'


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
}    
      

  return(l_color);

}

/*
 *
 */

// Update the legend's innerHTML with the last updated time and station count
function updateLegend() {
  document.querySelector(".legend").innerHTML = [
    "<p>Updated: </p>"
  ].join("");
}


function createLegend(){
  
  try{

    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Categories</strong>'],
    categories = ['0-1','1-2','2-3','3-4','4-5','5+'];

    for (var i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + getcolor(i) + '"></i> ' +
            (categories[i] ? categories[i] : '+'));

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map);


   }
   catch(err) {
    console.log(err);
    }     
}


/*
 *
 */
function createQuakeMap(quakes) {

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
    "Earthquakes": quakes
  };

  console.log("Map and layers are set")


  // Create the map object with options
  var map = L.map("map", {
    center: [40.73, -74.0059],
    zoom: 2,
    layers: [lightmap, quakes]
  });


  console.log("map definition is complete")
  
  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);


   // Set Up Legend

   try{

    var legend = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Categories</strong>'],
    categories = ['0-1','1-2','2-3','3-4','4-5','5+'];

    for (var i = 0; i < categories.length; i++) {

            div.innerHTML += 
            labels.push(
                '<i class="circle" style="background:' + getcolor(i) + '"></i> ' +
            (categories[i] ? categories[i] : '+'));

        }
        div.innerHTML = labels.join('<br>');
    return div;
    };
    legend.addTo(map);


   }
   catch(err) {
    console.log(err);
    }     
   // Add Legend to the Map
   //legend.addTo(myMap);


}




function createEartMarkers(response) {


  var quakes = response.features;
  var quakeMarkers = [];
  
  for (var index = 0; index < quakes.length; index++) {


  
    lat = quakes[index].geometry.coordinates[1];
    lon = quakes[index].geometry.coordinates[0];
    depth = quakes[index].geometry.coordinates[2];

    mag         = quakes[index].properties.mag;
    title       = quakes[index].properties.title;
    time        = quakes[index].properties.time;
    url         = quakes[index].properties.url;
    eventstatus = quakes[index].properties.status;
    tsunami     = quakes[index].properties.tsunami;


    var qdate = new Date(time).toLocaleDateString("en-US");
    var qtime = new Date(time).toLocaleTimeString("en-US")


    

    var printdate = qdate + " "+ qtime;
    
    var qcolor   = getcolor(mag);

    var markerOptions = {
                         fill       : true,
                         fillColor  : qcolor,
                         radius     : mag * 3,
                         opacity    : 1, 
                         weight     : 1,
                         stroke : true};

    
  
    formattedurl = '"'+url+'" target="_blank"';     
    newurl = "'<a href="+ formattedurl + "><h3> "+title+"</h3></a>'";
            

    var quakeMarker = L.circleMarker([lat, lon],markerOptions)
    .bindPopup(newurl+"<h3>Depth: " + depth + "</h3><h3>Time: "+printdate+"<h3>Status:"+eventstatus+"</h3><h3>Tsunami:"+tsunami+"</h3>");
   
    quakeMarkers.push(quakeMarker);


  
    // Call the updateLegend function, which will... update the legend!
    
    updateLegend;
    
  }  

    createQuakeMap(L.layerGroup(quakeMarkers));

}





 d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
  
 data => {
 createEartMarkers(data);


 }).catch(error => {
   console.log("error fetching url", url);
});



