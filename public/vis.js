var initVised = false;

function setupVis() {
  var width = '100%';
  var height = 500;
  console.log('asdf');

  var i = 0;

  var svg = d3.select('#vis').append('svg')
    .attr('width', width)
    .attr('height', height);

  svg.append('rect')
    .attr('width', width)
    .attr('height', height);

  setInterval(function() {
    var circle = svg.insert('circle', 'rect')
      .attr('cx', 200)
      .attr('cy', height / 2)
      .attr('r', 1e-6)
      .style('stroke', d3.rgb(0, 0, 0))
      .style('stroke-opacity', 1);

    // Faded
    circle.transition()
      .duration(2000)
      .ease(Math.sqrt)
      .attr('r', 100)
      .style('stroke-opacity', 1e-6)
      .remove();
  }, 1000);
}

function digestHandler() {

}

function initVis() {
  if (initVised) {
    return;
  }
  console.log('initvis');
  setupVis();
  socket.on('activityDigest', digestHandler);
  initVised = true;
}
