# Badgerific Rules - Examples

Here are some examples of the rules you can create.

## First Game
Earned when a new game starts and it is the first game ever played.

This badge can only be earned once.

Rule:

```json
{
    "id": "b01",
    "description": "First game started",
    "active": true,
    "max": 1,
    "updatePeriod": "GLOBAL",
    "condition": "system.isNewGame && system.lifetimeGames == 1"
},
```

Usage:

```ts
const badges = new Badges(rules as Rule[], tz);

badges.setData(badgeData);
const earned = badges.startGame();

// expect(earned.length).toEqual(1);
// expect(earned[0].id).toEqual('b01');
// expect(earned[0].count).toEqual(1);
```

## 5th Game
Earned when the fifth game ever played is ended.

This badge can only be earned once.

Rule:

```json
{
    "id": "b02",
    "description": "Fifth game ended",
    "active": true,
    "max": 1,
    "updatePeriod": "GLOBAL",
    "condition": "system.isGameEnd && system.lifetimeGames == 5"
},
```

Usage:

```ts
const badges = new Badges(rules as Rule[], tz);

badges.setData(badgeData);

badges.startGame();

// when game ends
const earned = badges.endGame(GameEndReason.Win);

// expect(earned.length).toEqual(1);
// expect(earned[0].id).toEqual('b02');
// expect(earned[0].count).toEqual(1);
```