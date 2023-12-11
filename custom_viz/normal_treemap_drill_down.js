looker.plugins.visualizations.add({
  create: function (element, config) {
    // Create a container element for the visualization
    var container = element.appendChild(document.createElement("div"));
    container.id = "my-visualization-container";
    // Apply styles to the container
    container.style.display = 'flex';
    container.style.flexDirection = 'row'; // Added to align chart and table vertically
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.overflow = "scroll";

    // Create treemap and set its width
    var treemap = container.appendChild(document.createElement("div"));
    treemap.id = "my-visualization-treemap";
    treemap.style.width = "50%"; // Adjust width as needed
    treemap.style.height = "100%";

    // create tooltip
    var tooltip=container.appendChild(document.createElement("div"));
    tooltip.id = "my-visualization-tooltip";
    //tooltip.style.width = "50%"; // Adjust width as needed
    //tooltip.style.height = "100%";
    //tooltip.style.display = "display"
    // Initialize the treemap visualization properties
    this.chart = d3.select(treemap).append("svg").attr("width", "100%").attr("height", "100%");

    // Create a table and set its width
    var table = container.appendChild(document.createElement('table'));
    table.id = "my-visualization-table";
    table.setAttribute('class', 'table');
    // Applying styling to the table
    table.style.width = '50%'; // Adjust width as needed
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
  },

  updateAsync: function (data, element, config, queryResponse, details, doneRendering) {
    // Clear any existing content
    this.chart.selectAll("*").remove();
    // Extract data from Looker response
    var dataset = [];
    const column = new Set();
    var links=[]
    data.forEach(function (row) {
    // console.log(row)
      var rowData = {};
      queryResponse.fields.dimension_like.forEach(function (field) {
        column.add(field.label)
        rowData[field.name] = row[field.name].value;
      });

      queryResponse.fields.measure_like.forEach(function (field) {
        // console.log("qwdiuw")
        console.log(row[field.name].links[1])
        links.push({"value":row[field.name].value,"links":(row[field.name].links[1])})
        column.add(field.label)
        rowData[field.name] = row[field.name].value;
      });
      dataset.push(rowData);
    });
    // console.log(links)
    // Set up the treemap layout
    var parentElement = element.parentElement;
    var width = parentElement.clientWidth; // Use clientWidth for the width
    var height = parentElement.clientHeight; // Use clientHeight for the height

    // Create a color scale
    var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    var treemap = d3.treemap().size([width * 0.5, height]); // Adjust width as needed

    // Create hierarchy based on dimensions and measures
    var root = d3.hierarchy({
      children: dataset.map(function (d) {
        return { name: d[queryResponse.fields.dimension_like[0].name], value: d[queryResponse.fields.measure_like[0].name] };
      }),
    })
      .sum(function (d) {
        return d.value;
      });

    // Generate treemap nodes
    treemap(root);
    // Draw rectangles for each node
    var nodes = this.chart
      .selectAll(".node")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + d.x0 + "," + d.y0 + ")";
      })
      .on("mouseover", function (d) {
        // Add your custom hover behavior here
        var data_tooltip=d.srcElement.__data__.data;
        d3.select(this).style("opacity", 0.7);
      })
      .on("mouseout", function () {
        // Restore the original opacity on mouseout
        d3.select(this).style("opacity", 1);
        var tooltip = document.querySelectorAll("#my-visualization-tooltip")[0];
        // tooltip.style.display = "none";
      })
      .on("click", function (d) {
        var tooltip = document.querySelectorAll("#my-visualization-tooltip")[0];
        tooltip.innerHTML=LookerCharts.Utils.htmlForCell(data[0]["offices.count"]);
        tooltip.style.display = "block";
        tooltip.style.position = "absolute";
        tooltip.style.left = d.pageX + "px";
        tooltip.style.top = d.pageY + "px";
      });

    nodes
      .append("rect")
      .attr("width", function (d) {
        return d.x1 - d.x0;
      })
      .attr("height", function (d) {
        return d.y1 - d.y0;
      })
      .style("fill", function (d, i) {
        return colorScale(i); // Assign different colors based on the index
      })
      .style("stroke", "white");

    // Add text labels
    nodes
      .append("text")
      .attr("x", function (d) {
        return (d.x1 - d.x0) / 2;
      })
      .attr("y", function (d) {
        return (d.y1 - d.y0) / 2;
      })
      .attr("dy", "0.3em")
      .style("text-anchor", "middle")
      .style("fill", "white")
      .text(function (d) {
        return d.data.name;
      });

    // Signal that the rendering is complete
    doneRendering();
  },
});
