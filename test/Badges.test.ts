import { DateTime } from 'luxon';
import { Badges, EarnedBadge, Period, Rule } from '../src/Badges';
import emptyData from './data/emptyData.json';
import testData from './data/simpleData.json';
import testRules from './data/simpleRules.json';
import * as mockHelpers from './mockHelpers';

const tz = 'America/Phoenix';

describe('Badges', () => {
  // beforeEach(async () => {});

  afterEach(async () => {
    mockHelpers.cleanTimekeeper();
  });

  test('toJson() should return value passed to setData() plus initialized values', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    const result = badges.toJson();

    expect(result.systemProps.isNewYear).toEqual(false);
    expect(result.systemProps.isNewMonth).toEqual(false);
    expect(result.systemProps.isNewDay).toEqual(false);
    expect(result.systemProps.isNewHour).toEqual(false);
    expect(result.systemProps.isNewWeek).toEqual(false);
    expect(result.systemProps.isNewSession).toEqual(false);
    expect(result.systemProps.isNewGame).toEqual(false);

    expect(result.periods![Period.Global].key).toEqual('GLOBAL');
    expect(result.periods![Period.Global].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Year].key).toEqual('1970');
    expect(result.periods![Period.Year].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Month].key).toEqual('1970-01');
    expect(result.periods![Period.Month].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Day].key).toEqual('1970-01-01');
    expect(result.periods![Period.Day].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Hour].key).toEqual('1970-01-01-H00');
    expect(result.periods![Period.Hour].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Week].key).toEqual('1970-W01');
    expect(result.periods![Period.Week].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Session].key).toEqual('0000000000');
    expect(result.periods![Period.Session].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Game].key).toEqual('0000000000');
    expect(result.periods![Period.Game].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');
  });

  test('setValue of gameCount to 1 should earn b01 badge', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    badges.setValue('gameCount', 1);

    const result = badges.toJson();

    expect(result.props.gameCount).toEqual(1);
    expect(result.earned.length).toEqual(1);
    expect(result.earned[0].id).toEqual('b01');
    expect(result.earned[0].count).toEqual(1);
  });

  test('multiple setValue of gameCount to 1 should earn b01 badge only once', () => {
    const badges = new Badges(testRules as Rule[], tz);
    let earnedCounter = 0;

    badges.onBadgeEarned = (badge: EarnedBadge) => {
      earnedCounter++;
    };
    
    badges.setData(emptyData);
    badges.setValue('gameCount', 1);
    badges.setValue('gameCount', 1);

    const result = badges.toJson();

    expect(result.props.gameCount).toEqual(1);
    expect(result.earned.length).toEqual(1);
    expect(result.earned[0].id).toEqual('b01');
    expect(result.earned[0].count).toEqual(1);
    expect(earnedCounter).toEqual(1);
  });


  test('startSession should set values', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    badges.startSession();

    const result = badges.toJson();

    expect(result.systemProps.isNewSession).toEqual(true);
    expect(result.periods![Period.Session].key).toEqual('0000000001');
  });

  test('startGame should set values', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    badges.startGame();

    const result = badges.toJson();

    expect(result.systemProps.isNewGame).toEqual(true);
    expect(result.periods![Period.Game].key).toEqual('0000000001');
  });

  test('evaluate() should set period time values', () => {
    const time = DateTime.utc(2022, 7, 3, 1, 15).toJSDate();
    mockHelpers.mockTimeTravel(time);

    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    badges.evaluate();

    const result = badges.toJson();

    expect(result.systemProps.isNewYear).toEqual(true);
    expect(result.systemProps.isNewMonth).toEqual(true);
    expect(result.systemProps.isNewDay).toEqual(true);
    expect(result.systemProps.isNewHour).toEqual(true);
    expect(result.systemProps.isNewWeek).toEqual(true);

    expect(result.periods![Period.Year].key).toEqual('2022');
    expect(result.periods![Period.Year].lastTimestamp > '1970-01-01T00:00:00.000Z').toEqual(true);

    expect(result.periods![Period.Month].key).toEqual('2022-07');
    expect(result.periods![Period.Month].lastTimestamp > '1970-01-01T00:00:00.000Z').toEqual(true);

    expect(result.periods![Period.Day].key).toEqual('2022-07-02');
    expect(result.periods![Period.Day].lastTimestamp > '1970-01-01T00:00:00.000Z').toEqual(true);

    expect(result.periods![Period.Hour].key).toEqual('2022-07-02-H18');
    expect(result.periods![Period.Hour].lastTimestamp > '1970-01-01T00:00:00.000Z').toEqual(true);

    expect(result.periods![Period.Week].key).toEqual('2022-W26');
    expect(result.periods![Period.Week].lastTimestamp > '1970-01-01T00:00:00.000Z').toEqual(true);
  });
});
