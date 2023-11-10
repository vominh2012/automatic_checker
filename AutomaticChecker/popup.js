//
//  Created by HuanTran on 11/14/15.
//  Copyright (c) 2015 Home. All rights reserved.
//

var Commander = {
  sendCommandToActiveTab : function(req) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, req, function(response) {
        //console.log(response.result);
      });
    });
  }
};


function getElementById(id)
{
  return document.getElementById(id);
}

var PopupView = function() {
  this.initialize();
}

PopupView.prototype.initialize = function() {
  // initialze controls
  this.txtStep = getElementById("txt_step");
  this.txtFrom = getElementById("txt_from");
  this.txtTo = getElementById("txt_to");
  this.btnCheckAll = getElementById("btn_check_all");
  this.chkCheckbox = getElementById("chk_checkbox");
  this.chkRadio = getElementById("chk_radio");

  var _this = this;
  this.btnCheckAll.addEventListener("click", function() { 
    _this.checkAll();
  });

  this.btnUncheckAll = getElementById('btn_uncheck_all');
  this.btnUncheckAll.addEventListener("click", function() { 
    _this.uncheckAll();
  });

  this.btnInvert = getElementById('btn_invert');
  this.btnInvert.addEventListener("click", function() {
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

const Action = {
	ACTION_CHECK : 1,
	ACTION_UNCHECK : 2,
	ACTION_INVERT : 4,
};

PopupView.prototype.doAction = function(action)
{
  var step = this.txtStep.valueAsNumber
  var from = this.txtFrom.valueAsNumber;
  var to = this.txtTo.valueAsNumber;
  
  var input_types = 0;
  if (this.chkCheckbox.checked) {
	  input_types |= TypeSelected.TYPE_CHECKBOX;
  }
  if (this.chkRadio.checked) {
	  input_types |= TypeSelected.TYPE_RADIO;
  }
  
  var user_options = { action : action,input_types : input_types, step : step, from : from, to : to };
  this.sendCommand("do_the_work", user_options);
  
  this.save_settings();
}

PopupView.prototype.checkAll = function() {
  this.doAction(Action.ACTION_CHECK);
}

PopupView.prototype.uncheckAll = function() {
  this.doAction(Action.ACTION_UNCHECK);
}

PopupView.prototype.invert = function() {
  this.doAction(Action.ACTION_INVERT);
}

PopupView.prototype.save_settings = function() {
  var input_types = 0;
  if (this.chkCheckbox.checked) {
	  input_types |= TypeSelected.TYPE_CHECKBOX;
  }
  if (this.chkRadio.checked) {
	  input_types |= TypeSelected.TYPE_RADIO;
  }
  
  var config = {
    'input_types': input_types,
    'step': this.txtStep.valueAsNumber,
	'from': this.txtFrom.valueAsNumber,
	'to': this.txtTo.valueAsNumber,
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
  }, function(items) {
    //console.log(items);
	if (items.input_types && TypeSelected.TYPE_CHECKBOX)
		_this.chkCheckbox.checked = true;
	if (items.input_types && TypeSelected.TYPE_RADIO)
		_this.chkRadio.checked = true;
    _this.txtStep.value = items.step;
	_this.txtFrom.value = items.from;
	_this.txtTo.value = items.to;
  });
}

var popupView = 0; 

document.addEventListener('DOMContentLoaded', function() {
  if (!popupView) {
	  popupView = new PopupView();
	  popupView.load_settings();
  }
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  var tab = tabs[0];
	  if (tab) {
		chrome.scripting.executeScript({target: {tabId: tab.id, allFrames : true},files: ['content_script.js']});
	  }
  });
});
