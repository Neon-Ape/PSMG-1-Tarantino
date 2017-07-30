/*!
 * @license Open source under BSD 2-clause (http://choosealicense.com/licenses/bsd-2-clause/)
 * Copyright (c) 2015, Curtis Bratton
 * All rights reserved.
 *
 * Liquid Fill Gauge v1.1
 */
function liquidGauge() {
    function liquidFillGaugeDefaultSettings() {
        return {
            minValue: 0, // The gauge minimum value.
            maxValue: 10, // The gauge maximum value.
            circleThickness: 0.05, // The outer circle thickness as a percentage of it's radius.
            circleFillGap: 0.05, // The size of the gap between the outer circle and wave circle as a percentage of the outer circles radius.
            circleColor: "#600322", // The color of the outer circle.
            waveHeight: 0.05, // The wave height as a percentage of the radius of the wave circle.
            waveCount: 1, // The number of full waves per width of the wave circle.
            waveRiseTime: 3500, // The amount of time in milliseconds for the wave to rise from 0 to it's final height.
            waveAnimateTime: 18000, // The amount of time in milliseconds for a full wave to enter the wave circle.
            waveRise: true, // Control if the wave should rise from 0 to it's full height, or start at it's full height.
            waveHeightScaling: true, // Controls wave size scaling at low and high fill percentages. When true, wave height reaches it's maximum at 50% fill, and minimum at 0% and 100% fill. This helps to prevent the wave from making the wave circle from appear totally full or empty when near it's minimum or maximum fill.
            waveAnimate: true, // Controls if the wave scrolls or is static.
            waveColor: "#600322", // The color of the fill wave.
            waveOffset: 0, // The amount to initially offset the wave. 0 = no offset. 1 = offset of one full wave.
            textVertPosition: .5, // The height at which to display the percentage text withing the wave circle. 0 = bottom, 1 = top.
            textSize: 1, // The relative height of the text to display in the wave circle. 1 = 50%
            valueCountUp: true, // If true, the displayed value counts up from 0 to it's final value upon loading. If false, the final value is displayed.
            displayPercent: false, // If true, a % symbol is displayed after the value.
            textColor: "#600322", // The color of the value text when the wave does not overlap it.
            waveTextColor: "#8F4E64" // The color of the value text when the wave overlaps it.
        };
    }

    var config = liquidFillGaugeDefaultSettings();
    config.circleThickness = 0.1;
    config.circleColor = "#8F4E64";
    config.textColor = "#600322";
    config.waveTextColor = "#a57183";
    config.waveColor = "#600322";
    config.textVertPosition = 0.52;
    config.waveAnimateTime = 5000;
    config.waveHeight = 0;
    config.waveAnimate = true;
    config.waveCount = 1;
    config.waveOffset = 1;
    config.textSize = 1.2;
    config.displayPercent = false;
    config.valueCountUp = true;

    var chart = function (ratingType, data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
           loadLiquidFillGauge(ratingType + "fillgauge" + (i+1), data[i].rating, VAR_GET_CLASS(data[i].movie),config);
           console.log(ratingType + "fillgauge" + (i+1));

        }

/*
        var gauge1 = loadLiquidFillGauge("fillgauge1", 8.3, config);
        var gauge2 = loadLiquidFillGauge("fillgauge2", 8.9, config);
        var gauge3 = loadLiquidFillGauge("fillgauge3", 7.5, config);
        var gauge4 = loadLiquidFillGauge("fillgauge4", 8.1, config);
        var gauge5 = loadLiquidFillGauge("fillgauge5", 8.0, config);
        var gauge6 = loadLiquidFillGauge("fillgauge6", 8.3, config);
        var gauge7 = loadLiquidFillGauge("fillgauge7", 8.4, config);
        */
    };

    function loadLiquidFillGauge(elementId, value, circleClass, config) {
        console.log("Liquidgauge( elementId: " + elementId + ", value: " + value + ")");
        console.log(config);
        if (config === null) {
            config = liquidFillGaugeDefaultSettings();
        }

        var gauge = d3.select("#" + elementId);
        var radius = Math.min(parseInt(gauge.style("width")), parseInt(gauge.style("height"))) / 2;
        var locationX = parseInt(gauge.style("width")) / 2 - radius;
        var locationY = parseInt(gauge.style("height")) / 2 - radius;
        var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;

        console.log("some Variables set!");

        var waveHeightScale;
        if (config.waveHeightScaling) {
            waveHeightScale = d3.scaleLinear()
                .range([0, config.waveHeight, 0])
                .domain([0, 50, 100]);
        } else {
            waveHeightScale = d3.scaleLinear()
                .range([config.waveHeight, config.waveHeight])
                .domain([0, 100]);
        }

        var textPixels = (config.textSize * radius / 2);
        var textFinalValue = parseFloat(value).toFixed(2);
        console.log(textFinalValue);
        var textStartValue = config.valueCountUp ? config.minValue : textFinalValue;
        var percentText = config.displayPercent ? "%" : "";
        var circleThickness = config.circleThickness * radius;
        var circleFillGap = config.circleFillGap * radius;
        var fillCircleMargin = circleThickness + circleFillGap;
        var fillCircleRadius = radius - fillCircleMargin;
        var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);

        var waveLength = fillCircleRadius * 2 / config.waveCount;
        var waveClipCount = 1 + config.waveCount;
        var waveClipWidth = waveLength * waveClipCount;

        // Rounding functions so that the correct number of decimal places is always displayed as the value counts up.
        var textRounder = function (value) {
            return Math.round(value);
        };
        if (parseFloat(textFinalValue) !== parseFloat(textRounder(textFinalValue))) {
            textRounder = function (value) {
                return parseFloat(value).toFixed(1);
            };
        }
        if (parseFloat(textFinalValue) !== parseFloat(textRounder(textFinalValue))) {
            textRounder = function (value) {
                return parseFloat(value).toFixed(2);
            };
        }

        console.log("all variables set!");

        // Data for building the clip wave area.
        var data = [];
        for (var i = 0; i <= 40 * waveClipCount; i++) {
            data.push({x: i / (40 * waveClipCount), y: (i / (40))});
        }

        // Scales for drawing the outer circle.
        var gaugeCircleX = d3.scaleLinear().range([0, 2 * Math.PI]).domain([0, 1]);
        var gaugeCircleY = d3.scaleLinear().range([0, radius]).domain([0, radius]);

        // Scales for controlling the size of the clipping path.
        var waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
        var waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);

        // Scales for controlling the position of the clipping path.
        var waveRiseScale = d3.scaleLinear()
        // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
        // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
        // circle at 100%.
            .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
            .domain([0, 1]);
        var waveAnimateScale = d3.scaleLinear()
            .range([0, waveClipWidth - fillCircleRadius * 2]) // Push the clip area one full wave then snap back.
            .domain([0, 1]);

        // Scale for controlling the position of the text within the gauge.
        var textRiseScaleY = d3.scaleLinear()
            .range([fillCircleMargin + fillCircleRadius * 2, (fillCircleMargin + textPixels * 0.7)])
            .domain([0, 1]);

        // Center the gauge within the parent SVG.
        var gaugeGroup = gauge.append("g")
            .attr('transform', 'translate(' + locationX + ',' + locationY + ')');

        // Draw the outer circle.
        var gaugeCircleArc = d3.arc()
            .startAngle(gaugeCircleX(0))
            .endAngle(gaugeCircleX(1))
            .outerRadius(gaugeCircleY(radius))
            .innerRadius(gaugeCircleY(radius - circleThickness));
        gaugeGroup.append("path")
            .attr("d", gaugeCircleArc)
            .classed("liquidFillOuterCircle", true)
            .attr('transform', 'translate(' + radius + ',' + radius + ')');

        // Text where the wave does not overlap.
        var text1 = gaugeGroup.append("text")
            .text(textRounder(textStartValue) + percentText)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');
        var text1InterpolatorValue = textStartValue;

        // The clipping wave area.
        var clipArea = d3.area()
            .x(function (d) {
                return waveScaleX(d.x);
            })
            .y0(function (d) {
                return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
            })
            .y1(function (d) {
                return (fillCircleRadius * 2 + waveHeight);
            });
        var waveGroup = gaugeGroup.append("defs")
            .append("clipPath")
            .attr("id", "clipWave" + elementId);
        var wave = waveGroup.append("path")
            .datum(data)
            .attr("d", clipArea)
            .attr("T", 0);

        // The inner circle with the clipping wave attached.
        var fillCircleGroup = gaugeGroup.append("g")
            .attr("clip-path", "url(#clipWave" + elementId + ")");
        fillCircleGroup.append("circle")
            .classed(circleClass, true)
            .attr("cx", radius)
            .attr("cy", radius)
            .attr("r", fillCircleRadius);

        // Text where the wave does overlap.
        var text2 = fillCircleGroup.append("text")
            .text(textRounder(textStartValue) + percentText)
            .attr("class", "liquidFillGaugeText")
            .attr("text-anchor", "middle")
            .attr("font-size", textPixels + "px")
            .attr('transform', 'translate(' + radius + ',' + textRiseScaleY(config.textVertPosition) + ')');
        var text2InterpolatorValue = textStartValue;

        // Make the value count up.
        if(config.valueCountUp){
            text1.transition()
                .duration(config.waveRiseTime)
                .tween("text", function() {
                    const i = d3.interpolateNumber(text1InterpolatorValue, textFinalValue);
                    return function(t){
                        text1InterpolatorValue = textRounder(i(t));
                        // Set the gauge's text with the new value and append the % sign
                        // to the end
                        text1.text(text1InterpolatorValue + percentText);
                    }
                });
            text2.transition()
                .duration(config.waveRiseTime)
                .tween("text", function() {
                    const i = d3.interpolateNumber(text2InterpolatorValue, textFinalValue);
                    return function(t){
                        text2InterpolatorValue = textRounder(i(t));
                        // Set the gauge's text with the new value and append the % sign
                        // to the end
                        text2.text(text2InterpolatorValue + percentText);
                    }
                });
        }

        // Make the wave rise. wave and waveGroup are separate so that horizontal and vertical movement can be controlled independently.
        var waveGroupXPosition = fillCircleMargin + fillCircleRadius * 2 - waveClipWidth;
        if (config.waveRise) {
            waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(0) + ')')
                .transition()
                .duration(config.waveRiseTime)
                .attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')')
                .on("start", function () {
                    wave.attr('transform', 'translate(1,0)');
                }); // This transform is necessary to get the clip wave positioned correctly when waveRise=true and waveAnimate=false. The wave will not position correctly without this, but it's not clear why this is actually necessary.
        } else {
            waveGroup.attr('transform', 'translate(' + waveGroupXPosition + ',' + waveRiseScale(fillPercent) + ')');
        }

        console.log("Stuff set");
        console.log(config.waveAnimate);

        if (config.waveAnimate) {
            animateWave();
        }

        function animateWave() {
            wave.attr('transform', 'translate(' + waveAnimateScale(wave.attr('T')) + ',0)');
            wave.transition()
                .duration(config.waveAnimateTime * (1 - wave.attr('T')));
            console.log("set duration");
            wave.transition()
                .ease(d3.easeLinear);
            console.log("set ease");
            wave.transition()
                .attr('transform', 'translate(' + waveAnimateScale(1) + ',0)');
            console.log("set attr(transform)");
            wave.transition()
                .attr('T', 1);
            console.log("set attr(T");
            wave.transition()
                .on('end', function () {
                    wave.attr('T', 0);
                    //animateWave();
                });
            console.log("animateWave finished");
        }

        /*
         function GaugeUpdater() {
         this.update = function (value) {
         var newFinalValue = parseFloat(value).toFixed(2);
         var textRounderUpdater = function (value) {
         return Math.round(value);
         };
         if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
         textRounderUpdater = function (value) {
         return parseFloat(value).toFixed(1);
         };
         }
         if (parseFloat(newFinalValue) != parseFloat(textRounderUpdater(newFinalValue))) {
         textRounderUpdater = function (value) {
         return parseFloat(value).toFixed(2);
         };
         }

         var textTween = function () {
         var i = d3.interpolate(this.textContent, parseFloat(value).toFixed(2));
         return function (t) {
         this.textContent = textRounderUpdater(i(t)) + percentText;
         }
         };

         text1.transition()
         .duration(config.waveRiseTime)
         .tween("text", textTween);
         text2.transition()
         .duration(config.waveRiseTime)
         .tween("text", textTween);

         var fillPercent = Math.max(config.minValue, Math.min(config.maxValue, value)) / config.maxValue;
         var waveHeight = fillCircleRadius * waveHeightScale(fillPercent * 100);
         var waveRiseScale = d3.scaleLinear()
         // The clipping area size is the height of the fill circle + the wave height, so we position the clip wave
         // such that the it will overlap the fill circle at all when at 0%, and will totally cover the fill
         // circle at 100%.
         .range([(fillCircleMargin + fillCircleRadius * 2 + waveHeight), (fillCircleMargin - waveHeight)])
         .domain([0, 1]);
         var newHeight = waveRiseScale(fillPercent);
         var waveScaleX = d3.scaleLinear().range([0, waveClipWidth]).domain([0, 1]);
         var waveScaleY = d3.scaleLinear().range([0, waveHeight]).domain([0, 1]);
         var newClipArea;
         if (config.waveHeightScaling) {
         newClipArea = d3.area()
         .x(function (d) {
         return waveScaleX(d.x);
         })
         .y0(function (d) {
         return waveScaleY(Math.sin(Math.PI * 2 * config.waveOffset * -1 + Math.PI * 2 * (1 - config.waveCount) + d.y * 2 * Math.PI));
         })
         .y1(function (d) {
         return (fillCircleRadius * 2 + waveHeight);
         });
         } else {
         newClipArea = clipArea;
         }

         var newWavePosition = config.waveAnimate ? waveAnimateScale(1) : 0;
         wave.transition()
         .duration(0)
         .transition()
         .duration(config.waveAnimate ? (config.waveAnimateTime * (1 - wave.attr('T'))) : (config.waveRiseTime))
         .ease('linear')
         .attr('d', newClipArea)
         .attr('transform', 'translate(' + newWavePosition + ',0)')
         .attr('T', '1')
         .on("end", function () {
         if (config.waveAnimate) {
         wave.attr('transform', 'translate(' + waveAnimateScale(0) + ',0)');
         animateWave(config.waveAnimateTime);
         }
         });
         waveGroup.transition()
         .duration(config.waveRiseTime)
         .attr('transform', 'translate(' + waveGroupXPosition + ',' + newHeight + ')')
         }
         }

         return new GaugeUpdater();
         */
    }

    return chart;
}