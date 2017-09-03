# Steam Market Extender
## Installation
1. Right-click [steammarket.crx](./steammarket.crx) and click save-as.
2. Save it anywhere
3. go to chrome://extensions
4. Drag [steammarket.crx](./steammarket.crx) to the page
5. Done!

## Usage
* Make sure you are signed into steam (*still trying to figure out how to make an XHR request without having to be logged into steam*)
* Navigate to an item you would like to view market details about
* For a **line graph**, click "Open line graph"
* For a **candlestick graph**, click "Open candlestick graph"
* Adjust the time period by scrolling on the navigator

  ![alt text][navigator]

[navigator]: https://i.imgur.com/lqLv8J9.gif "Navigator Scrolling"
 * Or by dragging on the chart
  
   ![alt text][dragchart]
   
   [dragchart]: https://i.imgur.com/ZEdKLxh.gif "Chart scrolling"
   

* ### Indicators
  * #### SMA
     * A simple moving average is calculated by adding together the first n (n being the period) closing prices and dividing them by n
  * #### EMA
     * An exponential average is calculated using the simple moving average and applies more weight to recent prices
  * #### RSI
     * Relative strength index is calculated by subtracring from 100, 100 divided by 1+RS (average gain of up of the period/average loss of down of the period)
  * #### ATR
     * ATR is basically the day's range that can extend to yesterday's closing price if it was outside of this days range
    
