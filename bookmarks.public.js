/**
 * Show all bookmarks
 */
function clearFilter() {
    $("#bookmarks").children().removeClass('filter-unmatched');
    updateTitle();
}

/**
 * Show the number of visible bookmarks in the titlebar.
 */
function updateTitle()
{
    var count = $("#bookmarks").children().filter(":visible").size();
    var plural = ((count === 0) || (count > 1)) ? 's' : '';
    document.title = count + " visible bookmark" + plural;
}

function addBookmark() {
    var name = $("#newName").val();
    var link = $("#newLink").val();
    var tags = $("#newTags").val();
    var current = document.getElementById("bookmarks").innerHTML;
    var entry = '<li id="newOne" title="' + tags + '"><a href="' + link + '">' + name + '</a></li>';
    current = current + entry;
    document.getElementById("bookmarks").innerHTML = current;
    populateTags();
    // Append tag to the newly added bookmark
    $("#bookmarks").children().each(function () {
        var id = $(this).attr("id");
        var tag = $(this).attr("title");
        if (id === "newOne")
        {
            var checkbox = document.getElementById("TagsCheck");
            if (checkbox.checked === true) {
                decorate($(this), tag);
            }
            $(this).removeAttr("id");
        }
    });
    var form = document.getElementById("newForm");
    form.reset();
}

/**
 * This function collects each distinct tag,
 * stripping whitespace, and placing into sorted order.
 */
function populateTags()
{
    var tags = {};
    $("#bookmarks").children().each(function () {
        var tag = $(this).attr("title");
        if (typeof tag !== 'undefined')
        {
            if (tag.match(","))
            {
                var a = tag.split(",");
                for (var i in a)
                {
                    var nm = a[i];
                    nm = nm.replace(/(^\s+|\s+$)/g, '');
                    tags[ nm.toLowerCase() ] = 1;
                }
            }
            else
            {
                tag = tag.replace(/(^\s+|\s+$)/g, '');
                tags[tag.toLowerCase()] = 1;
            }
        }
    });

    var keys = [];
    for (var t in tags)
    {
        keys.push(t);
    }

    var cleanKeys = $.unique(keys); // remove duplicate tags
    cleanKeys.sort();
    $("#autotags").html("");
    for (t in cleanKeys)
    {
        $("#autotags").append("<li><a class=\"tagfilter\" href=\"#" + escape(cleanKeys[t]) + "\">" + cleanKeys[t] + "</a></li>");
    }
}

//            function removeDuplicates(a) {
//                return a.reduce(function(result, element) {
//                    if (result.indexOf(element) < 0)
//                        result.push(element);
//                    return result;
//                }, []);
//            }
/**
 *  Used by showTags()
 *  @param entry    the bookmark to be decorated
 *  @param tag      the list of tags to add to the entry
 */
    function decorate(entry, tag) {
        var txt = '<ul class="taglist">';
        var array = tag.toLowerCase().split(",");
        for (var i in array)
        {
            var nm = array[i];
            nm = nm.replace(/(^\s+|\s+$)/g, '');
            txt += "<li><a class=\"tagfilter\" href=\"#" + escape(nm) + "\">" + nm + "</a></li>";
        }
        entry.append(txt + "</ul>");
    }


/**
 * Toggles the visibility of the tags below the links
 */
function toggleTags() {
    var checkbox = document.getElementById("TagsCheck");
    if (checkbox.checked === true) {
        showTags();
    }
    else {
        hideTags();
    }
}

/**
 * Append the list of tags beneath each bookmark, for easy viewing.
 */
function showTags()
{
    $("#bookmarks").children().each(function () {
        var tag = $(this).attr("title");
        if (typeof tag !== 'undefined')
        {
            decorate($(this), tag);
        }
    });
}

/**
 * Remove the list of tags beneath each bookmark, so that the file can be saved back.
 */
function hideTags()
{
    $(".taglist").remove();
}

