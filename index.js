/*
js for Main Menu
as well as page transitions
and page setup
*/
const version = '1.37b';

let hasLocalStorage = false;
let currentPage = 1;
//page = page in main menu
let currentSite = "MM";
//site = site after main menu
const canvas = document.querySelector("#DME-display-canvas");
const ctx = canvas.getContext("2d");

function fadeOutScreen(fadeIn = true) {
  let el = document.querySelector(".screen-overlay-fade");
  el.style.animation = "";
  el.style.transform = "rotate(0deg)";
  el.style.pointerEvents = "all";
  let direction = "";
  let newEl = el.cloneNode(true);
  document.body.appendChild(newEl);
  document.body.removeChild(el);
  if (!fadeIn) {
    newEl.style.transform = "rotate(180deg)";
    newEl.style.pointerEvents = "none";
    direction = "reverse ";
  }
  newEl.style.animation = `.5s blanck-out-screen ${direction}forwards linear`;
  if (fadeIn) setTimeout(() => fadeOutScreen(false), 1500);
}

function switchSite(newPage = "main-menu", instance = 0) {
  let t = 500;
  switch (instance) {
    case 0: {
      fadeOutScreen();
      break;
    }
    case 1: {
      fadeOutScreen(0);
      t = 0;
      break;
    }
    case 2: {
      t = 0;
      break;
    }
  }
  setTimeout((_) => {
    let allPages = document.querySelectorAll(".main-page");
    allPages.forEach((p) => {
      p.classList.remove("visible");
      p.classList.add("hidden");
    });
    let tP = document.querySelector(`#${newPage}`);
    tP.classList.remove("hidden");
    tP.classList.add("visible");
    switch (newPage) {
      case "map-editor": {
        //new page animation here; unbind fade out animation from fade in
        console.log("New Page selected: Map Editor!");
        currentSite = "DME";
        DME.config();
        break;
      }
      case "defuse-clone": {
        break;
      }
      default: {
        console.log("Unknown Page Selected");
      }
    }
  }, t);
}

function toggleMainMenuContentPage(page) {
  document
    .querySelector("#main-menu-content")
    .querySelectorAll(".main-menu-content-page")
    .forEach((p, i) => {
      if (i + 1 == page) {
        p.style.opacity = 1;
        p.style.pointerEvents = "all";
        currentPage = page;
      } else {
        p.style.opacity = 0;
        p.style.pointerEvents = "none";
      }
    });
}

function config() {
  let pageToLoad = 1;
  if (typeof Storage !== undefined) {
    hasLocalStorage = true;
    if (!localStorage.getItem("current-page")) {
      localStorage.setItem("current-page", 1);
    } else {
      pageToLoad = localStorage.getItem("current-page");
    }
  }
  toggleMainMenuContentPage(pageToLoad);
  //check url for specific site
  let urlSpec = window.location.href?.split("?")[1];
  if (urlSpec) {
    switch (urlSpec) {
      case "map-editor": {
        switchSite(urlSpec, 1);
        break;
      }
    }
  }
}
window.onbeforeunload = () => {
  if (hasLocalStorage) {
    localStorage.setItem("current-page", currentPage);
    switch (currentSite) {
      case "DME": {
        localStorage.setItem(
          "DMEauto-saved-map",
          DME.generateMapFile("compact")
        );
        localStorage.setItem("DMEhotkeys", JSON.stringify(DME.hotkeys));
        //don't save background image - too heavy load, unnecessary & breaks image loading
        delete DME.visuals.backgroundImage;
        localStorage.setItem("DME-visuals", JSON.stringify(DME.visuals));
        break;
      }
    }
  }
};

config();

/*
usefull functions and data for all sites
*/
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

function removePairs(ar) {
  let hasValue = {};
  ar.forEach((v) => {
    if (hasValue?.[v]) {
      hasValue[v] = false;
    } else {
      hasValue[v] = true;
    }
  });
  let cAr = [];
  ar.forEach((v) => {
    if (hasValue[v]) cAr.push(v);
  });
  return cAr;
}

function calculateParallelLines(A, B, offset) {
  // Helper function to calculate a perpendicular vector
  function perpendicular(vector) {
    return [-vector[1], vector[0]];
  }

  // Helper function to normalize a vector
  function normalize(vector) {
    var length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);
    return [vector[0] / length, vector[1] / length];
  }

  // Calculate the direction vector for line AB
  var direction = [B[0] - A[0], B[1] - A[1]];

  // Normalize the direction vector
  var unitDirection = normalize(direction);

  // Calculate the perpendicular vector
  var perp = perpendicular(unitDirection);

  // Calculate points for the parallel lines
  var C1 = [A[0] + offset * perp[0], A[1] + offset * perp[1]];
  var D1 = [B[0] + offset * perp[0], B[1] + offset * perp[1]];

  var C2 = [A[0] - offset * perp[0], A[1] - offset * perp[1]];
  var D2 = [B[0] - offset * perp[0], B[1] - offset * perp[1]];

  return { line1: [C1, D1], line2: [C2, D2] };
}

//dot functions (DO NOT USE ON EXTERNAL PROJECTS)
Number.prototype.toRounded = function (decPlaces) {
  if ((this + "1").split(".")[1]?.length > decPlaces + 1)
    return this.toFixed(decPlaces) * 1;
  return this;
};

function updateFOV() {
  switch (currentSite) {
    case "DME": {
      let w = window.innerWidth;
      let h = window.innerHeight;
      DME.focusOffset = {
        x: w / 2,
        y: h / 2,
      };
      canvas.width = w * DME.visuals.quality;
      canvas.height = h * DME.visuals.quality;
      break;
    }
  }
}

/*
defly related functions & variables/constants
*/
const defly = {
  colors: {
    standard: {
      1: "rgb(77,77,77)",
      2: "rgb(61,93,255)",
      3: "rgb(253,53,53)",
      4: "rgb(0,128,55)",
      5: "rgb(255,128,42)",
      6: "rgb(146,75,255)",
      7: "rgb(85,213,255)",
      8: "rgb(24,226,31)",
      9: "rgb(246,89,255)",
      10: "rgb(247,255,42)",
      11: "rgb(255,95,174)",
      12: "rgb(147,254,0)",
      13: "rgb(0,255,188)",
      14: "rgb(0,0,0)",
      koth: "rgb(238,175,47)",
    },
    darkened: {
      1: "rgb(53,53,53)",
      2: "rgb(43,65,179)",
      3: "rgb(178,37,37)",
      4: "rgb(0,90,39)",
      5: "rgb(179,97,29)",
      6: "rgb(102,53,179)",
      7: "rgb(60,149,179)",
      8: "rgb(17,159,22)",
      9: "rgb(173,62,179)",
      10: "rgb(173,179,29)",
      11: "rgb(179,67,122)",
      12: "rgb(103,178,0)",
      13: "rgb(0,179,132)",
      14: "rgb(0,0,0)",
      koth: "rgb(167,123,33)",
    },
    faded: {
      1: "rgba(77,77,77,0.5)",
      2: "rgba(61,93,255,0.5)",
      3: "rgba(253,53,53,0.5)",
      4: "rgba(0,128,55,0.5)",
      5: "rgba(255,128,42,0.5)",
      6: "rgba(146,75,255,0.5)",
      7: "rgba(85,213,255,0.5)",
      8: "rgba(24,226,31,0.5)",
      9: "rgba(246,89,255,0.5)",
      10: "rgba(247,255,42,0.5)",
      11: "rgba(255,95,174,0.5)",
      12: "rgba(147,254,0,0.5)",
      13: "rgba(0,255,188,0.5)",
      14: "rgba(0,0,0,0.5)",
      koth: "rgba(238,175,47,0.5)",
    },
  },
  BULLET_WIDTH: 7,
  WALL_WIDTH: 13,
  TOWER_WIDTH: 13,
  PLAYER_WIDTH: 5,
  GRID_WIDTH: 44,
  UNIT_WIDTH: 22, //GRID_WIDTH / 2
  MAX_WALL_LENGTH: 660, //GRID_WIDTH * 15
  images: {
    bombA: new Image(),
    bombB: new Image(),
    koth_crown: new Image(),
  },
};
defly.images.bombA.src = "images/defly-defuse-bombSpotA.png";
defly.images.bombB.src = "images/defly-defuse-bombSpotB.png";
defly.images.koth_crown.src = "images/defuse-koth-crown.svg";

/*
js for site 1:
defly map editor

all functions & map editor related variables
are inside the DME object
in order to not confuse them with
any other unrelated functions/variables
*/

let test = {
  someFunction: function () {
    DME.highestId++;
  },
};

