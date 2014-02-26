//wow such code
//Ported to Chrome by Maxime Kjaer - DOGE donations: D9xQ9V3BqzVcJtUj92immJJYcFsMLmVghq
//Original code by FoxxMD

//create a var to hold DOM element for indicator
var dogeIndicator;
var version = "1.1";

//Check version because of backwards compability issues.
if (typeof(localStorage["version"]) == "undefined") {
    deleteCookie("refresh");
    localStorage["version"] = version;
}


if (!document.getElementById('dogetip_check')) {
    dogeIndicator = document.createElement('div');
    dogeIndicator.setAttribute('id', 'dogetip_check');
} else {
    dogeIndicator = document.getElementById('dogetip_check');
}


//parse current URL and pull subreddit name
function getCurrentSubreddit() {
    var bIndex,
    eIndex,
    url = window.location.href,
        subName;
    bIndex = url.indexOf('/r/') + 3;
    eIndex = url.indexOf('/', bIndex);

    subName = (eIndex === -1 ? url.slice(bIndex) : url.slice(bIndex, eIndex));

    return subName.toLowerCase();
}

//logic to populate indicator
function canTip(subreddit) {
    //such JSON
    var subredditList = JSON.parse(dogetipList),
        tippingStatus = 'Tipping on this subreddit is <b>';

    if (subredditList[subreddit]) {
        tippingStatus = tippingStatus + 'ALLOWED.</b>';
        dogeIndicator.className += ' soAllowed';
    } else if (subredditList[subreddit] === false) {
        tippingStatus = tippingStatus + 'BANNED.</b>';
        dogeIndicator.className += ' soBanned';
    } else if (subredditList[subreddit] == undefined || subredditList[subreddit] == null) {
        tippingStatus = tippingStatus + 'THE WILD WEST.</b></br></br> This subreddit has not explicitly stated whether' + ' tipping is okay so please be a respectable shibe and use good judgment!';
        dogeIndicator.className += ' soWild';
    }

    dogeIndicator.innerHTML = tippingStatus;
    //check if indicator doesn't exist(probably doesn't ever, but better safe than sorry)
    if (!document.getElementById('dogetip_check')) {
        document.body.appendChild(dogeIndicator);
    }
}

//such utility
function removeClass(theObject, theClass) {
    theObject.className = theObject.className.replace(theClass, "");
}

function addClass(theObject, theClass) {
    theObject.className += (' ' + theClass);
}

function persistList(listData) {
    //So JSON! Save the list to a cookie for 5 days
    dogetipList = JSON.stringify(listData);
    localStorage["dogetipList"] = dogetipList;
    setCookie("refresh", false, 1);
    canTip(getCurrentSubreddit());
}

//style indicator to make it less obtrusive once scrolling begins
function makeUnobtrusive() {
    //wow such arbitrary
    if (window.pageYOffset > 100) {
        if (dogeIndicator.className.indexOf('muchSmall') < 0) {
            addClass(dogeIndicator, 'muchSmall');
        }
    } else if (dogeIndicator.className.indexOf('muchSmall') > 0) {
        removeClass(dogeIndicator, 'muchSmall');
    }
}


//a function to set the cookie
function setCookie(name, value, daysToExpiration) {
    var expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + (1000 * 60 * 60 * 24 * daysToExpiration));
    document.cookie = name + "=" + value + "; expires=" + expirationDate.toGMTString();
}

//another function to read cookies easily
function readCookie(name) {
    name += "=";
    cookies = document.cookie.split(";");
    for (i = 0; i < cookies.length; i++) {
        if (cookies[i].trim().indexOf(name) == 0) {
            thisCookie = cookies[i].trim();
            return thisCookie.substring(name.length, thisCookie.length);
        }
    }
}

function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}


//so execute
//If the subreddit list isn't already in storage make a request to get it
if (typeof(readCookie("refresh")) === "undefined") {

    var tempSubList = {},
    firstDone = false;

    //get list of allowed/banned top 200 subreddits from wiki
    xhr = new XMLHttpRequest();
    xhr.open("GET", "http://www.reddit.com/r/dogecoin/wiki/other_subreddit_tipping", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var responseHTML = null;
            if (xhr.responseText) {
                responseHTML = new DOMParser()
                    .parseFromString(xhr.responseText, "text/html");
                //such xpath wow very select
                var subreddits = document.evaluate("//table[//thead//th[contains(.,'Subreddit')]]/tbody/tr/td[1]/a",
                responseHTML, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null),
                    subreddit_allowed = document.evaluate("//table[//thead//th[contains(.,'Subreddit')]]/tbody/tr/td[2]",
                    responseHTML, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
                //iterate through each collection of cells in the DOM table and get subreddit name & tipping permissions
                for (var i = 0; i < subreddits.snapshotLength; i++) {
                    var sRawName = subreddits.snapshotItem(i).innerText;
                    var sname = sRawName.slice(sRawName.lastIndexOf("/") + 1).toLowerCase();
                    //convert "Yes" and "No" to true/false
                    //such bool
                    tempSubList[sname] = (subreddit_allowed.snapshotItem(i).innerText == "Yes");
                }
                //wow
                //only subreddit not listed on either page!
                tempSubList['dogecoin'] = true;

                //ensure list is only updated if both pages have been parsed
                if (firstDone) {
                    persistList(tempSubList);
                } else {
                    firstDone = true;
                }
            }
        }
    }
    xhr.send();

    //get list of doge-related subreddits from wiki
    dogeRelatedxhr = new XMLHttpRequest();
    dogeRelatedxhr.open("GET", "http://www.reddit.com/r/dogecoin/wiki/index#wiki_dogecoin_related_sub-reddits", true);
    dogeRelatedxhr.onreadystatechange = function() {
        if (dogeRelatedxhr.readyState == 4) {
            var responseHTML = null;
            if (dogeRelatedxhr.responseText) {
                responseHTML = new DOMParser()
                    .parseFromString(dogeRelatedxhr.responseText, "text/html");
                //such xpath wow very select
                var subreddits = document.evaluate("//ul[preceding::h3[contains(.,'Dogecoin Related Sub-reddits')]]//a[contains(.,'/r/')]/@href",
                responseHTML, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

                //iterate through each collection of cells in the DOM table and get subreddit name & tipping permissions
                for (var i = 0; i < subreddits.snapshotLength; i++) {
                    var sRawName = subreddits.snapshotItem(i).value;
                    var sname = sRawName.slice(sRawName.lastIndexOf("/") + 1).toLowerCase();
                    //only add if not already listed(prevents references to /r/gonewild from overriding)
                    tempSubList[sname] = (tempSubList[sname] == undefined ? true : tempSubList[sname]);
                }
                //ensure list is only updated if both pages have been parsed
                if (firstDone) {
                    persistList(tempSubList);
                } else {
                    firstDone = true;
                }
            }
        }
    }
    dogeRelatedxhr.send();
}

// if it is, we can just use what we've saved.
else {
    dogetipList = localStorage["dogetipList"];
    canTip(getCurrentSubreddit());
}

//Add Event Listeners
//
//Listen for scroll event to minimize impact of the indicator
window.addEventListener('scroll', makeUnobtrusive, false);

//Listen for hover, then show regular style
dogeIndicator.addEventListener('mouseover',

function() {
    if (dogeIndicator.className.indexOf('muchSmall') > 0) {
        removeClass(dogeIndicator, 'muchSmall');
    }
}, false);
dogeIndicator.addEventListener('mouseout', function() {
    makeUnobtrusive();
}, false);