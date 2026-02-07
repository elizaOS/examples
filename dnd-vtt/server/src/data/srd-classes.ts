/**
 * SRD Classes
 * D&D 5e System Reference Document class definitions
 */

import type { CharacterClass, AbilityName, SkillName } from '../types';

export interface SRDClass {
  name: CharacterClass;
  hitDie: 'd6' | 'd8' | 'd10' | 'd12';
  primaryAbility: AbilityName[];
  savingThrowProficiencies: AbilityName[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  skillChoices: {
    choose: number;
    from: SkillName[];
  };
  startingEquipment: string[];
  spellcasting?: {
    ability: AbilityName;
    knownOrPrepared: 'known' | 'prepared';
    ritual: boolean;
    focus: string;
  };
  features: Record<number, string[]>;
}

export const SRD_CLASSES: Record<CharacterClass, SRDClass> = {
  Barbarian: {
    name: 'Barbarian',
    hitDie: 'd12',
    primaryAbility: ['strength'],
    savingThrowProficiencies: ['strength', 'constitution'],
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    toolProficiencies: [],
    skillChoices: {
      choose: 2,
      from: ['animalHandling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'],
    },
    startingEquipment: [
      'Greataxe OR any martial melee weapon',
      'Two handaxes OR any simple weapon',
      'Explorer\'s pack',
      'Four javelins',
    ],
    features: {
      1: ['Rage', 'Unarmored Defense'],
      2: ['Reckless Attack', 'Danger Sense'],
      3: ['Primal Path'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack', 'Fast Movement'],
      // ... continues to level 20
    },
  },
  
  Bard: {
    name: 'Bard',
    hitDie: 'd8',
    primaryAbility: ['charisma'],
    savingThrowProficiencies: ['dexterity', 'charisma'],
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons', 'Hand Crossbow', 'Longsword', 'Rapier', 'Shortsword'],
    toolProficiencies: ['Three musical instruments of your choice'],
    skillChoices: {
      choose: 3,
      from: ['acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion', 'sleightOfHand', 'stealth', 'survival'],
    },
    startingEquipment: [
      'Rapier OR longsword OR any simple weapon',
      'Diplomat\'s pack OR entertainer\'s pack',
      'Lute OR any musical instrument',
      'Leather armor',
      'Dagger',
    ],
    spellcasting: {
      ability: 'charisma',
      knownOrPrepared: 'known',
      ritual: true,
      focus: 'Musical instrument',
    },
    features: {
      1: ['Spellcasting', 'Bardic Inspiration (d6)'],
      2: ['Jack of All Trades', 'Song of Rest (d6)'],
      3: ['Bard College', 'Expertise'],
      4: ['Ability Score Improvement'],
      5: ['Bardic Inspiration (d8)', 'Font of Inspiration'],
    },
  },
  
  Cleric: {
    name: 'Cleric',
    hitDie: 'd8',
    primaryAbility: ['wisdom'],
    savingThrowProficiencies: ['wisdom', 'charisma'],
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons'],
    toolProficiencies: [],
    skillChoices: {
      choose: 2,
      from: ['history', 'insight', 'medicine', 'persuasion', 'religion'],
    },
    startingEquipment: [
      'Mace OR warhammer (if proficient)',
      'Scale mail OR leather armor OR chain mail (if proficient)',
      'Light crossbow and 20 bolts OR any simple weapon',
      'Priest\'s pack OR explorer\'s pack',
      'Shield and holy symbol',
    ],
    spellcasting: {
      ability: 'wisdom',
      knownOrPrepared: 'prepared',
      ritual: true,
      focus: 'Holy symbol',
    },
    features: {
      1: ['Spellcasting', 'Divine Domain'],
      2: ['Channel Divinity (1/rest)', 'Divine Domain feature'],
      3: [],
      4: ['Ability Score Improvement'],
      5: ['Destroy Undead (CR 1/2)'],
    },
  },
  
  Druid: {
    name: 'Druid',
    hitDie: 'd8',
    primaryAbility: ['wisdom'],
    savingThrowProficiencies: ['intelligence', 'wisdom'],
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields (no metal)'],
    weaponProficiencies: ['Club', 'Dagger', 'Dart', 'Javelin', 'Mace', 'Quarterstaff', 'Scimitar', 'Sickle', 'Sling', 'Spear'],
    toolProficiencies: ['Herbalism kit'],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'animalHandling', 'insight', 'medicine', 'nature', 'perception', 'religion', 'survival'],
    },
    startingEquipment: [
      'Wooden shield OR any simple weapon',
      'Scimitar OR any simple melee weapon',
      'Leather armor',
      'Explorer\'s pack',
      'Druidic focus',
    ],
    spellcasting: {
      ability: 'wisdom',
      knownOrPrepared: 'prepared',
      ritual: true,
      focus: 'Druidic focus',
    },
    features: {
      1: ['Druidic', 'Spellcasting'],
      2: ['Wild Shape', 'Druid Circle'],
      3: [],
      4: ['Wild Shape improvement', 'Ability Score Improvement'],
      5: [],
    },
  },
  
