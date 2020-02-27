const metaData = require('../dataFiles/metaData.js').metaData;
const utils = require('../utilities/generalUtils.js');

function makeStatusSpeech(inputObject) {
    
    var outputObject = {speechObject:{text:"", reprompt:""}};

    var i;
    
console.log('in make status speech and input object is', inputObject)

    if (inputObject.hasNoParty) {
        outputObject.speechObject.text = "You need to go to the inn to meet your party before you can check on the status of things. Are you ready to go to the Inn?"
   } else {
        switch (inputObject.statusType) {
            case 'general':
                var partyList = inputObject.partyList;
                var partySize = partyList.length;
                var randomList = utils.makeRandomList(partySize,partySize);
                for (i=0; i<partySize; ++i) {
                    character = partyList[randomList[i]];
                    outputObject.speechObject.text = outputObject.speechObject.text + character.characterName + " the " +
                                            character.characterClass + " is level " +
                                            character.characterLevel + " and " +
                                            utils.makeHealthWords(character) + ". "
                }
                outputObject.speechListOrder = randomList;
                break;
            case 'character':
                var character = inputObject.character;
                if (character.characterNotInPartyName) {
                    outputObject.speechObject.text = "I'm sorry but I don't think we have a " +
                                            character.characterNotInPartyName + " in this party. "
                } else {
                    if (inputObject.slotInfo.topicSlot.value) { // if they mentioned a topic with the character
                        var topicSlotInfo = inputObject.slotInfo.topicSlot.resolutions.resolutionsPerAuthority[0];
                        if (topicSlotInfo.status.code === 'ER_SUCCESS_MATCH') {
                            switch (topicSlotInfo.values[0].value.name) {
                                case 'armor':
                                    outputObject.speechObject = makeArmorStatusSpeech(inputObject.character);
                                    break;
                                case 'weapons':
                                    outputObject.speechObject = makeWeaponsStatusSpeech(inputObject.character);
                                    break;
                                case 'abilities':
                                    outputObject.speechObject = makeAbilitiesStatusSpeech(inputObject.character);
                                    break;
                                default:
                                    outputObject.speechObject.text = "I don't know how to tell you about " + topicSlotInfo.values[0].value.name + " yet. "
                            }
                        } else {
                            // they named a bogus topic
                            outputObject.speechObject.text = "I know who " + character.characterName +
                                                        " is but I don't know what " +
                                                        inputObject.slotInfo.topicSlot.value +
                                                        " is.";
                        }
                    } else {
                            outputObject.speechObject.text = character.characterName +  " is a level " +
                                            character.characterLevel + " " +
                                            character.characterClass + " and " +
                                            utils.makeHealthWords(character) + ". "        
                    }
                }
                break;
            case 'topic only':
                var topicOnlySlotInfo = inputObject.slotInfo.topicSlot.resolutions.resolutionsPerAuthority[0];
                if (topicOnlySlotInfo.status.code === 'ER_SUCCESS_MATCH') {
                    switch (topicOnlySlotInfo.values[0].value.name) {
                        case 'armor':
                            outputObject.speechObject.text = "Whose armor do you want to know about? ";
                            break;
                        case 'weapons':
                            outputObject.speechObject.text = "Whose weapons do you want to know about? ";
                            break;
                        case 'abilties':
                            outputObject.speechObject.text = "Whose weapons do you want to know about? ";
                            break;
                        default:
                            outputObject.speechObject.text = "I don't know how to tell you about " + topicOnlySlotInfo.values[0].value.name + " yet. "
                    }
                } else {
                    // they named a bogus topic
                    outputObject.speechObject.text = "I don't know what " +
                                                inputObject.slotInfo.topicSlot.value +
                                                " is.";
                }
                break;
            default:
                outputObject.speechObject.text = "I don't know what this situation is right now"
        }   
        
        outputObject.cardText = outputObject.speechObject.text
        
        outputObject.speechObject.text = makeItDM(outputObject.speechObject.text)

    }
    
   outputObject.speechObject.reprompt = outputObject.speechObject.text;

    return outputObject
}

// status function helpers

function makeWholePartyTopicStatusSpeech (inputObject) {
    
    var party = inputObject.partyList;
    var topic = inputObject.topic;
    
    var outputObject = "";
    

}

function makeAbilitiesStatusSpeech(character) {
    
    var outputObject = {};
    
    var abilitiesObject = character.abilities;
    
    outputObject.text = character.characterName + " the " +
                            character.characterClass + " has the basic attack ability " +
                            abilitiesObject.basicAttack.name + ". "
     
    
    if (abilitiesObject.specialAttacks.length > 0) {
        if (abilitiesObject.specialAttacks.length > 1) {
            outputObject.text = outputObject.text + character.characterName + " has the special attack abilities "    
        } else {
            outputObject.text = outputObject.text + character.characterName + " has the special attack ability "    
        }
        for (var specialAttackCounter = 0; specialAttackCounter<abilitiesObject.specialAttacks.length; specialAttackCounter++) {
            outputObject.text = outputObject.text + abilitiesObject.specialAttacks[specialAttackCounter].name
            if (abilitiesObject.specialAttacks.length>1) { // we need commas or an and or both
                if (specialAttackCounter === (abilitiesObject.specialAttacks.length - 2)) {
                    outputObject.text = outputObject.text + " and "    
                } 
                if (specialAttackCounter < (abilitiesObject.specialAttacks.length - 2)) {
                    outputObject.text = outputObject.text + ", "    
                }
            }
        }
    } else {
        outputObject.text = outputObject.text + character.characterName + " does not currently have any special attack abilities. "
    }
    
    if (abilitiesObject.nonCombatAbilities.length > 0) {
        if (abilitiesObject.nonCombatAbilities.length > 1) {
            outputObject.text = outputObject.text + character.characterName + " has the non-combat abilities "    
        } else {
            outputObject.text = outputObject.text + character.characterName + " has the non-combat ability "    
        }
        for (var nonCombatAbilitiesCounter = 0; nonCombatAbilitiesCounter<abilitiesObject.nonCombatAbilities.length; nonCombatAbilitiesCounter++) {
            outputObject.text = outputObject.text + abilitiesObject.nonCombatAbilities[nonCombatAbilitiesCounter].name
            if (abilitiesObject.nonCombatAbilities.length>1) { // we need commas or an and or both
                if (nonCombatAbilitiesCounter === (abilitiesObject.nonCombatAbilities.length - 2)) {
                    outputObject.text = outputObject.text + " and "    
                } 
                if (nonCombatAbilitiesCounter < (abilitiesObject.nonCombatAbilities.length - 2)) {
                    outputObject.text = outputObject.text + ", "    
                }
            }
        }
    } else {
        outputObject.text = outputObject.text + character.characterName + " does not currently have any non-combat abilities"
    }

    return outputObject
}

