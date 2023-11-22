// Define tooltip globally
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Function to update bubble chart based on user input
function updateBubbleChart() {
    // Get selected country and year
    var selectedCountry = document.getElementById("country").value;
    var selectedYear = document.getElementById("year").value;

    // Load CSV data based on selected year
    var dataPath = 'dataset/Sarawak_Visitor_Arrivals_' + selectedYear + '.csv';

    d3.csv(dataPath).then(function(data) {
        // Filter data for the selected country
        var countryData = data.filter(function(d) {
            return d.Citizenship === selectedCountry;
        })[0];

        // Extract monthly visitor data
        var months = Object.keys(countryData).slice(1, 13);
        var visitorCounts = months.map(function(month) {
            return +countryData[month];
        });

        // Update bubble chart with force simulation
        createBubbleChart(months, visitorCounts);
    });
}

// Function to create bubble chart with force simulation
function createBubbleChart(xValues, yValues) {
    // Clear previous bubble chart
    d3.select("#bubble-chart").selectAll("*").remove();

    // Set up SVG container
    var width = 1000;
    var height = 700;

    var svg = d3.select("#bubble-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Create scale for bubble size
    var radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(yValues)])
        .range([5, 30]); // Adjust the range based on your preference

    // Create bubbles for each data point with tooltips
    var bubbles = svg.selectAll("circle")
        .data(yValues)
        .enter().append("circle")
        .attr("r", function(d) { return radiusScale(d); })
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr("fill", "lightblue")
        .style("cursor", "pointer")
        .on("mouseover", function (event, d, i) {
            // Change border color to yellow during hover
            d3.select(this).attr("stroke", "yellow");

            // Show a tooltip on mouseover
            let tooltipX = event.pageX + 15;
            let tooltipY = event.pageY + 15;

            d3.pointer(event);
            tooltip
                .style("display", "block")
                .style("left", tooltipX + "px")
                .style("top", tooltipY + "px")
                .html(`
                    Visitors: ${d}
                `);
        })
        .on("mouseleave", function () {
            // Reset border color on mouseleave
            d3.select(this).attr("stroke", "black");

            // Hide the tooltip on mouseleave
            tooltip.style("display", "none");
        });

    // Apply force simulation
    var simulation = d3.forceSimulation(yValues.map(function(d, i) {
        return { radius: radiusScale(d), value: d };
    }))
    .force("x", d3.forceX().strength(0.1).x(width / 2)) // Center horizontally
    .force("y", d3.forceY().strength(0.1).y(height / 2)) // Center vertically
    .force("collide", d3.forceCollide().radius(d => d.radius + 2).strength(0.8)) // Non-overlapping
    .on("tick", function() {
        bubbles.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
    });

    // Add labels
    svg.selectAll(".data-label")
        .data(yValues)
        .enter().append("text")
        .attr("class", "data-label")  // Add a class to the text elements
        .attr("x", function(d, i) { return bubbles.nodes()[i].cx.baseVal.value; })
        .attr("y", function(d, i) { return bubbles.nodes()[i].cy.baseVal.value - radiusScale(d) - 10; })
        .text(function(d) { return d; })
        .attr("text-anchor", "middle");
}

// Initial bubble chart with default values
updateBubbleChart();
