// things to be desired. balls can still get stuck in the walls but at least they have a way of squeezing away from each other. still not sure if that
// needs to have the collision detection turned off temporarily (?). it seems to be working but now that i think about it i'm not entirely sure it should be.
// the balls getting stuck in walls probably needs to be taken care of in the particle class. i think what is currently happening is the ball gets stuck in the wall
// , then gets scooted out but then registers a collision and reverses direction upon which it is scooted back out and then collides and comes back to the wall.
// Also the momentum conservation thing. the creation fusion products are still hardwired and do not conserve momentum.


var ctx = document.getElementById("numjs_test");
//There are two ctx's here denoted ctxm to alert to the differences. ctx.getContext("2d") is as you expect
//However new C2S is the 'fake' canvas used with canvas2svg (C2S) library for output a series of svg files
//You have to also switch between the setInterval loop and the for loop including the output code at the bottom
var ctxm = ctx.getContext("2d");
// var ctxm = new C2S(500,500);

// mathjs library https://mathjs.org/docs/datatypes/matrices.html lets you do linear algebra vector maths stuff
// the issue is that its a bit wonky to output back to the arrays that canvas wants to use to plot with.


// // comment these two lines out if you want the default window size defined in the html doc instead of by the browser window size.
// ctxm.canvas.width  = window.innerWidth*0.9;
// ctxm.canvas.height = window.innerHeight*0.85;

var width = numjs_test.width;
var height = numjs_test.height;

// console.log(width)
// console.log(height)

//  global variables? i think? zip and jay used for a record function. prolly could be replaced with something like foreach?
//  timer used to count up to 70 where 70 is only accessible in the loop function, same as the veloctiy threshold over which collisions result in fusion
//  UPDATE: added delayedStartLength to change the delay time for when collisions result in fusion.
var zip = new JSZip();
// jay is an innumerator incrementer? to count over frame cycles? i'm definitely sure theres a better way to do this but for later.
var jay = 1;
// timer similarly though admittedly with a better name.  
var timer = 1;
// dont want the splosions to happen so soon. delay them now by making this more than 0. prolly in milliseconds.
var delayedStartLength = 10;
// how easily you want the collisions to happen. (circles must have more kinetic energy than this value)
var KE_collision_threshold = 6;
// how easily the circles will explode upon collision. similar to how easy or difficult it is to overcome the energy barrier for a collision.
var initial_ball_KE = 1;
// how much faster the circles go after the collision. how much bond energy is released as energy in the fusion.
var post_collision_KE = 5;
// self explantory
var initial_number_circles = 180;
var incrementer = 1;
var iterationInverval = 10;
var maxFrameCount = math.floor(100000/iterationInverval);
// timeout makes sure that the program doesn't get hung up trying to add new circles to the scene.
timeout = 0;
timeoutMax = 100;
var liveOnes = 0

console.log('Hello')
//ADD SOME BALLS addRandomBall(number of balls, mass, radius, velocity, deathStatus[false means alive, true means remove on next frame], type[positron, neutron, proton, etc])
var ball_list = [];
addRandomBall(initial_number_circles, initial_ball_KE, false, 'proton');

//The canvas2svg library is mot a great solution persay
//The standard clear function ctx.clearRECT (oft seen on the interwebs as ctxm.clearRect) won't work
// Instead using ctxm.__clearCanvas which that friggin double underscore "__" before "__clearCanvas" definitely screwed with me  
function clearCanvas() {
  ctxm.clearRect(0, 0, ctx.width, ctx.height);
  // ctxm.__clearCanvas();
}


function randomNumber(min, max) {  
    return Math.floor(Math.random() * (max - min) + min); 
}  


