"use strict";

import * as constants from "./constants.js";

export function getFormattedShort(duration) {
  let formatted = [];
  let hours = Math.floor(duration / 60);
  let minutes = duration % 60;
  let hoursStr;
  let minutesStr;

  if (duration === 0) {
    return duration.toString() + constants.STR_MINUTES_SHORT;
  }

  if (hours > 0) {
    hoursStr = hours.toString() + constants.STR_HOURS_SHORT;
  }

  if (minutes > 0) {
    if (hours > 0) {
      minutesStr = minutes.toString();
    } else {
      minutesStr = minutes.toString() + constants.STR_MINUTES_SHORT;
    }
  }

  if (hoursStr) {
    formatted.push(hoursStr);
  }

  if (minutesStr) {
    formatted.push(minutesStr);
  }

  return formatted.join("");
}

export function getFormattedLong(duration) {
  let formatted = [];
  let hours = Math.floor(duration / 60);
  let minutes = duration % 60;
  let hoursStr;
  let minutesStr;

  if (duration === 0) {
    return duration.toString() + " " + constants.STR_MINUTES_LONG;
  }

  if (hours > 0) {
    if (hours === 1) {
      hoursStr = hours.toString() + " " + constants.STR_HOURS_LONG_S;
    } else {
      hoursStr = hours.toString() + " " + constants.STR_HOURS_LONG;
    }
  }

  if (minutes > 0) {
    if (minutes === 1) {
      minutesStr = minutes.toString() + " " + constants.STR_MINUTES_LONG_S;
    } else {
      minutesStr = minutes.toString() + " " + constants.STR_MINUTES_LONG;
    }
  }

  if (hoursStr) {
    formatted.push(hoursStr);
  }

  if (minutesStr) {
    formatted.push(minutesStr);
  }

  return formatted.join(", ");
}
