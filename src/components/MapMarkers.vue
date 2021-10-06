<template>
    <span>
        <MglGeojsonLayer
            sourceId="markerData"
            :source="{
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: sourceData,
                },
                cluster: true,
                clusterRadius: 50,
                clusterMaxZoom: 14,
            }"
            layer-id="colorLayer"
            :layer="{
                id: 'colorLayer',
                type: 'circle',
                source: 'markerData',
                paint: {
                    'circle-color': individualColor,
                    'circle-radius': 15,
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 3,
                },
            }"
            @click="individualLocation"
            @mouseenter="setCursorToPointer"
            @mouseleave="resetCursor"
        />
        <MglGeojsonLayer
            sourceId="markerData"
            layer-id="nameLayer"
            :layer="{
                id: 'nameLayer',
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
        <MglGeojsonLayer
            sourceId="markerData"
            layerId="cluster-count"
            :layer="{
                   id: 'cluster-count',
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
        <MglGeojsonLayer
            sourceId="accuracySource"
            :source="{
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: source,
                },
            }"
            layerId="accuracyLayer"
            :layer="{
                id: 'accuracyLayer',
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

<script>
import {
    MglGeojsonLayer,
} from 'vue-mapbox';

export default {
    components: {
        MglGeojsonLayer,
    },
    props: ['availableLocations'],
    computed: {
        source() {
            // Based on https://stackoverflow.com/a/39006388
            return this.availableLocations.map((locationSharingUser) => {
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
        },
        sourceData() {
            return this.availableLocations.map((locationSharingUser) => ({
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
        },
        individualColor() {
            if (this.availableLocations.length === 0) {
                return '#ffffff';
            }
            const colors = ['match', ['get', 'senderId']];
            this.availableLocations.forEach((location) => {
                colors.push(location.senderId);
                colors.push(location.color);
            });
            colors.push('#ffffff');
            return colors;
        },
        individualAccuracyColor() {
            if (this.availableLocations.length === 0) {
                return '#ffffff';
            }
            const colors = ['match', ['get', 'senderId']];
            this.availableLocations.forEach((location) => {
                colors.push(location.senderId);
                colors.push(location.color);
            });
            colors.push('#ffffff');
            return colors;
        },
    },
    methods: {
        individualLocation(event) {
            this.$emit('show-info', event.mapboxEvent.features[0].properties.senderId);
        },
        setCursorToPointer(event) {
            event.map.getCanvas().style.cursor = 'pointer';
        },
        resetCursor(event) {
            event.map.getCanvas().style.cursor = 'default';
        },
    },
};
</script>

<style>
</style>
