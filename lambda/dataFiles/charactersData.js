var races = ['human', 'elf', 'dwarf']

var warriorsData = {
    characterType: 'warrior',
    characterClass: 'warrior',
    characterRaces: races,
    charactersList: [
        {name: 'Broadrick', gender: 'boy' },
        {name: 'Deadrick', gender: 'boy'}
    ],
    startingHealth: 6,
    healthDie: 8,
    numberOfHealthDice: 1,
    maxSkills: 4,
    startingWeapons: 1,
    startingArmor: 2,
    startingSkills: 0,
    startingPowerLevel: 7,
    startingAttackBonus: 7,
    startingDefensiveBonus: 7,
    fullnames: ['Gutter Rat of Boardina','Gutter Rat of Boardina'],
    titles: ['swordsman', 'fighter'],
    backStories: ["once the squire to Champion of the High King; now just a wandering sword-arm after his lord's fall at Harald's bridge. "],
    goals: [" this is an opportunity for fame and to start a personal legend. "],
    thumbnails: ['head1.png'],
};
    
var clericsData = {
    characterType: 'cleric',
    characterClass: 'cleric',
    characterRaces: races,
    charactersList: [
        {name: 'Gravin', gender: 'boy'},
        {name: 'Barvin', gender: 'boy'}
    ],
    startingHealth: 6,
    healthDie: 6,
    numberOfHealthDice: 1,
    maxSkills: 6,
    startingWeapons: 1,
    startingArmor: 1,
    startingSkills: 0,
    startingPowerLevel: 7,
    startingAttackBonus: 7,
    startingDefensiveBonus: 7,
    fullnames: ['Gutter Rat of Boardina','Gutter Rat of Boardina'],
    titles: ['novice', 'prelate'],
    backStories: [" on a pious quest to rid the land of the taint of the underworld. "],
    goals: [" this is an opportunity to destroy this profane cult and put a dent in the darkness that has spread over this world. "],
    thumbnails: ['head2.png']
};
    
var thievesData = {
    characterType: 'thief',
    characterClass: 'thief',
    characterRaces: races,
    charactersList: [
        {name: 'Leanna', gender: 'girl'},
        {name: 'Beanna', gender: 'girl'}
    ],
    startingHealth: 6,
    healthDie: 4,
    numberOfHealthDice: 1,
    maxSkills: 6,
    startingWeapons: 1,
    startingArmor: 1,
    startingSkills: 0,
    startingPowerLevel: 7,
    startingAttackBonus: 7,
    startingDefensiveBonus: 7,
    fullnames: ['Gutter Rat of Boardina','Gutter Rat of Boardina'],
    titles: ['cutpurse', 'filcher'],
    backStories: [" on loan from the Thieves Guild looking to make a name and maybe get rich in the process. "],
    goals: [" this is an opportunity for riches. "],
    thumbnails: ['head3.png']
};
    
var magicusersData = {
    characterType: 'magic user',
    characterClass: 'magic user',
    characterRaces: races,
    charactersList: [
        {name: 'Paul-drake', gender: 'boy'},
        {name: 'Bauldric', gender: 'boy'}
    ],
    startingHealth: 4,
    healthDie: 4,
    numberOfHealthDice: 2,
    maxSkills: 8,
    startingWeapons: 1,
    startingArmor: 1,
    startingPowerLevel: 7,
    startingAttackBonus: 7,
    startingDefensiveBonus: 7,
    fullnames: ['Gutter Rat of Boardina','Gutter Rat of Boardina'],
    startingSkills: 0,
    titles: ['apprentice', 'wizard'],
    backStories: [" a young mage in training on break from the school of the Arcane hoping to increase their magical knowledge through fieldwork. "],
    goals: [" this is an opportunity to put magic to practical use and explore the mystic arts. "],
    thumbnails: ['head4.png']
};
    
var charactersData = [warriorsData, clericsData, thievesData, magicusersData]

exports.charactersData = charactersData;