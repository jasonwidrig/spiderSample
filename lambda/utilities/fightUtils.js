const utils = require('../utilities/generalUtils.js');
const metaData = require('../dataFiles/metaData.js').metaData;

function makeCombatObject(inputObject) {
    
    // input object includes party list and monster list for the room
    
    var outputObject = {};
    
    var monstersList = [];
    var partyList = [];

    var inputGroups = inputObject.monsterGroups;
    var inputPartyList = inputObject.partyList;
    
    var i;
    var j;
    
    for (i=0; i<inputGroups.length; i++) {
        var monsterListObject = {};
        var monsterNumber = inputGroups[i].groupList.length;
        monsterListObject.monsterNumber = monsterNumber;
        monsterListObject.monsterType = inputGroups[i].groupType;
        if (inputGroups[i].gender) {
            monsterListObject.monsterGender = inputGroups[i].gender;
        } else {
            monsterListObject.plural = inputGroups[i].monsterPlural;
    
        }
        monsterListObject.name = inputGroups[i].monsterName;
        monsterListObject.monsterAttackLevel = inputGroups[i].monsterAttackLevel;
        monsterListObject.monsterDefendLevel = inputGroups[i].monsterDefendLevel;
        monsterListObject.groupList = [];
        for (j=0; j<monsterNumber; j++) {
            monsterListObject.groupList[j] = {};
            monsterListObject.groupList[j].monsterID = inputGroups[i].groupList[j].monsterID;    
            monsterListObject.groupList[j].health = inputGroups[i].groupList[j].health;    
            monsterListObject.groupList[j].XP = inputGroups[i].groupList[j].XP;    
        }
        monstersList[i] = monsterListObject;
    }
    
    outputObject.monstersList = monstersList;

    for (i=0; i<inputPartyList.length; i++) {
        // check to make sure they are not atTheInn
        if (inputPartyList[i].atTheInn === false) {
            var partyListObject = {};
            partyListObject.name = inputPartyList[i].characterName;
            partyListObject.baseDefensiveBonus = inputPartyList[i].baseDefensiveBonus;
            partyListObject.baseAttackBonus = inputPartyList[i].baseAttackBonus;
            partyListObject.atTheInn = inputPartyList[i].atTheInn;
            partyListObject.armor = inputPartyList[i].equipment.armor;
            partyListObject.weapon = inputPartyList[i].equipment.currentWeapon;
            partyListObject.characterGender = inputPartyList[i].characterGender
            partyListObject.health = inputPartyList[i].currentHealth;
            partyList.push(partyListObject);
        }
    }

    outputObject.partyList = partyList;
    
    outputObject.attackOrderList = utils.makeRandomList(partyList.length, partyList.length);
    outputObject.turnCounter = 0;
    outputObject.targetedMonster = false;
    outputObject.targetedMonsterIndex = -1;
    outputObject.attackAbility = 'none';

    // output object has a reduced set of the party list and the room monster list,  
    // a random attack order list for the party list and the turn counter set to 0
    // targeted monster fields are used for when a specific monster in the combat group is called out for attack
    
    return outputObject
}

