/*
js for Main Menu
as well as page transitions
and page setup
*/

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
  switch(instance){
    case 0:{
      fadeOutScreen();
      break;
    }
    case 1: {
      fadeOutScreen(0);
      t = 0;
      break;
    }
    case 2:{
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
  let urlSpec = window.location.href?.split('?')[1];
  if(urlSpec){
    switch(urlSpec){
      case 'map-editor':{
        switchSite(urlSpec, 1);
        break;
      }
    }
  }
}
window.onbeforeunload = () => {
  if (hasLocalStorage) {
    localStorage.setItem("current-page", currentPage);
    switch(currentSite){
      case 'DME':{
        localStorage.setItem('DMEauto-saved-map', DME.generateMapFile('compact'));
        localStorage.setItem('DMEhotkeys', JSON.stringify(DME.hotkeys));
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

function updateFOV() {
  switch (currentSite) {
    case "DME": {
      let w = window.innerWidth;
      let h = window.innerHeight;
      DME.focusOffset = {
        x: w / 2,
        y: h / 2,
      };
      canvas.width = w;
      canvas.height = h;
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
    },
    darkened: {
      1: "rgb(38,38,38)",
      2: "rgb(31,47,178)",
      3: "rgb(177,27,27)",
      4: "rgb(0,64,27)",
      5: "rgb(178,64,21)",
      6: "rgb(73,38,128)",
      7: "rgb(43,107,178)",
      8: "rgb(12,113,36)",
      9: "rgb(123,45,178)",
      10: "rgb(124,178,21)",
      11: "rgb(178,48,87)",
      12: "rgb(74,127,0)",
      13: "rgb(0,178,94)",
      14: "rgb(0,0,0)",
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
    },
  },
  BULLET_WIDTH: 7,
  WALL_WIDTH: 13,
  TOWER_WIDTH: 13,
  PLAYER_WIDTH: 5,
  GRID_WIDTH: 44,
  UNIT_WIDTH: 22, //GRID_WIDTH / 2
  MAX_WALL_LENGTH: 660, //GRID_WIDTH * 15
};

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
    Control: "CONTROL",
    Shift: "SHIFT",
    Enter: "ENTER",
    Delete1: "DELETE",
    Delete2: "",
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
    shadeArea2: '',
    b: "B",
    r: "R",
    m: "M",
    c: "C",
    v: "V",
    n: "N",
    z: "Z",
    y: "Y",
    w: "W",
    a: "A",
    s: "S",
    d: "D",
    x: "X",
    Plus: "+",
    Minus: "-",
    Zero: "0",
    One: "1",
    Two: "2",
    Three: "3",
    Four: "4",
  },
  changeKeybind: {
    isChanging: false,
    binding: '',
    element: '',
  },

  isKeyPressed: {
    CONTROL: false,
    SHIFT: false,
    ENTER: false,
    MoveUp: false,
    MoveDown: false,
    MoveLeft: false,
    MoveRight: false,
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

  openMenu: false,

  mapData: {
    width: 210 * defly.UNIT_WIDTH,
    height: 120 * defly.UNIT_WIDTH,
    towers: [], //{x : xPosition, y : yPosition, color : color, id : uniqueTowerId}
    walls: [], //{from : {x : xPosition, y : yPosition, id : towerId}, to : {x : xPosition, y : yPosition, id : towerId}, color : wallColor}
    areas: [], //{length : amountOfNodesInThatArea, color : areaColor(defined by first node's color), nodes : [{x : nodeXposition, y : nodeYposition, id : nodeTowerId}]}
  },
  highestId: 1,

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
    if (closestTower.distance < defly.TOWER_WIDTH) {
      towerId = this.mapData.towers[closestTower.index].id;
    } else {
      this.createTower(mc.x, mc.y, this.selectedColor, towerId);
    }
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
        this.createWall(id, towerId);
    });
    this.selectedTowers = [this.getIndexFromId(towerId)];
    this.updateChunkOptions();
  },

  createTower: function (x, y, color, id) {
    DME.mapData.towers.push({ x: x, y: y, color: color, id: id });
    DME.highestId = id > DME.highestId ? id : DME.highestId + 1;
  },

  createWall: function (fromId, toId) {
    let tower1 = DME.getIndexFromId(fromId);
    let tower2 = DME.getIndexFromId(toId);
    let x1 = DME.mapData.towers[tower1].x;
    let y1 = DME.mapData.towers[tower1].y;
    let x2 = DME.mapData.towers[tower2].x;
    let y2 = DME.mapData.towers[tower2].y;
    let col = DME.mapData.towers[tower1].color;
    DME.mapData.walls.push({
      from: { x: x1, y: y1, id: fromId },
      to: { x: x2, y: y2, id: toId },
      color: col,
    });
  },

  placeArea: function () {
    let mc = this.mouseCoords.snapped;

    //get closest wall as area origin point
    let closestWall = {
      index: 0,
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
    let startingTowerId = this.mapData.walls[closestWall.index].from.id;
    let finishTowerId = this.mapData.walls[closestWall.index].to.id;

    //only keep going if close walls exist
    if (closestWall.distance === Infinity) return;

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

  createArea: function (ids) {
    console.log(`Area has been created with following ids: ${ids}`);
    let nodes = [];
    let towers = DME.mapData.towers;
    ids.forEach((id) => {
      let idx = DME.getIndexFromId(id);
      let x = towers[idx].x;
      let y = towers[idx].y;
      nodes.push({ x: x, y: y, id: id });
    });
    let color = towers[DME.getIndexFromId(ids[0])].color;
    DME.mapData.areas.push({ length: ids.length, color: color, nodes: nodes });
  },

  /*
  bomb
  &
  spawns
  go here
  ...
  */

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
      }
    });
  },

  updateAreas: function (ids = false) {
    this.mapData.areas.forEach((area) => {
      area.nodes.forEach((node) => {
        if (!ids || ids.includes(node.id)) {
          //matching tower id/should get updated
          let relativeTower = this.mapData.towers[this.getIndexFromId(node.id)];
          node.x = relativeTower.x;
          node.y = relativeTower.y;
          console.log(`Updating node (${node.id})`);
        }
      });
    });
  },

  resizeChunkByDrag: function (step) {
    let o = this.chunckOptions;
    let mc = this.mouseCoords.relative;
    switch (step) {
      case 0: {
        o.isChanging = true;
        o.co.x = mc.x;
        o.co.y = mc.y;
        break;
      }
      case 1: {
        let xDelta, yDelta, origin;
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
  resizeChunkByValue: function(type, value){
    let o = this.chunckOptions;
    let delta={x:value,y:1};
    let origin = {x:o.rx,y:o.ry};
    if(type[0]!=='fraction'){
      delta.x = value*defly.UNIT_WIDTH/(type[1] == 'x' ? o.rw : o.rh);
    }
    if(type[1]==='y'){
      delta.y = delta.x;
      delta.x = 1;
    }
    this.resizeChunk(delta.x,delta.y,origin);
  },
  resizeChunk: function (xDelta, yDelta, origin) {
    xDelta =
      xDelta == 0
        ? 0.0001
        : xDelta == Infinity
        ? 0.5
        : xDelta == -Infinity
        ? -0.5
        : xDelta;
    yDelta =
      yDelta == 0
        ? 0.0001
        : yDelta == Infinity
        ? 0.5
        : yDelta == -Infinity
        ? -0.5
        : yDelta;
    let s = !origin?.z;
    this.selectedTowers.forEach((towerIndex) => {
      let t = this.mapData.towers[towerIndex];
      if (s) {
        t.x = origin.x + (t.x - origin.x) * xDelta;
        t.y = origin.y + (t.y - origin.y) * yDelta;
      } else {
        t.x -= xDelta;
        t.y -= yDelta;
      }
    });
    let stID = [];
    this.selectedTowers.forEach((idx) => {
      stID.push(this.mapData.towers[idx].id);
    });
    this.updateWalls(stID);
    this.updateAreas(stID);
    this.updateChunkOptions();
  },

  selectTower: function () {
    let mc = this.mouseCoords.relative;
    let [x, y] = [mc.x, mc.y];
    if (this.isKeyPressed.SHIFT) {
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
          if (this.isKeyPressed.SHIFT) {
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

  deleteTowers: function () {
    this.selectedTowers.sort((a, b) => {
      return a - b;
    });
    this.selectedTowers.forEach((index, counter) => {
      let realIndex = index - counter;
      let id = this.mapData.towers[realIndex].id;
      this.mapData.towers.splice(realIndex, 1);
      let wallsToDelete = [];
      this.mapData.walls.forEach((wall, index) => {
        if (wall.from.id == id || wall.to.id == id) {
          wallsToDelete.push(index);
        }
      });
      wallsToDelete.forEach((index, counter) => {
        this.mapData.walls.splice(index - counter, 1);
      });
      let areasToDelete = [];
      this.mapData.areas.forEach((area, index) => {
        if (area.nodes.some((obj) => obj.id == id)) {
          areasToDelete.push(index);
        }
      });
      areasToDelete.forEach((index, counter) => {
        this.mapData.areas.splice(index - counter, 1);
      });
    });
    this.selectedTowers = [];
    this.updateChunkOptions();
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

  loadFile: function(input){
    let file = input.files[0];
    let reader = new FileReader();
  
    reader.readAsText(file);
  
    reader.onload = function () {
      console.log(reader.result);
      DME.loadMap(reader.result);
    };
  
    reader.onerror = function () {
      console.log(reader.error);
      alert('Error: failed loading map file');
      return;
    };
  },

  loadMap: function(mapData, dataType) {
    if(!dataType){
      //determine type
      dataType = mapData.split(/\n/).length == 1 && mapData.split('|').length == 6 ? 'compact' : undefined;
      console.log(`Row length: ${mapData.split(/\n/).length}; Argument length: ${mapData.split('|').length}`);
      console.log(mapData.split('|'));
      dataType = !dataType ?  mapData.split(/\n/).length == 1 && mapData.split(':')[0] == '{"name"' ? 'astrolly' : undefined : dataType;
      dataType = !dataType ? 'defly' : dataType;
    }
    let mapFile = mapData;
    console.log(mapFile);
    console.log(`Loading map - data type: ${dataType}`);
    //only if new map is loaded
    this.mapData.towers = [];
    this.mapData.walls = [];
    this.mapData.areas = [];
    this.selectedTowers = [];
    this.highestId = 1;
    switch (dataType) {
      case "defly": {
        let newMapData = mapFile.split(/\s+/);
        newMapData.forEach((identifier, position) => {
          switch (identifier) {
            case "MAP_WIDTH": {
              this.mapData.width = newMapData[position + 1] * defly.UNIT_WIDTH;
              break;
            }
            case "MAP_HEIGHT": {
              this.mapData.height = newMapData[position + 1] * defly.UNIT_WIDTH;
              break;
            }
            case "d": {
              let color = isNaN(Number(newMapData[position + 4]))
                ? 1
                : newMapData[position + 4];
              this.createTower(Number(newMapData[position + 2]) * defly.UNIT_WIDTH, Number(newMapData[position + 3]) * defly.UNIT_WIDTH, color, Number(newMapData[position + 1]));
              break;
            }
            case "l": {
              this.createWall(Number(newMapData[position + 1]), Number(newMapData[position + 2]));
              break;
            }
            case "z": {
              let ids = [];
              for (let c = 1; c < newMapData.length; c++) {
                let id = Number(newMapData[position + c]);
                if (isNaN(id) || (id < 0)) {
                  c = newMapData.length;
                  continue;
                }
                ids.push(id);
              }
              this.createArea(ids);
              break;
            }
            case "s": {
              //spawns - not here yet - stay tuned
              /*
              let team = {
                id: Number(newMapData[position + 1]),
              };
              team.name = team.id > 0 ? "red" : "blue";
              permanentMapData.spawns[team.id] = {
                x: Number(newMapData[position + 2]) * defly.UNIT_WIDTH - defly.UNIT_WIDTH / 2,
                y: Number(newMapData[position + 3]) * defly.UNIT_WIDTH - defly.UNIT_WIDTH / 2,
              };
              */
              break;
            }
            case "t": {
              //bomb spots - not here yet - stay tuned
              /*
              let type = {
                id: Number(newMapData[position + 1]),
              };
              type.type = type.id > 0 ? "b" : "a";
              permanentMapData.bombs[type.id] = {
                type: type.type,
                x: Number(newMapData[position + 2]) * defly.UNIT_WIDTH,
                y: Number(newMapData[position + 3]) * defly.UNIT_WIDTH,
              };
              */
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
  
        //koth bounds - not here yet - stay tuned
        //kothBounds = newMapData[1].split(",").length < 4 ? [] : newMapData[1].split(",");
  
        //bomb spots - not here yet - stay tuned
        /*
        let bombData = newMapData[2].split(",");
        for (let c = 0; bombData.length > c; c += 2) {
          permanentMapData.bombs[c / 2] = {
            type: c / 2 == 0 ? "a" : "b",
            x: bombData[0 + c] * defly.UNIT_WIDTH,
            y: bombData[1 + c] * defly.UNIT_WIDTH,
          };
        }
        */
  
        //defuse spawns - not here yet - stay tuned
        /*
        let spawnData = newMapData[3].split(",");
        for (let c = 0; spawnData.length > c; c += 3) {
          permanentMapData.spawns[c / 3 + 1] = {
            x: spawnData[0 + c] * defly.UNIT_WIDTH,
            y: spawnData[1 + c] * defly.UNIT_WIDTH,
          };
          //rotation: spawnData[2 + c],
        }
        */
  
        //towers (and walls)
        let towerData = newMapData[4].split(";");
        towerData.forEach((rawTower, index) => {
          let tower = rawTower.split(",");
          let color = tower[2] === "" ? 1 : tower[2];
          this.createTower(tower[0]*defly.UNIT_WIDTH,tower[1]*defly.UNIT_WIDTH,color,index+1);
          //walls
          for (let c = 3; c < tower.length; c++) {
            this.createWall(index+1,Number(tower[c]));//might be 'Number(tower[c])-1' - in case of crash try change
          }
        });
        this.updateWalls();
  
        //shading
        let shadingData = newMapData[5].split(";");
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
      case 'astrolly':{
        console.log(JSON.parse(mapFile));
        let newMapData = JSON.parse(mapFile);
        this.mapData.width = newMapData.width;
        this.mapData.height = newMapData.height;
        Object.entries(newMapData.nodes).forEach(nV => {
          this.createTower(nV[1].x, nV[1].y, 1, nV[1].nodeId);
        });
        newMapData.edges.forEach(e => {
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
      default:{
        alert('Sorry, this map format is not supported yet!');
        break;
      }
    }
    //update displayed map size
    document.querySelector('#DME-input-map-width').value = this.mapData.width/defly.UNIT_WIDTH;
    document.querySelector('#DME-input-map-height').value = this.mapData.height/defly.UNIT_WIDTH;
  },

  generateMapFile: function(type='defly'){
    let d = this.getCleanMapCopy();
    let text = ``;
    switch(type){
      case 'defly':{
        text += `MAP_WIDTH ${d.width/defly.UNIT_WIDTH}`;
        text += `\nMAP_HEIGHT ${d.height/defly.UNIT_WIDTH}`;
        let t_text = ``;
        d.towers.forEach(t => {
          t_text += `\nd ${t.id} ${t.x/defly.UNIT_WIDTH} ${t.y/defly.UNIT_WIDTH}${t.color!=1?' '+t.color:''}`
        });
        let w_text = ``;
        d.walls.forEach(w => {
          w_text += `\nl ${w.from.id} ${w.to.id}`;
        });
        let a_text = ``;
        d.areas.forEach(a => {
          a_text += `\nz`;
          a.nodes.forEach(n => {
            a_text += ` ${n.id}`;
          });
        });
        text += `${t_text}${w_text}${a_text}`;
        break;
      }
      case 'compact':{
        text += `${d.width/defly.UNIT_WIDTH},${d.height/defly.UNIT_WIDTH}|${/*Koth bounds*/''}|${/*Defuse spawns*/''}|${/*Defuse bombs*/''}|`;
        cWalls = {};
        d.walls.forEach(w => {
          if(!Array.isArray(cWalls[w.from.id])) cWalls[w.from.id] = [];
          cWalls[w.from.id].push(w.to.id);
        });
        d.towers.forEach((t,c) => {
          text += `${c?';':''}${t.x/defly.UNIT_WIDTH},${t.y/defly.UNIT_WIDTH},${t.color==1?'':t.color}`;
          cWalls[c+1]?.forEach(w => {
            text += `,${w}`;
          });
        });
        text += `|`;
        d.areas.forEach((a,ac) => {
          a.nodes.forEach((n,nc) => {
            text += `${nc?',':ac?';':''}${n.id}`;
          });
        });
        break;
      }
      case 'astrolly':{
        alert('Not supported yet...');
        break;
      }
      default: {
        alert('Error: Unknown file type');
        break;
      }
    }
    return text;
  },

  getCleanMapCopy: function(){
    let copy = JSON.parse(JSON.stringify(this.mapData));
    let newId = {};
    copy.towers.forEach((t,c) => {
      newId[t.id] = c+1;
      t.id = c+1;
    });
    copy.walls.forEach(w => {
      w.from.id = newId[w.from.id];
      w.to.id = newId[w.to.id];
    });
    copy.areas.forEach(a => {
      a.nodes.forEach(n => {
        n.id = newId[n.id];
      });
    });
    return copy;
  },

  exportMap: function(){
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

  getIndexFromId: function (id) {
    let targetIndex = 0;
    DME.mapData.towers.forEach((tower, index) => {
      targetIndex = tower.id == id ? index : targetIndex;
    });
    return targetIndex;
  },

  changeKeybind: function(key){
    console.log(`Trying to update ${key}`);
    if(this.changeKeybind.isChanging){
      this.changeKeybind.element.innerText = this.hotkeys[this.changeKeybind.binding];
      this.changeKeybind.element.style.fontSize = '16px';
    }
    this.changeKeybind.isChanging = true;
    this.changeKeybind.binding = key;
    this.changeKeybind.element = document.querySelector(`#DME-ch-${key}`);
    this.changeKeybind.element.style.fontSize = '12px';
    this.changeKeybind.element.innerText = 'press any key';
    this.changeKeybind.element.blur();
    onkeydown = function (event) {
      if (!DME.changeKeybind.isChanging) {
        return;
      }
      let newBind = event.key.toUpperCase();
      newBind = newBind == 'ESCAPE' ? '' : newBind;
      DME.changeKeybind.element.innerText = newBind;
      DME.changeKeybind.element.style.fontSize = '16px';
      //markDoubleKeys();
      DME.changeKeybind.isChanging = false;
      DME.hotkeys[DME.changeKeybind.binding] = newBind;
      return;
    };
  },

  updateMouse: function (x, y) {
    this.updateMouseCoords(x, y);
    let o = this.chunckOptions;
    if (!o.active) return;
    let mc = this.mouseCoords.relative;
    let cP = {
      distance: 0,
      index: o.hovering - 1,
    };
    if (!o.isChanging) {
      cP.distance = Infinity;
      let sp = [];
      for (let h = 0; h <= 1; h += 0.5) {
        for (let w = 0; w <= 1; w += 0.5) {
          sp.push([o.rx + o.rw * w, o.ry + o.rh * h]);
        }
      }
      sp.splice(4, 1);
      sp.forEach((pos, index) => {
        let d = this.getDistance(mc.x, mc.y, pos[0], pos[1]);
        if (d < cP.distance) {
          cP.distance = d;
          cP.index = index;
        }
      });
    } else this.resizeChunkByDrag(1);
    let cS = "";
    switch (cP.index) {
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

  updateChunkOptions: function () {
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
  updateChunkSizeDisplay: function (xDelta, yDelta) {
    if (this.selectedTowers.length <= 1) {
      document.querySelector("#DME-resize-values").style.display = "none";
      return;
    }
    let newl = xDelta === undefined && yDelta === undefined ? true : false;
    let cO = this.chunckOptions;
    /*xDelta = xDelta ? xDelta : cO.rw;
    yDelta = yDelta ? yDelta : cO.rh;*/
    if(!newl && cO.hovering == 9) newl = true;
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

  relToFsPt: {
    x: (ogX) => (ogX - DME.focusPoint.x) / DME.mapZoom + DME.focusOffset.x,
    y: (ogY) => (ogY - DME.focusPoint.y) / DME.mapZoom + DME.focusOffset.y,
    /*x : (ogX) => ogX + DME.focusOffset.x * DME.mapZoom - DME.focusPoint.x,
    y : (ogY) => ogY + DME.focusOffset.y * DME.mapZoom - DME.focusPoint.y,*/
  },

  draw: function () {
    //clear canvas
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#E0E0E0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let mz = this.mapZoom;

    //draw map background
    ctx.fillStyle = "#EEEEEE";
    ctx.fillRect(
      this.relToFsPt.x(0),
      this.relToFsPt.y(0),
      this.mapData.width / mz,
      this.mapData.height / mz
    );
    ctx.strokeStyle = "#999";
    ctx.beginPath();
    ctx.lineWidth = 1 / mz;
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
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1 + 1 / mz;
    ctx.strokeRect(
      this.relToFsPt.x(0),
      this.relToFsPt.y(0),
      this.mapData.width / mz,
      this.mapData.height / mz
    );

    let mc = this.mouseCoords.snapped;
    let [mcX, mcY] = [this.relToFsPt.x(mc.x), this.relToFsPt.y(mc.y)];

    let wallWidth = defly.WALL_WIDTH / mz;
    let towerWidth = defly.TOWER_WIDTH / mz;

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
      ctx.lineWidth = wallWidth;
      ctx.strokeStyle = defly.colors.darkened[wall.color];
      ctx.beginPath();
      ctx.moveTo(this.relToFsPt.x(wall.from.x), this.relToFsPt.y(wall.from.y));
      ctx.lineTo(this.relToFsPt.x(wall.to.x), this.relToFsPt.y(wall.to.y));
      ctx.stroke();
      //draw wall twice, once bit darker to create the darkened edge of the wall
      ctx.strokeStyle = defly.colors.standard[wall.color];
      ctx.lineWidth = wallWidth - 4 / mz;
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
        ctx.strokeStyle = defly.colors.standard[tower.color];
        ctx.lineWidth = wallWidth - 4 / mz;
        ctx.beginPath();
        ctx.moveTo(this.relToFsPt.x(tower.x), this.relToFsPt.y(tower.y));
        ctx.lineTo(mcX, mcY);
        ctx.stroke();
        let borderLines = calculateParallelLines(
          [mcX, mcY],
          [this.relToFsPt.x(tower.x), this.relToFsPt.y(tower.y)],
          wallWidth / 2 - 1 / mz
        );
        ctx.strokeStyle = defly.colors.darkened[tower.color];
        ctx.lineWidth = 2 / mz;
        ctx.beginPath();
        ctx.moveTo(borderLines.line1[0][0], borderLines.line1[0][1]);
        ctx.lineTo(borderLines.line1[1][0], borderLines.line1[1][1]);
        ctx.moveTo(borderLines.line2[0][0], borderLines.line2[0][1]);
        ctx.lineTo(borderLines.line2[1][0], borderLines.line2[1][1]);
        ctx.stroke();
      });
      ctx.globalAlpha = gA;
    }

    //draw towers
    DME.mapData.towers.forEach((tower, index) => {
      let t = {
        x: this.relToFsPt.x(tower.x),
        y: this.relToFsPt.y(tower.y),
      };
      if (this.selectedTowers.includes(index)) {
        ctx.fillStyle = "rgba(230, 50, 50, 0.6)";
        ctx.beginPath();
        ctx.arc(t.x, t.y, towerWidth + 10, 2 * Math.PI, false);
        ctx.fill();
      }
      ctx.fillStyle = defly.colors.darkened[tower.color];
      ctx.beginPath();
      ctx.arc(t.x, t.y, towerWidth, 2 * Math.PI, false);
      ctx.fill();
      //draw tower twice, once bit darker to create the darkened edge of the tower, just like wall
      ctx.fillStyle = defly.colors.standard[tower.color];
      ctx.beginPath();
      ctx.arc(t.x, t.y, towerWidth - 2 / mz, 2 * Math.PI, false);
      ctx.fill();
    });
    //draw tower preview
    if (!this.selectingChunk.isSelecting) {
      let gA = ctx.globalAlpha;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = defly.colors.standard[this.selectedColor];
      ctx.beginPath();
      ctx.arc(mcX, mcY, towerWidth, 2 * Math.PI, false);
      ctx.fill();
      //draw tower twice, once bit darker to create the darkened edge of the tower, just like wall
      ctx.lineWidth = 2 / mz;
      ctx.strokeStyle = defly.colors.standard[this.selectedColor];
      ctx.beginPath();
      ctx.arc(mcX, mcY, towerWidth - 1 / mz, 2 * Math.PI, false);
      ctx.stroke();
      ctx.globalAlpha = gA;
    }

    if (this.chunckOptions.active) {
      let d = this.chunckOptions;

      ctx.strokeStyle = "rgba(170, 90, 30, 0.8)";
      ctx.lineDashOffset = 4;
      ctx.lineWidth = d.vsw;
      ctx.strokeRect(d.vx, d.vy, d.vw, d.vh);

      ctx.lineDashOffset = 0;
      ctx.lineWidth = d.vsw / 2;
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
      ctx.lineWidth = 5;
      ctx.fillStyle = "rgba(230, 130, 40, 0.4)";
      let s = this.selectingChunk.origin;
      let w = (this.mouseCoords.relative.x - s.x) / mz;
      let h = (this.mouseCoords.relative.y - s.y) / mz;
      ctx.fillRect(this.relToFsPt.x(s.x), this.relToFsPt.y(s.y), w, h);
      ctx.strokeRect(this.relToFsPt.x(s.x), this.relToFsPt.y(s.y), w, h);
    }
  },

  config: function () {
    if (hasLocalStorage) {
      if (!localStorage.getItem("DMEhotkeys")) {
        localStorage.setItem("DMEhotkeys", JSON.stringify(DME.hotkeys));
      } else {
        let storedHotkeys = JSON.parse(localStorage.getItem("DMEhotkeys"));
        console.log(storedHotkeys);
        Object.entries(storedHotkeys).forEach((key) => {
          DME.hotkeys[key[0]] = key[1];
        });
      }
      Array.from(document.querySelectorAll("#DME-hotkey-menu > div > button")).forEach(
        (button) => {
          if(DME.hotkeys?.[button.id.replace("DME-ch-", "")]){
          button.innerHTML =
            DME.hotkeys[button.id.replace("DME-ch-", "")];
          }
        }
      );
      if (!localStorage.getItem("DMEauto-saved-map")) {
        localStorage.setItem(
          "DMEauto-saved-map",
          "MAP_WIDTH 210 MAP_HEIGHT 120"
        );
      } else {
        DME.loadMap(
          localStorage.getItem("DMEauto-saved-map"),
          "compact"
        );
      }

      if (!localStorage.getItem("DMEsaved-map-list")) {
        localStorage.setItem("DMEsaved-map-list", JSON.stringify(["Empty"]));
      }
    }
    /**/ //local storage not needed rn
    canvas.classList.remove("hidden");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.addEventListener("mousedown", (e) => {
      switch (e.button) {
        case 0: {
          if (this.chunckOptions.hovering) {
            this.resizeChunkByDrag(0);
          } else this.selectTower();
          break;
        }
        case 1: {
          this.selectChunk(0);
          break;
        }
        case 2: {
          if(!this.chunckOptions.hovering) this.placeTower();
          break;
        }
      }
    });
    canvas.addEventListener("mouseup", (e) => {
      switch (e.button) {
        case 0: {
          if (this.chunckOptions.isChanging) {
            this.resizeChunkByDrag(2);
          }
          break;
        }
        case 1: {
          this.selectChunk(1);
          break;
        }
        case 2: {
          break;
        }
      }
    });
    canvas.addEventListener("wheel", (e) => {
      //zoom value realtive to mouse sensitivity
      let v = e.deltaY / 1250;
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
    });
    canvas.addEventListener("mousemove", (e) => {
      this.updateMouse(e.clientX, e.clientY);
    });
    document.addEventListener("keydown", (e) => {
      //console.log(e.key.toLocaleUpperCase());
      //ignore hotkeys if a menu is open
      if (this.openMenu) return;
      switch (e.key.toLocaleUpperCase()) {
        case this.hotkeys.Control: {
          this.isKeyPressed.CONTROL = true;
          break;
        }
        case this.hotkeys.Shift: {
          this.isKeyPressed.SHIFT = true;
          break;
        }
        case this.hotkeys.Enter: {
          this.isKeyPressed.ENTER = true;
          break;
        }
        case this.hotkeys.toggleSnap1:
        case this.hotkeys.toggleSnap2: {
          let c = document.querySelector(
            "#DME-toggle-snapping-checkbox"
          ).checked;
          document.querySelector("#DME-toggle-snapping-checkbox").checked = !c;
          this.snapping = !c;
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
        case this.hotkeys.MoveUp1:
        case this.hotkeys.MoveUp2: {
          this.isKeyPressed.MoveUp = true;
          break;
        }
        case this.hotkeys.MoveDown1:
        case this.hotkeys.MoveDown2: {
          this.isKeyPressed.MoveDown = true;
          break;
        }
        case this.hotkeys.MoveLeft1:
        case this.hotkeys.MoveLeft2: {
          this.isKeyPressed.MoveLeft = true;
          break;
        }
        case this.hotkeys.MoveRight1:
        case this.hotkeys.MoveRight2: {
          this.isKeyPressed.MoveRight = true;
          break;
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      switch (e.key.toLocaleUpperCase()) {
        case this.hotkeys.Control: {
          this.isKeyPressed.CONTROL = false;
          break;
        }
        case this.hotkeys.Shift: {
          this.isKeyPressed.SHIFT = false;
          break;
        }
        case this.hotkeys.Enter: {
          this.isKeyPressed.ENTER = false;
          break;
        }
        case this.hotkeys.toggleSnap1:
        case this.hotkeys.toggleSnap2: {
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
      }
    });
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
