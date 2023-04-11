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

  var tooltip = d3
    .select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "#fafafa")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  var mouseover = function () {
    tooltip.style("opacity", 1);
  };

  var mousemove = function (d) {
    tooltip
      .html(
        "<div class='row'><div class='col'><h6>" +
          d.target.__data__.PLAYER +
          "</h6>" +
          "<p>" +
          yColumn +
          ": " +
          d.target.__data__[yColumn] +
          "</p>" +
          "<p>" +
          xColumn +
          ": " +
          d.target.__data__[xColumn] +
          "</p></div>" +
          "<div class='col'><img src=" +
          `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${d.target.__data__.ID}.png` +
          " style='width:130px;height:95px;' alt='No image'></img></div></div>"
      )
      .style("left", d.pageX + 30 + "px")
      .style("top", d.pageY - 30 + "px");
  };

  var mouseleave = function () {
    // tooltip.transition().duration(10).style("opacity", 0);
    tooltip.style("opacity", 0);
  };

  g.merge(gEnter).selectAll("circle").remove();
  const circles = g.merge(gEnter).selectAll("circle").data(data);
  circles
    .enter()
    .append("circle")
    .attr("cx", innerWidth / 2)
    .attr("cy", innerHeight / 2)
    .attr("r", 0)
    .merge(circles)
    // .on("click", (e) => {
    //   console.log(e);
    // })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .transition()
    .duration(500)
    .delay((d, i) => i * 0.2)
    .attr("cy", (d) => yScale(yValue(d)))
    .attr("cx", (d) => xScale(xValue(d)))
    .attr("r", circleRadius)
    .style("fill", "#17408b") //#c9082a #17408b
    .style("opacity", "0.7");

  // // img added
  // circles
  //   .enter()
  //   .append("circle")
  //   .attr("cx", innerWidth / 2)
  //   .attr("cy", innerHeight / 2)
  //   .attr("r", 0)
  //   .merge(circles)
  //   .on("click", (e) => {
  //     // console.log(e);
  //   })
  //   .on("mouseover", mouseover)
  //   .on("mousemove", mousemove)
  //   .on("mouseleave", mouseleave)
  //   .transition()
  //   .duration(500)
  //   .delay((d, i) => i * 0.2)
  //   .attr("cy", (d) => yScale(yValue(d)))
  //   .attr("cx", (d) => xScale(xValue(d)))
  //   .attr("r", circleRadius)
  //   .style("fill", "#17408b") //#c9082a #17408b
  //   .style("opacity", "0.1");

  // circles
  //   .enter()
  //   .append("svg:image")
  //   .attr(
  //     "xlink:href",
  //     (d) =>
  //       `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${d["ID"]}.png`
  //   )
  //   .on("mouseover", mouseover)
  //   .on("mousemove", mousemove)
  //   .on("mouseleave", mouseleave)
  //   .attr("x", innerWidth / 2)
  //   .attr("y", innerHeight / 2)
  //   .attr("r", 0)
  //   .merge(circles)
  //   .transition()
  //   .duration(500)
  //   .delay((d, i) => i * 0.2)
  //   .attr("height", 40)
  //   .attr("width", 40)
  //   .attr("y", (d) => yScale(yValue(d)) - circleRadius)
  //   .attr("x", (d) => xScale(xValue(d)) - circleRadius);
};

window.onload = function () {
  // setup("all-time-data.csv");
  // "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/all-time-data.csv?v=1680543455314"
  setup(
    "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/all-time-data-full.csv?v=1681225181193"
  );
};

const width = 960;
const height = 500;

let data;
let fulldata;
let dataSlope;
let svg;
let xColumn = "Minutes";
let yColumn = "Points";
let n = 10;

const onXColumnClicked = (column) => {
  xColumn = column;
  render();
};

const onYColumnClicked = (column) => {
  yColumn = column;
  render();
};

const onNColumnClicked = (column) => {
  n = column;
  data = fulldata.slice(0, n);
  render();
};

