// ==UserScript==
// @name         ElectricEstimate
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://myaccount.alliantenergy.com/Portal/Usages.aspx?type=PU
// @icon         https://www.google.com/s2/favicons?domain=alliantenergy.com
// @grant        none
// ==/UserScript==

declare const $: any;
declare const loader: any;
(function () {
    'use strict';
    var GUI = document.createElement("div");
    var leftNam = document.querySelector(".energy_mid_box .nav_left");
    leftNam.appendChild(GUI);

    var meterNumber: number;
    var dateData = {};
    var date = new Date(); // default to today
    if (localStorage.dateData) {
        dateData = JSON.parse(localStorage.dateData); // retrieve saved values to avoid excessive requests

        let dateList = Object.getOwnPropertyNames(dateData); // +3 Update date request to have oldest data
        var oldestDate = new Date(dateList[0]);
        var newestDate = new Date(dateList[0]);
        for (var dateIndex = 1; dateIndex < dateList.length; dateIndex++) {
            let tmp = new Date(dateList[dateIndex]);
            if (oldestDate > tmp) {
                oldestDate = tmp;
            }
            if (newestDate < tmp) {
                newestDate = tmp;
            }
        }
    }
    else {
        oldestDate = new Date();
        newestDate = new Date();
    }

    let dateFormatter = new Intl.DateTimeFormat("en", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
    });

    type Usage = {
        DemandValue: number,// DemandValue: 2.87
        GenerationValue: number,// GenerationValue: 0
        GenerationValueColorCode: number,// GenerationValueColorCode: "#fcb119"
        Hourly: string,// Hourly: "01:00"
        UsageColorCode: string,// UsageColorCode: "#74c045"
        UsageDate: string,// UsageDate: "07/19/21"
        UsageValue: number,// UsageValue: 2.87
        WeatherUsageDate: number,// WeatherUsageDate: "07/19/21"

    }

    var usageByHour: Usage[] = [];
    var flattenResponse = function () {
        usageByHour = [];
        //translate usage by day into flat list
        var dateList = Object.getOwnPropertyNames(dateData);
        for (var i = 0; i < dateList.length; i++) {
            var singleResponse = dateData[dateList[i]];
            for (var j = 0; j < singleResponse.length; j++) {
                usageByHour.push(singleResponse[j]);
            }
        }
    }

    type CostRate = {
        highHourStart?: string,
        highHourEnd?: string,
        lowHourStart?: string,
        lowHourEnd?: string,
        Start?: string,
        End?: string,
        Standard: number,
        HighRate?: number,
        LowRate?: number,
        DayRate?: number,

    }

    type CostTypes = {
        RG5: CostRate[],
        RG1: CostRate[],
        RD1: CostRate[],
    };
    type Cost = number;
    type CostByRate = {
        RG5: number;
        RG1: number;
        RD1: number;
    };
    var costTypes: CostTypes =
    {
        RG5: [
            {
                highHourStart: "11:00",
                highHourEnd: "20:00",
                HighRate: 0.19600,
                lowHourStart: "23:00",
                lowHourEnd: "06:00",
                LowRate: 0.07900,
                Start: "06/01",
                End: "08/31",
                Standard: 0.16300,
            },
            {
                highHourStart: "17:00",
                highHourEnd: "21:00",
                HighRate: 0.19600,
                lowHourStart: "23:00",
                lowHourEnd: "06:00",
                LowRate: 0.07900,
                Start: "12/01",
                End: "02/29",
                Standard: 0.16300,
            },
            {
                LowRate: 0.07900,
                Standard: 0.16300,
                DayRate: 0.4932,
            },
        ],
        RG1:
            [
                {
                    Standard: 0.13091,
                    DayRate: 0.4932,
                },
                {
                    Standard: 0.13091,
                    DayRate: 0.4932,
                },
                {
                    Standard: 0.13091,
                    DayRate: 0.4932,
                },
            ],
        RD1: [
            {
                highHourStart: "11:00",
                highHourEnd: "20:00",
                HighRate: 0.17520,
                lowHourStart: "23:00",
                lowHourEnd: "06:00",
                LowRate: 0.07100,
                Start: "06/01",
                End: "08/31",
                Standard: 0.13400,
            },
            {
                highHourStart: "17:00",
                highHourEnd: "21:00",
                HighRate: 0.17520,
                lowHourStart: "23:00",
                lowHourEnd: "06:00",
                LowRate: 0.07100,
                Start: "12/01",
                End: "02/29",
                Standard: 0.13400,
            },
            {
                LowRate: 0.07100,
                Standard: 0.13400,
                DayRate: 0.3288,
            },
        ],
    }
        ;
    const getCost = function (usage: Usage, rate: CostRate): Cost {
        var date = new Date(usage.UsageDate);
        // I make assumptions about the Day's rate shape. Low -> Standard -> High -> Standard -> Low
        //TODO: add holiday exceptions as lowRate
        if ((date.getDay() === 0 || date.getDay() === 6) && rate.LowRate) {
            //Off Peak M-F S&S are off-peak
            return rate.LowRate;
        }
        else if (rate.lowHourEnd != undefined && usage.Hourly.localeCompare(rate.lowHourEnd) < 1 && rate.LowRate) {
            // Low hour ends in the morning 0000-0600
            return rate.LowRate;
        }
        else if (rate.highHourStart != undefined && usage.Hourly.localeCompare(rate.highHourStart) < 1) {
            //Hourly is "previous hours" usage, "PeakStart" applies 7 to 8, an hourly of 7 is off peak
            return rate.Standard;
        }
        else if (rate.highHourEnd != undefined && usage.Hourly.localeCompare(rate.highHourEnd) < 1 && rate.HighRate) {
            //Hourly of 8 is on-peak and 9 is usage from 8 to 9
            return rate.HighRate;
        }
        else if (rate.lowHourStart != undefined && usage.Hourly.localeCompare(rate.lowHourStart) < 1) {
            //Hourly of 8 is on-peak and 9 is usage from 8 to 9
            return rate.Standard;
        }
        else if (rate.LowRate) {
            return rate.LowRate;
        }
        else {
            return rate.Standard;
        }
    }
    var getSeasonRate = function (usageDate: string, costRate: CostRate[]): CostRate {
        var month = new Date(usageDate).getMonth() + 1; // +1 months are zero indexed
        // I make assumptions about the order of the rates: Summer, Winter, Other
        switch (month) {
            case 12:
            case 1:
            case 2:
                return costRate[1];
            case 3:
            case 4:
            case 5:
                return costRate[2];
            case 6:
            case 7:
            case 8:
                return costRate[0];
            case 9:
            case 10:
            case 11:
                return costRate[2];
        }
        debugger; // assert months are real
    };
    var estimateCost = function () {
        var cost: CostByRate = {
            RD1: 0,
            RG1: 0,
            RG5: 0,
        };
        GUI.innerHTML = "";
        for (var priceType of Object.keys(costTypes)) {
            const rate = costTypes[priceType];
            for (let usageIndex = 0; usageIndex < usageByHour.length; usageIndex++) {
                const usage = usageByHour[usageIndex];
                const seasonRate = getSeasonRate(usage.UsageDate, rate);
                cost[priceType] += usage.UsageValue * getCost(usage, seasonRate);
            }
            GUI.innerHTML += "With " + priceType + ": " + cost[priceType] + "</br>";
        }

        var oldestData = document.createElement("input");
        oldestData.type = "date";
        oldestData.valueAsDate = oldestDate; //oldest data
        GUI.appendChild(document.createElement("br"));
        GUI.appendChild(document.createTextNode("Oldest Data: "));
        GUI.appendChild(oldestData);

        var dateStart = document.createElement("input");
        dateStart.type = "date";
        dateStart.valueAsDate = newestDate;
        GUI.appendChild(document.createElement("br"));
        GUI.appendChild(document.createTextNode("Newest Data: "));
        GUI.appendChild(dateStart);

        var lookupCount: HTMLInputElement = document.createElement("input");
        lookupCount.type = "number";
        lookupCount.value = "7"; // 7 days history by default
        GUI.appendChild(document.createElement("br"));
        GUI.appendChild(document.createTextNode("Days to Lookup: "));
        GUI.appendChild(lookupCount);

        var button = document.createElement("button");
        button.appendChild(document.createTextNode("Request Older Data"));
        button.onclick = function () {
            requestHourlyData(oldestData.valueAsDate, parseInt(lookupCount.value), -1);
            return false;
        };
        GUI.appendChild(document.createElement("br"));
        GUI.appendChild(button);

        button = document.createElement("button");
        button.appendChild(document.createTextNode("Request Newer Data"));
        button.onclick = function () {
            requestHourlyData(dateStart.valueAsDate, parseInt(lookupCount.value), 1);
            return false;
        };
        GUI.appendChild(button);
    }

    var requestHourlyData = function (date: Date, days: number, direction?: number) {
        // should space our requests more
        if (days <= 0) {
            localStorage.setItem("dateData", JSON.stringify(dateData)); //save latest data
            flattenResponse();
            estimateCost();
            return; // quit
        }
        date.setDate(date.getDate() + direction); // move to previous day
        if (oldestDate > date) {
            oldestDate = date;
        }
        if (newestDate < date) {
            newestDate = date;
        }
        days--;

        var request = {
            DateFromDaily: "",
            DateToDaily: "",
            MeterNumber: meterNumber,
            Mode: "H",
            SeasonId: 0,
            Type: "K",
            UsageOrGeneration: "1",
            hourlyType: "H",
            strDate: dateFormatter.format(date), //"07/19/21", // need to translate from date in loop + range
            usageyear: "",
            weatherOverlay: 0
        }
        $.ajax({
            type: "POST",
            url: "https://myaccount.alliantenergy.com/Portal/Usages.aspx/LoadUsage",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(request),
            success: function (n) {
                let usageByHour = JSON.parse(n.d).objUsageGenerationResultSetTwo;
                if (usageByHour.length > 0 && usageByHour[0].UsageDate) {
                    dateData[usageByHour[0].UsageDate] = usageByHour;
                }
                setTimeout(function () { requestHourlyData(date, days, direction); }, 100);
            },
            error: function (n) {
                console.log(n.message);
                loader.hideloader()
            }
        });
    }
    var ajaxOrig = $.ajax;
    $.ajax = function () {
        if (arguments[0] && arguments[0].url === "https://myaccount.alliantenergy.com/Portal/Usages.aspx/LoadUsage" && !meterNumber) {
            // intercept request to load data to cache meterNumber
            var data = JSON.parse(arguments[0].data);
            meterNumber = data.MeterNumber;

            // lets not spam requests until this is done
            requestHourlyData(date, -1);
        }
        ajaxOrig.apply($, arguments);
    }
})();
