const today = new Date();
const testData = [];
for (let i = 0; i < 7; ++i) {
    const prevDay = new Date(today.setHours(0, 0, 0, 0));
    prevDay.setDate(prevDay.getDate() - 6 + i);
    const [day, month, date, year] = prevDay.toDateString().split(' ')
    console.log(day, month, date, year);
    const entry = {id: i, day: `(${day}) ${date}-${month}`,
        value: +(Math.random() * 2).toFixed(1), };
    testData.push(entry);
}

console.log(testData);

const margins = {
    top: 20,
    bottom: 30,
    right: 5,
    left: 20
}

const chartHeight = 16 * 35 - margins.top - margins.bottom,
    chartWidth = 16 * 35 - margins.left - margins.right, totalAnimTime = 500;

const chart = d3.select('.chart-img')
    .attr('height', chartHeight + margins.top + margins.bottom)
    .attr('width', chartWidth + margins.left + margins.right);


const tooltip = d3.select('.tooltip');

const xScale = d3.scaleBand().domain(testData.map(data => data.day))
    .rangeRound([margins.left, chartWidth]).padding(.25);
const yScale = d3.scaleLinear().domain([0,
        Math.ceil(d3.max(testData, data => data.value)) + .5])
    .range([chartHeight, 0])

chart.append('g')
    .call(d3.axisBottom(xScale).tickSizeOuter(0).tickSizeInner(-chartWidth))
    .call(g => g.selectAll(".tick line")
        .attr("stroke-opacity", 0.5))
    .call(g => g.selectAll(".tick text")
        .classed("text-[.75rem]", true))
    .attr('transform', `translate(0, ${chartHeight})`)
    .style('margin-top', '1rem');

chart.append('g')
    .call(d3.axisLeft(yScale).tickSizeOuter(0).tickSizeInner(-chartHeight))
    .call(g => g.selectAll(".tick line")
        .attr("stroke-opacity", 0.5))
    .attr('transform', `translate(${margins.left}, 0)`)

function renderChart() {
    chart
        .selectAll('.bar')
        .remove();

    chart.selectAll('.bar')
        .data(testData)
        .enter()
        .append('rect')
        .classed('bar', true)
        .attr('x', data => xScale(data.day))
        .attr('y', chartHeight)
        .attr('width', xScale.bandwidth())
        .on('mouseover', data => {
            tooltip.select('.day').text(data.day);
            tooltip.select('.total').text(`Total: ${data.value}`);
            tooltip
                .style('bottom', `${chartHeight - yScale(data.value)}px`)
                .classed('opacity-100', true);
            if (data.id <= 3) {
                tooltip.style('left', `${xScale(data.day) + xScale.bandwidth() / 2 - 15}px`)
                tooltip.classed('side-left', true)
                    .classed('side-right', false);
            } else {
                tooltip.style('left', `${xScale(data.day) - xScale.bandwidth() / 2 - 25}px`)
                tooltip.classed('side-left', false)
                    .classed('side-right', true);
            }
        }).on('mouseleave', () => {
            tooltip.classed('opacity-100', false);
    })
        .transition()
        .duration(totalAnimTime)
        .attr('height', data => chartHeight - yScale(data.value))
        .attr('y', data => yScale(data.value))

}

const summaryBtn = $('button.summary');

summaryBtn.on('click', function() {
    renderChart();
})

$('.report-btn').on('click', function(ev) {
    console.log('report btn')
    ev.stopPropagation();
    renderChart();
});

