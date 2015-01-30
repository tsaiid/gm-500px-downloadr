// ==UserScript==
// @name        500px Downloadr
// @namespace   https://github.com/tsaiid/gm-500px-downloadr
// @description Easy download of images from 500px w/ little UX enhancements. It's a clone of Depositado's "500px Download Images w/ various UX enhancements" script.
// @include     https://500px.com/*
// @version     1.8.20150131
// @grant       none
// ==/UserScript==

// URL:   https://github.com/tsaiid/gm-500px-downloadr
// Modified from Depositado's "500px Download Images w/ various UX enhancements": http://userscripts-mirror.org/scripts/show/174189

if (typeof console == "undefined") {
    window.console = {
        log: function() {}
    };
}


// script details/updates
var us_174189_Name = GM_info.script.name;
var us_174189_Version = GM_info.script.version;

// first run?
function firstRun() {
    if ($.cookie('us_174189_name') == null) {
        //set cookies
        $.cookie('us_174189_name', us_174189_Name, {
            expires: 365,
            path: '/'
        });
        $.cookie('us_174189_version', us_174189_Version, {
            expires: 365,
            path: '/'
        });
        console.info('Hi, thanks for using userscript: ' + us_174189_Name + ' v' + us_174189_Version);
    }
}

function checkIfUpdated() {
    if ($.cookie('us_174189_version') != us_174189_Version) {
        //re-set cookies
        $.cookie('us_174189_name', us_174189_Name, {
            expires: 365,
            path: '/'
        });
        $.cookie('us_174189_version', us_174189_Version, {
            expires: 365,
            path: '/'
        });
        console.info('Userscript updated to version: ' + us_174189_Version);
    }
}


// jquery.waitUntilExists
// Author/source: https://gist.github.com/PizzaBrandon/5709010
(function(e, f) {
    var b = {},
        g = function(a) {
            b[a] && (f.clearInterval(b[a]), b[a] = null)
        };
    e.fn.waitUntilExists = function(a, h, j) {
        var c = this.selector,
            d = e(c),
            k = d.not(function() {
                return e(this).data("waitUntilExists.found")
            });
        "remove" === a ? g(c) : (k.each(a).data("waitUntilExists.found", !0), h && d.length ? g(c) : j || (b[c] = f.setInterval(function() {
            d.waitUntilExists(a, h, !0)
        }, 500)));
        return d
    }
})(jQuery, window);

// jquery.domchanged.min.js
(function(e) {
    if (typeof exports == "object") {
        e(require("jquery"))
    } else if (typeof define == "function" && define.amd) {
        define(["jquery"], e)
    } else {
        e(jQuery)
    }
})(function(e) {
    "use strict";

    function t(t, n) {
        return e(t).trigger("DOMChanged", n)
    }

    function n(t, n) {
        var r = e.fn[t];
        if (r) {
            e.fn[t] = function() {
                var e = Array.prototype.slice.apply(arguments);
                var t = r.apply(this, e);
                n.apply(this, e);
                return t
            }
        }
    }
    n("prepend", function() {
        return t(this, "prepend")
    });
    n("append", function() {
        return t(this, "append")
    });
    n("before", function() {
        return t(e(this).parent(), "before")
    });
    n("after", function() {
        return t(e(this).parent(), "after")
    });
    n("html", function(e) {
        if (typeof e === "string") {
            return t(this, "html")
        }
    })
})


