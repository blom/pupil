window.pupilGraphers = {};
window.pupilClients = {};
window.pupilPlugins = {};

function populateChildren(ul, childtree, host, hide) {
  Object.keys(childtree).forEach(function (key) {
    var li = document.createElement('li');
    ul.appendChild(li);

    if ( typeof childtree[key] === 'string' ) {
      var a = document.createElement('a');
      a.href = 'javascript:window.pupilClients["' + host + '"].subscribe("' + childtree[key] + '")';
      a.innerHTML = key;
      li.appendChild(a);
    } else if ( typeof childtree[key] === 'object' ) {
      var a = document.createElement('a');
      a.innerHTML = key;
      li.appendChild(a);
      var uln = document.createElement('ul');
      if ( hide ) {
        uln.style.display = 'none';
      } else {
        uln.style.display = 'block';
      }
      li.appendChild(uln);
      a.href = '#';
      a.onclick = function () {
        if(uln.style.display == 'block') {
          uln.style.display = 'none';
		}
        else {
          uln.style.display = 'block';
		}
      };
      populateChildren(uln, childtree[key], host, true);
    }
  });
}

function PupilUpdatePluginList() {
  var cont = document.getElementById('plugins');
  while ( cont.hasChildNodes() ) {
    cont.removeChild(cont.lastChild);
  }

  var ul = document.createElement('ul');
  cont.appendChild(ul);

  Object.keys(window.pupilPlugins).forEach(function (host) {
  	var levels = {};
    window.pupilPlugins[host].forEach(function (plugin) {
      var p = plugin.split('.');
      var prnt = levels;

      for (var i = 0; i < p.length; i++) {
        if ( prnt[p[i]] === undefined ) {
          if ( i+1 === p.length ) { prnt[p[i]] = plugin; }
          else { prnt[p[i]] = {}; }
        }
        prnt = prnt[p[i]];
      }
    });
  	populateChildren(ul, levels, host, true);
  });

}

function PupilStorePlugins(host, message) {
  if ( typeof(window.pupilPlugins[host]) === 'undefined' ) {
    window.pupilPlugins[host] = [];
  }

  message.forEach(function (p) {
    window.pupilPlugins[host].push(p);
  });

  PupilUpdatePluginList();
}

function PupilGrapher(host, name, data) {
  var self = this;

  this.createDOMBox = function (name) {
    var gelement = document.getElementById('graphs');
  
    var container = document.createElement('div');
    container.className = 'container';
    container.id = name.replace(/\./g, '_');
  
    var controlpanel = document.createElement('div');
    controlpanel.className = 'controlpanel';
    controlpanel.innerHTML = '<h2>' + name + '</h2>';
 
    container.appendChild(controlpanel);

    var graph_legend = document.createElement('div');
    graph_legend.className = 'graph_legend';
    graph_legend.id = name.replace(/\./g, '_') + '_legend';
    container.appendChild(graph_legend);

    var graph = document.createElement('div');
    graph.className = 'graph';
    graph.id = name.replace(/\./g, '_') + '_graph';
    container.appendChild(graph);

    var br = document.createElement('br');
    br.style.clear = 'right';
    container.appendChild(br);
 
    gelement.appendChild(container);
  };

  this.addData = function (data) {
    var i = 0;
    var md = {};
    Object.keys(data.data).forEach(function (d) {
      var realval;
      if ( self.type === 'counter' ) {
        if ( typeof data.data[d] === 'number' ) {
          realval = data.data[d] - self.lastval[d];
          self.lastval[d] = data.data[d];
        } else {
          realval = parseInt(data.data[d],10) - self.lastval[d];
          self.lastval[d] = parseInt(data.data[d],10);
        }
      } else {
        if ( typeof data.data[d] === 'number' ) {
          realval = data.data[d];
        } else {
          realval = parseInt(data.data[d],10);
        }
      }
      md[d] = realval;
      i++;
    });
    self.graph.series.addData(md);
    self.graph.update();
  };

  this.createGraph = function (name, data) {
    var palette = new Rickshaw.Color.Palette( { scheme: 'munin' } );

    var seriesData = { };
    var seriesDesc = [ ];

    if ( data.type === 'counter' ) {
      self.type = 'counter';
      self.lastval = {};
    }

    Object.keys(data.data).forEach(function (d) {
      if ( self.type === 'counter' ) {
        self.lastval[d] = parseInt(data.data[d],10);
      }
      seriesDesc.push({ name: d });
    });

    // instantiate our graph!
    var graph = new Rickshaw.Graph( {
      element: document.getElementById(name.replace(/\./g, '_') + '_graph'),
      width: 750,
      height: 220,
      renderer: 'line',
      background: 'silver',
      interpolation: 'direct',
      series: new Rickshaw.Series.FixedDuration(seriesDesc, palette, {
        timeInterval: 1000,
        maxDataPoints: 300,
        timeBase: new Date().getTime() / 1000
      })
    });

    if ( typeof(data.draw) != 'undefined' && data.draw === 'stacked' ) {
      graph.configure({ renderer: 'area' });
    }

    var x_axis = new Rickshaw.Graph.Axis.Time( { graph: graph } );
    
    var y_axis = new Rickshaw.Graph.Axis.Y( {
      graph: graph,
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
    });


    graph.render();
    var legend = new Rickshaw.Graph.Legend( {
      graph: graph,
      element: document.getElementById(name.replace(/\./g, '_') + '_legend')
    });

    var shelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
      graph: graph,
      legend: legend
    });

    var order = new Rickshaw.Graph.Behavior.Series.Order( {
      graph: graph,
      legend: legend
    });

    var highlight = new Rickshaw.Graph.Behavior.Series.Highlight( {
      graph: graph,
      legend: legend
    });

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
      graph: graph
    });

    self.graph = graph;
  };

  this.createDOMBox(name);
  this.createGraph(name, data);
  return this;
}

function PupilClient(remote) {
  window.WebSocket = window.WebSocket || window.MozWebSocket;

  window.pupilClients[remote] = this;
  window.pupilGraphers[remote] = {};
  var self = this;

  var connection = new WebSocket('ws://'+remote);
  this.validPlugins = [];

  this.subscribe = function (plugin) {
    connection.send(JSON.stringify({ type: 'subscribe', plugin: plugin }));
  };
  this.unsubscribe = function (plugin) {
    connection.send(JSON.stringify({ type: 'unsubscribe', plugin: plugin }));
  };
  connection.onopen = function () {
    console.log('Connected to websocket: ' + remote);
  };
  connection.onerror = function (err) {
    console.log('error: ' + error);
  };
  connection.onclose = function () {
    console.log('Websocket connection closed.');
  };
  connection.onmessage = function (message) {
//    console.log(message.data);
    var m = JSON.parse(message.data);
    switch (m.type) {
      case 'plugins':
        self.validPlugins = m.valid;
        PupilStorePlugins(remote, m.valid);
        break;
      case 'data':
        if ( typeof(window.pupilGraphers[remote][m.data.name]) === 'undefined' ) {
          window.pupilGraphers[remote][m.data.name] = new PupilGrapher(remote, m.data.name, m.data);
        } else {
          window.pupilGraphers[remote][m.data.name].addData(m.data);
        }
        break;
    }
  };

}
