// protect inject many times
if (!document.isInjectedCheckAllContentScript_V10_E2F5121A_4644_4A18_AB23_41BFAF8D205F)
{
	document.isInjectedCheckAllContentScript_V10_E2F5121A_4644_4A18_AB23_41BFAF8D205F = true;

	chrome.runtime.onMessage.addListener(function(req, sender, callback) {
		if ('command' in req) {
			var handler = messageHandlers[req.command]
			if (handler) {
				handler(req.user_options);
			}
		}
	});

	var checker = {};

	/*function isIframeAccessable(iframe)
	{
	    var key = ( +new Date ) + "" + Math.random();
	    try {
	        var global = iframe.contentWindow;
	        global[key] = "1";
	        return global[key] == "1";
	    }
	    catch( e ) {
	        return false;
	    }
	}
	*/

	const TYPE_SELECTED = {
		TYPE_CHECKBOX : 1,
		TYPE_RADIO : 2
	}

	const Action = {
		ACTION_CHECK : 1,
		ACTION_UNCHECK : 2,
		ACTION_INVERT : 4
	}
	
	checker.setControl = function(doc, user_options)
	{
		var need_invert = (user_options.action == Action.ACTION_INVERT);
		var check_value = (user_options.action == Action.ACTION_CHECK);;
		
		var query_string = "";
		if (user_options.input_types && TYPE_SELECTED.TYPE_CHECKBOX)
		{
			query_string += "input[type=checkbox],";
		}
		
		if (user_options.input_types && TYPE_SELECTED.TYPE_RADIO)
		{
			query_string += "input[type=radio],";
		}
		
		if (query_string != "") {
			query_string = query_string.slice(0, -1);
		}

		var controls = doc.querySelectorAll(query_string);
		for (var i = user_options.from - 1; i < controls.length && i < user_options.to; i+= user_options.step) {
			var item = controls[i];
			var checked = item.checked;
			if (need_invert)
		    	item.checked = !checked;
		    else if (checked != check_value)
		    	item.checked =  check_value;
		}

		// allFrames : true 
		// handle child iframe 
		/*var iframes = doc.querySelectorAll("iframe");
		for (i = 0; i < iframes.length; ++i) {
			if (!isIframeAccessable(iframes[i]))
				continue;
			var iframeDoc = iframes[i].contentWindow.document;
			checker.setControl(iframeDoc, queryString, selectType, step);
		} */
	}
	checker.do_the_work = function(user_options)
	{
		checker.setControl(document, user_options);
	};

	var messageHandlers = {
		"do_the_work" : checker.do_the_work,
	};
}