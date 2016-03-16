# bookmarks.public

Simple HTML page spiced up with JavaScript to collect and manage your bookmarks
independent of your specific browser.

This repository is a non-converging fork of [Steve Kemps original version](https://github.com/skx/bookmarks.public)
with various changes and patches.


# Features

* split out JavaScript into an extra file for simpler updates
* more semantic markup for tags (which is also better to style individually)
* support showing a favicon from a pre-built collection
* make sorting of bookmarks and tags toggling run conditionally on startup via markup
* handle #untagged and no-selected tag via hashchange as well
* search in the tag-filtered list
* VanillaJS requiring just recent browsers instead of an external JQuery


# Rationale

I don't like online (bookmark) services and the built-in facilities of my
preferred browser doesn't suit my needs either.

Steve Kemps presented a solution to this with [bookmarks.public](https://github.com/skx/bookmarks.public),
which is basically just a HTML file with some JavaScript magic embedded that
can be easily managed and synced via git.


# Adding bookmarks via shellscripts

	sed -i "/<!-- THE END OF BOOKMARKS -->/ i \
		<li${TAGS}><a href=\"${URL}\">${TITLE}</a></li>" "$FILE"


# non-converging?

Compare [this](https://github.com/DonKult/bookmarks.public/commit/dd9faa58477a6b71d2eb384153c3b13a5ee8b89a) and [this](https://github.com/DonKult/bookmarks.public/commit/1010544acc9b37fbd4f1f0c6869bffc13c31058d) commit and figure it out on your own.
