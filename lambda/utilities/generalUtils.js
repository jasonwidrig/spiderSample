const charactersData = require('../dataFiles/charactersData.js').charactersData;

const metaData = require('../dataFiles/metaData.js').metaData;

const AWS = require('aws-sdk');

const toWords = require('number-to-words').toWords;

const s3SigV4Client = new AWS.S3({
    signatureVersion: 'v4'
});

function isOneForSale(inputObject) {
    // returns "not for sale" if the requested item is not for sale
    // otherwise returns the array index of the requested item
    
    var requestedItemType = inputObject.requestedItemType;
    var requestedItemName = inputObject.requestedItemName;
    var itemsForSale = inputObject.itemsForSale;
    
    var outputObject = 'not for sale';
    
    if (inputObject.requestedItemType === 'weapon') {
        for (var counter = 0; counter<itemsForSale.length; counter++) {
            if ((itemsForSale[counter].item.type === requestedItemName) && (itemsForSale[counter].itemPrice > 0)) {
                outputObject = counter;
                return outputObject
            }
        }
    }
    
    return outputObject;
}

function canTheyAffordIt(inputObject) {
    var outputObject;
    var priceOfThing;
    var cashOnHand;
    
    //priceOfThing = inputObject.inventoryItem.price;
    //cashOnHand = inputObject.party.partyGold;
    //outputObject = (cashOnHand >= priceOfThing);
    
    // if inputobject.
    
    outputObject === true;
    
    return outputObject
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function keyGenerator(requestEnvelope) {
    if (requestEnvelope
        && requestEnvelope.context
        && requestEnvelope.context.System
        && requestEnvelope.context.System.user
        && requestEnvelope.context.System.user.userId) {
            
        return requestEnvelope.context.System.user.userId; 
    }
    throw 'Cannot retrieve user id from request envelope!';
}

function getCharacterFromListByNameOrType(partyList) {
    
   var character = {};
   var i;
   
    if (partyList.heroName) {
        // get it by heroName
        for (i=0; i<partyList.partyList.length; i++) {
            if (partyList.partyList[i].characterName === partyList.heroName) {
                character = partyList.partyList[i];
                i = partyList.partyList.length;
            }
        }
        if (!character.characterName) {
            character.characterNotInPartyName = partyList.heroName
        }
    } else {
        // get it by heroType
        for (i=0; i<partyList.partyList.length; i++) {
            if (partyList.partyList[i].characterType === partyList.heroType) {
                character = partyList.partyList[i];
                i = partyList.partyList.length;
            }
        }
        if (!character.characterName) {
            character.characterNotInPartyName = partyList.heroType
        }
    }
    
    return character
    
    
}

function makeRandomList(inputListSize, outputListSize) {
    
    // this function picks outputListSize non repeating numbers from 0 to inputListSize - 1
    // and outputs them in an array 
    
    var i;
    
    var randomI;
    
    var randomList = [];
    
    if (outputListSize>inputListSize) { //something weird is happening
    
        randomList[0] = 0;
        
    } else {
    
        for (i=0; i<outputListSize; i++) {
            
            do {
                randomI = Math.floor(Math.random() * inputListSize);
            } while (randomList.indexOf(randomI)>-1);
            
            randomList.push(randomI);
            
        }
    }
    
    return randomList;
    
}

function makeRandomListIndex(inputList) {
    
    // this function picks a random index from a list
    
    var randomI;
    
    randomI = Math.floor(Math.random() * inputList.length);
   
    return randomI;
    
}

function makeRandomListWithRepeats(inputListSize, outputListSize) {
    
    // this function picks outputListSize numbers from 0 to inputListSize - 1
    // and outputs them in an array 
    
    var i;
    
    var randomI;
    
    var randomList = [];
    
    for (i=0; i<outputListSize; i++) {
        
        randomI = Math.floor(Math.random() * inputListSize);

        randomList.push(randomI);
        
    }
    
    return randomList;
    
}

function makeSynonym(sourceWord) {
    
    var returnedWord;
    var targetList = [];
    
    switch (sourceWord) {
        case 'wields':
            targetList = metaData.WIELDINGWORDS;
            break;
        case 'defeated':
            targetList = metaData.DEFEATEDWORDS;
            break;
        default:
            targetList = ["something"]
    }
    
    returnedWord = targetList[makeRandomListIndex(targetList)];
    
    return returnedWord
}

function makeHealthWords(character) {
    
    console.log('in make health words and character is ',character)
    
    var returnedWords;
    
    var healthRatio = (character.currentHealth/character.baseHealth);
    
    if (healthRatio === 1) {
        returnedWords = "is at full health"
    } else {
        if (healthRatio > .75) {
            returnedWords = "is in good shape"
        } else {
            if (healthRatio > .5) {
                returnedWords = "is wounded"
            } else {
                if (healthRatio > .25) {
                    returnedWords = "is badly wounded"
                } else {
                    if (healthRatio > .10) {
                        returnedWords = "is in critical condition"
                    } else {
                        if (healthRatio > 0) {
                            returnedWords = "is at death's door"
                        } else {
                            returnedWords = "has been killed"
                        }
                    }
                }
            }    
        }
    }
    
    return returnedWords
    
}



function getS3PreSignedUrl(s3ObjectKey) {

    const bucketName = 'spidertemplepersistence'; 
    const s3PreSignedUrl = s3SigV4Client.getSignedUrl('getObject', {
        Bucket: bucketName,
        Key: s3ObjectKey,
       // Expires: 60*1 // the Expires is capped for 1 minute
    });
    return s3PreSignedUrl;

}

function supportsAPL(handlerInput) {
  const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
  const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
  return (aplInterface !== null) && (aplInterface !== undefined);
}

function getWeaponStatus (inputObject) {
    //input object is character.equipment.weapons
    var outputObject = []
    
    if (inputObject.oneHand) outputObject.push({slotName: 'a one-handed weapon', slotWeapon:inputObject.oneHand})
    if (inputObject.twoHand) outputObject.push({slotName: 'a two-handed weapon', slotWeapon:inputObject.twoHand})
    if (inputObject.ranged) outputObject.push({slotName: 'a ranged weapon', slotWeapon:inputObject.ranged})
    if (inputObject.dual) outputObject.push({slotName: 'dual handed weapons', slotWeapon:inputObject.dual})
    if (inputObject.dagger) outputObject.push({slotName: 'a dagger', slotWeapon:inputObject.dagger})
    if (inputObject.staff) outputObject.push({slotName: 'a staff', slotWeapon:inputObject.staff})
    if (inputObject.wand) outputObject.push({slotName: 'a wand', slotWeapon:inputObject.wand})
    
    return outputObject
}

function getArmorStatus (inputObject) {
    //input object is character.equipment.armor
    var outputObject = []
    
    if (inputObject.helm) outputObject.push({slotName: 'a helm', slotArmor:inputObject.helm})
    if (inputObject.armor) outputObject.push({slotName: 'body armor', slotArmor:inputObject.armor})
    if (inputObject.shield) outputObject.push({slotName: 'a shield', slotArmor:inputObject.shield})
    if (inputObject.cloak) outputObject.push({slotName: 'a cloak', slotArmor:inputObject.cloak})
    if (inputObject.hat) outputObject.push({slotName: 'a hat', slotArmor:inputObject.hat})
    if (inputObject.robe) outputObject.push({slotName: 'a robe', slotArmor:inputObject.robe})

    return outputObject
}

function getOtherEquipmentStatus (inputObject) {
    //input object is character.equipment.otherEquipment
    var outputObject = []
    
    if (inputObject.potion) outputObject.push({slotName: 'potion', slotWeapon:inputObject.potion})
    if (inputObject.poisonVials) outputObject.push({slotName: 'poison vials', slotWeapon:inputObject.poisonVials})
    if (inputObject.scrolls) outputObject.push({slotName: 'scrolls', slotWeapon:inputObject.scrolls})
    if (inputObject.holyWater) outputObject.push({slotName: 'holy water', slotWeapon:inputObject.holyWater})

    return outputObject

}

exports.getWeaponStatus = getWeaponStatus;
exports.getArmorStatus = getArmorStatus;
exports.getOtherEquipmentStatus = getOtherEquipmentStatus;

exports.makeRandomList = makeRandomList;
exports.makeRandomListIndex = makeRandomListIndex;
exports.makeRandomListWithRepeats = makeRandomListWithRepeats;
exports.getCharacterFromListByNameOrType = getCharacterFromListByNameOrType;
exports.makeHealthWords = makeHealthWords;
exports.makeSynonym = makeSynonym;
exports.toWords = toWords;

exports.supportsAPL = supportsAPL;
exports.getS3PreSignedUrl = getS3PreSignedUrl;
exports.keyGenerator = keyGenerator;
exports.isEmpty = isEmpty;
exports.canTheyAffordIt = canTheyAffordIt;
exports.isOneForSale = isOneForSale;
