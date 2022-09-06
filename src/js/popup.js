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

function init() {
  loadNavigation();
  startListeners();
  displayStatus();
  displayDuration();
  i18n.localize();
}

function startListeners() {
  document.getElementById("actions").addEventListener("click", onActionsClick);
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

async function onActionsClick(e) {
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

  displayStatus();
}

async function displayStatus() {
  let alarmObj = await alarm.get("timer");
  let duration = await storage.load("sessionDuration", 0);
  let statusEl = document.getElementById("status");
  let pauseEl = document.getElementById("pause");

  if (alarmObj) {
    statusEl.innerText = constants.STR_STATUS_ENABLED;
    pauseEl.innerText = constants.STR_PAUSE;
  } else {
    statusEl.innerText = constants.STR_STATUS_DISABLED;
    pauseEl.innerText = constants.STR_UNPAUSE;
  }
}

async function displayDuration() {
  let duration = await storage.load("sessionDuration", 0);
  let formattedDuration = time.getFormattedLong(duration);
  let durationEl = document.getElementById("duration");

  durationEl.innerText = formattedDuration;
}

async function onStorageChanged(changes, namespace) {
  if (changes.sessionDuration) {
    displayDuration();
  }
}

function loadNavigation() {
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