function makeArmorStatusSpeech(character) {

    var outputObject = {};
    var armorArray = utils.getArmorStatus(character.equipment.armor); 
    var i;
    
    outputObject.text = character.characterName + " the " +
                            character.characterClass
                            
    for (i=0; i<(armorArray.length - 1); i++) {
        if (utils.isEmpty(armorArray[i].slotArmor)) {
            outputObject.text = outputObject.text + " is not wearing " + armorArray[i].slotName 
        } else {
            outputObject.text = outputObject.text + " is wearing " + armorArray[i].slotArmor.name 
        }   
        if (i < (armorArray.length - 2)) {
            outputObject.text = outputObject.text +  ", "  
        }
    }
    
    if (utils.isEmpty(armorArray[(armorArray.length - 1)].slotArmor)) {
            outputObject.text = outputObject.text + " and does not have " + armorArray[i].slotName 
        } else {
            outputObject.text = outputObject.text + " and has " + armorArray[i].slotArmor.name  
    }   
    
    outputObject.text = outputObject.text + ". "  
    
    return outputObject;
}

function makeWeaponsStatusSpeech(character) {

    var outputObject = {};
    var weaponsArray = utils.getWeaponStatus(character.equipment.weapons); 
    var i;
    
    outputObject.text = character.characterName + " the " +
                            character.characterClass
    
    for (i=0; i<(weaponsArray.length - 1); i++) {
        if (utils.isEmpty(weaponsArray[i].slotWeapon)) {
            outputObject.text = outputObject.text + " does not have " + weaponsArray[i].slotName 
        } else {
            outputObject.text = outputObject.text + " has " + weaponsArray[i].slotWeapon.name + " for " + weaponsArray[i].slotName 
        }   
        if (i < (weaponsArray.length - 2)) {
            outputObject.text = outputObject.text +  ", "  
        }
    }
    
    if (utils.isEmpty(weaponsArray[(weaponsArray.length - 1)].slotWeapon)) {
            outputObject.text = outputObject.text + " and does not have "  + weaponsArray[i].slotName
        } else {
            outputObject.text = outputObject.text + " and has " + weaponsArray[i].slotWeapon.name + " for " + weaponsArray[i].slotName
    }   
    
    outputObject.text = outputObject.text + ". "  

    return outputObject;
}

//
// end status description helpers
//

function makeHelpSpeech (inputObject) {
    
    var outputObject = {text:""};
    switch (inputObject.helpType) {
        case 'room':
            switch (inputObject.helpRoom) {
                case 'inn':
                    outputObject.text = makeInnHelpSpeech(inputObject.helpCounter);
                    break;
                case 'lobby':
                    outputObject.text = makeLobbyHelpSpeech(inputObject.helpCounter);
                    break;
                case 'dungeon':
                    outputObject.text = makeDungeonHelpSpeech(inputObject.helpCounter);
                    break;
                case 'quartermaster':
                    outputObject.text = makeQuartermasterHelpSpeech(inputObject.helpCounter);
                    break;
                default:
                    outputObject.text = "I don't know how to help you in this situation yet";
            } 
            break;
        case 'topic':
           switch (inputObject.helpTopic) {
            case 'armor':
                outputObject.text = makeArmorHelpSpeech(inputObject.helpCounter);
                break;
            case 'fighting':
                outputObject.text = makeFightingHelpSpeech(inputObject.helpCounter);
                break;
            case 'abilities':
                outputObject.text = makeAbilitiesHelpSpeech(inputObject.helpCounter);
                break;
            case 'weapons':
                outputObject.text = makeWeaponsHelpSpeech(inputObject.helpCounter);
                break;
            case 'everything':
                outputObject.text = makeEverythingHelpSpeech(inputObject.helpCounter);
                break;
            default:
                outputObject.text = "I don't know how to help you in this situation yet"
            }
            break;
        case 'unknown topic':
            outputObject.text = "I don't know how to help you with " + inputObject.helpTopic
            break;
        default:
            outputObject.text = "I don't know how to help you in this situation yet";
    }
    
    outputObject.reprompt = "You can ask for help at any time. ";

    return outputObject
}

function makeFightSpeech(inputObject) {
    
    var outputObject = {};
    
    // nobody to fight here
    // want to fight NPC
    // NPCs name
    // attack status list for character attack should contain the number of monsters the character attacked, 
    // the name sigular or plural of the monster attacked, the name of the attacker and the result type
    
    if (inputObject.nobodyLeftToFightHere === true) {
        outputObject.text = makeItDM("There is nobody left to fight in this room. ");
        outputObject.reprompt = makeItDM("Settle down Francis. ");
        return outputObject
    }
    
    if (inputObject.nobodyToFightHere === true) {
        outputObject.text = makeItDM("There is nobody to fight here. ");
        outputObject.reprompt = makeItDM("Settle down Francis. ");
        return outputObject
    }
    
    if (inputObject.theyWantToFightTheNPC === true) {
        outputObject.text = makeItDM("Are you sure you want to fight " + inputObject.NPCsname + "? ");
        outputObject.reprompt = makeItDM("Like extra sure? ");
        return outputObject
    }
    
    if (inputObject.theyDontWantToFightTheNPC === true) {
        outputObject.text = makeItDM("That's a good choice. I hear that fighting friendly folks in the dungeon can lead to bad luck.");
        outputObject.reprompt = makeItDM("Good Choice ");
        return outputObject
    }
    
    if (inputObject.monsterSpecified === true) {
        outputObject.text = makeItDM("There is no " + inputObject.monsterName + " here for you to fight.");
        outputObject.reprompt = makeItDM("No " + inputObject.monsterName + "here. ");
        return outputObject
    }
    
    if (inputObject.monsterUnknown === true) {
        outputObject.text = makeItDM("I don't know any monsters called " + inputObject.monsterName + ".");
        outputObject.reprompt = makeItDM("Don't know about " + inputObject.monsterName + ".");
        return outputObject
    }
    
    if (inputObject.abilitySpecified) {
        if (inputObject.abilitySpecified === 'unknown') {// they named an ability that we haven't heard of
            outputObject.text = makeItDM("I don't know the ability " + inputObject.abilityName);
            outputObject.reprompt = makeItDM("I don't know that one");
        } else {
            if (inputObject.abilitySpecified === 'non-combat') {// they named a non=combat ability
                outputObject.text = makeItDM(inputObject.abilityName + " is not a fighting ability");
                outputObject.reprompt = makeItDM("That's not a fighting ability");
            } else {
                if (inputObject.whoHasTheAbility === 'nobody') {// they named an ability that nobdy has yet
                    outputObject.text = makeItDM("Nobody in your party has the " + inputObject.abilityName + " ability yet.");
                    outputObject.reprompt = makeItDM("You don't have that ability yet.");
                } else {// they named an ability that somebody has but it's not their turn to fight
                    outputObject.text = makeItDM(inputObject.whoHasTheAbility + " has that ability but it is not " + inputObject.hisHer + " turn to fight. ");
                    outputObject.reprompt = makeItDM("It is not" + inputObject.whoHasTheAbility + "'s turn to fight");
                }
            }
        }
        return outputObject
    }
    
    var attackDescriptionList = [];
    var i;

    outputObject.text = "";
    
    for (i=0; i<inputObject.attackStatus.length;i++) {
        
        attackDescriptionList[i] = {monsterNumber:inputObject.attackStatus[i].monsterNumber};

        // let's sort out the monster name here so we can sort out the definite name of the NPC v. the generic monsters

        if (inputObject.attackStatus[i].monsterGender) {
            attackDescriptionList[i].monsterGender = inputObject.attackStatus[i].monsterGender;
            attackDescriptionList[i].monsterName = inputObject.attackStatus[i].monsterName
        } else {
            if (attackDescriptionList[i].monsterNumber>1) {
                if (attackDescriptionList[i].monsterNumber === 2) {
                    attackDescriptionList[i].monsterName = " both " + inputObject.attackStatus[i].monsterPlural 
                } else {
                    attackDescriptionList[i].monsterName = " all " + inputObject.attackStatus[i].monsterNumber + " " + inputObject.attackStatus[i].monsterPlural 
                }
            } else {
                attackDescriptionList[i].monsterName = " the " + inputObject.attackStatus[i].monsterName 
            }
        }
        
        if (inputObject.attackStatus[i].weapon) attackDescriptionList[i].weapon = inputObject.attackStatus[i].weapon

        attackDescriptionList[i].characterGender = inputObject.attackStatus[i].characterGender;
        attackDescriptionList[i].characterName = inputObject.attackStatus[i].characterName;
        attackDescriptionList[i].characterPronouns = inputObject.attackStatus[i].characterPronouns;
        attackDescriptionList[i].resultType = inputObject.attackStatus[i].resultType;
        
        if (inputObject.attackStatus[i].attackType === 'monster') {
            outputObject.text = outputObject.text + makeMonsterAttackDescriptionSpeech(attackDescriptionList[i]);
        } else {
            outputObject.text = outputObject.text + makeCharacterAttackDescriptionSpeech(attackDescriptionList[i]);
            if (inputObject.levelUp) {
                outputObject.text = outputObject.text +  "Congratulations, " + attackDescriptionList[i].characterName + " has advanced to level " + inputObject.levelUp + ". "
            }
        }
    }
    
    // if that was the last thing to kill they need the you are done speech tacked on 
    if (inputObject.nextToAct === 'party wiped out') {
            outputObject.text = outputObject.text + "Your party has been wiped out and magically restored to the Inn. ";
            outputObject.reprompt = "Back to the inn with yee.";
    } else {
        if (inputObject.clearedTheRoom === true) {
            outputObject.text = outputObject.text + "You have killed all of the monsters in this room and can now move on to the next room. ";
            outputObject.reprompt = "Yay! There was much rejoicing.";
        } else {
            // tack on the who's next part
            outputObject.text = outputObject.text + inputObject.nextToAct + " is next to act."
            outputObject.reprompt = "Fight! Fight! Fight! " ; 
        }
    }

    outputObject.text = makeItDM(outputObject.text);
    outputObject.reprompt = makeItDM(outputObject.reprompt);
    
    return outputObject
}

