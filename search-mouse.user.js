// ==UserScript==
// @name         Search Mouse
// @description  Find best location and cheese to catch a mouse
// @namespace    http://tampermonkey.net/
// @version      0.4
// @author       You
// @match        https://www.mousehuntgame.com/*
// @grant        none
// ==/UserScript==

(async function () {
  'use strict'

  const $ = window.jQuery
  const mouseDataSrc = await (await fetch('https://raw.githubusercontent.com/mousehunter/mousehunt/master/mouse.json')).json()
  const elementContainer = $('#overlayContainer')
  const searchContainer = `
    <div style="width: 100%; height: 30px; position: relative;">
      <input id="search-mouse" style="width: 100%; height: 15px; display: block;" />
      <div id="search-result" style="width: 100%; height: 15px;"></div>
    </div>`

  // Add event handler to input element
  $('body').on('keypress', '#search-mouse' , function (e) {
      if (e.which === 13) {
          const mouseName = $('#search-mouse').val()
          const searchResult = findMouse(mouseName)

          // Update the search result container with the result
          $('#search-result').html(`${searchResult.map(r =>
            `<div>
               <span style="margin-right: 2em;">Location: ${r.Location}</span>
               <span style="margin-right: 2em;">Phase: ${r.Phase}</span>
               <span style="margin-right: 2em;">Cheese: ${r.Cheese}</span>
               <span style="margin-right: 2em;">Charm ${r.Charm}</span>
            </div>`
          )}`)

      }
  })

  // Insert element into the DOM
  $(elementContainer).prepend(searchContainer)


  // Process data to return top highest attraction rate
  const findMouse = function (nameOfMouse) {
      return mouseDataSrc
          .filter(data => data.Mouse.toLowerCase() === nameOfMouse.toLowerCase())
          .sort((a, b) => {
              const key = 'Attraction Rate'
              return parseFloat(a[key], 10) > parseFloat(b[key], 10) ? -1 : 1
          })
          .slice(0, 1)
  }
})()
