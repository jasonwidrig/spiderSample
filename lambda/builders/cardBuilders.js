const utils = require('../utilities/generalUtils.js');
const metaData = require('../dataFiles/metaData.js').metaData;
const rollingDebug = false;

function makeIntroCard (inputObject) {
    
    var outputObject = {};
    var updatedURL;
    
    if (inputObject.cantGetThereFromHere) {

        switch (inputObject.cantGetThereFromHere) {
            case 'lobby':
                outputObject.content = "You are already in the lobby. ";
                outputObject.title = "You're already there. ";
                break
            case 'dungeon':
                outputObject.content = "You need to meet your party at the inn before you can go to the dungeon. ";
                outputObject.title = "Go to the inn. ";
                break
            case 'quartermaster':
                outputObject.content = "You have to clear out a dungeon level with your party to get to the quartermaster's. ";
                outputObject.title = "Go to the inn. ";
                break
            default:
                outputObject.content = "You can't get there from here. ";
                outputObject.title = "Can't get there. ";
                break
        }
    } else {
            if (inputObject.beenToIntroCounter === 1) {
            outputObject.title = "Welcome to the Spider Temple";
            outputObject.content = "This is an adventure and things happen";    
        } else {
            if (inputObject.noResponse === true) {
                outputObject.title = 'Just say Yes!';  
                outputObject.content = "Saying no doesn't make any sense here.";    
            } else {
                if (inputObject.beenToInnCounter === 0) {
                    outputObject.title = 'Welcome back to the Spider Temple';    
                    outputObject.content = "This is still the adventure and things still happen";
                } else {
                    var i;
                    var partyList = inputObject.partyList
                    outputObject.title = 'Welcome back to the Inn';    
                    outputObject.content = "Your party is here:\n\n";
                    for (i=0; i<partyList.length; i++) {
                        outputObject.content = outputObject.content + "Level " + 
                            partyList[i].characterLevel + " " +
                            partyList[i].characterType + " " +
                            partyList[i].characterName + "\n"
                    }
                }
            }
        }
    }
    
    updatedURL = utils.getS3PreSignedUrl('Media/108pxSquoval.jpg');

    outputObject.smallUrl = updatedURL;
    
    outputObject.largeUrl = updatedURL;

    return outputObject;
}

function makeInnCard (inputObject) {
    
    var outputObject = {};
    var updatedURL;
    var i;
    var partyList = inputObject.partyList
    
    if (inputObject.cantGetThereFromHere) {
        
        switch (inputObject.cantGetThereFromHere) {
            case 'lobby':
                outputObject.content = "You can't go back to the lobby. ";
                outputObject.title = "You can't get there. ";
                break
            case 'inn':
                outputObject.content = "You are already there. ";
                outputObject.title = "That's where you are. ";
                break
            case 'quartermaster':
                outputObject.content = "You have to clear out all of the monsters in this level to get to the quartermater's. ";
                outputObject.title = "You need to kill more monsters. ";
                break
            default:
                outputObject.content = "You can't get there from here. ";
                outputObject.title = "Can't get there. ";
                break
        }
        
    } else {
        if (inputObject.theyWantToStartOver === true) {
            outputObject.title = 'Start over?';  
            outputObject.content = "Are you sure you want to start over?";    
        } else {
        
            if (inputObject.noResponse === true) {
                outputObject.title = 'Just say Yes!';  
                outputObject.content = "Saying no doesn't make any sense here.";    
            } else {
                outputObject.title = 'Welcome to the Inn';     
                outputObject.content = "Time to meet your party!\n";
                
                for (i=0; i<partyList.length; i++) {
                    outputObject.content = outputObject.content + "\n Level " + 
                                            partyList[i].characterLevel + " " +
                                            partyList[i].characterType + " " +
                                            partyList[i].characterName + "\n"
                }
            }
        }
    }

    updatedURL = utils.getS3PreSignedUrl('Media/108pxSquoval.jpg');

    outputObject.smallUrl = updatedURL;
    
    outputObject.largeUrl = updatedURL;

    return outputObject;
}

