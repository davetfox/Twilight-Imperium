const canvas = document.querySelector("#starfield");
const context = canvas.getContext("2d");
const stars = [];
const starCount = 120;
const flowList = document.querySelector("#flowList");
const phaseFlowList = document.querySelector("#phaseFlowList");
const cardChecklist = document.querySelector("#cardChecklist");
const clearCardsButton = document.querySelector("#clearCards");
const selectedCards = new Set();

const flows = [
  {
    id: "strategy",
    title: "Strategy Phase",
    summary: "Start-of-phase and strategy-card choice windows.",
    steps: [
      {
        step: "Choose strategy card",
        cards: [
          {
            name: "Public Disgrace",
            type: "Action card",
            text: "When another player chooses a strategy card during the strategy phase, they must choose a different strategy card if able."
          }
        ]
      }
    ]
  },
  {
    id: "tactical",
    title: "Tactical Action and Movement",
    summary: "Activation, move permissions, and post-movement cannon windows.",
    steps: [
      {
        step: "When you activate a system",
        cards: [
          {
            name: "Scanlink Drone Network",
            type: "Technology",
            text: "When you activate a system, you may explore 1 planet in that system that contains 1 or more of your units."
          },
          {
            name: "Solar Flare",
            type: "Action card",
            text: "After you activate a system: During this movement, other players cannot use SPACE CANNON against your ships."
          },
          {
            name: "Gravity Drive",
            type: "Technology",
            text: "After you activate a system, apply +1 to the move value of 1 of your ships during this tactical action."
          }
        ]
      },
      {
        step: "After another player activates your system",
        cards: [
          {
            name: "Forward Supply Base",
            type: "Action card",
            text: "After another player activates a system that contains your units, gain 3 trade goods; another player gains 1 trade good."
          }
        ]
      },
      {
        step: "Move ships",
        cards: [
          {
            name: "Antimass Deflectors",
            type: "Technology",
            text: "Your ships can move into and through asteroid fields; other players' Space Cannon rolls against your units get -1."
          },
          {
            name: "Light/Wave Deflector",
            type: "Technology",
            text: "Your ships can move through systems that contain other players' ships."
          },
          {
            name: "Fighter II",
            type: "Unit upgrade",
            text: "This unit may move without being transported; excess fighters count against fleet pool."
          }
        ]
      },
      {
        step: "Space Cannon Offense",
        cards: [
          {
            name: "Solar Flare",
            type: "Action card",
            text: "After you activate a system: During this movement, other players cannot use SPACE CANNON against your ships."
          },
          {
            name: "Experimental Battlestation",
            type: "Action card",
            text: "After another player moves ships into a system during a tactical action, choose 1 of your space docks; that space dock uses Space Cannon 5 (x3) against ships in the active system."
          },
          {
            name: "Antimass Deflectors",
            type: "Technology",
            text: "Your ships can move into and through asteroid fields; other players' Space Cannon rolls against your units get -1."
          },
          {
            name: "Plasma Scoring",
            type: "Technology",
            text: "When 1 or more of your units use Bombardment or Space Cannon, 1 of those units may roll 1 additional die."
          },
          {
            name: "Graviton Laser System",
            type: "Technology",
            text: "You may exhaust this card before units use Space Cannon; hits must be assigned to non-fighter ships if able."
          },
          {
            name: "PDS II",
            type: "Unit upgrade",
            text: "You may use this unit's Space Cannon against ships that are adjacent to this unit's system."
          }
        ]
      },
      {
        step: "End of tactical action",
        cards: [
          {
            name: "Dark Energy Tap",
            type: "Technology",
            text: "After you perform a tactical action in a frontier-token system, explore that token; your ships can retreat into adjacent systems that do not contain other players' units."
          }
        ]
      }
    ]
  },
  {
    id: "combat",
    title: "Space Combat and Dice",
    summary: "Start windows, AFB, retreat, combat rolls, hits, sustain, and end-round effects.",
    steps: [
      {
        step: "Start of combat",
        cards: [
          {
            name: "Reveal Prototype",
            type: "Action card",
            text: "At the start of a combat: Spend 4 resources to research a unit upgrade that matches a participating unit type."
          },
          {
            name: "Assault Cannon",
            type: "Technology",
            text: "At the start of a space combat in a system that contains 3 or more of your non-fighter ships, your opponent must destroy 1 of their non-fighter ships."
          }
        ]
      },
      {
        step: "Start of combat round",
        cards: [
          {
            name: "Skilled Retreat",
            type: "Action card",
            text: "At the start of a combat round, move all of your ships from the active system to an adjacent system; combat ends in a draw and you place a command token."
          },
          {
            name: "Emergency Repairs",
            type: "Action card",
            text: "At the start or end of a combat round: Repair all of your units that have Sustain Damage in the active system."
          },
          {
            name: "Supercharge",
            type: "Technology",
            text: "At the start of a combat round, you may exhaust this card to apply +1 to each of your units' combat rolls during this combat round."
          },
          {
            name: "Fighter Prototype",
            type: "Action card",
            text: "At the start of the first round of a space combat, apply +2 to your fighters' combat rolls during this round."
          }
        ]
      },
      {
        step: "Anti-Fighter Barrage",
        cards: [
          {
            name: "Waylay",
            type: "Action card",
            text: "Before you roll dice for Anti-Fighter Barrage: Hits from this roll are produced against all ships."
          },
          {
            name: "Destroyer II",
            type: "Unit upgrade",
            text: "Anti-Fighter Barrage 6 (x3)."
          }
        ]
      },
      {
        step: "Announce retreats",
        cards: [
          {
            name: "Rout",
            type: "Action card",
            text: "At the start of the Announce Retreats step of space combat, if you are the defender, the attacker must announce a retreat if able."
          },
          {
            name: "Dark Energy Tap",
            type: "Technology",
            text: "Your ships can retreat into adjacent systems that do not contain other players' units."
          }
        ]
      },
      {
        step: "Roll combat dice",
        cards: [
          {
            name: "Supercharge",
            type: "Technology",
            text: "Apply +1 to each of your units' combat rolls during this combat round."
          }
        ]
      },
      {
        step: "Assign hits and Sustain Damage",
        cards: [
          {
            name: "Shields Holding",
            type: "Action card",
            text: "Before you assign hits to your ships during a space combat: Cancel up to 2 hits."
          },
          {
            name: "Direct Hit",
            type: "Action card",
            text: "After another player's ship uses Sustain Damage to cancel a hit produced by your units or abilities: Destroy that ship."
          },
          {
            name: "Dreadnought II",
            type: "Unit upgrade",
            text: "This unit cannot be destroyed by Direct Hit."
          }
        ]
      },
      {
        step: "After units are destroyed",
        cards: [
          {
            name: "Infantry II",
            type: "Unit upgrade",
            text: "After this unit is destroyed, roll 1 die; on a result of 6 or greater, place the unit card and return it on your next turn."
          }
        ]
      }
    ]
  },
  {
    id: "invasion",
    title: "Invasion, Bombardment, and Ground Combat",
    summary: "Planetary assault windows from start of invasion through control changes.",
    steps: [
      {
        step: "Start of invasion",
        cards: [
          {
            name: "Bunker",
            type: "Action card",
            text: "At the start of an invasion, apply -4 to bombardment rolls against your planets during this invasion."
          },
          {
            name: "Disable",
            type: "Action card",
            text: "At the start of an invasion, opponents' PDS lose Planetary Shield and Space Cannon during this invasion."
          },
          {
            name: "War Sun",
            type: "Unit upgrade",
            text: "Other players' units in this system lose Planetary Shield."
          }
        ]
      },
      {
        step: "Bombardment and Space Cannon",
        cards: [
          {
            name: "Plasma Scoring",
            type: "Technology",
            text: "When 1 or more of your units use Bombardment or Space Cannon, 1 of those units may roll 1 additional die."
          },
          {
            name: "Graviton Laser System",
            type: "Technology",
            text: "You may exhaust this card before units use Space Cannon; hits must be assigned to non-fighter ships if able."
          },
          {
            name: "PDS II",
            type: "Unit upgrade",
            text: "You may use this unit's Space Cannon against ships that are adjacent to this unit's system."
          }
        ]
      },
      {
        step: "After Bombardment",
        cards: [
          {
            name: "X-89 Bacterial Weapon Omega",
            type: "Technology",
            text: "After Bombardment, if at least 1 infantry was destroyed, you may destroy all opponent infantry on that planet."
          }
        ]
      },
      {
        step: "Commit ground forces",
        cards: [
          {
            name: "Ghost Squad",
            type: "Action card",
            text: "After a player commits units to land on a planet you control, you may move your ground forces among planets in the active system."
          }
        ]
      },
      {
        step: "Start of ground combat",
        cards: [
          {
            name: "Magen Defense Grid",
            type: "Technology",
            text: "You may exhaust this card at the start of a round of ground combat to prevent your opponent from making combat rolls, or use the Omega text to produce 1 hit on a planet with your structures."
          },
          {
            name: "Emergency Repairs",
            type: "Action card",
            text: "At the start or end of a combat round: Repair all of your units that have Sustain Damage in the active system."
          },
          {
            name: "Supercharge",
            type: "Technology",
            text: "At the start of a combat round, you may exhaust this card to apply +1 to each of your units' combat rolls during this combat round."
          }
        ]
      },
      {
        step: "After winning ground combat",
        cards: [
          {
            name: "Dacxive Animators",
            type: "Technology",
            text: "After you win a ground combat, you may place 1 infantry from your reinforcements on that planet."
          }
        ]
      },
      {
        step: "After gaining control",
        cards: [
          {
            name: "Integrated Economy",
            type: "Technology",
            text: "After you gain control of a planet, you may produce units on that planet up to its resource value."
          }
        ]
      }
    ]
  },
  {
    id: "production",
    title: "Production",
    summary: "Cost, capacity, and component-action production effects.",
    steps: [
      {
        step: "When units use Production",
        cards: [
          {
            name: "War Machine",
            type: "Action card",
            text: "When 1 or more of your units use Production, those units have +4 total production and the combined cost of the produced units is reduced by 1."
          },
          {
            name: "Sarween Tools",
            type: "Technology",
            text: "When 1 or more of your units use Production, reduce the combined cost of produced units by 1."
          },
          {
            name: "AI Development Algorithm",
            type: "Technology",
            text: "When units use Production, reduce the combined cost by the number of unit upgrades you own."
          },
          {
            name: "Space Dock II",
            type: "Unit upgrade",
            text: "Increases Production and allows up to 3 fighters in this system to not count against your ships' capacity."
          }
        ]
      },
      {
        step: "Action-phase production",
        cards: [
          {
            name: "Sling Relay",
            type: "Technology",
            text: "Action: Exhaust this card to produce 1 ship in any system that contains 1 of your space docks."
          },
          {
            name: "X-89 Bacterial Weapon",
            type: "Technology",
            text: "Action: Exhaust this card and choose 1 or more of your ships with Bombardment; destroy all infantry on one planet in that system."
          }
        ]
      }
    ]
  },
  {
    id: "research",
    title: "Researching Technology and Unit Upgrades",
    summary: "Cards that alter what can be researched or when a unit upgrade is gained.",
    steps: [
      {
        step: "When researching a unit upgrade",
        cards: [
          {
            name: "AI Development Algorithm",
            type: "Technology",
            text: "When you research a unit upgrade, you may exhaust this card to ignore any 1 prerequisite."
          },
          {
            name: "Reveal Prototype",
            type: "Action card",
            text: "At the start of a combat: Spend 4 resources to research a unit upgrade that matches a participating unit type."
          }
        ]
      }
    ]
  },
  {
    id: "status",
    title: "Status Phase",
    summary: "Draw, command-token, and cleanup modifications.",
    steps: [
      {
        step: "Draw action cards",
        cards: [
          {
            name: "Neural Motivator",
            type: "Technology",
            text: "During the status phase, draw 2 action cards instead of 1."
          }
        ]
      },
      {
        step: "Gain and redistribute command tokens",
        cards: [
          {
            name: "Hyper Metabolism",
            type: "Technology",
            text: "During the status phase, gain 3 command tokens instead of 2."
          }
        ]
      }
    ]
  },
  {
    id: "agenda",
    title: "Agenda Phase",
    summary: "Reveal, vote, and outcome windows.",
    steps: [
      {
        step: "Start of agenda phase",
        cards: [
          {
            name: "Ancient Burial Sites",
            type: "Action card",
            text: "At the start of the agenda phase, exhaust all cultural planets owned by 1 player."
          }
        ]
      },
      {
        step: "After an agenda is revealed",
        cards: [
          {
            name: "Assassinate Representative",
            type: "Action card",
            text: "After an agenda is revealed, choose 1 player; that player cannot vote on this agenda."
          },
          {
            name: "Hack Election",
            type: "Action card",
            text: "After an agenda is revealed, alter the voting order; the Omega version makes you vote last."
          },
          {
            name: "Rider cycle",
            type: "Action card",
            text: "After an agenda is revealed: You cannot vote on this agenda. Predict aloud an outcome; if correct, resolve the rider reward."
          }
        ]
      },
      {
        step: "After votes are cast",
        cards: [
          {
            name: "Bribery",
            type: "Action card",
            text: "After the speaker votes on an agenda, spend any number of trade goods to cast that many additional votes for your chosen outcome."
          },
          {
            name: "Distinguished Councilor",
            type: "Action card",
            text: "After you cast votes on an outcome of an agenda: Cast 5 additional votes for that outcome."
          },
          {
            name: "Predictive Intelligence",
            type: "Technology",
            text: "When you cast votes, you may exhaust this card to cast 3 additional votes; if the outcome you voted for is not resolved, exhaust this card."
          }
        ]
      },
      {
        step: "When elected or outcome resolves",
        cards: [
          {
            name: "Confusing Legal Text / Confounding Legal Text",
            type: "Action card",
            text: "When you or another player is elected, redirect the elected-player outcome to you."
          }
        ]
      }
    ]
  },
  {
    id: "action",
    title: "Action Phase Turn Structure",
    summary: "Start-turn, strategic action, component action, and end-turn windows.",
    steps: [
      {
        step: "Start of another player's turn",
        cards: [
          {
            name: "Extreme Duress",
            type: "Action card",
            text: "At the start of another player's turn, if they have a readied strategy card, punish them if their next action is not strategic."
          }
        ]
      },
      {
        step: "Start of your turn",
        cards: [
          {
            name: "Transit Diodes",
            type: "Technology",
            text: "You may exhaust this card at the start of your turn during the action phase to move up to 4 ground forces onto controlled planets."
          }
        ]
      },
      {
        step: "During your turn",
        cards: [
          {
            name: "Fleet Logistics",
            type: "Technology",
            text: "During each of your turns of the action phase, you may perform 2 actions instead of 1."
          }
        ]
      },
      {
        step: "When another player would perform a strategic action",
        cards: [
          {
            name: "Coup d'Etat",
            type: "Action card",
            text: "When another player would perform a strategic action, end their turn; the strategy card is not resolved or exhausted."
          }
        ]
      },
      {
        step: "When action cards are played or discarded",
        cards: [
          {
            name: "Sabotage",
            type: "Action card",
            text: "When another player plays an action card other than Sabotage: Cancel that action card."
          },
          {
            name: "Reverse Engineer",
            type: "Action card",
            text: "When another player discards an action card that has a component action, take that action card."
          }
        ]
      },
      {
        step: "End of your turn",
        cards: [
          {
            name: "Predictive Intelligence",
            type: "Technology",
            text: "At the end of your turn, you may exhaust this card to redistribute command tokens."
          }
        ]
      }
    ]
  }
];

