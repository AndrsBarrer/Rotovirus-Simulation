<script setup>
import { ref, onMounted, watch, toRefs } from 'vue'
import Animator from 'https://code.agentscript.org/src/Animator.js'
import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import RotovirusModel from '../agentscript-master/rotovirus.js'

// Define props
const props = defineProps({
  population: {
    type: Number,
    default: 100,
  },
  infected: {
    type: Number,
    default: 10,
  },
  infectionProbability: {
    type: Number,
    default: 20,
  },
  speed: {
    type: Number,
    default: 0.6,
  },
})

// Extract as a ref to make it reactive
const { population, infected, infectionProbability, speed } = toRefs(props)

// References to store model and animator
const model = ref(null)
const view = ref(null)
const anim = ref(null)
const needsReset = ref(false)

// Watch for changes in population
watch(population, (newValue) => {
  if (model.value) {
    // Population changes require resetting the model
    needsReset.value = true
    console.log(`Population will be updated to: ${newValue} on next reset`)
  }
})

// Watch for changes in population
watch(infected, (newValue) => {
  if (model.value) {
    // Population changes require resetting the model
    needsReset.value = true
    console.log(`Population will be updated to: ${newValue} on next reset`)
  }
})

// Watch for changes in population
watch(infectionProbability, (newValue) => {
  if (model.value) {
    // Population changes require resetting the model
    needsReset.value = true
    console.log(`Population will be updated to: ${newValue} on next reset`)
  }
})

// Watch for changes in population
watch(speed, (newValue) => {
  if (model.value) {
    // Population changes require resetting the model
    needsReset.value = true
    console.log(`Population will be updated to: ${newValue} on next reset`)
  }
})

// Function to reset and recreate the model
const resetModel = () => {
  if (anim.value) {
    anim.value.stop()
  }

  // Clear the model div
  const modelDiv = document.getElementById('modelDiv')
  if (modelDiv) {
    modelDiv.innerHTML = ''
  }

  // Create new model with current parameters
  model.value = new RotovirusModel()
  model.value.population = population.value
  model.value.infected = infected.value
  model.value.infectionProbability = infectionProbability.value
  model.value.speed = speed.value

  // Setup the model
  model.value.setup()

  // Create new view
  view.value = new TwoDraw(model.value, {
    div: 'modelDiv',
    patchSize: 10,
    drawOptions: {
      patchesColor: 'black',
      turtlesColor: (turtle) => {
        switch (turtle.state) {
          case 'healthy':
            return 'blue'
          case 'infected':
            return 'red'
          case 'resistant':
            return 'gray'
          case 'vaccinated':
            return 'blue'
          default:
            return 'blue'
        }
      },
      turtlesSize: 2,
      turtlesShape: 'dart',
    },
  })

  // Create new animator
  anim.value = new Animator(
    () => {
      model.value.step()
      view.value.draw()

      // Check if we need to reset due to parameter changes
      if (needsReset.value) {
        resetModel()
        needsReset.value = false
      }
    },
    -1, // how many steps
    30, // at fps steps/second
  )
}

onMounted(async () => {
  resetModel() // Initialize the model
})
</script>

<template>
  <div>
    <h2>Rotovirus Simulation</h2>
    <div id="modelDiv"></div>
  </div>
</template>

<style scoped></style>
<!-- <script setup>
import { ref, onMounted, watch } from 'vue'
import Animator from 'https://code.agentscript.org/src/Animator.js'
import TwoDraw from 'https://code.agentscript.org/src/TwoDraw.js'
import RotovirusModel from '../agentscript-master/rotovirus.js'

onMounted(async () => {
  const model = new RotovirusModel()
  model.setup()

  const turtleColors = {
    healthy: 'blue',
    infected: 'red',
    resistant: 'gray',
    vaccinated: 'blue',
  }

  const view = new TwoDraw(model, {
    div: 'modelDiv',
    patchSize: 10,
    drawOptions: {
      patchesColor: 'black',
      turtlesColor: (turtle) => turtleColors[turtle.state],
      turtlesSize: 2,
      turtlesShape: 'dart',
    },
  })

  const anim = new Animator(
    () => {
      model.step()
      view.draw()
    },
    -1, // how many steps
    30, // at fps steps/second
  )
})
</script>

<template>
  <div>
    <h2>Rotovirus Simulation</h2>
    <div id="modelDiv"></div>
  </div>
</template>

<style scoped></style> -->
