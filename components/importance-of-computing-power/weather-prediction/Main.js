import { Disclosure, Menu } from "@headlessui/react";
import {
  ChevronDownIcon,
  InformationCircleIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "@heroicons/react/outline";
import { createRef, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Chart from "./Chart";
import * as XLSX from "xlsx/xlsx.mjs";

const Tooltip = ({ children, position }) => {
  const [popoverShow, setPopoverShow] = useState(false);
  const pos = position || "bottom-left";
  const openTooltip = () => {
    setPopoverShow(true);
  };
  const closeTooltip = () => {
    setPopoverShow(false);
  };
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full text-center relative">
          <InformationCircleIcon
            onMouseEnter={openTooltip}
            onMouseLeave={closeTooltip}
            className="w-4 h-4 "
          />
          <div
            className={
              (pos.includes("right") ? " -left-3/4 " : " -right-3/4 ") +
              (pos.includes("top") ? " bottom-full " : " top-full ") +
              (popoverShow ? "" : "hidden ") +
              "absolute rounded-lg bg-black bg-opacity-70  z-50 font-normal leading-normal w-max max-w-xs text-sm  break-words "
            }
          >
            <div className="text-white p-2 normal-case">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function Main({ dataset, accuracyTypes }) {
  const router = useRouter();
  const benchmark = {
    name: "Weather Prediction (NOAA)",
    range: "weather-prediction",
  };

  // ============================================================

  const charts = [
    {
      title: "Mean Absolute Error vs. Year",
      x: {
        name: "Year",
        column: "YEAR",
      },
      y: {
        name: "Mean Absolute Error (Degrees ºF)",
        column: "MEAN",
      },
    },
    {
      title: "Computing Power vs. Year",
      x: {
        name: "Year",
        column: "YEAR",
      },
      y: {
        name: "Computing Power (GFlops)",
        column: "GFLOPS",
      },
    },
    {
      title: "Mean Absolute Error vs. Computing Power",
      y: {
        name: "Mean Absolute Error (Degrees ºF)",
        column: "MEAN",
      },
      x: {
        name: "Computing Power (GFlops)",
        column: "GFLOPS",
      },
    },
  ];

  const [chart, setChart] = useState(charts[0]);
  const [xAxis, setXAxis] = useState(charts[0].x);
  const [yAxis, setYAxis] = useState(charts[0].y);
  const [sortBy, setSortBy] = useState({
    type: "asc",
    column: "YEAR",
  });

  function selectChart(chart) {
    setChart(chart);
    setXAxis(chart.x);
    setYAxis(chart.y);
  }

  const [showMore, setShowMore] = useState(false);
  //   ==============================================================

  const [filteredDataset, setFilteredDataset] = useState(dataset);
  const requestSort = useCallback(
    function (column) {
      setSortBy({
        column,
        type:
          sortBy.type === "desc" && sortBy.column === column ? "asc" : "desc",
      });

      setFilteredDataset(
        [...dataset].sort((a, b) => {
          const Acolumn = Number(a[column]) || a[column];
          const Bcolumn = Number(b[column]) || b[column];
          const A =
            typeof Acolumn === "string"
              ? Acolumn.toLowerCase().trim()
              : Acolumn;
          const B =
            typeof Bcolumn === "string"
              ? Bcolumn.toLowerCase().trim()
              : Bcolumn;
          if (A === null || A === undefined || A === "" || A === NaN) {
            return 1;
          }
          if (B === null || B === undefined || B === "" || B === NaN) {
            return -1;
          }
          if (A < B) {
            return sortBy.type === "asc" ? 1 : -1;
          }
          if (A > B) {
            return sortBy.type === "asc" ? -1 : 1;
          }
          return 0;
        })
      );
    },
    [dataset, sortBy]
  );
  useEffect(() => {
    requestSort("YEAR");
  }, []);
  // ==============================================================
  function downloadData(format) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataset);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    if (format === ".xlsx") {
      window.open('https://docs.google.com/spreadsheets/d/1b3yTYqPCk3Q_7iLtYMJj3g0G7pyJIX2tNn4eeQnidiU/export?format=xlsx&id=1b3yTYqPCk3Q_7iLtYMJj3g0G7pyJIX2tNn4eeQnidiU', '_blank');
    } else {
      XLSX.writeFile(wb, `${benchmark.name}.csv`);
    }
  }

  function formatUnit(value, unit, decimals = 2) {
    const parsedValue = Number(value) * Math.pow(10, 9);
    if (parsedValue === 0) return "0 flops";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [
      unit,
      "K" + unit,
      "M" + unit,
      "G" + unit,
      "T" + unit,
      "P" + unit,
      "E" + unit,
      "Z" + unit,
      "Y" + unit,
    ];

    let i = Math.floor(Math.log(parsedValue) / Math.log(k));
    if (i < 0) i = 0;
    return (
      parseFloat((parsedValue / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
    );
  }

  //   ==============================================================

  return (
    <main className="flex-grow  mb-16">
      <div className="max-w-7xl mx-auto pb-6 sm:px-6 lg:px-8 mt-10">
        {/* Replace with your content */}
        <div>
          <h1 className="text-xl font-bold text-center text-gray-900">
            {benchmark.name}
          </h1>
          <div className="hidden sm:flex  justify-center items-center gap-2  mt-5">
            <Menu as="div" className="w-auto relative">
              <Menu.Button className="inline-flex w- justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-200 focus-visible:ring-opacity-75">
                <div className="flex flex-col items-start">
                  <span className="text-xs font-light">Chart:</span>
                  <div className="flex items-center ">
                    <span className="text-md "> {chart.title}</span>
                    <ChevronDownIcon
                      className="ml-2 -mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </Menu.Button>

              <Menu.Items className="z-10 absolute left-0 mt-2 w-max origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1 ">
                  {charts.map((option, index) => (
                    <Menu.Item key={index}>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            selectChart(option);
                          }}
                          className={`${
                            active ? "bg-[#AA3248] text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-md  px-2 py-2 text-sm`}
                        >
                          {option.title}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Menu>
          </div>
          <div className="hidden sm:block">
            {filteredDataset.length > 2 ? (
              <Chart
                dataset={dataset}
                benchmark={`${benchmark.name}`}
                xAxis={xAxis}
                yAxis={yAxis}
                downloadData={downloadData}
              />
            ) : (
              <div className="mt-8 text-center bg-slate-50 py-16">
                <p className="text-gray-900 ">
                  Not enough data is available for this benchmark. Try changing
                  the axes.
                </p>
              </div>
            )}
          </div>

          <div className=" shadow-md sm:rounded-lg mt-8">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="sticky top-0 text-xs table-fixed text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th rowSpan="2" scope="col" className="px-6 py-3  sm:w-1/8">
                    <button
                      className="flex items-center uppercase gap-2  w-full justify-center  text-center"
                      onClick={() => requestSort("YEAR")}
                    >
                      <p>YEAR</p>
                      {sortBy.column === "YEAR" &&
                        (sortBy.type === "asc" ? (
                          <SortAscendingIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <SortDescendingIcon className="h-4 w-4 text-gray-300" />
                        ))}
                    </button>
                  </th>
                  <th
                    colSpan={5}
                    scope="col"
                    className="hidden sm:table-cell pt-3  w-full justify-center  text-center sm:w-5/8"
                  >
                    Mean absolute error (Degrees ºF)
                  </th>

                  <th
                    scope="col"
                    rowSpan="2"
                    className="hidden sm:table-cell px-6 py-3 w-2/8"
                  >
                    <button
                      className="flex items-center uppercase gap-2  w-full justify-center  text-center"
                      onClick={() => requestSort("GFLOPS")}
                    >
                      <div className="flex gap-1">
                        <p className="whitespace-nowrap">COMPUTING POWER</p>

                        <Tooltip position="bottom-left">
                          This measurement is about the functionality of the
                          whole system, not the computation needed for a
                          particular task.
                        </Tooltip>
                      </div>
                      {sortBy.column === "GFLOPS" &&
                        (sortBy.type === "asc" ? (
                          <SortAscendingIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <SortDescendingIcon className="h-4 w-4 text-gray-300" />
                        ))}
                    </button>
                  </th>
                </tr>
                <tr>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 ">
                    <button
                      className="flex items-center uppercase gap-2  w-full justify-center  text-center"
                      onClick={() => requestSort("DAY 3")}
                    >
                      <p>DAY 3</p>
                      {sortBy.column === "DAY 3" &&
                        (sortBy.type === "asc" ? (
                          <SortAscendingIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <SortDescendingIcon className="h-4 w-4 text-gray-300" />
                        ))}
                    </button>
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 ">
                    <button
                      className="flex items-center uppercase gap-2  w-full justify-center  text-center"
                      onClick={() => requestSort("DAY 4")}
                    >
                      <p>DAY 4</p>
                      {sortBy.column === "DAY 4" &&
                        (sortBy.type === "asc" ? (
                          <SortAscendingIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <SortDescendingIcon className="h-4 w-4 text-gray-300" />
                        ))}
                    </button>
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 ">
                    <button
                      className="flex items-center uppercase gap-2  w-full justify-center  text-center"
                      onClick={() => requestSort("DAY 5")}
                    >
                      <p>DAY 5</p>
                      {sortBy.column === "DAY 5" &&
                        (sortBy.type === "asc" ? (
                          <SortAscendingIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <SortDescendingIcon className="h-4 w-4 text-gray-300" />
                        ))}
                    </button>
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 ">
                    <button
                      className="flex items-center uppercase gap-2  w-full justify-center  text-center"
                      onClick={() => requestSort("DAY 6")}
                    >
                      <p>DAY 6</p>
                      {sortBy.column === "DAY 6" &&
                        (sortBy.type === "asc" ? (
                          <SortAscendingIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <SortDescendingIcon className="h-4 w-4 text-gray-300" />
                        ))}
                    </button>
                  </th>
                  <th scope="col" className="hidden sm:table-cell px-6 py-3 ">
                    <button
                      className="flex items-center uppercase gap-2  w-full justify-center  text-center"
                      onClick={() => requestSort("DAY 7")}
                    >
                      <p>DAY 7</p>
                      {sortBy.column === "DAY 7" &&
                        (sortBy.type === "asc" ? (
                          <SortAscendingIcon className="h-4 w-4 text-gray-300" />
                        ) : (
                          <SortDescendingIcon className="h-4 w-4 text-gray-300" />
                        ))}
                    </button>
                  </th>
                  <th scope="col" className="table-cell sm:hidden px-6 py-3">
                    <span className="sr-only">open</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDataset.length > 0 ? (
                  (showMore
                    ? filteredDataset
                    : filteredDataset.slice(0, 10)
                  ).map((data, index) => (
                    <Disclosure key={index}>
                      {({ open }) => (
                        <>
                          <tr className="border-b   bg-gray-50  ">
                            <td
                              scope="row"
                              className="px-6 py-2 text-center whitespace-pre-wrap"
                            >
                              {data["YEAR"] || "-"}
                            </td>
                            <td className="hidden sm:table-cell text-center px-6 py-2">
                              {data["DAY 3"] || "-"}
                            </td>
                            <td className="hidden sm:table-cell text-center px-6 py-2">
                              {data["DAY 4"] || "-"}
                            </td>
                            <td className="hidden sm:table-cell text-center px-6 py-2">
                              {data["DAY 5"] || "-"}
                            </td>
                            <td className="hidden sm:table-cell text-center px-6 py-2">
                              {data["DAY 6"] || "-"}
                            </td>
                            <td className="hidden sm:table-cell text-center px-6 py-2">
                              {data["DAY 7"] || "-"}
                            </td>

                            <td className="hidden sm:table-cell text-center px-6 py-2 whitespace-nowrap">
                              {data["GFLOPS"]
                                ? formatUnit(data["GFLOPS"], "Flops")
                                : "-"}
                            </td>
                            <td className="table-cell sm:hidden px-6 py-2 text-right">
                              <Disclosure.Button className="py-2">
                                {open ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M18 12H6"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                  </svg>
                                )}
                              </Disclosure.Button>
                            </td>
                          </tr>
                          <Disclosure.Panel as="tr" className="   bg-white  ">
                            <td colSpan="7">
                              <div className="border-x-[#AA3248] border-x-2 p-6 sm:grid sm:grid-cols-2 gap-8">
                                <div className="flex flex-col sm:flex-row gap-x-8 gap-y-2 mt-1">
                                  <div>
                                    <p className="text-xs">DAY 3</p>
                                    <p className="text-gray-900 flex flex-wrap gap-1">
                                      {data["DAY 3"] || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs">DAY 4</p>
                                    <p className="text-gray-900 flex flex-wrap gap-1">
                                      {data["DAY 4"] || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs">DAY 5</p>
                                    <p className="text-gray-900 flex flex-wrap gap-1">
                                      {data["DAY 5"] || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs">DAY 6</p>
                                    <p className="text-gray-900 flex flex-wrap gap-1">
                                      {data["DAY 6"] || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs">DAY 7</p>
                                    <p className="text-gray-900 flex flex-wrap gap-1">
                                      {data["DAY 7"] || "-"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs">Computing Power</p>
                                    <p className="text-gray-900 flex flex-wrap gap-1">
                                      {data["GFLOPS"]
                                        ? formatUnit(data["GFLOPS"], "Flops")
                                        : "-"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))
                ) : (
                  <tr className="text-center">
                    <td colSpan="5" className="text-gray-900 py-2">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredDataset.length > 10 && (
            <div className="flex items-center mt-8 justify-center">
              <button
                className="bg-gray-100 flex gap-1 text-sm text-gray-900 px-3 py-2 rounded-lg focus:ring-2 outline-none  focus:ring-gray-100 ring-offset-1 ring-opacity-25"
                onClick={() => setShowMore(!showMore)}
              >
                {showMore ? "Show less" : "Show more"}
              </button>
            </div>
          )}
        </div>
        {/* /End replace */}
      </div>
      <div className="max-w-screen-xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-black rounded-lg shadow-xl overflow-hidden lg:grid lg:grid-cols-2 lg:gap-4">
          <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
            <div className="lg:self-center">
              <h2 className="text-3xl leading-9 font-extrabold text-white sm:text-4xl sm:leading-10">
                <span className="block">Want to contribute?</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-gray-200">
                You have access to our database where you can point out any
                errors or suggest changes
              </p>
              <a
                href="https://docs.google.com/spreadsheets/d/14YFYHXBeUwqnD00X57LaIXETEukPHCMRfor30ictSJI/edit#gid=2082539277"
                rel="noopener noreferrer"
                target="_blank"
                className="mt-8 bg-white border border-transparent rounded-md shadow px-6 py-3 inline-flex items-center text-base leading-6 font-medium text-[#AA3248] hover:text-[#8a283a] hover:bg-gray-50 transition duration-150 ease-in-out"
              >
                Go to database
              </a>
            </div>
          </div>
          <div className="relative pb-3/5 -mt-6 md:pb-1/2">
            <img
              className="absolute inset-0 w-full h-full transform translate-x-6 translate-y-6 rounded-md object-cover object-left-top sm:translate-x-16 lg:translate-y-20"
              src="/database.jpg"
              alt="App screenshot"
            />
          </div>
        </div>
      </div>
    </main>
  );
}