function makeExamineRoomSpeech(inputObject) {
    
    var outputObject = {};
    
    if (inputObject.currentRoom) {// we're not in the dungeon proper
        switch (inputObject.currentRoom) {
            case 'lobby':
                outputObject.text = "There is nothing to see here because you haven't started your adventure."
                outputObject.reprompt = "Do you want to start your adventure? "; 
                break;
            case 'quartermaster': 
                outputObject.text = makeItDM("You are at the quartermaster's and he wants to buy and sell stuff. ")
                outputObject.reprompt = makeItDM("You're at the quartermaster's. "); 
                break;
            case 'inn':
                outputObject.text = makeItDM("You are at the inn. ");    
                outputObject.reprompt = makeItDM("You are at the inn. ");
                break;
            default:
                outputObject.text = makeItDM("I don't know where you are right now. ");
                outputObject.reprompt =  makeItDM("I am lost. ");
        }
        return outputObject
    }
    
    if (inputObject.inCombat === true) {
        outputObject.text = makeItDM("You can't do a good job of looking around while you are fighting monsters.");
        outputObject.reprompt = makeItDM("Get back to fighting");
        return outputObject
    }
    
    if (inputObject.cantExamineRoom === true) {
        outputObject.text = makeItDM("You can't do a good job of looking around while these monsters are here.");
        outputObject.reprompt = makeItDM("Go fight them already");
        return outputObject
    }
    
    var pointOfInterest = inputObject.roomObject.roomAdjectives.pointsOfInterest;
    var pointOfInterestLocation = inputObject.roomObject.roomAdjectives.pointsOfInterestLocations;
    var goldAmount = inputObject.roomGold;

    if (inputObject.currentDungeonRoom === 0) { // it's the NPC room
        var NPCInfo = inputObject.roomObject.roomMonsterGroups[0];
        if (NPCInfo.monsterNumber === 0) { // the NPC is gone
            outputObject.text = "You see " + pointOfInterest + " " + pointOfInterestLocation + ".";
            outputObject.reprompt = "You see " + pointOfInterest + " " + pointOfInterestLocation + ".";
        } else {
            var NPCVoice;
            if (NPCInfo.gender === 'girl') {
                NPCVoice = metaData.NPCVoices.GIRL[NPCInfo.monsterVoiceIndex]
            } else {
                NPCVoice = metaData.NPCVoices.BOY[NPCInfo.monsterVoiceIndex]
            }
            outputObject.text = NPCInfo.monsterDescription + " " + NPCInfo.monsterName + " wants to ask you something. ";
            outputObject.text = outputObject.text + NPCVoice('Would you like me to hold onto your gold while you are in the dungeon?');
            outputObject.reprompt = NPCVoice('Would you like me to hold onto your gold while you are in the dungeon?');
        }
    } else {
        outputObject.text = "You look around " + pointOfInterest + " " + pointOfInterestLocation + " and find " + goldAmount + " pieces of gold to add to your loot.";
        outputObject.reprompt = "You found " + goldAmount + " gold pieces.";
    }
    
    outputObject.text = makeItDM(outputObject.text);
    outputObject.reprompt = makeItDM(outputObject.reprompt);

    return outputObject
}

function makeInnSpeech(inputObject) {
    
    var outputObject = {};
    
    if (inputObject.cantGetThereFromHere) {
        switch (inputObject.cantGetThereFromHere) {
            case 'lobby':
                outputObject.text = makeItDM("You can't go back to the lobby. ");
                outputObject.reprompt = makeItDM("You can't get there. ");
                break
            case 'inn':
                outputObject.text = makeItDM("You are already there. ");
                outputObject.reprompt = makeItDM("That's where you are. ");
                break
            case 'quartermaster':
                outputObject.text = makeItDM("You have to clear out all of the monsters in this level to get to the quartermaster's. ");
                outputObject.reprompt = makeItDM("You need to kill more monsters. ");
                break
            default:
                outputObject.text = makeItDM("You can't get there from here. ");
                outputObject.reprompt = makeItDM("Can't get there. ");
                break
        }
        return outputObject
    }

    
    if (inputObject.theyWantToStartOver === true) {
        outputObject.text = makeItDM("Are you sure you want to go back to the inn and restart this level? ");
        outputObject.reprompt = makeItDM("Do you want to go back to the inn?");
        return outputObject
    
    }
    
    if (inputObject.beenToInnCounter === 1) {
        outputObject.text = "<audio src='soundbank://soundlibrary/ambience/amzn_sfx_crowd_bar_01'/>"
        outputObject.text = outputObject.text + metaData.innText.SETUP;
        //outputObject.text = outputObject.text + makePartyMemberBackStoriesSpeech(inputObject.partyList);
        outputObject.text = outputObject.text + metaData.innText.MISSIONSTATEMENT;
        //outputObject.text = outputObject.text + makePartyMemberGoalStoriesSpeech(inputObject.partyList);
        outputObject.text = outputObject.text + "Are you ready to go to the dungeon?";
        outputObject.reprompt = "Are you ready to go to the dungeon?";


    } else {
        if (inputObject.noResponse === true) {
            outputObject.text = "Saying no isn't really an option here as there is nothing else to do. " +
                                "You can ask for help or check the status of things if you'd like but " +
                                "you should really go to the dungeon. "
            outputObject.reprompt = "Are you ready to go to the dungeon?";

        } else {
            outputObject = makeWelcomeBackSpeech(inputObject);
        }
    }
    
    outputObject.text = makeItDM(outputObject.text);
    outputObject.reprompt = makeItDM(outputObject.reprompt);

    return outputObject
}