const basePhases = [
  {
    id: "strategy",
    number: "01",
    title: "Strategy Phase",
    steps: [
      {
        id: "choose-strategy-card",
        title: "Choose strategy options",
        text: "Speaker selects first, then players continue clockwise until each player has selected. Initiative order is set by the selected options."
      }
    ]
  },
  {
    id: "action",
    number: "02",
    title: "Action Phase",
    steps: [
      {
        id: "start-other-turn",
        title: "Start of another player's turn",
        text: "Open the start-of-turn timing window before that player chooses what to do."
      },
      {
        id: "start-your-turn",
        title: "Start of your turn",
        text: "Open your start-of-turn timing window before you perform an action."
      },
      {
        id: "during-your-turn",
        title: "Perform one legal action",
        text: "Take one tactical, strategic, component, or other legal action, or pass if eligible."
      },
      {
        id: "strategic-action",
        title: "Strategic action declaration",
        text: "Declare the strategic action before resolving the selected strategy option."
      },
      {
        id: "action-card-window",
        title: "Shared timing window",
        text: "Resolve any legal interrupt or response window created during the turn."
      },
      {
        id: "end-your-turn",
        title: "End of your turn",
        text: "Close the turn after the chosen action and any follow-up timing windows are complete."
      }
    ]
  },
  {
    id: "tactical",
    number: "03",
    title: "Tactical Action",
    steps: [
      {
        id: "activate-system",
        title: "Activate a system",
        text: "Place a command token from your tactic pool in the chosen system."
      },
      {
        id: "opponent-activates-your-system",
        title: "Another player activates your system",
        text: "Open a response window after the activation if your units are in the chosen system."
      },
      {
        id: "move-ships",
        title: "Move ships",
        text: "Move eligible ships into the active system, carrying units within capacity."
      },
      {
        id: "space-cannon-offense",
        title: "Space cannon offense",
        text: "After movement, players may use eligible space cannon abilities against ships in the active system before any space combat begins."
      },
      {
        id: "end-tactical-action",
        title: "End tactical action",
        text: "After movement, combat, invasion, and production are complete, close the tactical action."
      }
    ]
  },
  {
    id: "combat",
    number: "04",
    title: "Space Combat",
    steps: [
      {
        id: "start-combat",
        title: "Start of combat",
        text: "Open the start-of-combat window before the first combat round."
      },
      {
        id: "start-combat-round",
        title: "Start of combat round",
        text: "Open the start-of-round window before anti-fighter barrage and combat rolls."
      },
      {
        id: "anti-fighter-barrage",
        title: "Anti-fighter barrage",
        text: "Eligible units roll anti-fighter barrage dice before regular combat rolls."
      },
      {
        id: "announce-retreats",
        title: "Announce retreats",
        text: "Each side may announce a retreat if a legal retreat destination exists."
      },
      {
        id: "roll-combat-dice",
        title: "Roll combat dice",
        text: "Each side rolls combat dice for participating ships and produces hits."
      },
      {
        id: "assign-hits",
        title: "Assign hits and sustain damage",
        text: "Players assign hits, use sustain damage where legal, and destroy units that cannot cancel hits."
      },
      {
        id: "units-destroyed",
        title: "After units are destroyed",
        text: "Resolve any delayed effects from destroyed units, then continue or end combat as appropriate."
      }
    ]
  },
  {
    id: "invasion",
    number: "05",
    title: "Invasion",
    steps: [
      {
        id: "start-invasion",
        title: "Start of invasion",
        text: "Open the invasion window before bombardment and landing forces."
      },
      {
        id: "bombardment-space-cannon",
        title: "Bombardment and space cannon defense",
        text: "Resolve bombardment, commit ground forces, then resolve space cannon defense from eligible defending units."
      },
      {
        id: "after-bombardment",
        title: "After bombardment",
        text: "Open the post-bombardment window before moving deeper into the invasion sequence."
      },
      {
        id: "commit-ground-forces",
        title: "Commit ground forces",
        text: "Move ground forces from ships in the active system onto invaded planets."
      },
      {
        id: "start-ground-combat",
        title: "Start ground combat",
        text: "Open the start-of-ground-combat window before ground forces roll combat dice."
      },
      {
        id: "after-winning-ground-combat",
        title: "After winning ground combat",
        text: "Resolve the victory window on the planet after opposing ground forces are removed."
      },
      {
        id: "after-control",
        title: "After gaining control",
        text: "Gain control of the planet, then open any follow-up timing window."
      }
    ]
  },
  {
    id: "production",
    number: "06",
    title: "Production",
    steps: [
      {
        id: "units-use-production",
        title: "Units use production",
        text: "Choose what to produce, pay costs, observe production limits, then place units."
      },
      {
        id: "action-phase-production",
        title: "Action-phase production",
        text: "Resolve a production effect that is itself chosen as an action."
      }
    ]
  },
  {
    id: "research",
    number: "07",
    title: "Research",
    steps: [
      {
        id: "research-unit-upgrade",
        title: "Research a unit upgrade",
        text: "Choose an eligible unit upgrade and satisfy its prerequisites before gaining it."
      }
    ]
  },
  {
    id: "status",
    number: "08",
    title: "Status Phase",
    steps: [
      {
        id: "draw-action-cards",
        title: "Draw step",
        text: "Resolve the normal draw step."
      },
      {
        id: "gain-command-tokens",
        title: "Gain and redistribute command tokens",
        text: "Gain command tokens, then redistribute command tokens among your pools."
      }
    ]
  },
  {
    id: "agenda",
    number: "09",
    title: "Agenda Phase",
    steps: [
      {
        id: "start-agenda",
        title: "Start of agenda phase",
        text: "Open the start-of-agenda-phase window before the first agenda is revealed."
      },
      {
        id: "agenda-revealed",
        title: "After an agenda is revealed",
        text: "Reveal the agenda and open the post-reveal timing window before voting."
      },
      {
        id: "votes-cast",
        title: "After votes are cast",
        text: "Players vote in order, then resolve any timing window tied to votes."
      },
      {
        id: "agenda-outcome",
        title: "Outcome resolves",
        text: "Resolve the winning outcome and any election or outcome timing window."
      }
    ]
  }
];

