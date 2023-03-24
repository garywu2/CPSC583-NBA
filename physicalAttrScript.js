let d3 = window.d3;

const THEME_COLOR = "0, 0, 139";

const LABELS = {
  bench_press: "185 lb Bench Press Repetitions",
  wingspan: "Wingspan(in)",
  country: "Birth Country",
  team_city: "Team City",
  team_name: "Team",
  player_name: "Player",
  max_vertical_leap: "Max Vertical Leap(in)",
  height_wo_shoes: "Height(in)",
  three_quarter_sprint: "Three Quarter Sprint(s)",
};

const TOOLTIP_LABELS = {
  bench_press: "Benchpress",
  wingspan: "Wingspan",
  country: "Birth Country",
  team_city: "Team City",
  team_name: "Team",
  player_name: "Player",
  max_vertical_leap: "Max Vertical Leap",
  height_wo_shoes: "Height",
  three_quarter_sprint: "Three Quarter Sprint",
};

let globalData;

let chartData = {};

let radarChart;

let Tooltip;

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

function scaleAttrs(value, inMax, inMin, outMax, outMin) {
  value = parseFloat(value);
  let returnVal =
    (value - inMin) * ((outMax - outMin) / (inMax - inMin)) + outMin;
  console.log(returnVal);
  return !returnVal || returnVal <= 0 ? 50 : parseInt(returnVal);
}

function onMouseOver(
  element,
  name,
  aggrLabel,
  aggrValue,
  attrLabel,
  attrValue
) {
  d3.select(element.parentNode)
    .style("stroke", `rgb(${THEME_COLOR})`)
    .style("stroke-width", "2");

  if (aggrLabel === "player_name") {
    Tooltip.html(
      `<p>${TOOLTIP_LABELS[aggrLabel]}: ${aggrValue}<br/>${TOOLTIP_LABELS[attrLabel]}: ${attrValue}</p>`
    ).style("opacity", "1");
    return;
  }
  Tooltip.html(
    `<p>Name: ${name}<br/>${TOOLTIP_LABELS[attrLabel]}: ${attrValue}<br/>${TOOLTIP_LABELS[aggrLabel]}: ${aggrValue}</p>`
  ).style("opacity", "1");
}

function onMouseMove(event) {
  Tooltip.style("left", event.layerX + "px").style("top", event.layerY + "px");
}

function onMouseOut(element) {
  d3.select(element.parentNode)
    .style("stroke-width", "1")
    .style("stroke", "black");
  Tooltip.style("opacity", "0");
}

function onClick(e) {
  let image = document.getElementById("phys-attr-player-img");
  image.src = `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${e.target.__data__.player_id}.png`;

  let playerNameContainer = document.getElementById("phys-attr-player-name");
  playerNameContainer.innerHTML = `&nbsp;${e.target.__data__.first_name} ${e.target.__data__.last_name}`;

  let playerAgeContainer = document.getElementById("phys-attr-player-age");
  playerAgeContainer.innerHTML = `&nbsp;${getAgeFromBirthdate(
    e.target.__data__.birthdate
  )}`;

  chartData = {
    benchpress: e.target.__data__.bench_press,
    maxVerticalLeap: e.target.__data__.standing_vertical_leap,
    wingspan: e.target.__data__.wingspan,
    threeQuarterSprint: e.target.__data__.three_quarter_sprint,
    height: e.target.__data__.height_wo_shoes,
  };
  (radarChart.data.datasets[0] = {
    data: [
      scaleAttrs(chartData.benchpress, 29, 0, 100, 0),
      scaleAttrs(chartData.maxVerticalLeap, 44.5, 22.5, 100, 0),
      scaleAttrs(chartData.wingspan, 95, 70.75, 100, 0),
      scaleAttrs(chartData.threeQuarterSprint, 29, 0, 100, 0),
      scaleAttrs(chartData.height, 95, 60, 100, 0),
    ],
    fill: true,
    backgroundColor: `rgba(${THEME_COLOR}, 0.2)`,
    borderColor: `rgb(${THEME_COLOR})`,
    pointBackgroundColor: `rgb(${THEME_COLOR})`,
    pointBorderColor: "#fff",
    pointHoverBackgroundColor: "#fff",
    pointHoverBorderColor: `rgb(${THEME_COLOR})`,
  }),
    radarChart.update();
}

