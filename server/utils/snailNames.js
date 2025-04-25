export const firstNames = [
    "Frank", "Steve", "Glinda", "Bob", "Janet", "Carol", "Gary", "Cheryl",
    "Doug", "Linda", "Bill", "Donna", "Greg", "Debbie", "Roger", "Nancy",
    "Hank", "Joyce", "Larry", "Pam", "Creed","Shelly","Shelldon",

    "Bibble", "Elenipoof", "Sabrinipoof", "Brynnipoof", 

    "Johnny", "Brynna", "JB", "Karen",  "John", "Nana", "Kitty", "Barry", "Randy", "Diana","Ray", "Pa", "Carolyn", 
    "Ace", 
  
    "Dominique", "Spud", "Blummy", "Shirley", "Heidy", "Emir",

    "Coconut", "Scooter", "Chippy", "Lars", "Penny",

  
    "Snorb", "Dusty", "Wibby", "Glerb", "Zibbo", "Flerg", "Mimsy", "Bloppo", "Zabble",
    "Dibbs", "Grubble", "Twibble", "Jiblet", "Yim", "Nerp", "Globbo", "Ploop",
    "Snizzle", "Bungo", "Wumpus", "Cranch", "Vibbo", "Gobb", "Boof", "Zibble",
    "Slippy", "Gooey", "Blorp", "Wiggly", "Shellby",, "Zoomer", "Niblet", "Snorb", "Munchy", "Zoodle",
    "Bloop", "Squiggly", "Doodle", "Twisty", "Dribble", "Snubby", "Glob", "Scoot", "Plop", "Slinky",
    "Slop", "Noodle", "Wobble", "Flubber", "Toasty", "Grub", "Sludge", "Globby", "Snibble", "Slugsy",
    "Wibble", "Twitchy", "Snazzy", "Drooly", "Oozy", "Slonk", "Swirly", "Gloober", "Jelly", "Drippy",
    "Trundle", "Wigglet", "Snorky", "Crumbly", "Drebbly", "Sploosh", "Snuzzle", "Fuzzle", "Blinky", "Bop", 
    "Muddy"

  ];
  
  export const lastNames = [
    "McSlide", "The Slow", "Shellsworth", "Creepus", "von Slime", "Oozeberry", "Snailstein", "Dribbleton", 
    "Crawlington", "Squish", "of the Ooze", "Snorbson", "Shellman", "Gloopshire", "von Goober", "Bubblesnuff", 
    "Wiggletop", "Snailford", "of the Drip", "Slobberstein", "Shellington", "Cuddleflap", "von Dribble", 
    "Puddleboots", "Noodlestein", "Fizzlewhack", "Slickbottom", "of the Slide", "Snubbergast", "Wormwood",
    "Mudbelly", "Crawlston", "of Gloam", "Moldwig", "Squishle", "Snorflepot", "Jibbersnail", "Swampthistle",
    "Jellywig", "Wobblestone", "Moistwald", "Gloomfoot", "Sir Slimesworth", "Napshell", "of the Sludge", 
    "Snoreleaf", "Sludgewhistle", "Grimewick", "Bubbleroot", "Sludgemonger", "Morris-Molusk", "O'Malacologie", "von Gastropod",
    "of the Mud", "D'Escargot", "Del Caracol", "Dirt", "Dirtenstein", "San Caracol", 
  ];
  
  export function getRandomSnailName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
  }
  