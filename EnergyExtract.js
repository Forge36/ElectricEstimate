var dateData = {};
var date = new Date(); // default to today
if (localStorage.dateData){
	dateData = JSON.parse(localStorage.dateData); // retrieve saved values to avoid excessive requests
	
	let dateIndex = Object.getOwnPropertyNames(dateData); // +3 Update date request to have oldest data
	let oldest=dates[dates.length -1]; // assumes descending sort & only 1 years worth of data
	date = new Date(oldest);
}

var days = 30; // lets not spam requests until this is done //365*years;

var data = [];
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
			data.push(n);
			setTimeout(requestHourlyData,1000);
		},
		error: function(n) {
			console.log(n.message);
			loader.hideloader()
		}
	});	
}
requestHourlyData();