  Fighter: {
    name: 'Fighter',
    hitDie: 'd10',
    primaryAbility: ['strength', 'dexterity'],
    savingThrowProficiencies: ['strength', 'constitution'],
    armorProficiencies: ['All Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    toolProficiencies: [],
    skillChoices: {
      choose: 2,
      from: ['acrobatics', 'animalHandling', 'athletics', 'history', 'insight', 'intimidation', 'perception', 'survival'],
    },
    startingEquipment: [
      'Chain mail OR leather armor, longbow, 20 arrows',
      'Martial weapon and shield OR two martial weapons',
      'Light crossbow and 20 bolts OR two handaxes',
      'Dungeoneer\'s pack OR explorer\'s pack',
    ],
    features: {
      1: ['Fighting Style', 'Second Wind'],
      2: ['Action Surge (1 use)'],
      3: ['Martial Archetype'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
    },
  },
  
  Monk: {
    name: 'Monk',
    hitDie: 'd8',
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrowProficiencies: ['strength', 'dexterity'],
    armorProficiencies: [],
    weaponProficiencies: ['Simple Weapons', 'Shortsword'],
    toolProficiencies: ['One artisan\'s tool OR musical instrument'],
    skillChoices: {
      choose: 2,
      from: ['acrobatics', 'athletics', 'history', 'insight', 'religion', 'stealth'],
    },
    startingEquipment: [
      'Shortsword OR any simple weapon',
      'Dungeoneer\'s pack OR explorer\'s pack',
      '10 darts',
    ],
    features: {
      1: ['Unarmored Defense', 'Martial Arts'],
      2: ['Ki', 'Unarmored Movement'],
      3: ['Monastic Tradition', 'Deflect Missiles'],
      4: ['Ability Score Improvement', 'Slow Fall'],
      5: ['Extra Attack', 'Stunning Strike'],
    },
  },
  
  Paladin: {
    name: 'Paladin',
    hitDie: 'd10',
    primaryAbility: ['strength', 'charisma'],
    savingThrowProficiencies: ['wisdom', 'charisma'],
    armorProficiencies: ['All Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    toolProficiencies: [],
    skillChoices: {
      choose: 2,
      from: ['athletics', 'insight', 'intimidation', 'medicine', 'persuasion', 'religion'],
    },
    startingEquipment: [
      'Martial weapon and shield OR two martial weapons',
      'Five javelins OR any simple melee weapon',
      'Priest\'s pack OR explorer\'s pack',
      'Chain mail and holy symbol',
    ],
    spellcasting: {
      ability: 'charisma',
      knownOrPrepared: 'prepared',
      ritual: false,
      focus: 'Holy symbol',
    },
    features: {
      1: ['Divine Sense', 'Lay on Hands'],
      2: ['Fighting Style', 'Spellcasting', 'Divine Smite'],
      3: ['Divine Health', 'Sacred Oath'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
    },
  },
  
  Ranger: {
    name: 'Ranger',
    hitDie: 'd10',
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrowProficiencies: ['strength', 'dexterity'],
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    toolProficiencies: [],
    skillChoices: {
      choose: 3,
      from: ['animalHandling', 'athletics', 'insight', 'investigation', 'nature', 'perception', 'stealth', 'survival'],
    },
    startingEquipment: [
      'Scale mail OR leather armor',
      'Two shortswords OR two simple melee weapons',
      'Dungeoneer\'s pack OR explorer\'s pack',
      'Longbow and quiver of 20 arrows',
    ],
    spellcasting: {
      ability: 'wisdom',
      knownOrPrepared: 'known',
      ritual: false,
      focus: 'None',
    },
    features: {
      1: ['Favored Enemy', 'Natural Explorer'],
      2: ['Fighting Style', 'Spellcasting'],
      3: ['Ranger Archetype', 'Primeval Awareness'],
      4: ['Ability Score Improvement'],
      5: ['Extra Attack'],
    },
  },
  
  Rogue: {
    name: 'Rogue',
    hitDie: 'd8',
    primaryAbility: ['dexterity'],
    savingThrowProficiencies: ['dexterity', 'intelligence'],
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons', 'Hand Crossbow', 'Longsword', 'Rapier', 'Shortsword'],
    toolProficiencies: ['Thieves\' tools'],
    skillChoices: {
      choose: 4,
      from: ['acrobatics', 'athletics', 'deception', 'insight', 'intimidation', 'investigation', 'perception', 'performance', 'persuasion', 'sleightOfHand', 'stealth'],
    },
    startingEquipment: [
      'Rapier OR shortsword',
      'Shortbow and quiver of 20 arrows OR shortsword',
      'Burglar\'s pack OR dungeoneer\'s pack OR explorer\'s pack',
      'Leather armor, two daggers, thieves\' tools',
    ],
    features: {
      1: ['Expertise', 'Sneak Attack', 'Thieves\' Cant'],
      2: ['Cunning Action'],
      3: ['Roguish Archetype'],
      4: ['Ability Score Improvement'],
      5: ['Uncanny Dodge'],
    },
  },
  
  Sorcerer: {
    name: 'Sorcerer',
    hitDie: 'd6',
    primaryAbility: ['charisma'],
    savingThrowProficiencies: ['constitution', 'charisma'],
    armorProficiencies: [],
    weaponProficiencies: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],
    toolProficiencies: [],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'deception', 'insight', 'intimidation', 'persuasion', 'religion'],
    },
    startingEquipment: [
      'Light crossbow and 20 bolts OR any simple weapon',
      'Component pouch OR arcane focus',
      'Dungeoneer\'s pack OR explorer\'s pack',
      'Two daggers',
    ],
    spellcasting: {
      ability: 'charisma',
      knownOrPrepared: 'known',
      ritual: false,
      focus: 'Arcane focus',
    },
    features: {
      1: ['Spellcasting', 'Sorcerous Origin'],
      2: ['Font of Magic'],
      3: ['Metamagic'],
      4: ['Ability Score Improvement'],
      5: [],
    },
  },
  
  Warlock: {
    name: 'Warlock',
    hitDie: 'd8',
    primaryAbility: ['charisma'],
    savingThrowProficiencies: ['wisdom', 'charisma'],
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons'],
    toolProficiencies: [],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'deception', 'history', 'intimidation', 'investigation', 'nature', 'religion'],
    },
    startingEquipment: [
      'Light crossbow and 20 bolts OR any simple weapon',
      'Component pouch OR arcane focus',
      'Scholar\'s pack OR dungeoneer\'s pack',
      'Leather armor, any simple weapon, two daggers',
    ],
    spellcasting: {
      ability: 'charisma',
      knownOrPrepared: 'known',
      ritual: false,
      focus: 'Arcane focus',
    },
    features: {
      1: ['Otherworldly Patron', 'Pact Magic'],
      2: ['Eldritch Invocations'],
      3: ['Pact Boon'],
      4: ['Ability Score Improvement'],
      5: [],
    },
  },
  
  Wizard: {
    name: 'Wizard',
    hitDie: 'd6',
    primaryAbility: ['intelligence'],
    savingThrowProficiencies: ['intelligence', 'wisdom'],
    armorProficiencies: [],
    weaponProficiencies: ['Dagger', 'Dart', 'Sling', 'Quarterstaff', 'Light Crossbow'],
    toolProficiencies: [],
    skillChoices: {
      choose: 2,
      from: ['arcana', 'history', 'insight', 'investigation', 'medicine', 'religion'],
    },
    startingEquipment: [
      'Quarterstaff OR dagger',
      'Component pouch OR arcane focus',
      'Scholar\'s pack OR explorer\'s pack',
      'Spellbook',
    ],
    spellcasting: {
      ability: 'intelligence',
      knownOrPrepared: 'prepared',
      ritual: true,
      focus: 'Arcane focus',
    },
    features: {
      1: ['Spellcasting', 'Arcane Recovery'],
      2: ['Arcane Tradition'],
      3: [],
      4: ['Ability Score Improvement'],
      5: [],
    },
  },
};

