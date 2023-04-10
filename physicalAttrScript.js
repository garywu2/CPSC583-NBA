let d3 = window.d3;

const THEME_COLOR = "0, 0, 139";

const MARGIN = {
  LEFT: 50,
  RIGHT: 50,
  TOP: 5,
  BOTTOM: 20,
};

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

let legend;

const width = 700,
  height = 500;

// to wrap the tick labels
//referenced fromhttps://gist.github.com/mbostock/7555321
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

function onError(e) {
  e.target.onerror = null;
  e.target.src =
    "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/sample_img.png?v=1680137";
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
  return !returnVal || returnVal <= 0 ? 50 : parseInt(returnVal);
}

function onMouseOver(
  element,
  name,
  aggrLabel,
  aggrValue,
  attrLabel,
  attrValue,
  draftNumber
) {
  d3.select(element.parentNode)
    .style("stroke", `rgb(${THEME_COLOR})`)
    .style("stroke-width", "2");

  if (aggrLabel === "player_name") {
    Tooltip.html(
      `<p>${TOOLTIP_LABELS[aggrLabel]}: ${aggrValue}<br/>${
        TOOLTIP_LABELS[attrLabel]
      }: ${attrValue}<br/>Draft Number: ${
        isNaN(draftNumber) ? "Undrafted" : draftNumber
      }</p>`
    ).style("opacity", "1");
    return;
  }
  Tooltip.html(
    `<p>Name: ${name}<br/>${TOOLTIP_LABELS[attrLabel]}: ${attrValue}<br/>${
      TOOLTIP_LABELS[aggrLabel]
    }: ${aggrValue}<br/>Draft Number: ${
      isNaN(draftNumber) ? "Undrafted" : draftNumber
    }</p>`
  ).style("opacity", "1");
}

function onMouseMove(event) {
  Tooltip.style("left", event.layerX + "px").style("top", event.layerY + "px");
}

