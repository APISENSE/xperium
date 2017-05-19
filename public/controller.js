
angular.module('CarbonFootprintCalculator', ['ui.bootstrap.buttons'])

.controller('mainController', function($scope, $http) {
	$scope.formData = {};

	/**
	 * Layers
	 */
	var osm = new L.TileLayer(
		'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			minZoom: 8,
			maxZoom: 20,
			attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		});

	var ocm = new L.TileLayer(
		'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
			minZoom: 8,
			maxZoom: 20,
			attribution: 'Map data &copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a> contributors'
		});

	/**
	 * Set up the map
	 */
	var map = new L.Map('map', {
		center: new L.LatLng(50.6372, 3.0633),
		zoom: 12,
		layers:[ osm ]
	});

	/**
	 * Init cluster variable
	 */
	map._markersClusterGroup = new L.MarkerClusterGroup({
		singleMarkerMode: true,
		maxClusterRadius: 40
	});

	/**
	 * Update user list.
	 *
	 * Note: Definitely not the best solution, but it works
	 */
	$scope.updateUsersList = function() {

		var updateList = function(users) {
			var i = 0;

			users.forEach(function(user) {
				var tmpDate = new Date(user.metadata.timestamp),
					dateMin = new Date($scope.dates.min.yyyymmdd()),
					dateMax = new Date($scope.dates.max.yyyymmdd());


					GLOBALMINDATE = dateMin;
					GLOBALMAXDATE = dateMax;

				tmpDate = tmpDate.getYear() + "/" + tmpDate.getMonth() + "/" + tmpDate.getDay();
				dateMin = dateMin.getYear() + "/" + dateMin.getMonth() + "/" + dateMin.getDay()
				dateMax = dateMax.getYear() + "/" + dateMax.getMonth() + "/" + dateMax.getDay()

				if ((tmpDate >= dateMin) && (tmpDate <= dateMax)) {
					$http.get('/api/' + $scope.dates.min.yyyymmdd() + '/' + $scope.dates.max.yyyymmdd())
					.success(function(data) {
						if(data.length > 0) {
							$scope.users.push(user);
						}
					})
					.error(function(data) {
						console.log('Error: ' + data);
					});
					i++;
				}
			});

		};

		$http.get('/api/users')
			.success( updateList )
			.error(function(data) {
				console.log('Error: ' + data);
			});
	}

	/**
	 * Get all rides and associate informations
	 */
	$scope.getCarbonFootprint = function() {
		var userId = 1, // Math.floor(Math.random() * 100) + 1,
			min  = $scope.dates.min,
			max  = $scope.dates.max;
		
		$http.get('/api/' + min.yyyymmdd() + '/' + max.yyyymmdd())
			.success(function(data) {
				$scope.rides = data;
				// no rides
				if(data.length <= 0) {
					$(".alert").show();
				} else {
					$(".alert").hide();
				}

				/*
				 * - Compute the global footprint
				 * - Compute the global footprint per km
				 * - Aggregate successive rides using the same transportation
				 */
				var totalEmission = 0.;
				var totalDistance = 0.;
				$scope.aggRides = [];
				data.forEach(function (ride, index) {
					totalEmission += ride.emission;
					totalDistance += ride.distance;

					// aggregation
					var prev = $scope.aggRides.length - 1;
					if(prev >= 0 && $scope.aggRides[prev].type === ride.type) {

						$scope.aggRides[prev].distance += ride.distance;
						$scope.aggRides[prev].emission += ride.emission;
						$scope.aggRides[prev].numberOfRides += 1;

					} else {
						// define path color
						var colorClass;
						switch(ride.type) {
						case 'train':
							colorClass = 'bg-table-train'; break;
						case 'car':
							colorClass = 'bg-table-car'; break;
						case 'walking':
							colorClass = 'bg-table-walking'; break;
						default:
							colorClass = '';
						}

						/* add informations in reports array */
						$scope.aggRides.push({
							type: ride.type,
							distance: ride.distance,
							emission: ride.emission,
							numberOfRides: 1,
							colorClass: colorClass
						});
					}
				});
				/* add the information to side bar*/
				$scope.carbonFootprint = totalEmission.toFixed(1) + ' kg eq. CO₂';
				$scope.carbonFootprintPerKm = (totalEmission/totalDistance).toFixed(2) + ' kg eq. CO₂ per km';

				// Rides layers and clusters layers
				clearMap(map);
			   addContent(map, data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
	};

	/**
	 * Show/hide the clusters layer
	 */
	$scope.toggleClusters = function() {
		if ($scope.bClusters) {
			map.addLayer(map._markersClusterGroup);
		} else {
			map.removeLayer(map._markersClusterGroup);
		}
	};
	/**
	 * Show/hide the global visulization clusters 
	 */
	$scope.toggleClustersContent = function() {
		if ($scope.bVisualization) {
			var userId = 1, // Math.floor(Math.random() * 100) + 1,
			min  = $scope.dates.min,
			max  = $scope.dates.max;
			
		$http.get('/api/' + min.yyyymmdd() + '/' + max.yyyymmdd())
			.success(function(data) {
				$scope.rides = data;
				// no rides
				if(data.length <= 0) {
					$(".alert").show();
				} else {
					$(".alert").hide();
				}

				/*
				 * - Compute the global footprint
				 * - Compute the global footprint per km
				 * - Aggregate successive rides using the same transportation
				 */
				var totalEmission = 0.;
				var totalDistance = 0.;
				$scope.aggRides = [];
				data.forEach(function (ride, index) {
					totalEmission += ride.emission;
					totalDistance += ride.distance;

					// aggregation
					var prev = $scope.aggRides.length - 1;
					if(prev >= 0 && $scope.aggRides[prev].type === ride.type) {

						$scope.aggRides[prev].distance += ride.distance;
						$scope.aggRides[prev].emission += ride.emission;
						$scope.aggRides[prev].numberOfRides += 1;

					} else {
						// define path color
						var colorClass;
						switch(ride.type) {
						case 'train':
							colorClass = 'bg-table-train'; break;
						case 'car':
							colorClass = 'bg-table-car'; break;
						case 'walking':
							colorClass = 'bg-table-walking'; break;
						default:
							colorClass = '';
						}

						$scope.aggRides.push({
							type: ride.type,
							distance: ride.distance,
							emission: ride.emission,
							numberOfRides: 1,
							colorClass: colorClass
						});
					}
				});

				$scope.carbonFootprint = totalEmission.toFixed(1) + ' kg eq. CO₂';
				$scope.carbonFootprintPerKm = (totalEmission/totalDistance).toFixed(2) + ' kg eq. CO₂ per km';

				// Rides layers and clusters layers
				clearMap(map);
			   addContentCluster(map, data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			});
		}
		else {
			clearMap(map);
			$scope.getCarbonFootprint();
		}
	};

	/**
	 * Show/hide the OpenCycleMap layer
	 */
	$scope.toggleCycleMap = function() {
		if ($scope.bCycleMap) {
			map.addLayer(ocm);
		} else {
			map.removeLayer(ocm);
		}
	};
})
/* update date slider */
.directive('cfcDateslider', function() {
    return {
        restrict: 'A',
        require : 'ngModel',
        link : function ($scope, element, attrs, ngModelCtrl) {
            $(function(){

                element.dateRangeSlider({
			    	arrows: false,
			    	wheelMode: "zoom",
			    	step: {
						days: 1
					},
					bounds:{
					    min: new Date(2017, 03, 01),
					    max: new Date()
					  },
					defaultValues: {
						min: new Date(2017, 03, 01),
						max: new Date()
					},
					range: {
			    		min: {
			    			days: 1
			    		},
			    	}
			    });

			    element.on('valuesChanged', function(e, data) {
			    	// Update slider view
			    	$scope.$apply(function() {
			    		ngModelCtrl.$setViewValue(data.values);
			    	});

			    	// update users list
			    	$scope.updateUsersList();

			    	// No user selected
			    	if ($scope.userId == undefined) {
			    		
			    	}

			    	// Update data
			    	/*VIEW ALL RIDES IN MAP*/
			    	$scope.getCarbonFootprint($scope.userId);
			    });
            });
        }
    };
});

/**
 * Clear all rides off the map
 */
function clearMap(m) {
    for(i in m._layers) {
        if(m._layers[i]._path == undefined) {
        	continue;
        }

        try {
            m.removeLayer(m._layers[i]);
        } catch(e) {
            console.log("problem with " + e + m._layers[i]);
        }
    }
}
 
/*  Distance between all stops and the user location
 * Link: https://jsperf.com/haversine-formula-2
 */
function distance(lat1, lon1, lat2, lon2) {
	var p = 0.017453292
	519943295;    // Math.PI / 180 radian
	var c = Math.cos;
	var a = 0.5 - c((lat2 - lat1) * p)/2 +
	    c(lat1 * p) * c(lat2 * p) *
	    (1 - c((lon2 - lon1) * p))/2;

	return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}
/**
 * Look over the rides list and draw ridesCluster 
 * marker(dessin)
 */
function addContentCluster(map, rides) {
	map._markersClusterGroup.clearLayers();


	rides.forEach(function(ride) {
		/*
		 * Build a array of all position and make markers
		 * to give some information about the current position (speed, etc.)
		 */
		var latLonArray = [],
			  tmpPoint = null,
				calcDistance = 0;
		ride.coordinates.forEach(function(coord, index) {
			var latlng = L.latLng(coord.latitude, coord.longitude)

			if (null == tmpPoint) {
				tmpPoint = latlng;
				latLonArray.push( latlng );
			} else {
				calcDistance = distance(tmpPoint.lat, tmpPoint.lng, latlng.lat, latlng.lng);
				if (calcDistance > 8) {
						latLonArray.push( latlng );
				}
			}
			tmpPoint = latlng;

			map._markersClusterGroup.addLayer( new L.Marker(latlng) );
		});

		console.log(latLonArray);

		/*define path color*/
		 var polylineOptions = {
               color: 'black',
               weight: 10,
               opacity: 12
             };

		/*
		 * Draw line between each point
		 */
		var points = {'train' : null, 'car' : null, 'walking' : null};
		if (typeof ride !== 'undefined') {
			var maxSpeed = (ride.maxSpeed != null) ? ride.maxSpeed.toFixed(1) : 'null';
			var averageSpeed = (ride.averageSpeed != null) ? ride.averageSpeed.toFixed(1) : 'null';
			var averageAcc = (ride.averageAcc != null) ? ride.averageAcc.toFixed(3) : 'null';
			var p = L.polyline(latLonArray,polylineOptions)
					.addTo(map)
						.bindPopup('Total distance: '+ ride.distance.toFixed(3) +' km<br>\
					Average speed: '+ averageSpeed +' km/h<br>\
					Average acceleration: NULL'+ averageAcc +' m/s&sup2;<br>\
					Max speed: '+ maxSpeed +' km/h<br>\
					Carbon Footprint: '+ ride.emission.toFixed(1) +' Kg eq. CO₂');
		}


	});
}
/**
 * Look over the rides list and draw rides
 */
function addContent(map, rides) {
	map._markersClusterGroup.clearLayers();

	rides.forEach(function(ride) {
		/*
		 * Build a array of all position and make markers
		 * to give some information about the current position (speed, etc.)
		 */
		var latLonArray = [];
		ride.coordinates.forEach(function(coord, index) {
			var latlng = L.latLng(coord.latitude, coord.longitude)

			latLonArray.push( latlng );
			map._markersClusterGroup.addLayer( new L.Marker(latlng) );
		});

		// define path color
		var color;
		switch(ride.type) {
		case 'train':
			color = 'blue'; break;
		case 'car':
			color = 'red'; break;
		case 'walking':
			color = 'green'; break
		default:
			color = 'green';
		}

		var c = 0;
		/*
		 * Draw line between each point
		 */
		if (typeof ride !== 'undefined') {
			var maxSpeed = (ride.maxSpeed != null) ? ride.maxSpeed.toFixed(1) : 'null';
			var averageSpeed = (ride.averageSpeed != null) ? ride.averageSpeed.toFixed(1) : 'null';
			var averageAcc = (ride.averageAcc != null) ? ride.averageAcc.toFixed(3) : 'null';
			var p = L.polyline(latLonArray, {color: color})
					.addTo(map)
						.bindPopup('Total distance: '+ ride.distance.toFixed(3) +' km<br>\
					Average speed: '+ averageSpeed +' km/h<br>\
					Average acceleration: NULL'+ averageAcc +' m/s&sup2;<br>\
					Max speed: '+ maxSpeed +' km/h<br>\
					Carbon Footprint: '+ ride.emission.toFixed(1) +' Kg eq. CO₂');

		}


	});
}
