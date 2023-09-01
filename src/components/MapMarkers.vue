<script setup lang="ts">
import { computed } from 'vue'
import { MapboxSource, MapboxLayer } from "@studiometa/vue-mapbox-gl"

const props = defineProps(['availableLocations', 'mapActions'])
const emit = defineEmits(['show-info'])

const source = computed(() => {
  // Based on https://stackoverflow.com/a/39006388
  return props.availableLocations.map((locationSharingUser) => {
    const latitude = locationSharingUser.coordinates[1];
    const longitude = locationSharingUser.coordinates[0];
    const hAccuracyM = locationSharingUser.hAccuracy;
    const accCoords = [];
    const distanceX = hAccuracyM / (111320 * Math.cos(latitude * (Math.PI / 180)));
    const distanceY = hAccuracyM / 110574;
    let theta;
    let x;
    let y;
    const numPoints = 64;
    for (let i = 0; i < numPoints; i += 1) {
      theta = (i / numPoints) * (2 * Math.PI);
      x = distanceX * Math.cos(theta);
      y = distanceY * Math.sin(theta);
      accCoords.push([longitude + x, latitude + y]);
    }
    accCoords.push(accCoords[0]);
    return { type: 'Feature', properties: { senderId: locationSharingUser.senderId }, geometry: { type: 'Polygon', coordinates: [accCoords] } };
  });
})
const sourceData = computed(() => {
  return props.availableLocations.map((locationSharingUser) => ({
    type: 'Feature',
    properties: {
      senderId: locationSharingUser.senderId,
      nameInitials: locationSharingUser.initials,
    },
    geometry: {
      type: 'Point',
      coordinates: [locationSharingUser.coordinates[0], locationSharingUser.coordinates[1]],
    },
  }));
})
const individualColor = computed(() => {
  if (props.availableLocations.length === 0) {
    return '#ffffff';
  }
  const colors = ['match', ['get', 'senderId']];
  props.availableLocations.forEach((location) => {
    colors.push(location.senderId);
    colors.push(location.color);
  });
  colors.push('#ffffff');
  return colors;
})
const individualAccuracyColor = computed(() => {
  if (props.availableLocations.length === 0) {
    return '#ffffff';
  }
  const colors = ['match', ['get', 'senderId']];
  props.availableLocations.forEach((location) => {
    colors.push(location.senderId);
    colors.push(location.color);
  });
  colors.push('#ffffff');
  return colors;
})

function individualLocation(event) {
  emit('show-info', event.features[0].properties.senderId);
}
function setCursorToPointer() {
  props.mapActions.getCanvas().style.cursor = 'pointer';
}
function resetCursor() {
  props.mapActions.getCanvas().style.cursor = 'default';
}

// console.log(sourceData.value)
</script>

<template>
  <span>
    <MapboxSource
      id="markerData"
      :options="{
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: sourceData,
        },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      }"
    />
    <MapboxLayer
      id="colorLayer"
      :options="{
        type: 'circle',
        source: 'markerData',
        paint: {
          'circle-color': individualColor,
          'circle-radius': 15,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
        },
      }"
      @mb-click="individualLocation"
      @mb-mouseenter="setCursorToPointer"
      @mb-mouseleave="resetCursor"
    />
    <MapboxLayer
      id="nameLayer"
      :options="{
        type: 'symbol',
        source: 'markerData',
        layout: {
          'text-field': '{nameInitials}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
        },
        paint: {
          'text-color': '#ffffff',
        },
      }"
    />
    <MapboxLayer
      id="cluster-count"
      :options="{
        type: 'symbol',
        source: 'markerData',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14
        }
      }"
    />
    <MapboxSource
      id="accuracySource"
      :options="{
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: source,
        }
      }"
    />
    <MapboxLayer
      id="accuracyLayer"
      :options="{
        type: 'fill',
        source: 'accuracySource',
        paint: {
          'fill-color': individualAccuracyColor,
          'fill-opacity': 0.15,
        },
        minzoom: 18,
        maxzoom: 21,
      }"
    />
  </span>
</template>

<style>
</style>
