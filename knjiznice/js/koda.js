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


var trenutniEhr;



function kreirajEHR() {
    sessionId = getSessionId();

    var ime = $("#kreirajIme").val();
    var priimek = $("#kreirajPriimek").val();
    var datumRojstva = $("#kreirajDatumRojstva").val();

    if (!ime || !priimek || !datumRojstva || ime.trim().length == 0 || priimek.trim().length == 0 || datumRojstva.trim().length == 0) {
        $("#kreirajSporocilo").html("<div class='alert alert-dismissible alert-warning'><button type='button' class='close' data-dismiss='alert'>&times;</button>Prosim vnesi vse zahtevane podatke!</div>");
    }
    else {
        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });
        $.ajax({
            url: baseUrl + "/ehr",
            type: "POST",
            success: function(data) {
                var ehrId = data.ehrId;
                var partyData = {
                    firstNames: ime,
                    lastNames: priimek,
                    dateOfBirth: datumRojstva,
                    partyAdditionalInfo: [{
                        key: "ehrId",
                        value: ehrId
                    }]
                };
                $.ajax({
                    url: baseUrl + "/demographics/party",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(partyData),
                    success: function(party) {
                        if (party.action == "CREATE") {
                            $("#kreirajSporocilo").html("<div class='alert alert-dismissible alert-success'><button type='button' class='close' data-dismiss='alert'>&times;</button>Uspešno kreiran EHR: " + ehrId + "</div>");
                            $("#preberiEHRid").val(ehrId);
                        }
                    },
                    error: function(err) {
                        $("#kreirajSporocilo").html("<div class='alert alert-dismissible alert-warning'><button type='button' class='close' data-dismiss='alert'>&times;</button>Napaka " + JSON.parse(err.responseText).userMessage + "!</div>");
                    }

                });
            }
        });
    }
}

function preberiEhrId() {
    sessionId = getSessionId();
    var ehrId = $("#prijavaEhr").val();

    if (!ehrId || ehrId.trim().length == 0) {
        $("#prijavaUporabnika").html("<div class='alert alert-dismissible alert-warning'><button type='button' class='close' data-dismiss='alert'>&times;</button>Prosim vnesi vse zahtevane podatke!</div>");
    }
    else {
        trenutniEhr = ehrId;
        $.ajax({
            url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
            type: "GET",
            headers: {
                "Ehr-Session": sessionId
            },
            success: function(data) {
                var party = data.party;
                $("#prijavaUporabnika").html("<div class='alert alert-dismissible alert-success'><button type='button' class='close' data-dismiss='alert'>&times;</button>Uspešno prijavljen: " + party.firstNames + " " + party.lastNames + ", rojen/a " + party.dateOfBirth + ".</div>");
            },
            error: function(err) {
                $("#prijavaUporabnika").html("<div class='alert alert-dismissible alert-warning'><button type='button' class='close' data-dismiss='alert'>&times;</button>Napaka " + JSON.parse(err.responseText).userMessage + "!</div>");

            }
        });
    }
}

function dodajMeritev() {
    sessionId = getSessionId();

    var ehrId = $("#dodajMeritevEHR").val();
    var datumInUra = $("#dodajMeritevDatumInUra").val();
    var krvniSladkor = $("#dodajMeritevKrvniSladkor").val();
    var celodnevniInzulin = $("#dodajMeritevCelodnevniInzulin").val();
    var teza = $("#dodajMeritevTeza").val();

    if (!ehrId || ehrId.trim().length == 0) {
        $("#vnosMeritveSporocilo").html("<div class='alert alert-dismissible alert-warning'><button type='button' class='close' data-dismiss='alert'>&times;</button>Prosim vnesi vse zahtevane podatke!</div>");
    }
    else {
        $.ajaxSetup({
            headers: {
                "Ehr-Session": sessionId
            }
        });
        var podatki = {
            "partyAdditionalInfo": [{
                "key": "ehr",
                "value": ehrId
            }, {
                "key": "datum_ura",
                "value": datumInUra
            }, {
                "key": "teza",
                "value": teza
            }, {
                "key": "krvni_sladkor",
                "value": krvniSladkor
            }, {
                "key": "celodnevni_inzulin",
                "value": celodnevniInzulin
            }]
        };
        
        $.ajax({
            url: baseUrl + "/demographics/party",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(podatki),
            success: function(res) {
                $("#vnosMeritveSporocilo").html("<div class='alert alert-dismissible alert-success'><button type='button' class='close' data-dismiss='alert'>&times;</button>Uspešno dodana meritev: " + res.meta.href + ".</div>");

            },
            error: function(err) {
                $("#vnosMeritveSporocilo").html("<div class='alert alert-dismissible alert-warning'><button type='button' class='close' data-dismiss='alert'>&times;</button>Napaka " + JSON.parse(err.responseText).userMessage + "!</div>");

            }
        });
    }
}


