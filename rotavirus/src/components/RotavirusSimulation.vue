<template>
  <div id="modelDiv"></div>
</template>

<script setup>
import { ref, onMounted, watch, toRefs } from 'vue'
import Animator from '../agentscript-master/src/Animator.js'
import TwoDraw from '../agentscript-master/src/TwoDraw.js'
import RotavirusModel from '../agentscript-master/rotavirus.js'

// Define props
const props = defineProps({
  healthy: {
    type: Number,
  },
  infected: {
    type: Number,
  },
  infectionProbability: {
    type: Number,
  },
  speed: {
    type: Number,
  },
  mortality: {
    type: Number,
  },
  infectedTicksDuration: {
    type: Number, // resistant for 5 seconds
  },
  resistantTicksDuration: {
    type: Number, // resistant for 10 seconds
  },
  vaccinationProbability: {
    type: Number,
  },
  vaccinatedTicksDuration: {
    type: Number,
  },
  probStillWhenSick: {
    type: Number,
  },
  socialInfluence: {
    type: Number,
  },
  chartData: {
    type: Object,
  },
  needsReset: {
    type: Boolean,
  },
})

const localNeedsReset = ref(props.needsReset || false)

// Convert props to reactive refs
const refs = toRefs(props)

// References for model and animator
const model = ref(null)
const view = ref(null)
const anim = ref(null)

const emit = defineEmits(['update:needsReset'])

// Watch all relevant props and trigger reset when necessary
Object.values(refs).forEach((dep) => {
  watch(dep, () => {
    if (model.value) {
      localNeedsReset.value = true
      emit('update:needsReset', true)
    }
  })
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
  model.value = new RotavirusModel()
  model.value.healthy = props.healthy
  model.value.infected = props.infected
  model.value.infectionProbability = props.infectionProbability
  model.value.speed = props.speed
  model.value.mortality = props.mortality
  model.value.infectedTicksDuration = props.infectedTicksDuration
  model.value.resistantTicksDuration = props.resistantTicksDuration
  model.value.vaccinationProbability = props.vaccinationProbability
  model.value.vaccinatedTicksDuration = props.vaccinatedTicksDuration
  model.value.probStillWhenSick = props.probStillWhenSick
  model.value.socialInfluence = props.socialInfluence

  // Pass the chartData object to be modified and emitted back
  model.value.chartData = props.chartData

  // Setup the model
  model.value.setup()

  // Create new view
  view.value = new TwoDraw(model.value, {
    div: 'modelDiv',
    patchSize: 8,
    width: 490,
    height: 490,
    drawOptions: {
      patchesColor: 'black',
      turtlesColor: (turtle) => {
        switch (turtle.state) {
          case 'healthy':
            return 'blue'
          case 'infected':
            return 'red'
          case 'resistant':
            return 'white'
          case 'vaccinated':
            return 'yellow'
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
      if (localNeedsReset.value) {
        resetModel()
        localNeedsReset.value = false
        emit('update:needsReset', false)
      }
    },
    -1, // how many steps
    60, // at fps steps/second
  )
}

onMounted(async () => {
  resetModel() // Initialize the model
})
</script>

<style scoped lang="scss"></style>
