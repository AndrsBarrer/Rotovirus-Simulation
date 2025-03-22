<template>
  <div class="main-container">
    <div class="simulation-description">
      <h2>Rotavirus Simulation</h2>
      <h4>(60 ticks = 1 second)</h4>
      <h3>Note: This is meant to be viewed on fullscreen desktop</h3>
      <h3>Doesn't look right on mobile (yet), working on it! ;)</h3>

      <RotavirusSimulation
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
        :socialInfluence="socialInfluence"
        @update:needsReset="resetChart"
      />
      <h4 class="description">
        Rotavirus is a highly contagious virus that primarily affects infants
        and young children, causing severe diarrhea, vomiting, fever, and
        abdominal pain. Symptoms usually appear within two days of infection and
        can lead to dehydration, which can be dangerous if not treated.
        Vaccination is available and effective in preventing severe rotavirus
        infections.
      </h4>
    </div>

    <div class="settings-chart">
      <div class="settings">
        <div class="settings-row">
          <div class="settings-column">
            <div class="settings-item">
              <h4>Healthy</h4>
              <InputText v-model.number="healthy" class="w-full mb-4" />
              <Slider v-model="healthy" :max="1000" class="w-full" />
            </div>

            <div class="settings-item">
              <h4>Infected</h4>
              <InputText v-model.number="infected" class="w-full mb-4" />
              <Slider v-model="infected" :max="500" class="w-full" />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h4>Infection Prob.</h4>
              <InputText
                v-model.number="infectionProbability"
                class="w-full mb-4"
              />
              <Slider
                v-model="infectionProbability"
                :max="100"
                class="w-full"
              />
            </div>
            <div class="settings-item">
              <h4>Infected Ticks</h4>
              <InputText
                v-model.number="infectedTicksDuration"
                class="w-full mb-4"
              />
              <Slider
                v-model="infectedTicksDuration"
                :step="1"
                :max="1000"
                class="w-full"
              />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h4>Vax Prob.</h4>
              <InputText
                v-model.number="vaccinationProbability"
                class="w-full mb-4"
              />
              <Slider
                v-model="vaccinationProbability"
                :step="1"
                :max="100"
                class="w-full"
              />
            </div>
            <div class="settings-item">
              <h4>Vax Duration</h4>
              <InputText
                v-model.number="vaccinatedTicksDuration"
                class="w-full mb-4"
              />
              <Slider
                v-model="vaccinatedTicksDuration"
                :step="1"
                :max="1000"
                class="w-full"
              />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h4>Mortality Prob.</h4>
              <InputText v-model.number="mortality" class="w-full mb-4" />
              <Slider v-model="mortality" :step="1" :max="100" class="w-full" />
            </div>

            <div class="settings-item">
              <h4>Resistant Ticks</h4>
              <InputText
                v-model.number="resistantTicksDuration"
                class="w-full mb-4"
              />
              <Slider
                v-model="resistantTicksDuration"
                :step="1"
                :max="1000"
                class="w-full"
              />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h4>Speed</h4>
              <InputText v-model.number="speed" class="w-full mb-4" />
              <Slider v-model="speed" :step="0.1" :max="1" class="w-full" />
            </div>
            <div class="settings-item">
              <h4>Immobility (sick)</h4>
              <InputText
                v-model.number="probStillWhenSick"
                class="w-full mb-4"
              />
              <Slider
                v-model="probStillWhenSick"
                :step="1"
                :max="100"
                class="w-full"
              />
            </div>
          </div>

          <div class="settings-column">
            <div class="settings-item">
              <h4>Social Influence</h4>
              <InputText v-model.number="socialInfluence" class="w-full mb-4" />
              <Slider
                v-model="socialInfluence"
                :step="1"
                :max="100"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <canvas id="stats-chart"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import RotavirusSimulation from "./components/RotavirusSimulation.vue";
import Slider from "primevue/slider";
import InputText from "primevue/inputtext";
import { ref, onMounted, watch } from "vue";
import { Chart } from "chart.js";

import { chartData } from "./components/virusChart.js";

// Reactive variables that are passed to the simulation
const healthy = ref(900);
const infected = ref(10);
const infectionProbability = ref(70);
const infectedTicksDuration = ref(400);
const vaccinationProbability = ref(40);
const vaccinatedTicksDuration = ref(600);
const mortality = ref(5);
const resistantTicksDuration = ref(900);
const speed = ref(0.5);
const probStillWhenSick = ref(30);
const socialInfluence = ref(60);

// Used to determine if the simulation should be reset
const needsReset = ref(false);

let chart: Chart | null = null;

onMounted(() => {
  // Ensure the canvas element exists after the component is mounted
  const ctx = document.getElementById("stats-chart");
  if (ctx) {
    chart = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          {
            label: "Population",
            data: [], // This will store historical values
            borderColor: "green",
            fill: false,
          },
          {
            label: "Healthy",
            data: [], // This will store historical values
            borderColor: "blue",
            fill: false,
          },
          {
            label: "Infected",
            data: [], // This will store historical values
            borderColor: "red",
            fill: false,
          },
          {
            label: "Resistant",
            data: [], // This will store historical values
            borderColor: "white",
            fill: false,
          },
          {
            label: "Vaccinated",
            data: [], // This will store historical values
            borderColor: "Yellow",
            fill: false,
          },
          {
            label: "Deaths",
            data: [], // This will store historical values
            borderColor: "Black",
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
              text: "Population",
            },
          },
        },
      },
    });
    ctx.style.backgroundColor = "rgba(160,160,160,0.1)";
  }
});

// Function to update the chart with a new healthy value
function updateChart(newChartData, time) {
  chart.data.labels.push(time); // Add new time label
  chart.data.datasets[0].data.push(newChartData.population);
  chart.data.datasets[1].data.push(newChartData.healthy);
  chart.data.datasets[2].data.push(newChartData.infected);
  chart.data.datasets[3].data.push(newChartData.resistant);
  chart.data.datasets[4].data.push(newChartData.vaccinated);
  chart.data.datasets[5].data.push(newChartData.deaths);
  chart.update(); // Refresh the chart
}

// Add this function to reset the chart
function resetChart() {
  if (chart) {
    // Clear all datasets
    chart.data.labels = [];
    chart.data.datasets.forEach((dataset) => {
      dataset.data = [];
    });
    chart.update();

    // Reset the needsReset flag
    needsReset.value = false;
  }
}

// Add a watcher for the needsReset ref
watch(needsReset, (newValue) => {
  if (newValue === true) {
    resetChart();
  }
});

setInterval(() => {
  const currentTime = new Date().toLocaleTimeString();
  updateChart(chartData, currentTime);
}, 500);
</script>

<style lang="scss">
.main-container {
  display: flex;
  flex-direction: row;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  align-items: center;
  justify-content: center;

  .simulation-description {
    display: flex;
    flex-direction: column;
    flex: 1; // takes up 1/3 of space
    height: 100%;
    // border: 2px solid red;
    justify-content: center;
    align-items: center;

    .description {
      padding: 10px;
    }
  }

  .settings-chart {
    display: flex;
    flex-direction: column;
    flex: 2; // takes up 2/3 of space
    height: 100%;
    width: 100%;
    // border: 2px solid blue;

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
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 10px;
        box-sizing: border-box;
        // border: 2px solid red;

        .settings-item {
          margin: 15px;
        }
      }
    }

    #stats-chart {
      max-width: 100%;
      max-height: 29rem;
      padding: 10px;
    }
  }
}
</style>