function makeOneTurnOfCombat (inputObject) {
    
    console.log('in makeOneTurnOfCombat and input object is ', inputObject)

    var outputObject = {};
    // input object is the combat object which consists of:
    // the monsters list, the party list, the attackorder list, the turn counter and the targeted monster info
    
    // make attack object grabs the current char and a  monster from the input object
    
    var attackObject = makeAttackObject(inputObject);
    
    // here is a great place to apply luck

    var characterGoesFirst = ((Math.random() * 2) > 1);

    var combatResult = [];
    var responseObject = {};
    var attacker;
    var character = attackObject.character; 
    var monster = attackObject.monster;
    var oneFightResult;
    
    // now we throw the char and monsters into a blender to see who wins teh first round of fights

    var numberOfAttacksThisRound; // this var holds the number of attacks a char or monster gets per round

    if (characterGoesFirst === true) {
        oneFightResult = character.attack(attackObject)
        numberOfAttacksThisRound = 1; // this should be derived in attack object
    } else {
        oneFightResult = monster.attack(attackObject)
        numberOfAttacksThisRound = 1; // this should be derived in attack object
    }
    
    var updatedCombatObject;
    var updatedAttackObject;
    var bothCombatantsSurvived;
    
    var totalAttacksThisRound = 0;

    
    for (var firstAttackCounter = 0; firstAttackCounter<numberOfAttacksThisRound; firstAttackCounter++) {
        
        console.log('in make one turn of combat and first fight result is ', oneFightResult)
        
        if (oneFightResult.resultType === 'miss') {
            
            combatResult[totalAttacksThisRound] = oneFightResult;
            
            ++totalAttacksThisRound;
    
            updatedCombatObject = inputObject;
            
            updatedAttackObject = updateAttackObject({oldAttackObject: attackObject, combatObject:updatedCombatObject});
            
            bothCombatantsSurvived = true
    
        } else {
            responseObject = processOneFight({oldCombatObject:inputObject, combatResult:oneFightResult})
                
            combatResult[totalAttacksThisRound] = responseObject.combatResult
            
            ++totalAttacksThisRound;
    
            updatedCombatObject = responseObject.combatObject;
            
            updatedAttackObject = updateAttackObject({oldAttackObject: attackObject, combatObject:updatedCombatObject});
            
            bothCombatantsSurvived = ((updatedAttackObject.monster.monsterNumber > 0) && (updatedAttackObject.character.health > 0))

        }    
        
        if (bothCombatantsSurvived === true) {
            if (characterGoesFirst === true) {
                oneFightResult = character.attack(attackObject)
            } else {
                oneFightResult = monster.attack(attackObject)
            }
        } else {
            firstAttackCounter = numberOfAttacksThisRound        
        }
        
    }
    
    
   
    if (bothCombatantsSurvived === true) {
        
        if (characterGoesFirst === true) {
            oneFightResult = monster.attack(updatedAttackObject)
            numberOfAttacksThisRound = 1;
        } else {
            oneFightResult = character.attack(updatedAttackObject)
            numberOfAttacksThisRound = 1;
        }

        for (var secondAttackCounter = 0; secondAttackCounter<numberOfAttacksThisRound; secondAttackCounter++) {
            
            console.log('in make one turn of combat and second fight result is ', oneFightResult)
            
            if (oneFightResult.resultType === 'miss') {
                
                combatResult[totalAttacksThisRound] = oneFightResult;
            
                ++totalAttacksThisRound;
    
                updatedCombatObject = inputObject;
                
                updatedAttackObject = updateAttackObject({oldAttackObject: attackObject, combatObject:updatedCombatObject});
                
                bothCombatantsSurvived = true
        
            } else {
                responseObject = processOneFight({oldCombatObject:inputObject, combatResult:oneFightResult})
                    
                combatResult[totalAttacksThisRound] = responseObject.combatResult
            
                ++totalAttacksThisRound;
    
                updatedCombatObject = responseObject.combatObject;
                
                updatedAttackObject = updateAttackObject({oldAttackObject: attackObject, combatObject:updatedCombatObject});
                
                bothCombatantsSurvived = ((updatedAttackObject.monster.monsterNumber > 0) && (updatedAttackObject.character.health > 0))
    
            }    
            
            if (bothCombatantsSurvived === true) {
                if (characterGoesFirst === false) {
                    oneFightResult = character.attack(attackObject)
                } else {
                    oneFightResult = monster.attack(attackObject)
                }
            } else {
                secondAttackCounter = numberOfAttacksThisRound        
            }
            
        }
    
    } else {
        // extract relevant info from response object
    }
    
    updatedCombatObject.turnCounter++        

    if (updatedCombatObject.turnCounter >= updatedCombatObject.partyList.length) {
        updatedCombatObject.turnCounter = 0
    } 
    
    var characterObject = inputObject.partyList[inputObject.attackOrderList[updatedCombatObject.turnCounter]];
    
    var partyWipedOut = false;
    
    if (characterObject.atTheInn === true) {
        partyWipedOut = true;
        var i;
        for (i=0;i<inputObject.partyList.length; i++) {
            updatedCombatObject.turnCounter++;
            if (updatedCombatObject.turnCounter === inputObject.partyList.length) {
                updatedCombatObject.turnCounter = 0;    
            } 
            characterObject = inputObject.partyList[inputObject.attackOrderList[updatedCombatObject.turnCounter]];
            if (characterObject.atTheInn === false) {
                partyWipedOut = false;
                i = inputObject.partyList.length
            }
        }
    } 
    
    if (partyWipedOut) {
        outputObject.nextToAct = 'party wiped out'
    } else {
        outputObject.nextToAct = characterObject.name
    }
    
    var numberOfMonstersInRoom = 0;
    
    for (i=0;i<updatedCombatObject.monstersList.length; i++) {
        numberOfMonstersInRoom = numberOfMonstersInRoom + updatedCombatObject.monstersList[i].monsterNumber
    }
    
    outputObject.clearedTheRoom = (numberOfMonstersInRoom === 0);
    
    outputObject.combatResult = combatResult;
    outputObject.combatObject = updatedCombatObject;
    
    // outputobject is the combat result array of all of the fight outcomes
    // the cleared the room and party wiped out flags
    // and the updated combat object

    
    console.log('in makeOneTurnOfCombat and output object is ', outputObject)
    
    return outputObject;
}

