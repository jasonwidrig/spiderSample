// these are all of the individual abilities
// for now they only have a name but as combat evolves
// we will add attributes and parameters to the individual attacks

/* at this point this section just exists for reference to nick's intentions
var warriorAbilities = {basicAttack:arcingAttack, 
                        specialAttacks:[switchWeaponsAttack, drinkPotionAttack,tauntAttack,chargeAttack,shieldBashAttack,whirlingAttack],
                        nonCombatAbilities:[featOfStrength]}
var thiefAbilities = {basicAttack:twoBladesAttack, 
                        specialAttacks:[switchWeaponsAttack, applyPoisionAttack,shadowStepAttack,disarmFoeAttack,smokeScreenAttack],
                        nonCombatAbilities:[findTraps, findTreasure]};
var magicuserAbilities = {basicAttack:magicUserBasicAttack, 
                        specialAttacks:[switchWeaponsAttack, castWandSpellAttack,readScrollAttack,castStaffSpellAttack,castEnergyBlastSpellAttack,whirlingStaffAttack],
                        nonCombatAbilities:[senseMagic, manipulateMagicalObjects]};
var clericAbilities = {basicAttack:clericBasicAttack, 
                        specialAttacks:[switchWeaponsAttack, useHolyWaterAttack,performLayOfHandsAttack,turnUndeadAttack,performPartyHealAttack],
                        nonCombatAbilities:[senseUndead,readTheDead]};
                        */

//basic attacks
var arcingAttack = {name: 'arcing'};
var twoBladesAttack = {name: 'two bladed'};
var magicUserBasicAttack = {name: 'magic user basic attack'};
var clericBasicAttack = {name: 'cleric basic attack'}

//special attacks
var switchWeaponsAttack = {name:'switch weapons'};
var drinkPotionAttack = {name: 'drink potion'};
var tauntAttack = {name:'taunt'};
var chargeAttack = {name:'charge'};
var shieldBashAttack = {name:'shield bash'};
var whirlingAttack = {name:'whirling'};
var applyPoisionAttack = {name:'apply poison'};
var shadowStepAttack = {name:'shadow step'};
var disarmFoeAttack = {name:'disarm foe'};
var smokeScreenAttack = {name:'smoke screen'};
var castWandSpellAttack = {name:'cast wand spell'};
var readScrollAttack = {name:'read scroll'};
var castStaffSpellAttack = {name:'cast staff spell'};
var castEnergyBlastSpellAttack = {name: 'cast energy blast spell'};
var useHolyWaterAttack = {name: 'use holy water'};
var performLayOfHandsAttack = {name: 'perform lay of hands'};
var turnUndeadAttack = {name:'turn undead'};
var performPartyHealAttack = {name:'perform party heal'};
var spinningStaffAttack = {name: 'spinning staff attack'};

//non-combat abilities
var featOfStrength = {name:'feat of strength'};
var findTraps = {name:'find traps'};
var findTreasure = {name:'find treasure'};
var senseMagic = {name: 'sense magic'}; // this ends up not being on the unlock table
var manipulateMagicalObjects = {name:'manipulate magical objects'};
var senseUndead = {name:'sense undead'};
var readTheDead = {name:'read the dead'};


var magicuserTable = [{basicAttack: magicUserBasicAttack},
                    {nonCombatAbility: manipulateMagicalObjects},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {specialAttack: switchWeaponsAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: castWandSpellAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {specialAttack: readScrollAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: spinningStaffAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {specialAttack: castStaffSpellAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: castEnergyBlastSpellAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'power level'},
                   ]

var clericTable = [{basicAttack: clericBasicAttack},
                    {specialAttack: useHolyWaterAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {specialAttack: switchWeaponsAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {specialAttack: performLayOfHandsAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {nonCombatAbility: senseUndead},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: turnUndeadAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {nonCombatAbility: readTheDead},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {specialAttack: performPartyHealAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'base health'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'power level'},
                   ]


var warriorTable = [{basicAttack: arcingAttack},
                    {nonCombatAbility: featOfStrength},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: switchWeaponsAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {specialAttack: drinkPotionAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {specialAttack: tauntAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: chargeAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {specialAttack: shieldBashAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {specialAttack: whirlingAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'power level'},
                   ]
                   
var thiefTable = [{basicAttack: twoBladesAttack},
                    {nonCombatAbility: findTraps},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: switchWeaponsAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {specialAttack: applyPoisionAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: shadowStepAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'base health'},
                    {specialAttack: disarmFoeAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {specialAttack: smokeScreenAttack},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'defense bonus'},
                    {nonCombatAbility: findTreasure},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'base health'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'defense bonus'},
                    {increasedAttribute: 'power level'},
                    {increasedAttribute: 'attack bonus'},
                    {increasedAttribute: 'base health'},
                    {increasedAttribute: 'power level'},
                   ]

var levelUpData =  [{className: 'warrior', unlockTable: warriorTable},
                        {className:'cleric', unlockTable: clericTable}, 
                        {className: 'thief', unlockTable: thiefTable},
                        {className: 'magic user', unlockTable:magicuserTable}];   
                        
exports.levelUpData = levelUpData;