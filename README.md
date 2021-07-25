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
Caveats: There was a pandemic and I've been home more than ever before.
