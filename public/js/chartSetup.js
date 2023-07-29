const today = new Date();
const testData = [];
for (let i = 0; i < 7; ++i) {
    const prevDay = new Date(today.setHours(0, 0, 0, 0));
    prevDay.setDate(prevDay.getDate() - 6 + i);
    const entry = {id: i, day: prevDay.toDateString(),
        value: +(Math.random() * 10).toFixed(1), };
    testData.push(entry);
}

console.log(testData);

const margins = {
    top: 20,
    bottom: 30,
}

const chartHeight = 16 * 35 - margins.top - margins.bottom,
    chartWidth = 16 * 35, totalAnimTime = 500;

const chart = d3.select('.chart-img')
    .attr('height', chartHeight + margins.top + margins.bottom)
    .attr('width', chartWidth);


const tooltip = d3.select('.tooltip');

const xScale = d3.scaleBand().domain(testData.map(data => data.day))
    .rangeRound([0, chartWidth]).padding(.25);
const yScale = d3.scaleLinear().domain([0,
        Math.ceil(d3.max(testData, data => data.value))])
    .range([chartHeight, 0])

chart.append('g')
    .call(d3.axisBottom(xScale).tickSizeOuter(0))
    .attr('transform', `translate(0, ${chartHeight})`)
    .style('margin-top', '1rem');

chart.selectAll('.bar')
    .data(testData)
    .enter()
    .append('rect')
    .classed('bar', true)
    .attr('x', data => xScale(data.day))
    .attr('y', chartHeight)
    .attr('width', xScale.bandwidth())
    .transition()
    .duration(totalAnimTime)
    .attr('height', data => chartHeight - yScale(data.value))
    .attr('y', data => yScale(data.value));
