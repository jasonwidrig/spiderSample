const Alexa = require('ask-sdk-core');
const persistenceAdapter = require('ask-sdk-s3-persistence-adapter');

const outputBuilders = require('./builders/outputBuilders');

const utils = require('./utilities/generalUtils.js');
const characterUtils = require('./utilities/characterUtils.js');
const dungeonUtils = require('./utilities/dungeonUtils.js');
const fightUtils = require('./utilities/fightUtils.js');

const metaData = require('./dataFiles/metaData.js').metaData;
const monstersData = require('./dataFiles/monstersData.js').allMonstersData.monstersData
const levelUpData = require('./dataFiles/abilitiesData.js').levelUpData

var s3Attributes = {};
var sessionAttributes = {};

const StatusIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StatusIntent';
    },
    async handle(handlerInput) {
        
        var statusSlots = handlerInput.requestEnvelope.request.intent.slots;
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL, backgroundImageUrl: sessionAttributes.APLbackgroundImageUrl };
        
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
            // set the attributes stuff
            
            if (sessionAttributes.previousIntent !== 'status') {
                sessionAttributes.previousIntent = sessionAttributes.currentIntent;
            }
            sessionAttributes.currentIntent = 'status';
            
            // set the input object stuff
    
            if (s3Attributes.party) { //they have a party to talk about
            console.log('in status intent handler and s3Attributes combat object is ',s3Attributes.combatObject)
            console.log('in status intent handler and sessionAttributes incombat  is ',sessionAttributes.inCombat)
                inputObject.hasNoParty = false;
                if (statusSlots.heroSlot.value || statusSlots.nameSlot.value) { // they want to know about someone specific
                    var partyList = {partyList: s3Attributes.party.partyList};
                    if (statusSlots.nameSlot.value) {
                        if (statusSlots.nameSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                            partyList.heroName = statusSlots.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                        } else {
                            partyList.heroName = statusSlots.nameSlot.value
                        }
                    } else {
                        if (statusSlots.heroSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                            partyList.heroType = statusSlots.heroSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                        } else {
                            partyList.heroName = statusSlots.heroSlot.value
                        }
                    }
                    inputObject.character = utils.getCharacterFromListByNameOrType(partyList);
                    inputObject.statusType = 'character';
                    inputObject.slotInfo = statusSlots;
                } else { // they didn't mention someone specific
                    inputObject.partyList = s3Attributes.party.partyList
                    if (statusSlots.topicSlot.value) {
                        inputObject.statusType = 'topic only';
                        inputObject.slotInfo = statusSlots;
                    } else {
                        inputObject.statusType = 'general';
                    }
                }
            } else {
                inputObject.hasNoParty = true;  
            }
           
            // get response object
    
            var responseObject = outputBuilders.makeStatusResponse(inputObject);
            
            // clean up after response
            
            if (inputObject.statusType === 'topic only') {
                sessionAttributes.heroOnly = 'whose status are you asking about'
                sessionAttributes.statusSlotInfo = statusSlots;
            }

            sessionAttributes.lastSpeech = responseObject.speechObject.text;
            
            attributesManager.setSessionAttributes(sessionAttributes);
        }
        
        
        // push out response

        if (sessionAttributes.supportsAPL) {
            handlerInput.responseBuilder
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: responseObject.APLObject.document,
                datasources: responseObject.APLObject.datasources
            })
        }

        return handlerInput.responseBuilder
            .speak(responseObject.speechObject.text)
            .reprompt(responseObject.speechObject.reprompt)
            .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
            //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content  )
            .getResponse();
    }
};

const HeroOnlyIntentHandler = {
    // this one doesn't havecard or APL stuff
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'HeroOnlyIntent') ;
    },
    async handle(handlerInput) {
        
        var heroOnlySlots = handlerInput.requestEnvelope.request.intent.slots;

        var responseObject = {};
        var inputObject = {};
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
            
            // set attributes
            
             if (sessionAttributes.previousIntent !== 'hero only') {
                sessionAttributes.previousIntent = sessionAttributes.currentIntent;
            }
            sessionAttributes.currentIntent = 'hero only';
            
               // set input object
               
            var whatTheySaid;
            var whoTheyMeant;
            
            var heroType;
            var heroName;
            
            switch (sessionAttributes.heroOnly) {
                
                case 'whose weapon switch': 
                
                    // generate response object
                    
                    inputObject = figureOutWhoToSwitchTo(heroOnlySlots);
                    
                    if (getTypeFromName(inputObject.whoseWeaponSwitch) !== "not in party") { // they have spec'd a real name with more than one weapon
                        inputObject.weaponToSwitchTo = getWeaponToSwitchTo(inputObject.equipment)  
                        for (var slotName in inputObject.equipment.weapons) {
                            if (slotName === "twoHand") { 
                                if (inputObject.weaponToSwitchTo === inputObject.equipment.weapons[slotName]) { // we are switching to a two handed weapon
                                    if (utils.isEmpty(inputObject.equipment.currentShield) === false) inputObject.shield = "unequip"
                                } else {
                                    if (inputObject.equipment.currentWeapon === inputObject.equipment.weapons[slotName]) { // we are switching from a two handed weapon
                                        if (utils.isEmpty(inputObject.equipment.armor.shield) === false) inputObject.shield = "equip"    
                                    }
                                }
                            }
                        }
                    }
                    
                    responseObject = outputBuilders.makeSwitchWeaponResponse(inputObject);
                    
                    if (getTypeFromName(inputObject.whoseWeaponSwitch) !== 'not in party') { // this is a legit completed switch
                        // switch the weapon in the persistent object
                        for (var counter = 0; counter<s3Attributes.party.partyList.length; counter++){
                            if (s3Attributes.party.partyList[counter].characterName === inputObject.whoseWeaponSwitch) {
                                s3Attributes.party.partyList[counter].equipment.currentWeapon = inputObject.weaponToSwitchTo;
                                if (inputObject.shield) {
                                    if (inputObject.shield === 'equip') {
                                        s3Attributes.party.partyList[counter].equipment.currentShield = s3Attributes.party.partyList[counter].equipment.armor.shield    
                                    } else {
                                        s3Attributes.party.partyList[counter].equipment.currentShield = {}
               
                                    }
                                }
                                counter = s3Attributes.party.partyList.length;
                            }
                        }
                    } else {
                        if (inputObject.whoseWeaponSwitch === 'whose weapons do you want to switch') {
                            sessionAttributes.heroOnly = 'whose weapon switch';
                        } else {
                            sessionAttributes.heroOnly = '';
                        }
                    }
                    
                    break;
                    
                case 'who gets the new thing': 
                
                    // generate response object
                    
                    whoTheyMeant = 'not in the party';
                    
                    if (heroOnlySlots.heroSlot.resolutions) { // they specified a type
                        whatTheySaid = heroOnlySlots.heroSlot.value;
                        if (inputObject.heroSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                            whoTheyMeant = getNameFromType(heroOnlySlots.heroSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name)
                        } 
                    } else { // they specified a name
                        whatTheySaid = heroOnlySlots.nameSlot.value;
                        if (heroOnlySlots.nameSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                            whoTheyMeant = heroOnlySlots.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name
                        } 
                    }
                    
                    if (sessionAttributes.newThing.choices.search(whoTheyMeant) !== -1) {
                        // they made a valid choice
                        inputObject.type =  'affordable';   
                        inputObject.name = sessionAttributes.newThing.thing.name
                        inputObject.replacement = figureOutIfWeHaveToReplaceAThing({whoGetsIt:whoTheyMeant, thing:sessionAttributes.newThing.thing, type:sessionAttributes.newThing.type});
                        inputObject.decision = {whoGetsIt: whoTheyMeant};
                    } else {
                        // they picked a wrong party member
                        inputObject.type = 'not a valid choice';
                        inputObject.whatTheySaid = whatTheySaid;
                    }
    
                    responseObject = outputBuilders.makePurchaseResponse(inputObject);
                    
                    sessionAttributes.newThing = {};
                    
                    sessionAttributes.heroOnly = '';
                    
                    break;
                    
                case 'whose status are you asking about': 
                
                    // generate response object
                    
                    whoTheyMeant = 'not in the party';
                    
                    if (heroOnlySlots.heroSlot.resolutions) { // they specified a type
                        whatTheySaid = heroOnlySlots.heroSlot.value;
                        if (inputObject.heroSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                            whoTheyMeant = getNameFromType(heroOnlySlots.heroSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name)
                        } 
                    } else { // they specified a name
                        whatTheySaid = heroOnlySlots.nameSlot.value;
                        if (heroOnlySlots.nameSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                            whoTheyMeant = heroOnlySlots.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name
                        } 
                    }
                    
                    if (whoTheyMeant === 'not in the party') {
                        // they made a valid choice
                    } else {
                        // they picked a wrong party member
                    }
    
                    responseObject = outputBuilders.makeStatusResponse(inputObject);
                    
                    sessionAttributes.heroOnly = '';
                    
                    break;
                    
                default:

                    if (heroOnlySlots.nameSlot.resolutions) {
                        if (heroOnlySlots.nameSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH"){
                            inputObject.heroType = getTypeFromName(heroOnlySlots.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name);
                            inputObject.heroName = heroOnlySlots.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                        } else {
                            inputObject.heroType = "not in party";
                            inputObject.heroName = heroOnlySlots.nameSlot.value;
                        }
                    } else {
                        if (heroOnlySlots.heroSlot.resolutions) {
                            if (heroOnlySlots.heroSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH"){
                                inputObject.heroName = getNameFromType(heroOnlySlots.heroSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name)
                                inputObject.heroType = heroOnlySlots.heroSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name
                            } else {
                                inputObject.heroName = "not in party";
                                inputObject.heroType = heroOnlySlots.heroSlot.value;
                            }
                        } else {
                            inputObject.heroName = "not in party";
                            inputObject.heroType = "not in party";
                        }
                    }   
                    
                    responseObject = outputBuilders.makeHeroOnlyResponse(inputObject)
                    
                    sessionAttributes.heroOnly = '';
    
            }
            
            attributesManager.setSessionAttributes(sessionAttributes);
    
            attributesManager.setPersistentAttributes(s3Attributes);

        }

         return handlerInput.responseBuilder
                    .speak(responseObject.speechObject.text)
                    .reprompt(responseObject.speechObject.reprompt)
                    .getResponse();

    }
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        var inputObject = {};
        var responseObject = {};

        s3Attributes = await attributesManager.getPersistentAttributes() || {};
        
        // set the s3 stuff
        
        if (utils.isEmpty(s3Attributes)) {
            // it's the first time this user has been here so let's set some hooks and zeroes
            s3Attributes = fillEmptyS3Object();
        }
        
        //responseObject =  setValuesAtLaunch(handlerInput);
        

        s3Attributes.beenToIntroCounter =  (s3Attributes.beenToIntroCounter + 1);

        if (s3Attributes.beenToInnCounter > 0) {
            s3Attributes.currentRoom = 'inn';    
            s3Attributes.beenToInnCounter =  (s3Attributes.beenToInnCounter + 1);
        } 
        
        // set the session stuff
        
        sessionAttributes = initializeSessionAttributes(handlerInput);

        // set the input object stuff to go to the outputbuilder
        
        if (s3Attributes.beenToInnCounter > 0) {
            inputObject = fillInputObjectBeforeGoingToInn();
        } else {
            inputObject.supportsAPL = sessionAttributes.supportsAPL;
        }

        inputObject.beenToInnCounter = s3Attributes.beenToInnCounter;
        inputObject.beenToIntroCounter = s3Attributes.beenToIntroCounter;
        
        // generate response object 
        
        console.log('in launch handler and input object is ', inputObject);
        
        responseObject = outputBuilders.makeIntroResponse(inputObject);
        
        // clean up after response

        sessionAttributes.lastSpeech = responseObject.speechObject.text;
        
        if (s3Attributes.beenToInnCounter > 0) {
            sessionAttributes.yesNo = 'go to dungeon';
        } else {
            sessionAttributes.yesNo = 'go to inn';
        }
        
        if (sessionAttributes.supportsAPL) { 
            sessionAttributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl;
        } 
        
        attributesManager.setSessionAttributes(sessionAttributes);

        attributesManager.setPersistentAttributes(s3Attributes);
        

        // push out response
        
        if (sessionAttributes.supportsAPL) {
       
           handlerInput.responseBuilder
            .addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                version: '1.0',
                document: responseObject.APLObject.document,
                datasources: responseObject.APLObject.datasources
            });
        } 
        
        return handlerInput.responseBuilder
            .speak(responseObject.speechObject.text)
            .reprompt(responseObject.speechObject.reprompt)
            .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
            .getResponse();
            
    }
};

