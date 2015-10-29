
/**
 * parsing functions
 * 
 * */	
	
function parseDate( dateString ){

    if(dateString instanceof Date)
        return dateString;

	yearFormat = d3.time.format("%Y");
	var date = yearFormat.parse(dateString);
	
	if(date != null) return date;
	
	dateFormat = d3.time.format("%Y-%m");
	date = dateFormat.parse(dateString);
	
	if(date != null) return date;
	
	if( dateString.length == 8 )
		date = yearFormat.parse( dateString.substring(0, 4) );
	
	if(date != null) return date;
	
	if(dateString.contains("c "))
		date = yearFormat.parse( dateString.substring(2, 6) );
	
	if(date != null) return date;	
	return yearFormat.parse('2014');
}
	
	
	
function toYear(date){
		
	formatYear = d3.time.format("%Y");				
	var year = formatYear(date);
	//if(year != null)
		return year;
	//return "0";
}
	
	
	
/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Array prototype
 * 
 * */	
	

Array.prototype.getIndexOf = function(target, field) {

	var array = this;
		
	for(var i = 0; i < array.length; i++) {
		if(array[i][field] === target)
			return i;
	}
	return -1;		
};



Array.prototype.swap = function(a, b){
	var tmp = this[a];
	this[a] = this[b];
	this[b] = tmp;
};
	
	
Array.prototype.equals = function( array2 ){
	
	if( typeof array2 === 'undefined' || array2 === 'undefined' || array2.length === 0 )
		return false;		
		
	var array1 = this;
		
	for(var i = 0; i < array1.length; i++){
		var j = 0;
		while( array1[i]['originalIndex'] !== array2[j]['originalIndex'] )
			j++;
		
		if( array1[i]['rankingPos'] !== array2[j]['rankingPos'] )
			return false;
	}
	return true;	
}


	
/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * String prototype
 * 
 * */	
		
String.prototype.contains = function(it) { 
	return this.indexOf(it) != -1; 
};
	
	
String.prototype.toBool = function() {
    return (this == "true");
};
	
/////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * jQuery functions (for DOM elements)
 * 
 * */	
	

$.fn.outerHTML = function() {
    return $(this).clone().wrap('<div></div>').parent().html();
 };




$.fn.scrollTo = function( target, options, callback ){

	if(typeof options == 'function' && arguments.length == 2){ 
		callback = options; 
		options = target; 
	}
	  
	var settings = 
		$.extend({
			scrollTarget  : target,
			offsetTop     : 50,
			duration      : 500,
			easing        : 'swing'
		}, options);
	  
	return this.each(function(){
		var scrollPane = $(this);
		
		var scrollTarget;
		if( typeof settings.scrollTarget == "number" ){
			scrollTarget = settings.scrollTarget;
		}
		else{ 
			if( settings.scrollTarget == "top" ){
				scrollTarget = 0;
			}
			else{
				scrollTarget = $(settings.scrollTarget);
				if (scrollTarget.length == 0)
					scrollTarget = 0;
			}
		}
			
		//var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
		var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - parseInt(settings.offsetTop);
			
		scrollPane.animate({scrollTop : scrollY }, parseInt(settings.duration), settings.easing, function(){
			if (typeof callback == 'function') { callback.call(this); }
		});
	});
};




/*!
 * jQuery scrollintoview() plugin and :scrollable selector filter
 *
 * Version 1.8 (14 Jul 2011)
 * Requires jQuery 1.4 or newer
 *
 * Copyright (c) 2011 Robert Koritnik
 * Licensed under the terms of the MIT license
 * http://www.opensource.org/licenses/mit-license.php
 */

