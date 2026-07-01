const canvas = document.querySelector("#starfield");
const context = canvas.getContext("2d");
const stars = [];
const starCount = 120;
const phaseFlowList = document.querySelector("#phaseFlowList");
const cardChecklist = document.querySelector("#cardChecklist");
const actionCardChecklist = document.querySelector("#actionCardChecklist");
const planetsRelicsChecklist = document.querySelector("#planetsRelicsChecklist");
const heroChecklist = document.querySelector("#heroChecklist");
const heroChecklistMessage = document.querySelector("#heroChecklistMessage");
const factionSelectors = document.querySelector("#factionSelectors");
const clearCardsButton = document.querySelector("#clearCards");
const playerColourSelect = document.querySelector("#playerColour");
const gameVersionSelect = document.querySelector("#gameVersion");
const useCodexCardsInput = document.querySelector("#useCodexCards");
const showFactionAbilitiesInput = document.querySelector("#showFactionAbilities");
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

const factionUnitTechEntries = [
  { faction: "The Arborec", name: "Letani Warrior II", type: "Faction unit upgrade", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Arborec faction infantry upgrade. After this unit is destroyed, it can return later like Infantry II and keeps the Arborec production identity." },
  { faction: "The Arborec", name: "Letani Behemoth", type: "Mech unit", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Arborec mech. Deploys from Mitosis and brings Sustain Damage, Production 2, and Planetary Shield." },
  { faction: "The Arborec", name: "Duha Menaimon", type: "Flagship unit", source: "base", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Arborec flagship. After its system is activated, it can produce up to 5 units there." },
  { faction: "The Barony of Letnev", name: "L4 Disruptors", type: "Faction technology", source: "base", phaseId: "invasion", stepId: "bombardment-space-cannon", stepName: "Bombardment and Space Cannon", text: "Letnev faction technology. Improves your bombardment pressure by weakening defending infantry before invasion." },
  { faction: "The Barony of Letnev", name: "Non-Euclidean Shielding", type: "Faction technology", source: "base", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Letnev faction technology. Your Sustain Damage units cancel extra hits, making sustain timing much stronger." },
  { faction: "The Barony of Letnev", name: "Dunlain Reaper", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "Letnev mech. Deploy at the start of a ground-combat round by spending resources to replace infantry with the mech." },
  { faction: "The Barony of Letnev", name: "Arc Secundus", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "start-combat-round", stepName: "Start of combat round", text: "Letnev flagship. Repairs itself at the start of each space-combat round and strips Planetary Shield from enemy units in its system." },
  { faction: "The Clan of Saar", name: "Chaos Mapping", type: "Faction technology", source: "base", phaseId: "action", stepId: "start-your-turn", stepName: "Start of your turn", text: "Saar faction technology. Gives a start-of-turn production option before your normal action flow continues." },
  { faction: "The Clan of Saar", name: "Floating Factory II", type: "Faction unit upgrade", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Saar faction space dock upgrade. It moves and retreats like a ship, improves production, and is destroyed if blockaded." },
  { faction: "The Clan of Saar", name: "Scavenger Zeta", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "after-control", stepName: "After gaining control", text: "Saar mech. Deploy after gaining a planet by spending a trade good." },
  { faction: "The Clan of Saar", name: "Son of Ragh", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "anti-fighter-barrage", stepName: "Anti-Fighter Barrage", text: "Saar flagship. Brings a large Anti-Fighter Barrage pool and Sustain Damage." },
  { faction: "The Embers of Muaat", name: "Magmus Reactor", type: "Faction technology", source: "base", replacedByCodex: "Magmus Reactor Omega", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Muaat faction technology. Original version supports trade-good production from supernova-related positioning." },
  { faction: "The Embers of Muaat", name: "Magmus Reactor Omega", type: "Faction technology", source: "codex", replaces: "Magmus Reactor", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Muaat Codex faction technology. Supernovas containing your units become Production 5 areas." },
  { faction: "The Embers of Muaat", name: "Prototype War Sun II", type: "Faction unit upgrade", source: "base", phaseId: "invasion", stepId: "start-invasion", stepName: "Start of invasion", text: "Muaat faction War Sun upgrade. Removes Planetary Shield like War Sun and improves the faction's signature unit." },
  { faction: "The Embers of Muaat", name: "Ember Colossus", type: "Mech unit", source: "pok", phaseId: "production", stepId: "action-phase-production", stepName: "Action-phase production", text: "Muaat mech. When using Star Forge nearby, place infantry with this unit." },
  { faction: "The Embers of Muaat", name: "The Inferno", type: "Flagship unit", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Muaat flagship. As an action, spend a strategy token to place a cruiser in its system." },
  { faction: "The Emirates of Hacan", name: "Production Biomes", type: "Faction technology", source: "base", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Hacan faction technology. Provides an economic production-window boost." },
  { faction: "The Emirates of Hacan", name: "Quantum Datahub Node", type: "Faction technology", source: "base", phaseId: "strategy", stepId: "choose-strategy-card", stepName: "Choose strategy card", text: "Hacan faction technology. Interacts with strategy-card selection and trade-good leverage." },
  { faction: "The Emirates of Hacan", name: "Pride of Kenara", type: "Mech unit", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Hacan mech. Lets planet cards be traded; if traded, move your units off the planet to another controlled planet." },
  { faction: "The Emirates of Hacan", name: "Wrath of Kenara", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Hacan flagship. After rolling a die during space combat in its system, you may spend a trade good to increase that result." },
  { faction: "The Federation of Sol", name: "Advanced Carrier II", type: "Faction unit upgrade", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Sol faction carrier upgrade. Improves carrier mobility and capacity for Sol's infantry-heavy game." },
  { faction: "The Federation of Sol", name: "Spec Ops II", type: "Faction unit upgrade", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Sol faction infantry upgrade. Destroyed infantry return more reliably than standard Infantry II." },
  { faction: "The Federation of Sol", name: "ZS Thunderbolt M2", type: "Mech unit", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Sol mech. Deploys after Orbital Drop by spending resources." },
  { faction: "The Federation of Sol", name: "Genesis", type: "Flagship unit", source: "base", phaseId: "status", stepId: "gain-command-tokens", stepName: "Gain and redistribute command tokens", text: "Sol flagship. At the end of the status phase, places infantry in its space area." },
  { faction: "The Ghosts of Creuss", name: "Wormhole Generator", type: "Faction technology", source: "base", replacedByCodex: "Wormhole Generator Omega", phaseId: "status", stepId: "gain-command-tokens", stepName: "Status phase", text: "Creuss faction technology. Original version places or moves a Creuss wormhole token at the start of the status phase." },
  { faction: "The Ghosts of Creuss", name: "Wormhole Generator Omega", type: "Faction technology", source: "codex", replaces: "Wormhole Generator", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Creuss Codex faction technology. As an action, exhaust it to place or move a Creuss wormhole token." },
  { faction: "The Ghosts of Creuss", name: "Dimensional Splicer", type: "Faction technology", source: "base", phaseId: "combat", stepId: "start-combat", stepName: "Start of combat", text: "Creuss faction technology. Creates a start-of-combat hit when wormhole positioning lines up." },
  { faction: "The Ghosts of Creuss", name: "Icarus Drive", type: "Mech unit", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Creuss mech. After any player activates a system, remove the mech to place or move a Creuss wormhole token there." },
  { faction: "The Ghosts of Creuss", name: "Hil Colish", type: "Flagship unit", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Creuss flagship. Its system contains the delta wormhole, and it may move before or after your other ships during movement." },
  { faction: "The L1Z1X Mindnet", name: "Inheritance Systems", type: "Faction technology", source: "base", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When researching technology", text: "L1Z1X faction technology. Exhaust and spend resources while researching to ignore all prerequisites." },
  { faction: "The L1Z1X Mindnet", name: "Super-Dreadnought II", type: "Faction unit upgrade", source: "base", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "L1Z1X faction dreadnought upgrade. Like Dreadnought II, it cannot be destroyed by Direct Hit." },
  { faction: "The L1Z1X Mindnet", name: "Annihilator", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "bombardment-space-cannon", stepName: "Bombardment and Space Cannon", text: "L1Z1X mech. Can use Bombardment against planets in its system while not in ground combat." },
  { faction: "The L1Z1X Mindnet", name: "[0.0.1]", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "L1Z1X flagship. Hits produced by this ship and your dreadnoughts must be assigned to non-fighter ships if able." },
  { faction: "The Mentak Coalition", name: "Salvage Operations", type: "Faction technology", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Mentak faction technology. Rewards you after space combat by salvaging value from destroyed ships." },
  { faction: "The Mentak Coalition", name: "Mirror Computing", type: "Faction technology", source: "base", phaseId: "agenda", stepId: "votes-cast", stepName: "After votes are cast", text: "Mentak faction technology. Improves the value of trade goods for spending and voting leverage." },
  { faction: "The Mentak Coalition", name: "Moll Terminus", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Mentak mech. Enemy ground forces on its planet cannot use Sustain Damage." },
  { faction: "The Mentak Coalition", name: "Fourth Moon", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Mentak flagship. Enemy ships in its system cannot use Sustain Damage." },
  { faction: "The Naalu Collective", name: "Hybrid Crystal Fighter II", type: "Faction unit upgrade", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Naalu faction fighter upgrade. Fighters may move without being transported, and excess fighters count as half a ship against fleet pool." },
  { faction: "The Naalu Collective", name: "Neuroglaive", type: "Faction technology", source: "base", phaseId: "tactical", stepId: "opponent-activates-your-system", stepName: "After another player activates your system", text: "Naalu faction technology. Pressures opponents' command-token economy when they activate systems containing your ships." },
  { faction: "The Naalu Collective", name: "Iconoclast", type: "Mech unit", source: "pok", replacedByCodex: "Iconoclast Omega", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Naalu mech. Base version improves combat rolls against opponents with relic fragments." },
  { faction: "The Naalu Collective", name: "Iconoclast Omega", type: "Mech unit", source: "codex", replaces: "Iconoclast", requiresPok: true, phaseId: "combat", stepId: "anti-fighter-barrage", stepName: "Anti-Fighter Barrage", text: "Naalu Codex mech. Prevents enemy Anti-Fighter Barrage against your units in its system." },
  { faction: "The Naalu Collective", name: "Matriarch", type: "Flagship unit", source: "base", phaseId: "invasion", stepId: "commit-ground-forces", stepName: "Commit ground forces", text: "Naalu flagship. Fighters in its system may be committed to planets as ground forces during invasion, then return afterward." },
  { faction: "The Nekro Virus", name: "Valefar Assimilator X", type: "Faction technology", source: "base", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When gaining technology", text: "Nekro faction technology. Tracks an assimilated opponent technology gained through Nekro technology-copy effects." },
  { faction: "The Nekro Virus", name: "Valefar Assimilator Y", type: "Faction technology", source: "base", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When gaining technology", text: "Nekro faction technology. Tracks a second assimilated opponent technology gained through Nekro technology-copy effects." },
  { faction: "The Nekro Virus", name: "The Alastor", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "start-combat", stepName: "Start of combat", text: "Nekro flagship. At the start of space combat, choose any number of ground forces in its system to participate as ships during that combat." },
  { faction: "The Nekro Virus", name: "Mordred", type: "Mech unit", source: "pok", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Nekro mech. During combat against an opponent who owns an X or Y assimilator technology, it can roll extra dice." },
  { faction: "Sardakk N'orr", name: "Exotrireme II", type: "Faction unit upgrade", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Sardakk faction dreadnought upgrade. After a space-combat round, you may destroy it to destroy up to 2 ships." },
  { faction: "Sardakk N'orr", name: "Valkyrie Particle Weave", type: "Faction technology", source: "base", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "Sardakk faction technology. Adds extra ground-combat pressure when opponent infantry are destroyed." },
  { faction: "Sardakk N'orr", name: "Valkyrie Exoskeleton", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Sardakk mech. After it uses Sustain Damage during ground combat, it produces 1 hit." },
  { faction: "Sardakk N'orr", name: "C'Morran N'orr", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Sardakk flagship. Your other ships in its system get stronger combat rolls." },
  { faction: "The Universities of Jol-Nar", name: "E-Res Siphons", type: "Faction technology", source: "base", phaseId: "tactical", stepId: "opponent-activates-your-system", stepName: "After another player activates your system", text: "Jol-Nar faction technology. Rewards you when another player activates a system containing your ships." },
  { faction: "The Universities of Jol-Nar", name: "Spacial Conduit Cylinder", type: "Faction technology", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Jol-Nar faction technology. Creates extra movement/positioning options through tech infrastructure." },
  { faction: "The Universities of Jol-Nar", name: "Shield Paling", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "commit-ground-forces", stepName: "Commit ground forces", text: "Jol-Nar mech. Infantry on its planet are not affected by the Jol-Nar Fragile faction ability." },
  { faction: "The Universities of Jol-Nar", name: "J.N.S. Hylarim", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Jol-Nar flagship. Natural high combat rolls produce extra hits." },
  { faction: "The Winnu", name: "Lazax Gate Folding", type: "Faction technology", source: "base", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Winnu faction technology. Helps place units and command pressure around Mecatol Rex and home-system positioning." },
  { faction: "The Winnu", name: "Hegemonic Trade Policy", type: "Faction technology", source: "base", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Winnu faction technology. Gives economic leverage for production and faction tempo." },
  { faction: "The Winnu", name: "Reclaimer", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "after-control", stepName: "After gaining control", text: "Winnu mech. After a tactical action where you gain control of its planet, place 1 PDS or 1 space dock there." },
  { faction: "The Winnu", name: "Salai Sai Corian", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Winnu flagship. Rolls a number of dice tied to the opponent's non-fighter ships in its system." },
  { faction: "The Xxcha Kingdom", name: "Nullification Field", type: "Faction technology", source: "base", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Xxcha faction technology. Taxes or blocks activations into systems containing your units." },
  { faction: "The Xxcha Kingdom", name: "Indomitus", type: "Mech unit", source: "pok", phaseId: "tactical", stepId: "space-cannon-offense", stepName: "Space Cannon Offense", text: "Xxcha mech. Adds adjacent Space Cannon pressure." },
  { faction: "The Xxcha Kingdom", name: "Loncarra Ssodu", type: "Flagship unit", source: "base", phaseId: "tactical", stepId: "space-cannon-offense", stepName: "Space Cannon Offense", text: "Xxcha flagship. Can use Space Cannon against ships in adjacent systems, giving Xxcha a wide defensive firing net." },
  { faction: "The Yin Brotherhood", name: "Yin Spinner", type: "Faction technology", source: "base", replacedByCodex: "Yin Spinner Omega", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Yin faction technology. Original version places extra infantry as part of Yin's infantry engine." },
  { faction: "The Yin Brotherhood", name: "Yin Spinner Omega", type: "Faction technology", source: "codex", replaces: "Yin Spinner", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Yin Codex faction technology. Places up to 2 infantry more flexibly than the original." },
  { faction: "The Yin Brotherhood", name: "Impulse Core", type: "Faction technology", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Yin faction technology. Supports sacrifice/destruction timing in combat." },
  { faction: "The Yin Brotherhood", name: "Moyin's Ashes", type: "Mech unit", source: "pok", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "Yin mech. Deploys with Indoctrination and adds influence for replacement effects." },
  { faction: "The Yin Brotherhood", name: "Van Hauge", type: "Flagship unit", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Yin flagship. When it is destroyed, destroy all ships in its system." },
  { faction: "The Yssaril Tribes", name: "Mageon Implants", type: "Faction technology", source: "base", phaseId: "action", stepId: "start-your-turn", stepName: "Start of your turn", text: "Yssaril faction technology. Supports action-card theft and hand pressure." },
  { faction: "The Yssaril Tribes", name: "Transparasteel Plating", type: "Faction technology", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Yssaril faction technology. Helps stall and protect action-card tempo." },
  { faction: "The Yssaril Tribes", name: "Blackshade Infiltrator", type: "Mech unit", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Yssaril mech. Deploys after Stall Tactics by placing the mech on a planet you control." },
  { faction: "The Yssaril Tribes", name: "Y'sia Y'ssrila", type: "Flagship unit", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Yssaril flagship. Can move through systems that contain other players' ships." },
  { faction: "The Argent Flight", name: "Aerie Hololattice", type: "Faction technology", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Argent faction technology. Adds structure and production flexibility around PDS/dock positioning." },
  { faction: "The Argent Flight", name: "Strike Wing Alpha II", type: "Faction unit upgrade", source: "pok", phaseId: "combat", stepId: "anti-fighter-barrage", stepName: "Anti-Fighter Barrage", text: "Argent faction destroyer upgrade. Improves unit-ability dice pressure, especially Anti-Fighter Barrage." },
  { faction: "The Argent Flight", name: "Aerie Sentinel", type: "Mech unit", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Argent mech. Does not count against capacity when transported or while in space with ships that have capacity." },
  { faction: "The Argent Flight", name: "Quetzecoatl", type: "Flagship unit", source: "pok", phaseId: "tactical", stepId: "space-cannon-offense", stepName: "Space Cannon Offense", text: "Argent flagship. Other players cannot use Space Cannon against your ships in its system." },
  { faction: "The Empyrean", name: "Aetherstream", type: "Faction technology", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Empyrean faction technology. Improves movement through anomaly/empty-space positioning." },
  { faction: "The Empyrean", name: "Watcher", type: "Mech unit", source: "pok", phaseId: "action", stepId: "action-card-window", stepName: "When action cards are played or discarded", text: "Empyrean mech. Remove it from a system containing or adjacent to another player's units to cancel an action card played by that player." },
  { faction: "The Empyrean", name: "Dynamo", type: "Flagship unit", source: "pok", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Empyrean flagship. After a unit in or adjacent to its system uses Sustain Damage, you may spend influence to repair that unit." },
  { faction: "The Mahact Gene-Sorcerers", name: "Crimson Legionnaire II", type: "Faction unit upgrade", source: "pok", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Mahact faction infantry upgrade. Destroyed infantry can return later and add commodity/trade-good value before being placed on the card." },
  { faction: "The Mahact Gene-Sorcerers", name: "Starlancer", type: "Mech unit", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Mahact mech. If a player whose token is in your fleet pool activates this system, you may spend their token to end their turn." },
  { faction: "The Mahact Gene-Sorcerers", name: "Arvicon Rex", type: "Flagship unit", source: "pok", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Mahact flagship. Gets stronger combat rolls against opponents whose command token is not in your fleet pool." },
  { faction: "The Naaz-Rokha Alliance", name: "Eidolon", type: "Mech unit", source: "pok", phaseId: "combat", stepId: "start-combat", stepName: "Start of combat", text: "Naaz-Rokha mech. Flips into ship mode in active-system space combat, then flips back at the end of the space battle." },
  { faction: "The Naaz-Rokha Alliance", name: "Visz el Vir", type: "Flagship unit", source: "pok", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Naaz-Rokha flagship. Your mechs in its system roll an additional die during combat." },
  { faction: "The Nomad", name: "Temporal Command Suite", type: "Faction technology", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Nomad faction technology. Adds action/flagship tempo around the Nomad's multi-agent toolkit." },
  { faction: "The Nomad", name: "Quantum Manipulator", type: "Mech unit", source: "pok", phaseId: "combat", stepId: "assign-hits", stepName: "Assign hits and Sustain Damage", text: "Nomad mech. During space combat, it may use Sustain Damage to cancel a hit against your ships in its system." },
  { faction: "The Nomad", name: "Memoria", type: "Flagship unit", source: "pok", phaseId: "combat", stepId: "start-combat", stepName: "Start of combat", text: "Nomad flagship. The faction's central flagship; check it for The Cavalry and other Nomad effects that copy or move flagship values." },
  { faction: "The Nomad", name: "Memoria II", type: "Faction unit upgrade", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Nomad faction flagship upgrade. Its system is treated as adjacent to systems that contain your mechs." },
  { faction: "The Titans of Ul", name: "Saturn Engine II", type: "Faction unit upgrade", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Titans faction cruiser upgrade. Improves Saturn Engine movement and combat flexibility." },
  { faction: "The Titans of Ul", name: "Hel Titan II", type: "Faction unit upgrade", source: "pok", phaseId: "tactical", stepId: "space-cannon-offense", stepName: "Space Cannon Offense", text: "Titans faction PDS upgrade. Treated as both structure and ground force; cannot be transported; has Sustain Damage and Production 1." },
  { faction: "The Titans of Ul", name: "Hecatoncheires", type: "Mech unit", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Titans mech. Deploys when you would place a PDS, placing this unit and infantry instead." },
  { faction: "The Titans of Ul", name: "Ouranos", type: "Flagship unit", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Titans flagship. After you activate a system containing one or more of your PDS, you may replace a PDS with this unit." },
  { faction: "The Vuil'Raith Cabal", name: "Vortex", type: "Faction technology", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Cabal faction technology. Captures a unit through dimensional-tear positioning." },
  { faction: "The Vuil'Raith Cabal", name: "Dimensional Tear II", type: "Faction unit upgrade", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Cabal faction space dock upgrade. Its system is a gravity rift your ships ignore and it exempts up to 12 fighters from capacity." },
  { faction: "The Vuil'Raith Cabal", name: "Reanimator", type: "Mech unit", source: "pok", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Cabal mech. Enemy infantry destroyed on its planet are captured on your faction sheet instead of returning normally." },
  { faction: "The Vuil'Raith Cabal", name: "The Terror Between", type: "Flagship unit", source: "pok", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Cabal flagship. Capture all other non-structure units that are destroyed in its system, including your own." },
  { faction: "The Council Keleres", name: "I.I.H.Q. Modernization", type: "Faction technology", source: "codex", requiresPok: true, phaseId: "agenda", stepId: "votes-cast", stepName: "After votes are cast", text: "Keleres Codex faction technology. Supports agenda and political economy play; noted as a version-tracking edge case in later releases." },
  { faction: "The Council Keleres", name: "Agency Supply Network", type: "Faction technology", source: "codex", requiresPok: true, phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "Keleres Codex faction technology. Adds supply and production support for the faction's tax-and-tempo game." },
  { faction: "The Council Keleres", name: "Omniopiares", type: "Mech unit", source: "codex", requiresPok: true, phaseId: "invasion", stepId: "commit-ground-forces", stepName: "Commit ground forces", text: "Keleres mech. Other players must spend influence to commit ground forces to its planet." },
  { faction: "The Council Keleres", name: "Artemiris", type: "Flagship unit", source: "codex", requiresPok: true, phaseId: "tactical", stepId: "activate-system", stepName: "When you activate a system", text: "Keleres flagship. Other players must spend influence to activate its system." }
];

const factionPromissoryEntries = [
  { faction: "The Arborec", name: "Stymie", type: "Faction promissory note", source: "base", replacedByCodex: "Stymie Omega", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Arborec promissory note. Original version creates an action-phase lockout around Arborec production near the holder's units." },
  { faction: "The Arborec", name: "Stymie Omega", type: "Faction promissory note", source: "codex", replaces: "Stymie", phaseId: "tactical", stepId: "move-ships", stepName: "After ships move", text: "Arborec Codex promissory note. After another player's ships move into a system containing your units, place one of their command tokens in a non-home system." },
  { faction: "The Barony of Letnev", name: "War Funding", type: "Faction promissory note", source: "base", replacedByCodex: "War Funding Omega", phaseId: "combat", stepId: "start-combat-round", stepName: "Start of combat round", text: "Letnev promissory note. Original version grants rerolls at the start of a space-combat round, then returns to Letnev." },
  { faction: "The Barony of Letnev", name: "War Funding Omega", type: "Faction promissory note", source: "codex", replaces: "War Funding", phaseId: "combat", stepId: "start-combat-round", stepName: "Start of combat round", text: "Letnev Codex promissory note. Revised start-of-space-combat-round reroll support; return it after resolving the effect." },
  { faction: "The Clan of Saar", name: "Ragh's Call", type: "Faction promissory note", source: "base", phaseId: "invasion", stepId: "commit-ground-forces", stepName: "After committing ground forces", text: "Saar promissory note. After you commit ground forces to a planet, remove Saar ground forces from that planet and return the note." },
  { faction: "The Embers of Muaat", name: "Fires of the Gashlai", type: "Faction promissory note", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Muaat promissory note. As an action, remove a Muaat fleet token from the board to gain War Sun technology, then return the note." },
  { faction: "The Emirates of Hacan", name: "Trade Convoys", type: "Faction promissory note", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Hacan promissory note. As an action, you may transact with players who are not your neighbors until the note is returned." },
  { faction: "The Federation of Sol", name: "Military Support", type: "Faction promissory note", source: "base", phaseId: "action", stepId: "start-your-turn", stepName: "Start of your turn", text: "Sol promissory note. At the start of your turn, remove one of Sol's strategy tokens from the board to place infantry, then return the note." },
  { faction: "The Ghosts of Creuss", name: "Creuss Iff", type: "Faction promissory note", source: "base", phaseId: "action", stepId: "start-your-turn", stepName: "Start of your turn", text: "Creuss promissory note. At the start of your turn, place or move a Creuss wormhole token, then return the note." },
  { faction: "The L1Z1X Mindnet", name: "Cybernetic Enhancements", type: "Faction promissory note", source: "base", replacedByCodex: "Cybernetic Enhancements Omega", phaseId: "strategy", stepId: "choose-strategy-card", stepName: "Strategy phase", text: "L1Z1X promissory note. Original version manipulates command-token economy around the strategy phase." },
  { faction: "The L1Z1X Mindnet", name: "Cybernetic Enhancements Omega", type: "Faction promissory note", source: "codex", replaces: "Cybernetic Enhancements", phaseId: "status", stepId: "gain-command-tokens", stepName: "Gain command tokens", text: "L1Z1X Codex promissory note. During the status phase command-token gain window, gain an extra command token, then return the note." },
  { faction: "The Mentak Coalition", name: "Promise of Protection", type: "Faction promissory note", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Mentak promissory note. As an action, protect yourself from Mentak Pillage until the note is returned." },
  { faction: "The Naalu Collective", name: "Gift of Prescience", type: "Faction promissory note", source: "base", phaseId: "strategy", stepId: "choose-strategy-card", stepName: "End of strategy phase", text: "Naalu promissory note. At the end of the strategy phase, take the Naalu 0 token for the round and disable Naalu's initiative ability until it returns." },
  { faction: "The Nekro Virus", name: "Antivirus", type: "Faction promissory note", source: "base", phaseId: "combat", stepId: "start-combat", stepName: "Start of combat", text: "Nekro promissory note. At the start of combat, prevent Nekro from using Technological Singularity against you until the note returns." },
  { faction: "Sardakk N'orr", name: "Tekklar Legion", type: "Faction promissory note", source: "base", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "Sardakk promissory note. At the start of invasion combat, modify combat rolls depending on whether Sardakk is involved." },
  { faction: "The Universities of Jol-Nar", name: "Research Agreement", type: "Faction promissory note", source: "base", phaseId: "research", stepId: "research-unit-upgrade", stepName: "After Jol-Nar researches", text: "Jol-Nar promissory note. After Jol-Nar researches a non-faction technology, gain that technology, then return the note." },
  { faction: "The Winnu", name: "Acquiescence", type: "Faction promissory note", source: "base", replacedByCodex: "Acquiescence Omega", phaseId: "strategy", stepId: "choose-strategy-card", stepName: "End of strategy phase", text: "Winnu promissory note. Original version lets you swap strategy cards with the Winnu at the end of the strategy phase." },
  { faction: "The Winnu", name: "Acquiescence Omega", type: "Faction promissory note", source: "codex", replaces: "Acquiescence", phaseId: "action", stepId: "strategic-action", stepName: "When another player would perform a strategic action", text: "Winnu Codex promissory note. Lets you resolve the Winnu player's strategic-action secondary without spending a command token." },
  { faction: "The Xxcha Kingdom", name: "Political Favor", type: "Faction promissory note", source: "base", phaseId: "agenda", stepId: "agenda-revealed", stepName: "After an agenda is revealed", text: "Xxcha promissory note. When an agenda is revealed, remove an Xxcha strategy token to discard it and reveal the next agenda instead." },
  { faction: "The Yin Brotherhood", name: "Greyfire Mutagen", type: "Faction promissory note", source: "base", replacedByCodex: "Greyfire Mutagen Omega", phaseId: "tactical", stepId: "activate-system", stepName: "After a system is activated", text: "Yin promissory note. Original version restricts Yin faction abilities and faction technologies during the tactical action after a system is activated." },
  { faction: "The Yin Brotherhood", name: "Greyfire Mutagen Omega", type: "Faction promissory note", source: "codex", replaces: "Greyfire Mutagen", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "Yin Codex promissory note. At the start of ground combat against multiple non-Yin ground forces, replace an enemy infantry with one of your infantry." },
  { faction: "The Yssaril Tribes", name: "Spy Net", type: "Faction promissory note", source: "base", phaseId: "action", stepId: "start-your-turn", stepName: "Start of your turn", text: "Yssaril promissory note. At the start of your turn, look at the Yssaril player's action cards and take one, then return the note." },
  { faction: "The Argent Flight", name: "Strike Wing Ambuscade", type: "Faction promissory note", source: "pok", phaseId: "combat", stepId: "anti-fighter-barrage", stepName: "When a unit rolls for a unit ability", text: "Argent promissory note. When one or more units make a roll for a unit ability, choose one of those units to roll an additional die, then return the note." },
  { faction: "The Empyrean", name: "Dark Pact", type: "Faction promissory note", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Empyrean promissory note. A face-up pact that supports commodity-to-trade-good cooperation with Empyrean." },
  { faction: "The Empyrean", name: "Blood Pact", type: "Faction promissory note", source: "pok", phaseId: "agenda", stepId: "votes-cast", stepName: "After votes are cast", text: "Empyrean promissory note. A face-up pact that can add joint voting leverage during agendas." },
  { faction: "The Mahact Gene-Sorcerers", name: "Scepter of Dominion", type: "Faction promissory note", source: "pok", phaseId: "strategy", stepId: "choose-strategy-card", stepName: "Start of strategy phase", text: "Mahact promissory note. At the start of the strategy phase, place command tokens into a system with Mahact units for players whose tokens Mahact has." },
  { faction: "The Naaz-Rokha Alliance", name: "Black Market Forgery", type: "Faction promissory note", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Naaz-Rokha promissory note. As an action, purge matching relic fragments to gain a relic, then return the note." },
  { faction: "The Nomad", name: "The Cavalry", type: "Faction promissory note", source: "pok", phaseId: "combat", stepId: "start-combat", stepName: "Start of space combat", text: "Nomad promissory note. At the start of space combat against a non-Nomad player, one of your non-fighter ships can gain the Nomad flagship's combat values for that combat." },
  { faction: "The Titans of Ul", name: "Terraform", type: "Faction promissory note", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Titans promissory note. As an action, attach it to an eligible non-home planet you control to improve the planet and give it all three traits." },
  { faction: "The Vuil'Raith Cabal", name: "Crucible", type: "Faction promissory note", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "After you activate a system", text: "Cabal promissory note. After you activate a system, your ships ignore gravity-rift rolls this movement and gain extra movement through dimensional tears, then return the note." },
  { faction: "The Council Keleres", name: "Keleres Rider", type: "Faction promissory note", source: "codex", requiresPok: true, phaseId: "agenda", stepId: "agenda-revealed", stepName: "After an agenda is revealed", text: "Keleres promissory note. A rider played after an agenda is revealed; if your prediction is correct, draw an action card and gain trade goods." }
];

const factionSpecificEntries = [
  ...factionLeaderEntries,
  ...factionUnitTechEntries,
  ...factionPromissoryEntries
];

const factionAbilityEntries = [
  { faction: "The Arborec", name: "Mitosis", source: "base", phaseId: "status", stepId: "gain-command-tokens", stepName: "Status phase", text: "Your space docks cannot produce infantry. At the start of the status phase, place 1 infantry from your reinforcements on any planet you control." },
  { faction: "The Barony of Letnev", name: "Munitions Reserves", source: "base", phaseId: "combat", stepId: "start-combat-round", stepName: "Start of combat round", text: "At the start of each round of space combat, you may spend 2 trade goods to reroll any number of your dice during that combat round." },
  { faction: "The Barony of Letnev", name: "Armada", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Fleet supply checks", text: "The maximum number of non-fighter ships you can have in each system is equal to 2 more than the number of tokens in your fleet pool." },
  { faction: "The Clan of Saar", name: "Scavenge", source: "base", phaseId: "invasion", stepId: "after-control", stepName: "After gaining control", text: "After you gain control of a planet, gain 1 trade good." },
  { faction: "The Clan of Saar", name: "Nomadic", source: "base", phaseId: "status", stepId: "gain-command-tokens", stepName: "Scoring checks", text: "You can score objectives even if you do not control the planets in your home system." },
  { faction: "The Embers of Muaat", name: "Star Forge", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Action: Spend 1 token from your strategy pool to place either 2 fighters or 1 destroyer in a system that contains 1 or more of your war suns." },
  { faction: "The Embers of Muaat", name: "Gashlai Physiology", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Your ships can move through supernovas." },
  { faction: "The Emirates of Hacan", name: "Masters of Trade", source: "base", phaseId: "action", stepId: "strategic-action", stepName: "Trade secondary", text: "You do not have to spend a command token to resolve the secondary ability of the Trade strategy card." },
  { faction: "The Emirates of Hacan", name: "Guild Ships", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "Transactions", text: "You can negotiate transactions with players who are not your neighbor, and action cards can be exchanged as part of those transactions." },
  { faction: "The Federation of Sol", name: "Orbital Drop", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Action: Spend 1 token from your strategy pool to place 2 infantry from your reinforcements on 1 planet you control." },
  { faction: "The Federation of Sol", name: "Versatile", source: "base", phaseId: "status", stepId: "gain-command-tokens", stepName: "Gain command tokens", text: "When you gain command tokens during the status phase, gain 1 additional command token." },
  { faction: "The Ghosts of Creuss", name: "Quantum Entanglement", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Wormhole adjacency", text: "You treat all alpha and beta wormhole systems as adjacent to each other. Game effects cannot prevent you from using this ability." },
  { faction: "The Ghosts of Creuss", name: "Slipstream", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "During your tactical actions, apply +1 to the move value of ships that start in your home system or in an alpha or beta wormhole system." },
  { faction: "The L1Z1X Mindnet", name: "Assimilate", source: "base", phaseId: "invasion", stepId: "after-control", stepName: "After gaining control", text: "When you gain control of a planet, replace each PDS and space dock on that planet with matching units from your reinforcements." },
  { faction: "The L1Z1X Mindnet", name: "Harrow", source: "base", phaseId: "invasion", stepId: "after-winning-ground-combat", stepName: "End of ground-combat round", text: "At the end of each round of ground combat, your ships in the active system may use Bombardment against your opponent's ground forces on the planet." },
  { faction: "The Mentak Coalition", name: "Ambush", source: "base", phaseId: "combat", stepId: "start-combat", stepName: "Start of combat", text: "At the start of space combat, roll for up to 2 cruisers or destroyers; each success produces 1 hit that your opponent must assign to a ship." },
  { faction: "The Mentak Coalition", name: "Pillage", source: "base", phaseId: "action", stepId: "action-card-window", stepName: "After transactions or trade-good gains", text: "After a neighbor gains trade goods or resolves a transaction, if they have 3 or more trade goods, you may take 1 of their trade goods or commodities." },
  { faction: "The Naalu Collective", name: "Telepathic", source: "base", phaseId: "strategy", stepId: "choose-strategy-card", stepName: "End of strategy phase", text: "At the end of the strategy phase, place the Naalu 0 token on your strategy card; you are first in initiative order." },
  { faction: "The Naalu Collective", name: "Foresight", source: "base", phaseId: "tactical", stepId: "move-ships", stepName: "After another player moves in", text: "After another player moves ships into a system that contains your ships, you may spend a strategy token to move your ships to an adjacent eligible system." },
  { faction: "The Nekro Virus", name: "Galactic Threat", source: "base", phaseId: "agenda", stepId: "agenda-revealed", stepName: "After an agenda is revealed", text: "You cannot vote on agendas. Once per agenda phase, after an agenda is revealed, predict the outcome; if correct, gain 1 technology owned by a player who voted that way." },
  { faction: "The Nekro Virus", name: "Technological Singularity", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After units are destroyed", text: "Once per combat, after 1 of your opponent's units is destroyed, you may gain 1 technology owned by that player." },
  { faction: "The Nekro Virus", name: "Propagation", source: "base", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When you would research", text: "You cannot research technology. When you would research a technology, gain 3 command tokens instead." },
  { faction: "Sardakk N'orr", name: "Unrelenting", source: "base", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Apply +1 to the result of each of your unit's combat rolls." },
  { faction: "The Universities of Jol-Nar", name: "Fragile", source: "base", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "Apply -1 to the result of each of your unit's combat rolls." },
  { faction: "The Universities of Jol-Nar", name: "Brilliant", source: "base", phaseId: "action", stepId: "strategic-action", stepName: "Technology secondary", text: "When you spend a command token to resolve the secondary ability of the Technology strategy card, you may resolve the primary ability instead." },
  { faction: "The Universities of Jol-Nar", name: "Analytical", source: "base", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When researching", text: "When you research a technology that is not a unit upgrade technology, you may ignore 1 prerequisite." },
  { faction: "The Winnu", name: "Blood Ties", source: "base", phaseId: "invasion", stepId: "after-control", stepName: "Mecatol Rex control", text: "You do not have to spend influence to remove the custodians token from Mecatol Rex." },
  { faction: "The Winnu", name: "Reclamation", source: "base", phaseId: "tactical", stepId: "end-tactical-action", stepName: "After resolving tactical action", text: "After you resolve a tactical action during which you gained control of Mecatol Rex, you may place 1 PDS and 1 space dock there." },
  { faction: "The Xxcha Kingdom", name: "Peace Accords", source: "base", phaseId: "action", stepId: "strategic-action", stepName: "After Diplomacy resolves", text: "After you resolve the primary or secondary ability of Diplomacy, you may gain control of 1 eligible empty planet adjacent to a planet you control." },
  { faction: "The Xxcha Kingdom", name: "Quash", source: "base", phaseId: "agenda", stepId: "agenda-revealed", stepName: "When an agenda is revealed", text: "When an agenda is revealed, you may spend 1 token from your strategy pool to discard it and reveal the next agenda instead." },
  { faction: "The Yin Brotherhood", name: "Indoctrination", source: "base", phaseId: "invasion", stepId: "start-ground-combat", stepName: "Start of ground combat", text: "At the start of a ground combat, you may spend 2 influence to replace 1 opponent infantry with 1 infantry from your reinforcements." },
  { faction: "The Yin Brotherhood", name: "Devotion", source: "base", phaseId: "combat", stepId: "units-destroyed", stepName: "After each space battle round", text: "After each space battle round, you may destroy 1 of your cruisers or destroyers in the active system to produce 1 hit against an opponent ship." },
  { faction: "The Yssaril Tribes", name: "Stall Tactics", source: "base", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Action: Discard 1 action card from your hand." },
  { faction: "The Yssaril Tribes", name: "Scheming", source: "base", phaseId: "status", stepId: "draw-action-cards", stepName: "When drawing action cards", text: "When you draw 1 or more action cards, draw 1 additional action card, then choose and discard 1 action card from your hand." },
  { faction: "The Yssaril Tribes", name: "Crafty", source: "base", phaseId: "status", stepId: "draw-action-cards", stepName: "Action-card hand limit", text: "You can have any number of action cards in your hand. Game effects cannot prevent you from using this ability." },
  { faction: "The Argent Flight", name: "Zeal", source: "pok", phaseId: "agenda", stepId: "votes-cast", stepName: "Vote casting", text: "You always vote first during the agenda phase. When you cast at least 1 vote, cast 1 additional vote for each player in the game including you." },
  { faction: "The Argent Flight", name: "Raid Formation", source: "pok", phaseId: "combat", stepId: "anti-fighter-barrage", stepName: "Anti-Fighter Barrage", text: "When your units use Anti-Fighter Barrage, each excess hit can damage an opponent ship that has Sustain Damage." },
  { faction: "The Empyrean", name: "Voidborn", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Nebulae do not affect your ships' movement." },
  { faction: "The Empyrean", name: "Aetherpassage", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "After a system is activated", text: "After a player activates a system, you may allow that player to move their ships through systems that contain your ships." },
  { faction: "The Mahact Gene-Sorcerers", name: "Edict", source: "pok", phaseId: "combat", stepId: "units-destroyed", stepName: "After you win combat", text: "When you win a combat, place 1 command token from your opponent's reinforcements in your fleet pool if it does not already contain one of their tokens." },
  { faction: "The Mahact Gene-Sorcerers", name: "Imperia", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "Commander access", text: "While another player's command token is in your fleet pool, you can use that player's commander ability if it is unlocked." },
  { faction: "The Naaz-Rokha Alliance", name: "Distant Suns", source: "pok", phaseId: "invasion", stepId: "after-control", stepName: "Explore", text: "When you explore a planet that contains 1 of your mechs, draw 1 additional card, choose 1 to resolve, and discard the rest." },
  { faction: "The Naaz-Rokha Alliance", name: "Fabrication", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Action: Purge matching relic fragments to gain a relic, or purge 1 relic fragment to gain 1 command token." },
  { faction: "The Nomad", name: "Future Sight", source: "pok", phaseId: "agenda", stepId: "agenda-outcome", stepName: "After agenda outcome resolves", text: "During the agenda phase, after an outcome that you voted for or predicted is resolved, gain 1 trade good." },
  { faction: "The Titans of Ul", name: "Terragenesis", source: "pok", phaseId: "invasion", stepId: "after-control", stepName: "After exploration", text: "After you explore a planet that does not have a sleeper token, you may place or move 1 sleeper token onto that planet." },
  { faction: "The Titans of Ul", name: "Awaken", source: "pok", phaseId: "tactical", stepId: "activate-system", stepName: "After activation", text: "After you activate a system that contains one or more of your sleeper tokens, you may replace each of those tokens with 1 PDS from your reinforcements." },
  { faction: "The Titans of Ul", name: "Coalescence", source: "pok", phaseId: "combat", stepId: "start-combat", stepName: "Combat after placement", text: "If your flagship or Awaken places your units into another player's units, your units must participate in space or ground combat as normal." },
  { faction: "The Vuil'Raith Cabal", name: "Devour", source: "pok", phaseId: "combat", stepId: "units-destroyed", stepName: "When enemy units are destroyed", text: "Capture your opponent's non-structure units that are destroyed during combat." },
  { faction: "The Vuil'Raith Cabal", name: "Amalgamation", source: "pok", phaseId: "production", stepId: "units-use-production", stepName: "When producing", text: "When you produce a unit, you may return 1 captured unit of that type to produce it without spending resources." },
  { faction: "The Vuil'Raith Cabal", name: "Riftmeld", source: "pok", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When researching unit upgrades", text: "When you research a unit upgrade technology, you may return 1 captured unit of that type to ignore all of its prerequisites." },
  { faction: "The Council Keleres", name: "The Tribunii", source: "codex", requiresPok: true, phaseId: "strategy", stepId: "choose-strategy-card", stepName: "Setup", text: "During setup, choose an unplayed Keleres-linked faction package and take that faction's home system, command tokens, control tokens, and corresponding hero." },
  { faction: "The Council Keleres", name: "Agency", source: "codex", requiresPok: true, phaseId: "strategy", stepId: "choose-strategy-card", stepName: "Start of strategy phase", text: "Replenish your commodities at the start of the strategy phase, then gain 1 trade good." },
  { faction: "The Council Keleres", name: "Law's Order", source: "codex", requiresPok: true, phaseId: "action", stepId: "start-your-turn", stepName: "Start of turn", text: "You may spend influence at the start of your turn to treat all laws as blank until the end of your turn." }
];

const planetRelicEntries = [
  { name: "Mecatol Rex", type: "Planet", source: "base", phaseId: "invasion", stepId: "start-invasion", stepName: "Start of invasion", text: "Before committing ground forces to Mecatol Rex while the custodians token is present, spend 6 influence to remove that token. Controlling Mecatol Rex also unlocks the agenda phase." },
  { name: "Primor", type: "Legendary planet", source: "pok", phaseId: "action", stepId: "end-your-turn", stepName: "End of your turn", text: "At the end of your turn, place up to 2 infantry from your reinforcements on any planet you control." },
  { name: "Hope's End", type: "Legendary planet", source: "pok", phaseId: "action", stepId: "end-your-turn", stepName: "End of your turn", text: "At the end of your turn, exhaust this legendary planet to place 1 mech from your reinforcements on a planet you control or draw 1 action card." },
  { name: "Mallice", type: "Legendary planet", source: "pok", phaseId: "action", stepId: "end-your-turn", stepName: "End of your turn", text: "At the end of your turn, gain 2 trade goods or convert all your commodities to trade goods." },
  { name: "Mirage", type: "Legendary planet", source: "pok", phaseId: "action", stepId: "end-your-turn", stepName: "End of your turn", text: "At the end of your turn, place up to 2 fighters from your reinforcements in a system that contains your ships." },
  { name: "Custodia Vigilia", type: "Legendary planet", source: "codex", requiresPok: true, phaseId: "tactical", stepId: "space-cannon-offense", stepName: "Space Cannon Offense", text: "While you control Mecatol Rex, Mecatol Rex has Space Cannon 5." },
  { name: "Custodia Vigilia", type: "Legendary planet", source: "codex", requiresPok: true, phaseId: "production", stepId: "units-use-production", stepName: "When units use Production", text: "While you control Mecatol Rex, Mecatol Rex has Production 3." },
  { name: "Custodia Vigilia", type: "Legendary planet", source: "codex", requiresPok: true, phaseId: "action", stepId: "strategic-action", stepName: "Imperial strategy card", text: "While you control Mecatol Rex, gain 2 command tokens when another player scores points with the Imperial strategy card." },
  { name: "Dominus Orb", type: "Relic", source: "pok", phaseId: "tactical", stepId: "move-ships", stepName: "Before movement", text: "Before moving ships during a tactical action, purge this card to move ships out of systems that contain your command tokens." },
  { name: "Maw of Worlds", type: "Relic", source: "pok", phaseId: "agenda", stepId: "start-agenda", stepName: "Start of agenda phase", text: "At the start of the agenda phase, exhaust all your planets and purge this card to gain any 1 technology." },
  { name: "Scepter of Emelpar", type: "Relic", source: "pok", phaseId: "action", stepId: "strategic-action", stepName: "Strategy-pool spend", text: "Exhaust this card to spend 1 token from your reinforcements instead of your strategy pool." },
  { name: "Shard of the Throne", type: "Relic", source: "pok", phaseId: "invasion", stepId: "after-control", stepName: "After gaining control", text: "Gain 1 victory point while you have this relic; it can transfer when a player gains control of your home planet or a legendary planet you control." },
  { name: "Stellar Converter", type: "Relic", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Action: Purge this card to destroy an adjacent eligible non-home planet and purge its planet card and attachments." },
  { name: "The Codex", type: "Relic", source: "pok", phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Action: Purge this card to take up to 3 action cards of your choice from the action-card discard pile." },
  { name: "Crown of Emphidia", type: "Relic", source: "pok", phaseId: "tactical", stepId: "end-tactical-action", stepName: "End of tactical action", text: "After you resolve a tactical action, exhaust this card to explore 1 planet you control." },
  { name: "Crown of Emphidia", type: "Relic", source: "pok", phaseId: "status", stepId: "end-status", stepName: "End of status phase", text: "At the end of the status phase, if you control Tomb of Emphidia, purge this card to gain 1 victory point." },
  { name: "Crown of Thalnos", type: "Relic", source: "pok", phaseId: "combat", stepId: "roll-combat-dice", stepName: "Roll combat dice", text: "During each combat round, you may reroll any number of dice at +1; rerolled units that do not produce hits are destroyed." },
  { name: "The Obsidian", type: "Relic", source: "pok", phaseId: "status", stepId: "draw-secret-objectives", stepName: "Secret objective management", text: "When gained, draw 1 secret objective and increase your secret objective hand and scoring limit by 1." },
  { name: "The Prophet's Tears", type: "Relic", source: "pok", phaseId: "research", stepId: "research-unit-upgrade", stepName: "When researching technology", text: "When you research technology, exhaust this card to ignore 1 prerequisite or draw 1 action card." },
  { name: "Dynamis Core", type: "Relic", source: "codex", requiresPok: true, phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Your commodity value is increased by 2. As an action, purge this card to gain trade goods equal to your printed commodity value plus 2." },
  { name: "JR-XS455-0", type: "Relic", source: "codex", requiresPok: true, phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Exhaust this relic to choose a player; that player either spends 3 resources to place 1 structure or gains 1 trade good." },
  { name: "Nano-Forge", type: "Relic", source: "codex", requiresPok: true, phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Purge this card to attach it to a non-home, non-legendary planet you control; that planet gains +2 resources, +2 influence, and becomes legendary." },
  { name: "Circlet of the Void", type: "Relic", source: "codex", requiresPok: true, phaseId: "tactical", stepId: "move-ships", stepName: "Move ships", text: "Ignore gravity-rift rolls and other anomaly movement penalties." },
  { name: "Circlet of the Void", type: "Relic", source: "codex", requiresPok: true, phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Exhaust this card to explore a frontier token in an uncontested system." },
  { name: "Book of Latvinia", type: "Relic", source: "codex", requiresPok: true, phaseId: "research", stepId: "research-unit-upgrade", stepName: "When gained", text: "When gained, research up to 2 technologies that have no prerequisites." },
  { name: "Book of Latvinia", type: "Relic", source: "codex", requiresPok: true, phaseId: "action", stepId: "during-your-turn", stepName: "During your turn", text: "Purge this card to gain 1 victory point if you control all 4 technology specialty colors; otherwise, gain the speaker token." },
  { name: "Neuraloop", type: "Relic", source: "codex", requiresPok: true, phaseId: "status", stepId: "reveal-public-objective", stepName: "When a public objective is revealed", text: "When a public objective is revealed, you may purge a relic to replace that objective with a random one from any objective deck." }
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
  "Supercharge": "The Naaz-Rokha Alliance",
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
  "Bio-Stims": { source: "pok" },
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
  "Duranium Armor": { source: "base" },
  "Destroyer II": { source: "base" },
  "Dreadnought II": { source: "base" },
  "Emergency Repairs": { source: "base" },
  "Experimental Battlestation": { source: "base" },
  "Extreme Duress": { source: "te" },
  "Fire Team": { source: "base" },
  "Fighter II": { source: "base" },
  "Fighter Prototype": { source: "base" },
  "Flank Speed": { source: "base" },
  "Fleet Logistics": { source: "base" },
  "Focused Research": { source: "base" },
  "Forward Supply Base": { source: "codex" },
  "Ghost Squad": { source: "codex" },
  "Ghost Ship": { source: "base" },
  "Gravity Drive": { source: "base" },
  "Graviton Laser System": { source: "base" },
  "Gurno Aggero": { source: "pok" },
  "Hack Election": { source: "codex" },
  "Harka Leeds": { source: "codex", requiresPok: true },
  "Harrugh Gefhara": { source: "pok" },
  "Hesh and Prit": { source: "pok" },
  "Hyper Metabolism": { source: "base" },
  "In The Silence Of Space": { source: "base" },
  "Industrial Initiative": { source: "base" },
  "Infantry II": { source: "base" },
  "Integrated Economy": { source: "base" },
  "Ipswitch, Loose Cannon": { source: "pok" },
  "It Feeds on Carrion": { source: "pok" },
  "Jace X. 4th Air Legion": { source: "pok" },
  "Kuuasi Aun Jalatai": { source: "codex", requiresPok: true },
  "Kyver, Blade and Key": { source: "pok" },
  "Light/Wave Deflector": { source: "base" },
  "Letani Miasmiala": { source: "pok" },
  "Lost Star Chart": { source: "base" },
  "Magen Defense Grid": { source: "base", codexUpdated: true },
  "Maneuvering Jets": { source: "base" },
  "Manipulate Investments": { source: "pok" },
  "Master Plan": { source: "codex" },
  "Mathis Mathinus": { source: "pok" },
  "Mining Initiative": { source: "base" },
  "Mirik Aun Sissiri": { source: "pok" },
  "Morale Boost": { source: "base" },
  "Neural Motivator": { source: "base" },
  "Odlynn Myrr": { source: "codex", requiresPok: true },
  "PDS II": { source: "base" },
  "Parley": { source: "base" },
  "Plague": { source: "base" },
  "Plasma Scoring": { source: "base" },
  "Predictive Intelligence": { source: "pok" },
  "Psychoarchaeology": { source: "pok" },
  "Political Stability": { source: "base" },
  "Public Disgrace": { source: "base" },
  "Reveal Prototype": { source: "pok" },
  "Reverse Engineer": { source: "pok" },
  "Riftwalker Meian": { source: "pok" },
  "Rin, the Master's Legacy": { source: "pok" },
  "Rider cycle": { source: "base" },
  "Rise of a Messiah": { source: "base" },
  "Rout": { source: "pok" },
  "Sabotage": { source: "base" },
  "Sarween Tools": { source: "base" },
  "Scanlink Drone Network": { source: "pok" },
  "Self-Assembly Routines": { source: "pok" },
  "Sh'val, Harbinger": { source: "pok" },
  "Shields Holding": { source: "base" },
  "Skilled Retreat": { source: "base" },
  "Sling Relay": { source: "pok" },
  "Signal Jamming": { source: "base" },
  "Solar Flare": { source: "codex" },
  "Space Dock II": { source: "base" },
  "Summit": { source: "base" },
  "Supercharge": { source: "pok" },
  "The Helmsman": { source: "pok" },
  "The Oracle": { source: "pok" },
  "Transit Diodes": { source: "base" },
  "Tactical Bombardment": { source: "base" },
  "Ul the Progenitor": { source: "pok" },
  "UNIT.DSGN.FLAYESH": { source: "pok" },
  "War Machine": { source: "codex" },
  "War Sun": { source: "base" },
  "Waylay": { source: "pok" },
  "Unexpected Action": { source: "base" },
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
          },
          {
            name: "Political Stability",
            type: "Action card",
            text: "During the strategy phase, keep your current strategy card instead of choosing a new one."
          },
          {
            name: "Manipulate Investments",
            type: "Action card",
            text: "During strategy-card selection, place trade goods on strategy cards to shape later picks."
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
            name: "Psychoarchaeology",
            type: "Technology",
            text: "You can use technology specialties without exhausting their planets; during the action phase, exhaust a technology-specialty planet to gain 1 trade good."
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
          },
          {
            name: "Signal Jamming",
            type: "Action card",
            text: "After another player activates a system, place one of their command tokens in an eligible adjacent system."
          },
          {
            name: "Lost Star Chart",
            type: "Action card",
            text: "After a system is activated, treat the active system as adjacent to a chosen system during this tactical action."
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
          },
          {
            name: "Flank Speed",
            type: "Action card",
            text: "After you activate a system, apply +1 to the move value of your ships during this tactical action."
          },
          {
            name: "In The Silence Of Space",
            type: "Action card",
            text: "After you activate a system, your ships can move through systems that contain other players' ships during this movement."
          },
          {
            name: "Ghost Ship",
            type: "Action card",
            text: "After you activate a system, place a cruiser from reinforcements into an eligible empty system."
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
          },
          {
            name: "Maneuvering Jets",
            type: "Action card",
            text: "After your ships are targeted by Space Cannon, apply -4 to those Space Cannon rolls."
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
          },
          {
            name: "Morale Boost",
            type: "Action card",
            text: "At the start of a combat round, apply +1 to your combat rolls during that round."
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
            name: "Duranium Armor",
            type: "Technology",
            text: "During each combat round, after you assign hits to your units, repair 1 of your damaged units that did not use Sustain Damage during that combat round."
          },
          {
            name: "Dreadnought II",
            type: "Unit upgrade",
            text: "This unit cannot be destroyed by Direct Hit."
          },
          {
            name: "Fire Team",
            type: "Action card",
            text: "After you roll dice during ground combat, reroll any number of your dice."
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
          },
          {
            name: "Self-Assembly Routines",
            type: "Technology",
            text: "After 1 of your mechs is destroyed, gain 1 trade good."
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
          },
          {
            name: "Parley",
            type: "Action card",
            text: "At the start of an invasion, prevent another player's units from landing on a planet you control."
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
          },
          {
            name: "Tactical Bombardment",
            type: "Action card",
            text: "After Bombardment, destroy infantry on a bombarded planet according to the card effect."
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
          },
          {
            name: "Plague",
            type: "Action card",
            text: "After you win ground combat, destroy infantry on the invaded planet according to the card effect."
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
            name: "Self-Assembly Routines",
            type: "Technology",
            text: "After you use Production, exhaust this card to place 1 mech from reinforcements on a planet you control in that system."
          },
          {
            name: "Space Dock II",
            type: "Unit upgrade",
            text: "Increases Production and allows up to 3 fighters in this system to not count against your ships' capacity."
          },
          {
            name: "Industrial Initiative",
            type: "Action card",
            text: "When producing, gain trade goods or resources according to the card effect."
          },
          {
            name: "Mining Initiative",
            type: "Action card",
            text: "When producing or spending planetary economy, gain extra value from an industrial planet."
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
          },
          {
            name: "Focused Research",
            type: "Action card",
            text: "During a research window, spend trade goods to research an additional technology."
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
          },
          {
            name: "Rise of a Messiah",
            type: "Action card",
            text: "During the status phase, place infantry on planets you control according to the card effect."
          },
          {
            name: "Summit",
            type: "Action card",
            text: "During the status phase, gain command tokens according to the card effect."
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
          },
          {
            name: "Unexpected Action",
            type: "Action card",
            text: "As an action-phase effect, remove one of your command tokens from the board."
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
          },
          {
            name: "Bio-Stims",
            type: "Technology",
            text: "At the end of your turn, exhaust this card to ready 1 of your planets with a technology specialty or 1 of your other technologies."
          },
          {
            name: "Master Plan",
            type: "Action card",
            text: "At the end of your turn, perform an additional action if the card condition is met."
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
        id: "reveal-public-objective",
        title: "Reveal public objective",
        text: "Reveal the next public objective and resolve replacement effects."
      },
      {
        id: "draw-secret-objectives",
        title: "Secret objective management",
        text: "Resolve effects tied to drawing, holding, or scoring secret objectives."
      },
      {
        id: "draw-action-cards",
        title: "Draw step",
        text: "Resolve the normal draw step."
      },
      {
        id: "gain-command-tokens",
        title: "Gain and redistribute command tokens",
        text: "Gain command tokens, then redistribute command tokens among your pools."
      },
      {
        id: "end-status",
        title: "End of status phase",
        text: "Resolve effects that trigger at the end of the status phase."
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
  "Faction Cards",
  "Action Cards",
  "Planets and Relics",
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
  "Fire Team": "Action Cards",
  "Fighter Prototype": "Action Cards",
  "Flank Speed": "Action Cards",
  "Focused Research": "Action Cards",
  "Forward Supply Base": "Action Cards",
  "Ghost Squad": "Action Cards",
  "Ghost Ship": "Action Cards",
  "Hack Election": "Action Cards",
  "In The Silence Of Space": "Action Cards",
  "Industrial Initiative": "Action Cards",
  "Lost Star Chart": "Action Cards",
  "Maneuvering Jets": "Action Cards",
  "Manipulate Investments": "Action Cards",
  "Master Plan": "Action Cards",
  "Mining Initiative": "Action Cards",
  "Morale Boost": "Action Cards",
  "Parley": "Action Cards",
  "Plague": "Action Cards",
  "Political Stability": "Action Cards",
  "Public Disgrace": "Action Cards",
  "Reveal Prototype": "Action Cards",
  "Reverse Engineer": "Action Cards",
  "Rider cycle": "Action Cards",
  "Rise of a Messiah": "Action Cards",
  "Rout": "Action Cards",
  "Sabotage": "Action Cards",
  "Shields Holding": "Action Cards",
  "Signal Jamming": "Action Cards",
  "Skilled Retreat": "Action Cards",
  "Solar Flare": "Action Cards",
  "Summit": "Action Cards",
  "Tactical Bombardment": "Action Cards",
  "Unexpected Action": "Action Cards",
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
  "Duranium Armor": "Red Technology",
  "Magen Defense Grid": "Red Technology",
  "Plasma Scoring": "Red Technology",
  "Supercharge": "Faction Cards",
  "Bio-Stims": "Green Technology",
  "Dacxive Animators": "Green Technology",
  "Hyper Metabolism": "Green Technology",
  "Neural Motivator": "Green Technology",
  "Psychoarchaeology": "Green Technology",
  "Self-Assembly Routines": "Red Technology",
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

const fixedStartingTechByFaction = {
  "The Arborec": ["Magen Defense Grid"],
  "The Barony of Letnev": ["Antimass Deflectors", "Plasma Scoring"],
  "The Clan of Saar": ["Antimass Deflectors"],
  "The Embers of Muaat": ["Plasma Scoring"],
  "The Emirates of Hacan": ["Antimass Deflectors", "Sarween Tools"],
  "The Federation of Sol": ["Neural Motivator", "Antimass Deflectors"],
  "The Ghosts of Creuss": ["Gravity Drive"],
  "The L1Z1X Mindnet": ["Neural Motivator", "Plasma Scoring"],
  "The Mentak Coalition": ["Sarween Tools", "Plasma Scoring"],
  "The Naalu Collective": ["Neural Motivator", "Sarween Tools"],
  "The Nekro Virus": ["Dacxive Animators", "Valefar Assimilator X", "Valefar Assimilator Y"],
  "The Universities of Jol-Nar": ["Neural Motivator", "Antimass Deflectors", "Sarween Tools", "Plasma Scoring"],
  "The Xxcha Kingdom": ["Graviton Laser System"],
  "The Yin Brotherhood": ["Sarween Tools"],
  "The Yssaril Tribes": ["Neural Motivator"],
  "The Empyrean": ["Dark Energy Tap"],
  "The Mahact Gene-Sorcerers": ["Bio-Stims", "Predictive Intelligence"],
  "The Naaz-Rokha Alliance": ["Psychoarchaeology", "AI Development Algorithm"],
  "The Nomad": ["Sling Relay"],
  "The Titans of Ul": ["Antimass Deflectors", "Scanlink Drone Network"],
  "The Vuil'Raith Cabal": ["Self-Assembly Routines"]
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

    return Object.values(pageState).every((savedValue) => {
      return typeof savedValue === "boolean"
        || playerColours.some((colour) => colour.value === savedValue);
    });
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
    if (!pageSettings
      || typeof pageSettings !== "object"
      || Array.isArray(pageSettings)
      || !["base", "pok"].includes(pageSettings.gameVersion)
      || typeof pageSettings.useCodexCards !== "boolean") {
      return false;
    }

    if (pageSettings.showFactionAbilities !== undefined
      && typeof pageSettings.showFactionAbilities !== "boolean") {
      return false;
    }

    if (pageSettings.playerFactions === undefined) {
      return true;
    }

    if (!pageSettings.playerFactions || typeof pageSettings.playerFactions !== "object" || Array.isArray(pageSettings.playerFactions)) {
      return false;
    }

    return Object.entries(pageSettings.playerFactions).every(([colourValue, factionName]) => {
      return playerColours.some((colour) => colour.value === colourValue)
        && (factionName === "" || getFactionNames().includes(factionName));
    });
  });
}

function getCurrentVisibleCheckboxIds() {
  const visibleIds = [
    ...getChecklistCheckboxes().map((checkbox) => checkbox.id)
  ];

  getChecklistCheckboxes().forEach((checkbox) => {
    if (!checkbox.dataset.cardSlug) {
      return;
    }

    visibleIds.push(`card-${checkbox.dataset.cardSlug}-owner`);

    if (checkbox.dataset.singleOwner === "true" || checkbox.dataset.factionTechnology === "true") {
      visibleIds.push(`card-${checkbox.dataset.cardSlug}-owner-colour`);
    }

    playerColours.forEach((colour) => {
      visibleIds.push(`card-${checkbox.dataset.cardSlug}-${colour.value}`);
    });
  });

  return visibleIds;
}

function getCurrentPageSettings() {
  return {
    gameVersion: gameVersionSelect?.value || "base",
    useCodexCards: useCodexCardsInput?.checked || false,
    showFactionAbilities: showFactionAbilitiesInput?.checked ?? true,
    playerFactions: getPlayerFactionSelections()
  };
}

function getFactionNames() {
  const factionNames = new Set([
    ...factionSpecificEntries.map((entry) => entry.faction),
    ...factionAbilityEntries.map((entry) => entry.faction),
    ...Object.values(heroFactionByName)
  ]);

  return [...factionNames].filter(Boolean).sort();
}

function getFactionColourSelects() {
  return [...document.querySelectorAll("#factionSelectors select[data-player-colour]")];
}

function getPlayerFactionSelections() {
  return getFactionColourSelects().reduce((selections, select) => {
    selections[select.dataset.playerColour] = select.value;
    return selections;
  }, {});
}

function getVisiblePlayerColours() {
  const selections = getPlayerFactionSelections();
  const selectedColours = playerColours.filter((colour) => selections[colour.value]);

  return selectedColours.length ? selectedColours : playerColours;
}

function getFactionOwnerColour(factionName) {
  if (!factionName) {
    return "";
  }

  const matchingSelect = getFactionColourSelects().find((select) => select.value === factionName);
  return matchingSelect?.dataset.playerColour || "";
}

function getSelectedFactionNames() {
  return new Set(Object.values(getPlayerFactionSelections()).filter(Boolean));
}

function renderFactionSelectors() {
  if (!factionSelectors) {
    return;
  }

  const existingSelections = getPlayerFactionSelections();
  const factionOptions = getFactionNames().map((factionName) => {
    return `<option value="${factionName}">${factionName}</option>`;
  }).join("");

  factionSelectors.innerHTML = playerColours.map((colour) => `
    <label class="faction-colour-control faction-colour-${colour.value}" for="faction-${colour.value}">
      <span>
        <span class="colour-dot colour-${colour.value}" aria-hidden="true"></span>
        ${getColourLabelWithPlayerMarker(colour.value)}
      </span>
      <select id="faction-${colour.value}" data-player-colour="${colour.value}">
        <option value="">No faction (${getColourLabelWithPlayerMarker(colour.value)})</option>
        ${factionOptions}
      </select>
    </label>
  `).join("");

  getFactionColourSelects().forEach((select) => {
    const existingSelection = existingSelections[select.dataset.playerColour] || "";

    if ([...select.options].some((option) => option.value === existingSelection)) {
      select.value = existingSelection;
    }

    select.addEventListener("change", () => {
      renderChecklist();
      restoreCurrentPageState();
      renderPhaseFlows();
      saveCurrentPageState();
    });
  });
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

  if (showFactionAbilitiesInput && typeof pageSettings.showFactionAbilities === "boolean") {
    showFactionAbilitiesInput.checked = pageSettings.showFactionAbilities;
  }

  if (pageSettings.playerFactions && typeof pageSettings.playerFactions === "object") {
    getFactionColourSelects().forEach((select) => {
      const selectedFaction = pageSettings.playerFactions[select.dataset.playerColour] || "";

      if ([...select.options].some((option) => option.value === selectedFaction)) {
        select.value = selectedFaction;
      }
    });
  }
}

function restorePageSettings() {
  const state = readSaveState();
  applyPageSettings(state.pageSettings[pageSaveId]);
}

function getChecklistCheckboxes() {
  return [...document.querySelectorAll("#heroChecklist input[type='checkbox'], #actionCardChecklist input[type='checkbox'], #planetsRelicsChecklist input[type='checkbox'], #cardChecklist input[type='checkbox']")];
}

function updateSingleOwnerChoiceStyle(checkbox, ownerColour, recommendedColour = ownerColour) {
  const choiceLabel = checkbox?.closest(".colour-choice");

  if (!choiceLabel) {
    return;
  }

  choiceLabel.classList.remove(...playerColours.map((colour) => `colour-${colour.value}`));
  choiceLabel.classList.remove("player-colour-choice", "recommended-colour-choice");
  choiceLabel.classList.add(`colour-${ownerColour}`);

  if (ownerColour === recommendedColour) {
    choiceLabel.classList.add("recommended-colour-choice");
  }
}

function getCurrentPageCheckboxState() {
  const pageState = {};

  getChecklistCheckboxes().forEach((checkbox) => {
    if (checkbox.checked) {
      pageState[checkbox.id] = checkbox.dataset.commanderOther === "true" || checkbox.dataset.promissoryHolder === "true"
        ? checkbox.value
        : true;
    }
  });

  return pageState;
}

function applyPageCheckboxState(pageState) {
  selectedCards.clear();

  if (!pageState) {
    pageState = {};
  }

  getChecklistCheckboxes().forEach((checkbox) => {
    let isChecked = pageState[checkbox.id] === true;

    if (checkbox.dataset.commanderOther === "true") {
      const savedColour = pageState[checkbox.id];
      const colourSelect = document.querySelector(`#${checkbox.id}-colour`);
      const factionName = getLeaderInfo(checkbox.dataset.cardName)?.faction || "";
      const ownerColour = getFactionOwnerColour(factionName);

      if (getVisiblePlayerColours().some((colour) => colour.value === savedColour) && savedColour !== ownerColour) {
        checkbox.value = savedColour;
        isChecked = true;

        if (colourSelect) {
          colourSelect.value = savedColour;
        }
      }
    }

    if (checkbox.dataset.promissoryHolder === "true") {
      const savedColour = pageState[checkbox.id];
      const colourSelect = document.querySelector(`#${checkbox.id}-colour`);
      const factionName = getLeaderInfo(checkbox.dataset.cardName)?.faction || "";
      const ownerColour = getFactionOwnerColour(factionName);

      if (getVisiblePlayerColours().some((colour) => colour.value === savedColour) && savedColour !== ownerColour) {
        checkbox.value = savedColour;
        isChecked = true;

        if (colourSelect) {
          colourSelect.value = savedColour;
        }
      }
    }

    if (!isChecked && checkbox.dataset.singleOwner === "true") {
      const legacyOwner = playerColours.find((colour) => {
        return pageState[`card-${checkbox.dataset.cardSlug}-${colour.value}`] === true;
      });

      if (legacyOwner) {
        isChecked = true;
      }
    }

    if (!isChecked && checkbox.dataset.playerOnly === "true") {
      const playerColour = playerColourSelect?.value || checkbox.value;
      isChecked = pageState[`card-${checkbox.dataset.cardSlug}-${playerColour}`] === true;
    }

    if (!isChecked && checkbox.dataset.factionTechnology === "true") {
      isChecked = pageState[`card-${checkbox.dataset.cardSlug}-${checkbox.value}`] === true;
    }

    if (checkbox.dataset.singleOwner === "true") {
      const factionName = getLeaderInfo(checkbox.dataset.cardName)?.faction || "";
      updateSingleOwnerChoiceStyle(
        checkbox,
        checkbox.value,
        getFactionOwnerColour(factionName) || checkbox.value
      );
    }

    checkbox.checked = isChecked;

    if (checkbox.checked) {
      const cardName = checkbox.dataset.cardName;
      const factionName = getLeaderInfo(cardName)?.faction || "";
      const ownerColour = checkbox.dataset.singleOwner === "true" || checkbox.dataset.commanderOwner === "true"
        ? getFactionOwnerColour(factionName) || checkbox.value
        : checkbox.value;
      const selectedColours = selectedCards.get(cardName) || new Set();
      selectedColours.add(ownerColour);
      selectedCards.set(cardName, selectedColours);
    }
  });

  applyStartingTechDefaults();
}

function applyStartingTechDefaults() {
  const selections = getPlayerFactionSelections();

  Object.entries(selections).forEach(([colourValue, factionName]) => {
    const startingTechs = fixedStartingTechByFaction[factionName] || [];

    startingTechs.forEach((techName) => {
      if (!isCardAvailable(techName)) {
        return;
      }

      const checkbox = getChecklistCheckboxes().find((candidate) => {
        return candidate.dataset.cardName === techName
          && (candidate.value === colourValue || candidate.dataset.singleOwner === "true" || candidate.dataset.factionTechnology === "true");
      });

      if (!checkbox) {
        return;
      }

      checkbox.checked = true;
      const selectedColours = selectedCards.get(techName) || new Set();
      selectedColours.add(colourValue);
      selectedCards.set(techName, selectedColours);
    });
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
  applyPageSettings({
    gameVersion: "base",
    useCodexCards: false,
    showFactionAbilities: true,
    playerFactions: {}
  });
  renderChecklist();
  renderPhaseFlows();
  showAutosaveStatus("Page reset");
}

function getColourLabel(value) {
  return playerColours.find((colour) => colour.value === value)?.label || value;
}

function getColourLabelWithPlayerMarker(value) {
  const label = getColourLabel(value);
  return value === (playerColourSelect?.value || "red") ? `${label} (Your colour)` : label;
}

function getGameSettings() {
  return {
    version: gameVersionSelect?.value || "base",
    useCodex: useCodexCardsInput?.checked || false
  };
}

function isVersionedEntryAvailable(meta) {
  const settings = getGameSettings();

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
    const replacedMeta = cardVersionMeta[meta.replaces] || getLeaderInfo(meta.replaces);

    if (replacedMeta?.source === "pok" && settings.version !== "pok") {
      return false;
    }
  }

  if (settings.useCodex && meta.replacedByCodex) {
    return false;
  }

  return true;
}

function getLeaderInfo(cardName) {
  const supportEntry = factionSpecificEntries.find((entry) => entry.name === cardName);

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
  const leaderInfo = getLeaderInfo(cardName);
  const meta = cardVersionMeta[cardName] || leaderInfo || { source: "base" };

  return isVersionedEntryAvailable(meta);
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

function isSingleOwnerCard(card) {
  return card.category === "Faction Cards"
    && card.type !== "Commander leader"
    && card.type !== "Faction technology"
    && card.type !== "Faction promissory note";
}

function isFactionTechnologyCard(card) {
  return card.category === "Faction Cards" && card.type === "Faction technology";
}

function isCommanderCard(card) {
  return card.category === "Faction Cards" && card.type === "Commander leader";
}

function isFactionPromissoryNoteCard(card) {
  return card.category === "Faction Cards" && card.type === "Faction promissory note";
}

function isPlayerOnlyCard(card) {
  return card.category === "Planets and Relics" || card.category === "Action Cards";
}

function getModifierEntries() {
  const entries = [];
  const selectedFactionNames = getSelectedFactionNames();

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

        const cardFaction = getLeaderInfo(card.name)?.faction || "";

        if (cardFaction && selectedFactionNames.size && !selectedFactionNames.has(cardFaction)) {
          return;
        }

        entries.push({
          ...card,
          category: categoryByName[card.name] || (card.type.includes("leader") ? "Faction Cards" : card.type),
          faction: cardFaction,
          flowTitle: flow.title,
          phaseId: placement[0],
          stepId: placement[1],
          stepName: step.step
        });
      });
    });
  });

  factionSpecificEntries.forEach((factionCard) => {
    if (!isCardAvailable(factionCard.name)) {
      return;
    }

    if (selectedFactionNames.size && !selectedFactionNames.has(factionCard.faction)) {
      return;
    }

    entries.push({
      name: factionCard.name,
      type: factionCard.type,
      text: factionCard.text,
      category: "Faction Cards",
      faction: factionCard.faction,
      flowTitle: "Faction Cards",
      phaseId: factionCard.phaseId,
      stepId: factionCard.stepId,
      stepName: factionCard.stepName
    });
  });

  if (showFactionAbilitiesInput?.checked) {
    factionAbilityEntries.forEach((ability) => {
      const ownerColour = getFactionOwnerColour(ability.faction);

      if (!selectedFactionNames.size || !selectedFactionNames.has(ability.faction) || !ownerColour) {
        return;
      }

      if (!isVersionedEntryAvailable(ability)) {
        return;
      }

      entries.push({
        name: ability.name,
        type: "Faction ability",
        text: ability.text,
        category: "Faction Ability",
        faction: ability.faction,
        flowTitle: "Faction Abilities",
        phaseId: ability.phaseId,
        stepId: ability.stepId,
        stepName: ability.stepName,
        alwaysActive: true,
        ownerColours: [ownerColour]
      });
    });
  }

  planetRelicEntries.forEach((entry) => {
    if (!isVersionedEntryAvailable(entry)) {
      return;
    }

    entries.push({
      name: entry.name,
      type: entry.type,
      text: entry.text,
      category: "Planets and Relics",
      faction: "",
      flowTitle: "Planets and Relics",
      phaseId: entry.phaseId,
      stepId: entry.stepId,
      stepName: entry.stepName
    });
  });

  return entries;
}

function getUniqueCards() {
  const cardsByName = new Map();

  getModifierEntries().forEach((entry) => {
    if (entry.alwaysActive) {
      return;
    }

    if (!cardsByName.has(entry.name)) {
      cardsByName.set(entry.name, {
        name: entry.name,
        category: entry.category,
        type: entry.type,
        text: entry.text,
        faction: entry.faction || getLeaderInfo(entry.name)?.faction || ""
      });
    } else if (entry.category === "Planets and Relics") {
      const existingCard = cardsByName.get(entry.name);

      if (!existingCard.text.includes(entry.text)) {
        existingCard.text = `${existingCard.text} ${entry.text}`;
      }
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
  renderChecklist();
  restoreCurrentPageState();
  renderPhaseFlows();
}

function renderChecklist() {
  if (!cardChecklist || !actionCardChecklist || !planetsRelicsChecklist || !heroChecklist) {
    return;
  }

  const cards = getUniqueCards();

  function renderChecklistGroup(group, groupCards, isOpen = false) {
    const playerColour = playerColourSelect?.value || "red";
    const visiblePlayerColours = getVisiblePlayerColours();

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
            const isCommander = isCommanderCard(card);
            const isFactionPromissoryNote = isFactionPromissoryNoteCard(card);
            const isSingleOwner = isSingleOwnerCard(card);
            const isFactionTechnology = isFactionTechnologyCard(card);
            const isPlayerOnly = isPlayerOnlyCard(card);
            const factionOwnerColour = getFactionOwnerColour(card.faction) || "";
            const recommendedColour = factionOwnerColour || playerColour;
            const nekroColour = getFactionOwnerColour("The Nekro Virus");
            const commanderOtherColours = visiblePlayerColours.filter((colour) => colour.value !== recommendedColour);
            const selectedCommanderOtherColour = [...selectedColours].find((colour) => colour !== recommendedColour);
            const commanderOtherColour = selectedCommanderOtherColour || commanderOtherColours[0]?.value || "";
            const promissoryHolderColours = factionOwnerColour
              ? visiblePlayerColours.filter((colour) => colour.value !== factionOwnerColour)
              : visiblePlayerColours;
            const selectedPromissoryHolderColour = [...selectedColours].find((colour) => colour !== factionOwnerColour);
            const promissoryHolderColour = selectedPromissoryHolderColour || promissoryHolderColours[0]?.value || "";
            const showNekroTechnologyChoice = isFactionTechnology
              && card.faction !== "The Nekro Virus"
              && nekroColour
              && nekroColour !== recommendedColour;
            const singleOwnerCheckboxId = `card-${cardSlug}-owner`;
            const playerOnlyCheckboxId = `card-${cardSlug}-active-player`;
            const commanderOtherCheckboxId = `card-${cardSlug}-other`;
            const promissoryHolderCheckboxId = `card-${cardSlug}-holder`;
            const nekroTechnologyCheckboxId = `card-${cardSlug}-nekro`;

            return `
              <div class="checklist-item">
                <span class="card-summary">
                  <strong>${card.name}</strong>
                  <span>${card.type}</span>
                  ${card.category === "Faction Cards" || card.category === "Planets and Relics" ? `<p class="card-description">${card.text}</p>` : ""}
                </span>
                ${isCommander ? `
                  <div class="commander-choice-group" aria-label="${card.name} commander assignment">
                    <label class="colour-choice single-owner-choice colour-${recommendedColour} recommended-colour-choice" for="${singleOwnerCheckboxId}">
                      <input
                        id="${singleOwnerCheckboxId}"
                        type="checkbox"
                        value="${recommendedColour}"
                        data-card-name="${card.name}"
                        data-card-slug="${cardSlug}"
                        data-commander-owner="true"
                        ${selectedColours.has(recommendedColour) ? "checked" : ""}
                      >
                      <span>Owner (${getColourLabelWithPlayerMarker(recommendedColour)})</span>
                    </label>
                    ${commanderOtherColours.length ? `
                      <div class="commander-other-control">
                        <label class="colour-choice colour-${commanderOtherColour}" for="${commanderOtherCheckboxId}">
                          <input
                            id="${commanderOtherCheckboxId}"
                            type="checkbox"
                            value="${commanderOtherColour}"
                            data-card-name="${card.name}"
                            data-card-slug="${cardSlug}"
                            data-commander-other="true"
                            ${selectedCommanderOtherColour ? "checked" : ""}
                          >
                          <span>Other</span>
                        </label>
                        <select id="${commanderOtherCheckboxId}-colour" data-commander-other-select="${commanderOtherCheckboxId}" aria-label="${card.name} other commander colour">
                          ${commanderOtherColours.map((colour) => `
                            <option value="${colour.value}" ${colour.value === commanderOtherColour ? "selected" : ""}>${getColourLabelWithPlayerMarker(colour.value)}</option>
                          `).join("")}
                        </select>
                      </div>
                    ` : ""}
                  </div>
                ` : isFactionPromissoryNote ? `
                  ${promissoryHolderColours.length ? `
                    <div class="promissory-choice-group" aria-label="${card.name} holder assignment">
                      <div class="promissory-holder-control">
                        <label class="colour-choice colour-${promissoryHolderColour}" for="${promissoryHolderCheckboxId}">
                          <input
                            id="${promissoryHolderCheckboxId}"
                            type="checkbox"
                            value="${promissoryHolderColour}"
                            data-card-name="${card.name}"
                            data-card-slug="${cardSlug}"
                            data-promissory-holder="true"
                            ${selectedPromissoryHolderColour ? "checked" : ""}
                          >
                          <span>Holder</span>
                        </label>
                        <select id="${promissoryHolderCheckboxId}-colour" data-promissory-holder-select="${promissoryHolderCheckboxId}" aria-label="${card.name} holder colour">
                          ${promissoryHolderColours.map((colour) => `
                            <option value="${colour.value}" ${colour.value === promissoryHolderColour ? "selected" : ""}>${getColourLabelWithPlayerMarker(colour.value)}</option>
                          `).join("")}
                        </select>
                      </div>
                    </div>
                  ` : ""}
                ` : isSingleOwner ? `
                  <div class="single-owner-control" aria-label="${card.name} owner colour">
                    <label class="colour-choice single-owner-choice colour-${recommendedColour} recommended-colour-choice" for="${singleOwnerCheckboxId}">
                      <input
                        id="${singleOwnerCheckboxId}"
                        type="checkbox"
                        value="${recommendedColour}"
                        data-card-name="${card.name}"
                        data-card-slug="${cardSlug}"
                        data-single-owner="true"
                        ${selectedColours.size ? "checked" : ""}
                      >
                      <span>In play (${getColourLabelWithPlayerMarker(recommendedColour)})</span>
                    </label>
                  </div>
                ` : isPlayerOnly ? `
                  <div class="single-owner-control" aria-label="${card.name} active player assignment">
                    <label class="colour-choice single-owner-choice colour-${playerColour} recommended-colour-choice" for="${playerOnlyCheckboxId}">
                      <input
                        id="${playerOnlyCheckboxId}"
                        type="checkbox"
                        value="${playerColour}"
                        data-card-name="${card.name}"
                        data-card-slug="${cardSlug}"
                        data-player-only="true"
                        ${selectedColours.has(playerColour) ? "checked" : ""}
                      >
                      <span>Active</span>
                    </label>
                  </div>
                ` : isFactionTechnology ? `
                  <div class="colour-choice-group faction-technology-choice-group" aria-label="${card.name} owner colours">
                    <label class="colour-choice colour-${recommendedColour} recommended-colour-choice" for="${singleOwnerCheckboxId}">
                      <input
                        id="${singleOwnerCheckboxId}"
                        type="checkbox"
                        value="${recommendedColour}"
                        data-card-name="${card.name}"
                        data-card-slug="${cardSlug}"
                        data-faction-technology="true"
                        ${selectedColours.has(recommendedColour) ? "checked" : ""}
                      >
                      <span>${getColourLabelWithPlayerMarker(recommendedColour)}</span>
                    </label>
                    ${showNekroTechnologyChoice ? `
                      <label class="colour-choice colour-${nekroColour} recommended-colour-choice" for="${nekroTechnologyCheckboxId}">
                        <input
                          id="${nekroTechnologyCheckboxId}"
                          type="checkbox"
                          value="${nekroColour}"
                          data-card-name="${card.name}"
                          data-card-slug="${cardSlug}"
                          data-faction-technology="true"
                          data-nekro-technology="true"
                          ${selectedColours.has(nekroColour) ? "checked" : ""}
                        >
                        <span>Nekro Virus (${getColourLabelWithPlayerMarker(nekroColour)})</span>
                      </label>
                    ` : ""}
                  </div>
                ` : `
                  <div class="colour-choice-group" aria-label="${card.name} owner colours">
                    ${visiblePlayerColours.map((colour) => {
                      const id = `card-${cardSlug}-${colour.value}`;

                      return `
                        <label class="colour-choice colour-${colour.value} ${colour.value === recommendedColour ? "recommended-colour-choice" : ""}" for="${id}">
                          <input
                            id="${id}"
                          type="checkbox"
                          value="${colour.value}"
                          data-card-name="${card.name}"
                          data-card-slug="${cardSlug}"
                          ${selectedColours.has(colour.value) ? "checked" : ""}
                        >
                          <span>${getColourLabelWithPlayerMarker(colour.value)}</span>
                        </label>
                      `;
                    }).join("")}
                  </div>
                `}
              </div>
            `;
          }).join("")}
        </div>
      </details>
    `;
  }

  const selectedFactionNames = getSelectedFactionNames();
  const factionCards = cards.filter((card) => {
    if (card.category !== "Faction Cards") {
      return false;
    }

    return !selectedFactionNames.size || selectedFactionNames.has(card.faction);
  });

  if (factionCards.length) {
    const factionNames = [...new Set(factionCards.map((card) => card.faction || "Other Faction Cards"))].sort();
    heroChecklistMessage.textContent = selectedFactionNames.size
      ? "Showing faction-specific cards for the selected player factions. The outlined colour is the colour assigned to that faction."
      : "Pick player factions above to focus this section. Until then, all faction-specific cards are shown.";
    heroChecklist.innerHTML = factionNames.map((factionName) => {
      const matchingFactionCards = factionCards
        .filter((card) => (card.faction || "Other Faction Cards") === factionName)
        .sort((first, second) => first.type.localeCompare(second.type) || first.name.localeCompare(second.name));
      const factionOwnerColour = getFactionOwnerColour(factionName);
      const groupLabel = factionOwnerColour
        ? `${getColourLabel(factionOwnerColour)} - ${factionName}`
        : factionName;

      return renderChecklistGroup(groupLabel, matchingFactionCards);
    }).join("");
  } else {
    const settings = getGameSettings();
    heroChecklistMessage.textContent = settings.version === "base"
      ? "Faction leaders are introduced by Prophecy of Kings, but base faction technologies, unique units, and flagships can still appear here when they affect a phase window."
      : "No faction-specific cards are available for the current version choices.";
    heroChecklist.innerHTML = "";
  }

  actionCardChecklist.innerHTML = renderChecklistGroup(
    "Action Cards",
    cards.filter((card) => card.category === "Action Cards"),
    true
  );

  const planetRelicCards = cards.filter((card) => card.category === "Planets and Relics");
  const planetCards = planetRelicCards.filter((card) => card.type.toLowerCase().includes("planet"));
  const relicCards = planetRelicCards.filter((card) => card.type.toLowerCase() === "relic");

  planetsRelicsChecklist.innerHTML = [
    renderChecklistGroup("Planets", planetCards, true),
    renderChecklistGroup("Relics", relicCards, true)
  ].join("");

  cardChecklist.innerHTML = cardGroups.filter((group) => !["Faction Cards", "Action Cards", "Planets and Relics"].includes(group)).map((group) => {
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
      const factionName = getLeaderInfo(cardName)?.faction || "";

      if (checkbox.checked) {
        if (checkbox.dataset.commanderOwner === "true") {
          selectedColours.add(getFactionOwnerColour(factionName) || checkbox.value);
          selectedCards.set(cardName, selectedColours);
        } else if (checkbox.dataset.commanderOther === "true") {
          const ownerColour = getFactionOwnerColour(factionName) || "";
          selectedColours.forEach((colour) => {
            if (colour !== ownerColour) {
              selectedColours.delete(colour);
            }
          });
          selectedColours.add(checkbox.value);
          selectedCards.set(cardName, selectedColours);
        } else if (checkbox.dataset.promissoryHolder === "true") {
          const ownerColour = getFactionOwnerColour(factionName) || "";

          if (checkbox.value !== ownerColour) {
            selectedCards.set(cardName, new Set([checkbox.value]));
          } else {
            checkbox.checked = false;
            selectedCards.delete(cardName);
          }
        } else if (checkbox.dataset.singleOwner === "true") {
          selectedCards.set(cardName, new Set([getFactionOwnerColour(factionName) || checkbox.value]));
        } else if (checkbox.dataset.playerOnly === "true") {
          selectedCards.set(cardName, new Set([playerColourSelect?.value || checkbox.value]));
        } else if (checkbox.dataset.factionTechnology === "true") {
          selectedColours.add(checkbox.value);
          selectedCards.set(cardName, selectedColours);
        } else {
          selectedColours.add(checkbox.value);
          selectedCards.set(cardName, selectedColours);
        }
      } else {
        if (checkbox.dataset.commanderOwner === "true") {
          selectedColours.delete(getFactionOwnerColour(factionName) || checkbox.value);

          if (selectedColours.size) {
            selectedCards.set(cardName, selectedColours);
          } else {
            selectedCards.delete(cardName);
          }
        } else if (checkbox.dataset.commanderOther === "true") {
          selectedColours.delete(checkbox.value);

          if (selectedColours.size) {
            selectedCards.set(cardName, selectedColours);
          } else {
            selectedCards.delete(cardName);
          }
        } else if (checkbox.dataset.promissoryHolder === "true") {
          selectedCards.delete(cardName);
        } else if (checkbox.dataset.singleOwner === "true") {
          selectedCards.delete(cardName);
        } else if (checkbox.dataset.playerOnly === "true") {
          selectedCards.delete(cardName);
        } else if (checkbox.dataset.factionTechnology === "true") {
          selectedColours.delete(checkbox.value);

          if (selectedColours.size) {
            selectedCards.set(cardName, selectedColours);
          } else {
            selectedCards.delete(cardName);
          }
        } else {
          selectedColours.delete(checkbox.value);

          if (selectedColours.size) {
            selectedCards.set(cardName, selectedColours);
          } else {
            selectedCards.delete(cardName);
          }
        }
      }

      renderPhaseFlows();
      saveCurrentPageState();
    });
  });

  document.querySelectorAll("select[data-commander-other-select]").forEach((select) => {
    select.addEventListener("change", () => {
      const checkbox = document.querySelector(`#${select.dataset.commanderOtherSelect}`);

      if (!checkbox) {
        return;
      }

      const cardName = checkbox.dataset.cardName;
      const factionName = getLeaderInfo(cardName)?.faction || "";
      const ownerColour = getFactionOwnerColour(factionName) || "";
      const selectedColours = selectedCards.get(cardName) || new Set();

      checkbox.value = select.value;
      checkbox.closest(".colour-choice")?.classList.remove(...playerColours.map((colour) => `colour-${colour.value}`));
      checkbox.closest(".colour-choice")?.classList.add(`colour-${select.value}`);

      if (checkbox.checked) {
        selectedColours.forEach((colour) => {
          if (colour !== ownerColour) {
            selectedColours.delete(colour);
          }
        });
        selectedColours.add(select.value);
        selectedCards.set(cardName, selectedColours);
        renderPhaseFlows();
        saveCurrentPageState();
      }
    });
  });

  document.querySelectorAll("select[data-promissory-holder-select]").forEach((select) => {
    select.addEventListener("change", () => {
      const checkbox = document.querySelector(`#${select.dataset.promissoryHolderSelect}`);

      if (!checkbox) {
        return;
      }

      const cardName = checkbox.dataset.cardName;
      const factionName = getLeaderInfo(cardName)?.faction || "";
      const ownerColour = getFactionOwnerColour(factionName) || "";

      checkbox.value = select.value;
      checkbox.closest(".colour-choice")?.classList.remove(...playerColours.map((colour) => `colour-${colour.value}`));
      checkbox.closest(".colour-choice")?.classList.add(`colour-${select.value}`);

      if (checkbox.checked && select.value !== ownerColour) {
        selectedCards.set(cardName, new Set([select.value]));
        renderPhaseFlows();
        saveCurrentPageState();
      }
    });
  });
}

function renderPhaseFlows() {
  if (!phaseFlowList) {
    return;
  }

  const playerColour = playerColourSelect?.value || "red";
  const activeEntries = getModifierEntries()
    .filter((entry) => entry.alwaysActive || selectedCards.has(entry.name))
    .map((entry) => {
      const ownerColours = entry.alwaysActive
        ? entry.ownerColours
        : [...selectedCards.get(entry.name)];

      return {
        ...entry,
        ownerColours,
        isPlayerOwned: ownerColours.includes(playerColour),
        hasOpponentOwner: ownerColours.some((ownerColour) => ownerColour !== playerColour)
      };
    })
    .filter((entry) => entry.ownerColours.length);

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
                      <div class="modifier-card ${modifier.isPlayerOwned ? "player-owned" : "opponent-owned"} ${modifier.hasOpponentOwner ? "has-opponent-owner" : ""} ${modifier.alwaysActive ? "faction-ability-modifier" : ""}">
                        <span class="modifier-meta">
                          <span class="owner-chip-list">${renderOwnerChips(modifier.ownerColours, playerColour)}</span>
                          <span>${modifier.category}</span>
                        </span>
                        <strong>${modifier.name}</strong>
                        <p><strong>${modifier.alwaysActive ? "Ability text" : "Card text"}:</strong> ${modifier.text}</p>
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

if (playerColourSelect) {
  playerColourSelect.addEventListener("change", () => {
    renderFactionSelectors();
    renderChecklist();
    restoreCurrentPageState();
    renderPhaseFlows();
  });
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

if (showFactionAbilitiesInput) {
  showFactionAbilitiesInput.addEventListener("change", () => {
    renderPhaseFlows();
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
renderFactionSelectors();
restorePageSettings();
renderChecklist();
restoreCurrentPageState();
renderPhaseFlows();
