const swordWords = ['thrusts','slashes','swings'];

const hammerWords = ['swings','smashes','pounds'];

const wandWords = ['zaps','shoots','blasts'];

const bladeWords = ['stabs', 'jabs', 'thrusts'];

const swordSounds = ['<audio src="soundbank://soundlibrary/swords/swords_07"/>','<audio src="soundbank://soundlibrary/swords/swords_06"/>','<audio src="soundbank://soundlibrary/swords/swords_04"/>'];

const hammerSounds = ['<audio src="soundbank://soundlibrary/wood/hits/hits_07"/>','<audio src="soundbank://soundlibrary/wood/hits/hits_01"/>','<audio src="soundbank://soundlibrary/wood/hits/hits_04"/>'];

const wandSounds = ['<audio src="soundbank://soundlibrary/air/steam/steam_04"/>','<audio src="soundbank://soundlibrary/scifi/amzn_sfx_scifi_laser_gun_fires_05"/>','<audio src="soundbank://soundlibrary/guns/futuristic/futuristic_11"/>'];

const bladeSounds = ['<audio src="soundbank://soundlibrary/human/hit_punch_slap/hit_punch_slap_06"/>','<audio src="soundbank://soundlibrary/impacts/amzn_sfx_punch_01"/>','<audio src="soundbank://soundlibrary/impacts/amzn_sfx_punch_03"/>'];

var weapons = {
                basicSword:{
                            type: 'sword',
                            name: 'a basic sword',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:1,
                            fightingWords: swordWords,
                            fightingSounds: swordSounds,
                            baseCost:10,
                            slot:'oneHand',
                }, 
                basicBlades:{
                            type: 'blades',
                            name: 'basic blades',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:1,
                            fightingWords: bladeWords,
                            fightingSounds: bladeSounds,
                            baseCost:10,
                            slot:'dual',
               },
                shinyBlades:{
                            type: 'blades',
                            name: 'shiny blades',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords: bladeWords,
                            fightingSounds: bladeSounds,
                            baseCost:20,
                            slot:'dual',
               },
                glowingBlades:{
                            type: 'blades',
                            name: 'glowing blades',
                            baseDamage: 3,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords: bladeWords,
                            fightingSounds: bladeSounds,
                            baseCost:30,
                            slot:'dual',
               },
                simpleDagger:{
                            type: 'dagger',
                            name: 'a dagger',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:1,
                            fightingWords:bladeWords,
                            fightingSounds: bladeSounds,
                            baseCost:10
                },
                shinyDagger:{
                            type: 'dagger',
                            name: 'a shiny dagger',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords:bladeWords,
                            fightingSounds: bladeSounds,
                            baseCost:20,
                            slot:'dagger',
                },
                glowingDagger:{
                            type: 'dagger',
                            name: 'a glowing dagger',
                            baseDamage: 3,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords:bladeWords,
                            fightingSounds: bladeSounds,
                            baseCost:30,
                            slot:'dagger',
                },
                simpleHammer:{
                            type: 'hammer',
                            name:'a hammer',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:1,
                            fightingWords:hammerWords,
                            fightingSounds: hammerSounds,
                            baseCost:10,
                            slot:'oneHand',
                },
                mightyHammer:{
                            type: 'hammer',
                            name:'a mighty hammer',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords:hammerWords,
                            fightingSounds: hammerSounds,
                            baseCost:20,
                            slot:'oneHand',
                },
                dwarvenMattock:{
                            type: 'hammer',
                            name:'a dwarven mattock',
                            baseDamage: 3,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords:hammerWords,
                            fightingSounds: hammerSounds,
                            baseCost:30,
                            slot:'oneHand',
                },
                magicBoltWand:{
                            type: 'wand',
                            name: 'a magic bolt wand',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:1,
                            fightingWords:wandWords,
                            fightingSounds: wandSounds,
                            baseCost:10,
                            slot:'wand',
                },
                magicColdWand:{
                            type: 'wand',
                            name: 'a magic cold wand',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords:wandWords,
                            fightingSounds: wandSounds,
                            baseCost:20,
                            slot:'wand',
                },
                magicFireWand:{
                            type: 'wand',
                            name: 'a magic fire wand',
                            baseDamage: 3,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords:wandWords,
                            fightingSounds: wandSounds,
                            baseCost:30,
                            slot:'wand',
                },
                shinySword: {
                            type: 'sword',
                            name: 'a shiny sword',
                            baseDamage: 0,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords: swordWords,
                            fightingSounds: swordSounds,                
                            baseCost:20,
                            slot:'oneHand',
                },
                glowingSword: {
                            type: 'sword',
                            name: 'a glowing sword',
                            baseDamage: 3,
                            damageDie: 6,
                            numberOfDamageDice:2,
                            fightingWords: swordWords,
                            fightingSounds: swordSounds,                
                            baseCost:30,
                            slot:'oneHand',
                },

}

exports.weapons = weapons;