window.onload = function () {
  setup(
    "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/physical_attr_comb.csv?v=1679344803437"
  );

  let image = document.getElementById("phys-attr-player-img");
  image.addEventListener("error", onError);

  const ctx = document.getElementById("myChart");
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels: [
        "Benchpress",
        "Max Vertical Leap",
        "Wingspan",
        "Three Quarter Sprint",
        "Height",
      ],
      datasets: [
        {
          data: [
            chartData.benchpress,
            chartData.maxVerticalLeap,
            chartData.wingspan,
            chartData.threeQuarterSprint,
            chartData.height,
          ],
          fill: true,
          backgroundColor: `rgba(${THEME_COLOR}, 0.2)`,
          borderColor: `rgb(${THEME_COLOR})`,
          pointBackgroundColor: `rgb(${THEME_COLOR})`,
          pointBorderColor: "#fff",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: `rgb(${THEME_COLOR})`,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      elements: {
        line: {
          borderWidth: 3,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        r: {
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    },
  });

  //Enabling tooltips
  //code from bootstrap 5 docs
  //https://getbootstrap.com/docs/5.0/components/tooltips/
  let tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
};

const MARGIN = {
  LEFT: 50,
  RIGHT: 50,
  TOP: 20,
  BOTTOM: 20,
};

const width = 700,
  height = 500;

// to wrap the tick labels
//  https://gist.github.com/mbostock/7555321
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
    let _physicalAttrChart = new PhysicalAttrChart(data, SVG);
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

    let dots = chart
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .style("stroke", (d) =>
        d.greatest_75_flag === "Y" ? "golden" : "black"
      );

    Tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "attr-img-tooltip")
      .style("position", "absolute")
      .style("opacity", "0")
      .style("z-index", "10")
      .style("background", "white")
      .style("pointer-events", "none")
      .style("border-style", "solid")
      .style("border-color", "rgb(0, 0, 139)");

    dots
      .append("circle")
      .attr("cx", (d, i) => xScale(i) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d["wingspan"]))
      .attr("r", 15)
      .style("fill", "white");

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
        onClick(e);
      })
      .on("mouseover", function (e) {
        onMouseOver(
          this,
          e.target.__data__.player_name,
          "country",
          e.target.__data__.country,
          "wingspan",
          e.target.__data__.wingspan
        );
      })
      .on("mouseout", function (d) {
        onMouseOut(this);
      })
      .on("mousemove", function (event, d) {
        onMouseMove(event);
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

    chart
      .append("text") // text label for the x axis
      .attr("x", 400)
      .attr("y", 530)
      .style("text-anchor", "middle")
      .text("Birth Country");

    chart
      .append("text") // text label for the x axis
      .style("text-anchor", "middle")
      .attr("transform", "translate(20,250)rotate(-90)")
      .text("Wingspan(in)");
  };
};

function updateChart() {
  let attributeInput = document.getElementById("physical-attr-select");
  const attrValue = attributeInput.value;

  let aggregateInput = document.getElementById("aggregate-select");
  const aggrValue = aggregateInput.value;

  let oldChart = document.getElementById("phys-attr-chart");
  oldChart.remove();

  data = d3
    .groups(globalData, (d) => d[aggrValue])
    .map(
      (d) =>
        d[1].sort(
          (a, b) => parseFloat(b[attrValue]) - parseFloat(a[attrValue])
        )[0]
    )
    .filter((item) => item[attrValue] != 0 && item[aggrValue])
    .slice(0, 15);
  console.log(data);

  //creating the scales for our bar chart
  let xScale = d3
    .scaleBand() //a band scale automatically determines sizes of objects based on amount of data and draw space
    .domain(d3.range(data.length)) //amount of data
    .range([MARGIN.LEFT, width - MARGIN.RIGHT]) //draw space
    .padding(0.1); //space between each data mark

  let yScale = d3
    .scaleLinear()
    .domain([
      d3.min(data.map((d) => parseFloat(d[attrValue]))) - 2,
      parseFloat(d3.max(data.map((d) => parseFloat(d[attrValue])))) + 2,
    ])
    .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

  //defining an easy reference for out SVG Container
  let svg = d3.select("#PHYS_ATTR_SVG_CONTAINER");

  let chart = svg.append("g").attr("id", "phys-attr-chart");

  let dots = chart
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .style("stroke", "black");

  dots
    .append("circle")
    .attr("cx", (d, i) => xScale(i) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d[attrValue]))
    .attr("r", 15)
    .style("fill", "white");

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
    .attr("y", (d) => yScale(d[attrValue]) - 11)
    .on("error", function (d) {
      this.setAttribute(
        "href",
        "https://cdn.glitch.global/3ae5118d-10e7-47f4-942f-74a8d71c1575/sample_image.png?v=1679268087091"
      );
    })
    .on("click", (e) => {
      onClick(e);
    })
    .on("mouseover", function (e) {
      onMouseOver(
        this,
        e.target.__data__.player_name,
        aggrValue,
        e.target.__data__[aggrValue],
        attrValue,
        e.target.__data__[attrValue]
      );
    })
    .on("mouseout", function (d) {
      onMouseOut(this);
    })
    .on("mousemove", function (event, d) {
      onMouseMove(event);
    });

  var yAxis = d3.axisLeft().scale(yScale);

  chart
    .append("g")
    .attr("transform", "translate(" + MARGIN.LEFT + "," + 0 + ")")
    .call(yAxis);

  var xAxis = d3
    .axisBottom()
    .tickFormat((d, i) => data[i][aggrValue])
    .scale(xScale);

  chart
    .append("g")
    .attr("id", "xAxis")
    .attr("transform", "translate(" + 0 + "," + (height - MARGIN.BOTTOM) + ")")
    .call(xAxis)
    .selectAll(".tick text")
    .call(wrap, xScale.bandwidth());

  chart.select("#xAxis").selectAll(".tick text").attr("font-size", "8");

  chart
    .append("text") // text label for the x axis
    .attr("x", 400)
    .attr("y", 530)
    .style("text-anchor", "middle")
    .text(LABELS[aggrValue]);

  chart
    .append("text") // text label for the x axis
    .style("text-anchor", "middle")
    .attr("transform", "translate(20,250)rotate(-90)")
    .text(LABELS[attrValue]);
}
