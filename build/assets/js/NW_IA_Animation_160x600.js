var tl = gsap.timeline({ defaults:{ paused:false, duration:0.5, ease:'power3.out' }});// GSAP 3!

var initBanner = (function(){

	var _json, aniStyle, aniOptions, aniProps, initCompleted, isRibbon, isLogoSlide, isTextOnly, theme, useDefaultTheme,
		cta, end, imgLoader, replay, ribbon, svg, swipeSpeed,
		version='1.0.0';// Major.Minor.Bug Fix

		/*
		* List of NW campaign color names/values from style guide
		*/
		var nwColors = {
			'black':					'#000000',
			'coolgray8': 			'#87898b',
			'darkblue':				'#141b4d',
			// 'darkmint': 			'#008775',
			'lightblue':			'#8cc8e9',
			'lightmint' : 		'#6eceb2',
			'mediumblue':			'#1f74db',
			'nwblue':					'#1c57a5',
			'vibrantblue':		'#0047bb',
			'white':					'#ffffff'
		};
	
		/*
		* Preprogrammed Style Combos
		*/
		var themeMap = {
			'DarkBlue-White': {
				bgColor: 'darkblue',
				ctaBtnColor: 'mintgreen',
				ctaTxtColor: 'darkblue',
				logoColor: 'white',
				ribbonColor: 'lightblue',
				ribbonTxtColor: 'darkblue',
				replayColor: 'white',
				txtColor: 'white',
				swipeColor: 'lightblue'
			},
			'VibrantBlue-White':{
				bgColor: 'vibrantblue',
				ctaTxtColor: 'darkblue',
				logoColor: 'white',
				ribbonColor: 'darkblue',
				ribbonTxtColor: 'white',
				replayColor: 'white',
				txtColor: 'white',
				// stripeColor: false,
				swipeColor: 'mediumblue'
			},
			'VibrantBlue-White-EndStripe':{
				bgColor: 'vibrantblue',
				ctaTxtColor: 'darkblue',
				logoColor: 'white',
				ribbonColor: 'darkblue',
				ribbonTxtColor: 'white',
				replayColor: 'white',
				txtColor: 'white',
				stripeColor: 'darkblue',
				swipeColor: 'mediumblue'
			},
			'White-DarkBlue': {
				bgColor: 'white',
				ctaBtnColor: 'mintgreen',
				ctaTxtColor: 'darkblue',
				logoColor: '3 Color',
				ribbonColor: 'darkblue',
				ribbonTxtColor: 'white',
				replayColor: 'darkblue',
				txtColor: 'darkblue',
				swipeColor: 'darkblue'
			}
		};
	/*
	*	Utility / Helper Functions
	*/
	function cl(txt, color){console.log('%c '+txt,'background: rgba(51, 255, 0, 0.3); color:'+(color||'white')+';'); }
	function id(id){return document.getElementById(id); }
	function toCssNum(num){return num.toString()+'px'; }
	function isObject(obj) {return obj !== null && typeof obj === 'object';}
	function isString(obj) {return typeof obj === 'string';}
	function isArraylike(obj){
		return isObject(obj) && typeof obj.length === 'number' && obj.length > 0; // Returns false for empty arrays, which is fine for our purposes
	}
	function hasObjProp(obj) {
		return isObject( obj ) && Object.keys(obj).length > 0 && Object.keys(obj)[0] !== null;// Checks to see if object has properties
	}
	function swapClasses(element, classToRemove, classToAdd ){
		element.classList.remove(classToRemove);//String
		element.classList.add(classToAdd);
	}
	function getPercentage(num1, num2){
		// return Math.round((num1 / num2)*100) // whole number
		 return Math.ceil((num1 / num2)*100)/100; // Decimal rounded to 100th
	}
	function removeSpaces(str){
		return str.replace(/\s/g,''); 
	}
	
	/* 
	* feedDataHandling.js version 0.1.0
	*/
	/*
	*	Create Object with custom property/value pair from string
	*/
	function makeKeyValuePair(str){
		str = removeSpaces(str);// Remove spaces from the string 
		var _obj = {},
				_split = str.split(':'),
				_key = _split[0],
				_value = _split[1];
	
		_obj[_key] = _value;
		return _obj;
	}
	
	/*
	*	Apply Custom CSS to div/span element listed as object property:value pair from Object.keys method
	*/
	function setObjPropToCss(element, obj){
		// cl("	* setObjPropToCss "+gsap.getProperty(element,'id'));
		Object.keys(obj).forEach(function (key){
			var _value = (isString(obj[key])) ? obj[key] : toCssNum(obj[key]);// Convert JSON _key numbers to CSS string
			element.style[key] = _value; // Apply key & value to DOM element
			cl("		"+" "+key+":"+_value);
		})
	}
	
	/*
	*	Apply Custom CSS to div/span element listed in Array from feed
	*/
	function applyFeedCss(element, propsArray){
		cl("* applyFeedCss "+gsap.getProperty(element,'id')+" "+propsArray);
	
		if (isArraylike(propsArray)){
			propsArray.forEach(function(_str){
				var _obj = makeKeyValuePair(_str);
				setObjPropToCss(element, _obj);
			});
		}//else{cl("	NO CUSTOM CSS!")}
	}
	
	/*
	*	Apply dynamic text to divs & apply (if any) custom css from feed
	*/
	function setTxt(div, txt, css, data){
		var _feedCss = isArraylike(css),
				_jsonData =(data && hasObjProp(data));
		// cl("-setTxt *txt: "+txt/*+" *_feedCss? "+_feedCss+" *_jsonData? "+_jsonData*/);
	
		txt = txt.split(' <br>').join('<br>');// Remove spaces before <br> because Safari counts the whitespace in offsetWidth measurements.
		// cl("-	: "+txt, 'red');
		div.innerHTML = txt;
	
		if (_jsonData){
			// Used for most sizes to set txt div height
			setObjPropToCss(div, data);// Apply JSON props to div
		}
		if (_feedCss){
			applyFeedCss(div, css);// Apply custom CSS if any. Can overwrite json props if needed.
		}
	}
	
	/*
	* Grabs image src from Dynamic Feed and applies attributes listed in the JSON file.
	* element : The existing element (div, img, svg image) you wish to target.
	* data : Pass in the image attributes as an object from feed CSS array or JSON obj
	* url (Optional) : The image URL provided from dynamic feed.
	*/
	function setImgStart(element, data, url){
		// Check if there's a JSON obj and if it contains custom values. Otherwise use defaults.
		var _useFeedCss = isArraylike(data),
				_useJsonData = (!_useFeedCss && hasObjProp(data)),
				_isExternalImg = (url && isString(url)); // false for embedded SVG logo and replay
	
		if(_isExternalImg){
			imgLoader.total++;
		}
		
		// Need to bind the onload event handler before you set the src attribute.
		element.onload = function(){
			imgLoader.completed++;
			cl(element.tagName+' #'+imgLoader.completed+'/'+imgLoader.total+' LOADED!');
			imgAsyncLoadCheck();
		}
		// element.onload = cl('LOAD '+element.tagName+' #'+imgLoader.completed+'/'+imgLoader.total);
	
		if(element.tagName == 'IMG'){
			// cl('LOAD <IMG> '+url, 'red');
			element.src = url;
		}
		else if (element.tagName == 'image') {
			// cl('LOAD SVG <IMAGE> #'+imgLoader.total, 'red');
			element.setAttribute('href', url);
			// element.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', url);
		}
		// cl('setImgStart : '+gsap.getProperty(element,'id')+' _useFeedCss ? '+_useFeedCss+' _useJsonData? '+hasObjProp(data));
		// cl('element.tagName: '+element.tagName,'red')
	
		(_useJsonData) ? setObjPropToCss(element, data) : (_useFeedCss) ? applyFeedCss(element, data) : null;/*cl('	Use Default CSS')*/;
	}
	
	/* 
	*	Validate & Convert Color Name to Hex Number. Only accepting limited colors
	*/
	function colorNameToHex(color){
		// cl('colorNameToHex: '+color);
		if (!color) return false;
		
		var _color = removeSpaces(color).toLowerCase(); // Remove spaces and capital letters
		
		return (typeof nwColors[_color] != 'undefined') ? nwColors[_color] : false;
	}
	
	/* 
	*	Validate Hex Number
	*/
	function checkHex(color){
		return (/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color)) ? color : false;
	}
	
	/* 
	*	Validate Hex or valid nwColor name
	*/
	function colorCheck(color){
		return (checkHex(color) || colorNameToHex(color));
	}
	function getPath(direction) {
		// cl('		> getPath '+direction);
		var path={
			// fromBottomRightStart: 'polygon(100% 0%, 210% 0, 0% 210%, 0% 100%, 0% 0%)',// Corner to corner shape
			// fromBottomRightEnd: 'polygon(100% 0%, 100% -110%, -110% 100%, 0% 100%, 0% 0%)',// Corner to corner shape
			fromBottomLeftStart: 'polygon(0% 0%, -110% 0%, 100% 200%, 100% 100%, 0% 100%)', // Corner to corner shape
			fromBottomLeftEnd: 'polygon(0% 0%, 0% -110%, 200% 100%, 100% 100%, 0% 100%)', // Corner to corner shape
			wipeInFromLeftStart:'polygon(-166% 0%, -33% 0%, 0% 100%, -133% 100%)',// Uses parallel shape
			wipeInFromRightStart:'polygon(100% 0%, 233% 0%, 266% 100%, 133% 100%)',// Uses parallel shape
			// wipeInEnd:'polygon(-33% 0%, 100% 0%, 133% 102%, 0% 102%)'// Uses parallel shape
			wipeInEnd:'polygon(-87px 0%, 100% 0%, 133% 102%, 0% 102%)'// Uses parallel shape
		}
		// path.fromTopRightEnd = path.fromBottomLeftStart;// fromTopRightEnd is reverse of fromBottomLeftStart
		// path.fromTopRightStart = path.fromBottomLeftEnd;// fromTopRightStart is reverse of fromBottomLeftEnd
		path.wipeOutToLeft = path.wipeInFromLeftStart;
	
		return path[direction];
	} 
		
	function fadeInContainerTl(){return gsap.timeline({paused:false}).to('#banner', { autoAlpha:1, duration:0.4 }); }
	
	function emptyTl(){return gsap.timeline({paused:true})}
	function updateStripeClass(className) {
		id('nc-stripe').classList.add(className);
		id('end-stripe').classList.add(className);
	}
	
	function nGraphicIntroTl() {
		cl('	+ nGraphicIntroTl ','red');
		end.container.style.overflow = 'hidden';
		updateStripeClass('ng-stripe');
	
		return gsap.timeline({paused:false})
			.set(aniProps.container, {visibility:'visible'})
			.add(fadeInContainerTl())
			.from(svg.nGraphic, { scale:0, duration:0.5, ease:'back.out(1.5)'},'+=1')
			.set(aniProps.t1, {visibility:'visible'})
			.fromTo(aniProps.t1, {clipPath: getPath('wipeInFromLeftStart')}, {clipPath: getPath('wipeInEnd'), duration:1})
			// .fromTo(end.container, {clipPath:getPath('fromBottomLeftStart')}, {clipPath:getPath('fromBottomLeftEnd'), duration:1 })
			.add('f2out', '+='+dc.Txt1_Pause)
			.fromTo(aniProps.t1, {clipPath: getPath('wipeInEnd') }, {clipPath: getPath('wipeOutToLeft'), duration:1 }, 'f2out');
	}
	
	function nCropIntroTl() {
		cl('	+ nCropIntroTl ','red');
		var _maskScale2 = 4.73, // From PSD
			_maskX1 = -474, // Get number from PSD
			_maskY1 = -705, // Get number from PSD
			_picScale2 = 1.15,//1.48,
			_zoomSpeed = 0.7;
	
		end.container.style.top = id('nc-t1-container').style.top = '201px';// Move copy up
		end.container.style.height = '399px'
		end.t2.style.paddingTop = '33px';
		aniOptions.NGraphic.t1.style.visibility = 'hidden';
		updateStripeClass('nc-stripe');
	
		return gsap.timeline({paused:false})
			.set('.mask-path', {fill:colorNameToHex(theme.bgColor)})
			.set('#svgStripePath', {fill:colorNameToHex(theme.swipeColor)})
			.set('.fake-mask', {scale:_maskScale2, x:_maskX1, y:_maskY1, transformOrigin:'0% 0%'})
			.set([aniProps.imgBack], {skewX:0.1})
			.set(aniProps.container, {visibility:'visible'})
			.add(fadeInContainerTl())
			.add('f2', '+=1')
			.to('#nc-pic-back', { scale: _picScale2, transformOrigin:'50% 50%', duration:_zoomSpeed, ease:'back.out(1.7)', force3D:true}, 'f2')
			.fromTo(aniProps.t1, {clipPath: getPath('wipeInFromLeftStart') }, {clipPath: getPath('wipeInEnd'), duration:1})
			.add('f2out', '+='+dc.Txt1_Pause)
			.fromTo(end.container, {clipPath:getPath('fromBottomLeftStart')}, {clipPath:getPath('fromBottomLeftEnd'), duration:1 }, 'f2out')
	}
	
	function txtOnlyIntroTl() {
		cl('	+ txtOnlyIntroTl ','red');
		swapClasses(replay.container, 'relay-n', 'replay-to');
		updateStripeClass('to-stripe');
	
		// Wipe in t1 > Pause > Reverse wipe out
		return gsap.timeline({paused:false})
			.set([aniProps.container,aniProps.t1], {visibility:'visible'})
			.add(fadeInContainerTl())
			.fromTo(aniProps.t1, {clipPath: getPath('wipeInFromLeftStart') }, {clipPath: getPath('wipeInEnd'), duration:1, repeat: 1, repeatDelay:dc.Txt1_Pause, yoyo: true })
	}
	
	function defaultSwipeTl() {
		// cl('	 defaultSwipeTl ');
		var _swipeWidth = aniProps.swipe.getBBox().width,
			_centerX = 80 - (_swipeWidth/2);
	
		return _tl = gsap.timeline({paused:false})
			.set(aniProps.swipe, {visibility: 'visible'})
			.fromTo(aniProps.swipePath, { x:-_swipeWidth }, { x:_centerX, duration:swipeSpeed, ease:'power1.out'})
			.to(aniProps.swipePath, { x:160, duration:swipeSpeed, ease:'power1.in'});
	}
	
	function animate() {
		cl(':: animate :: 160x600');
		
		swipeSpeed = 1;
	
		var _introTl = aniProps.frame1Tl(), // Get intro TL to use
				_endSwipeTl = defaultSwipeTl();//aniProps.endSwipeTl();// Choose standard vs masked SVG swipe 
	
		tl
			.add(_introTl)
			.add('end', aniProps.overlap)
			.fromTo('#t2', {clipPath: getPath('wipeInFromLeftStart')}, {clipPath: getPath('wipeInEnd'), duration:1, ease:'power3.easein' }, 'end')
			.set([cta.btn, cta.txt],{skewX:0.1}, 'end')
			.fromTo(cta.btn, {clipPath: getPath('wipeInFromLeftStart')}, {clipPath: getPath('wipeInEnd'), duration:1 },'-=0.5')
			.add(_endSwipeTl, '+=0.5')
			.add(ctaBounceTl(), "-="+swipeSpeed)
			.from(replay.container, { autoAlpha: 0 })
			.add(initReplayAction)
			.add('cta')
			.add(ctaBounceTl(), "+=1")
			.add(initCtaAction)
			// tl.pause("3");
			// .seek('end')
			// .seek(_introTl.labels[_introTl.previousLabel()]);
			;
		console.log('Animation Runtime is ' + tl.endTime());
	}

	/*
	* Initial Setup & load calls after Enabler and dynamic content has loaded in initial.js
	* Assign all divs as var, define main timeline, define imported JSON
	*/

	function initBanner(){
		cl('initBanner :: v.'+version);
		var _feedTheme = removeSpaces(dc.BgTheme);

		aniStyle = removeSpaces(dc.Ani_Style);
		
		// Do not modify colors if any customizations are entered in the feed.
		useDefaultTheme = (_feedTheme === 'VibrantBlue-White-EndStripe' && !dc.TxtColor && !dc.RibbonColor && !dc.RibbonTxtColor && !dc.ReplayColor);
		
		theme = themeMap[_feedTheme]; //Get color choices

		isRibbon = (dc.RibbonTxt.length > 0);//cl('isRibbon ? '+isRibbon, 'red');

		isTextOnly = (aniStyle === 'TextOnly');


		cl('useDefaultTheme ? '+useDefaultTheme, 'red');

		_json = (dc.Banner_json.Url) ? myJson.data['160x600'][dc.Color_Version][aniStyle] : {};

		svg = {
			nGraphic: id('n-graphic'),
			nGraphicPath: id('n-graphic-path')
		}
		imgLoader = {
			total: 0,
			completed: 0,
			timerStarted: false
		}
		cta = {
			btn: id('cta'),
			txt: id('cta-txt'),
			container: id('cta-container')
		}
		end = {
			container: id('end-container'),
			t2: id('t2')
		}
		replay = {
			container: id('replay-container'),
			svg: id('replaySvg'),
			path: id('replayPath'),
			on: false,
			tween: {}
		}
		ribbon = {
			txt: id('ribbon-txt'),
			container: id('ribbon')
		}

		aniOptions = { 
			'NGraphic':{
				frame1Tl: nGraphicIntroTl,
				container: id('ng-parent'),
				t1: id('t1'),
				overlap: _json.overlap || '-=0.3',
				imgBack: id('ng-pic-back'),
				imgFront: id('ng-pic-front'),
				swipe: id('ng-end-swipe'),
				swipePath: id('ng-swipe-path'),
				// endSwipeTl: defaultSwipeTl,
				newEndPos:false
			},
			'NCrop':{
				frame1Tl: nCropIntroTl,
				container: id('nc-parent'),
				t1: id('nc-t1'),
				overlap: _json.overlap || '-=0.5',
				imgBack: id('nc-pic-back'),
				replayClass:'replay-nc',
				swipe: id('nc-end-swipe'),
				swipePath: id('nc-swipe-path'),
				// endSwipeTl: clippedSwipeTl,
				newEndPos:true
			},
			'TextOnly':{
				frame1Tl: txtOnlyIntroTl,
				container: id('end-container'),
				t1: id('t1'),
				overlap: _json.overlap || '+=0.1',
				replayClass:'replay-to',
				swipe: id('to-end-swipe'),
				swipePath: id('to-swipe-path'),
				// swipePath: document.querySelector('svg#to-end-swipe polygon.swipe-class'),
				// endSwipeTl: defaultSwipeTl,
				newEndPos:true
			}
		}

		aniProps = aniOptions[aniStyle]; // Assign properties unique to the 3/4 animation options

		var _btn = id('clicker');
		_btn.addEventListener('click', clickOut, false);
		_btn.setAttribute('aria-label', dc.CtaTxt); /* ADA Compliance */

		// FIRE!
		initImgs();
		initColors();
		initTxt();
		initADACompliance();
		initLogo();//setRibbonSize();
		initReplay();
		initCompleted = true;
		cl('* initCompleted *');	
	}

	/*
	* Convert all color names in feed to hex #s and assign defaults if none are entered.
	*/
	function initColors(){
		if(useDefaultTheme) return;
		cl('+initColors ','pink');

		// Apply colors: Look at feed customizations 1st
		aniProps.t1.style.color = end.t2.style.color = colorCheck(dc.TxtColor||theme.txtColor);
		ribbon.txt.style.color = colorCheck(dc.RibbonTxtColor||theme.ribbonTxtColor);
		ribbon.container.style.backgroundColor =  colorCheck(dc.RibbonColor||theme.ribbonColor);
		replay.path.style.fill = colorCheck(dc.TxtColor||theme.txtColor);

		// Set defaults from the theme (not customizable)
		cta.txt.style.color = theme.ctaTxtColor;
		cta.btn.style.backgroundColor = theme.ctaBtnColor;
		end.container.style.backgroundColor = id('banner').style.backgroundColor = colorNameToHex(theme.bgColor);

		gsap.set('.swipe-path', {fill:colorNameToHex(theme.swipeColor)})
		
		if(theme.stripeColor && !isRibbon) {
			gsap.set('.stripe',{backgroundColor:colorNameToHex(theme.stripeColor)/*, opacity:1*/})
		}else{
			gsap.set('.stripe',{visibility:'hidden'})
		}
	}


	/*
	* If Ribbon text is more lines than the height of a single line then redraw the polygon. 
	* Need to manually calculate the slope (M) = (y2 - y1) / (x2 - x1)
	*/
	function setRibbonSize(){
		if(ribbon.container.offsetHeight <= 18){return;}
		cl('setRibbonSize	NEW RIBBON HEIGHT '+ribbon.container.offsetHeight+' <= 18', 'red');
		cl(Math.ceil(ribbon.container.offsetHeight / 18)+' Lines of text', 'red');

		var _slope = -1.0,//-1.03225806//-1.055555556
			_height = ribbon.container.offsetHeight,
			_xOffset = 5,
			_newPaddingRight = Math.abs(_height / _slope) + _xOffset;
		cl('	_height: '+_height+'\n	_startWidth: '+ribbon.container.scrollWidth+'\n	 NEW RIGHT PADDING: '+_newPaddingRight,'pink');
		// cl('	.getBoundingClientRect(): '+ribbon.container.getBoundingClientRect().width+'\n	scrollWidth: '+ribbon.container.scrollWidth+'\n	 clientWidth: '+ribbon.container.clientWidth+'\n	 gsap width: '+gsap.getProperty(ribbon.container, 'width'),'pink');

		gsap.set(ribbon.txt, { paddingRight: _newPaddingRight });
		// cl(document.fonts.check('1em proxima-nova'), 'black');
		
		var _x2 = ((_height * _slope) + ribbon.container.scrollWidth).toString();

		ribbon.container.style.clipPath = 'polygon(0% 0%, '+_x2+'px 0%, 100% 100%, 0% 100%)';
	}
	function initLogo(){
		cl('initLogo ','yellow');
		if(isRibbon){
			// cl(' BUMP UP LOGO','yellow');
			swapClasses(id('logo'), 'logo-no-ribbon', 'logo-over-ribbon');
		}
	}
	/*function setLogoColor(){

		switch(theme.logoColor){
			case 'white':
				gsap.set(['#logoWordmark', '#logoN', '#logoEagle'], { fill: '#ffffff' })
				gsap.set('#logoEagleStroke', { alpha: 0 })
				break;
			case '2color':
				gsap.set( ['#logoEagle','#logoWordmark'] , {fill:"#ffffff"});
				gsap.set( ['#logoN','#logoEagleStroke'], {fill:"#1658a5"});
				break;
			default:
				break;
		}
	}*/

	function initTxt(){
		cl('initTxt ');

		if(isTextOnly){
			gsap.set([end.container, id('nc-t1-container')], {top:'0px'});// Move copy up
			gsap.set(end.container, {height:'100%'});
			gsap.set('.txt-container', {top:'98px', paddingTop:0 });
			swapClasses(aniProps.t1, 'ng-t1', 'to-t1');
			swapClasses(end.t2, 'ng-t2', 'to-t2');
		}

		if(isRibbon){
			setTxt(ribbon.txt, dc.RibbonTxt, dc.RibbonTxt_css);
			ribbon.container.style.opacity = 1;
			setRibbonSize();
		}

		setTxt(cta.txt, dc.CtaTxt, dc.CtaTxt_css);
		setTxt(aniProps.t1, dc.Txt1, dc.Txt1_css);
		setTxt(end.t2, dc.Txt2, dc.Txt2_css);
		applyFeedCss(cta.btn, dc.CtaBtn_css);
	}

	function initADACompliance(){
		cl('initADACompliance');
		var t1Container = (aniStyle === 'NCrop') ? id('nc-t1-container') : id('t1-container');
		t1Container.removeAttribute('aria-hidden');

		aniProps.t1.setAttribute('role', "heading");
		aniProps.t1.setAttribute('aria-level', 1);
	}

	function initImgs(){
		cl('initImgs');
		setImgStart(id('logo'), dc.Logo_img_css, dc.Logo_img.Url);// PASS CSS OR JSON ???
		if(!isTextOnly){
			setImgStart(aniProps.imgBack, null, dc.Back_img.Url);
			if(aniStyle === 'NGraphic'){ setImgStart(aniProps.imgFront, null, dc.Front_img.Url);}
		};
	}

	function imgAsyncLoadCheck(){
		cl('imgAsyncLoadCheck '+imgLoader.completed+'/'+imgLoader.total);

		if (imgLoader.completed === imgLoader.total && initCompleted){
			clearTimeout(imgLoader.timer);
			animate();
			return;
		}
		else if(!imgLoader.timerStarted){
			imgLoader.timerStarted = true;
			imgLoader.timer = setTimeout(imgAsyncLoadCheck, 50);
		}
	}
	
	
	function ctaBounceTl(){
		return gsap.timeline({paused:false, repeat: 1, repeatDelay: 0, yoyo: true})
			.to(cta.btn,{scale:1.15, duration:.3, ease:'back.in(1.7)', force3D:false, overwrite:false});		
	}
	/*
	*	CTA Button interactions
	*/
	function onCtaOver(){
		return gsap.timeline({paused:false})
			.to(cta.btn,{scale:1.15, duration:.3, ease:'back.in(1.7)', force3D:false, overwrite:false});		
	}
	function onCtaOut(){
		return gsap.timeline({paused:false})
			.to(cta.btn,{scale:1.0, duration:.3, ease:'back.out(1.7)', force3D:false, overwrite:false});		
	}
	
	function initCtaAction(){
		// cl("initCtaAction ");
		clicker.addEventListener('mouseover', onCtaOver);
		clicker.addEventListener('mouseout', onCtaOut);
		cta.btn.addEventListener('click', clickOut, false); /* ADA Compliance */
	}
	/*
	*	Replay Button actions :; replay.js v.2.0
	*/
	
	function initReplay(){
		cl('initReplay ');
			
		if(aniProps.replayClass){
			swapClasses(replay.container, 'relay-n', aniProps.replayClass);
		}
		setImgStart(replay.svg, dc.Replay_css);// Set props of replay svg
		gsap.set(replay.container, {'visibility':'visibile', rotation:0});
	}
	
	function initReplayAction(){
		cl('initReplayAction');
		replay.tween = {spinSpeed:0.6, speed:0.3, tweenFrom:{autoAlpha:0}, delay:0};
	
		replay.container.addEventListener('click', onReplayClick, false);
		replay.container.addEventListener('mouseenter', onReplayOver);
		replay.container.addEventListener('mouseleave', onReplayOut);
		// id('banner').addEventListener('mouseleave', onReplayOut);
	}
	function onReplayClick() { 
		tl.restart();
		replay.container.blur();
	}
	
	function onReplayOver() {
		if (replay.on) return;
		replay.on = true;
		gsap.to(replay.svg, { duration:replay.tween.spinSpeed, alpha: 1 });
		gsap.to(replay.svg, { duration:replay.tween.spinSpeed, rotate: '+=360_cw', repeat: -1, transformOrigin: 'center center', ease:'none' });
	}
	function onReplayOut() {
		replay.on = false;
		var _r = gsap.getProperty(replay.svg, 'rotate'),// GSAP 3!
				_newR = (_r < 360) ? 360 : '+=' + (720 - _r).toString();
	
		gsap.to(replay.svg, { duration:replay.tween.spinSpeed, alpha: 0.6, rotate: _newR, transformOrigin: 'center center', overwrite:true, ease: 'Power1.out', onComplete: function() { gsap.set(replay.svg, { rotation: 0 }); } });
	}
	return initBanner();
});