function makeAttackObject (inputObject) {
    
    // this takes in the combat object and spits out a char/monster pair and a redundant turn counter for the fight
    
    console.log('in make attack object and input object is ',inputObject)
    
    var outputObject = {character:{}, monster: {}}
    
    // get the next to act char who is not at the inn
    
    var characterObject = inputObject.partyList[inputObject.attackOrderList[inputObject.turnCounter]];
    
    while (characterObject.atTheInn === true) {
        inputObject.turnCounter++;
        if (inputObject.turnCounter === inputObject.partyList.length) {
            inputObject.turnCounter = 0;    
        } 
        characterObject = inputObject.partyList[inputObject.attackOrderList[inputObject.turnCounter]];
    }
   
    outputObject.character.attackLevel = makeCharactersAttackLevel(characterObject);
    outputObject.character.defendLevel = makeCharactersDefensiveLevel(characterObject);
    outputObject.character.modifier = makeCharactersAttackModifier(characterObject);
    outputObject.character.name = characterObject.name;
    outputObject.character.health = characterObject.health;
    outputObject.character.attack = computePartyMemberAttack;
    outputObject.character.weapon = characterObject.weapon;
    outputObject.character.gender = characterObject.characterGender
    
    // if they char has targeted a particular monster let's pass a list of just that one monster type
    // so we can continue to use the maketargetmonster funtion
    
    var targetList;
    
    if (inputObject.targetedMonster === true)  {
        targetList = [inputObject.monstersList[inputObject.targetedMonsterIndex]]
    } else {
        targetList = inputObject.monstersList
    }
    
    var monsterObject = makeTargetMonsterForCharacter(targetList);
    
    outputObject.monster.defendLevel = makeMonstersDefensiveLevel(monsterObject);
    outputObject.monster.attackLevel = makeMonstersAttackLevel(monsterObject);
    outputObject.monster.monsterType = monsterObject.monsterType;
    outputObject.monster.health = monsterObject.health;
    outputObject.monster.name = monsterObject.name;
    if (monsterObject.monsterGender) {
        outputObject.monster.gender = monsterObject.monsterGender
    } else {
        outputObject.monster.plural = monsterObject.plural;
    }
    outputObject.monster.monsterNumber = monsterObject.monsterNumber;
    outputObject.monster.attack = setMonsterAttack(monsterObject.monsterType);
    
    console.log('in make attack object and output object is ',outputObject)
    
    // outputobject is one object with char and monster sub-objects
    
    return outputObject
    
}

