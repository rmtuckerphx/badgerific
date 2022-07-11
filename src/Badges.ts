import _cloneDeep from 'lodash.clonedeep';
import jexl = require('jexl');
import { DateTime } from 'luxon';

export enum Period {
  Global = 'GLOBAL',
  Session = 'SESSION',
  Game = 'GAME',
  Day = 'DAY',
  Hour = 'HOUR',
  Week = 'WEEK',
  Month = 'MONTH',
  Year = 'YEAR',
}

export enum GameEndReason {
  Win = 'WIN',
  Lose = 'LOSE',
  Cancel = 'CANCEL',
  GameStart = 'GAME_START',
}

export enum PeriodStatus {
  None = 'NONE',
  Started = 'STARTED',
  Ended = 'ENDED',
  InProgress = 'IN_PROGRESS',
}

export interface PeriodData {
  key: string;
  lastTimestamp: string;
}

export interface EarnedBadge {
  id: string;
  lastEarned: string;
  count: number;
}

export type BadgeProperties = Record<string, string | number | boolean>;

export type ReadonlyBadgeProperties = Readonly<BadgeProperties>;
export type ReadonlyEarnedBadge = Readonly<EarnedBadge>;

export interface BadgeData {
  systemProps: BadgeProperties;
  props: BadgeProperties;
  periods?: Record<Period | string, PeriodData>;
  earned: EarnedBadge[];
  bookmarks: Record<string, string>;
}

export interface Rule {
  id: string;
  description?: string;
  active: boolean;
  max?: number;
  updatePeriod: Period;
  condition: string;
}

export class Badges {
  private rules: Rule[];
  private timeZone: string;

  private data: BadgeData = {
    systemProps: {},
    props: {},
    periods: {},
    earned: [],
    bookmarks: {},
  };

  constructor(rules: Rule[], timeZone?: string) {
    this.rules = rules;
    this.timeZone = timeZone ?? 'UTC';

    jexl.addFunction('hasEarnedBadge', (id) => this.hasEarnedBadge(id));
    jexl.addFunction('badgeCount', (id) => this.badgeCount(id));
  }

  onBadgeEarned?: (badge: ReadonlyEarnedBadge) => void;
  onNewTimePeriod?: (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties) => void;
  onSessionStart?: (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties) => void;
  onSessionEnd?: (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties) => void;
  onGameStart?: (props: ReadonlyBadgeProperties, systemProps: ReadonlyBadgeProperties) => void;
  onGameEnd?: (
    props: ReadonlyBadgeProperties,
    systemProps: ReadonlyBadgeProperties,
    reason: GameEndReason,
  ) => void;

  private initPeriodGlobal() {
    if (!this.data.periods?.[Period.Global]) {
      this.data.periods![Period.Global] = {
        key: Period.Global,
        lastTimestamp: this.getInitialTimestamp(),
      };
    }
  }

  private getInitialTimestamp(): string {
    return '1970-01-01T00:00:00.000Z';
  }

  private initPeriodTime(period: Period) {
    const curentKey = this.data.periods?.[period]?.key;
    const date = DateTime.fromSeconds(0, { zone: 'UTC' });

    const newKey = this.getKeyPeriodTime(period, date);

    if (!curentKey) {
      this.data.periods![period] = {
        key: newKey,
        lastTimestamp: this.getInitialTimestamp(),
      };
    }
  }

  private initPeriodCounter(period: Period) {
    const curentKey = this.data.periods?.[period]?.key;

    if (!curentKey) {
      this.data.periods![period] = {
        key: this.getKeyPeriodCounter(0),
        lastTimestamp: this.getInitialTimestamp(),
      };
    }
  }

  private getKeyPeriodCounter(count: number): string {
    return String(count).padStart(16, '0');
  }

  private getKeyPeriodTime(period: Period, date: DateTime): string {
    switch (period) {
      case Period.Year:
        return date.toFormat('yyyy');
      case Period.Month:
        return date.toFormat('yyyy-MM');
      case Period.Day:
        return date.toFormat('yyyy-MM-dd');
      case Period.Hour:
        return date.toFormat("yyyy-MM-dd-'H'HH");
      case Period.Week:
        return date.toFormat("yyyy-'W'WW");

      default:
        return '';
    }
  }

  getRules() {
    return this.rules;
  }

