/*
 *  AVIM for Chrome based on avim.js by Hieu Tran Dang
 * 
 *	Copyright (C) 2011-2014 Nguyen Kim Kha <nkimkha (at) gmail (dot) com>
 * 
 * My changes is published by GPLv3.
 *
 * Changes:
 * 	- Make it work inside Chrome Extension
 * 	- Remove unused codes for other browsers (Firefox, IE,...)
 * 	- Add API for setting from popup.html
 */

/*
 *  AVIM JavaScript Vietnamese Input Method Source File dated 28-07-2008
 *
 *	Copyright (C) 2004-2008 Hieu Tran Dang <lt2hieu2004 (at) users (dot) sf (dot) net>
 *	Website:	http://noname00.com/hieu
 *
 *	You are allowed to use this software in any way you want providing:
 *		1. You must retain this copyright notice at all time
 *		2. You must not claim that you or any other third party is the author
 *		   of this software in any way.
 */
 
(function(window){
	var extension = chrome.extension;
	var document = window.document;
	var sendRequest = extension.sendMessage;
	var AVIMObj = '';
	
	var AVIMGlobalConfig = {
			method: 0, //Default input method: 0=AUTO, 1=TELEX, 2=VNI, 3=VIQR, 4=VIQR*
			onOff: 1, //Starting status: 0=Off, 1=On
			ckSpell: 1, //Spell Check: 0=Off, 1=On
			oldAccent: 1, //0: New way (oa`, oe`, uy`), 1: The good old day (o`a, o`e, u`y)
			useCookie: 0, //Cookies: 0=Off, 1=On
			exclude: ["email"] //IDs of the fields you DON'T want to let users type Vietnamese in
		};

	//Set to true the methods which you want to be included in the AUTO method
	var AVIMAutoConfig = {
		telex: true,
		vni: true,
		viqr: false,
		viqrStar: false
	};

	function AVIM()	{
		this.attached = [];
		this.changed = false;
		this.agt = navigator.userAgent.toLowerCase();
		this.support = true;
		this.ver = 0;
		this.specialChange = false;
		this.kl = 0;
		this.fID = document.getElementsByTagName("iframe");
		this.range = null;
		this.whit = false;
	
		this.support = true;
	
	}

	function fcc(x) {
		return String.fromCharCode(x);
	}
	
	function getSF() {
		var sf = [], x;
		for(x = 0; x < AVIMObj.skey.length; x++) {
			sf[sf.length] = fcc(AVIMObj.skey[x]);
		}
		return sf;
	}
	
	
	function ifMoz(e) {
		// Init code for editable iframes and divs
		var code = e.which, avim = AVIMObj.AVIM, cwi = e.target.parentNode.wi;
		if(typeof(avim) == "undefined") avim = AVIMObj;
		if(typeof(cwi) == "undefined") cwi = e.target.parentNode.parentNode.wi;
		if(typeof(cwi) == "undefined") cwi = window;
		if(e.ctrlKey || (e.altKey && (code != 92) && (code != 126))) {
            Module.UnikeyResetBuf();
            return;
        }
	
		// get current caret and its node
		var sel = cwi.getSelection();
		var range = sel.getRangeAt(0);
		var node = range.endContainer, newPos;
	
		avim.sk = fcc(code);
		avim.saveStr = "";

        Module.UnikeyFilter(code);

		if(checkCode(code) || !range.startOffset || (typeof(node.data) == 'undefined')) return;
		node.sel = false;
	
		if(node.data) {
			avim.saveStr = node.data.substr(range.endOffset);
			if(range.startOffset != range.endOffset) {
				node.sel=true;
			}
			node.deleteData(range.startOffset, node.data.length);
		}
	
		if(!node.data) {
			range.setStart(node, 0);
			range.setEnd(node, range.endOffset);
			sel.removeAllRanges();
			sel.addRange(range);
			return;
		}
	
		node.value = node.data;
		node.pos = node.data.length;
		node.which=code;
        var str = Module.Pointer_stringify(Module.getUnikeyBuf(), Module.getUnikeyBufChars());
		// start(node, e);
        var v = node.value;
        var pos = node.pos;

        var newpos = node.pos - Module.getUnikeyBackspaces() + str.length;
        if (str.length > 0) {
            var newstr = v.substr(0, pos - Module.getUnikeyBackspaces()) + str + v.substr(pos, v.length);
            AVIMObj.changed = true;
            if (node.data) node.data = newstr; 
            if (node.value) node.value = newstr; 
            if (node.innerText) node.innerText = newstr; 
        }


		node.insertData(node.data.length, avim.saveStr);
		newPos = node.data.length - avim.saveStr.length + avim.kl;
	
		// Set caret back to node
		range.setStart(node, newPos);
		range.setEnd(node, newPos);
		sel.removeAllRanges();
		sel.addRange(range);
	
		avim.kl = 0;
		if(avim.specialChange) {
			avim.specialChange = false;
			avim.changed = false;
			node.deleteData(node.pos - 1, 1);
		}
		if(avim.changed) {
			avim.changed = false;
			e.preventDefault();
		}
	}
	
	
	function checkCode(code) {
		if(((AVIMGlobalConfig.onOff === 0) || ((code < 45) && (code != 42) && (code != 32) && (code != 39) && (code != 40) && (code != 43)) || (code == 145) || (code == 255))) {
			return true;
		}
	}
	
	function findIgnore(el) {
		var va = AVIMGlobalConfig.exclude, i;
		for(i = 0; i < va.length; i++) {
			if((va[i].length > 0) && (el.name == va[i] || el.id == va[i])) {
				return true;
			}
		}
		return false;
	}
	
	function findFrame() {
		for(var i = 0; i < AVIMObj.fID.length; i++) {
			if(findIgnore(AVIMObj.fID[i])) return;
			AVIMObj.frame = AVIMObj.fID[i];
			if(typeof(AVIMObj.frame) != "undefined") {
				try {
					if (AVIMObj.frame.contentWindow.document && AVIMObj.frame.contentWindow.event) {
						return AVIMObj.frame.contentWindow;
					}
				} catch(e) {
					if (AVIMObj.frame.document && AVIMObj.frame.event) {
						return AVIMObj.frame;
					}
				}
			}
		}
	}
	
	function _keyPressHandler(e) {
        
		if(!AVIMObj.support) {
            Module.UnikeyResetBuf();
			return;
		}
	
		var el = e.target, code = e.which;

		if(e.ctrlKey) {
			return;
		}
		if(e.altKey && (code != 92) && (code != 126)) {
            Module.UnikeyResetBuf();
			return;
		}
		if((el.type != 'textarea') && (el.type != 'text')) {
			if (el.isContentEditable) {
				ifMoz(e);
			}
			return;
		}
		if (checkCode(code)) {
            Module.UnikeyResetBuf();
			return;
		}
		AVIMObj.sk = fcc(code);
		if(findIgnore(el)) {
            Module.UnikeyResetBuf();
			return;
		}
        Module.UnikeyFilter(code);
        var str = Module.Pointer_stringify(Module.getUnikeyBuf(), Module.getUnikeyBufChars());

        var obj = el;
		var v = (obj.data) ? obj.data : ( (obj.value) ? obj.value : obj.innerText );

		if(v.length <= 0) {
			return;
		}
		if(!obj.data) {
			if(!obj.setSelectionRange) {
				return false;
			}
			pos = obj.selectionStart;
		} else {
			pos = obj.pos;
		}

        var str = Module.Pointer_stringify(Module.getUnikeyBuf(), Module.getUnikeyBufChars());
        var newpos = pos - Module.getUnikeyBackspaces() + str.length;
        if (str.length > 0) {
            var newstr = v.substr(0, pos - Module.getUnikeyBackspaces()) + str + v.substr(pos, v.length);
            AVIMObj.changed = true;
            if (obj.data) obj.data = newstr; else
            if (obj.value) obj.value = newstr; else
            if (obj.innerText) obj.innerText = newstr; else AVIMObj.changed = false;
            obj.setSelectionRange(newpos, newpos);
        }

		if(AVIMObj.changed) {
			AVIMObj.changed = false;
			e.preventDefault();
			return false;
		}
		return;
	}

	function _keyUpHandler(evt) {
		var code = evt.which;
        
        if ( (code >= 37 && code <= 40) || (code == 13) )
            Module.UnikeyResetBuf();
	
		// Press Ctrl twice to off/on AVIM
		if (code == 17) {
			if (AVIMObj.isPressCtrl) {
				AVIMObj.isPressCtrl = false;
				sendRequest({'turn_avim':'onOff'}, configAVIM);
			} else {
				AVIMObj.isPressCtrl = true;
				// Must press twice in 300ms
				setTimeout(function(){
					AVIMObj.isPressCtrl = false;
				}, 300);
			}
		} else {
			AVIMObj.isPressCtrl = false;
		}
	}

	function _keyDownHandler(evt) {
		var key;
		if(evt == "iframe") {
			AVIMObj.frame = findFrame();
			key = AVIMObj.frame.event.keyCode;
		} else {
			key = evt.which;
		}
        if (key == 8) Module.UnikeyBackspacePress();
	}
	
	function keyUpHandler(evt) {
		_keyUpHandler(evt);
	}

	function keyDownHandler(evt) {
		_keyDownHandler(evt);
	}

	function keyPressHandler(evt) {
		var success = _keyPressHandler(evt);
		if (success === false) {
			evt.preventDefault();
		}
	}
	
	function attachEvt(obj, evt, handle, capture) {
		obj.addEventListener(evt, handle, capture);
	}

	function removeEvt(obj, evt, handle, capture) {
		obj.removeEventListener(evt, handle, capture);
	}
	
	function AVIMInit(AVIM, isAttach) {
		if(AVIM.support) {
			AVIM.fID = document.getElementsByTagName("iframe");
			for(AVIM.g = 0; AVIM.g < AVIM.fID.length; AVIM.g++) {
				if(findIgnore(AVIM.fID[AVIM.g])) {
					continue;
				}
				var iframedit;
				try {
					AVIM.wi = AVIM.fID[AVIM.g].contentWindow;
					iframedit = AVIM.wi.document;
					iframedit.wi = AVIM.wi;
					if(iframedit && (upperCase(iframedit.designMode) == "ON")) {
						iframedit.AVIM = AVIM;
						if (isAttach) {
							attachEvt(iframedit, "keypress", ifMoz, false);
							attachEvt(iframedit, "keydown", keyDownHandler, false);
						} else {
							attachEvt(iframedit, "keypress", ifMoz, false);
							attachEvt(iframedit, "keydown", keyDownHandler, false);
						}
					}
				} catch(e) {}
			}
		}
	}

	function AVIMAJAXFix(counter) {

		if (isNaN(parseInt(counter))) {
			counter = 0;
		} else {
			counter = parseInt(counter);
		}
		AVIMInit(AVIMObj, true);
		counter++;
		if (counter < 100) {
			setTimeout(function(){AVIMAJAXFix(counter);}, 100);
		}
	}

	function removeOldAVIM() {
		removeEvt(document, "mouseup", AVIMAJAXFix, false);
		removeEvt(document, "keydown", keyDownHandler, true);
		removeEvt(document, "keypress", keyPressHandler, true);
		removeEvt(document, "keyup", keyUpHandler, true);
		AVIMInit(AVIMObj, false);
		AVIMObj = null;
		//delete AVIMObj;
        Module.UnikeyCleanup();
	}

	function newAVIMInit() {
		if (typeof AVIMObj != "undefined" && AVIMObj) {
			removeOldAVIM();
		}
		AVIMObj = new AVIM();
		AVIMAJAXFix();
		attachEvt(document, "mouseup", AVIMAJAXFix, false);
		attachEvt(document, "keydown", keyDownHandler, true);
		attachEvt(document, "keyup", keyUpHandler, true);
		attachEvt(document, "keypress", keyPressHandler, true);
	}
	
	function configAVIM(data) {
		if (data) {
			AVIMGlobalConfig.method = data.method;
            // if (AVIMGlobalConfig.method == 0) Module.UnikeySetInputMethod(Module.UkInputMethod.UkViqr);
            // if (AVIMGlobalConfig.method == 1) Module.UnikeySetInputMethod(Module.UkInputMethod.UkTelex);
            // if (AVIMGlobalConfig.method == 2) Module.UnikeySetInputMethod(Module.UkInputMethod.UkVni);
			AVIMGlobalConfig.onOff = data.onOff;
			AVIMGlobalConfig.ckSpell = data.ckSpell;
			AVIMGlobalConfig.oldAccent = data.oldAccent;
		}
	
		newAVIMInit();
	}

	sendRequest({'get_prefs':'all'}, configAVIM);

	extension.onMessage.addListener(function(request, sender, sendResponse){
		configAVIM(request);
	});

})(window);
