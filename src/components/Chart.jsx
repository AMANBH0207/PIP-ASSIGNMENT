    import { createChart } from "lightweight-charts";
    import DATA from "../data/data.json";
    import styles from "./Chart.module.css"

    import React, { useEffect, useRef, useState } from "react";

    const Chart = () => {
    const [showSetting, setShowSetting] = useState(false)
    const [showSma, setShowSma] = useState(false);
    const [smaPeriod, setSmaPeriod] = useState(20); 
    const [smaColor, setSmaColor] = useState("red"); 
    const [smaLineStyle, setSmaLineStyle] = useState(0); 
    const [type, setType] = useState("ohlc")

    const sortedData = DATA.sort((a, b) => {
        const dateA = new Date(a.createdAt.$date);
        const dateB = new Date(b.createdAt.$date);
        return dateA - dateB;
    });

    const uniqueSortedData = sortedData.filter((item, index, array) => {
        if (index === 0) return true;
        const prevTimestamp = Math.floor(
        new Date(array[index - 1].createdAt.$date).getTime() / 1000
        );
        const currentTimestamp = Math.floor(
        new Date(item.createdAt.$date).getTime() / 1000
        );
        return currentTimestamp !== prevTimestamp;
    });

    const data = uniqueSortedData.map((item) => ({
        time: Math.floor(new Date(item.createdAt.$date).getTime() / 1000),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
    }));

    const chartContainerRef = useRef();

    useEffect(() => {
        const chartOptions = {
        layout: {
            textColor: "black",
            background: { type: "solid", color: "white" },
        },
        timeScale: {
            tickMarkFormatter: (time, locale) => {
            const date = new Date(time * 1000);
            const day = date.getDate();
            const month = date.toLocaleString(locale, { month: "short" });
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");

            return (
                month +
                " " +
                day +
                " " +
                hours +
                ":" +
                minutes +
                ":" +
                seconds
            );
            },
        },
        };

        const chart = createChart(chartContainerRef.current, chartOptions);
        const cs = chart.addCandlestickSeries();
        const sma = chart.addLineSeries({
        lineVisible: true,
        priceLineVisible: false,
        color: smaColor,
        lineStyle: smaLineStyle,
        period: smaPeriod,
        source: "open",
        lineWidth: 2,
        pointMarkersVisible: false,
        lastPriceAnimation: 1,
        lastValueVisible: true,
        });

        if (showSma) {
        if(type === "ohlc") {
            sma.setData(smaAll(data, smaPeriod));
        }
        if(type === "close") {
            sma.setData(smaClose(data, smaPeriod));
        }
        if(type === "open") {
            sma.setData(smaOpen(data, smaPeriod));
        } if(type === "high") {
            sma.setData(smaHigh(data, smaPeriod));
        } if(type === "low") {
            sma.setData(smaLow(data, smaPeriod));
        }
        }

        cs.setData(data);

        return () => {
        chart.remove();
        };
    }, [data, showSma, smaPeriod, smaColor, smaLineStyle]);

    return (
        <div className={styles["chart-container"]}>
          <div style={{ height: "150px" }}>
            <div style={{ margin: "20px 0 0 20px" }}>
              <button
                style={{ border: "none",backgroundColor:"#7772c7", borderRadius: "30px", color: "white", padding: "2px 10px", width:"150px" }}
                onClick={() => {setShowSma(!showSma) 
                    setShowSetting(!showSetting)}}
              >
                <h3 >{showSma ? "Remove SMA" : " Apply SMA"}</h3>
              </button>
            </div>
          </div>
          <div ref={chartContainerRef} style={{ width: "100vw", height: "70vh" }}></div>
    
          {/* Absolute-positioned div for SMA indicator settings */}
          {showSetting && <div className={styles["sma-settings"]}>
            <h3>SMA Indicator Settings</h3>
           
            <div>
              <label htmlFor="smaPeriod">Period:</label>
              <input
                type="number"
                id="smaPeriod"
                value={smaPeriod}
                onChange={(e) => setSmaPeriod(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="smaColor">Color:</label>
              <input
                type="color"
                id="smaColor"
                value={smaColor}
                onChange={(e) => setSmaColor(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="smaLineStyle">Line Style:</label>
              <select
                id="smaLineStyle"
                value={smaLineStyle}
                onChange={(e) => setSmaLineStyle(parseInt(e.target.value))}
              >
                <option value={0}>Solid</option>
                <option value={1}>Dashed</option>
                <option value={2}>Dotted</option>
              </select>
            </div>
            <div>
          <label htmlFor="baseCalculation">Base Calculation:</label>
          <select
            id="baseCalculation"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="Ohlc">OHLC</option>
            <option value="close">Close</option>
            <option value="open">Open</option>
            <option value="high">High</option>
            <option value="low">Low</option>

          </select>
        </div>
          </div>}
        </div>
      );
    };
    

    export default Chart;

  
    
 
    

    




    export const smaClose = (data = [], period) => {
        if (
        !Array.isArray(data) ||
        data.length === 0 ||
        period <= 0 ||
        period > data.length
        ) {
        return [];
        }
    
        const smaValues = [];
        let sum = 0;
    
        // Calculate initial sum for the first period
        for (let i = 0; i < period; i++) {
        sum += data[i].close;
        }
    
        for (let i = period - 1; i < data.length; i++) {
        if (i >= period) {
            // Update sum by subtracting the oldest close value and adding the newest close value
            sum = sum - data[i - period].close + data[i].close;
        }
        const sma = sum / period;
        smaValues.push({ time: data[i].time, value: sma });
        }
    
        return smaValues;
    };


    export const smaOpen = (data = [], period) => {
        if (
        !Array.isArray(data) ||
        data.length === 0 ||
        period <= 0 ||
        period > data.length
        ) {
        return [];
        }
    
        const smaValues = [];
        let sum = 0;
    
        // Calculate initial sum for the first period
        for (let i = 0; i < period; i++) {
        sum += data[i].close;
        }
    
        for (let i = period - 1; i < data.length; i++) {
        if (i >= period) {
            // Update sum by subtracting the oldest close value and adding the newest close value
            sum = sum - data[i - period].open + data[i].open;
        }
        const sma = sum / period;
        smaValues.push({ time: data[i].time, value: sma });
        }
    
        return smaValues;
    };


    export const smaHigh = (data = [], period) => {
        if (
        !Array.isArray(data) ||
        data.length === 0 ||
        period <= 0 ||
        period > data.length
        ) {
        return [];
        }
    
        const smaValues = [];
        let sum = 0;
    
        // Calculate initial sum for the first period
        for (let i = 0; i < period; i++) {
        sum += data[i].close;
        }
    
        for (let i = period - 1; i < data.length; i++) {
        if (i >= period) {
            // Update sum by subtracting the oldest close value and adding the newest close value
            sum = sum - data[i - period].high + data[i].high;
        }
        const sma = sum / period;
        smaValues.push({ time: data[i].time, value: sma });
        }
    
        return smaValues;
    };

    export const smaLow = (data = [], period) => {
        if (
        !Array.isArray(data) ||
        data.length === 0 ||
        period <= 0 ||
        period > data.length
        ) {
        return [];
        }
    
        const smaValues = [];
        let sum = 0;
    
        // Calculate initial sum for the first period
        for (let i = 0; i < period; i++) {
        sum += data[i].close;
        }
    
        for (let i = period - 1; i < data.length; i++) {
        if (i >= period) {
            // Update sum by subtracting the oldest close value and adding the newest close value
            sum = sum - data[i - period].low + data[i].low;
        }
        const sma = sum / period;
        smaValues.push({ time: data[i].time, value: sma });
        }
    
        return smaValues;
    };

    export const smaAll = (data = [], period) => {
        if (
        !Array.isArray(data) ||
        data.length === 0 ||
        period <= 0 ||
        period > data.length
        ) {
        return [];
        }
    
        const smaValues = [];
        let sum = 0;
    
        // Calculate initial sum for the first period
        for (let i = 0; i < period; i++) {
        sum += data[i].close;
        }
    
        for (let i = period - 1; i < data.length; i++) {
        if (i >= period) {
            // Update sum by subtracting the oldest close value and adding the newest close value
            sum = sum - (data[i - period].high + data[i].low + data[i].open + data[i].close);
        }
        const sma = sum / period;
        smaValues.push({ time: data[i].time, value: sma });
        }
    
        return smaValues;
    };

