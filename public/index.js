/*
js for Main Menu
as well as page transitions
and page setup
*/
const version = "1.53";

let hasLocalStorage = false;
let currentPage = 1;
//page = page in main menu
let currentSite = "MM";
//site = site after main menuDC-menu-player-team
const canvas = document.querySelector("#main-canvas");
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
      case "defly-clone": {
        console.log("New Page selected: Defly Clone!");
        DC.config();
        currentSite = "DC";
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
  updateFOV();
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
        DME.deConfig();
        break;
      }
      case 'DC': {
        DC.deConfig();
        break;
      }
    }
  }
};
window.addEventListener("visibilitychange", () => {
  let hidden = !!document.hidden;
  switch (currentSite) {
    case "DME": {
      //set all keys to not pressed
      Object.entries(DME.isKeyPressed).forEach((value) => {
        DME.isKeyPressed[value[0]] = false;
      });
      if (hidden) {
        //cancle all events
      }
      break;
    }
  }
});

/*
usefull functions and data for all sites
*/
const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

const randomFloat = (min, max) => Math.random() * (max - min) + min;

const getDistance2d = (x1, y1, x2, y2) =>
  ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;

function getAngle(Vector, t1, t2) {
  let sign = Vector[0] < 0 ? 0 : 1;
  let alpha = Math.atan((t2.y - t1.y) / (t2.x - t1.x));
  let beta = sign * Math.PI - Math.atan(Vector[1] / Vector[0]);
  let gamma = Math.PI - alpha - beta;
  let delta = Math.PI - beta - 2 * gamma;
  //ONLY BOUNCE ONCE EVERY 2 TICS <-- add this (edit: idk)
  return delta;
}

function getDistanceToLine2d(wall1x, wall1y, wall2x, wall2y, pointX, pointY) {
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
}

function isIntersecting(a, b, c, d, p, q, r, s) {
  let det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
}
function getLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) { //very similar to above but returns point instead of true/false
    let ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
    if (denom == 0) {
        return null;
    }
    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
    return {
        x: x1 + ua * (x2 - x1),
        y: y1 + ua * (y2 - y1),
        seg1: ua >= 0 && ua <= 1,//not sure what this seg1/2 is about
        seg2: ub >= 0 && ub <= 1
    };
}

