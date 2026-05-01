// server/src/game/logic.test.ts
import { describe, it, expect } from 'vitest';
import { scoreGuess, isWin } from './logic';

describe('scoreGuess', () => {
  it('marks every tile correct on a perfect guess', () => {
    const result = scoreGuess('stone', 'stone');
    expect(result.every((t) => t.status === 'correct')).toBe(true);
  });

  it('marks every tile absent when no letters overlap', () => {
    const result = scoreGuess('abcde', 'fghij');
    expect(result.map((t) => t.status)).toEqual([
      'absent', 'absent', 'absent', 'absent', 'absent',
    ]);
  });

  it('marks letters in wrong positions as present', () => {
    // answer STONE, guess NOTES → all letters in word, all wrong place
    const result = scoreGuess('notes', 'stone');
    expect(result.map((t) => t.status)).toEqual([
      'present', 'present', 'present', 'present', 'present',
    ]);
  });

  it('mixes correct, present, and absent', () => {
    // answer STONE, guess SPAIL
    //  S=correct (S at 0), P=absent, A=absent, I=absent, L=absent
    const result = scoreGuess('spail', 'stone');
    expect(result.map((t) => t.status)).toEqual([
      'correct', 'absent', 'absent', 'absent', 'absent',
    ]);
  });

  // The duplicate-letter cases are the ones that break naive implementations.
  describe('duplicate letters', () => {
    it('does not double-count: answer ALLEY, guess LLAMA', () => {
      // L (pos 0): not at pos 0 of ALLEY, but L exists at pos 1 → present
      // L (pos 1): exact match at pos 1 → correct
      // A (pos 2): A exists at pos 0 of ALLEY (unconsumed) → present
      // M (pos 3): no M → absent
      // A (pos 4): only one A in ALLEY, already consumed → absent
      const result = scoreGuess('llama', 'alley');
      expect(result.map((t) => t.status)).toEqual([
        'present', 'correct', 'present', 'absent', 'absent',
      ]);
    });

    it('answer ROBOT, guess BOOST: only one O is rewarded', () => {
      // B (0): B in ROBOT at pos 2 → present
      // O (1): O in ROBOT at pos 1 → correct
      // O (2): another O at pos 3 → present
      // S (3): no S → absent
      // T (4): T at pos 4 → correct
      const result = scoreGuess('boost', 'robot');
      expect(result.map((t) => t.status)).toEqual([
        'present', 'correct', 'present', 'absent', 'correct',
      ]);
    });

    it('green takes priority: answer ABBEY, guess BABBY', () => {
      // B (0): B in ABBEY at pos 1 → present
      // A (1): A in ABBEY at pos 0 → present
      // B (2): exact match at pos 2 → correct
      // B (3): only two Bs in ABBEY, both consumed → absent
      // Y (4): exact match at pos 4 → correct
      const result = scoreGuess('babby', 'abbey');
      expect(result.map((t) => t.status)).toEqual([
        'present', 'present', 'correct', 'absent', 'correct',
      ]);
    });
  });

  it('is case-insensitive', () => {
    const result = scoreGuess('STONE', 'stone');
    expect(result.every((t) => t.status === 'correct')).toBe(true);
  });

  it('throws on length mismatch', () => {
    expect(() => scoreGuess('stone', 'stones')).toThrow();
  });
});

describe('isWin', () => {
  it('returns true when all tiles are correct', () => {
    expect(isWin(scoreGuess('stone', 'stone'))).toBe(true);
  });

  it('returns false when any tile is not correct', () => {
    expect(isWin(scoreGuess('store', 'stone'))).toBe(false);
  });
});