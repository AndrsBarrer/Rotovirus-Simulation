<script setup lang="ts">
import RotavirusSimulation from './components/RotavirusSimulation.vue'
import Slider from 'primevue/slider'
import InputText from 'primevue/inputtext'
import { ref } from 'vue'

const population = ref(100)
const infected = ref(10)
const infectionProbability = ref(10)
const speed = ref(0.5)
const mortality = ref(10)
const infectedTicksDuration = ref(300)
const resistantTicksDuration = ref(600)
const vaccinationProbability = ref(25)
const vaccinatedTicksDuration = ref(20)
const probStillWhenSick = ref(20)
</script>

<template>
  <div class="main-body">
    <div class="row">
      <div class="column simulation-column">
        <RotavirusSimulation
          :population="population"
          :infected="infected"
          :infectionProbability="infectionProbability"
          :speed="speed"
          :mortality="mortality"
          :infectedTicksDuration="infectedTicksDuration"
          :resistantTicksDuration="resistantTicksDuration"
          :vaccinationProbability="vaccinationProbability"
          :vaccinatedTicksDuration="vaccinatedTicksDuration"
          :probStillWhenSick="probStillWhenSick"
        />
        <h3>
          Rotavirus is a highly contagious virus that primarily affects infants and young children,
          causing severe diarrhea, vomiting, fever, and abdominal pain. Symptoms usually appear
          within two days of infection and can lead to dehydration, which can be dangerous if not
          treated. Vaccination is available and effective in preventing severe rotavirus infections.
        </h3>
      </div>

      <div class="column settings-column">
        <div class="row">
          <div class="settings-control">
            <h2>Population</h2>
            <InputText v-model.number="population" class="w-full mb-4" />
            <Slider v-model="population" :max="1000" class="w-full" />
          </div>
        </div>

        <div class="row">
          <div class="settings-control">
            <h2>Infected</h2>
            <InputText v-model.number="infected" class="w-full mb-4" />
            <Slider v-model="infected" :max="500" class="w-full" />
          </div>
        </div>

        <div class="row">
          <div class="settings-control">
            <h2>Probability of Infection</h2>
            <InputText v-model.number="infectionProbability" class="w-full mb-4" />
            <Slider v-model="infectionProbability" :max="100" class="w-full" />
          </div>
        </div>

        <div class="row">
          <div class="settings-control">
            <h2>Speed</h2>
            <InputText v-model.number="speed" class="w-full mb-4" />
            <Slider v-model="speed" :step="0.1" :max="1" class="w-full" />
          </div>
        </div>

        <div class="row">
          <div class="settings-control">
            <h2>Mortality Prob.</h2>
            <InputText v-model.number="mortality" class="w-full mb-4" />
            <Slider v-model="mortality" :step="1" :max="100" class="w-full" />
          </div>
        </div>
      </div>

      <div class="column settings-column">
        <div class="row">
          <div class="settings-control">
            <h2>Infected Ticks</h2>
            <InputText v-model.number="infectedTicksDuration" class="w-full mb-4" />
            <Slider v-model="infectedTicksDuration" :step="1" :max="1000" class="w-full" />
          </div>
        </div>

        <div class="row">
          <div class="settings-control">
            <h2>Resistant Ticks</h2>
            <InputText v-model.number="resistantTicksDuration" class="w-full mb-4" />
            <Slider v-model="resistantTicksDuration" :step="1" :max="1000" class="w-full" />
          </div>
        </div>
        <div class="row">
          <div class="settings-control">
            <h2>Vaccination Prob.</h2>
            <InputText v-model.number="vaccinationProbability" class="w-full mb-4" />
            <Slider v-model="vaccinationProbability" :step="1" :max="100" class="w-full" />
          </div>
        </div>

        <div class="row">
          <div class="settings-control">
            <h2>Vax Ticks Duration</h2>
            <InputText v-model.number="vaccinatedTicksDuration" class="w-full mb-4" />
            <Slider v-model="vaccinatedTicksDuration" :step="1" :max="1000" class="w-full" />
          </div>
        </div>

        <div class="row">
          <div class="settings-control">
            <h2>Immobility when Sick Prob.</h2>
            <InputText v-model.number="probStillWhenSick" class="w-full mb-4" />
            <Slider v-model="probStillWhenSick" :step="1" :max="100" class="w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-body {
  color: white;
  min-height: 100vh;
  padding: 2rem 2rem;
}

/* Row container */
.row {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin: 0 auto;
}

/* Column styling */
.column {
  flex: 1;
}

.simulation-column {
  flex: 3; /* Make simulation take more space */
}

.settings-column {
  flex: 1; /* Settings take less space */
  padding-top: 2rem;
}

.settings-control {
  min-width: 20rem;
  margin-top: 2rem;
}

/* Input styling */
:deep(.p-inputtext) {
  width: 100%;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
}
:deep(.p-slider-handle) {
  background-color: #fff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }

  .column {
    width: 100%;
    margin-bottom: 1rem;
  }
}
</style>
