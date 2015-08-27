function FilterVisTimeCategoryPoints(visType) {
    var width = 0;
    var height = 0
    var RELATIVE = 0.8;
    var BORDER = 3;
    var RIGHTSHIFT = 1;
    var COLUMNELEMENTSIZE = 10;
    var FIRST_ELEMENT = 0;
    var SECOND_ELEMENT = 1;
    var DIVIDER_HEIGHT = 6;
    var DIVIDER_WIDTH = 3;

    FilterVisTimeCategoryPoints.prototype.getPoints = function(data, category, antagonist, newheight, diff_x, linear, externalWidth, externalHeight){
        if(data.length === 0)
            return null;
        
        if(visType === 'minibarchart' && typeof category === 'string'  || visType === 'minitimeline' && isNumber(category))
            return null;
            
        var points = null;
        switch (visType){

            case('minibarchart'):
                width = category;
                height = antagonist;
                var array = calcRowColumnNew(data.length);
                var centre =  calcCentrePolygon(array, data.length);

                points =  mergeData(calcPointsFillPolygon(calcPointsStrokePolygon(centre), data, centre[FIRST_ELEMENT], centre[SECOND_ELEMENT]), data);
                break;

            case('minitimeline'):
                width = externalWidth;
                height = externalHeight;
                points = getData(data, category, antagonist, newheight,
                                diff_x, width - (width /7), linear);
                break;
        }
        return points;
    };

    /*
     *wrapps the functions for timeline data
     */
     function getData(data, category, antagonist, newheight, diff_x, sectionWidth, linear){
        var scale = getScale(data, category, antagonist, linear);
        var lines = generateLines(scale[SECOND_ELEMENT].length, newheight, diff_x, sectionWidth);
        var newSize = lines[SECOND_ELEMENT] * (scale[SECOND_ELEMENT].length + 1.5);
        var matrix = generateMatrix(data, scale, category, antagonist);
        var points = generatePoints(matrix, lines[FIRST_ELEMENT] , scale[FIRST_ELEMENT].length, category, antagonist, lines[SECOND_ELEMENT]);
        var dataSet =  {'scaleX': scale[FIRST_ELEMENT],'scaleY': scale[SECOND_ELEMENT],
            'lines': lines[FIRST_ELEMENT], 'strokepoints': points[SECOND_ELEMENT][FIRST_ELEMENT],
            'fillpoints': points[SECOND_ELEMENT][SECOND_ELEMENT] ,'matrix': matrix, 'newSize': newSize,
            'centrepoints': points[FIRST_ELEMENT]};
        return dataSet;
    }

    /*
     * generates the points needed for diamonds(one unit) or hexagon (more than one)
     * only used by timeline
     */
    function generatePoints(matrix, lines, divx, category, antagonist, maxSize){
        // min size and max size
        var width = lines[0][2] - lines[0][0];
        var elementwidthmax = width / (divx - 1);
        var elementheightmax = maxSize * 0.9;
        var centremax = generateCentrePoints(matrix, lines , elementwidthmax);
        if(elementwidthmax > 10){elementwidthmax = 8;} // select different width make dynamic
        var strokepoints = generatePathStrokePoints(matrix, centremax[FIRST_ELEMENT], elementwidthmax, elementheightmax, centremax[SECOND_ELEMENT]);
        var points = generatePathFillPoints(matrix, strokepoints, centremax[FIRST_ELEMENT], category, antagonist);
        return [centremax, points];
    }

    /*
     * test the correct input from facet year
     *
     * only used by timeline
     *
     */
    function publishedYear(year){
        var test = year;
        var possibleYear = test.split(/[^\d]/).filter(function(n){if((n >=-9999)&& (n<=9999))return n;});
        if(possibleYear.length === 0 ){
            !('unkown'.localeCompare(test)) ? test = new Date().getFullYear().toString()
                       : test = test.slice(0, 4);
        } else {
            test = possibleYear[0].toString();
        }
        return test;
    }

    /*
     * generate the differnet fills depending on opposite axis (provider vs. language and vica versa)
     * only used by timeline
     *
     */
    function generatePathFillPoints(matrix, strokepoints, centre, category, antagonist) {
        var fillpoint = [];
        var strokepoint = [];
        var insert;
        strokepoints.forEach(function (d, i) {
            var x = centre[i][2], y = centre[i][3];
            var year = matrix[x][y][0].facets.year;
            year = publishedYear(year);
            if (matrix[x][y].length === 1) {
                insert = stringifyData(d);
                strokepoint.push([insert, year]);
                fillpoint.push([insert, matrix[x][y][0].facets[category],
                    matrix[x][y][0].facets[antagonist], year]);
            } else if (matrix[x][y].length > 1) {
                insert = stringifyData(d);
                strokepoint.push([insert, year]);
                var insertFill = countDiffCategory(matrix[x][y], antagonist);
                if (Object.keys(insertFill).length === 1) {
                    fillpoint.push([insert, matrix[x][y][0].facets[category],
                        matrix[x][y][0].facets[antagonist], year]);
                } else {
                    var fillpoints = calcDiffernetFillsHorizontal(fillpoint, insertFill, d, matrix[x][y].length);
                    var color = Object.keys(insertFill);
                    var count = 0;
                    var j = i;
                    fillpoints.forEach(function (d, i) {
                        var string = "M ";
                        for (i = 0; i < d.length; i++) {
                            var first = d[i].x.toString();
                            var second = d[i].y.toString();
                            var insert = " ";
                            insert = " " + first + " , " + second;
                            string = string.concat(insert);
                        }
                        string = string.concat(' z');
                        fillpoint.push([string, matrix[x][y][0].facets[category],
                            color[count], year]);
                        count++;
                    });
                }
            }
        });
        return [strokepoint, fillpoint];
    }

    /*
     * needed to count the differnet kind of categories
     *
     * only used by timeline
     */
    function countDiffCategory(data, antagonist) {
        var dataSet = {};
        data.forEach(function (d, i) {
            var facet = dataSet[d.facets[antagonist]];
            if (facet === undefined) {
                dataSet[d.facets[antagonist]] = 1;
            } else {
                dataSet[d.facets[antagonist]]++;
            }
        });
        return dataSet;
    };

    /*
     * depending on number of elements generates differnet paths
     *
     * imaging that is the form and the points of a hexagon
     *    b ______c 
     *   /         \   
     * a             d
     *   \         /
     *    f ______ e
     * only used by timeline
     */
    function calcDiffernetFillsHorizontal(fillpoint, insertFill, coordinates, length) {
        var start = coordinates.f.y, mark1 = coordinates.a.y, end = coordinates.b.y;
        var points = [];
        var a, b, c, d, e, f = {};
        var xpoints = calcPointsOnAxis(start, end, insertFill, length);
        var intersect;
        xpoints.forEach(function (point, i) {
            var insert = [];
            var pointonAxis = xpoints[i];
            if (i === (xpoints.length - 1)) { pointonAxis = end; }
            var x = points[points.length - 1];
            if (pointonAxis < start && pointonAxis >= mark1) {//start is start or between f and a and  end is between e and f
                if (points.length === 0) {
                    a = { 'x': coordinates.f.x, 'y': coordinates.f.y };
                    insert.push(a);
                    b = { 'x': coordinates.e.x, 'y': coordinates.e.y };
                } else {
                    c = { 'x': x[1].x, 'y': x[1].y };
                    insert.push(c);
                    d = { 'x': x[2].x, 'y': x[2].y };
                }
                intersect = intersection(coordinates.f.x, coordinates.f.y,
                    coordinates['a']['x'], coordinates['a']['y'],
                    coordinates['a']['x'], pointonAxis,
                    coordinates['d']['x'], pointonAxis);
                a = { 'x': intersect[0], 'y': pointonAxis };
                insert.push(a);
                intersect = intersection(coordinates['d']['x'], coordinates['d']['y'],
                    coordinates['e']['x'], coordinates['e']['y'],
                    coordinates['a']['x'], pointonAxis,
                    coordinates['d']['x'], pointonAxis);
                e = { 'x': intersect[0], 'y': pointonAxis };
                insert.push(e);
                if (points.length === 0) {
                    insert.push(b);
                } else {
                    insert.push(d);
                }
            } else if (pointonAxis < mark1 && pointonAxis > end) {
                if (points.length === 0) { // start is startpoint and end is between a and b X
                    a = { 'x': coordinates['f']['x'], 'y': coordinates['f']['y'] };
                    insert.push(a);
                    b = { 'x': coordinates['a']['x'], 'y': coordinates['a']['y'] };
                    insert.push(b);
                    intersect = intersection(coordinates['a']['x'], coordinates['a']['y'],
                        coordinates['b']['x'], coordinates['b']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                    d = { 'x': intersect[0], 'y': pointonAxis };
                    insert.push(d);
                    intersect = intersection(coordinates['c']['x'], coordinates['c']['y'],
                        coordinates['d']['x'], coordinates['d']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                    e = { 'x': intersect[0], 'y': pointonAxis };
                    insert.push(e);
                    c = { 'x': coordinates['d']['x'], 'y': coordinates['d']['y'] };
                    insert.push(c);
                    f = { 'x': coordinates['e']['x'], 'y': coordinates['e']['y'] };
                    insert.push(f);

                } else if ((x[1] !== undefined) && x.length === 4 &&
                    x[1]['y'] < start && x[1]['y'] >= mark1) { // start (4 and 6) is between f and a and end is between a and b
                    b = { 'x': x[1]['x'], 'y': x[1]['y'] };
                    insert.push(b);
                    c = { 'x': coordinates['a']['x'], 'y': coordinates['a']['y'] };
                    insert.push(c);
                    intersect = intersection(coordinates['a']['x'], coordinates['a']['y'],
                        coordinates['b']['x'], coordinates['b']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                    d = { 'x': intersect[0], 'y': pointonAxis };
                    insert.push(d);
                    intersect = intersection(coordinates['c']['x'], coordinates['c']['y'],
                        coordinates['d']['x'], coordinates['d']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                    e = { 'x': intersect[0], 'y': pointonAxis };
                    insert.push(e);
                    c = { 'x': coordinates['d']['x'], 'y': coordinates['d']['y'] };
                    insert.push(c);
                    f = { 'x': x[2]['x'], 'y': x[2]['y'] };
                    insert.push(f);
                } else if (x.length !== undefined &&
                    (x.length === 6 ? (x[2]['y'] < mark1 && x[2]['y'] < end) :
                        (x[1]['y'] < mark1 && x[1]['y'] < end))) { // start ( 4 or 6 coord)is between a and b and end is between a and b
                    intersect = intersection(coordinates['a']['x'], coordinates['a']['y'],
                        coordinates['b']['x'], coordinates['b']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                    d = { 'x': intersect[0], 'y': pointonAxis };
                    intersect = intersection(coordinates['c']['x'], coordinates['c']['y'],
                        coordinates['d']['x'], coordinates['d']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                } else {
                    ((x.length === 6) ? (b = { 'x': x[2]['x'], 'y': x[2]['y'] }, insert.push(b))
                        : (b = { 'x': x[1]['x'], 'y': x[1]['y'] }, insert.push(b)));
                    intersect = intersection(coordinates['a']['x'], coordinates['a']['y'],
                        coordinates['b']['x'], coordinates['b']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                    d = { 'x': intersect[0], 'y': pointonAxis };
                    insert.push(d);
                    intersect = intersection(coordinates['c']['x'], coordinates['c']['y'],
                        coordinates['d']['x'], coordinates['d']['y'],
                        coordinates['a']['x'], pointonAxis,
                        coordinates['d']['x'], pointonAxis);
                    d = { 'x': intersect[0], 'y': pointonAxis };
                    insert.push(d);
                    ((x.length === 6) ? (e = { 'x': x[3]['x'], 'y': x[3]['y'] }, insert.push(e))
                        : (e = { 'x': x[2]['x'], 'y': x[2]['y'] }, insert.push(e)));
                }
            } else if (pointonAxis >= end) {// last point is end or bigger needed for float compare
                var t = 0;
                x.length === 4 ? t = 1 : t = 2;
                b = { 'x': x[t]['x'], 'y': x[t]['y'] };
                insert.push(b);
                x.length === 6 ? t : (c = { 'x': coordinates['a']['x'], 'y': coordinates['a']['y'] },
                    insert.push(c));
                c = { 'x': coordinates['b']['x'], 'y': coordinates['b']['y'] };
                insert.push(c);
                d = { 'x': coordinates['c']['x'], 'y': coordinates['c']['y'] };
                insert.push(d);
                x.length === 6 ? t : (f = { 'x': coordinates['d']['x'], 'y': coordinates['d']['y'] },
                    insert.push(f));
                x.length === 4 ? t = 2 : t = 3;
                e = { 'x': x[t]['x'], 'y': x[t]['y'] };
                insert.push(e);
            }
            else {
                console.log("out of everthing");
            }
            points.push(insert);
        });
        return points;
    }

    /*
     * can used for both axis
     * calculates the points on the x or y axis of an hexagon to get the coordinates for different fill
     *
     * only used by timeline
     *
     */
    function calcPointsOnAxis(start, end, insertFill, length) {
        var points = [];
        var size = (end - start) / length;
        var keys = Object.keys(insertFill);
        for (var i = 0; i < keys.length; i++) {
            var x = insertFill[keys[i]];
            if (points.length === 0) {
                points.push(start + (size * x));
            } else {
                points.push(points[points.length - 1] + (size * x));
            }
        }
        return points;
    }

    /*
     * calcs the centre point of every node
     * centre points and coordiantes of matrix are needed to count element
     *
     * only used by timeline
     */
    function generateCentrePoints(matrix, lines, elementwidthmax) {
        var centre = [];
        var linepoints = lines;//.reverse();
        var start = linepoints[0][0];
        var max = 0;
        for (var i = 0; i < matrix.length; i++) {
            for (var j = 0; j < matrix[i].length; j++) {
                if (matrix[i][j].length > 0) {
                    centre.push([(start + ((elementwidthmax * j))), linepoints[i][1], i, j, publishedYear(matrix[i][j][0].facets.year)]);
                    if (matrix[i][j].length > max) {
                        max = matrix[i][j].length;
                    }
                }
            }
        }
        return [centre, max];
    }

    /*
     * generates the points for Stroke
     *
     * imaging that is the form and the points of a hexagon
     *    b ______c 
     *   /         \   
     * a             d
     *   \         /
     *    f ______ e
     * only used by timeline
     */
    function generatePathStrokePoints(matrix, centre, elementwidthmax, elementheightmax, max) {
        var point = [];
        centre.forEach(function (param, i) {
            var x = param[2], y = param[3];
            var numberElements = matrix[x][y].length;//count elements at matrix
            var insert = {};
            var a, b, c, d, e, f = {};
            var first = param[FIRST_ELEMENT];
            var second = param[SECOND_ELEMENT];
            if (numberElements === (null || undefined)) {
                console.log("coordinates are not correct");
            } else if (numberElements === 1 && elementwidthmax > 2) {// TODO:: check with testpersons for correct size
                var length = elementwidthmax / 2;
                a = { 'x': first - length, 'y': second };
                b = { 'x': first, 'y': second - length };
                c = { 'x': first + length, 'y': second };
                d = { 'x': first, 'y': second + length };
                insert = { 'a': a, 'b': b, 'c': c, 'd': d };
            } else /* if(numberElements >= 2)*/ { // the next two lines arranges the size of the kumulative elements
                var elemhalfwidth = (elementwidthmax / 3) + (((elementwidthmax / 5) / max) * numberElements);
                var elemhaltheight = (elementheightmax / 12) + (((elementheightmax / 3) / max) * numberElements);// calculates the size of the cumulativ elements and as exeption if elementwitdh is too small
                var hor = elemhalfwidth * RELATIVE;
                a = { 'x': first - elemhalfwidth, 'y': second };
                b = { 'x': first - hor, 'y': second - elemhaltheight };
                c = { 'x': first + hor, 'y': second - elemhaltheight };
                d = { 'x': first + elemhalfwidth, 'y': second };
                e = { 'x': first + hor, 'y': second + elemhaltheight };
                f = { 'x': first - hor, 'y': second + elemhaltheight };
                insert = { 'a': a, 'b': b, 'c': c, 'd': d, 'e': e, 'f': f };
            }
            point.push(insert);
        });
        return point;
    }

    /*
     * generates the lines where polygons get labeled
     *
     * only used by timeline
     */
    function generateLines(length, start, divwidth, sectionWidth) {
        var elementsize = height / 5;
        var linecoord = [];
        var size = 0;
        for (var i = 0; i <= length; i++) {
            size += elementsize;
            linecoord.push([divwidth, size, sectionWidth, size]);
        }
        return [linecoord, elementsize];
    }

    /*
     * generate a matrix with x is year and y (language , provider) for later draw
     * simple counts the elements
     * maybe a list is a better solution check for runtime
     *
     * only used by timeline
     */
    function generateMatrix(data, interimSolution, category, antagonist) {

        var abscissa = [];
        for (var i = 0; i < interimSolution[SECOND_ELEMENT].length; i++) {
            abscissa[i] = [];
            for (var j = 0; j < interimSolution[FIRST_ELEMENT].length; j++) {// create matrix to count same elements
                abscissa[i][j] = [];
            }
        }
        data.forEach(function (d, i) {
            var x = 0, y = 0;//
            var selectedCategory = d.facets[category];
            y = interimSolution[SECOND_ELEMENT].indexOf(selectedCategory);
            var year = d.facets["year"];
            year = publishedYear(year);

            x = interimSolution[FIRST_ELEMENT].indexOf(year);
            abscissa[y][x].push(d); //insert the correct dataset for later drawing
        });
        return abscissa;
    }

    /*
     * needed for nonlinear, linear and pseudolinear  representation of dataSets
     * thats not a clean solution
     *
     * only used by timeline
     */
    function getScale(data, category, antagonist, linear) {
        var array = [];
        var array_1 = [];
        data.forEach(function (d, i) {
            var selectedCategory = d.facets[category];
            if (selectedCategory !== undefined) {
                array_1.push(selectedCategory);
            } else {  // handle undefined datasets Problem for correct representation of data
                array_1.push("unkn");
            }
            var year = d.facets["year"];
            year = publishedYear(year);
            array.push(year);
        });
        var array_category = array_1.filter(function (itm, i, a) {
            return i === a.indexOf(itm);
        });
        var array_year = array.filter(function (itm, i, a) {
            return i === a.indexOf(itm);
        });
        array_year.sort();// TODO: after sorting developer can decide if they will choose pseudolinear, nonlinear, linear, diff = max - min
        if (linear === true) {
            var array_new = [];
            var start = d3.min(array);
            var end = d3.max(array);// end - start > 100 && elementsize < 3
            end - start > 100 ? array_new = pseudolinearicInsertion(array_year) : array_new = linearFill(start, end); // a better solution will be to check elementsize
        }
        return [(linear ? array_new : array_year), array_category];
    }

    function linearFill(start, end) {
        var array = [];
        for (var i = start; i <= end; i++) {
            array.push(i.toString());
        }
        return array;
    }

    /*
     * generates placeholder to simulate linaer gaps between the detected years
     * make it static 10 years one placeholder, 20 years  two placeholder etc.
     * fill with divided values
     *
     * only used by timeline
     */
    function pseudolinearicInsertion(array) {
        var start = 0;
        var length = array.length - 1;
        for (var i = 0; i < length; i++) {
            var first = array[start + 1];
            var second = array[start];
            if ((!isNumber(first)) || !(isNumber(second))) {
                console.log(" Wrong values, please clean your dataset");
            } else {
                var diff = first - second;
                if (diff > 50) {
                    insertValue(array, start + 1, 6, first, second);
                    start += 7;
                } else if (diff < 50 && diff >= 40) {
                    insertValue(array, start + 1, 5, first, second);
                    start += 6;
                } else if (diff < 40 && diff >= 30) {
                    insertValue(array, start + 1, 4, first, second);
                    start += 5;
                } else if (diff < 30 && diff >= 20) {
                    insertValue(array, start + 1, 3, first, second);
                    start += 4;
                } else if (diff < 20 && diff >= 10) {
                    insertValue(array, start + 1, 2, first, second);
                    start += 3;
                } else if (diff < 10 && diff > 1) {
                    insertValue(array, start + 1, 1, first, second);
                    start += 2;
                }
                else {
                    start++;
                }
            }
        }
        return array;
    }

    /*
     * http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
     * answer by CMS  Christian C. Salvadó
     */
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    /*
     * inserts iterative correct values  for later visualization on timeline
     *
     * only used by timeline
     */
    function insertValue(array, start, count, first, second) {
        var helper = parseInt((first - second) / (count + 1));
        for (var i = 0; i < count; i++) {
            array.splice(start + i, 0, (parseInt(second) + ((helper) * (i + 1))).toString());
        }
    };

    /*
     * calcs depending on datalength the column and rows for barchart
     *
     * only used by barchart
     */
    function calcRowColumnNew(dataLength) {
        var length = dataLength;
        var column = 1, row = 1;
        var array = [];
        if (length === 1) {
            array.push(column);
            array.push(row);
            return array;
        } else if (length > 1 && length < 6) {
            column = 2;
            array.push(column);
            array.push(dataLength + 1);
        } else {
            column = 3;
            array.push(column);
            var rows = dataLength / column;
            Number.isInteger(rows) ? rows = ((rows * 2) + 1) : rows = Math.ceil(rows) * 2;
            array.push(rows);
        }
        return array;
    };


    /*
     * experimental function to display all the beechart information if size(width/height) is fixed
     * used for portation to pluginhandler
     *
     * only used by barchart
     */
    function calcRowColumn(dataLength) {
        var length = dataLength;
        var column = 1, row = 1;
        var array = [];
        if (length === 1) {
            array.push(column);
            array.push(row);
            return array;
        }
        else {
            // range
            var start = 2, end = 0;
            while (true) {
                // very important this number should calculated by the relation between witdh and height
                end = start * BORDER; // change to 6
                column++;
                if (length <= end) {
                    break;
                }
                else {
                    start = end + 1;
                }
            }
            var rowtoCount = Math.round((start / column) * 2) + (column - 1);
            var step = column - 1;
            for (var count = 1; count <= length - start; count++) {
                if ((count % step)) {
                }
                else {
                    rowtoCount++;
                }
            }
            row = rowtoCount;
        }
        array.push(column);
        array.push(row);
        return array;
    }

    /*
     * checks if number is integer
     * https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
     * Zuletzt aktualisiert von: SphinxKnight, 09.06.2015 12:05:35
     * © 2005-2015 Mozilla Developer Network und individuelle Mitwirkende
     *  Inhalt steht unter diesen Lizenzen · Über MDN · Nutzungsbedingungen · Datenschutz ·
     * beginn
     */
    Number.isInteger = Number.isInteger || function(value) {
        return typeof value === "number" &&
           isFinite(value) &&
           Math.floor(value) === value;
    };

    /*
     * calcs the centrepoints of the hexagons, needed for labeling of shapes
     *
     * only used by barchart
     */
    function calcCentrePolygon(size, length) {
        var centre = [];
        var result = [], x = [], y = [];
        var column = size[FIRST_ELEMENT], row = size[SECOND_ELEMENT];
        // to fill the svg elment
        var multisize = length / column;
        if (Number.isInteger(multisize)) {
            multisize = multisize + 0.5;
        } else {
            multisize = Math.ceil(multisize);
        }
        var elementwidth = (width / DIVIDER_WIDTH);
        var elementheight = height / DIVIDER_HEIGHT;
        height = elementheight * multisize;
        if (length === 1) {
            x.push(elementwidth / 2);
            y.push(height / 2);
        }
        else {
            y.push(elementheight / 2 + 1);
            if (length < COLUMNELEMENTSIZE) {
                x.push(elementwidth * 1.2 / (column - 1));
            }
            else {
                //start point for first element
                x.push((elementwidth) / (column - 1));
            }
            // keep in mind 0.8 is var of elementsize
            var polyhexwidth = elementwidth * 0.9;
            for (var i = 0; i < Math.max(column, row) - 2; i++) {
                if (i < column - 1) {
                    x.push(x[i] + polyhexwidth);
                }
                if (i < row) {
                    y.push(y[i] + elementheight / 2);
                }
            }
        }

        centre = writeCentrePoints(x, y, length);
        result.push(elementwidth);
        result.push(elementheight);
        result.push(centre);
        return result;
    }

    /*
     * calc the stroke points for the hexagon, depending on centre points
     *
     * imaging that is the form and the varibales from the hexagon
     *    b ______c 
     *   /         \   
     * a             d
     *   \         /
     *    f ______ e
     * only used by barchart
     */
    function calcPointsStrokePolygon(centre) {
        var points = centre[2];
        var order = [];
        var elemhalfwidth = centre[FIRST_ELEMENT] / 2;
        var elemhaltheight = centre[SECOND_ELEMENT] / 2;
        var hor = elemhalfwidth * RELATIVE;

        for (var i = 0; i < points.length; i++) {
            var a, b, c, d, e, f = {};
            var entry = points[i];;
            var result = [];
            result.push(entry);
            a = { 'x': entry.x - elemhalfwidth + RIGHTSHIFT, 'y': entry.y };
            b = { 'x': entry.x - hor + RIGHTSHIFT, 'y': entry.y - elemhaltheight };
            c = { 'x': entry.x + hor + RIGHTSHIFT, 'y': entry.y - elemhaltheight };
            d = { 'x': entry.x + elemhalfwidth + RIGHTSHIFT, 'y': entry.y };
            e = { 'x': entry.x + hor + RIGHTSHIFT, 'y': entry.y + elemhaltheight };
            f = { 'x': entry.x - hor + RIGHTSHIFT, 'y': entry.y + elemhaltheight };
            var point = { 'a': a, 'b': b, 'c': c, 'd': d, 'e': e, 'f': f };
            result.push(point);
            order.push(result);
        }
        return order;
    }

    /*
     *  depending on the fill shape and the cumulative number of the choosen category,
     *  this function calcs the path for the correct stroke height
     *
     * imaging that is the from and the points from the hexagon
     *    b ______c 
     *   /         \   
     * a             d
     *   \         /
     *    f ______ e
     *  only used by barchart
     */
     function calcPointsFillPolygon(allPoints, inputData, elementWidth, elementHalfHeight) {
         var max = 0;
         var points = allPoints;
         var length = inputData.length;
         var scale, x_y;

         for (var d = 0; d < length; d++) {
             if (max < inputData[d].count) {
                 max = inputData[d].count;
             }
         }
         var insert = [];
         points.forEach(function (point, i) {
             if (inputData[i] === undefined) {

             } else {
                 var relativeToMax = inputData[i].count / max;

                 var input = points[i][SECOND_ELEMENT];
                 var a, b, c, d, e, f = {};

                 if (relativeToMax === 1) {
                     insert.push(input);
                 } //  break;
                 else if ((relativeToMax > 0.5) && (relativeToMax < 1)) {
                     a = input.a;
                     d = input.d;
                     e = input.e;
                     f = input.f;
                     scale = (elementHalfHeight) * (relativeToMax - 0.5);
                     x_y = intersection(input.a.x, input.a.y,
                         input.b.x, input.b.y,
                         input.a.x, input.d.y - scale,
                         input.d.x, input.d.y - scale);
                     b = { 'x': x_y[FIRST_ELEMENT], 'y': x_y[SECOND_ELEMENT] };
                     x_y = intersection(input.c.x, input.c.y,
                         input.d.x, input.d.y,
                         input.a.x, input.d.y - scale,
                         input.d.x, input.d.y - scale);
                     c = { 'x': x_y[FIRST_ELEMENT], 'y': x_y[SECOND_ELEMENT] };
                     var point_1 = { 'a': a, 'b': b, 'c': c, 'd': d, 'e': e, 'f': f };
                     insert.push(point_1);
                 }
                 else if (relativeToMax === 0.5) {
                     a = input.a;
                     d = input.d;
                     e = { 'x': input.e.x, 'y': input.e.y };
                     f = input.f;
                     var point_2 = { 'a': a, 'd': d, 'e': e, 'f': f };
                     insert.push(point_2);
                 }
                 else if ((relativeToMax < 0.5) && (relativeToMax > 0)) {
                     scale = elementHalfHeight * relativeToMax;
                     x_y = intersection(input.a.x, input.a.y,
                         input.f.x, input.f.y,
                         0, input.f.y - scale,
                         input.d.x, input.f.y - scale);
                     a = { 'x': x_y[FIRST_ELEMENT], 'y': x_y[SECOND_ELEMENT] };
                     x_y = intersection(input.d.x, input.d.y,
                         input.e.x, input.e.y,
                         0, input.e.y - scale,
                         input.d.x, input.e.y - scale);
                     d = { 'x': x_y[FIRST_ELEMENT], 'y': x_y[SECOND_ELEMENT] };
                     e = { 'x': input.e.x, 'y': input.e.y };
                     f = input.f;
                     var point_3 = { 'a': a, 'd': d, 'e': e, 'f': f };
                     insert.push(point_3);
                 }
             }
         });
         return [points, insert];
     };

    /*
     * helper function to generate a path string from integer input
     *
     */
    function stringifyData(obj) {
        var data = obj;
        var keys = Object.keys(data);
        var string = "M ";
        for (var i = 0; i < keys.length; i++) {
            var x = data[keys[i]].x.toString();
            var y = data[keys[i]].y.toString();
            var insert = " ";
            insert = " " + x + " , " + y;
            string = string.concat(insert);
        }
        return string = string.concat(' z');
    };

    /*
     * helper function to generate needed dictionary
     *
     * only used by barchart
     */
    function mergeData(points, inputData){
        var points_m = [];
        var points_stroke = [];
        var points_fill = [];
        for(var i = 0;i < inputData.length;i++){
            points_m.push(points[FIRST_ELEMENT][i][FIRST_ELEMENT]);
            points_stroke.push(stringifyData(points[FIRST_ELEMENT][i][SECOND_ELEMENT]));
            points_fill.push(stringifyData(points[SECOND_ELEMENT][i]));
        }
        var data = {'points_m': points_m,'points_stroke': points_stroke,
                    'points_fill': points_fill,'meta': inputData,
                    'height': height};
        return data;
    };

    /*
     * for correct centrepoint of hexagon alternate horicontale and vertical lines
     * were needed
     *
     * only used by barchart
     */
    function writeCentrePoints(x, y, length) {
        var centre = [];
        for (var i = 0; i < y.length; i = i + 2) {
            for (var j = 0; j < x.length; j++) {
                var point_up, point_down = {};
                if ((j % 2)) {
                    point_up = { 'x': x[j], 'y': y[i + 1] };
                    centre.push(point_up);
                }
                else {
                    point_down = { 'x': x[j], 'y': y[i] };
                    centre.push(point_down);
                }
            }
        }
        if (centre.length > length) {
            centre.splice(centre.length - 1, centre.length - length);
        }
        return centre;
    };

    /*
     * helper function intersection
     */
    function intersection(x_1, y_1, x_2, y_2, x_3, y_3, x_4, y_4) {
        var d = (y_4 - y_3) * (x_2 - x_1) - (y_2 - y_1) * (x_4 - x_3);
        var x = ((x_4 - x_3) * (x_2 * y_1 - x_1 * y_2) - (x_2 - x_1) * (x_4 * y_3 - x_3 * y_4)) / d;
        var y = ((y_1 - y_2) * (x_4 * y_3 - x_3 * y_4) - (y_3 - y_4) * (x_2 * y_1 - x_1 * y_2)) / d;
        return [x, y];
    };

  }
