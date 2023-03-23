// create lines data
const linesData = (dataset: ObjectiveData) =>
  dataset.values.map((datum) => {
    return datum.value.map((v, i) => {
      const y = ys()[i](v);
      const axisX = x().call(x, data.names[i]) as number;
      const axisY = ys()[i](0); // y-axis position
      return [axisX, axisY + y]; // adjust y-value relative to the y-axis position
    });
  });
const lines = linesData(data).map((datum) => {
  return line()(
    datum.map((d) => {
      return [d[0], d[1]];
    })
  );
});

// add event listener to the SVG element, which will handle the drag events
const yAxisDrag = drag<SVGGElement, unknown>()
  .on("start", function(d: DragEvent) {})
  .on("drag", function(event) {
    const x = event.x;
    select(this).attr("transform", `translate(${x}, ${dimensions.marginTop})`);

    // update visual paths
    selection
      .selectAll(".visualPath")
      .attr("transform", `translate(${x})`)
      .attr("d", (_, i) => {
        const pathData = linesData(data)[i];
        return line()(
          pathData.map((d) => {
            const axisY = ys()[i](0);
            return [d[0] + x, d[1] - axisY]; // update x and y values
          })
        );
      });

    // update path detectors
    selection
      .selectAll(".pathDetector")
      .attr("transform", `translate(${x})`);

    console.log(lines);
  })
  .on("end", function(d: DragEvent) {});

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
      () =>
        `${data.names[i]} (${data.directions[i] === 1 ? "min" : "max"})`
    )
    .style("fill", "black");
});

// add thin visual paths, these will be visible
selection
  .append("g")
  .selectAll("path")
  .data(data.values)
  .enter()
  .append("path")
  .attr("class", "
