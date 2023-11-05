const width = 1000;
const height = 1000;
let selectedYear = "2017"; // Default selected year
let selectedMonth = "January"; // Default selected month

const container = d3.select("#bubble-chart-container");

// Create a color scale with a custom range of colors
const colorScale = d3.scaleOrdinal()
    .range(d3.schemeCategory10); // You can use any other color scheme or custom colors

// Create a tooltip element
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function handleMouseOver(d, i, value, country) {
    d3.select(this).attr("r", d => valueScale(d[value]) + 5);
    d3.select(labels._groups[0][i]).style("display", "block");

    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html(`<strong>${d[country]}</strong><br>Visitors: ${d[value]}`)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
}

function handleMouseOut(d, i, value) {
    d3.select(this).attr("r", d => valueScale(d[value]));
    d3.select(labels._groups[0][i]).style("display", "none");

    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
}

function updateCaption(year, month) {
    const caption = document.getElementById("data-caption");
    caption.textContent = `Viewing data for ${year}, ${month}`;
}

function createBubbleChart(year, month) {
    const csvFile = `dataset/Sarawak_Visitor_Arrivals_${year}.csv`;

    d3.csv(csvFile).then(data => {
        data = data.slice(1);

        data = data.filter(d => d.Citizenship !== "Total Domestic" && d.Citizenship !== "Total Foreigner" && d.Citizenship !== "Grand Total (Foreigner + Domestic)");

        const country = "Citizenship";
        const value = month;

        valueScale.domain([0, d3.max(data, d => parseFloat(d[value]))]);

        container.selectAll("svg").remove();

        // Use a force simulation for packing bubbles closely
        const simulation = d3.forceSimulation(data)
            .force("charge", d3.forceManyBody().strength(1))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(d => valueScale(d[value]) + 2));

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const bubbles = svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("r", d => valueScale(d[value]))
            .style("fill", d => colorScale(d[country]))
            .on("mouseover", function (d, i) {
                handleMouseOver(d, i, value, country);
            })
            .on("mouseout", function (d, i) {
                handleMouseOut(d, i, value);
            });

        // Use the force simulation to position bubbles
        simulation.on("tick", () => {
            bubbles
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

        const labels = svg.selectAll("text")
            .data(data)
            .enter().append("text")
            .text(d => d[country])
            .style("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", "10px")
            .style("display", "none");
    });

    updateCaption(year, month);
}

function loadYear(year) {
    selectedYear = year;
    createBubbleChart(selectedYear, selectedMonth);

    document.querySelectorAll(".yearly-buttons button").forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(`year-${year}`).classList.add("active");
}

function loadMonth(month) {
    selectedMonth = month;
    createBubbleChart(selectedYear, selectedMonth);

    document.querySelectorAll(".monthly-buttons button").forEach(button => {
        button.classList.remove("active");
    });

    document.getElementById(`month-${month}`).classList.add("active");
}

document.querySelectorAll(".yearly-buttons button").forEach(button => {
    button.addEventListener("click", function () {
        loadYear(this.getAttribute("data-year"));
    });
});

document.querySelectorAll(".monthly-buttons button").forEach(button => {
    button.addEventListener("click", function () {
        loadMonth(this.getAttribute("data-month"));
    });
});

createBubbleChart(selectedYear, selectedMonth);
