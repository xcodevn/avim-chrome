(function(window){
	function setAVIMConfig(key, value) {
		var obj = {'save_prefs':'all'};
		if (key == 'method') {
			obj = {'save_prefs':'all', 'method' : value, 'onOff' : 1};
		}
		if (key == 'onOff') {
			obj = {'save_prefs':'all', 'onOff' : value};
		}
		chrome.extension.sendMessage(obj, function(response){
			window.location.reload();
		});
	}
	
	function getI18n(message) {
		return chrome.i18n.getMessage(message);
	}
	
	function loadText() {
		var keys = ["Sel", "Telex", "Vni", "Off", "Tips", "TipsCtrl", "Demo", "DemoCopy"];
		for (var k in keys) {
			$g("txt" + keys[k]).innerHTML = getI18n("extPopup" + keys[k]);
		}
	}

	function $g(id) {
		return document.getElementById(id);
	}
	
	function init() {
		loadText();
		
		var offEle = $g("off");
		var telexEle = $g("telex");
		var vniEle = $g("vni");
		
		chrome.extension.sendMessage({'get_prefs':'all'}, function(response){
			if (response.onOff === 0) {
				offEle.checked = true;
			} else {
				if (response.method === 1) {
					telexEle.checked = true;
				} else {
					vniEle.checked = true;
				}
			}
		});
		
		offEle.addEventListener("click", function(){setAVIMConfig('onOff', 0);});
		// viqrEle.addEventListener("click", function(){setAVIMConfig('method', 0);});
		telexEle.addEventListener("click", function(){setAVIMConfig('method', 1);});
		vniEle.addEventListener("click", function(){setAVIMConfig('method', 2);});
		
		setTimeout(function(){
			$g("inputDemo").focus();
		}, 1000);
		
	}
	
//	window.onload = init;
	init();
})(window);
