const metaData = require('../dataFiles/metaData.js').metaData;
const roomData = require('../dataFiles/roomData.js').roomData;
const quarterMasterItems = require('../dataFiles/weaponsData.js').weapons;
const monstersData = require('../dataFiles/monstersData.js').allMonstersData;
const utils = require('./generalUtils.js');

// main function

function makeADungeonLevel (inputObject) {
    var roomMonstersList = [];
    var roomMonsterGroups = [];
    var roomObject = {roomPartsObject:{}, randomNoDupesObject:{}, roomNumber:0};
    var roomIndex;
    var roomPartIndex;
    var roomAdjectivesObject;
    var roomMonstersObject;
    var roomGold;
    var outputObject = {dungeonObject:[],updatedNPCList:{}};
    var monsterID = 0;
    var dungeonLevel = inputObject.dungeonLevel;
    var previousNPCList = inputObject.NPCList;

    roomObject.roomPartsObject = getRoomDataAvailableForLevel(dungeonLevel);

    for (roomPartIndex in roomObject.roomPartsObject) {
        roomObject.randomNoDupesObject[roomPartIndex] = {randomIndexList:utils.makeRandomList(roomObject.roomPartsObject[roomPartIndex].partsList.length,metaData.DUNGEONROOMSPERLEVEL)}
    }
    
    roomObject.roomNumber = 0;
    roomAdjectivesObject = makeRoomAdjectives(roomObject);
    // make the NPC
    var NPCResponseObject = makeOneNPC({NPCList:previousNPCList, monsterID:monsterID});
    outputObject.dungeonObject[0] = {roomAdjectives:roomAdjectivesObject, roomMonsterGroups:NPCResponseObject.monsterGroup};
    outputObject.updatedNPCList = NPCResponseObject.updatedNPCList;

    for (roomIndex=1; roomIndex<metaData.DUNGEONROOMSPERLEVEL; ++roomIndex) {
        roomObject.roomNumber = roomIndex;
        roomAdjectivesObject = makeRoomAdjectives(roomObject); 
        roomMonstersObject = makeRoomMonsters({roomIndex:roomIndex,monsterID:monsterID})
        monsterID = roomMonstersObject.updatedMonsterID;
        roomMonsterGroups = roomMonstersObject.roomMonstersList; 
        roomGold = Math.ceil(Math.random() * 50);
        outputObject.dungeonObject[roomIndex] = {roomAdjectives:roomAdjectivesObject, roomMonsterGroups:roomMonsterGroups, roomGold:roomGold}
    }
    
    outputObject.dungeonObject[metaData.DUNGEONROOMSPERLEVEL] = {itemsForSale:makeQuartermasterItems(dungeonLevel)}
    
    return outputObject
}

// helper functions

function makeQuartermasterItems (inputObject) {
    var outputObject = [];
    
    outputObject[0] = {item:quarterMasterItems.shinyBlades,itemPrice:20};
    outputObject[1] = {item:quarterMasterItems.shinyDagger,itemPrice:15};
    outputObject[2] = {item:quarterMasterItems.mightyHammer,itemPrice:17};
    outputObject[3] = {item:quarterMasterItems.magicColdWand,itemPrice:42};
    outputObject[4] = {item:quarterMasterItems.shinySword,itemPrice:12};
    
    return outputObject;
}

function makeRoomMonsters (inputObject) {
    var outputObject = {};
    var responseObject = {};
  
    var roomIndex = inputObject.roomIndex;
    var monsterID = inputObject.monsterID
    
    
    
    switch (roomIndex) {
        case 0:
            // this shouldn't happen anymore
            break;
        case 1:
            // sample vermin room
            responseObject = makeMonsterList({monsterType:'vermin', monsterID:monsterID, maxNumberOfGroups:3})
            break;
        case 2:
            // sample minions room
            responseObject = makeMonsterList({monsterType:'minion', monsterID:monsterID, maxNumberOfGroups:3})
            break;
        case 3:
            // sample monsters room
            var monsterTypeObjects = [{monsterType:'large', maxNumberOfGroups:3},
                                    {monsterType:'strong', maxNumberOfGroups:4},
                                    {monsterType:'massive', maxNumberOfGroups:2}]
            var whichTypeOfMonster = monsterTypeObjects[(Math.floor(Math.random() * monsterTypeObjects.length))]
            responseObject = makeMonsterList({monsterType:whichTypeOfMonster.monsterType, monsterID:monsterID, maxNumberOfGroups:whichTypeOfMonster.maxNumberOfGroups})
            break;
        case (metaData.DUNGEONROOMSPERLEVEL - 1):
            // final room/boss
            responseObject.monstersList = makeBoss({monsterID: monsterID}) 
            responseObject.updatedMonsterID = (monsterID + 1);
            break;
        case metaData.FINISHEDALLTHELEVELSROOM:
            // completed the game
            break;

        default:
            // default monster situation
            outputObject[0] = {monsterName: "Jimmy", monsterDescription:"Jimmish"} 
    }

    outputObject.roomMonstersList = responseObject.monstersList;
    outputObject.updatedMonsterID = responseObject.updatedMonsterID;

    return outputObject
}

