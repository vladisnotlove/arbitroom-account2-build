import './_common.js';
import './_vendor.js';

if (window.Chart) {
  const defaults = window.Chart.defaults;
  const overrides = window.Chart.overrides;
  defaults.font = {
    ...defaults.font,
    family: "Golos",
    size: 9
  };
  defaults.borderColor = "transparent";
  defaults.scales.category = {
    ...defaults.scales.category,
    grid: {
      display: false
    }
  };
  defaults.scale = {
    ...defaults.scale,
    grid: {
      ...defaults.scale.grid,
      color: "rgba(255, 255, 255, 0.08)",
      tickColor: "transparent"
    },
    ticks: {
      ...defaults.scale.ticks,
      color: "rgba(255, 255, 255, 0.32)"
    }
  };
  defaults.datasets.bar = {
    ...defaults.datasets.bar,
    barPercentage: 0.75,
    maxBarThickness: 16
  };
  defaults.elements.bar = {
    ...defaults.elements.bar,
    borderRadius: 16
  };
  defaults.datasets.doughnut = {
    ...defaults.datasets.doughnut,
    borderColor: "transparent",
    spacing: 4
  };
  overrides.doughnut = {
    ...overrides.doughnut,
    radius: "100%",
    cutout: "84%"
  };
  defaults.aspectRatio = 1;
  defaults.plugins.legend.display = false;
}

window.addEventListener("load", () => {
  document.querySelectorAll(".fillness__progress-value").forEach((root) => {
    if (root instanceof HTMLElement) {
      const percent = parseFloat(root.getAttribute("data-percent") || "0");
      const turn = 0.68 * percent * 0.01;
      root.style.webkitMaskImage = `conic-gradient(from -0.34turn, #000 0turn, #000 ${turn}turn, transparent ${turn}turn)`;
      root.style.maskImage = `conic-gradient(from -0.34turn, #000 0turn, #000 ${turn}turn, transparent ${turn}turn)`;
    }
  });
});

function createGradient(startColor, endColor, options = {}) {
  const height = options.height ?? 260;
  const startPercent = options.startPercent ?? 0.1;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(startPercent, startColor);
  gradient.addColorStop(1, endColor);
  canvas.remove();
  return gradient;
}

const varintToColors$1 = {
  green: {
    gradientStart: "#25FF01",
    gradientEnd: "#25FF011F"
  },
  blue: {
    gradientStart: "#01E0FF",
    gradientEnd: "#01E0FF1F"
  },
  purple: {
    gradientStart: "#AB29FA",
    gradientEnd: "#AB29FA1F"
  }
};
window.addEventListener("load", () => {
  const root = document.getElementById("blocksWork");
  const sourceUrl = root.getAttribute("data-source");
  const tabs = root.querySelectorAll(".blocks-work__tab");
  const chart = root.querySelector(".blocks-work__chart");
  if (!sourceUrl || !window.Chart || !tabs || !(chart instanceof HTMLCanvasElement))
    return;
  fetch(sourceUrl).then((response) => response.json()).then((allData) => {
    let chartInstance;
    const updateChartData = (tab) => {
      const variant = tab.getAttribute("data-variant");
      const data = allData[variant];
      if (!data)
        return;
      const { gradientStart, gradientEnd } = varintToColors$1[variant];
      if (chartInstance !== void 0) {
        chartInstance.data.labels = data.x;
        chartInstance.data.datasets = [
          {
            data: data.y,
            backgroundColor: createGradient(gradientStart, gradientEnd)
          }
        ];
        chartInstance.update();
      } else {
        chartInstance = new window.Chart(chart, {
          type: "bar",
          data: {
            labels: data.x,
            datasets: [
              {
                data: data.y,
                backgroundColor: createGradient(gradientStart, gradientEnd)
              }
            ]
          },
          options: {
            scales: {
              y: {
                ticks: {
                  callback: (value) => `${value} ${data.yUnit}`,
                  maxTicksLimit: 11
                }
              }
            },
            responsive: true,
            maintainAspectRatio: false
          }
        });
      }
    };
    tabs.forEach((tab) => {
      if (tab.classList.contains("active")) {
        updateChartData(tab);
      }
      tab.addEventListener("click", () => {
        tabs.forEach((tab2) => tab2.classList.remove("active"));
        tab.classList.add("active");
        updateChartData(tab);
      });
    });
  });
});

