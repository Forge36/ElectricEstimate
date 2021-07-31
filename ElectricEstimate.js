// ==UserScript==
// @name         ElectricEstimate
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://myaccount.alliantenergy.com/Portal/Usages.aspx?type=PU
// @icon         https://www.google.com/s2/favicons?domain=alliantenergy.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var GUI=document.createElement("div");
    var leftNam = document.querySelector(".energy_mid_box .nav_left");
	leftNam.appendChild(GUI);

    var meterNumber;
	var dateData = {};
    var date = new Date(); // default to today
    if (localStorage.dateData){
        dateData = JSON.parse(localStorage.dateData); // retrieve saved values to avoid excessive requests

        let dateList = Object.getOwnPropertyNames(dateData); // +3 Update date request to have oldest data
        var oldestDate = new Date(dateList[0]);
        var newestDate = new Date(dateList[0]);
        for (var dateIndex =1;dateIndex<dateList.length;dateIndex++){
            let tmp = new Date(dateList[dateIndex]);
            if (oldestDate > tmp){
            	oldestDate=tmp;
            }
            if (newestDate < tmp){
                newestDate = tmp;
            }
        }
    }
    else{
        oldestDate = new Date();
        newestDate = new Date();
    }

    let dateFormatter = new Intl.DateTimeFormat("en" , {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        timeZone:"UTC",
    });

    // DemandValue: 2.87
    // GenerationValue: 0
    // GenerationValueColorCode: "#fcb119"
    // Hourly: "01:00"
    // UsageColorCode: "#74c045"
    // UsageDate: "07/19/21"
    // UsageValue: 2.87
    // WeatherUsageDate: "07/19/21"

    var usageByHour=[];
    var flattenResponse = function(){
        usageByHour=[];
        //translate usage by day into flat list
        var dateList = Object.getOwnPropertyNames(dateData);
        for (var i=0;i<dateList.length;i++){
            var singleResponse = dateData[dateList[i]];
            for (var j=0;j<singleResponse.length;j++){
                usageByHour.push(singleResponse[j]);
            }
        }
    }

    var peakHourStart = "07:00";
    var peakHourEnd = "20:00";
    var costTypes= [{
        Start: "05/16",
        End: "09/15",
        Standard: 0.11685,
        PeakRate: 0.16359,
        OffPeak: 0.05843,
    },
	{
		Start: "09/16",
		End: "05/15",
		Standard: 0.09969,
		PeakRate: 0.13957,
		OffPeak: 0.04985,
	}
   ];
    var isPeak = function(usage){
        var date = new Date(usage.UsageDate);
        if (date.getDay() === 0 || date.getDay() === 6)
        {
            //Off Peak M-F S&S are off-peak
            return false;
        }
        // [0] needs to go not handling season change
        else if (usage.Hourly.localeCompare(peakHourStart) <1 )
        {
            //Hourly is "previous hours" usage, "PeakStart" applies 7 to 8, an hourly of 7 is off peak
            return false;
        }
        else if (usage.Hourly.localeCompare(peakHourEnd) === 1 )
        {
            //Hourly of 8 is on-peak and 9 is usage from 8 to 9
            return false;
        }
        else if (false)
        {
            //TODO: add holiday exceptions as off=peak;
            // New Year’s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving Day and Christmas Day
            return false;
        }
        else{
            return true;
        }
    }
    var getSeasonRate = function(usageDate){
        if (usageDate.localeCompare(costTypes[1].End)<1){
            return costTypes[1]; // January 1st through May 15th (my winter season end)
        }
        else if (usageDate.localeCompare(costTypes[0].End)<1){
            return costTypes[0]; // May 15th Through September 15th (my summer season)
        }
        else{
            return costTypes[1]; // September 16th through EOY
        }
    };
    var estimateCost = function(){
        var cost = 0;
        var standardCost = 0;
        for (var usageIndex=0;usageIndex<usageByHour.length;usageIndex++){
            var usage = usageByHour[usageIndex];
            var seasonRate = getSeasonRate(usage.UsageDate);
            standardCost += usage.UsageValue*seasonRate.Standard; // standard rate calculation
            if (isPeak(usage)){
                cost += usage.UsageValue*seasonRate.PeakRate;
            }
            else{
                cost += usage.UsageValue*seasonRate.OffPeak;
            }
        }
        GUI.innerHTML = "With Off-Peak: " + cost + "</br>Standard Cost: " + standardCost

        var oldestData = document.createElement("input");
        oldestData.type="date";
        oldestData.valueAsDate = oldestDate; //oldest data
		GUI.appendChild(document.createElement("br"));
		GUI.appendChild(document.createTextNode("Oldest Data: "));
        GUI.appendChild(oldestData);

        var dateStart = document.createElement("input");
        dateStart.type="date";
        dateStart.valueAsDate = newestDate;
        GUI.appendChild(document.createElement("br"));
		GUI.appendChild(document.createTextNode("Newest Data: "));
        GUI.appendChild(dateStart);

        var lookupCount = document.createElement("input");
        lookupCount.type="number";
        lookupCount.value =7; // 7 days history by default
        GUI.appendChild(document.createElement("br"));
		GUI.appendChild(document.createTextNode("Days to Lookup: "));
        GUI.appendChild(lookupCount);

        var button = document.createElement("button");
        button.appendChild(document.createTextNode("Request Older Data"));
        button.onclick = function() {
            requestHourlyData(oldestData.valueAsDate,lookupCount.value, -1);
            return false;
        };
        GUI.appendChild(document.createElement("br"));
        GUI.appendChild(button);

        button = document.createElement("button");
        button.appendChild(document.createTextNode("Request Newer Data"));
        button.onclick = function() {
            requestHourlyData(dateStart.valueAsDate,lookupCount.value, 1);
            return false;
        };
        GUI.appendChild(button);
    }

    var requestHourlyData = function(date, days, direction){
        // should space our requests more
        if (days<=0){
            localStorage.setItem("dateData",JSON.stringify(dateData)); //save latest data
            flattenResponse();
            estimateCost();
            return; // quit
        }
        date.setDate(date.getDate() + direction); // move to previous day
        if (oldestDate > date){
            oldestDate=date;
        }
        if (newestDate < date){
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
            url: "Usages.aspx/LoadUsage",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify(request),
            success: function(n) {
                let usageByHour=JSON.parse(n.d).objUsageGenerationResultSetTwo;
                if (usageByHour.length>0 && usageByHour[0].UsageDate){
                    dateData[usageByHour[0].UsageDate]=usageByHour;
                }
                setTimeout(function() { requestHourlyData(date, days, direction);},100);
            },
            error: function(n) {
                console.log(n.message);
                loader.hideloader()
            }
        });
    }
    var ajaxOrig = $.ajax;
    $.ajax = function() {
		if (arguments[0] && arguments[0].url === "Usages.aspx/LoadUsage" && !meterNumber){
            // intercept request to load data to cache meterNumber
            var data = JSON.parse(arguments[0].data);
            meterNumber = data.MeterNumber;

            // lets not spam requests until this is done
            requestHourlyData(date,-1);
        }
		ajaxOrig.apply($,arguments);
	}
})();