function BALL(x, v, m, r, isDead, collisionsOn, wallsOn, phaseThrough, type) {
  return {
    pos: x,
    vel: v,
    mass: m,
    radius: r,
    isDead: isDead,
    collisionsOn: collisionsOn,
    wallsOn: wallsOn,
    phaseThrough: phaseThrough,
    type: type,
  // i have decided i don't particularly like the radial gradient look
    draw: function() {
          ctxm.beginPath();
          ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
          ctxm.lineWidth = 5;
          ctxm.stroke();
    },

    detectWall: function() {
      if (this.pos[0] + this.radius > ctx.width || this.pos[0] - this.radius < 0 || this.pos[1] + this.radius > ctx.height || this.pos[1] - this.radius < 0 ) {
        //do nothing, assuming the ball has already been corrected (?) worth a try
      } else {
        if (this.pos[0] + this.vel[0] + this.radius > ctx.width || this.pos[0] + this.vel[0] - this.radius < 0) {
          this.vel[0] = -this.vel[0];
        }
        if (this.pos[1] + this.vel[1] + this.radius > ctx.height || this.pos[1] + this.vel[1] - this.radius < 0) {
          this.vel[1] = -this.vel[1];
        }
      }
    },

    updateBall: function() {
      this.pos[0] += this.vel[0];
      this.pos[1] += this.vel[1];
    }
  };
}

function PARTICLE(x, v, phaseThrough, type){
// switch on particle type. inherits everything about ball class but has its own draw function.
  switch(type) {
    case 'proton':
      m_proton = 25;
      r_proton = 10;
      particle = BALL(x,v,m_proton,r_proton,false,true,true,phaseThrough,type)
      particle.draw = function(){
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0], this.pos[1], r_proton, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 3;
        ctxm.stroke()
      }
      break;
    case 'deuterium':
      m_deuterium = 25;
      r_deuterium = 10;
      particle = BALL(x,v,m_deuterium,r_deuterium,false,true,true,phaseThrough,type)
      particle.draw = function(){
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0], this.pos[1], r_deuterium, 0, Math.PI * 2, 0);
        ctxm.fillStyle = 'black';
        ctxm.fill();
        ctxm.lineWidth = 3;
        ctxm.stroke()
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0]-7, this.pos[1], r_deuterium, 0, Math.PI * 2, 0);
        ctxm.fillStyle = 'white';
        ctxm.fill();
        ctxm.lineWidth = 3;
        ctxm.stroke()
      }
      break;
    case 'helium3':
      m_helium3 = 25;
      r_helium3 = 10;
      particle = BALL(x,v,m_helium3,r_helium3,false,true,true,phaseThrough,type)
      particle.draw = function(){
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0], this.pos[1], r_helium3, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 3;
        ctxm.stroke()
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0]-10, this.pos[1], r_helium3, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 3;
        ctxm.stroke()
        ctxm.fillStyle = 'white';
        ctxm.fill();
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0]-5, this.pos[1]-10, r_helium3, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 3;
        ctxm.stroke()
        ctxm.fillStyle = 'black';
        ctxm.fill();
      }
      break;
    case 'positron':
      m_positron = 1;
      r_positron = 3;
      particle = BALL(x,v,m_positron,r_positron,false,true,true,phaseThrough,type)
      particle.draw = function(){
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0], this.pos[1], r_positron, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 2;
        ctxm.stroke()
      }
      break;
    case 'helium':
      m_helium = 100;
      r_helium = 30;
      particle = BALL(x,v,m_helium,r_helium,false,true,true,phaseThrough,type)
      particle.draw = function(){
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0], this.pos[1], r_helium, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 2;
        ctxm.stroke();
        ctxm.beginPath();
        ctxm.moveTo(this.pos[0]-20, this.pos[1]);
        ctxm.lineTo(this.pos[0]-r_helium+1, this.pos[1]);
        ctxm.lineWidth = 4;
        ctxm.lineCap = "round";
        ctxm.stroke();
        ctxm.beginPath();
        ctxm.moveTo(this.pos[0]-14, this.pos[1]+8);
        ctxm.lineTo(this.pos[0]-r_helium+4, this.pos[1]+8);
        ctxm.lineWidth = 4;
        ctxm.lineCap = "round";
        ctxm.stroke(); 
        ctxm.beginPath();
        ctxm.moveTo(this.pos[0]-5, this.pos[1]+16);
        ctxm.lineTo(this.pos[0]-r_helium+8, this.pos[1]+16);
        ctxm.lineWidth = 4;
        ctxm.lineCap = "round";
        ctxm.stroke();
        ctxm.beginPath();
        ctxm.moveTo(this.pos[0]+3, this.pos[1]+24);
        ctxm.lineTo(this.pos[0]-r_helium+16, this.pos[1]+24);
        ctxm.lineWidth = 4;
        ctxm.lineCap = "round";
        ctxm.stroke(); 
        ctxm.beginPath();
        ctxm.moveTo(this.pos[0]-25, this.pos[1]-8);
        ctxm.lineTo(this.pos[0]-r_helium+3, this.pos[1]-8);
        ctxm.lineWidth = 4;
        ctxm.lineCap = "round";
        ctxm.stroke();
      }
      break;
    case 'neutrino':
      m_neutrino = 1;
      r_neutrino = 2;
      particle = BALL(x,v,m_neutrino,r_neutrino,false,false,false,phaseThrough,type)
      particle.draw = function(){
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0], this.pos[1], r_neutrino, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 2;
        ctxm.stroke()
        ctxm.fillStyle = "black";
        ctxm.fill()
      }
      break;
     case 'photon':
     // STILL JUST A NEUTRINO REPEAT
      m_photon = 1;
      r_photon = 2;
      particle = BALL(x,v,m_photon,r_photon,false,false,false,phaseThrough,type)
      particle.draw = function(){
        ctxm.beginPath();
        // ctxm.arc(this.pos[0], this.pos[1], this.radius, 0, Math.PI * 2, 0);
        ctxm.arc(this.pos[0], this.pos[1], r_photon, 0, Math.PI * 2, 0);
        ctxm.lineWidth = 2;
        ctxm.stroke()
        ctxm.fillStyle = "black";
        ctxm.fill()
      }
      break;
   }
   return particle;
}

