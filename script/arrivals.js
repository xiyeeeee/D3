window.onload = function () {
    d3.csv("dataset/Domestic2017.csv").then(function(data) {
        data.forEach(function(d) {
            for (let month in d) {
                if (month !== "Citizenship") {
                    d[month] = +d[month].replace(/,/g, '');
                }
            }
        });

        const margin = { top: 20, right: 30, bottom: 50, left: 50 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;

        const svg = d3.select("#chart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const xScale = d3.scaleBand()
            .domain(data.columns.slice(1, 13))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d["Grand Total"])])
            .nice()
            .range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const stack = d3.stack()
            .keys(data.columns.slice(1, 13))
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);

        const stackedData = stack(data);

        svg.selectAll(".bar")
            .data(stackedData)
            .enter()
            .append("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            .data(d => d)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d.data.Citizenship))
            .attr("y", d => yScale(d[1]))
            .attr("height", d => yScale(d[0]) - yScale(d[1]))
            .attr("width", xScale.bandwidth());

        function updateChart(chartType) {
            if (chartType === "stacked") {
                svg.selectAll(".bar").style("opacity", 1);
            } else if (chartType === "grouped") {
                svg.selectAll(".bar").style("opacity", 0);
            }
        }

        updateChart("stacked");

        d3.selectAll("input[name='chart-type']").on("change", function() {
            const chartType = this.value;
            updateChart(chartType);
        });
    });
};
