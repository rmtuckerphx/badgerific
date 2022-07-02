import { Badges } from '../src/Badges';
import testData from './data/simple.json';
import badgeDataSchema from './schemas/badgeDataSchema.json';
import { matchersWithOptions } from 'jest-json-schema';

expect.extend(matchersWithOptions({schemas: [badgeDataSchema]}));

describe('Badges Schemas', () => {

  test('BadgeData is valid', () => {
    expect(badgeDataSchema).toBeValidSchema();
  });

  test('toJson() should return data matching BadgeData schema', () => {
    const badges = new Badges();

    badges.setData(testData);
    const result = badges.toJson();
    
    expect(result).toMatchSchema(badgeDataSchema);
  });


});
