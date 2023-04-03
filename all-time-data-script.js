let d3 = window.d3;

// drop down Menu for scatter Plot
const dropdownMenu = (selection, props) => {
  const { options, onOptionClicked, selectedOption } = props;

  let select = selection.selectAll("select").data([null]);
  select = select
    .enter()
    .append("select")
    .merge(select)
    .on("change", function () {
      onOptionClicked(this.value);
    });

  const option = select.selectAll("option").data(options);
  option
    .enter()
    .append("option")
    .merge(option)
    .attr("value", (d) => d)
    .property("selected", (d) => d === selectedOption)
    .text((d) => d);
};

// scatter Plot
let scatterPlot = (selection, props) => {
  const {
    ID,
    xValue,
    xAxisLabel,
    yValue,
    circleRadius,
    yAxisLabel,
    margin,
    width,
    height,
    data,
  } = props;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  const yScale = d3.scaleLinear();
  yScale.domain(d3.extent(data, yValue));
  yScale.range([innerHeight, 0]);
  yScale.nice();

  const g = selection.selectAll(".container").data([null]);
  const gEnter = g.enter().append("g").attr("class", "container");
  gEnter.merge(g).attr("transform", `translate(${margin.left},${margin.top})`);

  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(d3.format(".2s"))
    .tickSize(-innerHeight)
    .tickPadding(15);

  const yAxis = d3
    .axisLeft(yScale)
    .tickFormat(d3.format(".2s"))
    .tickSize(-innerWidth)
    .tickPadding(10);

  const yAxisG = g.select(".y-axis");

  const yAxisGEnter = gEnter.append("g").attr("class", "y-axis");

  yAxisG.merge(yAxisGEnter).call(yAxis).selectAll(".domain").remove();

  const yAxisLabelText = yAxisGEnter
    .append("text")
    .attr("class", "axis-label")
    .attr("y", -93)
    .attr("fill", "black")
    .attr("transform", `rotate(-90)`)
    .attr("text-anchor", "middle")
    .merge(yAxisG.select(".axis-label"))
    .attr("x", -innerHeight / 2)
    .text(yAxisLabel);

  const xAxisG = g.select(".x-axis");
  const xAxisGEnter = gEnter.append("g").attr("class", "x-axis");
  xAxisG
    .merge(xAxisGEnter)
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis)
    .selectAll(".domain")
    .remove();

  const xAxisLabelText = xAxisGEnter
    .append("text")
    .attr("class", "axis-label")
    .attr("y", 75)
    .attr("fill", "black")
    .merge(xAxisG.select(".axis-label"))
    .attr("x", innerWidth / 2)
    .text(xAxisLabel);

  const circles = g.merge(gEnter).selectAll("circle").data(data);
  circles
    .enter()
    .append("circle")
    .attr("cx", innerWidth / 2)
    .attr("cy", innerHeight / 2)
    .attr("r", 0)
    .merge(circles)
    // .on("click", () => {
    //   console.log();
    // })
    .transition()
    .duration(500)
    .delay((d, i) => i * 0.2)
    .attr("cy", (d) => yScale(yValue(d)))
    .attr("cx", (d) => xScale(xValue(d)))
    .attr("r", circleRadius);

  // circles
  //   .enter()
  //   .append("circle")
  //   .attr("cy", (d) => yScale(yValue(d)))
  //   .attr("cx", (d) => xScale(xValue(d)))
  //   .attr("r", circleRadius)
  //   .style("fill", "white");

  // circles
  //   .append("svg:image")
  //   .attr(
  //     "xlink:href",
  //     (d) =>
  //       `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${ID(
  //         d
  //       )}.png`
  //   )
  //   .attr("height", 20)
  //   .attr("width", 20)
  //   .attr("y", (d) => yScale(yValue(d)) - circleRadius)
  //   .attr("x", (d) => xScale(xValue(d)) - circleRadius);
};

window.onload = function () {
  // setup("all-time-data.csv");
  setup(
    "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/all-time-data.csv?v=1680543455314"
  );
};

const width = 960;
const height = 500;

let data;
let svg;
let xColumn;
let yColumn;

const onXColumnClicked = (column) => {
  xColumn = column;
  render();
};

const onYColumnClicked = (column) => {
  yColumn = column;
  render();
};

