const width = 800, height = 600;
const svg = d3.select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
let selectedYear = "2017";
const colors = d3.scaleOrdinal(d3.schemeCategory10);
d3.csv("./dataset/Transport.csv").then((res) => {
    updateChart(res.filter(d => d.year === selectedYear));

    d3.select(".yearly-buttons")
        .selectAll("button")
        .on("click", (event, i) => {
            selectedYear = event.target.innerText;
            d3.select(".yearly-buttons")
                .selectAll("button")
                .classed("active", false);
            event.target.classList.add("active");
            updateChart(res.filter(d => d.year === selectedYear));
        })
});

function updateChart(data) {
    svg.selectAll("g").remove();
    d3.select("#chart-titles")
        .text(`Arrivals by Mode of Transport into Sarawak (${selectedYear})`);
    d3.select("#data-caption")
        .text(`Grand Total: (${d3.sum(data, d => +d.value)})`);

    let pieData = d3.pie()
        .value(d => d.value)
        .sort(null)(data);
    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(150);
    let mode = ["Air", "Land", "Sea"];
    svg.append("g")
        .attr("transform", `translate(10,80)`)
        .selectAll("rect")
        .data(mode)
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("y", (d, i) => i * 30)
        .attr("fill", (d, i) => colors(i));
    svg.append("g")
        .attr("font-size", 14)
        .attr("font-weight", "bold") // Set font-weight to bold
        .attr("transform", `translate(35,80)`)
        .selectAll("text")
        .data(mode)
        .enter()
        .append("text")
        .attr("y", (d, i) => i * 30 + 10)
        .attr("dy", ".3em")
        .text((d, i) => `${d}（Growth: ${data[i].growth}）`)
        .attr("fill", (d, i) => parseFloat(data[i].growth) > 0 ? "darkblue" : "red");
    svg.append("g")
        .attr("class", "pie")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => colors(i));
    arc.innerRadius(80)
        .outerRadius(80);
    svg.append("g")
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .attr("fill", "black") // Set text color to black
        .attr("font-weight", "bold") // Set font-weight to bold
        .attr("class", "pie")
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .selectAll("text")
        .data(pieData)
        .enter()
        .append("text")
        .attr("x", d => arc.centroid(d)[0])
        .attr("y", d => arc.centroid(d)[1])
        .call(t => {
            t.append("tspan")
                .text(d => d.data.name + ":");
            t.append("tspan")
                .attr("dy", 14)
                .attr("dx", -10)
                .text(d => d.value);
        });
}