import { DateTime } from 'luxon';
import { Badges, EarnedBadge, Period, Rule } from '../src/Badges';
import emptyData from './data/emptyData.json';
import rules from './data/moreRules.json';
import * as mockHelpers from './mockHelpers';

const tz = 'America/Phoenix';

describe('Badge Rules', () => {
  // beforeEach(async () => {});

  afterEach(() => {
    mockHelpers.cleanTimekeeper();
  });

  test.only('first game badge', () => {
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(emptyData);
    const earned = badges.startGame();

    expect(earned.length).toEqual(1);
    expect(earned[0].id).toEqual('b01');
    expect(earned[0].count).toEqual(1);
  });

  test.only('fifth game badge', () => {
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(emptyData);
    badges.startGame();
    badges.startGame();
    badges.startGame();
    badges.startGame();
    const earned = badges.startGame();

    expect(earned.length).toEqual(1);
    expect(earned[0].id).toEqual('b02');
    expect(earned[0].count).toEqual(1);
  });

  test.only('first game as subscriber', () => {
    const badges = new Badges(rules as Rule[], tz);

    badges.setData(emptyData);

    badges.setValue('hasSubscription', true);
    badges.addValue('subscribedGames');

    badges.startGame();

    const earned = badges.getEarnedBadges(Period.Game);

    expect(earned.length).toEqual(2);
    expect(earned[0].id).toEqual('b01');
    expect(earned[0].count).toEqual(1);
    expect(earned[1].id).toEqual('b03');
    expect(earned[1].count).toEqual(1);
  });

  test.only('new years day badge', () => {
    const time = DateTime.utc(2023, 1, 1, 8, 0).toJSDate();
    mockHelpers.mockTimeTravel(time);

    const badges = new Badges(rules as Rule[], tz);

    badges.setData(emptyData);
    const earned = badges.startGame();

    expect(earned.length).toEqual(2);
    expect(earned[0].id).toEqual('b01');
    expect(earned[0].count).toEqual(1);
    expect(earned[1].id).toEqual('b04');
    expect(earned[1].count).toEqual(1);
  });
});
