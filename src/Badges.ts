import jexl = require('jexl');
import { DateTime } from 'luxon';

export enum Period {
  Global = 'GLOBAL',
  Session = 'SESSION',
  Game = 'GAME',
  Day = 'DAY',
  Week = 'WEEK',
  Month = 'MONTH',
  Year = 'YEAR',
}

export interface PeriodData {
  key: string;
  lastTimestamp: string;
}

export interface BadgeData {
  props: Record<string, string | number | boolean>;
  periods?: Record<Period | string, PeriodData>;
}

export interface Reward {
  name: string;
  value: number | string;
}

export interface Condition {
  propName: string;
  condition: string;
  value: string | number;
}

export interface Rule {
  id: string;
  description?: string;
  active: boolean;
  rewards?: Reward[];
  max: number;
  maxPeriod: Period;
  updatePeriod: Period;
  condition: string;
  // conditions: Condition[];
}

export class Badges {
  private rules: Rule[];
  private timeZone: string;

  private data: BadgeData = {
    props: {},
    periods: {},
  };

  constructor(rules: Rule[], timeZone?: string) {
    this.rules = rules;
    this.timeZone = timeZone ?? 'UTC';
  }

  private init() {
    if (!this.data.periods) {
      this.data.periods = {};
    }

    this.initPeriodGlobal();
    this.initPeriodTime(Period.Year);
    this.initPeriodTime(Period.Month);
    this.initPeriodTime(Period.Day);
    this.initPeriodTime(Period.Week);
    this.initPeriodCounter(Period.Session);
    this.initPeriodCounter(Period.Game);

    // this.initPeriodYear();
    // this.initPeriodMonth();
    // this.initPeriodDay();
    // this.initPeriodWeek();
  }

  private initPeriodGlobal() {
    if (!this.data.periods?.[Period.Global]) {
      this.data.periods![Period.Global] = {
        key: Period.Global,
        lastTimestamp: DateTime.fromSeconds(0, { zone: 'UTC' }).toISO(),
      };
    }
  }

  private initPeriodTime(period: Period) {
    const curentKey = this.data.periods?.[period]?.key;
    const newKey = this.getKeyPeriodTime(period);

    if (!curentKey || curentKey !== newKey) {
      this.data.periods![period] = {
        key: newKey,
        lastTimestamp: DateTime.utc().toISO(),
      };
    }
  }

  private initPeriodCounter(period: Period) {
    const curentKey = this.data.periods?.[period]?.key;
    const prefix = period === Period.Session ? 'S' : period === Period.Game ? 'G' : '';

    if (!curentKey) {
        this.data.periods![period] = {
            key: prefix + String(0).padStart(10, '0'),
            lastTimestamp: DateTime.utc().toISO(),
          };        
    }
  }

//   private initPeriodYear() {
//     const yearKey = this.data.periods?.[Period.Year]?.key;
//     const newKey = this.getKeyPeriodYear();

//     if (!yearKey || yearKey !== newKey) {
//       this.data.periods![Period.Year] = {
//         key: newKey,
//         lastTimestamp: DateTime.utc().toISO(),
//       };
//     }

//     //     if (!this.data.periods?.[Period.Year]) {
//     //         const yearKey = this.data.periods?.[Period.Year]?.key;
//     //         const newKey = this.getKeyPeriodYear();

//     //         if (!yearKey || yearKey !== newKey) {
//     //             this.data.periods![Period.Year] = {
//     //                 key: newKey,
//     //                 lastTimestamp: DateTime.utc().toISO()
//     //             }
//     //         }
//     //     }
//   }

//   private initPeriodMonth() {
//     const monthKey = this.data.periods?.[Period.Month]?.key;
//     const newKey = this.getKeyPeriodMonth();

//     if (!monthKey || monthKey !== newKey) {
//       this.data.periods![Period.Month] = {
//         key: newKey,
//         lastTimestamp: DateTime.utc().toISO(),
//       };
//     }
//   }

//   private initPeriodDay() {
//     const dayKey = this.data.periods?.[Period.Day]?.key;
//     const newKey = this.getKeyPeriodDay();

//     if (!dayKey || dayKey !== newKey) {
//       this.data.periods![Period.Day] = {
//         key: newKey,
//         lastTimestamp: DateTime.utc().toISO(),
//       };
//     }
//   }

//   private initPeriodWeek() {
//     const weekKey = this.data.periods?.[Period.Week]?.key;
//     const newKey = this.getKeyPeriodWeek();

//     if (!weekKey || weekKey !== newKey) {
//       this.data.periods![Period.Week] = {
//         key: newKey,
//         lastTimestamp: DateTime.utc().toISO(),
//       };
//     }
//   }

  private getKeyPeriodTime(period: Period): string {
    const date = DateTime.now().setZone(this.timeZone);

    switch (period) {
      case Period.Year:
        return date.toFormat('yyyy');
      case Period.Month:
        return date.toFormat('yyyy-MM');
      case Period.Day:
        return date.toFormat('yyyy-MM-dd');
      case Period.Week:
        return date.toFormat("yyyy-'W'WW");

      default:
        return '';
    }
  }

//   private getKeyPeriodYear(): string {
//     return DateTime.now().setZone(this.timeZone).toFormat('yyyy');
//   }

//   private getKeyPeriodMonth(): string {
//     return DateTime.now().setZone(this.timeZone).toFormat('yyyy-MM');
//   }

//   private getKeyPeriodDay(): string {
//     return DateTime.now().setZone(this.timeZone).toFormat('yyyy-MM-dd');
//   }

//   private getKeyPeriodWeek(): string {
//     return DateTime.now().setZone(this.timeZone).toFormat("yyyy-'W'WW");
//   }

  getRules() {
    return this.rules;
  }

  setData(data: BadgeData) {
    this.data = data;

    this.init();
  }

  toJson(): BadgeData {
    return this.data;
  }

  setValue(propName: string, value: string | number | boolean) {
    this.data.props[propName] = value;
    this.evaluate();
  }

  evaluate() {
    for (const rule of this.rules) {
      if (rule.active) {
        const success = jexl.evalSync(rule.condition, this.data.props);
        // const exp = jexl.createExpression(rule.condition);
        // const success = exp.evalSync(this.data.props);
        console.log({ success });
      }
    }
  }

  endSession() {}
}
