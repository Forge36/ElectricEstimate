# ElectricEstimate
Purpose: Provide an easy method to compare various electric rate plans with Alliant Energy.

Background: My energy providers allows me to switch how I pay for electricity between "fixed rate" and "off-peak variable rates".
Depending on how my electricity is charged I may receive a discount *OR* I pay more.

Couple of pain points:
1) I can only export daily usage one day at a time in the GUI.
2) To compare rates I need know both the day, and hour the power was consumed.
3) Alliant locks me into the rate plan for 12 months. 

My solution:
1) Script hourly data retrieval
2) Implement estimate tool based on peak/off-peak usage rate
3) Basic GUI to show the comparison (in dollars)

In effect: This a tool lets me compare the two rates based on my historical usage. From there I determine if I would have paid more or less by switching the previous year.

Assumption: Next years usage will closely follow this year.
Caveats: There was a pandemic and I've been home more than ever before during peak hours. This means future data (should) be a larger gap.


# Peak Hours
All the electricity you use during off-peak hours ─ 8 p.m. until 7 a.m. Monday through Friday during the week and, all hours every weekend and some holidays ─ are billed at a 50% discount.

# Electric Rates
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
