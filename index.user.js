// ==UserScript==
// @name         Multi Purpose Mousehunt Bot
// @description  Includes auto claiming chedd-ore on mountain
// @description  Includes auto horn
// @description  Includes auto page refresh
// @namespace    http://tampermonkey.net/
// @version      0.1
// @author       You
// @match        https://www.mousehuntgame.com/*
// @grant        none
// @require      https://unpkg.com/ajax-hook/dist/ajaxhook.min.js
// ==/UserScript==

(function () {
    'use strict'
    const hookAjax = window.hookAjax
    const getSecondsRemainingFn = window.HuntersHorn.getSecondsRemaining
    const $ = window.jQuery

    // Get hunting location
    const huntingLocation = $('.mousehuntHud-environmentName').text().toLowerCase()

    // When timer gets below 1 this variable gets reset
    let timeToRefresh = Math.floor(Math.random() * 3600);

    // Refresh page countdown
    window.setInterval(function () {
        --timeToRefresh

        if (timeToRefresh > 1) {
            // Create refresh element if it does not exist
            if ($('#refresh-container').length <= 0) {
                $('#hgAppContainer').prepend(`<h1 id="refresh-container">Refresh page in: ${timeCounter(timeToRefresh)}</h1>`)

            // Else update content on the element
            } else {
                $('#refresh-container').html(`Refresh page in: ${timeCounter(timeToRefresh)}`)
            }
        } else {
            location.reload()
        }
    }, 1000)


    // Modify original getSecondsRemaining to include some of our own code
    window.HuntersHorn.getSecondsRemaining = function () {
        const remaining = getSecondsRemainingFn()

        if (remaining <= 0) {
            // If horn is ready, sound it after random 5-30 seconds
            setTimeout(function (){
                const isHornPresent = $('#envHeaderImg').hasClass('hornReady')
                const hornElement = $('.mousehuntHud-huntersHorn-container a')[0]

                // Check if horn image is present (we can sound the horn)
                if (isHornPresent) {
                    fireEvent(hornElement, 'click')
                }

            }, (Math.floor(Math.random() * 26) + 5) * 1000)
        }
        return remaining
    }


    // Listen to ajax request for sounding horn
    hookAjax({
        onreadystatechange : function (xhr) {
            if (xhr.readyState === 4 && xhr.responseURL === 'https://www.mousehuntgame.com/managers/ajax/turns/activeturn.php') {
                // Check if we are hunting on mountain
                if (huntingLocation === 'mountain') {
                    // Extract boulder hp from the response object
                    const { user: { quests: { QuestMountain: { boulder_hp: boulderHp } } } } = JSON.parse(xhr.response)

                    // Check if we the boulder is smashed
                    if (boulderHp <= 0) {
                        // Wait for the reward to be visible in the UI
                        setTimeout(function () {
                            const isBoulderRewardPresent = $('.mountainHUD-boulderContainer').hasClass('can_claim')
                            const boulderRewardElement = $('.mountainHUD-boulder a')[0]

                            // Check if reward button is present (we can claim the cheese)
                            if (isBoulderRewardPresent) {
                                fireEvent(boulderRewardElement, 'click')
                            }
                        }, 2000)
                    }
                }
            }
        }
    });










    // HELPERS
    const timeCounter = function (t) {
        var days = parseInt(t / 86400);
        t = t - (days * 86400);
        var hours = parseInt(t / 3600);
        t = t - (hours * 3600);
        var minutes = parseInt(t / 60);
        t = t - (minutes * 60);
        var content = "";
        if (days) content += days + " days";
        if (hours || days) {
            if (content) content += ", ";
            content += hours + " hours";
        }
        if (content) content += ", ";
        content += minutes + " minutes and " + t + " seconds.";
        return content;
    }

    const fireEvent = function (element, event) {
        let evt

        if (document.createEventObject) {
            // dispatch for IE
            evt = document.createEventObject();

            try {
                return element.fireEvent('on' + event, evt);
            } finally {
                element = null;
                event = null;
                evt = null;
            }
        } else {
            // dispatch for firefox + others
            evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true ); // event type, bubbling, cancelable

            try {
                return !element.dispatchEvent(evt);
            } finally {
                element = null;
                event = null;
                evt = null;
            }
        }
    }
})();