$(function () {
    /**
     * Sort the items in the UL which contains our bookmarks.
     */
    function sortBookmarks()
    {
        var mylist = $('#bookmarks');
        var listitems = mylist.children('li').get();
        if (mylist.hasClass('sort')) {
            listitems.sort(function (a, b) {
                return $(a).text().toUpperCase().localeCompare($(b).text().toUpperCase());
            });
        }

        $.each(listitems, function (idx, itm) {
            mylist.append(itm);
        });

        /**
         * Browsers support a multitude of different favicon formats and while
         * there is a default location, they can be placed anywhere and as we
         * can't really guess, you have to setup a collection of favicons yourself
         * with the hostname as the filename in the 'ico' filetype; e.g. for
         * 'http://www.debian.org/distrib' the favicon file would need to be
         * called 'www.debian.org.ico' and placed in the URI specified with
         * with the data-favicon-baseuri attribute on the #bookmarks element
         * (URI should realistically be a local server or file:///path/to/).
         *
         * The search engine DuckDuckGo has a small collection at 'https://icons.duckduckgo.com/i/'
         * for display in their result page which could be used to get you going
         * with your collection, but be fair and don't steal them the bandwidth.
         * Their collection is also not very large, so really roll your own!
         */
        var faviconBaseURI = mylist[0].getAttribute('data-favicon-baseuri');
        if (typeof faviconBaseURI !== 'string' || faviconBaseURI.length === 0)
            return;
        var regexHostname = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
        $.each(listitems, function(idx, itm) {
            if (typeof itm.firstChild === 'undefined' || typeof itm.firstChild.href !== 'string')
                return;
            var favicon = document.createElement("img");
            // errors in the host extraction are indicating wrong URLs
            var hostname = itm.firstChild.href.match(regexHostname);
            if (typeof hostname === 'undefined' || hostname === null || hostname.length <= 1)
            {
                // FIXME: Firefox/Iceweasel specific URI
                favicon.setAttribute('src', 'chrome://global/skin/icons/warning-16.png');
                favicon.setAttribute('style', 'background-color: red');
            }
            else
                favicon.setAttribute('src', faviconBaseURI + hostname[1].toString() + '.ico');
            favicon.setAttribute('class', 'favicon');
            itm.insertBefore(favicon, itm.firstChild);
        });
    }


    /**
     * Code the launches at page-load-time:
     */

    /** Sort the bookmarks */
    sortBookmarks();

    /** Populate the tags pane. */
    populateTags();

    if ($('#TagsCheck').is(':checked'))
        toggleTags();

    // Focus on the search/filter box.
    $("#fill").focus();

    /**
     * Bind event handlers...
     */
    /**
     * take the anchor (aka hash) and use it as filter to
     * show only entries with a given tag
     */
    window.onhashchange = function () {
        if (typeof window.location.hash !== 'string' || window.location.hash.length === 0)
        {
            clearFilter();
            return;
        }

        var tag = window.location.hash.substring(1);
        if (tag === "untagged") {
            $("#bookmarks").children().each(function () {
                var tags = $(this).attr('title');
                (typeof tags === 'undefined')
                    ? $(this).removeClass('filter-unmatched') : $(this).addClass('filter-unmatched');
            });
        } else {
            $("#bookmarks").children().each(function () {
                var tags = $(this).attr('title');
                // decodeURIComponent needed to handle special chars in tags
                ((typeof tags !== 'undefined') && (tags.toLowerCase().match(decodeURIComponent(tag))))
                    ? $(this).removeClass('filter-unmatched') : $(this).addClass('filter-unmatched');
            });
        }
        updateTitle();
    };

    /**
     * Search by title/url - case insensitive.
     */
    $("#fill").keyup(function () {
        filter = $("#fill").val().toLowerCase();

        $("#bookmarks").children().each(function () {
            var title = $(this).text().toLowerCase();
            var links = $(this).find("a");
            if (typeof links !== 'undefined')
            {
                links = links.attr("href").toLowerCase();
            }
            (title.match(filter) || links.match(filter) || filter === "")
                ? $(this).removeClass('search-unmatched') : $(this).addClass('search-unmatched');
        });
        updateTitle();
    });
});