setup = function (dataPath) {
  svg = d3.select("#SVG_CONTAINER");
  // let svgS = d3.select("#my_dataviz");

  d3.csv(dataPath).then(function (loadedData) {
    console.log(loadedData);
    data = loadedData;
    // data = loadedData.slice(0,25);
    // let col = data.columns;
    // // data.filter(function (d, i) {
    // //   return i < 10;
    // // });
    // data = {col : data.filter(function (d) {
    //   return d.RANK <= 100;
    // })};
    // data.slice
    data.forEach((d) => {
      // Minutes,Points,Rebounds,Assists,ID
      d.Minutes = +d.Minutes;
      d.Points = +d.Points;
      d.Rebounds = +d.Rebounds;
      d.Assists = +d.Assists;
      d.ID = +d.ID;
    });

    xColumn = data.columns[1];
    yColumn = data.columns[2];

    console.log(data);
    console.log(data.columns);
    render();

    let _SlopeChart = new SlopeChart();
  });
};

// const render = () => {
render = function () {
  d3.select("#x-menu").call(dropdownMenu, {
    // options: data.columns,
    options: ["Minutes", "Points", "Rebounds", "Assists"],
    onOptionClicked: onXColumnClicked,
    selectedOption: xColumn,
  });

  d3.select("#y-menu").call(dropdownMenu, {
    // options: data.columns,
    options: ["Minutes", "Points", "Rebounds", "Assists"],
    onOptionClicked: onYColumnClicked,
    selectedOption: yColumn,
  });

  svg.call(scatterPlot, {
    // ID: (d) => d["ID"],
    xValue: (d) => d[xColumn],
    xAxisLabel: xColumn,
    yValue: (d) => d[yColumn],
    circleRadius: 10,
    yAxisLabel: yColumn,
    margin: { top: 20, right: 40, bottom: 88, left: 150 },
    width,
    height,
    data,
  });
};

// SlopeChart
var marginS = { top: 80, right: 20, bottom: 10, left: 20 },
  widthS = 1000 - marginS.left - marginS.right,
  heightS = 800 - marginS.top - marginS.bottom;

let SlopeChart = function () {
  var svg = d3
    .select("#my_dataviz")
    .append("svg")
    .attr("width", widthS + marginS.left + marginS.right)
    .attr("height", heightS + marginS.top + marginS.bottom)
    .append("g")
    .attr("transform", "translate(" + marginS.left + "," + marginS.top + ")");

  console.log(data);
  dimensions = ["Points", "Rebounds", "Assists"];
  console.log(dimensions);

  // For each dimension, I build a linear scale. I store all in a y object
  var y = {};
  for (i in dimensions) {
    n = dimensions[i];
    y[n] = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return +d[n];
        })
      )
      .range([heightS, 0]);
  }

  // Build the X scale -> it find the best position for each Y axis
  x = d3.scalePoint().range([0, widthS]).padding(1).domain(dimensions);

  // var highlight = function (d) {
  //   // selected_path = d.ID;
  //   console.log(d);
  //   // first every group turns grey
  //   d3.selectAll(".line")
  //     .transition()
  //     .duration(200)
  //     .style("stroke", "lightgrey")
  //     .style("opacity", "0.2");
  //   // // Second the hovered specie takes its color
  //   d3.selectAll("." + d)
  //     .transition()
  //     .duration(200)
  //     .style("stroke", "red") //#69b3a2
  //     .style("opacity", "1");
  // };

  // // Unhighlight
  // var doNotHighlight = function (d) {
  //   d3.selectAll(".line")
  //     .transition()
  //     .duration(200)
  //     .delay(1000)
  //     .style("stroke", function (d) {
  //       return color(d.Species);
  //     })
  //     .style("opacity", "1");
  // };

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x(p), y[p](d[p])];
      })
    );
  }

  // Draw the lines
  svg
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
    // .attr(("class", function (d) { return "line " + d.Points } ))
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", "#69b3a2")
    .style("stroke-width", "2")
    .style("opacity", 1)
    // .on("mouseover", highlight)
    // .on("mouseleave", doNotHighlight)
    .on("click", () => {
      console.log();
    });

  // Draw the axis:
  svg
    .selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions)
    .enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function (d) {
      return "translate(" + x(d) + ")";
    })
    // And I build the axis with the call function
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().scale(y[d]));
    })
    // Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text(function (d) {
      return d;
    })
    .style("fill", "black");
};
