<img src="http://nwemailhost.com/img/fays2018/logo_2x.png" alt="" width="200"/>

## Nationwide Insurance Dynamic Independent Agent 

### Table of Contents
1. [Project Links](#project-links)
2. [Dev overview](#dev-overview)
3. [Local Build Notes](#local-build-notes)
4. [Gulp Tasks](#gulp-tasks)
5. [Dynamic Build Notes](#dynamic-build-notes)
6. [Preview Tool Notes](#preview-tool-notes)
7. [Animation Notes](#animation-notes)
8. [Versioning](#versioning)
9. [ADA Compliance](#ada-compliance)


### Project Links

Google Studio | Internal
-------------|-----------
[Google Dynamic Profile ID&nbsp;10615014](https://www.google.com/doubleclick/studio/#ContentManagement/ProfileGuides:id=10024964&pr=10671564) | [Preview site](https://www.campaign.hogarthww.digital/ctus-nationwide/nationwide-h216652/preview/)
[Google Feed Sheet](https://docs.google.com/spreadsheets/d/19fokeHLH4s2s-O4h7hFQtM_xMMeHfnpYio12QXpGBco/edit?usp=sharing) | [NW Dynamic Portal](https://app.smartsheet.com/b/publish?EQBCT=70380f11c65145f0877331e26abd1ab4)
[Google Creatives In&nbsp;Studio](https://www.google.com/doubleclick/studio/#campaign:campaignId=60276429&advertiserId=42896968&ownerId=300648) | [JIRA - Main Build](https://hogarthdigital.atlassian.net/browse/CTUS-423)
[Google&nbsp;Asset&nbsp;Library](###) | 

### Dev overview

- Dynamic banners built for Google Studio and filtered by Dynamic Targeting Keys.
- Each shell has 3 preprogrammed animation styles (___N-Graphic___, ___N-Window___, and ___Text Only___). The 2 Leader sizes only have 2 options (___N-Crop___ & ___Text Only___).
- HTML, JS, & CSS assets are built with handlebars templates + helpers and compiled by gulp tasks.
- Uses a custom [preview tool](https://www.campaign.hogarthww.digital/ctus-nationwide/nationwide-h216652/preview/) to list every dynamic banner version on a single page. It allows you to update your edits without having to retransform the feed or wait for the Google CDN to update assets.
- Banners have been QA certified as ADA compliant.
---

### Local Build Notes

- All banners + preview site templates are compiled with handlebars templates via [gulp-compile-handlebars](https://www.npmjs.com/package/gulp-compile-handlebars)
- To run the gulp tasks run `npm install` from the command line to install `node_modules/` (not included in this repo)
- Be sure to edit `src/config.json` with your banner names and other infor that's specific to each banner (dimensions, logo to use, ect). 
- The preview tool is built in PHP and uses [SMARTY templates](https://www.smarty.net/) (not to be confused with the [handlebars templates](https://handlebarsjs.com)). The SMARTY templates use `[[placeholder]]` as placeholder delimiters  whereas handlebars uses `{{placeholder}}`. So we are essentially creating the SMARTY templates from the handlebars templates. Will probably update to use handlebars for all in the future.
- The preview site requires relative paths to the assets whereas the final HTML templates need to have the absolute Google Asset Library paths. Toggle this by setting the `useGoogleAssets` boolean depending which environment you intend to publish to. This could probably be improved for future builds.
- Use the following Gulp tasks to compile all templates into the final files.

### Gulp Tasks

| Task Name | What it Does
| :----: | :---
|`build:main` | Compiles final HTML & JS files for Google Studio environment.
|`build:preview` | Compiles HTML & JS SMARTY templates for our custom preview tool.
|`build:all` | Runs both **build** tasks.
|`clean:html` | Deletes all files from the `build/html/` folder.
|`clean:zips` | Deletes all files from the `build/zips/` folder.
|`clean` | Runs both **clean** tasks.
|`min` | Runs `build:main` and then minifies the JS files.
|`gulp` | Default task is set to the `build:all` task.
|`watch` | Automatically runs the `build:all` task if any files in `src/` change.
|`zip` | Makes zip files for all banners.

---
### Dynamic Build Notes

There are **3** built in options for passing customizations to each version after the HTML is live. At the moment we're not in need of using these, but this has been a carried over feature from previous dynamic jobs (which used lots of customizations).
1. In the **feed**, all columns in the dynamic ending in `_css` accept an array of value pairs. You can pass custom CSS properties to each version to make additional customizations if need be. For example an entry of `letterSpacing:-1px, fontSize: 12px, lineHeight: 14px` will apply these values to the paired property to that text object.
2. The **JSON file** in the asset library (assigned to the version inside the feed). Here you can create custom tweens to override the default in set inside each banners' JS file. Thus far, I've not had to use any JSON customizations like we have on previous projects.
3. The **JS file** inside the Asset Library (hardcoded in the HTML). Each banner loads a JS that lives in the Google Asset Library. That way we can make updates after the HTML banners have trafficked. To reduce load time, I minified the js file and is only is used in final build in Google Studio. The preview site uses the uncompressed js file for easy troubleshooting.

---
### Preview Tool Notes
To run/test the preview site locally - open a new command line window to the root of this project directory and run:
```cli
php -S localhost:8888
```
Then in your browser go to `http://localhost:8888/preview/index.php` and you should see the site.

Once the site is running you can make new versions or edits in your feed and then immediately review them by hitting the ___Refresh Feed___ button at the top of the page. You will need to hit the button each time you make edit the feed sheet.

---
### Animation Notes

- Animated with [GSAP 3.0](https://greensock.com/gsap/) timelines.
- Each animation type (N-Graphic, N-Window, ect.) is it's own timeline that's inserted into the beginning of the main timeline since all animations use the same ending.
- Tweens can be customized inside the json file (listed in the feed). Here you can create custom tweens to override the default in set inside each banners' JS file.
- Most of the transitions are created by animating a CSS `clip-path` shape around the div. The `getPath` function will return different shapes and you can tween between them. The box & skyscraper sizes create shapes the size on the banner and wipe form corner to corner. I found it helps to draw the shape on paper (using the coordinates in the `getPath` function) to see what the shape looks like in it's various positions and understand how the animation works.
```javascript
myTimeline.fromTo( '#myElement', { clipPath: getPath('wipeInEnd') }, { clipPath: getPath('wipeOutToLeft') })
````
- The leader sizes wipe from side to side using a shape with a set slope.
- The slope on the leader sizes is set as a global variable, and calculated using a handlebar helper `getSlope (x1, x2, y1, y2)`.
- The box sizes banners require 2 images cut to the same dimensions. A PNG in the foreground and a JPG in the background.

---
### Versioning
Creating versions requires 1) making and populating a new row in the feed and 2) loading the image assets in the local library (`build/assets/images/`) & [Google&nbsp;Asset&nbsp;Library](###). Even though I have built in the option to customize animation properties through the JSON file and CSS properties in the feed sheet, this project hasn't needed to do so after the first several batches of versions.

- Create images for **N-Graphic** and **N-Window** layouts:
    - There is a PNG in the foreground and a JPG in the background. 
    - Both files use the same dimensions and are @2x. 
    - Check the feed for the naming convention.

- Create image for **N-Crop** layouts:
    - Only a single background JPG is needed. 
    - We have a template PSD where you should be able to export an @2x jpg from. Easy peasy. 
    - List the image in the feed under the column `Back_img` and leave the `Front_img` cell blank. Otherwise Studio will throw an error.

- Create new row(s) in the Feed sheet:
	- I typically copy a previously created row and paste into a blank row. Be careful NOT to break the equation set in column I (Abbv). That will break all rows underneath.
  - All versions need a unique `Banner_ID` and `Reporting_Label`. 
  - You can add new concept & version names inside the drop down menus by adding them inside the `LookupTable` tab inside the feed doc.
  - Most copy should be able to "flow", but frame 1 on N-Window 300x250 an N Crop (both sizes) require "soft returns" (break tags) `<br>`.
  - Be careful copying and pasting text from the PSDs as they often include "soft returns" which will need to be removed or else the preview tool will throw errors. To avoid this simply paste the copy into a text editor and remove or replace the soft returns.
- Preview your changes.
  - Start up a [local preview site](#preview-tool-notes) and hit the `Refresh Feed` button at top to refresh the list & banners after every change in the feed sheet.

---
### ADA Compliance
These banners are built to be ADA compliant. As this was added in after the build there is more `div`s ammended with `aria-label`, `aria-level`, and `role` attributes.     
