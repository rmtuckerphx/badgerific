# Badgerific Rules - Examples

Here are some examples of the rules you can create.

## First Game Started
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
}
```

Usage:

```ts
const badges = new Badges(rules as Rule[], tz);

badges.setData(badgeData);
const earned = badges.startGame();

// expect(badges.hasEarnedBadge('b01')).toEqual(true);
// expect(badges.badgeCount('b01')).toEqual(1);
```

## 5th Game Ended
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
    "condition": "system.isGameEnded && system.lifetimeGames == 5"
}
```

Usage:

```ts
const badges = new Badges(rules as Rule[], tz);

badges.setData(badgeData);

badges.startGame();

// when game ends
const earned = badges.endGame(GameEndReason.Win);

// expect(badges.hasEarnedBadge('b02')).toEqual(true);
// expect(badges.badgeCount('b02')).toEqual(1);
```

## First Game as a Subscriber
Earned when you start a game after becoming a subscriber.

This badge can only be earned once.

Rule:

```json
{
    "id": "b03",
    "description": "First game as a subscribed player",
    "active": true,
    "max": 1,
    "updatePeriod": "GLOBAL",
    "condition": "system.isNewGame && hasSubscription && subscribedGames == 1"
}
```

Usage:

```ts
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(badgeData);

    badges.onGameStart = (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties) => {
      if (props.hasSubscription) {
        badges.addValue('subscribedGames', 1, true);
      }
    };

    // at point where subscribed
    badges.setValue('hasSubscription', true);   

    // at point where game starts
    badges.startGame();

    // during or after game (before starting a new game)
    const earned = badges.getEarnedBadges(Period.Game);

    // expect(badges.hasEarnedBadge('b03')).toEqual(true);
    // expect(badges.badgeCount('b03')).toEqual(1);
```

## Holiday - New Year's Day
Earned when you start a game on New Year's Day.

This badge can be earned multiple times but only once per year.

Rule:

```json
{
    "id": "b04",
    "description": "Play a game on New Year's Day",
    "active": true,
    "max": null,
    "updatePeriod": "YEAR",
    "condition": "system.isNewGame && system.date in ['2023-01-01', '2024-01-01', '2025-01-01']"
}
```

Usage:

```ts
const badges = new Badges(rules as Rule[], tz);

badges.setData(badgeData);

const earned = badges.startGame();

// expect(badges.hasEarnedBadge('b04')).toEqual(true);
// expect(badges.badgeCount('b04')).toEqual(1);
```

## 3 Games in a Day
Earned when you win 3 games in a single day.

This badge can be earned multiple times but only once per day.

Rule:

```json
{
    "id": "b05",
    "description": "Win 3 games in a day",
    "active": true,
    "max": null,
    "updatePeriod": "DAY",
    "condition": "system.isGameEnded && dailyWins == 3"
}
```

Usage:

```ts
const badges = new Badges(rules as Rule[], tz);

badges.setData(badgeData);

badges.onNewTimePeriod = (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties) => {
    if (systemProps.isNewDay) {
        badges.setValue('dailyWins', 0, true);
    }
};

badges.onGameEnd = (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties, reason: GameEndReason) => {
    if (reason === GameEndReason.Win) {
        badges.addValue('dailyWins', 1, true);
    }
};

badges.startGame();
badges.endGame(GameEndReason.Win);

const earned = badges.getEarnedBadges(Period.Day);

// expect(badges.hasEarnedBadge('b05')).toEqual(true);
// expect(badges.badgeCount('b05')).toEqual(1);
```

## Earn a Combo of Badges
Earned when you earn 2 specific badges.

This badge can only be earned once.

Rule:

```json
{
    "id": "b06",
    "description": "Has earned badge b01 and b05 at least once",
    "active": true,
    "max": 1,
    "updatePeriod": "GLOBAL",
    "condition": "hasEarnedBadge('b01') && badgeCount('b05') > 0"
}    
```

This is to show you can eample of using `hasEarnedBadge()` and/or `badgeCount()`. Use as needed and can be combined with other properties.

## Complete a Game in Multiples
These rules show various conditions for earning badges in multiples of games ended.

These badges can earned multiple times but only once per game.

Rules:

