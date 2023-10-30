const width = 1200, height = 600;
const svg = d3.select("#world-map").append("svg")
    .attr("width", width)
    .attr("height", height);
const projection = d3.geoNaturalEarth1()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const graticule = d3.geoGraticule();

const g = svg.append("g");

let currentData; 
let currentYear = 2017;
let currentMonth = 'January'; 

const jsonUrl = 'https://unpkg.com/world-atlas@2.0.2/countries-50m.json';

function loadWorldData() {
    d3.json(jsonUrl).then(topology => {
        const { countries, land } = topology.objects;
        const worldData = {
            land: topojson.feature(topology, land),
            interiors: topojson.mesh(topology, countries, (a, b) => a !== b)
        };

        renderWorldMap(worldData);
    });
}

function renderWorldMap(data) {
    const { land, interiors } = data;

    g.append("path")
        .datum(graticule())
        .attr("class", "graticules")
        .attr("d", path);

    g.selectAll(".land")
        .data(land.features)
        .enter().append("path")
        .attr("class", "land")
        .attr("d", path);

    g.append("path")
        .datum(interiors)
        .attr("class", "interiors")
        .attr("d", path);

    g.append("path")
        .datum({ type: "Sphere" })
        .attr("class", "sphere")
        .attr("d", path)
        .attr("fill", "#006994");
}


function updateCaption(year, month) {
    document.getElementById("data-caption").innerText = `Citizenship Over Time for Year ${year}, ${month}`;
}

function loadData(year, month = null) {
    currentYear = year;
    console.log("Loading year:", currentYear);
    
    if (month) {
        loadMonthData(month);
    } else {
        loadMonthData('Grand Total');
    }
}


function loadMonthData(month) {
    d3.csv(`dataset/Sarawak_Visitor_Arrivals_${currentYear}.csv`)
    .then(data => {
        console.log("Data loaded for year " + currentYear + ":", data);
        currentData = data;

        if (month) {
            currentMonth = month;
            renderMap(currentData, month);
            updateCaption(currentYear, month);
        } else {
            renderMap(currentData, 'Grand Total');
            updateCaption(currentYear, "Grand Total");
        }

    })
    .catch(error => {
        console.error("Error loading the CSV for year " + currentYear + ":", error);
    });

    updateActiveButtons(currentYear, month);
}

function updateActiveButtons(year, month) {
    document.querySelectorAll('.yearly-buttons button, .monthly-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelector(`.yearly-buttons button[data-year="${year}"]`).classList.add('active');
    document.querySelector(`.monthly-buttons button[data-month="${month}"]`).classList.add('active');
}

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function renderMap(data, column) {
    const maxVisitors = d3.max(data, d => +d[column]);
    console.log("Max visitors for", column, ":", maxVisitors);

    const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, maxVisitors]);

    d3.json(jsonUrl).then(topology => {
        const { countries } = topology.objects;
        const worldData = {
            land: topojson.feature(topology, countries)
        };

        worldData.land.features.forEach(feature => {
            const country = feature.properties.name;
            const match = data.find(d => d.Citizenship === country);

            if (!match) {
                console.warn(`No data found for ${country} in ${currentMonth} ${currentYear}`);
            }            

            if (!match) {
                console.log(`No match for country: ${country}`);
            }
            feature.properties.visitors = match ? +match[column] : 0;
        });

        g.selectAll("path.land").remove();

        g.selectAll("path.land")
            .data(worldData.land.features)
            .enter().append("path")
            .attr("class", "land")
            .attr("d", path)
            .attr("fill", d => {
                if (d.properties.visitors === 0) return "green";  // No data countries
                return colorScale(d.properties.visitors);
            })
            .attr("stroke", "#fff")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.properties.name + "<br/>" + (d.properties.visitors || "No data"))
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }).catch(error => console.error("GeoJSON Error:", error));
}

const zoomBehavior = d3.zoom()
    .scaleExtent([1, 5])
    .on("zoom", (event) => {
        g.attr('transform', event.transform);
    });

svg.call(zoomBehavior);

function zoom(action) {
    const currentZoom = svg.node().__zoom.k;
    if (action === 'in') {
        svg.transition().duration(500).call(zoomBehavior.scaleTo, currentZoom * 1.5);
    } else if (action === 'out') {
        svg.transition().duration(500).call(zoomBehavior.scaleTo, currentZoom / 1.5);
    }
}

window.onload = function() {
    loadWorldData();
    loadData(2017, 'January');
}
