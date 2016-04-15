/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
	'use strict';

	// Grab a reference to our auto-binding template
	// and give it some initial binding values
	// Learn more about auto-binding templates at http://goo.gl/Dx1u2g
	

	let app = document.querySelector('#app');
	
	/**
	 * localization start 
	 */
	
	// for dom if binding, if localization data is not ready then main dom should not render
	// just render setting and toast boxes 
	app.localizationReady =false;

	app.setGlobalValues = function(){
		var setting = document.querySelector('#setting');
		if(setting.globals){
			app.basicUrl = setting.globals.basicUrl;
			app.user = setting.globals.user;
		};
	};
	//get locale from user
	app.getUserLocale = function () {
		 return (app.user&&app.user.locale)?app.user.locale:null; 
	};

	//get locale from browser
	app.getBrowserLocale = function () {
		var locale;

		locale = navigator.language||navigator.userLanguage;
		locale = locale=="ko"?"ko-KR": locale;

		return  locale;
	};

	//make locale value 
	app.getLocale = function (user) {
		app.locale = app.getUserLocale()?app.getUserLocale():app.getBrowserLocale();
		return app.locale;
	};

	//for localization xhr request, use terminologies/resource 
	app.getRequestValue = function(){
		var requestValue= {};
		if(app.user){
			requestValue = {"domain" : app.user.domain_id,
							"locale" : app.getLocale()};
		}else{
			requestValue = {"domian":1}
		}

		return JSON.stringify(requestValue);
	};

	app.computeUrl = function(){
		return app.basicUrl+'/terminologies/resource';
	};

	app.getLocalizationInfo = function () {
		//1. a sign global values to app;
		app.setGlobalValues();
		
		//2. create xhr requesst
		var xhr = new XMLHttpRequest();
		xhr.open('POST', app.computeUrl() , true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.withCredentials = true;
		
		//3. make domain object and send request
		xhr.send(app.getRequestValue());

		//4. monitor xhr request response and status, change localization ready value to true and 
		//   let index file to render menu and main contents
		xhr.onreadystatechange = function (Evt) {
			if (xhr.readyState == 4) {
				if(xhr.status == 200){
					app.langs = JSON.parse(xhr.responseText);
					app.terminologies = app.langs[app.locale];
					app.localizationReady =true;
				}else{
					// console.log('Error localization xhr page');
					app.$.toast.text = 'Error localization xhr page';
    				app.$.toast.open();
				}
			}
		};
	};

	/**
	 * parameter with category and keyname
	 * returns translated value, if there's not translated data return "categroy.keyname"
	 */
	app.getString = function (category, keyname){
		var result = '"'+ category + '.'+ keyname+'"';
		var lang = app.terminologies;

		if(lang){
			if(lang[category]&&lang[category][keyname]){
				result = lang[category][keyname]
			}
		}else{
			app.$.toast.text = 'Translate object is not assigned!!';
			app.$.toast.open();
		}
		
		return result;
	};

	/** localization finish*/


	app.displayInstalledToast = () => {
		// Check to make sure caching is actually enabled—it won't be in the dev environment.
		if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
			Polymer.dom(document).querySelector('#toast').text = 'Caching complete! This app will work offline.';
			Polymer.dom(document).querySelector('#toast').show();
		}
	};

	// Listen for template bound event to know when bindings
	// have resolved and content has been stamped to the page
	app.addEventListener('dom-change', () => {
		// console.log('Our app is ready to rock!');
		// console.log(setting.globa)
		app.getLocalizationInfo();
		// app.localizationReady =true;
	});

	// See https://github.com/Polymer/polymer/issues/1381
	window.addEventListener('WebComponentsReady', () => {
		/* imports are loaded and elements have been registered */
		// console.log('Our web components are ready!');
	});

	// Main area's paper-scroll-header-panel custom condensing transformation of
	// the appName in the middle-container and the bottom title in the bottom-container.
	// The appName is moved to top and shrunk on condensing. The bottom sub title
	// is shrunk to nothing on condensing.
	window.addEventListener('paper-header-transform', e => {
		let appName = Polymer.dom(document).querySelector('.Main-headerTitle');
		let middleContainer = Polymer.dom(document).querySelector('.Main-headerMiddleContent');
		let bottomContainer = Polymer.dom(document).querySelector('.Main-headerBottomContent');
		let detail = e.detail;
		let heightDiff = detail.height - detail.condensedHeight;
		let yRatio = Math.min(1, detail.y / heightDiff);
		let maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
		let scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
		let scaleBottom = 1 - yRatio;

		// Move/translate middleContainer
		Polymer.Base.transform(`translate3d(0,${yRatio * 100}%,0)`, middleContainer);

		// Scale bottomContainer and bottom sub title to nothing and back
		Polymer.Base.transform(`scale(${scaleBottom}) translateZ(0)`, bottomContainer);

		// Scale middleContainer appName
		Polymer.Base.transform(`scale(${scaleMiddle}) translateZ(0)`, appName);
	});

	// Close drawer after menu item is selected if drawerPanel is narrow
	app.onDataRouteClick = function() {
		let drawerPanel = Polymer.dom(document).querySelector('#paperDrawerPanel');
		if (drawerPanel.narrow) {
			drawerPanel.closeDrawer();
		}
	};

	// Hide toastConfirm after tap on OK button 
	app.onToastConfirmTap = () => app.$.toastConfirm.hide();

	// Scroll page to top and expand header
	app.scrollPageToTop = () => { 
		app.$.headerPanelMain.scrollToTop(true) 
	};

})(document);