const DME = {
  hotkeys: {
    /*Control: "CONTROL",
    Shift: "SHIFT",
    Enter: "ENTER",*/
    Delete1: "DELETE",
    Delete2: "BACKSPACE",
    MoveUp1: "W",
    MoveUp2: "ARROWUP",
    MoveDown1: "S",
    MoveDown2: "ARROWDOWN",
    MoveLeft1: "A",
    MoveLeft2: "ARROWLEFT",
    MoveRight1: "D",
    MoveRight2: "ARROWRIGHT",
    toggleSnap1: "G",
    toggleSnap2: "",
    shadeArea1: "F",
    shadeArea2: "",
    copyChunk1: "C",
    copyChunk2: "",
    pasteChunk1: "V",
    pasteChunk2: "",
    undoAction1: "Z",
    undoAction2: "",
    redoAction1: "Y",
    redoAction2: "",
    shieldTower1: "B",
    shieldTower2: "",
    placeBombA1: "1",
    placeBombA2: "",
    placeBombB1: "2",
    placeBombB2: "",
    placeSpawnRed1: "3",
    placeSpawnRed2: "",
    placeSpawnBlue1: "4",
    placeSpawnBlue2: "",
    toggleMirrorMode1: "M",
    toggleMirrorMode2: "",
    toggleRotateMode1: "R",
    toggleRotateMode2: "",
    placeTower1: "Right Click",
    placeTower2: "SPACE",
    selectTower1: "Left Click",
    selectTower2: "",
    selectArea1: "Middle Click",
    selectArea2: "META",
    zoomOut1: "Scroll Down",
    zoomOut2: "-",
    zoomIn1: "Scroll Up",
    zoomIn2: "+",
  },
  changeKeybind: {
    isChanging: false,
    binding: "",
    element: "",
  },
  defaultHotkeys: {}, //structuredClone(this.hotkeys),
  specialKeyInputs: {},

  isKeyPressed: {
    CONTROL: false,
    SHIFT: false,
    ENTER: false,
    MoveUp: false,
    MoveDown: false,
    MoveLeft: false,
    MoveRight: false,
    MirrorMode: false,
    RotateMode: false,
  },

  mouseCoords: {
    real: {
      x: 0,
      y: 0,
    },
    relative: {
      x: 0,
      y: 0,
    },
    snapped: {
      x: 0,
      y: 0,
    },
  },

  visuals: {
    showMapHalves: true,
    showKothBounds: true,
    showTowerShields: true,
    showBackgroundImage: true,
    useDeflyImages: false,
    backgroundImage: new Image(),
    keepBackgroundImageRatio: false,
    grid_BGC: "#eeeeee",
    map_BGC: "#e0e0e0",
    grid_lineC: "#999999",
    custom_preset: {
      hasBeenSet: false,
      grid_BGC: "#000",
      map_BGC: "#000",
      grid_lineC: "#000",
    },
    grid_line_width: 1,
    quality: 1,
  },
  defaultVisuals: {}, //structuredClone(this.visuals),

  test: [],

  scrollingSpeed: 10,
  focusPoint: {
    x: 500,
    y: 500,
  },
  focusOffset: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  },
  mapZoom: 1,

  snapRange: 2 * defly.UNIT_WIDTH,
  snapping: false,

  blockInput: false,
  openSubMenu: "",

  mapData: {
    width: 210 * defly.UNIT_WIDTH,
    height: 120 * defly.UNIT_WIDTH,
    koth: [],
    shape: 0,
    bounds: [], //stores corner positions of hex maps
    towers: [], //{x : xPosition, y : yPosition, color : color, id : uniqueTowerId} || + isShaded : bool, isNotTower : number
    walls: [], //{from : {x : xPosition, y : yPosition, id : towerId}, to : {x : xPosition, y : yPosition, id : towerId}, color : wallColor}
    areas: [], //{length : amountOfNodesInThatArea, color : areaColor(defined by first node's color), nodes : [{x : nodeXposition, y : nodeYposition, id : nodeTowerId}]}
  },
  highestId: 1,

  copiedChunk: {
    towers: [],
    walls: [],
    areas: [],
    width: 0,
    height: 0,
  },

  lastActions: [],
  logState: 1, //0: none, 1: normal, 2: update undone, 3: redone
  undoneDepth: 0,

  editMode: "building",

  selectedTowers: [],
  selectingChunk: {
    isSelecting: false,
    origin: {
      x: 0,
      y: 0,
    },
  },
  chunckOptions: {
    active: false,
    hovering: 0,
    rx: 0,
    ry: 0,
    rw: 0,
    rh: 0,
    rsr: 0,
    rsw: 0,
    vx: 0,
    vy: 0,
    vw: 0,
    vh: 0,
    vsr: 0,
    vsw: 0,
    isChanging: false,
    co: {
      x: 0,
      y: 0,
    },
  },

  selectedColor: 1,

  placeTower: function () {
    let mc = this.mouseCoords.snapped;
    let closestTower = this.getClosestTower(mc.x, mc.y);
    let towerId = this.highestId;
    let logWalls = false;
    let loggedWalls = [];
    if (closestTower.distance < defly.TOWER_WIDTH) {
      towerId = this.mapData.towers[closestTower.index].id;
      logWalls = true;
    } else {
      this.createTower(mc.x, mc.y, this.selectedColor, towerId);
    }
    let previousState = this.logState;
    this.logState = 0;
    //store all tower ids from existing walls to that tower
    let existingWalls = [];
    this.mapData.walls.forEach((wall) => {
      if (wall.from.id == towerId) {
        existingWalls.push(wall.to.id);
      } else if (wall.to.id == towerId) {
        existingWalls.push(wall.from.id);
      }
    });
    this.selectedTowers.forEach((towerIndex) => {
      let id = this.mapData.towers[towerIndex].id;
      //create a wall from each selected tower to new one
      //only if such wall didn´t exist yet
      if (id != towerId && !existingWalls.includes(id))
        loggedWalls.push({ from: id, to: towerId });
      this.createWall(id, towerId);
    });
    this.logState = previousState;
    if (logWalls && loggedWalls.length > 0)
      this.logAction({ action: "create", type: "walls", ids: loggedWalls });
    this.selectedTowers = [this.getIndexFromId(towerId)];
    this.updateChunkOptions();
  },

  //action here
  createTower: function (x, y, color, id) {
    DME.mapData.towers.push({ x: x, y: y, color: color, id: id });
    //check if tower is inside koth bounds
    let k = this.mapData.koth;
    if (k && x >= k[0] && x <= k[2] && y >= k[1] && y <= k[3])
      this.mapData.towers.at(-1).isKothTower = true;
    DME.highestId = id > DME.highestId ? id + 1 : DME.highestId + 1;
    this.logAction({ action: "create", type: "tower", id: id });
  },

  //action here
  createWall: function (fromId, toId) {
    let tower1 = DME.getIndexFromId(fromId);
    let tower2 = DME.getIndexFromId(toId);
    let towers = DME.mapData.towers;
    if (towers[tower1]?.isNotTower || towers[tower2]?.isNotTower) return;
    let x1 = towers[tower1].x;
    let y1 = towers[tower1].y;
    let x2 = towers[tower2].x;
    let y2 = towers[tower2].y;
    let col = towers[tower1]?.isKothTower ? "koth" : towers[tower1].color;
    DME.mapData.walls.push({
      from: { x: x1, y: y1, id: fromId },
      to: { x: x2, y: y2, id: toId },
      color: col,
    });
    this.logAction({
      action: "create",
      type: "walls",
      ids: [{ from: fromId, to: toId }],
    });
  },

  placeArea: function () {
    let mc = this.mouseCoords.relative;

    //get closest wall as area origin point
    let closestWall = {
      index: -1,
      distance: Infinity,
    };
    this.mapData.walls.forEach((wall, idx) => {
      let dist = this.getDistanceToLine(
        wall.from.x,
        wall.from.y,
        wall.to.x,
        wall.to.y,
        mc.x,
        mc.y
      );
      //getDistanceToLine might not be accurate - have to check though looking good for now
      if (dist <= closestWall.distance) {
        closestWall.index = idx;
        closestWall.distance = dist;
      }
    });

    //only keep going if close walls exist
    if (closestWall.index == -1) return;

    let startingTowerId = this.mapData.walls[closestWall.index].from.id;
    let finishTowerId = this.mapData.walls[closestWall.index].to.id;

    //check if pointer is inside an area & closest wall part of that area
    function handleCursorInsideArea(regardWall = true) {
      let insideAreas = false;
      DME.mapData.areas.forEach((area, index) => {
        let areaVerified = true;
        if (regardWall) {
          let t = [false, false];
          area.nodes.forEach((node) => {
            t[0] = node.id == startingTowerId ? true : t[0];
            t[1] = node.id == finishTowerId ? true : t[1];
          });
          areaVerified = t[0] && t[1];
        }
        if (areaVerified) {
          insideAreas = DME.isPointInsideArea([mc.x, mc.y], area.nodes)
            ? index
            : insideAreas;
        }
      });
      //if so - delete that area and return
      if (typeof insideAreas == "number") {
        DME.mapData.areas.splice(insideAreas, 1);
        DME.updateShields();
        return true;
      } else return false;
    }
    if (handleCursorInsideArea()) return;

    //if not - try to create an area
    let cl = this.mapData.walls[closestWall.index];

    //check if cursor is on the "wrong" side of the wall & set wall angle correction based on that
    let a = this.calculateAngle(
      [cl.from.x, cl.from.y],
      [cl.to.x, cl.to.y],
      [mc.x, mc.y]
    );
    let wallAngleCorrection = a > 180 ? 1 : -1;

    let availableTowers = {};
    availableTowers[finishTowerId] = 2; //2 = desteny
    availableTowers[startingTowerId] = 1; //1 = part of area; 0 = bad boy; undefined = happy to join
    let currentNodeArray = [finishTowerId, startingTowerId];
    let areaHasBeenFound = false;
    let backupCounter = 0;
    //loop until a) area has been found or b) there can´t be an area or c) it´s taking too long & exceeding backup counter (stuck in infite loop)
    while (!areaHasBeenFound && backupCounter < 1000) {
      let deadEnd = true;
      let nextTower = 0;
      let neighbourTowers = this.getNeighbourTowers(currentNodeArray.at(-1));
      if (
        neighbourTowers.includes(finishTowerId) &&
        currentNodeArray.length > 2
      ) {
        //if can connect back to start tower & >2 nodes in area (so it doesn't connect back if no new tower has joined) (min triangle)
        areaHasBeenFound = true;
        break;
      } else {
        //if it couldn´t connect back to start
        if (neighbourTowers.length > 1) {
          let availableNeighbours = [];
          neighbourTowers.forEach((tower) => {
            //only neighbours who aren´t and weren´t inside a possible area can be added
            if (availableTowers?.[tower] == undefined) {
              availableNeighbours.push(tower);
            }
          });
          if (availableNeighbours.length > 0) {
            //give smallest angle priotity as next wall/node
            let offset = {
              angle: Infinity,
              idx: 0,
            };
            availableNeighbours.forEach((nb, idx) => {
              let midpoint =
                this.mapData.towers[
                  this.getIndexFromId(currentNodeArray.at(-1))
                ];
              let backPoint =
                this.mapData.towers[
                  this.getIndexFromId(currentNodeArray.at(-2))
                ];
              let frontPoint = this.mapData.towers[this.getIndexFromId(nb)];
              let angle =
                wallAngleCorrection *
                this.calculateAngle(
                  [backPoint.x, backPoint.y],
                  [midpoint.x, midpoint.y],
                  [frontPoint.x, frontPoint.y]
                );
              offset.idx = angle < offset.angle ? idx : offset.idx;
              offset.angle = angle < offset.angle ? angle : offset.angle;
              //note that offset might be broekn due to angle not being specified from which side...
            });
            deadEnd = false;
            nextTower = availableNeighbours[offset.idx];
          }
        }
      }
      if (deadEnd) {
        //if current node didn´t succeed (dead end)
        availableTowers[currentNodeArray.at(-1)] = 0;
        currentNodeArray.pop();
        if (currentNodeArray.length < 2) break;
        //if only starting towers remain, no area can be found > dropp out
        backupCounter++;
      } else {
        availableTowers[currentNodeArray.at(-1)] = 1;
        currentNodeArray.push(nextTower);
      }
    }
    if (areaHasBeenFound) {
      if (this.isPointInsideNodes([mc.x, mc.y], currentNodeArray))
        this.createArea(currentNodeArray);
      else {
        //check if cursor inside an area, not containing starting wall
        handleCursorInsideArea(false);
      }
    }
  },

  //action here
  createArea: function (ids) {
    console.log(`Area has been created with following ids: ${ids}`);
    let nodes = [];
    let towers = DME.mapData.towers;
    ids.forEach((id) => {
      let idx = this.getIndexFromId(id),
        t = towers[idx],
        x = t.x,
        y = t.y;
      t.isShielded = true;
      nodes.push({ x: x, y: y, id: id });
    });
    let color = towers[DME.getIndexFromId(ids[0])]?.isKothTower
      ? "koth"
      : towers[DME.getIndexFromId(ids[0])].color;
    DME.mapData.areas.push({ length: ids.length, color: color, nodes: nodes });
    this.logAction({ action: "create", type: "area", ids: ids });
  },

  /*
  bomb
  */
  placeSpecial: function (id, coords) {
    //id: 1 = bomb A; 2 = bomb B; 3 = spawn red; 4 = spawn blue
    let mc = coords ?? this.mouseCoords.snapped,
      idx = this.getIndexFromId(-id);
    if (idx < 0) {
      if (id < 3)
        DME.mapData.towers.push({
          x: mc.x,
          y: mc.y,
          color: 3,
          id: -id,
          isNotTower: true,
        });
      else
        DME.mapData.towers.push({
          x: mc.x,
          y: mc.y,
          color: 3,
          id: coords?.t ?? -id,
          isNotTower: true,
          rotation: coords?.r ? Number(coords.r) : 0,
        });
      this.logAction({ action: "create", type: "tower", id: -id });
    } else {
      let o = this.mapData.towers[idx];
      if (id > 2 && o.x == mc.x && o.y == mc.y) {
        DME.mapData.towers[idx].rotation =
          ++DME.mapData.towers[idx].rotation % 4;
      } else {
        this.logAction({
          action: "modify",
          type: "move",
          ids: [-id],
          x: mc.x - o.x,
          y: mc.y - o.y,
        });
        DME.mapData.towers[idx].x = mc.x;
        DME.mapData.towers[idx].y = mc.y;
      }
    }
  },
  /*
  &
  spawns
  go here
  ...
  */

  shieldTowers: function () {
    let ls = this.logState;
    this.logState = 0;
    this.selectedTowers.forEach((idx) => {
      let t = this.mapData.towers[idx];
      if (!t?.isShielded && t.color == 1) {
        this.createTower(t.x, t.y, 1, this.highestId);
        this.createTower(t.x, t.y, 1, this.highestId);
        this.createWall(t.id, this.highestId - 2);
        this.createWall(t.id, this.highestId - 1);
        this.createWall(this.highestId - 2, this.highestId - 1);
        this.createArea([t.id, this.highestId - 2, this.highestId - 1]);
      }
    });
    this.logState = ls;
    this.logAction({
      action: "create",
      type: "chunk",
      ids: [this.highestId - 2, this.highestId - 1],
    });
  },

  updateWalls: function (ids = false) {
    this.mapData.walls.forEach((wall) => {
      if (!ids || ids.includes(wall.from.id) || ids.includes(wall.to.id)) {
        //matching tower ids: wall has to be updated
        let t1 = this.mapData.towers[this.getIndexFromId(wall.from.id)];
        let t2 = this.mapData.towers[this.getIndexFromId(wall.to.id)];
        wall.from.x = t1.x;
        wall.from.y = t1.y;
        wall.to.x = t2.x;
        wall.to.y = t2.y;
        wall.color = t1?.isKothTower ? "koth" : t1.color;
      }
    });
  },

  updateAreas: function (ids = false) {
    this.mapData.areas.forEach((area) => {
      area.nodes.forEach((node, c) => {
        if (!ids || ids.includes(node.id)) {
          //matching tower id/should get updated
          let relativeTower = this.mapData.towers[this.getIndexFromId(node.id)];
          node.x = relativeTower.x;
          node.y = relativeTower.y;
          if (!c) {
            let t1 = this.mapData.towers[this.getIndexFromId(node.id)];
            area.color = t1?.isKothTower ? "koth" : t1.color;
          }
          console.log(`Updating node (${node.id})`);
        }
      });
    });
  },

  updateShields: function () {
    let sT = [];
    this.mapData.areas.forEach((a) => {
      a.nodes.forEach((n) => {
        sT.push(this.getIndexFromId(n.id));
      });
    });
    sT = [...new Set(sT)];
    this.mapData.towers.forEach((t, idx) => {
      t.isShielded = sT.includes(idx);
    });
  },

  updateKothTowers: function () {
    let kothIds = [];
    this.mapData.towers.forEach((t) => {
      let k = this.mapData.koth;
      if (
        k &&
        t.x >= k[0] &&
        t.x <= k[2] &&
        t.y >= k[1] &&
        t.y <= k[3] &&
        t.id > 0
      ) {
        t.isKothTower = true;
      } else t.isKothTower = false;
      if (t.isKothTower) {
        kothIds.push(t.id);
      }
    });
    this.mapData.walls.forEach((w) => {
      if (kothIds.includes(w.from.id)) {
        w.color = "koth";
      } else
        w.color = this.mapData.towers[this.getIndexFromId(w.from.id)].color;
    });
    this.mapData.areas.forEach((a) => {
      if (kothIds.includes(a.nodes[0].id)) {
        a.color = "koth";
      } else
        a.color = this.mapData.towers[this.getIndexFromId(a.nodes[0].id)].color;
    });
  },

  copyChunk: function () {
    console.log("Fired copy!!");
    this.copiedChunk = {
      towers: [],
      walls: [],
      areas: [],
      width: 0,
      height: 0,
    };
    let ids = [];
    let newIds = {};
    let leftmost = Infinity;
    let rightmost = 0;
    let topmost = Infinity;
    let bottommost = 0;
    this.selectedTowers.forEach((tIdx, c) => {
      let t = this.mapData.towers[tIdx];
      ids.push(t.id);
      newIds[t.id] = c + 1;
      if (t.id > 0) {
        this.copiedChunk.towers.push({
          x: t.x,
          y: t.y,
          color: t.color,
          id: c + 1,
        });
      } else {
        this.copiedChunk.towers.push({
          x: t.x,
          y: t.y,
          id: t.id,
        });
        if (t?.rotation) {
          this.copiedChunk.towers.at(-1).rotation = t.rotation;
        }
      }
      leftmost = t.x < leftmost ? t.x : leftmost;
      rightmost = t.x > rightmost ? t.x : rightmost;
      topmost = t.y < topmost ? t.y : topmost;
      bottommost = t.y > bottommost ? t.y : bottommost;
    });
    this.copiedChunk.towers.forEach((idc, c) => {
      let t = this.copiedChunk.towers[c];
      t.x = t.x - leftmost;
      t.y = t.y - topmost;
    });
    this.copiedChunk.width = rightmost - leftmost;
    this.copiedChunk.height = bottommost - topmost;
    this.mapData.walls.forEach((w) => {
      if (ids.includes(w.from.id) && ids.includes(w.to.id)) {
        this.copiedChunk.walls.push([newIds[w.from.id], newIds[w.to.id]]);
      }
    });
    this.mapData.areas.forEach((a) => {
      let inside = true;
      let newIdAr = [];
      a.nodes.forEach((n) => {
        if (!ids.includes(n.id)) inside = false;
        newIdAr.push(newIds[n.id]);
      });
      if (inside) {
        this.copiedChunk.areas.push(newIdAr);
      }
    });
  },
  //action here - if paste chunk, we cannot catch the single build steps but rather whole chunk
  pasteChunk: function (x, y) {
    let previousState = this.logState;
    this.logState = 0;
    console.log("Fired paste!!");
    x = x ? x : this.mouseCoords.snapped.x;
    y = y ? y : this.mouseCoords.snapped.y;
    let cId = this.highestId;
    let cC = this.copiedChunk;
    let loggedIds = [];
    cC.towers.forEach((t) => {
      if (t.id > 0) {
        this.createTower(
          t.x - cC.width / 2 + x,
          t.y - cC.height / 2 + y,
          t.color,
          t.id + cId
        );
        loggedIds.push(t.id + cId);
      } else {
        let modif =
          this.getIndexFromId(t.id) == -1
            ? 0
            : t.id == -1 || t.id == -3
            ? -1
            : 1;
        if (this.getIndexFromId(t.id + modif) < 0) {
          //doesn´t exist already, just place down
          let pos = {
            x: t.x - cC.width / 2 + x,
            y: t.y - cC.height / 2 + y,
          };
          if (t?.rotation) pos.r = t.rotation;
          this.placeSpecial(-(t.id + modif), pos);
          loggedIds.push(t.id + modif);
        }
      }
    });
    cC.walls.forEach((w) => {
      this.createWall(w[0] + cId, w[1] + cId);
    });
    cC.areas.forEach((a) => {
      let frIds = [];
      a.forEach((id) => {
        frIds.push(id + cId);
      });
      this.createArea(frIds);
    });
    this.logState = previousState;
    this.logAction({ action: "create", type: "chunk", ids: loggedIds });
  },

  logAction: function (action) {
    //since this function is called anytime selected towers are modified, we can call update tower info here
    this.updateTowerInfo();

    if (this.logState == 0) return;
    console.log(action);
    if (this.logState == 1) {
      if (this.undoneDepth) this.lastActions.splice(-this.undoneDepth);
      this.undoneDepth = 0;
    }
    let logNew = this.logState == 1,
      splicePos =
        this.lastActions.length - this.undoneDepth - this.logState + 2;
    //determine whether log should be normal or updated
    switch (action.action) {
      case "create": {
        if (logNew) this.lastActions.push(action);
        else this.lastActions.splice(splicePos, 1, action);
        break;
      }
      case "modify": {
        switch (action.type) {
          case "resize": {
            if (logNew) {
              let lA = this.lastActions.at(-1);
              if (
                lA?.type == "resize" &&
                lA?.ids == action.ids &&
                lA?.origin == action.origin
              ) {
                lA.x *= action.x;
                lA.y *= action.y;
              } else {
                this.lastActions.push(action);
              }
            } else this.lastActions.splice(splicePos, 1, action);
            break;
          }
          case "move": {
            if (logNew) {
              let lA = this.lastActions.at(-1);
              if (lA?.type == "move" && lA?.ids == action.ids) {
                lA.x += action.x;
                lA.y += action.y;
              } else {
                this.lastActions.push(action);
              }
            } else this.lastActions.splice(splicePos, 1, action);
            break;
          }
          case "rotate": {
            if (logNew) {
              let lA = this.lastActions.at(-1);
              if (lA?.type == "rotate" && lA?.idxs == action.idxs) {
                lA.properties.angle += action.properties.angle;
              } else {
                this.lastActions.push(action);
              }
            } else this.lastActions.splice(splicePos, 1, action);
            break;
          }
          case "color": {
            if (logNew) {
              this.lastActions.push(action);
            } else this.lastActions.splice(splicePos, 1, action);
            break;
          }
        }
        break;
      }
      case "delete": {
        if (logNew) this.lastActions.push(action);
        else this.lastActions.splice(splicePos, 1, action);
        break;
      }
    }
  },
  modifyLastAction: function (time) {
    console.log("Reversing...");
    if (
      (!time && this.lastActions.length <= this.undoneDepth) ||
      (time && this.undoneDepth < 1)
    )
      return;
    this.undoneDepth += 1 - time;
    let actionToModify = this.lastActions.at(-this.undoneDepth),
      ls = 2 + time;
    this.undoneDepth -= time;
    this.logState = ls;
    switch (actionToModify.action) {
      case "create": {
        switch (actionToModify.type) {
          case "tower": {
            this.deleteTowers([this.getIndexFromId(actionToModify.id)]);
            break;
          }
          case "walls": {
            this.deleteWalls(actionToModify.ids);
            break;
          }
          case "area": {
            this.deleteArea(actionToModify.ids);
            break;
          }
          case "chunk": {
            this.deleteTowers(this.getIndexFromId(actionToModify.ids));
          }
        }
        break;
      }
      case "modify": {
        switch (actionToModify.type) {
          case "resize": {
            this.resizeChunk(
              1 / actionToModify.x,
              1 / actionToModify.y,
              actionToModify.origin,
              this.getIndexFromId(actionToModify.ids)
            );
            break;
          }
          case "move": {
            this.resizeChunk(
              -actionToModify.x,
              -actionToModify.y,
              { z: true },
              this.getIndexFromId(actionToModify.ids)
            );
            break;
          }
          case "rotate": {
            this.rotateChunk(actionToModify.properties, actionToModify.idxs);
            break;
          }
          case "color": {
            let towers = this.mapData.towers,
              newLoggedData = [];
            actionToModify.towers.forEach((data) => {
              let t = towers[data.ar];
              newLoggedData.push({ ar: data.ar, color: t.color });
              t.color = data.color;
            });
            this.logAction({
              action: "modify",
              type: "color",
              towers: newLoggedData,
            });
            this.updateTowerInfo();
          }
        }
        break;
      }
      case "delete": {
        switch (actionToModify.type) {
          case "towers": {
            this.logState = 0;
            let tIds = [];
            actionToModify.towers.forEach((t) => {
              if (t.id > 0) this.createTower(t.x, t.y, t.color, t.id);
              else {
                let coords = { x: t.x, y: t.y };
                if (t?.rotation) coords.r = t.rotation;
                this.placeSpecial(-t.id, coords);
              }
              tIds.push(t.id);
            });
            actionToModify.walls.forEach((w) => {
              this.createWall(w.from, w.to);
            });
            actionToModify.areas.forEach((ids) => {
              this.createArea(ids);
            });
            this.logState = ls;
            this.logAction({ action: "create", type: "chunk", ids: tIds });
            break;
          }
          case "walls": {
            this.logState = 0;
            let ids = [];
            actionToModify.ids.forEach((set) => {
              ids.push(set);
              this.createWall(set.from, set.to);
            });
            this.logState = ls;
            this.logAction({ action: "create", type: "walls", ids: ids });
          }
          case "area": {
            this.createArea(actionToModify.ids);
          }
        }
        break;
      }
    }
    this.logState = 1;
  },

  resizeChunkByDrag: function (step) {
    let o = this.chunckOptions;
    let mc = this.mouseCoords.snapped;
    switch (step) {
      case 0: {
        o.isChanging = true;
        o.co.x = mc.x;
        o.co.y = mc.y;
        break;
      }
      case 1: {
        let xDelta, yDelta, origin;
        //'o.hovering' determines where the user started to resize e.g. top left corner
        switch (o.hovering) {
          case 1: {
            origin = { x: 1, y: 1 };
            xDelta = o.co.x - mc.x;
            yDelta = o.co.y - mc.y;
            break;
          }
          case 2: {
            origin = { x: 0, y: 1 };
            xDelta = 0;
            yDelta = o.co.y - mc.y;
            break;
          }
          case 3: {
            origin = { x: 0, y: 1 };
            xDelta = mc.x - o.co.x;
            yDelta = o.co.y - mc.y;
            break;
          }
          case 4: {
            origin = { x: 1, y: 0 };
            xDelta = o.co.x - mc.x;
            yDelta = 0;
            break;
          }
          case 5: {
            origin = { x: 0, y: 0 };
            xDelta = mc.x - o.co.x;
            yDelta = 0;
            break;
          }
          case 6: {
            origin = { x: 1, y: 0 };
            xDelta = o.co.x - mc.x;
            yDelta = mc.y - o.co.y;
            break;
          }
          case 7: {
            origin = { x: 0, y: 0 };
            xDelta = 0;
            yDelta = mc.y - o.co.y;
            break;
          }
          case 8: {
            origin = { x: 0, y: 0 };
            xDelta = mc.x - o.co.x;
            yDelta = mc.y - o.co.y;
            break;
          }
          case 9: {
            origin = { x: 1, y: 1, z: 1 };
            xDelta = o.co.x - mc.x;
            yDelta = o.co.y - mc.y;
            break;
          }
        }
        let mz = this.mapZoom;
        if (origin.x) o.vx = this.relToFsPt.x(o.rx) - xDelta / mz;
        if (!origin?.z) o.vw = o.rw / mz + xDelta / mz;
        if (origin.y) o.vy = this.relToFsPt.y(o.ry) - yDelta / mz;
        if (!origin?.z) o.vh = o.rh / mz + yDelta / mz;
        this.updateChunkSizeDisplay(xDelta, yDelta);
        break;
      }
      case 2: {
        let xDelta = 1;
        let yDelta = 1;
        let origin = {
          x: 0,
          y: 0,
        };
        switch (o.hovering) {
          case 1: {
            origin = { x: o.rx + o.rw, y: o.ry + o.rh };
            xDelta = (o.rw - mc.x + o.co.x) / o.rw;
            yDelta = (o.rh - mc.y + o.co.y) / o.rh;
            break;
          }
          case 2: {
            origin = { x: 0, y: o.ry + o.rh };
            xDelta = 1;
            yDelta = (o.rh - mc.y + o.co.y) / o.rh;
            break;
          }
          case 3: {
            origin = { x: o.rx, y: o.ry + o.rh };
            xDelta = (o.rw - o.co.x + mc.x) / o.rw;
            yDelta = (o.rh - mc.y + o.co.y) / o.rh;
            break;
          }
          case 4: {
            origin = { x: o.rx + o.rw, y: 0 };
            xDelta = (o.rw - mc.x + o.co.x) / o.rw;
            yDelta = 1;
            break;
          }
          case 5: {
            origin = { x: o.rx, y: 0 };
            xDelta = (o.rw - o.co.x + mc.x) / o.rw;
            yDelta = 1;
            break;
          }
          case 6: {
            origin = { x: o.rx + o.rw, y: o.ry };
            xDelta = (o.rw - mc.x + o.co.x) / o.rw;
            yDelta = (o.rh - o.co.y + mc.y) / o.rh;
            break;
          }
          case 7: {
            origin = { x: 0, y: o.ry };
            xDelta = 1;
            yDelta = (o.rh - o.co.y + mc.y) / o.rh;
            break;
          }
          case 8: {
            origin = { x: o.rx, y: o.ry };
            xDelta = (o.rw - o.co.x + mc.x) / o.rw;
            yDelta = (o.rh - o.co.y + mc.y) / o.rh;
            break;
          }
          case 9: {
            origin = { x: 1, y: 1, z: 1 };
            xDelta = o.co.x - mc.x;
            yDelta = o.co.y - mc.y;
            break;
          }
        }
        this.resizeChunk(xDelta, yDelta, origin);
        o.isChanging = false;
        break;
      }
    }
  },
  resizeChunkByValue: function (type, value) {
    let o = this.chunckOptions;
    let delta = { x: value, y: 1 };
    let origin = { x: o.rx, y: o.ry };
    if (type[0] !== "fraction") {
      delta.x = (value * defly.UNIT_WIDTH) / (type[1] == "x" ? o.rw : o.rh);
    }
    if (type[1] === "y") {
      delta.y = delta.x;
      delta.x = 1;
    }
    this.resizeChunk(delta.x, delta.y, origin);
  },
  resizeChunkFromInfoMenu: function (axis, setSide, value) {
    let outermostPositions = this.getOuterMostPositionsOfChunk(),
      origin = {
        x:
          setSide == "top/left"
            ? outermostPositions.left
            : outermostPositions.right,
        y:
          setSide == "top/left"
            ? outermostPositions.top
            : outermostPositions.bottom,
      },
      width = outermostPositions.right - outermostPositions.left,
      height = outermostPositions.bottom - outermostPositions.top,
      inputEle = isNaN(value)
        ? document.querySelector(`#DME-towers-info-position-${value}`)
        : false;
    (deltaValue = inputEle
      ? setSide == "top/left"
        ? (inputEle.value - inputEle.old_value) * defly.UNIT_WIDTH
        : (inputEle.old_value - inputEle.value) * defly.UNIT_WIDTH
      : value),
      (xDelta = axis == "x" ? 1 + deltaValue / width : 1),
      (yDelta = axis == "y" ? 1 + deltaValue / height : 1);
    console.log(
      `Resizing -- X Delta: ${xDelta};  Y Delta: ${yDelta};  X Origin: ${origin.x};  Y Origin: ${origin.y}`
    );
    this.resizeChunk(xDelta, yDelta, origin);
  },
  //action here
  //actually resizes the chunk - if 'origin.z=true' then moves around instead
  resizeChunk: function (
    xDelta,
    yDelta,
    origin,
    towersToMod = this.selectedTowers
  ) {
    if (towersToMod.length < 1) return;
    xDelta = origin?.z
      ? xDelta
      : xDelta == 0
      ? 0.0001
      : xDelta == Infinity
      ? 0.5
      : xDelta == -Infinity
      ? -0.5
      : xDelta;
    yDelta = origin?.z
      ? yDelta
      : yDelta == 0
      ? 0.0001
      : yDelta == Infinity
      ? 0.5
      : yDelta == -Infinity
      ? -0.5
      : yDelta;
    let s = !origin?.z;
    let loggedIds = [];
    towersToMod.forEach((towerIndex) => {
      let t = this.mapData.towers[towerIndex];
      loggedIds.push(t.id);
      if (s) {
        t.x = origin.x + (t.x - origin.x) * xDelta;
        t.y = origin.y + (t.y - origin.y) * yDelta;
      } else {
        t.x -= xDelta;
        t.y -= yDelta;
      }
    });
    let stID = [];
    towersToMod.forEach((idx) => {
      stID.push(this.mapData.towers[idx].id);
    });
    this.updateWalls(stID);
    this.updateAreas(stID);
    this.updateChunkOptions();
    if (s) {
      this.logAction({
        action: "modify",
        type: "resize",
        ids: loggedIds,
        origin: origin,
        x: xDelta,
        y: yDelta,
      });
    } else {
      this.logAction({
        action: "modify",
        type: "move",
        ids: loggedIds,
        x: xDelta,
        y: yDelta,
      });
    }
  },

  recolorChunk: function (newColor, targetTowers = this.selectedTowers) {
    let towers = this.mapData.towers,
      loggedData = [],
      ids = [];
    targetTowers.forEach((ar) => {
      let t = towers[ar];
      loggedData.push({ ar: ar, color: t.color });
      ids.push(t.id);
      t.color = newColor;
    });
    let colorInput = document.querySelector("#DME-towers-info-color-input");
    colorInput.value = newColor;
    colorInput.style.backgroundColor = defly.colors.faded[newColor];
    document.querySelector("#DME-towers-info-color-dropdown").value = newColor;
    this.updateWalls(ids);
    this.updateAreas(ids);
    this.logAction({
      action: "modify",
      type: "color",
      towers: loggedData,
    });
  },

  selectTower: function () {
    let mc = this.mouseCoords.relative;
    let [x, y] = [mc.x, mc.y];
    if (this.isKeyPressed.SHIFT && this.isKeyPressed.CONTROL) {
      this.selectedTowers = [];
      this.mapData.towers.forEach((t, index) => {
        this.selectedTowers.push(index);
      });
    } else {
      let closestTower = this.getClosestTower(x, y);
      if (closestTower.distance < defly.TOWER_WIDTH) {
        if (this.isKeyPressed.CONTROL) {
          this.selectedTowers.push(closestTower.index);
          this.selectedTowers = removePairs(this.selectedTowers);
          //remove pairs; if one tower was already selected -> unselect
        } else {
          this.selectedTowers = [closestTower.index];
        }
      } else if (!this.isKeyPressed.CONTROL) {
        this.selectedTowers = [];
      }
    }
    this.updateChunkOptions();
  },

  selectChunk: function (state) {
    let mc = this.mouseCoords.relative;
    let [x, y] = [mc.x, mc.y];
    switch (state) {
      case 0: {
        this.selectingChunk.isSelecting = true;
        this.selectingChunk.origin.x = x;
        this.selectingChunk.origin.y = y;
        console.log("Is selecting...");
        break;
      }
      case 1: {
        if (this.selectingChunk.isSelecting) {
          this.selectingChunk.isSelecting = false;
          console.log(
            `Selecting from ${this.selectingChunk.origin.x}, ${this.selectingChunk.origin.y} to ${x}, ${y}`
          );
          if (this.isKeyPressed.SHIFT && this.isKeyPressed.CONTROL) {
            this.selectTower(); //will exit after checking shift pressed & selecting all towers
            return;
          }
          let tx =
            x < this.selectingChunk.origin.x ? x : this.selectingChunk.origin.x;
          let ty =
            y < this.selectingChunk.origin.y ? y : this.selectingChunk.origin.y;
          let bx =
            x > this.selectingChunk.origin.x ? x : this.selectingChunk.origin.x;
          let by =
            y > this.selectingChunk.origin.y ? y : this.selectingChunk.origin.y;
          if (!this.isKeyPressed.CONTROL) this.selectedTowers = [];
          this.mapData.towers.forEach((tower, index) => {
            if (tx < tower.x && ty < tower.y && bx > tower.x && by > tower.y) {
              this.selectedTowers.push(index);
            }
          });
          this.selectedTowers = removePairs(this.selectedTowers);
          this.updateChunkOptions();
        }
        break;
      }
    }
  },

  //action here
  deleteTowers: function (towerIdx = this.selectedTowers) {
    let loggedTowers = [];
    let loggedWalls = [];
    let loggedAreas = [];
    towerIdx.sort((a, b) => {
      return a - b;
    });
    towerIdx.forEach((index, counter) => {
      let realIndex = index - counter;
      let t = this.mapData.towers[realIndex];
      let id = t.id;
      if (id > 0) loggedTowers.push({ x: t.x, y: t.y, color: t.color, id: id });
      else {
        let push = {
          x: t.x,
          y: t.y,
          id: id,
        };
        if (t?.rotation) push.rotation = t.rotation;
        loggedTowers.push(push);
      }
      this.mapData.towers.splice(realIndex, 1);
      let wallsToDelete = [];
      this.mapData.walls.forEach((wall, index) => {
        if (wall.from.id == id || wall.to.id == id) {
          wallsToDelete.push(index);
        }
      });
      wallsToDelete.forEach((index, counter) => {
        let w = this.mapData.walls[index - counter];
        loggedWalls.push({ from: w.from.id, to: w.to.id });
        this.mapData.walls.splice(index - counter, 1);
      });
      let areasToDelete = [];
      this.mapData.areas.forEach((area, index) => {
        if (area.nodes.some((obj) => obj.id == id)) {
          areasToDelete.push(index);
        }
      });
      areasToDelete.forEach((index, counter) => {
        let aIds = [];
        this.mapData.areas[index - counter].nodes.forEach((n) => {
          aIds.push(n.id);
        });
        loggedAreas.push(aIds);
        this.mapData.areas.splice(index - counter, 1);
      });
    });
    let newSelectedTowers = structuredClone(this.selectedTowers);
    newSelectedTowers.sort((a, b) => {
      return a - b;
    });
    let dC = 0;
    let deleted = [];
    newSelectedTowers.forEach((t, c) => {
      if (towerIdx.includes(t)) {
        deleted.push(c);
        dC++;
      } else newSelectedTowers[c] -= dC;
    });
    deleted.forEach((idx, c) => {
      newSelectedTowers.splice(idx - c, 1);
    });
    this.selectedTowers = newSelectedTowers;
    this.logAction({
      action: "delete",
      type: "towers",
      towers: loggedTowers,
      walls: loggedWalls,
      areas: loggedAreas,
    });
    this.updateChunkOptions();
    if (loggedAreas.length) this.updateShields();
  },

  deleteWalls: function (ids) {
    //note: if deleted wall is part of area, delete area as well (<- to be added)
    let wallIdentifiers = [];
    this.mapData.walls.forEach((w) => {
      wallIdentifiers.push(`${w.from.id},${w.to.id}`);
    });
    let wallsToDelete = [];
    ids.forEach((set) => {
      let idx = wallIdentifiers.indexOf(`${set.from},${set.to}`);
      if (idx >= 0) wallsToDelete.push(idx);
    });
    wallsToDelete.sort((a, b) => {
      return a - b;
    });
    wallsToDelete.forEach((idx, c) => {
      this.mapData.walls.splice(idx - c, 1);
    });
    this.logAction({
      action: "delete",
      type: "walls",
      ids: ids,
    });
  },

  deleteArea: function (ids) {
    let areaIdentifiers = [];
    this.mapData.areas.forEach((a) => {
      let ideText = ``;
      a.nodes.forEach((n) => {
        ideText += `${n.id},`;
      });
      areaIdentifiers.push(ideText);
    });
    let areasToDelete = [];
    let ident = ``;
    ids.forEach((id) => {
      ident += `${id},`;
    });
    let idx = areaIdentifiers.indexOf(ident);
    if (idx >= 0) areasToDelete.push(idx);
    areasToDelete.sort((a, b) => {
      return a - b;
    });
    areasToDelete.forEach((idx, c) => {
      this.mapData.areas.splice(idx - c, 1);
    });
    this.updateShields();
    this.logAction({ action: "delete", type: "area", ids: ids });
  },

  rotateChunk: function (properties, towers = this.selectedTowers) {
    let centre = properties?.centre ?? this.getCentreOfChunk(towers);
    if (!properties?.angle) {
      alert("Error: missing angle");
      return;
    }
    let [sin, cos] = [Math.sin(properties.angle), Math.cos(properties.angle)];
    towers.forEach((idx) => {
      let t = this.mapData.towers[idx];
      let [x, y] = [t.x - centre.x, t.y - centre.y];
      t.x = x * cos - y * sin + centre.x;
      t.y = x * sin + y * cos + centre.y;
    });
    let [wIds, aIds] = [
      this.mapData.walls.length > 50 ? this.getIdFromIndex(towers) : undefined,
      this.mapData.areas.length > 30 ? this.getIdFromIndex(towers) : undefined,
    ];
    this.updateWalls(wIds);
    this.updateAreas(aIds);
    this.updateChunkOptions();
    this.logAction({
      action: "modify",
      type: "rotate",
      idxs: towers,
      properties: { centre: centre, angle: -properties.angle },
    });
  },

  mirrorChunk: function (properties, towers = this.selectedTowers) {
    let d = properties.direction,
      mirrorAxies =
        this.getOuterMostPositionsOfChunk(towers)[properties.direction],
      [xModif, yModif] = [
        d == "left" || d == "right" ? 2 : 0,
        d == "bottom" || d == "top" ? 2 : 0,
      ],
      mirroredIds = {},
      collectiveIds = [];
    colNewIds = [];
    //disable log
    let ls = this.logState;
    this.logState = 0;
    towers.forEach((idx) => {
      let t = this.mapData.towers[idx],
        x = t.x + (mirrorAxies - t.x) * xModif,
        y = t.y + (mirrorAxies - t.y) * yModif;
      collectiveIds.push(t.id);
      if (t.x == x && t.y == y) {
        mirroredIds[t.id] = t.id;
      } else {
        if (t.id > 0) {
          mirroredIds[t.id] = this.highestId;
          colNewIds.push(this.highestId);
          this.createTower(x, y, t.color, this.highestId);
        } else {
          let modif =
            this.getIndexFromId(t.id) == -1
              ? 0
              : t.id == -1 || t.id == -3
              ? -1
              : 1;
          if (this.getIndexFromId(t.id + modif) < 0) {
            //doesn´t exist already, just place down
            let pos = {
              x: t.x + (mirrorAxies - t.x) * xModif,
              y: t.y + (mirrorAxies - t.y) * yModif,
            };
            if (t?.rotation) pos.r = t.rotation;
            this.placeSpecial(-(t.id + modif), pos);
            colNewIds.push(t.id + modif);
          }
        }
      }
    });
    this.mapData.walls.forEach((w) => {
      if (
        collectiveIds.includes(w.from.id) &&
        collectiveIds.includes(w.to.id)
      ) {
        this.createWall(mirroredIds[w.from.id], mirroredIds[w.to.id]);
      }
    });
    this.mapData.areas.forEach((a) => {
      let inside = true,
        newIdAr = [];
      a.nodes.forEach((n) => {
        if (!collectiveIds.includes(n.id)) inside = false;
        newIdAr.push(mirroredIds[n.id]);
      });
      if (inside) {
        this.createArea(newIdAr);
      }
    });
    //enable log back
    this.logState = ls;
    this.logAction({ action: "create", type: "chunk", ids: colNewIds });
  },

  changeSelectedTowerColor: function (newColor) {
    let c =
      Number(newColor) < 14 && Number(newColor) > 0
        ? Number(newColor).toFixed(0)
        : 14;
    let i = document.querySelector("#DME-input-tower-color");
    i.value = c;
    i.style.backgroundColor = defly.colors.faded[c];
    // .replace("(", "a(").replace(")", ", 0.9)");
    document
      .querySelector("#DME-select-color-dropdown")
      .querySelectorAll("option")[c - 1].selected = true;
    this.selectedColor = c;
  },

  handleKothInput: function (step) {
    let mc = this.mouseCoords.snapped;
    switch (step) {
      case 0: {
        this.editMode = "KOTH";
        if (!this.mapData.koth.length) {
          this.mapData.koth = [];
        }
        this.mapData.koth[4] = true;
        break;
      }
      case 1: {
        this.mapData.koth[4] = false;
        this.mapData.koth[0] = mc.x;
        this.mapData.koth[1] = mc.y;
        if (!isNaN(this.mapData.koth[2])) {
          //update tower visuals
          this.updateKothTowers();
        }
        document.querySelector("#DME-edit-KOTH").innerText = "Edit KOTH bounds";
        break;
      }
      case 2: {
        this.mapData.koth[2] = mc.x;
        this.mapData.koth[3] = mc.y;
        if (this.mapData.koth[0] > this.mapData.koth[2]) {
          let t = this.mapData.koth[0];
          this.mapData.koth[0] = this.mapData.koth[2];
          this.mapData.koth[2] = t;
        }
        if (this.mapData.koth[1] > this.mapData.koth[3]) {
          let t = this.mapData.koth[1];
          this.mapData.koth[1] = this.mapData.koth[3];
          this.mapData.koth[3] = t;
        }
        let t = document.querySelector("#DME-edit-KOTH");
        t.classList.remove("fatButton");
        t.classList.add("fatButtonRight");
        document.querySelector("#DME-remove-KOTH").classList.remove("hidden");
        this.editMode = "building";
        this.updateKothTowers();
        break;
      }
      case -1: {
        this.mapData.koth = [];
        let t = document.querySelector("#DME-edit-KOTH");
        t.classList.remove("fatButtonRight");
        t.classList.add("fatButton");
        t.innerText = "Add KOTH bounds";
        document.querySelector("#DME-remove-KOTH").classList.add("hidden");
        this.editMode = "building";
        this.updateKothTowers();
      }
    }
  },

  updateMapSize: function (spec, value) {
    this.mapData[spec] = value * defly.UNIT_WIDTH;
    let notSpec = spec == "width" ? "height" : "width";
    switch (this.mapData.shape) {
      case 0: {
        //rectangle
        break;
      }
      case 1: {
        //hexagon
        if (spec == "width") {
          this.mapData.height =
            Number(this.mapData.width) * Math.sin(Math.PI / 3);
          let hI = document.querySelector("#DME-input-map-height");
          hI.value = Number(this.mapData.height) / defly.UNIT_WIDTH;
        } else {
          this.mapData.width =
            Number(this.mapData.height) / Math.sin(Math.PI / 3);
          let hI = document.querySelector("#DME-input-map-width");
          hI.value = Number(this.mapData.width) / defly.UNIT_WIDTH;
        }
        this.updateHexBounds();
        break;
      }
      case 2: {
        //circle
        this.mapData[notSpec] = Number(this.mapData[spec]);
        let hI = document.querySelector(`#DME-input-map-${notSpec}`);
        hI.value = Number(this.mapData[notSpec]) / defly.UNIT_WIDTH;
        break;
      }
    }
    this.updateMouseCoords();
  },

  switchMapShape: function () {
    this.mapData.shape = ++this.mapData.shape % 3;
    switch (this.mapData.shape) {
      case 0: {
        //rectangle
        //document.querySelector('#DME-input-map-height').removeAttribute('disabled');
        break;
      }
      case 1: {
        //hexagon
        this.mapData.height =
          Number(this.mapData.width) * Math.sin(Math.PI / 3);
        let hI = document.querySelector("#DME-input-map-height");
        hI.value = Number(this.mapData.height) / defly.UNIT_WIDTH;
        //hI.setAttribute('disabled', 1);

        this.updateHexBounds();

        break;
      }
      case 2: {
        //circle
        this.mapData.height = Number(this.mapData.width);
        let hI = document.querySelector("#DME-input-map-height");
        hI.value = Number(this.mapData.height) / defly.UNIT_WIDTH;
        //hI.setAttribute('disabled', 1);
      }
    }
  },
  updateHexBounds: function () {
    this.mapData.bounds = [];
    let cX = this.mapData.width / 2,
      cY = this.mapData.height / 2;
    //radious = cX
    for (c = -0.5; c < 5.5; c++) {
      //check whether position is outside hex map bounds
      let sX = Math.sin((c / 3) * Math.PI) * cX + cX,
        sY = Math.cos((c / 3) * Math.PI) * cX + cY;
      this.mapData.bounds.push(sX);
      this.mapData.bounds.push(sY);
    }
  },

  changeQuality: function (newQuality) {
    let btns = document.querySelectorAll(
      `#DME-visuals-menu-quality-buttons > button`
    );
    btns?.[((1 - this.visuals.quality) * 5).toFixed(0)]?.classList.remove(
      "selected"
    );
    btns?.[((1 - newQuality) * 5).toFixed(0)]?.classList.add("selected");
    canvas.width *= newQuality / this.visuals.quality;
    canvas.height *= newQuality / this.visuals.quality;
    this.visuals.quality = newQuality;
  },

  loadFile: function (input) {
    let file = input.files[0];
    let reader = new FileReader();

    reader.readAsText(file);

    reader.onload = function () {
      console.log(reader.result);
      DME.loadMap(reader.result);
    };

    reader.onerror = function () {
      console.log(reader.error);
      alert("Error: failed loading map file");
      return;
    };
  },

  loadMap: function (mapData, dataType) {
    console.log(mapData);
    this.logState = 0;
    if (!dataType) {
      //determine type
      dataType =
        mapData.split(/\n/).length == 1 && mapData.split("|").length == 6
          ? "compact"
          : undefined;
      console.log(
        `Row length: ${mapData.split(/\n/).length}; Argument length: ${
          mapData.split("|").length
        }`
      );
      console.log(mapData.split("|"));
      dataType = !dataType
        ? mapData.split(/\n/).length == 1 && mapData.split(":")[0] == '{"name"'
          ? "astrolly"
          : undefined
        : dataType;
      dataType = !dataType ? "defly" : dataType;
    }
    let mapFile = mapData;
    console.log(mapFile);
    console.log(`Loading map - data type: ${dataType}`);
    //only if new map is loaded
    this.clearMap(true);

    switch (dataType) {
      case "defly": {
        let newMapData = mapFile.split(/\s+/);
        newMapData.forEach((identifier, position) => {
          switch (identifier) {
            case "MAP_WIDTH": {
              this.mapData.width = newMapData[position + 1] * defly.UNIT_WIDTH;
              document.querySelector("#DME-input-map-width").value =
                newMapData[position + 1];
              break;
            }
            case "MAP_HEIGHT": {
              this.mapData.height = newMapData[position + 1] * defly.UNIT_WIDTH;
              document.querySelector("#DME-input-map-height").value =
                newMapData[position + 1];
              break;
            }
            case "KOTH": {
              this.mapData.koth = [
                newMapData[position + 1] * defly.UNIT_WIDTH,
                newMapData[position + 2] * defly.UNIT_WIDTH,
                newMapData[position + 3] * defly.UNIT_WIDTH,
                newMapData[position + 4] * defly.UNIT_WIDTH,
              ];
              break;
            }
            case "d": {
              let color = isNaN(Number(newMapData[position + 4]))
                ? 1
                : newMapData[position + 4];
              this.createTower(
                Number(newMapData[position + 2]) * defly.UNIT_WIDTH,
                Number(newMapData[position + 3]) * defly.UNIT_WIDTH,
                color,
                Number(newMapData[position + 1])
              );
              break;
            }
            case "l": {
              this.createWall(
                Number(newMapData[position + 1]),
                Number(newMapData[position + 2])
              );
              break;
            }
            case "z": {
              let ids = [];
              for (let c = 1; c < newMapData.length; c++) {
                let id = Number(newMapData[position + c]);
                if (isNaN(id) || id <= 0) {
                  c = newMapData.length;
                  continue;
                }
                ids.push(id);
              }
              this.createArea(ids);
              break;
            }
            case "s": {
              //spawns
              this.placeSpecial(5 - newMapData[position + 1], {
                x: (Number(newMapData[position + 2]) + 4.5) * defly.UNIT_WIDTH,
                y: (Number(newMapData[position + 3]) + 4.5) * defly.UNIT_WIDTH,
                r: isNaN(Number(newMapData[position + 4]))
                  ? 0
                  : newMapData[position + 4],
              });
              break;
            }
            case "t": {
              //bomb spots
              this.placeSpecial(Number(newMapData[position + 1]) + 1, {
                x: newMapData[position + 2] * defly.UNIT_WIDTH,
                y: newMapData[position + 3] * defly.UNIT_WIDTH,
              });
              break;
            }
          }
        });
        break;
      }
      case "compact": {
        let newMapData = mapFile.split("|");

        //map size
        let newMapSize = newMapData[0].split(",");
        this.mapData.width =
          Number(newMapSize[0]) > 0
            ? Number(newMapSize[0]) * defly.UNIT_WIDTH
            : this.mapData.width;
        this.mapData.height =
          Number(newMapSize[1]) > 0
            ? Number(newMapSize[1]) * defly.UNIT_WIDTH
            : this.mapData.height;

        //koth bounds
        this.mapData.koth =
          newMapData[1].split(",").length < 4 ? [] : newMapData[1].split(",");

        //bomb spots
        let bombData = newMapData[2].split(",");
        for (let c = 0; bombData.length > c + 1; c += 2) {
          this.placeSpecial(c / 2 + 1, {
            x: bombData[0 + c] * defly.UNIT_WIDTH,
            y: bombData[1 + c] * defly.UNIT_WIDTH,
          });
        }

        //defuse spawns
        let spawnData = newMapData[3].split(",");
        for (let c = 0; spawnData.length > c + 1; c += 4) {
          this.placeSpecial(undefined, {
            x: (Number(spawnData[0 + c]) + 4.5) * defly.UNIT_WIDTH,
            y: (Number(spawnData[1 + c]) + 4.5) * defly.UNIT_WIDTH,
            t: Number(spawnData[2 + c]),
            r: Number(spawnData[3 + c]),
          });
        }

        //towers (and walls)
        let towerData = newMapData[4].split(";");
        if (towerData.at(-1) == "") towerData.splice(-1, 1);
        let wallsToPlace = [];
        towerData.forEach((rawTower, index) => {
          let tower = rawTower.split(",");
          let color = tower[2] === "" ? 1 : tower[2];
          this.createTower(
            tower[0] * defly.UNIT_WIDTH,
            tower[1] * defly.UNIT_WIDTH,
            color,
            index + 1
          );
          //walls

          for (let c = 3; c < tower.length; c++) {
            wallsToPlace.push([index + 1, Number(tower[c])]); //might be 'Number(tower[c])-1' - in case of crash try change
          }
        });
        wallsToPlace.forEach((w) => {
          this.createWall(w[0], w[1]);
        });
        this.updateWalls();

        //shading
        let shadingData = newMapData[5].split(";");
        if (shadingData.at(-1) == "") shadingData.splice(-1, 1);
        shadingData.forEach((rawShading) => {
          let shading = rawShading.split(",");
          let ids = [];
          shading.forEach((tId) => {
            ids.push(Number(tId));
          });
          this.createArea(ids);
        });
        break;
      }
      case "astrolly": {
        console.log(JSON.parse(mapFile));
        let newMapData = JSON.parse(mapFile);
        this.mapData.width = newMapData.width;
        this.mapData.height = newMapData.height;
        Object.entries(newMapData.nodes).forEach((nV) => {
          this.createTower(nV[1].x, nV[1].y, 1, nV[1].nodeId);
        });
        newMapData.edges.forEach((e) => {
          this.createWall(e.fromNodeId, e.toNodeId);
        });
        /*newMapData.regions.forEach(r => {
          let ids = [];
          r.forEach(n => {
            //!here \/ has to be fixed - don't have files on me rn
            ids.push(n.value);
          });
          this.createArea(ids);
        });*/
        //bomb spots - not supported yet

        //spawns - not supported yet

        break;
      }
      default: {
        alert("Sorry, this map format is not supported yet!");
        break;
      }
    }
    //update displayed map size
    document.querySelector("#DME-input-map-width").value =
      this.mapData.width / defly.UNIT_WIDTH;
    document.querySelector("#DME-input-map-height").value =
      this.mapData.height / defly.UNIT_WIDTH;
    //enable action logging
    this.logState = 1;
  },

  clearMap: function (confirmed) {
    if (!confirmed)
      confirmed = confirm("Are you sure you want to delete this map?");
    if (confirmed) {
      this.mapData.towers = [];
      this.mapData.walls = [];
      this.mapData.areas = [];
      this.selectedTowers = [];
      this.highestId = 1;
      this.handleKothInput(-1);
    }
  },

  generateMapFile: function (type = "defly") {
    let d = this.getCleanMapCopy();
    let text = ``;
    let uW = defly.UNIT_WIDTH;
    switch (type) {
      case "defly": {
        text += `MAP_WIDTH ${d.width / uW}`;
        text += `\nMAP_HEIGHT ${d.height / uW}`;
        if (d?.koth.length >= 4)
          text += `\nKOTH ${d.koth[0] / uW.toRounded(6)} ${
            d.koth[1] / uW.toRounded(6)
          } ${d.koth[2] / uW.toRounded(6)} ${d.koth[3] / uW.toRounded(6)}`;
        d?.bombs?.forEach((b, c) => {
          text += `\nt ${c} ${(b.x / uW).toRounded(6)} ${(b.y / uW).toRounded(
            6
          )}`;
        });
        d?.spawns?.forEach((b, c) => {
          text += `\ns ${c + 1} ${(b.x / uW - 4.5).toRounded(6)} ${(
            b.y / uW -
            4.5
          ).toRounded(6)}${b.r ? " " + b.r : ""}`;
        });
        let t_text = ``;
        d.towers.forEach((t) => {
          t_text += `\nd ${t.id} ${(t.x / uW).toRounded(2)} ${(
            t.y / uW
          ).toRounded(2)}${t.color != 1 ? " " + t.color : ""}`;
        });
        let w_text = ``;
        d.walls.forEach((w) => {
          w_text += `\nl ${w.from.id} ${w.to.id}`;
        });
        let a_text = ``;
        d.areas.forEach((a) => {
          a_text += `\nz`;
          a.nodes.forEach((n) => {
            a_text += ` ${n.id}`;
          });
        });
        text += `${t_text}${w_text}${a_text}`;
        break;
      }
      case "compact": {
        text += `${(d.width / uW).toRounded(2)},${(d.height / uW).toRounded(
          2
        )}|${
          /*Koth bounds*/ d?.koth.length >= 4
            ? `${d.koth[0]},${d.koth[1]},${d.koth[2]},${d.koth[3]}`
            : ""
        }|`;
        let bombData = "";
        d?.bombs?.forEach((b, c) => {
          bombData += `${c ? "," : ""}${(b.x / uW).toRounded(6)},${(
            b.y / uW
          ).toRounded(6)}`;
        });
        let spawnData = "";
        d?.spawns?.forEach((b, c) => {
          spawnData += `${c ? "," : ""}${(b.x / uW - 4.5).toRounded(6)},${(
            b.y / uW -
            4.5
          ).toRounded(6)},${b.t},${b.r ? b.r : ""}`;
        });
        text += `${/*Defuse bombs*/ bombData}|${/*Defuse spawns*/ spawnData}|`;
        let cWalls = {};
        d.walls.forEach((w) => {
          if (!Array.isArray(cWalls[w.from.id])) cWalls[w.from.id] = [];
          cWalls[w.from.id].push(w.to.id);
        });
        d.towers.forEach((t, c) => {
          text += `${c ? ";" : ""}${(t.x / uW).toRounded(6)},${(
            t.y / uW
          ).toRounded(6)},${t.color == 1 ? "" : t.color}`;
          cWalls[c + 1]?.forEach((w) => {
            text += `,${w}`;
          });
        });
        text += `|`;
        d.areas.forEach((a, ac) => {
          a.nodes.forEach((n, nc) => {
            text += `${nc ? "," : ac ? ";" : ""}${n.id}`;
          });
        });
        break;
      }
      case "astrolly": {
        alert("Not supported yet...");
        break;
      }
      default: {
        alert("Error: Unknown file type");
        break;
      }
    }
    return text;
  },

  getCleanMapCopy: function () {
    let copy = JSON.parse(JSON.stringify(this.mapData));
    let newId = {};
    let ntC = 0,
      falseTowers = [];
    copy.towers.forEach((t, c) => {
      if (!t?.isNotTower) {
        newId[t.id] = c + 1 - ntC;
        copy.towers[c].id = c + 1 - ntC;
      } else {
        ntC++;
        if (t.id > -3) {
          if (!copy?.bombs) copy.bombs = [];
          copy.bombs.push({ x: t.x, y: t.y /*,t:t.id>-2?'a':'b'*/ });
        } else {
          if (!copy?.spawns) copy.spawns = [];
          copy.spawns.push({ x: t.x, y: t.y, t: t.id, r: t.rotation });
        }
        falseTowers.push(c);
      }
    });
    falseTowers.forEach((idx, c) => copy.towers.splice(idx - c, 1));
    copy.walls.forEach((w, idx) => {
      copy.walls[idx].from.id = newId[w.from.id];
      copy.walls[idx].to.id = newId[w.to.id];
    });
    copy.areas.forEach((a, ac) => {
      a.nodes.forEach((n, nc) => {
        copy.areas[ac].nodes[nc].id = newId[n.id];
      });
    });
    return copy;
  },

  generateMapPreview: function () {
    let canvas = document.querySelector("#DME-preview-canvas"),
      ctx = canvas.getContext("2d");
    (width = this.mapData.width + defly.GRID_WIDTH),
      (height = this.mapData.height + defly.GRID_WIDTH);
    (fract = width / height >= 16 / 9 ? 1600 / width : 900 / height),
      (UW = defly.UNIT_WIDTH);
    width *= fract;
    height *= fract;
    canvas.width = width;
    canvas.height = height; //HERE

    const relToCvs = {
      x: (val) => (val + UW) * fract,
      y: (val) => (val + UW) * fract,
    };

    //clear canvas
    ctx.fillStyle = this.visuals.map_BGC;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //draw map background
    ctx.fillStyle = this.visuals.grid_BGC;
    ctx.fillRect(
      relToCvs.x(0),
      relToCvs.y(0),
      this.mapData.width * fract,
      this.mapData.height * fract
    );
    if (this.visuals.showBackgroundImage && this.visuals.backgroundImage.src) {
      if (this.visuals.keepBackgroundImageRatio) {
        let img = this.visuals.backgroundImage,
          imgWidthRatio = img.width / img.height,
          mapWidthRatio = this.mapData.width / this.mapData.height;
        let scale =
          imgWidthRatio > mapWidthRatio
            ? img.width / this.mapData.width
            : img.height / this.mapData.height;
        ctx.drawImage(
          this.visuals.backgroundImage,
          relToCvs.x((this.mapData.width - img.width / scale) / 2),
          relToCvs.y((this.mapData.height - img.height / scale) / 2),
          (img.width * fract) / scale,
          (img.height * fract) / scale
        );
      } else {
        ctx.drawImage(
          this.visuals.backgroundImage,
          relToCvs.x(0),
          relToCvs.y(0),
          this.mapData.width * fract,
          this.mapData.height * fract
        );
      }
    }
    ctx.strokeStyle = this.visuals.grid_lineC;
    if (Number(this.visuals.grid_line_width)) {
      ctx.lineWidth = this.visuals.grid_line_width * fract;
      ctx.beginPath();
      let w = this.mapData.width;
      let h = this.mapData.height;
      for (c = defly.GRID_WIDTH; c < w; c += defly.GRID_WIDTH) {
        ctx.moveTo(relToCvs.x(c), relToCvs.y(0));
        ctx.lineTo(relToCvs.x(c), relToCvs.y(h));
      }
      for (c = defly.GRID_WIDTH; c < h; c += defly.GRID_WIDTH) {
        ctx.moveTo(relToCvs.x(0), relToCvs.y(c));
        ctx.lineTo(relToCvs.x(w), relToCvs.y(c));
      }
      ctx.stroke();
    }
    ctx.lineWidth = 1 + 1 * fract;
    switch (this.mapData.shape) {
      case 0: {
        //rectangle
        ctx.strokeRect(
          relToCvs.x(0),
          relToCvs.y(0),
          this.mapData.width * fract,
          this.mapData.height * fract
        );
        break;
      }
      case 1: {
        //hexagon
        ctx.beginPath();
        let w = this.mapData.width,
          h = this.mapData.height;
        ctx.moveTo(relToCvs.x(w / 4), relToCvs.y(0));
        ctx.lineTo(relToCvs.x((w * 3) / 4), relToCvs.y(0));
        ctx.lineTo(relToCvs.x(w), relToCvs.y(h / 2));
        ctx.lineTo(relToCvs.x((w * 3) / 4), relToCvs.y(h));
        ctx.lineTo(relToCvs.x(w / 4), relToCvs.y(h));
        ctx.lineTo(relToCvs.x(0), relToCvs.y(h / 2));
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 2: {
        //circle
        let w = this.mapData.width,
          h = this.mapData.height;
        ctx.beginPath();
        ctx.arc(
          relToCvs.x(w / 2),
          relToCvs.y(h / 2),
          (w / 2) * fract,
          2 * Math.PI,
          false
        );
        ctx.stroke();
        break;
      }
    }
    let wallWidth = defly.WALL_WIDTH * fract;
    let towerWidth = defly.TOWER_WIDTH * fract;
    //draw areas
    DME.mapData.areas.forEach((area) => {
      ctx.fillStyle = defly.colors.faded[area.color];
      ctx.beginPath();
      ctx.moveTo(relToCvs.x(area.nodes[0].x), relToCvs.y(area.nodes[0].y));
      area.nodes.forEach((node) => {
        ctx.lineTo(relToCvs.x(node.x), relToCvs.y(node.y));
      });
      ctx.fill();
    });
    //draw walls
    DME.mapData.walls.forEach((wall) => {
      ctx.lineWidth = wallWidth;
      ctx.strokeStyle = defly.colors.darkened[wall.color];
      ctx.beginPath();
      ctx.moveTo(relToCvs.x(wall.from.x), relToCvs.y(wall.from.y));
      ctx.lineTo(relToCvs.x(wall.to.x), relToCvs.y(wall.to.y));
      ctx.stroke();
      //draw wall twice, once bit darker to create the darkened edge of the wall
      ctx.strokeStyle = defly.colors.standard[wall.color];
      ctx.lineWidth = wallWidth - 4 * fract;
      ctx.beginPath();
      ctx.moveTo(relToCvs.x(wall.from.x), relToCvs.y(wall.from.y));
      ctx.lineTo(relToCvs.x(wall.to.x), relToCvs.y(wall.to.y));
      ctx.stroke();
    });
    //draw towers
    DME.mapData.towers.forEach((tower, index) => {
      let t = {
        x: relToCvs.x(tower.x),
        y: relToCvs.y(tower.y),
      };
      if (!tower?.isNotTower) {
        let colorId = tower?.isKothTower ? false : tower.color;
        ctx.fillStyle = colorId
          ? defly.colors.darkened[colorId]
          : "rgb(70, 52, 14)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, towerWidth, 2 * Math.PI, false);
        ctx.fill();
        //draw tower twice, once bit darker to create the darkened edge of the tower, just like wall
        ctx.fillStyle = colorId
          ? defly.colors.standard[colorId]
          : "rgb(195,143,39)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, towerWidth - 2 * fract, 2 * Math.PI, false);
        ctx.fill();

        //if tower is shielded, draw shield
        if (tower?.isShielded && this.visuals.showTowerShields) {
          ctx.shadowColor = "black";
          ctx.strokeStyle = defly.colors.faded[1];
          ctx.lineWidth = 2 * fract;
          ctx.shadowBlur = 3 * fract;
          ctx.beginPath();
          ctx.arc(t.x, t.y, towerWidth + 2 * fract, 2 * Math.PI, false);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        if (!colorId) {
          let w = defly.TOWER_WIDTH * fract;
          ctx.drawImage(
            defly.images.koth_crown,
            t.x - w,
            t.y - w,
            w * 2,
            w * 2
          );
          /*ctx.fillStyle = "black";
          ctx.beginPath();
          ctx.moveTo(t.x - 6.5 * fract, t.y + 6.5 * fract);
          ctx.lineTo(t.x + 6.5 * fract, t.y + 6.5 * fract);
          ctx.lineTo(t.x + 9.5 * fract, t.y - 1.5 * fract);
          ctx.lineTo(t.x + 9 * fract, t.y - 2 * fract);
          ctx.lineTo(t.x + 6 * fract, t.y - 0.5 * fract);
          ctx.lineTo(t.x + 5.2 * fract, t.y - 3.6 * fract);
          ctx.lineTo(t.x + 4.3 * fract, t.y - 3.6 * fract);
          ctx.lineTo(t.x + 2.2 * fract, t.y - 1.8 * fract);
          ctx.lineTo(t.x + 0.3 * fract, t.y - 6.2 * fract);
          ctx.lineTo(t.x - 0.3 * fract, t.y - 6.2 * fract);
          ctx.lineTo(t.x - 2.2 * fract, t.y - 1.8 * fract);
          ctx.lineTo(t.x - 4.3 * fract, t.y - 3.6 * fract);
          ctx.lineTo(t.x - 5.2 * fract, t.y - 3.6 * fract);
          ctx.lineTo(t.x - 6 * fract, t.y - 0.5 * fract);
          ctx.lineTo(t.x - 9 * fract, t.y - 2 * fract);
          ctx.lineTo(t.x - 9.5 * fract, t.y - 1.5 * fract);
          ctx.lineTo(t.x - 6.5 * fract, t.y + 6.5 * fract);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(
            t.x + 9.3 * fract,
            t.y - 2 * fract,
            1 * fract,
            0,
            2 * Math.PI
          );
          ctx.moveTo(t.x + 4.9 * fract, t.y - 4 * fract);
          ctx.arc(
            t.x + 4.9 * fract,
            t.y - 4 * fract,
            1 * fract,
            0,
            2 * Math.PI
          );
          ctx.moveTo(t.x, t.y - 6.5 * fract);
          ctx.arc(t.x, t.y - 6.5 * fract, 1 * fract, 0, 2 * Math.PI);
          ctx.moveTo(t.x - 4.9 * fract, t.y - 4 * fract);
          ctx.arc(
            t.x - 4.9 * fract,
            t.y - 4 * fract,
            1 * fract,
            0,
            2 * Math.PI
          );
          ctx.moveTo(t.x - 9.3 * fract, t.y - 2 * fract);
          ctx.arc(
            t.x - 9.3 * fract,
            t.y - 2 * fract,
            1 * fract,
            0,
            2 * Math.PI
          );
          ctx.fill();*/
        }
      } else {
        //not a tower: either spawn or bomb
        let bombRadius = 6 * UW * fract,
          sS = 4.5 * UW * fract,
          tS = defly.TOWER_WIDTH * fract;

        if (tower.id > -3) {
          //bomb spot

          let img = defly.images.bombB;
          if (tower.id == -1) img = defly.images.bombA;
          ctx.drawImage(
            img,
            t.x - bombRadius,
            t.y - bombRadius,
            2 * bombRadius,
            2 * bombRadius
          );
          /*ctx.strokeStyle = "rgba(110,130,250,.5)";
          ctx.lineWidth = 8 * fract;
          ctx.beginPath();
          ctx.arc(t.x, t.y, bombRadius - 4 * fract, 0, 2 * Math.PI);
          ctx.stroke();
          ctx.fillStyle = "rgba(110,130,250,.5)";
          ctx.font = `bold ${150 * fract}px Verdana`;
          ctx.fillText(
            tower.id == -1 ? "A" : "B",
            t.x - 58 * fract,
            t.y + 54 * fract
          );*/
        } else {
          //spawn
          let col = tower.id == -3 ? 3 : 2;
          ctx.fillStyle = defly.colors.faded[col];
          ctx.fillRect(t.x - sS, t.y - sS, 2 * sS, 2 * sS);
          //triangle, based on spawn rotation
          ctx.fillStyle = defly.colors.standard[col];
          ctx.beginPath();
          switch (tower.rotation) {
            case 0: {
              ctx.moveTo(t.x - tS, t.y);
              ctx.lineTo(t.x + tS, t.y - tS);
              ctx.lineTo(t.x + tS, t.y + tS);
              break;
            }
            case 1: {
              ctx.moveTo(t.x + tS, t.y);
              ctx.lineTo(t.x - tS, t.y - tS);
              ctx.lineTo(t.x - tS, t.y + tS);
              break;
            }
            case 2: {
              ctx.moveTo(t.x, t.y - tS);
              ctx.lineTo(t.x - tS, t.y + tS);
              ctx.lineTo(t.x + tS, t.y + tS);
              break;
            }
            case 3: {
              ctx.moveTo(t.x, t.y + tS);
              ctx.lineTo(t.x - tS, t.y - tS);
              ctx.lineTo(t.x + tS, t.y - tS);
              break;
            }
          }
          ctx.closePath();
          ctx.fill();
        }
      }
    });
  },

  fixedDec: function (float, maxPlaces) {
    if (!("" + float)?.split(".")[1].length >= maxPlaces) return;
    return float.toFixed(maxPlaces);
  },

  exportMap: function () {
    let filename = `${new Date().getTime()}-defly-map`;
    let textContent = this.generateMapFile();
    let element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(textContent)
    );
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  },

  exportMapPreview: function () {
    this.generateMapPreview();

    let canvas = document.getElementById("DME-preview-canvas");
    // Convert the canvas to data
    let image = canvas.toDataURL();
    // Create a link
    let aDownloadLink = document.createElement("a");
    // Add the name of the file to the link
    aDownloadLink.download = "map_preview.png";
    // Attach the data to the link
    aDownloadLink.href = image;
    // Get the code to click the download link
    aDownloadLink.click();
  },

  getCentreOfChunk: function (towers = this.selectedTowers) {
    let [sX, hX, sY, hY] = [Infinity, 0, Infinity, 0];
    towers.forEach((idx) => {
      let t = this.mapData.towers[idx];
      [sX, hX, sY, hY] = [
        t.x < sX ? t.x : sX,
        t.x > hX ? t.x : hX,
        t.y < sY ? t.y : sY,
        t.y > hY ? t.y : hY,
      ];
    });
    return { x: (sX + hX) / 2, y: (sY + hY) / 2 };
  },

  getOuterMostPositionsOfChunk: function (towers = this.selectedTowers) {
    let most = {
      left: Infinity,
      right: 0,
      top: Infinity,
      bottom: 0,
    };
    towers.forEach((idx) => {
      let t = this.mapData.towers[idx];
      most.left = Math.min(t.x, most.left);
      most.right = Math.max(t.x, most.right);
      most.top = Math.min(t.y, most.top);
      most.bottom = Math.max(t.y, most.bottom);
      /*if(all){
        most.left = Math.min(t.x, most.left);
        most.right = Math.max(t.x, most.right);
        most.to = Math.min(t.y, most.top);
        most.bottom = Math.max(t.y, most.bottom);
      } else most[edges] = */ //would be nice shortcut but idk..
    });
    return most;
  },

  getDistance: function (x1, y1, x2, y2) {
    return ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5;
  },

  getDistanceToLine: function (wall1x, wall1y, wall2x, wall2y, pointX, pointY) {
    const dx1 = pointX - wall1x;
    const dy1 = pointY - wall1y;
    const dx2 = pointX - wall2x;
    const dy2 = pointY - wall2y;
    const dx12 = wall2x - wall1x;
    const dy12 = wall2y - wall1y;

    // Calculate squared distances
    const dist1Sq = dx1 * dx1 + dy1 * dy1;
    const dist2Sq = dx2 * dx2 + dy2 * dy2;
    const lineLengthSq = dx12 * dx12 + dy12 * dy12;

    // Calculate squared distance from point3 to line formed by point1 and point2
    const crossProduct = dx1 * dy12 - dx12 * dy1;
    const distToLineSq = (crossProduct * crossProduct) / lineLengthSq;

    //(doesn´t have to) Check if point3 is between point1 and point2
    const dotProduct = dx1 * dx12 + dy1 * dy12;
    if (dotProduct >= 0 && dotProduct <= lineLengthSq) {
      // Calculate the distance from point3 to the line
      const distToLine = Math.sqrt(distToLineSq);
      return distToLine;
    }

    const distanceT1 = Math.sqrt(dist1Sq) + 1;
    const distanceT2 = Math.sqrt(dist2Sq) + 1;
    if (distanceT1 < distanceT2) return distanceT1;
    return distanceT2; // Point is not near the line
  },

  calculateAngle: function (pointA, pointB, pointC) {
    const angleAB = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);
    const angleBC = Math.atan2(pointC[1] - pointB[1], pointC[0] - pointB[0]);
    let angle = angleBC - angleAB - Math.PI;

    if (angle < 0) {
      angle += 4 * Math.PI;
      angle %= 2 * Math.PI;
    }
    if (angle < 0) console.log("WTF ;-;");

    return angle * (180 / Math.PI);
  },

  isIntersecting: function (a, b, c, d, p, q, r, s) {
    let det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
    }
  },

  isPointInsideNodes: function (point, nodes) {
    let areaFromNodes = [];
    nodes.forEach((node) => {
      let idx = this.getIndexFromId(node);
      let nodeTower = this.mapData.towers[idx];
      areaFromNodes.push(nodeTower);
    });
    return this.isPointInsideArea(point, areaFromNodes);
  },

  isPointInsideArea: function (point, area) {
    let intersectionCounter = 0;
    let anl = area.length;
    area.forEach((node, idx) => {
      let intersecting = this.isIntersecting(
        node.x,
        node.y,
        area[(idx + 1) % anl].x,
        area[(idx + 1) % anl].y,
        point[0],
        point[1],
        -1e9,
        -1e9
      );
      if (intersecting) intersectionCounter++;
    });
    //if the total count of interesctions between a line going from one point outside the area and one point unknown
    //with each line between two neighbour nodes of a poligon is odd, the point to determine is inside the poligon
    return intersectionCounter % 2 == 1 ? true : false;
  },

  getClosestTower: function (x, y) {
    let closestTower = {
      index: 0,
      distance: Infinity,
    };
    this.mapData.towers.forEach((tower, index) => {
      let distance = this.getDistance(tower.x, tower.y, x, y);
      if (distance < closestTower.distance) {
        closestTower.distance = distance;
        closestTower.index = index;
      }
    });
    return closestTower;
  },

  getNeighbourTowers: function (originTower) {
    //all inputs/outputs in tower ID
    let neighbours = [];
    this.mapData.walls.forEach((wall) => {
      if (wall.from.id == originTower && wall.to.id != originTower) {
        neighbours.push(wall.to.id);
      } else if (wall.to.id == originTower && wall.from.id != originTower) {
        neighbours.push(wall.from.id);
      }
    });
    return neighbours;
  },

  getIndexFromId: function (ids) {
    switch (typeof ids) {
      case "number": {
        let targetIndex = -1;
        DME.mapData.towers.forEach((tower, index) => {
          targetIndex = tower.id == ids ? index : targetIndex;
        });
        return targetIndex;
      }
      case "object": {
        let targetIndexs = [];
        DME.mapData.towers.forEach((tower, index) => {
          if (ids.includes(tower.id)) targetIndexs.push(index);
        });
        return targetIndexs;
      }
    }
  },

  getIdFromIndex: function (idxs) {
    switch (typeof idxs) {
      case "number": {
        return this.mapData.towers[idxs].id;
      }
      case "object": {
        let targetIds = [];
        let ts = this.mapData.towers;
        idxs.forEach((idx) => {
          targetIds.push(ts[idx].id);
        });
        return targetIds;
      }
    }
  },

  changeKeybind: function (key) {
    console.log(`Trying to update ${key}`);
    if (this.changeKeybind.isChanging) {
      this.changeKeybind.element.innerText =
        this.hotkeys[this.changeKeybind.binding];
      this.changeKeybind.element.style.fontSize = "16px";
    }
    this.blockInput = true;
    this.changeKeybind.isChanging = true;
    this.changeKeybind.binding = key;
    this.changeKeybind.element = document.querySelector(`#DME-ch-${key}`);
    this.changeKeybind.element.style.fontSize = "12px";
    this.changeKeybind.element.innerText = "press any key";
    this.changeKeybind.element.blur();
    onkeydown = function (event) {
      if (!DME.changeKeybind.isChanging) {
        return;
      }
      assignNewKeybind(event.key.toUpperCase());
      return;
    };
    onmousedown = function (event) {
      if (!DME.changeKeybind.isChanging) {
        return;
      }
      let mKeys = ["Left Click", "Middle Click", "Right Click"];
      let newBind = mKeys?.[event.button]
        ? mKeys[event.button]
        : `Button ${event.button}`;
      assignNewKeybind(newBind);
      return;
    };
    function assignNewKeybind(newBindValue) {
      let newBind =
        newBindValue == "ESCAPE"
          ? ""
          : DME.specialKeyInputs.hasOwnProperty(newBindValue)
          ? DME.specialKeyInputs[newBindValue]
          : newBindValue;
      DME.changeKeybind.element.innerText = newBind;
      DME.changeKeybind.element.style.fontSize = "16px";
      DME.changeKeybind.isChanging = false;
      DME.hotkeys[DME.changeKeybind.binding] = newBind;
      DME.blockInput = false;
      DME.markDoubledKeybinds();
      return;
    }
  },
  markDoubledKeybinds: function () {
    let markedKeys = [],
      nonMarkedKeys = [],
      doubledKeys = [],
      hotkeyClone = [];
    idsClone = [];
    Object.entries(DME.hotkeys).forEach((key, idx) => {
      hotkeyClone.push(key[1]);
      idsClone.push(key[0]);
    });
    let l = hotkeyClone.length;
    for (let c = 0; c < l; c++) {
      let key = hotkeyClone[0];
      let id = idsClone[0];
      hotkeyClone.shift();
      idsClone.shift();
      if (key == "") continue;
      if (hotkeyClone.includes(key) || doubledKeys.includes(key)) {
        markedKeys.push(id);
        doubledKeys.push(key);
      } else nonMarkedKeys.push(id);
    }
    markedKeys.forEach((key) => {
      document.querySelector(`#DME-ch-${key}`).style.color = "red";
    });
    nonMarkedKeys.forEach((key) => {
      document.querySelector(`#DME-ch-${key}`).style.color = "black";
    });
  },

  handleMoveInput: function (direction) {
    //HERRT
    switch (true) {
      case this.isKeyPressed.SHIFT: {
        switch (direction) {
          case "Up": {
            this.resizeChunk(0, this.snapRange, { z: true });
            break;
          }
          case "Down": {
            this.resizeChunk(0, -this.snapRange, { z: true });
            break;
          }
          case "Left": {
            this.resizeChunk(this.snapRange, 0, { z: true });
            break;
          }
          case "Right": {
            this.resizeChunk(-this.snapRange, 0, { z: true });
            break;
          }
        }
        break;
      }
      case this.isKeyPressed.MirrorMode: {
        //mirror towers
        let mirrorDir =
          direction == "Up"
            ? "top"
            : direction == "Down"
            ? "bottom"
            : direction.toLowerCase();
        console.log(`Mirror ${mirrorDir}`);
        this.mirrorChunk({ direction: mirrorDir });
        break;
      }
      case this.isKeyPressed.RotateMode: {
        //rotate towers
        let angle =
          (Number(prompt("Enter rotation angle", 90)) / 180) * Math.PI;
        if (direction == "Left") angle *= -1;
        else if (direction != "Right") return;
        console.log(`Rotate ${direction} for ${angle} degree`);
        this.isKeyPressed.RotateMode = false;
        this.rotateChunk({ angle: angle });
        break;
      }
      default: {
        this.isKeyPressed[`Move${direction}`] = true;
      }
    }
  },

  updateMouse: function (x, y) {
    this.updateMouseCoords(x, y);
    let o = this.chunckOptions;
    if (!o.active) return;
    let mc = this.mouseCoords.snapped;
    let cP = {
      distance: 0,
      index: o.hovering - 1,
    };
    if (!o.isChanging) {
      //if selected but havent started changing yet
      cP.distance = Infinity;
      let sp = [];
      for (let h = 0; h <= 1; h += 0.5) {
        for (let w = 0; w <= 1; w += 0.5) {
          sp.push([o.rx + o.rw * w, o.ry + o.rh * h]);
        }
      } //get all edge points for the resize

      sp.splice(4, 1);
      sp.forEach((pos, index) => {
        let d = this.getDistance(mc.x, mc.y, pos[0], pos[1]);
        if (d < cP.distance) {
          cP.distance = d;
          cP.index = index;
        }
      });
    } else this.resizeChunkByDrag(1); //call function to take in mouse movement
    let cS = ""; //cursor style
    switch (
      cP.index //index: determining which case of resizing
    ) {
      case 0:
      case 7: {
        //top-left/bottom-right
        cS = "nwse-resize";
        break;
      }
      case 1:
      case 6: {
        //top-middle/bottom-middle
        cS = "ns-resize";
        break;
      }
      case 2:
      case 5: {
        //top-right/bottom-left
        cS = "nesw-resize";
        break;
      }
      case 3:
      case 4: {
        //middle-left/middle-right
        cS = "ew-resize";
        break;
      }
    }
    o.hovering = cP.index + 1;
    if (cP.distance > o.rsr) {
      //check if cursor is on sides (dragging)
      let [x, y] = [mc.x, mc.y];
      let [a, b, c, d] = [
        this.getDistanceToLine(o.rx, o.ry, o.rx + o.rw, o.ry, x, y),
        this.getDistanceToLine(o.rx, o.ry, o.rx, o.ry + o.rh, x, y),
        this.getDistanceToLine(
          o.rx + o.rw,
          o.ry + o.rh,
          o.rx + o.rw,
          o.ry,
          x,
          y
        ),
        this.getDistanceToLine(
          o.rx + o.rw,
          o.ry + o.rh,
          o.rx,
          o.ry + o.rh,
          x,
          y
        ),
      ];
      let dist =
        (a < b ? a : b) < (c < d ? c : d) ? (a < b ? a : b) : c < d ? c : d;
      if (dist > o.rsw) {
        cS = "crosshair";
        o.hovering = 0;
      } else {
        cS = "move";
        o.hovering = 9;
      }
    }
    canvas.style.cursor = cS;
  },

  updateMouseCoords: function (x, y) {
    let mc = this.mouseCoords;
    //if update is called without x,y coords - only update realtive coords without crashing
    mc.real = x && y ? { x: x, y: y } : mc.real;
    mc.relative = {
      x: this.focusPoint.x + (mc.real.x - this.focusOffset.x) * this.mapZoom,
      y: this.focusPoint.y + (mc.real.y - this.focusOffset.y) * this.mapZoom,
    };
    if (this.snapping) {
      let xOffset = mc.relative.x + 0.5 * this.snapRange;
      let yOffset = mc.relative.y + 0.5 * this.snapRange;
      mc.snapped.x = xOffset - (xOffset % this.snapRange);
      mc.snapped.y = yOffset - (yOffset % this.snapRange);
    } else mc.snapped = structuredClone(mc.relative);
    //hold snapped position inside map bounds
    switch (this.mapData.shape) {
      case 0: {
        //rectangle
        mc.snapped.x =
          mc.snapped.x < 0
            ? 0
            : mc.snapped.x > this.mapData.width
            ? this.mapData.width
            : mc.snapped.x;
        mc.snapped.y =
          mc.snapped.y < 0
            ? 0
            : mc.snapped.y > this.mapData.height
            ? this.mapData.height
            : mc.snapped.y;
        break;
      }
      case 1: {
        //hexagon
        let cX = this.mapData.width / 2,
          cY = this.mapData.height / 2,
          mX = mc.snapped.x,
          mY = mc.snapped.y;
        bounds = this.mapData.bounds;
        //radious = cX
        for (c = 0; c < 6; c++) {
          //check whether position is outside hex map bounds
          if (
            this.isIntersecting(
              mX,
              mY,
              cX,
              cY,
              bounds[c * 2],
              bounds[1 + c * 2],
              bounds[(2 + c * 2) % 12],
              bounds[(3 + c * 2) % 12]
            )
          ) {
            let [sin, cos] = [
                Math.sin((Math.PI / 3) * c),
                Math.cos((Math.PI / 3) * c),
              ],
              [x, y] = [mX - cX, mY - cY];
            let xC = x * cos - y * sin + 0.5 * cX,
              fraction = (xC > cX ? cX : xC < 0 ? 0 : xC) / cX,
              deltaX = bounds[(2 + c * 2) % 12] - bounds[c * 2],
              deltaY = bounds[(3 + c * 2) % 12] - bounds[1 + c * 2];
            mc.snapped.x = bounds[c * 2] + deltaX * fraction;
            mc.snapped.y = bounds[1 + c * 2] + deltaY * fraction;
            break;
          }
        }
        break;
      }
      case 2: {
        //circle
        let radious = this.mapData.width / 2,
          xDif = mc.snapped.x - radious,
          yDif = mc.snapped.y - radious,
          e = (xDif ** 2 + yDif ** 2) ** 0.5 / radious;
        if (e > 1) {
          mc.snapped.x = radious + xDif / e;
          mc.snapped.y = radious + yDif / e;
        }
        break;
      }
    }
    document.querySelector("#DME-coords-info-x").innerText = (
      mc.snapped.x / defly.UNIT_WIDTH
    ).toRounded(2);
    document.querySelector("#DME-coords-info-y").innerText = (
      mc.snapped.y / defly.UNIT_WIDTH
    ).toRounded(2);
  },

  updateFocusPoint: function () {
    let kc = this.isKeyPressed;
    let mX = kc.MoveLeft ? -1 : 0;
    mX += kc.MoveRight ? 1 : 0;
    let mY = kc.MoveUp ? -1 : 0;
    mY += kc.MoveDown ? 1 : 0;
    let speedModif =
      mX != 0 || mY != 0
        ? (1 / (mX ** 2 + mY ** 2) ** 0.5) * this.scrollingSpeed * this.mapZoom
        : 0;
    mX *= speedModif;
    mY *= speedModif;
    this.focusPoint.x += mX;
    this.focusPoint.y += mY;
    if (speedModif) {
      this.updateMouseCoords();
      this.updateChunkOptions();
    }
  },

  updateMapZoom: function (zoom) {
    //zoom value realtive to mouse sensitivity
    let v = zoom / 1250;
    DME.mapZoom *= v > 0 ? 1.02 + v : 1 / (1.02 - v);

    //update focus point relative to mouse coords
    let fpDelta = {
      x:
        this.mouseCoords.relative.x -
        (this.focusPoint.x +
          (this.mouseCoords.real.x - this.focusOffset.x) * this.mapZoom),
      y:
        this.mouseCoords.relative.y -
        (this.focusPoint.y +
          (this.mouseCoords.real.y - this.focusOffset.y) * this.mapZoom),
    };
    this.focusPoint.x += fpDelta.x;
    this.focusPoint.y += fpDelta.y;
    this.updateChunkOptions();
  },

  //will be called once upon starting chunck resize
  updateChunkOptions: function () {
    //since this is called anytime tower selection is changing, we can call update tower info here as well
    this.updateTowerInfo();

    if (this.selectedTowers.length > 1) {
      let mz = this.mapZoom;
      let top = Infinity;
      let left = Infinity;
      let bottom = 0;
      let right = 0;
      this.selectedTowers.forEach((tower) => {
        let t = this.mapData.towers[tower];
        left = left > t.x ? t.x : left;
        top = top > t.y ? t.y : top;
        right = right < t.x ? t.x : right;
        bottom = bottom < t.y ? t.y : bottom;
      });
      let vx = this.relToFsPt.x(left); // - 10 - 15 / mz;
      let vy = this.relToFsPt.y(top); // - 10 - 15 / mz;
      let vw = (right - left) / mz; // + 20 + 30 / mz;
      let vh = (bottom - top) / mz; // + 20 + 30 / mz;

      //object containing data about chunk options - has to be updated uppon map move/zoom since contains render position data
      let cO = this.chunckOptions;
      cO.active = true;
      cO.hovering = 0;
      cO.rx = left; //real left x posittion
      cO.ry = top; //... y posittion
      cO.rw = right - left; //... width
      cO.rh = bottom - top; //... height
      cO.rsr = 12 * mz + 12; //... selective radious around key points
      cO.rsw = 10 * mz + 10; //... selective width of outline
      cO.vx = vx; //visual left x position
      cO.vy = vy; //... y position
      cO.vw = vw; //... width
      cO.vh = vh; //... height
      cO.vsr = 8 + 8 / mz; //... selective radious around key points
      cO.vsw = 6 + 6 / mz; //... selective width of the outlines
    } else this.chunckOptions.active = false;
    this.updateChunkSizeDisplay();
  },
  //updates the displayed chunck dimensions
  updateChunkSizeDisplay: function (xDelta, yDelta) {
    if (this.selectedTowers.length <= 1) {
      document.querySelector("#DME-resize-values").style.display = "none";
      this.chunckOptions.hovering = 0;
      this.chunckOptions.active = false;
      return;
    }
    let newl = xDelta === undefined && yDelta === undefined;
    let cO = this.chunckOptions;
    /*xDelta = xDelta ? xDelta : cO.rw;
    yDelta = yDelta ? yDelta : cO.rh;*/
    if (!newl && cO.hovering == 9) newl = true;
    document.querySelector("#DME-resize-values").style.display = "inline";
    let xSel = document.querySelector("#DME-resize-values-x");
    xSel.style.left = `${cO.vx + cO.vw / 2 - 58}px`;
    xSel.style.top = `${cO.vy + cO.vh + 20}px`;
    let xSels = xSel.querySelectorAll("input");
    xSels[0].value = newl ? 100 : ((cO.rw + xDelta) / cO.rw) * 100;
    xSels[1].value = newl
      ? cO.rw / defly.UNIT_WIDTH
      : (cO.rw + xDelta) / defly.UNIT_WIDTH;
    let ySel = document.querySelector("#DME-resize-values-y");
    ySel.style.left = `${cO.vx + cO.vw + 20}px`;
    ySel.style.top = `${cO.vy + cO.vh / 2 - 22}px`;
    let ySels = ySel.querySelectorAll("input");
    ySels[0].value = newl ? 100 : ((cO.rh + yDelta) / cO.rh) * 100;
    ySels[1].value = newl
      ? cO.rh / defly.UNIT_WIDTH
      : (cO.rh + yDelta) / defly.UNIT_WIDTH;
  },

  updateTowerInfo: function () {
    let parent = document.querySelector("#DME-towers-info");
    if (this.selectedTowers.length < 1) {
      parent.style.display = "none";
    } else {
      parent.style.display = "inline";
      document.querySelector("#DME-towers-info-counter-value").innerText =
        this.selectedTowers.length;

      /*if (selectedTowers.length == 1) {
        document.getElementById("tower-info-pathCalculation").style.display =
          "inline";
      } else {
        document.getElementById("tower-info-pathCalculation").style.display =
          "none";
      }*/

      let color = this.mapData.towers[this.selectedTowers[0]].color;
      let commonColor = true;
      this.selectedTowers.forEach((ar) => {
        commonColor = this.mapData.towers[ar].color == color && commonColor;
      });

      let colorInput = document.querySelector("#DME-towers-info-color-input"),
        colorDropdown = document.querySelector(
          "#DME-towers-info-color-dropdown"
        );
      if (commonColor) {
        colorInput.value = color;
        colorInput.style.backgroundColor = defly.colors.faded[color];
        colorDropdown.value = color;
      } else {
        colorInput.value = "";
        colorInput.style.backgroundColor = "white";
        colorDropdown.value = "-";
      }
      if (this.selectedTowers.length == 1) {
        let positionX = document.querySelector("#DME-towers-info-position-x"),
          positionY = document.querySelector("#DME-towers-info-position-y"),
          t = this.mapData.towers[this.selectedTowers[0]];
        positionX.value = (t.x / defly.UNIT_WIDTH).toRounded(4);
        positionX.old_value = (t.x / defly.UNIT_WIDTH).toRounded(4);
        positionY.value = (t.y / defly.UNIT_WIDTH).toRounded(4);
        positionY.old_value = (t.y / defly.UNIT_WIDTH).toRounded(4);
        document.querySelector("#DME-towers-info-position").style.display =
          "block";
        document.querySelector("#DME-towers-info-position-1").style.display =
          "none";
        document.querySelector("#DME-towers-info-position-2").style.display =
          "none";
      } else {
        let positionX1 = document.querySelector(
            "#DME-towers-info-position-1-x"
          ),
          positionY1 = document.querySelector("#DME-towers-info-position-1-y"),
          positionX2 = document.querySelector("#DME-towers-info-position-2-x"),
          positionY2 = document.querySelector("#DME-towers-info-position-2-y");
        document.querySelector("#DME-towers-info-position").style.display =
          "none";
        document.querySelector("#DME-towers-info-position-1").style.display =
          "block";
        document.querySelector("#DME-towers-info-position-2").style.display =
          "block";
        let outermostPositions = this.getOuterMostPositionsOfChunk(),
          uW = defly.UNIT_WIDTH;
        positionX1.value = (outermostPositions.left / uW).toRounded(4);
        positionX1.old_value = (outermostPositions.left / uW).toRounded(4);
        positionY1.value = (outermostPositions.top / uW).toRounded(4);
        positionY1.old_value = (outermostPositions.top / uW).toRounded(4);
        positionX2.value = (outermostPositions.right / uW).toRounded(4);
        positionX2.old_value = (outermostPositions.right / uW).toRounded(4);
        positionY2.value = (outermostPositions.bottom / uW).toRounded(4);
        positionY2.old_value = (outermostPositions.bottom / uW).toRounded(4);
      }
    }
  },

  relToFsPt: {
    x: (ogX) =>
      ((ogX - DME.focusPoint.x) / DME.mapZoom + DME.focusOffset.x) *
      DME.visuals.quality,
    y: (ogY) =>
      ((ogY - DME.focusPoint.y) / DME.mapZoom + DME.focusOffset.y) *
      DME.visuals.quality,
    /*x : (ogX) => ogX + DME.focusOffset.x * DME.mapZoom - DME.focusPoint.x,
    y : (ogY) => ogY + DME.focusOffset.y * DME.mapZoom - DME.focusPoint.y,*/
  },

  draw: function () {
    //clear canvas
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = this.visuals.map_BGC;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let mz = this.mapZoom,
      q = this.visuals.quality;

    //draw map background
    ctx.fillStyle = this.visuals.grid_BGC;
    ctx.fillRect(
      this.relToFsPt.x(0),
      this.relToFsPt.y(0),
      (this.mapData.width / mz) * q,
      (this.mapData.height / mz) * q
    );
    if (this.visuals.showBackgroundImage && this.visuals.backgroundImage.src) {
      if (this.visuals.keepBackgroundImageRatio) {
        let img = this.visuals.backgroundImage,
          imgWidthRatio = img.width / img.height,
          mapWidthRatio = this.mapData.width / this.mapData.height;
        let scale =
          imgWidthRatio > mapWidthRatio
            ? img.width / this.mapData.width
            : img.height / this.mapData.height;
        ctx.drawImage(
          this.visuals.backgroundImage,
          this.relToFsPt.x((this.mapData.width - img.width / scale) / 2),
          this.relToFsPt.y((this.mapData.height - img.height / scale) / 2),
          (img.width / mz / scale) * q,
          (img.height / mz / scale) * q
        );
      } else {
        ctx.drawImage(
          this.visuals.backgroundImage,
          this.relToFsPt.x(0),
          this.relToFsPt.y(0),
          (this.mapData.width / mz) * q,
          (this.mapData.height / mz) * q
        );
      }
    }
    ctx.strokeStyle = this.visuals.grid_lineC;
    if (Number(this.visuals.grid_line_width)) {
      ctx.lineWidth = (this.visuals.grid_line_width / mz) * q;
      ctx.beginPath();
      let w = this.mapData.width;
      let h = this.mapData.height;
      for (c = defly.GRID_WIDTH; c < w; c += defly.GRID_WIDTH) {
        ctx.moveTo(this.relToFsPt.x(c), this.relToFsPt.y(0));
        ctx.lineTo(this.relToFsPt.x(c), this.relToFsPt.y(h));
      }
      for (c = defly.GRID_WIDTH; c < h; c += defly.GRID_WIDTH) {
        ctx.moveTo(this.relToFsPt.x(0), this.relToFsPt.y(c));
        ctx.lineTo(this.relToFsPt.x(w), this.relToFsPt.y(c));
      }
      ctx.stroke();
    }
    ctx.lineWidth = (1 + 1 / mz) * q;
    switch (this.mapData.shape) {
      case 0: {
        //rectangle
        ctx.strokeRect(
          this.relToFsPt.x(0),
          this.relToFsPt.y(0),
          (this.mapData.width / mz) * q,
          (this.mapData.height / mz) * q
        );
        break;
      }
      case 1: {
        //hexagon
        ctx.beginPath();
        let w = this.mapData.width,
          h = this.mapData.height;
        ctx.moveTo(this.relToFsPt.x(w / 4), this.relToFsPt.y(0));
        ctx.lineTo(this.relToFsPt.x((w * 3) / 4), this.relToFsPt.y(0));
        ctx.lineTo(this.relToFsPt.x(w), this.relToFsPt.y(h / 2));
        ctx.lineTo(this.relToFsPt.x((w * 3) / 4), this.relToFsPt.y(h));
        ctx.lineTo(this.relToFsPt.x(w / 4), this.relToFsPt.y(h));
        ctx.lineTo(this.relToFsPt.x(0), this.relToFsPt.y(h / 2));
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 2: {
        //circle
        let w = this.mapData.width,
          h = this.mapData.height;
        ctx.beginPath();
        ctx.arc(
          this.relToFsPt.x(w / 2),
          this.relToFsPt.y(h / 2),
          (w / 2 / mz) * q,
          2 * Math.PI,
          false
        );
        ctx.stroke();
        break;
      }
    }
    if (this.visuals.showMapHalves) {
      ctx.strokeStyle = "#A0A0FF";
      ctx.lineWidth = (1 + 0.5 / mz) * q;
      ctx.beginPath();
      ctx.moveTo(
        this.relToFsPt.x(-50),
        this.relToFsPt.y(this.mapData.height / 2)
      );
      ctx.lineTo(
        this.relToFsPt.x(this.mapData.width + 50),
        this.relToFsPt.y(this.mapData.height / 2)
      );
      ctx.moveTo(
        this.relToFsPt.x(this.mapData.width / 2),
        this.relToFsPt.y(-50)
      );
      ctx.lineTo(
        this.relToFsPt.x(this.mapData.width / 2),
        this.relToFsPt.y(this.mapData.height + 50)
      );
      ctx.stroke();
    }

    let mc = this.mouseCoords.snapped;
    let [mcX, mcY] = [this.relToFsPt.x(mc.x), this.relToFsPt.y(mc.y)];

    let wallWidth = defly.WALL_WIDTH / mz;
    let towerWidth = defly.TOWER_WIDTH / mz;

    //draw koth bounds
    if (this.mapData.koth.length && this.visuals.showKothBounds) {
      let koth = this.mapData.koth;
      ctx.fillStyle = "rgba(212,175,55,.5)";
      let w = (koth[2] ? koth[2] : mc.x) - koth[0],
        h = (koth[3] ? koth[3] : mc.y) - koth[1];
      ctx.fillRect(
        this.relToFsPt.x(koth[0]),
        this.relToFsPt.y(koth[1]),
        (w / mz) * q,
        (h / mz) * q
      );
      if (this.editMode == "KOTH") {
        let x = koth[4] ? mc.x : koth[0],
          y = koth[4] ? mc.y : koth[1],
          w = (koth[4] ? koth[2] : mc.x) - x,
          h = (koth[4] ? koth[3] : mc.y) - y;
        ctx.strokeStyle = "rgba(148,122,38,.5)";
        ctx.strokeRect(
          this.relToFsPt.x(x),
          this.relToFsPt.y(y),
          (w / mz) * q,
          (h / mz) * q
        );
      }
    }

    //draw areas
    DME.mapData.areas.forEach((area) => {
      ctx.fillStyle = defly.colors.faded[area.color];
      ctx.beginPath();
      ctx.moveTo(
        this.relToFsPt.x(area.nodes[0].x),
        this.relToFsPt.y(area.nodes[0].y)
      );
      area.nodes.forEach((node) => {
        ctx.lineTo(this.relToFsPt.x(node.x), this.relToFsPt.y(node.y));
      });
      ctx.fill();
    });

    //draw walls
    DME.mapData.walls.forEach((wall) => {
      ctx.lineWidth = wallWidth * q;
      ctx.strokeStyle = defly.colors.darkened[wall.color];
      ctx.beginPath();
      ctx.moveTo(this.relToFsPt.x(wall.from.x), this.relToFsPt.y(wall.from.y));
      ctx.lineTo(this.relToFsPt.x(wall.to.x), this.relToFsPt.y(wall.to.y));
      ctx.stroke();
      //draw wall twice, once bit darker to create the darkened edge of the wall
      ctx.strokeStyle = defly.colors.standard[wall.color];
      ctx.lineWidth = (wallWidth - 4 / mz) * q;
      ctx.beginPath();
      ctx.moveTo(this.relToFsPt.x(wall.from.x), this.relToFsPt.y(wall.from.y));
      ctx.lineTo(this.relToFsPt.x(wall.to.x), this.relToFsPt.y(wall.to.y));
      ctx.stroke();
    });
    //draw wall previews
    if (!this.selectingChunk.isSelecting) {
      let gA = ctx.globalAlpha;
      ctx.globalAlpha = 0.5;
      let t = this.mapData.towers;
      this.selectedTowers.forEach((index) => {
        let tower = t[index];
        if (!tower?.isNotTower) {
          ctx.strokeStyle = defly.colors.standard[tower.color];
          ctx.lineWidth = (wallWidth - 4 / mz) * q;
          ctx.beginPath();
          ctx.moveTo(this.relToFsPt.x(tower.x), this.relToFsPt.y(tower.y));
          ctx.lineTo(mcX, mcY);
          ctx.stroke();
          let borderLines = calculateParallelLines(
            [mcX, mcY],
            [this.relToFsPt.x(tower.x), this.relToFsPt.y(tower.y)],
            (wallWidth / 2 - 1 / mz) * q
          );
          ctx.strokeStyle = defly.colors.darkened[tower.color];
          ctx.lineWidth = (2 / mz) * q;
          ctx.beginPath();
          ctx.moveTo(borderLines.line1[0][0], borderLines.line1[0][1]);
          ctx.lineTo(borderLines.line1[1][0], borderLines.line1[1][1]);
          ctx.moveTo(borderLines.line2[0][0], borderLines.line2[0][1]);
          ctx.lineTo(borderLines.line2[1][0], borderLines.line2[1][1]);
          ctx.stroke();
        }
      });
      ctx.globalAlpha = gA;
    }

    //draw towers
    DME.mapData.towers.forEach((tower, index) => {
      let t = {
        x: this.relToFsPt.x(tower.x),
        y: this.relToFsPt.y(tower.y),
      };
      if (!tower?.isNotTower) {
        if (this.selectedTowers.includes(index)) {
          ctx.fillStyle = "rgba(230, 50, 50, 0.6)";
          ctx.beginPath();
          ctx.arc(t.x, t.y, (towerWidth + 10) * q, 2 * Math.PI, false);
          ctx.fill();
        }
        let colorId = tower?.isKothTower ? false : tower.color;
        ctx.fillStyle = colorId
          ? defly.colors.darkened[colorId]
          : "rgb(70, 52, 14)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, towerWidth * q, 2 * Math.PI, false);
        ctx.fill();
        //draw tower twice, once bit darker to create the darkened edge of the tower, just like wall
        ctx.fillStyle = colorId
          ? defly.colors.standard[colorId]
          : "rgb(195,143,39)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, (towerWidth - 2 / mz) * q, 2 * Math.PI, false);
        ctx.fill();

        //if tower is shielded, draw shield
        if (tower?.isShielded && this.visuals.showTowerShields) {
          ctx.shadowColor = "black";
          ctx.strokeStyle = defly.colors.faded[1];
          ctx.lineWidth = (2 / mz) * q;
          ctx.shadowBlur = (3 / mz) * q;
          ctx.beginPath();
          ctx.arc(t.x, t.y, (towerWidth + 2 / mz) * q, 2 * Math.PI, false);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        if (!colorId) {
          if (this.visuals.useDeflyImages) {
            let w = (defly.TOWER_WIDTH / mz) * q;
            ctx.drawImage(
              defly.images.koth_crown,
              t.x - w,
              t.y - w,
              w * 2,
              w * 2
            );
          } else {
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.moveTo(t.x - 6.5 / mz, t.y + 6.5 / mz);
            ctx.lineTo(t.x + 6.5 / mz, t.y + 6.5 / mz);
            ctx.lineTo(t.x + 9.5 / mz, t.y - 1.5 / mz);
            ctx.lineTo(t.x + 9 / mz, t.y - 2 / mz);
            ctx.lineTo(t.x + 6 / mz, t.y - 0.5 / mz);
            ctx.lineTo(t.x + 5.2 / mz, t.y - 3.6 / mz);
            ctx.lineTo(t.x + 4.3 / mz, t.y - 3.6 / mz);
            ctx.lineTo(t.x + 2.2 / mz, t.y - 1.8 / mz);
            ctx.lineTo(t.x + 0.3 / mz, t.y - 6.2 / mz);
            ctx.lineTo(t.x - 0.3 / mz, t.y - 6.2 / mz);
            ctx.lineTo(t.x - 2.2 / mz, t.y - 1.8 / mz);
            ctx.lineTo(t.x - 4.3 / mz, t.y - 3.6 / mz);
            ctx.lineTo(t.x - 5.2 / mz, t.y - 3.6 / mz);
            ctx.lineTo(t.x - 6 / mz, t.y - 0.5 / mz);
            ctx.lineTo(t.x - 9 / mz, t.y - 2 / mz);
            ctx.lineTo(t.x - 9.5 / mz, t.y - 1.5 / mz);
            ctx.lineTo(t.x - 6.5 / mz, t.y + 6.5 / mz);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(t.x + 9.3 / mz, t.y - 2 / mz, 1 / mz, 0, 2 * Math.PI);
            ctx.moveTo(t.x + 4.9 / mz, t.y - 4 / mz);
            ctx.arc(t.x + 4.9 / mz, t.y - 4 / mz, 1 / mz, 0, 2 * Math.PI);
            ctx.moveTo(t.x, t.y - 6.5 / mz);
            ctx.arc(t.x, t.y - 6.5 / mz, 1 / mz, 0, 2 * Math.PI);
            ctx.moveTo(t.x - 4.9 / mz, t.y - 4 / mz);
            ctx.arc(t.x - 4.9 / mz, t.y - 4 / mz, 1 / mz, 0, 2 * Math.PI);
            ctx.moveTo(t.x - 9.3 / mz, t.y - 2 / mz);
            ctx.arc(t.x - 9.3 / mz, t.y - 2 / mz, 1 / mz, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      } else {
        //not a tower: either spawn or bomb
        let bombRadius = ((6 * defly.UNIT_WIDTH) / mz) * q,
          sS = ((4.5 * defly.UNIT_WIDTH) / mz) * q,
          tS = (defly.TOWER_WIDTH / mz) * q;

        if (tower.id > -3) {
          //bomb spot
          if (this.visuals.useDeflyImages) {
            let img = defly.images.bombB;
            if (tower.id == -1) img = defly.images.bombA;
            ctx.drawImage(
              img,
              t.x - bombRadius,
              t.y - bombRadius,
              2 * bombRadius,
              2 * bombRadius
            );
          } else {
            ctx.strokeStyle = "rgba(62,94,255,.5)";
            ctx.lineWidth = 5.8 / mz * q;
            ctx.beginPath();
            ctx.arc(t.x, t.y, bombRadius - 2.9 / mz * q, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = "rgba(62,94,255,.5)";
            ctx.font = `bold ${150 / mz * q}px Verdana`;
            ctx.fillText(
              tower.id == -1 ? "A" : "B",
              t.x - 58 / mz * q,
              t.y + 54 / mz * q
            );
          }
        } else {
          //spawn
          let col = tower.id == -3 ? 3 : 2;
          ctx.fillStyle = defly.colors.faded[col];
          ctx.fillRect(t.x - sS, t.y - sS, 2 * sS, 2 * sS);
          //triangle, based on spawn rotation
          ctx.fillStyle = defly.colors.standard[col];
          ctx.beginPath();
          switch (tower.rotation) {
            case 0: {
              ctx.moveTo(t.x - tS, t.y);
              ctx.lineTo(t.x + tS, t.y - tS);
              ctx.lineTo(t.x + tS, t.y + tS);
              break;
            }
            case 1: {
              ctx.moveTo(t.x + tS, t.y);
              ctx.lineTo(t.x - tS, t.y - tS);
              ctx.lineTo(t.x - tS, t.y + tS);
              break;
            }
            case 2: {
              ctx.moveTo(t.x, t.y - tS);
              ctx.lineTo(t.x - tS, t.y + tS);
              ctx.lineTo(t.x + tS, t.y + tS);
              break;
            }
            case 3: {
              ctx.moveTo(t.x, t.y + tS);
              ctx.lineTo(t.x - tS, t.y - tS);
              ctx.lineTo(t.x + tS, t.y - tS);
              break;
            }
          }
          ctx.closePath();
          ctx.fill();
          //l, r, o, u
        }

        if (this.selectedTowers.includes(index)) {
          ctx.strokeStyle = "rgba(230, 50, 50, 0.6)";
          ctx.lineWidth = 6 * q;
          ctx.beginPath();
          ctx.arc(t.x, t.y, bombRadius + 3 * q, 2 * Math.PI, false);
          ctx.stroke();
        }
      }
    });
    //draw tower preview
    if (!this.selectingChunk.isSelecting) {
      let gA = ctx.globalAlpha;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = defly.colors.standard[this.selectedColor];
      ctx.beginPath();
      ctx.arc(mcX, mcY, towerWidth * q, 2 * Math.PI, false);
      ctx.fill();
      //draw tower twice, once bit darker to create the darkened edge of the tower, just like wall
      ctx.lineWidth = (2 / mz) * q;
      ctx.strokeStyle = defly.colors.standard[this.selectedColor];
      ctx.beginPath();
      ctx.arc(mcX, mcY, (towerWidth - 1 / mz) * q, 2 * Math.PI, false);
      ctx.stroke();
      ctx.globalAlpha = gA;
    }

    if (this.chunckOptions.active) {
      let d = this.chunckOptions;

      ctx.strokeStyle = "rgba(170, 90, 30, 0.8)";
      ctx.lineDashOffset = 4;
      ctx.lineWidth = d.vsw * q;
      ctx.strokeRect(d.vx, d.vy, d.vw, d.vh);

      ctx.lineDashOffset = 0;
      ctx.lineWidth = (d.vsw / 2) * q;
      let [o, s] = [d.vsr, 2 * d.vsr];
      ctx.strokeRect(d.vx - o, d.vy - o, s, s);
      ctx.strokeRect(d.vx - o + d.vw / 2, d.vy - o, s, s);
      ctx.strokeRect(d.vx - o + d.vw, d.vy - o, s, s);
      ctx.strokeRect(d.vx - o, d.vy - o + d.vh / 2, s, s);
      ctx.strokeRect(d.vx - o + d.vw, d.vy - o + d.vh / 2, s, s);
      ctx.strokeRect(d.vx - o, d.vy - o + d.vh, s, s);
      ctx.strokeRect(d.vx - o + d.vw / 2, d.vy - o + d.vh, s, s);
      ctx.strokeRect(d.vx - o + d.vw, d.vy - o + d.vh, s, s);
    }

    if (this.selectingChunk.isSelecting) {
      ctx.strokeStyle = "rgba(230, 130, 40, 0.8)";
      ctx.lineWidth = 5 * q;
      ctx.fillStyle = "rgba(230, 130, 40, 0.4)";
      let s = this.selectingChunk.origin;
      let w = ((this.mouseCoords.relative.x - s.x) / mz) * q;
      let h = ((this.mouseCoords.relative.y - s.y) / mz) * q;
      ctx.fillRect(this.relToFsPt.x(s.x), this.relToFsPt.y(s.y), w, h);
      ctx.strokeRect(this.relToFsPt.x(s.x), this.relToFsPt.y(s.y), w, h);
    }
  },

  toggleMenu: function (menu) {
    switch (menu) {
      case "hotkeys": {
        let m = document.querySelector("#DME-hotkey-menu"),
          wasOpen = m.style.display == "flex";
        if (!wasOpen && this.openSubMenu != "hotkeys") {
          this.toggleMenu(this.openSubMenu);
          this.openSubMenu = "hotkeys";
        } else this.openSubMenu = wasOpen ? "" : "hotkeys";
        m.style.display = wasOpen ? "none" : "flex";
        if (this.changeKeybind.isChanging) {
          this.changeKeybind.element.innerText =
            this.hotkeys[this.changeKeybind.binding];
          this.changeKeybind.element.style.fontSize = "16px";
          this.changeKeybind.isChanging = false;
        }
        break;
      }
      case "visuals": {
        let m = document.querySelector("#DME-visuals-menu"),
          wasOpen = m.style.display == "flex";
        if (!wasOpen && this.openSubMenu != "visuals") {
          this.toggleMenu(this.openSubMenu);
          this.openSubMenu = "visuals";
        } else this.openSubMenu = wasOpen ? "" : "visuals";
        m.style.display = wasOpen ? "none" : "flex";
        break;
      }
      case "none": {
        let identifier = ["visuals-menu", "hotkey-menu", "menu"];
        identifier.forEach((id) => {
          document.querySelector(`#DME-${id}`).style.display = "none";
        });
        document.querySelector("#DME-show-menu").style.display = "inline";
        break;
      }
      default: {
        console.log("unknown menu toggle");
        break;
      }
    }
  },

  resetKeybinds: function () {
    this.hotkeys = structuredClone(this.defaultHotkeys);
    Object.entries(this.hotkeys).forEach((entrie) => {
      let t = document.querySelector(`#DME-ch-${entrie[0]}`);
      if (t != undefined) {
        console.log("Element exists!!");
        t.innerText = entrie[1];
      }
    });
  },

  resetVisualSettings: function () {
    let visualPreset = structuredClone(this.visuals.custom_preset),
      quality = this.visuals.quality;
    this.visuals = JSON.parse(JSON.stringify(this.defaultVisuals));
    this.visuals.backgroundImage = new Image();
    this.visuals.custom_preset = visualPreset;
    this.visuals.quality = quality;
    let checkboxIds = [
      "showMapHalves",
      "showKothBounds",
      "showTowerShields",
      "showBackgroundImage",
      "keepBackgroundImageRatio",
    ];
    checkboxIds.forEach((id) => {
      document.querySelector(`#DME-toggle-visuals-${id}`).checked =
        this.visuals[id];
    });
    let inputIds = ["grid_BGC", "grid_lineC", "map_BGC", "grid_line_width"];
    inputIds.forEach((id) => {
      document.querySelector(`#DME-edit-visuals-${id}`).value =
        this.visuals[id];
    });
    document.querySelector("#DME-edit-visuals-C-preset").value = "light";
    this.changeQuality(1);
  },

  handleFileDrop: function (ev) {
    let input = ev.dataTransfer.files[0];
    switch (input?.type.split("/")[0]) {
      case "text": {
        let reader = new FileReader();
        reader.onload = function (e) {
          DME.loadMap(e.target.result);
        };
        reader.readAsText(input);
        break;
      }
      case "image": {
        this.loadBackgroundImage(ev.dataTransfer);
        break;
      }
      default:{
        console.log('Unknown file type: File ignored');
        return;
      }
    }
  },

  loadBackgroundImage: function (input, forcedAccept) {
    if ((input.files && input.files[0]) || forcedAccept) {
      let reader = new FileReader();

      reader.onload = function (e) {
        DME.visuals.backgroundImage.src = e.target.result;
        let t = document.querySelector("#DME-menu-load-background-image");
        t.classList.remove("fatButton");
        t.classList.add("fatButtonRight");
        document
          .querySelector("#DME-menu-remove-background-image")
          .classList.remove("hidden");
      };

      reader.readAsDataURL(input.files[0]);
    }
  },

  removeBackgroundImage: function () {
    DME.visuals.backgroundImage = new Image();
    let t = document.querySelector("#DME-menu-load-background-image");
    t.classList.remove("fatButtonRight");
    t.classList.add("fatButton");
    document
      .querySelector("#DME-menu-remove-background-image")
      .classList.add("hidden");
  },

  saveColorPreset: function () {
    console.log("saving preset...");
    let preset = this.visuals.custom_preset,
      colors = document.querySelectorAll(
        "#DME-visuals-menu input[type='color']"
      );
    preset.hasBeenSet = true;
    preset.grid_BGC = colors[0].value;
    preset.grid_lineC = colors[1].value;
    preset.map_BGC = colors[2].value;
    document
      .querySelectorAll("#DME-edit-visuals-C-preset option")[3]
      .removeAttribute("disabled");
  },

  applyColorPreset: function (preset) {
    switch (preset) {
      case "light": {
        this.visuals.grid_BGC = "#eeeeee";
        this.visuals.map_BGC = "#e0e0e0";
        this.visuals.grid_lineC = "#999999";
        break;
      }
      case "medium": {
        this.visuals.grid_BGC = "#888888";
        this.visuals.map_BGC = "#808080";
        this.visuals.grid_lineC = "#505050";
        break;
      }
      case "dark": {
        this.visuals.grid_BGC = "#000000";
        this.visuals.map_BGC = "#010101";
        this.visuals.grid_lineC = "#e4e4e4";
        break;
      }
      case "custom": {
        this.visuals.grid_BGC = this.visuals.custom_preset.grid_BGC;
        this.visuals.map_BGC = this.visuals.custom_preset.map_BGC;
        this.visuals.grid_lineC = this.visuals.custom_preset.grid_lineC;
        break;
      }
    }
    document.querySelector("#DME-edit-visuals-grid_BGC").value =
      this.visuals.grid_BGC;
    document.querySelector("#DME-edit-visuals-map_BGC").value =
      this.visuals.map_BGC;
    document.querySelector("#DME-edit-visuals-grid_lineC").value =
      this.visuals.grid_lineC;
  },

  handleInput: function (type, input, extra) {
    if (this.blockInput) return;
    //ignore hotkeys if a menu is open
    let modifiedInput = this.specialKeyInputs.hasOwnProperty(input)
      ? this.specialKeyInputs[input]
      : input;
    switch (type) {
      case "mousemove": {
        this.updateMouse(input.clientX, input.clientY);
        break;
      }
      case "button_down": {
        //console.log(input);

        switch (this.editMode) {
          case "building": {
            switch (modifiedInput) {
              case this.hotkeys.zoomOut1:
              case this.hotkeys.zoomOut2: {
                if (!extra) extra = 100;
                this.updateMapZoom(extra);
                break;
              }
              case this.hotkeys.zoomIn1:
              case this.hotkeys.zoomIn2: {
                if (!extra) extra = -100;
                this.updateMapZoom(extra);
                break;
              }
              case this.hotkeys.selectTower1:
              case this.hotkeys.selectTower2: {
                if (this.chunckOptions.hovering) {
                  this.resizeChunkByDrag(0);
                } else this.selectTower();
                break;
              }
              case this.hotkeys.selectArea1:
              case this.hotkeys.selectArea2: {
                if (!this.selectingChunk.isSelecting) this.selectChunk(0);
                break;
              }
              case this.hotkeys.placeTower1:
              case this.hotkeys.placeTower2: {
                if (!this.chunckOptions.hovering) this.placeTower();
                break;
              }
              case "CONTROL": {
                this.isKeyPressed.CONTROL = true;
                break;
              }
              case "SHIFT": {
                this.isKeyPressed.SHIFT = true;
                break;
              }
              case "ENTER": {
                this.isKeyPressed.ENTER = true;
                break;
              }
              case this.hotkeys.toggleSnap1:
              case this.hotkeys.toggleSnap2: {
                let c = document.querySelector(
                  "#DME-toggle-snapping-checkbox"
                ).checked;
                document.querySelector(
                  "#DME-toggle-snapping-checkbox"
                ).checked = !c;
                this.snapping = !c;
                break;
              }
              case this.hotkeys.toggleMirrorMode1:
              case this.hotkeys.toggleMirrorMode2: {
                this.isKeyPressed.MirrorMode = true;
                break;
              }
              case this.hotkeys.toggleRotateMode1:
              case this.hotkeys.toggleRotateMode2: {
                this.isKeyPressed.RotateMode = true;
                break;
              }
              case this.hotkeys.Delete1:
              case this.hotkeys.Delete2: {
                this.deleteTowers();
                break;
              }
              case this.hotkeys.shadeArea1:
              case this.hotkeys.shadeArea2: {
                console.log("Looking for Area to enshade...");
                this.placeArea();
                break;
              }
              case this.hotkeys.shieldTower1:
              case this.hotkeys.shieldTower2: {
                this.shieldTowers();
                break;
              }
              case this.hotkeys.placeBombA1:
              case this.hotkeys.placeBombA2: {
                this.placeSpecial(1);
                break;
              }
              case this.hotkeys.placeBombB1:
              case this.hotkeys.placeBombB2: {
                this.placeSpecial(2);
                break;
              }
              case this.hotkeys.placeSpawnRed1:
              case this.hotkeys.placeSpawnRed2: {
                this.placeSpecial(3);
                break;
              }
              case this.hotkeys.placeSpawnBlue1:
              case this.hotkeys.placeSpawnBlue2: {
                this.placeSpecial(4);
                break;
              }
              case this.hotkeys.MoveUp1:
              case this.hotkeys.MoveUp2: {
                /*if (e.shiftKey) this.resizeChunk(0, this.snapRange, { z: true });
          else this.isKeyPressed.MoveUp = true;*/
                this.handleMoveInput("Up");
                break;
              }
              case this.hotkeys.MoveDown1:
              case this.hotkeys.MoveDown2: {
                this.handleMoveInput("Down");
                break;
              }
              case this.hotkeys.MoveLeft1:
              case this.hotkeys.MoveLeft2: {
                this.handleMoveInput("Left");
                break;
              }
              case this.hotkeys.MoveRight1:
              case this.hotkeys.MoveRight2: {
                this.handleMoveInput("Right");
                break;
              }
              case this.hotkeys.copyChunk1:
              case this.hotkeys.copyChunk2: {
                if (this.isKeyPressed.CONTROL) this.copyChunk();
                break;
              }
              case this.hotkeys.pasteChunk1:
              case this.hotkeys.pasteChunk2: {
                if (this.isKeyPressed.CONTROL) this.pasteChunk();
                break;
              }
              case "ESCAPE": {
                this.selectedTowers = [];
                this.updateChunkOptions();
              }
            }
            break;
          }
          case "KOTH": {
            if (["Left Click", "Right Click"].includes(modifiedInput)) {
              this.handleKothInput(this.mapData.koth[4] ? 1 : 2);
            }
            break;
          }
        }
        break;
      }
      case "button_up": {
        switch (this.editMode) {
          case "building": {
            switch (modifiedInput) {
              /*case "Left Click":*/
              case this.hotkeys.selectTower1:
              case this.hotkeys.selectTower2: {
                if (this.chunckOptions.isChanging) {
                  this.resizeChunkByDrag(2);
                }
                break;
              }
              case this.hotkeys.selectArea1:
              case this.hotkeys.selectArea2: {
                this.selectChunk(1);
                break;
              }
              case "CONTROL": {
                this.isKeyPressed.CONTROL = false;
                break;
              }
              case "SHIFT": {
                this.isKeyPressed.SHIFT = false;
                break;
              }
              case "ENTER": {
                this.isKeyPressed.ENTER = false;
                break;
              }
              case this.hotkeys.toggleSnap1:
              case this.hotkeys.toggleSnap2: {
                break;
              }
              case this.hotkeys.toggleMirrorMode1:
              case this.hotkeys.toggleMirrorMode2: {
                this.isKeyPressed.MirrorMode = false;
                break;
              }
              case this.hotkeys.toggleRotateMode1:
              case this.hotkeys.toggleRotateMode2: {
                this.isKeyPressed.RotateMode = false;
                break;
              }
              case this.hotkeys.MoveUp1:
              case this.hotkeys.MoveUp2: {
                this.isKeyPressed.MoveUp = false;
                break;
              }
              case this.hotkeys.MoveDown1:
              case this.hotkeys.MoveDown2: {
                this.isKeyPressed.MoveDown = false;
                break;
              }
              case this.hotkeys.MoveLeft1:
              case this.hotkeys.MoveLeft2: {
                this.isKeyPressed.MoveLeft = false;
                break;
              }
              case this.hotkeys.MoveRight1:
              case this.hotkeys.MoveRight2: {
                this.isKeyPressed.MoveRight = false;
                break;
              }
              case this.hotkeys.undoAction1:
              case this.hotkeys.undoAction2: {
                if (this.isKeyPressed.CONTROL) this.modifyLastAction(0);
                break;
              }
              case this.hotkeys.redoAction1:
              case this.hotkeys.redoAction2: {
                if (this.isKeyPressed.CONTROL) this.modifyLastAction(1);
                break;
              }
            }
          }
        }
        break;
      }
    }
  },

  config: function () {
    //show canvas
    canvas.classList.remove("hidden");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //set up specialKeyInput values as they cannot be assigned as normally
    this.specialKeyInputs = {};
    this.specialKeyInputs[" "] = "SPACE";

    DME.defaultHotkeys = structuredClone(DME.hotkeys);
    DME.defaultVisuals = JSON.parse(JSON.stringify(DME.visuals));
    DME.defaultVisuals.backgroundImage = new Image();
    if (hasLocalStorage) {
      localStorage.setItem('Last loaded version', version);
      if (!localStorage.getItem("DMEhotkeys")) {
        localStorage.setItem("DMEhotkeys", JSON.stringify(DME.hotkeys));
      } else {
        let storedHotkeys = JSON.parse(localStorage.getItem("DMEhotkeys"));
        console.log(storedHotkeys);
        Object.entries(storedHotkeys).forEach((key) => {
          if(DME.hasOwnProperty(key[0])) DME.hotkeys[key[0]] = key[1];
        });
      }
      if (!localStorage.getItem("DME-visuals")) {
        localStorage.setItem("DME-visuals", JSON.stringify(DME.visuals));
      } else {
        let visuals = JSON.parse(localStorage.getItem("DME-visuals"));
        Object.entries(visuals).forEach((key) => {
          if (key[0] != "backgroundImage") DME.visuals[key[0]] = key[1];
        });
        let q = Number(DME.visuals.quality);
        DME.visuals.quality = 1;
        DME.changeQuality(q);
        Array.from(
          document.querySelectorAll("#DME-visuals-menu input[type='checkbox'")
        ).forEach((checkbox) => {
          let val =
            DME.visuals?.[checkbox.id.replace("DME-toggle-visuals-", "")];
          if (val != undefined) {
            checkbox.checked = !!val;
          }
        });
        Array.from(
          document.querySelectorAll("#DME-visuals-menu input[type='color'")
        ).forEach((colorInp) => {
          let val = DME.visuals?.[colorInp.id.replace("DME-edit-visuals-", "")];
          if (val) {
            colorInp.value = val;
          }
        });
        if (DME.visuals.custom_preset.hasBeenSet)
          document
            .querySelectorAll("#DME-edit-visuals-C-preset option")[3]
            .removeAttribute("disabled");
        document.querySelector("#DME-edit-visuals-grid_line_width").value =
          DME.visuals.grid_line_width;
      }
      Array.from(
        document.querySelectorAll("#DME-hotkey-menu > div > button")
      ).forEach((button) => {
        if (DME.hotkeys?.[button.id.replace("DME-ch-", "")]) {
          button.innerHTML = DME.hotkeys[button.id.replace("DME-ch-", "")];
        }
      });
      if (!localStorage.getItem("DMEauto-saved-map")) {
        localStorage.setItem("DMEauto-saved-map", "210,120|||||");
      } else {
        DME.loadMap(localStorage.getItem("DMEauto-saved-map"), "compact");
      }

      if (!localStorage.getItem("DMEsaved-map-list")) {
        localStorage.setItem("DMEsaved-map-list", JSON.stringify(["Empty"]));
      }
    }
    this.markDoubledKeybinds();

    this.focusPoint = {
      x: this.mapData.width / 2,
      y: this.mapData.height / 2,
    };

    canvas.addEventListener("mousedown", (e) => {
      let mKeys = ["Left Click", "Middle Click", "Right Click"];
      DME.handleInput(
        "button_down",
        mKeys?.[e.button] ? mKeys[e.button] : `Button ${e.button}`
      );
    });
    canvas.addEventListener("mouseup", (e) => {
      let mKeys = ["Left Click", "Middle Click", "Right Click"];
      this.handleInput(
        "button_up",
        mKeys?.[e.button] ? mKeys[e.button] : `Button ${e.button}`
      );
    });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.handleInput(
        "button_down",
        e.deltaY > 0 ? "Scroll Down" : "Scroll Up",
        e.deltaY
      );
    });
    canvas.addEventListener("mousemove", (e) => {
      this.handleInput("mousemove", e);
    });

    document.addEventListener("keydown", (e) => {
      this.handleInput("button_down", e.key.toLocaleUpperCase());
    });
    document.addEventListener("keyup", (e) => {
      this.handleInput("button_up", e.key.toLocaleUpperCase());
    });

    //update menu (such as "Enable XY" -> "Upadate XY" if XY already exists)
    if (this.mapData.koth.length)
      document.querySelector("#DME-edit-KOTH").innerText = "Edit KOTH bounds";

    this.updateCanvas();
  },

  updateCanvas: function () {
    if ((currentSite = "DME")) {
      //stop requesting new animation frames if site changed from map editor
      DME.updateFocusPoint();
      DME.draw();
      window.requestAnimationFrame(DME.updateCanvas);
    }
  },
};

window.oncontextmenu = (e) => {
  e.preventDefault();
};

window.addEventListener("resize", (event) => {
  updateFOV();
});
window.addEventListener("keydown", (e) => {
  if (e.ctrlKey) e.preventDefault();
});
