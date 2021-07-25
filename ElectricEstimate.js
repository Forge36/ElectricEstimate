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
	GUI.style.position="fixed";
	GUI.style.zIndex="999";
	GUI.style.width="300px";
	GUI.style.height="100px";
	GUI.style.marginTop="600px";
	document.body.insertBefore(GUI,document.body.children[0]);

    var dateData = {};
    var date = new Date(); // default to today
    if (localStorage.dateData){
        dateData = JSON.parse(localStorage.dateData); // retrieve saved values to avoid excessive requests

        let dateIndex = Object.getOwnPropertyNames(dateData); // +3 Update date request to have oldest data
        let oldest=dateIndex[dateIndex.length -1]; // assumes descending sort
        date = new Date(oldest); // when cache data exist set load start to today
		// TODO: support fetching data newer than first run
    }

    var days = -1; // lets not spam requests until this is done

    let dateFormatter = new Intl.DateTimeFormat("en" , {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
    });

    var requestHourlyData = function(){
        // should space our requests more
        date.setDate(date.getDate()-1); // move to previous day
        if (days<0){
            debugger;
            localStorage.setItem("dateData",JSON.stringify(dateData)); //save latest data
            return; // quit
        }
        days--;
        var request =
            {
                DateFromDaily: "",
                DateToDaily: "",
                MeterNumber: "740382",
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
                setTimeout(requestHourlyData,1000);
            },
            error: function(n) {
                console.log(n.message);
                loader.hideloader()
            }
        });
    }
    requestHourlyData();

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
    flattenResponse();

    var costTypes= [{
        Start: "05/16",
        End: "09/15",
        PeakStart: "07:00",
        Standard: 0.11685,
        PeakRate: 0.16359,
        PeakEnd: "20:00",
        OffPeak: 0.05843,
    },
	{
		Start: "09/16",
		End: "05/15",
		PeakStart: "07:00",
		Standard: 0.09969,
		PeakRate: 0.13957,
		PeakEnd: "20:00",
		OffPeak: 0.04985,
	}
   ]
    var estimateCost = function(){
        var cost = 0;
        var standardCost = 0;
        var peak = false;
        for (var usageIndex=0;usageIndex<usageByHour.length;usageIndex++){
            var usage = usageByHour[usageIndex];
            var date = new Date(usage.UsageDate);
            var season=-1;
            if (usage.UsageDate.localeCompare(costTypes[1].End)<1){
                season=1; // January 1st through May 15th (my winter season end)
            }
            else if (usage.UsageDate.localeCompare(costTypes[0].End)<1){
                season=0; // May 15th Through September 15th (my summer season)
            }
            else{
                season=1; // September 16th through EOY
            }
            if (date.getDay() === 0 || date.getDay() === 6)
            {
                //Off Peak M-F S&S are off-peak
                peak=false;
            }
            // [0] needs to go not handling season change
            else if (usage.Hourly.localeCompare(costTypes[season].PeakStart) <1 )
            {
                //Hourly is "previous hours" usage, "PeakStart" applies 7 to 8, an hourly of 7 is off peak
                peak=false;
            }
            else if (usage.Hourly.localeCompare(costTypes[season].PeakEnd) === 1 )
            {
                //Hourly of 8 is on-peak and 9 is usage from 8 to 9
                peak=false;
            }
            else if (false)
            {
                //TODO: add holiday exceptions as off=peak;
                // New Year’s Day, Memorial Day, Independence Day, Labor Day, Thanksgiving Day and Christmas Day
                peak = false;
            }
            else{
                peak = true;
            }
            standardCost += usage.UsageValue*costTypes[season].Standard; // standard rate calculation
            if (peak){
                cost += usage.UsageValue*costTypes[season].PeakRate;
            }
            else{
                cost += usage.UsageValue*costTypes[season].OffPeak;
            }
        }
        GUI.innerHTML = "With Off-Peak: " + cost + "</br>Standard Cost: " + standardCost
    }
    estimateCost();
})();
