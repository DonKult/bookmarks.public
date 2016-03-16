(function () {
    "use strict";
    const forEach = (selector, callback) => {
        const array = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
        for (let i = 0; i < array.length; ++i)
            callback(array[i], i, array);
    };
    const createTag = taglist => tag => {
        tag = tag.replace(/(^\s+|\s+$)/g, '');
        if (tag.length === 0)
            return;
        const a = document.createElement('a');
        a.classList.add('tagfilter');
        a.href = '#' + encodeURIComponent(tag);
        a.textContent = tag;
        const li = document.createElement('li');
        li.appendChild(a);
        taglist.appendChild(li);
    };
    /**
     * This function collects each distinct tag,
     * stripping whitespace, and placing into sorted order.
     */
    const populateTags = () => {
        const tagset = new Set();
        forEach('#bookmarks > li', mark => {
            let tag = mark.title;
            if (typeof tag !== 'undefined') {
                if (tag.match(",")) {
                    tag.split(",").forEach(nm => {
                        nm = nm.replace(/(^\s+|\s+$)/g, '');
                        tagset.add(nm.toLowerCase());
                    });
                } else {
                    tag = tag.replace(/(^\s+|\s+$)/g, '');
                    tagset.add(tag.toLowerCase());
                }
            }
        });
        [...tagset].sort().forEach(createTag(document.querySelector('#autotags')));
    };
    /**
     *  Used by showTags()
     *  @param entry    the bookmark to be decorated
     *  @param tag      the list of tags to add to the entry
     */
    const decorate = (entry, tag) => {
        const ul = document.createElement('ul');
        ul.classList.add('taglist');
        tag.toLowerCase().split(",").forEach(createTag(ul));
        if (ul.children.length !== 0)
            entry.appendChild(ul);
    };
    /**
     * Append the list of tags beneath each bookmark, for easy viewing.
     */
    const showTags = () => {
        forEach("#bookmarks > li", entry => {
            if (typeof entry.title !== 'undefined')
                decorate(entry, entry.title);
        });
    };
    /**
     * Remove the list of tags beneath each bookmark, so that the file can be saved back.
     */
    const hideTags = () => {
        forEach(".taglist", entry => {
            entry.parentNode.removeChild(entry);
        });
    };
    /**
     * Toggles the visibility of the tags below the links
     */
    const toggleTags = () => {
        const checkbox = document.getElementById("TagsCheck");
        if (checkbox.checked === true)
            showTags();
        else
            hideTags();
    };
    /**
     * Sort the items in the UL which contains our bookmarks.
     */
    const sortBookmarks = () => {
        const bookmarks = document.querySelector('#bookmarks');
        [...bookmarks.children].sort((a,b) => {
            return a.textContent.toUpperCase().localeCompare(b.textContent.toUpperCase());
        }).forEach(child => bookmarks.appendChild(child));
    };
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
    const addFavIcons = () => {
        const bookmarks = document.querySelector('#bookmarks');
        const faviconBaseURI = bookmarks.getAttribute('data-favicon-baseuri');
        if (typeof faviconBaseURI !== 'string' || faviconBaseURI.length === 0)
            return;
        const regexHostname = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
        forEach(bookmarks.children, itm => {
            if (typeof itm.firstChild === 'undefined' || typeof itm.firstChild.href !== 'string')
                return;
            const favicon = document.createElement("img");
            // errors in the host extraction are indicating wrong URLs
            const hostname = itm.firstChild.href.match(regexHostname);
            if (typeof hostname === 'undefined' || hostname === null || hostname.length <= 1)
            {
                // FIXME: Firefox/Iceweasel specific URI
                favicon.setAttribute('src', 'chrome://global/skin/icons/warning-16.png');
                favicon.setAttribute('style', 'background-color: red');
            }
            else
                favicon.setAttribute('src', faviconBaseURI + hostname[1].toString() + '.ico');
            favicon.classList.add('favicon');
            itm.insertBefore(favicon, itm.firstChild);
        });
    };
    /**
     * Show the number of visible bookmarks in the titlebar.
     */
    const updateTitle = () => {
        const count = document.querySelectorAll("#bookmarks > li:not(.filter-unmatched)").length;
        const plural = ((count === 0) || (count > 1)) ? 's' : '';
        document.title = count + " visible bookmark" + plural;
    };
    /**
     * Bind event handlers...
     */
    /**
     * take the anchor (aka hash) and use it as filter to
     * show only entries with a given tag
     */
    const onHashChange = () => {
        if (typeof window.location.hash !== 'string' || window.location.hash.length === 0) {
            forEach('#bookmarks > li.filter-unmatched', li => li.classList.remove('filter-unmatched'));
            updateTitle();
            return;
        }

        // decodeURIComponent needed to handle special chars in tags
        const tag = decodeURIComponent(window.location.hash.substring(1).toLowerCase());
        if (tag === "untagged") {
            forEach('#bookmarks > li', li => {
                if (li.title)
                    li.classList.add('filter-unmatched');
                else
                    li.classList.remove('filter-unmatched');
            });
        } else {
            forEach('#bookmarks > li', li => {
                if (li.title && li.title.toLowerCase().match(tag))
                    li.classList.remove('filter-unmatched');
                else
                    li.classList.add('filter-unmatched');
            });
        }
        updateTitle();
    };
    /**
     * Search by title/url - case insensitive.
     */
    const onKeyUpOfSearchbar = () => {
        const filter = document.getElementById('fill').value.toLowerCase();
        forEach('#bookmarks > li', li => {
            const title = li.textContent;
            let links = li.querySelector('a');
            if (links)
                links = links.href.toLowerCase();
            else
                links = "";
            if (title.match(filter) || links.match(filter) || filter === "")
                li.classList.remove('search-unmatched');
            else
                li.classList.add('search-unmatched');
        });
        updateTitle();
    };
    /**
     * Code the launches at page-load-time:
     */
    const onPageLoad = () => {
        if (document.readyState === 'loading')
            return;
        document.removeEventListener('readystatechange', onPageLoad);
        if (document.getElementById('bookmarks').classList.contains('sort'))
            sortBookmarks();
        addFavIcons();
        populateTags();
        onHashChange();

        const flag = document.querySelector('#TagsCheck');
        if (flag !== null && flag.checked === true)
            toggleTags();
        flag.addEventListener('click', toggleTags);

        window.addEventListener('hashchange', onHashChange);
        document.querySelector("#fill").addEventListener('keyup', onKeyUpOfSearchbar);
    };
    if (document.readyState === 'loading')
        document.addEventListener('readystatechange', onPageLoad);
    else
        onPageLoad();
})();
