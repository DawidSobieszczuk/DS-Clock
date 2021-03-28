// =============
//   HELPERS 
// =============

/**
 * @param {Number} number
 * @param {Number} size
 */
 exports.padLeaddinZeros = function(number, size) {
    let output = number.toString();
    while(output.length < size) output = '0' + output;
    return output;
}

/**
 * 
 * @param {Number} number Start from 0, and Sunday
 */
 exports.weekdayNummberToString = function(number) {
    switch(number) {
        case 0: return "Sunday";
        case 1: return "Monday";
        case 2: return "Tuesday";
        case 3: return "Wednesday";
        case 4: return "Thursday";
        case 5: return "Friday";
        case 6: return "Saturday";        
    }
}

exports.updateDarkMode = function() {
    if(remote.nativeTheme.themeSource == 'dark') HTML_ELEMENT.classList.add('dark');
    else HTML_ELEMENT.classList.remove('dark');
}

/**
 * Adds time to a date. Modelled after MySQL DATE_ADD function.
 * Example: dateAdd(new Date(), 'minute', 30)  //returns 30 minutes from now.
 * https://stackoverflow.com/a/1214753/18511
 * 
 * @param date  Date to start with
 * @param interval  One of: year, quarter, month, week, day, hour, minute, second
 * @param units  Number of units of the given interval to add.
 */
 exports.dateAdd = function(date, interval, units) {
    if(!(date instanceof Date))
        return undefined;
    var ret = new Date(date); //don't change original date
    var checkRollover = function() { if(ret.getDate() != date.getDate()) ret.setDate(0);};
    switch(String(interval).toLowerCase()) {
        case 'year'   :  ret.setFullYear(ret.getFullYear() + units); checkRollover();  break;
        case 'quarter':  ret.setMonth(ret.getMonth() + 3*units); checkRollover();  break;
        case 'month'  :  ret.setMonth(ret.getMonth() + units); checkRollover();  break;
        case 'week'   :  ret.setDate(ret.getDate() + 7*units);  break;
        case 'day'    :  ret.setDate(ret.getDate() + units);  break;
        case 'hour'   :  ret.setTime(ret.getTime() + units*3600000);  break;
        case 'minute' :  ret.setTime(ret.getTime() + units*60000);  break;
        case 'second' :  ret.setTime(ret.getTime() + units*1000);  break;
        default       :  ret = undefined;  break;
    }
    return ret;
}

/**
 * Helper for storage
 * @param {*} data 
 */
exports.isDataEmpty = function(data) {
    return data && Object.keys(data).length === 0 && data.constructor == Object;
}