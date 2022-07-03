import { Badges, Period, Rule } from '../src/Badges';
import emptyData from './data/emptyData.json';
import testData from './data/simpleData.json';
import testRules from './data/simpleRules.json';

const tz = 'America/Phoenix';

describe('Badges', () => {
  // beforeEach(async () => {});

  test('toJson() should return value passed to setData() plus initialized values', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    const result = badges.toJson();
    
    expect(result.props.isNewYear).toEqual(false);
    expect(result.props.isNewMonth).toEqual(false);
    expect(result.props.isNewDay).toEqual(false);
    expect(result.props.isNewWeek).toEqual(false);
    expect(result.props.isNewSession).toEqual(false);
    expect(result.props.isNewGame).toEqual(false);

    expect(result.periods![Period.Global].key).toEqual('GLOBAL');
    expect(result.periods![Period.Global].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Year].key).toEqual('1970');
    expect(result.periods![Period.Year].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Month].key).toEqual('1970-01');
    expect(result.periods![Period.Month].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

    expect(result.periods![Period.Day].key).toEqual('1970-01-01');
    expect(result.periods![Period.Global].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');

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
  });


  test('startSession should set values', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    badges.startSession()
    
    const result = badges.toJson();

    expect(result.props.isNewSession).toEqual(true);
    expect(result.periods![Period.Session].key).toEqual('0000000001');
  });


  test('startGame should set values', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    badges.startGame()
    
    const result = badges.toJson();

    expect(result.props.isNewGame).toEqual(true);
    expect(result.periods![Period.Game].key).toEqual('0000000001');
  });


});
