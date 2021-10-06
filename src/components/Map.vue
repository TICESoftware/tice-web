<template>
    <div id="map-container">
        <MglMap :accessToken="accessToken" :mapStyle.sync="mapStyle" @load="onLoadMap">
            <MglNavigationControl position="top-right" />
            <MapMarkers :availableLocations="availableLocations" @show-info="showInfo"/>
            <MglMarker v-if="meetingPointCoordinates !== undefined" :coordinates="meetingPointCoordinates" @click="$emit('show-meeting-point')"/>
            <MglMarker v-if="ownLocation != null" :coordinates="ownCoordinates">
                <template slot="marker"><span class="avatar" style="background-color: #2980b9;height:15px;width:15px;"></span></template>
                <MglPopup>
                    {{ $t("map.myLocation") }}
                </MglPopup>
            </MglMarker>
        </MglMap>
    </div>
</template>

<script>
import Mapbox from 'mapbox-gl';
import {
    MglMap, MglMarker, MglNavigationControl, MglPopup,
} from 'vue-mapbox';
import MapMarkers from './MapMarkers.vue';
import iso3316 from '../utils/iso3316.json';
import countriesBoundingBoxes from '../utils/countriesBoundingBoxes.json';

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

export default {
    components: {
        MglMap, MglMarker, MglNavigationControl, MglPopup, MapMarkers,
    },
    props: ['locations', 'initialLoading', 'ownLocation', 'group'],
    watch: {
        locations() {
            this.autoFitMap();
        },
    },
    computed: {
        availableLocations() {
            return Object.values(this.locations).filter((location) => location.coordinates !== undefined);
        },
        ownCoordinates() {
            return [this.ownLocation.longitude, this.ownLocation.latitude];
        },
        padding() {
            const padHorizontal = Math.min(window.innerWidth / 8, 100);
            const padVertical = Math.min(window.innerHeight / 8, 100);
            return {
                top: padVertical, bottom: padVertical, left: padHorizontal, right: padHorizontal,
            };
        },
        meetingPointCoordinates() {
            if (this.group.internalSettings.meetingPoint !== undefined) {
                return [this.group.internalSettings.meetingPoint.longitude, this.group.internalSettings.meetingPoint.latitude];
            }
            return undefined;
        },
    },
    data() {
        return {
            accessToken: process.env.VUE_APP_MAPBOX_API_KEY,
            mapStyle: 'mapbox://styles/mapbox/streets-v8',
            mapActions: undefined,
            autoFitting: true,
        };
    },
    created() {
        // We need to set mapbox-gl library here in order to use it in template
        this.mapbox = Mapbox;
    },
    methods: {
        showInfo(senderId) {
            this.$emit('show-info', this.locations[senderId]);
        },
        onLoadMap(options) {
            this.mapActions = options.component.actions;

            const autoFitToggle = new AutoFitToggleControl();
            autoFitToggle.button.onclick = this.setAutoFitting;
            options.map.addControl(autoFitToggle);

            const onInteraction = (e) => {
                if (e.originalEvent !== undefined) {
                    this.setAutoFitting(false);
                }
            };
            options.map.on('mousedown', onInteraction);
            options.map.on('dragstart', onInteraction);
            options.map.on('movestart', onInteraction);
            options.map.on('touchstart', onInteraction);
            options.map.on('zoomstart', onInteraction);

            this.setAutoFitting(true);
        },
        setAutoFitting(newValue = null) {
            if (typeof newValue === 'boolean') {
                this.autoFitting = newValue;
            } else {
                this.autoFitting = !this.autoFitting;
            }
            if (this.autoFitting) {
                document.getElementById('autoFitToggleButton').classList.add('active');
                this.autoFitMap();
            } else {
                document.getElementById('autoFitToggleButton').classList.remove('active');
            }
        },
        autoFitMap() {
            if (this.mapActions === undefined || !this.autoFitting) { return; }
            const coordinates = this.availableLocations.map((location) => location.coordinates);
            if (this.meetingPointCoordinates !== undefined) {
                coordinates.push(this.meetingPointCoordinates);
            }
            if (this.ownLocation !== null) {
                coordinates.push(this.ownCoordinates);
            }

            switch (coordinates.length) {
            case 0:
                this.fitToUserCountry();
                break;
            case 1:
                this.mapActions.flyTo({ center: coordinates[0], zoom: 13 });
                break;
            default:
                this.mapActions.fitBounds(coordinates, { padding: this.padding });
            }
        },
        fitToUserCountry() {
            const region = new Intl.Locale(navigator.language);

            if (navigator.language && region.region) {
                const region3 = iso3316[region.region];
                const boundingBox = countriesBoundingBoxes[region3];
                if (boundingBox) {
                    this.mapActions.fitBounds([boundingBox.sw, boundingBox.ne], { padding: this.padding });
                    return;
                }
            }
            // Default fallback to Europe
            this.mapActions.flyTo({ center: [10.538372247, 51.106318072], zoom: 4 });
        },
    },
};
</script>

<style>
#map-container {
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
</style>