function processOneFight(inputObject) {
    
    console.log('in process one fight and input object is ', inputObject)
    
    // inputObject is the pre-fight combat object and a single fight result object
    
    var outputObject = {};
    
    var newCombatObject = inputObject.oldCombatObject; 
    var combatResult = inputObject.combatResult; 
    var partyList = inputObject.oldCombatObject.partyList;
    var monstersList = inputObject.oldCombatObject.monstersList;
    
    var targetList;
    var targetIndex;
    var targetName;
    var i;
    
    if (combatResult.attackType === 'character') {
        targetList = monstersList
        targetName = combatResult.monsterName
    } else {
        targetList = partyList
        targetName = combatResult.characterName
    }
    
    var turnCounter = inputObject.oldCombatObject.turnCounter

    for (i=0; i<targetList.length; i++) {
        if ( (targetList[i].name === targetName)) {
            targetIndex = i;
            i = targetList.length
        } 
    }
    
    if (combatResult.attackType === 'character') {
        var whichMonsterIndex = (targetList[targetIndex].monsterNumber - 1) // the last monster in the groupList
        var updatedMonsterHealth = (targetList[targetIndex].groupList[whichMonsterIndex].health - combatResult.damage) 
        combatResult.targetHealth = updatedMonsterHealth;
        if (updatedMonsterHealth <= 0) {
            targetList[targetIndex].groupList[whichMonsterIndex].health = 0;
            targetList[targetIndex].monsterNumber--;
            combatResult.resultType = 'killed'
            combatResult.XP = targetList[targetIndex].groupList[whichMonsterIndex].XP
        } else {
            targetList[targetIndex].groupList[whichMonsterIndex].health = updatedMonsterHealth
        }
        newCombatObject.monstersList = targetList
    } else {
        var updatedCharacterHealth = (targetList[targetIndex].health - combatResult.damage);
        targetList[targetIndex].health = updatedCharacterHealth;
        combatResult.targetHealth = updatedCharacterHealth;
        if (updatedCharacterHealth <= 0) {
            // send them back to the inn
            targetList[targetIndex].health = 0;
            targetList[targetIndex].atTheInn = true;
            combatResult.resultType = 'killed'
        }
        newCombatObject.partyList = targetList;
    }

    outputObject.combatResult = combatResult;

    outputObject.combatObject = newCombatObject;
    
    console.log('in process one fight and outputObject object is ', outputObject)
    
    return outputObject
}

function updateAttackObject(inputObject) {
    
    console.log('in update attack object and inputObject is ', inputObject)
    
    var targetMonster = {};
    var targetCharacter = {};
    var monstersList = inputObject.combatObject.monstersList;
    var partyList = inputObject.combatObject.partyList;
    var character = inputObject.oldAttackObject.character;
    var monster = inputObject.oldAttackObject.monster
    var i;
    var outputObject = {}
    
    for (i=0;i<monstersList.length; i++) {
        if (monstersList[i].name === monster.name) targetMonster = monstersList[i]
    }

    for (i=0;i<partyList.length; i++) {
        if (partyList[i].name === character.name) targetCharacter = partyList[i]
    }

    monster.monsterNumber = targetMonster.monsterNumber;
    
    character.health = targetCharacter.health;
    
    outputObject = {character:character, monster:monster}
    
    console.log('in update attack object and output object  is ', outputObject)

    return outputObject
}


// individual attack functions

function computePartyMemberAttack (inputObject) {
   // input object has character and monster objects
   
    var outputObject = {};
    var toHitValue = 3; // this number may change based on gameplay
    
    var attackRollScore = ((inputObject.character.attackLevel - inputObject.monster.defendLevel) * inputObject.character.modifier) + (Math.ceil(Math.random() * 10));
    var attackOutcome = attackRollScore - toHitValue;
    
    if (attackOutcome > 0) {
        // successful attack
        outputObject.resultType = 'hit';
        outputObject.damage = attackOutcome;
    } else {
        // ya missed    
        outputObject.resultType = 'miss';
    }
    
    outputObject.monsterNumber = inputObject.monster.monsterNumber;
    outputObject.monsterName = inputObject.monster.name;
    outputObject.monsterPlural = inputObject.monster.plural;
    outputObject.characterName = inputObject.character.name;
    outputObject.characterGender = inputObject.character.gender;
    if (inputObject.monster.gender) outputObject.monsterGender = inputObject.monster.gender;
    
    outputObject.attackType = 'character';
    outputObject.attackRoll = attackRollScore;
    outputObject.attackLevel = inputObject.character.attackLevel;
    outputObject.defendLevel = inputObject.monster.defendLevel;
    outputObject.weapon = inputObject.character.weapon;

    return outputObject
}

