let d3 = window.d3;

let globalData;

function onError(e) {
  e.target.onerror = null;
  e.target.src =
    "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/sample_img.png?v=1679344830668";
}

function getAgeFromBirthdate(birthdateStr) {
  const birthDate = new Date(birthdateStr);
  const ageMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

// https://cdn.glitch.global/3ae5118d-10e7-47f4-942f-74a8d71c1575/sample_image.png?v=1679268087091

window.onload = function () {
  setup(
    "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/physical_attr_comb.csv?v=1679344803437"
  );
  let image = document.getElementById("phys-attr-player-img");
  image.addEventListener("error", onError);
};

const MARGIN = {
  LEFT: 50,
  RIGHT: 50,
  TOP: 20,
  BOTTOM: 20,
};

const width = 700,
  height = 500;

var _physicalAttrChart;

//   https://gist.github.com/mbostock/7555321
function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

setup = function (dataPath) {
  //defining an easy reference for out SVG Container
  let SVG = d3.select("#PHYS_ATTR_SVG_CONTAINER");
  //Loading in our Data with D3
  d3.csv(dataPath).then(function (data) {
    //let aggrData =    d3.groups(data, d => d.country).map(d =>  d[1].sort((a,b) => parseFloat(b.wingspan) - parseFloat(a.wingspan))[0]).filter(item => item['wingspan'] != 0).slice(0,15)

    globalData = data;
    _physicalAttrChart = new PhysicalAttrChart(data, SVG);
    _physicalAttrChart.draw();
  });
};

let PhysicalAttrChart = function (data, svg) {
  data = d3
    .groups(data, (d) => d.country)
    .map(
      (d) =>
        d[1].sort((a, b) => parseFloat(b.wingspan) - parseFloat(a.wingspan))[0]
    )
    .filter((item) => item["wingspan"] != 0)
    .slice(0, 15);

  //creating the scales for our bar chart
  let xScale = d3
    .scaleBand() //a band scale automatically determines sizes of objects based on amount of data and draw space
    .domain(d3.range(data.length)) //amount of data
    .range([MARGIN.LEFT, width - MARGIN.RIGHT]) //draw space
    .padding(0.1); //space between each data mark

  let yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.map((d) => parseFloat(d["wingspan"]))) - 2,
      parseFloat(d3.max(data.map((d) => parseFloat(d["wingspan"])))) + 2,
    ])
    .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

  this.draw = function () {
    console.log(data);

    let chart = svg.append("g").attr("id", "phys-attr-chart");

    let dots = chart.selectAll("g").data(data).enter().append("g");

    dots
      .append("circle")
      .attr("cx", (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d["wingspan"]))
      .attr("r", 15)
      .style("fill", "white")
      .style("stroke", "black");

    dots
      .append("svg:image")
      .attr(
        "xlink:href",
        (d) =>
          `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${d["player_id"]}.png`
      )
      .attr("height", 20)
      .attr("width", 25)
      .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2 - 13)
      .attr("y", (d) => yScale(d["wingspan"]) - 11)
      .on("error", function (d) {
        this.setAttribute(
          "href",
          "https://cdn.glitch.global/3ae5118d-10e7-47f4-942f-74a8d71c1575/sample_image.png?v=1679268087091"
        );
      })
      .on("click", (e) => {
        let image = document.getElementById("phys-attr-player-img");
        image.src = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${e.target.__data__.player_id}.png`;

        let playerNameContainer = document.getElementById(
          "phys-attr-player-name"
        );
        playerNameContainer.innerHTML = `&nbsp;${e.target.__data__.first_name} ${e.target.__data__.last_name}`;

        let playerAgeContainer = document.getElementById(
          "phys-attr-player-age"
        );
        playerAgeContainer.innerHTML = `&nbsp;${getAgeFromBirthdate(
          e.target.__data__.birthdate
        )}`;
      });

    var yAxis = d3.axisLeft().scale(yScale);

    chart
      .append("g")
      .attr("transform", "translate(" + MARGIN.LEFT + "," + 0 + ")")
      .call(yAxis);

    var xAxis = d3
      .axisBottom()
      .tickFormat((d, i) => data[i].country)
      .scale(xScale);

    chart
      .append("g")
      .attr("id", "xAxis")
      .attr(
        "transform",
        "translate(" + 0 + "," + (height - MARGIN.BOTTOM) + ")"
      )
      .call(xAxis)
      .selectAll(".tick text")
      .call(wrap, xScale.bandwidth());

    chart.select("#xAxis").selectAll(".tick text").attr("font-size", "8");
  };
};

function updateChart() {
  let select = document.getElementById("physical-attr-select");
  const value = select.value;

  if (!value) return;

  let oldChart = document.getElementById("phys-attr-chart");
  oldChart.remove();

  data = d3
    .groups(globalData, (d) => d.country)
    .map(
      (d) => d[1].sort((a, b) => parseFloat(b[value]) - parseFloat(a[value]))[0]
    )
    .filter((item) => item[value] != 0)
    .slice(0, 15);
  console.log(data[0]);

  //creating the scales for our bar chart
  let xScale = d3
    .scaleBand() //a band scale automatically determines sizes of objects based on amount of data and draw space
    .domain(d3.range(data.length)) //amount of data
    .range([MARGIN.LEFT, width - MARGIN.RIGHT]) //draw space
    .padding(0.1); //space between each data mark

  let yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.map((d) => parseFloat(d[value]))) - 2,
      parseFloat(d3.max(data.map((d) => parseFloat(d[value])))) + 2,
    ])
    .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

  //defining an easy reference for out SVG Container
  let svg = d3.select("#PHYS_ATTR_SVG_CONTAINER");

  let chart = svg.append("g").attr("id", "phys-attr-chart");

  let dots = chart.selectAll("g").data(data).enter().append("g");

  dots
    .append("circle")
    .attr("cx", (d, i) => xScale(i) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d[value]))
    .attr("r", 15)
    .style("fill", "white")
    .style("stroke", "black");

  dots
    .append("svg:image")
    .attr(
      "xlink:href",
      (d) =>
        `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${d["player_id"]}.png`
    )
    .attr("height", 20)
    .attr("width", 25)
    .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2 - 13)
    .attr("y", (d) => yScale(d[value]) - 11)
    .on("error", function (d) {
      this.setAttribute(
        "href",
        "https://cdn.glitch.global/3ae5118d-10e7-47f4-942f-74a8d71c1575/sample_image.png?v=1679268087091"
      );
    })
    .on("click", (e) => {
      let image = document.getElementById("phys-attr-player-img");
      image.src = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${e.target.__data__.player_id}.png`;

      let playerNameContainer = document.getElementById(
        "phys-attr-player-name"
      );
      playerNameContainer.innerHTML = `&nbsp;${e.target.__data__.first_name} ${e.target.__data__.last_name}`;

      let playerAgeContainer = document.getElementById("phys-attr-player-age");
      playerAgeContainer.innerHTML = `&nbsp;${getAgeFromBirthdate(
        e.target.__data__.birthdate
      )}`;
    });

  var yAxis = d3.axisLeft().scale(yScale);

  chart
    .append("g")
    .attr("transform", "translate(" + MARGIN.LEFT + "," + 0 + ")")
    .call(yAxis);

  var xAxis = d3
    .axisBottom()
    .tickFormat((d, i) => data[i].country)
    .scale(xScale);

  chart
    .append("g")
    .attr("id", "xAxis")
    .attr("transform", "translate(" + 0 + "," + (height - MARGIN.BOTTOM) + ")")
    .call(xAxis)
    .selectAll(".tick text")
    .call(wrap, xScale.bandwidth());

  chart.select("#xAxis").selectAll(".tick text").attr("font-size", "8");
}
