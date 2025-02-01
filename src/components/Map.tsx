"use client";

import React, { useState, useEffect } from "react";
import { Map } from "react-map-gl/maplibre";
import { AmbientLight, PointLight, LightingEffect } from "@deck.gl/core";
import { HexagonLayer } from "@deck.gl/aggregation-layers";
import DeckGL from "@deck.gl/react";
import { CSVLoader } from "@loaders.gl/csv";
import { load } from "@loaders.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";

import type { Color, PickingInfo, MapViewState } from "@deck.gl/core";

const DATA_URL =
  "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv";

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000],
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000],
});

const lightingEffect = new LightingEffect({
  ambientLight,
  pointLight1,
  pointLight2,
});

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -0.1276,
  latitude: 51.5074,
  zoom: 10,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
  bearing: -27,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

export const colorRange: Color[] = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78],
];

function getTooltip({ object }: PickingInfo) {
  if (!object) {
    return null;
  }
  const lat = object.position[1];
  const lng = object.position[0];
  const count = object.count;

  return `
        Latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ""}
        Longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ""}
        ${count} Accidents
    `;
}

type DataPoint = [longitude: number, latitude: number];

const boroughs = {
  Borough1: { north: 51.55, south: 51.45, west: -0.15, east: -0.05 },
  Borough2: { north: 51.45, south: 51.35, west: -0.15, east: -0.05 },
};

interface MapComponentProps {
  initialData?: DataPoint[] | null;
  mapStyle?: string;
  radius?: number;
  upperPercentile?: number;
  coverage?: number;
}

export default function MapComponent({
  initialData = null,
  mapStyle = MAP_STYLE,
  radius = 100,
  upperPercentile = 100,
  coverage = 1,
}: MapComponentProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [elevationScale, setElevationScale] = useState(1);
  const [barRadius, setBarRadius] = useState(radius);
  const [data, setData] = useState<DataPoint[] | null>(initialData);

  useEffect(() => {
    async function fetchData() {
      if (!data) {
        try {
          const response = await load(DATA_URL, CSVLoader);
          const rawData = response.data;
          const londonBounds = {
            north: 51.686,
            south: 51.286,
            west: -0.51,
            east: 0.334,
          };

          const points: DataPoint[] = rawData
            .map((d: any) =>
              Number.isFinite(d.lng) && Number.isFinite(d.lat)
                ? [d.lng, d.lat]
                : null
            )
            .filter(
              (d): d is DataPoint =>
                d !== null &&
                d[0] >= londonBounds.west &&
                d[0] <= londonBounds.east &&
                d[1] >= londonBounds.south &&
                d[1] <= londonBounds.north
            );
          setData(points);
        } catch (error) {
          console.error("Error loading data:", error);
        }
      }
    }
    fetchData();
  }, [data]);

  const filteredData = selectedBorough
    ? data?.filter((d) => {
        const borough = boroughs[selectedBorough as keyof typeof boroughs];
        return (
          d[0] >= borough.west &&
          d[0] <= borough.east &&
          d[1] >= borough.south &&
          d[1] <= borough.north
        );
      })
    : data;

  const layers = [
    new HexagonLayer<DataPoint>({
      id: "heatmap",
      gpuAggregation: true,
      colorRange,
      coverage,
      data: filteredData,
      elevationRange: [0, 3000],
      elevationScale: filteredData && filteredData.length ? elevationScale : 0,
      extruded: true,
      getPosition: (d) => d,
      pickable: true,
      radius: barRadius,
      upperPercentile,
      material: {
        ambient: 0.64,
        diffuse: 0.6,
        shininess: 32,
        specularColor: [51, 51, 51],
      },
      transitions: {
        elevationScale: 3000,
      },
    }),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setViewState((prevState) => ({
      ...prevState,
      [name]: parseFloat(value),
    }));
  };

  const handleBoroughChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBorough(e.target.value);
  };

  const handleElevationScaleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setElevationScale(parseFloat(e.target.value));
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarRadius(parseFloat(e.target.value));
  };

  return (
    <div className="relative w-full h-screen">
      <DeckGL
        layers={layers}
        effects={[lightingEffect]}
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState }) =>
          setViewState((prevState) => ({ ...prevState, ...newViewState }))
        }
        controller={{ dragRotate: true }}
        getTooltip={getTooltip}
      >
        <Map reuseMaps mapStyle={mapStyle} mapLib={import("maplibre-gl")} />
      </DeckGL>
      <div className="absolute top-4 left-4 bg-white p-4 rounded shadow-lg">
        <label className="block mb-2">
          Longitude:
          <input
            type="number"
            name="longitude"
            value={viewState.longitude}
            onChange={handleChange}
            className="w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Latitude:
          <input
            type="number"
            name="latitude"
            value={viewState.latitude}
            onChange={handleChange}
            className="w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Zoom:
          <input
            type="number"
            name="zoom"
            value={viewState.zoom}
            onChange={handleChange}
            className="w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Pitch:
          <input
            type="number"
            name="pitch"
            value={viewState.pitch}
            onChange={handleChange}
            className="w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Bearing:
          <input
            type="number"
            name="bearing"
            value={viewState.bearing}
            onChange={handleChange}
            className="w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Borough:
          <select onChange={handleBoroughChange} className="w-full mt-1">
            <option value="">All</option>
            {Object.keys(boroughs).map((borough) => (
              <option key={borough} value={borough}>
                {borough}
              </option>
            ))}
          </select>
        </label>
        <label className="block mb-2">
          Elevation Scale:
          <input
            type="range"
            min="1"
            max="100"
            value={elevationScale}
            onChange={handleElevationScaleChange}
            className="w-full mt-1"
          />
        </label>
        <label className="block mb-2">
          Radius:
          <input
            type="range"
            min="100"
            max="5000"
            value={barRadius}
            onChange={handleRadiusChange}
            className="w-full mt-1"
          />
        </label>
      </div>
    </div>
  );
}