// addBall: populates animation with balls addBall(position as [x,y], velocity as [vx,vy], mass, radius, deathStatus, type)
//note that if type is specified the mass velocity and radius will be overruled.
//with the exception of the resulting collision KE.
//type = 'default'

function addBall(x, v, phaseThrough, type) {
  trialBall = PARTICLE(x, v, phaseThrough, type)
  if (trialBall.pos[0] + trialBall.radius > ctx.width ||
      trialBall.pos[0] - trialBall.radius < 0 ||
      trialBall.pos[1] + trialBall.radius > ctx.height ||
      trialBall.pos[1] - trialBall.radius < 0) {
  console.log("failed to add a ball")
  return false;
  }
  if (ball_list.length == 0) {
    ball_list.push(trialBall);
  } else{
    for (i = 0; i < ball_list.length; i++) {
      if (circleCenterDist(trialBall, ball_list[i]) < circleTouchingDist(trialBall, ball_list[i])) {
        console.log("failed to add a ball")
        timeout = timeout+1;
        return false;
      }
    }
    ball_list.push(PARTICLE(x, v, phaseThrough, type));
  }
}


function addRandomBall(num, v, phaseThrough, type) {
  current_ball_list_length = ball_list.length;
  while (ball_list.length < (num+current_ball_list_length) && timeout < timeoutMax){
  addBall([Math.random() * (width-20) + 10, Math.random() * (height-20) + 10], [Math.random() * v - v / 2, Math.random() * v - v / 2], phaseThrough, type);
  }
}




// detectOverlap SHOULD take two BALL objects and give a is you be currently overlapping or not Truth value
function overlapDist(ballOne, ballTwo) {
  if (ballOne.collisionsOn && ballTwo.collisionsOn){
  return (circleCenterDist(ballOne, ballTwo) - circleTouchingDist(ballOne, ballTwo) )
  }
}

function nextStepOverlapDist(ballOne, ballTwo) {
  if (ballOne.collisionsOn && ballTwo.collisionsOn){
  return (nextStepDist(ballOne, ballTwo) - circleTouchingDist(ballOne, ballTwo) )
  }
}

// detectOverlap SHOULD take two BALL objects and give a is you be currently overlapping or not Truth value
function detectOverlap(ballOne, ballTwo) {
  return (Math.pow(ballTwo.pos[0] - ballOne.pos[0], 2) + Math.pow(ballTwo.pos[1] - ballOne.pos[1], 2) <
    Math.pow(ballOne.radius + ballTwo.radius, 2));
}

// detectCollision SHOULD take two BALL objects and give a gonna collide in one step or not Truth value
function detectCollision(ballOne, ballTwo) {
  if (
    (nextStepDist(ballOne, ballTwo) < circleTouchingDist(ballOne, ballTwo))
  ) {
    return true;
  } else {
    return false;
  }
}



