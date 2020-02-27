const APLUtils = require('../utilities/APLUtils.js');
const utils = require('../utilities/generalUtils.js')
var introScreenAPL = require('../apl/introScreen.json');
var generalStatusAPL = require('../apl/generalStatus.json');
var topicStatusAPL = require('../apl/topicStatus.json');
var characterStatusAPL = require('../apl/characterStatus.json');
var dungeonScreenAPL = require('../apl/dungeonScreen.json');
var helpAPL = require('../apl/help.json');
const metaData = require('../dataFiles/metaData.js').metaData;

function makeCharacterStatusAPL(inputObject) {

    var outputObject = {datasources: {characterStatusData:{}}};
                        
    var character = inputObject.character;
    var updatedURL;

    var topic = inputObject.topic;
                
    if (character.characterNotInPartyName) {
        updatedURL = APLUtils.getAPLURL('head0.png');
        outputObject.datasources.characterStatusData = {textContent:
                                                        {
                                                            primaryText:{type:'PlainText', text: 'There is no ' + character.characterNotInPartyName + ' in your party. '},
                                                            subhead:{type:'PlainText', text: ''},
                                                            title:{type:'PlainText', text: ''},
                                                            subtitle:{type:'PlainText', text: ''},
                                                            bulletPoint:{type:'PlainText', text: ''},
                                                        },
                                                        imageURL:updatedURL
                                                    };
    } else {
        outputObject.datasources.characterStatusData = {textContent:
                                                        {
                                                            primaryText:{type:'PlainText'},
                                                            subhead:{type:'PlainText'},
                                                            title:{type:'PlainText'},
                                                            subtitle:{type:'PlainText'},
                                                            bulletPoint:{type:'PlainText'}
                                                        },
                                                        imageURL:""
                                                    };
        updatedURL = APLUtils.getAPLURL(character.thumbnail);
        outputObject.datasources.characterStatusData.imageURL = updatedURL;
        outputObject.datasources.characterStatusData.textContent.subhead.text = character.characterName;

        console.log('in make character status APL and slotInfo is ',inputObject.slotInfo )
        
        if (inputObject.slotInfo.topicSlot.value) { // if they mentioned a topic with the character
            var topicName = inputObject.slotInfo.topicSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name
            switch (topicName) {
                case 'armor':
                    outputObject.datasources.characterStatusData.textContent.title.text = 'Armor';
                    outputObject.datasources.characterStatusData.textContent.primaryText.text = makeArmorStatusText(character);
                    break;
                case 'weapons':
                    outputObject.datasources.characterStatusData.textContent.title.text = 'Weapons';
                    outputObject.datasources.characterStatusData.textContent.primaryText.text = makeWeaponsStatusText(character);
                    break;
                case 'abilities':
                    outputObject.datasources.characterStatusData.textContent.title.text = 'Abilities';
                    outputObject.datasources.characterStatusData.textContent.primaryText.text = makeAbilitiesStatusText(character);
                    break;
                default:
                    outputObject.datasources.characterStatusData.textContent.title.text = 'Other';
                    outputObject.datasources.characterStatusData.textContent.primaryText.text = "All about " + character.characterName;
            }
        } else {
            outputObject.datasources.characterStatusData.textContent.title.text = 'General';
            outputObject.datasources.characterStatusData.textContent.primaryText.text = "All about " + character.characterName;
        }
    
    }
    
   
    outputObject.datasources.characterStatusData.backgroundImageURL = inputObject.backgroundImageUrl;
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.characterStatusData.logoUrl = updatedURL;
    outputObject.datasources.characterStatusData.title = "Character Summary";
   
    outputObject.document = characterStatusAPL.document;

    return outputObject
}