function makeQuartermasterSpeech(inputObject) {
    
    var outputObject = {};
    
    if (inputObject.cantGetThereFromHere) {
        switch (inputObject.cantGetThereFromHere) {
            case 'lobby':
                outputObject.text = makeItDM("You can't go back to the lobby. ");
                outputObject.reprompt = makeItDM("You can't get there. ");
                break
            case 'dungeon':
                outputObject.text = makeItDM("You need to go back to the inn before you can go to the dungeon. ");
                outputObject.reprompt = makeItDM("Go to the inn. ");
                break
            case 'quartermaster':
                outputObject.text = makeItDM("You are already there. ");
                outputObject.reprompt = makeItDM("That's where you are. ");
                break
            default:
                outputObject.text = makeItDM("You can't get there from here. ");
                outputObject.reprompt = makeItDM("Can't get there. ");
                break
        }
        return outputObject
    }

    if (inputObject.noResponse) {
        outputObject.text = makeItDM("Okay! You can ask the Quartermaster at any point what he has for sale.")
        outputObject.reprompt = makeItDM("Just ask if you want to find out what he has for sale.")
        return outputObject
    } 
    
    if (inputObject.itemsForSale) {
        outputObject.text = makeItDM('The quartermaster has a number of items for sale. Let him tell you about it! ');
        outputObject.text = outputObject.text + makeItQM(makeListOfItemsForSale(inputObject.itemsForSale));
        outputObject.reprompt = makeItQM('That is what is for sale today')
        return outputObject
    }
    
    

    return outputObject
}

function makeIntroSpeech(inputObject) {
    
    var outputObject = {};
    
    if (inputObject.cantGetThereFromHere) {
        switch (inputObject.cantGetThereFromHere) {
            case 'lobby':
                outputObject.text = "You are already in the lobby. ";
                outputObject.reprompt = "You're already there. ";
                break
            case 'dungeon':
                outputObject.text = "You need to meet your party at the inn before you can go to the dungeon. ";
                outputObject.reprompt = "Go to the inn. ";
                break
            case 'quartermaster':
                outputObject.text = "You have to clear out a dungeon level with your party to get to the quartermaster's. ";
                outputObject.reprompt = "Go to the inn. ";
                break
            default:
                outputObject.text = "You can't get there from here. ";
                outputObject.reprompt = "Can't get there. ";
                break
        }
        return outputObject
    }
    
    if (inputObject.beenToIntroCounter === 1) {
        outputObject.text = metaData.introText.FIRSTTIME
        //outputObject.text = "Welcome to the adventure. Are you ready?"
        outputObject.reprompt = "Are you ready to meet your Heroes?"
    } else {
        if (inputObject.noResponse === true) {
            outputObject.text = "Saying no isn't really an option here as there is nothing else to do. " +
                                "You can ask for help or check the status of things if you'd like but " +
                                "you should really meet your heroes now. Are you ready to meet your Heroes?"
            outputObject.reprompt = "Are you ready to meet your Heroes?"    
        } else {
            if (inputObject.beenToInnCounter === 0) {
                //outputObject.text = metaData.introText.SUBSEQUENTTIMES
                outputObject.text = "Welcome back. Are you ready?"
                outputObject.reprompt = "Are you ready to meet your Heroes?"
            } else {
                outputObject = makeWelcomeBackSpeech(inputObject);
                outputObject.text = makeItDM(outputObject.text);
                outputObject.reprompt = makeItDM(outputObject.reprompt);
            }     
        }
    }
    
    return outputObject
}

function makeDungeonSpeech(inputObject) {
    
    // input object has apl flag, dungeon level number, dungeon room number and
    // current dungeon object which is an array of monsters and adjectives for each room on this level
    // and the attack status array for this room
    
    var outputObject = {};
    
    if (inputObject.cantLeaveRoom === true) {
        if (inputObject.NPCName) {
            outputObject.text = "You can't leave this room while you are fighting " + inputObject.NPCName + ".";
            outputObject.reprompt = inputObject.NPCName + " wants to finish you.";
        } else {
            if (inputObject.moreThanOneMonster) {
                outputObject.text = "You can't leave this room right now because of all the monsters here that want to kill you.";
                outputObject.reprompt = "Monsters block the exit.";
            } else {
                outputObject.text = "You can't leave this room until you finish off the last monster.";
                outputObject.reprompt = "One more to go.";
            }
        }
        
        outputObject.text = makeItDM(outputObject.text);
        outputObject.reprompt = makeItDM(outputObject.reprompt);

        return outputObject
    }
    
    if (inputObject.noResponse) {
        outputObject.text = makeItDM("Okay. Your party will stay in the dungeon. ");
        outputObject.reprompt = makeItDM("Still in the dungeon. ");
        return outputObject
    }
    
    if (inputObject.cantGetThereFromHere) {
        switch (inputObject.cantGetThereFromHere) {
            case 'dungeon':
                outputObject.text = makeItDM("You are already in the dungeon. ");
                outputObject.reprompt = makeItDM("You're already there. ");
                break
            case 'lobby':
                outputObject.text = makeItDM("You can't go back to the lobby. ");
                outputObject.reprompt = makeItDM("You can't get there. ");
                break
            case 'quartermaster':
                outputObject.text = makeItDM("You have to defeat all the monsters on this level to get to the quartermaster's. ");
                outputObject.reprompt = makeItDM("You need to kill more monsters. ");
                break
            default:
                outputObject.text = makeItDM("You can't get there from here. ");
                outputObject.reprompt = makeItDM("Can't get there. ");
                break
        }
        return outputObject
    }
    
    switch (inputObject.dungeonRoom) {
        case 0: // npc intro room
            outputObject.text = "<audio src='soundbank://soundlibrary/foley/amzn_sfx_wooden_door_creaks_long_01'/>"
            if (inputObject.beenToDungeonCounter === 1) {
                outputObject.text = outputObject.text + "Welcome to level "
            } else {
                outputObject.text = outputObject.text + "Welcome back to level "
            }
            outputObject.text = outputObject.text + (inputObject.dungeonLevel + 1) + " of the dungeon. " + makeRoomDescriptionSpeech(inputObject.currentDungeon[inputObject.dungeonRoom].roomAdjectives);
            outputObject.text = outputObject.text + makeNPCDescriptionSpeech(inputObject.currentDungeon[inputObject.dungeonRoom].roomMonsterGroups[0])
            outputObject.reprompt = "You are in the dungeon now. ";     
            break;
        case (metaData.DUNGEONROOMSPERLEVEL-1): // boss room
            outputObject.text = "Oh No! This is where the boss of level " + (inputObject.dungeonLevel + 1) + " of the dungeon hangs out. " + makeRoomDescriptionSpeech(inputObject.currentDungeon[inputObject.dungeonRoom].roomAdjectives);
            outputObject.text = outputObject.text + makeBossDescriptionSpeech(inputObject.currentDungeon[inputObject.dungeonRoom].roomMonsterGroups[0])
            outputObject.reprompt = "You are in the dungeon now. ";     
            break;
        case metaData.DUNGEONROOMSPERLEVEL: // quartermaster room
            outputObject.text = "You have completed the level and beat the boss. You are at the quartermaster's now. Would you like to hear what is available here?";
            outputObject.reprompt = "Congratulations! It's time to get your shop on! " ; 
            break;
        case metaData.FINISHEDALLTHELEVELSROOM:
            outputObject.text = "You have completed the final level and beat the final boss. You are done with this game. Renew!";
            outputObject.reprompt = "There will be no encore. " ; 
            break;
        case metaData.UNKONWNLEVELROOM:
            outputObject.text = "I don't know what you are trying to say. Do you want to try the new level or the old level? ";
            outputObject.reprompt = "New level or old level? " ; 
            break;


        default:
            outputObject.text = makeRoomDescriptionSpeech(inputObject.currentDungeon[inputObject.dungeonRoom].roomAdjectives);
            outputObject.text = outputObject.text + makeMonsterDescriptionSpeech(inputObject.currentDungeon[inputObject.dungeonRoom].roomMonsterGroups)
            outputObject.text = outputObject.text + inputObject.firstToAct + " will be the first to fight. "
            outputObject.reprompt = "You are still in the dungeon.  "     
    }
    
    outputObject.text = makeItDM(outputObject.text);
    outputObject.reprompt = makeItDM(outputObject.reprompt);

    return outputObject
}

