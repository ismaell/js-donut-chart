Lightweight Doughnut Chart Library for JavaScript
=================================================
This is a very simple library without bells and whistles, it has no
dependencies.

It generates a SVG figure for the browser to render, and that's all it does.

The API is very simple. First you need to find an element to insert the graph on, e.g.:

    var chart_div = document.getElementById("mychart")

Then you instantiate the class:

     var mychart = new DonutChart(chart_div, {
        radius: 60,
        stroke: 16,
        scale: 100,
        items: [
            { label: "A", value: .2 },
            { label: "B", value: .1 },
            { label: "C", value: .5 },
        ]
    })

And if you need to, you can update the values:

    mychart.update({
        items: [
            { label: "J", value: .4 },
            { label: "Q", value: .3 },
        ]
    })

- Have fun!
https://raw.githubusercontent.com/ismaell/js-donut-chart
