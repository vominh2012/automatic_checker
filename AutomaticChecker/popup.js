//
//  Created by HuanTran on 11/14/15.
//  Copyright (c) 2015 Home. All rights reserved.
//

var Commander = {
  sendCommandToActiveTab : function(req) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  var tab = tabs[0];
	  if (tab) {
		if (tab.url && tab.url.startsWith('chrome://')) return 0;
		chrome.tabs.sendMessage(tab.id, req);
	  }

    });
  }
};

function getElementById(id)
{
  return document.getElementById(id);
}

function add_change_event_listener(el, callback)
{
	el.addEventListener("change", callback);
	el.addEventListener("keypress", callback);
	el.addEventListener("paste", callback);
	el.addEventListener("input", callback);
}

var PopupView = function() {
  this.initialize();
}

PopupView.prototype.initialize = function() {
  // initialze controls
  var _this = this;
  this.txtStep = getElementById("txt_step");
  this.txtFrom = getElementById("txt_from");
  this.txtTo = getElementById("txt_to");
  this.btnCheckAll = getElementById("btn_check_all");
  this.chkCheckbox = getElementById("chk_checkbox");
  this.chkRadio = getElementById("chk_radio");
  this.cboMethod = getElementById("cbo_method");
  
  add_change_event_listener(this.txtStep, function() {_this.save_settings()});
  add_change_event_listener(this.txtFrom, function() {_this.save_settings()});
  add_change_event_listener(this.txtTo, function() {_this.save_settings()});
  add_change_event_listener(this.chkCheckbox, function() {_this.save_settings()});
  add_change_event_listener(this.chkRadio, function() {_this.save_settings()});
  add_change_event_listener(this.cboMethod, function() {_this.save_settings()});
  
  _this.btnCheckAll.addEventListener("click", function() { 
    _this.checkAll();
  });

  _this.btnUncheckAll = getElementById('btn_uncheck_all');
  _this.btnUncheckAll.addEventListener("click", function() { 
    _this.uncheckAll();
  });

  _this.btnInvert = getElementById('btn_invert');
  _this.btnInvert.addEventListener("click", function() {
    _this.invert();
  });
}

PopupView.prototype.prepareCommand = function(command, user_options)
{
  var request = {
    command : command,
    user_options : user_options
  };
  return request;
}

PopupView.prototype.sendCommand = function(command, user_options)
{
  var request = {
    'command' : command,
    'user_options' : user_options
  };
  Commander.sendCommandToActiveTab(request);
}

const TypeSelected = {
	TYPE_CHECKBOX : 1,
	TYPE_RADIO : 2
};

const ButtonAction = {
	ACTION_CHECK : 1,
	ACTION_UNCHECK : 2,
	ACTION_INVERT : 4,
};

PopupView.prototype.get_ui_input_types = function() {
  var input_types = 0;
  if (this.chkCheckbox.checked) {
	  input_types |= TypeSelected.TYPE_CHECKBOX;
  }
  if (this.chkRadio.checked) {
	  input_types |= TypeSelected.TYPE_RADIO;
  }
  return input_types;
}

PopupView.prototype.doAction = function(action)
{
  var step = this.txtStep.valueAsNumber
  var from = this.txtFrom.valueAsNumber;
  var to = this.txtTo.valueAsNumber;
  
  var input_types = this.get_ui_input_types();
  var method = this.cboMethod.value;
  
  var user_options = { 'action' : action, 'input_types' : input_types, 'step' : step, 'from' : from, 'to' : to , 'method'  : method};
  this.sendCommand("do_the_work", user_options);
}

PopupView.prototype.checkAll = function() {
  this.doAction(ButtonAction.ACTION_CHECK);
}

PopupView.prototype.uncheckAll = function() {
  this.doAction(ButtonAction.ACTION_UNCHECK);
}

PopupView.prototype.invert = function() {
  this.doAction(ButtonAction.ACTION_INVERT);
}

PopupView.prototype.save_settings = function() 
{
  var input_types = this.get_ui_input_types();
  var config = {
    'input_types': input_types,
    'step': this.txtStep.valueAsNumber,
	'from': this.txtFrom.valueAsNumber,
	'to': this.txtTo.valueAsNumber,
	'method': this.cboMethod.value,
  };

  chrome.storage.sync.set(config, function() {
      //console.log("Saved settings");
  });
}

PopupView.prototype.load_settings = function() {
  var _this = this;
  chrome.storage.sync.get({
    'input_types': 1,
    'step': 1,
	'from': 1,
	'to': 99999,
	'method' : 1,
  }, function(items) {
    //console.log(items);
	_this.chkCheckbox.checked = items.input_types & TypeSelected.TYPE_CHECKBOX;
	_this.chkRadio.checked = items.input_types & TypeSelected.TYPE_RADIO;
    _this.txtStep.value = items.step;
	_this.txtFrom.value = items.from;
	_this.txtTo.value = items.to;
	_this.cboMethod.value = items.method;
  });
}

var popupView = 0; 

document.addEventListener('DOMContentLoaded', function() {
  if (!popupView) {
	  popupView = new PopupView();
  }
  
  popupView.load_settings();
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  var tab = tabs[0];
	  if (tab) {
		if (tab.url && tab.url.startsWith('chrome://')) return 0;
		//chrome.scripting.executeScript({target: {tabId: tab.id, allFrames : true},files: ['content_script.js']});
		
		chrome.webNavigation.getAllFrames({
		  tabId: tab.id
		}, (frames) => {
		    const frameIds = frames.map((f) => f.frameId);

		  chrome.scripting.executeScript({target: { tabId: tab.id, frameIds: frameIds },files: ['content_script.js']});
		});
	  }
  });
});
