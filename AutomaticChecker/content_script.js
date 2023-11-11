// protect inject many times
if (!document.isInjectedCheckAllContentScript_V11_E2F5121A_4644_4A18_AB23_41BFAF8D205F)
{
	document.isInjectedCheckAllContentScript_V11_E2F5121A_4644_4A18_AB23_41BFAF8D205F = true;

	var checker = {};

	const TypeSelected = {
		TYPE_CHECKBOX : 1,
		TYPE_RADIO : 2
	}

	const Action = {
		ACTION_CHECK : 1,
		ACTION_UNCHECK : 2,
		ACTION_INVERT : 4
	}
	
	const Method = {
		SET : 1,
		CLICK: 2,
		CLICK_EVENT: 4,
		MOUSE_OVER_CLICK: 8,
	}
	
	function event_fire(doc, el, etype) {
		var event_obj = new MouseEvent(etype, {bubbles: true, cancelable: true,});
		return el.dispatchEvent(event_obj);
	}

	function event_mouse_click(doc, el, is_mouse_over=false) {
		if (is_mouse_over) {
			event_fire(doc, el, 'mouseover');
		}
		event_fire(doc, el, 'click');
	}
	function interact_method(doc, el, method, val = false) {
		if (method == Method.SET) 
		{
			el.checked = val;
		}
		else if (method == Method.CLICK)
		{
			el.click();
		} 
		else if (method == Method.CLICK_EVENT || method == Method.MOUSE_OVER_CLICK)
		{
			var need_mouse_over =  (method == Method.MOUSE_OVER_CLICK);
			setTimeout(event_mouse_click(doc, el, need_mouse_over));
		}
	}
	
	checker.setControl = function(doc, user_options)
	{
		var need_invert = (user_options.action == Action.ACTION_INVERT);
		var need_check = (user_options.action == Action.ACTION_CHECK);;
		
		var query_string = "";
		if (user_options.input_types && TypeSelected.TYPE_CHECKBOX)
		{
			query_string += "input[type=checkbox],";
		}
		
		if (user_options.input_types && TypeSelected.TYPE_RADIO)
		{
			query_string += "input[type=radio],";
		}
		
		if (query_string != "") {
			query_string = query_string.slice(0, -1);
		}

		var controls = doc.querySelectorAll(query_string);
		
		var limit = controls.length;
		if (user_options.to > 0) {
			limit = Math.min(limit, user_options.to);
		} else {
			limit += user_options.to;
		}
		
		// ui offset start from 1
		var start_offset = user_options.from - 1;
		if (start_offset < 0)
			start_offset = controls.length + start_offset;

		for (var i = start_offset; i < limit; i+= user_options.step) {
			var item = controls[i];
			var checked = item.checked;
			var new_val = checked;
			if (need_invert) 
			{
				new_val = !checked;
			} 
			else if (need_check)
			{
				new_val = true;
			}
			else 
			{
				new_val = false;
			}
			
			if (checked != new_val) 
			{
				interact_method(doc, item, user_options.method, new_val);
			}
		}
	}
	checker.do_the_work = function(user_options)
	{
		checker.setControl(document, user_options);
	};

	var messageHandlers = {
		"do_the_work" : checker.do_the_work,
	};
	
	chrome.runtime.onMessage.addListener(function(req, sender, callback) {
		if ('command' in req) {
			var handler = messageHandlers[req.command]
			if (handler) {
				handler(req.user_options);
			}
		}
	});

}