function nextStepDistSquared(ballOne, ballTwo) {
  nextStepDistanceSquared = Math.pow(ballTwo.pos[0] + ballTwo.vel[0] - (ballOne.pos[0] + ballOne.vel[0]),2) + 
    Math.pow(ballTwo.pos[1] + ballTwo.vel[1] - (ballOne.pos[1] + ballOne.vel[1]),2)
    // nextStepDistance = math.sqrt(Math.pow(ballTwo.pos[0] + ballTwo.vel[0] - (ballOne.pos[0] + ballOne.vel[0]),2) + 
    // Math.pow(ballTwo.pos[1] + ballTwo.vel[1] - (ballOne.pos[1] + ballOne.vel[1]),2))
    return nextStepDistanceSquared
}

function nextStepDist(ballOne, ballTwo) {
    nextStepDistance = math.sqrt(Math.pow(ballTwo.pos[0] + ballTwo.vel[0] - (ballOne.pos[0] + ballOne.vel[0]),2) + 
    Math.pow(ballTwo.pos[1] + ballTwo.vel[1] - (ballOne.pos[1] + ballOne.vel[1]),2))
    return nextStepDistance
}

function circleCenterDistSquared(ballOne, ballTwo) {
  circleCenterDistanceSquared = Math.pow(ballTwo.pos[0] - ballOne.pos[0],2) + Math.pow(ballTwo.pos[1] - ballOne.pos[1],2)
  return circleCenterDistanceSquared
}

function circleCenterDist(ballOne, ballTwo) {
  circleCenterDistance= math.sqrt(Math.pow(ballTwo.pos[0] - ballOne.pos[0],2) + Math.pow(ballTwo.pos[1] - ballOne.pos[1],2))
  return circleCenterDistance
}

function circleTouchingDistSquared(ballOne, ballTwo) {
  return Math.pow(ballOne.radius + ballTwo.radius, 2)
}

function circleTouchingDist(ballOne, ballTwo) {
  return (ballOne.radius + ballTwo.radius)
}

//postCollisionVel checks for collisions between balls and then updates their positions
//wall collisions are dealt with in the BALL class's update function
function postCollisionVel(ball_One, ball_Two) {
  x1 = ball_One.pos;
  u1 = ball_One.vel;
  m1 = ball_One.mass;
  x2 = ball_Two.pos;
  u2 = ball_Two.vel;
  m2 = ball_Two.mass;
  dist = math.subtract(x2, x1);
  matRot = math.multiply(
    1 / math.norm(dist),
    math.matrix([[dist[0], dist[1]], [-dist[1], dist[0]]])
  );
  matUnrot = math.inv(matRot);
  u1Rot = math.multiply(matRot, u1);
  u2Rot = math.multiply(matRot, u2);
  v1Rot = [];
  v2Rot = [];
  v1Rot[1] = math.subset(u1Rot, math.index(1));
  v2Rot[1] = math.subset(u2Rot, math.index(1));
  u1Rotx = math.subset(u1Rot, math.index(0));
  u2Rotx = math.subset(u2Rot, math.index(0));
  v1Rot[0] = (2 * m2 * u2Rotx + (m1 - m2) * u1Rotx) / (m1 + m2);
  v2Rot[0] = (2 * m1 * u1Rotx + (m2 - m1) * u2Rotx) / (m1 + m2);
  v1 = math.multiply(matUnrot, v1Rot);
  v2 = math.multiply(matUnrot, v2Rot);
  return [v1, v2];
}

function postFusionVel(ball_1, ball_2){
  x1 = ball_1.pos;
  u1 = ball_1.vel;
  m1 = ball_1.mass;
  type1 = ball_1.type;
  // x2 = ball_two.pos;
  u2 = ball_2.vel;
  m2 = ball_2.mass;
  type2 = ball_2.type;
  // theta = math.acos(math.dot(u1,u2)/(math.norm(u1)*math.norm(u2)));
  // KE_x = 0.5*m1*Math.pow(u1*math.cos(theta)) + 0.5*m2*Math.pow(u2*math.cos(theta));
  // KE_y = 0.5*m1*Math.pow(u1*math.sin(theta)) + 0.5*m2*Math.pow(u2*math.sin(theta));
  p_x = m1*u1[0]+m2*u2[0]
  p_y = m1*u1[1]+m2*u2[1]
  KE = 0.5*m1*math.norm(u1) + 0.5*m2*math.norm(u2)
  // console.log(KE)
  // P_x_total = m1

}