  setData(data: BadgeData) {
    const cloned = _cloneDeep(data);

    const defaultSystemProps = {
      isNewYear: false,
      isNewMonth: false,
      isNewDay: false,
      isNewHour: false,
      isNewWeek: false,
      isNewSession: false,
      isSessionEnded: false,
      sessionStatus: PeriodStatus.None,
      isNewGame: false,
      isGameEnded: false,
      gameStatus: PeriodStatus.None,
      lifetimeSessions: 0,
      lifetimeGames: 0,
      lifetimeGamesEnded: 0,
      lifetimeGamesCanceled: 0,
      lifetimeGameWins: 0,
      lifetimeGameLoses: 0,
    };

    this.data = cloned;

    if (Object.keys(this.data.systemProps).length === 0) {
      this.data.systemProps = defaultSystemProps;
    }

    if (!this.data.periods) {
      this.data.periods = {};
    }

    this.initPeriodGlobal();
    this.initPeriodTime(Period.Year);
    this.initPeriodTime(Period.Month);
    this.initPeriodTime(Period.Day);
    this.initPeriodTime(Period.Hour);
    this.initPeriodTime(Period.Week);
    this.initPeriodCounter(Period.Session);
    this.initPeriodCounter(Period.Game);
  }

  toJson(): BadgeData {
    return this.data;
  }

  getValue(propName: string, defaultValue: string | number | boolean): string | number | boolean {
    return this.data.props[propName] ?? defaultValue;
  }

  setValue(propName: string, value: string | number | boolean, skipEval = false): EarnedBadge[] {
    const lastTimestamp = DateTime.utc().toISO();

    this.data.props[propName] = value;

    if (!skipEval) {
      this.evaluate();
      return this.getEarnedBadgesSince(lastTimestamp);
    }

    return [];
  }

  addValue(propName: string, value = 1, skipEval = false): EarnedBadge[] {
    const lastTimestamp = DateTime.utc().toISO();
    const oldValue = Number(this.data.props[propName] ?? 0);

    if (typeof oldValue === 'number') {
      this.data.props[propName] = oldValue + value;
    } else {
      // changing type to number
      this.data.props[propName] = value;
    }

    if (!skipEval) {
      this.evaluate();
      return this.getEarnedBadgesSince(lastTimestamp);
    }

    return [];
  }

  subtractValue(propName: string, value = 1, skipEval = false): EarnedBadge[] {
    const lastTimestamp = DateTime.utc().toISO();
    const oldValue = Number(this.data.props[propName] ?? 0);

    if (typeof oldValue === 'number') {
      this.data.props[propName] = oldValue - value;
    } else {
      // changing type to number
      this.data.props[propName] = value;
    }

    if (!skipEval) {
      this.evaluate();
      return this.getEarnedBadgesSince(lastTimestamp);
    }

    return [];
  }

  evaluate() {
    const date = DateTime.now().setZone(this.timeZone);
    this.prepareSystemProps(date);

    const context: any = Object.assign({}, this.data.props);
    context.system = this.data.systemProps;

    for (const rule of this.rules) {
      if (rule.active) {
        const success = jexl.evalSync(rule.condition, context);

        if (success) {
          this.saveEarnedBadge(rule);
        }
      }
    }
  }

  private saveEarnedBadge(rule: Rule) {
    const found = this.data.earned.find((b) => b.id === rule.id);

    if (!found) {
      const newBadge: EarnedBadge = {
        id: rule.id,
        lastEarned: DateTime.utc().toISO(),
        count: 1,
      };

      this.data.earned.push(newBadge);

      if (this.onBadgeEarned) {
        const badge = Object.freeze(_cloneDeep(newBadge));
        this.onBadgeEarned(badge);
      }
    } else {
      // can only update once per updatePeriod
      const canUpdate = this.data.periods![rule.updatePeriod].lastTimestamp > found.lastEarned;
      if (!canUpdate) {
        return;
      }

      if (rule.max) {
        if (found.count < rule.max) {
          found.count += 1;
          found.lastEarned = DateTime.utc().toISO();

          if (this.onBadgeEarned) {
            const badge = Object.freeze(_cloneDeep(found));
            this.onBadgeEarned(badge);
          }
        }
      } else {
        // unlimited
        found.count += 1;
        found.lastEarned = DateTime.utc().toISO();

        if (this.onBadgeEarned) {
          const badge = Object.freeze(_cloneDeep(found));
          this.onBadgeEarned(badge);
        }
      }
    }
  }