function makeAbilitiesStatusText(inputObject) {
    
    var outputObject = "basic attack ability: ";
    
    var abilitiesObject = inputObject.abilities;
    
    outputObject = outputObject + abilitiesObject.basicAttack.name + "<br> special attack abilties: "
    
    if (abilitiesObject.specialAttacks.length > 0) {
        for (var specialAttackCounter = 0; specialAttackCounter<abilitiesObject.specialAttacks.length; specialAttackCounter++) {
            outputObject = outputObject + abilitiesObject.specialAttacks[specialAttackCounter].name
            if (abilitiesObject.specialAttacks.length>1) { // we need commas or an and or both
                if (specialAttackCounter === (abilitiesObject.specialAttacks.length - 2)) {
                    outputObject = outputObject + " and "    
                } 
                if (specialAttackCounter < (abilitiesObject.specialAttacks.length - 2)) {
                    outputObject = outputObject + ", "    
                }
            }
        }
    } else {
        outputObject = "none"
    }
    
    outputObject = outputObject + "<br> non-combat abilties: "  

    if (abilitiesObject.nonCombatAbilities.length > 0) {
        for (var nonCombatAbilitiesCounter = 0; nonCombatAbilitiesCounter<abilitiesObject.nonCombatAbilities.length; nonCombatAbilitiesCounter++) {
            outputObject = outputObject + abilitiesObject.nonCombatAbilities[nonCombatAbilitiesCounter].name
            if (abilitiesObject.nonCombatAbilities.length>1) { // we need commas or an and or both
                if (nonCombatAbilitiesCounter === (abilitiesObject.nonCombatAbilities.length - 2)) {
                    outputObject = outputObject + " and "    
                } 
                if (nonCombatAbilitiesCounter < (abilitiesObject.nonCombatAbilities.length - 2)) {
                    outputObject = outputObject + ", "    
                }
            }
        }
    } else {
        outputObject = "none"
    }

    return outputObject
}

function makeArmorStatusText(inputObject) {
    
    var outputObject = "";
    
    var armorArray = utils.getArmorStatus(inputObject.equipment.armor);
    
    for (var armorPiece = 0; armorPiece<armorArray.length; armorPiece++) {
        outputObject = outputObject + armorArray[armorPiece].slotName + ": "   
        if (armorArray[armorPiece].slotArmor.name) {
            outputObject = outputObject + armorArray[armorPiece].slotArmor.name   
        } else {
            outputObject = outputObject  + "none"    
        }
        outputObject = outputObject + "<br>"  
    }

    return outputObject
}
   
function makeWeaponsStatusText(inputObject) {
    
    var outputObject = "";
    
    var weaponsArray = utils.getWeaponStatus(inputObject.equipment.weapons);
        
    for (var weapon = 0; weapon<weaponsArray.length; weapon++) {
        outputObject = outputObject + weaponsArray[weapon].slotName + ": "   
        if (weaponsArray[weapon].slotWeapon.name) {
            outputObject = outputObject + weaponsArray[weapon].slotWeapon.name  
        } else {
            outputObject = outputObject + "none"  
        }
        outputObject = outputObject + "<br>"  
    }

    return outputObject
}

function makeGeneralStatusAPL(inputObject) {

    var outputObject = {datasources:
                            {
                                generalStatus:
                                {
                                    metaData:{},
                                    listItems:[]
                                }
                            }
                        };
                        
    var updatedURL;

    var randomList = inputObject.speechListOrder;
    
    var partyList = inputObject.partyList;
    
    var i;
    
    var character;
    
    outputObject.datasources.generalStatus.metaData.backgroundImageUrl = inputObject.backgroundImageUrl;
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.generalStatus.metaData.logoUrl = updatedURL;
    outputObject.datasources.generalStatus.metaData.title = "Party Summary";

    for (i=0; i<randomList.length; i++) {
        character = partyList[randomList[i]];
        outputObject.datasources.generalStatus.listItems[i] = {textContent:
                                                                {
                                                                    primaryText:{type:'PlainText'},
                                                                    secondaryText:{type:'PlainText'},
                                                                    tertiaryText:{type:'PlainText'}
                                                                },
                                                                imageURL:""
                                                            };
        updatedURL = APLUtils.getAPLURL(character.thumbnail);
        outputObject.datasources.generalStatus.listItems[i].imageURL = updatedURL;
        outputObject.datasources.generalStatus.listItems[i].textContent.primaryText.text = character.characterName;
        outputObject.datasources.generalStatus.listItems[i].textContent.secondaryText.text = character.characterRace;
        outputObject.datasources.generalStatus.listItems[i].textContent.tertiaryText.text = 'Level ' + character.characterLevel + ' ' + character.characterType;
    }    

    outputObject.document = generalStatusAPL.document;

    return outputObject
}

