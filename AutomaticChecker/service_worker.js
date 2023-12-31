const ButtonAction = {
	ACTION_CHECK : 1,
	ACTION_UNCHECK : 2,
	ACTION_INVERT : 4,
};

function do_the_work(command, tab_id)
{
  chrome.storage.sync.get({
    'input_types': 1,
    'step': 1,
    'from': 1,
	'to': 99999,
	'action' : 0,
	'method' : 1,
  }).then((items) => {
	  // Copy the data retrieved from storage into user_options.
	var user_options = {};
	Object.assign(user_options, items);
	if (command == 'command_check') {
		user_options.action = ButtonAction.ACTION_CHECK;
	}
	else if (command == 'command_uncheck') {
		user_options.action = ButtonAction.ACTION_UNCHECK;
	}
	else if (command == 'command_invert') {
		user_options.action = ButtonAction.ACTION_INVERT;
	}
	
	var request = {
		'command' : 'do_the_work',
		'user_options' : user_options
	};
	chrome.tabs.sendMessage(tab_id, request);
  });

}

chrome.commands.onCommand.addListener((command) => {
  //console.log(`Command "${command}" triggered`);
  if (command) 
  {
	  chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
		  var tab = tabs[0];
		  if (tab) {
			if (tab.url && tab.url.startsWith('chrome://')) return 0;
			
			chrome.webNavigation.getAllFrames({ tabId: tab.id }, (frames) => {
				const frameIds = frames.map((f) => f.frameId);
				chrome.scripting.executeScript({target: { tabId: tab.id, frameIds: frameIds },files: ['content_script.js']});
				
				do_the_work(command, tab.id);
			});
		  }
	  });
  }
});