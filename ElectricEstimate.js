// ==UserScript==
// @name         New Userscript
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
    return;
    var loader=document.getElementById("page_loader");
    var navigateDate = function(day) {
        //simulate clicks through UI. Slower but doesn't DOS website (or myself)
        // url: "Usages.aspx/LoadUsage", is the ajax call
        if (loader.style.display === "none"){
            if (day){
                if (!day.previousElementSibling) {
                    day=day.parentElement.previousElementSibling.lastElementChild;
                }
                else
                {
                    day=day.previousElementSibling;
                }
            }
            else
            {
                var calendar = document.querySelector(".ui-datepicker-calendar");
                var newestDay = calendar.firstChild.nextElementSibling.lastElementChild.lastElementChild;
                //performance improvement: skip inacctive days
                day = newestDay;
            }
            day.click();
        }

        setTimeout(function() {
            if (window.kill) { return;}
            if (window.pause) { debugger;}
            navigateDate(day);
        },1000); // while loading wait
    };
    var navToHourly = function() {
        if (loader.style.display !== "none"){
            setTimeout(navToHourly,1000); // while loading wait
        }
        //billing rate is at specific times, need to select right rate;
        var hourly = document.querySelector("[globalize=\"ML_Usage_Btn_Hourly\"");
        hourly.click(); // need to wait for next part of page to load
        setTimeout(navigateDate, 1000);
    }

    setTimeout(function() {
        navToHourly();
     },1000);
    // Your code here...
})();