function makeIntroAPL(inputObject) {
    
    var outputObject = {datasources:{introScreen:{}}};
    var updatedURL;
    
    outputObject.datasources.introScreen.type = 'object';
    outputObject.datasources.introScreen.objectId = 'introScreen';
    updatedURL = APLUtils.getAPLURL('pixelPicture.jpg');
    outputObject.datasources.introScreen.imageUrl = updatedURL;
    
     if (inputObject.cantGetThereFromHere) {
         updatedURL = APLUtils.getAPLURL('introScreen.jpg');
         
        switch (inputObject.cantGetThereFromHere) {
            case 'lobby':
                outputObject.datasources.introScreen.textContent = "You are already in the lobby. ";
                outputObject.datasources.introScreen.title = "You're already there. ";
                break
            case 'dungeon':
                outputObject.datasources.introScreen.textContent = "You need to meet your party at the inn before you can go to the dungeon. ";
                outputObject.datasources.introScreen.title = "Go to the inn. ";
                break
            case 'quartermaster':
                outputObject.datasources.introScreen.textContent = "You have to clear out a dungeon level with your party to get to the quartermater's. ";
                outputObject.datasources.introScreen.title = "Go to the inn. ";
                break
            default:
                outputObject.datasources.introScreen.textContent = "You can't get there from here. ";
                outputObject.datasources.introScreen.title = "Can't get there. ";
                break
        }
    } else {
        if (inputObject.beenToIntroCounter === 1) {
            outputObject.datasources.introScreen.title = 'Welcome to the Dungeon';  
            outputObject.datasources.introScreen.textContent = "Come on down! <br> Let's meet your party at the Inn!";
            updatedURL = APLUtils.getAPLURL('introScreen.jpg');
        } else {
            if (inputObject.noResponse === true) {
                outputObject.datasources.introScreen.title = 'Just say Yes!';  
                outputObject.datasources.introScreen.textContent = "There is no 'No' here. <br> Only yes!";
                updatedURL = APLUtils.getAPLURL('introScreen.jpg');    
            } else {
                if (inputObject.beenToInnCounter === 1) {
                    outputObject.datasources.introScreen.title = 'Welcome back to the Dungeon';    
                    outputObject.datasources.introScreen.textContent = "You again? <br> Let's go to the Inn!";
                    updatedURL = APLUtils.getAPLURL('introScreen.jpg');
                } else {
                    outputObject.datasources.introScreen.title = 'Welcome back to the Inn';    
                    outputObject.datasources.introScreen.textContent = "This is really a great Inn!";
                    updatedURL = APLUtils.getAPLURL('innScreen.jpg');
                }
            }
        }
    }
    

    outputObject.datasources.introScreen.backgroundImageUrl = updatedURL;
    outputObject.backgroundImageUrl = updatedURL;

    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.introScreen.logoUrl = updatedURL;
    outputObject.datasources.introScreen.hintText = "Say something down here"
    
    outputObject.document = introScreenAPL.document;

    return outputObject
}

