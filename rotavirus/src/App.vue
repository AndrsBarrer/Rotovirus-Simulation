<template>
  <div class="main-container">
    <div class="simulation-description">
      <div class="title">
        <h2 class="">Rotavirus Simulation</h2>
        <h3>(60 ticks = 1 second)</h3>
      </div>
      <div class="simulation">
        <RotavirusSimulation
          class="simulation"
          :healthy="healthy"
          :infected="infected"
          :infectionProbability="infectionProbability"
          :speed="speed"
          :mortality="mortality"
          :infectedTicksDuration="infectedTicksDuration"
          :resistantTicksDuration="resistantTicksDuration"
          :vaccinationProbability="vaccinationProbability"
          :vaccinatedTicksDuration="vaccinatedTicksDuration"
          :probStillWhenSick="probStillWhenSick"
          @update:needsReset="resetChart"
        />
      </div>
      <h3 class="description">
        Rotavirus is a highly contagious virus that primarily affects infants and young children,
        causing severe diarrhea, vomiting, fever, and abdominal pain. Symptoms usually appear within
        two days of infection and can lead to dehydration, which can be dangerous if not treated.
        Vaccination is available and effective in preventing severe rotavirus infections.
      </h3>
    </div>

    <div class="settings-chart">
      <div class="settings">
        <div class="settings-row">
          <div class="settings-column">
            <div class="settings-item">
              <h2>Healthy</h2>
              <InputText v-model.number="healthy" class="w-full mb-4" />
              <Slider v-model="healthy" :max="1000" class="w-full" />
            </div>

            <div class="settings-item">
              <h2>Speed</h2>
              <InputText v-model.number="speed" class="w-full mb-4" />
              <Slider v-model="speed" :step="0.1" :max="1" class="w-full" />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h2>Infected</h2>
              <InputText v-model.number="infected" class="w-full mb-4" />
              <Slider v-model="infected" :max="500" class="w-full" />
            </div>
            <div class="settings-item">
              <h2>Mortality Prob.</h2>
              <InputText v-model.number="mortality" class="w-full mb-4" />
              <Slider v-model="mortality" :step="1" :max="100" class="w-full" />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h2>Prob. of Infection</h2>
              <InputText v-model.number="infectionProbability" class="w-full mb-4" />
              <Slider v-model="infectionProbability" :max="100" class="w-full" />
            </div>

            <div class="settings-item">
              <h2>Resistant Ticks</h2>
              <InputText v-model.number="resistantTicksDuration" class="w-full mb-4" />
              <Slider v-model="resistantTicksDuration" :step="1" :max="1000" class="w-full" />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h2>Infected Ticks</h2>
              <InputText v-model.number="infectedTicksDuration" class="w-full mb-4" />
              <Slider v-model="infectedTicksDuration" :step="1" :max="1000" class="w-full" />
            </div>
            <div class="settings-item">
              <h2>Vaccination Prob.</h2>
              <InputText v-model.number="vaccinationProbability" class="w-full mb-4" />
              <Slider v-model="vaccinationProbability" :step="1" :max="100" class="w-full" />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h2>Vax Ticks Duration</h2>
              <InputText v-model.number="vaccinatedTicksDuration" class="w-full mb-4" />
              <Slider v-model="vaccinatedTicksDuration" :step="1" :max="1000" class="w-full" />
            </div>
            <div class="settings-item">
              <h2>Immobility w/ Sick</h2>
              <InputText v-model.number="probStillWhenSick" class="w-full mb-4" />
              <Slider v-model="probStillWhenSick" :step="1" :max="100" class="w-full" />
            </div>
          </div>
        </div>
      </div>

      <div class="chart">
        <canvas id="stats-chart"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import RotavirusSimulation from './components/RotavirusSimulation.vue'
import Slider from 'primevue/slider'
import InputText from 'primevue/inputtext'
import { ref, onMounted, watch } from 'vue'
import { Chart } from 'chart.js'

import { chartData } from './components/virusChart.js'

const healthy = ref(100)
const infected = ref(10)
const infectionProbability = ref(10)
const speed = ref(0.5)
const mortality = ref(10)
const infectedTicksDuration = ref(300)
const resistantTicksDuration = ref(600)
const vaccinationProbability = ref(25)
const vaccinatedTicksDuration = ref(400)
const probStillWhenSick = ref(20)
const needsReset = ref(false)

let chart: Chart | null = null

onMounted(() => {
  // Ensure the canvas element exists after the component is mounted
  const ctx = document.getElementById('stats-chart')
  if (ctx) {
    chart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Population',
            data: [], // This will store historical values
            borderColor: 'green',
            fill: false,
          },
          {
            label: 'Healthy',
            data: [], // This will store historical values
            borderColor: 'blue',
            fill: false,
          },
          {
            label: 'Infected',
            data: [], // This will store historical values
            borderColor: 'red',
            fill: false,
          },
          {
            label: 'Resistant',
            data: [], // This will store historical values
            borderColor: 'white',
            fill: false,
          },
          {
            label: 'Vaccinated',
            data: [], // This will store historical values
            borderColor: 'Yellow',
            fill: false,
          },
          {
            label: 'Deaths',
            data: [], // This will store historical values
            borderColor: 'Black',
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        tooltips: { enabled: false },
        scales: {
          x: {
            ticks: {
              display: false,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Population',
            },
          },
        },
      },
    })
    ctx.style.backgroundColor = 'rgba(160,160,160,0.1)'
  }
})

// Function to update the chart with a new healthy value
function updateChart(newChartData, time) {
  chart.data.labels.push(time) // Add new time label
  chart.data.datasets[0].data.push(newChartData.population)
  chart.data.datasets[1].data.push(newChartData.healthy)
  chart.data.datasets[2].data.push(newChartData.infected)
  chart.data.datasets[3].data.push(newChartData.resistant)
  chart.data.datasets[4].data.push(newChartData.vaccinated)
  chart.data.datasets[5].data.push(newChartData.deaths)
  chart.update() // Refresh the chart
}

// Add this function to reset the chart
function resetChart() {
  if (chart) {
    // Clear all datasets
    chart.data.labels = []
    chart.data.datasets.forEach((dataset) => {
      dataset.data = []
    })
    chart.update()

    // Reset the needsReset flag
    needsReset.value = false
  }
}

// Add a watcher for the needsReset ref
watch(needsReset, (newValue) => {
  console.log('needsReset changed to:', newValue) // Debug
  if (newValue === true) {
    resetChart()
  }
})

setInterval(() => {
  const currentTime = new Date().toLocaleTimeString()
  updateChart(chartData, currentTime)
}, 500)
</script>

<style lang="scss">
.main-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  // border: 2px solid blue;

  .simulation-description {
    display: flex;
    flex-direction: column;
    // border: 2px solid red;
    flex: 1;

    .simulation {
      display: flex;
      flex-direction: row;
    }

    .description {
      display: flex;
      flex-direction: row;
    }
  }

  .settings-chart {
    display: flex;
    flex-direction: column;
    flex-grow: 2;
    width: 100%;
    // border: 2px solid red;

    .settings {
      display: flex;
      flex-direction: column;
      width: 100%;

      .settings-row {
        display: flex;
        width: 100%;
        flex-direction: row;
        gap: 10px;
        justify-content: space-between;
      }

      .settings-column {
        flex: 1;
        padding: 10px;
        box-sizing: border-box;

        .settings-item {
          margin: 15px;
        }
      }
    }

    .chart {
      display: flex;
      flex-direction: row;
      height: 100%;
      width: 100%;
      margin-left: 1rem;
    }
  }
}
</style>
