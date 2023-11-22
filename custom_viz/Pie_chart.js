(function (looker, Chart) {

    looker.plugins.visualizations.add({
        id: 'custom_pie_chart_chartjs',
        label: 'Custom Pie Chart (Chart.js)',
        options: {
            color: {
                type: 'string',
                label: 'Color',
                // default: '#3498db'
            }
        },
        handleErrors: function (data, resp) {
            return true;
        },
        create: function (element, config) {
            // Create a canvas element for the chart
            var canvas = document.createElement('canvas');
            canvas.setAttribute('id', 'customPieChartCanvas');
            element.appendChild(canvas);

            // Initialize the Chart.js instance
            this.chart = new Chart(canvas, {
                type: 'pie',
            });
        },
        update: function (data, element, config, queryResponse) {
            // Extract the data from Looker response
            var values = data;
            // Generate the chart data
            var FinalData = [];
            var finalLabel = [];
            var other_links = [];
            let sum = 0;
            values.forEach(function (currentValue, index) {
                var cell = currentValue[queryResponse.fields.measure_like[0].name];
                if (index < 19) {
                    var cellElement = '<p>' + cell.value+' </p>';
                    cellElement.onclick = function(event) {
                      LookerCharts.Utils.openDrillMenu({
                        links: cell.links,
                        event: event
                      });
                    };
                    FinalData.push(cell);
                    finalLabel.push(currentValue[queryResponse.fields.dimensions[0].name].value);
                } else {
                    other_links.push(cell.links[0])
                    sum = sum + currentValue[queryResponse.fields.measure_like[0].name].value;
                }
            })
            // console.log(sum)
            finalLabel.push("Other")
            FinalData.push({rendered: sum.toString(), links: other_links, value:sum})
            var finalCharData = {
                datasets: [{ data: FinalData }],
                 labels: finalLabel
            }
            console.log(finalCharData)
            // Update the chart with the data
            this.chart.data = finalCharData;
            this.chart.update();
        }



    });

}(looker, Chart));
