let d3 = window.d3;

let barTooltip;

const THEME_COLOR = "0, 0, 139";

const MARGIN = {
  LEFT: 50,
  RIGHT: 50,
  TOP: 5,
  BOTTOM: 20,
};

function checkValue(value) {
  if (value === "0" || !value) return false;
  return true;
}

const LABELS = {
  home: "Home",
  away: "Away",
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

window.onload = function () {
  setup(
    "https://cdn.glitch.global/f6d71f37-7469-4731-ad9c-1a479f0ead49/gameData.csv?v=1679519489429"
  );

  const ctx = document.getElementById("myChart");

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

function onMouseOver(element, label, data, color) {
  d3.select(element)
    .style("stroke", `rgb(${THEME_COLOR})`)
    .style("stroke-width", "2");

  barTooltip
    .html(`${label}: ${data}`)
    .style("opacity", "1")
    .style("color", `${color}`);
}

function onMouseMove(event) {
  barTooltip
    .style("left", event.layerX + "px")
    .style("top", event.layerY + "px");
}

function onMouseOut(element) {
  d3.select(element).style("stroke-width", "1").style("stroke", "black");
  barTooltip.style("opacity", "0");
}

function onMouseOutPie(element) {
  d3.select(element).style("stroke", "None");
  barTooltip.style("opacity", "0");
}

setup = function (dataPath) {
  //defining an easy reference for out SVG Container
  let SVG = d3.select("#GAMES_SVG_CONTAINER");
  //Loading in our Data with D3
  d3.csv(dataPath).then(function (data) {
    globalData = data;
    let _physicalAttrChart = new PhysicalAttrChart(data, SVG);
    _physicalAttrChart.draw();
  });
};

let PhysicalAttrChart = function (data, svg) {
  data = d3.groups(data, (d) => d.game_id).slice(0, 5000);
  //let chart = svg.append("g").attr("id", "games-chart");

  this.draw = function () {
    //let svgCur = d3.select("#GAMES_SVG_CONTAINER");
    //let chart = svg.append("g").attr("id", "phys-attr-chart");
    //let chart = svgCur.append("g").attr("id", "games-chart");

    barTooltip = d3
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

    var options = d3
      .select("#game-select")
      .selectAll("option")
      .data(data)
      .enter()
      .append("option")
      .text(function (d) {
        return d[1][0]["matchup_home"] + " in " + d[1][0]["game_date"];
      })
      .attr("game_id", function (d) {
        return d[1][0]["game_id"];
      })
      .property("game_id", function (d) {
        return d[1][0]["game_id"];
      });

    // Set up margins and dimensions for the graph
    var margin = { top: 20, right: 20, bottom: 30, left: 40 };
    var width = 500 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
    // var row = data[0][1][0];
    // var filtered = data.filter(function(d) {
    //     return d[1][0]['game_id'] === "28500006";
    // });
    // var dataSep = [
    //     {teamName: data[0][1][0]['team_name_home'], totalpts: data[0][1][0]['pts_home'], threepts: data[0][1][0]['fg3m_home'], fieldPts: data[0][1][0]['fgm_home'], freeThrows:data[0][1][0]['ftm_home']},
    //     {teamName: data[0][1][0]['team_name_away'], totalpts: data[0][1][0]['pts_away'], threepts: data[0][1][0]['fg3m_away'], fieldPts: data[0][1][0]['fgm_away'], freeThrows:data[0][1][0]['ftm_away']}
    // ]
    var threePtPer = data[0][1][0]["fg3_pct_home"] * 100;
    var twoPtPer = data[0][1][0]["fg_pct_home"] * 100;
    var onePtPer = data[0][1][0]["ft_pct_home"] * 100;
    var dataSepTotal = [
      {
        teamName: "Total Points",
        totalptsH: data[0][1][0]["pts_home"],
        totalptsA: data[0][1][0]["pts_away"],
      },
      {
        teamName: "Three Pointers",
        totalptsH: data[0][1][0]["fg3m_home"],
        totalptsA: data[0][1][0]["fg3m_away"],
      },
      {
        teamName: "Two Pointers",
        totalptsH: data[0][1][0]["fgm_home"],
        totalptsA: data[0][1][0]["fgm_away"],
      },
      {
        teamName: "Free Throw",
        totalptsH: data[0][1][0]["ftm_home"],
        totalptsA: data[0][1][0]["ftm_away"],
      },
    ];

    var dataSepTotalGraph = [
      {
        label: "1-pt Home",
        data: data[0][1][0]["ft_pct_home"] * 100,
      },
      {
        label: "1-pt Away",
        data: data[0][1][0]["ft_pct_away"] * 100,
      },
    ];

    var dataSepTotalGraph_2pt = [
      {
        label: "2-pt Home",
        data: data[0][1][0]["fg_pct_home"] * 100,
      },
      {
        label: "2-pt Away",
        data: data[0][1][0]["fg_pct_away"] * 100,
      },
    ];
    console.log(data[0][1][0]["fg3_pct_away"], data[0][1][0]["fg3_pct_home"]);

    var dataSepTotalGraph_3pt = [
      {
        label: "3-pt Home",
        data:
          !checkValue(data[0][1][0]["fg3_pct_home"]) &&
          !checkValue(data[0][1][0]["fg3_pct_away"])
            ? 50
            : data[0][1][0]["fg3_pct_home"] * 100,
      },
      {
        label: "3-pt Away",
        data:
          !checkValue(data[0][1][0]["fg3_pct_home"]) &&
          !checkValue(data[0][1][0]["fg3_pct_away"])
            ? 50
            : data[0][1][0]["fg3_pct_away"] * 100,
      },
    ];

    var colors = [
      { color: "#fc8d62", teamName: data[0][1][0]["team_abbreviation_home"] },
      { color: "#8da0cb", teamName: data[0][1][0]["team_abbreviation_away"] },
    ];

    // var dataSep2 = [
    //     {teamName: data[0][1][0]['team_name_home'], threeptsH: data[0][1][0]['fg3m_home'], threeptsA: data[0][1][0]['fg3m_away']},
    // ]

    // var dataSep3 = [
    //     {teamName: data[0][1][0]['team_name_home'], fieldPtsH: data[0][1][0]['fgm_home'], fieldPtsA: data[0][1][0]['fgm_away']},
    // ]

    // var dataSep1 = [
    //     {teamName: data[0][1][0]['team_name_home'], freeThrowsH: data[0][1][0]['ftm_home'], freeThrowsA: data[0][1][0]['ftm_away']},
    // ]
    // console.log("Cool stats");
    // console.log(dataSep[0]);

    // console.log("fdasfdsafsd");
    // console.log(filtered[0][1][0]);
    // console.log(dataSep.length);

    // Create SVG element
    var svg = d3
      .select("#GAMES_SVG_CONTAINER")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let chart = svg.append("g").attr("id", "games-chart");
    // Set up scales for x and y axes
    var x = d3
      .scaleBand()
      .domain(
        dataSepTotal.map(function (d) {
          return d["teamName"];
        })
      )
      .range([10, 476])
      .padding(0.05);
    var y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([
        0,
        parseFloat(
          d3.max(dataSepTotal.map((d) => parseFloat(d["totalptsA"]) + 10))
        ) + 10,
      ]);

    // Map data to x and y domains
    // x.domain(dataSep.map(function(d) { return d['teamName']; }));
    // y.domain([0, dataSep['totalpts']]);

    // Create x and y axes
    var xAxis = d3.axisBottom(x);
    var yAxis = d3.axisLeft(y);

    var colorScale = d3
      .scaleOrdinal()
      .domain(["value1", "value2"])
      .range(["blue", "green"]);

    // Add x axis to SVG
    chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    // Add y axis to chart
    chart
      .append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Points")
      .style("fill", function (d, i) {
        return i % 2 == 0 ? "blue" : "green";
      });

    // Add bars to chart
    // chart.selectAll(".bar")
    //   .data(dataSep)
    //   .enter().append("rect")
    //   .attr("class", "bar")
    //   .attr("x", function(d) { return x(d['teamName']); })
    //   .attr("width", x.bandwidth())
    //   .attr("y", function(d) { return y(d['totalpts']); })
    //   .attr("height", function(d) { return height - y(d['totalpts']); });

    chart
      .selectAll("rect")
      .data(dataSepTotal)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d["teamName"]);
      })
      .attr("y", function (d) {
        return y(d["totalptsH"]);
      })
      .attr("width", x.bandwidth() / 2)
      .attr("height", function (d) {
        return height - y(d["totalptsH"]);
      })
      .attr("fill", function (d) {
        return colorScale("value2");
      })
      .style("stroke", "black")
      .on("mouseover", function (e, d) {
        onMouseOver(this, d["teamName"], d["totalptsH"], "green");
      })
      .on("mouseout", function (d) {
        onMouseOut(this);
      })
      .on("mousemove", function (event, d) {
        onMouseMove(event);
      });

    chart
      .selectAll("rect2")
      .data(dataSepTotal)
      .enter()
      .append("rect")
      .attr("x", function (d) {
        return x(d["teamName"]) + x.bandwidth() / 2;
      })
      .attr("y", function (d) {
        return y(d["totalptsA"]);
      })
      .attr("width", x.bandwidth() / 2)
      .attr("height", function (d) {
        return height - y(d["totalptsA"]);
      })
      .attr("fill", function (d) {
        return colorScale("value1");
      })
      .style("stroke", "black")
      .on("mouseover", function (e, d) {
        onMouseOver(this, d["teamName"], d["totalptsA"], "blue");
      })
      .on("mouseout", function (d) {
        onMouseOut(this);
      })
      .on("mousemove", function (event, d) {
        onMouseMove(event);
      });

    var legend = d3
      .select("#GAMES_SVG_CONTAINER")
      .append("g")
      .attr("transform", "translate(0, 150)");

    var items = legend
      .selectAll("g")
      .data(colors)
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(0, " + i * 30 + ")");

    items
      .append("rect")
      .attr("x", 380)
      .attr("y", -120)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", function (d, i) {
        return i % 2 == 0 ? "blue" : "green";
      });

    items
      .append("text")
      .attr("x", 405)
      .attr("y", -105)
      .text(function (d, i) {
        return i % 2 == 0
          ? d["teamName"] + " (Home)"
          : d["teamName"] + " (Away)";
      });

    var outerRadius = 250 / 2,
      innerRadius = outerRadius * 0.999;
    var pie = d3.pie().value(function (d, i) {
      return d["data"];
    });

    var arcs = pie(dataSepTotalGraph);
    console.log(dataSepTotalGraph);

    var arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(80)
      .padAngle(0.03)
      .padRadius(70)
      .cornerRadius(4);

    var arcLabels = d3.arc().innerRadius(120).outerRadius(120);

    var svgp2 = d3.select("#pie-chart");
    let piGra = svgp2.append("g").attr("id", "games-pi-1");

    var pieChart = piGra.append("g").attr("transform", "translate(250, 100)");

    pieChart
      .selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", function (d, i) {
        return d3.schemeCategory10[i];
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (e, d) {
        onMouseOver(
          this,
          d.data["label"],
          `${d.data["data"].toFixed(2)}%`,
          "black"
        );
      })
      .on("mouseout", function (d) {
        onMouseOutPie(this);
      })
      .on("mousemove", function (event, d) {
        onMouseMove(event);
      });

    pieChart
      .selectAll("text")
      .data(arcs)
      .enter()
      .append("text")
      .attr("transform", function (d) {
        return "translate(" + arcLabels.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "1.1em")
      .text(function (d, i) {
        return d.data["label"];
      });

    //2 pt
    var pie_2pt = d3.pie().value(function (d, i) {
      return d["data"];
    });

    var arcs_2pt = pie(dataSepTotalGraph_2pt);
    console.log(dataSepTotalGraph_2pt);

    var arc_2pt = d3
      .arc()
      .innerRadius(0)
      .outerRadius(80)
      .padAngle(0.03)
      .padRadius(70)
      .cornerRadius(4);

    var arcLabels_2pt = d3.arc().innerRadius(120).outerRadius(120);

    var svgp2_2pt = d3.select("#pie-chart");
    let piGra_2pt = svgp2_2pt.append("g").attr("id", "games-pi-2");

    var pieChart_2pt = piGra_2pt
      .append("g")
      .attr("transform", "translate(250, 350)");

    pieChart_2pt
      .selectAll("path")
      .data(arcs_2pt)
      .enter()
      .append("path")
      .attr("d", arc_2pt)
      .attr("fill", function (d, i) {
        return d3.schemeCategory10[i];
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (e, d) {
        onMouseOver(
          this,
          d.data["label"],
          `${d.data["data"].toFixed(2)}%`,
          "black"
        );
      })
      .on("mouseout", function (d) {
        onMouseOutPie(this);
      })
      .on("mousemove", function (event, d) {
        onMouseMove(event);
      });

    pieChart_2pt
      .selectAll("text")
      .data(arcs_2pt)
      .enter()
      .append("text")
      .attr("transform", function (d) {
        return "translate(" + arcLabels_2pt.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "1.1em")
      .text(function (d, i) {
        return d.data["label"];
      });

    //3 pt
    var pie_3pt = d3.pie().value(function (d, i) {
      return d["data"];
    });

    var arcs_3pt = pie(dataSepTotalGraph_3pt);
    console.log(dataSepTotalGraph_3pt);

    var arc_3pt = d3
      .arc()
      .innerRadius(0)
      .outerRadius(80)
      .padAngle(0.03)
      .padRadius(70)
      .cornerRadius(4);

    var arcLabels_3pt = d3.arc().innerRadius(120).outerRadius(120);

    var svgp2_3pt = d3.select("#pie-chart");
    let piGra_3pt = svgp2_3pt.append("g").attr("id", "games-pi-3");

    var pieChart_3pt = piGra_3pt
      .append("g")
      .attr("transform", "translate(250, 600)");

    pieChart_3pt
      .selectAll("path")
      .data(arcs_3pt)
      .enter()
      .append("path")
      .attr("d", arc_3pt)
      .attr("fill", function (d, i) {
        return d3.schemeCategory10[i];
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (e, d) {
        onMouseOver(
          this,
          d.data["label"],
          `${d.data["data"].toFixed(2)}%`,
          "black"
        );
      })
      .on("mouseout", function (d) {
        onMouseOutPie(this);
      })
      .on("mousemove", function (event, d) {
        onMouseMove(event);
      });

    pieChart_3pt
      .selectAll("text")
      .data(arcs_3pt)
      .enter()
      .append("text")
      .attr("transform", function (d) {
        return "translate(" + arcLabels_3pt.centroid(d) + ")";
      })
      .attr("text-anchor", "middle")
      .attr("font-size", "1.1em")
      .text(function (d, i) {
        return d.data["label"];
      });

    // let playerNameContainer = document.getElementById("games-three-pointer");
    // playerNameContainer.innerHTML = "&nbsp  " + threePtPer + "%";

    // let playerAgeContainer = document.getElementById("games-two-pointer");
    // playerAgeContainer.innerHTML = "&nbsp  " + twoPtPer + "%";

    // let playerExpContainer = document.getElementById("games-one-pointer");
    // playerExpContainer.innerHTML = "&nbsp  " + onePtPer + "%";
  };
};

function updateGraph() {
  let data = globalData;
  let SVG = d3.select("#GAMES_SVG_CONTAINER");
  var game = document.getElementById("game-select");
  var gameData = game[game.selectedIndex].getAttribute("game_id");

  document.getElementById("games-pi-1").remove();
  document.getElementById("games-pi-2").remove();
  document.getElementById("games-pi-3").remove();

  var dataSepTotalGraph;
  data = d3.groups(data, (d) => d.game_id).slice(0, 1000);

  var filtered = data.filter(function (d) {
    return d[1][0]["game_id"] === gameData;
  });

  var dataSepTotalGraph = [
    {
      label: "1-pt Home",
      data: filtered[0][1][0]["ft_pct_home"] * 100,
    },
    {
      label: "1-pt Away",
      data: filtered[0][1][0]["ft_pct_away"] * 100,
    },
  ];

  var dataSepTotalGraph_2pt = [
    {
      label: "2-pt Home",
      data: filtered[0][1][0]["fg_pct_home"] * 100,
    },
    {
      label: "2-pt Away",
      data: filtered[0][1][0]["fg_pct_away"] * 100,
    },
  ];

  var dataSepTotalGraph_3pt = [
    {
      label: "3-pt Home",
      data:
        !checkValue(filtered[0][1][0]["fg3_pct_home"]) &&
        !checkValue(filtered[0][1][0]["fg3_pct_away"])
          ? 50
          : filtered[0][1][0]["fg3_pct_home"] * 100,
    },
    {
      label: "3-pt Away",
      data:
        !checkValue(filtered[0][1][0]["fg3_pct_home"]) &&
        !checkValue(filtered[0][1][0]["fg3_pct_away"])
          ? 50
          : filtered[0][1][0]["fg3_pct_away"] * 100,
    },
  ];

  var outerRadius = 250 / 2,
    innerRadius = outerRadius * 0.999;
  var pie = d3.pie().value(function (d, i) {
    return d["data"];
  });

  var arcs = pie(dataSepTotalGraph);
  console.log(dataSepTotalGraph);

  var arc = d3
    .arc()
    .innerRadius(0)
    .outerRadius(80)
    .padAngle(0.03)
    .padRadius(70)
    .cornerRadius(4);

  var arcLabels = d3.arc().innerRadius(120).outerRadius(120);

  var svgp2 = d3.select("#pie-chart");
  let piGra = svgp2.append("g").attr("id", "games-pi-1");

  var pieChart = piGra.append("g").attr("transform", "translate(250, 100)");

  pieChart
    .selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", function (d, i) {
      return d3.schemeCategory10[i];
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .on("mouseover", function (e, d) {
      onMouseOver(
        this,
        d.data["label"],
        `${d.data["data"].toFixed(2)}%`,
        "black"
      );
    })
    .on("mouseout", function (d) {
      onMouseOutPie(this);
    })
    .on("mousemove", function (event, d) {
      onMouseMove(event);
    });

  pieChart
    .selectAll("text")
    .data(arcs)
    .enter()
    .append("text")
    .attr("transform", function (d) {
      return "translate(" + arcLabels.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .attr("font-size", "1.1em")
    .text(function (d, i) {
      return d.data["label"];
    });

  //2 pt
  var pie_2pt = d3.pie().value(function (d, i) {
    return d["data"];
  });

  var arcs_2pt = pie(dataSepTotalGraph_2pt);
  console.log(dataSepTotalGraph_2pt);

  var arc_2pt = d3
    .arc()
    .innerRadius(0)
    .outerRadius(80)
    .padAngle(0.03)
    .padRadius(70)
    .cornerRadius(4);

  var arcLabels_2pt = d3.arc().innerRadius(120).outerRadius(120);

  var svgp2_2pt = d3.select("#pie-chart");
  let piGra_2pt = svgp2_2pt.append("g").attr("id", "games-pi-2");

  var pieChart_2pt = piGra_2pt
    .append("g")
    .attr("transform", "translate(250, 350)");

  pieChart_2pt
    .selectAll("path")
    .data(arcs_2pt)
    .enter()
    .append("path")
    .attr("d", arc_2pt)
    .attr("fill", function (d, i) {
      return d3.schemeCategory10[i];
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .on("mouseover", function (e, d) {
      onMouseOver(
        this,
        d.data["label"],
        `${d.data["data"].toFixed(2)}%`,
        "black"
      );
    })
    .on("mouseout", function (d) {
      onMouseOutPie(this);
    })
    .on("mousemove", function (event, d) {
      onMouseMove(event);
    });

  pieChart_2pt
    .selectAll("text")
    .data(arcs_2pt)
    .enter()
    .append("text")
    .attr("transform", function (d) {
      return "translate(" + arcLabels_2pt.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .attr("font-size", "1.1em")
    .text(function (d, i) {
      return d.data["label"];
    });

  //3 pt
  var pie_3pt = d3.pie().value(function (d, i) {
    return d["data"];
  });

  var arcs_3pt = pie(dataSepTotalGraph_3pt);
  console.log(dataSepTotalGraph_3pt);

  var arc_3pt = d3
    .arc()
    .innerRadius(0)
    .outerRadius(80)
    .padAngle(0.03)
    .padRadius(70)
    .cornerRadius(4);

  var arcLabels_3pt = d3.arc().innerRadius(120).outerRadius(120);

  var svgp2_3pt = d3.select("#pie-chart");
  let piGra_3pt = svgp2_3pt.append("g").attr("id", "games-pi-3");

  var pieChart_3pt = piGra_3pt
    .append("g")
    .attr("transform", "translate(250, 600)");

  pieChart_3pt
    .selectAll("path")
    .data(arcs_3pt)
    .enter()
    .append("path")
    .attr("d", arc_3pt)
    .attr("fill", function (d, i) {
      return d3.schemeCategory10[i];
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .on("mouseover", function (e, d) {
      onMouseOver(
        this,
        d.data["label"],
        `${d.data["data"].toFixed(2)}%`,
        "black"
      );
    })
    .on("mouseout", function (d) {
      onMouseOutPie(this);
    })
    .on("mousemove", function (event, d) {
      onMouseMove(event);
    });

  pieChart_3pt
    .selectAll("text")
    .data(arcs_3pt)
    .enter()
    .append("text")
    .attr("transform", function (d) {
      return "translate(" + arcLabels_3pt.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .attr("font-size", "1.1em")
    .text(function (d, i) {
      return d.data["label"];
    });

  // let playerNameContainer = document.getElementById("games-three-pointer");
  // playerNameContainer.innerHTML = "&nbsp  " + threePtPer + "%";

  // let playerAgeContainer = document.getElementById("games-two-pointer");
  // playerAgeContainer.innerHTML = "&nbsp  " + twoPtPer + "%";

  // let playerExpContainer = document.getElementById("games-one-pointer");
  // playerExpContainer.innerHTML = "&nbsp  " + onePtPer + "%";
}

function updateChart(e) {
  let data = globalData;
  let SVG = d3.select("#GAMES_SVG_CONTAINER");
  var game = document.getElementById("game-select");
  var gameData = game[game.selectedIndex].getAttribute("game_id");
  //var gameData = game[this.selected].getAttribute("game_id");
  console.log(gameData);
  let oldChart = document.getElementById("games-chart");
  oldChart.remove();
  data = d3.groups(data, (d) => d.game_id).slice(0, 1000);
  var margin = { top: 20, right: 20, bottom: 30, left: 40 };
  var width = 500 - margin.left - margin.right;
  var height = 500 - margin.top - margin.bottom;
  var filtered = data.filter(function (d) {
    return d[1][0]["game_id"] === gameData;
  });
  // var dataSep = [
  //     {teamName: filtered[0][1][0]['team_name_home'], totalpts: filtered[0][1][0]['pts_home'], threepts: filtered[0][1][0]['fg3m_home'], fieldPts: filtered[0][1][0]['fgm_home'], freeThrows:filtered[0][1][0]['ftm_home']},
  //     {teamName: filtered[0][1][0]['team_name_away'], totalpts: filtered[0][1][0]['pts_away'], threepts: filtered[0][1][0]['fg3m_away'], fieldPts: filtered[0][1][0]['fgm_away'], freeThrows:filtered[0][1][0]['ftm_away']}
  // ]
  var dataSepTotal = [
    {
      teamName: "Total Points",
      totalptsH: filtered[0][1][0]["pts_home"],
      totalptsA: filtered[0][1][0]["pts_away"],
    },
    {
      teamName: "Three Pointers",
      totalptsH: filtered[0][1][0]["fg3m_home"],
      totalptsA: filtered[0][1][0]["fg3m_away"],
    },
    {
      teamName: "Two Pointers",
      totalptsH: filtered[0][1][0]["fgm_home"],
      totalptsA: filtered[0][1][0]["fgm_away"],
    },
    {
      teamName: "Free Throws",
      totalptsH: filtered[0][1][0]["ftm_home"],
      totalptsA: filtered[0][1][0]["ftm_away"],
    },
  ];

  // var dataSep2 = [
  //     {teamName: data[0][1][0]['team_name_home'], threeptsH: data[0][1][0]['fg3m_home'], threeptsA: data[0][1][0]['fg3m_away']},
  // ]

  // var dataSep3 = [
  //     {teamName: data[0][1][0]['team_name_home'], fieldPtsH: data[0][1][0]['fgm_home'], fieldPtsA: data[0][1][0]['fgm_away']},
  // ]

  // var dataSep1 = [
  //     {teamName: data[0][1][0]['team_name_home'], freeThrowsH: data[0][1][0]['ftm_home'], freeThrowsA: data[0][1][0]['ftm_away']},
  // ]
  // console.log("Cool stats");
  // console.log(dataSep[0]);

  // console.log("fdasfdsafsd");
  // console.log(filtered[0][1][0]);
  // console.log(dataSep.length);

  // Create SVG element
  var svg = d3
    .select("#GAMES_SVG_CONTAINER")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  let chart = svg.append("g").attr("id", "games-chart");
  // Set up scales for x and y axes
  var x = d3
    .scaleBand()
    .domain(
      dataSepTotal.map(function (d) {
        return d["teamName"];
      })
    )
    .range([10, 476])
    .padding(0.05);
  var y = d3
    .scaleLinear()
    .range([height, 0])
    .domain([
      0,
      parseFloat(
        d3.max(dataSepTotal.map((d) => parseFloat(d["totalptsA"]) + 10))
      ) + 10,
    ]);

  // Map data to x and y domains
  // x.domain(dataSep.map(function(d) { return d['teamName']; }));
  // y.domain([0, dataSep['totalpts']]);

  // Create x and y axes
  var xAxis = d3.axisBottom(x);
  var yAxis = d3.axisLeft(y);

  var colorScale = d3
    .scaleOrdinal()
    .domain(["value1", "value2"])
    .range(["blue", "green"]);

  // Add x axis to SVG
  chart
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add y axis to chart
  chart
    .append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Points")
    .style("fill", function (d, i) {
      return i % 2 == 0 ? "blue" : "green";
    });

  // Add bars to chart
  // chart.selectAll(".bar")
  //   .data(dataSep)
  //   .enter().append("rect")
  //   .attr("class", "bar")
  //   .attr("x", function(d) { return x(d['teamName']); })
  //   .attr("width", x.bandwidth())
  //   .attr("y", function(d) { return y(d['totalpts']); })
  //   .attr("height", function(d) { return height - y(d['totalpts']); });

  chart
    .selectAll("rect")
    .data(dataSepTotal)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d["teamName"]);
    })
    .attr("y", function (d) {
      return y(d["totalptsH"]);
    })
    .attr("width", x.bandwidth() / 2)
    .attr("height", function (d) {
      return height - y(d["totalptsH"]);
    })
    .attr("fill", function (d) {
      return colorScale("value2");
    })
    .style("stroke", "black")
    .on("mouseover", function (e, d) {
      onMouseOver(this, d["teamName"], d["totalptsH"], "green");
    })
    .on("mouseout", function (d) {
      onMouseOut(this);
    })
    .on("mousemove", function (event, d) {
      onMouseMove(event);
    });

  chart
    .selectAll("rect2")
    .data(dataSepTotal)
    .enter()
    .append("rect")
    .attr("x", function (d) {
      return x(d["teamName"]) + x.bandwidth() / 2;
    })
    .attr("y", function (d) {
      return y(d["totalptsA"]);
    })
    .attr("width", x.bandwidth() / 2)
    .attr("height", function (d) {
      return height - y(d["totalptsA"]);
    })
    .attr("fill", function (d) {
      return colorScale("value1");
    })
    .style("stroke", "black")
    .on("mouseover", function (e, d) {
      onMouseOver(this, d["teamName"], d["totalptsA"], "green");
    })
    .on("mouseout", function (d) {
      onMouseOut(this);
    })
    .on("mousemove", function (event, d) {
      onMouseMove(event);
    });
  updateGraph();
}