  private prepareSystemProps(date: DateTime) {
    const yearKey = this.getKeyPeriodTime(Period.Year, date);
    const monthKey = this.getKeyPeriodTime(Period.Month, date);
    const dayKey = this.getKeyPeriodTime(Period.Day, date);
    const hourKey = this.getKeyPeriodTime(Period.Hour, date);
    const weekKey = this.getKeyPeriodTime(Period.Week, date);
    const lifetimeSessions = Number(this.data.periods![Period.Session].key);
    const lifetimeGames = Number(this.data.periods![Period.Game].key);

    let isNewTimePeriod = false;

    if (this.data.periods![Period.Year].key !== yearKey) {
      isNewTimePeriod = true;
      this.data.systemProps.isNewYear = true;
      this.data.periods![Period.Year] = { key: yearKey, lastTimestamp: DateTime.utc().toISO() };
    }

    if (this.data.periods![Period.Month].key !== monthKey) {
      isNewTimePeriod = true;
      this.data.systemProps.isNewMonth = true;
      this.data.periods![Period.Month] = { key: monthKey, lastTimestamp: DateTime.utc().toISO() };
    }

    if (this.data.periods![Period.Day].key !== dayKey) {
      isNewTimePeriod = true;
      this.data.systemProps.isNewDay = true;
      this.data.periods![Period.Day] = { key: dayKey, lastTimestamp: DateTime.utc().toISO() };
    }

    if (this.data.periods![Period.Hour].key !== hourKey) {
      isNewTimePeriod = true;
      this.data.systemProps.isNewHour = true;
      this.data.periods![Period.Hour] = { key: hourKey, lastTimestamp: DateTime.utc().toISO() };
    }

    if (this.data.periods![Period.Week].key !== weekKey) {
      isNewTimePeriod = true;
      this.data.systemProps.isNewWeek = true;
      this.data.periods![Period.Week] = { key: weekKey, lastTimestamp: DateTime.utc().toISO() };
    }

    this.data.systemProps.date = date.toFormat('yyyy-MM-dd');
    this.data.systemProps.time = date.toFormat('HH:mm');

    const dayOfWeek = Number(date.toFormat('E')); // 1-7 (Monday is 1, Sunday is 7)
    this.data.systemProps.dayOfWeek = dayOfWeek;
    this.data.systemProps.isWeekDay = dayOfWeek <= 5;
    this.data.systemProps.isWeekEnd = dayOfWeek > 5;

    this.data.systemProps.lifetimeSessions = lifetimeSessions;
    this.data.systemProps.lifetimeGames = lifetimeGames;

    if (!this.data.systemProps.lifetimeGamesEnded) {
      this.data.systemProps.lifetimeGamesEnded = 0;
    }

    if (!this.data.systemProps.lifetimeGamesCanceled) {
      this.data.systemProps.lifetimeGamesCanceled = 0;
    }

    if (!this.data.systemProps.lifetimeGameWins) {
      this.data.systemProps.lifetimeGameWins = 0;
    }

    if (!this.data.systemProps.lifetimeGameLoses) {
      this.data.systemProps.lifetimeGameLoses = 0;
    }

    if (isNewTimePeriod && this.onNewTimePeriod) {
      const props = Object.freeze(_cloneDeep(this.data.props));
      const systemProps = Object.freeze(_cloneDeep(this.data.systemProps));
      this.onNewTimePeriod(props, systemProps);
    }
  }

  getEarnedBadges(period: Period = Period.Global): EarnedBadge[] {
    const lastTimestamp = this.data.periods![period].lastTimestamp;
    return this.getEarnedBadgesSince(lastTimestamp);
  }

  getEarnedBadgesSince(lastTimestamp: string): EarnedBadge[] {
    const badges = this.data.earned.filter((b) => {
      return b.lastEarned >= lastTimestamp;
    });
    return badges;
  }

  getEarnedBadgesSinceBookmark(name: string): EarnedBadge[] {
    const lastTimestamp = this.data.bookmarks?.[name];
    return lastTimestamp ? this.getEarnedBadgesSince(lastTimestamp) : [];
  }

  setBookmark(name: string): string {
    const now = DateTime.utc().toISO();

    this.data.bookmarks[name] = now;

    return now;
  }

  clearBookmark(name: string): void {
    delete this.data.bookmarks[name];
  }

  clearAllBookmarks(): void {
    this.data.bookmarks = {};
  }

