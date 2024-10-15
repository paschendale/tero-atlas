import { Blocks } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Dispatch, SetStateAction } from "react";
import { SearchResults } from "@/interfaces";
import { useToast } from "@/hooks/use-toast";

export default function SearchMatrix(props: {
  loading: boolean;
  search: string;
  buildDashboard: () => void;
  searchResults: SearchResults;
  setSearchResults: Dispatch<SetStateAction<SearchResults>>;
}) {
  const { toast } = useToast();

  function handleClickOnYear(year: number) {
    console.log(
      `years selected: ${props.searchResults.time.years}, just clicked on ${year}`
    );
    const currentYears = props.searchResults.time.years;

    if (currentYears.includes(year)) {
      const newYears = currentYears.filter((y) => y !== year);
      if (newYears.length === 0) {
        toast({
          title: "No years selected",
          description: "You must select at least one year",
        });
        console.log("oops, cant do that");
        return;
      }
      props.setSearchResults({
        ...props.searchResults,
        time: {
          ...props.searchResults.time,
          years: newYears,
        },
      });
    } else {
      props.setSearchResults({
        ...props.searchResults,
        time: {
          ...props.searchResults.time,
          years: [...currentYears, year],
        },
      });
    }
  }

  function handleClickOnIntensity(variable: string, order: string) {
    const currentVariable = props.searchResults.intensity.variable;
    const currentOrder = props.searchResults.intensity.order;

    if (currentVariable === variable && currentOrder === order) {
      console.log("same");
      return;
    } else {
      props.setSearchResults({
        ...props.searchResults,
        intensity: {
          ...props.searchResults.intensity,
          variable: variable,
          order: order,
        },
      });
    }
  }

  if (props.loading)
    return <Skeleton className="min-w-[800px] w-full h-[500px]" />;

  if (
    props.search.includes("dc") &&
    props.search.includes("congressional district") &&
    props.search.includes("economic data")
  ) {
    return (
      <div className="flex flex-col items-center">
        <div className={"w-full min-w-[850px] h-[500px]"}>
          <div id="1st-row" className="w-full h-[calc(100%/5)] flex flex-row">
            <div className="w-[calc(100%/7)] h-full bg-transparent"></div>
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center rounded-tl-md border-gray-500 border-[1px]">
              {" "}
              Filters & Results
            </div>
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center border-gray-500 border-[1px]">
              {" "}
              Search Results
            </div>
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center border-gray-500 border-[1px]">
              Length of Observations
            </div>
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center border-gray-500 border-[1px]">
              Time of Observations
            </div>
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center border-gray-500 border-[1px]">
              Intensity of Observations
            </div>
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center rounded-tr-md border-gray-500 border-[1px]">
              Breadth of Observations
            </div>
          </div>
          <div id="2nd-row" className="h-[calc(100%/5)] flex flex-row">
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center rounded-tl-md border-gray-500 border-[1px]">
              Place
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer">
              {" "}
              dc
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer">
              {" "}
              DC (Congressional District)
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer">
              Min # Observations
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center  border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
          </div>
          <div id="3rd-row" className="h-[calc(100%/5)] flex flex-row">
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center  border-gray-500 border-[1px]">
              Period
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] ">
              <ul className="columns-2">
                {[2019, 2020, 2021, 2022].map((year) => {
                  return (
                    <li key={year}>
                      <span
                        className={`font-semibold hover:font-bold hover:cursor-pointer ${
                          props.searchResults.time.years.includes(year) &&
                          "text-tero-100"
                        }`}
                        onClick={() => handleClickOnYear(year)}
                      >
                        {year}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center  border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
          </div>
          <div id="4th-row" className="h-[calc(100%/5)] flex flex-row">
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center border-gray-500 border-[1px]">
              Topic
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer">
              economic data
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer">
              <ul>
                <li>
                  <span className="font-semibold">Employees</span>
                </li>
                <li>
                  <span className="font-semibold">Establishments</span>
                </li>
              </ul>
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs">
              <ul>
                {[
                  {
                    title: "Highest Value (Est.)",
                    variable: "est",
                    order: "desc",
                  },
                  {
                    title: "Highest Value (Emp.)",
                    variable: "emp",
                    order: "desc",
                  },
                  {
                    title: "Lowest Value (Est.)",
                    variable: "est",
                    order: "asc",
                  },
                  {
                    title: "Lowest Value (Emp.)",
                    variable: "emp",
                    order: "asc",
                  },
                ].map((item) => {
                  return (
                    <li
                      key={item.title}
                      className={`font-semibold hover:font-bold hover:cursor-pointer ${
                        props.searchResults.intensity.variable ===
                          item.variable &&
                        props.searchResults.intensity.order === item.order &&
                        "text-tero-100"
                      }`}
                      onClick={() =>
                        handleClickOnIntensity(item.variable, item.order)
                      }
                    >
                      <span className="font-semibold">{item.title}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center  border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
          </div>
          <div id="5th-row" className="h-[calc(100%/5)] flex flex-row">
            <div className="w-[calc(100%/7)] h-full flex items-center justify-center text-center border-gray-500 border-[1px] rounded-bl-md">
              Unit
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer">
              congressional district
            </div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center border-gray-500 border-[1px] text-xs hover:cursor-pointer"></div>
            <div className="w-[calc(100%/7)] h-full hover:bg-slate-800 flex items-center justify-center text-center rounded-br-md border-gray-500 border-[1px] text-xs hover:cursor-pointer">
              {" "}
              ZIP Code (converted)
            </div>
          </div>
        </div>
        <Button
          className="bg-tero-100 text-white hover:bg-tero-400 mt-4"
          onClick={props.buildDashboard}
        >
          <Blocks /> &nbsp; Build Dashboard
        </Button>
      </div>
    );
  }

  if (props.search !== "") return <>No results found</>;

  return <></>;
}
