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
    
    expect(result.props).toEqual(emptyData.props);
    expect(result.periods![Period.Global].key).toEqual('GLOBAL');
    expect(result.periods![Period.Global].lastTimestamp).toEqual('1970-01-01T00:00:00.000Z');
    expect(result.periods![Period.Year].key).toEqual('2022');
    expect(result.periods![Period.Month].key).toEqual('2022-07');
    expect(result.periods![Period.Day].key).toEqual('2022-07-02');
    expect(result.periods![Period.Week].key).toEqual('2022-W26');
    expect(result.periods![Period.Session].key).toEqual('S0000000000');
    expect(result.periods![Period.Game].key).toEqual('G0000000000');
  });

  test('setValue of gameCount to 1 should earn b01 badge', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(emptyData);
    badges.setValue('gameCount', 1);
    
    const result = badges.toJson();

    expect(result.props).toContainEntry(['gameCount', 1]);
  });

});