/**
 * Get starting HP for a class at level 1
 */
export function getStartingHP(className: CharacterClass, constitutionMod: number): number {
  const classData = SRD_CLASSES[className];
  if (!classData) return 8 + constitutionMod;
  
  const hitDieMax: Record<string, number> = {
    'd6': 6,
    'd8': 8,
    'd10': 10,
    'd12': 12,
  };
  
  return hitDieMax[classData.hitDie] + constitutionMod;
}

/**
 * Get average HP gain per level (used for NPC/monster creation)
 */
export function getAverageHPPerLevel(className: CharacterClass, constitutionMod: number): number {
  const classData = SRD_CLASSES[className];
  if (!classData) return 5 + constitutionMod;
  
  const hitDieAverage: Record<string, number> = {
    'd6': 4,
    'd8': 5,
    'd10': 6,
    'd12': 7,
  };
  
  return hitDieAverage[classData.hitDie] + constitutionMod;
}

/**
 * Get spell slots by class and level (full casters)
 */
export function getSpellSlots(
  className: CharacterClass,
  level: number
): Record<number, number> | null {
  const classData = SRD_CLASSES[className];
  if (!classData?.spellcasting) return null;
  
  // Full casters: Bard, Cleric, Druid, Sorcerer, Wizard
  // Half casters: Paladin, Ranger (get slots at level 2)
  // Pact Magic: Warlock (special progression)
  
  const fullCasters = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'];
  const halfCasters = ['Paladin', 'Ranger'];
  
  if (className === 'Warlock') {
    // Warlock Pact Magic progression
    const warlockSlots: Record<number, { slots: number; level: number }> = {
      1: { slots: 1, level: 1 },
      2: { slots: 2, level: 1 },
      3: { slots: 2, level: 2 },
      4: { slots: 2, level: 2 },
      5: { slots: 2, level: 3 },
      6: { slots: 2, level: 3 },
      7: { slots: 2, level: 4 },
      8: { slots: 2, level: 4 },
      9: { slots: 2, level: 5 },
      10: { slots: 2, level: 5 },
      11: { slots: 3, level: 5 },
      12: { slots: 3, level: 5 },
    };
    const config = warlockSlots[Math.min(level, 12)];
    return config ? { [config.level]: config.slots } : null;
  }
  
  // Full caster spell slot table
  const fullCasterSlots: Record<number, Record<number, number>> = {
    1: { 1: 2 },
    2: { 1: 3 },
    3: { 1: 4, 2: 2 },
    4: { 1: 4, 2: 3 },
    5: { 1: 4, 2: 3, 3: 2 },
    6: { 1: 4, 2: 3, 3: 3 },
    7: { 1: 4, 2: 3, 3: 3, 4: 1 },
    8: { 1: 4, 2: 3, 3: 3, 4: 2 },
    9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    // ... continues to 20
  };
  
  if (fullCasters.includes(className)) {
    return fullCasterSlots[Math.min(level, 12)] || null;
  }
  
  // Half caster progression (use half level, round down, minimum 1 for level 2+)
  if (halfCasters.includes(className)) {
    if (level < 2) return null;
    const effectiveLevel = Math.floor(level / 2);
    return fullCasterSlots[Math.min(effectiveLevel, 12)] || null;
  }
  
  return null;
}

/**
 * Get class proficiencies
 */
export function getClassProficiencies(className: CharacterClass): {
  armor: string[];
  weapons: string[];
  tools: string[];
  savingThrows: AbilityName[];
} {
  const classData = SRD_CLASSES[className];
  if (!classData) {
    return {
      armor: [],
      weapons: ['Simple Weapons'],
      tools: [],
      savingThrows: ['constitution', 'wisdom'],
    };
  }
  
  return {
    armor: classData.armorProficiencies,
    weapons: classData.weaponProficiencies,
    tools: classData.toolProficiencies,
    savingThrows: classData.savingThrowProficiencies,
  };
}
