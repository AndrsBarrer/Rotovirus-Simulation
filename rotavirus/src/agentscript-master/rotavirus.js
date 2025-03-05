import World from './src/World.js'
import Model from './src/Model.js'

export default class RotavirusModel extends Model {
  vision = 1 // The radius of infection in patches
  vaccinationProbability = 25
  vaccinatedTicksDuration = 100
  probMovingWhenSick = 25
  resistantTicksDuration = 300
  /*
  add random number of someone that is more resistant than the rest         (TODO)
  add structures like roads and houses or something                         (DONE ? added roads)
  add an easier way of changing parameters (visually like netlogo)          (DONE)
  add deaths (look up probability of death for Rotavirus)                   (DONE)
  */
  setup() {
    // Set a default value shared by all Agents in this AgentSet
    this.turtles.setDefault('state', 'healthy') // all are healthy to begin
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

    // Used to add/subtract offsets from x and y when creating roads
    //const offsets = [-40, -20, 0, 20, 40]
    const offsets = [-20, 0, 20]

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
      this.setupDefaultValues(turtle)
      this.makeHealthy(turtle)
    })

    // Now create the infected turtles
    this.turtles.create(this.infected, (turtle) => {
      this.setupDefaultValues(turtle)
      this.makeInfected(turtle)
    })
  }

  step() {
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

    // Check if there are any infected turtles around the turtle
    this.infectIfExposed(turtle)

    // If the turtle is infected, update how long they should be infected for
    if (turtle.state === 'infected') {
      turtle.infectedTicksCount++

      // roll the dice on if they live or not
      const mortalityRoll = this.spinRoulette()

      if (this.infectedTicksDuration <= turtle.infectedTicksCount) {
        if (mortalityRoll <= this.mortality) {
          this.finishHim(turtle) // FATALITY, rotovirus wins
        }
        this.makeResistant(turtle)
      }
    }

    // If the turtle managed to not get infected, there is a chance
    // they'll be smart and decide to get vaccinated
    const vaccinationRoll = this.spinRoulette()

    if (turtle.state === 'healthy') {
      turtle.healthyTicksCount++

      // Update every second whether they should get vaccinated
      if (turtle.healthyTicksCount % 60 === 0) {
        if (vaccinationRoll <= this.vaccinationProbability) {
          this.makeVaccinated(turtle)
        }
      }
    }

    if (turtle.state === 'vaccinated') {
      if (turtle.vaccinatedTicksCount >= this.vaccinatedTicksDuration) {
        this.makeHealthy(turtle)
      }
      turtle.vaccinatedTicksCount++
    }

    if (turtle.state === 'resistant') {
      // Exceeded how long someone can be resistant for
      if (turtle.resistantTicksCount++ === this.resistantTicksDuration) {
        this.makeHealthy(turtle)
      }
    }
  }

  getNearbyInfected(turtle) {
    return this.turtles
      .inRadius(turtle, this.vision, false)
      .filter((t) => t !== turtle && t.state === 'infected')
  }

  move(turtle) {
    let nextPatch = turtle.patchAhead(1) // Look at the patch ahead

    // Every 10 ticks evaluate if they should move
    if (turtle.state === 'infected') {
      if (turtle.infectedTicksCount % 60 === 0) {
        turtle.shouldMove = this.spinRoulette() > this.probMovingWhenSick ? true : false // fix this later so its not hardcoded
      }
    }

    if (turtle.shouldMove) {
      if (nextPatch && nextPatch.isRoad) {
        turtle.forward(turtle.speed) // Move forward only if it's a road
      } else {
        turtle.right(90) // Turn if there's no road
      }
    }
  }

  infectIfExposed(turtle) {
    // Only get those that are specifically infected around the turtle
    const nearby = this.getNearbyInfected(turtle)

    if (nearby.length > 0 && turtle.state === 'healthy') {
      const luck = this.spinRoulette()

      if (luck <= this.infectionProbability) {
        this.makeInfected(turtle)
      }
    }
  }

  // Sets the state of the turtle to healthy, along with the rest of its internal variables
  makeHealthy(turtle) {
    turtle.state = 'healthy' // infect some of the turtles
    turtle.infectedTicksCount = 0
    turtle.healthyTicksCount = 0
    turtle.vaccinatedTicksCount = 0
    turtle.speed = 0.5
    turtle.shouldMove = true
  }

  makeInfected(turtle) {
    turtle.state = 'infected' // Spread infection
    turtle.speed = 0.2 // Reduction in 25% of their original speed
    turtle.shouldMove = true
  }

  makeVaccinated(turtle) {
    turtle.state = 'vaccinated'
  }

  makeResistant(turtle) {
    turtle.state = 'resistant'
    turtle.infectedTicksCount = 0
    turtle.healthyTicksCount = 0
    turtle.vaccinatedTicksCount = 0
    turtle.speed = 0.5
    turtle.shouldMove = true
  }

  finishHim(turtle) {
    this.turtles.remove(turtle)
  }

  // Returns a number from 0-100
  spinRoulette() {
    return Math.floor(Math.random() * 100 + 1)
  }

  setupDefaultValues(turtle) {
    let roadPatch = this.patches.with((p) => p.isRoad).oneOf()
    turtle.setxy(roadPatch.x, roadPatch.y) // Start turtles on roads
    turtle.healthyTicksCount = 0
    turtle.resistantTicksCount = 0
    turtle.infectedTicksCount = 0
    turtle.vaccinatedTicksCount = 0
    turtle.deathProbability = 10 // Sometimes the death probability is higher in some people
  }
}
