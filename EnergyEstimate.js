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