function makeInnAPL(inputObject) {
    
    var outputObject = {datasources:{introScreen:{}}};
    var updatedURL;
    
    outputObject.datasources.introScreen.type = 'object';
    outputObject.datasources.introScreen.objectId = 'introScreen';
    updatedURL = APLUtils.getAPLURL('pixelPicture.jpg');
    outputObject.datasources.introScreen.imageUrl = updatedURL;
    updatedURL = APLUtils.getAPLURL('innScreen.jpg');
    outputObject.datasources.introScreen.backgroundImageUrl = updatedURL;
    outputObject.backgroundImageUrl = updatedURL;
    
     if (inputObject.cantGetThereFromHere) {
            switch (inputObject.cantGetThereFromHere) {
                case 'lobby':
                    outputObject.datasources.introScreen.textContent = "You can't go back to the lobby. ";
                    outputObject.datasources.introScreen.title = "You can't get there. ";
                    break
                case 'inn':
                    outputObject.datasources.introScreen.textContent = "You are already there. ";
                    outputObject.datasources.introScreen.title = "That's where you are. ";
                    break
                case 'quartermaster':
                    outputObject.datasources.introScreen.textContent = "You have to clear out all of the monsters in this level to get to the quartermaster's. ";
                    outputObject.datasources.introScreen.title = "You need to kill more monsters. ";
                    break
                default:
                    outputObject.datasources.introScreen.textContent = "You can't get there from here. ";
                    outputObject.datasources.introScreen.title = "Can't get there. ";
                    break
            }

    } else {
        if (inputObject.theyWantToStartOver === true) {
            outputObject.datasources.introScreen.title = 'Start over?';  
            outputObject.datasources.introScreen.textContent = "Are your sure you want to start over and go back to the inn?";
    
        } else {
        
            if (inputObject.noResponse === true) {
                outputObject.datasources.introScreen.title = 'Just say Yes!';  
                outputObject.datasources.introScreen.textContent = "Why say 'No'? <br> You should say yes!";
            } else {
                if (inputObject.beenToInnCounter === 1) {
                    outputObject.datasources.introScreen.title = 'Welcome to the Inn';    
                    outputObject.datasources.introScreen.textContent = "You have landed at the Inn! <br> It all happens here.";
                } else {
                    outputObject.datasources.introScreen.title = 'Welcome back to the Inn';    
                    outputObject.datasources.introScreen.textContent = "Once again, the Inn. <br> Better than ever. <br> Inn.";
                }
            }
        }
    }

    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.introScreen.logoUrl = updatedURL;
    outputObject.datasources.introScreen.hintText = "Say something down here"
    
    outputObject.document = introScreenAPL.document;
    
    return outputObject
}