(function ($) {
	var converter = {
		vertical: { x: false, y: true },
		horizontal: { x: true, y: false },
		both: { x: true, y: true },
		x: { x: true, y: false },
		y: { x: false, y: true }
	};

	var settings = {
		duration: "fast",
		direction: "both"
	};

	var rootrx = /^(?:html)$/i;

	// gets border dimensions
	var borders = function (domElement, styles) {
		styles = styles || (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(domElement, null) : domElement.currentStyle);
		var px = document.defaultView && document.defaultView.getComputedStyle ? true : false;
		var b = {
			top: (parseFloat(px ? styles.borderTopWidth : $.css(domElement, "borderTopWidth")) || 0),
			left: (parseFloat(px ? styles.borderLeftWidth : $.css(domElement, "borderLeftWidth")) || 0),
			bottom: (parseFloat(px ? styles.borderBottomWidth : $.css(domElement, "borderBottomWidth")) || 0),
			right: (parseFloat(px ? styles.borderRightWidth : $.css(domElement, "borderRightWidth")) || 0)
		};
		return {
			top: b.top,
			left: b.left,
			bottom: b.bottom,
			right: b.right,
			vertical: b.top + b.bottom,
			horizontal: b.left + b.right
		};
	};

	var dimensions = function ($element) {
		var win = $(window);
		var isRoot = rootrx.test($element[0].nodeName);
		return {
			border: isRoot ? { top: 0, left: 0, bottom: 0, right: 0} : borders($element[0]),
			scroll: {
				top: (isRoot ? win : $element).scrollTop(),
				left: (isRoot ? win : $element).scrollLeft()
			},
			scrollbar: {
				right: isRoot ? 0 : $element.innerWidth() - $element[0].clientWidth,
				bottom: isRoot ? 0 : $element.innerHeight() - $element[0].clientHeight
			},
			rect: (function () {
				var r = $element[0].getBoundingClientRect();
				return {
					top: isRoot ? 0 : r.top,
					left: isRoot ? 0 : r.left,
					bottom: isRoot ? $element[0].clientHeight : r.bottom,
					right: isRoot ? $element[0].clientWidth : r.right
				};
			})()
		};
	};

	$.fn.extend({
		scrollintoview: function (options) {
			/// <summary>Scrolls the first element in the set into view by scrolling its closest scrollable parent.</summary>
			/// <param name="options" type="Object">Additional options that can configure scrolling:
			///        duration (default: "fast") - jQuery animation speed (can be a duration string or number of milliseconds)
			///        direction (default: "both") - select possible scrollings ("vertical" or "y", "horizontal" or "x", "both")
			///        complete (default: none) - a function to call when scrolling completes (called in context of the DOM element being scrolled)
			/// </param>
			/// <return type="jQuery">Returns the same jQuery set that this function was run on.</return>

			options = $.extend({}, settings, options);
			options.direction = converter[typeof (options.direction) === "string" && options.direction.toLowerCase()] || converter.both;

			var dirStr = "";
			if (options.direction.x === true) dirStr = "horizontal";
			if (options.direction.y === true) dirStr = dirStr ? "both" : "vertical";

			var el = this.eq(0);
			var scroller = el.closest(":scrollable(" + dirStr + ")");

			// check if there's anything to scroll in the first place
			if (scroller.length > 0)
			{
				scroller = scroller.eq(0);

				var dim = {
					e: dimensions(el),
					s: dimensions(scroller)
				};

				var rel = {
					top: dim.e.rect.top - (dim.s.rect.top + dim.s.border.top),
					bottom: dim.s.rect.bottom - dim.s.border.bottom - dim.s.scrollbar.bottom - dim.e.rect.bottom,
					left: dim.e.rect.left - (dim.s.rect.left + dim.s.border.left),
					right: dim.s.rect.right - dim.s.border.right - dim.s.scrollbar.right - dim.e.rect.right
				};

				var animOptions = {};

				// vertical scroll
				if (options.direction.y === true)
				{
					if (rel.top < 0)
					{
						animOptions.scrollTop = dim.s.scroll.top + rel.top;
					}
					else if (rel.top > 0 && rel.bottom < 0)
					{
						animOptions.scrollTop = dim.s.scroll.top + Math.min(rel.top, -rel.bottom);
					}
				}

				// horizontal scroll
				if (options.direction.x === true)
				{
					if (rel.left < 0)
					{
						animOptions.scrollLeft = dim.s.scroll.left + rel.left;
					}
					else if (rel.left > 0 && rel.right < 0)
					{
						animOptions.scrollLeft = dim.s.scroll.left + Math.min(rel.left, -rel.right);
					}
				}

				// scroll if needed
				if (!$.isEmptyObject(animOptions))
				{
					if (rootrx.test(scroller[0].nodeName))
					{
						scroller = $("html,body");
					}
					scroller
						.animate(animOptions, options.duration)
						.eq(0) // we want function to be called just once (ref. "html,body")
						.queue(function (next) {
							$.isFunction(options.complete) && options.complete.call(scroller[0]);
							next();
						});
				}
				else
				{
					// when there's nothing to scroll, just call the "complete" function
					$.isFunction(options.complete) && options.complete.call(scroller[0]);
				}
			}

			// return set back
			return this;
		}
	});

	var scrollValue = {
		auto: true,
		scroll: true,
		visible: false,
		hidden: false
	};

	$.extend($.expr[":"], {
		scrollable: function (element, index, meta, stack) {
			var direction = converter[typeof (meta[3]) === "string" && meta[3].toLowerCase()] || converter.both;
			var styles = (document.defaultView && document.defaultView.getComputedStyle ? document.defaultView.getComputedStyle(element, null) : element.currentStyle);
			var overflow = {
				x: scrollValue[styles.overflowX.toLowerCase()] || false,
				y: scrollValue[styles.overflowY.toLowerCase()] || false,
				isRoot: rootrx.test(element.nodeName)
			};

			// check if completely unscrollable (exclude HTML element because it's special)
			if (!overflow.x && !overflow.y && !overflow.isRoot)
			{
				return false;
			}

			var size = {
				height: {
					scroll: element.scrollHeight,
					client: element.clientHeight
				},
				width: {
					scroll: element.scrollWidth,
					client: element.clientWidth
				},
				// check overflow.x/y because iPad (and possibly other tablets) don't dislay scrollbars
				scrollableX: function () {
					return (overflow.x || overflow.isRoot) && this.width.scroll > this.width.client;
				},
				scrollableY: function () {
					return (overflow.y || overflow.isRoot) && this.height.scroll > this.height.client;
				}
			};
			return direction.y && size.scrollableY() || direction.x && size.scrollableX();
		}
	});
})(jQuery);