var arrayZadnjihMeritev = [];

function preberiZgodovinoMeritev() {
    sessionId = getSessionId();

    var ehrId = trenutniEhr;

    if (!ehrId || ehrId.trim().length == 0) {
        $("#rezultatiMeritev").html("<div class='panel-body'><div class='alert alert-dismissible alert-danger'><button type='button' class='close' data-dismiss='alert'>&times;</button>Prosim prijavite se!</div></div>");
    }
    else {
        var searchData = [{
            key: "ehr",
            value: trenutniEhr
        }];
        $.ajax({
            url: baseUrl + "/demographics/party/query",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(searchData),
            headers: {
                "Ehr-Session": sessionId
            },
            success: function(res) {
                arrayZadnjihMeritev = [];
                var results = "";
                        results += "<table class=\"table table-striped table-hover table-condensed\">";
                        results += "            <thead>";
                        results += "              <tr>";
                        results += "                <th class=\"text-center\">Čas";
                        results += "                  <br><span class='notbold'>(datum\/ura)<\/span><\/th>";
                        results += "                <th class=\"text-center\">Sladkor v krvi";
                        results += "                  <br><span class='notbold'>(mmol\/L)<\/span><\/th>";
                        results += "                <th class=\"text-center\">Celodnevni odmerek";
                        results += "                  <br><span class='notbold'>(E)<\/span><\/th>";
                        results += "                <th class=\"text-center\">Teža";
                        results += "                  <br><span class='notbold'>(kg)<\/span><\/th>";
                        results += "              <\/tr>";
                        results += "            <\/thead>";

                for (i in res.parties) {
                    var party = res.parties[i];
                    var datum = "";
                    var sladkor = "";
                    var celodnevni = "";
                    var tezaa = "";
                    for (j in party.partyAdditionalInfo) {
                        if (party.partyAdditionalInfo[j].key === "datum_ura") {
                            datum = party.partyAdditionalInfo[j].value;
                        }
                        if (party.partyAdditionalInfo[j].key === "krvni_sladkor") {
                            sladkor = party.partyAdditionalInfo[j].value;
                        }
                        if (party.partyAdditionalInfo[j].key === "celodnevni_inzulin") {
                            celodnevni = party.partyAdditionalInfo[j].value;
                        }
                        if (party.partyAdditionalInfo[j].key === "teza") {
                            tezaa = party.partyAdditionalInfo[j].value;
                        }
                        if (sladkor != "" && datum != "" && celodnevni != "" && tezaa != "") break;
                    }
                    results += "<tr><td>" + datum + "</td><td>" + sladkor + "</td><td>" + celodnevni + "</td><td>" + tezaa + "</td></tr>";
                    var today = new Date();
                    var lastWeek = Date.UTC(today.getFullYear(), today.getMonth()-1, today.getDate());
                    var temp = datum.split("-");
                    var temp2 = temp[2].split("T");
                    var temp3 = temp2[1].split(":");
                    console.log(Date.UTC(temp[0], temp[1]-1, temp2[0], temp3[0], temp3[1]));
                    if (Date.UTC(temp[0], temp[1]-1, temp2[0], temp3[0], temp3[1]) > lastWeek){
                        arrayZadnjihMeritev.push([Date.UTC(temp[0], temp[1]-1, temp2[0], temp3[0], temp3[1]), parseInt(sladkor)]);
                    }
                    
                }
                results += "</tbody>";
                results += "";
                results += "          <\/table>";
                
                console.log(arrayZadnjihMeritev);
                
                var chart = $('#graph').highcharts();
                chart.series[0].setData(arrayZadnjihMeritev, true);
                $("#rezultatiMeritev").html(results);
            },
            error: function(err) {
                $("#rezultatiMeritev").html("<div class='panel-body'><div class='alert alert-dismissible alert-danger'><button type='button' class='close' data-dismiss='alert'>&times;</button>Napaka " + JSON.parse(err.responseText).userMessage + "!</div></div>");
            }
        });
    }
}




// TODO: Tukaj implementirate funkcionalnost, ki jo podpira vaša aplikacija

$(function() {
    $('#graph').highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: 'Sladkor v preteklem mesecu'
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
            data: [],
            color: 'rgba(0, 0, 0, 0.6)'
        }],
        navigation: {
            menuItemStyle: {
                fontSize: '10px'
            }
        }
    });
});
