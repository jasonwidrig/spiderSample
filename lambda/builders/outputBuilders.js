//const fightUtils = require('../utilities/fightUtils.js');
const speechBuilders = require('./speechBuilders.js')
const APLBuilders = require('./APLBuilders.js')
const cardBuilders = require('./cardBuilders.js')

function makeStatusResponse(inputObject) {
    var outputObject = {};
    
    outputObject = speechBuilders.makeStatusSpeech(inputObject);
    
    if (inputObject.statusType === 'general'){
        inputObject.speechListOrder = outputObject.speechListOrder
    }

    inputObject.cardText = outputObject.cardText;
    
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeStatusAPL(inputObject);
    }
    outputObject.cardObject = cardBuilders.makeStatusCard(inputObject);

    return outputObject
}


function makeQuartermasterResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeQuartermasterSpeech(inputObject);
    
    /*
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeTalkAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeTalkCard(inputObject);
    */
    
    return outputObject
}

function makeBriberyResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeBriberySpeech(inputObject);
    
    /*
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeTalkAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeTalkCard(inputObject);
    */
    
    return outputObject
}

function makeHeroOnlyResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeHeroOnlySpeech(inputObject);
    
    /*
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeTalkAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeTalkCard(inputObject);
    */
    
    return outputObject
}

function makeTalkResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeTalkSpeech(inputObject);
    
    /*
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeTalkAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeTalkCard(inputObject);
    */
    
    return outputObject
}

function makeSwitchWeaponResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeSwitchWeaponSpeech(inputObject);
    
    return outputObject
}

function makeExamineRoomResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeExamineRoomSpeech(inputObject);
    
    /*
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeExamineRoomAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeExamineRoomCard(inputObject);
    */
    
    return outputObject
}

function makeBackFromPurchaseResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeBackFromPurchaseSpeech(inputObject);
    
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeBackFromPurchaseAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeBackFromPurchaseCard(inputObject);

    return outputObject
}

function makeIntroResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeIntroSpeech(inputObject);
    
    
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeIntroAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeIntroCard(inputObject);

    return outputObject
}


function makeHelpResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeHelpSpeech(inputObject);
    
    /* I decided to not implement this part sep 18 
    inputObject.helpText = outputObject.speechObject.text;
    
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeHelpAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeHelpCard(inputObject); */

    return outputObject
}

function makeFightResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeFightSpeech(inputObject);
    
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeFightAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeFightCard(inputObject);
    
    return outputObject
}

function makeDungeonResponse(inputObject) {
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeDungeonSpeech(inputObject);
    
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeDungeonAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeDungeonCard(inputObject);
    
    return outputObject
}

function makeInnResponse(inputObject) {
    
    var outputObject = {};
    
    outputObject.speechObject = speechBuilders.makeInnSpeech(inputObject)
    
    if (inputObject.supportsAPL) {
        outputObject.APLObject = APLBuilders.makeInnAPL(inputObject);
    }
    
    outputObject.cardObject = cardBuilders.makeInnCard(inputObject);
    
    return outputObject
}

function makePurchaseResponse(inputObject) {
    var outputObject = {};
   
    outputObject.speechObject = speechBuilders.makePurchaseSpeech(inputObject);
    
    return outputObject
}


exports.makeQuartermasterResponse = makeQuartermasterResponse;
exports.makeHeroOnlyResponse = makeHeroOnlyResponse;
exports.makeBriberyResponse = makeBriberyResponse;
exports.makeSwitchWeaponResponse = makeSwitchWeaponResponse;
exports.makeExamineRoomResponse = makeExamineRoomResponse;
exports.makeIntroResponse = makeIntroResponse;
exports.makeInnResponse = makeInnResponse;
exports.makeHelpResponse = makeHelpResponse;
exports.makeStatusResponse = makeStatusResponse;
exports.makeDungeonResponse = makeDungeonResponse;
exports.makeFightResponse = makeFightResponse;
exports.makePurchaseResponse = makePurchaseResponse;
exports.makeTalkResponse = makeTalkResponse;
exports.makeBackFromPurchaseResponse = makeBackFromPurchaseResponse;