function computeVerminAttack (inputObject) {
   // input object has character and monster objects
   
    var outputObject = {};
    var toHitValue = 3; // this number may change based on gameplay
    
    outputObject.monsterType = 'vermin';

    var attackRollScore = ( (inputObject.monster.attackLevel - inputObject.character.defendLevel) + (Math.ceil(Math.random() * 10)));
    var attackOutcome = attackRollScore - toHitValue;
    
    if (attackOutcome > 0) {
        outputObject.resultType = 'hit'
        outputObject.damage = 1
    } else {
        outputObject.resultType = 'miss'
    }
    
    outputObject.monsterNumber = inputObject.monster.monsterNumber;
    outputObject.monsterName = inputObject.monster.name
    outputObject.monsterPlural = inputObject.monster.plural;
    outputObject.characterName = inputObject.character.name
    outputObject.characterGender = inputObject.character.gender;

    outputObject.attackType = 'monster';
    outputObject.attackRoll = attackRollScore;
    outputObject.attackLevel = inputObject.monster.attackLevel;
    outputObject.defendLevel = inputObject.character.defendLevel;


    return outputObject
}

function computeMinionAttack (inputObject) {
   // input object has character and monster objects

    var outputObject = {};
    var toHitValue = 6; // this number may change based on gameplay
    
    outputObject.monsterType = 'minion';

    var attackRollScore = ( (inputObject.monster.attackLevel - inputObject.character.defendLevel) + (Math.ceil(Math.random() * 10)));
    var attackOutcome = attackRollScore - toHitValue;
    
    if (attackOutcome > 0) {
        outputObject.resultType = 'hit'
        outputObject.damage = 1
    } else {
        outputObject.resultType = 'miss'
    }
    
    outputObject.monsterNumber = inputObject.monster.monsterNumber;
    outputObject.monsterName = inputObject.monster.name
    outputObject.monsterPlural = inputObject.monster.plural;
    outputObject.characterName = inputObject.character.name
    outputObject.characterGender = inputObject.character.gender;

    outputObject.attackType = 'monster';
    outputObject.attackRoll = attackRollScore;
    outputObject.attackLevel = inputObject.monster.attackLevel;
    outputObject.defendLevel = inputObject.character.defendLevel;

    return outputObject
}

function computeMonsterAttack (inputObject) {
   // input object has character and monster objects

    var outputObject = {};
    var toHitValue = 6; // this number may change based on gameplay
    
    outputObject.monsterType = 'minion';

    var attackRollScore = ( (inputObject.monster.attackLevel - inputObject.character.defendLevel) + (Math.ceil(Math.random() * 10)));
    var attackOutcome = attackRollScore - toHitValue;
    
    if (attackOutcome > 0) {
        outputObject.resultType = 'hit'
        outputObject.damage = attackOutcome
    } else {
        outputObject.resultType = 'miss'
    }
    
    outputObject.monsterNumber = inputObject.monster.monsterNumber;
    outputObject.monsterName = inputObject.monster.name
    outputObject.monsterPlural = inputObject.monster.plural;
    outputObject.characterName = inputObject.character.name
    outputObject.characterGender = inputObject.character.gender;

    outputObject.attackType = 'monster';
    outputObject.attackRoll = attackRollScore;
    outputObject.attackLevel = inputObject.monster.attackLevel;
    outputObject.defendLevel = inputObject.character.defendLevel;

    return outputObject
}

function computeNPCAttack (inputObject) {
   // input object has character and monster objects
   
    var outputObject = {};
    var toHitValue = 2; // this number may change based on gameplay
    
    outputObject.monsterType = 'NPC';

    var attackRollScore = ( (inputObject.monster.attackLevel - inputObject.character.defendLevel) + (Math.ceil(Math.random() * 20)));
    var attackOutcome = attackRollScore - toHitValue;
    
    if (attackOutcome > 0) {
        outputObject.resultType = 'hit'
        outputObject.damage = attackOutcome
    } else {
        outputObject.resultType = 'miss'
    }
    
    outputObject.monsterName = inputObject.monster.name
    outputObject.characterName = inputObject.character.name
    outputObject.characterGender = inputObject.character.gender;
    outputObject.monsterGender = inputObject.monster.gender;

    outputObject.attackType = 'monster';
    outputObject.attackRoll = attackRollScore;
    outputObject.attackLevel = inputObject.monster.attackLevel;
    outputObject.defendLevel = inputObject.character.defendLevel;

    return outputObject
}