function makeDungeonCard (inputObject) {
    
    var outputObject = {};
    var updatedURL;
    
    updatedURL = utils.getS3PreSignedUrl('Media/108pxSquoval.jpg');

    outputObject.smallUrl = updatedURL;
    
    outputObject.largeUrl = updatedURL;

    if (inputObject.cantLeaveRoom === true) {
        outputObject.title = "Exit is blocked.";
        outputObject.text = "You have to fight your way out.";
        return outputObject
    }
    
    if (inputObject.noResponse === true) {
        outputObject.title = 'Staying put';  
        outputObject.content = "Still in the dungeon.";    
        return outputObject
    } 

    
    if (inputObject.cantGetThereFromHere) {
         switch (inputObject.cantGetThereFromHere) {
            case 'dungeon':
                outputObject.text = "You are already in the dungeon. ";
                outputObject.title = "You're already there. ";
                break
            case 'lobby':
                outputObject.text = "You can't go back to the lobby. ";
                outputObject.title = "You can't get there. ";
                break
            case 'quartermaster':
                outputObject.text = "You have to defeat all the monsters on this level to get to the quartermaster's.";
                outputObject.title = "You need to kill more monsters.";
                break
            default:
                outputObject.text = "You can't get there from here. ";
                outputObject.title = "Can't get there. ";
                break
        }
        return outputObject
    }
    
    var currentRoom = inputObject.currentDungeon[inputObject.dungeonRoom];

    if (inputObject.dungeonRoom<metaData.DUNGEONROOMSPERLEVEL) {
        
        outputObject.title = "You're in the dungeon now";  
    
        outputObject.content = "You are in " + currentRoom.roomAdjectives.sizes + " " +
                                                                            currentRoom.roomAdjectives.shapes + " room.\n" 
                                                                            
        if ((inputObject.dungeonRoom === 0) || (inputObject.dungeonRoom === metaData.DUNGEONROOMSPERLEVEL - 1)) {
            outputObject.content = outputObject.content + currentRoom.roomMonsterGroups[0].monsterDescription + "  " +
                                                                    currentRoom.roomMonsterGroups[0].monsterName + " is here." 
        } else {
            var i;
            for (i=0; i<currentRoom.roomMonsterGroups.length; i++) {
                if (i === 0) {
                    if (currentRoom.roomMonsterGroups[i].groupList.length === 1) {
                        outputObject.content = outputObject.content + "There is ";
                    } else {
                        outputObject.content = outputObject.content + "There are ";
                    }
                }
                if (currentRoom.roomMonsterGroups[i].groupList.length === 1) {
                    outputObject.content = outputObject.content + "a " + currentRoom.roomMonsterGroups[i].monsterName;
                } else {
                    outputObject.content = outputObject.content + utils.toWords(currentRoom.roomMonsterGroups[i].groupList.length) + " " +
                                            currentRoom.roomMonsterGroups[i].monsterPlural;
                }
                if (currentRoom.roomMonsterGroups.length>2) {
                    if (i<(currentRoom.roomMonsterGroups.length - 2)) {
                        outputObject.content = outputObject.content + ", "; 
                    } else {
                        if (i === (currentRoom.roomMonsterGroups.length - 2)) {
                            outputObject.content = outputObject.content + " and " ;
                        } else {
                            outputObject.content = outputObject.content + " "; 
                        }
                    }
                } else {
                    if ((currentRoom.roomMonsterGroups.length>1) && (i === 0)) {
                        outputObject.content = outputObject.content + " and " ;
                    } else {
                        outputObject.content = outputObject.content + " " ;
                    }
                }
                
            }
            outputObject.content = outputObject.content + "in the room."
        }
        /*if (metaData.DEBUG === true) {
            var j;
            
        }*/
    } else {
        outputObject.title = "Get your shop on";  
    
        outputObject.content = "You are at the Quartermaster's." 

    }
    
    return outputObject;
}

function makeBackFromPurchaseCard (inputObject) {
    
    var outputObject = {};
    var updatedURL;

    outputObject.title = "You bought a thing";  

    outputObject.content = "You can buy more stuff or go to the inn." 
                                                                            
    updatedURL = utils.getS3PreSignedUrl('Media/108pxSquoval.jpg');

    outputObject.smallUrl = updatedURL;
    
    outputObject.largeUrl = updatedURL;

    return outputObject;
}

