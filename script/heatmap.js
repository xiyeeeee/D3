// Load the datasets
var years = ['2017', '2018', '2019', '2020', '2021'];
var currentYearIndex = 0;

// Function to update heatmap based on selected year
function updateHeatmap(selectedYear) {
    d3.select("#heatmap").html("");  // Clear the current heatmap

    var dataPath = 'dataset/Sarawak_Visitor_Arrivals_' + selectedYear + '.csv';

    d3.csv(dataPath).then(function(data) {
        // Filter out rows for Malaysia and totals
        var filteredData = data.filter(function(d) {
            return !["Malaysia", "Grand Total (Foreigner + Malaysia)", "Total Foreigner"].includes(d.Citizenship);
        });

        // Extract the months and transpose the data for heatmap
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var heatmapData = months.map(function(month) {
            return filteredData.map(function(d) {
                return { citizenship: d.Citizenship, month: month, value: +d[month] };
            });
        }).flat();

        // Create a colorful heatmap with heat-related colors
        var colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, d3.max(heatmapData, d => d.value)]);

        // Create the heatmap
        var margin = { top: 70, right: 70, bottom: 130, left: 100 };
        var width = 1100 - margin.left - margin.right; // Increase width
        var height = 800 - margin.top - margin.bottom; // Increase height

        var svg = d3.select("#heatmap")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")"); // Centering

        var x = d3.scaleBand().domain(filteredData.map(d => d.Citizenship)).range([0, width]);
        var y = d3.scaleBand().domain(months).range([0, height]);

        // Add borders between lines
        svg.selectAll(".row-border")
            .data(filteredData)
            .enter().append("line")
            .attr("class", "row-border")
            .attr("x1", 0)
            .attr("y1", d => y(d.Citizenship))
            .attr("x2", width)
            .attr("y2", d => y(d.Citizenship))
            .style("stroke", "grey");

        svg.selectAll(".column-border")
            .data(months)
            .enter().append("line")
            .attr("class", "column-border")
            .attr("x1", d => x.bandwidth() / 2 + x(d))
            .attr("y1", 0)
            .attr("x2", d => x.bandwidth() / 2 + x(d))
            .attr("y2", height)
            .style("stroke", "grey");

        // Add heatmap rectangles
        svg.selectAll("rect")
            .data(heatmapData)
            .enter().append("rect")
            .attr("x", d => x(d.citizenship))
            .attr("y", d => y(d.month))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("stroke", "grey")
            .style("stroke-width", "1.5")
            .style("fill", d => colorScale(d.value))
            .append("title")
            .text(d => `Citizenship: ${d.citizenship}\nMonth: ${d.month}\nVisitors: ${d.value}`);

        // Add labels with increased font size
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "14px"); // Adjust font size

        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "14px"); // Adjust font size

        // Add title with increased font size
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "18px") // Adjust font size
            .text("Visitor Arrivals Heatmap - " + selectedYear);
    });
}

// Function to handle button clicks
function onButtonClick(selectedYear, i) {
    currentYearIndex = i;
    d3.select("#buttons")
        .selectAll("button")
        .classed("active", function(d, i) { return i === currentYearIndex; });

    updateHeatmap(selectedYear);
}

// Create buttons for each year with updated styles
d3.select("#buttons")
    .selectAll("button")
    .data(years)
    .enter().append("button")
    .text(function(d) { return d; })
    .on("click", onButtonClick)
    .classed("active", function(d, i) { return i === currentYearIndex; })
    .style("font-size", "16px") // Adjust font size
    .style("width", "80px") // Adjust button size
    .style("height", "40px") // Adjust button size
    .on("mouseover", function() {
        d3.select(this).style("background-color", i => (i === currentYearIndex) ? "darkgreen" : "#8f8");
    })
    .on("mouseout", function() {
        d3.select(this).style("background-color", i => (i === currentYearIndex) ? "darkgreen" : "white");
    });

// Initial heatmap
updateHeatmap(years[currentYearIndex]);
