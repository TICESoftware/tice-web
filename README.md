![TICE](public/tice_logo_hstack.png)

# TICE – Locate Friends & Meet Up
![License](https://img.shields.io/github/license/TICESoftware/tice-web) ![Sponsors](https://img.shields.io/github/sponsors/TICESoftware)

The secure app for meeting up, sharing locations and locating friends and family in real-time. TICE allows live location sharing on iOS, Android and the Web. Privacy by Design and modern end-to-end-encryption protect the sensitive location data from others.

## Download

To use the web app, one of you needs to have the [Android](https://play.google.com/store/apps/details?id=app.tice.TICE.production) or [iOS](https://apps.apple.com/us/app/tice-secure-location-sharing/id1494324936) app to create a group with a link. You can either open this link in your mobile app or in the browser to use the web app.

# Open Source Development Goals

TICE is a simple but powerful tool to share you location in real time with friends, family and others. Knowing the location of others can be an efficient way for meeting up, it can help find each other and provides a safe way to know, a close friend or family reaches their destination safely.

## 1. Security and transparency

As location information tells a lot about the person, access to it needs to be safeguarded. TICE therefor tries to find a good balance between a practical tool and a safe place for its users location, messaging and meta data. TICE follows the privacy by design path. This means, that we collect only the minimal amount of information needed, encrypting sensitive data in a way that we don't have access to it and be transparent by disclosing the source code behind TICE.

## 2. Grow further

We put a lot of effort into TICE. By open sourcing it, we want it to grow even further – instead of getting stuck. As the company behind TICE, we will focus on other projects in the future. That is why TICE needs you and your contribution.

## 3. Feature rich & living

TICE should be a living project and improve over time. The distributed apps over the app stores should always be up to date and accompany the operating system development. There are a lot of features missing from TICE and we want to build those together with the open source community.

# Contribute to TICE

This section explains, where and how you can contribute to TICE.

## Build instructions

TICE web app has several dependencies. It is using yarn for the dependency management.

### Install all dependencies
```bash
$ yarn install
```

Now you can open the project directory in your favourite editor and you can start right away. Unfortunately, the (for now private) submodules `Server` and `CnC` are needed for testing, but not to build or run the application.

### Run TICE on your device
In order to run TICE you need access to a TICE server, which is not public yet. 

## Architecture

TICE web represents the web app for TICE and is built using [Vue.js](https://vuejs.org). It interacts with the TICE server (backend) by using a JSON REST API.

The UI is based on [Element](https://element.eleme.io/#/en-US), using [Mapbox](https://mapbox.com) to display a map.

All UI components are defined in the `src/components` folder or in the `src/App.vue` file. Further helper functions are defined in `src/utils`, e.g. the encryption, server requests etc.

This version of the web app was written as a prototype and proof-of-concept, so the quality of the code varies a lot. The architecture is not optimal and some code is quite bad, so a complete rewrite will probably be necessary in the future. Another goal is to transform the app to using TypeScript.

## Bugs

File any bugs you find by filing a GitHub issue with:
- Device and browser information
- Repro steps
- Observed behavior (including screenshot / video when possible)
- Timestamp and email address used to send the logs (see below)
- Expected behavior

and **send the logs** via email in the web app by clicking on the logo at the bottom left and on the button `Give Feedback`.

# License

## Core Collaborators

- [Andreas Ganske](https://github.com/ChaosCoder)
- [Fabio Tacke](https://github.com/FabioTacke)
- [Simon Kempendorf](https://github.com/code28)

## Copyright

Copyright © 2019 [TICE Software UG (haftungsbeschränkt)](https://tice.software). All rights reserved.

The source code is licensed under [GNU General Public License v3.0](LICENSE). TICE is a [registered trademark](https://euipo.europa.eu/eSearch/#details/trademarks/018132140) of the TICE Software UG (haftungsbeschränkt).