function makeFightCard (inputObject) {
    
    // for now debug info about the fight mechanics is presented on this card
    // the roll score and damge stuff is included in the combat result via the indiviudal attack functions
    // this stuff should be removed eventually
    
    var outputObject = {};
    
     if (inputObject.nobodyLeftToFightHere === true) {
        outputObject.content = "There is nobody left to fight here. ";
        outputObject.title = "Settle down Francis. " ; 
        return outputObject
    }
    
    if (inputObject.nobodyToFightHere === true) {
        outputObject.content = "There is nobody to fight here. ";
        outputObject.title = "Settle down Francis. " ; 
        return outputObject
    }
    
    if (inputObject.theyWantToFightTheNPC === true) {
        outputObject.content = "Are you sure you want to fight " + inputObject.NPCsname + "? ";
        outputObject.title = "Like extra sure? " ; 
        return outputObject
    }
    
    if (inputObject.theyDontWantToFightTheNPC === true) {
        outputObject.content = "That's a good choice. I hear that fighting friendly folks in the dungeon can lead to bad luck.";
        outputObject.title = "Good Choice "; 
        return outputObject
    }
    
    outputObject.title = "You're fighting now";  
    
    if (inputObject.monsterSpecified === true) {
        outputObject.content = "There is no " + inputObject.monsterName + " to fight here.";
        return outputObject
    }
    
    if (inputObject.monsterUnknown === true) {
        outputObject.content = "I don't know of any monsters called " + inputObject.monsterName + ".";
        return outputObject
    }
    
    if (inputObject.abilitySpecified) {
        if (inputObject.abilitySpecified === 'unknown') {// they named an ability that we haven't heard of
            outputObject.content ="I don't know the ability " + inputObject.abilityName;
        } else {
            if (inputObject.abilitySpecified === 'non-combat') {// they named a non=combat ability
                outputObject.content = inputObject.abilityName + " is not a fighting ability";
            } else {
                if (inputObject.whoHasTheAbility === 'nobody') {// they named an ability that nobdy has yet
                    outputObject.content = "Nobody in your party has the " + inputObject.abilityName + " ability yet.";
                } else {// they named an ability that somebody has but it's not their turn to fight
                    outputObject.content = inputObject.whoHasTheAbility + " has that ability but it is not " + inputObject.hisHer + " turn to fight. ";
                }
            }
        }
        return outputObject
    }
    
    outputObject.content = "";
    
    var updatedURL;
    var attackStatus = inputObject.attackStatus;
    var i;

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
                outputObject.content = outputObject.content + thisAttack.characterName + " attacks " + thisAttack.monsterName + " and "
            } else {
                if (thisAttack.monsterNumber>1) {
                    outputObject.content = outputObject.content + thisAttack.characterName + " attacks " +
                                                                        utils.toWords(thisAttack.monsterNumber) + " " + thisAttack.monsterPlural + " and "
                } else {
                    outputObject.content = outputObject.content + thisAttack.characterName + " attacks the " +
                                                                        thisAttack.monsterName + " and "
                }   
            }
            
            if (thisAttack.resultType === 'hit') {
                if (monsterPronouns) {
                    outputObject.content = outputObject.content + "hits " + monsterPronouns.himHer +  " . "    
                } else {
                    if (thisAttack.monsterNumber>1) {
                        outputObject.content = outputObject.content + "hits them. "
                    } else {
                       outputObject.content = outputObject.content + "hits it."
                    }
                }
                // debug stuff to go away
                if (rollingDebug === true) {
                    outputObject.content = outputObject.content + "\n" + "The last " + thisAttack.monsterName + " now has health of " + thisAttack.targetHealth
                }
            } else {
                if (thisAttack.resultType === 'killed') { // this will need to be modified when we sort out multiple kills
                    if (monsterPronouns) {
                        outputObject.content = outputObject.content +  "kills " + monsterPronouns.himHer + "."
                    } else {
                        if (thisAttack.monsterNumber === 1) {
                            outputObject.content = outputObject.content +  "kills the last one."
                        } else {
                            outputObject.content = outputObject.content +  "kills one." 
                        }
                    }
                } else { // ya missed
                   outputObject.content = outputObject.content + "misses."
                }
            }
            // this is the debug stuff that should go away
            if (rollingDebug === true) {
                outputObject.content = outputObject.content + "\n" + thisAttack.characterName + " had an attack roll of " + thisAttack.attackRoll +
                                    " against a defense level of " + thisAttack.defendLevel
            }
            
        } else { // it's a monster attack
            if (thisAttack.monsterNumber>1) {
                outputObject.content = outputObject.content +  "The " +
                                                                    utils.toWords(thisAttack.monsterNumber)+ " " + thisAttack.monsterPlural +
                                                                    " attack " + thisAttack.characterName + " and "
                if (thisAttack.resultType === 'hit') {
                    outputObject.content = outputObject.content +  "hit " + characterPronouns.himHer
                    // more debug stuff to go away
                    if (rollingDebug === true) {
                        outputObject.content = outputObject.content + "\n" + thisAttack.characterName + " now has health of " + thisAttack.targetHealth
                    }
                } else {
                     if (thisAttack.resultType === 'killed') {
                        outputObject.content = outputObject.content +  thisAttack.characterName + " disappears."
                    } else { // ya missed
                        outputObject.content = outputObject.content +  "miss " + characterPronouns.himHer
                    }
                }
            } else {
                if (monsterPronouns) {
                   outputObject.content = outputObject.content + thisAttack.monsterName +
                                            " attacks " + thisAttack.characterName + " and " 
                } else {
                    outputObject.content = outputObject.content +  "The " + thisAttack.monsterName +
                                            " attacks " + thisAttack.characterName + " and "
                }
                if (thisAttack.resultType === 'hit') {
                   outputObject.content = outputObject.content +  "hits " + characterPronouns.himHer
                   // more debug stuff to go away
                    if (rollingDebug === true) {
                        outputObject.content = outputObject.content + "\n" + thisAttack.characterName + " now has health of " + thisAttack.targetHealth
                    }
                } else {
                    if (thisAttack.resultType === 'killed') {
                        outputObject.content = outputObject.content +  thisAttack.characterName + " disappears."
                    } else { // ya missed
                        outputObject.content = outputObject.content +  "misses " + characterPronouns.himHer
                    }
                }
            }  
            // this is the debug stuff that should go away
            if (rollingDebug === true) {
                outputObject.content = outputObject.content + "\n The monster had an attack roll of " + thisAttack.attackRoll +
                                    " against a defense level of " + thisAttack.defendLevel
            }
        }
        
       outputObject.content = outputObject.content + "\n" 
        
    }
    
    if (inputObject.nextToAct === 'party wiped out') {
        outputObject.content = outputObject.content + "Your party was wiped out and magically transported back to the Inn."    
        outputObject.title = "Back to the Inn!"
    }
    
    updatedURL = utils.getS3PreSignedUrl('Media/108pxSquoval.jpg');

    outputObject.smallUrl = updatedURL;
    
    outputObject.largeUrl = updatedURL;

    return outputObject;
}