function fixOverlap(ball_One, ball_Two) {
  x1 = ball_One.pos;
  u1 = ball_One.vel;
  m1 = ball_One.mass;
  x2 = ball_Two.pos;
  u2 = ball_Two.vel;
  m2 = ball_Two.mass;
  dist = math.subtract(x2, x1);
  // matRot = math.multiply(1 / math.norm(dist), math.matrix([[dist[0], dist[1]], [-dist[1], dist[0]]]));
  return dist;
}
// math.flatten(newVel[0]).toArray();


// for whatever reason the particles which have no interaction with walls are throughing off the detect overlap scheme
// which has at least temporarily been fixed simply by making the creation of photons and neutrinos to have their
// phaseThrough setting set to false.

function loop() {
  clearCanvas();
  add_ball_list = [];
  // if (incrementer%50==0){
  //     console.log(incrementer)
  //     addBall([150,300],[2,3],'deuterium');

  // }
  // incrementer = incrementer + 1;

  for (i = 0; i < ball_list.length; i++) {
    for (j = 0; j < i; j++) {
      if (i !== j) {
        if (ball_list[i].collisionsOn&&ball_list[j].collisionsOn) {
          // Both circles are meant to collide with things
          if (nextStepOverlapDist(ball_list[i], ball_list[j])<0){
            // They will be touching next frame
            if (overlapDist(ball_list[i], ball_list[j])<0){
              // They're already overlapping, so do nothing
            }else{
              // They're going to overlap, but are yet to so now check if they're ready to fuse:
              KE_tot = 0.5*(ball_list[i].mass*math.norm(ball_list[i].vel)**2+ball_list[i].mass*math.norm(ball_list[j].vel)**2)
              // if(((math.norm(ball_list[i].vel)+math.norm(ball_list[j].vel))<KE_collision_threshold)||(timer<delayedStartLength)){
              if(KE_tot<KE_collision_threshold){
                // console.log("KE is "+KE_tot+" which is below "+KE_collision_threshold)
                newVel = postCollisionVel(ball_list[i], ball_list[j]);
                ball_list[i].vel = math.flatten(newVel[0]).toArray();
                ball_list[j].vel = math.flatten(newVel[1]).toArray();
              }else{
                // console.log("KE is "+KE_tot+" which is below "+KE_collision_threshold)
                if(ball_list[i].type=='proton'&&ball_list[j].type=='proton'){
                  // console.log("protonproton")
                  add_ball_list.push(['pp',ball_list[i].pos,ball_list[i].vel,ball_list[j].pos,ball_list[j].vel]);
                  ball_list[i].isDead = true;
                  ball_list[j].isDead = true;
                  // console.log('protonproton_collision')
                }else if ((ball_list[i].type=='proton'&&ball_list[j].type=='deuterium')||(ball_list[i].type=='deuterium'&&ball_list[j].type=='proton')){
                  add_ball_list.push(['pd', ball_list[i].pos,ball_list[i].vel,ball_list[j].pos,ball_list[j].vel]);
                  ball_list[i].isDead = true;
                  ball_list[j].isDead = true;
                   // console.log('protondeuterium_collision')
                 }else if (ball_list[i].type=='helium3'&&ball_list[j].type=='helium3'){
                  add_ball_list.push(['he3he3', ball_list[i].pos,ball_list[i].vel,ball_list[j].pos,ball_list[j].vel]);
                  ball_list[i].isDead = true;
                  ball_list[j].isDead = true;
                  // console.log('he3he3_collision')
                }else{
                  newVel = postCollisionVel(ball_list[i], ball_list[j]);
                  ball_list[i].vel = math.flatten(newVel[0]).toArray();
                  ball_list[j].vel = math.flatten(newVel[1]).toArray();
                }
              }
            }
          }
        }
      }
    }
  }

  // take everything that collided in such a way as to change or fuse or die and remove it from the updating list.
  ball_list = ball_list.filter(scan=>scan.isDead==false);


  for (i = 0; i < add_ball_list.length; i++) {
    // var vel_a = post_collision_KE;
    // x1pos = add_ball_list[i][1][0];
    // y1pos = add_ball_list[i][1][1];
    // x1pos = add_ball_list[i][3][0];
    // y1pos = add_ball_list[i][3][1];

    // x1vel = add_ball_list[i][2][0];
    // y1vel = add_ball_list[i][2][1];
    // x2vel = add_ball_list[i][4][0];
    // y2vel = add_ball_list[i][4][1];

// Initial position and velocity vectors of the two fusing particles
    x_1 = add_ball_list[i][1];
    v_1 = add_ball_list[i][2];
    // m_1 = add_ball_list[i][3];

    x_2 = add_ball_list[i][3];
    v_2 = add_ball_list[i][4];
    // m_2 = add_ball_list[i][6];
    
    // For testing purposes just setting the masses artificially but they will get passed from the fusion event in the future
    m_1 = 3
    m_2 = 2

    // For testing purposes the new particle masses forceably set though these will be figured out from the fusion event type in the future
    m_new_1 = 25
    m_new_2 = 1
    m_new_3 = 3
    
    // Keeping the code from before working by passing the new vector notation into the old component variables
    x1pos = x_1[0];
    y1pos = x_1[1];
    x2pos = x_2[0];
    y2pos = x_2[1];

    x1vel = v_1[0];
    y1vel = v_1[1];
    x2vel = v_2[0];
    y2vel = v_2[1];




    KE_tot = 0.5*m_1*math.dot(v_1,v_1) + 0.5*m_2*math.dot(v_2,v_2) + post_collision_KE
    p_pre_1 = 0.5*m_1*math.dot(v_1,v_1)
    p_pre_2 = 0.5*m_2*math.dot(v_2,v_2)
    // console.log("KE_tot is "+KE_tot)
    KE_1 = KE_tot*randomNumber(0,40)/100
    // console.log("KE_1 is "+KE_1)
    // console.log("KE_tot is "+KE_tot)
    // // what is the direction of the net momentum?
    // p_tot_x = m_1*v_1[0] + m_2*v_2[0]
    // P_tot_y = m_1*v_1[1] + m_2*v_2[1]
    p_tot = math.add(math.multiply(m_1,v_1),math.multiply(m_2,v_2))
    p_tot_mag = math.norm(p_tot)
    p_tot_norm = math.divide(p_tot,p_tot_mag)
    p_tot_norm_mag = math.norm(p_tot_norm)

    p_1 = math.multiply(m_new_1*math.sqrt(2*KE_1/m_new_1),p_tot_norm)
    p_1_mag = math.norm(p_1)
    p_1_norm = math.divide(p_1,p_1_mag)
    // matRot = math.matrix([[p_tot_norm[0], p_tot_norm[1]], [-p_tot_norm[1], p_tot_norm[0]]]);
    matRot = math.matrix([[p_tot_norm[1], -p_tot_norm[0]], [p_tot_norm[0], p_tot_norm[1]]]);
    matunRot = math.inv(matRot);

    // matRot_90 = math.matrix([[0, -1], [1, 0]]);
    // matRot = math.matrix([[p_tot_norm[0], -p_tot_norm[1]], [p_tot_norm[1], p_tot_norm[0]]]);
    p_1_rot = math.multiply(matRot, p_1);
    p_tot_rot = math.multiply(matRot, p_tot);
    p_tot_rot_mag = math.norm(p_tot_rot);
    // p_1_rot_rot = math.multiply(matRot_90, p_1_rot);
    // p_1_rot_y = p_1_rot[1]
    p_1_rot_x = math.flatten(p_1_rot).toArray()[0];
    p_1_rot_y = math.flatten(p_1_rot).toArray()[1];
    p_tot_rot_x = math.flatten(p_tot_rot).toArray()[0];
    p_tot_rot_y = math.flatten(p_tot_rot).toArray()[1];
    // p_2_rot_x = another source of random\
    // p_2_rot_x = 0.0000005
    // 2*m_new_2*KE_tot*randomNumber(0,40)/100

    // a = 1/(2*m_new_2)+1/(2*m_new_3)
    // b = p_1_rot_y/m_new_3-p_tot_rot_y/m_new_3
    // c = p_tot_rot_y**2/(2*m_new_3)+p_1_rot_y**2/(2*m_new_3)-p_tot_rot_y*p_1_rot_y/m_new_3+p_1_rot_y**2/(2*m_new_1)+p_2_rot_x**2/(2*m_new_2)+(p_tot_rot_x-p_2_rot_x)**2/(2*m_new_3)-KE_tot
    // p_2_rot_y_opt1 = ((-b+math.sqrt(b**2-4*a*c))/(2*a))
    // p_2_rot_y_opt2 = ((-b-math.sqrt(b**2-4*a*c))/(2*a))
    // p_2_rot_y = ((-b-math.sqrt(b**2-4*a*c))/(2*a))
    // // if(isNaN(p_2_rot_y_opt1)){
    // //   console.log("instead of "+p_2_rot_y_opt1)
    // //   p_2_rot_y = p_2_rot_y_opt2
    // //   console.log("p_2_rot_y is "+p_2_rot_y_opt2)
    // // }else{
    // //   console.log("no nan,just "+p_2_rot_y_opt1)
    // //   p_2_rot_y = p_2_rot_y_opt1
    // // }

    // console.log("opt1: "+p_2_rot_y_opt1)
    // console.log("opt2: "+p_2_rot_y_opt2)

    // alpha is from px2 = alpha* p2y
    alpha = 0.00001
    a = (1+alpha**2)/(2*m_new_2)+(1+alpha**2)/(2*m_new_3)
    b = alpha*p_1_rot_y/m_new_3-alpha*p_tot_rot_y/m_new_3
    c = p_tot_rot_y**2/(2*m_new_3)-p_tot_rot_y*p_1_rot_y/m_new_3+p_1_rot_y**2/(2*m_new_1)+p_1_rot_y**2/(2*m_new_3)-KE_tot
    p_2_rot_x_opt1 = ((-b+math.sqrt(b**2-4*a*c))/(2*a))
    p_2_rot_x_opt2 = ((-b-math.sqrt(b**2-4*a*c))/(2*a))
    p_2_rot_x = ((-b-math.sqrt(b**2-4*a*c))/(2*a))
    // if(isNaN(p_2_rot_y_opt1)){
    //   console.log("instead of "+p_2_rot_y_opt1)
    //   p_2_rot_y = p_2_rot_y_opt2
    //   console.log("p_2_rot_y is "+p_2_rot_y_opt2)
    // }else{
    //   console.log("no nan,just "+p_2_rot_y_opt1)
    //   p_2_rot_y = p_2_rot_y_opt1
    // }

    console.log("a: "+a)
    console.log("b: "+b)
    console.log("c: "+c)
    console.log("opt1: "+p_2_rot_x_opt1)
    console.log("opt2: "+p_2_rot_x_opt2)
    // when c is positive the solutions seem to always be nonexistent (imaginary)
    console.log("p_tot_rot_y: "+p_tot_rot_y)
    console.log("p_1_rot_y: "+p_1_rot_y)
    console.log("KE_tot: "+KE_tot)

    
    // // p_1_rot_x
    // // p_1_rot_y

    // // p_2_rot_x
    // // p_2_rot_y

    // p_3_rot_x = p_tot_rot_x-p_1_rot_x-p_2_rot_x
    // p_3_rot_y = p_tot_rot_y-p_1_rot_y-p_2_rot_y


    // console.log(p_1_rot_x)
    // console.log(p_1_rot_y)

    // console.log(p_2_rot_x)
    // console.log(p_2_rot_y)

    // console.log(p_3_rot_x)
    // console.log(p_3_rot_y)

    console.log()



    if (add_ball_list[i][0]=='pp'){
      v_deuterium = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      v_neutrino  = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      v_positron  = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      ball_list.push(PARTICLE([x1pos-15,y1pos],v_deuterium,true,'deuterium'));
      ball_list.push(PARTICLE([x1pos+15,y1pos],v_neutrino,false,'neutrino'));
      ball_list.push(PARTICLE([x1pos,y1pos-40],v_positron,true,'positron'));
      // console.log('protonproton_fusionproduction')
      } else if (add_ball_list[i][0]=='pd'){
      v_helium3 = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      v_photon  = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      ball_list.push(PARTICLE([x1pos-15,y1pos],v_helium3,true,'helium3'));
      ball_list.push(PARTICLE([x1pos+15,y1pos],v_photon,false,'photon'));
      // console.log('protondeuterium_fusionproduction')
      }else if (add_ball_list[i][0]=='he3he3'){
      v_helium3 = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      v_proton1 = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      v_proton2 = [(Math.random() - 0.5) * post_collision_KE, (Math.random() - 0.5) * post_collision_KE]
      ball_list.push(PARTICLE([x1pos-30,y1pos],v_helium3,true,'helium'));
      ball_list.push(PARTICLE([x1pos+30,y1pos],v_proton1,true,'proton'));
      ball_list.push(PARTICLE([x1pos,y1pos-40],v_proton2,true,'proton'));
      // console.log('he3he3_fusionproduction')
      }
  }
// console.log(' ')
// liveOnes = 0
// for (i = 0; i < ball_list.length; i++) {
//   if(ball_list[i].phaseThrough==true){
//     liveOnes = liveOnes + 1
//   }
// }
// console.log('we got ' + liveOnes + ' liveOnes before')


//   for (i = 0; i < ball_list.length; i++) {
//     if (ball_list[i].phaseThrough == true) {
//       for (j = 0; j < ball_list.length; j++) {
//         // if (i !== j) {
//           if (ball_list[i].collisionsOn&&ball_list[j].collisionsOn) {
//             if (overlapDist(ball_list[i], ball_list[j])>=0){
//               ball_list[i].phaseThrough = false;
//             // }
//           }
//         }
//       }
//     }
//   }

// liveOnes = 0
// for (i = 0; i < ball_list.length; i++) {
//   if(ball_list[i].phaseThrough==true){
//     console.log(ball_list[i].pos[0])
//     liveOnes = liveOnes + 1
//   }
// }
// console.log('we got ' + liveOnes + ' liveOnes after')


  // go through and update everything as well as take care of wall bounces.
  // ball_list.forEach(function(myVar1) {
  //   if(myVar1.wallsOn){
  //   myVar1.detectWall();
  //   }
  // });
  // ball_list.forEach(function(myVar2) {
  //   myVar2.updateBall();
  // });
  // ball_list.forEach(function(myVar3) {
  //   myVar3.draw();
  // });

  ball_list.forEach(function(myVar2) {
    myVar2.updateBall();
  });
  ball_list.forEach(function(myVar1) {
    if(myVar1.wallsOn){
    myVar1.detectWall();
  }
  });
  ball_list.forEach(function(myVar3) {
    myVar3.draw();
  });

//   for (i = 0; i < ball_list.length; i++) {
//     if (ball_list[i].phaseThrough == true) {
//       for (j = 0; j < ball_list.length; j++) {
//         // if (i !== j) {
//           if (ball_list[i].collisionsOn&&ball_list[j].collisionsOn) {
//             if (overlapDist(ball_list[i], ball_list[j])>=0){
//               ball_list[i].phaseThrough = false;
//             // }
//           }
//         }
//       }
//     }
//   }
// liveOnes = 0
// for (i = 0; i < ball_list.length; i++) {
//   if(ball_list[i].phaseThrough==true){
//     liveOnes = liveOnes + 1
//   }
// }
// console.log('we got ' + liveOnes + ' liveOnes after after')

  timer=timer+1;

// end loop
}



function record() {
  var frame = ctxm.getSerializedSvg(true);
  zip.file("frame" + jay + ".svg", frame);
  jay++;
}

// function FrameWriter() {
//   return {
//     j: 0,
//     write: function() {
//       var frame = ctxm.getSerializedSvg(true);
//       zip.file("frame" + this.j + ".svg", frame);
//       this.j++;
//     }
//   }
// }

function setIntervalX(callback, delay, repetitions) {
  var x = 0;
  var intervalID = window.setInterval(function() {
    callback();

    if (++x === repetitions) {
      window.clearInterval(intervalID);
    }
  }, delay);
}

setIntervalX(loop, iterationInverval, maxFrameCount);
// ball_list.forEach(function(myVar3) {
//     myVar3.draw();
//   })
console.log('GoodBye')
// console.log(math.sqrt(144))


//use this for loop and generateAsync if you wanna record (you also must change the ctxm file at the top
// for (m = 0; m < 10; m++) {
// loop();
// record();
// }

// outputs a zip file
// zip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
//         saveAs(blob, "particles_simulated_v10.zip");
//     });