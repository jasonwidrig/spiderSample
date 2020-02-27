const totalBosses = 3;
const partySize = 4;

const debug = true;

const dungeonRoomsPerLevel = 5;
const finishedTheGameRoomNumber = -24;
const unknownLevelRoomNumber = -32;

const levelUpXPReqs = [0,10,30,70,125,250,500,1000,2500,5000,7500,10000,12500,15000,17500,20000]

const theInnMissionStatement = 'They have been petitioned by the High Lord to venture into the catacombs and tunnels beneath the Spider Cult Temple to find out what is going on ' +
                            'and possibly find the means to take down the Cult for good. There are rumors of horrors and beasts of all types but there are also rumblings of ' +
                            'treasures and strong magical artifacts. ';
                            
const theInnMissionSummary = 'Welcome back to the Inn. There is still much to do. The Spider Cult has been weakened but has not been wiped out. ';

const theInnSetup = 'In the back corner of the bustling Tavern, in the heart of Widowdale, sits a group of adventurers finishing one last meal before they embark on their adventure. ';

const theFirstTimeIntro = 'Welcome to the dungeon. This is a Fantasy Role-Playing Adventure, pitting your heroes against an ancient evil. ' +
                            'Explore the dungeons beneath the sinister Spider Cult Temple to find the root of the evil and take it down. ' +
                            'Are you ready to meet your Heroes? ';

const theSubsequentTimesIntro = 'Welcome back to the Dungeon. Are you ready to meet your Heroes? ';  

const defeatedWords = ['vanquished', 'destroyed', 'wiped out', 'eliminated'];

const wieldingWords = ['wields', 'brandishes', 'holds', 'grips'];

const randomNPCSpeeches = [
        'XYZZY',
        'plover',
        'wherever you go, there you are',
        'I eat cannibals',
        'I forgot what I was going to say',
        'I love what you are wearing',
        'I invented breakfast cereal',
        "My god, it's full of stars",
        'I think I will call my hat Hattie',
        'Never trust a man what is made of gas',
        'I am totally into role playing',
        'I hate Mondays!',
        'On your deathbed, you will have total conciousness',
        "My old man's a dustman"
];

const randomMonsterSpeeches = [
        'GRRRRRnnnngggghhhh',
];

const monsterVoices = [
         //   function makeItHans (inputObject) { return "<voice name='Hans'><lang xml:lang='de-DE'>" + inputObject + "</lang></voice>"},
           // function makeItEnrique (inputObject) { return "<voice name='Enrique'><lang xml:lang='es-es'>" + inputObject + "</lang></voice>"},
            //function makeItGiorgio (inputObject) { return "<voice name='Giorgio'><lang xml:lang='it-IT'>" + inputObject + "</lang></voice>"},
            function makeItTakumi (inputObject) { return "<voice name='Takumi'><lang xml:lang='ja-JP'>" + inputObject + "</lang></voice>"},
        //    function makeItMathieu (inputObject) { return "<voice name='Mathieu'><lang xml:lang='fr-FR'>" + inputObject + "</lang></voice>"},
];
       
    
const NPCBoyVoices = [
            function makeItJoey (inputObject) { return "<voice name='Joey'><lang xml:lang='en-US'>" + inputObject + "</lang></voice>"},
            function makeItJustin (inputObject) { return "<voice name='Justin'><lang xml:lang='en-US'>" + inputObject + "</lang></voice>"},
            function makeItMatthew (inputObject) { return "<voice name='Matthew'><lang xml:lang='en-US'>" + inputObject + "</lang></voice>"},
            function makeItAditi (inputObject) { return "<voice name='Aditi'><lang xml:lang='en-IN'>" + inputObject + "</lang></voice>"},
];
        
