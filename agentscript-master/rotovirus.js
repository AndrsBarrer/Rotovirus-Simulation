import World from "./agentscript-master/src/World.js";
import Model from "./agentscript-master/src/Model.js";
import * as util from "./agentscript-master/src/utils.js";

export default class RotovirusModel extends Model {
  population = 500; // How many people are moving around in the space
  speed = 1.0; // The speed that they should move at
  infected = 1; // Starting amount of infected
  vision = 1; // The radius of infection in patches
  infectionProbability = 10; // Probability of getting infected when coming into close contact (0-100%)

  infectedTicksDuration = 100; // How long a turtle should be infected for
  resistantTicksDuration = 80; // How long a turtle should be resistant for

  setup() {
    // Set a default value shared by all Agents in this AgentSet
    this.turtles.setDefault("state", "healthy"); // all are healthy to begin
    // this.setupPatches(); // comment out for now, dont know what to do with this
    this.setupTurtles();
  }

  // I honestly don't know what this does
  constructor(worldOptions = World.defaultOptions(40)) {
    super(worldOptions);
  }

  // what do the patches need to be asked?
  // I wouldnt think they need to be asked anything at all honestly

  // what do the agents need to be asked?
  // they need to be asked if there is a person in front of them
  // if there is a person in front of them
  //   setupPatches() {
  //     this.patches.ask((p) => {});
  //   }

  setupTurtles() {
    // Create all healthy turtles first
    this.turtles.create(this.population - this.infected, (turtle) => {
      const [x, y] = this.world.randomPoint();
      turtle.setxy(x, y); // Assign the random coordinates
      turtle.state = "healthy"; // make all turtles healthy to start
      turtle.resistantTicksTotal = 0;
      turtle.infectedTicksTotal = 0;
    });

    // Now create the infected turtles
    this.turtles.create(this.infected, (turtle) => {
      const [x, y] = this.world.randomPoint();
      turtle.setxy(x, y); // Assign the random coordinates
      turtle.state = "infected"; // make all turtles healthy to start
      turtle.resistantTicksTotal = 0;
      turtle.infectedTicksTotal = 0;
    });
  }

  step() {
    this.updateTurtles();
  }

  updateTurtles() {
    this.turtles.ask((turtle) => {
      this.move(turtle);
      this.updateInfection(turtle);
    });
  }

  updateInfection(turtle) {
    if (!turtle) {
      console.error("updateInfection was called with an undefined turtle!");
      return;
    }

    // Only get those that are specifically infected around the turtle
    const nearby = this.turtles
      .inRadius(turtle, this.vision, false)
      .filter((t) => t !== turtle && t.state === "infected");

    // Check if there are any infected turtles around the turtle
    if (nearby.length > 0 && turtle.state === "healthy") {
      const luck = Math.floor(Math.random() * 100 + 1);

      if (luck <= this.infectionProbability) {
        turtle.state = "infected"; // Spread infection
        console.log("A turtle has been infected...");
      }
    }

    // If the turtle is infected, update how long they should be infected for
    if (turtle.state === "infected") {
      turtle.infectedTicksTotal++;

      console.log(this.infectedTicksDuration, turtle.infectedTicksTotal, "\n");
      if (this.infectedTicksDuration <= turtle.infectedTicksTotal) {
        turtle.state = "healthy";
        turtle.infectedTicksTotal = 0;
      }
    }
  }

  move(turtle) {
    // Check if the turtle is about to go out of bounds
    const p = turtle.patch;
    if (p.isOnEdge()) {
      turtle.rotate(90); // If the turtle was on the edge of the map, turn it around 180
      turtle.forward(this.speed);
    }
    turtle.forward(this.speed);
  }
}
