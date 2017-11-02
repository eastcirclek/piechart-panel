'use strict';

System.register(['lodash', 'jquery', 'jquery.flot', 'jquery.flot.pie'], function (_export, _context) {
  "use strict";

  var _, $;

  function link(scope, elem, attrs, ctrl) {
    var data, panel;
    elem = elem.find('.piechart-panel');
    var $tooltip = $('<div id="tooltip">');

    ctrl.events.on('render', function () {
      render(false);
      if (panel.legendType === 'Right side') {
        setTimeout(function () {
          render(true);
        }, 50);
      }
    });

    function getLegendHeight(panelHeight) {
      if (ctrl.panel.legendType === 'On graph') {
        $('.graph-legend').css('padding-top', 0);
      } else {
        $('.graph-legend').css('padding-top', 6);
      }
      if (!ctrl.panel.legend.show || ctrl.panel.legendType === 'Right side' || ctrl.panel.legendType === 'On graph') {
        return 0;
      }

      if (ctrl.panel.legend.percentage || ctrl.panel.legend.values) {
        var total = 25 + 21 * data.length;
        return Math.min(total, Math.floor(panelHeight / 2));
      }

      return 27;
    }

    function setElementHeight() {
      try {
        var height = ctrl.height - getLegendHeight(ctrl.height);
        elem.css('height', height + 'px');

        return true;
      } catch (e) {
        // IE throws errors sometimes
        console.log(e);
        return false;
      }
    }

    function formatter(label, slice) {
      var slice_data = slice.data[0][slice.data[0].length - 1];
      var decimal = 2;
      var start = "<div style='font-size:" + ctrl.panel.fontSize + ";text-align:center;padding:2px;color:" + slice.color + ";'>" + label + "<br/>";

      if (ctrl.panel.legend.percentageDecimals) {
        decimal = ctrl.panel.legend.percentageDecimals;
      }
      if (ctrl.panel.legend.values && ctrl.panel.legend.percentage) {
        return start + ctrl.formatValue(slice_data) + "<br/>" + slice.percent.toFixed(decimal) + "%</div>";
      } else if (ctrl.panel.legend.values) {
        return start + ctrl.formatValue(slice_data) + "</div>";
      } else if (ctrl.panel.legend.percentage) {
        return start + slice.percent.toFixed(decimal) + "%</div>";
      } else {
        return start + '</div>';
      }
    }

    function noDataPoints() {
      var html = '<div class="datapoints-warning"><span class="small">No data points</span></div>';
      elem.html(html);
    }

    function addPieChart() {
      var width = elem.width();
      var height = elem.height();

      var size = Math.min(width, height);

      var plotCanvas = $('<div></div>');
      var plotCss = {
        top: '10px',
        margin: 'auto',
        position: 'relative',
        height: size - 20 + 'px'
      };

      plotCanvas.css(plotCss);

      var backgroundColor = $('body').css('background-color');

      var options = {
        legend: {
          show: false
        },
        series: {
          pie: {
            show: true,
            stroke: {
              color: backgroundColor,
              width: parseFloat(ctrl.panel.strokeWidth).toFixed(1)
            },
            label: {
              show: ctrl.panel.legend.show && ctrl.panel.legendType === 'On graph',
              formatter: formatter
            },
            highlight: {
              opacity: 0.0
            },
            combine: {
              threshold: ctrl.panel.combine.threshold,
              label: ctrl.panel.combine.label
            }
          }
        },
        grid: {
          hoverable: true,
          clickable: true
        }
      };

      if (panel.pieType === 'donut') {
        options.series.pie.innerRadius = 0.5;
      }

      data = ctrl.data;

      if (ctrl.panel.clickAction === 'Hide slice') {
        for (var i = 0; i < data.length; i++) {
          var series = data[i];

          // if hidden remove points and disable stack
          if (ctrl.selectedSeries[series.label]) {
            series.data = {};
            series.stack = false;
          }
        }
      }

      elem.html(plotCanvas);

      $.plot(plotCanvas, ctrl.data, options);
      if (ctrl.panel.tooltip.show === true) {
        plotCanvas.on("plothover", function (event, pos, item) {
          if (!item) {
            $tooltip.detach();
            return;
          }

          var body;
          var percent = parseFloat(item.series.percent).toFixed(2);
          var formatted = ctrl.formatValue(item.series.data[0][1]);

          body = '<div class="graph-tooltip-small"><div class="graph-tooltip-time">';
          body += '<div class="graph-tooltip-value">' + item.series.label;
          if (ctrl.panel.tooltip.showValue === true) {
            body += ': ' + formatted;
          }
          if (ctrl.panel.tooltip.showPercentage === true) {
            body += " (" + percent + "%)";
          }
          body += "</div>";
          body += "</div></div>";

          $tooltip.html(body).place_tt(pos.pageX + 20, pos.pageY);
        });

        if (ctrl.panel.clickAction) {
          plotCanvas.on('plotclick', function (event, pos, item) {
            var series = _.find(ctrl.series, { "label": item.series.label });
            ctrl.toggleSeries(series);
            ctrl.updateVariableIfNecessary();
          });
        }
      }
    }

    function render(incrementRenderCounter) {
      if (!ctrl.data) {
        return;
      }

      data = ctrl.data;
      panel = ctrl.panel;

      if (setElementHeight()) {
        if (0 == ctrl.data.length) {
          noDataPoints();
        } else {
          addPieChart();
        }
      }
      if (incrementRenderCounter) {
        ctrl.renderingCompleted();
      }
    }
  }

  _export('default', link);

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }, function (_jquery) {
      $ = _jquery.default;
    }, function (_jqueryFlot) {}, function (_jqueryFlotPie) {}],
    execute: function () {}
  };
});
//# sourceMappingURL=rendering.js.map