  startSession(): EarnedBadge[] {
    const lastTimestamp = DateTime.utc().toISO();

    const status = this.data.systemProps.sessionStatus ?? PeriodStatus.Started;
    if (status === PeriodStatus.InProgress) {
      this.endSession();
    }

    const date = DateTime.now().setZone(this.timeZone);
    this.prepareSystemProps(date);

    this.data.systemProps.isNewSession = true;
    this.data.systemProps.isSessionEnded = false;
    this.data.systemProps.sessionStatus = PeriodStatus.Started;

    const count = Number(this.data.periods![Period.Session].key);
    this.data.periods![Period.Session].key = this.getKeyPeriodCounter(count + 1);
    this.data.periods![Period.Session].lastTimestamp = DateTime.utc().toISO();
    this.data.systemProps.lifetimeSessions = count + 1;

    if (this.onSessionStart) {
      const props = Object.freeze(_cloneDeep(this.data.props));
      const systemProps = Object.freeze(_cloneDeep(this.data.systemProps));
      this.onSessionStart(props, systemProps);
    }

    this.evaluate();

    this.data.systemProps.isNewSession = false;
    this.data.systemProps.sessionStatus = PeriodStatus.InProgress;
    return this.getEarnedBadgesSince(lastTimestamp);
  }

  endSession(): EarnedBadge[] {
    const lastTimestamp = DateTime.utc().toISO();

    this.data.systemProps.isSessionEnded = true;
    this.data.systemProps.sessionStatus = PeriodStatus.Ended;

    if (this.onSessionEnd) {
      const props = Object.freeze(_cloneDeep(this.data.props));
      const systemProps = Object.freeze(_cloneDeep(this.data.systemProps));
      this.onSessionEnd(props, systemProps);
    }

    this.evaluate();

    return this.getEarnedBadgesSince(lastTimestamp);
  }

  startGame(): EarnedBadge[] {
    const lastTimestamp = DateTime.utc().toISO();

    const status = this.data.systemProps.gameStatus ?? PeriodStatus.Started;
    if (status === PeriodStatus.InProgress) {
      this.endGame(GameEndReason.GameStart);
    }

    const date = DateTime.now().setZone(this.timeZone);
    this.prepareSystemProps(date);

    this.data.systemProps.isNewGame = true;
    this.data.systemProps.isGameEnded = false;
    this.data.systemProps.gameStatus = PeriodStatus.Started;

    const count = Number(this.data.periods![Period.Game].key);
    this.data.periods![Period.Game].key = this.getKeyPeriodCounter(count + 1);
    this.data.periods![Period.Game].lastTimestamp = DateTime.utc().toISO();
    this.data.systemProps.lifetimeGames = count + 1;

    if (this.onGameStart) {
      const props = Object.freeze(_cloneDeep(this.data.props));
      const systemProps = Object.freeze(_cloneDeep(this.data.systemProps));
      this.onGameStart(props, systemProps);
    }

    this.evaluate();

    this.data.systemProps.isNewGame = false;
    this.data.systemProps.gameStatus = PeriodStatus.InProgress;
    return this.getEarnedBadgesSince(lastTimestamp);
  }

  endGame(reason: GameEndReason): EarnedBadge[] {
    const lastTimestamp = DateTime.utc().toISO();

    this.data.systemProps.isGameEnded = true;
    this.data.systemProps.gameStatus = PeriodStatus.Ended;
    this.data.systemProps.gameEndReason = reason;

    const ended = this.data.systemProps.lifetimeGamesEnded as number;
    this.data.systemProps.lifetimeGamesEnded = ended + 1;

    if (reason === GameEndReason.Win) {
      const wins = this.data.systemProps.lifetimeGameWins as number;
      this.data.systemProps.lifetimeGameWins = wins + 1;
    }

    if (reason === GameEndReason.Lose) {
      const loses = this.data.systemProps.lifetimeGameLoses as number;
      this.data.systemProps.lifetimeGameLoses = loses + 1;
    }

    if (reason === GameEndReason.Cancel) {
      const cancels = this.data.systemProps.lifetimeGamesCanceled as number;
      this.data.systemProps.lifetimeGamesCanceled = cancels + 1;
    }

    if (this.onGameEnd) {
      const props = Object.freeze(_cloneDeep(this.data.props));
      const systemProps = Object.freeze(_cloneDeep(this.data.systemProps));
      this.onGameEnd(props, systemProps, reason);
    }

    this.evaluate();
    return this.getEarnedBadgesSince(lastTimestamp);
  }

  badgeCount(badgeId: string): number {
    const found = this.data.earned.find((b) => b.id === badgeId);
    return found ? found.count : 0;
  }

  hasEarnedBadge(badgeId: string): boolean {
    return this.badgeCount(badgeId) > 0;
  }
}
