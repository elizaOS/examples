/**
 * SRD Races
 * D&D 5e System Reference Document race definitions
 */

import type { Race, AbilityName, SkillName } from '../types';

export interface SRDRace {
  name: Race;
  abilityScoreIncrease: Partial<Record<AbilityName, number>>;
  size: 'Small' | 'Medium';
  speed: number;
  languages: string[];
  traits: string[];
  proficiencies?: {
    weapons?: string[];
    armor?: string[];
    tools?: string[];
    skills?: SkillName[];
  };
  darkvision?: number;
  resistances?: string[];
  subraces?: SRDSubrace[];
}

export interface SRDSubrace {
  name: string;
  abilityScoreIncrease: Partial<Record<AbilityName, number>>;
  traits: string[];
  proficiencies?: {
    weapons?: string[];
    armor?: string[];
    tools?: string[];
    skills?: SkillName[];
  };
}

export const SRD_RACES: Record<Race, SRDRace> = {
  Human: {
    name: 'Human',
    abilityScoreIncrease: {
      strength: 1,
      dexterity: 1,
      constitution: 1,
      intelligence: 1,
      wisdom: 1,
      charisma: 1,
    },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'One of your choice'],
    traits: ['Versatile'],
  },
  
  Dwarf: {
    name: 'Dwarf',
    abilityScoreIncrease: {
      constitution: 2,
    },
    size: 'Medium',
    speed: 25, // Not reduced by heavy armor
    languages: ['Common', 'Dwarvish'],
    darkvision: 60,
    resistances: ['Poison'],
    traits: [
      'Dwarven Resilience: Advantage on saving throws against poison',
      'Dwarven Combat Training',
      'Tool Proficiency: Choose one artisan tool',
      'Stonecunning: Double proficiency on History checks related to stonework',
    ],
    proficiencies: {
      weapons: ['Battleaxe', 'Handaxe', 'Light Hammer', 'Warhammer'],
    },
    subraces: [
      {
        name: 'Hill Dwarf',
        abilityScoreIncrease: { wisdom: 1 },
        traits: ['Dwarven Toughness: +1 HP per level'],
      },
      {
        name: 'Mountain Dwarf',
        abilityScoreIncrease: { strength: 2 },
        traits: [],
        proficiencies: {
          armor: ['Light Armor', 'Medium Armor'],
        },
      },
    ],
  },
  
  Elf: {
    name: 'Elf',
    abilityScoreIncrease: {
      dexterity: 2,
    },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Elvish'],
    darkvision: 60,
    traits: [
      'Keen Senses: Proficiency in Perception',
      'Fey Ancestry: Advantage on saves vs charmed, immune to magical sleep',
      'Trance: 4 hours of meditation instead of 8 hours sleep',
    ],
    proficiencies: {
      skills: ['perception'],
    },
    subraces: [
      {
        name: 'High Elf',
        abilityScoreIncrease: { intelligence: 1 },
        traits: [
          'Elf Weapon Training',
          'Cantrip: One wizard cantrip (Int)',
          'Extra Language',
        ],
        proficiencies: {
          weapons: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'],
        },
      },
      {
        name: 'Wood Elf',
        abilityScoreIncrease: { wisdom: 1 },
        traits: [
          'Elf Weapon Training',
          'Fleet of Foot: Base speed 35',
          'Mask of the Wild: Can hide in light natural phenomena',
        ],
        proficiencies: {
          weapons: ['Longsword', 'Shortsword', 'Shortbow', 'Longbow'],
        },
      },
      {
        name: 'Dark Elf (Drow)',
        abilityScoreIncrease: { charisma: 1 },
        traits: [
          'Superior Darkvision: 120 feet',
          'Sunlight Sensitivity: Disadvantage in sunlight',
          'Drow Magic: Dancing Lights, Faerie Fire (3rd), Darkness (5th)',
          'Drow Weapon Training',
        ],
        proficiencies: {
          weapons: ['Rapier', 'Shortsword', 'Hand Crossbow'],
        },
      },
    ],
  },
  
  Halfling: {
    name: 'Halfling',
    abilityScoreIncrease: {
      dexterity: 2,
    },
    size: 'Small',
    speed: 25,
    languages: ['Common', 'Halfling'],
    traits: [
      'Lucky: Reroll 1s on d20 (attack, ability, save)',
      'Brave: Advantage on saves vs frightened',
      'Halfling Nimbleness: Move through larger creatures',
    ],
    subraces: [
      {
        name: 'Lightfoot Halfling',
        abilityScoreIncrease: { charisma: 1 },
        traits: ['Naturally Stealthy: Can hide behind larger creatures'],
      },
      {
        name: 'Stout Halfling',
        abilityScoreIncrease: { constitution: 1 },
        traits: ['Stout Resilience: Advantage on poison saves, resistance to poison'],
      },
    ],
  },
  
  Dragonborn: {
    name: 'Dragonborn',
    abilityScoreIncrease: {
      strength: 2,
      charisma: 1,
    },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Draconic'],
    traits: [
      'Draconic Ancestry: Choose dragon type (determines breath/resistance)',
      'Breath Weapon: 2d6 elemental damage (scales with level)',
      'Damage Resistance: Resistance to ancestry damage type',
    ],
  },
  
  Gnome: {
    name: 'Gnome',
    abilityScoreIncrease: {
      intelligence: 2,
    },
    size: 'Small',
    speed: 25,
    languages: ['Common', 'Gnomish'],
    darkvision: 60,
    traits: [
      'Gnome Cunning: Advantage on Int, Wis, Cha saves vs magic',
    ],
    subraces: [
      {
        name: 'Forest Gnome',
        abilityScoreIncrease: { dexterity: 1 },
        traits: [
          'Natural Illusionist: Minor Illusion cantrip (Int)',
          'Speak with Small Beasts',
        ],
      },
      {
        name: 'Rock Gnome',
        abilityScoreIncrease: { constitution: 1 },
        traits: [
          'Artificer\'s Lore: Double proficiency on magic item History checks',
          'Tinker: Can create tiny clockwork devices',
        ],
        proficiencies: {
          tools: ['Tinker\'s Tools'],
        },
      },
    ],
  },
  
  'Half-Elf': {
    name: 'Half-Elf',
    abilityScoreIncrease: {
      charisma: 2,
      // Plus 1 to two other abilities of choice
    },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Elvish', 'One of your choice'],
    darkvision: 60,
    traits: [
      'Fey Ancestry: Advantage on saves vs charmed, immune to magical sleep',
      'Skill Versatility: Proficiency in two skills of your choice',
    ],
  },
  
  'Half-Orc': {
    name: 'Half-Orc',
    abilityScoreIncrease: {
      strength: 2,
      constitution: 1,
    },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Orc'],
    darkvision: 60,
    traits: [
      'Menacing: Proficiency in Intimidation',
      'Relentless Endurance: Drop to 1 HP instead of 0 (1/long rest)',
      'Savage Attacks: Extra weapon damage die on crit',
    ],
    proficiencies: {
      skills: ['intimidation'],
    },
  },
  
  Tiefling: {
    name: 'Tiefling',
    abilityScoreIncrease: {
      intelligence: 1,
      charisma: 2,
    },
    size: 'Medium',
    speed: 30,
    languages: ['Common', 'Infernal'],
    darkvision: 60,
    resistances: ['Fire'],
    traits: [
      'Hellish Resistance: Resistance to fire damage',
      'Infernal Legacy: Thaumaturgy cantrip, Hellish Rebuke (3rd), Darkness (5th)',
    ],
  },
};