function getLineCircleIntersections(circle, line){
  let a, b, c, d, u1, u2, ret, retP1, retP2, v1, v2;
  v1 = {};
  v2 = {};
  v1.x = line.p2.x - line.p1.x;
  v1.y = line.p2.y - line.p1.y;
  v2.x = line.p1.x - circle.center.x;
  v2.y = line.p1.y - circle.center.y;
  b = (v1.x * v2.x + v1.y * v2.y);
  c = 2 * (v1.x * v1.x + v1.y * v1.y);
  b *= -2;
  d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - circle.radius * circle.radius));
  if(isNaN(d)){ // no intercept
      return [];
  }
  u1 = (b - d) / c;  // these represent the unit distance of point one and two on the line
  u2 = (b + d) / c;    
  retP1 = {};   // return points
  retP2 = {}  
  ret = []; // return array
  if(u1 <= 1 && u1 >= 0){  // add point if on the line segment
      retP1.x = line.p1.x + v1.x * u1;
      retP1.y = line.p1.y + v1.y * u1;
      ret[0] = retP1;
  }
  if(u2 <= 1 && u2 >= 0){  // second add point if on the line segment
      retP2.x = line.p1.x + v1.x * u2;
      retP2.y = line.p1.y + v1.y * u2;
      ret[ret.length] = retP2;
  }       
  return ret;
}

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
  let w = window.innerWidth;
  let h = window.innerHeight;
  defly.STANDARD_ZOOM =
    w / h < 16 / 9 ? (20 * defly.GRID_WIDTH) / h : (35 * defly.GRID_WIDTH) / w;
  switch (currentSite) {
    case "DME": {
      DME.focusOffset = {
        x: w / 2,
        y: h / 2,
      };
      canvas.width = w * DME.visuals.quality;
      canvas.height = h * DME.visuals.quality;
      break;
    }
    case "DC": {
      camera.offset = {
        x: w / 2,
        y: h / 2,
      };
      canvas.width = w * DME.visuals.quality;
      canvas.height = h * DME.visuals.quality;
      camera.zoom = defly.STANDARD_ZOOM;
      //defly.updateUnits(w/h < 16/9 ? h/40.5 : w / 72);
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
  PLAYER_WIDTH: 10,
  GRID_WIDTH: 44,
  UNIT_WIDTH: 22, //GRID_WIDTH / 2
  MAX_WALL_LENGTH: 660, //GRID_WIDTH * 15
  STANDARD_ZOOM: 1, //this will be relative to screen size
  updateUnits: function (newUnitWidth) {
    this.UNIT_WIDTH = newUnitWidth;
    this.GRID_WIDTH = 2 * newUnitWidth;
    this.MAX_WALL_LENGTH = 30 * newUnitWidth;
    this.BULLET_WIDTH = (newUnitWidth / 22) * 7;
    this.PLAYER_WIDTH = (newUnitWidth / 22) * 10;
    this.TOWER_WIDTH = (newUnitWidth / 22) * 13;
    this.WALL_WIDTH = (newUnitWidth / 22) * 13;
  },
  defuseCopter: {
    basic: {
      copterSpeed: 260,
      bulletSpeed: 260,
      bulletLifespan: 1.7,
      reloadTime: 0.75,
      inaccuracy: 0,
      bulletCount: 1,
    },
    drone: {
      copterSpeed: 230,
      bulletSpeed: 300,
      bulletLifespan: 1.5,
      reloadTime: 0.5,
      inaccuracy: 0.06,
      bulletCount: 1,
    },
    shotgun: {
      copterSpeed: 230,
      bulletSpeed: 260,
      bulletLifespan: 1.1,
      reloadTime: 1,
      inaccuracy: 0.03,
      bulletCount: 5,
    },
    minisnipe: {
      copterSpeed: 210,
      bulletSpeed: 320,
      bulletLifespan: 2,
      reloadTime: 0.75,
      inaccuracy: 0.03,
      bulletCount: 1,
    },
    machinegun: {
      copterSpeed: 175,
      bulletSpeed: 260, //!
      bulletLifespan: 1.25,
      reloadTime: 0.2,
      inaccuracy: 0.08,
      bulletCount: 1,
    },
    sniper: {
      copterSpeed: 180,
      bulletSpeed: 525,
      bulletLifespan: 2.4,
      reloadTime: 2,
      inaccuracy: 0.004,
      bulletCount: 1,
    },
    weapon7: {
      copterSpeed: 180,
      bulletSpeed: 150,
      bulletLifespan: 10,
      reloadTime: 1.2,
      inaccuracy: 0,
      bulletCount: 1,
    },
  },
  images: {
    bombA: new Image(),
    bombB: new Image(),
    koth_crown: new Image(),
    shield: new Image(),
    emp: new Image(),
  },
};
defly.images.bombA.src = "/images/defly-defuse-bombSpotA.png";
defly.images.bombB.src = "/images/defly-defuse-bombSpotB.png";
defly.images.koth_crown.src = "/images/defuse-koth-crown.svg";
defly.images.shield.src = "/images/shield.png";
defly.images.emp.src = "/images/defly-emp.png";

const camera = {
  position: {
    x: 0,
    y: 0,
  },
  offset: {
    x: 0,
    y: 0,
  },
  zoom: 1,
  quality: 1,
  relative: {
    x: (ogX) =>
      ((ogX - camera.position.x) / camera.zoom + camera.offset.x) *
      camera.quality,
    y: (ogY) =>
      ((ogY - camera.position.y) / camera.zoom + camera.offset.y) *
      camera.quality,
  },
};

/*
js for site 1:
defly map editor

all functions & map editor related variables
are inside the DME object
in order to not confuse them with
any other unrelated functions/variables
*/

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
    toggleDeleteWallMode1: "Q",
    toggleDeleteWallMode2: "",
    placeTower1: "Right Click",
    placeTower2: "SPACE",
    selectTower1: "Left Click",
    selectTower2: "",
    selectArea1: "Middle Click",
    selectArea2: "META",
    enterTestMode1: 'T',
    enterTestMode2: '',
    zoomOut1: "Scroll Down",
    zoomOut2: "-",
    zoomIn1: "Scroll Up",
    zoomIn2: "+",
    resetZoom1: "0",
    resetZoom2: "",
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
    DeleteWallMode: false,
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
    centerMapOnLoad: true,
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
  mapZoom: undefined,

  snapRange: 2 * defly.UNIT_WIDTH,
  snapping: false,

  blockInput: false,
  openSubMenu: "",

  mapData: {
    //here
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
    if (k && color == 1 && x >= k[0] && x <= k[2] && y >= k[1] && y <= k[3])
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
      let dist = getDistanceToLine2d(
        wall.from.x,
        wall.from.y,
        wall.to.x,
        wall.to.y,
        mc.x,
        mc.y
      );
      //getDistanceToLine2d might not be accurate - have to check though looking good for now
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
        t.color == 1 &&
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
            break;
          }
          case "area": {
            this.createArea(actionToModify.ids);
            break;
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
        if (origin.x) o.vx = o.rx - xDelta;
        if (!origin?.z) o.vw = o.rw + xDelta;
        if (origin.y) o.vy = o.ry - yDelta;
        if (!origin?.z) o.vh = o.rh + yDelta;
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
    if (this.mapData.koth.length > 3) this.updateKothTowers();
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
      if (newColor == 1) {
        //check if in KOTH bounds
        let k = this.mapData.koth;
        if (
          k &&
          t.x >= k[0] &&
          t.x <= k[2] &&
          t.y >= k[1] &&
          t.y <= k[3] &&
          t.id > 0
        )
          t.isKothTower = true;
      } else t?.isKothTower ? (t.isKothTower = false) : ":)";
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
        break;
      }
      case 1: {
        if (this.selectingChunk.isSelecting) {
          this.selectingChunk.isSelecting = false;
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

  deleteTargetWall: function () {
    let mc = this.mouseCoords.relative,
      [x, y] = [mc.x, mc.y],
      wallsToDelete = [],
      wallIds = [];
    this.mapData.walls.forEach((wall, index) => {
      if (
        getDistanceToLine2d(
          wall.from.x,
          wall.from.y,
          wall.to.x,
          wall.to.y,
          x,
          y
        ) <
        defly.WALL_WIDTH / 2
      ) {
        wallsToDelete.push(index);
        wallIds.push({ from: wall.from.id, to: wall.to.id });
      }
    });
    wallsToDelete.forEach((idx, c) => {
      this.mapData.walls.splice(idx - c, 1);
    });
    let areasToDelete = [];
    wallIds.forEach((ids) => {
      this.mapData.areas.forEach((area, index) => {
        let targetIdStrike = [ids.from, ids.to].includes(area.nodes.at(-1).id)
          ? 1
          : 0;
        area.nodes.forEach((n) => {
          if ([ids.from, ids.to].includes(n.id)) targetIdStrike++;
          else targetIdStrike = targetIdStrike < 2 ? 0 : 3;
          if (targetIdStrike == 2) {
            areasToDelete.push(index);
            let ids = [];
            area.nodes.forEach((n) => {
              ids.push(n.id);
            });
            this.logAction({ action: "delete", type: "area", ids: ids });
          }
        });
      });
    });
    areasToDelete.forEach((idx, c) => {
      this.mapData.areas.splice(idx - c, 1);
    });
    this.logAction({
      action: "delete",
      type: "walls",
      ids: wallIds,
    });
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
        canvas.style.cursor = "url(/images/koth-bound-cursor-1.png), pointer";
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
        canvas.style.cursor =
          "url(/images/koth-bound-cursor-2.png) 18 18, pointer";
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
        canvas.style.cursor = "crosshair";
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

  switchMapShape: function (newShape = -1) {
    this.mapData.shape =
      newShape >= 0 ? Number(newShape) : ++this.mapData.shape % 3;
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
      dataType = !dataType
        ? mapData.split(/\n/).length == 1 && mapData.split(":")[0] == '{"name"'
          ? "astrolly"
          : undefined
        : dataType;
      dataType = !dataType ? "defly" : dataType;
    }
    let mapFile = mapData;
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
            case "MAP_SHAPE": {
              this.switchMapShape(newMapData[position + 1]);
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
        //map shape
        if (newMapSize[2]) this.switchMapShape(newMapSize[2]);

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
            \/ has to be fixed - don't have files on me rn
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
    //if visual map size 1/2 of screen (zoom too high)
    if (
      this.visuals.centerMapOnLoad ||
      this.mapData.width / this.mapZoom < canvas.width / this.visuals.quality
    ) {
      this.mapZoom = (this.mapData.width * this.visuals.quality) / canvas.width;
      this.focusPoint.x = this.mapData.width / 2;
      this.focusPoint.y = this.mapData.height / 2;
      camera.position.x = this.focusPoint.x;
      camera.position.y = this.focusPoint.y;
    }
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
        if (d.shape) text += `\nMAP_SHAPE ${d.shape}`;
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
        )}${d.shape ? "," + d.shape : ""}|${
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
    canvas.height = height;

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
    if (
      this.visuals.showBackgroundImage &&
      this.visuals?.backgroundImage?.src
    ) {
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
      let intersecting = isIntersecting(
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
        this.mirrorChunk({ direction: mirrorDir });
        break;
      }
      case this.isKeyPressed.RotateMode: {
        //rotate towers
        let angle =
          (Number(prompt("Enter rotation angle", 90)) / 180) * Math.PI;
        if (direction == "Left") angle *= -1;
        else if (direction != "Right") return;
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
    if (!o.active || this.editMode == "KOTH") return;
    let mc = this.mouseCoords.relative;
    let cP = {
      distance: 0,
      index: o.hovering - 1,
    };
    if (!o.isChanging) {
      //if selected but havent started changing yet
      cP.index = -1;
      let sp = [];
      for (let h = 0; h <= 1; h += 0.5) {
        for (let w = 0; w <= 1; w += 0.5) {
          sp.push([o.rx - 9 + (o.rw + 18) * w, o.ry - 9 + (o.rh + 18) * h]);
        }
      } //get all edge points for the resize

      sp.splice(4, 1); //ignore middle one
      sp.forEach((pos, index) => {
        if (
          Math.abs(mc.x - pos[0]) <= o.rsr &&
          Math.abs(mc.y - pos[1]) <= o.rsr
        ) {
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
    if (cP.index < 0) {
      //check if cursor is on sides (dragging)
      let [x, y, rx, ry, rw, rh] = [
        mc.x,
        mc.y,
        o.rx - 9,
        o.ry - 9,
        o.rw + 18,
        o.rh + 18,
      ];
      let [a, b, c, d] = [
        getDistanceToLine2d(rx, ry, rx + rw, ry, x, y),
        getDistanceToLine2d(rx, ry, rx, ry + rh, x, y),
        getDistanceToLine2d(rx + rw, ry + rh, rx + rw, ry, x, y),
        getDistanceToLine2d(rx + rw, ry + rh, rx, ry + rh, x, y),
      ];
      let dist =
        (a < b ? a : b) < (c < d ? c : d) ? (a < b ? a : b) : c < d ? c : d;
      if (dist > o.rsw) {
        cS = "crosshair"; //canvas.style.cursor;
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
    //if update is called without x,y coords - only update relative coords without crashing
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
            isIntersecting(
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
    camera.position.x = this.focusPoint.x;
    camera.position.y = this.focusPoint.y;
    if (speedModif) {
      this.updateMouseCoords();
      this.updateChunkOptions();
    }
  },

  updateMapZoom: function (zoom, isEvent = true) {
    //zoom value relative to mouse sensitivity
    let v = zoom / 1250;
    DME.mapZoom *= isEvent
      ? v > 0
        ? 1.02 + v
        : 1 / (1.02 - v)
      : zoom / this.mapZoom;
    camera.zoom = DME.mapZoom;

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
    camera.position.x = this.focusPoint.x;
    camera.position.y = this.focusPoint.y;
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
      let vx = left; // - 10 - 15 / mz;
      let vy = top; // - 10 - 15 / mz;
      let vw = right - left; // + 20 + 30 / mz;
      let vh = bottom - top; // + 20 + 30 / mz;

      //object containing data about chunk options - has to be updated uppon map move/zoom since contains render position data
      let cO = this.chunckOptions;
      cO.active = true;
      cO.hovering = 0;
      cO.rx = left; //real left x posittion
      cO.ry = top; //... y posittion
      cO.rw = right - left; //... width
      cO.rh = bottom - top; //... height
      cO.rsr = 9 * mz; // + 12; //... selective radious around key points
      cO.rsw = 8 * mz; // + 10; //... selective width of outline
      cO.vx = vx; //visual left x position
      cO.vy = vy; //... y position
      cO.vw = vw; //... width
      cO.vh = vh; //... height
      cO.vsr = 9; //... selective radious around key points
      cO.vsw = 8; //... selective width of the outlines
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
    xSel.style.left = `${this.relToFsPt.x(cO.vx + cO.vw / 2) - 58}px`;
    xSel.style.top = `${this.relToFsPt.y(cO.vy + cO.vh) + 20}px`;
    let xSels = xSel.querySelectorAll("input");
    xSels[0].value = newl
      ? cO.rw / defly.UNIT_WIDTH
      : (cO.rw + xDelta) / defly.UNIT_WIDTH;
    xSels[1].value = newl ? 100 : ((cO.rw + xDelta) / cO.rw) * 100;
    let ySel = document.querySelector("#DME-resize-values-y");
    ySel.style.left = `${this.relToFsPt.x(cO.vx + cO.vw) + 20}px`;
    ySel.style.top = `${this.relToFsPt.y(cO.vy + cO.vh / 2) - 22}px`;
    let ySels = ySel.querySelectorAll("input");
    ySels[0].value = newl
      ? cO.rh / defly.UNIT_WIDTH
      : (cO.rh + yDelta) / defly.UNIT_WIDTH;
    ySels[1].value = newl ? 100 : ((cO.rh + yDelta) / cO.rh) * 100;
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
    if (
      this.visuals.showBackgroundImage &&
      this.visuals?.backgroundImage?.src
    ) {
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
          if (false && this.visuals.useDeflyImages) {
            //dont use rn
            let r = (towerWidth + 2 / mz) * q;
            ctx.fillStyle = defly.colors.standard[3];
            ctx.fillRect(t.x - r, t.y - r, 2 * r, 2 * r);
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(defly.images.shield, t.x - r, t.y - r, 2 * r, 2 * r);
            ctx.globalCompositeOperation = "source-over";
          } else {
            ctx.shadowColor = "black";
            ctx.strokeStyle = defly.colors.faded[1];
            ctx.lineWidth = (2 / mz) * q;
            ctx.shadowBlur = (3 / mz) * q;
            ctx.beginPath();
            ctx.arc(t.x, t.y, (towerWidth + 2 / mz) * q, 2 * Math.PI, false);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
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
            ctx.lineWidth = (5.8 / mz) * q;
            ctx.beginPath();
            ctx.arc(t.x, t.y, bombRadius - (2.9 / mz) * q, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fillStyle = "rgba(62,94,255,.5)";
            ctx.font = `bold ${(150 / mz) * q}px Verdana`;
            ctx.fillText(
              tower.id == -1 ? "A" : "B",
              t.x - (58 / mz) * q,
              t.y + (54 / mz) * q
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

      ctx.lineWidth = (d.vsw / 2) * q;
      /*ctx.strokeStyle = "rgba(170, 90, 30, 0.8)";
      ctx.lineDashOffset = 4;
      ctx.lineWidth = d.vsw * q;
      let offset = d.vsw * q / 2;
      ctx.strokeRect(d.vx-offset, d.vy-offset, d.vw+2*offset, d.vh+2*offset);

      ctx.lineDashOffset = 0;
      let [o, s] = [d.vsr, 2 * d.vsr];
      ctx.strokeRect(d.vx - 3*o, d.vy - 3*o, s, s);
      ctx.strokeRect(d.vx - o + d.vw / 2, d.vy - 3*o, s, s);
      ctx.strokeRect(d.vx + o + d.vw, d.vy - 3*o, s, s);
      ctx.strokeRect(d.vx - 3*o, d.vy - o + d.vh / 2, s, s);
      ctx.strokeRect(d.vx + o + d.vw, d.vy - o + d.vh / 2, s, s);
      ctx.strokeRect(d.vx - 3*o, d.vy + o + d.vh, s, s);
      ctx.strokeRect(d.vx - o + d.vw / 2, d.vy + o + d.vh, s, s);
      ctx.strokeRect(d.vx + o + d.vw, d.vy + o + d.vh, s, s);*/

      ctx.strokeStyle = "red";
      let modif = 9 + d.rsr / 2;
      for (let h = 0; h <= 1; h += 0.5) {
        for (let w = 0; w <= 1; w += 0.5) {
          if (h == 0.5 && w == 0.5) continue;
          ctx.strokeRect(
            this.relToFsPt.x(d.vx - modif + (d.vw + 18) * w),
            this.relToFsPt.y(d.vy - modif + (d.vh + 18) * h),
            (d.rsr / mz) * q,
            (d.rsr / mz) * q
          );
        }
      } //get all edge points for the resize
      let oModif = 9 - d.rsr / 2;
      ctx.strokeRect(
        this.relToFsPt.x(d.vx - oModif),
        this.relToFsPt.y(d.vy - oModif),
        ((d.vw + 2 * oModif) / mz) * q,
        ((d.vh + 2 * oModif) / mz) * q
      );
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
      default: {
        console.log("Unknown file type: File ignored");
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

  handleInput: function (e /*type, input, extra*/) {
    if (DME.blockInput) return;
    //ignore hotkeys if a menu is open

    let type = e.type,
      input,
      extra;

    //extract (type,) input & extra values from event
    switch (e.type) {
      case "mousedown": {
        type = "button_down";
        let mKeys = ["Left Click", "Middle Click", "Right Click"];
        input = mKeys?.[e.button] ? mKeys[e.button] : `Button ${e.button}`;
        break;
      }
      case "mouseup": {
        type = "button_up";
        let mKeys = ["Left Click", "Middle Click", "Right Click"];
        input = mKeys?.[e.button] ? mKeys[e.button] : `Button ${e.button}`;
        break;
      }
      case "wheel": {
        type = "button_down";
        e.preventDefault(); //not 100% sure whether that works here but ig it should
        input = e.deltaY > 0 ? "Scroll Down" : "Scroll Up";
        extra = e.deltaY;
        break;
      }
      case "mousemove": {
        input = e;
        break;
      }
      case "keydown": {
        type = "button_down";
        input = e.key.toLocaleUpperCase();
        break;
      }
      case "keyup": {
        type = "button_up";
        input = e.key.toLocaleUpperCase();
        break;
      }
    }

    let modifiedInput = DME.specialKeyInputs.hasOwnProperty(input)
      ? DME.specialKeyInputs[input]
      : input;
    switch (type) {
      case "mousemove": {
        DME.updateMouse(input.clientX, input.clientY);
        break;
      }
      case "button_down": {
        //console.log(input);
        switch (DME.editMode) {
          case "building": {
            switch (modifiedInput) {
              case DME.hotkeys.zoomOut1:
              case DME.hotkeys.zoomOut2: {
                if (!extra) extra = 100;
                DME.updateMapZoom(extra);
                break;
              }
              case DME.hotkeys.zoomIn1:
              case DME.hotkeys.zoomIn2: {
                if (!extra) extra = -100;
                DME.updateMapZoom(extra);
                break;
              }
              case DME.hotkeys.resetZoom1:
              case DME.hotkeys.resetZoom2: {
                DME.updateMapZoom(1, false);
                break;
              }
              case DME.hotkeys.selectTower1:
              case DME.hotkeys.selectTower2: {
                if (DME.isKeyPressed.DeleteWallMode) {
                  DME.deleteTargetWall();
                } else if (DME.chunckOptions.hovering) {
                  DME.resizeChunkByDrag(0);
                } else DME.selectTower();
                break;
              }
              case DME.hotkeys.selectArea1:
              case DME.hotkeys.selectArea2: {
                if (!DME.selectingChunk.isSelecting) DME.selectChunk(0);
                break;
              }
              case DME.hotkeys.placeTower1:
              case DME.hotkeys.placeTower2: {
                if (!DME.chunckOptions.hovering) DME.placeTower();
                break;
              }
              case "CONTROL": {
                DME.isKeyPressed.CONTROL = true;
                break;
              }
              case "SHIFT": {
                DME.isKeyPressed.SHIFT = true;
                break;
              }
              case "ENTER": {
                DME.isKeyPressed.ENTER = true;
                break;
              }
              case DME.hotkeys.toggleSnap1:
              case DME.hotkeys.toggleSnap2: {
                let c = document.querySelector(
                  "#DME-toggle-snapping-checkbox"
                ).checked;
                document.querySelector(
                  "#DME-toggle-snapping-checkbox"
                ).checked = !c;
                DME.snapping = !c;
                break;
              }
              case DME.hotkeys.toggleMirrorMode1:
              case DME.hotkeys.toggleMirrorMode2: {
                DME.isKeyPressed.MirrorMode = true;
                break;
              }
              case DME.hotkeys.toggleRotateMode1:
              case DME.hotkeys.toggleRotateMode2: {
                DME.isKeyPressed.RotateMode = true;
                break;
              }
              case DME.hotkeys.toggleDeleteWallMode1:
              case DME.hotkeys.toggleDeleteWallMode2: {
                DME.isKeyPressed.DeleteWallMode = true;
                break;
              }
              case DME.hotkeys.Delete1:
              case DME.hotkeys.Delete2: {
                DME.deleteTowers();
                break;
              }
              case DME.hotkeys.shadeArea1:
              case DME.hotkeys.shadeArea2: {
                console.log("Looking for Area to enshade...");
                DME.placeArea();
                break;
              }
              case DME.hotkeys.shieldTower1:
              case DME.hotkeys.shieldTower2: {
                DME.shieldTowers();
                break;
              }
              case DME.hotkeys.placeBombA1:
              case DME.hotkeys.placeBombA2: {
                DME.placeSpecial(1);
                break;
              }
              case DME.hotkeys.placeBombB1:
              case DME.hotkeys.placeBombB2: {
                DME.placeSpecial(2);
                break;
              }
              case DME.hotkeys.placeSpawnRed1:
              case DME.hotkeys.placeSpawnRed2: {
                DME.placeSpecial(3);
                break;
              }
              case DME.hotkeys.placeSpawnBlue1:
              case DME.hotkeys.placeSpawnBlue2: {
                DME.placeSpecial(4);
                break;
              }
              case DME.hotkeys.MoveUp1:
              case DME.hotkeys.MoveUp2: {
                /*if (e.shiftKey) DME.resizeChunk(0, DME.snapRange, { z: true });
          else DME.isKeyPressed.MoveUp = true;*/
                DME.handleMoveInput("Up");
                break;
              }
              case DME.hotkeys.MoveDown1:
              case DME.hotkeys.MoveDown2: {
                DME.handleMoveInput("Down");
                break;
              }
              case DME.hotkeys.MoveLeft1:
              case DME.hotkeys.MoveLeft2: {
                DME.handleMoveInput("Left");
                break;
              }
              case DME.hotkeys.MoveRight1:
              case DME.hotkeys.MoveRight2: {
                DME.handleMoveInput("Right");
                break;
              }
              case DME.hotkeys.copyChunk1:
              case DME.hotkeys.copyChunk2: {
                if (DME.isKeyPressed.CONTROL) DME.copyChunk();
                break;
              }
              case DME.hotkeys.pasteChunk1:
              case DME.hotkeys.pasteChunk2: {
                if (DME.isKeyPressed.CONTROL) DME.pasteChunk();
                break;
              }
              case DME.hotkeys.enterTestMode1:
              case DME.hotkeys.enterTestMode2: {
                DME.enterTestMode();
                break;
              }
              case "ESCAPE": {
                DME.selectedTowers = [];
                DME.updateChunkOptions();
              }
            }
            break;
          }
          case "KOTH": {
            if (["Left Click", "Right Click"].includes(modifiedInput)) {
              DME.handleKothInput(DME.mapData.koth[4] ? 1 : 2);
            }
            break;
          }
        }
        break;
      }
      case "button_up": {
        switch (DME.editMode) {
          case "building": {
            switch (modifiedInput) {
              /*case "Left Click":*/
              case DME.hotkeys.selectTower1:
              case DME.hotkeys.selectTower2: {
                if (DME.chunckOptions.isChanging) {
                  DME.resizeChunkByDrag(2);
                }
                break;
              }
              case DME.hotkeys.selectArea1:
              case DME.hotkeys.selectArea2: {
                DME.selectChunk(1);
                break;
              }
              case "CONTROL": {
                DME.isKeyPressed.CONTROL = false;
                break;
              }
              case "SHIFT": {
                DME.isKeyPressed.SHIFT = false;
                break;
              }
              case "ENTER": {
                DME.isKeyPressed.ENTER = false;
                break;
              }
              case DME.hotkeys.toggleSnap1:
              case DME.hotkeys.toggleSnap2: {
                break;
              }
              case DME.hotkeys.toggleMirrorMode1:
              case DME.hotkeys.toggleMirrorMode2: {
                DME.isKeyPressed.MirrorMode = false;
                break;
              }
              case DME.hotkeys.toggleRotateMode1:
              case DME.hotkeys.toggleRotateMode2: {
                DME.isKeyPressed.RotateMode = false;
                break;
              }
              case DME.hotkeys.toggleDeleteWallMode1:
              case DME.hotkeys.toggleDeleteWallMode2: {
                DME.isKeyPressed.DeleteWallMode = false;
                break;
              }
              case DME.hotkeys.MoveUp1:
              case DME.hotkeys.MoveUp2: {
                DME.isKeyPressed.MoveUp = false;
                break;
              }
              case DME.hotkeys.MoveDown1:
              case DME.hotkeys.MoveDown2: {
                DME.isKeyPressed.MoveDown = false;
                break;
              }
              case DME.hotkeys.MoveLeft1:
              case DME.hotkeys.MoveLeft2: {
                DME.isKeyPressed.MoveLeft = false;
                break;
              }
              case DME.hotkeys.MoveRight1:
              case DME.hotkeys.MoveRight2: {
                DME.isKeyPressed.MoveRight = false;
                break;
              }
              case DME.hotkeys.undoAction1:
              case DME.hotkeys.undoAction2: {
                if (DME.isKeyPressed.CONTROL) DME.modifyLastAction(0);
                break;
              }
              case DME.hotkeys.redoAction1:
              case DME.hotkeys.redoAction2: {
                if (DME.isKeyPressed.CONTROL) DME.modifyLastAction(1);
                break;
              }
            }
          }
        }
        break;
      }
    }
  },

  enterTestMode: function () {
    //remove editor event listeners
    DME.deConfig();
    switchSite('defly-clone',2);
  },

  toggleAllEventListeners: function (on = true) {
    let modif = on ? "addEventListener" : "removeEventListener";
    canvas[modif]("mousedown", DME.handleInput);
    canvas[modif]("mouseup", DME.handleInput);
    canvas[modif]("wheel", DME.handleInput);
    canvas[modif]("mousemove", DME.handleInput);

    document[modif]("keydown", DME.handleInput);
    document[modif]("keyup", DME.handleInput);
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
    DME.visuals.backgroundImage = new Image();
    if (hasLocalStorage) {
      localStorage.setItem("Last loaded version", version);
      if (!localStorage.getItem("DMEhotkeys")) {
        localStorage.setItem("DMEhotkeys", JSON.stringify(DME.hotkeys));
      } else {
        let storedHotkeys = JSON.parse(localStorage.getItem("DMEhotkeys"));
        console.log(storedHotkeys);
        Object.entries(storedHotkeys).forEach((key) => {
          if (DME.hotkeys.hasOwnProperty(key[0])) DME.hotkeys[key[0]] = key[1];
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

    if (
      camera.position.x != this.focusPoint.x ||
      camera.position.x != this.focusPoint.x
    ) {
      this.focusPoint = {
        x: this.mapData.width / 2,
        y: this.mapData.height / 2,
      };
      camera.position = this.focusPoint;
    }
    this.mapZoom = this.mapZoom ?? defly.STANDARD_ZOOM;

    this.toggleAllEventListeners(true);

    //update menu (such as "Enable XY" -> "Upadate XY" if XY already exists)
    if (this.mapData.koth.length)
      document.querySelector("#DME-edit-KOTH").innerText = "Edit KOTH bounds";

    this.updateCanvas();
    this.updateChunkOptions();
  },

  deConfig: function () {
    localStorage.setItem("DMEauto-saved-map", DME.generateMapFile("compact"));
    localStorage.setItem("DMEhotkeys", JSON.stringify(DME.hotkeys));
    //don't save background image - too heavy load, unnecessary & breaks image loading
    delete DME.visuals.backgroundImage;
    localStorage.setItem("DME-visuals", JSON.stringify(DME.visuals));
  },

  updateCanvas: function () {
    if (currentSite == "DME") {
      //stop requesting new animation frames if site changed from map editor
      DME.updateFocusPoint();
      DME.draw();
      window.requestAnimationFrame(DME.updateCanvas);
    }
  },
};

const DC = {
  hotkeys: {
    MoveUp1: 'W',
    MoveUp2: 'ARROWUP',
    MoveLeft1: 'A',
    MoveLeft2: 'ARROWLEFT',
    MoveDown1: 'S',
    MoveDown2: 'ARROWDOWN',
    MoveRight1: 'D',
    MoveRight2: 'ARROWRIGHT',
    build1: 'Right Click',
    build2: 'SPACE',
    shoot1: 'Left Click',
    shoot2: '',
    usePower1: 'E',
    usePower2: 'Middle Click',
  },
  defaultHotkeys: {},
  changeKeybind: {
    isChanging: false,
    binding: "",
    element: "",
  },
  specialKeyInputs: {
    [' ']: 'SPACE',
  },
  blockInput: false,
  permanentMapData: {
    width: 1000,
    height: 1000,
    towers: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
    walls: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
    areas: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
    bombs: [],
    spawns: [],
  },
  mapData: {
    width: 1000,
    height: 1000,
    towerCluster: [],
    wallCluster: [],
    areas: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
    bombs: [],
    spawns: [],
  },
  gameData: {
    bullets: [],
    activeItems: [],
    idToTeam: { id1: 2 }, //DC.gameData.idToTeam[`id${player.id}`] => returns team id for player id
  },
  gameMode: "defuse",
  highestId: 0,
  innitialDepth: 0,//used while looping through snap wall

  player: {
    position: {
      x: 0,
      y: 0,
    },
    aimingAt: {
      x: 0,
      y: 0,
    },
    buildPoint: {
      x: 0,
      y: 0,
    },
    relativeBuildPoint: {
      x: 0,
      y: 0,
    },
    velocity: {
      xN: 0,
      xP: 0,
      yN: 0,
      yP: 0,
    },
    isStuck: false,
    connectedTo: {
      id: false,
      x: 0,
      y: 0,
    },
    team: 2,
    id: 1,
    money: 1000,
    score: 0,
    isShooting: false,
    wantsToBuild: false,
    wantsToUsePower: false,
    shootingCooldown: 0,
    //copter: "basic",
    copter: {
      copterSpeed: 260,
      bulletSpeed: 260,
      bulletLifespan: 1.7,
      reloadTime: 0.75,
      inaccuracy: 0,
      bulletCount: 1,
    },
    tower: {
      buildRange: 0,
      health: 1,
      shield: 0,
    }
  },

  animations: [],

  rawDelta: 0,
  localDelta: 0,
  MAX_DELTA: 0.1,
  gameTime: 0,

  coordToCluster: (coord) => Math.floor(coord / defly.UNIT_WIDTH), //returns cluster position from coord

  getClusterOrigin: function (origin = this.player.position) {
    return [this.coordToCluster(origin.x), this.coordToCluster(origin.y)];
  },

  snapPointIntoMap: function(position){
    let mD = DC.mapData,x=position.x,y=position.y;
    switch (mD.shape) {
      case 0: {
        //rectangle
        x = x < 0 ? 0 : x > mD.width ? mD.width : x;
        y = y < 0 ? 0 : y > mD.height ? mD.height : y;
        break;
      }
      case 1: {
        //hexagon
        let cX = mD.width / 2,
          cY = mD.height / 2,
          bounds = mD.bounds;
        //radious = cX
        for (c = 0; c < 6; c++) {
          //check whether position is outside hex map bounds
          if (
            isIntersecting(
              x,
              y,
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
              [sx, sy] = [x - cX, y - cY];
            let xC = sx * cos - sy * sin + 0.5 * cX,
              fraction = (xC > cX ? cX : xC < 0 ? 0 : xC) / cX,
              deltaX = bounds[(2 + c * 2) % 12] - bounds[c * 2],
              deltaY = bounds[(3 + c * 2) % 12] - bounds[1 + c * 2],
              tx = bounds[c * 2] + deltaX * fraction,
              ty = bounds[1 + c * 2] + deltaY * fraction;
            x = tx; // < 0 ? 0 : tx > mD.width ? mD.width : tx;
            y = ty; // < 0 ? 0 : ty > mD.height ? mD.height : ty;
            break;
          } else if (x < 0) x = 0;
          else if (x > mD.width) x = mD.width;
        }
        break;
      }
      case 2: {
        //circle
        let radious = mD.width / 2,
          xDif = x - radious,
          yDif = y - radious,
          e = (xDif ** 2 + yDif ** 2) ** 0.5 / radious;
        if (e > 1) {
          x = radious + xDif / e;
          y = radious + yDif / e;
        }
        break;
      }
    }
    return ({x:x,y:y});
  },

  updatePlayer: function () {
    DC.updatePlayerPosition();
    DC.checkShoot();
    DC.checkBuild();
  },
  updatePlayerPosition: function () {
    let p = DC.player;
    if (typeof p.isStuck == "boolean") {
      //update position
      let xVel = p.velocity.xP - p.velocity.xN,
        yVel = p.velocity.yP - p.velocity.yN,
        xModif = xVel * (yVel ? 0.71 : 1),
        yModif = yVel * (xVel ? 0.71 : 1);
      p.position.x += xModif * DC.player.copter.copterSpeed * DC.localDelta;
      p.position.y += yModif * DC.player.copter.copterSpeed * DC.localDelta;

      //check if on top of tower: connect
      let pCluster = DC.getClusterOrigin({x:this.player.buildPoint.x,y:this.player.buildPoint.y});
      for (let yM = -1; yM < 2; yM++) {
        for (let xM = -1; xM < 2; xM++) {
          DC.mapData.towerCluster[pCluster[0] + xM]?.[
            pCluster[1] + yM
          ]?.forEach((t) => {
            if (
              getDistance2d(p.buildPoint.x, p.buildPoint.y, t.x, t.y) <
                defly.TOWER_WIDTH + defly.PLAYER_WIDTH &&
              t.team == p.team
            ) {
              if(p.connectedTo.id !== false && !p.isShooting){
                //connect towers
                let wallHasToBePlaced = true;
                t.connectedTo.forEach(c => {if(c.id == p.connectedTo.id)wallHasToBePlaced = false;});
                t.connectedFrom.forEach(c => {if(c.id == p.connectedTo.id)wallHasToBePlaced = false;});
                if(wallHasToBePlaced){
                  this.handleWallPlacement(p.connectedTo, t, p.team);
                }
              }
              p.connectedTo.id = t.id;
              p.connectedTo.x = t.x;
              p.connectedTo.y = t.y;
            }
          });
        }
      }
      DC.checkPlayerWallCollision();
    } else {
      p.position.x +=
        p.isStuck.x * DC.player.copter.copterSpeed * DC.localDelta;
      p.position.y +=
        p.isStuck.y * DC.player.copter.copterSpeed * DC.localDelta;
      DC.checkPlayerWallCollision();
    }
    //if player is outside map...
    switch (DC.mapData.shape) {
      case 0: {
        //rectangle
        p.position.x =
          p.position.x < 0
            ? 0
            : p.position.x > DC.mapData.width
            ? DC.mapData.width
            : p.position.x;
        p.position.y =
          p.position.y < 0
            ? 0
            : p.position.y > DC.mapData.height
            ? DC.mapData.height
            : p.position.y;
        break;
      }
      case 1: {
        //hexagon
        let cX = DC.mapData.width / 2,
          cY = DC.mapData.height / 2,
          pX = p.position.x,
          pY = p.position.y;
        bounds = DC.mapData.bounds;
        //radious = cX
        for (c = 0; c < 6; c++) {
          //check whether position is outside hex map bounds
          if (
            isIntersecting(
              pX,
              pY,
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
              [x, y] = [pX - cX, pY - cY];
            let xC = x * cos - y * sin + 0.5 * cX,
              fraction = (xC > cX ? cX : xC < 0 ? 0 : xC) / cX,
              deltaX = bounds[(2 + c * 2) % 12] - bounds[c * 2],
              deltaY = bounds[(3 + c * 2) % 12] - bounds[1 + c * 2],
              tx = bounds[c * 2] + deltaX * fraction,
              ty = bounds[1 + c * 2] + deltaY * fraction;
            p.position.x = tx; // < 0 ? 0 : tx > DC.mapData.width ? DC.mapData.width : tx;
            p.position.y = ty; // < 0 ? 0 : ty > DC.mapData.height ? DC.mapData.height : ty;
            break;
          } else if (pX < 0) p.position.x = 0;
          else if (pX > DC.mapData.width) p.position.x = DC.mapData.width;
        }
        break;
      }
      case 2: {
        //circle
        let radious = DC.mapData.width / 2,
          xDif = p.position.x - radious,
          yDif = p.position.y - radious,
          e = (xDif ** 2 + yDif ** 2) ** 0.5 / radious;
        if (e > 1) {
          p.position.x = radious + xDif / e;
          p.position.y = radious + yDif / e;
        }
        break;
      }
    }
    camera.position.x = p.position.x;
    camera.position.y = p.position.y;
  },
  checkPlayerWallCollision: function () {
    let p = DC.player;
    p.isStuck = false;
    let bA = { x: 0, y: 0 },
      bC = 0;
    pP = p.position;

    let pCluster = DC.getClusterOrigin();
    for (let yM = -30; yM < 31; yM++) {
      //limmited to standard max wall length
      for (let xM = -30; xM < 31; xM++) {
        DC.mapData.wallCluster[pCluster[0] + xM]?.[pCluster[1] + yM]?.forEach(
          (wall) => {
            if (wall.team != p.team) {
              let distance = getDistanceToLine2d(
                wall.from.x,
                wall.from.y,
                wall.to.x,
                wall.to.y,
                pP.x,
                pP.y
              );
              if (distance < defly.WALL_WIDTH / 2 + defly.PLAYER_WIDTH) {
                //colliding
                if (wall.team == 1) {
                  p.isStuck = true;
                  //grey wall, bounce player
                  bC++;
                  let wallVector = [
                      wall.to.x - wall.from.x,
                      wall.to.y - wall.from.y,
                    ],
                    rightVector = [-wallVector[1], wallVector[0]],
                    sign =
                      getDistance2d(
                        rightVector[0] + wall.from.x,
                        rightVector[1] + wall.from.y,
                        pP.x,
                        pP.y
                      ) <
                      getDistance2d(
                        -rightVector[0] + wall.from.x,
                        -rightVector[1] + wall.from.y,
                        pP.x,
                        pP.y
                      )
                        ? 1
                        : -1,
                    normalizer =
                      sign / (rightVector[0] ** 2 + rightVector[1] ** 2) ** 0.5;
                  bA.x += normalizer * rightVector[0];
                  bA.y += normalizer * rightVector[1];
                } else {
                  this.explodeArea(pP.x,pP.y,5,p.team,true);//5 = radius, has to be bound to player experience points later
                  //enemy wall, die
                }
              }
            }
          }
        );
      }
    }

    if (p.isStuck) {
      if ((bA.x ** 2 + bA.y ** 2) ** 0.5 == 0) {
        p.isStuck = false;
      } else {
        let normalizer = 1 / (bA.x ** 2 + bA.y ** 2) ** 0.5;
        p.isStuck = {
          x: normalizer * bA.x,
          y: normalizer * bA.y,
        };
      }
    }
  },
  checkBuild: function () {
    let p = DC.player;
    if (!p.wantsToBuild) return;
    p.wantsToBuild = false;
    if (p.isShooting) return;
    //check if player too close to tower, wall
    let x = p.buildPoint.x,
      y = p.buildPoint.y;
    let cId = p.connectedTo.id,
      pTeam = p.team;
    let canBuildHere = true;
    let pCluster = DC.getClusterOrigin({x:x,y:y});
    for (let yM = -2; yM < 3; yM++) {
      for (let xM = -2; xM < 3; xM++) {
        DC.mapData.towerCluster[pCluster[0] + xM]?.[pCluster[1] + yM]?.forEach(
          (tower) => {
            if (getDistance2d(tower.x, tower.y, x, y) < defly.GRID_WIDTH) {
              canBuildHere = false;
              if(tower.team == p.team) {
                tower.hp = tower.maxHp;
                tower.damaged = 0;
              }
            }
          }
        );
      }
    }
    if (canBuildHere) {
      let pCluster = DC.getClusterOrigin({x:x,y:y});
      for (let yM = -30; yM < 31; yM++) {
        for (let xM = -30; xM < 31; xM++) {
          DC.mapData.wallCluster[pCluster[0] + xM]?.[pCluster[1] + yM]?.forEach(
            (wall) => {
              if (
                wall.team != 1 &&
                getDistanceToLine2d(
                  wall.from.x,
                  wall.from.y,
                  wall.to.x,
                  wall.to.y,
                  x,
                  y
                ) <
                  defly.WALL_WIDTH + defly.TOWER_WIDTH
              )
                canBuildHere = false;
            }
          );
        }
      }
    }
    if (canBuildHere) {
      let startTower = {
        x: x,
        y: y,
        id: this.placeTower(x, y, pTeam, p.tower.health),
      }
      let endTower = p.connectedTo;
      this.innitialDepth = 0;
      if (! (cId===false)) {
        this.handleWallPlacement(startTower, endTower, pTeam);
      }
    }
  },
  placeTower: function (x, y, team, hp=1, id = Number(DC.highestId) + 1) {
    if (this.highestId < id) this.highestId = id; //!here
    let cO = this.getClusterOrigin({ x: x, y: y });
    DC.mapData.towerCluster[cO[0]][cO[1]].push({
      x: x,
      y: y,
      id: id,
      team: team,
      maxHp: hp,
      hp: hp,
      damaged: 0,
      connectedTo: [],
      connectedFrom: [],
    });
    return id;
  },
  handleWallPlacement(startTower, endTower, pTeam){
    //note: has to be heavily optimised!!!
    this.innitialDepth++;
    let sX = startTower.x,sY=startTower.y,sId=startTower.id,eX=endTower.x,eY=endTower.y,eId=endTower.id;
    //check if wall would intersect any other wall, would be too close to other towers or is too long
    let wallLength = ((sX - eX) ** 2 + (sY - eY) ** 2) ** 0.5;
    if (wallLength < defly.MAX_WALL_LENGTH) {
      //only if wall is not too long
      for (let i = 0; i < 30; i++) {//itterate till wall cant or has been placed
        if(this.innitialDepth > 30) return; //stuck in inf loop - may be otimised later
        let wallIntersections = {
          walls: [],
          towers: [],
        };
        let wallCanBePlaced = true;
        let pCluster = DC.getClusterOrigin({x:sX,y:sY});
        for (let yM = -30; yM < 31; yM++) {
          for (let xM = -30; xM < 31; xM++) {
            DC.mapData.towerCluster[pCluster[0] + xM]?.[
              pCluster[1] + yM
            ]?.forEach((tower) => {
              if (
                wallCanBePlaced &&
                tower.team != 1 &&
                !(tower.id == eId || tower.id == sId)
              ) {
                let tDtWall = getDistanceToLine2d(
                  sX,
                  sY,
                  eX,
                  eY,
                  tower.x,
                  tower.y
                );
                if (tDtWall < defly.WALL_WIDTH + defly.TOWER_WIDTH) {
                  if (tower.team != this.player.team) {
                    wallCanBePlaced = false;
                  } else {
                    wallIntersections.towers.push(tower);
                  }
                }
              }
            });
          }
        }
        if (wallCanBePlaced) {
          let pCluster = DC.getClusterOrigin({x:sX,y:sY}),
            xS = eX < sX ? -30 : 0,
            xP = xS ? 0 : 30,
            yS = eY < sY ? -30 : 0,
            yP = yS ? 0 : 30;
          for (let yM = -30 + yS; yM < 31 + yP; yM++) {
            for (let xM = -30 + xS; xM < 31 + xP; xM++) {
              DC.mapData.wallCluster[pCluster[0] + xM]?.[
                pCluster[1] + yM
              ]?.forEach((wall) => {
                if (
                  isIntersecting(
                    sX,
                    sY,
                    eX,
                    eY,
                    wall.from.x,
                    wall.from.y,
                    wall.to.x,
                    wall.to.y
                  )
                ) {
                  if (wall.team != this.player.team) {
                    wallCanBePlaced = false;
                  } else {
                    wallIntersections.walls.push(wall);
                  }
                }
              });
            }
          }
        }
        if (wallCanBePlaced) {
          if((wallIntersections.walls.length+wallIntersections.towers.length) > 0) {
            //'snap' wall and repeat
            let closestIntersection = {
              distance: Infinity,
              type: 'walls',
              index: 0,
              iP: [],
            }
            wallIntersections.walls.forEach((wall, idx) => {
              let iP = getLineIntersection(eX,eY,sX,sY,wall.from.x,wall.from.y,wall.to.x,wall.to.y);
              let d = ((iP.x-sX)**2+(iP.y-sY)**2)**.5;
              if(d < closestIntersection.distance) {
                closestIntersection.distance = d;
                closestIntersection.index = idx;
                closestIntersection.iP = iP;
              }
            });
            wallIntersections.towers.forEach((tower, idx) => {
              let d = ((tower.x-sX)**2+(tower.y-sY)**2)**.5;
              if(d < closestIntersection.distance) {
                closestIntersection.distance = d;
                closestIntersection.index = idx;
                closestIntersection.type = 'tower';
              }
            });
            let t;
            if(closestIntersection.type == 'walls'){
              let w = wallIntersections.walls[closestIntersection.index],
                p = closestIntersection.iP;
              t = getDistance2d(p.x,p.y,w.from.x,w.from.y) < getDistance2d(p.x,p.y,w.to.x,w.to.y) ? w.from : w.to;
            } else {
              t = wallIntersections.towers[closestIntersection.index];
            }
            this.handleWallPlacement(
              { x: t.x, y: t.y, id: t.id },
              { x: sX, y: sY, id: sId },
              pTeam
            );
            sX = t.x;
            sY = t.y;
            sId = t.id;
          } else {
            //place wall & exit
            this.placeWall(
              { x: eX, y: eY, id: eId },
              { x: sX, y: sY, id: sId },
              pTeam
            );
            break;
          }
        } else {
          break;
        }
      }
    }
  },
  placeWall: function (from, to, team) {
    //note: if max wall length would be increased, could place false walls
    //if(from.id == to.id) return;
    let cO = this.getClusterOrigin({ x: from.x, y: from.y }),
      hasToBePlaced = true;
    DC.mapData.towerCluster[cO[0]][cO[1]].forEach(t => {
      if(t.id == from.id){
        t.connectedTo.forEach(c => {if(c.id == to.id)hasToBePlaced = false;});
        t.connectedFrom.forEach(c => {if(c.id == to.id)hasToBePlaced = false;});
      }
    });
    if(hasToBePlaced){
      DC.mapData.wallCluster[cO[0]][cO[1]].push({
        from: from,
        to: to,
        team: team,
      });
      this.pushNewWallConnections(from, to);
    }
  },
  checkShoot: function () {
    let p = DC.player;
    if (p.shootingCooldown > 0) p.shootingCooldown -= DC.localDelta;
    if (p.isShooting && p.shootingCooldown <= 0) {
      //spawn a bullet
      DC.createBullets(
        p.position,
        p.aimingAt,
        p.copter.inaccuracy,
        p.copter.bulletSpeed,
        p.copter.bulletLifespan,
        p.copter.bulletCount,
        p.id
      );
      //gameData.bullets.push({position : {x : player.position.x, y : player.position.y}, velocity : {x : -20, y : 10}, lifespawn : 5})
      p.shootingCooldown = DC.player.copter.reloadTime;
    }

    //also checking for powers here
    if(p.wantsToUsePower) {
      p.wantsToUsePower = false;
      switch(this.gameMode){
        case 'defuse':{
          //check whether can throw emp
          //...
          let data = {
            type: 'emp',
            x: p.position.x,
            y: p.position.y,
            maxVelocity: {
              x: 2*(p.aimingAt.x - camera.offset.x)*camera.zoom,
              y: 2*(p.aimingAt.y - camera.offset.y)*camera.zoom,
            },
            fuse: 3,
            radius: 4,
            team: p.team,
          }
          this.gameData.activeItems.push(data);
          break;
        }
      }
    }
  },
  createBullets: function (
    position,
    aim,
    inaccuracy,
    bulletSpeed,
    bulletLifespan,
    bulletCount,
    owner
  ) {
    let offset = camera.offset;
    for (let c = -((bulletCount - 1) / 2); c < (bulletCount - 1) / 2 + 1; c++) {
      let left = aim.x >= offset.x ? 0 : Math.PI;
      let shootingAngle =
        Math.atan((aim.y - offset.y) / (aim.x - offset.x)) + left;
      shootingAngle +=
        randomFloat(-Math.PI * inaccuracy, Math.PI * inaccuracy) +
        inaccuracy * c * 2 * Math.PI;
      let velocity = {
        x: Math.cos(shootingAngle) * bulletSpeed,
        y: Math.sin(shootingAngle) * bulletSpeed,
      };
      DC.gameData.bullets.push({
        v: velocity,
        p: structuredClone(position),
        l: bulletLifespan,
        o: owner,
        t: DC.gameData.idToTeam[`id${owner}`],
      });
    }
  },

  updateBullets: function () {
    let fadedBullets = [];
    DC.gameData.bullets.forEach((bullet, bIndex) => {
      let notBounced = true,
        bounceAngle = 0;

      /*let thisLocalDelta =
        localDelta > bullet.lastBounceDelta
          ? localDelta
          : bullet.lastBounceDelta + 0.001;*/
      bullet.p.x += bullet.v.x * DC.localDelta;
      bullet.p.y += bullet.v.y * DC.localDelta;
      //check for collisions with walls, players, towers

      //walls
      let cO = this.getClusterOrigin(bullet.p);
      for (let yM = -30; yM < 31; yM++) {
        for (let xM = -30; xM < 31; xM++) {
          DC.mapData.wallCluster[cO[0] + xM]?.[cO[1] + yM]?.forEach((wall) => {
            if (wall.team != bullet.t && notBounced) {
              let xT1 = wall.from.x;
              let yT1 = wall.from.y;
              let xT2 = wall.to.x;
              let yT2 = wall.to.y;
              let bulletDistanceToWall = getDistanceToLine2d(
                xT1,
                yT1,
                xT2,
                yT2,
                bullet.p.x,
                bullet.p.y
              );
              if (
                bulletDistanceToWall * 2 <=
                defly.WALL_WIDTH + defly.BULLET_WIDTH
              ) {
                notBounced = false;
                bounceAngle += DC.getBounceBulletAngle(
                  bullet.v,
                  { x: xT1, y: yT1 },
                  { x: xT2, y: yT2 }
                );
              }
            }
          });
        }
      }
      if (!notBounced) {
        bullet.v = DC.bounceBullet(bullet.v, bounceAngle);
      }

      //towers
      let bAlive = true;
      for (let yM = -1; yM < 2; yM++) {
        for (let xM = -1; xM < 2; xM++) {
          DC.mapData.towerCluster[cO[0] + xM]?.[cO[1] + yM]?.forEach(
            (tower) => {
              if (tower.team != bullet.t && bAlive) {
                let distanceToBullet = getDistance2d(
                  tower.x,
                  tower.y,
                  bullet.p.x,
                  bullet.p.y
                );
                if (distanceToBullet < defly.BULLET_WIDTH + defly.TOWER_WIDTH) {
                  if(tower?.isShielded){
                    //get intersetion point
                    let iP = getLineCircleIntersections({radius:defly.BULLET_WIDTH + defly.TOWER_WIDTH,center:{x:tower.x,y:tower.y}},{p1:{x:bullet.p.x,y:bullet.p.y},p2:{x:bullet.p.x-bullet.v.x*DC.localDelta,y:bullet.p.y-bullet.v.y*DC.localDelta}});
                    bullet.p = iP[0] ? iP[0] : bullet.p;

                  } else {
                    bAlive = false;
                    bullet.l = 0;
                    if (tower.team != 1) {
                      tower.hp -= 1;//why does this work and not crash if -hp doesn't exist?? and why does it crash if I ask for ptional chaining?
                      if(!tower?.hp) DC.deleteTower(tower.id, { x: tower.x, y: tower.y });
                      else {
                        tower.damaged = 1-tower.hp/tower.maxHp;
                      }
                    } //only if not grey tower
                  }
                }
              }
            }
          );
        }
      }

      bullet.l -= DC.localDelta;
      if (bullet.l <= 0) fadedBullets.push(bIndex);
    });
    fadedBullets.forEach((bulletIndex, counter) => {
      DC.gameData.bullets.splice(bulletIndex - counter, 1);
    });
  },

  getBounceBulletAngle: function (bulletVector, t1, t2) {
    let sign = bulletVector.x < 0 ? 0 : 1;
    let alpha = Math.atan((t2.y - t1.y) / (t2.x - t1.x));
    let beta = sign * Math.PI - Math.atan(bulletVector.y / bulletVector.x);
    let gamma = Math.PI - alpha - beta;
    let delta = Math.PI - beta - 2 * gamma;
    //ONLY BOUNCE ONCE EVERY 2 TICS <-- add this (edit: idk)
    return delta;
  },
  bounceBullet: function (bulletVector, angle) {
    let velo = (bulletVector.x ** 2 + bulletVector.y ** 2) ** 0.5;

    return { x: Math.cos(angle) * velo, y: Math.sin(angle) * velo };
  },

  deleteTower: function (id, pos) {
    let cP = [this.coordToCluster(pos.x), this.coordToCluster(pos.y)],
      tower;
    this.mapData.towerCluster[cP[0]][cP[1]].forEach((t, idx) => {
      //copy tower for later use
      if (t.id == id) {
        tower = structuredClone(t);
        //delete tower
        this.mapData.towerCluster[cP[0]][cP[1]].splice(idx, 1);
        if(id == this.player.connectedTo.id) this.player.connectedTo.id = false;
      }
    });
    tower.connectedTo.forEach((con) => {
      this.mapData.wallCluster[cP[0]][cP[1]].forEach((wall, idx) => {
        if (wall.from.id == tower.id && wall.to.id == con.id) {
          //matching wall - delete
          this.mapData.wallCluster[cP[0]][cP[1]].splice(idx, 1);
        }
      });
      //why would I want to delete towers on the other side of the wall?? ;-;
    });
    tower.connectedFrom.forEach((con) => {
      let sCP = [this.coordToCluster(con.x), this.coordToCluster(con.y)];
      this.mapData.wallCluster[sCP[0]][sCP[1]].forEach((wall, idx) => {
        if (wall.from.id == con.id && wall.to.id == tower.id) {
          //matching wall - delete
          this.mapData.wallCluster[sCP[0]][sCP[1]].splice(idx, 1);
        }
      });
    });
    let areasToDelete = [];
    DC.mapData.areas[tower.team].forEach((area, index) => {
      let hasToBeDeleted = false;
      area.nodes.forEach((n) => {
        if (n.id == tower.id) hasToBeDeleted = true;
      });
      if (hasToBeDeleted) {
        areasToDelete.push(index);
      }
    });
    areasToDelete.forEach((index, counter) => {
      DC.mapData.areas[tower.team].splice(index - counter, 1);
    });
  },

  updateOtherStuff: function () {
    this.updateActiveItems();
    this.updateBuildPoint();
  },

  updateActiveItems: function(){
    let expieredItems = [];
    this.gameData.activeItems.forEach((i, idx) => {
      switch(i.type){
        case 'emp':{
          i.fuse -= .5*this.localDelta;
          if(i.fuse > 2){
            i.x += i.maxVelocity.x*(i.fuse-2)*this.localDelta;
            i.y += i.maxVelocity.y*(i.fuse-2)*this.localDelta;
          }
          i.fuse -= .5*this.localDelta;
          if(i.fuse <= 0) {
            //explode emp
            expieredItems.push(idx);
            this.explodeArea(i.x,i.y,i.radius,i.team);
          }
        }
      }
    });
    expieredItems.forEach((i,c) => {
      this.gameData.activeItems.splice(i-c,1);
    })
  },

  explodeArea: function(x,y,radius,team,invert=false){ //radius in units; invert = only explode from team
    let cO = this.getClusterOrigin({x:x,y:y});
    for(let yM=-radius-1;yM<=radius+1;yM++){
      for(let xM=-radius-1;xM<=radius+1;xM++){
        this.mapData.towerCluster[cO[0] + xM]?.[cO[1] + yM]?.forEach((t) => {
          if(t.team != 1 && (t.team==team)==invert && ((t.x-x)**2+(t.y-y)**2)**.5<=radius*defly.UNIT_WIDTH) {
            this.deleteTower(t.id,{x:t.x,y:t.y});
          }
        });
      }
    }
    this.animations.push({
      type: 'explosion',
      maxRadius: radius,
      currentRadius: 0,
      x: x,
      y: y,
    });
  },

  updateBuildPoint: function(x,y) {
    if(typeof (y) == 'number'){
      let v = [(x-camera.offset.x)*camera.zoom,(y-camera.offset.y)*camera.zoom],
          n = (v[0]**2+v[1]**2)**.5,
          b = this.player.tower.buildRange,
          m = n < b ? 1 : b / n,
          p = this.player.position;
      this.player.relativeBuildPoint.x = v[0] * m;
      this.player.relativeBuildPoint.y = v[1] * m;
      this.player.buildPoint.x = p.x + v[0] * m;
      this.player.buildPoint.y = p.y + v[1] * m;
    } else {
      let p = this.player.position;
      this.player.buildPoint.x = this.player.relativeBuildPoint.x + p.x;
      this.player.buildPoint.y = this.player.relativeBuildPoint.y + p.y;
    }
    this.player.buildPoint = this.snapPointIntoMap(this.player.buildPoint);
  },

  changePlayerTeam: function(newTeam) {
    let realTeam = newTeam < 1 ? 1 : newTeam > 14 ? 14 : Math.floor(newTeam);
    if(this.player.team != realTeam){
      this.player.team = realTeam;
      this.gameData.idToTeam[`id${this.player.id}`]=realTeam;
      this.player.connectedTo.id = false;
    }
    document.querySelector('#DC-menu-player-team').value = realTeam;
  },

  changeMode: function (newMode) {
    DC.selectDefuseCopter("basic"); //stats will be overwritten by non-defuse; expect bullet count
    switch (Number(newMode)) {
      case 0: {
        //ffa
        DC.gameMode = "ffa";
        for (let c = 1; c < 8; c++) {
          DC.upgradeCopter(c, 0);
        }
        DC.slideUpgradeBlock(1);
        DC.slideUpgradeBlock(0, 'DC-select-defuse-copter');
        break;
      }
      case 1: {
        //teams
        DC.gameMode = "teams";
        for (let c = 1; c < 8; c++) {
          DC.upgradeCopter(c, 0);
        }
        DC.slideUpgradeBlock(1);
        DC.slideUpgradeBlock(0, 'DC-select-defuse-copter');
        break;
      }
      case 2: {
        //defuse
        DC.gameMode = "defuse";
        for (let c = 5; c < 8; c++) {
          DC.upgradeCopter(c, 0);
        }
        DC.slideUpgradeBlock(0);
        DC.slideUpgradeBlock(1, 'DC-select-defuse-copter');
        break;
      }
    }
  },

  slideUpgradeBlock: function(in_view, target='DC-upgrade-block'){
    let e = document.querySelector(`#${target}`),
      action = ['add', 'remove'],
      m = in_view ?? e.classList.contains('slided-in') ? 0 : 1;
    e.classList[action[m++%2]]('slided-in');
    e.classList[action[m%2]]('slided-out');
  },

  reloadMap: function () {
    //load permanent map data into running map data
    DC.resetMapData();
    let mD = DC.mapData;
    mD.width = DC.permanentMapData.width;
    mD.height = DC.permanentMapData.height;
    for (let c = 0; c <= mD.width / defly.UNIT_WIDTH; c++) {
      mD.towerCluster.push([]);
      mD.wallCluster.push([]);
      for (let i = 0; i <= mD.height / defly.UNIT_WIDTH; i++) {
        mD.towerCluster[c].push([]);
        mD.wallCluster[c].push([]);
      }
    }
    mD.shape = DC.permanentMapData.shape;
    mD.bounds = DC.permanentMapData.bounds;
    const coordToCluster = (coord) => Math.floor(coord / defly.UNIT_WIDTH);
    DC.permanentMapData.towers.forEach((tSet, team) => {
      tSet.forEach((t) => {
        let data = {
          x: t.x,
          y: t.y,
          id: t.id,
          team: team,
          connectedTo: [],
          connectedFrom: [],
        };
        if (t?.isKothTower) data.isKothTower = true;
        mD.towerCluster[coordToCluster(data.x)][coordToCluster(data.y)].push(
          data
        );
        if(DC.highestId < t.id) DC.highestId = t.id;
      });
    });
    DC.permanentMapData.bombs.forEach((b) => {
      mD.bombs.push({ x: b.x, y: b.y });
    });
    DC.permanentMapData.spawns.forEach((s) => {
      mD.spawns.push({ t: s.t, x: s.x, y: s.y, rotation: s.rotation });
    });
    DC.permanentMapData.walls.forEach((wSet, team) => {
      wSet.forEach((w) => {
        let data = {
          from: { x: w.from.x, y: w.from.y, id: w.from.id },
          to: { x: w.to.x, y: w.to.y, id: w.to.id },
          team: team,
        };
        if (w?.isKothWall) data.isKothWall = true;
        let wallLength = getDistance2d(
          data.from.x,
          data.from.y,
          data.to.x,
          data.to.y
        );
        if (wallLength > defly.MAX_WALL_LENGTH) {
          //if teams wall: has to be fixed on breaking (e.g. split wall on build)
          let sections = Math.floor(wallLength / defly.MAX_WALL_LENGTH) + 1,
            wallVector = [
              (data.to.x - data.from.x) / sections,
              (data.to.y - data.from.y) / sections,
            ];
          for (let c = 0; c < sections; c++) {
            //!here
            let dataCopy = structuredClone(data);
            dataCopy.from.x = data.from.x + wallVector[0] * c;
            dataCopy.from.y = data.from.y + wallVector[1] * c;
            dataCopy.to.x = dataCopy.from.x + wallVector[0];
            dataCopy.to.y = dataCopy.from.y + wallVector[1];
            dataCopy.from.id = c ? `0${c}${w.from.id}` : data.from.id;
            dataCopy.to.id =
              c + 1 < sections ? `0${c + 1}${w.from.id}` : data.to.id;
            if (c + 1 < sections)
              this.placeTower(
                dataCopy.to.x,
                dataCopy.to.y,
                data.team,
                dataCopy.to.id
              );
            mD.wallCluster[coordToCluster(dataCopy.from.x)][
              coordToCluster(dataCopy.from.y)
            ].push(dataCopy);
            this.pushNewWallConnections(
              { x: dataCopy.from.x, y: dataCopy.from.y, id: dataCopy.from.id },
              { x: dataCopy.to.x, y: dataCopy.to.y, id: dataCopy.to.id }
            );
          }
        } else {
          mD.wallCluster[coordToCluster(data.from.x)][
            coordToCluster(data.from.y)
          ].push(data);
          this.pushNewWallConnections(
            { x: data.from.x, y: data.from.y, id: data.from.id },
            { x: data.to.x, y: data.to.y, id: data.to.id }
          );
        }
      });
    });
    DC.permanentMapData.areas.forEach((aSet, team) => {
      aSet.forEach((a) => {
        let data = {
          length: a.length,
          nodes: structuredClone(a.nodes),
        };
        a.nodes.forEach((n) => {
          this.mapData.towerCluster[DC.coordToCluster(n.x)][
            DC.coordToCluster(n.y)
          ].forEach((t) => {
            if (t.id == n.id) {
              t.isShielded = true;
            }
          });
        });
        if (a?.isKothArea) data.isKothArea = true;
        mD.areas[team].push(data);
      });
    });
    DC.player.connectedTo.id = false;
  },
  pushNewWallConnections: function(from, to) {
    let mD = this.mapData,
      coordToCluster = (coord) => Math.floor(coord / defly.UNIT_WIDTH);
    mD.towerCluster[coordToCluster(to.x)][coordToCluster(to.y)].forEach(
      (t) => {
        if (t.id == to.id) {
          t.connectedFrom.push({ x: from.x, y: from.y, id: from.id });
        }
      }
    );
    mD.towerCluster[coordToCluster(from.x)][coordToCluster(from.y)].forEach(
      (t) => {
        if (t.id == from.id) {
          t.connectedTo.push({ x: to.x, y: to.y, id: to.id });
        }
      }
    );
  },

  selectDefuseCopter: function (newCopter) {
    document
      .querySelector(`#DC-select-defuse-copter > .DC-copter-selected`)
      .classList.remove("DC-copter-selected");
    DC.player.copter = structuredClone(defly.defuseCopter[newCopter]);
    document
      .querySelector(`#DC-select-defuse-${newCopter}`)
      .classList.add("DC-copter-selected");
  },

  upgradeCopter: function (upgrade, value) {
    switch (upgrade) {
      case 1: {
        //player speed
        let points = document.querySelectorAll(
            "#DC-upgrade-copter-speed .DC-upgrade-boxes > span"
          ),
          newVal =
            points[value - 1]?.classList.contains("active") &&
            (value == 8 || !points[value]?.classList.contains("active"))
              ? value - 1
              : value;
        this.player.copter.copterSpeed = 132 + (64 / 8) * newVal; //very rough approximation...
        for (let c = 0; c < 8; c++) {
          if (c < newVal) points[c].classList.add("active");
          else points[c].classList.remove("active");
        }
        break;
      }
      case 2: {
        //bullet range
        let points = document.querySelectorAll(
            "#DC-upgrade-bullet-range .DC-upgrade-boxes > span"
          ),
          newVal =
            points[value - 1]?.classList.contains("active") &&
            (value == 8 || !points[value]?.classList.contains("active"))
              ? value - 1
              : value;
        this.player.copter.bulletLifespan = 1.9 + (1 / 8) * newVal; //very rough approximation...
        for (let c = 0; c < 8; c++) {
          if (c < newVal) points[c].classList.add("active");
          else points[c].classList.remove("active");
        }
        break;
      }
      case 3: {
        //bullet speed
        let points = document.querySelectorAll(
            "#DC-upgrade-bullet-speed .DC-upgrade-boxes > span"
          ),
          newVal =
            points[value - 1]?.classList.contains("active") &&
            (value == 8 || !points[value]?.classList.contains("active"))
              ? value - 1
              : value;
        this.player.copter.bulletSpeed = 200 + (100 / 8) * newVal; //very rough approximation...
        for (let c = 0; c < 8; c++) {
          if (c < newVal) points[c].classList.add("active");
          else points[c].classList.remove("active");
        }
        break;
      }
      case 4: {
        //reload speed
        let points = document.querySelectorAll(
            "#DC-upgrade-reload-speed .DC-upgrade-boxes > span"
          ),
          newVal =
            points[value - 1]?.classList.contains("active") &&
            (value == 8 || !points[value]?.classList.contains("active"))
              ? value - 1
              : value;
        this.player.copter.reloadTime = 0.7 - (0.3 / 8) * newVal; //very rough approximation...
        for (let c = 0; c < 8; c++) {
          if (c < newVal) points[c].classList.add("active");
          else points[c].classList.remove("active");
        }
        break;
      }
      case 5: {
        //build range
        let points = document.querySelectorAll(
            "#DC-upgrade-build-range .DC-upgrade-boxes > span"
          ),
          newVal =
            points[value - 1]?.classList.contains("active") &&
            (value == 8 || !points[value]?.classList.contains("active"))
              ? value - 1
              : value;
        this.player.tower.buildRange = 0.5 * defly.UNIT_WIDTH * newVal; //very rough approximation...
        for (let c = 0; c < 8; c++) {
          if (c < newVal) points[c].classList.add("active");
          else points[c].classList.remove("active");
        }
        break;
      }
      case 6: {
        //tower shield
        let points = document.querySelectorAll(
            "#DC-upgrade-tower-shield .DC-upgrade-boxes > span"
          ),
          newVal =
            points[value - 1]?.classList.contains("active") &&
            (value == 8 || !points[value]?.classList.contains("active"))
              ? value - 1
              : value;
        for (let c = 0; c < 8; c++) {
          if (c < newVal) points[c].classList.add("active");
          else points[c].classList.remove("active");
        }
        break;
      }
      case 7: {
        //tower health
        let points = document.querySelectorAll(
            "#DC-upgrade-tower-health .DC-upgrade-boxes > span"
          ),
          newVal =
            points[value - 1]?.classList.contains("active") &&
            (value == 8 || !points[value]?.classList.contains("active"))
              ? value - 1
              : value;
        this.player.tower.health = Math.floor(1+value/2);
        for (let c = 0; c < 8; c++) {
          if (c < newVal) points[c].classList.add("active");
          else points[c].classList.remove("active");
        }
        break;
      }
    }
  },

  resetMapData: function (resetAll) {
    if (resetAll) {
      DC.permanentMapData = {
        width: 1000,
        height: 1000,
        towers: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
        walls: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
        areas: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
        bombs: [],
        spawns: [],
      };
    }
    DC.mapData = {
      width: 1000,
      height: 1000,
      towers: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
      towerCluster: [],
      walls: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
      wallCluster: [],
      areas: [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
      bombs: [],
      spawns: [],
    };
    DC.highestId = 0;
  },

  draw: function () {
    //clear canvas
    ctx.fillStyle = DME.visuals.map_BGC;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let z = camera.zoom,
      q = camera.quality;
    //draw map background
    ctx.fillStyle = DME.visuals.grid_BGC;
    ctx.fillRect(
      camera.relative.x(0),
      camera.relative.y(0),
      (DME.mapData.width / z) * q,
      (DME.mapData.height / z) * q
    );
    ctx.strokeStyle = DME.visuals.grid_lineC;
    if (Number(DME.visuals.grid_line_width)) {
      ctx.lineWidth = (DME.visuals.grid_line_width / z) * q;
      ctx.beginPath();
      let w = DME.mapData.width;
      let h = DME.mapData.height;
      for (c = defly.GRID_WIDTH; c < w; c += defly.GRID_WIDTH) {
        ctx.moveTo(camera.relative.x(c), camera.relative.y(0));
        ctx.lineTo(camera.relative.x(c), camera.relative.y(h));
      }
      for (c = defly.GRID_WIDTH; c < h; c += defly.GRID_WIDTH) {
        ctx.moveTo(camera.relative.x(0), camera.relative.y(c));
        ctx.lineTo(camera.relative.x(w), camera.relative.y(c));
      }
      ctx.stroke();
    }
    ctx.lineWidth = (1 + 1 / z) * q;
    switch (DC.mapData.shape) {
      case 0: {
        //rectangle
        ctx.strokeRect(
          camera.relative.x(0),
          camera.relative.y(0),
          (DME.mapData.width / z) * q,
          (DME.mapData.height / z) * q
        );
        break;
      }
      case 1: {
        //hexagon
        ctx.beginPath();
        let w = DME.mapData.width,
          h = DME.mapData.height;
        ctx.moveTo(camera.relative.x(w / 4), camera.relative.y(0));
        ctx.lineTo(camera.relative.x((w * 3) / 4), camera.relative.y(0));
        ctx.lineTo(camera.relative.x(w), camera.relative.y(h / 2));
        ctx.lineTo(camera.relative.x((w * 3) / 4), camera.relative.y(h));
        ctx.lineTo(camera.relative.x(w / 4), camera.relative.y(h));
        ctx.lineTo(camera.relative.x(0), camera.relative.y(h / 2));
        ctx.closePath();
        ctx.stroke();
        break;
      }
      case 2: {
        //circle
        let w = DME.mapData.width,
          h = DME.mapData.height;
        ctx.beginPath();
        ctx.arc(
          camera.relative.x(w / 2),
          camera.relative.y(h / 2),
          (w / 2 / z) * q,
          2 * Math.PI,
          false
        );
        ctx.stroke();
        break;
      }
    }

    let mc = DME.mouseCoords.snapped;
    let [pX, pY] = [
      camera.relative.x(this.player.position.x),
      camera.relative.y(this.player.position.y),
    ],
      [bX, bY] = [camera.relative.x(this.player.buildPoint.x),camera.relative.y(this.player.buildPoint.y)];
    let cO = this.getClusterOrigin();

    let wallWidth = defly.WALL_WIDTH / z;
    let towerWidth = defly.TOWER_WIDTH / z;

    //draw animations - positioning in draw loop may change
    let expieredAnimations = [];
    DC.animations.forEach((a,idx) => {
      switch(a.type){
        case 'explosion':{
          a.currentRadius+=a.maxRadius*DC.rawDelta/.5; //'1' = animation time in s
          if(a.currentRadius > a.maxRadius) {
            a.currentRadius = a.maxRadius;
            expieredAnimations.push(idx);
          }
          let p = {
            x: camera.relative.x(a.x),
            y: camera.relative.y(a.y),
          };
          ctx.fillStyle = `rgba(255,90,0,${1-a.currentRadius/a.maxRadius})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, a.currentRadius * defly.UNIT_WIDTH * q, 2 * Math.PI, false);
          ctx.fill();
          break;
        }
      }
    });
    expieredAnimations.forEach((a,c) => {
      DC.animations.splice(a-c,1);
      console.log('terminated animation...');
    });

    //draw areas
    DC.mapData.areas.forEach((areaSet, idx) => {
      areaSet.forEach((area) => {
        ctx.fillStyle = defly.colors.faded[area?.isKothArea ? "koth" : idx];
        ctx.beginPath();
        ctx.moveTo(
          camera.relative.x(area.nodes[0].x),
          camera.relative.y(area.nodes[0].y)
        );
        area.nodes.forEach((node) => {
          ctx.lineTo(camera.relative.x(node.x), camera.relative.y(node.y));
        });
        ctx.fill();
      });
    });

    //draw walls
    for (let yM = -52; yM < 53; yM++) {
      for (let xM = -67; xM < 68; xM++) {
        DC.mapData.wallCluster[cO[0] + xM]?.[cO[1] + yM]?.forEach((wall) => {
          let color = wall?.isKothWall ? "koth" : wall.team;
          ctx.lineWidth = wallWidth * q;
          ctx.strokeStyle = defly.colors.darkened[color];
          ctx.beginPath();
          ctx.moveTo(
            camera.relative.x(wall.from.x),
            camera.relative.y(wall.from.y)
          );
          ctx.lineTo(
            camera.relative.x(wall.to.x),
            camera.relative.y(wall.to.y)
          );
          ctx.stroke();
          //draw wall twice, once bit darker to create the darkened edge of the wall
          ctx.strokeStyle = defly.colors.standard[color];
          ctx.lineWidth = (wallWidth - 4 / z) * q;
          ctx.beginPath();
          ctx.moveTo(
            camera.relative.x(wall.from.x),
            camera.relative.y(wall.from.y)
          );
          ctx.lineTo(
            camera.relative.x(wall.to.x),
            camera.relative.y(wall.to.y)
          );
          ctx.stroke();
        });
      }
    }
    //draw wall preview \/
    if (
      typeof this.player.connectedTo.id !== "boolean" &&
      !this.player.isShooting
    ) {
      let ct = this.player.connectedTo,
        length = getDistance2d(
          this.player.buildPoint.x,
          this.player.buildPoint.y,
          ct.x,
          ct.y
        );
      if (length < 15 * defly.GRID_WIDTH) {
        let gA = ctx.globalAlpha,
          widthModif =
            length < 12 * defly.GRID_WIDTH
              ? 1
              : (15 * defly.GRID_WIDTH - length) / (3 * defly.GRID_WIDTH);
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = defly.colors.standard[this.player.team];
        ctx.lineWidth = (wallWidth - 4 / z) * widthModif * q;
        ctx.beginPath();
        ctx.moveTo(camera.relative.x(ct.x), camera.relative.y(ct.y));
        ctx.lineTo(bX, bY);
        ctx.stroke();
        let borderLines = calculateParallelLines(
          [bX, bY],
          [camera.relative.x(ct.x), camera.relative.y(ct.y)],
          (wallWidth / 2 - 1 / z) * widthModif * q
        );
        ctx.strokeStyle = defly.colors.darkened[this.player.team];
        ctx.lineWidth = (2 / z) * widthModif * q;
        ctx.beginPath();
        ctx.moveTo(borderLines.line1[0][0], borderLines.line1[0][1]);
        ctx.lineTo(borderLines.line1[1][0], borderLines.line1[1][1]);
        ctx.moveTo(borderLines.line2[0][0], borderLines.line2[0][1]);
        ctx.lineTo(borderLines.line2[1][0], borderLines.line2[1][1]);
        ctx.stroke();
        ctx.globalAlpha = gA;
      }
    }

    //draw towers
    for (let yM = -22; yM < 23; yM++) {
      for (let xM = -37; xM < 38; xM++) {
        DC.mapData.towerCluster[cO[0] + xM]?.[cO[1] + yM]?.forEach((tower) => {
          let t = {
            x: camera.relative.x(tower.x),
            y: camera.relative.y(tower.y),
          };
          ctx.fillStyle = tower?.isKothTower
            ? "rgb(70, 52, 14)"
            : defly.colors.darkened[tower.team];
          ctx.beginPath();
          ctx.arc(t.x, t.y, towerWidth * q, 2 * Math.PI, false);
          ctx.fill();
          //draw tower twice, once bit darker to create the darkened edge of the tower, just like wall
          ctx.fillStyle = tower?.isKothTower
            ? "rgb(195,143,39)"
            : defly.colors.standard[tower.team];
          ctx.beginPath();
          ctx.arc(t.x, t.y, (towerWidth - 2 / z) * q, 2 * Math.PI, false);
          ctx.fill();

          //if tower is shielded, draw shield
          if (tower?.isShielded && DME.visuals.showTowerShields) {
            ctx.shadowColor = "black";
            ctx.strokeStyle = defly.colors.faded[1];
            ctx.lineWidth = (2 / z) * q;
            ctx.shadowBlur = (3 / z) * q;
            ctx.beginPath();
            ctx.arc(t.x, t.y, (towerWidth + 2 / z) * q, 2 * Math.PI, false);
            ctx.stroke();
            ctx.shadowBlur = 0;
          }
          if (tower?.isKothTower) {
            let w = (defly.TOWER_WIDTH / z) * q;
            ctx.drawImage(
              defly.images.koth_crown,
              t.x - w,
              t.y - w,
              w * 2,
              w * 2
            );
          }
          if(tower?.damaged) {
            let w = (defly.TOWER_WIDTH / z) * q;
            ctx.fillStyle = 'rgb(10,150,10)';
            ctx.fillRect(t.x-2*w,t.y+1.5*w,4*w,w);
            ctx.fillStyle = 'rgb(20,230,20)';
            ctx.fillRect(t.x-2*w,t.y+1.5*w,4*w*(1-tower.damaged),w);
          }
        });
      }
    }
    DC.mapData.spawns.forEach((spawn, idx) => {
      let currentAlpha = ctx.globalAlpha;
      if (DC.gameMode != "defuse") ctx.globalAlpha = 0.2 * currentAlpha;
      let t = {
          x: camera.relative.x(spawn.x),
          y: camera.relative.y(spawn.y),
        },
        sS = ((4.5 * defly.UNIT_WIDTH) / z) * q,
        tS = (defly.TOWER_WIDTH / z) * q,
        col = spawn.t;
      ctx.fillStyle = defly.colors.faded[col];
      ctx.fillRect(t.x - sS, t.y - sS, 2 * sS, 2 * sS);
      //triangle, based on spawn rotation
      ctx.fillStyle = defly.colors.standard[col];
      ctx.beginPath();
      switch (spawn.rotation) {
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
      ctx.globalAlpha = currentAlpha;
    });
    DC.mapData.bombs.forEach((bomb, idx) => {
      let currentAlpha = ctx.globalAlpha;
      if (DC.gameMode != "defuse") ctx.globalAlpha = 0.2 * currentAlpha;
      let bombRadius = ((6 * defly.UNIT_WIDTH) / z) * q,
        t = {
          x: camera.relative.x(bomb.x),
          y: camera.relative.y(bomb.y),
        },
        img = idx ? defly.images.bombA : defly.images.bombB;
      ctx.drawImage(
        img,
        t.x - bombRadius,
        t.y - bombRadius,
        2 * bombRadius,
        2 * bombRadius
      );
      ctx.globalAlpha = currentAlpha;
    });
    DC.gameData.bullets.forEach((bullet) => {
      ctx.beginPath();
      ctx.fillStyle = defly.colors.standard[bullet.t];
      ctx.moveTo(camera.relative.x(bullet.p.x), camera.relative.y(bullet.p.y));
      ctx.arc(
        camera.relative.x(bullet.p.x),
        camera.relative.y(bullet.p.y),
        defly.BULLET_WIDTH * q,
        2 * Math.PI,
        false
      );
      ctx.fill();
    });
    DC.gameData.activeItems.forEach(i => {
      switch(i.type){
        case 'emp':{
          let width = defly.UNIT_WIDTH / z * q * 1.4,
            p = {
              x: camera.relative.x(i.x),
              y: camera.relative.y(i.y),
            },
            img = defly.images.emp,
            x = p.x,
            y = p.y,
            angle = -2*Math.PI*(((i.fuse-2)*.7)**2);
          if(i.fuse >= 2){
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.drawImage(img, -width / 2, -width / 2, width, width);
            ctx.rotate(-angle);
            ctx.translate(-x, -y);
          } else {
            ctx.drawImage(
              img,
              p.x - width/2,
              p.y - width/2,
              width,
              width
            );
          }
          break;
        }
      }
    })
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(pX, pY, (defly.PLAYER_WIDTH / z) * q, 2 * Math.PI, false);
    ctx.moveTo(pX, pY);
    ctx.lineTo(DC.player.aimingAt.x, DC.player.aimingAt.y);
    ctx.stroke();
    //draw tower preview \/
    if (!this.player.isShooting) {
      let gA = ctx.globalAlpha;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = defly.colors.standard[this.player.team];
      ctx.beginPath();
      ctx.arc(bX, bY, towerWidth * q, 2 * Math.PI, false);
      ctx.fill();
      //draw tower twice, once bit darker to create the darkened edge of the tower, just like wall
      ctx.lineWidth = (2 / z) * q;
      ctx.strokeStyle = defly.colors.standard[this.player.team];
      ctx.beginPath();
      ctx.arc(bX, bY, (towerWidth - 1 / z) * q, 2 * Math.PI, false);
      ctx.stroke();
      ctx.globalAlpha = gA;
    }

    //draw info
    let h = canvas.height;
    let w = canvas.width;
    ctx.fillStyle = "black";
    ctx.font = `${4 + 8 * q}px Verdana`;
    ctx.fillText(
      `display size: ${canvas.width}x${canvas.height}`,
      w - 150 * q,
      h - 70 * q
    );
    ctx.fillText(
      `frames/s: ${(1 / DC.rawDelta).toFixed(2)}`,
      w - 150 * q,
      h - 50 * q
    );
    ctx.fillText(`s/frame : ${DC.rawDelta}`, w - 150 * q, h - 30 * q);
  },

  enterEditMode: function(){
    DC.deConfig();
    switchSite('map-editor', 2);
  },

  toggleMenu: function(menu){
    let m = document.querySelector(`#DC-${menu}`);
    m.style.display = m.style.display == 'none' ? 'inline' : 'none';
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
    this.changeKeybind.element = document.querySelector(`#DC-ch-${key}`);
    this.changeKeybind.element.style.fontSize = "12px";
    this.changeKeybind.element.innerText = "press any key";
    this.changeKeybind.element.blur();
    onkeydown = function (event) {
      if (!DC.changeKeybind.isChanging) {
        return;
      }
      assignNewKeybind(event.key.toUpperCase());
      return;
    };
    onmousedown = function (event) {
      if (!DC.changeKeybind.isChanging) {
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
          : DC.specialKeyInputs.hasOwnProperty(newBindValue)
          ? DC.specialKeyInputs[newBindValue]
          : newBindValue;
      DC.changeKeybind.element.innerText = newBind;
      DC.changeKeybind.element.style.fontSize = "16px";
      DC.changeKeybind.isChanging = false;
      DC.hotkeys[DC.changeKeybind.binding] = newBind;
      DC.blockInput = false;
      DC.markDoubledKeybinds();
      return;
    }
  },
  markDoubledKeybinds: function () {
    let markedKeys = [],
      nonMarkedKeys = [],
      doubledKeys = [],
      hotkeyClone = [];
    idsClone = [];
    Object.entries(DC.hotkeys).forEach((key, idx) => {
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
      document.querySelector(`#DC-ch-${key}`).style.color = "red";
    });
    nonMarkedKeys.forEach((key) => {
      document.querySelector(`#DC-ch-${key}`).style.color = "black";
    });
  },
  resetKeybinds: function () {
    this.hotkeys = structuredClone(this.defaultHotkeys);
    Object.entries(this.hotkeys).forEach((entrie) => {
      let t = document.querySelector(`#DC-ch-${entrie[0]}`);
      if (t != undefined) {
        t.innerText = entrie[1];
      }
    });
  },

  handleInput: function (e) {
    if(DC.blockInput) return;
    let type, input, extra;
    switch (e.type) {
      case "mousedown": {
        type = "button_down";
        let mKeys = ["Left Click", "Middle Click", "Right Click"];
        input = mKeys?.[e.button] ? mKeys[e.button] : `Button ${e.button}`;
        break;
      }
      case "mouseup": {
        type = "button_up";
        let mKeys = ["Left Click", "Middle Click", "Right Click"];
        input = mKeys?.[e.button] ? mKeys[e.button] : `Button ${e.button}`;
        break;
      }
      case "wheel": {
        type = "button_down";
        e.preventDefault(); //not 100% sure whether that works here but ig it should
        input = e.deltaY > 0 ? "Scroll Down" : "Scroll Up";
        extra = e.deltaY;
        break;
      }
      case "dblclick": {
        type = "button_down";
        input = "Double Click";
        break;
      }
      case "mousemove": {
        type = "mouse_move";
        input = e;
        break;
      }
      case "keydown": {
        type = "button_down";
        input = DC.specialKeyInputs.hasOwnProperty(e.key) ? DC.specialKeyInputs[e.key] : e.key.toLocaleUpperCase();
        break;
      }
      case "keyup": {
        type = "button_up";
        input = e.key.toLocaleUpperCase();
        break;
      }
    }
    switch (type) {
      case "button_down": {
        switch (input) {
          case DC.hotkeys.MoveUp1:
          case DC.hotkeys.MoveUp2: {
            DC.player.velocity.yN = 1;
            break;
          }
          case DC.hotkeys.MoveLeft1:
          case DC.hotkeys.MoveLeft2: {
            DC.player.velocity.xN = 1;
            break;
          }
          case DC.hotkeys.MoveDown1:
          case DC.hotkeys.MoveDown2: {
            DC.player.velocity.yP = 1;
            break;
          }
          case DC.hotkeys.MoveRight1:
          case DC.hotkeys.MoveRight2: {
            DC.player.velocity.xP = 1;
            break;
          }
          case DC.hotkeys.shoot1:
          case DC.hotkeys.shoot2: {
            DC.player.isShooting = true;
            break;
          }
          case DC.hotkeys.build1:
          case DC.hotkeys.build2: {
            DC.player.wantsToBuild = true;
            break;
          }
          case DC.hotkeys.usePower1:
          case DC.hotkeys.usePower2: {
            DC.player.wantsToUsePower = true;
            break;
          }
          case "Double Click": {
            console.log("TPING");
            DC.player.position.x += DC.player.aimingAt.x - camera.offset.x;
            DC.player.position.y += DC.player.aimingAt.y - camera.offset.y;
            break;
          }
          case 'ESCAPE': {
            DC.enterEditMode();
            break;
          }
        }
        break;
      }
      case "button_up": {
        switch (input) {
          case DC.hotkeys.MoveUp1:
          case DC.hotkeys.MoveUp2: {
            DC.player.velocity.yN = 0;
            break;
          }
          case DC.hotkeys.MoveLeft1:
          case DC.hotkeys.MoveLeft2: {
            DC.player.velocity.xN = 0;
            break;
          }
          case DC.hotkeys.MoveDown1:
          case DC.hotkeys.MoveDown2: {
            DC.player.velocity.yP = 0;
            break;
          }
          case DC.hotkeys.MoveRight1:
          case DC.hotkeys.MoveRight2: {
            DC.player.velocity.xP = 0;
            break;
          }
          case DC.hotkeys.shoot1:
          case DC.hotkeys.shoot2: {
            DC.player.isShooting = false;
            break;
          }
        }
        break;
      }
      case "mouse_move": {
        DC.player.aimingAt.x = e.clientX;
        DC.player.aimingAt.y = e.clientY;
        DC.updateBuildPoint(e.clientX,e.clientY);
        break;
      }
    }
  },

  toggleAllEventListeners: function (on = true) {
    let modif = on ? "addEventListener" : "removeEventListener";
    canvas[modif]("mousedown", DC.handleInput);
    canvas[modif]("mouseup", DC.handleInput);
    canvas[modif]("wheel", DC.handleInput);
    canvas[modif]("dblclick", DC.handleInput);
    canvas[modif]("mousemove", DC.handleInput);

    document[modif]("keydown", DC.handleInput);
    document[modif]("keyup", DC.handleInput);
  },

  config: function () {
    switch (currentSite) {
      case "DME": {
        //remove map editor event listeners
        DME.toggleAllEventListeners(false);
        //take position & quality from editor
        DC.player.position = structuredClone(DME.focusPoint);
        camera.position = structuredClone(DME.focusPoint);
        camera.offset = structuredClone(DME.focusOffset);
        camera.quality = DME.visuals.quality;
        //transform map data
        DC.resetMapData(true);
        DC.permanentMapData.width = DME.mapData.width; //here
        DC.permanentMapData.height = DME.mapData.height;
        DC.permanentMapData.shape = DME.mapData.shape;
        DC.permanentMapData.bounds = DME.mapData.bounds;
        DME.mapData.towers.forEach((t) => {
          if (!t?.isNotTower) {
            let data = {
              x: t.x,
              y: t.y,
              id: t.id,
            };
            if (t?.isKothTower) data.isKothTower = true;
            DC.permanentMapData.towers[t.color].push(data);
          } else {
            if (t.id > -3) {
              DC.permanentMapData.bombs[2 + t.id] = { x: t.x, y: t.y };
            } else {
              DC.permanentMapData.spawns.push({
                t: 6 + t.id,
                x: t.x,
                y: t.y,
                rotation: t.rotation,
              });
            }
          }
        });
        DME.mapData.walls.forEach((w) => {
          try {
            let data = {
                from: { x: w.from.x, y: w.from.y, id: w.from.id },
                to: { x: w.to.x, y: w.to.y, id: w.to.id },
              },
              t = w.color;
            if (t == "koth") {
              t = 1;
              data.isKothWall = true;
            }
            DC.permanentMapData.walls[t].push(data);
          } catch {
            console.log(`Error - Color: ${w.color}`);
          }
        });
        DME.mapData.areas.forEach((a) => {
          let data = {
              length: a.length,
              nodes: structuredClone(a.nodes),
            },
            t = a.color;
          if (t == "koth") {
            t = 1;
            data.isKothArea = true;
          }
          DC.permanentMapData.areas[t].push(data);
        });
        break;
      }
      default: {
        break;
      }
    }
    DC.defaultHotkeys = structuredClone(DC.hotkeys);
    if(hasLocalStorage){
      if (!localStorage.getItem("DChotkeys")) {
        localStorage.setItem("DChotkeys", JSON.stringify(DC.hotkeys));
      } else {
        let storedHotkeys = JSON.parse(localStorage.getItem("DChotkeys"));
        console.log(storedHotkeys);
        Object.entries(storedHotkeys).forEach((key) => {
          if (DC.hotkeys.hasOwnProperty(key[0])) DC.hotkeys[key[0]] = key[1];
        });
      }
      Array.from(
        document.querySelectorAll("#DC-hotkey-menu > div > button")
      ).forEach((button) => {
        if (DC.hotkeys?.[button.id.replace("DC-ch-", "")]) {
          button.innerHTML = DC.hotkeys[button.id.replace("DC-ch-", "")];
        }
      });
      DC.markDoubledKeybinds();
    }

    camera.zoom = defly.STANDARD_ZOOM;
    DC.toggleAllEventListeners(true);
    currentSite = "DC";

    DC.reloadMap();
    DC.rawDelta = new Date().getTime();
    DC.updateLoop();
    DC.slideUpgradeBlock(1, DC.gameMode == 'defuse' ? 'DC-select-defuse-copter' : undefined);
  },

  deConfig: function () {
    //add map editor event listeners for clone event listeners
    DC.toggleAllEventListeners(false);
    //take position
    DME.focusPoint = structuredClone(DC.player.position);
    DC.slideUpgradeBlock(0);
    DC.slideUpgradeBlock(0, 'DC-select-defuse-copter');
    camera.zoom = DME.mapZoom;
    
    localStorage.setItem("DChotkeys", JSON.stringify(DC.hotkeys));
  },

  updateLoop: function () {
    if (currentSite == "DC") {
      //stop requesting new animation frames if site changed from defuse clone
      window.requestAnimationFrame(DC.updateLoop);
      let timeLog = { time: new Date().getTime() };
      DC.rawDelta = timeLog.time - DC.rawDelta;
      DC.gameTime += DC.rawDelta;
      DC.rawDelta /= 1000; //ms -> s
      timeLog.delta = DC.rawDelta;
      let counter = 0;
      do {
        DC.localDelta = DC.rawDelta > DC.MAX_DELTA ? DC.MAX_DELTA : DC.rawDelta;
        DC.updatePlayer();
        DC.updateBullets();
        DC.updateOtherStuff();
        DC.rawDelta -= DC.MAX_DELTA;
        counter++;
        if (counter > 1 && counter < 10)
          console.log(`Counter smh: ${counter} - Delta: ${DC.rawDelta}`);
      } while (DC.rawDelta > DC.MAX_DELTA && counter < 100);
      DC.rawDelta = timeLog.delta;
      DC.draw();
      DC.rawDelta = timeLog.time;
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

config();