function onMouseOut(element, flag) {
  d3.select(element.parentNode)
    .style("stroke-width", "1")
    .style("stroke", flag === "Y" ? "gold" : "black");
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

  let playerExpContainer = document.getElementById("phys-attr-player-exp");
  playerExpContainer.innerHTML = `${e.target.__data__.season_exp}`;

  chartData = {
    benchpress: e.target.__data__.bench_press,
    maxVerticalLeap: e.target.__data__.max_vertical_leap,
    wingspan: e.target.__data__.wingspan,
    threeQuarterSprint: e.target.__data__.three_quarter_sprint,
    height: e.target.__data__.height_wo_shoes,
  };
  (radarChart.data.datasets[0] = {
    data: [
      scaleAttrs(chartData.benchpress, 27.4, 0, 100, 0),
      scaleAttrs(chartData.maxVerticalLeap, 46, 22.5, 100, 0),
      scaleAttrs(chartData.wingspan, 97.3, 67.2, 100, 0),
      scaleAttrs(chartData.threeQuarterSprint, 4, 2.8, 100, 0),
      scaleAttrs(chartData.height, 87, 64, 100, 0),
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
        tooltip: {
          callbacks: {
            label: function (context) {
              return ` ${context.parsed.r}%`;
            },
          },
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
    console.log(tooltipTriggerEl);
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
};

function cleanRScale(input) {
  return isNaN(input) ? 60 : parseInt(input);
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

  let rScale = d3.scaleLinear().domain([1, 60]).range([22, 12]);

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
      .attr("r", (d) => rScale(cleanRScale(d["draft_number"])))
      .style("fill", "white");

    dots
      .append("svg:image")
      .attr(
        "xlink:href",
        (d) =>
          `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${d["player_id"]}.png`
      )
      .attr("height", (d) => rScale(cleanRScale(d["draft_number"])) * 1.4)
      .attr("width", (d) => rScale(cleanRScale(d["draft_number"])) * 1.7)
      .attr(
        "x",
        (d, i) =>
          xScale(i) +
          xScale.bandwidth() / 2 -
          rScale(cleanRScale(d["draft_number"])) * 0.85
      )
      .attr(
        "y",
        (d) =>
          yScale(d["wingspan"]) - rScale(cleanRScale(d["draft_number"])) * 0.7
      )
      .on("error", function (d) {
        this.setAttribute(
          "href",
          "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/sample_img.png?v=1680137"
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
          e.target.__data__.wingspan,
          e.target.__data__.draft_number
        );
      })
      .on("mouseout", function (d) {
        onMouseOut(this, d.target.__data__.greatest_75_flag);
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

    // text label for the x axis
    chart
      .append("text")
      .style("text-anchor", "middle")
      .attr("transform", "translate(20,250)rotate(-90)")
      .text("Wingspan(in)");
  };

  let tooltipWrapper = svg
    .append("g")
    .on("mouseover", function (e) {
      Tooltip.html(
        '<svg height="160" width="190"><text x="2" y="15" font-weight="bold">Bubble Size</text><text x="100" y="15" font-weight="bold">Draft #</text><circle cx="30" cy="55" r="22" stroke="black" stroke-width="1" fill="white" /><circle cx="30" cy="100" r="12" stroke="black" stroke-width="1" fill="white" /> <text x="100" y="60">1</text> <text x="80" y="110">Undrafted</text><line x1="1" x2="200" y1="120" y2="120" style="stroke:rgb(0,0,0)"/><circle cx="30" cy="140" r="15" stroke="gold" stroke-width="1" fill="white"/><text x="60" y="145" f>Greatest 75 Player</text></svg>'
      ).style("opacity", 1);
    })
    .on("mousemove", function (event) {
      Tooltip.style("left", event.layerX + "px").style(
        "top",
        event.layerY - 150 + "px"
      );
    })
    .on("mouseout", function (d) {
      Tooltip.style("opacity", 0);
    });

  tooltipWrapper
    .append("circle")
    .attr("cx", 100)
    .attr("cy", 525)
    .attr("r", 8)
    .style("stroke", "black")
    .style("fill", "None");

  tooltipWrapper.append("text").attr("x", 98).attr("y", 530).text("i");

  svg.append("text").attr("x", 50).attr("y", 530).text("Scale");
};

function updateChart() {
  let attributeInput = document.getElementById("physical-attr-select");
  const attrValue = attributeInput.value;

  let aggregateInput = document.getElementById("aggregate-select");
  const aggrValue = aggregateInput.value;

  let oldChart = document.getElementById("phys-attr-chart");
  oldChart.remove();

  let extent = 2;

  if (attrValue === "three_quarter_sprint") extent = 0.1;

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
      d3.min(data.map((d) => parseFloat(d[attrValue]))) - extent,
      parseFloat(d3.max(data.map((d) => parseFloat(d[attrValue])))) + extent,
    ])
    .range([height - MARGIN.BOTTOM, MARGIN.TOP]);

  let rScale = d3.scaleLinear().domain([1, 60]).range([22, 12]);

  //defining an easy reference for out SVG Container
  let svg = d3.select("#PHYS_ATTR_SVG_CONTAINER");

  let chart = svg.append("g").attr("id", "phys-attr-chart");

  let dots = chart
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .style("stroke", (d) => (d.greatest_75_flag === "Y" ? "gold" : "black"));

  dots
    .append("circle")
    .attr("cx", (d, i) => xScale(i) + xScale.bandwidth() / 2)
    .attr("cy", (d) => yScale(d[attrValue]))
    .attr("r", (d) => rScale(cleanRScale(d["draft_number"])))
    .style("fill", "white");

  dots
    .append("svg:image")
    .attr(
      "xlink:href",
      (d) =>
        `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${d["player_id"]}.png`
    )
    .attr("height", (d) => rScale(cleanRScale(d["draft_number"])) * 1.4)
    .attr("width", (d) => rScale(cleanRScale(d["draft_number"])) * 1.7)
    .attr(
      "x",
      (d, i) =>
        xScale(i) +
        xScale.bandwidth() / 2 -
        rScale(cleanRScale(d["draft_number"])) * 0.85
    )
    .attr(
      "y",
      (d) => yScale(d[attrValue]) - rScale(cleanRScale(d["draft_number"])) * 0.7
    )
    .on("error", function (d) {
      this.setAttribute(
        "href",
        "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/sample_img.png?v=1680137"
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
        e.target.__data__[attrValue],
        e.target.__data__.draft_number
      );
    })
    .on("mouseout", function (d) {
      onMouseOut(this, d.target.__data__.greatest_75_flag);
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