function makeDungeonAPL(inputObject) {
    
    var outputObject = {datasources:{dungeonScreen:{}}};
    var updatedURL;
    
    outputObject.datasources.dungeonScreen.type = 'object';
    outputObject.datasources.dungeonScreen.objectId = 'introScreen';
    updatedURL = APLUtils.getAPLURL('pixelPicture.jpg');
    outputObject.datasources.dungeonScreen.imageUrl = updatedURL;
    updatedURL = APLUtils.getAPLURL('dungeonScreen.jpg');
    outputObject.datasources.dungeonScreen.backgroundImageUrl = updatedURL;
    outputObject.backgroundImageUrl = updatedURL;
    
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.dungeonScreen.logoUrl = updatedURL;
    outputObject.datasources.dungeonScreen.hintText = "Say something down here"
    
    outputObject.document = dungeonScreenAPL.document;
    
     if (inputObject.cantLeaveRoom === true) {
        outputObject.datasources.dungeonScreen.title = "Exit is blocked.";
        outputObject.datasources.dungeonScreen.textContent = "You have to fight your way out.";
        return outputObject
    }
    
    if (inputObject.noResponse) {
        outputObject.datasources.dungeonScreen.title = 'Staying put';  
        outputObject.datasources.dungeonScreen.textContent = "Not leaving the dungeon";
        return outputObject
    }
    
    if (inputObject.cantGetThereFromHere) {
         switch (inputObject.cantGetThereFromHere) {
            case 'dungeon':
                outputObject.datasources.dungeonScreen.textContent = "You are already in the dungeon. ";
                outputObject.datasources.dungeonScreen.title = "You're already there. ";
                break
            case 'lobby':
                outputObject.datasources.dungeonScreen.textContent = "You can't go back to the lobby. ";
                outputObject.datasources.dungeonScreen.title = "You can't get there. ";
                break
            case 'quartermaster':
                outputObject.datasources.dungeonScreen.textContent = "You have to defeat all the monsters on this level to get to the quartermaster's.";
                outputObject.datasources.dungeonScreen.title = "You need to kill more monsters.";
                break
            default:
                outputObject.datasources.dungeonScreen.textContent = "You can't get there from here. ";
                outputObject.datasources.dungeonScreen.title = "Can't get there. ";
                break
        }
        return outputObject
    }
    
    var currentRoom = inputObject.currentDungeon[inputObject.dungeonRoom];

    
    if (inputObject.dungeonRoom<metaData.DUNGEONROOMSPERLEVEL) {

        outputObject.datasources.dungeonScreen.title = "It's Dungeon Time!";  
        
        
        outputObject.datasources.dungeonScreen.textContent = "You are in " + currentRoom.roomAdjectives.sizes + " " +
                                                                            currentRoom.roomAdjectives.shapes + " room. <br> <br>" 
                                                                            
        if ((inputObject.dungeonRoom === 0) || (inputObject.dungeonRoom === metaData.DUNGEONROOMSPERLEVEL - 1)) {
            outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                    currentRoom.roomMonsterGroups[0].monsterDescription + "  " +
                                                                    currentRoom.roomMonsterGroups[0].monsterName + " is here." 
        } else {
            var i;
            for (i=0; i<currentRoom.roomMonsterGroups.length; i++) {
                if (i === 0) {
                    if (currentRoom.roomMonsterGroups[i].groupList.length === 1) {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + "There is "
                    } else {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + "There are "
                    }
                }
                if (currentRoom.roomMonsterGroups[i].groupList.length === 1) {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + "a " +
                                                                        currentRoom.roomMonsterGroups[i].monsterName
                } else {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                        utils.toWords(currentRoom.roomMonsterGroups[i].groupList.length) + " " +
                                                                        currentRoom.roomMonsterGroups[i].monsterPlural
                }
                if (currentRoom.roomMonsterGroups.length>2) {
                    if (i<(currentRoom.roomMonsterGroups.length - 2)) {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + ", " 
                    } else {
                        if (i === (currentRoom.roomMonsterGroups.length - 2)) {
                            outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + " and " 
                        } else {
                            outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + " " 
                        }
                    }
                } else {
                    if ((currentRoom.roomMonsterGroups.length>1) && (i === 0)) {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + " and " 
                    } else {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + " " 
                    }
                }
                
            }
            outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + "in the room."
        }
    } else {
        outputObject.datasources.dungeonScreen.title = "It's Shopping Time!";  

        outputObject.datasources.dungeonScreen.textContent = "You are at the Quartermasters" 
    }

    return outputObject
}

function makeBackFromPurchaseAPL(inputObject) {
    
    var outputObject = {datasources:{dungeonScreen:{}}};
    var updatedURL;

    outputObject.datasources.dungeonScreen.type = 'object';
    outputObject.datasources.dungeonScreen.objectId = 'introScreen';
    updatedURL = APLUtils.getAPLURL('pixelPicture.jpg');
    outputObject.datasources.dungeonScreen.imageUrl = updatedURL;
    updatedURL = APLUtils.getAPLURL('dungeonScreen.jpg');
    outputObject.datasources.dungeonScreen.backgroundImageUrl = updatedURL;
    outputObject.backgroundImageUrl = updatedURL;

    outputObject.datasources.dungeonScreen.title = "You bought a thing!";  

    outputObject.datasources.dungeonScreen.textContent = "Keep shopping or go to the Inn?" 
                                                                            
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.dungeonScreen.logoUrl = updatedURL;
    outputObject.datasources.dungeonScreen.hintText = "Say something down here"
    
    outputObject.document = dungeonScreenAPL.document;
    
    return outputObject
}

