import React, { useEffect, useState, useCallback, useRef } from "react";
import { select, Selection, pointer } from "d3-selection";
import { scaleLinear, scaleBand, scaleOrdinal } from "d3-scale";
import { axisLeft } from "d3-axis";
import { line } from "d3-shape";
import "d3-transition";
import { easeCubic } from "d3-ease";
import "./Svg.css";
import { ObjectiveData } from "../types/ProblemTypes";
import { RectDimensions } from "../types/ComponentTypes";
import { filter } from "d3-array";
import { active } from "d3-transition";
import { drag } from "d3-drag";

interface ParallelAxesProps {
  objectiveData: ObjectiveData;
  oldAlternative?: ObjectiveData; // old alternative solution
  dimensionsMaybe?: RectDimensions;
  selectedIndices: number[];
  handleSelection: (x: number[]) => void;
}

const defaultDimensions = {
  chartHeight: 600,
  chartWidth: 1000,
  marginLeft: 50,
  marginRight: 50,
  marginTop: 30,
  marginBottom: 30,
};

const ParallelAxes = ({
  objectiveData,
  oldAlternative,
  dimensionsMaybe,
  selectedIndices,
  handleSelection,
}: ParallelAxesProps) => {
  const ref = useRef(null);
  const [selection, setSelection] = useState<null | Selection<
    SVGSVGElement,
    unknown,
    null,
    undefined
  >>(null);
  const [dimensions] = useState(
    dimensionsMaybe ? dimensionsMaybe : defaultDimensions
  );
  const [data, SetData] = useState(objectiveData); // if changes, the whole graph is re-rendered
  const [hoverTarget, SetHoverTarget] = useState(-1); // keeps track of hover target
  const [activeIndices, SetActiveIndices] = useState<number[]>(selectedIndices);

  const oldSol = oldAlternative;
  useEffect(() => {
    SetData(objectiveData);
  }, [objectiveData]);

  useEffect(() => {
    SetActiveIndices(selectedIndices);
  }, [selectedIndices]);

  // create an array of linear scales to scale each objective
  const ys = useCallback(() => {
    return data.ideal.map((_, i) => {
      return scaleLinear()
        .domain([
          data.ideal[i] < data.nadir[i] ? data.ideal[i] : data.nadir[i], // min
          data.ideal[i] > data.nadir[i] ? data.ideal[i] : data.nadir[i], // max
        ])
        .range([dimensions.chartHeight, 0]);
    });
  }, [dimensions, data]);

  const x = useCallback(
    () =>
      scaleBand()
        .domain(data.names.map((name) => name))
        .range([0, dimensions.chartWidth])
        .padding(1),
    [dimensions, data]
  );

  const yAxixes = useCallback(() => {
    return data.directions.map((_, i) => {
      return axisLeft(ys()[i]);
    });
  }, [data, ys]);

  useEffect(() => {
    // create a discrete band to position each of the horizontal bars
    if (!selection) {
      // add svg and update selection
      const renderH =
        dimensions.chartHeight + dimensions.marginBottom + dimensions.marginTop;
      const renderW =
        dimensions.chartWidth + dimensions.marginLeft + dimensions.marginRight;

      const newSelection = select(ref.current)
        .classed("svg-container", true)
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${renderW} ${renderH}`)
        //.attr("viewBox", `0 0 ${renderW} ${renderH}`)
        .classed("svg-content", true);

      // update selection
      setSelection(newSelection);
      return;
    }
    // clear the svg
    selection.selectAll("*").remove();
    const chart = selection
      .append("g")
      .attr("transform", `translate( 0 ${dimensions.marginTop})`);

    // add event listener to the SVG element, which will handle the drag events
    let dragging = {}
    const yAxisDrag = drag<SVGGElement, unknown>()
      .on("start", function(d: DragEvent) {
        // dragging[d] = scaleOrdinal(d);
        console.log(d)
        // console.log(scaleOrdinal(d.))
      })
      .on("drag", function(event) {
        select(this).attr("transform", `translate(${event.x}, ${
          dimensions.marginTop
        })`);
    } );

    // position the axises
    // y-axis
    data.names.map((name, i) => {
      const axis = selection
        .append("g")
        .attr(
          "transform",
          `translate(${x().call(x, name) as number + x().bandwidth()} ${
            dimensions.marginTop
          })`
        )
        .call(yAxixes()[i].tickSizeOuter(0))
        .style("cursor", "move")
        .call(yAxisDrag);
      axis.selectAll("text").attr("font-size", "20px");
      axis
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", "-12px")
        .attr("font-size", "22px")
        .text(
          () => `${data.names[i]} (${data.directions[i] === 1 ? "min" : "max"})`
        )
        .style("fill", "black");
    });

    // create lines data
    const linesData = (dataset: ObjectiveData) =>
      dataset.values.map((datum) => {
        return datum.value.map((v, i) => {
          return [x().call(x, data.names[i]) as number, ys()[i](v)];
        });
      });
    const lines = linesData(data).map((datum) => {
      return line()(
        datum.map((d) => {
          return [d[0], d[1]];
        })
      );
    });

    // outline for the oldAlternative. TODO: decide on good color. Grey gets overrun by darker colors,
    if (oldSol !== undefined) {
      const oldSolution = linesData(oldSol).map((datum) => {
        return line()(
          datum.map((d) => {
            return [d[0], d[1]];
          })
        );
      });
     chart 
        .selectAll(".oldSolution")
        .data(oldSol.values)
        .enter()
        .append("g")
        .attr("class", "oldSolution")
        .append("path")
        .attr("d", (_, i) => oldSolution[i])
        .style("stroke-width", 3 + "px")
        .style("stroke", "black")
        .style("fill", "none");
    }

    
    // add thin visual paths, these will be visible
    selection
      .append("g")
      .selectAll("path")
      .data(data.values)
      .enter()
      .append("path")
      .attr("class", "visualPath")
      .attr("transform", `translate(0 ${dimensions.marginTop})`)
      .attr("d", (_, i) => lines[i])
      .attr("fill", "none")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", "5px");

    // add thick invisible paths, these will be used to trigger and improve mouse events
    selection
      .append("g")
      .selectAll("path")
      .data(
        // append the index to the data for easier access in event handlers
        data.values.map((d, i) => {
          return { index: i, ...d };
        })
      )
      .enter()
      .append("path")
      .attr("class", "pathDetector")
      .attr("transform", `translate(0 ${dimensions.marginTop})`)
      .attr("d", (_, i) => lines[i])
      .attr("fill", "none")
      .attr("stroke", "none")
      .attr("stroke-width", "20px")
      .attr("pointer-events", "visibleStroke") // Otherwise the paths will be treated as closed shapes
      .on("mouseenter", (_, datum) => {
        SetHoverTarget(datum.index);
      })
      .on("mouseleave", () => {
        SetHoverTarget(-1);
      })
      .on("click", (_, datum) => {
        //const newData = selectedIndices.map((_, i) => data.values[i]);
        //newData[datum.index].selected = !newData[datum.index].selected;
        if (activeIndices.includes(datum.index)) {
          // remove the index
          const tmp = activeIndices.filter((i) => i !== datum.index);
          handleSelection(tmp);
          return;
        }
        const tmp = activeIndices.concat(datum.index);
        handleSelection(tmp);
      });
  }, [selection, dimensions, data, activeIndices]);

  useEffect(() => {
    if (!selection) {
      return;
    }

    // highlight selected
    const highlightSelect = selection
      .selectAll(".visualPath")
      .data(data.values)
      .filter((_, i) => {
        return activeIndices.includes(i);
      });

    // selection from filter is not empty
    if (!highlightSelect.empty()) {
      highlightSelect.attr("stroke-width", "5px").attr("stroke", "red");
    }

    // dim not selected
    const dimSelection = selection
      .selectAll(".visualPath")
      .data(data.values)
      .filter((_, i) => {
        return !activeIndices.includes(i);
      });
    //  .filter((d, _) => {
    //   return !d.selected;
    //});

    // selection from filter is not empty
    if (!dimSelection.empty()) {
      dimSelection.attr("stroke-width", "5px").attr("stroke", "#69b3a2");
    }
  }, [activeIndices, selection]);

  useEffect(() => {
    if (!selection) {
      return;
    }

    // none selected, reset colors for not selected
    if (hoverTarget === -1) {
      const resetSelection = selection
        .selectAll(".visualPath")
        .data(data.values)
        .filter((_, i) => {
          return !activeIndices.includes(i);
        });

      // check not empty
      if (!resetSelection.empty()) {
        resetSelection.attr("stroke-width", "5px").attr("stroke", "#69b3a2");
      }
      return;
      // end effect
    }

    // darken hover target
    const hoverSelection = selection
      .selectAll(".visualPath")
      .data(data.values)
      .filter((_, i) => {
        return i === hoverTarget && !activeIndices.includes(i);
      });

    // check not empty
    if (!hoverSelection.empty()) {
      hoverSelection.attr("stroke-width", "5px").attr("stroke", "pink");
    }
  }, [hoverTarget, selection, activeIndices]);

  return <div ref={ref} id="container" className="svg-container"></div>;
};

export default ParallelAxes;
