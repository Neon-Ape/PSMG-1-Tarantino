//(function() {
    function liquidFillGaugeDefaultSettings(){
        return {
            minValue: 0, // The gauge minimum value.
            maxValue: 10, // The gauge maximum value.
            circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
            circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            circleColor: "#178BCA", // The color of the outer circle.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 1000, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: false, // Controls if the wave scrolls or is static.
            waveColor: "#178BCA", // The color of the fill wave.
            waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
            textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
            valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
            displayPercent: true, // If true, a % symbol is displayed after the value.
            textColor: "#045681", // The color of the value text when the wave does not overlap it.
            waveTextColor: "#A4DBf8" // The color of the value text when the wave overlaps it.
        };
    }

    var config = liquidFillGaugeDefaultSettings();
    config.circleThickness = 0.1;
    config.circleColor = "#6DA398";
    config.textColor = "#0E5144";
    config.waveTextColor = "#6DA398";
    config.waveColor = "#246D5F";
    config.textVertPosition = 0.52;
    config.waveAnimateTime = 5000;
    config.waveHeight = 0;
    config.waveAnimate = false;
    config.waveOffset = 0.25;
    config.textSize = 1.2;
    config.minValue = 8;
    config.maxValue = 10;
    config.displayPercent = false;
    var gauge2 = loadLiquidFillGauge("fillgauge2", 9, config);
    var gauge3 = loadLiquidFillGauge("fillgauge3", 9, config);
    var gauge4 = loadLiquidFillGauge("fillgauge4", 9, config);
    var gauge5 = loadLiquidFillGauge("fillgauge5", 9, config);
    var gauge6 = loadLiquidFillGauge("fillgauge6", 9, config);
    var gauge7 = loadLiquidFillGauge("fillgauge7", 1, config);
    var gauge8 = loadLiquidFillGauge("fillgauge8", 6, config);
//});
