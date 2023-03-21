import HorizontalBars from "./components/HorizontalBars";
import ParallelAxes from "./components/ParallelAxes";
import RadarChart from "./components/RadarChart";
import NavigationBars from "./components/NavigationBars";
import {
  exampleDataSimple3Objectives,
  exampleDataTen4Objectives,
  exampleDataSingle3Objectives,
  exampleDataSingle5Objectives,
  exampleSingle5OldAlternative,
  exampleProblemInfo3ObjectiveData,
  exampleProblemData3ObjectiveData,
  exampleProblem5ObjectiveData,
} from "./data/ExampleData";
import { useState, useEffect } from "react";

import { NavigationData, ProblemInfo } from "./types/ProblemTypes";

let steps = 10;

const emptyData: NavigationData = {
  upperBounds: [
    [2.3208, 2.319, 2.319, 2.319, 2.319, 2.319, 2.319, 2.319, 2.319, 2.319], // objective 1
    [2.5, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4, 2.4], // objective 2
    [-3.8, -3.7], // objective 3
  ],
  lowerBounds: [
    [2.316, 2.317, 2.317, 2.317, 2.317, 2.317, 2.317, 2.317, 2.317, 2.319], // objective 1
    [1.8, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9, 1.9], // objective 2
    [-1.8, -1.85], // objective 3
  ],
  referencePoints: [
    [2.318, 2.318], // objective 1
    [1.9, 2], // objective 2
    [-2.6, -2.7], // objective 3
  ],
  // boundary needs to have set default value or some value for the objective if its not used so the order doenst go wrong
  boundaries: [
    //[Number.NaN],
    //[Number.NaN],
    [2.319, 2.319],
    [2.2, 2.2],
    [-3.2, -3.5],
    //[Number.NaN],
  ],
  totalSteps: 11,
  stepsTaken: 10, // this must to be stepsTaken - 1 from to the bounds and refereslines given.
};

const susProbInfo: ProblemInfo = {
  problemId: 1,
  problemName: "Sustainability problem",
  problemType: "Discrete",
  objectiveNames: ["social", "economic", "commercial"],
  variableNames: [
    "x1",
    "x2",
    "x3",
    "x4",
    "x5",
    "x6",
    "x7",
    "x8",
    "x9",
    "x10",
    "x11",
  ],
  nObjectives: 3,
  ideal: [2.3208, 2.593, -3.9995],
  nadir: [2.316, 1.7273, -1.7377],
  minimize: [-1, -1, 1],
};

function App() {
  // new moved ref/bound points should be moved by this?
  const [selected, setSelected] = useState<number[]>([]);
  const [refData, setRefData] = useState<number[][]>(emptyData.referencePoints);
  const [bound, setBound] = useState<number[][]>(emptyData.boundaries);
  const [pData, setData] = useState<NavigationData>(emptyData);

  return (
    <>
      <div><ParallelAxes
            handleSelection={() => console.log("asd")}
            objectiveData={exampleDataSimple3Objectives}
            selectedIndices={[]}
             ></ParallelAxes>
      </div>
      <div style={{ width: "1200px", height: "1000px", float: "left" }}>
        <NavigationBars
          problemInfo={susProbInfo}
          problemData={pData}
          referencePoints={refData}
          boundaries={bound}
          handleReferencePoint={(ref: number[][]) => {
            setRefData(ref);
          }} // handles should do nothing right now
          handleBound={(bound: number[][]) => {
            setBound(bound);
          }}
          handleGoBack={(step: number) => console.log(step)}
        />
      </div>
    </>
  );
}

export default App;
