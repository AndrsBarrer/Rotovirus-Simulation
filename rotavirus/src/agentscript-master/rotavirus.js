import World from './src/World.js'
import Model from './src/Model.js'
import { chartData } from '../components/virusChart.js'

export default class RotavirusModel extends Model {
  vision = 1 // The radius of infection in patches

  // Temporary counter to update the values after each step
  statistics = {
    newHealthyToInfected: 0,
    newHealthyToVaccinated: 0,

    newInfectedToResistant: 0,
    newInfectedToDead: 0,

    newVaccinatedToHealthy: 0,

    newResistantToHealthy: 0,
  }

  setup() {
    // Set a default value shared by all Agents in this AgentSet
    this.turtles.setDefault('state', 'healthy') // all are healthy to begin
    this.setupPatches()
    this.setupTurtles()
    this.resetStatistics()
  }

  // I honestly don't know what this does
  constructor(worldOptions = World.defaultOptions(50)) {
    super(worldOptions)
  }

  setupPatches() {
    const centerX = this.world.width / 2 - 50
    const centerY = this.world.height / 2 - 50

    // Used to add/subtract offsets from x and y when creating roads
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
    chartData.population = this.infected + this.healthy
    chartData.healthy = this.healthy
    chartData.infected = this.infected
    chartData.resistant = 0
    chartData.vaccinated = 0
    chartData.deaths = 0

    // Create all healthy turtles first
    this.turtles.create(this.healthy, (turtle) => {
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
    this.updateStatistics()
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
          this.statistics.newInfectedToDead++
        } else {
          this.makeResistant(turtle)
          this.statistics.newInfectedToResistant++
        }
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
          this.statistics.newHealthyToVaccinated++
        }
      }
    }

    if (turtle.state === 'vaccinated') {
      if (turtle.vaccinatedTicksCount >= this.vaccinatedTicksDuration) {
        this.makeHealthy(turtle)
        this.statistics.newVaccinatedToHealthy++
      }
      turtle.vaccinatedTicksCount++
    }

    if (turtle.state === 'resistant') {
      // Exceeded how long someone can be resistant for
      if (turtle.resistantTicksCount++ >= this.resistantTicksDuration) {
        this.makeHealthy(turtle)
        this.statistics.newResistantToHealthy++
      }
    }
  }

  getNearbyInfected(turtle) {
    const nearbyTurtles = this.turtles.inRadius(turtle, this.vision, false)

    const infected = nearbyTurtles
      .filter((t) => t !== turtle && t.state === 'infected')
      .map((t) => t.state)

    return infected
  }

  move(turtle) {
    let nextPatch = turtle.patchAhead(1) // Look at the patch ahead

    // Every 10 ticks evaluate if they should move
    if (turtle.state === 'infected') {
      if (turtle.infectedTicksCount % 60 === 0) {
        turtle.shouldMove = this.spinRoulette() > this.probStillWhenSick ? true : false
      }
    }

    if (turtle.shouldMove) {
      if (nextPatch && nextPatch.isRoad) {
        turtle.forward(turtle.state === 'infected' ? this.speed * 0.25 : this.speed) // Move forward only if it's a road
      } else {
        turtle.right(75) // Turn if there's no road
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
        this.statistics.newHealthyToInfected++
      }
    }
  }

  // Sets the state of the turtle to healthy, along with the rest of its internal variables
  makeHealthy(turtle) {
    turtle.state = 'healthy' // infect some of the turtles
    turtle.infectedTicksCount = 0
    turtle.healthyTicksCount = 0
    turtle.vaccinatedTicksCount = 0
    turtle.resistantTicksCount = 0
    turtle.shouldMove = true
  }

  makeInfected(turtle) {
    turtle.state = 'infected' // Spread infection
    turtle.shouldMove = true
    turtle.infectedTicksCount = 0
    turtle.healthyTicksCount = 0
    turtle.vaccinatedTicksCount = 0
    turtle.resistantTicksCount = 0
  }

  makeVaccinated(turtle) {
    turtle.state = 'vaccinated'
  }

  makeResistant(turtle) {
    turtle.state = 'resistant'
    turtle.infectedTicksCount = 0
    turtle.healthyTicksCount = 0
    turtle.vaccinatedTicksCount = 0
    turtle.resistantTicksCount = 0
    //turtle.speed = 0.5
    turtle.shouldMove = true
  }

  finishHim(turtle) {
    turtle.state = 'dead'
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
    turtle.deathProbability = 10
  }

  updateStatistics() {
    // Update total population
    chartData.population -= this.statistics.newInfectedToDead

    // Update healthy
    chartData.healthy +=
      this.statistics.newResistantToHealthy +
      this.statistics.newVaccinatedToHealthy -
      this.statistics.newHealthyToInfected -
      this.statistics.newHealthyToVaccinated

    chartData.infected +=
      this.statistics.newHealthyToInfected -
      this.statistics.newInfectedToResistant -
      this.statistics.newInfectedToDead

    // Update resistant count
    chartData.resistant +=
      this.statistics.newInfectedToResistant - this.statistics.newResistantToHealthy

    // Update everyone who has died
    chartData.deaths += this.statistics.newInfectedToDead

    // Update vaccinated
    chartData.vaccinated +=
      this.statistics.newHealthyToVaccinated - this.statistics.newVaccinatedToHealthy

    this.resetStatistics()
  }

  resetStatistics() {
    // Reset statistics for the next batch update
    this.statistics.newHealthyToInfected = 0
    this.statistics.newHealthyToVaccinated = 0
    this.statistics.newInfectedToResistant = 0
    this.statistics.newInfectedToDead = 0
    this.statistics.newVaccinatedToHealthy = 0
    this.statistics.newResistantToHealthy = 0
  }
}
