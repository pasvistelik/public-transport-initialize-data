'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('regenerator-runtime/runtime');

require('babel-polyfill');

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initailize.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function getNextStation(currentStation) {
    for (var j = 0, thisStations = this.stations[0]; j <= 1; thisStations = this.stations[j = 1]) {
        for (var t = 0, nn = thisStations.length; t < nn; t++) {
            if (thisStations[t] === currentStation) {
                if (t + 1 !== nn) return thisStations[t + 1];else return null;
            }
        }
    }
    return null;
}
function getPreviousStation(currentStation) {
    for (var j = 0, thisStations = this.stations[0]; j <= 1; thisStations = this.stations[j = 1]) {
        for (var t = 0, nn = thisStations.length; t < nn; t++) {
            if (thisStations[t] === currentStation) {
                if (t !== 0) return thisStations[t - 1];else return null;
            }
        }
    }
    return null;
}
function getTimetable(station) {
    for (var j = 0, thisStations = this.stations[0]; j <= 1; thisStations = this.stations[j = 1]) {
        for (var i = 0, n = thisStations.length; i < n; i++) {
            if (thisStations[i] === station) {
                return this.timetables[j][i];
            }
        }
    }
    return null;
}
function findTimeAfter(time) {
    var dateTmp = new Date();
    dateTmp.setMinutes(0);
    dateTmp.setHours(0);
    dateTmp.setSeconds(time);
    var day = dateTmp.getDay();

    for (var kkk = 0, mnkk = this.table.length, t = this.table[0]; kkk < mnkk; t = this.table[++kkk]) {
        if (t.days.includes(day)) {
            /*
            //TODO: Здесь можно ускорить поиск, поскольку массив t.times отсортирован по возрастанию.
            for (let iik = 0, mnii = t.times.length, st = t.times[0], stTime; iik < mnii; st = t.times[++iik]) {
                stTime = st.hour * 3600 + st.minute * 60;
                if (stTime >= time) {
                    return stTime - time;
                }
            }*/
            var findedTime = binomialFind(t.times, function (array, item, index) {
                var stTime = this.hour * 3600 + this.minute * 60;
                if (stTime >= time && (array[index + 1] == null || array[index].hour * 3600 + array[index].minute * 60 < time)) return 0;else if (stTime >= time) return 1;else return -1;
            });
            if (findedTime != null) return findedTime.hour * 3600 + findedTime.minute * 60 - time;

            /*do {
                dateTmp = new Date();
                dateTmp.setSeconds(86400);
                day = dateTmp.getDay();
            } while (t.days.includes(day));*/

            //TODO: Здесь следует перейти к расписанию следующего дня и искать там.
            if (t.times.length !== 0) return t.times[0].hour * 3600 + t.times[0].minute * 60 + 86400 - time;
            break;
        }
    }
    return 2160000000;
}
function findTimeBefore(time) {
    var dateTmp = new Date();
    dateTmp.setMinutes(0);
    dateTmp.setHours(0);
    dateTmp.setSeconds(time);
    var day = dateTmp.getDay();
    for (var kkk = 0, mnkk = this.table.length, t = this.table[0], ok = false, st; kkk < mnkk; t = this.table[++kkk]) {
        if (t.days.includes(day)) {

            //TODO: Здесь можно ускорить поиск, поскольку массив t.times отсортирован по возрастанию.
            for (var iik = t.times.length - 1, stt = t.times[iik], stTime; iik >= 0; stt = t.times[--iik]) {
                stTime = stt.hour * 3600 + stt.minute * 60;
                if (stTime <= time) {
                    return stTime - time;
                }
            }

            //TODO: Здесь следует перейти к расписанию предыдущего дня и искать там.
            if (t.times.length !== 0) return t.times[t.times.length - 1].hour * 3600 + t.times[t.times.length - 1].minute * 60 - 86400 - time;
            break;
        }
    }
    return 0;
}

function binomialFind(array, predicateForArrayItem) {
    for (var a = 0, b = array.length, i = parseInt(b / 2), currentItem = array[i], predicateResult; a != b; currentItem = array[i = parseInt((b + a) / 2)]) {
        predicateResult = currentItem.predicateForArrayItem(array, currentItem, i);
        if (predicateResult === 0) {
            return currentItem;
        } else if (predicateResult === 1) {
            b = i;
        } else {
            a = i;
        }
    }
    return null;
}