const typeToColor = {
  green: "#25FF01",
  blue: "#01E0FF",
  purple: "#AB29FA",
  other: "#121212"
};
window.addEventListener("load", () => {
  const root = document.getElementById("distribution");
  const chart = root.querySelector(".distribution__chart");
  const sourceUrl = chart.getAttribute("data-source");
  if (!(chart instanceof HTMLCanvasElement) || !window.Chart || !sourceUrl)
    return;
  fetch(sourceUrl).then((resp) => resp.json()).then((data) => {
    new window.Chart(chart, {
      type: "doughnut",
      data: {
        labels: data.map((item) => item.label),
        datasets: [
          {
            data: data.map((item) => item.value),
            backgroundColor: data.map((item) => typeToColor[item.type])
          }
        ]
      }
    });
  });
});

window.addEventListener("load", () => {
  const root = document.getElementById("incomeMetric");
  const chart = root.querySelector(".income-metric__chart");
  const sourceUrl = chart.getAttribute("data-source");
  if (!(chart instanceof HTMLCanvasElement) || !sourceUrl || !window.Chart)
    return;
  fetch(sourceUrl).then((resp) => resp.json()).then((data) => {
    const avgGreenY = data.greenY.reduce((prev, curr) => prev + curr, 0) / data.greenY.length;
    const avgBlueY = data.blueY.reduce((prev, curr) => prev + curr, 0) / data.blueY.length;
    const avgPurpleY = data.purpleY.reduce((prev, curr) => prev + curr, 0) / data.purpleY.length;
    const maxY = Math.max(...data.greenY, ...data.blueY, ...data.purpleY);
    new window.Chart(chart, {
      type: "bar",
      data: {
        labels: data.x,
        datasets: [
          {
            data: data.greenY,
            backgroundColor: createGradient("#25FF01", "#25FF011F", { startPercent: 1 - avgGreenY / maxY })
          },
          {
            data: data.blueY,
            backgroundColor: createGradient("#01E0FF", "#01E0FF1F", { startPercent: 1 - avgBlueY / maxY })
          },
          {
            data: data.purpleY,
            backgroundColor: createGradient("#AB29FA", "#AB29FA1F", { startPercent: 1 - avgPurpleY / maxY })
          }
        ]
      },
      options: {
        scales: {
          y: {
            ticks: {
              callback: (value) => `${value} ${data.yUnit}`,
              maxTicksLimit: 10
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });
  });
});

const varintToColors = {
  green: {
    gradientStart: "rgba(37, 255, 1, 0.40)",
    gradientEnd: "rgba(37, 255, 1, 0.00)",
    border: "#25FF01"
  },
  blue: {
    gradientStart: "rgba(1, 224, 255, 0.40)",
    gradientEnd: "rgba(1, 224, 255, 0.00)",
    border: "#01E0FF"
  },
  purple: {
    gradientStart: "rgba(171, 41, 250, 0.40)",
    gradientEnd: "rgba(171, 41, 250, 0.00)",
    border: "#AB29FA"
  }
};
window.addEventListener("load", () => {
  const root = document.getElementById("avgIncome");
  const sourceUrl = root.getAttribute("data-source");
  const charts = root.querySelectorAll(".avg-income__chart");
  if (!sourceUrl || !charts || !window.Chart)
    return;
  fetch(sourceUrl).then((response) => response.json()).then((allData) => {
    charts.forEach((chart) => {
      const variant = chart.getAttribute("data-variant");
      if (!variant || !(chart instanceof HTMLCanvasElement))
        return;
      const { gradientStart, gradientEnd, border } = varintToColors[variant];
      const data = allData[variant];
      new window.Chart(chart, {
        type: "line",
        data: {
          labels: data.x,
          datasets: [
            {
              data: data.y,
              backgroundColor: ({ chart: chart2 }) => {
                const { chartArea } = chart2;
                if (chartArea) {
                  return createGradient(gradientStart, gradientEnd, { height: chartArea.height });
                }
              },
              borderColor: border,
              borderWidth: 2,
              pointRadius: 0,
              cubicInterpolationMode: "monotone",
              tension: 0.4,
              fill: true
            }
          ]
        },
        options: {
          interaction: {
            intersect: false,
            mode: "index"
          },
          scales: {
            x: {
              ticks: {
                display: false
              },
              grid: {
                display: false
              }
            },
            y: {
              ticks: {
                display: false
              },
              grid: {
                display: false,
                offset: false
              }
            }
          },
          responsive: true,
          aspectRatio: 4,
          maintainAspectRatio: false
        }
      });
    });
  });
});
