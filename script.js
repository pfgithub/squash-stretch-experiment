const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 80,
  vx: 0,
  vy: 0,
  isDragging: false,
  bounceTimer: 0,
  bounceMax: 0,
  bounceStart: null,
};

let lastMouse = { x: 0, y: 0 };

function blend(a, b, t) {
  return a + (b - a) * t;
}

function drawBall() {
  let vx = ball.vx;
  let vy = ball.vy;
  let x = ball.x;
  let y = ball.y;

  const speed = Math.sqrt(vx ** 2 + vy ** 2);
  let stretch = 1 + Math.min(speed / 50, 0.5);

  if (ball.bounceTimer > 0) {
    const percent = ball.bounceTimer / ball.bounceMax;

    let prev_angle = Math.atan2(ball.bounceStart[1], ball.bounceStart[0]) + Math.PI;
    let next_angle = Math.atan2(vy, vx);
    if (prev_angle - next_angle > Math.PI) {
      next_angle += Math.PI * 2;
    } else if (prev_angle - next_angle < -Math.PI) {
      prev_angle -= Math.PI * 2;
    }

    let factor = Math.sin(percent * Math.PI) * percent * (1 - percent) * 4;
    y += (factor * ball.radius) * (stretch - 1);
    stretch = blend(stretch, 1 / stretch, factor);


    const angle = blend(prev_angle, next_angle, percent);
    vx = Math.cos(angle) * speed;
    vy = Math.sin(angle) * speed;

  }


  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.atan2(vy, vx)); // Rotate to align with motion direction
  ctx.scale(stretch, 1 / stretch);
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'blue';
  ctx.fill();
  ctx.closePath();
  ctx.restore();
}

function updateBall() {
  if (ball.bounceTimer > 0) {
    ball.bounceTimer += 1;
    if (ball.bounceTimer > ball.bounceMax) ball.bounceTimer = 0;
  }
  if (!ball.isDragging && ball.bounceTimer === 0) {
    ball.vy += 0.5; // gravity

    ball.x += ball.vx;
    ball.y += ball.vy;

    // Bounce off edges
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
      ball.bounceStart = [ball.vx, ball.vy];
      ball.vx = -ball.vx * 0.8; // lose some velocity on bounce
      ball.x = Math.max(ball.radius, Math.min(ball.x, canvas.width - ball.radius));
      ball.bounceTimer = 1;
      ball.bounceMax = 10;
    }

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
      ball.bounceStart = [ball.vx, ball.vy];
      ball.vy = -ball.vy * 0.8;
      ball.y = Math.max(ball.radius, Math.min(ball.y, canvas.height - ball.radius));
      ball.bounceTimer = 1;
      ball.bounceMax = 10;
    }

    // Air resistance
    ball.vx *= 0.98;
    ball.vy *= 0.98;
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousedown', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // Check if mouse is inside the ball
  if (
    Math.sqrt((mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2) <= ball.radius
  ) {
    ball.isDragging = true;
    ball.bounceTimer = 0;
    lastMouse.x = mouseX;
    lastMouse.y = mouseY;
  }
});

document.addEventListener('mousemove', (e) => {
  if (ball.isDragging) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    ball.vx = mouseX - lastMouse.x;
    ball.vy = mouseY - lastMouse.y;

    ball.x = mouseX;
    ball.y = mouseY;

    lastMouse.x = mouseX;
    lastMouse.y = mouseY;
  }
});

document.addEventListener('mouseup', () => {
  ball.isDragging = false;
});


window.onresize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function animate() {
  clearCanvas();
  updateBall();
  drawBall();
  requestAnimationFrame(animate);
}

animate();
