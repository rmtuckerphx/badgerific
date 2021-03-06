const tk = require('timekeeper');

export function mockTimeFreeze(timeToMock) {
  tk.freeze(new Date(timeToMock));
}

export function mockTimeTravel(timeToMock) {
  tk.travel(new Date(timeToMock));
}

export function cleanTimekeeper() {
  tk.reset();
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