function initialize(allStations, allRoutes, allTimetables) {

    console.log("Start initializing...");
    var startInitializingMoment = Date.now();

    var tmpUsedStations = [];

    function bindRoutesStationsTimetables(station, tmpArr, tabArr, rr) {
        if (station.routes == null) station.routes = [];
        //console.log(station.routes);//!!!
        if (!station.routes.includes(rr)) station.routes.push(rr);
        tmpArr.push(station);

        var tmp = allTimetables.find(function (element, index, array) {
            return element.stationCode === station.hashcode && element.routeCode === rr.hashcode;
        });
        var tmpTab = tmp == null ? null : tmp;

        tabArr.push(tmpTab);
    }

    // Удаляем станции, через которые не идет ни один маршрут
    var newAllStations = [];
    for (var i = 0, n = allStations.length, currentStation = allStations[0]; i < n; currentStation = allStations[++i]) {
        if (currentStation.routesCodes != null && currentStation.routesCodes.length !== 0) {
            newAllStations.push(currentStation);
        }
    }
    allStations = newAllStations;

    var startInitializingMoment2 = Date.now();

    for (var _i = 0, _n = allRoutes.length, currentRoute = allRoutes[0]; _i < _n; currentRoute = allRoutes[++_i]) {

        currentRoute.getNextStation = getNextStation;
        currentRoute.getPreviousStation = getPreviousStation;
        currentRoute.getTimetable = getTimetable;

        var currentRouteStationsCodes = currentRoute.stationsCodes;

        if (currentRoute.stationsCodes == null || currentRouteStationsCodes.length === 0) {
            continue;
        }

        try {

            currentRoute.stations = [[], []];
            currentRoute.timetables = [[], []];

            for (var index = 0, tmpArr = [], tabArr = []; index <= 1; index = 1) {
                if (currentRouteStationsCodes[index] == null || currentRouteStationsCodes[index].length === 0) continue;

                var _loop = function _loop(j, m, stationCode) {
                    tmpUsed = false;
                    /*for (let k = 0, mn = tmpUsedStations.length, station = tmpUsedStations[0]; k < mn; station = tmpUsedStations[++k]) {
                        if (station != null && station.hashcode === stationCode) {
                            bindRoutesStationsTimetables(station, tmpArr, tabArr, currentRoute);
                            tmpUsed = true;
                            break;
                        }
                    }*/

                    if (!tmpUsed) {
                        /*for (let k = 0, mn = allStations.length, station = allStations[0]; k < mn; station = allStations[++k]) {
                            if (station != null && station.hashcode === stationCode) {
                                bindRoutesStationsTimetables(station, tmpArr, tabArr, currentRoute);
                                if (!tmpUsedStations.includes(station)) tmpUsedStations.push(station);
                                break;
                            }
                        }*/

                        /*for (let a = 0, b = allStations.length, i = parseInt(b/2), currentStation = allStations[i]; a != b; currentStation = allStations[i = parseInt((b+a)/2)]){
                            if (currentStation.hashcode === stationCode) {
                                bindRoutesStationsTimetables(currentStation, tmpArr, tabArr, currentRoute);
                                break;
                            }
                            else if (currentStation.hashcode < stationCode) {
                                a = i;
                            }
                            else {
                                b = i;
                            }
                        }*/

                        var findedStation = binomialFind(allStations, function () {
                            if (this.hashcode === stationCode) return 0;else if (this.hashcode > stationCode) return 1;else return -1;
                        });
                        bindRoutesStationsTimetables(findedStation, tmpArr, tabArr, currentRoute);
                    }
                };

                for (var j = 0, m = currentRouteStationsCodes[index].length, stationCode = currentRouteStationsCodes[index][0]; j < m; stationCode = currentRouteStationsCodes[index][++j]) {
                    var tmpUsed;

                    _loop(j, m, stationCode);
                }
                currentRoute.stations[index] = tmpArr;
                currentRoute.timetables[index] = tabArr;
            }
        } catch (ex) {
            console.log(ex);
            continue;
        }
    }

    console.log("Time = " + (Date.now() - startInitializingMoment2) + " ms.");

    for (var _i2 = 0, _n2 = allTimetables.length, timetable = allTimetables[0]; _i2 < _n2; timetable = allTimetables[++_i2]) {
        timetable.findTimeAfter = findTimeAfter;
        timetable.findTimeBefore = findTimeBefore;
    }

    console.log("Initialized. Time = " + (Date.now() - startInitializingMoment) + " ms.");
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// End initailize.
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.default = initialize;