const placementMap = {
  "strategy|Choose strategy card": ["strategy", "choose-strategy-card"],
  "tactical|When you activate a system": ["tactical", "activate-system"],
  "tactical|After another player activates your system": ["tactical", "opponent-activates-your-system"],
  "tactical|Move ships": ["tactical", "move-ships"],
  "tactical|Space Cannon Offense": ["tactical", "space-cannon-offense"],
  "tactical|End of tactical action": ["tactical", "end-tactical-action"],
  "combat|Start of combat": ["combat", "start-combat"],
  "combat|Start of combat round": ["combat", "start-combat-round"],
  "combat|Anti-Fighter Barrage": ["combat", "anti-fighter-barrage"],
  "combat|Announce retreats": ["combat", "announce-retreats"],
  "combat|Roll combat dice": ["combat", "roll-combat-dice"],
  "combat|Assign hits and Sustain Damage": ["combat", "assign-hits"],
  "combat|After units are destroyed": ["combat", "units-destroyed"],
  "invasion|Start of invasion": ["invasion", "start-invasion"],
  "invasion|Bombardment and Space Cannon": ["invasion", "bombardment-space-cannon"],
  "invasion|After Bombardment": ["invasion", "after-bombardment"],
  "invasion|Commit ground forces": ["invasion", "commit-ground-forces"],
  "invasion|Start of ground combat": ["invasion", "start-ground-combat"],
  "invasion|After winning ground combat": ["invasion", "after-winning-ground-combat"],
  "invasion|After gaining control": ["invasion", "after-control"],
  "production|When units use Production": ["production", "units-use-production"],
  "production|Action-phase production": ["production", "action-phase-production"],
  "research|When researching a unit upgrade": ["research", "research-unit-upgrade"],
  "status|Draw action cards": ["status", "draw-action-cards"],
  "status|Gain and redistribute command tokens": ["status", "gain-command-tokens"],
  "agenda|Start of agenda phase": ["agenda", "start-agenda"],
  "agenda|After an agenda is revealed": ["agenda", "agenda-revealed"],
  "agenda|After votes are cast": ["agenda", "votes-cast"],
  "agenda|When elected or outcome resolves": ["agenda", "agenda-outcome"],
  "action|Start of another player's turn": ["action", "start-other-turn"],
  "action|Start of your turn": ["action", "start-your-turn"],
  "action|During your turn": ["action", "during-your-turn"],
  "action|When another player would perform a strategic action": ["action", "strategic-action"],
  "action|When action cards are played or discarded": ["action", "action-card-window"],
  "action|End of your turn": ["action", "end-your-turn"]
};

