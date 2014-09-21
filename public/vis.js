var initVised = false;

var colors = ['#AE81FF', '#E6DB74', '#66D9EF', '#465457'];

function initVis() {
  if (initVised) {
    return;
  }

  // init
  var width = 750;
  var height = 500;

  var i = 0;

  var svg = d3.select('#vis').append('svg')
    .attr('width', width)
    .attr('height', height);

  svg.append('rect')
    .attr('width', width)
    .attr('height', height);

  function makeCircle(opts) {
    var circle = svg.insert('circle', 'rect')
      .attr('cx', opts.x * width)
      .attr('cy', opts.y * height)
      .attr('r', 1e-6)
      .style('stroke', opts.color)
      .style('stroke-opacity', 1);

    // Faded
    circle.transition()
      .duration(opts.duration)
      .ease(Math.sqrt)
      .attr('r', 100)
      .style('stroke-opacity', 1e-6)
      .remove();
  }

  var circles = {};

  function digestHandler(digest) {
    _.forEach(digest, function(val, id) {
      var circle = circles[id];
      if (!circle) {
        circle = {
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.8 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      }

      var opts = _.clone(circle);
      opts.duration = 1000;

      makeCircle(opts);
    });
  }

  socket.on('activityDigest', digestHandler);
  initVised = true;
}
