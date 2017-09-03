//
//                            Insert Button
//
var modal = "<div id='animatedModal'><div id='closebt-container' class='close-animatedModal'><img id='closebt' class='closebt' src=''></div><div id='chartcontainer' class='modal-content'> </div> </div>";
$('body').append(modal);
document.getElementById('closebt').src = chrome.extension.getURL('img/closebt.svg');
//
//                           Generate buttons
//
$("#pricehistory").after("<a id='line' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Open Line Graph</span></a>");
$("#line").after("<a id='candle' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Open Candlestick Graph</span></a>");
//                           Open model
$('#line').animatedModal({
  animatedIn:'slideInUp',
  animatedOut:'fadeOutDown',
  animationDuration: '.4s',
  color:'#1b2838'});
$('#candle').animatedModal({
  animatedIn:'slideInUp',
  animatedOut:'fadeOutDown',
  animationDuration: '.4s',
  color:'#1b2838'});
//
//                           Parse URL
//
var strippedURL = document.URL.replace(/(https*:\/\/steamcommunity\.com\/market\/listings\/)/, '')
var market_hash_name = decodeURIComponent(document.URL.replace(/(https*:\/\/steamcommunity\.com\/market\/listings\/)/, '').replace(/(\d*\/)/, '').replace(/(#+.*)/, ''));
var appid = document.URL.replace(/(https*:\/\/steamcommunity\.com\/market\/listings\/)/, '').replace(/((?!\d*\/).+)/, '').replace('/', '');
//
//                             Ajax request for chart data
//
var data = $.ajax({
    url: 'https://steamcommunity.com/market/pricehistory/',
    type: 'GET',
    async: 'false',
    data:({
        appid: appid,
        market_hash_name: market_hash_name
    })
});
data.done(function(data) {
  chart(data);
});
//
//                           Insert chart
//
function chart(tmp) {
    var data = tmp;
    var volume = [];
    function epochToDay(milliseconds) {
      return Math.floor(milliseconds / 1000 / 60 / 60 / 24);
    }

    function last(array) {
      return array[array.length - 1];
    }

    function init(array) {
      return array.slice(0, -1);
    }


    const ohlc = tmp.prices
      .map(([date, price, volume]) => [Date.parse(date), price, volume])
      .reduce(
        (daysPartitions, dataPoint) => {
          const lastProcessedDataPoint = last(last(daysPartitions));

          if (!lastProcessedDataPoint) return [[dataPoint]];

          const processingDay = epochToDay(dataPoint[0]);
          const lastProcessedDay = epochToDay(lastProcessedDataPoint[0]);
          if (processingDay === lastProcessedDay) {
            return [...init(daysPartitions), [...last(daysPartitions), dataPoint]];
          } else {
            return [...daysPartitions, [dataPoint]];
          }
        },
        [[]]
      )
      // derive each day's OHLC from its data points
      .map(dayDataPoints => {
        const timestamp = dayDataPoints[0][0];
        const prices = dayDataPoints.map(point => point[1]);
        const open = prices[0];
        const close = last(prices);
        const high = prices.reduce((a, b) => a < b ? b : a);
        const low = prices.reduce((a, b) => a > b ? b : a);

        return [timestamp, open, high, low, close];
      });
      for(i=0; i < data.prices.length; i++) {
        data.prices[i][0] = Date.parse(data.prices[i][0]);
        volume.push([
          data.prices[i][0],
          parseInt(data.prices[i][2])
        ]);
      }
    $('#line').click(function() {
      $(".modal-content").empty();
      $("#SMAcontainer, #EMAcontainer, #ATRcontainer, #RSIcontainer").remove();
      linegraph = Highcharts.stockChart('chartcontainer', {
        chart: {
          type: 'line',
          height: '40%'
        },
        yAxis: [{
                opposite: false,
                labels: {
                    align: 'right',
                    x: -3,
                    format: tmp.price_prefix+'{value}'
                },
                title: {
                    text: 'Price'
                },
                height: '60%',
                lineWidth: 2
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],
        rangeSelector: {
            allButtonsEnabled: true,
            buttons: [{
                type: 'day',
                count: 1,
                text: 'Day',
            }, {
                type: 'week',
                count: 1,
                text: 'Week',
            }, {
                type: 'month',
                count: 1,
                text: 'Month',
            }, {
                type: 'month',
                count: 6,
                text: '6-Month',
            }, {
                type: 'year',
                count: 1,
                text: 'Year',
            }, {
                type: 'all',
                count: 1,
                text: 'Lifetime',
            }],
            buttonTheme: {
                width: 60
            },
            selected: 2
        },
        scrollbar: {
          barBackgroundColor: 'white',
          buttonBackgroundColor: '#101822',
          buttonArrowColor: 'white',
          trackBackgroundColor: '#101822',
          trackBorderWidth: 0,
        },
        tooltip: {
            split: false,
            enabledIndicators: true
        },
         series: [{
            id: 'line',
            type: 'line',
            name: market_hash_name,
            data:  data.prices,
            tooltip: {
                valueDecimals: 2,
                valuePrefix: tmp.price_prefix,
                valueSuffix: tmp.price_suffix
            }
         }, {
                type: 'column',
                name: 'Volume',
                yAxis: 1,
                data: volume,
            }]
      });
      $("#chartcontainer").after("<div id='EMAcontainer'>Select what period you want your EMA to be: <input type='text' id='EMAperiod' name='emaperiod' style='width: 30px; margin: 20px;'><select id='EMAcolor' style='margin-right: 20px'><option value='#8A3C59' style='background:#8A3C59'>Red</option><option value='#ed561b' style='background:#ed561b'>Orange</option><option value='#DDDF00' style='background:#DDDF00'>yellow</option><option value='#24cbe5' style='background:#24cbe5'>Blue</option></select><a id='EMA' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Generate EMA line</span></a></div>");
      $('#EMA').click(function() {
        linegraph.addIndicator({
          name: parseInt(document.getElementById('EMAperiod').value)+'-day EMA',
          id: 'line',
          type: 'ema',
          styles: {
            stroke: document.getElementById('EMAcolor').value
          },
          params: {
            period: parseInt(document.getElementById('EMAperiod').value),
            index: 1
          },
          showInLegend: true
        });
      });
      $("#chartcontainer").after("<div id='SMAcontainer'>Select what period you want your SMA to be: <input type='text' id='SMAperiod' name='smaperiod' style='width: 30px; margin: 20px;'><select id='SMAcolor' style='margin-right: 20px'><option value='#8A3C59' style='background:#8A3C59'>Red</option><option value='#ed561b' style='background:#ed561b'>Orange</option><option value='#DDDF00' style='background:#DDDF00'>yellow</option><option value='#24cbe5' style='background:#24cbe5'>Blue</option></select><a id='SMA' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Generate SMA line</span></a></div>");
      $('#SMA').click(function() {
        linegraph.addIndicator({
          name: parseInt(document.getElementById('SMAperiod').value)+'-day SMA',
          id: 'line',
          type: 'sma',
          styles: {
            stroke: document.getElementById('SMAcolor').value
          },
          params: {
            period: parseInt(document.getElementById('SMAperiod').value),
            index: 1
          },
          showInLegend: true
        });
      });
    });
    $('#candle').click(function() {
      $(".modal-content").empty();
      $("#SMAcontainer, #EMAcontainer, #ATRcontainer, #RSIcontainer").remove();
      candlestickchart = Highcharts.stockChart('chartcontainer', {
        chart: {
            height: '40%'
        },
        yAxis: [{
                labels: {
                    align: 'right',
                    x: -3,
                    format: tmp.price_prefix+'{value}'
                },
                title: {
                    text: 'Price'
                },
                lineWidth: 2
            }],
        rangeSelector: {
            allButtonsEnabled: true,
            buttons: [{
                type: 'day',
                count: 1,
                text: 'Day',
            }, {
                type: 'week',
                count: 1,
                text: 'Week',
            }, {
                type: 'month',
                count: 1,
                text: 'Month',
            }, {
                type: 'month',
                count: 6,
                text: '6-Month',
            }, {
                type: 'year',
                count: 1,
                text: 'Year',
            }, {
                type: 'all',
                count: 1,
                text: 'Lifetime',
            }],
            buttonTheme: {
                width: 60
            },
            selected: 2
        },
        scrollbar: {
          barBackgroundColor: 'white',
          buttonBackgroundColor: '#101822',
          buttonArrowColor: 'white',
          trackBackgroundColor: '#101822',
          trackBorderWidth: 0,
        },
        tooltip: {
            split: false,
        },
        series: [{
            id: 'candle',
            type: 'candlestick',
            name: market_hash_name,
            data: ohlc,
            lineColor: '#8F98A0',
            lineWidth: '2',
            color: '#688F3E',
            upColor: '#8A3C59'
        }]
      });
      $("#chartcontainer").after("<div id='ATRcontainer'>Select what period you want your ATR to be: <input type='text' id='ATRperiod' name='ATRperiod' style='width: 30px; margin: 20px;'><select id='ATRcolor' style='margin-right: 20px'><option value='#8A3C59' style='background:#8A3C59'>Red</option><option value='#ed561b' style='background:#ed561b'>Orange</option><option value='#DDDF00' style='background:#DDDF00'>yellow</option><option value='#24cbe5' style='background:#24cbe5'>Blue</option></select><a id='ATR' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Generate ATR line</span></a></div>");
      $('#ATR').click(function() {
        candlestickchart.addIndicator({
          name: parseInt(document.getElementById('ATRperiod').value)+'-day ATR',
          id: 'candle',
          type: 'atr',
          styles: {
            stroke: document.getElementById('ATRcolor').value
          },
          params: {
            period: parseInt(document.getElementById('ATRperiod').value),
            overbought: 70,
            oversold: 30
          },
          yAxis: {
              lineWidth: 2,
              title: {
                  text: 'ATR'
              }
          }
        });
      });
      $("#chartcontainer").after("<div id='RSIcontainer'>Select what period you want your RSI to be: <input type='text' id='RSIperiod' name='RSIperiod' style='width: 30px; margin: 20px;'>Select what your overbought and oversold values are: <input type='text' id='RSIoverb' value='70' name='RSIoverb' style='width: 30px; margin: 20px;'><input type='text' id='RSIovers' name='RSIovers' value='30' style='width: 30px; margin: 20px;'><select id='RSIcolor' style='margin-right: 20px'><option value='#8A3C59' style='background:#8A3C59'>Red</option><option value='#ed561b' style='background:#ed561b'>Orange</option><option value='#DDDF00' style='background:#DDDF00'>yellow</option><option value='#24cbe5' style='background:#24cbe5'>Blue</option></select><a id='RSI' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Generate RSI line</span></a></div>");
      $('#RSI').click(function() {
        candlestickchart.addIndicator({
          name: parseInt(document.getElementById('RSIperiod').value)+'-day RSI',
          id: 'candle',
          type: 'rsi',
          styles: {
            stroke: document.getElementById('RSIcolor').value
          },
          params: {
            period: parseInt(document.getElementById('RSIperiod').value),
            overbought: parseInt(document.getElementById('RSIoverb').value),
            oversold: parseInt(document.getElementById('RSIovers').value)
          },
          yAxis: {
              lineWidth: 2,
              title: {
                  text: 'RSI'
              }
          }
        });
      });
      $("#chartcontainer").after("<div id='EMAcontainer'>Select what period you want your EMA to be: <input type='text' id='EMAperiod' name='emaperiod' style='width: 30px; margin: 20px;'><select id='EMAcolor' style='margin-right: 20px'><option value='#8A3C59' style='background:#8A3C59'>Red</option><option value='#ed561b' style='background:#ed561b'>Orange</option><option value='#DDDF00' style='background:#DDDF00'>yellow</option><option value='#24cbe5' style='background:#24cbe5'>Blue</option></select><a id='EMA' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Generate EMA line</span></a></div>");
      $('#EMA').click(function() {
        candlestickchart.addIndicator({
          name: parseInt(document.getElementById('EMAperiod').value)+'-day EMA',
          id: 'candle',
          type: 'ema',
          styles: {
            stroke: document.getElementById('EMAcolor').value
          },
          params: {
            period: parseInt(document.getElementById('EMAperiod').value),
            index: 1
          },
          showInLegend: true
        });
      });
      $("#chartcontainer").after("<div id='SMAcontainer'>Select what period you want your SMA to be: <input type='text' id='SMAperiod' name='smaperiod' style='width: 30px; margin: 20px;'><select id='SMAcolor' style='margin-right: 20px'><option value='#8A3C59' style='background:#8A3C59'>Red</option><option value='#ed561b' style='background:#ed561b'>Orange</option><option value='#DDDF00' style='background:#DDDF00'>yellow</option><option value='#24cbe5' style='background:#24cbe5'>Blue</option></select><a id='SMA' href='#animatedModal' style='margin-right: 2vw' class='btn_green_white_innerfade btn_medium'><span style='text-align: right'>Generate SMA line</span></a></div>");
      $('#SMA').click(function() {
        candlestickchart.addIndicator({
          name: parseInt(document.getElementById('SMAperiod').value)+'-day SMA',
          id: 'line',
          type: 'sma',
          styles: {
            stroke: document.getElementById('SMAcolor').value
          },
          params: {
            period: parseInt(document.getElementById('SMAperiod').value),
            index: 1
          },
          showInLegend: true
        });
      });
    });
}