const cardGroups = [
  "Action Cards",
  "Blue Technology",
  "Yellow Technology",
  "Red Technology",
  "Green Technology",
  "Unit Upgrades"
];

const categoryByName = {
  "Ancient Burial Sites": "Action Cards",
  "Assassinate Representative": "Action Cards",
  "Bribery": "Action Cards",
  "Bunker": "Action Cards",
  "Confusing Legal Text / Confounding Legal Text": "Action Cards",
  "Coup d'Etat": "Action Cards",
  "Direct Hit": "Action Cards",
  "Disable": "Action Cards",
  "Distinguished Councilor": "Action Cards",
  "Emergency Repairs": "Action Cards",
  "Experimental Battlestation": "Action Cards",
  "Extreme Duress": "Action Cards",
  "Fighter Prototype": "Action Cards",
  "Forward Supply Base": "Action Cards",
  "Ghost Squad": "Action Cards",
  "Hack Election": "Action Cards",
  "Public Disgrace": "Action Cards",
  "Reveal Prototype": "Action Cards",
  "Reverse Engineer": "Action Cards",
  "Rider cycle": "Action Cards",
  "Rout": "Action Cards",
  "Sabotage": "Action Cards",
  "Shields Holding": "Action Cards",
  "Skilled Retreat": "Action Cards",
  "Solar Flare": "Action Cards",
  "War Machine": "Action Cards",
  "Waylay": "Action Cards",
  "Antimass Deflectors": "Blue Technology",
  "Dark Energy Tap": "Blue Technology",
  "Fleet Logistics": "Blue Technology",
  "Gravity Drive": "Blue Technology",
  "Light/Wave Deflector": "Blue Technology",
  "Sling Relay": "Blue Technology",
  "Graviton Laser System": "Yellow Technology",
  "Integrated Economy": "Yellow Technology",
  "Predictive Intelligence": "Yellow Technology",
  "Sarween Tools": "Yellow Technology",
  "Scanlink Drone Network": "Yellow Technology",
  "Transit Diodes": "Yellow Technology",
  "AI Development Algorithm": "Red Technology",
  "Assault Cannon": "Red Technology",
  "Magen Defense Grid": "Red Technology",
  "Plasma Scoring": "Red Technology",
  "Supercharge": "Red Technology",
  "Dacxive Animators": "Green Technology",
  "Hyper Metabolism": "Green Technology",
  "Neural Motivator": "Green Technology",
  "X-89 Bacterial Weapon": "Green Technology",
  "X-89 Bacterial Weapon Omega": "Green Technology",
  "Destroyer II": "Unit Upgrades",
  "Dreadnought II": "Unit Upgrades",
  "Fighter II": "Unit Upgrades",
  "Infantry II": "Unit Upgrades",
  "PDS II": "Unit Upgrades",
  "Space Dock II": "Unit Upgrades",
  "War Sun": "Unit Upgrades"
};