function computeBossAttack (inputObject) {
   // input object has character and monster objects

    var outputObject = {};
    var toHitValue = 5; // this number may change based on gameplay
    
    outputObject.monsterType = 'boss';

    var attackRollScore = ( (inputObject.monster.attackLevel - inputObject.character.defendLevel) + (Math.ceil(Math.random() * 10)));
    var attackOutcome = attackRollScore - toHitValue;
    
    if (attackOutcome > 0) {
        outputObject.resultType = 'hit'
        outputObject.damage = attackOutcome
    } else {
        outputObject.resultType = 'miss'
    }
    
    outputObject.monsterName = inputObject.monster.name
    outputObject.characterName = inputObject.character.name
    outputObject.characterGender = inputObject.character.gender;
    outputObject.monsterGender = inputObject.monster.gender;

    outputObject.attackType = 'monster';
    outputObject.attackRoll = attackRollScore;
    outputObject.attackLevel = inputObject.monster.attackLevel;
    outputObject.defendLevel = inputObject.character.defendLevel;

    return outputObject
}

// fight helper functions


function setMonsterAttack (inputObject) {
    var outputObject;
    
    switch (inputObject) {
        
        case 'minion':
            
            outputObject = computeMinionAttack;
            break;
        
        case 'vermin':
            
            outputObject = computeVerminAttack;
            break;
            
        case 'large':
        case 'massive':
        case 'strong':
            
            outputObject = computeMonsterAttack;
            break;
            
        case 'NPC':
            
            outputObject = computeNPCAttack;
            break;
            
        case 'boss':

            outputObject = computeBossAttack;
            break;
            
        default:
            console.log('in set monster attack and dont know this type ', inputObject)
        
    }
    
    return outputObject;
}

function makeTargetMonsterForCharacter (inputObject) {
    // input object is monster  list 
    var outputObject = {};
    var responseObject = {};
    
    var nonEmptyMonsterLists = [];
    var i;
    
    for (i=0; i<inputObject.length; i++) {
        if (inputObject[i].monsterNumber > 0) nonEmptyMonsterLists.push(inputObject[i])
    }
    
    responseObject = nonEmptyMonsterLists[Math.floor(Math.random() * nonEmptyMonsterLists.length)]
    
    outputObject.combatType = 'monster';
    outputObject.name = responseObject.name;
    outputObject.monsterAttackLevel = responseObject.monsterAttackLevel;
    outputObject.monsterDefendLevel = responseObject.monsterDefendLevel;
    outputObject.monsterNumber = responseObject.monsterNumber;
    if (responseObject.monsterGender) outputObject.monsterGender = responseObject.monsterGender;
    if (responseObject.monsterType === 'NPC' ) {
        outputObject.pronouns = responseObject.pronouns
    } else {
        outputObject.plural = responseObject.plural;
    }
    outputObject.attack = responseObject.attack;
    outputObject.monsterType = responseObject.monsterType;
    outputObject.health = responseObject.groupList[(responseObject.monsterNumber - 1)].health;

    return outputObject
}

function makeCharactersDefensiveLevel (inputObject) {
    // input object has the combat type and 
    // the character info object which has the
    // baseattackbonus, base defensive bonus and the
    // armor object and the pronouns object attached
    
    var outputObject;
    var armorObject;
    
    outputObject = inputObject.baseDefensiveBonus;
    
    // add the armor bonus
    
    for (armorObject in inputObject.armor) {
        if (armorObject.hasOwnProperty('baseDefense'))  outputObject = outputObject + armorObject.baseDefense  
    }
    
    return outputObject
}

function makeCharactersAttackModifier(inputObject) {
     var outputObject = 1;
     
     return outputObject
 }

function makeCharactersAttackLevel (inputObject) {
    // the input object has the characters baseAttackBonus
    
    var outputObject;

    outputObject = inputObject.baseAttackBonus;
    
    // add the weapons and attacks bonus
    
    return outputObject
}

function makeMonstersAttackLevel (inputObject) {
    // the input object has the characters baseAttackBonus
    
    var outputObject;

    outputObject = inputObject.monsterAttackLevel;
    
    // add the weapons and attacks bonus
    
    return outputObject
}

function makeMonstersDefensiveLevel (inputObject) {
    var outputObject;

    outputObject = inputObject.monsterDefendLevel;
    
    // add the armor bonus
    
    return outputObject
}

exports.makeCombatObject = makeCombatObject;
exports.makeOneTurnOfCombat = makeOneTurnOfCombat;