function makeFightAPL(inputObject) {
    
    var outputObject = {datasources:{dungeonScreen:{}}};
    var updatedURL;
    
    var attackStatus = inputObject.attackStatus;
    var i;
    
    outputObject.datasources.dungeonScreen.type = 'object';
    outputObject.datasources.dungeonScreen.objectId = 'introScreen';
    updatedURL = APLUtils.getAPLURL('pixelPicture.jpg');
    outputObject.datasources.dungeonScreen.imageUrl = updatedURL;
    updatedURL = APLUtils.getAPLURL('dungeonScreen.jpg');
    outputObject.datasources.dungeonScreen.backgroundImageUrl = updatedURL;
    outputObject.backgroundImageUrl = updatedURL;
    
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.dungeonScreen.logoUrl = updatedURL;
    outputObject.datasources.dungeonScreen.hintText = "Say something down here"
    
    outputObject.document = dungeonScreenAPL.document;
    
    if (inputObject.nobodyLeftToFightHere === true) {
        outputObject.datasources.dungeonScreen.textContent = "There is nobody left to fight here. ";
        outputObject.datasources.dungeonScreen.title = "Settle down Francis. " ; 
        return outputObject
    }
    
    if (inputObject.nobodyToFightHere === true) {
        outputObject.datasources.dungeonScreen.textContent = "There is nobody to fight here. ";
        outputObject.datasources.dungeonScreen.title = "Settle down Francis. " ; 
        return outputObject
    }
    
    if (inputObject.theyWantToFightTheNPC === true) {
        outputObject.datasources.dungeonScreen.textContent = "Are you sure you want to fight " + inputObject.NPCsname + "? ";
        outputObject.datasources.dungeonScreen.title = "Like extra sure? " ; 
        return outputObject
    }
    
    if (inputObject.theyDontWantToFightTheNPC === true) {
        outputObject.datasources.dungeonScreen.textContent = "That's a good choice. I hear that fighting friendly folks in the dungeon can lead to bad luck.";
        outputObject.datasources.dungeonScreen.title = "Good Choice "; 
        return outputObject
    }
    
    outputObject.datasources.dungeonScreen.title = "It's Fightin' Time!";  // specifically want this title for the screens that refute ability and monster miscues in addition to regular fighting

    if (inputObject.monsterSpecified === true) {
        outputObject.datasources.dungeonScreen.textContent = "There's no " + inputObject.monsterName + " to fight here.";
        return outputObject
    }
    
    if (inputObject.monsterUnknown === true) {
        outputObject.datasources.dungeonScreen.textContent = "I don't know of any monsters called " + inputObject.monsterName + ".";
        return outputObject
    }

    if (inputObject.abilitySpecified) {
        if (inputObject.abilitySpecified === 'unknown') {// they named an ability that we haven't heard of
            outputObject.datasources.dungeonScreen.textContent ="I don't know the ability " + inputObject.abilityName;
        } else {
            if (inputObject.abilitySpecified === 'non-combat') {// they named a non=combat ability
                outputObject.datasources.dungeonScreen.textContent = inputObject.abilityName + " is not a fighting ability";
            } else {
                if (inputObject.whoHasTheAbility === 'nobody') {// they named an ability that nobdy has yet
                    outputObject.datasources.dungeonScreen.textContent = "Nobody in your party has the " + inputObject.abilityName + " ability yet.";
                } else {// they named an ability that somebody has but it's not their turn to fight
                    outputObject.datasources.dungeonScreen.textContent = inputObject.whoHasTheAbility + " has that ability but it is not " + inputObject.hisHer + " turn to fight. ";
                }
            }
        }
        return outputObject
    }    
    
    outputObject.datasources.dungeonScreen.textContent = "";
    
    for (i=0; i<attackStatus.length; i++) {

        var thisAttack = attackStatus[i];
        
        var monsterPronouns;
        
        if (thisAttack.monsterGender) {
            if (thisAttack.monsterGender === 'boy') {
                monsterPronouns = metaData.genderWords.BOY
            } else {
                monsterPronouns = metaData.genderWords.GIRL
            }
        }
        
        var characterPronouns
    
        if (thisAttack.characterGender === 'boy') {
            characterPronouns = metaData.genderWords.BOY
        } else {
            characterPronouns = metaData.genderWords.GIRL
        }

        if (thisAttack.attackType === 'character') {
            if (monsterPronouns) {
                outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + thisAttack.characterName + " attacks " +
                                                                        thisAttack.monsterName + " and "
            } else {
                if (thisAttack.monsterNumber>1) {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + thisAttack.characterName + " attacks " +
                                                                        utils.toWords(thisAttack.monsterNumber) + " " + thisAttack.monsterPlural + " and "
                } else {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + thisAttack.characterName + " attacks the " +
                                                                        thisAttack.monsterName + " and "
                }   
            }
            
            if (thisAttack.resultType === 'hit') {
                if (monsterPronouns) {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                            "hits " + monsterPronouns.himHer
                 } else {
                    if (thisAttack.monsterNumber>1) {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                            "hits them"
                    } else {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                            "hits it"
                    }
                }
            } else {
                if (thisAttack.resultType === 'killed') { // this will need updating when mutliple kills gets sorted
                    if (monsterPronouns) {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                            "kills " + monsterPronouns.himHer    
                    } else {
                        if (thisAttack.monsterNumber === 1) {
                            outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                            "kills the last one"
                        } else {
                            outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                            "kills one"
                        }
                    }
                } else { // ya missed
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + 
                                                                        "misses"
                }
            }
        } else { // it's a monster attack
            if (thisAttack.monsterNumber>1) {
                outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + "The " +
                                                                    utils.toWords(thisAttack.monsterNumber)+ " " + thisAttack.monsterPlural +
                                                                    " attack " + thisAttack.characterName + " and "
                if (thisAttack.resultType === 'hit') {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent +
                                                                    "hit " + characterPronouns.himHer
                } else {
                    if (thisAttack.resultType === 'killed') {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + thisAttack.characterName + " disappears"
                    } else {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent +
                                                                    "miss " + characterPronouns.himHer
                    }
                }
            } else {
                if (monsterPronouns) {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + thisAttack.monsterName +
                                                    " attacks " + thisAttack.characterName + " and "

                } else {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + "The " + thisAttack.monsterName +
                                                                    " attacks " + thisAttack.characterName + " and "
                }
                if (thisAttack.resultType === 'hit') {
                    outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent +
                                                                    "hits " + characterPronouns.himHer
                } else {
                    if (thisAttack.resultType === 'killed') {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + thisAttack.characterName + " disappears"
                    } else {
                        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent +
                                                                    "misses " + characterPronouns.himHer
                    }
                }
            }  
        }
        
        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + ".<br>"   
        
    }
    
    if (inputObject.nextToAct === 'party wiped out') {
        outputObject.datasources.dungeonScreen.textContent = outputObject.datasources.dungeonScreen.textContent + "Your party is wiped out and magically transported back to the Inn."    
        updatedURL = APLUtils.getAPLURL('innScreen.jpg');
        outputObject.datasources.dungeonScreen.backgroundImageUrl = updatedURL;
        outputObject.datasources.dungeonScreen.title = "Back to the Inn!"
    }

    return outputObject
}

