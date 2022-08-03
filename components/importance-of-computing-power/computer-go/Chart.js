import { Menu } from "@headlessui/react";
import { ArrowsExpandIcon, ClipboardCopyIcon, DownloadIcon } from "@heroicons/react/outline";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsExporting from "highcharts/modules/exporting";
import { useEffect, useRef, useState } from "react";

if (typeof Highcharts === "object") {
  HighchartsExporting(Highcharts);
}

export default function Chart({
  dataset,
  xAxis,
  yAxis,
  downloadData,
  benchmark,
}) {
  function formatFLOPs(flops, decimals = 2) {
    const parsedFlops = Number(flops);
    if (parsedFlops === 0) return "0 flops";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
      "FLOPs",
      "KFLOPs",
      "MFLOPs",
      "GFLOPs",
      "TFLOPs",
      "PFLOPs",
      "EFLOPs",
      "ZFLOPs",
      "YFLOPs",
    ];

    const i = Math.floor(Math.log(parsedFlops) / Math.log(k));

    return (
      parseFloat((parsedFlops / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    );
  }
  const linearRegressionLine = (x, y) => {
    const xs = [];
    const ys = [];
    for (let i = 0; i < x.length; i++) {
      xs.push(x[i]);
      ys.push(y[i]);
    }
    const n = xs.length;
    const sum_x = xs.reduce((a, b) => a + b, 0);
    const sum_y = ys.reduce((a, b) => a + b, 0);
    const sum_xy = xs.reduce((a, b, i) => a + b * ys[i], 0);
    const sum_xx = xs.reduce((a, b, i) => a + b * b, 0);
    const sum_yy = ys.reduce((a, b, i) => a + b * b, 0);
    const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    const intercept = (sum_y - slope * sum_x) / n;
    const r =
      (n * sum_xy - sum_x * sum_y) /
      Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y));
    const r2 = r * r;
    const x1 = Math.min.apply(null, xs);
    const x2 = Math.max.apply(null, xs);
    const y1 = slope * x1 + intercept;
    const y2 = slope * x2 + intercept;
    return {
      slope,
      intercept,
      r2,
      points: [
        [x1, y1],
        [x2, y2],
      ],
    };
  };
  const scatterData = dataset.map((model) => {
    return {
      x:
        xAxis.column === "GFLOPS"
          ? Math.log10(model[xAxis.column])
          : Number(model[xAxis.column]),
      y:
        yAxis.column === "GFLOPS"
          ? Math.log10(model[yAxis.column])
          : Number(model[yAxis.column]),
      name: model["PROGRAM"],
      color: "#aa3248",
    };
  });

  const plotBands = () =>
    yAxis.column === "ELO"
      ? [
          {
            color: "#F8EEF0",
            label: {
              useHTML: true,
              text: "NOVICE PLAYER <br> (20 kyu - 30 kyu)",
              style: {
                color: "#999999",
              },
            },
            from: -9999999,
            to: 200,
          },
          {
            label: {
              text: "CASUAL PLAYER <br> (10 kyu - 19 kyu)",
              y: -5,

              style: {
                color: "#999999",
              },
            },
            color: "#fff",
            from: 200,
            to: 1200,
          },
          {
            label: {
              text: "INTERMEDIATE PLAYER <br> (1 kyu - 9 kyu)",
              y: -5,
              style: {
                color: "#999999",
              },
            },
            color: "#F8EEF0",
            from: 1200,
            to: 2100,
          },
          {
            label: {
              text: "ADVANCED PLAYER <br> (6 dan - 1 dan)",
              y: -5,
              style: {
                color: "#999999",
              },
            },
            color: "#fff",
            from: 2100,
            to: 2700,
          },
          {
            label: {
              text: "PROFESSIONAL <br> (9 dan - 1 pro)",
              style: {
                color: "#999999",
              },
            },
            color: "#F8EEF0",
            from: 2700,
            to: 9000,
          },
        ]
      : [];

  const lineData = () => {
    const x = dataset.map((model) => {
      if (xAxis.column === "GFLOPS") {
        return Math.log10(model[xAxis.column]);
      }
      return Number(model[xAxis.column]);
    });
    const y = dataset.map((model) => {
      if (yAxis.column === "GFLOPS") {
        return Math.log10(model[yAxis.column]);
      }
      return Number(model[yAxis.column]);
    });
    const lr = linearRegressionLine(x, y);
    return lr.points;
  };
  function getMin() {
    return yAxis.column === "ELO" ? -1500 : undefined;
  }

  const chartOptions = {
    chart: {
      spacingBottom: 25,
      spacingTop: 50,
      height: 600, // 16:9 ratio
      events: {
        render: function () {
          // if (this.labelRender) {
          //   try {
          //     this.labelRender.destroy();
          //   } catch (e) {
          //     console.log(e);
          //   }
          // }
          // let text;
          // if (yAxis.column === "ELO" && xAxis.column === "YEAR") {
          //   text =
          //     '<span class="text-lg text-gray-600">Elo = 37.6 Year + 1111.0</span>';
          // } else if (yAxis.column === "ELO" && xAxis.column === "GFLOPS") {
          //   text =
          //     '<span class="text-lg text-gray-600">Elo = 242.4 log<sub>10</sub> (GFLOPS) + 1078.1</span>';
          // } else if (yAxis.column === "GFLOPS" && xAxis.column === "YEAR") {
          //   text =
          //     '<span class="text-lg text-gray-600">GFLOPS = 10<sup>0.14 Year + 0.44</sup></span>';
          // }
          // if (text) {
          //   this.labelRender = this.renderer
          //     .text(text, this.chartWidth / 3.5, this.chartHeight / 3, true)
          //     .attr({
          //       zIndex: 6,
          //     })
          //     .add();
          //   this.labelRender.attr({
          //     x: this.chartWidth / 3.5,
          //     y: this.chartHeight / 3,
          //   });
          //   this.labelRender.toFront();
          // }
        },

        
      },
    },
    title: {
      text: null,
    },
    subtitle: {
      text: null,
    },
    xAxis: {
      title: {
        enabled: true,
        text: xAxis.name,
        margin: 5,
        style: {
          fontSize: 22,
        },
      },
      minPadding: 0.2,
      maxPadding: 0.06,

      allowDecimals: false,
      labels: {
        style: {
          fontSize: 25,
        },
        useHTML: true,
        formatter: function () {
          if (xAxis.column === "GFLOPS") {
            return `<span class="text-lg">10<sup>${this.value}</sup></span>`;
          }
          return `<span class="text-lg">${this.value}</span>`;
        },
      },
    },
    credits: {
      enabled: true,
      style: {
        margin: 10,
      },
      position: {
        align: "center",
        y: -5,
        x: 25,
      },
      useHTML: true,
      href: "",
      text:
        '<a target="_blank" href="https://arxiv.org/abs/2206.14007">' +
        "Ⓒ The Importance of (Exponentially More) Computing Power, N.C. THOMPSON, S. GE, G.F. MANSO</a>" +
        '',
    },
    yAxis: {
      title: {
        text: yAxis.name,
        // margin: 10,
        style: {
          fontSize: 22,
        },
      },
      gridLineWidth: yAxis.column === "ELO" ? 0 : 1,
      plotBands: plotBands(),
      // allowDecimals: false,
      maxPadding: 0,
      // showLastLabel: false,
      min: yAxis.column === "ELO" ? -1500 : undefined,
      labels: {
        // y: -11,
        x: -5,
        useHTML: true,
        // align: "left",
        formatter: function () {
          if (yAxis.column === "GFLOPS") {
            return `<span class="text-lg">10<sup>${this.value}</sup></span>`;
          }
          return `<span class="text-lg">${this.value}</span>`;
        },
      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      useHTML: true,
      padding: 0,
      formatter: function () {
        const formatAxis = (value, column) => {
          if (column === "GFLOPS") {
            return `<span class="">10<sup>${value.toFixed(2)}</sup></span>`;
          }
          return `<span class="">${value}</span>`;
        };
        return `<div class="bg-white block px-3 py-2 mt-[1px] ml-[1px]"> <b>${
          this.point.name
        }</b><br>${yAxis.name}: ${formatAxis(this.y, yAxis.column)} <br> ${
          xAxis.name
        }: ${formatAxis(this.x, xAxis.column)}</div>`;
      },
    },
    plotOptions: {
      scatter: {
        jitter: {
          x: 0.24,
          y: 0,
        },
        marker: {
          radius: 5,
          states: {
            hover: {
              enabled: true,
              lineColor: "rgb(100,100,100)",
            },
          },
        },
        style: {
          color: "#aa3248",
        },
        states: {
          hover: {
            marker: {
              enabled: false,
            },
          },
        },
      },
    },
    series: [
      {
        type: "scatter",
        name: "Observations",
        data: scatterData,
        marker: {
          radius: 4,
        },
      },
      {
        type: "line",
        name: "Regression Line",
        data: lineData(),
        marker: {
          enabled: false,
        },
        dataLabels: {
          enabled: false,
        },
        states: {
          hover: {
            lineWidth: 0,
          },
        },
        enableMouseTracking: false,
      },
    ],
    exporting: {
      enabled: false,
      allowHTML: true,
      scale: 5,
      sourceWidth: 1200,
      menuItemDefinitions: {
        // Custom definition
        label: {
          onclick: function () {
            downloadData();
          },
          text: "Download data (CSV)",
        },
      },
      buttons: {
        contextButton: {
          menuItems: [
            "viewFullscreen",
            "printChart",
            "separator",
            "downloadPNG",
            "downloadJPEG",
            "downloadPDF",
            "downloadSVG",
            "separator",
            "label",
          ],
        },
      },
    },
  };
  useEffect(() => {
    for (var i = 0; i < Highcharts.charts.length; i++) {
      if (Highcharts.charts[i] !== undefined) {
        Highcharts.charts[i].reflow();
      }
    }
  });

  function ChartFullScreen() {
    const chart = Highcharts.charts.find((chart) => chart !== undefined);
    if (chart) {
      chart.fullscreen.toggle();
    }
  }

  function downloadGraph(format) {
    const chart = Highcharts.charts.find((chart) => chart !== undefined);
    const type = {
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".pdf": "application/pdf",
    }[format];
    if (chart) {
      chart.exportChart(
        {
          type,
          filename: benchmark,
        },
        {
          credits: {
            enabled: true,
            text:
              '<a target="_blank" href="https://arxiv.org/abs/2206.14007">' +
              "Ⓒ The Importance of (Exponentially More) Computing Power, N.C. THOMPSON, S. GE, G.F. MANSO</a>",
          },
        }
      );
    }
  }

  function printGraph() {
    const chart = Highcharts.charts.find((chart) => chart !== undefined);
    if (chart) {
      chart.print();
    }
  }
  const [copied, setCopied] = useState(false);
  async function copyTextToClipboard(text) {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    if ("clipboard" in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand("copy", true, text);
    }
  }

  return (
    <div className="w-full relative">
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      <div className="flex items-center justify-end gap-4 mt-3 px-2 sm:px-0 xl:absolute bottom-0.5 right-0">
      <Menu as={"div"} className="relative">
          {copied && (
            <div className="absolute rounded-lg bottom-full bg-black bg-opacity-70  z-50 font-normal leading-normal w-max max-w-xs text-sm  break-words ">
              <div className="text-white p-2 normal-case">Copied</div>
            </div>
          )}
          <Menu.Button className="flex gap-1 items-center uppercase hover:underline text-[#AA3248] text-sm rounded-lg">
            <ClipboardCopyIcon className="w-4 h-4" /> cite
          </Menu.Button>
          <Menu.Items className="z-10 absolute  w-max origin-top divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {[
              {
                name: "APA",
                text: `Thompson, N. C., Ge, S., & Manso, G. F. (2022). The importance of (exponentially more) computing power. arXiv preprint arXiv:2206.14007.`,
              },
              {
                name: "BibTex",
                text: `@article{thompson2022importance,
  title={The importance of (exponentially more) computing power},
  author={Thompson, Neil C and Ge, Shuning and Manso, Gabriel F},
  journal={arXiv preprint arXiv:2206.14007},
  year={2022}
}`,
              },
            ].map((item, i) => (
              <Menu.Item key={i}>
                {({ active }) => (
                  <button
                    onClick={() => {
                      copyTextToClipboard(item.text);
                    }}
                    className={`${
                      active ? "bg-[#AA3248] text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md  px-2 py-2 text-sm`}
                  >
                    {item.name}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
        <button
          className="flex gap-1 items-center uppercase  hover:underline text-[#AA3248] text-sm rounded-lg"
          onClick={() => ChartFullScreen()}
        >
          <ArrowsExpandIcon className="w-4 h-4" />
          full screen
        </button>

        <Menu as={"div"} className="relative">
          <Menu.Button className="flex gap-1 items-center uppercase hover:underline text-[#AA3248] text-sm rounded-lg">
            <DownloadIcon className="w-4 h-4" /> graph
          </Menu.Button>
          <Menu.Items className="z-10 absolute  w-full origin-top divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {[".png", ".svg", ".pdf"].map((type, i) => (
              <Menu.Item key={i}>
                {({ active }) => (
                  <button
                    onClick={() => {
                      downloadGraph(type);
                    }}
                    className={`${
                      active ? "bg-[#AA3248] text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md  px-2 py-2 text-sm`}
                  >
                    {type}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
        <Menu as={"div"} className="relative">
          <Menu.Button className="flex gap-1 items-center uppercase hover:underline text-[#AA3248] text-sm rounded-lg">
            <DownloadIcon className="w-4 h-4" /> data
          </Menu.Button>
          <Menu.Items className="z-10 absolute  w-full origin-top divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {[".csv", ".xlsx"].map((type, i) => (
              <Menu.Item key={i}>
                {({ active }) => (
                  <button
                    onClick={() => {
                      downloadData(type);
                    }}
                    className={`${
                      active ? "bg-[#AA3248] text-white" : "text-gray-900"
                    } group flex w-full items-center rounded-md  px-2 py-2 text-sm`}
                  >
                    {type}
                  </button>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Menu>
      </div>
    </div>
  );
}