function makeOneNPC(inputObject) {
    
    var outputObject = {monsterGroup:[{}],updatedNPCList:{}};
    
    var namesList = inputObject.NPCList.namesList;
    var descriptionsList = inputObject.NPCList.descriptionsList;
    var dungeonLevel = inputObject.dungeonLevel;
    var monsterID = inputObject.monsterID;
    
    var allNPCDescriptions = monstersData.NPCsData.monstersList.descriptions;
    var allNPCVoices;
    var allNPCNames;
    var gender;
    
    if (((Math.random() * 2) > 1)) {
        allNPCNames = monstersData.NPCsData.monstersList.boyNames;
        allNPCVoices = metaData.NPCBOYVOICES
        gender = 'boy'
    } else {
        allNPCNames = monstersData.NPCsData.monstersList.girlNames;
        allNPCVoices = metaData.NPCGIRLVOICES
        gender = 'girl'
    }
    
    var nameIndex = utils.makeRandomListIndex(allNPCNames);
    while (itIsAlreadyInTheList({word:allNPCNames[nameIndex], currentList:namesList})) {
        nameIndex = utils.makeRandomListIndex(allNPCNames)
    }
    namesList.push(allNPCNames[nameIndex]);
    
    var descriptionIndex = utils.makeRandomListIndex(allNPCDescriptions);
    while (itIsAlreadyInTheList({word:allNPCDescriptions[descriptionIndex],currentList:descriptionsList})) {
        descriptionIndex = utils.makeRandomListIndex(allNPCDescriptions)
    }
    descriptionsList.push(allNPCDescriptions[descriptionIndex]);

    var voiceIndex = utils.makeRandomListIndex(allNPCVoices);
   
    outputObject.monsterGroup[0].monsterName = allNPCNames[nameIndex];
    outputObject.monsterGroup[0].monsterDescription = allNPCDescriptions[descriptionIndex];
    outputObject.monsterGroup[0].monsterVoiceIndex = voiceIndex;
    outputObject.monsterGroup[0].gender = gender;
    outputObject.monsterGroup[0].NPCSpeechCounter = 0;
    outputObject.monsterGroup[0].groupType = 'NPC';
    outputObject.monsterGroup[0].monsterAttackLevel = 20;
    outputObject.monsterGroup[0].monsterDefendLevel = 20;
    outputObject.monsterGroup[0].monsterNumber = 1;
    outputObject.monsterGroup[0].groupList = [{monsterId:monsterID,health:80}]
    
    outputObject.updatedNPCList = {namesList:namesList, descriptionsList:descriptionsList};

    return outputObject
}

function itIsAlreadyInTheList (inputObject) {
    var word = inputObject.word;
    var currentList = inputObject.currentList;
    
    var i;
    
    for (i=0; i<currentList.length;i++) {
        if (currentList[i] === word) return true
    }
    
    return false
}

function makeBoss(inputObject) {
    
    var outputObject = [{}];
    
    var allBossesList = monstersData.bossesData.monstersList;

    var randomNameIndex = utils.makeRandomListIndex(allBossesList.names);
    var randomDescriptionIndex = utils.makeRandomListIndex(allBossesList.descriptions);
    
    var monsterID = inputObject.monsterID
    
    outputObject[0].monsterName = allBossesList.names[randomNameIndex]
    outputObject[0].monsterDescription = allBossesList.descriptions[randomDescriptionIndex]
    outputObject[0].gender = 'boy';
    outputObject[0].groupType = 'boss';
    outputObject[0].monsterAttackLevel = 5;
    outputObject[0].monsterDefendLevel = 5;
    outputObject[0].groupList = [{monsterID:monsterID, health:5}];

    return outputObject
    
}

