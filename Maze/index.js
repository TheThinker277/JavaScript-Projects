const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 1.5;
const { world } = engine;

const padding = 1;
const width = window.innerWidth-padding;
const height = window.innerHeight-padding;
const cellSize = 75; // Adjust cell size for density (smaller means more cells)
const cellsHorizontal = Math.floor(width / cellSize); // More cells horizontally
const cellsVertical = Math.floor(height / cellSize); 
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 30, {
    label: "rectangle body",
    isStatic: true,
    mass: 10,
    render: {
      fillStyle: "#2C3E50", 
    },
  }),
  Bodies.rectangle(width / 2, height, width, 30, {
    label: "rectangle body",
    isStatic: true,
    mass: 10,
    render: {
      fillStyle: "#2C3E50", 
    }, }),
  Bodies.rectangle(0, height / 2, 30, height, {  label: "rectangle body",
    isStatic: true,
    mass: 10, 
    render: {
      fillStyle: "#2C3E50", 
    }, }),
  Bodies.rectangle(width, height / 2, 30, height, {  label: "rectangle body",
    isStatic: true,
    mass: 10, 
    render: {
      fillStyle: "#2C3E50", 
    }, }),
];

World.add(world, walls);

// Maze Generation

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;
    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
  if (grid[row][column]) return;
  grid[row][column] = true;

  const neighbors = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal
    ) {
      continue;
    }
    if (grid[nextRow][nextColumn]) {
      continue;
    }
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else {
      horizontals[row][column] = true;
    }
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      10,
      {
        label: "wall",
        isStatic: true,
        mass: 10, 
        render: {
          fillStyle: "#FF6347", 
        },
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      10,
      unitLengthY,
      {
        label: "wall",
        isStatic: true,
        mass: 10, 
        render: {
          fillStyle: "#FF6347", 
        },
      }
    );
    World.add(world, wall);
  });
});

// Goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    label: "goal",
    isStatic: true,
    render: {
      fillStyle: "#F39C12", // Green for the goal
    },
  }
);
World.add(world, goal);


// Ball
const Radius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, Radius, {
  label: "ball",
  restitution: 0.5, // Adjust for bounciness
  friction: 0.1,
  frictionAir: 0.02,
  density: 0.04, //
  render: {
    fillStyle: "#1E90FF", // Dodger blue for the ball
  },
});

World.add(world, ball);

// Limit ball velocity
const MAX_VELOCITY = 10;
document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;

  if (event.keyCode === 87 && y > -MAX_VELOCITY) {
    // W - Up
    Body.setVelocity(ball, { x, y: y - 5 });
  }
  if (event.keyCode === 68 && x < MAX_VELOCITY) {
    // D - Right
    Body.setVelocity(ball, { x: x + 5, y });
  }
  if (event.keyCode === 83 && y < MAX_VELOCITY) {
    // S - Down
    Body.setVelocity(ball, { x, y: y + 5 });
  }
  if (event.keyCode === 65 && x > -MAX_VELOCITY) {
    // A - Left
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

// Win Condition
Events.on(engine, "collisionStart", (event) => {
    event.pairs.forEach((collision) => {
      const labels = ["ball", "goal"];
      if (
        labels.includes(collision.bodyA.label) &&
        labels.includes(collision.bodyB.label)
      ) {
        world.gravity.y = 1;
  
        document.querySelector(".winner").classList.remove("hidden");
  
        world.bodies.forEach((body) => {
          if (body.label === "wall") {
            Body.setStatic(body, false);
  
            const randomAngularVelocity = (Math.random() - 0.5) * 0.2; 
            Body.setAngularVelocity(body, randomAngularVelocity); 
  
            const forceMagnitude = 0.01;
            Body.applyForce(body, body.position, {
              x: (Math.random() - 0.5) * forceMagnitude, 
              y: 0 
            });
          }
        });
      }
    });
  });
  
