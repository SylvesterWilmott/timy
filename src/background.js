"use strict";

import * as constants from "./js/constants.js";
import * as storage from "./js/storage.js";
import * as alarm from "./js/alarm.js";
import * as time from "./js/duration.js";

chrome.idle.setDetectionInterval(constants.IDLE_THRESHOLD); // Time in seconds for idle state to change
chrome.idle.onStateChanged.addListener(onIdleStateChanged);
chrome.alarms.onAlarm.addListener(onAlarmTick);
chrome.runtime.onMessage.addListener(onPopupMessage);

async function start() {
  alarm.create("timer", constants.TIMER_DELAY, constants.TIMER_PERIOD);
  await setInitialDuration();
}

async function newSession() {
  await storage.clear("sessionDuration");
  start();
}

async function pauseSession() {
  await clearAlarm();
  updateBadgeColor("disabled");
}

async function resumeSession() {
  await start();
  updateBadgeColor("enabled");
}

async function setInitialDuration() {
  let duration = await storage.load("sessionDuration", 0);
  let formattedDuration = time.getFormattedShort(duration);

  updateBadgeText(formattedDuration);
  updateBadgeColor("enabled");
}

async function incrementDuration() {
  let previousDuration = await storage.load("sessionDuration", 0);
  let newDuration = previousDuration + 1;
  let formattedDuration = time.getFormattedShort(newDuration);

  await storage.save("sessionDuration", newDuration);

  updateBadgeText(formattedDuration);
  updateBadgeColor("enabled");
}

async function clearAlarm() {
  await alarm.clear("timer");
}

async function updateBadgeText(str) {
  chrome.action.setBadgeText({ text: str });
}

function updateBadgeColor(status) {
  let color;

  if (status === "disabled") {
    color = "#DDDDDD";
  } else {
    color = "#141E52";
  }

  chrome.action.setBadgeBackgroundColor({ color: color });
}

async function onIdleStateChanged(state) {
  let alarmObj = await alarm.get("timer");

  if (alarmObj) {
    switch (state) {
      case "idle":
      case "locked":
        await storage.saveSession("status", "disabled");
        updateBadgeColor("disabled");
        break;
      case "active":
        await storage.saveSession("status", "enabled");
        updateBadgeColor("enabled");
        break;
    }
  }
}

async function onAlarmTick(alarm) {
  if (alarm.name === "timer") {
    let status = await storage.loadSession("status", "enabled");

    if (status === "enabled") {
      incrementDuration();
    }
  }
}

function onPopupMessage(message, sender, sendResponse) {
  switch (message) {
    case "newSession":
      newSession();
      break;
    case "pauseSession":
      pauseSession();
      break;
    case "resumeSession":
      resumeSession();
      break;
  }

  sendResponse();
}