function makeMonsterList(inputObject) {
    
    var outputObject = {};
    var monsterType = inputObject.monsterType;
    var monsterID = inputObject.monsterID;
    var maxNumberOfGroups = inputObject.maxNumberOfGroups
    var monsterList = [];
    
    var i;
    
    var randomTypesOfMonster = (Math.ceil(Math.random() * maxNumberOfGroups)); //set this to 1 to weaken monsters
    
    for (i=0; i<randomTypesOfMonster; i++) {
        var newGroupObject = makeOneMonsterGroup({monsterType:monsterType,monsterID:monsterID})
        while (newGroupInList({currentMonsterGroups:monsterList,newMonsterGroup:newGroupObject.monsterGroup})) {
            newGroupObject = makeOneMonsterGroup({monsterType:monsterType,monsterID:monsterID})    
        }
        monsterList[i] = newGroupObject.monsterGroup;
        monsterID = newGroupObject.updatedMonsterID;
    }
    
    outputObject.monstersList = monsterList;
    outputObject.updatedMonsterID = monsterID;

   return outputObject
    
}

function newGroupInList (inputObject) {
    var outputObject = false;
    var currentMonsterGroups = inputObject.currentMonsterGroups;
    var newMonsterGroup = inputObject.newMonsterGroup;
    
    var i; 
    
    for (i=0; i<currentMonsterGroups.length; i++) {
        if (currentMonsterGroups[i].monsterName === newMonsterGroup.monsterName) {
            return true    
        }
    }
    
    return outputObject
}

function makeOneMonsterGroup (inputObject) {
    // inputobject has the current monster ID number and monster type
    var i;
    var j;
    var monsterID = inputObject.monsterID;
    var monsterType = inputObject.monsterType;
    var monsterGroup = {};
    var outputObject = {monsterGroup:monsterGroup, updatedMonsterID:monsterID};
    
    var allMonstersArray = monstersData.monstersData.makeAllTypeArray(monsterType);
    
    var whichMonsterIndex = (Math.floor(Math.random() * allMonstersArray.length));
    
    var howManyInThisGroup = (Math.ceil(Math.random() * allMonstersArray[whichMonsterIndex].maxGroupSize));//set this to 1 to weaken monsters
    
    monsterGroup.groupType = monsterType;
    monsterGroup.monsterName = allMonstersArray[whichMonsterIndex].monsterName;
    monsterGroup.monsterPlural = allMonstersArray[whichMonsterIndex].monsterPlural;
    monsterGroup.monsterAttackLevel = allMonstersArray[whichMonsterIndex].monsterAttackLevel;
    monsterGroup.monsterDefendLevel = allMonstersArray[whichMonsterIndex].monsterDefendLevel;
    monsterGroup.groupList = [];
    
    for (i=0; i<howManyInThisGroup;i++) {
        var oneMonsterObject = {};
        monsterID++;
        oneMonsterObject.monsterID = monsterID;
        oneMonsterObject.health = allMonstersArray[whichMonsterIndex].baseHealth;
        if (allMonstersArray[whichMonsterIndex].numberOfHealthDice){
            for (j=0; j<allMonstersArray[whichMonsterIndex].numberOfHealthDice; j++) {
                oneMonsterObject.health = oneMonsterObject.health +  (Math.ceil(Math.random() * allMonstersArray[whichMonsterIndex].healthDiceSize))   
            }
        }
        if (allMonstersArray[whichMonsterIndex].baseXP){
            oneMonsterObject.XP = allMonstersArray[whichMonsterIndex].baseXP + (oneMonsterObject.health * allMonstersArray[whichMonsterIndex].XPMultiplier)
        } else {
            oneMonsterObject.XP = 2
        }
        
        monsterGroup.groupList[i] = oneMonsterObject;
    }
    
    outputObject.monsterGroup = monsterGroup;
    outputObject.updatedMonsterID = monsterID;
    
    return outputObject
}

function makeRoomAdjectives (inputObject) {
    var outputObject = {};
    
    var roomPartIndex;
    var randomIndex;
    
    for (roomPartIndex in inputObject.roomPartsObject) {
       randomIndex = inputObject.randomNoDupesObject[roomPartIndex].randomIndexList[inputObject.roomNumber]
       outputObject[roomPartIndex] = inputObject.roomPartsObject[roomPartIndex].partsList[randomIndex]
    } 
    
    return outputObject
}

function getRoomDataAvailableForLevel (inputObject) {
    
    var outputObject = {} 

    var i;
    var j;
    var k;
    
    for (i in roomData) {
        k = 0;
        outputObject[i] = {partsList:[]}
        for (j=0; j<roomData[i].partsList.length; j++) {
            if(roomData[i].partsList[j].minLevel <= inputObject) {
                outputObject[i].partsList[k] = roomData[i].partsList[j].partName
                k = (k+1);
            }    
        }
    }
    
    return outputObject
}

exports.makeADungeonLevel = makeADungeonLevel;