const charactersData = require('../dataFiles/charactersData.js').charactersData;
const metaData = require('../dataFiles/metaData.js').metaData;
const utils = require('./generalUtils.js');
const armor = require('../dataFiles//armorData.js').armor;
const weapons = require('../dataFiles//weaponsData.js').weapons;
const levelUpData = require('../dataFiles//abilitiesData.js').levelUpData;

function levelUp (inputObject) {
    // this function takes in a char object and adds the level up unlockedSkills
    // for that class char at that char level
    // this means the level needs to be set before accessing this function
    
    var outputObject = inputObject;
    
    var charClass = inputObject.characterClass;
    var charLevel = inputObject.characterLevel;
    
    var levelUpObject;
    
    for (var levelUpCounter = 0; levelUpCounter<levelUpData.length; levelUpCounter++) {
        if (levelUpData[levelUpCounter].className === charClass) {
            levelUpObject = levelUpData[levelUpCounter].unlockTable[charLevel]
        }
    }
    
    if (levelUpObject.increasedAttribute) {
        if (levelUpObject.increasedAttribute === 'base health') {
            outputObject.baseHealth = (inputObject.baseHealth + 5)    
        } else {
            if (levelUpObject.increasedAttribute === 'power level') {
                outputObject.powerLevel = (inputObject.powerLevel + 2)    
            } else {
                if (levelUpObject.increasedAttribute === 'attack bonus') {
                    outputObject.baseAttackBonus = (inputObject.baseAttackBonus + 2)    
                } else {
                    if (levelUpObject.increasedAttribute === 'defense bonus') {
                        outputObject.baseDefensiveBonus = (inputObject.baseDefensiveBonus + 2)    
                    } 
                }
            }
        }
        return outputObject
    }
    
    if (levelUpObject.basicAttack) {
        outputObject.abilities.basicAttack = levelUpObject.basicAttack
    } else {
        if (levelUpObject.nonCombatAbility) {
            outputObject.abilities.nonCombatAbilities.push(levelUpObject.nonCombatAbility)
        } else {
            if (levelUpObject.specialAttack) {
                outputObject.abilities.specialAttacks.push(levelUpObject.specialAttack)
            } else {
                // shouldn't ever get here
                console.log('in char util level up and something weird has happened')
            }
        }
    }
    
    // outputObject is the updated char object
    
    return outputObject
}

function makeParty() {
    
    var party = {
        maxPartySize: metaData.PARTYSIZE,
        currentPartySize:  metaData.PARTYSIZE,
        partyList: [],
        totalBosses: metaData.TOTALBOSSES,
        pathRuns: 0,
        partyGold: 0,
        partyLuck: 0,
        partyInventory:[],
        currentPath: 1,
        bossesDefeated: 0,
        currentDungeonLevel: 0,
        currentDungeonRoom: 0,
    };
    
    party.partyGold = 50//Math.ceil(Math.random() * 50);
    
    var i;
    
    var character;
    
    var listIndex;
    
    var randomList = utils.makeRandomList( metaData.PARTYSIZE,  metaData.PARTYSIZE);

    for (i=0; i< metaData.PARTYSIZE; i++) {
        
        listIndex = [randomList[i]];
        
        character = makeCharacter(charactersData[listIndex]);

        party.partyList.push(character);
        
    }
    
    return party;
   
}

function makeCharacter(charactersArrayEntry) {
    
    var character = {};
    
    var whichRace = Math.floor(Math.random() * charactersArrayEntry.characterRaces.length);
    
    var whichCharacter = Math.floor(Math.random() * charactersArrayEntry.charactersList.length);
    
    var whichGender = charactersArrayEntry.charactersList[whichCharacter].gender;
   
    character.characterName = charactersArrayEntry.charactersList[whichCharacter].name;

    character.characterClass = charactersArrayEntry.characterClass;
    
    character.characterGender = whichGender;
    
    //character.adjectives = makeCharacterAdjectives(whichGender);
    
    character.characterRace = charactersArrayEntry.characterRaces[whichRace];
    
    character.shortDescriptions = makeShortDescriptions(character);
    
    character.longDescriptions =  makeLongDescriptions(character);
    
    character.characterFullName = makeFullName(charactersArrayEntry);

    character.characterAlternativeNames = makeAlternativeNames(character);

    character.backStory = makeCharacterBackStory(character);

    character.abilities = {basicAttack: {}, specialAttacks:[],nonCombatAbilities:[]}
    
    character.baseHealth = makeStartingHealth(charactersArrayEntry); 
    
    character.currentHealth = character.baseHealth; 
    
    character.powerLevel = charactersArrayEntry.startingPowerLevel;
    
    character.baseAttackBonus = charactersArrayEntry.startingAttackBonus;
    
    character.baseDefensiveBonus = charactersArrayEntry.startingDefensiveBonus;

    character.equipment = equipCharacterAtStart(character.characterClass);
    
    character.atTheInn = true;
    
    character.characterLevel = 0; // to be deprecated
    
    character.XP = 0;
    
    character = levelUp(character);
    
    // temp getting thumbnails added
    
    character.thumbnail = charactersArrayEntry.thumbnails[0]
    
    // to be deprecated
    
    character.characterType = charactersArrayEntry.characterType; // to be deprecated

    character.goals = makeCharacterGoals(character); // to be deprecated
    
    character.maxSkills = charactersArrayEntry.maxSkills; // to be deprecated
    
    character.title = charactersArrayEntry.titles[0]; // to be deprecated

    //character.unlockedSkills = makeStartingSkills(character.characterType); // to be deprecated
    
    return character
    
}

