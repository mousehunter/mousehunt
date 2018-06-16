// ==UserScript==
// @name         Search Mouse
// @description  Find best location and cheese to catch a mouse
// @namespace    http://tampermonkey.net/
// @version      0.2
// @author       You
// @match        https://www.mousehuntgame.com/*
// @grant        none
// ==/UserScript==

(async function () {
  'use strict'

  const mouseDataSrc = await (await fetch('https://raw.githubusercontent.com/mousehunter/mousehunt/master/mouse.json')).json()

  // Create window function
  window.findMouse = function (nameOfMouse) {
      return mouseDataSrc
          .filter(data => data.Mouse.toLowerCase() === nameOfMouse.toLowerCase())
          .sort((a, b) => {
              const key = 'Attraction Rate'
              return parseInt(a[key], 10) > parseInt(b[key], 10) ? -1 : 1
          })
          .slice(0, 3)
  }
})()
