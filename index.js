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

function switchSite(newPage = "main-menu") {
  fadeOutScreen();
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
  }, 500);
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
}
window.onbeforeunload = () => {
  if (hasLocalStorage) {
    localStorage.setItem("current-page", currentPage);
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
    Delete: "DELETE",
    ArrowUp: "ARROWUP",
    ArrowDown: "ARROWDOWN",
    ArrowLeft: "ARROWLEFT",
    ArrowRight: "ARROWRIGHT",
    g: "G",
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
    f: "F",
    x: "X",
    Plus: "+",
    Minus: "-",
    Zero: "0",
    One: "1",
    Two: "2",
    Three: "3",
    Four: "4",
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
  focusPoint : {
    x : 500,
    y : 500,
  },
  focusOffset : {
    x : window.innerWidth/2,
    y : window.innerHeight/2,
  },
  mapZoom : 1,

  snapRange: 2 * defly.UNIT_WIDTH,
  snapping: false,

  openMenu: false,

  mapData: {
    with: 210 * defly.UNIT_WIDTH,
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
    this.mapData.walls.forEach(wall => {
      if(wall.from.id == towerId){
        existingWalls.push(wall.to.id);
      } else if (wall.to.id == towerId){
        existingWalls.push(wall.from.id);
      }
    });
    this.selectedTowers.forEach((towerIndex) => {
      let id = this.mapData.towers[towerIndex].id;
      //create a wall from each selected tower to new one
      //only if such wall didn´t exist yet
      if (id != towerId && !existingWalls.includes(id)) this.createWall(id, towerId);
    });
    this.selectedTowers = [this.getIndexFromId(towerId)];
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

    //check if pointer is inside an area
    let insideAreas = false;
    this.mapData.areas.forEach((area, index) => {
      insideAreas = this.isPointInsideArea([mc.x,mc.y], area.nodes) ? index : insideAreas;
      console.log(`Inside Areas: ${insideAreas} -- type: ${typeof(insideAreas)}`);
    });
    //if so - delete that area and return
    if(typeof(insideAreas) == "number"){
      this.mapData.areas.splice(insideAreas, 1);
      return;
    }
    //if not - try to create an area
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

    //only keep going if close walls exist
    if (closestWall.distance === Infinity) return;
    let cl = this.mapData.walls[closestWall.index];

    //check if cursor is on the "wrong" side of the wall & set wall angle correction based on that
    let a = this.calculateAngle(
      [cl.from.x, cl.from.y],
      [cl.to.x, cl.to.y],
      [mc.x, mc.y]
    );
    let wallAngleCorrection = a > 180 ? 1 : -1;

    let startingTowerId = this.mapData.walls[closestWall.index].from.id;
    let finishTowerId = this.mapData.walls[closestWall.index].to.id;
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
    console.log(
      areaHasBeenFound
        ? `Area has been found!!! [${currentNodeArray}]`
        : "No area found :("
    );
    if (areaHasBeenFound) {
      if (this.isPointInsideNodes([mc.x,mc.y],currentNodeArray)) this.createArea(currentNodeArray);
    }
  },

  createArea: function (ids) {
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
      if (!ids || ids.includes(wall.from.id) || ids.include(wall.to.id)) {
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
      area.forEach((node) => {
        if (!ids || ids.includes(node.id)) {
          //matching tower id/should get updated
          let relativeTower = this.mapData.towers[this.getIndexFromId(node.id)];
          node.x = relativeTower.x;
          node.y = relativeTower.y;
        }
      });
    });
  },

  selectTower: function () {
    let mc = this.mouseCoords.relative;
    let [x,y] = [mc.x,mc.y];
    if (this.isKeyPressed.SHIFT) {
      this.selectedTowers = [];
      this.mapData.towers.forEach((t, index) => {
        this.selectedTowers.push(index);
      });
      return;
    }
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
  },

  selectChunk: function (state) {
    let mc = this.mouseCoords.relative;
    let [x,y] = [mc.x,mc.y];
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

  getDistance: function (x1, y1, x2, y2) {
    return ((x1 - x2)**2 + (y1 - y2)**2)**.5;
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
    if(angle < 0) console.log('WTF ;-;');

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

  isPointInsideNodes: function(point, nodes){
    let areaFromNodes = [];
    nodes.forEach(node => {
      let idx = this.getIndexFromId(node);
      let nodeTower = this.mapData.towers[idx];
      areaFromNodes.push(nodeTower);
    });
    return this.isPointInsideArea(point, areaFromNodes);
  },

  isPointInsideArea: function(point, area){
    let intersectionCounter = 0;
    let anl = area.length;
    area.forEach((node, idx) => {
      let intersecting = this.isIntersecting(node.x, node.y, area[(idx+1)%anl].x, area[(idx+1)%anl].y, point[0], point[1], -1E9, -1E9)
      console.log(intersecting);
      if(intersecting) intersectionCounter++;
    });
    //if the total count of interesctions between a line going from one point outside the area and one point unknown
    //with each line between two neighbour nodes of a poligon is odd, the point to determine is inside the poligon
    console.log(`Intersections: ${intersectionCounter}`);
    return intersectionCounter%2 == 1 ? true : false;
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

  updateMouseCoords: function (x, y) {
    let mc = this.mouseCoords;
    //if update is called without x,y coords - only update realtive coords without crashing
    mc.real = x && y ? { x: x, y: y } : mc.real;
    mc.relative = {
      x : this.focusPoint.x + (mc.real.x - this.focusOffset.x) * this.mapZoom,
      y : this.focusPoint.y + (mc.real.y - this.focusOffset.y) * this.mapZoom,
      /*x : mc.real.x + this.focusPoint.x - this.focusOffset.x,
      y : mc.real.y + this.focusPoint.y - this.focusOffset.y,*/
    };
    if (this.snapping) {
      let xOffset = mc.relative.x + 0.5 * this.snapRange;
      let yOffset = mc.relative.y + 0.5 * this.snapRange;
      mc.snapped.x = xOffset - (xOffset % this.snapRange);
      mc.snapped.y = yOffset - (yOffset % this.snapRange);
    } else mc.snapped = mc.relative;
  },

  updateMap: function(){
    let kc = this.isKeyPressed;
    let mX = kc.MoveLeft ? -1 : 0;
    mX += kc.MoveRight ? 1 : 0;
    let mY = kc.MoveUp ? -1 : 0;
    mY += kc.MoveDown ? 1 : 0;
    let speedModif = mX != 0 || mY != 0 ? 1/(mX**2+mY**2)**.5*this.scrollingSpeed*this.mapZoom : 0;
    mX *= speedModif;
    mY *= speedModif;
    this.focusPoint.x += mX;
    this.focusPoint.y += mY;
    if(speedModif) this.updateMouseCoords();
  },

  relToFsPt: {
    x : (ogX) => (ogX - DME.focusPoint.x) / DME.mapZoom + DME.focusOffset.x,
    y : (ogY) => (ogY - DME.focusPoint.y) / DME.mapZoom + DME.focusOffset.y,
    /*x : (ogX) => ogX + DME.focusOffset.x * DME.mapZoom - DME.focusPoint.x,
    y : (ogY) => ogY + DME.focusOffset.y * DME.mapZoom - DME.focusPoint.y,*/
  },

  draw: function () {
    //clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let mc = this.mouseCoords.snapped;
    let [mcX, mcY] = [this.relToFsPt.x(mc.x), this.relToFsPt.y(mc.y)]

    let wallWidth = defly.WALL_WIDTH / this.mapZoom;
    let towerWidth = defly.TOWER_WIDTH / this.mapZoom;

    //draw areas
    DME.mapData.areas.forEach((area) => {
      ctx.fillStyle = defly.colors.faded[area.color];
      ctx.beginPath();
      ctx.moveTo(this.relToFsPt.x(area.nodes[0].x), this.relToFsPt.y(area.nodes[0].y));
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
      ctx.lineWidth = wallWidth - 4 / this.mapZoom;
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
        ctx.lineWidth = wallWidth - 4 / this.mapZoom;;
        ctx.beginPath();
        ctx.moveTo(this.relToFsPt.x(tower.x), this.relToFsPt.y(tower.y));
        ctx.lineTo(mcX, mcY);
        ctx.stroke();
        let borderLines = calculateParallelLines(
          [mcX, mcY],
          [this.relToFsPt.x(tower.x), this.relToFsPt.y(tower.y)],
          wallWidth / 2 - 1 / this.mapZoom
        );
        ctx.strokeStyle = defly.colors.darkened[tower.color];
        ctx.lineWidth = 2 / this.mapZoom;
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
        x : this.relToFsPt.x(tower.x),
        y : this.relToFsPt.y(tower.y),
      }
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
      ctx.arc(t.x, t.y, towerWidth - 2 / this.mapZoom, 2 * Math.PI, false);
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
      ctx.lineWidth = 2 / this.mapZoom;
      ctx.strokeStyle = defly.colors.standard[this.selectedColor];
      ctx.beginPath();
      ctx.arc(mcX, mcY, towerWidth - 1 / this.mapZoom, 2 * Math.PI, false);
      ctx.stroke();
      ctx.globalAlpha = gA;
    }

    if (this.selectingChunk.isSelecting) {
      ctx.strokeStyle = "rgba(230, 130, 40, 0.8)";
      ctx.lineWidth = 5;
      ctx.fillStyle = "rgba(230, 130, 40, 0.4)";
      let s = this.selectingChunk.origin;
      let w = (this.mouseCoords.relative.x - s.x) / this.mapZoom;
      let h = (this.mouseCoords.relative.y - s.y) / this.mapZoom;
      ctx.fillRect(this.relToFsPt.x(s.x), this.relToFsPt.y(s.y), w, h);
      ctx.strokeRect(this.relToFsPt.x(s.x), this.relToFsPt.y(s.y), w, h);
    }
  },

  config: function () {
    /*
    if (hasLocalStorage) {
      if (!localStorage.getItem("DMEhotkeys")) {
        localStorage.setItem("DMEhotkeys", JSON.stringify(DME.hotkeys));
      } else {
        let storedHotkeys = JSON.parse(localStorage.getItem("DMEhotkeys"));
        Object.entries(storedHotkeys).forEach((key) => {
          DME.hotkeys[key[0]] = key[1];
        });
      }
      Array.from(document.querySelectorAll(".hotkey-change-button")).forEach(
        (buttonVal) => {
          buttonVal.innerHTML =
            DME.hotkeys[buttonVal.id.replace("hotkeys.change", "")];
        }
      );

      if (!localStorage.getItem("DMEauto-saved-map")) {
        localStorage.setItem(
          "DMEauto-saved-map",
          "MAP_WIDTH 210 MAP_HEIGHT 120"
        );
      } else {
        DME.loadMapFile(
          localStorage.getItem("DMEauto-saved-map"),
          "deflyFormat"
        );
      }

      if (!localStorage.getItem("DMEsaved-map-list")) {
        localStorage.setItem("DMEsaved-map-list", JSON.stringify(["Empty"]));
      }
    }
    */ //local storage not needed rn
    canvas.classList.remove("hidden");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.addEventListener("mousedown", (e) => {
      console.log(e.button);
      switch (e.button) {
        case 0: {
          this.selectTower();
          break;
        }
        case 1: {
          this.selectChunk(0);
          break;
        }
        case 2: {
          this.placeTower();
          break;
        }
      }
    });
    canvas.addEventListener("mouseup", (e) => {
      console.log(e.button);
      switch (e.button) {
        case 0: {
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
    canvas.addEventListener('wheel', (e)=>{
      //change to realtive value to mouse sensitivity
      let v = e.deltaY;
      DME.mapZoom *= v > 1 ? 1.1 : 1/1.1;
      console.log(`Zoom level: ${DME.mapZoom}`);
      DME.updateMouseCoords();
    });
    canvas.addEventListener("mousemove", (e) => {
      this.updateMouseCoords(e.clientX, e.clientY);
    });
    document.addEventListener("keydown", (e) => {
      console.log(e.key.toLocaleUpperCase());
      //ignore hotkeys if a menu is open
      if(this.openMenu) return;
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
        case this.hotkeys.g: {
          let c = document.querySelector(
            "#DME-toggle-snapping-checkbox"
          ).checked;
          document.querySelector("#DME-toggle-snapping-checkbox").checked = !c;
          this.snapping = !c;
          console.log("togle snap?" + c);
          break;
        }
        case this.hotkeys.Delete: {
          this.deleteTowers();
          break;
        }
        case this.hotkeys.f: {
          console.log("Looking for Area to enshade...");
          this.placeArea();
          break;
        }
        case this.hotkeys.ArrowUp: {
          this.isKeyPressed.MoveUp = true;
          break;
        }
        case this.hotkeys.ArrowDown: {
          this.isKeyPressed.MoveDown = true;
          break;
        }
        case this.hotkeys.ArrowLeft: {
          this.isKeyPressed.MoveLeft = true;
          break;
        }
        case this.hotkeys.ArrowRight: {
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
        case this.hotkeys.g: {
          break;
        }
        case this.hotkeys.ArrowUp: {
          this.isKeyPressed.MoveUp = false;
          break;
        }
        case this.hotkeys.ArrowDown: {
          this.isKeyPressed.MoveDown = false;
          break;
        }
        case this.hotkeys.ArrowLeft: {
          this.isKeyPressed.MoveLeft = false;
          break;
        }
        case this.hotkeys.ArrowRight: {
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
      DME.updateMap();
      DME.draw();
      window.requestAnimationFrame(DME.updateCanvas);
    }
  },
};

window.oncontextmenu = (e) => {
  e.preventDefault();
};