function makePurchaseSpeech(inputObject) {
    
    var outputObject = {text:"", reprompt:""};
    
    switch (inputObject.type) {
        case 'not a real purchase':
            outputObject.text = makeItQM("I do not sell " + inputObject.name + ". ");
            outputObject.reprompt = makeItQM("I don't got none. "); 
            break;
        case 'not for sale':
            outputObject.text = makeItQM("I do not have any " + inputObject.name + " for sale right now. ");
            outputObject.reprompt = makeItQM("I don't got none. "); 
            break;
        case 'not enough gold': // here we can suggest purchasing some gold
            outputObject.text = makeItQM("You do not have enough gold to afford  " + inputObject.name + ". ");
            outputObject.reprompt = makeItQM("You can't afford it. "); 
            break;
        case 'affordable':
            outputObject.text = makeItQM("You purchased " + inputObject.name +". ");    
            outputObject.text = outputObject.text + makeItDM(inputObject.decision.whoGetsIt + " gets " + inputObject.name + ". ");
            if (inputObject.replacement.haveToReplace === true) {
                outputObject.text = outputObject.text + makeItDM("The quartermaster gives your party " + inputObject.replacement.replaceAThing.goldPieces + 
                                                                " pieces of gold for the " + inputObject.replacement.replaceAThing.replacedThingName + 
                                                                " that " + inputObject.decision.whoGetsIt +
                                                                " swapped out for " + inputObject.replacement.replaceAThing.newThingName);
            }
            outputObject.reprompt = makeItQM("You bought it. ");
            break;
        case 'have to decide who gets it':
            outputObject.text = outputObject.text + makeItDM("Should " + inputObject.decision.whoGetsIt + " get " + inputObject.name + "? ");
            outputObject.reprompt = makeItDM("You bought it. Who gets it?");
            break;
        case 'not a valid choice':
            outputObject.text = makeItDM(inputObject.whatTheySaid + ' is not a valid choice.')
            outputObject.reprompt = outputObject.text;
            break;
        case 'already have a level':
            outputObject.text = "You have already unlocked the next level. ";    
            outputObject.reprompt = "The next level is unlocked. ";
            break;
        case 'no shopping here':
            outputObject.text = makeItDM("You can't buy anything here. ");
            outputObject.reprompt =  makeItDM("Nothing for sale here. ");
            break;
        default:
            outputObject.text = makeItDM("You can't buy things right now. ");
            outputObject.reprompt =  makeItDM("No shopping for you. ");
    }
    
    return outputObject
}

function makeBriberySpeech(inputObject) {
    
    var outputObject = {};
    
    if (inputObject.currentDungeonRoom) { // they are in dungeon and haven't been asked if they are sure
        if (inputObject.currentDungeonRoom === 'npc room') { // they are in the NPC room
            // check to make sure
            outputObject.text = "Are you sure you want to give all of your gold to " + inputObject.NPCName + "?"
            outputObject.reprompt = "Are you sure you want to give all of your gold to " + inputObject.NPCName + "?"
        } else {
            if (inputObject.inCombat) {
                // they dont want your gold, they want to kill you
                outputObject.text = "Nobody is interested in your gold. They just want to kill you."
                outputObject.reprompt = "No takers for your offer. Still want to kill you."
            } else {
                // they don't want your gold
                outputObject.text = "Nobody is interested in your gold."
                outputObject.reprompt = "No takers for your offer."
            }
        }

        outputObject.text = makeItDM(outputObject.text)
        outputObject.reprompt = makeItDM(outputObject.reprompt)

        return outputObject
    }
    
    
    
    if (inputObject.currentRoom) { // they are at the inn or the quartermaster
        
        if (inputObject.currentRoom === 'inn') {
            outputObject.text = makeItDM("Nobody at the inn seems worthy of a bribe.")
            outputObject.reprompt = makeItDM("No takers for your offer.")
        } else {
            outputObject.text = makeItQM("I'm a qaurtermaster, not a politician. You can buy things from me but I can't be bribed.")
            outputObject.reprompt = makeItQM("I don't take bribes.")
        }

        return outputObject

    }
    
    var NPCVoice = inputObject.NPCVoice

    if (inputObject.noResponse) {
        outputObject.text = NPCVoice("Okay! I will be here if you change your mind.")
        outputObject.reprompt = NPCVoice("Let me know if you change your mind.")
    } else {
        outputObject.text = NPCVoice('Thanks for the gold. I will hold onto it for you while you fight those monsters. I wish you good luck! ');
        outputObject.text = outputObject.text + makeItDM(inputObject.NPCName + ' scurrys away!');
        outputObject.reprompt = NPCVoice('Thanks for the gold. Good luck!')
    }

    return outputObject
}

