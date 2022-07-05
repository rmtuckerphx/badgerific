# Badges

## Overview

The Badges library for Node.js allows the use of badges/achievements in apps or games.

## Install

Install the library:

`npm install badges --save`

Add it to your JavaScript project:

```js
const Badges = require('badges')
const rules = require('./badgeRules.json')

const badges = new Badges(rules);
```


Add it to your TypeScript project:

```ts
import { Badges } from 'badges';
import rules from './badgeRules.json';

const badges = new Badges(rules);
```


## Usage

## Concepts

### Locale

In the constructor, optionally pass the user's time zone which is used for time-based rules. Default is 'UTC'.

```ts
const tz = 'America/Phoenix';
const badges = new Badges(rules, tz);
```

### Data

The data about which badges were earned and the current state of properties and bookmarks are stored external to the library.

```js
// set badge data
badges.setData(badgeData);

// get badge data
const data = badges.toJson();
```

### Periods (Timeline)

![Periods]('docs/images/timeline-periods.jpg')

The periods are:
- **Global** - From January 1, 1970 to present to all future dates.
- **Year** - A year.
- **Month** - A month.
- **Week** - A week. Can span border between months.
- **Day** - A day.
- **Hour** - An hour.
- **Session** - A user's session. Can span border between hours, days, weeks, months, or years. Starts with `badges.startSession()`. A session can have multiple games.
- **Game** - A game. Can span border between hours, days, weeks, months, or years. Starts with `badges.startGame()`. A game cannot span sessions.


### Rules

Rules are defined as JSON and passed to the constructor. Here is a sample rules file which defines a single rule that can only be earned once and can only be updated once per GLOBAL period.

```json
[
    {
        "id": "b01",
        "description": "Playing your first game",
        "active": true,
        "max": 1,
        "updatePeriod": "GLOBAL",
        "condition": "gameCount == 1"
    }
]
```

#### Properties
- **id** (required) - Unique identifier of the rule.
- **active** (required) - Only rules set to `true` are evaluated.
- **condition** (required) - Conditional statement(s) to be evaluated. If condition is true, the badge is earned.
- **updatePeriod** (required) - Each badge can be earned only once per period. Value: Global, Year, Month, Week, Day, Hour, Session, Game.
- **max** (optional) - If set, the max count that the badge can be earned. If missing, no maximum.
- **description** (optional) - Internal description of the rule.