function download500px() {

    console.info('download500px()');

    // define vars
    var
        THEphoto,
        downloadLINK,
        pathArray,
        photoID,
        apiUrl,
        photoContainerDiv,
        availHeight,
        downloadCursor,
        bkgPrefix;

    // set vars
    THEphoto = $('.photo.segment img');
    if (m = THEphoto.attr('src').match(/drscdn\.500px\.org\/photo\/(\d+)\//)) {
        photoID = m[1];
    } else if (m = THEphoto.attr('src').match(/ppcdn\.500px\.org\/(\d+)\//)) {
        photoID = m[1];
    }
    console.log("photoID: " + photoID);
    apiUrl = "https://api.500px.com/v1/photos/" + photoID + "?consumer_key=rZR2NrAPT8TOrZp4Hx14x8lW2vE484tv6wOnwF8K&image_size=3";
    console.log("apiUrl: " + apiUrl);
    $.get(apiUrl, function(data) {
        if (data.error) {
            console.log("apiUrl error: " + data.error);
        } else {
            downloadLINK = data.photo.image_url.replace(/\/\d+\.jpg/, "/2048.jpg");
            console.log("downloadLINK: " + downloadLINK);
        }
    });
    photoContainerDiv = $('div.photo.segment');
    downloadCursor = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAQAAAAngNWGAAAB0UlEQVR4AXWRv0sbcRjGP/fDNOc1Ki2CabcDIVgLIsElRM8hm4MgDgW3oMXBg6T/gI6Cf0DAVeji4j9hiaJLKXapaTEZugQLQnt6P/oMCdWUPA/vy73f58MLL2fRl4FFBgeXnOoZNgaPZD75HhH4XGBO3dGk9H9ZjDKJd30Up3F6fYSnaRRrcKOB9pEl9/MlknpOk3ZiPAYN2cJW5D6MIKm7mmwslA1uzOiEbGQjqWc1ZZ5uFIQunnfb+93DhSLSQrF72N6fd4VaCBbYx7AvWTsOHcdFctzQWTu+BLuPmtjoCBzZal6VD27aSDft8kHzSogj6yhROEzwCq9UPKnvbuB7tdb31g+vhr+7cVIvFfGUTohinNcUGtW7Tutsbp0l/KntqW18lubWW2d3nUaVgohxmGT6ohElp+fLeyubVFikLC9SWdlc3js9j5KLBtOiyDMbJXEqy1uBUF+ubAX9tyhhlryJbv51S0/V1WDmgxzMVFfpSanuNsjz4svHwluG6uvnN+/omkSEzU+kDFOqNBTFGHlKvGeHGnVVIMu9aUdJScSYzT0G3+j0/oBEChhIJMTK//Cbe5sINIZYsiH/UyrH8oOYSBGmrK5iAFSRoCL5C67zl+gG1lV2AAAAAElFTkSuQmCC';

    // set data attr on image
    THEphoto.data('img-height', THEphoto.height());
    THEphoto.data('img-width', THEphoto.width());


    // add black background to image container
    photoContainerDiv.css({
        'background-color': 'rgb(34,34,34)',
        'min-height': '400px',
        'margin-bottom': '20px',
        'padding': '30px 0 30px 0',
        //'background-image': 'url('+bkg_url+')',
        //'background-size': '100% 100%'
    });

    // add height to data-attr
    photoContainerDiv.data('height', photoContainerDiv.height());
    console.log(photoContainerDiv.height());


    // remove annoying 'disabled right-click' from image + style-attributes
    THEphoto.removeAttr('data-protect');

    // calc available height
    availHeight = $(window).height() - 150;
    $('.photo.segment img, img.the_photo').css({
        //'max-height': ''+availHeight+'px',
        //'width': 'auto',
        'cursor': 'alias',
        'cursor': '-webkit-zoom-in',
        'cursor': '-moz-zoom-in',
        'cursor': 'url("' + downloadCursor + '"), auto',
        '-webkit-box-shadow': '0px 0px 10px rgba(50, 50, 50, 1)',
        '-moz-box-shadow': '0px 0px 10px rgba(50, 50, 50, 1)',
        'box-shadow': '0px 0px 10px rgba(50, 50, 50, 1)'

    }).click(function(e) {
        window.open(downloadLINK);
        return false;
    });

    // if 'data-protect' is not properly removed and/or still being captured by 500px
    THEphoto.oncontextmenu = function() {
        return false;
    };

    THEphoto.mousedown(function(e) {
        if (e.button == 2) {
            window.open(downloadLINK);
            return false;
        }
        return true;
    });

}


$(function() {

    console.info('USERSCRIPT LOADED: 500px Download Images w/ various UX enhancements');

    firstRun();
    checkIfUpdated();

    $('head').append("<link href='//dl.dropboxusercontent.com/u/3899/userscripts/500px-download-img-w-ux-enhancements/174189.css' rel='stylesheet' type='text/css'>");

    /* photo download */
    if ($('body#photos_show').length > 0) {

        console.debug('body#photos_show');

        // onload
        download500px();

        // hotkey support
        $(document).keydown(function(e) {
            if (e.keyCode == 37 || e.keyCode == 39) { // keyCode: 37 (left arrow), keyCode: 39 (right arrow)
                console.debug('keydown: ' + e.keyCode);
                // wait a little so next image is loaded, otherwise old 'data' is used
                setTimeout(function() {
                    download500px();
                }, 300);
            }
        });

    }

});