function makeHeroOnlySpeech(inputObject) {
    
    var outputObject = {};
    
   if (inputObject.heroType === "not in party") {
        if (inputObject.heroName === "not in party") {
            outputObject.text = "Sorry. I don't know what you mean.";
            outputObject.reprompt = "I don't know what you mean.";
        } else {
            outputObject.text = "You do not have anyone named " + inputObject.heroName + " in your party.";
            outputObject.reprompt = "No " + inputObject.heroName + " here.";
        }
    } else {
        if (inputObject.heroName === "not in party") {
            outputObject.text = "Your party does not have a " + inputObject.heroType + ".";
            outputObject.reprompt = "No " + inputObject.heroType + " here.";
        } else {
            outputObject.text = "Your party's " + inputObject.heroType + " is " + inputObject.heroName;
            outputObject.reprompt = inputObject.heroName + " is a " + inputObject.heroType;
        }
    }

    outputObject.text = makeItDM(outputObject.text);
    outputObject.reprompt = makeItDM(outputObject.reprompt);

    return outputObject
}

function makeTalkSpeech(inputObject) {
    
    var outputObject = {};
    
    if (inputObject.talkingToMonster) {
        outputObject.text =  '<audio src="soundbank://soundlibrary/animals/amzn_sfx_bear_roar_small_01"/>';
        outputObject.reprompt = '<audio src="soundbank://soundlibrary/animals/amzn_sfx_bear_roar_small_01"/>';
        return outputObject
    }
    
    if (inputObject.talkingToTheNPC === true) {
        outputObject.text = inputObject.NPCVoice(inputObject.NPCSpeech);
        outputObject.reprompt = inputObject.NPCVoice(inputObject.NPCSpeech)
    } else {
        outputObject.text = "There is nobody to talk to here";
        outputObject.reprompt = "Shhhhh. Quiet."
    }
    
    return outputObject
}

function makeSwitchWeaponSpeech(inputObject) {
    
    var outputObject = {};
    
    if (inputObject.whoseWeaponSwitch === 'not in party') {
        outputObject.text = makeItDM("There is no " + inputObject.whatTheySaid + " in your party.");
        outputObject.reprompt = makeItDM("There is no " + inputObject.whatTheySaid);
        return outputObject
    }
    
    if (inputObject.whoseWeaponSwitch === 'not a valid type') {
        outputObject.text = makeItDM("I don't know what a " + inputObject.whatTheySaid + " is.");
        outputObject.reprompt = makeItDM("I don't know what a " + inputObject.whatTheySaid + " is.");
        return outputObject
    }
    
    if (inputObject.whoseWeaponSwitch === 'not a valid name') {
        outputObject.text = makeItDM("I don't know who " + inputObject.whatTheySaid + " is.");
        outputObject.reprompt = makeItDM("I don't know who " + inputObject.whatTheySaid + " is.");
        return outputObject
    }
    
    if (inputObject.whoseWeaponSwitch === "they have less than two weapons") {
        outputObject.text = makeItDM(inputObject.whatTheySaid + " doesn't have another weapon to switch to.");
        outputObject.reprompt = makeItDM(inputObject.whatTheySaid + " doesn't have another weapon to switch to.");
        return outputObject
      
    }
    
    if (inputObject.whoseWeaponSwitch === "whose weapons do you want to switch") {
        outputObject.text = makeItDM("Whose weapons do you want to switch?");
        outputObject.repromt = makeItDM("Whose weapons do you want to switch?");
        return outputObject

    }
    
    // we know whose weapon to switch and what to switch to
    
    outputObject.text = inputObject.whoseWeaponSwitch + " now " + utils.makeSynonym('wields') + " " + inputObject.equipment.pronouns.hisHer + " " + inputObject.weaponToSwitchTo.type;
    outputObject.reprompt = inputObject.whoseWeaponSwitch + " " + utils.makeSynonym('wields') + " " + inputObject.weaponToSwitchTo.name
    
    if (inputObject.shield) {
        if (inputObject.shield === 'equip') {
            outputObject.text = outputObject.text + " and is using " + inputObject.equipment.pronouns.hisHer + " shield."
            outputObject.reprompt = outputObject.reprompt + " and is using " + inputObject.equipment.pronouns.hisHer + " shield."
        } else {
            outputObject.text = outputObject.text + " and is no longer using " + inputObject.equipment.pronouns.hisHer + " shield."
            outputObject.reprompt = outputObject.reprompt + " and is no longer using " + inputObject.equipment.pronouns.hisHer + " shield."
        }
    } else {
        outputObject.text = outputObject.text + "."
        outputObject.reprompt = outputObject.reprompt + "."
    }
    
    outputObject.text = makeItDM(outputObject.text);
    outputObject.reprompt = makeItDM(outputObject.reprompt);

    return outputObject
}

function makeBackFromPurchaseSpeech(inputObject) {
    
    // should we make this speech DM or Quartermaster or Alexa?
    
    var outputObject = {text:"You can keep purchasing items at the quartermaster or you can go to the Inn if you are ready for the next level! ", reprompt: "Keep shopping or go to the Inn? "};

    return outputObject
}


// speech helper functions

// help function helpers

function makeInnHelpSpeech(helpCounter) {

    var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "You are at the Inn ready to launch your next adventure. You can ask for help at any time."
    } else {
        if (helpCounter === 2) {
            outputObject = "You can ask for help on specific topics like armor by saying help me with armor."
        } else {
            if (helpCounter === 3) {
                outputObject = "You can also ask for a complete list of help topics by saying help me with everything."
            } else {
                outputObject = "Make sure to specify which dungeon topic you want help with."
            }
        }
    }
    
    return outputObject
}

function makeLobbyHelpSpeech(helpCounter) {

    var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "You have not started your adventure yet. You can ask for help at any time on your adventure. "
    } else {
        if (helpCounter === 2) {
            outputObject = "You can ask for help on specific topics like weapons by saying help me with weapons. "
        } else {
            if (helpCounter === 3) {
                outputObject = "You can also ask for a complete list of help topics by saying help me with everything. "
            } else {
                outputObject = "Make sure to specify which dungeon topic you want help with. "
            }
        }
       
    }
    
    outputObject = outputObject + "Are you ready to go to the Inn?"
    
    return outputObject
}

function makeQuartermasterHelpSpeech(helpCounter) {

    var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "You are at the Quartermaster's. You can upgrade your equipment here if you have enough gold. "
    } else {
        if (helpCounter === 2) {
            outputObject = "You can ask for help on specific topics like special abilities by saying help me with abilities. "
        } else {
            if (helpCounter === 3) {
                outputObject = "You can also ask for a complete list of help topics by saying help me with everything. "
            } else {
                outputObject = "Make sure to specify which dungeon topic you want help with. "
            }
        }
       
    }
    
    return outputObject
}

function makeDungeonHelpSpeech(helpCounter) {

    var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "You are in the dungeon now. This is where your party gains experience through combat and maybe also some treasure along the way! "
    } else {
        if (helpCounter === 2) {
            outputObject = "You can ask for help on specific topics like fighting by saying help me with fighting. "
        } else {
            if (helpCounter === 3) {
                outputObject = "You can also ask for a complete list of help topics by saying help me with everything. "
            } else {
                outputObject = "Make sure to specify which dungeon topic you want help with. "
            }
        }
       
    }
    
    return outputObject
}

function makeFightingHelpSpeech(helpCounter) {

    var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "The dungeon is full of creatures you must destroy by fighting them."
    } else {
        if (helpCounter === 2) {
            outputObject = "You can start the combat for your party by just saying fight when confronted with these creatures. You can also specify which weapons or abilities to use as well as specific creatures to fight. "
        } else {
                outputObject = "You can find out about a specific weapon or ability by asking about its status. "
        }
       
    }
    
    return outputObject
}

