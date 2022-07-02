import { Badges } from '../src/Badges';
import testData from './data/simple.json';

describe('Badges', () => {
  // beforeEach(async () => {});

  test('toJson() should return value passed to setData()', () => {
    const badges = new Badges();

    badges.setData(testData);
    const result = badges.toJson();
    
    expect(result).toEqual(testData);
  });

});
