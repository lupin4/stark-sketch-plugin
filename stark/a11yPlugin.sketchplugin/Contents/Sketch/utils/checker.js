@import 'utils/nibui.js';

var COSCRIPT;

function checkContrast(context) {
  var sketch = context.api();
  var selection = sketch.selectedDocument.selectedLayers;
  log(selection);
  var currentArtboard = context.document.currentPage().currentArtboard();
  log(currentArtboard);
  var validSelection = validateSelection(selection, currentArtboard);
  log(validSelection);
  // Get colors to compare against
  var layers = selection.nativeLayers;
  var firstColor = getColor(layers[0]);
  var secondColor = selection.length == 1
    ? currentArtboard.backgroundColor()
    : getColor(layers[1]);

  if (selection.length == 1) {
    validSelection = !(currentArtboard.backgroundColor().alpha() < 1);
  } else {
    validSelection = !(firstColor.alpha() < 1);
  }

  if (validSelection) {

    // // Prepare the NIB so we can do stuff with the UI
    // COSCRIPT = [COScript currentCOScript];
    // [COSCRIPT setShouldKeepAround:true];
    // var defaults = [NSUserDefaults standardUserDefaults];
    // var nibui = new NibUI(context, 'UIBundle', 'ContrastCheckerNibUITemplate', [
    //   'mainWindow', 'clrLeft', 'clrRight',
    //   'lblNormalLeft', 'lblLargeBoldLeft', 'lblLargeLeft',
    //   'lblNormalRight', 'lblLargeBoldRight', 'lblLargeRight',
    //   'lblContrastValue',
    //   'lblNormalDoubleStatus', 'lblNormalTripleStatus',
    //   'lblLargeBoldDoubleStatus', 'lblLargeBoldTripleStatus',
    //   'lblLargeDoubleStatus', 'lblLargeTripleStatus'
    // ]);

    if (secondColor.alpha() < 1) {
      var newSecondColor = convertAlpha(firstColor, secondColor, secondColor.alpha());
      secondColor = [MSColor colorWithRed:newSecondColor[0]/255 green:newSecondColor[1]/255 blue:newSecondColor[2]/255 alpha:1];
    }

    // setColorBlocks(nibui, firstColor, secondColor);

    var contrastRatio = getContrastRatio(firstColor, secondColor);
    contrastRatio = Math.round(contrastRatio * 100) / 100;

    log(contrastRatio);
    // nibui.lblContrastValue.setStringValue(contrastRatio + ':1');
    //
    // setPassFailStatus(nibui, contrastRatio);

    // Make the window on top and keep it there
    // nibui.mainWindow.makeKeyAndOrderFront(null);
    // nibui.mainWindow.setLevel(NSFloatingWindowLevel);
    //
    // nibui.destroy();
  } else {
    sketch.alert("You must select no more than two layers of any combination of Text, Shapes, or Artboards", "Error");
  }
}

function validateSelection(layers, currentArtboard) {
  var isValid = true;
  if ((layers.length == 1 && currentArtboard) || layers.length == 2) {
    layers.iterate(function(layer) {
      if (layer.isGroup || layer.isImage || layer.isPage) {
        isValid = false;
      }
    });
  } else {
    isValid = false;
  }

  return isValid;
}

function getColor(layer) {
	var color;

  if (layer.class() == MSTextLayer) {
    color = layer.textColor();
  } else {
    color = layer.style().fills().firstObject().color();
  }

  return color;
}

function convertAlpha(color1, color2, alpha) {
  var weight = alpha * 100;

  var rgbArray2 = [color1.red(), color1.green(), color1.blue()];
  var rgbArray1 = [color2.red(), color2.green(), color2.blue()];

  var returnArray = [];
  for(var i = 0; i <= 2; i++) {
    var v1 = Math.round(rgbArray1[i] * 255);
    var v2 = Math.round(rgbArray2[i] * 255);

    returnArray.push(Math.floor(v2 + (v1 - v2) * (weight / 100.0)));
  }

  return returnArray;
}

// function setColorBlocks(nibui, firstColor, secondColor) {
//   var nsFirstColor = NSColor.colorWithRed_green_blue_alpha_(firstColor.red(), firstColor.green(), firstColor.blue(), firstColor.alpha());
//   var nsSecondColor = NSColor.colorWithRed_green_blue_alpha_(secondColor.red(), secondColor.green(), secondColor.blue(), secondColor.alpha());
//
//   // Left side
//   nibui.lblNormalLeft.setTextColor(nsFirstColor);
//   nibui.lblLargeBoldLeft.setTextColor(nsFirstColor);
//   nibui.lblLargeLeft.setTextColor(nsFirstColor);
//
//   nibui.clrLeft.setFillColor(nsSecondColor);
//
//   // Right side
//   nibui.lblNormalRight.setTextColor(nsSecondColor);
//   nibui.lblLargeBoldRight.setTextColor(nsSecondColor);
//   nibui.lblLargeRight.setTextColor(nsSecondColor);
//
//   nibui.clrRight.setFillColor(nsFirstColor);
// }

function getContrastRatio(firstColor, secondColor) {
  var rgb1 = getRgb(firstColor);
  var rgb2 = getRgb(secondColor);

  return (Math.max(rgb1, rgb2) + 0.05)/(Math.min(rgb1, rgb2) + 0.05);;
}

function getRgb(color) {
  var r = color.red();
  var g = color.green();
  var b = color.blue();

  return (0.2126 * calculateColor(r) + 0.7152 * calculateColor(g) + 0.0722 * calculateColor(b));
}

function calculateColor(color) {
  return (color <= 0.03928) ? color/12.92 : Math.pow(((color + 0.055)/1.055), 2.4);
}

// function setPassFailStatus(nibui, ratio) {
//   var passColor = NSColor.colorWithRed_green_blue_alpha_(36.0/255.0, 130/255.0, 50.0/255.0, 1.0);
//   var failColor = NSColor.colorWithRed_green_blue_alpha_(253.0/255.0, 21/255.0, 27.0/255.0, 1.0);
//
//   // Normal
//   setLabelStatus(nibui.lblNormalDoubleStatus, ratio, 4.5);
//   setLabelStatus(nibui.lblNormalTripleStatus, ratio, 7);
//
//   // Large Bold
//   setLabelStatus(nibui.lblLargeBoldDoubleStatus, ratio, 3);
//   setLabelStatus(nibui.lblLargeBoldTripleStatus, ratio, 4.5);
//
//   // Large
//   setLabelStatus(nibui.lblLargeDoubleStatus, ratio, 3);
//   setLabelStatus(nibui.lblLargeTripleStatus, ratio, 4.5);
// }

// function setLabelStatus(label, ratio, minRatio) {
//   var passColor = NSColor.colorWithRed_green_blue_alpha_(36.0/255.0, 130/255.0, 50.0/255.0, 1.0);
//   var failColor = NSColor.colorWithRed_green_blue_alpha_(253.0/255.0, 21/255.0, 27.0/255.0, 1.0);
//   var meetsRequirement = ratio >= minRatio);
//
//   label.setStringValue(meetsRequirement ? "PASS" : "FAIL");
//   label.setTextColor(meetsRequirement ? passColor : failColor);
// }