function getBrowserInfo(){
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName  = navigator.appName;
    var fullVersion  = ''+parseFloat(navigator.appVersion); 
    var majorVersion = parseInt(navigator.appVersion,10);
    var nameOffset,verOffset,ix;
    
    // In Opera 15+, the true version is after "OPR/" 
    if ((verOffset=nAgt.indexOf("OPR/"))!=-1) {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset+4);
    }
    // In older Opera, the true version is after "Opera" or after "Version"
    else if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset+6);
        if ((verOffset=nAgt.indexOf("Version"))!=-1) 
            fullVersion = nAgt.substring(verOffset+8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
        browserName = "Microsoft Internet Explorer";
        fullVersion = nAgt.substring(verOffset+5);
    }
    // In Chrome, the true version is after "Chrome" 
    else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
        browserName = "Chrome";
        fullVersion = nAgt.substring(verOffset+7);
    }
    // In Safari, the true version is after "Safari" or after "Version" 
    else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
        browserName = "Safari";
        fullVersion = nAgt.substring(verOffset+7);
        if ((verOffset=nAgt.indexOf("Version"))!=-1) 
            fullVersion = nAgt.substring(verOffset+8);
    }
    // In Firefox, the true version is after "Firefox" 
    else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
        browserName = "Firefox";
        fullVersion = nAgt.substring(verOffset+8);
    }
    // In most other browsers, "name/version" is at the end of userAgent 
    else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) <  (verOffset=nAgt.lastIndexOf('/')) ) 
    {
        browserName = nAgt.substring(nameOffset,verOffset);
        fullVersion = nAgt.substring(verOffset+1);
        if (browserName.toLowerCase()==browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix=fullVersion.indexOf(";"))!=-1)
        fullVersion=fullVersion.substring(0,ix);
    if ((ix=fullVersion.indexOf(" "))!=-1)
        fullVersion=fullVersion.substring(0,ix);
    
    majorVersion = parseInt(''+fullVersion,10);
    if (isNaN(majorVersion)) {
        fullVersion  = ''+parseFloat(navigator.appVersion); 
        majorVersion = parseInt(navigator.appVersion,10);
    }
    return {
        name: browserName,
        fullVersion: fullVersion,
        majorVersion: majorVersion
    }
}

function getCorrectedYear(year){
    var correctedYear = year;
	if(correctedYear === 'unkown' || correctedYear === 'unknown'){
		correctedYear = 'unknown'
	} 
    var possibleYear = correctedYear.split(/[^\d]/).filter(function(n){if((n >=-9999)&& (n<=9999))return n;});
    if(possibleYear.length === 0 ){
        !('unknown'.localeCompare(correctedYear)) ? 
            correctedYear = new Date().getFullYear().toString() 
            : correctedYear = correctedYear.slice(0, 4);
    } else {
        correctedYear = possibleYear[0].toString();
    }
    return correctedYear;
}

