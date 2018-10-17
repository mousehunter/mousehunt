// ==UserScript==
// @name         Multi Purpose Mousehunt Bot
// @description  Includes auto claiming chedd-ore on mountain
// @description  Includes auto horn
// @description  Includes auto page refresh
// @namespace    http://tampermonkey.net/
// @version      0.6
// @author       You
// @match        https://www.mousehuntgame.com/*
// @grant        none
// @require      https://unpkg.com/ajax-hook/dist/ajaxhook.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-simulate/1.0.1/jquery.simulate.js
// ==/UserScript==

(function () {
  'use strict'
  const hookAjax = window.hookAjax
  const getSecondsRemainingFn = window.HuntersHorn.getSecondsRemaining
  const $ = window.jQuery
  
  // START HELPERS

  // Helper for claiming boulder reward on mountain
  const claimBoulderRewardFn = hp => {
    if (hp <= 0 && $('.mousehuntHud-environmentName').text().toLowerCase() === 'mountain') {
      setTimeout(
        () =>
          $('.mountainHUD-boulderContainer').hasClass('can_claim') ?
            $('.mountainHUD-boulder .mousehuntActionButton small').simulate('click') :
            null,
        2000
      )
    }
  }

  // Helper for claiming halloween ship reward
  const claimHalloweenRewardFn = () => {
    const hp = parseInt($('.halloweenHUD-campBanner-shipHP-hpBar').css('width'), 10)
    if (hp <= 0) {
      setTimeout(
        () =>
          $('.halloweenHUD-campBanner').hasClass('hasReward') ?
            $('.halloweenHUD-campBanner-claimReward').simulate('click') :
            null,
        2000
      )
    }
  }

  // END HELPERS

  // START INIT FUNCTION CALLS

  claimBoulderRewardFn(parseInt($('.mountainHUD-boulder-health-percent span').text(), 10)) // Claim boulder reward if available on init
  claimHalloweenRewardFn() // Claim haunted ship reward if available on init
  
  // END INIT FUNCTION CALLS

  // Modify original getSecondsRemaining to include some of our own code
  // getSecondsRemaining is internal mousehunt function that calculates seconds
  // remaining until the next horn, oddly it is called twice every second.
  window.HuntersHorn.getSecondsRemaining = function () {
    const remaining = getSecondsRemainingFn()
    if (remaining <= 0) {
      // If horn is ready, sound it after random 5-30 seconds
      setTimeout(
        () =>
          $('#envHeaderImg').hasClass('hornReady') ?
            $('.mousehuntHud-huntersHorn').simulate('click') :
            null,
        (Math.floor(Math.random() * 26) + 5) * 1000
      )
    }
    return remaining
  }


  // Listen to ajax response coming from sounding the hunters horn
  hookAjax({
    onreadystatechange : function (xhr) {
      if (xhr.readyState === 4 && xhr.responseURL === 'https://www.mousehuntgame.com/managers/ajax/turns/activeturn.php') {
        
        if ($('.mousehuntHud-environmentName').text().toLowerCase() === 'mountain') {
          const { user: { quests: { QuestMountain: { boulder_hp: boulderHp } } } } = JSON.parse(xhr.response)
          claimBoulderRewardFn(boulderHp)
        }
        
        setTimeout(() => claimHalloweenRewardFn(), 2000)
      }
    }
  })
})()
