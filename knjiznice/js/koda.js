
var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";


/**
 * Prijava v sistem z privzetim uporabnikom za predmet OIS in pridobitev
 * enolične ID številke za dostop do funkcionalnosti
 * @return enolični identifikator seje za dostop do funkcionalnosti
 */
function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
                "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}


/**
 * Generator podatkov za novega pacienta, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati novega pacienta z
 * določenimi osebnimi podatki (ime, priimek in datum rojstva) ter za njega
 * shraniti nekaj podatkov o vitalnih znakih.
 * @param stPacienta zaporedna številka pacienta (1, 2 ali 3)
 * @return ehrId generiranega pacienta
 */
function generirajPodatke(stPacienta) {
  ehrId = "";

  // TODO: Potrebno implementirati

  return ehrId;
}


// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

$(function () {
    $('#graph').highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: 'Sladkor v preteklem tednu'
        },
        xAxis: {
            type: 'datetime',
            labels: {
                overflow: 'justify'
            }
        },
        yAxis: {
            title: {
                text: 'Sladkor v krvi (mmol/L)'
            },
            minorGridLineWidth: 0,
            gridLineWidth: 0,
            alternateGridColor: null,
            plotBands: [{
                from: 0.0,
                to: 3.5,
                label: {
                    text: 'Hipoglikemija',
                    style: {
                        color: '#606060'
                    }
                }
            }, {
                from: 1.5,
                to: 3.5,
                color: 'rgba(255, 133, 27, 0.2)',
            }, {
                from: 0.0,
                to: 1.5,
                color: 'rgba(255, 65, 54, 0.2)',
            }, {
                from: 3.5,
                to: 6,
                color: 'rgba(40, 182, 44, 0.4)',
                label: {
                    text: 'V redu',
                    style: {
                        color: '#606060'
                    }
                }
            }, {
                from: 6,
                to: 25,
                label: {
                    text: 'Hiperglikemija',
                    style: {
                        color: '#606060'
                    }
                }
            }, {
                from: 6,
                to: 12,
                color: 'rgba(255, 133, 27, 0.2)',
            }, {
                from: 12,
                to: 25,
                color: 'rgba(255, 65, 54, 0.2)',
            }]
        },
        tooltip: {
            valueSuffix: ' mmol/L'
        },
        plotOptions: {
            spline: {
                lineWidth: 4,
                states: {
                    hover: {
                        lineWidth: 5
                    }
                },
                marker: {
                    enabled: false
                },
            }
        },
        series: [{
            name: 'Sladkor v krvi',
            
            data: [
                [Date.UTC(2015, 9, 29, 0, 0), 6.3],
                [Date.UTC(2015, 10, 15, 0, 0), 0.4],
                [Date.UTC(2015, 11, 1, 0, 0), 0.25],
                [Date.UTC(2016, 0, 1, 0, 0), 1.66],
                [Date.UTC(2016, 0, 10, 0, 0), 1.8],
                [Date.UTC(2016, 1, 19, 0, 0), 1.76],
                [Date.UTC(2016, 2, 25, 0, 0), 2.62],
                [Date.UTC(2016, 3, 19, 0, 0), 2.41],
                [Date.UTC(2016, 3, 30, 0, 0), 2.05],
                [Date.UTC(2016, 4, 14, 0, 0), 1.7],
                [Date.UTC(2016, 4, 24, 0, 0), 1.1],
                [Date.UTC(2016, 5, 10, 0, 0), 0]
                ],
            color: 'rgba(0, 0, 0, 0.6)'
        }],
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
});

var map;
var infowindow;


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 14
  });
  
  if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map.setCenter(pos);
            infowindow = new google.maps.InfoWindow();
             var service = new google.maps.places.PlacesService(map);
             service.nearbySearch({
              location: pos,
              radius: 1500,
              type: ['hospital']
                 }, callback);
          });
        }

 
  
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}