setup = function (dataPath) {
  svg = d3.select("#SVG_CONTAINER");
  // let svgS = d3.select("#my_dataviz");

  d3.csv(dataPath).then(function (loadedData) {
    // console.log(loadedData);
    loadedData.forEach((d) => {
      // Minutes,Points,Rebounds,Assists,ID
      d.Minutes = +d.Minutes;
      d.Points = +d.Points;
      d.Rebounds = +d.Rebounds;
      d.Assists = +d.Assists;
      d.ID = +d.ID;
    });
    fulldata = loadedData;
    data = loadedData.slice(0, n);
    dataSlope = loadedData.slice(0, 10);
    // console.log(data);
    // console.log(data.columns);
    render();

    let _SlopeChart = new SlopeChart();
  });
};

// const render = () => {
render = function () {
  d3.select("#x-menu").call(dropdownMenu, {
    options: ["Minutes", "Points", "Rebounds", "Assists"],
    onOptionClicked: onXColumnClicked,
    selectedOption: xColumn,
  });

  d3.select("#y-menu").call(dropdownMenu, {
    options: ["Minutes", "Points", "Rebounds", "Assists"],
    onOptionClicked: onYColumnClicked,
    selectedOption: yColumn,
  });

  d3.select("#n-menu").call(dropdownMenu, {
    // options: data.columns,
    options: ["10", "25", "50", "100", "250", "500", "1000"],
    onOptionClicked: onNColumnClicked,
    selectedOption: n,
  });

  svg.call(scatterPlot, {
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
var marginS = { top: 50, right: 20, bottom: 10, left: 20 },
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

  dimensions = ["Points", "Rebounds", "Assists"];
  var y = {};
  for (i in dimensions) {
    n = dimensions[i];
    y[n] = d3
      .scaleLinear()
      .domain(
        d3.extent(dataSlope, function (d) {
          return +d[n];
        })
      )
      .range([heightS, 0]);
  }

  x = d3.scalePoint().range([0, widthS]).padding(1).domain(dimensions);

  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x(p), y[p](d[p])];
      })
    );
  }

  function colour(d) {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return "#" + randomColor;
  }

  var c = 0;

  function colour2(d) {
    // const randomColor = ["#000066","#d63a99","#646f7a","#316bad"];
    const randomColor = ["#17408b", "#c9082a"];
    if (c == 0) {
      c = 1;
    } else {
      c = 0;
    }
    return randomColor[c];
  }

  var tooltip = d3
    .select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "#fafafa")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  var mouseover = function () {
    tooltip.style("opacity", 1);
  };

  var mousemove = function (d) {
    tooltip
      .html(
        "<div class='row'><div class='col'><h6>" +
          d.target.__data__.PLAYER +
          "</h6>" +
          "<p>Points: " +
          d.target.__data__.Points +
          "</p>" +
          "<p>Rebounds: " +
          d.target.__data__.Rebounds +
          "</p>" +
          "<p>Assists: " +
          d.target.__data__.Assists +
          "</p></div>" +
          "<div class='col'><img src=" +
          `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${d.target.__data__.ID}.png` +
          " style='width:195px;height:142.5px;' alt='No image'></img></div></div>"
        // "<h6>" +
        //   d.target.__data__.PLAYER +
        //   "</h6>" +
        //   "<p>Points: " +
        //   d.target.__data__.Points +
        //   "</p>" +
        //   "<p>Rebounds: " +
        //   d.target.__data__.Rebounds +
        //   "</p>" +
        //   "<p>Assists: " +
        //   d.target.__data__.Assists +
        //   "</p>"
      )
      .style("left", d.pageX + 30 + "px")
      .style("top", d.pageY - 30 + "px");
  };

  var mouseleave = function () {
    // tooltip.transition().duration(10).style("opacity", 0);
    tooltip.style("opacity", 0);
  };

  svg
    .selectAll("myPath")
    .data(dataSlope)
    .enter()
    .append("path")
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", colour2)
    .style("stroke-width", "4")
    .style("opacity", 1)
    // .on("click", () => {
    //    console.log("click");
    // })
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  svg
    .selectAll("myAxis")
    .data(dimensions)
    .enter()
    .append("g")
    .attr("transform", function (d) {
      return "translate(" + x(d) + ")";
    })
    .each(function (d) {
      d3.select(this).call(d3.axisLeft().scale(y[d]));
    })
    // axis title
    .append("text")
    .style("text-anchor", "middle")
    .style("font-size", "3em")
    .attr("y", -10)
    .text(function (d) {
      return d;
    })
    .style("fill", "#635f5d");
};
