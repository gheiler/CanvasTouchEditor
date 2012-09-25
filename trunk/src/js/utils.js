/* Utilidades */

function AsignDefaultButton(panelSelector, buttonSelector) {
    $(panelSelector).keypress(function (e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $(buttonSelector).click();
            return true;
        }
    });
}

function Formfy(formContainerSelector) {
    $(formContainerSelector + ' :input').not(':button,:hidden').each(function (indx, item) {
        var sError = $(item).next('span.error');
        if (sError) {
            $(item).focus(function () {
                $(sError).css('display', 'none');
            });
            //$(item).blur(function () {
            // validate value show error if necesary
            //});
        }
    });
}

function blockNonNumbers(obj, e, allowDecimal, allowNegative) {
    var key;
    var isCtrl = false;
    var keychar;
    var reg;

    if (window.event) {
        key = e.keyCode;
        isCtrl = window.event.ctrlKey;
    }
    else if (e.which) {
        key = e.which;
        isCtrl = e.ctrlKey;
    }

    if (isNaN(key)) return true;

    keychar = String.fromCharCode(key);

    // check for backspace or delete, or if Ctrl was pressed
    if (key == 8 || isCtrl) {
        return true;
    }

    reg = /\d/;
    var isFirstN = allowNegative ? keychar == '-' && obj.value.indexOf('-') == -1 : false;
    var isFirstD = allowDecimal ? keychar == '.' && obj.value.indexOf('.') == -1 : false;

    return isFirstN || isFirstD || reg.test(keychar);
}

var utils = {
    validation: {
        cuitcuil: function (valor) {
            var er_c = /^(20|23|27|30|33)-[0-9]{8}-[0-9]$/;
            return er_c.test(valor);
        },
        email: function (email) {
            return !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email));
        },
        date: function (dateStr) {
            format = "DMY";
            var reg1;
            var reg2;
            var mm;
            var dd;
            var yy;

            if (format.length != 3) { format = "DMY"; }
            if ((format.indexOf("D") == -1) || (format.indexOf("M") == -1) || (format.indexOf("Y") == -1))
            { format = "DMY"; }
            if (format.substring(0, 1) == "Y") { // If the year is first
                reg1 = /^\d{2}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;
                reg2 = /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/;
            } else if (format.substring(1, 2) == "Y") { // If the year is second
                reg1 = /^\d{1,2}(\-|\/|\.)\d{2}\1\d{1,2}$/;
                reg2 = /^\d{1,2}(\-|\/|\.)\d{4}\1\d{1,2}$/;
            } else { // The year must be third
                reg1 = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{2}$/;
                reg2 = /^\d{1,2}(\-|\/|\.)\d{1,2}\1\d{4}$/;
            }
            // If it doesn't conform to the right format (with either a 2 digit year or 4 digit year), fail
            if ((reg1.test(dateStr) == false) && (reg2.test(dateStr) == false)) { return false; }
            var parts = dateStr.split(RegExp.$1); // Split into 3 parts based on what the divider was
            // Check to see if the 3 parts end up making a valid date
            if (format.substring(0, 1) == "M") { mm = parts[0]; }
            else if (format.substring(1, 2) == "M") { mm = parts[1]; } else { mm = parts[2]; }
            if (format.substring(0, 1) == "D") { dd = parts[0]; }
            else if (format.substring(1, 2) == "D") { dd = parts[1]; } else { dd = parts[2]; }
            if (format.substring(0, 1) == "Y") { yy = parts[0]; }
            else if (format.substring(1, 2) == "Y") { yy = parts[1]; } else { yy = parts[2]; }
            if (parseFloat(yy) <= 50) { yy = (parseFloat(yy) + 2000).toString(); }
            if (parseFloat(yy) <= 99) { yy = (parseFloat(yy) + 1900).toString(); }
            var dt = new Date(parseFloat(yy), parseFloat(mm) - 1, parseFloat(dd), 0, 0, 0, 0);
            if (parseFloat(dd) != dt.getDate()) { return false; }
            if (parseFloat(mm) - 1 != dt.getMonth()) { return false; }
            return true;
        },
        time: function (value) {
            return (/^(([0-1]?[0-9])|([2][0-3])):([0-5]?[0-9])(:([0-5]?[0-9]))?$/.test(value));
        },
        numeric: function (sText) {
            var ValidChars = "0123456789.";
            var IsNumber = true;
            var Char;
            for (i = 0; i < sText.length && IsNumber == true; i++) {
                Char = sText.charAt(i);
                if (ValidChars.indexOf(Char) == -1) {
                    return false;
                }
            }
            return true;
        }
    },
    getCookie: function (c_name) {
        var i, x, y, ARRcookies = document.cookie.split(";");
        for (i = 0; i < ARRcookies.length; i++) {
            x = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            y = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            x = x.replace(/^\s+|\s+$/g, "");
            if (x == c_name) {
                return unescape(y);
            }
        }
        return '';
    },
    getURLParam: function (strParamName) {
        var strReturn = "";
        var strHref = window.location.href;
        if (strHref.indexOf("?") > -1) {
            var strQueryString = strHref.substr(strHref.indexOf("?")).toLowerCase();
            var aQueryString = strQueryString.split("&");
            for (var iParam = 0; iParam < aQueryString.length; iParam++) {
                if (aQueryString[iParam].indexOf(strParamName.toLowerCase() + "=") > -1) {
                    var aParam = aQueryString[iParam].split("=");
                    strReturn = aParam[1];
                    break;
                }
            }
        }
        return unescape(strReturn);
    }
}
var accentMap = {
    "á": "a",
    "ó": "o",
    "ú": "u",
    "í": "i",
    "é": "e",
    "ü": "u",
    "Á": "a",
    "Ó": "o",
    "Ú": "u",
    "Í": "i",
    "É": "e",
    "Ü": "u"
};