const HelpIntentHandler = {
    
    // I decided to not implement the apl and card part on sep 18 

    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent' || 
                handlerInput.requestEnvelope.request.intent.name === 'HelpTopicIntent') ;
    },
    async handle(handlerInput) {
        
        var responseObject= {};
        //var inputObject = {supportsAPL: sessionAttributes.supportsAPL};
        var inputObject = {};
        var helpTopic;
        var attributesManager = handlerInput.attributesManager;

        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
        
            // set up attributes
            
            if (s3Attributes.previousIntent !== 'help') {
                s3Attributes.previousIntent = s3Attributes.currentIntent;
            }
            s3Attributes.currentIntent = 'help';
            
            /*set up input object
            if (inputObject.supportsAPL) {
                inputObject.backgroundImageUrl = s3Attributes.APLbackgroundImageUrl;
            }*/
    
            if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent') {
                
                if (s3Attributes.currentHelpRoom === s3Attributes.currentRoom) {
                    inputObject.helpCounter = (s3Attributes.currentHelpRoomCounter + 1);
                } else {
                    inputObject.helpCounter = 1;
                }
                inputObject.helpRoom = s3Attributes.currentRoom;
                inputObject.helpType = 'room';
    
            } else { //it's a topic specific query triggered by the help topic intent
                // if it is a valid topic
                if (handlerInput.requestEnvelope.request.intent.slots.helpTopicSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                    helpTopic = handlerInput.requestEnvelope.request.intent.slots.helpTopicSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                    
                    if (s3Attributes.currentHelpTopic === helpTopic) {
                        inputObject.helpCounter += 1;
                    } else {
                        inputObject.helpCounter = 1;
                    }
                    inputObject.helpType = 'topic';
                } else { // it's a nonsense topic
                   helpTopic = handlerInput.requestEnvelope.request.intent.slots.helpTopicSlot.value
                   inputObject.helpType = 'unknown topic'
                }
                
                inputObject.helpTopic = helpTopic;
    
            }
            
            // generate response
            
            responseObject = outputBuilders.makeHelpResponse(inputObject);
            
            // clean up attributes
        
             if (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent') {
                
                if (s3Attributes.currentHelpRoom === s3Attributes.currentRoom) {
                    s3Attributes.currentHelpRoomCounter += 1;
                } else {
                    s3Attributes.currentHelpRoom = s3Attributes.currentRoom;
                    s3Attributes.currentHelpRoomCounter = 1;
                }
    
            } else { //it's a topic specific query triggered by the help topic intent
                // if it is a valid topic
                if (handlerInput.requestEnvelope.request.intent.slots.helpTopicSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                    helpTopic = handlerInput.requestEnvelope.request.intent.slots.helpTopicSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                    
                    if (s3Attributes.currentHelpTopic === helpTopic) {
                        s3Attributes.currentHelpTopicCounter += 1;
                    } else {
                        s3Attributes.currentHelpTopic = helpTopic;
                        s3Attributes.currentHelpTopicCounter = 1;
                    }
                    
                } 
            }
    
            s3Attributes.lastSpeech = responseObject.speechObject.text;
            
            attributesManager.setPersistentAttributes(s3Attributes);
            
        }
        
        
        // push out response
        
        /* I decided to not implement the apl and card part on sep 18 
        if (sessionAttributes.supportsAPL) {
                    handlerInput.responseBuilder
                    .addDirective({
                        type: 'Alexa.Presentation.APL.RenderDocument',
                        version: '1.0',
                        document: responseObject.APLObject.document,
                        datasources: responseObject.APLObject.datasources
                    })
        }
        */
        
        return handlerInput.responseBuilder
            .speak(responseObject.speechObject.text)
            .reprompt(responseObject.speechObject.reprompt)
            //.withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
            //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content  )
            .getResponse();
    }
};

const FightIntentHandler = {
     
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'FightIntent';
    },
    async handle(handlerInput) { 
        
        var responseObject = {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL, theyWantToFightTheNPC:false, nobodyToFightHere:false, nobodyLeftToFightHere:false, clearedTheRoom:true}
        
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
        
            // set the attributes
            
            sessionAttributes.previousIntent = s3Attributes.currentIntent;
            sessionAttributes.currentIntent = 'fight';
    
            // set the input object
            
            var abilityObject;
            var whoHasTheAbilityObject;
    
            if (handlerInput.requestEnvelope.request.intent.slots.abilitiesSlot.resolutions) { // they specified an ability
                var abilitiesSlot = handlerInput.requestEnvelope.request.intent.slots.abilitiesSlot;
                if (abilitiesSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH" ) {// it's a real ability
                    var abilitiesValues = abilitiesSlot.resolutions.resolutionsPerAuthority[0].values[0].value
                    inputObject.abilityName = abilitiesValues.name;
                    var abilityID = abilitiesValues.id;
                    whoHasTheAbilityObject = 'nobody';
                    var partyCounter;
                    var currentAbilities;
                    if (abilityID<100) { // it's a non-combat attack
                        inputObject.abilitySpecified = 'non-combat'
                        for (partyCounter = 0; partyCounter<s3Attributes.party.partyList.length; partyCounter++) {
                            currentAbilities = s3Attributes.party.partyList[partyCounter].abilities.specialAttacks
                            for (var nonCombatAttackCounter = 0; nonCombatAttackCounter<currentAbilities.length; nonCombatAttackCounter++){
                                if (inputObject.abilityName === currentAbilities[nonCombatAttackCounter].name) {
                                    whoHasTheAbilityObject = s3Attributes.party.partyList[partyCounter]
                                    abilityObject = currentAbilities[nonCombatAttackCounter]
                                } 
                            }
                        }
                    } else  {
                        if (abilityID<1000) { // it's a special attack
                            inputObject.abilitySpecified = 'special attack'
                            for (partyCounter = 0; partyCounter<s3Attributes.party.partyList.length; partyCounter++) {
                                currentAbilities = s3Attributes.party.partyList[partyCounter].abilities.specialAttacks
                                for (var specialAttackCounter = 0; specialAttackCounter<currentAbilities.length; specialAttackCounter++){
                                    if (inputObject.abilityName === currentAbilities[specialAttackCounter].name) {
                                        whoHasTheAbilityObject = s3Attributes.party.partyList[partyCounter]
                                        abilityObject = currentAbilities[specialAttackCounter]
                                    } 
                                }
                            }
                        } else { // it's a basic ability
                            inputObject.abilitySpecified = 'basic attack'
                            for (partyCounter = 0; partyCounter<s3Attributes.party.partyList.length; partyCounter++) {
                                currentAbilities = s3Attributes.party.partyList[partyCounter].abilities.basicAttack
                                if (inputObject.abilityName === currentAbilities.name) {
                                    whoHasTheAbilityObject = s3Attributes.party.partyList[partyCounter]
                                    abilityObject = currentAbilities
                                } 
                            }
                        }
                    }
                } else { // they named an ability that's not a recognized ability
                    inputObject.abilitySpecified = 'unknown';
                    inputObject.abilityName = abilitiesSlot.value   
                }   
            }   
            
            // need to make sure they are in the dungeon before the fighting starts
    
            if (s3Attributes.currentRoom === 'dungeon') { // in the dungeon
                
                if (sessionAttributes.inCombat === false) { // not currently in a fight
                
                    // if it is the NPC or quartermaster, give them a chance to not fight
                
                    if (s3Attributes.party.currentDungeonRoom === 0) { // if they are in the NPC room
                        if (s3Attributes.currentDungeon[0].roomMonsterGroups[0].monsterNumber === 0) {
                           inputObject.nobodyLeftToFightHere = true;
                        } else {
                            inputObject.theyWantToFightTheNPC = true;
                            inputObject.NPCsname = s3Attributes.currentDungeon[0].roomMonsterGroups[0].monsterDescription + " " + s3Attributes.currentDungeon[0].roomMonsterGroups[0].monsterName;
                            sessionAttributes.yesNo = 'fight the NPC';
                        }
                    } else { // not in the NPC room
                        if (s3Attributes.currentRoom === 'quartermaster') { // at the quartermaster
                            inputObject.theyWantToFightTheNPC = true;
                            inputObject.NPCsname = 'The Quartermaster';
                            sessionAttributes.yesNo = 'fight the quartermaster'
                        } else {
                            var i;
                            var numberOfMonstersInRoom = 0;
                            for (i=0;i<s3Attributes.combatObject.monstersList.length; i++) {
                                numberOfMonstersInRoom = numberOfMonstersInRoom + s3Attributes.combatObject.monstersList[i].monsterNumber
                            }
                            if (numberOfMonstersInRoom > 0) {
                                sessionAttributes.inCombat = true;
                            } else {
                                inputObject.nobodyLeftToFightHere = true;
                            }
                        }
                    } 
                }
                
                if (sessionAttributes.inCombat === true) { // currently in a fight
    
                    var fightAbility = true;
    
                    if (inputObject.abilitySpecified) { // they specified an ability
                        if (inputObject.abilitySpecified === 'unknown') {// set speech for unknown ability
                            fightAbility = false;
                        } else { // it is a known ability
                            if ((whoHasTheAbilityObject.characterName) && (whoHasTheAbilityObject.characterName === s3Attributes.combatObject.partyList[s3Attributes.combatObject.attackOrderList[s3Attributes.combatObject.turnCounter]].name )) { // next to act has that ability
                                if (inputObject.abilitySpecified === 'non-combat') {// set speech for cant use that ability during a fight
                                    fightAbility = false;
                                } else {
                                    if (inputObject.abilitySpecified === 'special attack') {// modify combat object so attack status gets computed correctly with some sort of flag like targeted monster
                                    // fighting    
                                        s3Attributes.combatObject.attackAbility = abilityObject
                                    } else { // it is basic attack and I don't think anything needs to be done other than maybe add a verbal note
                                    // fighting    
                                        s3Attributes.combatObject.attackAbility = abilityObject
                                    }
                                }   
                            } else { 
                                fightAbility = false;
                                if (whoHasTheAbilityObject === 'nobody') { // set speech for nobody in your party has that known ability
                                    inputObject.whoHasTheAbility = whoHasTheAbilityObject;
                                } else { //set speech for it is not that person's turn in combat
                                    if (whoHasTheAbilityObject.characterGender === 'boy') {
                                        inputObject.hisHer = 'his'    
                                    } else {
                                        inputObject.hisHer = 'her'    
                                    }
                                    inputObject.whoHasTheAbility = whoHasTheAbilityObject.characterName;
                                }
                            }
                        }
                    }
                    
                    if (fightAbility === true) {
                        if (handlerInput.requestEnvelope.request.intent.slots.monsterSlot.resolutions) { // they specified a monster
                            if (handlerInput.requestEnvelope.request.intent.slots.monsterSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH" ) {// it's a real monster
                                inputObject.monsterSpecified = true;
                                inputObject.monsterName = handlerInput.requestEnvelope.request.intent.slots.monsterSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                                for (i=0;i<s3Attributes.combatObject.monstersList.length; i++) { // is there a live one of the monster in the room
                                    if ((s3Attributes.combatObject.monstersList[i].name === inputObject.name ) && (s3Attributes.combatObject.monstersList[i].monsterNumber > 0 )) {
                                        s3Attributes.combatObject.targetedMonster = true;
                                        s3Attributes.combatObject.targetedMonsterIndex = i;
                                        inputObject = fillAttackStatusObject(s3Attributes.combatObject);
                                        i = s3Attributes.combatObject.monstersList.length;
                                    }
                                }
                            } else { // they named a monster that's not a recognized monster
                                inputObject.monsterUnknown = true;
                                inputObject.monsterName = handlerInput.requestEnvelope.request.intent.slots.monsterSlot.value   
                            }   
                        } else {
                            
                            inputObject = fillAttackStatusObject(s3Attributes.combatObject);
                        }
                    } 
                    
                }
                
            } else { // not in the dungeon at all
            
                // deal with abilities in this context
            
                inputObject.nobodyToFightHere = true
            }
            
    
            responseObject = outputBuilders.makeFightResponse(inputObject);
            
            // clean up attributes after response object is generated
            
            updateAttributesAfterFight(inputObject);
            
            s3Attributes.combatObject.targetedMonster = false;
            s3Attributes.combatObject.targetedMonsterIndex = -1;
            s3Attributes.combatObject.attackAbility = 'none';
            
            sessionAttributes.lastSpeech = responseObject.speechObject.text;
    
            attributesManager.setSessionAttributes(sessionAttributes);
    
            attributesManager.setPersistentAttributes(s3Attributes);
        
        }
        
        //push out response    
        
        if (sessionAttributes.supportsAPL) {
                handlerInput.responseBuilder
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: responseObject.APLObject.document,
                    datasources: responseObject.APLObject.datasources
            })
        }

        return handlerInput.responseBuilder
        .speak(responseObject.speechObject.text)
        .reprompt(responseObject.speechObject.reprompt)
        .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
        //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content  )
        .getResponse();

    }
};