const NPCGirlVoices = [
            function makeItNicole (inputObject) { return "<voice name='Nicole'><lang xml:lang='en-AU'>" + inputObject + "</lang></voice>"},
            function makeItIvy (inputObject) { return "<voice name='Ivy'><lang xml:lang='en-US'>" + inputObject + "</lang></voice>"},
            function makeItJoanna (inputObject) { return "<voice name='Joanna'><lang xml:lang='en-US'>" + inputObject + "</lang></voice>"},
            function makeItKendra (inputObject) { return "<voice name='Kendra'><lang xml:lang='en-US'>" + inputObject + "</lang></voice>"},
            function makeItRaveena (inputObject) { return "<voice name='Raveena'><lang xml:lang='en-IN'>" + inputObject + "</lang></voice>"},
];

const NPCLevelSpeeches =  [
        ['There are monsters ahead and you will have to defeat them to move on','I hear that there is a big boss of a monster down there','I have been told that there is a shop after that big monster'],
        ['The first thing he says on level 1','The second thing he says on level 1','The third thing he says on level 1'],
        ['The first thing he says on level 2','The second thing he says on level 2','The third thing he says on level 2'],
        ['The first thing he says on level 3','The second thing he says on level 3','The third thing he says on level 3'],
        ['The first thing he says on level 4','The second thing he says on level 4','The third thing he says on level 4'],
        ['The first thing he says on level 5','The second thing he says on level 5','The third thing he says on level 5'],
        ['The first thing he says on level 6','The second thing he says on level 6','The third thing he says on level 6'],
        ['The first thing he says on level 7','The second thing he says on level 7','The third thing he says on level 7'],
        ['The first thing he says on level 8','The second thing he says on level 8','The third thing he says on level 8'],
        ['The first thing he says on level 9','The second thing he says on level 9','The third thing he says on level 9'],
    ];

const boyGenderWords = {heShe: 'he', hisHer: 'his', himHer: 'him', hisHers: 'his', HeShe: 'He', HisHer: 'His', HimHer: 'Him', HisHers: 'His', himselfHerself: 'himself', HimselfHerself: 'Himself' }

const girlGenderWords = {heShe: 'she', hisHer: 'her', himHer: 'her', hisHers: 'hers',  HeShe: 'She', HisHer: 'Her', HimHer: 'Her', HisHers: 'Hers', himselfHerself: 'herself', HimselfHerself: 'Herself'  }

const boyAdjectives = {hair: ['long hair', 'bald'], height: ['tall', 'short'], shape: ['slim', 'round'], color: ['pale', 'dark'], face: ['bearded', 'clean-shaven']}

const girlAdjectives = {hair: ['long hair', 'blonde'], height: ['tall', 'short'], shape: ['slim', 'round'], color: ['pale', 'dark'], face: ['freckle faced', 'clean-shaven']}
        
const metaData = {
    TOTALBOSSES: totalBosses,
    PARTYSIZE: partySize,
    innText: { 
        MISSIONSTATEMENT: theInnMissionStatement,
        MISSIONSUMMARY: theInnMissionSummary, 
        SETUP: theInnSetup,

    },
    introText: {
        FIRSTTIME: theFirstTimeIntro,
        SUBSEQUENTTIMES: theSubsequentTimesIntro,    
    },
    DEFEATEDWORDS: defeatedWords,
    WIELDINGWORDS: wieldingWords,
    DUNGEONROOMSPERLEVEL: dungeonRoomsPerLevel,
    FINISHEDALLTHELEVELSROOM: finishedTheGameRoomNumber,
    UNKONWNLEVELROOM: unknownLevelRoomNumber,
    RANDOMNPCSPEECHES: randomNPCSpeeches,
    RANDOMMONSTERSPEECHES: randomMonsterSpeeches,
    NPCLEVELSPEECHES: NPCLevelSpeeches,
    MONSTERVOICES:monsterVoices,
    NPCVoices: {
        BOY: NPCBoyVoices,
        GIRL: NPCGirlVoices
    },
    DEBUG: debug,
    NPCGIRLVOICES:NPCGirlVoices,
    NPCBOYVOICES:NPCBoyVoices,
    LEVELUP:levelUpXPReqs,
    genderWords: {
        BOY: boyGenderWords,
        GIRL: girlGenderWords
    },
    genderAdjectives: {
        BOY: boyAdjectives,
        GIRL: girlAdjectives
    }
}

exports.metaData = metaData;