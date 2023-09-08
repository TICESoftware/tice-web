<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { MapboxMap, MapboxNavigationControl, MapboxMarker } from "@studiometa/vue-mapbox-gl"
import { useI18n } from 'vue-i18n'
import MapMarkers from './MapMarkers.vue';
import iso3316 from '../utils/iso3316.json'
import countriesBoundingBoxes from '../utils/countriesBoundingBoxes.json';
import 'mapbox-gl/dist/mapbox-gl.css';

const { t } = useI18n();

class AutoFitToggleControl {
  constructor() {
    this.map = undefined;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this.button = document.createElement('button');
    this.button.id = 'autoFitToggleButton';
    this.button.className = 'mapboxgl-ctrl-auto-fit active';
    this.button.type = 'button';
    const span = document.createElement('span');
    span.className = 'mapboxgl-ctrl-icon';
    this.button.appendChild(span);
    this.container.appendChild(this.button);
  }

  onAdd(map) {
    this.map = map;
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

const props = defineProps(['locations', 'initialLoading', 'ownLocation', 'group'])
const emit = defineEmits(['show-info', 'show-meeting-point'])

watch(
  props.locations, () => {
    autoFitMap();
  },
)

const availableLocations = computed(() => {
  return Object.values(props.locations).filter((location) => location.coordinates !== undefined);
})
const ownCoordinates = computed(() => {
  return [props.ownLocation.longitude, props.ownLocation.latitude];
})
const padding = computed(() => {
  const padHorizontal = Math.min(window.innerWidth / 8, 100);
  const padVertical = Math.min(window.innerHeight / 8, 100);
  return {
    top: padVertical, bottom: padVertical, left: padHorizontal, right: padHorizontal,
  };
})
const meetingPointCoordinates = computed(() => {
  if (props.group.internalSettings.meetingPoint !== undefined) {
    return [props.group.internalSettings.meetingPoint.longitude, props.group.internalSettings.meetingPoint.latitude];
  }
  return undefined;
})

const accessToken = import.meta.env.VITE_MAPBOX_API_KEY
const mapStyle = ref('mapbox://styles/mapbox/streets-v8')
const mapActions = ref(undefined)
const autoFitting = ref(true)

function showInfo(senderId) {
  emit('show-info', props.locations[senderId]);
}

// eventuell mit onLoadMap zusammenfügen
function createdHandler(mapInstance) {
  mapInstance.on('load', () => {
    onLoadMap(mapInstance)
  })
}
function onLoadMap(mapInstance) {
  mapActions.value = mapInstance

  const autoFitToggle = new AutoFitToggleControl();
  autoFitToggle.button.onclick = setAutoFitting;
  mapInstance.addControl(autoFitToggle);

  const onInteraction = (e) => {
    if (e.originalEvent !== undefined) {
      setAutoFitting(false);
    }
  };

  mapInstance.on('mousedown', onInteraction);
  mapInstance.on('dragstart', onInteraction);
  mapInstance.on('movestart', onInteraction);
  mapInstance.on('touchstart', onInteraction);
  mapInstance.on('zoomstart', onInteraction);

  setAutoFitting(true);
}

function setAutoFitting(newValue) {
  if (typeof newValue === 'boolean') {
    autoFitting.value = newValue;
  } else {
    autoFitting.value = !autoFitting.value
  }
  if (autoFitting.value) {
    document.getElementById('autoFitToggleButton').classList.add('active');
    autoFitMap();
  } else {
    document.getElementById('autoFitToggleButton').classList.remove('active');
  }
}

function autoFitMap() {
  if (mapActions.value === undefined || !autoFitting.value) { return; }
  const coordinates = availableLocations.value.map((location) => location.coordinates);
  if (meetingPointCoordinates.value !== undefined) {
    coordinates.push(meetingPointCoordinates.value);
  }
  if (props.ownLocation !== null) {
    coordinates.push(ownCoordinates.value);
  }

  switch (coordinates.length) {
  case 0:
    fitToUserCountry();
    break;
  case 1:
    mapActions.value.flyTo({ center: coordinates[0], zoom: 13 });
    break;
  default:
    mapActions.value.fitBounds(coordinates, { padding: padding.value });
  }
}

function fitToUserCountry() {
  const region = new Intl.Locale(navigator.language);

  if (navigator.language && region.region) {
    const region3 = iso3316[region.region];
    const boundingBox = countriesBoundingBoxes[region3];
    if (boundingBox) {
      mapActions.value.fitBounds([boundingBox.sw, boundingBox.ne], { padding: padding.value });
      return;
    }
  }

  // Default fallback to Europe
  mapActions.value.flyTo({ center: [10.538372247, 51.106318072], zoom: 4 });
}

// sind die nächsten zwei Zeilen noch relevant?
// We need to set mapbox-gl library here in order to use it in template
// const mapbox = Mapbox;
</script>

<template>
  <div id="map-container">
    <MapboxMap
      style="height: 100%; width: 100%;"
      :accessToken="accessToken"
      :mapStyle="mapStyle"
      @mb-created="createdHandler"
    >
      <MapboxNavigationControl position="top-right" />
      <MapMarkers :availableLocations="availableLocations" :mapActions="mapActions" @show-info="showInfo"/>
      <MapboxMarker v-if="meetingPointCoordinates !== undefined" :lngLat="meetingPointCoordinates">
        <svg display="block" height="41px" width="27px" viewBox="0 0 27 41" @click="emit('show-meeting-point')">
          <defs>
            <radialGradient id="shadowGradient">
              <stop offset="10%" stop-opacity="0.4"></stop>
              <stop offset="100%" stop-opacity="0.05"></stop>
            </radialGradient>
          </defs>
          <ellipse cx="13.5" cy="34.8" rx="10.5" ry="5.25" fill="url(#shadowGradient)"></ellipse>
          <path fill="#3FB1CE" d="M27,13.5C27,19.07 20.25,27 14.75,34.5C14.02,35.5 12.98,35.5 12.25,34.5C6.75,27 0,19.22 0,13.5C0,6.04 6.04,0 13.5,0C20.96,0 27,6.04 27,13.5Z"></path>
          <path opacity="0.25" d="M13.5,0C6.04,0 0,6.04 0,13.5C0,19.22 6.75,27 12.25,34.5C13,35.52 14.02,35.5 14.75,34.5C20.25,27 27,19.07 27,13.5C27,6.04 20.96,0 13.5,0ZM13.5,1C20.42,1 26,6.58 26,13.5C26,15.9 24.5,19.18 22.22,22.74C19.95,26.3 16.71,30.14 13.94,33.91C13.74,34.18 13.61,34.32 13.5,34.44C13.39,34.32 13.26,34.18 13.06,33.91C10.28,30.13 7.41,26.31 5.02,22.77C2.62,19.23 1,15.95 1,13.5C1,6.58 6.58,1 13.5,1Z"></path>
          <circle fill="white" cx="13.5" cy="13.5" r="5.5"></circle>
        </svg>
      </MapboxMarker>
      <MapboxMarker v-if="props.ownLocation != null" :lngLat="ownCoordinates" popup>
        <span class="avatar" style="background-color: #2980b9;height:15px;width:15px;"></span>
        <template v-slot:popup>
          <span>{{ t("map.myLocation") }}</span>
        </template>
      </MapboxMarker>
    </MapboxMap>
  </div>
</template>

<style>
#map-container {
  display: flex;  
  position: relative;
  flex: 1 1 auto;
}
.mapboxgl-canvas-container {
  position: absolute;
}
.mgl-map-wrapper {
  position: initial !important;
}
#no-meetup-info {
  position: absolute;
  width: 100%;
  top: 1rem;
  text-align: center;
  z-index: 1;
}
#no-meetup-info > small {
  padding: 8px;
  color:#aaa;
  border: 0;
  background-color: rgba(255,255,255,0.9);
  box-shadow: 1px 1px 4px 0 rgba(152, 155, 147, 0.50);
  border-radius: 5px;
}
.mapboxgl-ctrl button.mapboxgl-ctrl-auto-fit.active {
  background-color: #0675bb;
  border-radius: 4px;
}
.mapboxgl-ctrl button.mapboxgl-ctrl-auto-fit.active:hover {
  background-color: rgba(6, 117, 187, 0.8);
}
.mapboxgl-ctrl button.mapboxgl-ctrl-auto-fit .mapboxgl-ctrl-icon {
  background-size: calc(100% - 10px);
  background-image: url("data:image/svg+xml,%3Csvg width='52.72265625px' height='52.615234375px' direction='ltr' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3Cg fill-rule='nonzero' transform='scale(1,-1) translate(0,-52.615234375)'%3E%3Cpath fill='%23000000' stroke='%23000000' fill-opacity='1.0' stroke-width='1.0' d=' M 8.1640625,28.681640625 C 9.7109375,28.681640625 10.849609375,29.77734375 10.849609375,31.32421875 L 10.849609375,32.65625 L 10.376953125,38.671875 L 14.802734375,34.009765625 L 20.603515625,28.166015625 C 21.09765625,27.650390625 21.78515625,27.392578125 22.494140625,27.392578125 C 24.1484375,27.392578125 25.30859375,28.53125 25.30859375,30.185546875 C 25.30859375,30.916015625 25.0078125,31.560546875 24.4921875,32.076171875 L 18.669921875,37.8984375 L 13.986328125,42.302734375 L 20.087890625,41.8515625 L 21.65625,41.8515625 C 23.181640625,41.8515625 24.298828125,42.96875 24.298828125,44.515625 C 24.298828125,46.0625 23.181640625,47.201171875 21.65625,47.201171875 L 9.732421875,47.201171875 C 7.046875,47.201171875 5.478515625,45.654296875 5.478515625,42.947265625 L 5.478515625,31.32421875 C 5.478515625,29.798828125 6.638671875,28.681640625 8.1640625,28.681640625 Z M 31.044921875,5.435546875 L 42.96875,5.435546875 C 45.654296875,5.435546875 47.22265625,6.982421875 47.22265625,9.689453125 L 47.22265625,21.3125 C 47.22265625,22.837890625 46.0625,23.955078125 44.537109375,23.955078125 C 42.990234375,23.955078125 41.8515625,22.859375 41.8515625,21.3125 L 41.8515625,19.98046875 L 42.32421875,13.96484375 L 37.8984375,18.626953125 L 32.09765625,24.470703125 C 31.58203125,24.986328125 30.916015625,25.244140625 30.20703125,25.244140625 C 28.552734375,25.244140625 27.392578125,24.10546875 27.392578125,22.451171875 C 27.392578125,21.720703125 27.693359375,21.076171875 28.208984375,20.560546875 L 34.03125,14.73828125 L 38.693359375,10.333984375 L 32.61328125,10.78515625 L 31.044921875,10.78515625 C 29.51953125,10.78515625 28.40234375,9.66796875 28.40234375,8.12109375 C 28.40234375,6.57421875 29.51953125,5.435546875 31.044921875,5.435546875 Z%0A' /%3E%3C/g%3E%3C/svg%3E");
}
.mapboxgl-ctrl button.mapboxgl-ctrl-auto-fit.active .mapboxgl-ctrl-icon {
  background-image: url("data:image/svg+xml,%3Csvg width='52.72265625px' height='52.615234375px' direction='ltr' xmlns='http://www.w3.org/2000/svg' version='1.1'%3E%3Cg fill-rule='nonzero' transform='scale(1,-1) translate(0,-52.615234375)'%3E%3Cpath fill='%23FFF' stroke='%23FFF' fill-opacity='1.0' stroke-width='1.0' d=' M 8.1640625,28.681640625 C 9.7109375,28.681640625 10.849609375,29.77734375 10.849609375,31.32421875 L 10.849609375,32.65625 L 10.376953125,38.671875 L 14.802734375,34.009765625 L 20.603515625,28.166015625 C 21.09765625,27.650390625 21.78515625,27.392578125 22.494140625,27.392578125 C 24.1484375,27.392578125 25.30859375,28.53125 25.30859375,30.185546875 C 25.30859375,30.916015625 25.0078125,31.560546875 24.4921875,32.076171875 L 18.669921875,37.8984375 L 13.986328125,42.302734375 L 20.087890625,41.8515625 L 21.65625,41.8515625 C 23.181640625,41.8515625 24.298828125,42.96875 24.298828125,44.515625 C 24.298828125,46.0625 23.181640625,47.201171875 21.65625,47.201171875 L 9.732421875,47.201171875 C 7.046875,47.201171875 5.478515625,45.654296875 5.478515625,42.947265625 L 5.478515625,31.32421875 C 5.478515625,29.798828125 6.638671875,28.681640625 8.1640625,28.681640625 Z M 31.044921875,5.435546875 L 42.96875,5.435546875 C 45.654296875,5.435546875 47.22265625,6.982421875 47.22265625,9.689453125 L 47.22265625,21.3125 C 47.22265625,22.837890625 46.0625,23.955078125 44.537109375,23.955078125 C 42.990234375,23.955078125 41.8515625,22.859375 41.8515625,21.3125 L 41.8515625,19.98046875 L 42.32421875,13.96484375 L 37.8984375,18.626953125 L 32.09765625,24.470703125 C 31.58203125,24.986328125 30.916015625,25.244140625 30.20703125,25.244140625 C 28.552734375,25.244140625 27.392578125,24.10546875 27.392578125,22.451171875 C 27.392578125,21.720703125 27.693359375,21.076171875 28.208984375,20.560546875 L 34.03125,14.73828125 L 38.693359375,10.333984375 L 32.61328125,10.78515625 L 31.044921875,10.78515625 C 29.51953125,10.78515625 28.40234375,9.66796875 28.40234375,8.12109375 C 28.40234375,6.57421875 29.51953125,5.435546875 31.044921875,5.435546875 Z%0A' /%3E%3C/g%3E%3C/svg%3E");
}
.mapboxgl-ctrl-logo {
  background-size: cover;
}
</style>