const ExamineRoomIntentHandler = {
    // this one needs card and APL stuff
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ExamineRoomIntent';
    },
    async handle(handlerInput) { 
    
        var responseObject = {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL}
        
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {

            sessionAttributes.currentIntent = 'examine room';
    
            // set the input object
            
            if (sessionAttributes.inCombat === true) {
                inputObject.inCombat = true
            } else {
                inputObject.inCombat = false
                if (s3Attributes.currentRoom === 'dungeon') {
                    inputObject.currentDungeonRoom = s3Attributes.party.currentDungeonRoom
                    if (s3Attributes.party.currentDungeonRoom > 0) {
                        var i;
                        var numberOfMonstersInRoom = 0;
                        for (i=0;i<s3Attributes.combatObject.monstersList.length; i++) {
                            numberOfMonstersInRoom = numberOfMonstersInRoom + s3Attributes.combatObject.monstersList[i].monsterNumber
                        }
                        if (numberOfMonstersInRoom > 0) {
                            inputObject.cantExamineRoom = true;
                            
                        } else {
                            inputObject.cantExamineRoom = false;
                            inputObject.roomObject = s3Attributes.currentDungeon[s3Attributes.party.currentDungeonRoom];
                            inputObject.combatObject = s3Attributes.combatObject;
                            inputObject.roomGold = s3Attributes.currentDungeon[s3Attributes.party.currentDungeonRoom].roomGold;
                        }
                    } else {
                        // they are in the NPC room
                        inputObject.roomObject = s3Attributes.currentDungeon[s3Attributes.party.currentDungeonRoom];
                        inputObject.holdGoldCounter = (s3Attributes.holdGoldCounter + 1);
                    }
                } else {
                    inputObject.currentRoom = s3Attributes.currentRoom;
                }
            }
            
            // generate response object
    
            responseObject = outputBuilders.makeExamineRoomResponse(inputObject);
            
            // clean up attributes after response object is generated
            
            if (inputObject.roomGold) {
                s3Attributes.party.partyGold = s3Attributes.party.partyGold + s3Attributes.currentDungeon[s3Attributes.party.currentDungeonRoom].roomGold;
                s3Attributes.currentDungeon[s3Attributes.party.currentDungeonRoom].roomGold = 0;
            }
            
    
            if (inputObject.holdGoldCounter>0) {
                s3Attributes.holdGoldCounter++;
                if(s3Attributes.holdGoldCounter < 3) sessionAttributes.yesNo = "hold gold";
            }
            
            sessionAttributes.lastSpeech = responseObject.speechObject.text;
    
            attributesManager.setSessionAttributes(sessionAttributes);
    
            attributesManager.setPersistentAttributes(s3Attributes);
            
            sessionAttributes.previousIntent = s3Attributes.currentIntent;


        }

       return handlerInput.responseBuilder
        .speak(responseObject.speechObject.text)
        .reprompt(responseObject.speechObject.reprompt)
        .getResponse();

    }
};

const SwitchWeaponIntentHandler = {
    // this one doesn't need card and APL stuff
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'SwitchWeaponIntent';
    },
    async handle(handlerInput) { 
    
        var responseObject = {};
        var inputObject = {whoseWeaponSwitch:"", whichWeaponSwitch:""}
        
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {

            var switchWeaponSlots = handlerInput.requestEnvelope.request.intent.slots;
    
    
            sessionAttributes.previousIntent = s3Attributes.currentIntent;
            sessionAttributes.currentIntent = 'switch weapon';
    
            // set the input object
            
            // if nobody is specified, figure out who is next to act
            // if they are not in combat and nobody is specified we have to ask
            // if a person is specified, let's see if they have more than one weapon
            // if the specified person only has one wepon say Sorry
            // if the specified person has more than one weapon, cycle it
            
            
            if (switchWeaponSlots.heroSlot.resolutions || switchWeaponSlots.nameSlot.resolutions) {
                inputObject = figureOutWhoToSwitchTo(switchWeaponSlots);
            } else {// they didn't specify a character
                if (s3Attributes.combatObject.partyList) { //assume next to act in the combat object?
                    inputObject.whoseWeaponSwitch = s3Attributes.combatObject.partyList[s3Attributes.combatObject.attackOrderList[s3Attributes.combatObject.turnCounter]].name
                    inputObject.equipment = theyHaveMoreThanOneWeapon(inputObject.whoseWeaponSwitch)
                    if (utils.isEmpty(inputObject.equipment)) {
                        inputObject.whoseWeaponSwitch = "they have less than two weapons";
                        inputObject.whatTheySaid = s3Attributes.combatObject.partyList[s3Attributes.combatObject.attackOrderList[s3Attributes.combatObject.turnCounter]].name
                    }
                } else {
                    // we don't know who they want
                    inputObject.whoseWeaponSwitch = "whose weapons do you want to switch";
                }
            }
            
            if (getTypeFromName(inputObject.whoseWeaponSwitch) !== "not in party") { // they have spec'd a real name with more than one weapon
                inputObject.weaponToSwitchTo = getWeaponToSwitchTo(inputObject.equipment)  
                for (var slotName in inputObject.equipment.weapons) {
                    if (slotName === "twoHand") { 
                        if (inputObject.weaponToSwitchTo === inputObject.equipment.weapons[slotName]) { // we are switching to a two handed weapon
                            if (utils.isEmpty(inputObject.equipment.currentShield) === false) inputObject.shield = "unequip"
                        } else {
                            if (inputObject.equipment.currentWeapon === inputObject.equipment.weapons[slotName]) { // we are switching from a two handed weapon
                                if (utils.isEmpty(inputObject.equipment.armor.shield) === false) inputObject.shield = "equip"    
                            }
                        }
                    }
                }
            }
            
            // generate response object
            
            responseObject = outputBuilders.makeSwitchWeaponResponse(inputObject);
    
            // clean up attributes after response object is generated
            
    
            if (getTypeFromName(inputObject.whoseWeaponSwitch) !== 'not in party') { // this is a legit completed switch
                // switch the weapon in the persistent object
                for (var counter = 0; counter<s3Attributes.party.partyList.length; counter++){
                    if (s3Attributes.party.partyList[counter].characterName === inputObject.whoseWeaponSwitch) {
                        s3Attributes.party.partyList[counter].equipment.currentWeapon = inputObject.weaponToSwitchTo;
                        if (s3Attributes.combatObject.partyList) s3Attributes.combatObject.partyList[counter].weapon = s3Attributes.party.partyList[counter].equipment.currentWeapon
                        if (inputObject.shield) { // have to refigure base defense!!
                            if (inputObject.shield === 'equip') {
                                s3Attributes.party.partyList[counter].equipment.currentShield = s3Attributes.party.partyList[counter].equipment.armor.shield    
                            } else {
                                s3Attributes.party.partyList[counter].equipment.currentShield = {}
       
                            }
                        }
                        counter = s3Attributes.party.partyList.length;
                    }
                }
            } else {
                if (inputObject.whoseWeaponSwitch === 'whose weapons do you want to switch') sessionAttributes.heroOnly = 'whose weapon switch';
            }
            
            sessionAttributes.lastSpeech = responseObject.speechObject.text;
            
            attributesManager.setSessionAttributes(sessionAttributes);
    
            attributesManager.setPersistentAttributes(s3Attributes);

        }
        
        return handlerInput.responseBuilder
        .speak(responseObject.speechObject.text)
        .reprompt(responseObject.speechObject.reprompt)
        .getResponse();

    }
};

const GoToRoomIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'GoToRoomIntent';
    },
    async handle(handlerInput) { 
    
        var responseObject = {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL, theyWantToStartOver: false, cantLeaveRoom: false}
        var attributesManager = handlerInput.attributesManager;
        
        
        // set the s3 stuff if they chained off of launch

        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
            // set the attributes
            
            if (sessionAttributes.previousIntent !== 'go to room') {
                sessionAttributes.previousIntent = sessionAttributes.currentIntent;
            }
            sessionAttributes.currentIntent = 'go to room';
            
            // set the input object
            
            var targetRoom;
    
            var roomSlots = handlerInput.requestEnvelope.request.intent.slots.roomTypeSlot;
            
            if (roomSlots.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
                targetRoom = roomSlots.resolutions.resolutionsPerAuthority[0].values[0].value.name
            } else {
                targetRoom = 'not a real room'
            }
            
            switch (targetRoom) {
               
                case 'next room':
                    
                    if (s3Attributes.currentRoom === 'dungeon') {
                        
                        inputObject.dungeonLevel = s3Attributes.party.currentDungeonLevel;
                        inputObject.currentDungeon = s3Attributes.currentDungeon;
                        
                        if (s3Attributes.party.currentDungeonRoom > 0) {
                            var i;
                            var numberOfMonstersInRoom = 0;
                            for (i=0;i<s3Attributes.combatObject.monstersList.length; i++) {
                                numberOfMonstersInRoom = numberOfMonstersInRoom + s3Attributes.combatObject.monstersList[i].monsterNumber
                            }
                            if (numberOfMonstersInRoom > 0) {
                                inputObject.cantLeaveRoom = true;
                                inputObject.moreThanOneMonster = (numberOfMonstersInRoom > 1);
                            } else {
                                inputObject.cantLeaveRoom = false;
                            }
                        } else { // they are in room 0 the NPC room
                            inputObject.cantLeaveRoom = sessionAttributes.inCombat // can't leave if you're fighting the NPC
                            inputObject.NPCName = s3Attributes.currentDungeon[0].roomMonsterGroups[0].monsterDescription + " " + s3Attributes.currentDungeon[0].roomMonsterGroups[0].monsterName
                        }
    
                        if (inputObject.cantLeaveRoom === false) {
                            inputObject.dungeonRoom =  (s3Attributes.party.currentDungeonRoom + 1);
                            if  (inputObject.dungeonRoom === (metaData.DUNGEONROOMSPERLEVEL)) { // they defeated the boss
                                if (s3Attributes.party.currentDungeonLevel === (metaData.TOTALBOSSES - 1)) inputObject.dungeonRoom = metaData.FINISHEDALLTHELEVELSROOM; // they are finished with all of the levels
                            } else {
                                var combatObject = fightUtils.makeCombatObject({partyList:s3Attributes.party.partyList, monsterGroups:s3Attributes.currentDungeon[inputObject.dungeonRoom].roomMonsterGroups})
                                inputObject.firstToAct = combatObject.partyList[combatObject.attackOrderList[0]].name
                            }
                        }
                        
                        // generate response object
    
                        responseObject = outputBuilders.makeDungeonResponse(inputObject);
                        
                        // clean up attributes after response object is generated
                        
                        if (inputObject.cantLeaveRoom === false) {
                            if (inputObject.dungeonRoom === metaData.DUNGEONROOMSPERLEVEL) { // they made it to the end
                                
                                s3Attributes.currentRoom = 'quartermaster';
                                s3Attributes.hasCompletedThisLevel = true;
                                sessionAttributes.yesNo = 'hear what is for sale'
                                // maybe add a highest level completed type thing here?
                            } else {
                                s3Attributes.party.currentDungeonRoom = inputObject.dungeonRoom;
                                s3Attributes.combatObject = combatObject;
                            }
                        }
                        
                    } else {
                        if (s3Attributes.currentRoom === 'quartermaster') {
                            
                                s3Attributes.beenToInnCounter++;
                                inputObject = fillInputObjectBeforeGoingToInn();
        
                                // generate response object
                                
                                responseObject = outputBuilders.makeInnResponse(inputObject);
                                
                                // clean up attributes after response object is generated
                                
                                if (inputObject.supportsAPL === true) {
                                    s3Attributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl
                                }
                                
                                sessionAttributes.yesNo = 'go to dungeon'
                                
                                s3Attributes.combatObject = {};
    
                                s3Attributes.currentRoom = 'inn';
                                
    
                        } else {
                            if (s3Attributes.currentRoom === 'inn') {
                                
                                inputObject = fillInputObjectBeforeGoingToDungeon();
    
                                // generate response
                                
                                responseObject = outputBuilders.makeDungeonResponse(inputObject);
                                
                                // clean up attributes
                                
                                sessionAttributes.yesNo = ""
                                
                                s3Attributes.beenToDungeonCounter ++;
                                
                                s3Attributes.party.currentDungeonRoom = 0; // they are starting over in the dungeon
                
                                s3Attributes.currentRoom = 'dungeon';    
                                
                            } else {// they are in the lobby
                            
                                s3Attributes.beenToInnCounter++;
                                
                                if (s3Attributes.beenToInnCounter === 1) {
                                    s3Attributes.party = characterUtils.makeParty()
                                }
    
                                inputObject = fillInputObjectBeforeGoingToInn();
            
                                // generate response object
                                
                                responseObject = outputBuilders.makeInnResponse(inputObject);
                                
                                // clean up attributes after response is generated
                                
                                if (inputObject.supportsAPL === true) {
                                    s3Attributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl
                                }
                                
                                sessionAttributes.yesNo = 'go to dungeon'
    
                                s3Attributes.currentRoom = 'inn';
                            
                            }
                            
                        }     
                    }
                    
                    break;
                    
                case 'inn':
                    
                    if (s3Attributes.currentRoom === 'quartermaster' || s3Attributes.currentRoom === 'lobby') {
                        
                            s3Attributes.beenToInnCounter++;
                            
                            if (s3Attributes.beenToInnCounter === 1) {
                                s3Attributes.party = characterUtils.makeParty()
                            }
                            
                            inputObject = fillInputObjectBeforeGoingToInn();
        
                            // generate response object
                            
                            responseObject = outputBuilders.makeInnResponse(inputObject);
                            
                            // clean up attributes after response is generated
                            
                            if (inputObject.supportsAPL === true) {
                                s3Attributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl
                            }
                            
                            sessionAttributes.yesNo = 'go to dungeon'
                            
                            s3Attributes.currentRoom = 'inn';
                            
                    } else {
                        if (s3Attributes.currentRoom === 'dungeon') {
                            
                            // let's double check to make sure they want to bail and go to the inn
                            inputObject.theyWantToStartOver = true;
                            
                            responseObject = outputBuilders.makeInnResponse(inputObject);
                            
                            s3Attributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl
                            sessionAttributes.yesNo = 'go to inn';
    
                        } else {// they are already there
                        
                            inputObject.cantGetThereFromHere = 'inn'
                            
                            responseObject = outputBuilders.makeInnResponse(inputObject);
    
                            
                        }
                    }
                    
                    break;
                    
                case 'lobby':
                    
                        inputObject.cantGetThereFromHere = "lobby"
                        
                        switch (s3Attributes.currentRoom){
                            
                            case 'lobby':
                                responseObject = outputBuilders.makeIntroResponse(inputObject);
                                break;
                            case 'inn':
                                responseObject = outputBuilders.makeInnResponse(inputObject);
                                break;
                            case 'quartermaster':
                                responseObject = outputBuilders.makeQuartermasterResponse(inputObject);
                                return handlerInput.responseBuilder
                                    .speak(responseObject.speechObject.text)
                                    .reprompt(responseObject.speechObject.reprompt)
                                    .getResponse();
                            case 'dungeon':
                                responseObject = outputBuilders.makeDungeonResponse(inputObject);
                                break;
    
                        }
    
                    break;
                     
                case 'dungeon':
                    
                    if (s3Attributes.currentRoom === 'inn') {
                                
                                inputObject = fillInputObjectBeforeGoingToDungeon();
    
                                // generate response
                                
                                responseObject = outputBuilders.makeDungeonResponse(inputObject);
                                
                                // clean up attributes
                                
                                sessionAttributes.yesNo = ""
                                
                                s3Attributes.beenToDungeonCounter ++;
                                
                                s3Attributes.party.currentDungeonRoom = 0; // they are starting over in the dungeon
                
                                s3Attributes.currentRoom = 'dungeon';    
                    } else {
                        
                        inputObject.cantGetThereFromHere = "dungeon"
                        
                        if (s3Attributes.currentRoom === "lobby" ){
                            responseObject = outputBuilders.makeIntroResponse(inputObject);
                        } else {
                            if (s3Attributes.currentRoom === 'quartermaster'){
                                responseObject = outputBuilders.makeQuartermasterResponse(inputObject);
                                return handlerInput.responseBuilder
                                    .speak(responseObject.speechObject.text)
                                    .reprompt(responseObject.speechObject.reprompt)
                                    .getResponse();
                            } else {
                                responseObject = outputBuilders.makeDungeonResponse(inputObject)
                            }    
                        }
                    }
                    
                    break;
                    
                case 'quartermaster':
                    
                    if (s3Attributes.currentRoom === 'dungeon')  { // they are in the dungeon
                    
                        if (s3Attributes.party.currentDungeonRoom === (metaData.DUNGEONROOMSPERLEVEL - 1)) { // they are in the boss room and can go to the QM if the way is clear
                            var j;
                            var numberOfMonstersInBossRoom = 0;
                            for (j=0;j<s3Attributes.combatObject.monstersList.length; j++) {
                                numberOfMonstersInBossRoom = numberOfMonstersInBossRoom + s3Attributes.combatObject.monstersList[j].monsterNumber
                            }
                            if (numberOfMonstersInBossRoom > 0) {
                                inputObject.cantLeaveRoom = true;
                                inputObject.moreThanOneMonster = (numberOfMonstersInRoom > 1);
                            } else {
                                inputObject.cantLeaveRoom = false;
                            }
                            if (inputObject.cantLeaveRoom === false) {
                                inputObject.dungeonRoom =  (s3Attributes.party.currentDungeonRoom + 1);
                                if  (inputObject.dungeonRoom === (metaData.DUNGEONROOMSPERLEVEL)) { // they defeated the boss
                                    if (s3Attributes.party.currentDungeonLevel === (metaData.TOTALBOSSES - 1)) inputObject.dungeonRoom = metaData.FINISHEDALLTHELEVELSROOM; // they are finished with all of the levels
                                }
                            }
                            
    
                        } else { // they are in the dungeon and not in the boss room
                        
                            inputObject.cantGetThereFromHere = "quartermaster"
    
                        }
                        
                        responseObject = outputBuilders.makeDungeonResponse(inputObject);
    
                    } else {// they are not in the dungeon
                    
                        inputObject.cantGetThereFromHere = "quartermaster"
    
                        if (s3Attributes.currentRoom === "lobby" ){
                            responseObject = outputBuilders.makeIntroResponse(inputObject);
                        } else {
                            if (s3Attributes.currentRoom === 'inn'){
                                responseObject = outputBuilders.makeInnResponse(inputObject);
                            } else {
                                responseObject = outputBuilders.makeQuartermasterResponse(inputObject)
                                return handlerInput.responseBuilder
                                    .speak(responseObject.speechObject.text)
                                    .reprompt(responseObject.speechObject.reprompt)
                                    .getResponse();
                            }    
                        }
    
    
                    }
                    
                
                    // clean up attributes after response object is generated
                
                    if (inputObject.cantLeaveRoom === false) {
                        if (inputObject.dungeonRoom === metaData.DUNGEONROOMSPERLEVEL) { // they made it to the end
                            s3Attributes.currentRoom = 'quartermaster';
                            s3Attributes.hasCompletedThisLevel = true;
                            sessionAttributes.yesNo = 'hear what is for sale'
                            // maybe add a highest level completed type thing here?
                        }
                    }
    
                    
                    break;
                    
                case 'not a real room':
                    
                    responseObject = {speechObject:{}};
                    responseObject.speechObject.text = "I don't know how to get to " + roomSlots.value + ". Sorry.";
                    responseObject.speechObject.reprompt = "I don't know how to get to " + roomSlots.value + ".";
                    
                    if (s3Attributes.currentRoom !== 'lobby') {
                    // make it dm voice  
                            responseObject.speechObject.text = "<voice name='Brian'><lang xml:lang='en-GB'>" + responseObject.speechObject.text + "</lang></voice>" 
                            responseObject.speechObject.reprompt = "<voice name='Brian'><lang xml:lang='en-GB'>" + responseObject.speechObject.reprompt + "</lang></voice>" 
                    }
                    
                    return handlerInput.responseBuilder // not a real room and default should fall through to this one with no APL or card
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
    
                default:
                    responseObject = {speechObject:{}};
                    responseObject.speechObject.text = "I don't know where you want to go. Sorry.";
                    responseObject.speechObject.reprompt = "I don't know where you want to go.";
                    
                    if (s3Attributes.currentRoom !== 'lobby') {
                    // make it dm voice  
                            responseObject.speechObject.text = "<voice name='Brian'><lang xml:lang='en-GB'>" + responseObject.speechObject.text + "</lang></voice>" 
                            responseObject.speechObject.reprompt = "<voice name='Brian'><lang xml:lang='en-GB'>" + responseObject.speechObject.reprompt + "</lang></voice>" 
                    }
                    
                    return handlerInput.responseBuilder // not a real room and default should fall through to this one with no APL or card
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
    
            }

        }
        

        //push out response       
        
        if ((s3Attributes.party) && (s3Attributes.party.currentDungeonRoom === -1)) { // game over man
        
            s3Attributes = {};
            
            attributesManager.setPersistentAttributes(s3Attributes);
            
            await attributesManager.savePersistentAttributes();
        
            return handlerInput.responseBuilder
                .speak(responseObject.speechObject.text)
                .withShouldEndSession(true)
                .getResponse();

        } else {
            
            sessionAttributes.lastSpeech = responseObject.speechObject.text;
            
            attributesManager.setSessionAttributes(sessionAttributes);

            attributesManager.setPersistentAttributes(s3Attributes);
            
            if (sessionAttributes.supportsAPL) {
                    handlerInput.responseBuilder
                    .addDirective({
                        type: 'Alexa.Presentation.APL.RenderDocument',
                        version: '1.0',
                        document: responseObject.APLObject.document,
                        datasources: responseObject.APLObject.datasources
                    })
            }
            
            return handlerInput.responseBuilder
            .speak(responseObject.speechObject.text)
            .reprompt(responseObject.speechObject.reprompt)
            .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
            //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content )
            .getResponse();

            
        }
        
    }
};

const YesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    async handle(handlerInput) {
        
        var responseObject = {};
        var inputObject = {};
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {

            // set attributes
        
             if (sessionAttributes.previousIntent !== 'yes') {
                sessionAttributes.previousIntent = sessionAttributes.currentIntent;
            }
        
            sessionAttributes.currentIntent = 'yes';
            
               // set input object
               
            switch (sessionAttributes.yesNo) {
                
                case "hold gold":// they want to give their money to the NPC
                
                    var NPCInfo = s3Attributes.currentDungeon[0].roomMonsterGroups[0];
                    if (NPCInfo.gender === 'girl') {
                        inputObject.NPCVoice = metaData.NPCVoices.GIRL[NPCInfo.monsterVoiceIndex]
                    } else {
                        inputObject.NPCVoice = metaData.NPCVoices.BOY[NPCInfo.monsterVoiceIndex]
                    }    
                    inputObject.NPCName = NPCInfo.monsterDescription + " " + NPCInfo.monsterName
                    
                    responseObject = outputBuilders.makeBriberyResponse(inputObject);
                    
                    // clean up attributes
                    
                    NPCInfo.monsterNumber = 0;
                    
                    sessionAttributes.inCombat = false;
                    
                    s3Attributes.party.partyLuck++;
                    
                    sessionAttributes.yesNo = '';
                    
                    sessionAttributes.lastSpeech = responseObject.speechObject.text;
    
                    attributesManager.setPersistentAttributes(s3Attributes);
            
                    attributesManager.setSessionAttributes(sessionAttributes);
    
                    return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
                
                case 'fight the NPC': // they want to fight the NPC
                
                    // generate response object
                    
                    inputObject - fillAttackStatusObject(s3Attributes.combatObject);
                    
                    responseObject = outputBuilders.makeFightResponse(inputObject)
                    
                    // clean up attributes
                    
                    updateAttributesAfterFight(inputObject);
    
                    sessionAttributes.yesNo = '';
    
                    break;
                    
                case 'hear what is for sale': // they want to hear what the QM has on offer
                
                    // generate response object
                    
                    inputObject.itemsForSale = s3Attributes.currentDungeon[metaData.DUNGEONROOMSPERLEVEL].itemsForSale;
                    
                    responseObject = outputBuilders.makeQuartermasterResponse(inputObject);
                    
                    sessionAttributes.yesNo = '';
    
                    return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
                
                
                case 'go to inn': // going to inn
    
                    s3Attributes.beenToInnCounter++;
                    
                    if (s3Attributes.beenToInnCounter === 1) {
                        s3Attributes.party = characterUtils.makeParty()
                    }
    
                    inputObject = fillInputObjectBeforeGoingToInn();
                    
                    // generate response object
                    responseObject = outputBuilders.makeInnResponse(inputObject);
                    
                    // clean up attributes
                    
                    sessionAttributes.inCombat = false;
                    
                    sessionAttributes.yesNo = 'go to dungeon'
                    
                    s3Attributes.currentRoom = 'inn';
                    
                    s3Attributes.combatObject = {};
    
                    break;
                    
                case 'go to dungeon': // going to dungeon
                
                    inputObject = fillInputObjectBeforeGoingToDungeon();
                    
                    // generate response
                    
                    responseObject = outputBuilders.makeDungeonResponse(inputObject);
                    
                    // clean up attributes
                    
                    sessionAttributes.yesNo = '';
    
                    s3Attributes.party.currentDungeonRoom = 0; // they are starting over in the dungeon
    
                    s3Attributes.beenToDungeonCounter =  inputObject.beenToDungeonCounter;
    
                    s3Attributes.currentRoom = 'dungeon';
                    
                    break;
                    
                case 'swear and quit': // they said fuck it
                
                    attributesManager.setPersistentAttributes(s3Attributes);
                    
                    await attributesManager.savePersistentAttributes();
                    
                    const speechText = 'Your game is saved. Goodbye!';
                    return handlerInput.responseBuilder
                        .speak(speechText)
                        .withShouldEndSession(true)
                        .getResponse();
                
                    
                default:
                    responseObject.speechObject = {};
                    responseObject.speechObject.text = "I don't know what you are saying yes to right now. Sorry.";
                    responseObject.speechObject.reprompt = "I don't know what you are saying yes to right now. Sorry.";
                    sessionAttributes.yesNo = '';
                    return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
                    
            }
            
            if (sessionAttributes.supportsAPL) {
                sessionAttributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl
            }
    
            sessionAttributes.lastSpeech = responseObject.speechObject.text;
    
            attributesManager.setPersistentAttributes(s3Attributes);
            
            attributesManager.setSessionAttributes(sessionAttributes);

        }

        
        // push out response

        if (sessionAttributes.supportsAPL) {
                    handlerInput.responseBuilder
                    .addDirective({
                        type: 'Alexa.Presentation.APL.RenderDocument',
                        version: '1.0',
                        document: responseObject.APLObject.document,
                        datasources: responseObject.APLObject.datasources
                    })
        }
        
        
        return handlerInput.responseBuilder
            .speak(responseObject.speechObject.text)
            .reprompt(responseObject.speechObject.reprompt)
            .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
            //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content )
            .getResponse();
    }
};

const NoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    async handle(handlerInput) {
        
        var responseObject = {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL,noResponse: true};
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
            // set up attributes
            s3Attributes.previousIntent = s3Attributes.currentIntent;
            s3Attributes.currentIntent = 'no';
            
            // set up input objects
            switch (sessionAttributes.yesNo) {
                
                case "hold gold":// they don't want to give their money to the NPC
                
                    var NPCInfo = s3Attributes.currentDungeon[0].roomMonsterGroups[0];
                    if (NPCInfo.gender === 'girl') {
                        inputObject.NPCVoice = metaData.NPCVoices.GIRL[NPCInfo.monsterVoiceIndex]
                    } else {
                        inputObject.NPCVoice = metaData.NPCVoices.BOY[NPCInfo.monsterVoiceIndex]
                    }    
    
                    responseObject = outputBuilders.makeBriberyResponse(inputObject);
                    
                    sessionAttributes.yesNo = '';
    
                    return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
                
                case 'go to inn':
                    // generate response
                    if (s3Attributes.currentRoom === 'dungeon') {
                        responseObject = outputBuilders.makeDungeonResponse(inputObject);
                    } else {
                        responseObject = outputBuilders.makeIntroResponse(inputObject);
                    }
                    break;
                    
                case 'go to dungeon':
                    // generate response
                    responseObject = outputBuilders.makeInnResponse(inputObject);
                    break;
                    
                case 'hear what is for sale': // they what the QM has on offer
                
                    // generate response object
                    
                    responseObject = outputBuilders.makeQuartermasterResponse(inputObject);
                   
                    sessionAttributes.yesNo = '';
    
                    return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
    
                case 'fight the NPC':
                    // generate response
                    inputObject.theyDontWantToFightTheNPC = true;
                    responseObject = outputBuilders.makeFightResponse(inputObject)
                    break;
                    
                case 'swear and quit':
                    responseObject.text = 'Okay. Carry on. Maybe watch that language though.';
                    responseObject.reprompt = 'Carry on. Watch your language.';
                    return handlerInput.responseBuilder
                        .speak(responseObject.text)
                        .reprompt(responseObject.reprompt)
                        .getResponse();
    
                default:
                    // generate response
                    responseObject.speechObject = {};
                    responseObject.speechObject.text = "I don't know what you are saying no to right now. Sorry.";
                    responseObject.speechObject.reprompt = "I don't know what you are saying no to right now. Sorry.";
                    return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
            }
            
    
            // clean up attributes
            
            sessionAttributes.yesNo = '';
    
            s3Attributes.lastSpeech = responseObject.speechObject.text;
            
            attributesManager.setPersistentAttributes(s3Attributes);
                
        }

        // push out response

        if (sessionAttributes.supportsAPL) {
                    handlerInput.responseBuilder
                    .addDirective({
                        type: 'Alexa.Presentation.APL.RenderDocument',
                        version: '1.0',
                        document: responseObject.APLObject.document,
                        datasources: responseObject.APLObject.datasources
                    })
        }

        return handlerInput.responseBuilder
            .speak(responseObject.speechObject.text)
            .reprompt(responseObject.speechObject.reprompt)
            .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
            //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content  )
            .getResponse();
    }
};

const BriberyIntentHandler = {
    // this one needs card and APL stuff
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'BriberyIntent';
    },
    async handle(handlerInput) { 
    
        var responseObject = {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL}
        
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {

        sessionAttributes.previousIntent = s3Attributes.currentIntent;
            sessionAttributes.currentIntent = 'bribery';
    
            // set the input object
            
            if (s3Attributes.currentRoom === 'dungeon') {
                if (s3Attributes.party.currentDungeonRoom > 0) {
                    inputObject.currentDungeonRoom = "not npc room"
                } else {
                    // they are in the NPC room
                    inputObject.currentDungeonRoom = "npc room"
                    inputObject.NPCName = s3Attributes.currentDungeon[0].roomMonsterGroups[0].monsterDescription + " " + s3Attributes.currentDungeon[0].roomMonsterGroups[0].monsterName
                }
            } else {
                inputObject.currentRoom = s3Attributes.currentRoom;
            }
            
            inputObject.inCombat = sessionAttributes.inCombat
            
            // generate response object
    
            responseObject = outputBuilders.makeBriberyResponse(inputObject);
            
            // clean up attributes after response object is generated
            
            if (inputObject.currentDungeonRoom === "npc room") {
                sessionAttributes.yesNo = "hold gold";
            }
            
            sessionAttributes.lastSpeech = responseObject.speechObject.text;
    
            attributesManager.setSessionAttributes(sessionAttributes);
    
            attributesManager.setPersistentAttributes(s3Attributes);

        }

        return handlerInput.responseBuilder
        .speak(responseObject.speechObject.text)
        .reprompt(responseObject.speechObject.reprompt)
        .getResponse();

    }
};

const BuyThingsIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'BuyThingsIntent';
    },
    async handle(handlerInput) {
        
        var responseObject = {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL};
        var attributesManager = handlerInput.attributesManager;

        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
        
            // set the attributes        
    
            if (sessionAttributes.previousIntent !== 'buy things') {
                sessionAttributes.previousIntent = sessionAttributes.currentIntent;
            }
            
            sessionAttributes.currentIntent = 'buy things';
            
            // set input object
    
            if (s3Attributes.currentRoom === "quartermaster") {
                
                var buyableSlots = handlerInput.requestEnvelope.request.intent.slots.buyableSlot;
                var targetPurchase = {type:"", name:""};
                
                if (buyableSlots.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') { // they asked for a real inventory item
    
                    if (buyableSlots.resolutions.resolutionsPerAuthority[0].values[0].value.name === 'level') { // if they are trying to buy a level upgrade
                     
                        if (s3Attributes.purchasedNextLevelAndNotUsedItYet === true) { // if they already have one
                            
                            inputObject.type = 'already have a level'
                            
                        } else { // we have to go out to the ISP system
                        
                            attributesManager.setPersistentAttributes(s3Attributes);
                            await attributesManager.savePersistentAttributes();
    
        
                            return handlerInput.responseBuilder
                                    .addDirective({
                                    type: "Connections.SendRequest",
                                    name: "Buy",
                                    payload: {
                                        InSkillProduct: {
                                            productId: "amzn1.adg.product.8a4c554a-663a-4deb-8f38-9159a95efcfd",
                                        }
                                    },
                                    token: "new level",
                                    shouldEndSession:true
                                    })
                                    .getResponse();    
                        }
                    } else {// they are buying an in game thing
                        var itemName = buyableSlots.value;// what they said
                        var itemType = buyableSlots.resolutions.resolutionsPerAuthority[0].values[0].value.name; // canonical type it resolved to in the interaction model
                        var itemsForSale = s3Attributes.currentDungeon[metaData.DUNGEONROOMSPERLEVEL].itemsForSale;
                        var itemToPurchase = utils.isOneForSale({requestedItemName:itemName, requestedItemType:itemType, itemsForSale:itemsForSale});
                        if (itemToPurchase !== 'not for sale') {// is it a thing for sale right now
                            // can they afford it
                            var newThing = itemsForSale[itemToPurchase]
                            inputObject.name = newThing.item.name;
                            if (s3Attributes.party.partyGold >= newThing.itemPrice) {
                                inputObject.decision = figureOutIfWeHaveToDecideWhoGetsIt({type:itemType, thing:newThing.item});
                                if (inputObject.decision.haveToDecide === false) {
                                    inputObject.type =  'affordable';   
                                    inputObject.replacement = figureOutIfWeHaveToReplaceAThing({whoGetsIt:inputObject.decision.whoGetsIt,thing:newThing.item, type:itemType});
                                } else {
                                    inputObject.type =  'have to decide who gets it';   
                                }
                            } else {
                                inputObject.type =  'not enough gold'
                            }                    
                        } else {
                            inputObject.type = 'not for sale'
                            inputObject.name = buyableSlots.value;
                        }
                    }
                } else { // they asked for a not real inventory item
                    inputObject.type = 'not a real purchase'
                    inputObject.name = buyableSlots.value;
                }
            } else {
                inputObject.type = 'no shopping here'
            }
            
            // generate response object
            
            responseObject = outputBuilders.makePurchaseResponse(inputObject);
            
            // clean up attributes
            
            if (inputObject.type ===  'have to decide who gets it') {
                sessionAttributes.heroOnly = 'who gets the new thing'
                sessionAttributes.newThing = {choices:inputObject.decision.whoGetsIt, thing:newThing.item, type:buyableSlots.resolutions.resolutionsPerAuthority[0].values[0].value.name}
            }
            
            if (inputObject.type ===  'affordable') {
                s3Attributes.party.partyInventory.push(s3Attributes.currentDungeon[metaData.DUNGEONROOMSPERLEVEL].itemsForSale[itemToPurchase].item); // add it to the party inventory
                s3Attributes.party.partyGold = s3Attributes.party.partyGold - s3Attributes.currentDungeon[metaData.DUNGEONROOMSPERLEVEL].itemsForSale[itemToPurchase].itemPrice;
                s3Attributes.currentDungeon[metaData.DUNGEONROOMSPERLEVEL].itemsForSale[itemToPurchase].itemPrice = 0;
            }
            
            sessionAttributes.lastSpeech = responseObject.speechObject.text;
    
            attributesManager.setPersistentAttributes(s3Attributes);
            
        }

        
        // push out response

        return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        .getResponse();
    }
};

const TalkIntentHandler = {
    // this one needs card and APL stuff
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'TalkIntent';
    },
    async handle(handlerInput) { 
        
        var responseObject = {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL, talkingToTheNPC:false, talkingToTheQuarterMaster:false}
        
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {

            sessionAttributes.previousIntent = s3Attributes.currentIntent;
            sessionAttributes.currentIntent = 'talk';
    
            // set the input object
            
            // need to make sure they are in the dungeon before the fighting starts
            
            // if they said thanks to the NPC we will say you're welcome and not increment the NPCSpeechCounter
            
            var theySaidThanks = handlerInput.requestEnvelope.request.intent.slots.thanksSlot.resolutions; /// if there is a resolution here that means the slot was triggered
            
            var theyChoseAGender = handlerInput.requestEnvelope.request.intent.slots.genderSlot.resolutions;
            
            if (s3Attributes.currentRoom === 'dungeon') {
                
                if (s3Attributes.party.currentDungeonRoom === 0) {
                // NPC    
                    inputObject.talkingToTheNPC = true;
                    var NPCInfo = s3Attributes.currentDungeon[0].roomMonsterGroups[0]
                    if (NPCInfo.gender === 'boy') {
                        inputObject.NPCVoice = metaData.NPCVoices.BOY[NPCInfo.monsterVoiceIndex]    
                    } else {
                        inputObject.NPCVoice = metaData.NPCVoices.GIRL[NPCInfo.monsterVoiceIndex]    
                    }
                    if (theySaidThanks) {
                        if (NPCInfo.NPCSpeechCounter > 0) {
                            inputObject.NPCSpeech = "You're welcome!"
                        } else {
                            inputObject.NPCSPeech = "Don't thank me yet!"
                        }
                    } else {
                        if (theyChoseAGender && theyChoseAGender.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH" && (theyChoseAGender.resolutionsPerAuthority[0].values[0].value.name !== NPCInfo.gender)) { // they misgendered
                            if (NPCInfo.gender === 'boy') {
                                inputObject.NPCSpeech = "I identify as male so please use boy pronouns when we talk."
                            } else {
                                inputObject.NPCSpeech = "I identify as female so please use girl pronouns when we talk."
                            }
                        } else {
                           if (NPCInfo.NPCSpeechCounter<metaData.NPCLEVELSPEECHES[s3Attributes.party.currentDungeonLevel].length) {
                                inputObject.NPCSpeech = metaData.NPCLEVELSPEECHES[s3Attributes.party.currentDungeonLevel][NPCInfo.NPCSpeechCounter];
                                s3Attributes.currentDungeon[0].roomMonsterGroups[0].NPCSpeechCounter++
                            } else {
                                if (s3Attributes.NPCbabble.speechCounter>=metaData.RANDOMNPCSPEECHES.length) { // we reached the end of the list and we need to rescramble it
                                    var lastOne = s3Attributes.NPCbabble.speechOrder[(s3Attributes.NPCbabble.speechOrder.length - 1)];
                                    var newList = utils.makeRandomList(metaData.RANDOMNPCSPEECHES.length,metaData.RANDOMNPCSPEECHES.length)
                                    while (newList[0]===lastOne) {
                                        newList = utils.makeRandomList(metaData.RANDOMNPCSPEECHES.length,metaData.RANDOMNPCSPEECHES.length)
                                    }
                                    s3Attributes.NPCbabble.speechOrder = newList;
                                    s3Attributes.NPCbabble.speechCounter = 0;
                                }
                                inputObject.NPCSpeech = metaData.RANDOMNPCSPEECHES[s3Attributes.NPCbabble.speechOrder[s3Attributes.NPCbabble.speechCounter]];
                                s3Attributes.NPCbabble.speechCounter++;
            
                            }
                        }
                    }
                } else {
                // monsters who don't want to talk    
                    inputObject.talkingToMonster = true;
                }
            
            } else {
                if (s3Attributes.currentRoom === 'quartermaster') {
                // QuarterMaster    
                    inputObject.talkingToTheQuarterMaster = true;
                } else {
                // Inn   
                }
            }
    
            // generate response object
    
            responseObject = outputBuilders.makeTalkResponse(inputObject);
            
            // clean up attributes after response object is generated
            
           sessionAttributes.lastSpeech = responseObject.speechObject.text;
    
            attributesManager.setSessionAttributes(sessionAttributes);
    
            attributesManager.setPersistentAttributes(s3Attributes);

        }


        // set the attributes
        
        //push out response    
        /*
        if (sessionAttributes.supportsAPL) {
                handlerInput.responseBuilder
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: responseObject.APLObject.document,
                    datasources: responseObject.APLObject.datasources
            })
        }*/

        return handlerInput.responseBuilder
        .speak(responseObject.speechObject.text)
        .reprompt(responseObject.speechObject.reprompt)
        //.withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
        .getResponse();

    }
};

const BackFromPurchaseHandler = {
    // this one needs card and APL stuff
    
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'Connections.Response';
    },
    async handle(handlerInput) {
        
        
        var attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
            
            // need to check response type and handle various failures
            // right now it assumes success

            s3Attributes = await attributesManager.getPersistentAttributes();
    
            sessionAttributes = {inCombat: false};
            
            sessionAttributes.previousIntent = 'BuyThingsIntent';
            sessionAttributes.currentIntent = 'Back from purchase';
            sessionAttributes.supportsAPL = utils.supportsAPL(handlerInput);
    
            s3Attributes.purchasedNextLevelAndNotUsedItYet = true; 
            
            var inputObject = {supportsAPL: sessionAttributes.supportsAPL}
            
            var responseObject = outputBuilders.makeBackFromPurchaseResponse(inputObject);
            
            attributesManager.setSessionAttributes(sessionAttributes);
    
            attributesManager.setPersistentAttributes(s3Attributes);
            
        }
            
        
        if (sessionAttributes.supportsAPL) {
                    handlerInput.responseBuilder
                    .addDirective({
                        type: 'Alexa.Presentation.APL.RenderDocument',
                        version: '1.0',
                        document: responseObject.APLObject.document,
                        datasources: responseObject.APLObject.datasources
                    })
        }
            
        return handlerInput.responseBuilder
                        .speak(responseObject.speechObject.text)
                        .reprompt(responseObject.speechObject.reprompt)
                        //.withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
                        //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content  )
                        .getResponse();
    }
};

const UnlockedLevelIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (
                handlerInput.requestEnvelope.request.intent.name === 'UnlockedLevelIntent') ;
    },
    async handle(handlerInput) {
        
        var responseObject= {};
        var inputObject = {supportsAPL: sessionAttributes.supportsAPL};
        var attributesManager = handlerInput.attributesManager;

        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
                responseObject = setValuesAtLaunch(handlerInput);
            } 
        } else {
            
        // set attributes
            if (s3Attributes.previousIntent !== 'unlocked level') {
                s3Attributes.previousIntent = s3Attributes.currentIntent;
            }
            s3Attributes.currentIntent = 'unlocked level';
            
            // set input object
            
            var unlockedChoicesSlot = handlerInput.requestEnvelope.request.intent.slots.unlockedChoicesSlot;
            
            if (unlockedChoicesSlot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH') {
    
    
                if(unlockedChoicesSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name === 'new') {
                    
                    var newDungeon = dungeonUtils.makeADungeonLevel({dungeonLevel:s3Attributes.party.currentDungeonLevel + 1,NPCList:s3Attributes.previousNPCList});
                    inputObject.currentDungeon = newDungeon.dungeonObject;
                    inputObject.dungeonLevel = (s3Attributes.party.currentDungeonLevel + 1);
    
    
                } else {
                    
                    inputObject.dungeonLevel = s3Attributes.party.currentDungeonLevel;
                    inputObject.currentDungeon = s3Attributes.currentDungeon
                }
                
                inputObject.dungeonRoom =  0;
                
                // generate response
                
                responseObject = outputBuilders.makeDungeonResponse(inputObject);
                
                // clean up attributes
    
                s3Attributes.beenToDungeonCounter =  (s3Attributes.beenToDungeonCounter + 1);
                s3Attributes.party.currentDungeonLevel =  inputObject.dungeonLevel
                s3Attributes.party.currentDungeonRoom =  0
                s3Attributes.currentDungeon = inputObject.currentDungeon;
                if (newDungeon) s3Attributes.previousNPCList = newDungeon.updatedNPCList;
    
                if(unlockedChoicesSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name === 'new') {
                    s3Attributes.purchasedNextLevelAndNotUsedItYet = false;
                    s3Attributes.hasCompletedThisLevel = false;
                } 
    
                s3Attributes.currentRoom = 'dungeon';
    
                attributesManager.setPersistentAttributes(s3Attributes);
    
            } else {
                // it's not a valid choice and we should generate a response that says we don't know what level you want
                inputObject.dungeonRoom = metaData.UNKONWNLEVELROOM;
                responseObject = outputBuilders.makeDungeonResponse(inputObject);
                
                // generate response
    
                responseObject = outputBuilders.makeDungeonResponse(inputObject);
            }
            
           if (inputObject.supportsAPL) {
                        sessionAttributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl
            }
        }
        
        // push out response
        
        if (sessionAttributes.supportsAPL) {
                        handlerInput.responseBuilder
                        .addDirective({
                            type: 'Alexa.Presentation.APL.RenderDocument',
                            version: '1.0',
                            document: responseObject.APLObject.document,
                            datasources: responseObject.APLObject.datasources
                        })
            }
        
            return handlerInput.responseBuilder
                .speak(responseObject.speechObject.text)
                .reprompt(responseObject.speechObject.reprompt)
                .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
                //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content )
                .getResponse();
    }
}

const ResetAttributesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'ResetAttributesIntent';
    },
    async handle(handlerInput) {
        
        var attributesManager = handlerInput.attributesManager;

        s3Attributes = {};
        
        attributesManager.setPersistentAttributes(s3Attributes);
        
        await attributesManager.savePersistentAttributes();
        
        let speechOutput = `Goodbye! Your attributes are flushed`;
        
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
    },
    async handle(handlerInput) {
        
        if (utils.isEmpty(s3Attributes)) {
            var attributesManager = handlerInput.attributesManager;

            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
            } 
            
            var responseObject = setValuesAtLaunch(handlerInput);
            
            if (sessionAttributes.supportsAPL) {
           
               handlerInput.responseBuilder
                .addDirective({
                    type: 'Alexa.Presentation.APL.RenderDocument',
                    version: '1.0',
                    document: responseObject.APLObject.document,
                    datasources: responseObject.APLObject.datasources
                })
            } 
            
            
            return handlerInput.responseBuilder
                .speak(responseObject.speechObject.text)
                .reprompt(responseObject.speechObject.reprompt)
                .withStandardCard(responseObject.cardObject.title, responseObject.cardObject.content, responseObject.cardObject.smallUrl, responseObject.cardObject.largeUrl  )
                //.withSimpleCard(responseObject.cardObject.title, responseObject.cardObject.content )
                .getResponse();

        } else {
            const speechText = sessionAttributes.lastSpeech;
            
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(speechText)
                .getResponse();

        }

        
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    async handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;

        console.log('ending session from cancel and stop and saving s3Attributes', s3Attributes)
       
        attributesManager.setPersistentAttributes(s3Attributes);
        
        await attributesManager.savePersistentAttributes();
        
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withShouldEndSession(true)
            .getResponse();
    }
};

const SwearingIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'SwearingIntent');
    },
    async handle(handlerInput) {
        
        const attributesManager = handlerInput.attributesManager;
        
        if (utils.isEmpty(s3Attributes)) {
            s3Attributes = await attributesManager.getPersistentAttributes() || {};
            if (utils.isEmpty(s3Attributes)) {
                s3Attributes = fillEmptyS3Object();
            } 
        } 

        var speechObject = {text:"That's some salty language. Do you want to save your game and quit?", reprompt:"You sound angry. Do you want to save your game and exit?"}
        
        sessionAttributes.yesNo = 'swear and quit';
        
        attributesManager.setSessionAttributes(sessionAttributes);

        attributesManager.setPersistentAttributes(s3Attributes);
        
        //push out response    
        
        return handlerInput.responseBuilder
        .speak(speechObject.text)
        .reprompt(speechObject.reprompt)
        .getResponse();

    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    async handle(handlerInput) {
        // Any cleanup logic goes here.
        
        var attributesManager = handlerInput.attributesManager;
        
        console.log('ending session from session ended and saving s3Attributes', s3Attributes)
        
        attributesManager.setPersistentAttributes(s3Attributes);

        await attributesManager.savePersistentAttributes();
        
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.

const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest';
    },
    handle(handlerInput) {
        
        const intentName = handlerInput.requestEnvelope.request.intent.name;
        const speechText = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speechText)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const FallbackIntentHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput) {
        
        var speech = {text:"", reprompt:""}
        
        console.log('in fallback intent handler and handler input envelope is ', handlerInput.requestEnvelope)

        speech.text = "I couldn't figure out what you wanted me to do. Let's try this again: " + sessionAttributes.lastSpeech
        speech.reprompt = sessionAttributes.lastSpeech;

        return handlerInput.responseBuilder
            .speak(speech.text)
            .reprompt(speech.reprompt)
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        
        console.log(`~~~~ Error handled: ${error.message}`);
        const speechText = 'The ' + handlerInput.requestEnvelope.request.intent.name + ' handler had the error: ' + error.message;

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

// 
// helper functions 
//

function setValuesAtLaunch (handlerInput) {
    
        const attributesManager = handlerInput.attributesManager;
        var inputObject = {};
        var responseObject = {};

        s3Attributes.beenToIntroCounter =  (s3Attributes.beenToIntroCounter + 1);

        if (s3Attributes.beenToInnCounter > 0) {
            s3Attributes.currentRoom = 'inn';    
            s3Attributes.beenToInnCounter =  (s3Attributes.beenToInnCounter + 1);
        } 
        
        // set the session stuff
        
        sessionAttributes = initializeSessionAttributes(handlerInput);

        // set the input object stuff to go to the outputbuilder
        
        if (s3Attributes.beenToInnCounter > 0) {
            inputObject = fillInputObjectBeforeGoingToInn();
        } else {
            inputObject.supportsAPL = sessionAttributes.supportsAPL;
        }

        inputObject.beenToInnCounter = s3Attributes.beenToInnCounter;
        inputObject.beenToIntroCounter = s3Attributes.beenToIntroCounter;
        
        // generate response object 
        
        responseObject = outputBuilders.makeIntroResponse(inputObject);
        
        // clean up after response

        sessionAttributes.lastSpeech = responseObject.speechObject.text;
        
        if (s3Attributes.beenToInnCounter > 0) {
            sessionAttributes.yesNo = 'go to dungeon'
        } else {
            sessionAttributes.yesNo = 'go to inn'
        }
        
        if (sessionAttributes.supportsAPL) { 
            sessionAttributes.APLbackgroundImageUrl = responseObject.APLObject.backgroundImageUrl
        }
        
        attributesManager.setSessionAttributes(sessionAttributes);

        attributesManager.setPersistentAttributes(s3Attributes);
        
        return responseObject;
    
} 

//
// buying things helpers
//


function figureOutIfWeHaveToDecideWhoGetsIt(inputObject) {
    var outputObject = {haveToDecide:false,whoGetsIt:""};
    // only need to look at armor and weapons
    // input object is the new item object
    // if we do have to decide the output object should return a properly formatted 
    // list of the names of the characters to pick from
    
    var partyList = s3Attributes.party.partyList
    
    var matchNames = [];
    
    var counter;

    for (counter = 0; counter<partyList.length; counter++) {
        if (inputObject.type === 'weapon') {
            for (var weaponSlot in partyList[counter].equipment.weapons) {
                if (weaponSlot === inputObject.thing.slot) {
                    matchNames.push(partyList[counter].characterName)
                }
            }    
        } else { // it's armor
            
        }
        
    }
    
    if (matchNames.length > 1) {
        outputObject.haveToDecide = true;
        for (counter = 0; counter<(matchNames.length - 1); counter++) {
            if (counter>0) outputObject.whoGetsIt = outputObject.whoGetsIt + ", " 
            outputObject.whoGetsIt = outputObject.whoGetsIt + matchNames[counter]
        }
        outputObject.whoGetsIt = outputObject.whoGetsIt + " or " + matchNames[(matchNames.length - 1)] 
    } else {
        outputObject.whoGetsIt = matchNames[0]
    }

    return outputObject
}

function figureOutIfWeHaveToReplaceAThing(inputObject) {
    var outputObject = {haveToReplace:false,replaceAThing:{}};
    // if we need to replace a thing the replaced thing object needs to return 
    // .goldPieces = basecost of replaced thing / 3
    // .replacedThingName = name of thing that is replaced
    // .newThingName = the name of the new thing
    
    var partyList = s3Attributes.party.partyList
    
    var counter;
    
    var whoGetsIt;
    
    for (counter = 0; counter<partyList.length; counter++) {
                if (partyList[counter].characterName === inputObject.whoGetsIt) {
                   whoGetsIt = partyList[counter]
                }
    }
    
    if (inputObject.type === 'weapon') {
        var weaponsSlot;
        for (weaponsSlot in whoGetsIt.equipment.weapons) {
               if (whoGetsIt.equipment.weapons[weaponsSlot].type) {
                   if (whoGetsIt.equipment.weapons[weaponsSlot].type === inputObject.thing.type) {
                       outputObject.haveToReplace = true;
                       outputObject.replaceAThing.goldPieces = Math.floor(whoGetsIt.equipment.weapons[weaponsSlot].baseCost/3);
                       outputObject.replaceAThing.replacedThingName = (whoGetsIt.equipment.weapons[weaponsSlot].name);
                       outputObject.replaceAThing.newThingName = inputObject.thing.name
                   }
               }
        }
    } 

    return outputObject
}


//
// switch weapon helpers
//

function figureOutWhoToSwitchTo (inputObject) {
    // input object is the parent slots object from the handler input intent
    
    var outputObject = {};
    
    if (inputObject.heroSlot.resolutions) { // they specified a type
        outputObject.whatTheySaid = inputObject.heroSlot.value;
        if (inputObject.heroSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
            outputObject.whoseWeaponSwitch = getNameFromType(inputObject.heroSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name)
            if (outputObject.whoseWeaponSwitch !== "not in party") {
                outputObject.equipment = theyHaveMoreThanOneWeapon(outputObject.whoseWeaponSwitch)
                if (utils.isEmpty(outputObject.equipment)) {
                    outputObject.whatTheySaid = outputObject.whoseWeaponSwitch;
                    outputObject.whoseWeaponSwitch = "they have less than two weapons"
                } 
            }
        } else {
            outputObject.whoseWeaponSwitch = "not in party"
        }
    } else { // they specified a name
        outputObject.whatTheySaid = inputObject.nameSlot.value;
        if (inputObject.nameSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
            outputObject.whoseWeaponSwitch = getTypeFromName(inputObject.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name)
            if (outputObject.whoseWeaponSwitch !== "not in party") {
                outputObject.whoseWeaponSwitch = inputObject.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name    
                outputObject.equipment = theyHaveMoreThanOneWeapon(outputObject.whoseWeaponSwitch)
                if (utils.isEmpty(outputObject.equipment)) {
                    outputObject.whoseWeaponSwitch = "they have less than two weapons"
                    outputObject.whatTheySaid = inputObject.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
                }                     
            } else {
                outputObject.whatTheySaid = inputObject.nameSlot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            }
        } else {
            outputObject.whoseWeaponSwitch = "not in party"
        }   
    }
    
    return outputObject
}

function getWeaponToSwitchTo (inputObject) {
    // inputobject is character.equipment
    
    var outputObject = inputObject.currentWeapon; // this is for safety and should probably be eliminated
    
    for (var weaponObject in inputObject.weapons) {
        if (inputObject.weapons[weaponObject].name) {
            if (inputObject.weapons[weaponObject] !== inputObject.currentWeapon) return inputObject.weapons[weaponObject]
        }
    }
    
    return outputObject
}

function theyHaveMoreThanOneWeapon (inputObject) {
    
    // this function comes back empty if they don't have more than one weapon
    // it returns the characters equipment if they do have more than one
    // it seemed like a good idea at the time
    
    var outputObject;
    var partyList = s3Attributes.party.partyList;
    
    var counter;
    var characterEquipment;
    
    for (counter = 0; counter<partyList.length; counter++) {
        if (partyList[counter].characterName === inputObject) {
            characterEquipment = partyList[counter].equipment;
            if (partyList[counter].characterGender === 'boy' ) {
                characterEquipment.pronouns = metaData.genderWords.BOY
            } else {
                characterEquipment.pronouns = metaData.genderWords.GIRL
            }
            counter = partyList.length;
        }
    }
    
    var weaponObject = utils.getWeaponStatus(characterEquipment.weapons);
    
    var weaponInObject;
    
    counter = 0;
    
    for (weaponInObject in weaponObject ) {
        if (utils.isEmpty(weaponObject[weaponInObject].slotWeapon) === false) counter++;
    }
    
    if (counter > 1) {
        outputObject = characterEquipment;
    } else {
        outputObject = {}
    }
        
    return outputObject
}

function getTypeFromName (inputObject) {
    
    var outputObject = 'not in party';
    
    for (var partyCounter = 0; partyCounter<s3Attributes.party.partyList.length; partyCounter++) {
        if (s3Attributes.party.partyList[partyCounter].characterName === inputObject) {
            outputObject = s3Attributes.party.partyList[partyCounter].characterClass;
            partyCounter = s3Attributes.party.partyList.length
        }
    }
    
    return outputObject
}

function getNameFromType (inputObject) {
    
    var outputObject = 'not in party';
    
    for (var partyCounter = 0; partyCounter<s3Attributes.party.partyList.length; partyCounter++) {
        if (s3Attributes.party.partyList[partyCounter].characterClass === inputObject) {
            outputObject = s3Attributes.party.partyList[partyCounter].characterName;
            partyCounter = s3Attributes.party.partyList.length
        }
    }
    
    return outputObject
}

//
// filling  object helpers
//

function fillEmptyS3Object () {
    var outputObject = {};
    
    var NPCbabble = {speechOrder:[],speechCounter:0};
    NPCbabble.speechOrder = utils.makeRandomList(metaData.RANDOMNPCSPEECHES.length,metaData.RANDOMNPCSPEECHES.length);
    
    outputObject.NPCbabble = NPCbabble;
    outputObject.beenToIntroCounter = 0;
    outputObject.beenToInnCounter = 0;
    outputObject.beenToDungeonCounter = 0;
    outputObject.holdGoldCounter = 0;
    outputObject.currentRoom = 'lobby';
    outputObject.purchasedNextLevelAndNotUsedItYet = false;
    outputObject.hasCompletedThisLevel = false;
    outputObject.combatObject = {};
    outputObject.previousNPCList = {namesList:[],descriptionsList:[],boyVoicesList:[],girlVoicesList:[]};
    
    return outputObject
}

function fillInputObjectBeforeGoingToDungeon () {
    var outputObject = {};
    
    outputObject.beenToDungeonCounter = (s3Attributes.beenToDungeonCounter + 1);
    outputObject.dungeonLevel = s3Attributes.party.currentDungeonLevel;
    
    if (outputObject.beenToDungeonCounter === 1) {
        var newDungeon = dungeonUtils.makeADungeonLevel({dungeonLevel:outputObject.dungeonLevel, NPCList:s3Attributes.previousNPCList});
        s3Attributes.currentDungeon  = newDungeon.dungeonObject;    
    }
    
    if (newDungeon) s3Attributes.previousNPCList = newDungeon.updatedNPCList;
    
    outputObject.currentDungeon = s3Attributes.currentDungeon;
    outputObject.dungeonRoom = 0;
    outputObject.supportsAPL = sessionAttributes.supportsAPL;
    
    var j;
                
    for (j=0; j<s3Attributes.party.partyList.length; j++) {
        s3Attributes.party.partyList[j].atTheInn = false
    }
    
    s3Attributes.combatObject = fightUtils.makeCombatObject({partyList:s3Attributes.party.partyList, 
                                                            monsterGroups:s3Attributes.currentDungeon[0].roomMonsterGroups})
                                                            
    return outputObject
}

function fillInputObjectBeforeGoingToInn () {
    var outputObject = {};
    
    outputObject.progress = s3Attributes.party.bossesDefeated;
    outputObject.partyList = s3Attributes.party.partyList;
    outputObject.hasUnlockedNextLevel = s3Attributes.purchasedNextLevelAndNotUsedItYet;
    outputObject.hasCompletedThisLevel = s3Attributes.hasCompletedThisLevel;
    outputObject.dungeonLevel = s3Attributes.party.currentDungeonLevel;
    outputObject.dungeonRoom =  s3Attributes.party.currentDungeonRoom;
    outputObject.beenToInnCounter = s3Attributes.beenToInnCounter;
    outputObject.supportsAPL = sessionAttributes.supportsAPL;
    
    return outputObject;
}

function initializeSessionAttributes(inputObject) {
    var outputObject = {}
    
    outputObject.previousIntent = 'none';
    outputObject.currentIntent = 'launch';
    outputObject.supportsAPL = utils.supportsAPL(inputObject);
    outputObject.inCombat = false;
    outputObject.lastSpeech = '';
    outputObject.yesNo = '';

    return outputObject
}

//
// fight helpers
//

function fillAttackStatusObject (inputObject) {
    // input object is the existing combat object
    
    console.log('in fill attack status object and input object is ', inputObject)
    
    var outputObject = [];
    var numberOfMonstersInRoom = 0;
    var i;
    
    var oneTurnOfCombat = fightUtils.makeOneTurnOfCombat(inputObject);
    
    s3Attributes.combatObject = oneTurnOfCombat.combatObject;
    
    outputObject.attackStatus = oneTurnOfCombat.combatResult;
    
    for (i=0; i<outputObject.attackStatus.length; i++) { // this figures out if we need to announce a level up for a char killing a monster
        var thisAttack = outputObject.attackStatus[i]
        if ((thisAttack.attackType === 'character') && (thisAttack.resultType === 'killed')) {
            // XP is included in the attackstatus object when character kills monster
            var whoKilledIt;
            for (var counter = 0; counter<s3Attributes.party.partyList.length; counter++) {
                if (s3Attributes.party.partyList[counter].characterName === thisAttack.characterName) {
                    whoKilledIt = s3Attributes.party.partyList[counter];
                    counter = s3Attributes.party.partyList.length;
                }
            }
            // if char's XP will be over the cap for their current level they need to be told about level up
            if (whoKilledIt.characterLevel<30) {
                  if ((whoKilledIt.XP + thisAttack.XP)>metaData.LEVELUP[(whoKilledIt.characterLevel + 1)]) {
                    outputObject.levelUp = (whoKilledIt.characterLevel + 1)
                    for (var levelUpCounter = 0; levelUpCounter<levelUpData.length; levelUpCounter++) {
                        if (levelUpData[levelUpCounter].className === whoKilledIt.characterClass) {
                            outputObject.levelUpObject = levelUpData[levelUpCounter].unlockTable[outputObject.levelUp];
                            levelUpCounter = levelUpData.length
                        }
                    }
                    
                }
            }                
        }
    }

    outputObject.nextToAct = oneTurnOfCombat.nextToAct;

    for (i=0;i<s3Attributes.combatObject.monstersList.length; i++) {
        numberOfMonstersInRoom = numberOfMonstersInRoom + s3Attributes.combatObject.monstersList[i].monsterNumber
    }
    
    if (numberOfMonstersInRoom === 0){
        outputObject.clearedTheRoom = true;
        sessionAttributes.inCombat = false
    } else {
        outputObject.clearedTheRoom = false;
        sessionAttributes.inCombat = true
    }
    
    
    outputObject.supportsAPL = sessionAttributes.supportsAPL;
    
    // outputObject is the results of the attacks from this round of combat formatted
    // for the outputbuilder. currently there is also some debug info for the combat balancing
    
    console.log('in fill attack status object and output object is ', outputObject)
   
    return outputObject
}

function updateAttributesAfterFight (inputObject) {
    var outputObject = {};
    
    if ((inputObject.theyWantToFightTheNPC) || 
        (inputObject.nobodyToFightHere) || 
        (inputObject.nobodyLeftToFightHere) || 
        (inputObject.monsterSpecified) ||
        (inputObject.abilitySpecified) ||
        (inputObject.abilityUnknown)) return outputObject
    
    var updatedMonsterInfo = s3Attributes.combatObject.monstersList;
    var currentMonsterGroup = s3Attributes.currentDungeon[s3Attributes.party.currentDungeonRoom].roomMonsterGroups;
    
    var i;
    var j;
    
    for (i=0; i<updatedMonsterInfo.length; i++) {
        for (j=0; j<currentMonsterGroup[i].groupList.length; j++) {
            currentMonsterGroup[i].groupList[j].health = updatedMonsterInfo[i].groupList[j].health    
        }    
    }

    if (inputObject.nextToAct === 'party wiped out') {
        // reset the party attributes and put them back in the inn
        for (i=0; i<s3Attributes.party.partyList.length; i++) {
            s3Attributes.party.partyList[i].currentHealth = s3Attributes.party.partyList[i].baseHealth     
        }
        s3Attributes.currentRoom = 'inn';
        sessionAttributes.inCombat = false;

    } else {
        var updatedCharacterInfo = s3Attributes.combatObject.partyList;
        for (i=0; i<updatedCharacterInfo.length; i++) {
            s3Attributes.party.partyList[i].currentHealth = updatedCharacterInfo[i].health;
            s3Attributes.party.partyList[i].atTheInn = updatedCharacterInfo[i].atTheInn;
        }
        for (i=0; i<inputObject.attackStatus.length; i++) { // award XP
            var thisAttack = inputObject.attackStatus[i];
            if ((thisAttack.attackType === 'character') && (thisAttack.resultType === 'killed')) {
                // XP is included in the attackstatus object when character kills monster
                var whoKilledIt;
                for (var counter = 0; counter<s3Attributes.party.partyList.length; counter++) {
                    if (s3Attributes.party.partyList[counter].characterName === thisAttack.characterName) {
                        whoKilledIt = s3Attributes.party.partyList[counter];
                        whoKilledIt.XP = whoKilledIt.XP + thisAttack.XP;
                        counter = s3Attributes.party.partyList.length;
                    }
                }
                // if char's XP is over the cap for their current level they need to level up
                if (whoKilledIt.characterLevel<30) {
                    if (whoKilledIt.XP>metaData.LEVELUP[(whoKilledIt.characterLevel + 1)]) {
                        whoKilledIt.characterLevel = whoKilledIt.characterLevel + 1;
                        // add level up enhancement
                        whoKilledIt = characterUtils.levelUp(whoKilledIt);
                    }
                }                
            }
        }
    }
    
    return outputObject
}

// This handler acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        BriberyIntentHandler,
        SwitchWeaponIntentHandler,
        ExamineRoomIntentHandler,
        BackFromPurchaseHandler,
        LaunchRequestHandler,
        BuyThingsIntentHandler,
        UnlockedLevelIntentHandler,
        FightIntentHandler,
        GoToRoomIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        HeroOnlyIntentHandler,
        StatusIntentHandler,
        HelpIntentHandler,
        TalkIntentHandler,
        SwearingIntentHandler,
        RepeatIntentHandler,
        ResetAttributesIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler,
        FallbackIntentHandler,
    ) // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    .withPersistenceAdapter( new persistenceAdapter.S3PersistenceAdapter({bucketName: 'spidertemplepersistence'}))
    .addErrorHandlers(
        ErrorHandler)
    .lambda();