function resizeCanvas() {
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);
  context.setTransform(scale, 0, 0, scale, 0, 0);
}

function createStars() {
  stars.length = 0;

  for (let index = 0; index < starCount; index += 1) {
    stars.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.25 + 0.08,
      glow: Math.random() * 0.5 + 0.35
    });
  }
}

function drawStarfield() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const gradient = context.createRadialGradient(
    window.innerWidth * 0.72,
    window.innerHeight * 0.28,
    80,
    window.innerWidth * 0.72,
    window.innerHeight * 0.28,
    window.innerWidth
  );

  gradient.addColorStop(0, "rgba(185, 77, 72, 0.24)");
  gradient.addColorStop(0.32, "rgba(216, 177, 95, 0.08)");
  gradient.addColorStop(1, "rgba(16, 17, 22, 0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, window.innerWidth, window.innerHeight);

  stars.forEach((star) => {
    star.y += star.speed;

    if (star.y > window.innerHeight + 4) {
      star.y = -4;
      star.x = Math.random() * window.innerWidth;
    }

    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(242, 239, 230, ${star.glow})`;
    context.fill();
  });

  requestAnimationFrame(drawStarfield);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function getModifierEntries() {
  const entries = [];

  flows.forEach((flow) => {
    flow.steps.forEach((step) => {
      const placement = placementMap[`${flow.id}|${step.step}`];

      if (!placement) {
        return;
      }

      step.cards.forEach((card) => {
        entries.push({
          ...card,
          category: categoryByName[card.name] || card.type,
          flowTitle: flow.title,
          phaseId: placement[0],
          stepId: placement[1],
          stepName: step.step
        });
      });
    });
  });

  return entries;
}

function getUniqueCards() {
  const cardsByName = new Map();

  getModifierEntries().forEach((entry) => {
    if (!cardsByName.has(entry.name)) {
      cardsByName.set(entry.name, {
        name: entry.name,
        category: entry.category,
        type: entry.type
      });
    }
  });

  return [...cardsByName.values()].sort((first, second) => {
    const groupDifference = cardGroups.indexOf(first.category) - cardGroups.indexOf(second.category);

    if (groupDifference !== 0) {
      return groupDifference;
    }

    return first.name.localeCompare(second.name);
  });
}

function renderChecklist() {
  if (!cardChecklist) {
    return;
  }

  const cards = getUniqueCards();

  cardChecklist.innerHTML = cardGroups.map((group) => {
    const groupCards = cards.filter((card) => card.category === group);

    if (!groupCards.length) {
      return "";
    }

    return `
      <details class="checklist-group">
        <summary>
          <span>${group}</span>
          <span>${groupCards.length}</span>
        </summary>
        <div class="checklist-items">
          ${groupCards.map((card) => {
            const id = `card-${slugify(card.name)}`;

            return `
              <label class="checklist-item" for="${id}">
                <input id="${id}" type="checkbox" value="${card.name}">
                <span>
                  <strong>${card.name}</strong>
                  <span>${card.type}</span>
                </span>
              </label>
            `;
          }).join("")}
        </div>
      </details>
    `;
  }).join("");

  cardChecklist.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        selectedCards.add(checkbox.value);
      } else {
        selectedCards.delete(checkbox.value);
      }

      renderPhaseFlows();
    });
  });
}

function renderPhaseFlows() {
  if (!phaseFlowList) {
    return;
  }

  const activeEntries = getModifierEntries().filter((entry) => selectedCards.has(entry.name));

  phaseFlowList.innerHTML = basePhases.map((phase) => {
    const activeCount = activeEntries.filter((entry) => entry.phaseId === phase.id).length;

    return `
    <details class="phase-card">
      <summary>
        <span>${phase.number}</span>
        <strong>${phase.title}</strong>
        <span>${activeCount} active</span>
      </summary>
      <ol class="phase-step-list">
        ${phase.steps.map((step, index) => {
          const modifiers = activeEntries.filter((entry) => {
            return entry.phaseId === phase.id && entry.stepId === step.id;
          });

          return `
            <li class="phase-step">
              <div class="phase-step-number">${index + 1}</div>
              <div class="phase-step-body">
                <strong>${step.title}</strong>
                <p>${step.text}</p>
                ${modifiers.length ? `
                  <div class="active-modifiers">
                    ${modifiers.map((modifier) => `
                      <div class="modifier-card">
                        <span>${modifier.category}</span>
                        <strong>${modifier.name}</strong>
                        <p><strong>Card text:</strong> ${modifier.text}</p>
                        <p><strong>How it modifies this step:</strong> Check this effect during ${modifier.stepName}.</p>
                      </div>
                    `).join("")}
                  </div>
                ` : ""}
              </div>
            </li>
          `;
        }).join("")}
      </ol>
    </details>
  `;
  }).join("");
}

function renderFlows(filter = "all") {
  if (!flowList) {
    return;
  }

  const visibleFlows = filter === "all"
    ? flows
    : flows.filter((flow) => flow.id === filter);

  flowList.innerHTML = visibleFlows.map((flow) => `
    <article class="flow-card">
      <header>
        <h3>${flow.title}</h3>
        <p>${flow.summary}</p>
      </header>
      <div class="flow-steps">
        ${flow.steps.map((step) => `
          <div class="flow-step">
            <div class="step-label">${step.step}</div>
            <div class="card-stack">
              ${step.cards.map((card) => `
                <div class="timing-card">
                  <span>${card.type}</span>
                  <strong>${card.name}</strong>
                  <p>${card.text}</p>
                </div>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");
}

document.querySelectorAll(".filter-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach((item) => {
      item.classList.remove("active");
    });
    button.classList.add("active");
    renderFlows(button.dataset.filter);
  });
});

if (clearCardsButton) {
  clearCardsButton.addEventListener("click", () => {
    selectedCards.clear();

    if (cardChecklist) {
      cardChecklist.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
        checkbox.checked = false;
      });
    }

    renderPhaseFlows();
  });
}

window.addEventListener("resize", () => {
  resizeCanvas();
  createStars();
});

resizeCanvas();
createStars();
drawStarfield();
renderChecklist();
renderPhaseFlows();
renderFlows();