/**
 * Get starting ability score increases for a race
 */
export function getRaceAbilityBonuses(race: Race, subrace?: string): Partial<Record<AbilityName, number>> {
  const raceData = SRD_RACES[race];
  if (!raceData) return {};
  
  const bonuses = { ...raceData.abilityScoreIncrease };
  
  if (subrace && raceData.subraces) {
    const subraceData = raceData.subraces.find(s => s.name === subrace);
    if (subraceData) {
      for (const [ability, bonus] of Object.entries(subraceData.abilityScoreIncrease)) {
        const abilityName = ability as AbilityName;
        bonuses[abilityName] = (bonuses[abilityName] || 0) + bonus;
      }
    }
  }
  
  return bonuses;
}

/**
 * Get base speed for a race
 */
export function getRaceSpeed(race: Race, subrace?: string): number {
  const raceData = SRD_RACES[race];
  if (!raceData) return 30;
  
  // Wood Elf has 35 speed
  if (race === 'Elf' && subrace === 'Wood Elf') {
    return 35;
  }
  
  return raceData.speed;
}

/**
 * Get darkvision range for a race
 */
export function getRaceDarkvision(race: Race, subrace?: string): number {
  const raceData = SRD_RACES[race];
  if (!raceData?.darkvision) return 0;
  
  // Drow has superior darkvision
  if (race === 'Elf' && subrace === 'Dark Elf (Drow)') {
    return 120;
  }
  
  return raceData.darkvision;
}

/**
 * Get all racial traits as strings
 */
export function getRaceTraits(race: Race, subrace?: string): string[] {
  const raceData = SRD_RACES[race];
  if (!raceData) return [];
  
  const traits = [...raceData.traits];
  
  if (subrace && raceData.subraces) {
    const subraceData = raceData.subraces.find(s => s.name === subrace);
    if (subraceData) {
      traits.push(...subraceData.traits);
    }
  }
  
  return traits;
}
