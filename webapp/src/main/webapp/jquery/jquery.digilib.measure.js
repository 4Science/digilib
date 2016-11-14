/*
 * #%L
 * digilib measure plugin
 * %%
 * Copyright (C) 2012 - 2014 Bibliotheca Hertziana, MPIWG Berlin
 * %%
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as 
 * published by the Free Software Foundation, either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Lesser Public License for more details.
 * 
 * You should have received a copy of the GNU General Lesser Public 
 * License along with this program.  If not, see
 * <http://www.gnu.org/licenses/lgpl-3.0.html>.
 * #L%
 * Authors: Martin Raspe, Robert Casties, 2012-2014
 */
/**
 * digilib measure plugin (measure distances on the digilib image in historic units etc.)
**/                                             

/* jslint browser: true, debug: true, forin: true
*/

/* TODO:
    - infowindow for shapes (partially done)
        - display fractions (1/3 etc.)
        - display angles
        - display Vitruvian intercolumnium types
    - display shapes overlay? (angles, distances?)
    - move shapes (shift+drag?)
    - confine oval to sensible measurements
    - better grid
    - snap vertex to next "round" unit / sub-unit while dragging (on keypress?)
*/


(function($) {

    // the digilib object
    var digilib = null;
    // the normal zoom area
    var FULL_AREA = null;

    // the functions made available by digilib
    var fn = {
        // dummy function to avoid errors, gets overwritten by buttons plugin
        highlightButtons: function () {
            console.debug('measure: dummy function - highlightButtons');
            }
        };
    // affine geometry plugin
    var geom = null;
    // convenience variable, set in init()
    var CSS = '';
    // shape currently being drawn/dragged
    var currentShape;
    // current key state: keystate[event.key] = event
    var keystate = {};
    // shiftPressed = event.shiftKey;
    // altPressed   = event.altKey;
    // ctrlPressed  = event.ctrlKey;

    // the conversion data
    var UNITS = {
        comment: [
          "Angaben nach:",
          "Klimpert, Richard: Lexikon der Münzen, Maße, Gewichte, Zählarten und Zeitgrößen aller Länder der Erde 2) Berlin 1896 (Reprint Graz 1972)",
          "Doursther, Horace: Dictionnaire universel des poids et mesures anciens et modernes. Paris 1840 (Reprint Amsterdam 1965)"
          ],
        sections: [{
            name: "Längenmaße: metrisch",
            group: "1",
            units: [{
				name: "m",
				factor: "1"
				},
				{
				name: "mm",
				factor: "0.001"
				},
				{
				name: "cm",
				factor: "0.01"
				},
				{
				name: "dm",
				factor: "0.1"
				},
				{
				name: "km",
				factor: "1000"
				}]
            },
            {
            name: "Längenmaße: nautisch",
            group: "1",
            units: [{
				name: "geographische Meile",
				factor: "7420"
				},
				{
				name: "Seemeile",
				factor: "1854.965"
				},
				{
				name: "fathom",
				factor: "1.828782"
				},
				{
				name: "cable",
				factor: "182.8782"
				},
				{
				name: "league",
				factor: "5564.895"
				}]
            },
            {
            name: "Längenmaße: England",
            group: "1",
            units: [{
				name: "foot",
				factor: "0.304797",
				subunits: 12
				},
				{
				name: "inch",
				factor: "0.02539975"
				},
				{
				name: "yard",
				factor: "0.914391",
				subunits: 3
				},
				{
				name: "pole",
				factor: "5.0291505",
				subunits: 11
				},
				{
				name: "chain",
				factor: "20.116602",
				subunits: 4
				},
				{
				name: "furlong",
				factor: "201.16602"
				},
				{
				name: "mile",
				factor: "1609.32816",
				subunits: 8
				}]
            },
            {
            name: "Längenmaße: Italien",
            group: "1",
            units: [{
				name: "palmo d'architetto (Rom)",
				factor: "0.223425",
				subunits: 12
				},
				{
				name: "braccio (Florenz)",
				factor: "0.5836",
				subunits: 20
				},
				{
				name: "braccio (Mailand)",
				factor: "0.5949",
				subunits: 12
				},
				{
				name: "canna d'architetto (Rom)",
				factor: "2.23425"
				},
				{
				name: "canna di commercio (Rom)",
				factor: "1.9920"
				},
				{
				name: "canna d'architetto (Florenz)",
				factor: "2.9180"
				},
				{
				name: "canna di commercio (Florenz)",
				factor: "2.3344"
				},
				{
				name: "canna agrimensoria (Florenz)",
				factor: "2.9181",
				subunits: 5
				},
        {
				name: "canna (Neapel)",
				factor: "2.10936",
				subunits: 8
				},
        {
				name: "catena (Neapel)",
				factor: "18.4569",
				},
        {
				name: "pertica (Neapel)",
				factor: "2.6367",
				},
        {
				name: "palmo (Neapel)",
				factor: "0.26367",
				subunits: 12
				},
        {
				name: "passo itinerario (Neapel)",
				factor: "1.84569",
				subunits: 8
				},
        {
				name: "oncia (Neapel)",
				factor: "0.021972",
				},
				{
				name: "miglio (Lombardei)",
				factor: "1784.808"
				},
				{
				name: "miglio (Neapel)",
				factor: "1855.110"
				},
				{
				name: "miglio (Rom)",
				factor: "1489.50"
				},
				{
				name: "minuta (Rom)",
				factor: "0.00372375"
				},
				{
				name: "oncia (Rom)",
				factor: "0.01861875"
				},
				{
				name: "oncia (Mailand)",
				factor: "0.49575"
				},
				{
				name: "palmo di commercio (Rom)",
				factor: "0.249"
				},
				{
				name: "palmo (Florenz)",
				factor: "0.2918"
				},
				{
				name: "passetto (Florenz)",
				factor: "1.1673",
				subunits: 40
				},
				{
				name: "piede (Brescia)",
				factor: "0.471"
				},
				{
				name: "piede (Carrara)",
				factor: "0.2933"
				},
				{
				name: "piede (Como)",
				factor: "0.4512"
				},
				{
				name: "piede (Modena)",
				factor: "0.523048"
				},
				{
				name: "piede (Reggio Em.)",
				factor: "0.530898"
				},
				{
				name: "piede (Venedig)",
				factor: "0.347735"
				},
				{
				name: "piede (Vicenza)",
				factor: "0.3574"
				},
				{
				name: "piede (Verona)",
				factor: "0.3429"
				},
				{
				name: "piede (Rom)",
				factor: "0.297587"
				},
				{
				name: "piede Lombardo",
				factor: "0.435185"
				},
				{
				name: "piede liprando (Turin)",
				factor: "0.51377"
				},
				{
				name: "piede manuale (Turin)",
				factor: "0.342511"
				},
				{
				name: "piede (Neapel, 'palmo')",
				factor: "0.26455"
				},
				{
				name: "soldo (Florenz)",
				factor: "0.2918"
				},
				{
				name: "trabucco piemontese (Turin)",
				factor: "3.08259"
				}]
            },
            {
            name: "Längenmaße: Niederlande",
            group: "1",
            units: [{
				name: "voet (Amsterdam)",
				factor: "0.283113"
				},
				{
				name: "voet (Antwerpen)",
				factor: "0.2868"
				},
				{
				name: "voet (Aelst)",
				factor: "0.2772"
				},
				{
				name: "voet (Breda)",
				factor: "0.28413"
				},
				{
				name: "voet (Brügge)",
				factor: "0.27439"
				},
				{
				name: "voet (Brüssel)",
				factor: "0.2757503"
				},
				{
				name: "voet (Groningen)",
				factor: "0.2922"
				},
				{
				name: "voet (Haarlem)",
				factor: "0.2858"
				},
				{
				name: "voet (Kortrijk)",
				factor: "0.2977"
				},
				{
				name: "voet (Tournai)",
				factor: "0.2977"
				},
				{
				name: "voet (Utrecht)",
				factor: "0.2683"
				},
				{
				name: "voet (Ypern)",
				factor: "0.2739"
				},
				{
				name: "pied (Hainaut)",
				factor: "0.2934"
				},
				{
				name: "pied St. Hubert (Lüttich)",
				factor: "0.294698"
				},
				{
				name: "pied St. Lambert (Lüttich)",
				factor: "0.291796"
				},
				{
				name: "pied Ste. Gertrude (Nivelles)",
				factor: "0.27709"
				},
				{
				name: "steenvoet (Oudenaerde)",
				factor: "0.2977"
				},
				{
				name: "houtvoet (Oudenaerde)",
				factor: "0.292"
				}]
            },
            {
            name: "Längenmaße: Frankreich",
            group: "1",
            units: [{
				name: "pied du Roi (Paris)",
				factor: "0.32483938497"
				},
				{
				name: "pied (Arras)",
				factor: "0.29777"
				},
				{
				name: "pied (Cambrai)",
				factor: "0.29777"
				},
				{
				name: "Burgundischer Fuß",
				factor: "0.33212"
				}]
            },
            {
            name: "Längenmaße: Südeuropa",
            group: "1",
            units: [{
				name: "pié de Burgos (Spanien)",
				factor: "0.278635"
				},
				{
				name: "pé (Portugal)",
				factor: "0.33"
				}]
            },
            {
            name: "Längenmaße: deutschspr. Länder",
            group: "1",
            units: [{
				name: "Fuß (Basel)",
				factor: "0.29820"
				},
				{
				name: "Fuß (Bayern)",
				factor: "0.2918592"
				},
				{
				name: "Fuß (Braunschweig)",
				factor: "0.2853624"
				},
				{
				name: "Fuß (Gotha)",
				factor: "0.287622"
				},
				{
				name: "Fuß (Hamburg)",
				factor: "0.286575"
				},
				{
				name: "Fuß (Hessen)",
				factor: "0.287669"
				},
				{
				name: "Fuß (Köln)",
				factor: "0.2876"
				},
				{
				name: "Fuß (Mecklenburg)",
				factor: "0.291006"
				},
				{
				name: "Fuß (Münster)",
				factor: "0.2908"
				},
				{
				name: "Fuß (Pommern)",
				factor: "0.2921"
				},
				{
				name: "Fuß (rheinisch)",
				factor: "0.3138535"
				},
				{
				name: "Fuß (Sachsen)",
				factor: "0.2831901"
				},
				{
				name: "Fuß (Preußen)",
				factor: "0.3138535"
				},
				{
				name: "Fuß (Wien)",
				factor: "0.3180807"
				},
				{
				name: "Fuß (Württemberg)",
				factor: "0.2864903"
				},
				{
				name: "Werkschuh (Frankfurt)",
				factor: "0.2846143"
				},
				{
				name: "Meile (Preußen)",
				factor: "7532.485"
				},
				{
				name: "Postmeile (Österreich)",
				factor: "7585.937"
				},
				{
				name: "Dezimalfuß (Preußen)",
				factor: "0.3766242"
				}]
            },
            {
            name: "Längenmaße: Osteuropa",
            group: "1",
            units: [{
				name: "Fuß (Böhmen)",
				factor: "0.2964"
				},
				{
				name: "Fuß (Mähren)",
				factor: "0.29596"
				},
				{
				name: "stopa (Krakauer Fuß)",
				factor: "0.3564"
				},
				{
				name: "stopa (Warschauer Fuß)",
				factor: "0.288"
				},
				{
				name: "Fuß (Rußland)",
				factor: "0.3556"
				},
				{
				name: "arschin",
				factor: "0.7112"
				},
				{
				name: "saschen (Faden)",
				factor: "2.133"
				},
				{
				name: "werst",
				factor: "1066.8"
				},
				{
				name: "milja",
				factor: "7468"
				}]
            },
            {
            name: "Längenmaße: Antike",
            group: "1",
            units: [{
				name: "pes romanus",
				factor: "0.2945"
				},
				{
				name: "pollex (Zoll)",
				factor: "0.0245416667"
				},
				{
				name: "digitus (Fingerbreite)",
				factor: "0.01840625"
				},
				{
				name: "palmus (Handbreite)",
				factor: "0.073625"
				},
				{
				name: "cubitus (Elle)",
				factor: "0.44175"
				},
				{
				name: "passus (Doppelschritt)",
				factor: "1.4725"
				},
				{
				name: "pertica",
				factor: "2.945"
				},
				{
				name: "actus",
				factor: "35.34"
				},
				{
				name: "mille passus (Meile)",
				factor: "1472.5"
				},
				{
				name: "stadium (600 Fuß)",
				factor: "176.7"
				},
				{
				name: "stadium (1/8 Meile)",
				factor: "184.0625"
				},
				{
				name: "stadion (Olympia)",
				factor: "192.25"
				},
				{
				name: "Fuß (attisch)",
				factor: "0.308"
				},
				{
				name: "Fuß (Babylon)",
				factor: "0.35"
				},
				{
				name: "Fuß (Delphi)",
				factor: "0.1848"
				},
				{
				name: "Fuß (Olympia)",
				factor: "0.32041667"
				}]
            },
            {
            name: "Fläche",
            group: "4",
            units: [{
				name: "qm",
				factor: "1"
				},
				{
				name: "qmm",
				factor: "0.000001"
				},
				{
				name: "qcm",
				factor: "0.0001"
				},
				{
				name: "qdm",
				factor: "0.01"
				},
				{
				name: "rubbio (Roma, Lazio)",
				factor: "18484,38"
				},
				{
				name: "pezza (Roma, vigne)",
				factor: "2640,63",
				},
				{
				name: "braccio quadrato (Toscana)",
				factor: "0.3406",
				subunits: 400
				},
				{
				name: "quadrato (Toscana)",
				factor: "3406,19"
				},
				{
				name: "stioro (Toscana)",
				factor: "525,01"
				},
				{
				name: "staio (Toscana)",
				factor: "1703,10",
				},
				{
				name: "tornatura (Toscana)",
				factor: "2080,44"
				},
				{
				name: "Ar",
				factor: "100"
				},
				{
				name: "Morgen",
				factor: "2500"
				},
				{
				name: "Hektar",
				factor: "10000"
				},
				{
				name: "qkm",
				factor: "1000000"
				},
				{
				name: "square inch",
				factor: "0.0006452"
				},
				{
				name: "square foot",
				factor: "0.09288"
				},
				{
				name: "square yard",
				factor: "0.836",
				subunits: "9"
				},
				{
				name: "pole (rod, perch)",
				factor: "25.289"
				},
				{
				name: "rood",
				factor: "1012",
				subunits: "40"
				},
				{
				name: "acre",
				factor: "4048",
				subunits: "4"
				},
				{
				name: "square mile",
				factor: "2590000"
				}]
            },
            {
            name: "Sonstige",
            group: "0",
            units: [{
				name: "Maßstab 1:200",
				factor: "200"
				},
				{
				name: "Maßstab",
				factor: "1:100",
				add: "100"
				},
				{
				name: "Maßstab 1:75",
				factor: "75"
				},
				{
				name: "Maßstab 1:60",
				factor: "60"
				},
				{
				name: "Maßstab",
				factor: "1:50",
				add: "50"
				},
				{
				name: "Maßstab 1:25",
				factor: "25"
				},
				{
				name: "Maßstab 1:20",
				factor: "20"
				},
				{
				name: "Maßstab 1:10",
				factor: "10"
				},
				{
				name: "Maßstab 1:5",
				factor: "5"
				},
				{
				name: "Maßstab 1:3",
				factor: "3"
				}]
          }]
        };
    var buttons = {
        measure: {
            onclick: "measurebar",
            tooltip: "show the measuring toolbar",
            icon: "measure.png"
            },
        drawshape: {
            onclick: "drawshape",
            tooltip: "draw a shape",
            }
        };

    var defaults = {
        // buttonset of this plugin
        measureButtonSet: ['measurebar'],
        // unit data
        units: UNITS,
        // styles for shapes
        styles: {
            shape: {
                stroke: 'lightgreen',
                'stroke-width': 2,
                fill: 'none'
                },
            constr: {
                stroke: 'cornsilk',
                'stroke-width': 1,
                fill: 'none'
                },
            guide: {
                stroke: 'blue',
                'stroke-width': 1,
                fill: 'none'
                },
            selected: {
                stroke: 'cyan',
                'stroke-width': 3,
                fill: 'none'
                },
            handle: {
                stroke: 'blue',
                'stroke-width': 1,
                fill: 'none',
                hover: {
                    fill: 'yellow',
                    }
                }
            },
        // implemented styles
        implementedStyles: ['shape', 'constr', 'guide', 'selected', 'handle'],
        // implemented measuring shape types, for select widget
        implementedShapes: ['Line', 'LineString', 'Proportion', 'Rect', 'Rectangle', 'Polygon', 'Circle', 'Intercolumnium', 'Oval', 'EllipseArc', 'Grid'],
        // all measuring shape types
        shapeInfo: {
            Line: { name: 'line', labels: [
              { len1: 'length'},
              { angx: 'angle to x-axis'}
              ]},
            LineString: { name: 'linestring', labels: [
              { len1: 'total length'},
              { seg: 'nr of segments'}
              ]},
            Proportion: { name: 'proportion', labels: [
              { len1: 'first leg'},
              { len2: 'second leg'},
              { rat1: 'proportion'},
              { ang:  'contained angle'},
              { angx: 'angle to x-axis'}
              ]},
            Rectangle: { name: 'box', labels: [
              { len1: 'side a'},
              { len2: 'side b'},
              { diag: 'diagonal'},
              { rat1: 'proportion'},
              { area: 'area'}
              ]},
            Rect: { name: 'rectangle', labels: [
              { len1: 'side a'},
              { len2: 'side b'},
              { diag: 'diagonal'},
              { rat1: 'proportion'},
              { angx: 'angle to x-axis'},
              { area: 'area'}
              ]},
            Square: { name: 'square', labels: [
              { len1: 'side'},
              { diag: 'diagonal'},
              { area: 'area'}
              ]},
            Polygon: { name: 'polygon', labels: [
              { len1: 'circumference'},
              { area: 'area'}
              ]},
            Circle: { name: 'circle', labels: [
              { rad1: 'radius'},
              { circ: 'circumference'},
              { area: 'area'}
              ]},
            Intercolumnium: { name: 'intercolumnium', labels: [
              { len1: 'modulus'},
              { len2: 'interval'},
              { rat1:  'proportion'}
              ]},
            Oval: { name: 'oval', labels: [
              { len1: 'long axis'},
              { len2: 'short axis'},
              { rad1: 'small radius'},
              { rad2: 'large radius'},
              { rat1: 'proportion'},
              { rat2: 'proportion of arcs'},
              { circ: 'circumference'},
              { area: 'area'},
              { angx: 'angle to x-axis'}
              ]},
            EllipseArc: { name: 'ellipse', labels: [
              { len1: 'long axis'},
              { len2: 'short axis'},
              { rat1: 'proportion'},
              { dist: 'focus distance'},
              { circ: 'circumference'},
              { area: 'area'},
              { angx: 'angle to x-axis'}
              ]},
            Grid: { name: 'linegrid', labels: [
              { len1: 'unit'},
              { area: 'area'},
              { angx: 'angle to x-axis'}
              ]},
            },
        // currently selected shape type
        activeShapeType: 'Line',
        // last measured distance
        lastMeasuredValue: 0,
        // last measured angle to x-axis
        lastMeasuredAngle: 0,
        // measuring unit (index into unit list)
        unitFrom: 17,
        // converted unit (index into unit list)
        unitTo: 0,
        // maximal denominator for mixed fractions
        maxDenominator: 20,
        // number of decimal places for convert results
        maxDecimals: 3,
        // show convert result as mixed fraction?
        showMixedFraction: false,
        // show angle relative to last line?
        showRelativeAngle: false,
        // show distance numbers?
        showDistanceNumbers: true,
        // show ratio of rectangle sides?
        showRectangleRatios: false,
        // draw line ends as small crosses
        drawEndPoints: true,
        // draw mid points of lines
        drawMidPoints: false,
        // draw circle centers
        drawCenters: false,
        // draw rectangles from the diagonal and one point
        drawFromDiagonal: false,
        // draw circles from center
        drawFromCenter: true,
        // snap to endpoints
        snapEndPoints: false,
        // snap to mid points of lines
        snapMidPoints: false,
        // snap to circle centers
        snapCenters: false,
        // snap distance (in screen pixels)
        snapDistance: 5,
        // keep original object when moving/scaling/rotating
        keepOriginal: false,
        // number of copies when drawing grids
        gridCopies: 10,
        // info window
        infoDiv: null
        };

    // debug routine
    var _debug_shape = function (msg, shape) {
        // console.debug('measure: ' + msg, shape.geometry.type, shape.geometry.coordinates);
        return;
        };

    // plugin actions
    var actions = {
        measurebar: function(data) {
            var $measureBar = data.$measureBar;
            if ($measureBar == null) {
              $measureBar = setupMeasureBar(data);
              };
            $measureBar.toggle();
            var on = $measureBar.is(":visible");
            attachKeyHandlers(data, on);
            showSVG(data, on);
            return;
        },
        drawshape: function(data) {
            var shape = newShape(data);
            var layer = data.measureLayer;
            $(data).trigger('createShape', shape);
            digilib.actions.addShape(data, shape, layer, shapeCompleted);
            console.debug('drawshape', shape);
            _debug_shape('action drawshape', shape);
            }
        };

    // callback for vector.drawshape
    var shapeCompleted = function(data, shape) {
        _debug_shape('shapeCompleted', shape);
        data.measureWidgets.startb.removeClass('dl-drawing');
        if (shape == null || shape.geometry.coordinates == null) {
            return false; // do nothing if no line was produced
            };
        $(data).trigger('changeShape', shape); // update widgets
        return false;
        };

    // callback for vector.drawshape
    var onCreateShape = function(event, shape) {
        var data = this;
        data.measureWidgets.startb.addClass('dl-drawing');
        _debug_shape('onCreateShape', shape);
    };

    // event handler for positionShape
    var onPositionShape = function(event, shape) {
        var data = this;
        currentShape = shape;
        if (keystate['x'] != null) { // change only x-Dimension of mouse pointer
            manipulatePosition(shape, lockDimension('y'));
            }
        if (keystate['y'] != null) { // change only y-Dimension of mouse pointer
            manipulatePosition(shape, lockDimension('x'));
            }
        if (keystate['s'] != null) { // snap to next unit
            manipulatePosition(shape, snapToUnit(data));
            }
        // console.debug('onPositionShape', shape.properties.screenpos);
    };

    // event handler for dragShape
    var onDragShape = function(event, shape) {
        var data = this;
        updateMeasuredValue(data, shape);
        _debug_shape('onDragShape', shape);
    };

    // event handler for changeShape
    var onChangeShape = function(event, shape) {
        var data = this;
        // event handler for updating shape info
        updateMeasuredValue(data, shape);
        currentShape = null;
        _debug_shape('onChangeShape', shape);
    };

    // event handler for renderShape
    var onRenderShape = function(event, shape) {
        var data = this;
        var select = function(event) {
            selectShape(data, this, shape);
            setActiveShapeType(data, shape);
            updateMeasuredValue(data, shape);
            _debug_shape('onClick', shape);
            };
        var info = function(event) {
            showInfoDiv(event, data, shape);
            _debug_shape('showInfoDiv', shape);
            };
        var $elem = shape.$interactor || shape.$elem;
        $elem.on('mouseover.measureinfo', info);
        $elem.on('click.measureselect', select);
        _debug_shape('onRenderShape', shape);
        };

    // get the vertex before the given one
    var getPrecedingVertex = function(shape) {
        var v = shape.properties.vtx;
        var props = shape.properties;
        return (v === 0) ? props.screenpos.length-1 : v-1;
        };

    // are points ordered clockwise?
    var isClockwise = function(data, shape) {
        var sum = sumEdges(rectifyCoords(data, shape));
        return sum > 0;
        };

    // sum up the edges (for area)
    var sumEdges = function(coords) {
        var sum = 0;
        j = coords.length-1; // set j to the last vertex
        for (i = 0; i < coords.length; i++) {
            sum += (coords[j].x + coords[i].x) * (coords[j].y - coords[i].y); 
            j = i;  // set j to the current vertex, i increments
            }
        return sum;
        };

    // rectify shape coords
    var rectifyCoords = function(shape, aspect) {
        var rectifyPoint = function (p) {
            return geom.position(aspect * p[0], p[1]);
            };
        var coords = $.map(shape.geometry.coordinates, rectifyPoint);
        return coords;
        };

    // recalculate factor after a new value was entered into input element "value1"
    var changeFactor = function(data) {
        var val = parseFloat(data.measureWidgets.value1.val());
        data.measureFactor = val / data.lastMeasuredValue;
        updateUnits(data); // convert a distance between 2 points into both units 
    };

    // scale length
    var scaleValue = function(val, factor) {
        return val * factor;
        };

    // scale area
    var scaleArea = function(val, factor) {
        return val * factor * factor;
        };

    // convert a length into both units 
    var convertLength = function (data, dist) {
        var factor = data.measureFactor;
        var unit1 = unitFactor(data, 1);
        var unit2 = unitFactor(data, 2);
        var ratio = unit1 / unit2;
        var len1 = scaleValue(dist, factor);
        var len2 = scaleValue(len1, ratio);
        var name1 = data.measureUnit1;
        var name2 = data.measureUnit2;
        return [len1, len2, name1, name2];
        };

    // convert measured value to second unit and display
    var updateConversion = function(data, val1, type) {
        var widgets = data.measureWidgets;
        var unit1 = unitFactor(data, 1);
        var unit2 = unitFactor(data, 2);
        var ratio = unit1 / unit2;
        var val2 = scaleValue(val1, ratio);
        widgets.shape.val(type);
        widgets.value1.val(fn.cropFloatStr(val1));
        widgets.value2.text(fn.cropFloatStr(val2));
        };

    // update last measured pixel values, display as converted to new units
    var updateUnits = function(data) {
        var type = getActiveShapeType(data);
        var factor = data.measureFactor;
        var px = data.lastMeasuredValue;
        var val = scaleValue(px, factor);
        updateConversion(data, val, type);
        var angle = data.lastMeasuredAngle;
        data.measureWidgets.angle.text(fn.cropFloatStr(angle, 1)+'°');
        };

    // display info for shape
    var updateMeasuredValue = function(data, shape) {
        var props = shape.properties;
        var screenpos = props.screenpos;
        var thisPos = screenpos[props.vtx];
        var lastPos = screenpos[getPrecedingVertex(shape)];
        data.lastMeasuredValue = thisPos.distance(lastPos);
        data.lastMeasuredAngle = thisPos.deg(lastPos);
        console.debug(shape, data.lastMeasuredValue, data.lastMeasuredAngle);
        updateUnits(data);
        };

    // get unit value from widget
    var unitFactor = function(data, index) {
        return parseFloat(data.measureWidgets['unit'+index].val());
        };

    // info data for shape
    var getInfoHTML = function(data, shape) {
        var s = data.settings;
        var factor = data.measureFactor;
        var type = shape.geometry.type;
        var m = shape.properties.measures || {};
        var name = s.shapeInfo[type].name;
        var labels = s.shapeInfo[type].labels;
        // var l = convertLength(data, scaled);
        var htmlLine = function (item, i) {
          var key = Object.keys(item)[0];
          var label = item[key];
          var value = m[key];
          return value
            ? '<div><em>'+label+'</em>: '
              +fn.cropFloat(value, 2)
              // +fn.cropFloat(l[0], 2)+' '+l[2]+' = '
              // +fn.cropFloat(l[1], 2)+' '+l[3]
              +'</div>'
            : '';
          };
        var lines = $.map(labels, htmlLine);
        var html = '<div class="head">'+name+'</div>'+lines.join('');
        return html;
        };

    // select/unselect shape (or toggle)
    var selectShape = function(data, elem, shape, select) {
        var css = CSS+'selected';
        if (select == null) { // toggle
            select = !shape.properties.selected }
        var cssclass = shapeClass(shape.geometry.type, select ? css : null);
        $(elem).attr("class", cssclass);
        shape.$elem.attr("class", cssclass);
        shape.properties.cssclass = cssclass;
        shape.properties.selected = select;
        };

    // construct CSS class for svg shape
    var shapeClass = function(shapeType, more) {
        var css = CSS+'shape '+CSS+shapeType;
        if (more != null) { css += ' '+more };
        return css;
        };

    // create a shape of the currently selected shape type
    var newShape = function(data) {
        var shapeType = getActiveShapeType(data);
        var style = data.settings.styles.shape;
        return {
            id: fn.createId(null, CSS),
            geometry: {
                type: shapeType
                },
            properties: {
                editable: true,
                selected: false,
                cssclass: shapeClass(shapeType),
                stroke: style['stroke'],
                'stroke-width': style['stroke-width']
                // 'center': data.settings.drawFromCenter
                }
            };
        };

    // returns a screenpoint manipulation function
    var snapToUnit = function(data) {
        // snap to the next rounded unit distance
        return function(shape) {
            var props = shape.properties;
            var screenpos = props.screenpos;
            var vtx = props.vtx;
            if (screenpos == null || vtx == null) {
                return; }
            var factor = data.measureFactor;
            var thisPos = screenpos[vtx];
            var lastPos = screenpos[getPrecedingVertex(shape)];
            var screenDist = thisPos.distance(lastPos);
            var unitDist = scaleValue(screenDist, factor);
            var roundDist = Math.round(unitDist); // round to the nearest integer
            if (roundDist === 0) {
                return; }
            var newPos = lastPos.scale(thisPos, roundDist/unitDist); // calculate snap position
            screenpos[vtx].moveTo(newPos);
            };
        };

    // returns a screenpoint manipulation function
    var lockDimension = function(dim) {
        // lock one dimension of the current screen pos to that of the previous
        return function(shape) {
            var props = shape.properties;
            var startpos = props.startpos;
            var screenpos = props.screenpos;
            var vtx = props.vtx;
            if (startpos == null || screenpos == null || vtx == null) {
                return; }
            screenpos[vtx][dim] = startpos[dim];
            };
        };

    // manipulate the screen points of the shape
    var manipulatePosition = function(shape, manipulate) {
        // apply the manipulation function
        manipulate(shape);
        };

    // return the current shape type
    var getActiveShapeType = function(data) {
        return data.settings.activeShapeType;
        };

    // set the current shape type (from shape select widget)
    var changeActiveShapeType = function(data) {
        data.settings.activeShapeType = data.measureWidgets.shape.val();
        };

    // set the current shape type
    var setActiveShapeType = function(data, shape) {
        data.settings.activeShapeType = shape.geometry.type;
        };

    // set the current unit (from unit select widget)
    var changeUnit = function(data, widget) {
        data[widget.name] = $(widget).find('option:selected').text();
        updateUnits(data);
        };

    // update Line Style classes (overwrite CSS)
    var updateLineStyles = function(data) {
        var s = data.settings;
        var DL = s.cssPrefix;
        var $lineStyles = s.$lineStyles;
        var style = s.styles;
        $lineStyles.html(
            '.'+CSS+'guide {stroke: '+style.guide.stroke+'} '+
            '.'+CSS+'constr {stroke: '+style.constr.stroke+'} '+
            '.'+CSS+'selected {stroke: '+style.selected.stroke+'} '+
            'div.'+DL+'digilib .'+DL+'svg-handle {stroke: '+style.handle.stroke+'}'
            );
        var widget = data.measureWidgets;
        var styleName = s.implementedStyles;
        var bg = 'background-color';
        var setColor = function(i, item) {
            widget[item+'color'].css(bg, style[item].stroke)
            };
        $.each(styleName, setColor);
    };

    // load shape types into select element
    var populateShapeSelect = function(data) {
        var $shape = data.measureWidgets.shape;
        var shapeInfo = data.settings.shapeInfo;
        var implementedShape = data.settings.implementedShapes;
        var addOption = function(index, type) {
            $shape.append($('<option value="'+ type + '">' + shapeInfo[type].name + '</option>'));
            };
        $.each(implementedShape, addOption);
        $shape.children()[0].selected = true;
    };

    // load units into select elements
    var populateUnitSelects = function(data) {
        var widgets = data.measureWidgets;
        var $u1 = widgets.unit1;
        var $u2 = widgets.unit2;
        var section = data.settings.units.sections;
        var addOptions = function(i, item) {
          var $opt = $('<option class="dl-section" disabled="disabled">'+ item.name +'</option>');
          $u1.append($opt);
          $u2.append($opt.clone());
          var unit = item.units;
          var addOption = function(i, item) {
            var $opt = $('<option class="dl-units" value="'+ item.factor + '">'+ item.name + '</option>');
            $opt.data('unit', item);
            $u1.append($opt);
            $u2.append($opt.clone());
            };
          $.each(unit, addOption);
          };
        $.each(section, addOptions);
        $u1.children(':not(:disabled)')[data.settings.unitFrom].selected = true;
        $u2.children(':not(:disabled)')[data.settings.unitTo].selected = true;
    };

    // show or hide SVG element (not possible via jQuery .hide/.show)
    var showSVG = function(data, on) {
        var layer = data.measureLayer;
        $svg = layer.$elem;
        if (on) {
            $svg.removeAttr("display"); }
        else {
            $svg.attr("display", "none"); }
    };

    // initial position of measure bar (bottom left of browser window)
    var setScreenPosition = function(data, $bar) {
        if ($bar == null) return;
        var barH = geom.rectangle($bar).height;
        var screenH = fn.getFullscreenRect(data).height;
        geom.position(10, screenH - barH).adjustDiv($bar);
    };

    // drag measureBar around
    var dragMeasureBar = function(event) {
        var $elem = $(this);
        $elem.addClass('dragging');
        var $div = $elem.parent();
        var x = $div.offset().left - event.pageX;
        var y = $div.offset().top - event.pageY;
        $(document.body).on('mousemove.measure', function(event) {
            $div.offset({
                left: event.pageX + x,
                top: event.pageY + y
            });
        }).on('mouseup.measure', function(event) {
            $(document.body).off('mousemove.measure').off('mouseup.measure');
            $elem.removeClass('dragging');
            });
        return false;
        };

    var createInfoDiv = function() {
        var options = { id: CSS+'info', 'class': 'dl-keep '+CSS+'info' };
        return $('<div>', options);
        };

    // show shape info
    var showInfoDiv = function(event, data, shape) {
        var settings = data.settings;

        var $info = settings.infoDiv;

        $info.fadeIn();

        $info.html(getInfoHTML(data, shape));
        $info.offset({
            left: event.pageX + 4,
            top: event.pageY + 4
            });
        return false;
        };

    // hide shape info
    var hideInfoDiv = function() {
        var $info = $('#'+CSS+'info');
        $info.fadeOut();
        };

    // remove selected shapes - or the most recent one, if none was selected
    var removeSelectedShapes = function(data) {
        var layer = data.measureLayer;
        var shapes = layer.shapes;
        if (shapes == null) return;
        var shapesDeleted = 0;
        for (var c = shapes.length; c > 0; --c) {
            var index = c-1;
            if (shapes[index].properties.selected) {
                shapesDeleted++;
                shapes.splice(index, 1);
                }
            }
        if (shapesDeleted === 0 && shapes.length > 0) {
            shapes.pop();
            shapesDeleted++;
            };
        layer.renderFn(data, layer);
        console.debug('measure: shapes deleted:', shapesDeleted);
        };

    // keydown event handler (active when measure bar is visible)
    var onKeyDown = function(event, data) {
        var code = event.keyCode;
        var key = event.key;
        // delete selected shapes
        if (code === 46 || key === 'Delete') {
            removeSelectedShapes(data);
            return false;
            }
        // manipulate current vertex position of shape
        if (code === 88 || key === 'x' ||
            code === 89 || key === 'y' ||
            code === 83 || key === 's') {
            if (keystate[key] == null) {
                // fire mousemove event with manipulated coords on keydown
                keystate[key] = event; // save key state
                if (currentShape == null) { return true };
                var props = currentShape.properties;
                var pt = props.screenpos[props.vtx]; // get vertex position
                var eventpos = { pageX: pt.x, pageY: pt.y };
                var evt = jQuery.Event("mousemove.dlVertexDrag", eventpos);
                $(document).trigger(evt);
                }
            return false;
            }
        };

    // keyup event handler (active when measure bar is visible)
    var onKeyUp = function(event, data) {
        var code = event.keyCode;
        var key = event.key;
        delete keystate[key]; // invalidate key state
        return false;
        };

    // attach/detach keyup/down event handlers
    var attachKeyHandlers = function(data, on) {
        if (on) {
            $(document.body).on('keydown.measure',
                function(evt) { onKeyDown(evt, data) });
            $(document.body).on('keyup.measure',
                function(evt) { onKeyUp(evt, data) });
            }
        else {
            $(document.body).off('keydown.measure');
            $(document.body).off('keyup.measure');
            }
        keystate = {};
        };

    // set up additional SVG shapes
    var setupSvgFactory = function(data) {
        var factory = data.shapeFactory;
        if (factory == null) {
            console.error("No SVG factory found: jquery.digilib.vector not loaded?");
            return;
            }
       // algorithm for polygon area: Math.abs(sumEdges(coords)/2);
       factory['Proportion'] = {
                setup: function (data, shape) {
                    shape.properties.maxvtx = 3;
                },
                svg: function (shape) {
                   var props = shape.properties;
                   var $s = factory['LineString'].svg(shape);
                    var lplace = $s.place;
                    $s.place = function () {
                      lplace.call($s)
                      var p = props.screenpos;
                      if (p.length > 2) { // p[2] is the mouse pointer
                        var len1 = p[1].distance(p[0]);
                        var len2 = p[1].distance(p[2]);
                        var ang1 = p[1].deg(p[0]);
                        var ang2 = p[1].deg(p[2]);
                        var ang = Math.abs(ang1 - ang2);
                        props.measures = {
                          len1: len1,
                          len2: len2,
                          rat: len1 / len2,
                          inv: len2 / len1,
                          ang: ang,
                          angx: ang1
                          };
                        }
                      };
                    return $s;
                }
            };
        factory['Intercolumnium'] = {
                'setup': function (data, shape) {
                    shape.properties.maxvtx = 3;
                },
                'svg': function (shape) {
                    var props = shape.properties;
                    var guideClass = CSS+'guide';
                    var $s = factory['LineString'].svg(shape);
                    shape.$interactor = $s;
                    var $c1 = $(fn.svgElement('circle', {'id': shape.id + '-circ1', 'class': guideClass }));
                    var $c2 = $(fn.svgElement('circle', {'id': shape.id + '-circ2', 'class': guideClass }));
                    var $g = $(fn.svgElement('g', {'id': shape.id + '-intercolumnium'}));
                    $g.append($s).append($c1).append($c2);
                    $g.place = function () {
                      $s.place(); // place the linestring
                      var p = props.screenpos;
                      if (p.length > 2) { // p[2] is the mouse pointer
                        var m1 = p[1].mid(p[2]);
                        var line = geom.line(m1, p[1]);
                        var m2 = p[0].copy().add(line.vector());
                        var rad = line.length();
                        $c1.attr({cx: m1.x, cy: m1.y, r: rad});
                        $c2.attr({cx: m2.x, cy: m2.y, r: rad});
                        var diam = rad * 2;
                        var inter = p[0].distance(p[1]);
                        props.measures = {
                          len1: diam,
                          len2: inter,
                          rat: diam / inter
                          };
                        }
                      };
                    return $g;
                }
            };
        factory['Rect'] = {
                setup: function (data, shape) {
                    shape.properties.maxvtx = 3;
                },
                svg: function (shape) {
                    var trafo = data.imgTrafo;
                    var $s = factory['Polygon'].svg(shape);
                    var props = shape.properties;
                    $s.place = function () {
                        var p = props.screenpos;
                        var vtx = props.vtx;
                        if (p.length > 2) { // p[2] is the mouse pointer
                            var line1 = geom.line(p[0], p[1]); // base line
                            var line2 = line1.parallel(p[2]);
                            var p3 = line1.perpendicular().intersection(line2);
                            var p2 = p3.copy().add(line1.vector());
                            p[2] = p2.mid(p3); // handle position
                            shape.geometry.coordinates[2] = trafo.invtransform(p[2]).toArray();
                            props.p2 = p2;
                            props.p3 = p3; // save other points
                            var len1 = line1.length();
                            var len2 = p[0].distance(p3);
                            var diag = p[0].distance(p2);
                            var ang = line1.deg();
                            props.measures = {
                              len1: len1,
                              len2: len2,
                              rat: len1 / len2,
                              diag: diag,
                              area: len1 * len2,
                              angx: ang
                            };
                            }
                        this.attr({points: [p[0], p[1], p2, p3].join(" ")});
                        };
                    return $s;
                }
            };
        factory['Oval'] = {
                setup: function (data, shape) {
                    shape.properties.maxvtx = 4;
                },
                svg: function (shape) {
                    var trafo = data.imgTrafo;
                    var styles = data.settings.styles;
                    var props = shape.properties;
                    var guideClass = CSS+'guide';
                    var shapeClass = CSS+'shape';
                    var constrClass = CSS+'constr';
                    props['stroke-width'] = styles.guide['stroke-width']; // draw a rectangle in guides style
                    var $s = factory['Rect'].svg(shape);
                    var sweep = sumEdges(rectifyCoords(shape, 1)) > 0 ? '1' : '0';
                    $s.attr({class: guideClass});
                    var $g = $(fn.svgElement('g', {'id': shape.id + '-oval'}));
                    var $c1 = $(fn.svgElement('circle', {id: shape.id + '-circ1', 'class': guideClass }));
                    var $c2 = $(fn.svgElement('circle', {id: shape.id + '-circ2', 'class': guideClass }));
                    var $p1 = $(fn.svgElement('path',   {id: shape.id + '-lines', 'class': guideClass }));
                    var $p2 = $(fn.svgElement('path',   {id: shape.id + '-constr', 'class': constrClass }));
                    props['stroke-width'] = styles.shape['stroke-width']; // draw the oval in shape style
                    var $arc = $(fn.svgElement('path',  fn.svgAttr(data, shape)));
                    $g.append($s).append($c1).append($c2).append($p1).append($p2).append($arc);
                    shape.$interactor = $arc;
                    $g.place = function () {
                        $s.place(); // place the framing rectangle (polygon)
                        var p = props.screenpos;
                        if (p.length > 3) { // p[3] is the mouse pointer
                            var side0 = geom.line(p[0], p[1]); // the sides
                            var side1 = geom.line(p[1], props.p2); // use 'Rect' points
                            var side2 = geom.line(props.p2, props.p3);
                            var side3 = geom.line(props.p3, p[0]);
                            var mid0 = side0.mid(); // the midpoints of the sides
                            var mid1 = side1.mid();
                            var mid2 = side2.mid();
                            var mid3 = side3.mid();
                            var axis1 = side0.parallel(mid3); // short axis
                            var axis2 = side1.parallel(mid0); // long axis
                            var maxDiam = axis1.length()-1; // maximal diameter for small circles
                            var handle = axis2.perpendicularPoint(p[3]); // drag point projected on long axis
                            if (handle.distance(mid0) > axis2.length()) { // constrain handle
                                handle.moveTo(mid2);
                            } else if (handle.distance(mid2) > maxDiam) {
                                handle.moveTo(geom.line(mid2, handle).length(maxDiam).point());
                                }
                            var m1 = handle.mid(mid2); // centers of the small circles
                            var m2 = axis1.mirror(m1);
                            var rad1 = m1.distance(mid2); // radius of the small circles
                            var rd1 = axis1.copy().length(rad1).point(); // point in radius distance from midpoint of long axis
                            var rd2 = axis2.mirror(rd1);
                            var md1 = rd1.mid(m1); // midpoint of the line connecting this point with the small circle center
                            var md2 = axis2.mirror(md1);
                            var md3 = axis1.mirror(md1);
                            var md4 = axis1.mirror(md2);
                            var bi = geom.line(rd1, m1).perpendicular(md1); // construct the perpendicular bisector of the connection line
                            var m3 = axis1.intersection(bi); // find the centers of the big circles
                            var m4 = axis2.mirror(m3);
                            var fp1 = geom.line(m3, m1).addEnd(rad1); // the four fitting points
                            var fp2 = geom.line(m3, m2).addEnd(rad1);
                            var fp3 = geom.line(m4, m1).addEnd(rad1);
                            var fp4 = geom.line(m4, m2).addEnd(rad1);
                            var rad2 = m3.distance(fp1); // radius of the big circles
                            // construct the SVG shapes
                            $c1.attr({cx: m1.x, cy: m1.y, r: rad1});
                            $c2.attr({cx: m2.x, cy: m2.y, r: rad1});
                            $p1.attr({d: // the guidelines
                                'M'+fp1+' L'+m3+' '+fp2+
                                'M'+fp3+' L'+m4+' '+fp4+
                                'M'+rd1+' L'+rd2+
                                'M'+m1+' L'+m2
                            });
                            $p2.attr({d: // the construction lines
                                'M'+mid3+' L'+rd1+' '+m1+' '+mid2+
                                'M'+mid1+' L'+rd2+' '+m2+' '+mid0+
                                'M'+md1+' L'+m3+
                                'M'+md4+' L'+m4
                            });
                            $arc.attr({d: 'M'+fp2+ // the arcs of the oval
                                ' A'+rad2+','+rad2+' 0 0,'+sweep+' '+fp1+
                                ' A'+rad1+','+rad1+' 0 0,'+sweep+' '+fp3+
                                ' A'+rad2+','+rad2+' 0 0,'+sweep+' '+fp4+
                                ' A'+rad1+','+rad1+' 0 0,'+sweep+' '+fp2
                            });
                            p[3] = handle;
                            shape.geometry.coordinates[3] = trafo.invtransform(handle).toArray();
                            var len1 = axis1.length();
                            var len2 = axis2.length();
                            props.measures = {
                              rad1: rad1,
                              rad2: rad2,
                              len1: len1,
                              len2: len2,
                              rat1: len1 / len2
                              // area: (r² * phi) + (R² * (pi - phi)) - ((axis1 - 2r) * dist(m3, mid(axis1)))
                              // length of the periphery parts: q1 = r * phi, q2 = R * (pi - phi) 
                              // circumference: 2 * (q1 + q2);
                              };
                            }
                        };
                    return $g;
                }
            };
        factory['EllipseArc'] = {
                setup: function (data, shape) {
                    shape.properties.maxvtx = 3;
                },
                svg: function (shape) {
                    var trafo = data.imgTrafo;
                    var styles = data.settings.styles;
                    var d = data.settings.editHandleSize/3;
                    var props = shape.properties;
                    var guideClass = CSS+'guide';
                    var handleClass = CSS+'handle';
                    var shapeClass = CSS+'shape';
                    props['stroke-width'] = styles.guide['stroke-width']; // draw a rectangle in guides style
                    var $s = factory['Rect'].svg(shape);
                    $s.attr({class: guideClass});
                    props['stroke-width'] = styles.shape['stroke-width']; // draw the ellipse in shape style
                    var $arc = $(fn.svgElement('path', fn.svgAttr(data, shape)));
                    var $p = $(fn.svgElement('path', {id: shape.id + '-constr', 'class': guideClass }));
                    var $c1 = $(fn.svgElement('circle', {id: shape.id + '-circ1', 'class': handleClass }));
                    var $c2 = $(fn.svgElement('circle', {id: shape.id + '-circ2', 'class': handleClass }));
                    var $g = $(fn.svgElement('g', {'id': shape.id + '-ellpisearc'}));
                    $g.append($s).append($arc).append($p).append($c1).append($c2);
                    shape.$interactor = $arc;
                    $g.place = function () {
                        $s.place(); // place the framing rectangle (polygon)
                        var p = props.screenpos;
                        if (p.length > 2) { // p[3] is the mouse pointer
                            var side0 = geom.line(p[0], p[1]); // the sides
                            var mid0 = side0.mid(); // the midpoints of the sides
                            var axis1 = geom.line(mid0, p[2]); // long axis
                            var axis2 = side0.parallel(p[2]); // short axis
                            var m = axis1.mid();
                            var rad1 = m.distance(mid0);
                            var rad2 = mid0.distance(p[0]);
                            var angle = axis1.deg();
                            var e = Math.sqrt(Math.abs(rad1*rad1 - rad2*rad2)); // distance of focus to m
                            if (rad1 > rad2) {
                              var f1 = geom.line(m, mid0).scale(e/rad1).point();
                              var f2 = geom.line(m, p[2]).scale(e/rad1).point();
                              $p.attr({d: // the construction lines
                                  'M'+mid0+' L'+f1+
                                  'M'+p[2]+' L'+f2
                              });
                              $c1.attr({cx: f1.x, cy: f1.y, r: d});
                              $c2.attr({cx: f2.x, cy: f2.y, r: d});
                            } else {
                              $p.attr({d: ''});
                              $c1.attr({r: 0});
                              $c2.attr({r: 0});
                            }
                            $arc.attr({d: 'M'+mid0+ // the definition point of the ellipse
                                ' A'+rad1+' '+rad2+' '+angle+' 1 1 '+p[2]+
                                ' A'+rad1+' '+rad2+' '+angle+' 1 1 '+mid0
                            });
                            var len1 = axis1.length();
                            var len2 = axis2.length();
                            props.measures = {
                              angx: angle,
                              len1: len1,
                              len2: len2,
                              rat1: len1 / len2,
                              dist: e * 2,
                              area: len1 * len2 * Math.PI
                              };
                            }
                        };
                    return $g;
                }
            };
        factory['Grid'] = {
                setup: function (data, shape) {
                    shape.properties.maxvtx = 2;
                },
                svg: function (shape) {
                    var $s = factory['Line'].svg(shape);
                    shape.$interactor = $s;
                    var gridID = shape.id + '-grid';
                    var props = shape.properties;
                    var $g = $(fn.svgElement('g', {id: shape.id + '-g'}));
                    var $defs = $(fn.svgElement('defs'));
                    var $pat = $(fn.svgElement('pattern', {id: gridID, height: '10%', width: '10%', patternUnits: 'objectBoundingBox'}));
                    var $path = $(fn.svgElement('path', {d: "M1000,0 L0,0 0,1000", fill: 'none', stroke: props.stroke, 'stroke-width': '1'}));
                    var $r = $(fn.svgElement('rect', {id: shape.id + '-rect', stroke: props.stroke, fill: 'url(#'+gridID+')'}));
                    $g.append($defs.append($pat.append($path))).append($r).append($s);
                    $g.place = function () {
                        $s.place();
                        var p = props.screenpos;
                        var d = p[0].distance(p[1]);
                        var angle = fn.cropFloat(p[0].deg(p[1]));
                        var scale = 10;
                        var fac = Math.ceil((1-scale)/2);
                        var x = p[0].x + fac * d;
                        var y = p[0].y + (fac-1) * d;
                        var transform = 'rotate('+angle+' '+p[0].x+' '+p[0].y+')';
                        $r.attr({x:x, y:y, height:d*scale, width:d*scale, transform:transform});
                        $pat.attr({patternTransform:transform});
                        props.measures = {
                          angx: angle,
                          len1: d,
                          area: d * d
                          };
                        };
                    return $g;
                }
            };
        };

    // add a style element to head, for changing line class styles
    var setupLineStyles = function(data) {
        var $head = $('head');
        var $lineStyles = $('<style></style>');
        $head.append($lineStyles);
        data.settings.$lineStyles = $lineStyles;
        updateLineStyles(data);
        var widget = data.measureWidgets;
        if ($.fn.colorPicker == null) {
            return; }
        var styleName = data.settings.implementedStyles;
        var style = data.settings.styles;
        var setupColorPicker = function(i, item) {
            var changeStroke = function(color) {
                style[item].stroke = color;
                updateLineStyles(data);
                };
            var w = widget[item+'color'];
            w.colorPicker({
                pickerDefault: style[item].stroke,
                onColorChange: changeStroke
                });
            };
        $.each(styleName, setupColorPicker);
        };

    var setupMeasureBar = function(data) {
        console.debug('measure: setupMeasureBar');
        var widgets = {
        names: [
          'about',
          'startb', 'shape',
          'type',
          'value1', 'unit1', 'eq',
          'value2', 'unit2',
          'angle',
          'shapecolor', 'guidecolor', 'constrcolor', 'selectedcolor', 'handlecolor',
          'move'
          ],
        about:         $('<img id="dl-measure-about" src="img/info.png" title="display info window for shapes"></img>'),
        startb:       $('<button id="dl-measure-startb" title="click to draw a measuring shape on top of the image">M</button>'),
        shape:        $('<select id="dl-measure-shape" title="select a shape to use for measuring" />'),
        eq:           $('<span class="dl-measure-label">=</span>'),
        type:         $('<span id="dl-measure-shapetype" class="dl-measure-label">measured</span>'),
        fac:          $('<span id="dl-measure-factor" class="dl-measure-number" />'),
        value1:       $('<input id="dl-measure-value1" class="dl-measure-input" title="last measured value - click to change the value" value="0.0" />'),
        value2:       $('<span id="dl-measure-value2" class="dl-measure-label" title="last measured value, converted to the secondary unit" value="0.0"/>'),
        unit1:        $('<select name="measureUnit1" id="dl-measure-unit1" title="current measuring unit - click to change" />'),
        unit2:        $('<select name="measureUnit2" id="dl-measure-unit2" title="secondary measuring unit - click to change" />'),
        angle:        $('<span id="dl-measure-angle" class="dl-measure-label" title="last measured angle" />'),
        shapecolor:   $('<span id="dl-measure-shapecolor" class="dl-measure-color" title="select line color for shapes"></span>'),
        guidecolor:   $('<span id="dl-measure-guidecolor" class="dl-measure-color" title="select guide line color for shapes"></span>'),
        constrcolor:  $('<span id="dl-measure-constrcolor" class="dl-measure-color" title="select construction line color for shapes"></span>'),
        selectedcolor:$('<span id="dl-measure-selectedcolor" class="dl-measure-color" title="select line color for selected shapes"></span>'),
        handlecolor:  $('<span id="dl-measure-handlecolor" class="dl-measure-color" title="select color for shape handles"></span>'),
        move:         $('<img id="dl-measure-move" src="img/move.png" title="move measuring bar around the screen"></img>')
		    };
        var $measureBar = $('<div id="dl-measure-toolbar" />');
        var widgetName = widgets.names;
        var appendWidget = function (i, item) {
            $measureBar.append(widgets[item]);
            };
        $.each(widgetName, appendWidget);
        data.$elem.append($measureBar);
        data.$measureBar = $measureBar;
        widgets.fac.text(fn.cropFloatStr(data.measureFactor));
        data.measureWidgets = widgets;
        populateShapeSelect(data);
        populateUnitSelects(data);
        setupMeasureWidgets(data);
        setupLineStyles(data);
        setScreenPosition(data, $measureBar);
        widgets.move.on('mousedown.measure', dragMeasureBar);
        return $measureBar;
        };

    // wire the draw button and widgets
    var setupMeasureWidgets = function (data) {
        console.debug('measure: setupMeasureWidgets');
        var widgets = data.measureWidgets;
        var $startb = widgets.startb;
        var buttonConfig = buttons['drawshape']; // not in data.settings.buttons
        // button properties
        var action = buttonConfig.onclick;
        var tooltip = buttonConfig.tooltip;
        $startb.attr('title', tooltip);
        $elem = data.$elem;
        $startb.on('mousedown.measure', function(evt) {
            // prevent mousedown event ot bubble up to measureBar (no dragging!)
            console.debug('measure: startb mousedown=', action, ' evt=', evt);
            $elem.digilib(action);
            return false;
            });
        widgets.shape.on('change.measure',  function(evt) { changeActiveShapeType(data) });
        widgets.value1.on('change.measure', function(evt) { changeFactor(data) });
        widgets.unit1.on('change.measure',  function(evt) { changeUnit(data, this) });
        widgets.unit2.on('change.measure',  function(evt) { changeUnit(data, this) });
        widgets.unit1.attr('tabindex', -1);
        widgets.unit2.attr('tabindex', -1);
        widgets.value1.attr('tabindex', -1);
        changeUnit(data, widgets.unit1[0]);
        changeUnit(data, widgets.unit2[0]);
        };

    // event handler for setup phase
    var handleSetup = function (evt) {
        console.debug("measure: handleSetup");
        var data = this;
        data.lastMeasuredValue = 0;
        data.lastMeasuredAngle = 0;
        data.measureFactor = 1.0,
        setupMeasureBar(data);
        setupSvgFactory(data);
        data.measureLayer = {
            'shapes': [],
            'projection': 'screen',
            'handleType': 'diamond'
            };
        digilib.actions.addVectorLayer(data, data.measureLayer);
        };

    // event handler for scaler update
    var handleUpdate = function (evt) {
        var data = this;
        console.debug("measure: handleUpdate");
    };

    // plugin installation called by digilib on plugin object
    var install = function (plugin) {
        digilib = plugin;
        if (digilib.plugins.vector == null) {
            console.error('measure: jquery.digilib.vector.js is missing, aborting installation.');
            return;
            }
        console.debug('installing measure plugin. digilib:', digilib);
        fn = digilib.fn;
        // import geometry classes
        geom = fn.geometry;
        // add defaults, actions, buttons
        $.extend(true, digilib.defaults, defaults);
        $.extend(digilib.actions, actions);
        $.extend(true, digilib.buttons, buttons);
        // insert in button list -- not elegant
        if (digilib.plugins.buttons != null) {
            // if (digilib.defaults.buttonSettings != null) {
            digilib.defaults.buttonSettings.fullscreen.standardSet.splice(10, 0, 'measure');
            }
        // export functions
        // fn.test = test;
        };

    // plugin initialization
    var init = function (data) {
        console.debug('initialising measure plugin. data:', data);
        var settings = data.settings;
        CSS = settings.cssPrefix+'measure-';
        FULL_AREA  = geom.rectangle(0, 0, 1, 1);
        // install event handlers
        var $data = $(data);
        $data.on('setup', handleSetup);
        $data.on('update', handleUpdate);
        $data.on('createShape', onCreateShape);
        $data.on('renderShape', onRenderShape);
        $data.on('changeShape', onChangeShape);
        $data.on('positionShape', onPositionShape);
        $data.on('dragShape', onDragShape);
        var $info = createInfoDiv();
        var timer;
        settings.infoDiv = $info;
        $info.appendTo(data.$elem)
            .on('mouseout.measureinfo', function() { timer = setTimeout(hideInfoDiv, 300) })
            .on('mouseover.measureinfo', function() { clearTimeout(timer) });
        };

    // plugin object with name and init
    // shared objects filled by digilib on registration
    var pluginProperties = {
            name: 'measure',
            install: install,
            init: init,
            buttons: {},
            actions: {},
            fn: {},
            plugins: {}
        };

    if ($.fn.digilib == null) {
        $.error("jquery.digilib.measure must be loaded after jquery.digilib!");
    } else {
        $.fn.digilib('plugin', pluginProperties);
    }
})(jQuery);
