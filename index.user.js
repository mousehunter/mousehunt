// ==UserScript==
// @name         Multi Purpose Mousehunt Bot
// @description  Includes auto claiming chedd-ore on mountain
// @description  Includes auto horn
// @description  Includes auto page refresh
// @namespace    http://tampermonkey.net/
// @version      0.4
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
    
    // Get current hunting location
    const huntingLocation = $('.mousehuntHud-environmentName').text().toLowerCase()


    // HELPERS
    const claimBoulderRewardFn = function (hp) {
        if (hp <= 0 && huntingLocation === 'mountain') {
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
    // End Helpers

    
    
    
    
    
    
    // Claim boulder reward if available on init
    claimBoulderRewardFn(parseInt($('.mountainHUD-boulder-health-percent span').text()), 10)

    // Modify original getSecondsRemaining to include some of our own code
    // getSecondsRemaining is internal mousehunt function that calculates seconds
    // remaining until the next horn, oddly it is called twice every second.
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


    // Listen to ajax response coming from sounding the hunters horn
    hookAjax({
        onreadystatechange : function (xhr) {
            if (xhr.readyState === 4 && xhr.responseURL === 'https://www.mousehuntgame.com/managers/ajax/turns/activeturn.php') {
                if (huntingLocation === 'mountain') {
                    const { user: { quests: { QuestMountain: { boulder_hp: boulderHp } } } } = JSON.parse(xhr.response)
                    claimBoulderRewardFn(boulderHp)
                }
            }
        }
    });

})();