function makeHelpCard (inputObject) {
    // I decided to not implement this sep 18 by dumping it from the outputbuilder and index files
    var outputObject = {};
    var updatedURL;
    
    if (inputObject.helpType === 'topic') {
        switch (inputObject.helpTopic) {
            case 'armor':
                outputObject.title  = "Armor Help";
                break;
            case 'weapons':
                outputObject.title  = "Weapons Help";
                break;
            default:
                outputObject.title  = "Other Stuff";
        }
    } else {
        outputObject.title  = "Help";
    }
    
    outputObject.content = inputObject.helpText;
   
    updatedURL = utils.getS3PreSignedUrl('Media/108pxSquoval.jpg');

    outputObject.smallUrl = updatedURL;
    
    outputObject.largeUrl = updatedURL;

    return outputObject;
}

function makeStatusCard (inputObject) {
    
    var outputObject = {};
    var updatedURL;
    
    if (inputObject.hasNoParty === true) {
        outputObject.title  = "No party yet";
    } else {
         switch (inputObject.statusType) {
            case 'general':
                outputObject.title  = "Party status";
                break;
            case 'character':
                outputObject.title  = "Character status";
                break;
            case 'topic':
                outputObject.title  = inputObject.topic + " status";
                break;
            default:
                outputObject.title  = "Who knows what this is";
        }
    }
    
    outputObject.content = inputObject.cardText;

    updatedURL = utils.getS3PreSignedUrl('Media/108pxSquoval.jpg');

    outputObject.smallUrl = updatedURL;
    
    outputObject.largeUrl = updatedURL;

    return outputObject;
}

exports.makeIntroCard = makeIntroCard;
exports.makeInnCard = makeInnCard;
exports.makeHelpCard = makeHelpCard;
exports.makeStatusCard = makeStatusCard;
exports.makeDungeonCard = makeDungeonCard;
exports.makeFightCard = makeFightCard;
exports.makeBackFromPurchaseCard = makeBackFromPurchaseCard;
