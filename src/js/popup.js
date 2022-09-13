"use strict";

import * as constants from "./constants.js";
import * as storage from "./storage.js";
import * as message from "./message.js";
import * as alarm from "./alarm.js";
import * as time from "./duration.js";
import * as i18n from "./localize.js";

let listNavItems;
let navIndex; // Current navigation index

document.addEventListener("DOMContentLoaded", init);

async function init() {
  await updatePauseButton();
  await displayDuration();
  setupNavigation();
  setupListeners();
  i18n.localize();
}

function setupListeners() {
  let navItems = document.querySelectorAll(".nav-index");

  for (let item of navItems) {
    item.addEventListener("click", onNavItemClicked);
  }

  document.addEventListener("keydown", documentOnKeydown, false);
  document.addEventListener("mouseout", documentOnMouseout, false);
  chrome.storage.onChanged.addListener(onStorageChanged);
}

function documentOnKeydown(e) {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    navigateDirection(e);
  } else if (e.key === "Enter") {
    clickSelectedItem();
  }
}

async function onNavItemClicked(e) {
  let target = e.target;

  switch (e.target.id) {
    case "new":
      await onNewSessionClicked();
      break;
    case "pause":
      await onPauseSessionClicked();
      break;
  }

  window.close();
}

async function onNewSessionClicked() {
  await message.send("newSession");
}

async function onPauseSessionClicked() {
  let alarmObj = await alarm.get("timer");

  if (alarmObj) {
    await message.send("pauseSession");
  } else {
    await message.send("resumeSession");
  }

  updatePauseButton();
}

async function updatePauseButton() {
  let alarmObj = await alarm.get("timer");
  let duration = await storage.load("sessionDuration", 0);
  let el = document.getElementById("pause");

  el.innerText = alarmObj ? constants.STR_PAUSE : constants.STR_UNPAUSE;

  if (!alarmObj && duration === 0) {
    el.classList.add("disabled");
  }
}

async function displayDuration() {
  let duration = await storage.load("sessionDuration", 0);
  let formattedDuration = time.getFormattedLong(duration);
  let el = document.getElementById("duration");

  el.innerText = formattedDuration;
}

function onStorageChanged(changes, namespace) {
  if (changes.sessionDuration) {
    displayDuration();
  }
}

function setupNavigation() {
  listNavItems = document.querySelectorAll(".nav-index");

  for (let [i, item] of listNavItems.entries()) {
    item.addEventListener(
      "mouseover",
      function (e) {
        removeAllSelections();
        this.classList.add("selected");
        navIndex = i;
      },
      false
    );
  }
}

function navigateDirection(e) {
  e.preventDefault();

  switch (e.key) {
    case "ArrowDown":
      setNavIndex();
      navigateListDown();
      break;
    case "ArrowUp":
      setNavIndex();
      navigateListUp();
      break;
  }

  if (navIndex <= 1) scrollToTop();
  if (navIndex >= listNavItems.length - 1) scrollToBottom();

  listNavItems[navIndex].classList.add("selected");
  listNavItems[navIndex].scrollIntoView({ block: "nearest" });
}

function setNavIndex() {
  if (!navIndex) {
    navIndex = 0;
  }
}

function navigateListDown() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== listNavItems.length - 1 ? navIndex++ : listNavItems.length - 1;
  } else {
    navIndex = 0;
  }
}

function navigateListUp() {
  if (listNavItems[navIndex].classList.contains("selected")) {
    listNavItems[navIndex].classList.remove("selected");
    navIndex !== 0 ? navIndex-- : 0;
  } else {
    navIndex = listNavItems.length - 1;
  }
}

function clickSelectedItem(e) {
  let el = listNavItems[navIndex];
  el.click();
}

function removeAllSelections() {
  for (let item of listNavItems) {
    item.classList.remove("selected");
  }

  navIndex = null;
}

function scrollToTop() {
  window.scrollTo(0, 0);
}

function scrollToBottom() {
  window.scrollTo(0, document.body.scrollHeight);
}

function documentOnMouseout(e) {
  removeAllSelections();
}
