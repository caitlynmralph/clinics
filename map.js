var width = 1000;
var height = 700;
var padding = 50;

//Create svg element
var div1 = d3.select(".map-container")
  .append("div");

var svg1 = div1
  .append("svg")
  .attr("width",width)
  .attr("height",height);

var projection = d3.geoAlbers()
    .translate([width / 2, height / 2])
    .scale(1280);

var radius = d3.scaleSqrt()
    .domain([0, 100])
    .range([0, 14]);

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(2.5);

var voronoi = d3.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);

d3.queue()
  .defer(d3.json, "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json")
  .defer(d3.tsv, "texas_clinics.tsv", typeClinic)
  .await(ready);

function ready(error, us, clinics) {
  if (error) throw error;

    console.log(clinics);

    var clinicByNumber = d3.map(clinics, function(d) { return d.number; });

    // clinics = clinics
    //   .filter(function(d) {
    //     console.log(d.arcs.coordinates);
    //     return d.arcs.coordinates.length; });

    svg1.append("path")
      .datum(topojson.feature(us, us.objects.land))
      .attr("class", "land")
      .attr("d", path);

    svg1.append("path")
      .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
      .attr("class", "state-borders")
      .attr("d", path);

    svg1.append("path")
      .datum({type: "MultiPoint", coordinates: clinics})
      .attr("class", "clinic-dots")
      .attr("d", path);

    console.log(clinics);

    var clinic = svg1.selectAll(".clinic")
      .data(clinics)
      .enter().append("g")
        .attr("class", "clinic");

    clinic.append("path")
      .attr("class", "clinic-arc")
      .attr("d", function(d) {
        // console.log(d.arcs);
        return path(d.arcs);
        });

    clinic.append("path")
      .data(voronoi.polygons(clinics.map(projection)))
      .attr("class", "clinic-cell")
      .attr("d", function(d) {
        console.log(d);
        return d ? "M" + d.join("L") + "Z" : null;
      });
}

function typeClinic(d) {
  d[0] = +d.longitude;
  d[1] = +d.latitude;
  d.arcs = {type: "MultiLineString", coordinates: []};
  console.log(d);
  return d;
}