function makeStatusAPL(inputObject) {
    
    var outputObject;
    
  // the input object includes the entire char object as .character
    
    if (inputObject.hasNoParty === true) {
        outputObject = makeNoPartyStatusAPL(inputObject);
    } else {
         switch (inputObject.statusType) {
            case 'general':
                outputObject = makeGeneralStatusAPL(inputObject);
                break;
            case 'character':
                outputObject = makeCharacterStatusAPL(inputObject);
                break;
            case 'topic only':
                outputObject = makeTopicStatusAPL(inputObject);
                break;
            default:
                outputObject = makeUnknownStatusAPL(inputObject);
        }
    }
    
    return outputObject
}

function makeHelpAPL(inputObject) {
    // I decided to not implement this sep 18 by dumping it from the outputbuilder and index files
    var outputObject = {datasources:{helpData:{}}};
    
    var updatedURL;

    outputObject.datasources.helpData = {
                                            textContent:
                                                {
                                                    primaryText:{type:'PlainText'},
                                                    subhead:{type:'PlainText'},
                                                    title:{type:'PlainText'},
                                                    subtitle:{type:'PlainText'},
                                                    bulletPoint:{type:'PlainText'}
                                                },
                                            imageURL:""
                                        };
    updatedURL = APLUtils.getAPLURL('help.png');
    outputObject.datasources.helpData.imageURL = updatedURL;
    outputObject.datasources.helpData.textContent.subhead.text = 'HELP';
    //outputObject.datasources.helpData.textContent.title.text = '';

    if (inputObject.helpType === 'topic') {
        switch (inputObject.helpTopic) {
            case 'armor':
                outputObject.datasources.helpData.textContent.title.text = "Armor Help";
                break;
            case 'weapons':
                outputObject.datasources.helpData.textContent.title.text = "Weapons Help";
                break;
            default:
                outputObject.datasources.helpData.textContent.title.text = "Other Stuff";
        }
    } else {
        outputObject.datasources.helpData.textContent.title.text = "";
    }
    
    outputObject.datasources.helpData.textContent.primaryText.text = inputObject.helpText;

    outputObject.datasources.helpData.backgroundImageURL = inputObject.backgroundImageUrl;
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.helpData.logoUrl = updatedURL;

    outputObject.document = helpAPL.document;

    return outputObject
}

