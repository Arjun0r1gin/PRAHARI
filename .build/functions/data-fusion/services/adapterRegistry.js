/**
 * @fileoverview Adapter Registry — maps station IDs to their adapter classes.
 *
 * When a new district or station is added, import its adapter here and add it
 * to REGISTRY.  The fusion controller iterates REGISTRY to run all adapters.
 */

'use strict';

const path = require('path');

const WhitefieldAdapter    = require('../adapters/whitefield-adapter');
const HalAdapter           = require('../adapters/hal-adapter');
const BellandurAdapter     = require('../adapters/bellandur-adapter');
const IndiranagarAdapter   = require('../adapters/indiranagar-adapter');
const MysuruAdapter        = require('../adapters/mysuru-adapter');
const MangaluruAdapter     = require('../adapters/mangaluru-adapter');
const BelagaviAdapter      = require('../adapters/belagavi-adapter');
const KalaburagAdapter     = require('../adapters/kalaburagi-adapter');

/**
 * Base path to the data/ directory relative to this file's location.
 * functions/data-fusion/services/adapterRegistry.js -> 3 levels up to PRAHARI root.
 */
const REPO_ROOT = path.resolve(__dirname, '../../..');
const DATA_ROOT = path.resolve(REPO_ROOT, 'data/districts');

/**
 * Registry entry shape:
 * @typedef {{ AdapterClass: Function, stationId: string, districtId: string, stationPath: string }} RegistryEntry
 */

/** @type {RegistryEntry[]} */
const REGISTRY = [
  // --- Bangalore Urban ---
  {
    AdapterClass: WhitefieldAdapter,
    stationId: 'whitefield',
    districtId: 'bangalore-urban',
    stationPath: path.join(DATA_ROOT, 'bangalore-urban', 'stations', 'whitefield'),
  },
  {
    AdapterClass: HalAdapter,
    stationId: 'hal',
    districtId: 'bangalore-urban',
    stationPath: path.join(DATA_ROOT, 'bangalore-urban', 'stations', 'hal'),
  },
  {
    AdapterClass: BellandurAdapter,
    stationId: 'bellandur',
    districtId: 'bangalore-urban',
    stationPath: path.join(DATA_ROOT, 'bangalore-urban', 'stations', 'bellandur'),
  },
  {
    AdapterClass: IndiranagarAdapter,
    stationId: 'indiranagar',
    districtId: 'bangalore-urban',
    stationPath: path.join(DATA_ROOT, 'bangalore-urban', 'stations', 'indiranagar'),
  },

  // --- Mysuru ---
  {
    AdapterClass: MysuruAdapter,
    stationId: 'devaraja',
    districtId: 'mysuru',
    stationPath: path.join(DATA_ROOT, 'mysuru', 'stations', 'devaraja'),
  },
  {
    AdapterClass: MysuruAdapter,
    stationId: 'krishnaraja',
    districtId: 'mysuru',
    stationPath: path.join(DATA_ROOT, 'mysuru', 'stations', 'krishnaraja'),
  },
  {
    AdapterClass: MysuruAdapter,
    stationId: 'narasimharaja',
    districtId: 'mysuru',
    stationPath: path.join(DATA_ROOT, 'mysuru', 'stations', 'narasimharaja'),
  },
  {
    AdapterClass: MysuruAdapter,
    stationId: 'mysuru-south',
    districtId: 'mysuru',
    stationPath: path.join(DATA_ROOT, 'mysuru', 'stations', 'mysuru-south'),
  },

  // --- Mangaluru ---
  {
    AdapterClass: MangaluruAdapter,
    stationId: 'mangalore-north',
    districtId: 'mangaluru',
    stationPath: path.join(DATA_ROOT, 'mangaluru', 'stations', 'mangalore-north'),
  },
  {
    AdapterClass: MangaluruAdapter,
    stationId: 'mangalore-south',
    districtId: 'mangaluru',
    stationPath: path.join(DATA_ROOT, 'mangaluru', 'stations', 'mangalore-south'),
  },
  {
    AdapterClass: MangaluruAdapter,
    stationId: 'mangalore-east',
    districtId: 'mangaluru',
    stationPath: path.join(DATA_ROOT, 'mangaluru', 'stations', 'mangalore-east'),
  },
  {
    AdapterClass: MangaluruAdapter,
    stationId: 'panambur',
    districtId: 'mangaluru',
    stationPath: path.join(DATA_ROOT, 'mangaluru', 'stations', 'panambur'),
  },

  // --- Belagavi ---
  {
    AdapterClass: BelagaviAdapter,
    stationId: 'belagavi-rural',
    districtId: 'belagavi',
    stationPath: path.join(DATA_ROOT, 'belagavi', 'stations', 'belagavi-rural'),
  },
  {
    AdapterClass: BelagaviAdapter,
    stationId: 'camp',
    districtId: 'belagavi',
    stationPath: path.join(DATA_ROOT, 'belagavi', 'stations', 'camp'),
  },
  {
    AdapterClass: BelagaviAdapter,
    stationId: 'apmc',
    districtId: 'belagavi',
    stationPath: path.join(DATA_ROOT, 'belagavi', 'stations', 'apmc'),
  },
  {
    AdapterClass: BelagaviAdapter,
    stationId: 'kakati',
    districtId: 'belagavi',
    stationPath: path.join(DATA_ROOT, 'belagavi', 'stations', 'kakati'),
  },

  // --- Kalaburagi ---
  {
    AdapterClass: KalaburagAdapter,
    stationId: 'ashok-nagar',
    districtId: 'kalaburagi',
    stationPath: path.join(DATA_ROOT, 'kalaburagi', 'stations', 'ashok-nagar'),
  },
  {
    AdapterClass: KalaburagAdapter,
    stationId: 'brahmapur',
    districtId: 'kalaburagi',
    stationPath: path.join(DATA_ROOT, 'kalaburagi', 'stations', 'brahmapur'),
  },
  {
    AdapterClass: KalaburagAdapter,
    stationId: 'station-bazar',
    districtId: 'kalaburagi',
    stationPath: path.join(DATA_ROOT, 'kalaburagi', 'stations', 'station-bazar'),
  },
  {
    AdapterClass: KalaburagAdapter,
    stationId: 'roza',
    districtId: 'kalaburagi',
    stationPath: path.join(DATA_ROOT, 'kalaburagi', 'stations', 'roza'),
  },
];

/**
 * Instantiate all registered adapters.
 *
 * @returns {import('../services/baseAdapter').BaseAdapter[]}
 */
function getAllAdapters() {
  return REGISTRY.map(({ AdapterClass, stationId, districtId, stationPath }) =>
    new AdapterClass(stationId, districtId, stationPath)
  );
}

module.exports = { REGISTRY, getAllAdapters };
