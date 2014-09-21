var vizNodes = [];
socket.on('count', function(count) {
    var vizNodes = count.nodes;
        var width = 960,
            height = 500;
        var color = d3.scale.category20();
        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(30)
            .size([width, height]);
        var svg = d3.select("#dotViz").append("svg")
            .attr("width", width)
            .attr("height", height);
        if (vizNodes){
              force.nodes(vizNodes)
                  .start();
              var node = svg.selectAll(".node")
                  .data(vizNodes)
                .enter().append("circle")
                  .attr("class", "node")
                  .attr("r", 5)
                  .style("fill", function(d) { return color(d.group); })
                  .call(force.drag);
              node.append("title")
                  .text(function(d) { return d.name; });
              force.on("tick", function() {
                node.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
              });
        }
});
