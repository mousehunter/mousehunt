// ==UserScript==
// @name         Multi Purpose Mousehunt Bot
// @description  Includes auto claiming chedd-ore on mountain
// @description  Includes auto horn
// @description  Includes auto page refresh
// @namespace    http://tampermonkey.net/
// @version      1.0
// @author       You
// @match        https://www.mousehuntgame.com/*
// @grant        none
// @require      https://unpkg.com/ajax-hook/dist/ajaxhook.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery-simulate/1.0.1/jquery.simulate.js
// ==/UserScript==

(async function () {
  /**
   * Helper functions
   */
  const getLocal = item => localStorage.getItem(item)
  const setLocal = (item, value) => localStorage.setItem(item, value)
  const stringIsTrue = str => str == 'true'


  /**
   * Variables
   */
  const hookAjax = window.hookAjax
  const $ = window.jQuery
  let mouseSearchData = JSON.parse(getLocal('mouse-list')) || []


  /**
   * FUNCTIONS
   */
  const claimBoulderRewardFn = function () {
    const hp = parseInt($('.mountainHUD-boulder-health-percent span').text(), 10)
    if (hp <= 0 && $('.mousehuntHud-environmentName').text().toLowerCase() === 'mountain') {
      setTimeout(function () {
        $('.mountainHUD-boulderContainer').hasClass('can_claim') ?
          $('.mountainHUD-boulder a').simulate('click') :
        null
      }, 2000)
    }
  }

  const claimHalloweenRewardFn = function () {
    const hp = parseInt($('.halloweenHUD-campBanner-shipHP-hpBar').css('width'), 10)
    if (hp <= 0) {
      setTimeout(function () {
        $('.halloweenHUD-campBanner').hasClass('hasReward') ?
          $('.halloweenHUD-campBanner-claimReward').simulate('click') :
        null
      }, 2000)

    }

    if (stringIsTrue(getLocal('auto-rearm'))) {
      setTimeout(function () {
        $('#jsDialogClose').simulate('click')
        const cannonBallElements = $('.halloweenHUD-campBanner-cannonBall-quantity').get()
        let hasActive = cannonBallElements.some(el => $(el).next().is('.selected'))
        $(cannonBallElements.reverse()).each(function () {
          const self = $(this)
          if (self.next().is('.disabled, .empty') || hasActive) return
          setTimeout(function () { self.next().simulate('click') }, 2000)
          hasActive = true
        })
      }, 3000)
    }
  }

  const findMouse = mouseName =>
    mouseName.length > 0 ? mouseSearchData
      .filter(data => data.Mouse.toLowerCase() === mouseName.toLowerCase())
      .sort((a, b) => {
        const key = 'Attraction Rate'
        return parseFloat(a[key], 10) > parseFloat(b[key], 10) ? -1 : 1
      }) :
      null

  // Modify original getSecondsRemaining to include some of our own code
  // getSecondsRemaining is internal mousehunt function that calculates seconds
  // remaining until the next horn, oddly it is called twice every second.
  const orginalFn = window.HuntersHorn.getSecondsRemaining
  window.HuntersHorn.getSecondsRemaining = function () {
    const remaining = orginalFn()
    if (remaining <= 0) {
      const randomTime = (Math.floor(Math.random() * 11) + 5) * 1000
      if (stringIsTrue(getLocal('bot-debug'))) console.log(`Sounding horn in ${randomTime}`)
      setTimeout(function () {
        $('#envHeaderImg').hasClass('hornReady') && !stringIsTrue(getLocal('bot-status')) ?
          $('.mousehuntHud-huntersHorn-container a').simulate('click') :
          null
      }, randomTime)
    }
    return remaining
  }

  // Listen to ajax response coming from sounding the hunters horn
  hookAjax({
    onreadystatechange : function (xhr) {
      if (xhr.readyState === 4 && xhr.responseURL === 'https://www.mousehuntgame.com/managers/ajax/turns/activeturn.php') {
        if ($('.mousehuntHud-environmentName').text().toLowerCase() === 'mountain') setTimeout(claimBoulderRewardFn, 2000)
        setTimeout(claimHalloweenRewardFn, 2000)
      }
    }
  })


  /**
   * Event listeners on elements
   */
  window.handleAutoRearmChangeMH = el => {
    setLocal('auto-rearm', $(el).prop('checked'))
    claimHalloweenRewardFn()
  }
  window.handleShowDebugChangeMH = el => setLocal('bot-debug', $(el).prop('checked'))
  window.handleDisableBotMH = el => setLocal('bot-status', $(el).prop('checked'))
  window.handleMouseSearchMH = ev => {
    if (ev.which === 13) {
      const mouseName = $('#search-mouse').val()
      const searchResult = findMouse(mouseName)

      const win = window.open("", "", "width=1000,height=500")
      $(win.document.body).html(`
        <table>
          ${searchResult.map(r =>
            `<tr>
              <td>Location: ${r.Location}</td>
              <td>Phase: ${r.Phase}</td>
              <td>Cheese: ${r.Cheese}</td>
              <td>Charm: ${r.Charm}</td>
              <td>AR: ${r['Attraction Rate']}</td>
            </tr>`
          ).join().replace(',', '')}
        </table>
      `)
    }
  }
  window.handleHalloweenShuffleTrackingMH = () => {
    const shuffleCards = $('.halloweenMemoryGame-card-reward-name span').get()
    if (shuffleCards.length <= 0) {
      if (stringIsTrue(getLocal('bot-debug'))) console.log('Open ticket first.')
      return
    }

    $(shuffleCards)
      .each(function(i) {
        const elContainer = $(`div[data-card-id='${i}'] .halloweenMemoryGame-card-margin`)
        elContainer.find('.shuffle-revealed-name').remove()
        elContainer.prepend(`<div class="shuffle-revealed-name">${$(this).text().substring(0, 10)}</div>`)
      })
  }


  /**
   * Components
   */
  const controlsComponent = `
    <div>
      <div>
        <button onclick="handleHalloweenShuffleTrackingMH()" style="width: 100%;">Track Shuffle</button>
      </div>
      <div>
        <input id="search-mouse" placeholder="Enter mouse" onkeyup="handleMouseSearchMH(event)" style="width: 100%; height: 15px;" />
      </div>
      <div>
        <input type="checkbox" onchange="handleAutoRearmChangeMH(this)" ${ stringIsTrue(getLocal('auto-rearm')) ? 'checked' : '' } />
        <label>Auto Rearm? </label>
      </div>
      <div>
        <input type="checkbox" onchange="handleShowDebugChangeMH(this)" ${ stringIsTrue(getLocal('bot-debug')) ? 'checked' : '' } />
        <label>Debug? </label>
      </div>
      <div>
        <input type="checkbox" onchange="handleDisableBotMH(this)" ${ stringIsTrue(getLocal('bot-status')) ? 'checked' : '' } />
        <label>Disable? </label>
      </div>
    </div>
  `

  $('#hgSideBar .hgUser').append(controlsComponent)

  /**
   * Functions that requires to run on load
   */
  try {
    if (mouseSearchData.length <= 0) {
      mouseSearchData = await (await fetch('https://raw.githubusercontent.com/mousehunter/mousehunt/master/mouse.json')).json()
      setLocal('mouse-list', JSON.stringify(mouseSearchData))
    }
    claimBoulderRewardFn()
    claimHalloweenRewardFn()
  } finally {
    if (stringIsTrue(getLocal('bot-debug'))) console.log('Initial functions executed.')
  }
})()
