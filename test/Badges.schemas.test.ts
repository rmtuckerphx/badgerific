import { BadgeData, Badges, Rule } from '../src/Badges';
import testData from './data/simpleData.json';
import testRules from './data/simpleRules.json';
import badgeDataSchema from './schemas/badgeDataSchema.json';
import badgeRuleSchema from './schemas/badgeRuleSchema.json';
import { matchersWithOptions } from 'jest-json-schema';

expect.extend(matchersWithOptions({schemas: [badgeDataSchema, badgeRuleSchema]}));

const tz = 'America/Phoenix';

describe('Badges Schemas', () => {

  test('BadgeData schema is valid', () => {
    expect(badgeDataSchema).toBeValidSchema();
  });

  test('Badge Rule schema is valid', () => {
    expect(badgeRuleSchema).toBeValidSchema();
  });

  test('toJson() should return data matching BadgeData schema', () => {
    const badges = new Badges(testRules as Rule[], tz);

    badges.setData(testData as BadgeData);
    const result = badges.toJson();
    
    expect(result).toMatchSchema(badgeDataSchema);
  });

  test('getRules() should return rules matching Badge Rules schema', () => {
    const badges = new Badges(testRules as Rule[], tz);

    const result = badges.getRules();
    
    expect(result).toMatchSchema(badgeRuleSchema);
  });


});
