const canvas = document.querySelector("#starfield");
const context = canvas.getContext("2d");
const stars = [];
const starCount = 120;
const flowList = document.querySelector("#flowList");
const phaseFlowList = document.querySelector("#phaseFlowList");
const cardChecklist = document.querySelector("#cardChecklist");
const heroChecklist = document.querySelector("#heroChecklist");
const heroChecklistMessage = document.querySelector("#heroChecklistMessage");
const clearCardsButton = document.querySelector("#clearCards");
const playerColourSelect = document.querySelector("#playerColour");
const gameVersionSelect = document.querySelector("#gameVersion");
const useCodexCardsInput = document.querySelector("#useCodexCards");
const saveStatus = document.querySelector("#saveStatus");
const exportSaveButton = document.querySelector("#exportSave");
const importSaveInput = document.querySelector("#importSave");
const resetPageSaveButton = document.querySelector("#resetPageSave");
const selectedCards = new Map();
const saveKey = "ti4-checklists-state-v1";
const saveVersion = 1;
const pageSaveId = getPageSaveId();
let saveStatusTimer;

const playerColours = [
  { value: "red", label: "Red" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "black", label: "Black" },
  { value: "yellow", label: "Yellow" },
  { value: "white", label: "White" }
];

const factionLeaderEntries = [
  { faction: "The Arborec", name: "Letani Ospha", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Arborec agent. As an action, upgrade a non-fighter ship by replacing it with a ship that costs up to 2 more." },
  { faction: "The Arborec", name: "Dirzuga Rophal", type: "Commander leader", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Arborec commander. After a system containing your units with Production is activated, you may produce 1 unit in that system." },
  { faction: "The Barony of Letnev", name: "Viscount Unlenn", type: "Agent leader", source: "pok", phaseId: "combat", stepId: "start-combat-round", stepName: "Start of combat round", text: "Letnev agent. At the start of a combat round, choose 1 ship to roll 1 additional die during that combat round." },
  { faction: "The Barony of Letnev", name: "Farran", type: "Commander leader", source: "pok", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Letnev commander. After one of your units uses Sustain Damage, gain 1 trade good." },
  { faction: "The Clan of Saar", name: "Captain Mendosa", type: "Agent leader", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Saar agent. After a system is activated, set one ship's move value to the highest move value among ships in that system." },
  { faction: "The Clan of Saar", name: "Rowl Sarrig", type: "Commander leader", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Saar commander. When producing fighters or infantry, you may place them at any of your un-blockaded space docks." },
  { faction: "The Embers of Muaat", name: "Umbat", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Muaat agent. As an action, let a player produce up to 2 units with total cost 4 or less in a system with their War Sun or flagship." },
  { faction: "The Embers of Muaat", name: "Magmus", type: "Commander leader", source: "pok", phaseId: "action", stepId: "strategic-action", stepName: "When spending a strategy token", text: "Muaat commander. After you spend a strategy token, gain 1 trade good." },
  { faction: "The Emirates of Hacan", name: "Carth of the Golden Sands", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Hacan agent. During the action phase, exhaust to gain 2 commodities or refresh another player's commodities." },
  { faction: "The Emirates of Hacan", name: "Gila the Silvertongue", type: "Commander leader", source: "pok", phaseId: "agenda", stepId: "votes-cast", stepName: "After votes are cast", text: "Hacan commander. When you cast votes, you may spend trade goods to cast extra votes." },
  { faction: "The Federation of Sol", name: "Evelyn DeLouis", type: "Agent leader", source: "pok", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "Sol agent. At the start of a ground-combat round, choose 1 ground force to roll 1 additional die during that round." },
  { faction: "The Federation of Sol", name: "Claire Gibson", type: "Commander leader", source: "pok", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "Sol commander. At the start of ground combat on a planet you control, place 1 infantry from reinforcements on that planet." },
  { faction: "The Ghosts of Creuss", name: "Emissary Taivra", type: "Agent leader", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Creuss agent. After a system with a non-delta wormhole is activated, that system is adjacent to all wormhole systems during this tactical action." },
  { faction: "The Ghosts of Creuss", name: "Sai Seravus", type: "Commander leader", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Creuss commander. After your ships move through a wormhole, your carriers may place fighters if they have capacity." },
  { faction: "The L1Z1X Mindnet", name: "I48S", type: "Agent leader", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "L1Z1X agent. After activation, replace infantry in the active system with one of your mechs." },
  { faction: "The L1Z1X Mindnet", name: "2RAM", type: "Commander leader", source: "pok", phaseId: "invasion", stepId: "bombardment-space-cannon", stepName: "Bombardment and Space Cannon", text: "L1Z1X commander. Units with Planetary Shield do not prevent your units from using Bombardment." },
  { faction: "The Mentak Coalition", name: "Suffi An", type: "Agent leader", source: "pok", phaseId: "action", stepId: "action-card-window", stepName: "When action cards are played or discarded", text: "Mentak agent. After Pillage is used against another player, both involved players draw 1 action card." },
  { faction: "The Mentak Coalition", name: "S'ula Mentarion", type: "Commander leader", source: "pok", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Mentak commander. After you win a space combat, force your opponent to give you 1 promissory note." },
  { faction: "The Naalu Collective", name: "Z'eu", type: "Agent leader", source: "pok", replacedByCodex: "Z'eu Omega", phaseId: "agenda", stepId: "agenda-revealed", stepName: "After an agenda is revealed", text: "Naalu agent. Base version interacts with the top agenda after an agenda is revealed." },
  { faction: "The Naalu Collective", name: "Z'eu Omega", type: "Agent leader", source: "codex", replaces: "Z'eu", requiresPok: true, phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Naalu Codex agent. Lets a chosen player perform a tokenless tactical action." },
  { faction: "The Naalu Collective", name: "M'aban", type: "Commander leader", source: "pok", replacedByCodex: "M'aban Omega", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Naalu commander. Base version helps produce additional fighters." },
  { faction: "The Naalu Collective", name: "M'aban Omega", type: "Commander leader", source: "codex", replaces: "M'aban", requiresPok: true, phaseId: "agenda", stepId: "start-agenda", stepName: "Start of agenda phase", text: "Naalu Codex commander. Lets you inspect neighbors' promissory notes and the top or bottom agenda." },
  { faction: "The Nekro Virus", name: "Nekro Malleon", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Nekro agent. During the action phase, let a player discard an action card or spend a command token to gain 2 trade goods." },
  { faction: "The Nekro Virus", name: "Nekro Acidos", type: "Commander leader", source: "pok", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When gaining technology", text: "Nekro commander. After you gain a technology, draw 1 action card." },
  { faction: "Sardakk N'orr", name: "T'ro", type: "Agent leader", source: "pok", phaseId: "tactical", stepId: "end-tactical-action", stepName: "End of tactical action", text: "Sardakk agent. At the end of a player's tactical action, that player may place 2 infantry in the active system." },
  { faction: "Sardakk N'orr", name: "G'hom Sek'kus", type: "Commander leader", source: "pok", phaseId: "invasion", stepId: "commit-ground-forces", stepName: "Commit ground forces", text: "Sardakk commander. During Commit Ground Forces, you may commit up to 1 ground force from each planet in and adjacent to the active system." },
  { faction: "The Universities of Jol-Nar", name: "Doctor Sucaban", type: "Agent leader", source: "pok", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When researching technology", text: "Jol-Nar agent. When a player spends resources to research, they may remove infantry to reduce the cost." },
  { faction: "The Universities of Jol-Nar", name: "Ta-Zern", type: "Commander leader", source: "pok", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Jol-Nar commander. After you roll dice for a unit ability, you may reroll any of those dice." },
  { faction: "The Winnu", name: "Berekar Berekon", type: "Agent leader", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Winnu agent. When units use Production, reduce the combined cost of produced units by 2." },
  { faction: "The Winnu", name: "Rickar Rickani", type: "Commander leader", source: "pok", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Winnu commander. Your units get +2 to combat rolls in Mecatol Rex, home systems, and legendary planet systems." },
  { faction: "The Xxcha Kingdom", name: "Ggrucoto Rinn", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Xxcha agent. As an action, ready any planet; if adjacent to your planets, you may remove 1 infantry from it." },
  { faction: "The Xxcha Kingdom", name: "Elder Qanoj", type: "Commander leader", source: "pok", phaseId: "agenda", stepId: "votes-cast", stepName: "After votes are cast", text: "Xxcha commander. Each exhausted planet gives extra voting power, and game effects cannot prevent you from voting." },
  { faction: "The Yin Brotherhood", name: "Brother Milor", type: "Agent leader", source: "pok", replacedByCodex: "Brother Milor Omega", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Yin agent. Base version places fighters after one of your destroyers or cruisers is destroyed." },
  { faction: "The Yin Brotherhood", name: "Brother Milor Omega", type: "Agent leader", source: "codex", replaces: "Brother Milor", requiresPok: true, phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Yin Codex agent. After one of your units is destroyed, place 2 fighters or infantry depending on the destroyed unit type." },
  { faction: "The Yin Brotherhood", name: "Brother Omar", type: "Commander leader", source: "pok", replacedByCodex: "Brother Omar Omega", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When researching technology", text: "Yin commander. Base version satisfies a green prerequisite and helps with infantry production costs." },
  { faction: "The Yin Brotherhood", name: "Brother Omar Omega", type: "Commander leader", source: "codex", replaces: "Brother Omar", requiresPok: true, phaseId: "research", stepId: "research-unit-upgrade", stepName: "When researching technology", text: "Yin Codex commander. Satisfies a green prerequisite and can ignore a researched player's tech prerequisites by returning infantry." },
  { faction: "The Yssaril Tribes", name: "Clever Clever Ssruu", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Yssaril agent. Has the text ability of every other player's agent, even if those agents are exhausted." },
  { faction: "The Yssaril Tribes", name: "So Ata", type: "Commander leader", source: "pok", phaseId: "tactical", stepId: "opponent-activates-your-system", stepName: "After another player activates your system", text: "Yssaril commander. After another player activates a system containing your units, look at that player's action cards, promissory notes, or secret objectives." },
  { faction: "The Argent Flight", name: "Trillossa Aun Mirik", type: "Agent leader", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Argent agent. When a player produces ground forces, they may place them on controlled planets in or adjacent to that system." },
  { faction: "The Argent Flight", name: "Trrakan Aun Zulok", type: "Commander leader", source: "pok", phaseId: "combat", stepId: "anti-fighter-barrage", stepName: "Anti-Fighter Barrage", text: "Argent commander. When your units roll for unit abilities, choose 1 of those units to roll 1 additional die." },
  { faction: "The Empyrean", name: "Acamar", type: "Agent leader", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Empyrean agent. After ships move into a system that contains no planets, that player gains 1 command token." },
  { faction: "The Empyrean", name: "Xuange", type: "Commander leader", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Empyrean commander. After another player moves ships into a system containing your command token, return that token to your reinforcements." },
  { faction: "The Mahact Gene-Sorcerers", name: "Jae Mir Kan", type: "Agent leader", source: "pok", phaseId: "action", stepId: "strategic-action", stepName: "Strategic action declaration", text: "Mahact agent. When resolving a strategic secondary, use an active player's command token from the board instead of spending one from your strategy pool." },
  { faction: "The Mahact Gene-Sorcerers", name: "Il Na Viroset", type: "Commander leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Mahact commander. During your tactical actions, you may activate systems containing your command tokens, then return both tokens and end your turn." },
  { faction: "The Naaz-Rokha Alliance", name: "Garv and Gunn", type: "Agent leader", source: "pok", phaseId: "action", stepId: "end-your-turn", stepName: "End of your turn", text: "Naaz-Rokha agent. At the end of a player's turn, that player explores 1 planet." },
  { faction: "The Naaz-Rokha Alliance", name: "Dart and Tai", type: "Commander leader", source: "pok", phaseId: "invasion", stepId: "after-control", stepName: "After gaining control", text: "Naaz-Rokha commander. After you gain control of a planet that belonged to another player, you may explore it." },
  { faction: "The Nomad", name: "Artuno the Betrayer", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Nomad agent. Stores trade goods for later payout." },
  { faction: "The Nomad", name: "Field Marshal Mercer", type: "Agent leader", source: "pok", phaseId: "action", stepId: "end-your-turn", stepName: "End of your turn", text: "Nomad agent. Repositions ground forces at the end of a turn." },
  { faction: "The Nomad", name: "The Thundarian", type: "Agent leader", source: "pok", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Nomad agent. Rewinds a combat round after Roll Dice so hits are not assigned." },
  { faction: "The Nomad", name: "Navarch Feng", type: "Commander leader", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Nomad commander. You may produce your flagship without spending resources." },
  { faction: "The Titans of Ul", name: "Tellurian", type: "Agent leader", source: "pok", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Titans agent. When a hit is produced against a unit, cancel that hit." },
  { faction: "The Titans of Ul", name: "Tungstantus", type: "Commander leader", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Titans commander. When your units use Production, gain 1 trade good." },
  { faction: "The Vuil'Raith Cabal", name: "The Stillness of Stars", type: "Agent leader", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Cabal agent. After another player replenishes commodities, convert them to trade goods and capture a unit from reinforcements up to that commodity value." },
  { faction: "The Vuil'Raith Cabal", name: "That Which Molds Flesh", type: "Commander leader", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Cabal commander. When producing fighters or infantry, up to 2 of those units do not count against your Production limit." },
  { faction: "The Council Keleres", name: "Xander Alexin Victori III", type: "Agent leader", source: "codex", requiresPok: true, phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Keleres agent. At any time, allow any player to spend commodities as trade goods." },
  { faction: "The Council Keleres", name: "Suffi An Keleres", type: "Commander leader", source: "codex", requiresPok: true, phaseId: "action", stepId: "end-your-turn", stepName: "End of your turn", text: "Keleres commander. After you perform a component action, you may perform an additional action." }
];

const heroFactionByName = {
  "Adjudicator Ba'al": "The Embers of Muaat",
  "Ahk-Syl Siven": "The Nomad",
  "Airo Shir Aur": "The Mahact Gene-Sorcerers",
  "Conservator Procyon": "The Empyrean",
  "Dannel of the Tenth": "The Yin Brotherhood",
  "Dannel of the Tenth Omega": "The Yin Brotherhood",
  "Darktalon Treilla": "The Barony of Letnev",
  "Gurno Aggero": "The Clan of Saar",
  "Harka Leeds": "The Council Keleres",
  "Harrugh Gefhara": "The Emirates of Hacan",
  "Hesh and Prit": "The Naaz-Rokha Alliance",
  "Ipswitch, Loose Cannon": "The Mentak Coalition",
  "It Feeds on Carrion": "The Vuil'Raith Cabal",
  "Jace X. 4th Air Legion": "The Federation of Sol",
  "Kuuasi Aun Jalatai": "The Council Keleres",
  "Kyver, Blade and Key": "The Yssaril Tribes",
  "Letani Miasmiala": "The Arborec",
  "Mathis Mathinus": "The Winnu",
  "Mirik Aun Sissiri": "The Argent Flight",
  "Odlynn Myrr": "The Council Keleres",
  "Riftwalker Meian": "The Ghosts of Creuss",
  "Rin, the Master's Legacy": "The Universities of Jol-Nar",
  "Sh'val, Harbinger": "Sardakk N'orr",
  "The Helmsman": "The L1Z1X Mindnet",
  "The Oracle": "The Naalu Collective",
  "Ul the Progenitor": "The Titans of Ul",
  "UNIT.DSGN.FLAYESH": "The Nekro Virus",
  "Xxekir Grom": "The Xxcha Kingdom",
  "Xxekir Grom Omega": "The Xxcha Kingdom"
};

const cardVersionMeta = {
  "AI Development Algorithm": { source: "pok" },
  "Ancient Burial Sites": { source: "base" },
  "Antimass Deflectors": { source: "base" },
  "Assassinate Representative": { source: "base" },
  "Assault Cannon": { source: "base" },
  "Bribery": { source: "base" },
  "Bunker": { source: "base" },
  "Confusing Legal Text": { source: "base" },
  "Confounding Legal Text": { source: "pok" },
  "Conservator Procyon": { source: "pok" },
  "Coup d'Etat": { source: "pok" },
  "Adjudicator Ba'al": { source: "pok" },
  "Ahk-Syl Siven": { source: "pok" },
  "Airo Shir Aur": { source: "pok" },
  "Dacxive Animators": { source: "base" },
  "Dannel of the Tenth": { source: "pok", replacedByCodex: "Dannel of the Tenth Omega" },
  "Dannel of the Tenth Omega": { source: "codex", replaces: "Dannel of the Tenth", requiresPok: true },
  "Dark Energy Tap": { source: "pok" },
  "Darktalon Treilla": { source: "pok" },
  "Direct Hit": { source: "base" },
  "Disable": { source: "base" },
  "Distinguished Councilor": { source: "base" },
  "Destroyer II": { source: "base" },
  "Dreadnought II": { source: "base" },
  "Emergency Repairs": { source: "base" },
  "Experimental Battlestation": { source: "base" },
  "Extreme Duress": { source: "te" },
  "Fighter II": { source: "base" },
  "Fighter Prototype": { source: "base" },
  "Fleet Logistics": { source: "base" },
  "Forward Supply Base": { source: "codex" },
  "Ghost Squad": { source: "codex" },
  "Gravity Drive": { source: "base" },
  "Graviton Laser System": { source: "base" },
  "Gurno Aggero": { source: "pok" },
  "Hack Election": { source: "codex" },
  "Harka Leeds": { source: "codex", requiresPok: true },
  "Harrugh Gefhara": { source: "pok" },
  "Hesh and Prit": { source: "pok" },
  "Hyper Metabolism": { source: "base" },
  "Infantry II": { source: "base" },
  "Integrated Economy": { source: "base" },
  "Ipswitch, Loose Cannon": { source: "pok" },
  "It Feeds on Carrion": { source: "pok" },
  "Jace X. 4th Air Legion": { source: "pok" },
  "Kuuasi Aun Jalatai": { source: "codex", requiresPok: true },
  "Kyver, Blade and Key": { source: "pok" },
  "Light/Wave Deflector": { source: "base" },
  "Letani Miasmiala": { source: "pok" },
  "Magen Defense Grid": { source: "base", codexUpdated: true },
  "Mathis Mathinus": { source: "pok" },
  "Mirik Aun Sissiri": { source: "pok" },
  "Neural Motivator": { source: "base" },
  "Odlynn Myrr": { source: "codex", requiresPok: true },
  "PDS II": { source: "base" },
  "Plasma Scoring": { source: "base" },
  "Predictive Intelligence": { source: "pok" },
  "Public Disgrace": { source: "base" },
  "Reveal Prototype": { source: "pok" },
  "Reverse Engineer": { source: "pok" },
  "Riftwalker Meian": { source: "pok" },
  "Rin, the Master's Legacy": { source: "pok" },
  "Rider cycle": { source: "base" },
  "Rout": { source: "pok" },
  "Sabotage": { source: "base" },
  "Sarween Tools": { source: "base" },
  "Scanlink Drone Network": { source: "pok" },
  "Sh'val, Harbinger": { source: "pok" },
  "Shields Holding": { source: "base" },
  "Skilled Retreat": { source: "base" },
  "Sling Relay": { source: "pok" },
  "Solar Flare": { source: "codex" },
  "Space Dock II": { source: "base" },
  "Supercharge": { source: "pok" },
  "The Helmsman": { source: "pok" },
  "The Oracle": { source: "pok" },
  "Transit Diodes": { source: "base" },
  "Ul the Progenitor": { source: "pok" },
  "UNIT.DSGN.FLAYESH": { source: "pok" },
  "War Machine": { source: "codex" },
  "War Sun": { source: "base" },
  "Waylay": { source: "pok" },
  "X-89 Bacterial Weapon": { source: "base", replacedByCodex: "X-89 Bacterial Weapon Omega" },
  "X-89 Bacterial Weapon Omega": { source: "codex", replaces: "X-89 Bacterial Weapon" },
  "Xxekir Grom": { source: "pok", replacedByCodex: "Xxekir Grom Omega" },
  "Xxekir Grom Omega": { source: "codex", replaces: "Xxekir Grom", requiresPok: true }
};

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
            name: "Adjudicator Ba'al",
            type: "Hero leader",
            text: "Embers of Muaat hero. After moving a War Sun into an eligible system, destroy all other units there and turn that system into the Muaat supernova, then purge the hero."
          },
          {
            name: "Sh'val, Harbinger",
            type: "Hero leader",
            text: "Sardakk N'orr hero. After moving ships into the active system, skip directly to committing ground forces; after committing, purge and return those ships to reinforcements."
          },
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
            name: "Ipswitch, Loose Cannon",
            type: "Hero leader",
            text: "Mentak Coalition hero. At the start of a space combat you are in, purge to replace destroyed ships from that combat with matching ships from your reinforcements in the active system."
          },
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
            name: "Kuuasi Aun Jalatai",
            type: "Hero leader",
            text: "Council Keleres Argent-branch hero. At the start of a space-combat round in a system with your planet, purge to deploy your flagship and up to 2 cruisers or destroyers there."
          },
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
            name: "X-89 Bacterial Weapon",
            type: "Technology",
            text: "Action: Exhaust this card and choose 1 or more of your ships with Bombardment; destroy all infantry on one planet in that system."
          },
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
            name: "Harrugh Gefhara",
            type: "Hero leader",
            text: "Emirates of Hacan hero. During one PRODUCTION use, purge to make the cost of your produced units 0 for that production window."
          },
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
          },
          {
            name: "The Oracle",
            type: "Hero leader",
            text: "Naalu Collective hero. At the end of the status phase, force each other player to give you 1 promissory note; purge if you do."
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
          },
          {
            name: "Odlynn Myrr",
            type: "Hero leader",
            text: "Council Keleres Xxcha-branch hero. After an agenda is revealed, purge to add votes, predict an outcome, and reward dissenting votes with trade goods and command tokens."
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
            name: "Confusing Legal Text",
            type: "Action card",
            text: "When you or another player is elected, redirect the elected-player outcome to you."
          },
          {
            name: "Confounding Legal Text",
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
            name: "Letani Miasmiala",
            type: "Hero leader",
            text: "Arborec hero. As a component action, produce in any systems that contain your ground forces, then purge."
          },
          {
            name: "Darktalon Treilla",
            type: "Hero leader",
            text: "Barony of Letnev hero. As a component action, ignore fleet-supply and law limits on your non-fighter ships in systems for the rest of the round, then purge later."
          },
          {
            name: "Gurno Aggero",
            type: "Hero leader",
            text: "Clan of Saar hero. As a component action, destroy other players' infantry and fighters in a system adjacent to one of your space docks, then purge."
          },
          {
            name: "Jace X. 4th Air Legion",
            type: "Hero leader",
            text: "Federation of Sol hero. As a component action, remove all your command tokens from the board back to reinforcements, then purge."
          },
          {
            name: "Riftwalker Meian",
            type: "Hero leader",
            text: "Ghosts of Creuss hero. As a component action, swap 2 eligible systems that contain wormholes or your units, excluding Creuss and the Nexus, then purge."
          },
          {
            name: "The Helmsman",
            type: "Hero leader",
            text: "L1Z1X Mindnet hero. As a component action, move your flagship and any number of dreadnoughts into a chosen system without enemy ships, then purge."
          },
          {
            name: "UNIT.DSGN.FLAYESH",
            type: "Hero leader",
            text: "Nekro Virus hero. As a component action on a tech-specialty planet with your units, wipe other players there, gain trade goods from the planet values, gain a matching-color technology, then purge."
          },
          {
            name: "Rin, the Master's Legacy",
            type: "Hero leader",
            text: "Universities of Jol-Nar hero. As a component action, exchange your non-unit-upgrade technologies for other technologies of matching colors, then purge."
          },
          {
            name: "Mathis Mathinus",
            type: "Hero leader",
            text: "Winnu hero. As a component action, perform the primary ability of any strategy card and optionally let any number of other players resolve its secondary, then purge."
          },
          {
            name: "Xxekir Grom",
            type: "Hero leader",
            text: "Xxcha Kingdom hero. As a component action, discard a law, inspect 5 agendas, resolve 2 as if you voted for chosen outcomes, discard the rest, block outside abilities, then purge."
          },
          {
            name: "Xxekir Grom Omega",
            type: "Hero leader",
            text: "Xxcha Kingdom Codex hero. Passive replacement: when exhausting planets, combine resources and influence and treat that total as both values."
          },
          {
            name: "Dannel of the Tenth",
            type: "Hero leader",
            text: "Yin Brotherhood hero. As a component action, for each planet with your infantry, either ready it or add matching infantry from reinforcements, then purge."
          },
          {
            name: "Dannel of the Tenth Omega",
            type: "Hero leader",
            text: "Yin Brotherhood Codex hero. As a component action, land up to 3 infantry from reinforcements on non-home planets and resolve invasions without Space Cannon against them, then purge."
          },
          {
            name: "Kyver, Blade and Key",
            type: "Hero leader",
            text: "Yssaril Tribes hero. As a component action, each opponent reveals 1 action card; for each, you either take it or force that player to discard 3 random action cards, then purge."
          },
          {
            name: "Mirik Aun Sissiri",
            type: "Hero leader",
            text: "Argent Flight hero. As a component action, move any number of your ships into systems containing your command tokens and no enemy ships, then purge."
          },
          {
            name: "Conservator Procyon",
            type: "Hero leader",
            text: "Empyrean hero. As a component action, place frontier tokens into eligible empty systems, then explore all such tokens where you have ships, then purge."
          },
          {
            name: "Airo Shir Aur",
            type: "Hero leader",
            text: "Mahact Gene-Sorcerers hero. As a component action, force one fleet to move into an adjacent enemy fleet's system and fight without retreat or ship-movement abilities, then purge."
          },
          {
            name: "Hesh and Prit",
            type: "Hero leader",
            text: "Naaz-Rokha Alliance hero. As a component action, gain 1 relic and resolve up to 2 strategy-card secondary abilities using tokens from reinforcements, then purge."
          },
          {
            name: "Ahk-Syl Siven",
            type: "Hero leader",
            text: "Nomad hero. As a component action, your flagship and its transported units can move out of systems with your command tokens for the rest of the round, then purge at round end."
          },
          {
            name: "Ul the Progenitor",
            type: "Hero leader",
            text: "Titans of Ul hero. As a component action, ready Elysium, increase its values, and make it behave like a Space Cannon unit through an attachment-like effect."
          },
          {
            name: "It Feeds on Carrion",
            type: "Hero leader",
            text: "Vuil'Raith Cabal hero. As a component action, roll to capture other players' non-fighter ships near dimensional tears, including dependent units removed as a consequence, then purge."
          },
          {
            name: "Harka Leeds",
            type: "Hero leader",
            text: "Council Keleres Mentak-branch hero. As a component action, search the action deck for 3 component-action cards, take them, then purge."
          },
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
  "Faction Leaders",
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
  "Confusing Legal Text": "Action Cards",
  "Confounding Legal Text": "Action Cards",
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

function getPageSaveId() {
  const pathName = window.location.pathname.split("/").pop();
  return pathName || "index.html";
}

function createEmptySaveState() {
  return {
    version: saveVersion,
    pages: {},
    pageSettings: {},
    lastSaved: ""
  };
}

function readSaveState() {
  try {
    const savedValue = localStorage.getItem(saveKey);

    if (!savedValue) {
      return createEmptySaveState();
    }

    const parsedState = JSON.parse(savedValue);

    if (!isValidSaveState(parsedState)) {
      return createEmptySaveState();
    }

    return {
      version: saveVersion,
      pages: parsedState.pages,
      pageSettings: parsedState.pageSettings || {},
      lastSaved: parsedState.lastSaved || ""
    };
  } catch (error) {
    return createEmptySaveState();
  }
}

function writeSaveState(state) {
  localStorage.setItem(saveKey, JSON.stringify(state));
}

function isValidSaveState(value) {
  if (!value || value.version !== saveVersion || !value.pages || typeof value.pages !== "object" || Array.isArray(value.pages)) {
    return false;
  }

  const pagesAreValid = Object.values(value.pages).every((pageState) => {
    if (!pageState || typeof pageState !== "object" || Array.isArray(pageState)) {
      return false;
    }

    return Object.values(pageState).every((checkboxValue) => typeof checkboxValue === "boolean");
  });

  if (!pagesAreValid) {
    return false;
  }

  if (value.pageSettings === undefined) {
    return true;
  }

  if (!value.pageSettings || typeof value.pageSettings !== "object" || Array.isArray(value.pageSettings)) {
    return false;
  }

  return Object.values(value.pageSettings).every((pageSettings) => {
    return pageSettings
      && typeof pageSettings === "object"
      && !Array.isArray(pageSettings)
      && ["base", "pok"].includes(pageSettings.gameVersion)
      && typeof pageSettings.useCodexCards === "boolean";
  });
}

function getCurrentVisibleCheckboxIds() {
  return getChecklistCheckboxes().map((checkbox) => checkbox.id);
}

function getCurrentPageSettings() {
  return {
    gameVersion: gameVersionSelect?.value || "base",
    useCodexCards: useCodexCardsInput?.checked || false
  };
}

function applyPageSettings(pageSettings) {
  if (!pageSettings) {
    return;
  }

  if (gameVersionSelect && ["base", "pok"].includes(pageSettings.gameVersion)) {
    gameVersionSelect.value = pageSettings.gameVersion;
  }

  if (useCodexCardsInput && typeof pageSettings.useCodexCards === "boolean") {
    useCodexCardsInput.checked = pageSettings.useCodexCards;
  }
}

function restorePageSettings() {
  const state = readSaveState();
  applyPageSettings(state.pageSettings[pageSaveId]);
}

function getChecklistCheckboxes() {
  return [...document.querySelectorAll("#heroChecklist input[type='checkbox'], #cardChecklist input[type='checkbox']")];
}

function getCurrentPageCheckboxState() {
  const pageState = {};

  getChecklistCheckboxes().forEach((checkbox) => {
    if (checkbox.checked) {
      pageState[checkbox.id] = true;
    }
  });

  return pageState;
}

function applyPageCheckboxState(pageState) {
  selectedCards.clear();

  if (!pageState) {
    return;
  }

  getChecklistCheckboxes().forEach((checkbox) => {
    checkbox.checked = pageState[checkbox.id] === true;

    if (checkbox.checked) {
      const cardName = checkbox.dataset.cardName;
      const selectedColours = selectedCards.get(cardName) || new Set();
      selectedColours.add(checkbox.value);
      selectedCards.set(cardName, selectedColours);
    }
  });
}

function saveCurrentPageState(showFeedback = true) {
  const state = readSaveState();
  const pageState = state.pages[pageSaveId] || {};
  const visibleCheckboxIds = getCurrentVisibleCheckboxIds();

  visibleCheckboxIds.forEach((checkboxId) => {
    delete pageState[checkboxId];
  });

  Object.assign(pageState, getCurrentPageCheckboxState());
  state.pages[pageSaveId] = pageState;
  state.pageSettings[pageSaveId] = getCurrentPageSettings();
  state.lastSaved = new Date().toISOString();

  try {
    writeSaveState(state);
  } catch (error) {
    showAutosaveStatus("Save failed");
    return;
  }

  if (showFeedback) {
    showAutosaveStatus("Autosaved");
  }
}

function restoreCurrentPageState() {
  const state = readSaveState();
  applyPageCheckboxState(state.pages[pageSaveId]);
}

function showAutosaveStatus(message) {
  if (!saveStatus) {
    return;
  }

  saveStatus.textContent = message;
  saveStatus.classList.add("visible");
  window.clearTimeout(saveStatusTimer);
  saveStatusTimer = window.setTimeout(() => {
    saveStatus.classList.remove("visible");
    saveStatus.textContent = "";
  }, 1600);
}

function exportSaveState() {
  const state = readSaveState();
  const pageState = state.pages[pageSaveId] || {};
  const visibleCheckboxIds = getCurrentVisibleCheckboxIds();

  visibleCheckboxIds.forEach((checkboxId) => {
    delete pageState[checkboxId];
  });

  Object.assign(pageState, getCurrentPageCheckboxState());
  state.pages[pageSaveId] = pageState;
  state.pageSettings[pageSaveId] = getCurrentPageSettings();
  state.lastSaved = new Date().toISOString();

  try {
    writeSaveState(state);
  } catch (error) {
    alert("Export failed because the current save could not be written.");
    return;
  }

  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const downloadLink = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  downloadLink.href = objectUrl;
  downloadLink.download = `ti4-checklists-state-${pageSaveId.replace(/[^a-z0-9._-]+/gi, "-")}.json`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(objectUrl);
  showAutosaveStatus("Save exported");
}

function importSaveState(file) {
  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.addEventListener("load", () => {
    try {
      const importedState = JSON.parse(reader.result);

      if (!isValidSaveState(importedState)) {
        throw new Error("Invalid save format.");
      }

      writeSaveState({
        version: saveVersion,
        pages: importedState.pages,
        pageSettings: importedState.pageSettings || {},
        lastSaved: new Date().toISOString()
      });
      restorePageSettings();
      renderChecklist();
      restoreCurrentPageState();
      renderPhaseFlows();
      showAutosaveStatus("Save imported");
    } catch (error) {
      alert("Import failed. Please choose a valid TI4 checklist save JSON file.");
    } finally {
      importSaveInput.value = "";
    }
  });

  reader.addEventListener("error", () => {
    alert("Import failed. The selected file could not be read.");
    importSaveInput.value = "";
  });

  reader.readAsText(file);
}

function resetCurrentPageSave() {
  const confirmed = window.confirm("Reset saved checkbox state for this page only?");

  if (!confirmed) {
    return;
  }

  const state = readSaveState();
  delete state.pages[pageSaveId];
  delete state.pageSettings[pageSaveId];
  state.lastSaved = new Date().toISOString();

  try {
    writeSaveState(state);
  } catch (error) {
    alert("Reset failed because the current save could not be written.");
    return;
  }

  applyPageCheckboxState({});
  renderPhaseFlows();
  showAutosaveStatus("Page reset");
}

function getColourLabel(value) {
  return playerColours.find((colour) => colour.value === value)?.label || value;
}

function getGameSettings() {
  return {
    version: gameVersionSelect?.value || "base",
    useCodex: useCodexCardsInput?.checked || false
  };
}

function getLeaderInfo(cardName) {
  const supportEntry = factionLeaderEntries.find((entry) => entry.name === cardName);

  if (supportEntry) {
    return supportEntry;
  }

  if (heroFactionByName[cardName]) {
    return {
      faction: heroFactionByName[cardName]
    };
  }

  return null;
}

function isCardAvailable(cardName) {
  const settings = getGameSettings();
  const leaderInfo = getLeaderInfo(cardName);
  const meta = cardVersionMeta[cardName] || leaderInfo || { source: "base" };

  if (meta.source === "te") {
    return false;
  }

  if (meta.source === "pok" && settings.version !== "pok") {
    return false;
  }

  if (meta.requiresPok && settings.version !== "pok") {
    return false;
  }

  if (meta.source === "codex" && !settings.useCodex) {
    return false;
  }

  if (meta.source === "codex" && meta.replaces) {
    const replacedMeta = cardVersionMeta[meta.replaces];

    if (replacedMeta?.source === "pok" && settings.version !== "pok") {
      return false;
    }
  }

  if (settings.useCodex && meta.replacedByCodex) {
    return false;
  }

  return true;
}

function renderOwnerChips(ownerColours, playerColour) {
  return ownerColours.map((ownerColour) => {
    const ownerText = ownerColour === playerColour ? "You" : getColourLabel(ownerColour);

    return `
      <span class="owner-chip">
        <span class="colour-dot colour-${ownerColour}" aria-hidden="true"></span>
        ${ownerText}
      </span>
    `;
  }).join("");
}

function getOwnerSummary(ownerColours, playerColour) {
  const hasPlayer = ownerColours.includes(playerColour);
  const opponentLabels = ownerColours
    .filter((ownerColour) => ownerColour !== playerColour)
    .map(getColourLabel);

  if (hasPlayer && opponentLabels.length) {
    return `You and ${opponentLabels.join(", ")} can affect this window`;
  }

  if (hasPlayer) {
    return "You can use this effect";
  }

  return `${opponentLabels.join(", ")} can affect this window`;
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
        if (!isCardAvailable(card.name)) {
          return;
        }

        entries.push({
          ...card,
          category: categoryByName[card.name] || (card.type.includes("leader") ? "Faction Leaders" : card.type),
          faction: getLeaderInfo(card.name)?.faction || "",
          flowTitle: flow.title,
          phaseId: placement[0],
          stepId: placement[1],
          stepName: step.step
        });
      });
    });
  });

  factionLeaderEntries.forEach((leader) => {
    if (!isCardAvailable(leader.name)) {
      return;
    }

    entries.push({
      name: leader.name,
      type: leader.type,
      text: leader.text,
      category: "Faction Leaders",
      faction: leader.faction,
      flowTitle: "Faction Leaders",
      phaseId: leader.phaseId,
      stepId: leader.stepId,
      stepName: leader.stepName
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
        type: entry.type,
        text: entry.text,
        faction: entry.faction || getLeaderInfo(entry.name)?.faction || ""
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

function renderFilteredViews() {
  const activeFilter = document.querySelector(".filter-button.active")?.dataset.filter || "all";
  renderChecklist();
  restoreCurrentPageState();
  renderPhaseFlows();
  renderFlows(activeFilter);
}

function renderChecklist() {
  if (!cardChecklist || !heroChecklist) {
    return;
  }

  const cards = getUniqueCards();

  function renderChecklistGroup(group, groupCards, isOpen = false) {
    return `
      <details class="checklist-group" ${isOpen ? "open" : ""}>
        <summary>
          <span>${group}</span>
          <span>${groupCards.length}</span>
        </summary>
        <div class="checklist-items">
          ${groupCards.map((card) => {
            const cardSlug = slugify(card.name);
            const selectedColours = selectedCards.get(card.name) || new Set();

            return `
              <div class="checklist-item">
                <span class="card-summary">
                  <strong>${card.name}</strong>
                  <span>${card.type}</span>
                  ${card.category === "Faction Leaders" ? `<p class="card-description">${card.text}</p>` : ""}
                </span>
                <div class="colour-choice-group" aria-label="${card.name} owner colours">
                  ${playerColours.map((colour) => {
                    const id = `card-${cardSlug}-${colour.value}`;

                    return `
                      <label class="colour-choice colour-${colour.value}" for="${id}">
                        <input
                          id="${id}"
                          type="checkbox"
                          value="${colour.value}"
                          data-card-name="${card.name}"
                          ${selectedColours.has(colour.value) ? "checked" : ""}
                        >
                        <span>${colour.label}</span>
                      </label>
                    `;
                  }).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </details>
    `;
  }

  const leaderCards = cards.filter((card) => card.category === "Faction Leaders");

  if (leaderCards.length) {
    const factionNames = [...new Set(leaderCards.map((card) => card.faction || "Other Leaders"))].sort();
    heroChecklistMessage.textContent = "Open a faction, read what each agent, commander, or hero does, then tick the player colours that have that leader. Selected effects appear in the matching phase flow.";
    heroChecklist.innerHTML = factionNames.map((factionName) => {
      const factionCards = leaderCards
        .filter((card) => (card.faction || "Other Leaders") === factionName)
        .sort((first, second) => first.type.localeCompare(second.type) || first.name.localeCompare(second.name));

      return renderChecklistGroup(factionName, factionCards);
    }).join("");
  } else {
    const settings = getGameSettings();
    heroChecklistMessage.textContent = settings.version === "base"
      ? "Faction leaders are introduced by Prophecy of Kings. Change Game version to Prophecy of Kings to pick agents, commanders, and heroes."
      : "No faction leaders are available for the current version choices.";
    heroChecklist.innerHTML = "";
  }

  cardChecklist.innerHTML = cardGroups.filter((group) => group !== "Faction Leaders").map((group) => {
    const groupCards = cards.filter((card) => card.category === group);

    if (!groupCards.length) {
      return "";
    }

    return renderChecklistGroup(group, groupCards);
  }).join("");

  getChecklistCheckboxes().forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const cardName = checkbox.dataset.cardName;
      const selectedColours = selectedCards.get(cardName) || new Set();

      if (checkbox.checked) {
        selectedColours.add(checkbox.value);
        selectedCards.set(cardName, selectedColours);
      } else {
        selectedColours.delete(checkbox.value);

        if (selectedColours.size) {
          selectedCards.set(cardName, selectedColours);
        } else {
          selectedCards.delete(cardName);
        }
      }

      renderPhaseFlows();
      saveCurrentPageState();
    });
  });
}

function renderPhaseFlows() {
  if (!phaseFlowList) {
    return;
  }

  const playerColour = playerColourSelect?.value || "red";
  const activeEntries = getModifierEntries()
    .filter((entry) => selectedCards.has(entry.name))
    .map((entry) => {
      const ownerColours = [...selectedCards.get(entry.name)];

      return {
        ...entry,
        ownerColours,
        isPlayerOwned: ownerColours.includes(playerColour),
        hasOpponentOwner: ownerColours.some((ownerColour) => ownerColour !== playerColour)
      };
    });

  phaseFlowList.innerHTML = basePhases.map((phase) => {
    const phaseEntries = activeEntries.filter((entry) => entry.phaseId === phase.id);
    const playerActiveCount = phaseEntries.filter((entry) => entry.isPlayerOwned).length;
    const opponentActiveCount = phaseEntries.reduce((count, entry) => {
      return count + entry.ownerColours.filter((ownerColour) => ownerColour !== playerColour).length;
    }, 0);

    return `
    <details class="phase-card">
      <summary>
        <span>${phase.number}</span>
        <strong>${phase.title}</strong>
        <span>You ${playerActiveCount} | Others ${opponentActiveCount}</span>
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
                      <div class="modifier-card ${modifier.isPlayerOwned ? "player-owned" : "opponent-owned"} ${modifier.hasOpponentOwner ? "has-opponent-owner" : ""}">
                        <span class="modifier-meta">
                          <span class="owner-chip-list">${renderOwnerChips(modifier.ownerColours, playerColour)}</span>
                          <span>${modifier.category}</span>
                        </span>
                        <strong>${modifier.name}</strong>
                        <p><strong>Card text:</strong> ${modifier.text}</p>
                        <p><strong>How it modifies this step:</strong> ${getOwnerSummary(modifier.ownerColours, playerColour)} during ${modifier.stepName}.</p>
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

  const visibleFlows = (filter === "all"
    ? flows
    : flows.filter((flow) => flow.id === filter))
    .map((flow) => {
      return {
        ...flow,
        steps: flow.steps
          .map((step) => {
            return {
              ...step,
              cards: step.cards.filter((card) => isCardAvailable(card.name))
            };
          })
          .filter((step) => step.cards.length)
      };
    })
    .filter((flow) => flow.steps.length);

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

if (playerColourSelect) {
  playerColourSelect.addEventListener("change", renderPhaseFlows);
}

if (gameVersionSelect) {
  gameVersionSelect.addEventListener("change", () => {
    renderFilteredViews();
    saveCurrentPageState();
  });
}

if (useCodexCardsInput) {
  useCodexCardsInput.addEventListener("change", () => {
    renderFilteredViews();
    saveCurrentPageState();
  });
}

if (clearCardsButton) {
  clearCardsButton.addEventListener("click", () => {
    selectedCards.clear();

    getChecklistCheckboxes().forEach((checkbox) => {
      checkbox.checked = false;
    });

    renderPhaseFlows();
    saveCurrentPageState();
  });
}

if (exportSaveButton) {
  exportSaveButton.addEventListener("click", exportSaveState);
}

if (importSaveInput) {
  importSaveInput.addEventListener("change", () => {
    importSaveState(importSaveInput.files[0]);
  });
}

if (resetPageSaveButton) {
  resetPageSaveButton.addEventListener("click", resetCurrentPageSave);
}

window.addEventListener("resize", () => {
  resizeCanvas();
  createStars();
});

resizeCanvas();
createStars();
drawStarfield();
restorePageSettings();
renderChecklist();
restoreCurrentPageState();
renderPhaseFlows();
renderFlows();