// Extension Methods
if (typeof Number.prototype.toRad == 'undefined') {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}
Number.prototype.toMoney = function(c, d, t){
var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };
Date.prototype.getMonthFormatted = function() {
    var month = this.getMonth() + 1;
    return month < 10 ? "0" + month : "" + month;
}
Date.prototype.getFormattedDate = function() {
    var dayOfMonth = this.getDate();
    return dayOfMonth < 10 ? "0" + dayOfMonth : "" + dayOfMonth;
}

if (!String.prototype.trim) {
    String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
    String.prototype.ltrim=function(){return this.replace(/^\s+/,'');}
    String.prototype.rtrim=function(){return this.replace(/\s+$/,'');}
    String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}
}
if (!String.prototype.decodeHTML) {
    String.prototype.decodeHTML = function () {
        return this.replace(/&(l|g|quo)t;/g, function (a, b) {
            return {
                l: '<',
                g: '>',
                quo: '"'
            }[b];
        });
    }
}
if (!String.prototype.normalize) {
    String.prototype.normalize = function () {
        var ret = "";
        for (var i = 0; i < this.length; i++) {
            ret += accentMap[this.charAt(i)] || this.charAt(i);
        }
        return ret;
    };
}
if (!Element.prototype.toggle) {
    Element.prototype.toggle = function () {
        if (getComputedStyle(this).display === "none") {
            this.style.display = "block";
        } else { 
            this.style.display = "none";
        }
        if (getComputedStyle(this).visibility === "hidden" && getComputedStyle(this).display === "block") {
            this.style.visibility = "visible";
        } else { 
            this.style.visibility = "hidden";
        }
    }
}

// VISUALES: efects, progress functions, etc
var Loader = {
    ShowLoading: function () {
        var spinner = $('#loadSpinner');
        if (!$("#loadSpinner").length) {
            $('#loadingContainer').html(Loader.GetSpinner());
        }
    },
    CloseLoading: function () {
        $('#loadingContainer').empty();
    },
    GetSpinner: function () {
        return "<div id='loadSpinner' style='display: block!important' class='ui-loader ui-corner-all ui-body-a ui-loader-default'><span class='ui-icon ui-icon-loading'></span><h1>Cargando...</h1></div>";
    }
}