// 
// apl helper functions
//

function makeUnknownStatusAPL(inputObject) {
    var outputObject;
    return outputObject
}


    
function makeNoPartyStatusAPL(inputObject) {
    
    var outputObject;
    var updatedURL;
    
    outputObject = {datasources:{introScreen:{}}};
    outputObject.datasources.introScreen.type = 'object';
    outputObject.datasources.introScreen.objectId = 'introScreen';
    outputObject.datasources.introScreen.title = 'Go to the Inn and meet your heroes!';
    outputObject.datasources.introScreen.backgroundImageUrl = inputObject.backgroundImageUrl;
    updatedURL = APLUtils.getAPLURL('IntroScreen1.png');
    outputObject.datasources.introScreen.imageUrl = updatedURL;
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.introScreen.logoUrl = updatedURL;
    outputObject.datasources.introScreen.hintText = "Say something down here"
    
    outputObject.document = introScreenAPL.document;

    return outputObject
}

function makeTopicStatusAPL(inputObject) {
    var outputObject = {datasources: {topicStatusData:{}}};
                        
    var updatedURL;

    var topic = inputObject.slotInfo.topicSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    
    outputObject.datasources.topicStatusData = {textContent:
                                                    {
                                                        primaryText:{type:'PlainText'},
                                                        subhead:{type:'PlainText'},
                                                        title:{type:'PlainText'},
                                                        subtitle:{type:'PlainText'},
                                                        bulletPoint:{type:'PlainText'}
                                                    },
                                                    imageURL:""
                                                };
    updatedURL = APLUtils.getAPLURL('help.png');
    outputObject.datasources.topicStatusData.imageURL = updatedURL;
    outputObject.datasources.topicStatusData.textContent.subhead.text = 'STATUS';

    if (topic) {
        switch (topic) {
            case 'armor':
                outputObject.datasources.topicStatusData.textContent.title.text = 'Armor';
                outputObject.datasources.topicStatusData.textContent.primaryText.text = "Whose armor?";
                break;
            case 'weapons':
                outputObject.datasources.topicStatusData.textContent.title.text = 'Weapons';
                outputObject.datasources.topicStatusData.textContent.primaryText.text = "Whose weapons?";
                break;
            default:
                outputObject.datasources.topicStatusData.textContent.primaryText.text = "Whatchoo talking about?";
        }
    }
  
  
    outputObject.datasources.topicStatusData.backgroundImageURL = inputObject.backgroundImageUrl;
    updatedURL = APLUtils.getAPLURL('54pxSquoval.png');
    outputObject.datasources.topicStatusData.logoUrl = updatedURL;

    outputObject.document = topicStatusAPL.document;

    return outputObject
}

    
exports.makeIntroAPL = makeIntroAPL;
exports.makeStatusAPL = makeStatusAPL;
exports.makeInnAPL = makeInnAPL;
exports.makeHelpAPL = makeHelpAPL;
exports.makeDungeonAPL = makeDungeonAPL;
exports.makeFightAPL = makeFightAPL;
exports.makeBackFromPurchaseAPL = makeBackFromPurchaseAPL;