function makeShortDescriptions(character) {
    
    var shortDescriptions = [];
    
    shortDescriptions[0] = 'this is a short description';
   
    return shortDescriptions
    
}

function makeFullName(namesList) {
    
    var randomListIndex;
    var fullName;
    
    randomListIndex = utils.makeRandomListIndex(namesList)
    fullName = namesList[randomListIndex];
    
    return fullName
    
}

function makeLongDescriptions(character) {
    
    var longDescriptions = [];
    
    longDescriptions[0] = 'this is a long description';

    return longDescriptions
    
}

function makeAlternativeNames(character) {
    
    var alternativeNames = {theRace:"", TheRace:"", theClassAlternate:"", TheClassAlternate:""}
    
    alternativeNames.theRace = "the " + character.characterRace;
    alternativeNames.TheRace = "The " + character.characterRace;
    
    // do something for alternate class names not sure what that is right now
    
    alternativeNames.theClassAlternate = "the Class alternate name ";
    alternativeNames.TheClassAlternate = "The class aternate name ";

    
    return alternativeNames
    
}

function equipCharacterAtStart(characterClass) {
    var statusObject = {status:{}}
    var equipment = {weapons:{}, armor:{},otherEquipment:{}}
    
    switch (characterClass) {
        case 'warrior':
            equipment.currentWeapon = weapons.basicSword;
            equipment.currentShield = {};
            equipment.weapons.oneHand = weapons.basicSword;
            equipment.weapons.twoHand = {};
            equipment.weapons.ranged = {};
            equipment.armor.helm = {};
            equipment.armor.armor = armor.lowPlateArmor;
            equipment.armor.shield = {};
            equipment.otherEquipment.potion = {potionType:'none'};
            break;
        case 'thief':
            equipment.currentWeapon = weapons.basicBlades;
            equipment.weapons.dual = weapons.basicBlades;
            equipment.weapons.ranged = {};
            equipment.armor.armor = armor.lowLeatherArmor;
            equipment.armor.cloak = {};
            equipment.otherEquipment.poisonVials = 0;
            break;
        case 'magic user':
            equipment.currentWeapon = weapons.simpleDagger;
            equipment.weapons.dagger = weapons.simpleDagger;
            equipment.weapons.staff = {};
            equipment.weapons.wand = weapons.magicBoltWand;
            equipment.armor.hat = {};
            equipment.armor.robe = armor.lowRobe;
            equipment.otherEquipment.scrolls = [{scrollType:{}},{scrollType:{}},{scrollType:{}}];
            break;
        case 'cleric':
            equipment.currentWeapon = weapons.simpleHammer;
            equipment.currentShield = armor.lowBlessedShield;
            equipment.weapons.oneHand = weapons.simpleHammer;
            equipment.weapons.twoHand = {};
            equipment.armor.helm = {};
            equipment.armor.armor = armor.lowChainArmor;
            equipment.armor.shield = armor.lowBlessedShield;
            equipment.otherEquipment.holyWater = 0
            break;
        default:
            
    }
    
    return equipment;
    
}

function makeStartingHealth(charactersArrayEntry) {
    
    var health;
    
    var i;
    
    health = (Math.floor(Math.random() * charactersArrayEntry.startingHealth) + 1);
    
    for (i=0; i<charactersArrayEntry.numberOfHealthDice; i++) {
        
        health = health + (Math.floor(Math.random() * charactersArrayEntry.healthDie) + 1);
        
    }
    
    return health
    
}

function makeCharacterBackStory(character) {
    
    var characterBackStory;
    var characterBackStoryList = [];
    
    var i = 0;
    
    for (i=0; i<charactersData.length; i++) {
        if (charactersData[i].characterClass === character.characterClass) {
            characterBackStoryList = charactersData[i].backStories;
            i = charactersData.length;
        }
    }
    
     
    i = utils.makeRandomList(characterBackStoryList.length,1);
    
    characterBackStory = characterBackStoryList[i[0]];
    
    return characterBackStory
}

/*function makeCharacterAdjectives(gender) {
    
    var genderAdjectiveList;
    var characterAdjectiveList = {};
    var randomListIndex;
    
    var i;
    
    if (gender === 'boy') {
        genderAdjectiveList = metaData.genderAdjectives.BOY
    } else {
        genderAdjectiveList = metaData.genderAdjectives.GIRL
    }
    
    for (i in genderAdjectiveList) {
        randomListIndex = utils.makeRandomListIndex(genderAdjectiveList[i])  
        characterAdjectiveList[i] = genderAdjectiveList[i][randomListIndex]
    }
    return characterAdjectiveList
}*/

function makeCharacterGoals(character) {
    
    var characterGoals =[]; 
    var characterGoalsList = [];
    
    var i = 0;
    var randomGoalsList = [];
    
    for (i=0; i<charactersData.length; i++) {
        if (charactersData[i].characterType === character.characterType) {
            characterGoalsList = charactersData[i].goals;
            i = charactersData.length;
        }
    }
    
     
    randomGoalsList = utils.makeRandomList(characterGoalsList.length,1);
    
    for (i=0; i<randomGoalsList.length; i++) {
        characterGoals.push(characterGoalsList[randomGoalsList[i]])
    }
   
    return characterGoals;
}

exports.makeParty = makeParty;
exports.levelUp = levelUp;
