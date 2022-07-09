import { DateTime } from 'luxon';
import { Badges, GameEndReason, Period, ReadonlyBadgeProperties, Rule } from '../src/Badges';
import badgeData from './data/emptyData.json';
import rules from './data/moreRules.json';
import * as mockHelpers from './mockHelpers';

const tz = 'America/Phoenix';

describe('Badge Rules', () => {
  afterEach(() => {
    mockHelpers.cleanTimekeeper();
  });

  test('first game started', () => {
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(badgeData);
    const earned = badges.startGame();

    expect(badges.hasEarnedBadge('b01')).toEqual(true);
    expect(badges.badgeCount('b01')).toEqual(1);

    expect(earned.length).toEqual(1);
    expect(earned[0].id).toEqual('b01');
    expect(earned[0].count).toEqual(1);
  });

  test('fifth game ended', () => {
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(badgeData);
    badges.startGame();
    badges.startGame();
    badges.startGame();
    badges.startGame();
    badges.startGame();
    const earned = badges.endGame(GameEndReason.Win);

    expect(badges.hasEarnedBadge('b02')).toEqual(true);
    expect(badges.badgeCount('b02')).toEqual(1);
  });

  test('first game started as subscriber', () => {
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(badgeData);

    badges.onGameStart = (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties) => {
      if (props.hasSubscription) {
        badges.addValue('subscribedGames', 1, true);
      }
    };

    // at point where subscribed
    badges.setValue('hasSubscription', true);
    badges.startGame();

    const earned = badges.getEarnedBadges(Period.Game);

    expect(badges.hasEarnedBadge('b03')).toEqual(true);
    expect(badges.badgeCount('b03')).toEqual(1);

    expect(earned.length).toEqual(2);
    expect(earned[0].id).toEqual('b01');
    expect(earned[0].count).toEqual(1);
    expect(earned[1].id).toEqual('b03');
    expect(earned[1].count).toEqual(1);
  });

  test('started game on new years day', () => {
    const time = DateTime.utc(2023, 1, 1, 8, 0).toJSDate();
    mockHelpers.mockTimeTravel(time);

    const badges = new Badges(rules as Rule[], tz);

    badges.setData(badgeData);
    const earned = badges.startGame();

    expect(badges.hasEarnedBadge('b04')).toEqual(true);
    expect(badges.badgeCount('b04')).toEqual(1);

    expect(earned.length).toEqual(2);
    expect(earned[0].id).toEqual('b01');
    expect(earned[0].count).toEqual(1);
    expect(earned[1].id).toEqual('b04');
    expect(earned[1].count).toEqual(1);
  });

  test('win 3 games in a day', () => {
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(badgeData);

    badges.onNewTimePeriod = (
      props: ReadonlyBadgeProperties,
      systemProps: ReadonlyBadgeProperties,
    ) => {
      if (systemProps.isNewDay) {
        badges.setValue('dailyWins', 0, true);
      }
    };

    badges.onGameEnd = (
      props: ReadonlyBadgeProperties,
      systemProps: ReadonlyBadgeProperties,
      reason: GameEndReason,
    ) => {
      if (reason === GameEndReason.Win) {
        badges.addValue('dailyWins', 1, true);
      }
    };

    badges.startGame();
    badges.endGame(GameEndReason.Win);

    badges.startGame();
    badges.endGame(GameEndReason.Win);

    badges.startGame();
    badges.endGame(GameEndReason.Win);

    const earned = badges.getEarnedBadges(Period.Day);

    expect(badges.hasEarnedBadge('b05')).toEqual(true);
    expect(badges.badgeCount('b05')).toEqual(1);
  });

  test('earn badge 07 on 10 games completed', () => {
    const badges = new Badges(rules as Rule[], tz);

    const data = {
      systemProps: {
        lifetimeGamesEnded: 9,
      },
      props: {},
      earned: [],
      bookmarks: {},
    };

    badges.setData(data);

    badges.startGame();
    const earned = badges.endGame(GameEndReason.Win);

    expect(badges.hasEarnedBadge('b07')).toEqual(true);
    expect(badges.badgeCount('b07')).toEqual(1);
  });

  test('earn badge 07 on 20 games completed', () => {
    const badges = new Badges(rules as Rule[], tz);

    const data = {
      systemProps: {
        lifetimeGamesEnded: 19,
      },
      props: {},
      earned: [],
      bookmarks: {},
    };

    badges.setData(data);

    badges.startGame();
    const earned = badges.endGame(GameEndReason.Win);

    expect(badges.hasEarnedBadge('b07')).toEqual(false);
    expect(badges.badgeCount('b07')).toEqual(0);
  });

  test('earn badge 07 on 30 games completed', () => {
    const badges = new Badges(rules as Rule[], tz);

    const data = {
      systemProps: {
        lifetimeGamesEnded: 29,
      },
      props: {},
      earned: [],
      bookmarks: {},
    };

    badges.setData(data);

    badges.startGame();
    const earned = badges.endGame(GameEndReason.Win);

    expect(badges.hasEarnedBadge('b07')).toEqual(true);
    expect(badges.badgeCount('b07')).toEqual(1);
  });

  test('earn badge 07 on 50 games completed', () => {
    const badges = new Badges(rules as Rule[], tz);

    const data = {
      systemProps: {
        lifetimeGamesEnded: 49,
      },
      props: {},
      earned: [],
      bookmarks: {},
    };

    badges.setData(data);

    badges.startGame();
    const earned = badges.endGame(GameEndReason.Win);

    expect(badges.hasEarnedBadge('b07')).toEqual(false);
    expect(badges.badgeCount('b07')).toEqual(0);
  });

  test('earn badge 07 on 100 games completed', () => {
    const badges = new Badges(rules as Rule[], tz);

    const data = {
      systemProps: {
        lifetimeGamesEnded: 99,
      },
      props: {},
      earned: [],
      bookmarks: {},
    };

    badges.setData(data);

    badges.startGame();
    const earned = badges.endGame(GameEndReason.Win);

    expect(badges.hasEarnedBadge('b07')).toEqual(false);
    expect(badges.badgeCount('b07')).toEqual(0);
  });
});