```json
{
    "id": "b07",
    "description": "Every 10th game completed but not multiples of 20, 50, 100.",
    "active": true,
    "max": null,
    "updatePeriod": "GAME",
    "condition": "system.isGameEnded && system.lifetimeGamesEnded % 10 == 0 && system.lifetimeGamesEnded % 20 != 0 && system.lifetimeGamesEnded % 50 != 0 && system.lifetimeGamesEnded % 100 != 0"
},
{
    "id": "b08",
    "description": "Every 20th game completed but not multiples of 100.",
    "active": true,
    "max": null,
    "updatePeriod": "GAME",
    "condition": "system.isGameEnded && system.lifetimeGamesEnded % 20 == 0 && system.lifetimeGamesEnded % 100 != 0"
},
{
    "id": "b09",
    "description": "Every 50th game completed but not multiples of 100.",
    "active": true,
    "max": null,
    "updatePeriod": "GAME",
    "condition": "system.isGameEnded && system.lifetimeGamesEnded % 50 == 0 && system.lifetimeGamesEnded % 100 != 0"
},
{
    "id": "b10",
    "description": "Every 100th game.",
    "active": true,
    "max": null,
    "updatePeriod": "GAME",
    "condition": "system.isGameEnded && system.lifetimeGamesEnded % 100 == 0"
}    
```

You can create similar rules based on `system.lifetimeGameWins`, `system.lifetimeGameLoses` and `system.lifetimeGamesCanceled`.

- `% n == 0` - is divisible by `n`
- `% n != 0` - is not divisible by `n`
- `% 2 == 0` - is even
- `% 2 != 0` - is odd

## Time Ranges
These rules show various conditions for earning badges during different times of the day.

These badges can earned a total of 3 times each but only once per day.

Rules:

```json
{
    "id": "b11",
    "description": "Complete a game between 5am and 11am",
    "active": true,
    "max": 3,
    "updatePeriod": "DAY",
    "condition": "system.isGameEnded && system.time >= '05:00' && system.time < '11:00'"
},
{
    "id": "b12",
    "description": "Complete a game between 11am and 3pm",
    "active": true,
    "max": 3,
    "updatePeriod": "DAY",
    "condition": "system.isGameEnded && system.time >= '11:00' && system.time < '15:00'"
},
{
    "id": "b13",
    "description": "Complete a game between 3pm and 6pm",
    "active": true,
    "max": 3,
    "updatePeriod": "DAY",
    "condition": "system.isGameEnded && system.time >= '15:00' && system.time < '18:00'"
},
{
    "id": "b14",
    "description": "Complete a game between 6pm and 5am",
    "active": true,
    "max": 3,
    "updatePeriod": "DAY",
    "condition": "system.isGameEnded && (system.time >= '18:00' || system.time < '05:00')"
}
```

## Win a Game on the Weekend
Earned when you win a game on the weekend.

This badge can be earned at most 10 times but only once per week.

Rule:

```json
{
    "id": "b15",
    "description": "Win a game on the weekend",
    "active": true,
    "max": 10,
    "updatePeriod": "WEEK",
    "condition": "system.isGameEnded && system.gameEndReason == 'WIN' && system.isWeekEnd"
}
```

## Win a Game with a Perfect Score
Earned when you win a game with a perfect score. In this example a score of 10 is perfect.

This badge can only be earned once.

Rule:

```json
{
    "id": "b16",
    "description": "Win a game with a perfect score.",
    "active": true,
    "max": 1,
    "updatePeriod": "GLOBAL",
    "condition": "system.isGameEnded && system.gameEndReason == 'WIN' && score == 10"
}
```

## Lose Game with all Wrong Answers
Earned when you lose a game and get none of the answers correct.

This badge can only be earned once.

Rule:

```json
{
    "id": "b17",
    "description": "Lose a game with 0 correct answers.",
    "active": true,
    "max": 1,
    "updatePeriod": "GLOBAL",
    "condition": "system.isGameEnded && system.gameEndReason == 'LOSE' && correctAnswers == 0"
}
```

## Correct Answers in a Category
Earned when you get 5 answers correct in a category. Notice that this isn't tied to a specific game.

This badge can only be earned once.

Rule:

```json
{
    "id": "b18",
    "description": "Answer 5 history questions correctly.",
    "active": true,
    "max": 1,
    "updatePeriod": "GLOBAL",
    "condition": "historyCorrectCount == 5"
}   
```