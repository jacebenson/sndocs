
function isNumeric(text) {
    if (text == null)
        return true;
    var validChars = "0123456789.,-";
    return containsOnlyChars(validChars, text);
}

function isInteger(text) {
    if (text == null)
        return true;
    var validChars = "0123456789,-";
    return containsOnlyChars(validChars, text);
}

function containsOnlyChars(validChars, sText) {
    var IsNumber=true;
    var c;
 
    for (var i = 0; i < sText.length && IsNumber == true; i++) { 
        c = sText.charAt(i); 
        if (validChars.indexOf(c) == -1) {
            IsNumber = false;
        }
    }
    
    return IsNumber;   
}