//HWE jQuery extension for Inspinia MVC Form Validation
//
//see readme for full usage info
//
//quickstart: simply add the 'cus-val' or 'cus-val-date' classes to any div (containing a label and an input/select) for automatic validation
//reccommended: use readme to setup json-validation engine

function ValidateFields() {
    var valArr = [];
    valMod.setValInfo(valArr);

    var warningIcon = "<i class='fa fa-exclamation-circle' id='wrnIcon'></i>";
    var $cusVal = $('.cus-val, .cus-val-date').find('input, select'); //todo: split date in to its own validation handlers

    $cusVal.each(function () {
        validateText($(this));
        valMod.setValInfo(valArr);
    }); //run on initial load

    $cusVal.change(function () {
        valArr = [];
        $cusVal.each(function () {
            validateText($(this));
            valMod.setValInfo(valArr);
        });
    });

    function validateText($thisObj) {
        var doValidate = true;
        var hardStripValidation = false; //hard override to remove validation at end of logic (useful for special cases)
        var $val = $thisObj.val();
        var $parent = $thisObj.parent().parent();
        var $valMsg = $parent.attr('val-msg');
        var $label = $parent.find('label');


        //----- BEGIN parent/child validation handlers -----
        //these handlers are css class driven
        //todo: refactor in to one parent select variable with a switch?

        var jQSelector;

        //parent : 'select' determinate validation handler
        var parentSelectId = $parent.attr('sel-val-id');

        if (typeof parentSelectId !== typeof undefined && parentSelectId !== false) {
            jQSelector = "#" + parentSelectId + " option:selected";

            var desiredIndex = $parent.attr('sel-val'); //string
            var selectedParentIndex = $(jQSelector).index(); //int
            if (desiredIndex != selectedParentIndex) { //type coersion important do not remove
                doValidate = false;
            };
        }
        //

        //parent: generic determinate validation handler
        var parentId = $parent.attr('parent-val-id');

        if (typeof parentId !== typeof undefined && parentId !== false) {
            jQSelector = "#" + parentId;

            var parentVal = $(jQSelector).val();
            if (parentVal !== "" && parentVal !== "[Choose]") {
                doValidate = false;
            };
        }
        //

        //parent: checkboxSpecial determinate validation handler
        //note: this is a special type of validation : the parent is never validated, ONLY the child and ONLY if the parent 'passes' the inverse condition
        if ($parent.hasClass('cus-val-special')) { // prevent parent from ever validating
            doValidate = false;
        }

        var parentChkId = $parent.attr('chkSpecial-val-id');

        if (typeof parentChkId !== typeof undefined && parentChkId !== false) {
            var inverse = $parent.attr('chkSpecial-inverse') === "true" ? true : false; //inverse condition

            jQSelector = "#" + parentChkId;

            var parentChecked = $(jQSelector).find('input').is(':checked') === true ? true : false; 

            if (inverse) {
                if (parentChecked) {
                    doValidate = false;
                    hardStripValidation = true;
                }
            } else {
                if (!parentChecked) {
                    doValidate = false;
                    hardStripValidation = true;
                }
            }
        }
        //

        //parent: checkbox determinate validation handler (true)
        var type = $thisObj.attr('type');
        var checked = $thisObj.is(':checked');

        if (type === 'checkbox' && !checked) {
            $val = "chkBoxOverride";
        }
        //

        if (doValidate && type !== "hidden") {
            switch ($val) {
                case "":
                    addValidationStyles();
                    break;
                case "[Choose]":
                    addValidationStyles();
                    break;
                case "chkBoxOverride":
                    addValidationStyles();
                    break;
                default:
                    removeValidationStyles();
                    break;
            }
        }

        //----- END parent/child validation handlers -----


        if (hardStripValidation) { // hard override for stripping validation. use for special validation such as checkboxSpecial
            removeValidationStyles();
        }

        function addValidationStyles() {
            $($thisObj).addClass('val-error-brd');
            $parent.find('#wrnIcon').remove();
            $(warningIcon).insertBefore($thisObj);
            $label.addClass('val-error-txt');

            var item = {};
            item["id"] = $parent.attr('id');
            item["msg"] = $valMsg;
            valArr.push(item);
        }

        function removeValidationStyles() {
            $thisObj.removeClass('val-error-brd');
            $parent.find('#wrnIcon').remove();
            $label.removeClass('val-error-txt');
        }
    }

    function validateDates($thisObj, format) {
        //todo: custom DD MMM YYYY date val (regex)
    }
}

function GetValidationJson(url) {
    var json = (function () {
        var json = null;
        $.ajax({
            'async': false,
            'global': false,
            'url': url,
            'dataType': "json",
            'success': function (data) {
                json = data;
            },
            'error': function (data) {
                alert(data.message);
            }
        });
        return json;
    })();
    return json;
}

function SetValidatedFieldsFromJson(jsonObj) {
    for (var i = 0; i < Object.keys(jsonObj).length; i++) {
        var thisObj = jsonObj[i];
        var id = "#" + thisObj.id;
        var type = thisObj.type;
        var valMsg = thisObj.msg;
        var cssClass;

        switch (type) {
            case "date":
                cssClass = "cus-val-date";
                break;
                //todo: handle checkboxes
            case "checkboxSpecial":
                cssClass = "cus-val cus-val-special";
                break;
            default:
                cssClass = "cus-val"; //handles free text and select lists currently
                break;
        }
        $(id).addClass(cssClass).attr('val-msg', valMsg);

        //check for child (determinate) validation
        if (thisObj.hasOwnProperty('children')) {
            for (var j = 0; j < Object.keys(thisObj.children).length; j++) {
                var childObj = thisObj.children[j];
                id = "#" + childObj.id;
                type = thisObj.type;
                valMsg = childObj.msg;

                switch (type) {
                    case "select":
                        var val = childObj.val;
                        $(id).attr('sel-val', val).attr('sel-val-id', thisObj.id); //for determinate validation of select lists' children
                        break;
                    case "checkboxSpecial":
                        $(id).attr('chkSpecial-val-id', thisObj.id).attr('chkSpecial-inverse', thisObj.inverse); //special child-only determinate validation based on a parent checkbox
                        break;
                    default:
                        $(id).attr('parent-val-id', thisObj.id); //for generic (text/date...) determinate validation
                        break;
                }
                $(id).addClass('cus-val').attr('val-msg', valMsg);
            }
        }
    }
}