function makeAbilitiesHelpSpeech(helpCounter) {

    var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "Your party members will gain abilities as they gain experience in combat."
    } else {
        if (helpCounter === 2) {
            outputObject = "Most of the abilities your party members will acquire are helpful in combat but there are also some non-combat abilities. "
        } else {
                outputObject = "You can find out about a specific ability by asking about its status. "
        }
       
    }
    
    return outputObject
}

function makeWeaponsHelpSpeech(helpCounter) {

    var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "All of your party members carry weapons. Different weapons have different pros and cons. "
    } else {
        if (helpCounter === 2) {
            outputObject = "Find out which weapons your characters have by checking their individual status. "
        } else {
                outputObject = "You can find out about a specific weapon by asking for the status of the weapon. "
        }
       
    }
    
    return outputObject
}

function makeArmorHelpSpeech(helpCounter) {

     var outputObject;
    
    if (helpCounter === 1) {
        outputObject = "All of your party members can have various pieces of armor on their body and their extremities. "
    } else {
        if (helpCounter === 2) {
            outputObject = "Find out which armor your characters have on by checking their individual status. "
        } else {
                outputObject = "You can find out about a specific piece of armor by asking for the status of the piece. "
        }
    }
    
    return outputObject
}

function makeEverythingHelpSpeech(helpCounter) {

     var outputObject;

    outputObject = "You can ask for help on these topics: abilities, armor, weapons and fighting. "
    
    return outputObject
}

//
// end help helpers
//


// voice helpers

function makeItDM(inputObject) {
    
        var outputObject = "";
        
        outputObject = "<voice name='Brian'><lang xml:lang='en-GB'>" + inputObject + "</lang></voice>" 

        return outputObject;
}

function makeItQM(inputObject) {
    
        var outputObject = "";
        
        outputObject = "<voice name='Russell'><lang xml:lang='en-AU'>" + inputObject + "</lang></voice>" 

        return outputObject;
}

//
// end voice helpers
//

// shopping helpers

function makeListOfItemsForSale(inputObject) {
    var outputObject = "";
    
    var inventoryCount = 0;
    var firstItem;
    var lastItem;
    var counter;
    
    for (counter = 0; counter<inputObject.length; counter++){
        if (inputObject[counter].itemPrice>0) { // item is not sold yet
            inventoryCount++;
            if (inventoryCount === 1) { // it is the first item for sale
               firstItem = counter;
               lastItem = counter;
            } else { // not the first item
               lastItem = counter;
            }
        }
    }
    
    for (counter = 0; counter<inputObject.length; counter++){
        if (inputObject[counter].itemPrice>0) { // item is not sold yet
            if (counter === firstItem) { // it is the first item for sale
                outputObject = "Today I have " + inputObject[counter].item.name + " for sale at a price of " +  inputObject[counter].itemPrice + " pieces of gold"   
            } else {
                if (lastItem>firstItem) {
                    if (counter === lastItem) { 
                       outputObject = outputObject + " and finally " + inputObject[counter].item.name + " for just " +  inputObject[counter].itemPrice + " pieces of gold" 
                    } else {
                       outputObject = outputObject + ", " + inputObject[counter].item.name + " for " +  inputObject[counter].itemPrice + " pieces of gold" 
                    }
                }
            }
        }
    }
    
    return outputObject
}

//
// end shopping helpers
//

// room description helpers

function makeWelcomeBackSpeech(inputObject) {
    
    var outputObject = {text:"", reprompt:""};
    
    // i have been to the inn before
    
    outputObject.text = "Welcome back to the Inn. Are you ready to try "
    
    if (inputObject.hasCompletedThisLevel === false) { // currentDungeonRoom > 0
        // welcome back and try again
        outputObject.text = outputObject.text + "level " + (inputObject.dungeonLevel+1) + " again?"
        outputObject.reprompt = "Are you ready to try again?";
    } else { // currentDungeonRoom === 0
        if (inputObject.hasUnlockedNextLevel) {
            outputObject.text =outputObject.text + "out the new level you unlocked or would you like to go through the old level again?"
            outputObject.reprompt = "Do you want to repeat the level or try the new one?";
        } else {
            outputObject.text = outputObject.text + "level " + (inputObject.dungeonLevel+1) + " again? Remember you can unlock a new level after you finish this one."
            outputObject.reprompt = "Are you ready to to rerun this level?";
        }
    }
    
    return outputObject
}

function makeRoomDescriptionSpeech(inputObject) {
    // input object is a room object
    
    var outputObject;
    
    outputObject = "You are in " +
                    inputObject.sizes + " " +
                    inputObject.shapes + " room with " +
                    inputObject.pointsOfInterest + " " +
                    inputObject.pointsOfInterestLocations + ". There is an exit " +
                    inputObject.exitLocations + ". "
  
    return outputObject
}

function makeNPCDescriptionSpeech(inputObject) {
    // input object is a room object
    
    var outputObject;
    
    var genderWords;
    
    if (inputObject.gender === 'boy' ) {
        genderWords = metaData.genderWords.BOY
    } else {
        genderWords = metaData.genderWords.GIRL
    }
  
    outputObject = inputObject.monsterDescription + " " + inputObject.monsterName + " is here and " + genderWords.heShe + " wants to tell you dungeon stuff. "

    return outputObject
}

function makeBossDescriptionSpeech(inputObject) {
    // input object is a room object
    
    var outputObject;
  
    outputObject = "There is a " + inputObject.monsterDescription + " " + inputObject.monsterName + " here and he wants to blow you up. "

    return outputObject
}

function makeMonsterDescriptionSpeech(inputObject) {
    // input object is a room object
    
    var outputObject;
    var i;
    var howManyTypesOfMonsters = inputObject.length;
    var howManyOfOneTypeOfMonsters = inputObject[0].groupList.length;
    
    if (howManyTypesOfMonsters === 1) { // one type of monster in the room
        if (howManyOfOneTypeOfMonsters === 1) { // one of that type of monster in the room
                outputObject = "There is a " + inputObject[0].monsterName+ " here. "
        } else { // more than one of that one type in the room
                outputObject = "There are " + howManyOfOneTypeOfMonsters + " " + inputObject[0].monsterPlural + " here. "
        }
    } else { // mutlitple types of monsters in the room
         if (howManyOfOneTypeOfMonsters === 1) { // only one of the first type
                outputObject = "There is a " + inputObject[0].monsterName 
        } else { //more than one of the first type
                outputObject = "There are " + howManyOfOneTypeOfMonsters + " " + inputObject[0].monsterPlural
        }
        for (i=1;i<(howManyTypesOfMonsters - 1);i++) { // iterate through the second to penultimate type
            howManyOfOneTypeOfMonsters = inputObject[i].groupList.length;
             if (howManyOfOneTypeOfMonsters === 1) {
                outputObject = outputObject  + ", a " + inputObject[i].monsterName 
            } else {
                outputObject = outputObject + ", " + howManyOfOneTypeOfMonsters + " " + inputObject[i].monsterPlural
            }
        }
        howManyOfOneTypeOfMonsters = inputObject[(howManyTypesOfMonsters - 1)].groupList.length;// now we are on the last type of monster in the list
         if (howManyOfOneTypeOfMonsters === 1) { // only one of the last type
            outputObject = outputObject  + " and  a " + inputObject[(howManyTypesOfMonsters - 1)].monsterName 
        } else { // more than one of the last type
            outputObject = outputObject + " and " + howManyOfOneTypeOfMonsters + " " + inputObject[(howManyTypesOfMonsters - 1)].monsterPlural
        }
        outputObject = outputObject + " here. "
    }
    
    return outputObject
}

