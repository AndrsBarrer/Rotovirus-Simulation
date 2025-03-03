import World from './src/World.js'
import Model from './src/Model.js'
import * as util from './src/utils.js'

export default class RotavirusModel extends Model {
  // population = 100 // How many people are moving around in the space
  // speed = 0.6 // The speed that they should move at
  // infected = 10 // Starting amount of infected
  vision = 1 // The radius of infection in patches
  // infectionProbability = 70 // Probability of getting infected when coming into close contact (0-100%)

  // infectedTicksDuration = 100 // How long a turtle should be infected for
  // resistantTicksDuration = 80 // How long a turtle should be resistant for

  /*
  add random number of someone that is more resistant than the rest         (TODO)
  add structures like roads and houses or something                         (DONE ? added roads)
  add an easier way of changing parameters (visually like netlogo)          (DONE)
  add deaths (look up probability of death for Rotavirus)                   (DONE)
  */
  setup() {
    // Set a default value shared by all Agents in this AgentSet
    this.turtles.setDefault('state', 'healthy') // all are healthy to begin
    // this.setupPatches(); // comment out for now, dont know what to do with this
    this.setupPatches()
    this.setupTurtles()
  }

  // I honestly don't know what this does
  constructor(worldOptions = World.defaultOptions(50)) {
    super(worldOptions)
  }

  setupPatches() {
    const centerX = this.world.width / 2 - 50
    const centerY = this.world.height / 2 - 50

    // patchRectXY(x, y, w, h): This function selects a rectangular group of patches
    // centered at (x, y) with a width of w and a height of h.

    // Used to add/subtract offsets from x and y when creating roads
    const offsets = [-40, -20, 0, 20, 40]

    // Default all patches to not be roads
    this.patches.ask((p) => {
      p.isRoad = false
    })

    offsets.forEach((offset) => {
      // Create vertical roads
      this.patches.patchRectXY(centerX + offset, centerY, 3, 50).ask((p) => (p.isRoad = true))
      // Create horizontal roads
      this.patches.patchRectXY(centerX, centerY + offset, 50, 3).ask((p) => (p.isRoad = true))
    })
  }

  setupTurtles() {
    // Create all healthy turtles first
    this.turtles.create(this.population - this.infected, (turtle) => {
      let roadPatch = this.patches.with((p) => p.isRoad).oneOf()
      turtle.setxy(roadPatch.x, roadPatch.y) // Start turtles on roads
      turtle.state = 'healthy' // make all turtles healthy to start
      turtle.resistantTicksCount = 0
      turtle.infectedTicksCount = 0
      turtle.deathProbability = 10 // Sometimes the death probability is higher in some people
    })

    // Now create the infected turtles
    this.turtles.create(this.infected, (turtle) => {
      let roadPatch = this.patches.with((p) => p.isRoad).oneOf()
      turtle.setxy(roadPatch.x, roadPatch.y) // Start turtles on roads
      turtle.state = 'infected' // infect some of the turtles
      turtle.resistantTicksCount = 0 // ticks get incremented for every turtle until the max ticks is reached
      turtle.infectedTicksCount = 0
      turtle.deathProbability = 10 // Sometimes the death probability is higher in some people
    })
  }

  step() {
    this.updateTurtles()
  }

  updateTurtles() {
    this.turtles.ask((turtle) => {
      this.move(turtle)
      this.updateInfection(turtle)
    })
  }

  updateInfection(turtle) {
    if (!turtle) {
      console.error('updateInfection was called with an undefined turtle!')
      return
    }

    // Only get those that are specifically infected around the turtle
    const nearby = this.turtles
      .inRadius(turtle, this.vision, false)
      .filter((t) => t !== turtle && t.state === 'infected')

    // Check if there are any infected turtles around the turtle
    if (nearby.length > 0 && turtle.state === 'healthy') {
      const luck = Math.floor(Math.random() * 100 + 1)

      if (luck <= this.infectionProbability) {
        turtle.state = 'infected' // Spread infection
      }
    }

    // If the turtle is infected, update how long they should be infected for
    if (turtle.state === 'infected') {
      turtle.infectedTicksCount++

      // take into consideration ticks,
      // when they reach the max amount of ticks,
      // roll the dice on if they live or not
      const mortalityRoll = Math.floor(Math.random() * 100 + 1)

      if (this.infectedTicksDuration <= turtle.infectedTicksCount) {
        if (mortalityRoll <= this.mortality) {
          //console.log('died')
          this.turtles.remove(turtle)
        }
        turtle.state = 'healthy'
        turtle.infectedTicksCount = 0
      }
    }
  }

  move(turtle) {
    // Check if the turtle is about to go out of bounds
    // const p = turtle.patch
    // if (p.isOnEdge()) {
    //   turtle.rotate(90) // If the turtle was on the edge of the map, turn it around 180
    //   turtle.forward(this.speed)
    // }
    // turtle.forward(this.speed)

    let nextPatch = turtle.patchAhead(1) // Look at the patch ahead
    if (nextPatch && nextPatch.isRoad) {
      turtle.forward(this.speed) // Move forward only if it's a road
    } else {
      turtle.right(90) // Turn if there's no road
    }
  }
}
