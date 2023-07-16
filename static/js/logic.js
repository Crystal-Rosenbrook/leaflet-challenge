document.addEventListener("DOMContentLoaded", function () {
  // Create the map
  var map = L.map("map").setView([0, 0], 2);

  // Add the tile layer
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Define the marker sizes based on magnitude
  function getMarkerSize(magnitude) {
    if (magnitude < 2) {
      return 10;
    } else if (magnitude < 3) {
      return 20;
    } else if (magnitude < 4) {
      return 30;
    } else if (magnitude < 5) {
      return 40;
    } else {
      return 50;
    }
  }

  // Define the marker color based on depth
  function getMarkerColor(depth) {
    if (depth < 10) {
      return "#7FFF00"; // Green
    } else if (depth < 30) {
      return "#FFFF00"; // Yellow
    } else if (depth < 50) {
      return "#FFA500"; // Orange
    } else if (depth < 70) {
      return "#FF0000"; // Red
    } else if (depth < 90) {
      return "#800080"; // Purple
    } else {
      return "#0000FF"; // Blue
    }
  }

  // Create custom marker icons
  function createMarkerIcon(magnitude, depth) {
    return L.divIcon({
      className: "custom-marker",
      iconSize: [getMarkerSize(magnitude), getMarkerSize(magnitude)],
      html: `<div class="circle" style="width: ${getMarkerSize(
        magnitude
      )}px; height: ${getMarkerSize(magnitude)}px; border-radius: 50%; background-color: ${getMarkerColor(
        depth
      )}; border: 2px solid black;"></div>`,
    });
  }

  // Add the earthquakes to the map
  fetch(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
  )
    .then((response) => response.json())
    .then((data) => {
      L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
          return L.marker(latlng, {
            icon: createMarkerIcon(
              feature.properties.mag,
              feature.geometry.coordinates[2]
            ),
          }).bindPopup(
            `<strong>${feature.properties.place}</strong><br>Magnitude: ${
              feature.properties.mag
            }<br>Depth: ${feature.geometry.coordinates[2]} km`
          );
        },
      }).addTo(map);
    });

  // Add the legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");
    var labels = [];

    div.innerHTML += "<strong>Depth</strong><br>";

    var depths = [-10, 10, 30, 50, 70, 90];
    var colors = ["#7FFF00", "#FFFF00", "#FFA500", "#FF0000", "#800080", "#0000FF"];
    for (var j = 0; j < depths.length; j++) {
      div.innerHTML +=
        '<i class="square" style="background:' +
        colors[j] +
        '"></i> ' +
        depths[j] +
        (depths[j + 1] ? "&ndash;" + depths[j + 1] + " km<br>" : "+ km");
    }

    return div;
  };

  // Insert the CSS styles
  var styleElement = document.createElement("style");
  styleElement.innerHTML = `
    .square {
      width: 12px;
      height: 12px;
      display: inline-block;
      margin-right: 6px;
    }
    .info.legend {
      background-color: white;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 1px 7px rgba(0, 0, 0, 0.65);
    }
    .info.legend strong {
      display: block;
      margin-bottom: 5px;
    }
  `;
  document.head.insertAdjacentElement("beforeend", styleElement);

  legend.addTo(map);
});
