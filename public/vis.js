var initVised = false;
var theRoom;

var colors = ['#b58900', '#cb4b16', '#dc322f', '#d33682', '#6c71c4', '#268bd2', '#2aa198', '#859900'];

function initVis(room) {
  theRoom = room;
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

  function makeCircles(opts, amt, interval) {
    var accum = 0;

    function go() {
      setTimeout(function() {
        makeCircle(opts);
        accum++;
        if (accum < amt) {
          go();
        }
      }, interval);
    }
    go();
  }

  var circles = {};

  function digestHandler(digest) {
    _.forEach(digest, function(val, id) {
      if (val.room !== theRoom) {
        return;
      }

      var circle = circles[id];
      if (!circle) {
        circle = circles[id] = {
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.8 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)]
        };
      }

      var opts = _.clone(circle);
      opts.duration = 1000;

      var scaled = Math.floor(val.level * 10);
      var freq = 1000 / scaled;
      makeCircles(opts, scaled, freq);
    });
  }

  socket.on('activityDigest', digestHandler);
  initVised = true;
}
