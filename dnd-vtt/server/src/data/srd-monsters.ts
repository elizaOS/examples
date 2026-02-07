/**
 * D&D 5e SRD Monster Stat Blocks
 */

import type { Monster } from '../types';

export function cloneMonster(template: Monster, newName?: string): Monster {
  const clone: Monster = JSON.parse(JSON.stringify(template));
  if (newName) {
    clone.name = newName;
    clone.id = `${template.id}-${newName.toLowerCase().replace(/\s+/g, '-')}`;
  } else {
    clone.id = `${template.id}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return clone;
}

export const SRD_MONSTERS: Record<string, Monster> = {
  goblin: {
    id: 'srd-goblin',
    name: 'Goblin',
    size: 'Small',
    type: 'humanoid',
    subtype: 'goblinoid',
    alignment: 'neutral evil',
    ac: 15,
    armorType: 'leather armor, shield',
    hp: { current: 7, max: 7, temp: 0 },
    hpFormula: '2d6',
    speed: { walk: 30 },
    abilities: {
      str: 8,
      dex: 14,
      con: 10,
      int: 10,
      wis: 8,
      cha: 8,
    },
    skills: { stealth: 6 },
    senses: { darkvision: 60, passivePerception: 9 },
    languages: ['Common', 'Goblin'],
    challengeRating: 0.25,
    experiencePoints: 50,
    proficiencyBonus: 2,
    specialAbilities: [
      {
        name: 'Nimble Escape',
        description: 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.',
      },
    ],
    actions: [
      {
        name: 'Scimitar',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'slashing',
        reach: 5,
      },
      {
        name: 'Shortbow',
        description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'piercing',
        range: '80/320',
      },
    ],
  },

  skeleton: {
    id: 'srd-skeleton',
    name: 'Skeleton',
    size: 'Medium',
    type: 'undead',
    alignment: 'lawful evil',
    ac: 13,
    armorType: 'armor scraps',
    hp: { current: 13, max: 13, temp: 0 },
    hpFormula: '2d8+4',
    speed: { walk: 30 },
    abilities: {
      str: 10,
      dex: 14,
      con: 15,
      int: 6,
      wis: 8,
      cha: 5,
    },
    vulnerabilities: ['bludgeoning'],
    immunities: ['poison'],
    conditionImmunities: ['exhaustion', 'poisoned'] as Monster['conditionImmunities'],
    senses: { darkvision: 60, passivePerception: 9 },
    languages: ['understands all languages it knew in life but can\'t speak'],
    challengeRating: 0.25,
    experiencePoints: 50,
    proficiencyBonus: 2,
    actions: [
      {
        name: 'Shortsword',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'piercing',
        reach: 5,
      },
      {
        name: 'Shortbow',
        description: 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.',
        attackBonus: 4,
        damage: '1d6+2',
        damageType: 'piercing',
        range: '80/320',
      },
    ],
  },

  wolf: {
    id: 'srd-wolf',
    name: 'Wolf',
    size: 'Medium',
    type: 'beast',
    alignment: 'unaligned',
    ac: 13,
    armorType: 'natural armor',
    hp: { current: 11, max: 11, temp: 0 },
    hpFormula: '2d8+2',
    speed: { walk: 40 },
    abilities: {
      str: 12,
      dex: 15,
      con: 12,
      int: 3,
      wis: 12,
      cha: 6,
    },
    skills: { perception: 3, stealth: 4 },
    senses: { passivePerception: 13 },
    languages: [],
    challengeRating: 0.25,
    experiencePoints: 50,
    proficiencyBonus: 2,
    specialAbilities: [
      {
        name: 'Keen Hearing and Smell',
        description: 'The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell.',
      },
      {
        name: 'Pack Tactics',
        description: 'The wolf has advantage on an attack roll against a creature if at least one of the wolf\'s allies is within 5 feet of the creature and the ally isn\'t incapacitated.',
      },
    ],
    actions: [
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) piercing damage. If the target is a creature, it must succeed on a DC 11 Strength saving throw or be knocked prone.',
        attackBonus: 4,
        damage: '2d4+2',
        damageType: 'piercing',
        reach: 5,
        saveDC: 11,
        saveAbility: 'str',
      },
    ],
  },

  zombie: {
    id: 'srd-zombie',
    name: 'Zombie',
    size: 'Medium',
    type: 'undead',
    alignment: 'neutral evil',
    ac: 8,
    hp: { current: 22, max: 22, temp: 0 },
    hpFormula: '3d8+9',
    speed: { walk: 20 },
    abilities: {
      str: 13,
      dex: 6,
      con: 16,
      int: 3,
      wis: 6,
      cha: 5,
    },
    savingThrows: { wis: 0 },
    immunities: ['poison'],
    conditionImmunities: ['poisoned'] as Monster['conditionImmunities'],
    senses: { darkvision: 60, passivePerception: 8 },
    languages: ['understands the languages it knew in life but can\'t speak'],
    challengeRating: 0.25,
    experiencePoints: 50,
    proficiencyBonus: 2,
    specialAbilities: [
      {
        name: 'Undead Fortitude',
        description: 'If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.',
      },
    ],
    actions: [
      {
        name: 'Slam',
        description: 'Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) bludgeoning damage.',
        attackBonus: 3,
        damage: '1d6+1',
        damageType: 'bludgeoning',
        reach: 5,
      },
    ],
  },

  giant_rat: {
    id: 'srd-giant-rat',
    name: 'Giant Rat',
    size: 'Small',
    type: 'beast',
    alignment: 'unaligned',
    ac: 12,
    hp: { current: 7, max: 7, temp: 0 },
    hpFormula: '2d6',
    speed: { walk: 30 },
    abilities: {
      str: 7,
      dex: 15,
      con: 11,
      int: 2,
      wis: 10,
      cha: 4,
    },
    senses: { darkvision: 60, passivePerception: 10 },
    languages: [],
    challengeRating: 0.125,
    experiencePoints: 25,
    proficiencyBonus: 2,
    specialAbilities: [
      {
        name: 'Keen Smell',
        description: 'The rat has advantage on Wisdom (Perception) checks that rely on smell.',
      },
      {
        name: 'Pack Tactics',
        description: 'The rat has advantage on an attack roll against a creature if at least one of the rat\'s allies is within 5 feet of the creature and the ally isn\'t incapacitated.',
      },
    ],
    actions: [
      {
        name: 'Bite',
        description: 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 4 (1d4 + 2) piercing damage.',
        attackBonus: 4,
        damage: '1d4+2',
        damageType: 'piercing',
        reach: 5,
      },
    ],
  },
};