function makePartyMemberBackStoriesSpeech(partyList) {

    var outputObject;
    
    var i;
    
    for (i=0; i<partyList.length; i++) {
        
        if (i === 0) {
            outputObject = "There is "
        } else {
            if (i === (partyList.length - 1)) {
                outputObject = outputObject + "And finally there is "    
            }
        }
        outputObject = outputObject + partyList[i].characterName + " the " +
                        partyList[i].characterType + ", " +
                        partyList[i].backStory
    }
        
    return outputObject
}

function makePartyMemberGoalStoriesSpeech(partyList) {
    
    var outputObject = "";
    
    var i;

    for (i=0; i<partyList.length; i++) {
       
        outputObject = outputObject + "For " + 
                        partyList[i].characterName + " the " +
                        partyList[i].characterType + ", " +
                        partyList[i].goals[0]

    }
    
    return outputObject
}

function makePartyMemberDescriptionsSpeech(partyList) {
    
    var outputObject = "Your Heroes: ";
    
    var i;

    for (i=0; i<partyList.length; i++) {
       
        outputObject = outputObject + partyList[i].characterName + " the " +
                        partyList[i].characterType + " is level " +
                        partyList[i].characterLevel + " with " +
                        partyList[i].unlockedSkills.length + " unlocked skills. "

    }
    
    return outputObject
}

function makePartyProgressSpeech(progress) {
    
    var outputObject = "You have taken out " + progress +
                        " of the " + metaData.TOTALBOSSES +
                        " total bosses. ";
                        
    return outputObject
}

//
// end room description helpers
//

// fight description helpers

function makeCharacterAttackDescriptionSpeech(inputObject) {
    var outputObject;
    var numberOfMonsters = inputObject.monsterNumber;
    var monsterName = inputObject.monsterName;
    var attackerName = inputObject.characterName;
    var result = inputObject.resultType;
    var characterPronouns;
    var monsterPronouns;
    var weapon = inputObject.weapon
    
    if (inputObject.characterGender === 'boy') {
        characterPronouns = metaData.genderWords.BOY
    } else {
        characterPronouns = metaData.genderWords.GIRL
    }
    
    if (inputObject.monsterGender) {
        if (inputObject.monsterGender === 'boy') {
            monsterPronouns = metaData.genderWords.BOY
        } else {
            monsterPronouns = metaData.genderWords.GIRL
        }
    }
    
    var attackVerb = weapon.fightingWords[Math.floor(Math.random() * weapon.fightingWords.length)];

    outputObject = attackerName + " " + attackVerb + " " + characterPronouns.hisHer + " " + weapon.type + " at " + monsterName + " and "
    
    if (result === 'miss') {
        outputObject = outputObject + "misses " 
        if (monsterPronouns) {
            outputObject = outputObject + monsterPronouns.himHer + ". "
        } else {
            if (numberOfMonsters > 1) { // it's a throng
                outputObject = outputObject + "them. "
            } else { // it's just one
                outputObject =  outputObject + "it. "
            }
        }
        // maybe add a miss sound from metatData sounds
    } else {
        if (result === 'killed') {
            if (monsterPronouns) {
                outputObject = outputObject + "kills " + monsterPronouns.himHer + ". "
            } else {
                if (numberOfMonsters === 1) {
                    outputObject = outputObject + "kills the last one. "
                } else {
                    outputObject = outputObject + "killed one. " 
                }
            }
            // this should be pulled from metadata pool of killed monster sounds
            outputObject = outputObject + "<audio src='soundbank://soundlibrary/cartoon/amzn_sfx_boing_short_1x_01'/>"
        } else {
            var hitSound = weapon.fightingSounds[Math.floor(Math.random() * weapon.fightingSounds.length)];
            outputObject = outputObject + "hits " 
            if (monsterPronouns) {
                outputObject = outputObject + monsterPronouns.himHer + ". "
            } else {
                if (numberOfMonsters > 1) { // it's a throng
                    outputObject = outputObject + "them. "
                } else { // it's just one
                    outputObject =  outputObject + "it. "
                }
            }
            outputObject = outputObject + hitSound
        }
    }
    
    return outputObject
}

function makeMonsterAttackDescriptionSpeech(inputObject) {
    var outputObject = "";
    var monsterNumber = inputObject.monsterNumber;
    var monsterName = inputObject.monsterName;
    var defenderName = inputObject.characterName;
    var result = inputObject.resultType;
    var defenderPronouns;
    
    if (inputObject.characterGender === 'boy') {
        defenderPronouns = metaData.genderWords.BOY
    } else {
        defenderPronouns = metaData.genderWords.GIRL
    }
    
    outputObject = monsterName

    if (monsterNumber > 1) { // it's a throng
        outputObject = outputObject + " attack "
    } else { // it's just one
        outputObject = outputObject + " attacks "
    }
    
    outputObject = outputObject + defenderName + " and "
    
    if (result === 'miss') {
        if (monsterNumber > 1) { // it's a throng
            outputObject = outputObject + "miss " + defenderPronouns.himHer + ". "
        } else { // it's just one
            outputObject = outputObject + "misses " + defenderPronouns.himHer + ". "
        }
    } else {
        if (monsterNumber > 1) { // it's a throng
            outputObject = outputObject + "hit " + defenderPronouns.himHer + ". "
        } else { // it's just one
            outputObject = outputObject + "hits " + defenderPronouns.himHer + ". "
        }

        if (result === 'killed') { 
            outputObject = outputObject + "<audio src='soundbank://soundlibrary/scifi/amzn_sfx_scifi_small_whoosh_flyby_01'/>"
            outputObject = outputObject + defenderName + " disappears! "
        } else { 
           outputObject = outputObject + "<audio src='soundbank://soundlibrary/impacts/amzn_sfx_punch_01'/>"
        }

    }
    
    return outputObject
}

//
// end fight description helpers
//



exports.makeQuartermasterSpeech = makeQuartermasterSpeech;
exports.makeHeroOnlySpeech = makeHeroOnlySpeech;
exports.makeBriberySpeech = makeBriberySpeech;
exports.makeSwitchWeaponSpeech = makeSwitchWeaponSpeech;
exports.makeExamineRoomSpeech = makeExamineRoomSpeech;
exports.makeIntroSpeech = makeIntroSpeech;
exports.makeStatusSpeech = makeStatusSpeech;
exports.makeInnSpeech = makeInnSpeech;
exports.makeHelpSpeech = makeHelpSpeech;
exports.makeDungeonSpeech = makeDungeonSpeech;
exports.makeFightSpeech = makeFightSpeech;
exports.makePurchaseSpeech = makePurchaseSpeech;
exports.makeTalkSpeech = makeTalkSpeech;
exports.makeBackFromPurchaseSpeech = makeBackFromPurchaseSpeech;
