

var monstersData = {
    monsterType: 'monster',
    monstersList: [ 
                    {monsterName: 'Orc',monsterType: 'strong',monsterPlural:'Orcs', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:5, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3}, 
                    {monsterName: 'Knoll',monsterType: 'strong', monsterPlural:'Knolls', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:5, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName: 'Troll',monsterType: 'strong', monsterPlural:'Trolls', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:5, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName: 'Cult Guard',monsterType: 'strong', monsterPlural:'Cult Guards', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:5, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName: 'Minotaur',monsterType: 'large', monsterPlural:'Minotaur', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:4, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName: 'Ogre',monsterType: 'large', monsterPlural:'Ogres', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:4, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName: 'Golem',monsterType: 'large', monsterPlural:'Golem', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:4, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName:'Giant',monsterType: 'massive', monsterPlural:'Giants', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:3, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName:'Dragon',monsterType: 'massive', monsterPlural:'Dragons', monsterAttackLevel:9, monsterDefendLevel:4, maxGroupSize:3, baseHealth:4, numberOfHealthDice:1, healthDiceSize:8, baseXP:5,XPMultiplier:3},
                    {monsterName: 'Rat',monsterType: 'vermin', monsterPlural:'Rats', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:5, baseHealth:1},
                    {monsterName: 'Bat',monsterType: 'vermin', monsterPlural:'Bats', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:5, baseHealth:1},
                    {monsterName: 'Large Spider',monsterType: 'vermin', monsterPlural:'Large Spiders', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:5, baseHealth:1},
                    {monsterName: 'Goblin',monsterType: 'minion', monsterPlural:'Goblins', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:4, baseHealth:1},
                    {monsterName: 'Wolf',monsterType: 'minion', monsterPlural:'Wolves', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:4, baseHealth:1},
                    {monsterName: 'Skeleton',monsterType: 'minion', monsterPlural:'Skeletons', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:4, baseHealth:1},
                    {monsterName: 'Kobold',monsterType: 'minion', monsterPlural:'Kobolds', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:4, baseHealth:1},
                    {monsterName: 'Zombie',monsterType: 'minion', monsterPlural:'Zombies', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:4, baseHealth:1},
                    {monsterName: 'Gremlin',monsterType: 'minion', monsterPlural:'Gremlins', monsterAttackLevel:4, monsterDefendLevel:4, maxGroupSize:4, baseHealth:1},
                ],
    // helper functions
    makeAllTypeArray: function (monsterType)  {
        var outputObject = []
        var i;
        var j = 0;
        for (i=0; i<this.monstersList.length; i++) {
            if (this.monstersList[i].monsterType === monsterType) {
                outputObject[j] = this.monstersList[i];
                j++;
            }
        }
        return outputObject
    }
     
}

var NPCsData = {
    monsterType: 'NPC',
    monstersList: {
        descriptions:['Tall','Weird','Strange','Skinny','Sneaky','Sticky','Chunky','Greasy','Oily','Sweaty','Grimy'],
        boyNames:['Billy','Willy','Chuck','Steve','Timmy','Jimmy','Bobby','Pete','Karl','Gustav','Gaius'],
        girlNames:['Susie','Becky','Grizelda','Jenny','Carla','Kimmy','Cindy','Penny','Vicky','Sheila','Wendy'],
    },
    
};

var bossesData = {
    monsterType: 'boss',
    monstersList: {
        names:['Arch Mage','Arch Priest','Arch Bunker'],
        descriptions:['Lanky','Stanky','Cranky']
    },
};


    
var allMonstersData = {NPCsData: NPCsData, monstersData: monstersData, bossesData: bossesData}

exports.allMonstersData = allMonstersData;