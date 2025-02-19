/* eslint-disable @typescript-eslint/no-unused-vars */
import "ol/ol.css";
import { RControl, RLayerTile, RMap } from "rlayers";
//@ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'ROSM'.
import { RView } from "rlayers/RMap";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import environment from "@/environments";
import { Button } from "@/components/ui/button";
import { ArrowBack } from "@/components/icons/arrow-back";
import { useNavigate } from "react-router-dom";
import { SearchIcon, XIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { parseBox } from "@/lib/parseBox";
import { Separator } from "@/components/ui/separator";
import {
  Q1DashboardData,
  Q1Top10BySubUnit,
  Q1Totals,
  Q1SearchResults,
  Q2SearchResults,
  Q2Totals,
  Q2Top10BySubUnit,
  Q2DashboardData,
  Q2Data,
  Q3SearchResults,
  Q3Totals,
  Q3DashboardData,
  Q3Data,
  Q4SearchResults,
  Q4Data,
  Q4DashboardData,
  Q4HistoricalData,
} from "@/interfaces";
import Q1Map from "@/components/q1-map";
import Q2Map from "@/components/q2-map";
import Q1Dashboard from "@/components/q1-dashboard";
import DashboardBarChart from "@/components/dashboard-bar-chart";
import Q1SearchMatrix from "@/components/q1-search-matrix";
import DashboardSkeleton from "@/components/dashboard-skeleton";
import DashboardStart from "@/components/dashboard-start";
import DropdownCustomizeDataDisplay from "@/components/dropdown-customize-data-display";
import DropdownExportData from "@/components/dropdown-export-data";
import Q2SearchMatrix from "@/components/q2-search-matrix";
import Q3SearchMatrix from "@/components/q3-search-matrix";
import Q2Dashboard from "@/components/q2-dashboard";
import Q3Map from "@/components/q3-map";
import Q3Dashboard from "@/components/q3-dashboard";
import { DashboardTable } from "@/components/dashboard-table";
import Q4SearchMatrix from "@/components/q4-search-matrix";
import Q4Map from "@/components/q4-map";
import Q4Dashboard from "@/components/q4-dashboard";
import DashboardLineChart from "@/components/dashboard-line-chart";

export default function EconomicData() {
  const mapRef = useRef<RMap>(null);
  const [search, setSearch] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);

  const [q1SearchResults, setQ1SearchResults] = useState<Q1SearchResults>({
    length: null,
    time: { years: [2019, 2020, 2021, 2022] },
    intensity: {
      variable: "emp",
      order: "desc",
    },
    breadth: null,
  });
  const [q2SearchResults, setQ2SearchResults] = useState<Q2SearchResults>({
    length: null,
    time: null,
    intensity: {
      variable: "aprox_emp",
      order: "desc",
    },
    breadth: {
      naics: "31---",
    },
  });
  const [q3SearchResults, setQ3SearchResults] = useState<Q3SearchResults>({
    place: null,
    length: null,
    time: null,
    intensity: {
      variable: "ratio",
      order: "desc",
    },
    breadth: null,
  });
  const [q4SearchResults, setQ4SearchResults] = useState<Q4SearchResults>({
    length: null,
    time: { years: [2019, 2020, 2021, 2022] },
    intensity: {
      variable: "perc_gross_income_as_full_market_value",
      order: "desc",
    },
    breadth: null,
  });
  const [isSearching, setIsSearching] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [q1DashboardData, setQ1DashboardData] = useState<
    Q1DashboardData | undefined
  >();
  const [q2DashboardData, setQ2DashboardData] = useState<
    Q2DashboardData | undefined
  >();
  const [q3DashboardData, setQ3DashboardData] = useState<
    Q3DashboardData | undefined
  >();
  const [q4DashboardData, setQ4DashboardData] = useState<
    Q4DashboardData | undefined
  >();

  const navigate = useNavigate();

  function handleSearch(e: FormEvent<HTMLInputElement>) {
    setSearch(e.currentTarget.value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    setLoading(true);

    debounceTimeout.current = setTimeout(() => {
      setLoading(false);
    }, 500);
  }

  function clearSearch(e?: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (e) e.preventDefault();
    setSearch("");
    setShowDashboard(false);
    setIsSearching(false);
    setQ1DashboardData(undefined);
    setQ2DashboardData(undefined);
  }

  function handleGoBack() {
    navigate(-1);
  }

  function whatDashboardToRender(search: string) {
    search = search.toLowerCase();

    if (
      search.includes("dc") &&
      search.includes("congressional district") &&
      search.includes("economic data")
    )
      return "q1";

    if (
      search.includes("new york") &&
      search.includes("manufacturing economic data") &&
      search.includes("1st congressional district")
    )
      return "q2";

    if (
      search.includes("dc") &&
      search.includes("jobs per housing unit stats") &&
      search.includes("ward")
    )
      return "q3";

    if (
      search.includes("nyc") &&
      search.includes("lowest gross income per full market value") &&
      search.includes("borough block")
    )
      return "q4";

    return undefined;
  }

  const dashboardKey = whatDashboardToRender(search);

  const buildDashboardQ1 = useCallback(async () => {
    async function fetchData() {
      try {
        const q1Totals: Q1Totals[] = await fetch(
          environment.urlRest +
            `/rpc/get_total_emp_est_by_district_and_years?district_id=1&years_set={${q1SearchResults.time.years.join(
              ","
            )}}`
        ).then((res) => res.json());

        const q1Top10BySubUnit: Q1Top10BySubUnit[] = await fetch(
          environment.urlRest +
            `/rpc/get_top_10_zip_codes?district_id=1&years_set={${q1SearchResults.time.years.join(
              ","
            )}}&variable=${
              q1SearchResults.intensity.variable
            }&order_direction=${q1SearchResults.intensity.order}`
        ).then((res) => res.json());

        const boundingBox: number[] = await fetch(
          environment.urlRest + `/rpc/get_q1_extent`
        ).then(async (res) => parseBox(await res.text()));

        const choropleticData = await fetch(
          environment.urlRest + `/rpc/get_min_max_emp_est`
        ).then(async (res) => res.json());

        const coverage = await fetch(
          environment.urlRest +
            `/rpc/q1_area_coverage_by_subunits?district_id=1`
        ).then(async (res) => res.json());

        setQ1DashboardData({
          q1Totals: q1Totals,
          q1Top10BySubUnit: q1Top10BySubUnit,
          boundingBox: boundingBox,
          choroplethicData: {
            minEmp: choropleticData[0].min_emp,
            maxEmp: choropleticData[0].max_emp,
            minEst: choropleticData[0].min_est,
            maxEst: choropleticData[0].max_est,
          },
          chartInfo: "",
          coverage: coverage,
        });

        return {
          q1Totals: q1Totals,
          q1Top10BySubUnit: q1Top10BySubUnit,
          boundingBox: boundingBox,
        };
      } catch (error) {
        console.error(error);
      }
    }

    setLoading(true);
    setIsSearching(false);
    setShowDashboard(true);
    const data = await fetchData();
    if (mapRef.current && data?.boundingBox) {
      mapRef.current.ol.getView().fit(data?.boundingBox, {
        size: mapRef.current.ol.getSize(),
        duration: 1000,
        padding: [50, 50, 50, 50],
      });
    }
    setLoading(false);
  }, [q1SearchResults]);

  const buildDashboardQ2 = useCallback(async () => {
    async function fetchData() {
      try {
        const q2Totals: Q2Totals[] = await fetch(
          environment.urlRest +
            `/rpc/get_total_emp_est_by_district_and_naics_in_nys?district_id=1&naics_code=${q2SearchResults.breadth.naics}`
        ).then((res) => res.json());

        const q2Top10BySubUnit: Q2Top10BySubUnit[] = await fetch(
          environment.urlRest +
            `/rpc/get_top_10_zip_codes_nys_by_district_id_naics_code?district_id=1&naics_code=${q2SearchResults.breadth.naics}&variable=${q2SearchResults.intensity.variable}&order_direction=${q2SearchResults.intensity.order}`
        ).then((res) => res.json());

        const boundingBox: number[] = await fetch(
          environment.urlRest + `/rpc/get_q2_extent`
        ).then(async (res) => parseBox(await res.text()));

        const choropleticData = await fetch(
          environment.urlRest +
            `/rpc/get_min_max_emp_est_by_district_and_naics_code_in_nys?district_id=1&naics_code=${q2SearchResults.breadth.naics}`
        ).then(async (res) => res.json());

        const q2Data: Q2Data[] = await fetch(
          environment.urlRest +
            `/q2_zip_code_econ_data_with_geojson?id_q2_nys_congressional_districts=eq.1&naics=ilike.*${q2SearchResults.breadth.naics}*&limit=100`
        ).then(async (res) => res.json());

        const coverage: number = await fetch(
          environment.urlRest +
            `/rpc/q2_area_coverage_by_subunits?naics_code=${q2SearchResults.breadth.naics}&district_id=1`
        ).then(async (res) => res.json());

        setQ2DashboardData({
          q2Totals: q2Totals,
          q2Top10BySubUnit: q2Top10BySubUnit,
          q2Data: q2Data,
          boundingBox: boundingBox,
          choroplethicData: {
            minEmp: choropleticData[0].min_emp,
            maxEmp: choropleticData[0].max_emp,
            minEst: choropleticData[0].min_est,
            maxEst: choropleticData[0].max_est,
          },
          chartInfo: "",
          coverage: coverage,
        });

        return {
          q1Totals: q2Totals,
          q1Top10BySubUnit: q2Top10BySubUnit,
          boundingBox: boundingBox,
        };
      } catch (error) {
        console.error(error);
      }
    }

    setLoading(true);
    setIsSearching(false);
    setShowDashboard(true);
    const data = await fetchData();
    if (mapRef.current && data?.boundingBox) {
      mapRef.current.ol.getView().fit(data?.boundingBox, {
        size: mapRef.current.ol.getSize(),
        duration: 1000,
        padding: [50, 50, 50, 50],
      });
    }
    setLoading(false);
  }, [q2SearchResults]);

  const buildDashboardQ3 = useCallback(async () => {
    async function fetchData() {
      try {
        const q3Totals: Q3Totals[] = await fetch(
          environment.urlRest +
            `/rpc/get_total_emp_and_housing_in_dc_by_ward?ward_identifier=${q3SearchResults.place}`
        ).then((res) => res.json());

        const boundingBox: number[] = await fetch(
          environment.urlRest +
            `/rpc/get_q3_extent?ward_identifier=${q3SearchResults.place}`
        ).then(async (res) => parseBox(await res.text()));

        const choropleticData = await fetch(
          environment.urlRest +
            `/rpc/get_min_max_emp_housing_ratio_on_zip_code_by_ward?ward_identifier=${q3SearchResults.place}`
        ).then(async (res) => res.json());

        const q3Data: Q3Data[] = await fetch(
          environment.urlRest +
            `/q3_dc_zip_codes_est_jobs_wards?ward_name=eq.${q3SearchResults.place}&select=zip,name,emp`
        ).then(async (res) => res.json());

        const coverage: number = await fetch(
          environment.urlRest +
            `/rpc/q3_area_coverage_by_subunits?ward_identifier=${q3SearchResults.place}`
        ).then(async (res) => res.json());

        setQ3DashboardData({
          q3Totals: q3Totals,
          q3Data: q3Data,
          boundingBox: boundingBox,
          choroplethicData: {
            minRatio: choropleticData[0].min_ratio,
            maxRatio: choropleticData[0].max_ratio,
          },
          chartInfo: "",
          coverage: coverage,
        });

        return {
          boundingBox: boundingBox,
        };
      } catch (error) {
        console.error(error);
      }
    }

    setLoading(true);
    setIsSearching(false);
    setShowDashboard(true);
    const data = await fetchData();
    if (mapRef.current && data?.boundingBox) {
      mapRef.current.ol.getView().fit(data?.boundingBox, {
        size: mapRef.current.ol.getSize(),
        duration: 1000,
        padding: [50, 50, 50, 50],
      });
    }
    setLoading(false);
  }, [q3SearchResults]);

  const buildDashboardQ4 = useCallback(async () => {
    async function fetchData() {
      try {
        const q4Data: Q4Data[] = await fetch(
          environment.urlRest +
            `/q4_nyc_boro_block_economic_data?order=perc_gross_income_as_full_market_value.${q4SearchResults.intensity.order}.nullslast&limit=1`
        ).then((res) => res.json());

        const q4HistoricalData: Q4HistoricalData[] = await fetch(
          environment.urlRest +
            `/rpc/get_perc_gross_income_as_full_market_value_over_the_years?borough_id=${q4Data[0].borough}&block_id=${q4Data[0].block}`
        ).then((res) => res.json());

        const boundingBox: number[] = await fetch(
          environment.urlRest + `/rpc/get_q4_extent?block_uid=${q4Data[0].uid}`
        ).then(async (res) => parseBox(await res.text()));

        const choropleticData = await fetch(
          environment.urlRest + `/rpc/get_min_max_boro_block_perc_in_nyc`
        ).then(async (res) => res.json());

        setQ4DashboardData({
          q4Data: q4Data,
          q4HistoricalData: q4HistoricalData,
          boundingBox: boundingBox,
          choroplethicData: {
            minPerc:
              choropleticData[0].min_perc_gross_income_as_full_market_value,
            maxPerc:
              choropleticData[0].max_perc_gross_income_as_full_market_value,
          },
          coverage: 1,
        });

        return {
          boundingBox: boundingBox,
        };
      } catch (error) {
        console.error(error);
      }
    }

    setLoading(true);
    setIsSearching(false);
    setShowDashboard(true);
    const data = await fetchData();
    if (mapRef.current && data?.boundingBox) {
      mapRef.current.ol.getView().fit(data?.boundingBox, {
        size: mapRef.current.ol.getSize(),
        duration: 1000,
        padding: [50, 50, 50, 50],
      });
    }
    setLoading(false);
  }, [q4SearchResults]);

  const buildDashboard = useCallback(
    async (key: string | undefined) => {
      if (!key) return;
      if (key === "q1") {
        await buildDashboardQ1();
      }
      if (key === "q2") {
        await buildDashboardQ2();
      }
      if (key === "q3") {
        await buildDashboardQ3();
      }
      if (key === "q4") {
        await buildDashboardQ4();
      }
    },
    [buildDashboardQ1, buildDashboardQ2, buildDashboardQ3, buildDashboardQ4]
  );

  useEffect(() => {
    const dashQ1Key = "dc economic data congressional district";
    const dashQ2Key =
      "new york manufacturing economic data 1st congressional district";
    const dashQ3Key = "dc jobs per housing unit stats ward 1";
    const dashQ4Key =
      "nyc lowest gross income per full market value borough block";

    if (dashQ1Key.includes(search) || search === "query 1") {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ1Key));
      setSearchSuggestions((prev) => [...prev, dashQ1Key]);
    } else {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ1Key));
    }
    if (dashQ2Key.includes(search) || search === "query 2") {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ2Key));
      setSearchSuggestions((prev) => [...prev, dashQ2Key]);
    } else {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ2Key));
    }
    if (dashQ3Key.includes(search) || search === "query 3") {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ3Key));
      setSearchSuggestions((prev) => [...prev, dashQ3Key]);
    } else {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ3Key));
    }
    if (dashQ4Key.includes(search) || search === "query 4") {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ4Key));
      setSearchSuggestions((prev) => [...prev, dashQ4Key]);
    } else {
      setSearchSuggestions((prev) => prev.filter((item) => item !== dashQ4Key));
    }

    const down = (e: KeyboardEvent) => {
      if ((e.key === "f" || e.key === "k") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearching((isSearching) => !isSearching);
      }

      if (e.key === "Escape" && isSearching) {
        e.preventDefault();
        clearSearch();
      }

      if (e.key === `Enter` && isSearching) {
        buildDashboard(dashboardKey);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [buildDashboard, dashboardKey, isSearching, search]);

  const shouldShowSuggestions =
    search !== "" &&
    search !== undefined &&
    searchSuggestions &&
    searchSuggestions.length > 0 &&
    (searchSuggestions.length !== 1 || searchSuggestions[0] !== search);

  const coverage =
    Math.floor(
      ((dashboardKey === "q1"
        ? q1DashboardData?.coverage
        : dashboardKey === "q2"
        ? q2DashboardData?.coverage
        : dashboardKey === "q3"
        ? q3DashboardData?.coverage
        : dashboardKey === "q4"
        ? q4DashboardData?.coverage
        : 0) || 0) * 10000
    ) / 100;

  return (
    <div className="flex flex-row w-[100vw] min-h-full">
      <div className="w-full h-[100vh] justify-center z-10">
        <RMap
          ref={mapRef}
          initial={{
            center: [-11087207.298375694, 4659260.145017052],
            zoom: 4.013145380694064,
            resolution: 9695.196372827555,
          }}
          height={"100%"}
          width={"100%"}
          noDefaultControls
        >
          <RLayerTile url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          {dashboardKey === "q1" && (
            <Q1Map
              key={`q1-map`}
              dashboardData={q1DashboardData}
              searchResults={q1SearchResults}
            />
          )}
          {dashboardKey === "q2" && (
            <Q2Map
              key={`q2-map`}
              dashboardData={q2DashboardData}
              searchResults={q2SearchResults}
            />
          )}
          {dashboardKey === "q3" && (
            <Q3Map
              key={`q3-map`}
              dashboardData={q3DashboardData}
              searchResults={q3SearchResults}
            />
          )}
          {dashboardKey === "q4" && (
            <Q4Map
              key={`q4-map`}
              dashboardData={q4DashboardData}
              searchResults={q4SearchResults}
            />
          )}
          <RControl.RCustom
            className={`top-[15px] left-[15px] min-w-full flex flex-row bg-transparent gap-[15px] `}
          >
            <Button
              className="p-2 w-[36px] h-[36px] flex justify-center"
              onClick={handleGoBack}
            >
              <ArrowBack className="h-4 w-4" />
            </Button>
            <Dialog
              open={isSearching}
              onOpenChange={() => setIsSearching(!isSearching)}
            >
              <DialogTitle className="sr-only">Search by anything</DialogTitle>
              <DialogTrigger className="min-w-full pr-[90px] bg-transparent hover:outline-none outline-none h-full">
                <div className="w-full h-full flex flex-row gap-2 justify-center">
                  <div
                    className={` bg-slate-100 hover:bg-slate-200 hover:bg-opacity-90 transition-all duration-150
                     border-slate-400 rounded-lg shadow w-full md:w-2/3 lg:w-1/3 ${
                       search ? "w-auto" : ""
                     }
                     hover:shadow-sm hover:outline-1 outline-1 pr-4 pl-4 pt-2 pb-2 m-[1px]
                     text-sm font-light text-left italic flex flex-row items-center gap-2 min-h-full`}
                  >
                    <SearchIcon className="h-4 w-4 text-slate-600" />
                    {!search && "Search by anything (Ctrl + F or K)"}
                    {search && (
                      <p className="font-light text-left italic text-slate-600 leading-tight w-full text-nowrap truncate">
                        Searching by "{search}"
                      </p>
                    )}
                    {search && (
                      <div
                        onClick={clearSearch}
                        className="hover:cursor-pointer"
                      >
                        <XIcon className="h-4 w-4 text-slate-600 hover:text-gray-900" />
                      </div>
                    )}
                  </div>
                  {showDashboard && (
                    <Button className="w-auto"> Modify Filters</Button>
                  )}
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[90%] md:max-w-2/3  w-[90%] md:w-2/3">
                <DialogHeader>
                  <DialogDescription className="flex flex-col gap-0">
                    <Input
                      placeholder="Search by anything"
                      value={search}
                      onInput={handleSearch}
                      autoFocus
                      className="text-nowrap"
                    />
                    <div className="w-full h-full">
                      {shouldShowSuggestions &&
                        searchSuggestions.map((suggestion) => (
                          <div
                            className="w-full pl-3 pr-3 pt-1 pb-1 truncate hover:bg-gray-700 hover:cursor-pointer"
                            onClick={() => setSearch(suggestion)}
                          >
                            {suggestion}
                          </div>
                        ))}
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center min-w-[50vw]">
                  {loading && !dashboardKey && (
                    <Skeleton className="min-w-[100%] w-full h-[500px]" />
                  )}
                  {dashboardKey === "q1" && (
                    <Q1SearchMatrix
                      buildDashboard={() => buildDashboard(dashboardKey)}
                      setSearchResults={setQ1SearchResults}
                      searchResults={q1SearchResults}
                    />
                  )}
                  {dashboardKey === "q2" && (
                    <Q2SearchMatrix
                      buildDashboard={() => buildDashboard(dashboardKey)}
                      setSearchResults={setQ2SearchResults}
                      searchResults={q2SearchResults}
                    />
                  )}
                  {dashboardKey === "q3" && (
                    <Q3SearchMatrix
                      buildDashboard={() => buildDashboard(dashboardKey)}
                      searchString={search || ""}
                      setSearchResults={setQ3SearchResults}
                      searchResults={q3SearchResults}
                    />
                  )}
                  {dashboardKey === "q4" && (
                    <Q4SearchMatrix
                      buildDashboard={() => buildDashboard(dashboardKey)}
                      searchString={search || ""}
                      setSearchResults={setQ4SearchResults}
                      searchResults={q4SearchResults}
                    />
                  )}
                  {!dashboardKey && dashboardKey && <></>}
                </div>
              </DialogContent>
            </Dialog>
          </RControl.RCustom>
          <RControl.RCustom className="right-0 w-4 bg-primary-foreground h-full rounded-r-none rounded-l-lg shadow-lg shadow-black flex justify-center items-center"></RControl.RCustom>
        </RMap>
      </div>
      <div
        className={`${
          showDashboard ? "w-[50vw] min-w-[50vw]" : "w-[200px] min-w-[200px]"
        } transition-all duration-200 flex flex-col justify-center z-20  bg-primary-foreground`}
      >
        {!showDashboard && <DashboardStart />}
        {showDashboard && loading && <DashboardSkeleton />}
        {showDashboard && !loading && (
          <div className="w-full flex flex-col justify-between items-center pt-4 pb-4 max-h-[100vh] h-[100vh] overflow-y-auto">
            {showDashboard && q1DashboardData && dashboardKey === `q1` && (
              <Q1Dashboard
                dashboardData={q1DashboardData}
                searchResults={q1SearchResults}
              />
            )}

            {showDashboard && q2DashboardData && dashboardKey === `q2` && (
              <Q2Dashboard
                dashboardData={q2DashboardData}
                searchResults={q2SearchResults}
              />
            )}

            {showDashboard && q3DashboardData && dashboardKey === `q3` && (
              <Q3Dashboard
                dashboardData={q3DashboardData}
                searchResults={q3SearchResults}
              />
            )}

            {showDashboard && q4DashboardData && dashboardKey === `q4` && (
              <Q4Dashboard
                dashboardData={q4DashboardData}
                searchResults={q4SearchResults}
              />
            )}

            <Separator className="mt-4 mb-4" />

            <div className={"w-full flex flex-col items-center justify-center"}>
              <DropdownCustomizeDataDisplay />
            </div>

            {showDashboard && q1DashboardData && dashboardKey === `q1` && (
              <DashboardBarChart
                chartInfo={`Ordered by the
              ${
                q1SearchResults.intensity.order === "desc"
                  ? "highest"
                  : "lowest"
              } value of
              ${
                q1SearchResults.intensity.variable === "est"
                  ? "establishments"
                  : "employees"
              }
              `}
                data={q1DashboardData.q1Top10BySubUnit}
                dataKeyXAxis="zip"
                dataKeyBar="total"
              />
            )}

            {showDashboard && q2DashboardData && dashboardKey === `q2` && (
              <DashboardBarChart
                chartInfo={`Ordered by the
              ${
                q2SearchResults.intensity.order === "desc"
                  ? "highest"
                  : "lowest"
              } value of
              ${
                q2SearchResults.intensity.variable === "est"
                  ? "establishments"
                  : "employees"
              }
              `}
                data={q2DashboardData.q2Top10BySubUnit}
                dataKeyXAxis="zip"
                dataKeyBar="total"
              />
            )}

            {showDashboard && q3DashboardData && dashboardKey === `q3` && (
              <DashboardTable
                data={q3DashboardData.q3Data}
                tableInfo="ZIP Codes within target geography"
              />
            )}

            {showDashboard && q4DashboardData && dashboardKey === `q4` && (
              <DashboardLineChart
                chartInfo={`Evolution of the percentual of gross income as full market value over the years
              `}
                data={q4DashboardData.q4HistoricalData}
                dataKeyXAxis="year"
                dataKeyYAxis="perc_gross_income_as_full_market_value"
              />
            )}

            <Separator className="mt-4 mb-4" />

            {coverage && (
              <h2 className="text-xs italic text-slate-600 text-center mb-3">
                Area from subunits covers {coverage}% of the highlighted unit
              </h2>
            )}
            {coverage && coverage > 0 && coverage !== 100 && (
              <Button
                className="hover:border-slate-400 transition-all duration-200 text-sm flex flex-row items-center justify-center mb-1"
                variant={"ghost"}
              >
                Trim subunits to exact boundaries
              </Button>
            )}
            <DropdownExportData />
          </div>
        )}
      </div>
    </div>
  );
}
