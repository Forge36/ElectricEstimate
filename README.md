# ElectricEstimate
An easier method to compare two electric rate plans with Alliant Energy.

## Data Retrieval Considerations
1) Hourly day is available in 24 hour chunks
2) I don't know if I'm rate limited (IE: I'll try not to spam requests, or repeat requests by caching historical data)
3) No offical API identified for data export

## GUI
* Cost based on usage using Off-Peak rates
* Cost based on usage using flat rate
* Oldest loaded data 
* Newest loaded data 
* Number of days to lookup data for
* Requesting older data starts at oldest data day
* Requesting newer data starts at newest data day

![GUI](GUI.png)

# Background
1) Alliant provider allows me to choose how I pay for electricity between "fixed rate" and "off-peak variable rates".
2) Locked into the rate plan for 12 months. 
3) No guarantees that switching has reduced costs. I may receive a discount *OR* I pay more.
 
## Assumptions
1) Next years usage will closely follow this year.
2) There was a pandemic and I've been home more than ever before during peak hours. This means future data (should) be a larger gap.

## Peak Hours
All the electricity you use during off-peak hours ─ 8 p.m. until 7 a.m. Monday through Friday during the week and, all hours every weekend and some holidays ─ are billed at a 50% discount.

## Seasonal Rates
From May 16 to September 15

| | RATE 400 | RATE 407 | RATE 407 |
| - | -------- | ----------- | ------------ |
| | Standard | TOD On-Peak | TOD Off-Peak |
| First 16.438 kWh/Day or first 500 kWh/Mo |	$0.11685/kWh | $0.16359/kWh | $0.05843/kWh |
| Next 23.014 kWh/Day or next 700 kWh/Mo | $0.11685/kWh | $0.16359/kWh | $0.05843/kWh |
| Over 39.452 kWh/Day or over 1,200 kWh/Mo	| $0.11685/kWh | $0.16359/kWh | $0.05843/kWh |

Winter energy charge
From September 16 to May 15

|   | RATE 400 | RATE 407 | RATE 407 |
| - | -------- | ----------- | ------------ |
|   | Standard   | TOD On-Peak | TOD Off-Peak |
|First 16.438 kWh/Day or first 500 kWh/Mo |	$0.09969/kWh | $0.13957/kWh | $0.04985/kWh |
| Next 23.014 kWh/Day or next 700 kWh/Mo | $0.07721/kWh | $0.10809/kWh | $0.03861/kWh |
| Over 39.452 kWh/Day or over 1,200 kWh/Mo | $0.03932/kWh | $0.05505/kWh| $0.01966/kWh |
