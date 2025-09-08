const canvas=document.getElementById("gameCanvas");
const ctx=canvas.getContext("2d");
let keys={};
let playersA=[], playersB=[], ball, timeLeft, scoreA=0, scoreB=0;
let running=false, paused=false;
let teamAName="Team A", teamBName="Team B";
let colorA="#00f", colorB="#f00";

document.addEventListener("keydown",e=>{
  keys[e.key.toLowerCase()]=true;
  if(e.key.toLowerCase()==="p") togglePause();
});
document.addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);

function startGame(){
  document.getElementById("menu").style.display="none";
  document.getElementById("scoreboard").style.display="block";
  teamAName=document.getElementById("teamA").value||"Team A";
  teamBName=document.getElementById("teamB").value||"Team B";
  colorA=document.getElementById("colorA").value;
  colorB=document.getElementById("colorB").value;
  timeLeft=parseInt(document.getElementById("matchTime").value);

  setupTeams();
  ball={x:450,y:275,dx:0,dy:0,r:6,owner:null};

  document.getElementById("crowd").play();
  running=true;
  setInterval(()=>{ if(running && !paused && timeLeft>0) timeLeft--; },1000);
  loop();
}

function setupTeams(){
  playersA=[]; playersB=[];
  // sơ đồ mặc định đơn giản: 1 GK + 4 field
  let baseA=[[100,275],[200,150],[200,400],[300,220],[300,330]];
  let baseB=[[800,275],[700,150],[700,400],[600,220],[600,330]];
  for(let i=0;i<5;i++){
    playersA.push({x:baseA[i][0],y:baseA[i][1],r:14,color:colorA,name:"A"+i,num:i+1,hasBall:false});
    playersB.push({x:baseB[i][0],y:baseB[i][1],r:14,color:colorB,name:"B"+i,num:i+1,hasBall:false,ai:true});
  }
}

function togglePause(){
  paused=!paused;
  document.getElementById("pauseScreen").style.display=paused?"block":"none";
}

function movePlayers(){
  let me=playersA[1]; // tạm điều khiển 1 cầu thủ
  let speed=keys['e']?3:2;
  if(keys['w']||keys['arrowup']) me.y-=speed;
  if(keys['s']||keys['arrowdown']) me.y+=speed;
  if(keys['a']||keys['arrowleft']) me.x-=speed;
  if(keys['d']||keys['arrowright']) me.x+=speed;

  // giữ sân
  me.x=Math.max(30,Math.min(870,me.x));
  me.y=Math.max(30,Math.min(520,me.y));

  // sút / tranh chấp
  if(keys['d']){
    let dist=Math.hypot(me.x-ball.x,me.y-ball.y);
    if(dist<20){
      let dirX=(ball.x-me.x)/dist, dirY=(ball.y-me.y)/dist;
      ball.dx=dirX*6; ball.dy=dirY*6; ball.owner=null;
      document.getElementById("kick").play();
    }
  }
}

function moveBall(){
  ball.x+=ball.dx; ball.y+=ball.dy;
  ball.dx*=0.98; ball.dy*=0.98;

  // bật biên
  if(ball.y<10||ball.y>540) ball.dy*=-1;
  if(ball.x<10||ball.x>890) ball.dx*=-1;

  // goal check
  if(ball.x<20 && ball.y>220&&ball.y<330){ scoreB++; resetBall(); }
  if(ball.x>880&&ball.y>220&&ball.y<330){ scoreA++; resetBall(); }
}

function resetBall(){
  ball.x=450; ball.y=275; ball.dx=0; ball.dy=0; ball.owner=null;
  document.getElementById("whistle").play();
}

function drawField(){
  ctx.fillStyle="#006400"; ctx.fillRect(0,0,900,550);
  ctx.strokeStyle="white"; ctx.lineWidth=2;
  ctx.strokeRect(0,0,900,550);
  ctx.beginPath(); ctx.moveTo(450,0); ctx.lineTo(450,550); ctx.stroke();
  ctx.strokeRect(0,200,10,150); ctx.strokeRect(890,200,10,150);
  ctx.beginPath(); ctx.arc(450,275,70,0,Math.PI*2); ctx.stroke();
}

function drawPlayers(list){
  list.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=p.color; ctx.fill(); ctx.strokeStyle="white"; ctx.stroke();
    ctx.fillStyle="white"; ctx.font="10px Arial";
    ctx.fillText(p.num,p.x-4,p.y+4);
  });
}

function drawBall(){
  ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
  ctx.fillStyle="white"; ctx.fill(); ctx.stroke();
}

function loop(){
  if(!running) return;
  if(!paused){
    movePlayers();
    moveBall();

    drawField();
    drawPlayers(playersA);
    drawPlayers(playersB);
    drawBall();

    document.getElementById("scoreboard").innerText=
      `Time: ${timeLeft} | ${teamAName} ${scoreA} - ${scoreB} ${teamBName}`;
  }
  requestAnimationFrame(loop);
}