'use strict';
let geojsonData;
var map = L.map('map').setView([35.65, 139.6], 11);

const prefDefaultStyle = { fillColor: '#ffffff00', opacity: 1, fillOpacity: 1, weight: 0.7, color: 'black' };

let currentMapStyle = 2;
let showPlaceNames = true;

/**
 * 加载pref
 * @param {*} GeoJsonFileName
 */
const loadGeoJson = (GeoJsonFileName, name) => {
	fetch(GeoJsonFileName)
		.then((response) => response.json())
		.then((data) => {
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
			}).addTo(map);

			geojsonData = data;
			// geojsonData
			L.geoJSON(geojsonData, {
				attribution: name,
				style: function (feature) {
					return prefDefaultStyle;
				},
				onEachFeature: function (feature, layer) {
					if (showPlaceNames) {
						// placename
						const clickedObject = feature;
						const pref_name = clickedObject.properties.name + '駅';
						//console.log(layer.feature.geometry.coordinates, pref_name);
						const coordinates = [layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]];
						const label = L.marker(coordinates, {
							icon: L.divIcon({
								className: 'shichousonlabel',
								html: `<div><div style="width: 10px; height: 10px; background-color: ${(() => {
									const operators = layer.feature.properties.operator;
									if (operators.includes('東日本旅客鉄道')) {
										return 'green';
									} else if (operators.includes('東京地下鉄')) {
										return 'mediumblue';
									} else if (operators.includes('東京都交通局')) {
										return 'lightgreen';
									} else if (operators.includes('京王電鉄')) {
										return 'mediumvioletred';
									} else if (operators.includes('多摩都市モノレール')) {
										return 'coral';
									} else if (operators.includes('小田急電鉄')) {
										return 'steelblue';
									} else if (operators.includes('西武鉄道')) {
										return 'dodgerblue';
									} else if (operators.includes('東武鉄道')) {
										return 'midnightblue';
									} else if (operators.includes('東急電鉄')) {
										return 'orangered';
									} else if (operators.includes('京成電鉄')) {
										return 'black';
									} else if (operators.includes('京浜急行電鉄')) {
										return 'darkturquoise';
									} else {
										return 'dimgray';
									}
								})()}; border-radius: 50%;"></div><p class='labelp'>${pref_name}</p></div>`,
								iconSize: [10, 10],
							}),
							interactive: true,
						}).bindPopup(
							function (layer_) {
								console.log(layer);
								const clickedObject = layer.feature;
								const name = clickedObject.properties.name;
								const namehira = clickedObject.properties.name_hira;
								const operator = clickedObject.properties.operator;
								console.log(clickedObject);

								return `<div class='popup'>
							<p class='popuptitle' style='margin: 0;'>${name}</p>
							<p class='popuptitle' style='margin: 0; font-size: 12px'>${namehira}</p>
		
							<div class='popupbuttoncontainer'>
								${operator.map((op) => {
									return `<p>${op}</p>`;
								})}
							</div>
						</div>`;
							},
							{
								minWidth: 'fit-content',
							}
						);

						label.addTo(map);

						// if (map.getZoom() >= 8) {
						// 	label.getElement().style.display = 'none';
						// }

						// if (!showPlaceNames) {
						// 	label.getElement().style.display = 'none';
						// }

						// map.on('zoomend', function () {
						// 	if (showPlaceNames) {
						// 		if (map.getZoom() < 8) {
						// 			if (!showPlaceNames) {
						// 				label.getElement().style.display = 'none';
						// 			} else {
						// 				if (label.getElement()) {
						// 					label.getElement().style.display = 'block';
						// 				}
						// 			}
						// 		} else {
						// 			if (label.getElement()) {
						// 				label.getElement().style.display = 'none';
						// 			}
						// 		}
						// 	}
						// });

						// map.on('moveend', function (e) {
						// 	console.log( e.target._lastCenter, e.target._zoom);
						// });
					}
				},
				interactive: true,
			});
		})
		.catch((error) => console.error('Error loading GeoJSON:', error));
};

const refresh = () => {
	map.eachLayer(function (layer) {
		map.removeLayer(layer);
	});

	loadGeoJson('./geojson/tokyo_stations_cleaned.geojson', 'pref');
};

const delLayer = (name) => {
	if (typeof name === 'string') {
		map.eachLayer(function (layer) {
			if (layer.getAttribution() === name) {
				map.removeLayer(layer);
			}
		});
	} else {
		map.eachLayer(function (layer) {
			if (name.includes(layer.getAttribution())) {
				map.removeLayer(layer);
			}
		});
	}
};

/**
 * 刷新一个pref的json
 * @param {*} refreshTarget
 */
const refreshSinglePref = (refreshTarget = '') => {
	loadGeoJson('./geojson/tokyo_stations_cleaned.geojson', 'pref');
};

const init = () => {
	refresh();
};

let previousLabel;

const onRandomStationButtonClick = () => {
	if (previousLabel) {
		map.removeLayer(previousLabel);
	}
	fetch('./geojson/tokyo_stations_cleaned.geojson')
		.then((response) => response.json())
		.then((data) => {
			const features = data.features;
			const data_length = features.length - 1;

			const max = 100;
			let i = 0;
			const max_timeout = 500;
			const min_timeout = 5;

			let previousLabel;

			const a = () => {
				const timeout = min_timeout + (max_timeout - min_timeout) * Math.pow(i / max, min_timeout ** 2);

				setTimeout(() => {
					const rand_index = Math.round(Math.random() * data_length);
					const rand_res = features[rand_index];
					document.querySelector('.stationname').innerHTML = rand_res.properties.operator[0] + '  ' + rand_res.properties.name + '駅';
					console.log(i, timeout, rand_res.properties.name);
					const coordinates = [rand_res.geometry.coordinates[1], rand_res.geometry.coordinates[0]];
					const label = L.marker(coordinates, {
						icon: L.divIcon({
							className: 'shichousonlabel',
							html: '<div style="width: 15px; height: 15px; background-color: red; border-radius: 50%;"></div>',
							iconSize: [15, 15],
						}),
						interactive: true,
					});
					i++;
					label.addTo(map);
					if (i < max) {
						a();
					}
					if (previousLabel) {
						map.removeLayer(previousLabel);
					}

					previousLabel = label;
				}, timeout);
			};

			a();
		});
};

// init
init();
