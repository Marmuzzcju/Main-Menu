const defly = {
    BULLET_WIDTH: 7, //~arbitrary
    WALL_WIDTH: 13, //~arbitrary
    TOWER_WIDTH: 13, //~arbitrary
    PLAYER_WIDTH: 10, //~arbitrary
    GRID_WIDTH: 44,
    UNIT_WIDTH: 22, //GRID_WIDTH / 2
    BASE_SKIN_WIDTH: 66, //~2.8 * UNIT_WIDTH; x3 atm
    BOMB_RADIUS: 144, //GRID_WIDTH * 3
    MAX_WALL_LENGTH: 660, //GRID_WIDTH * 15
    PLANTING_TIME: 5,
    DEFUSING_TIME: 10,
}

const main = {
    coordToCluster: (coord) => Math.floor(coord / defly.UNIT_WIDTH), //returns cluster position from coord
  
    getClusterOrigin: function (origin/* = this.players[0].position*/) {
      return [this.coordToCluster(origin.x), this.coordToCluster(origin.y)];
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
                  if (tower.team != this.players[0].team) {
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
                  if (wall.team != this.players[0].team) {
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
    /*
      this function takes in two towers (from & to)
      which each have an id and x/y coordinates
      it will then check if such a wall already exists
      and in case it doesn't, will add one there
    */
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
}