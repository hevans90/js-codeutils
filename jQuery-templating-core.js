//USAGE EXAMPLES:


/* jQuery Object:
$('#containerId').templater({
    template: templateHtmlString,
    subObj : substitutionObj
});
*/

/* string (self(quick)-templating):
var exampleHtmlTemplate = "<div>!DEFAULT!</div>";

exampleHtmlTemplate = exampleHtmlTemplate.templater({
    template: exampleHtmlTemplate,
    subObj: {
        "!DEFAULT!" : "example string"
    }
});
*/

/* string (external-templating):
var exampleHtmlTemplate = "<div>!DEFAULT!</div>";

var htmlString = htmlString.templater({
    template: exampleHtmlTemplate,
    subObj: {
        "!DEFAULT!" : "example string"
    }
});
*/

$(document).ready(function () {
    templateModule.init();
});


(function ($) {
    $.fn.templater = function (options) {
        var settings = $.extend({
            // This is the default template, with one dummy injected value
            template: "<div>!DEFAULT!</div>",
            subObj: {"!DEFAULT!": "jQuery templater has injected this to tell you that something went wrong."}
        }, options);

        templateModule.setHtmlTemplate(settings.template);
        templateModule.setSubList(settings.subObj);
        templateModule.substituteAll();

        this.append(templateModule.getSubbedTemplate());

        templateModule.clearSubs();
        
        return this;
    }
}(jQuery));

// ReSharper disable once NativeTypePrototypeExtending
String.prototype.templater = function (options) {
    var template = options.template;
    var subObj = options.subObj;

    function templated(inTemplate, inSubObj) {
        templateModule.setHtmlTemplate(inTemplate);
        templateModule.setSubList(inSubObj);
        templateModule.substituteAll();

        var outString = (templateModule.getSubbedTemplate());

        templateModule.clearSubs();

        return outString;
    }
    return templated(template, subObj);
};

var templateModule = (function () {
    var mod = {};

    mod.init = function () {
        mod.htmlTemplate = "";
        mod.subbedTemplate = "";
        mod.substitutionObject = [];
    };

    mod.clearSubs = function () {
        mod.subbedTemplate = "";
        mod.substitutionObject = [];
    };

    //getters
    mod.getCurrentTemplate = function () {
        return mod.htmlTemplate;
    };

    mod.getSubbedTemplate = function () {
        return mod.subbedTemplate;
    };

    //setters
    mod.setHtmlTemplate = function (htmlString) {
        mod.htmlTemplate = htmlString;
    };

    mod.setSubList = function (subArray) {
        mod.substitutionObject = subArray;
    };

    //functions
    mod.substituteAll = function () {
        mod.subbedTemplate = mod.htmlTemplate;
        for (var i = 0; i < Object.keys(mod.substitutionObject).length; i++) {
            var subKey = Object.keys(mod.substitutionObject)[i];
            var subValue = mod.substitutionObject[subKey];
            mod.subbedTemplate = mod.subbedTemplate.replace(subKey, subValue);
        }
    }
    return mod;
})();