var windows = {};

function previewWindow( url, width, height ) {
  var name = 'bannerPreview',
  		buttonPadding = 30;

  height += buttonPadding;

  var previewWindow = windows[name];
  if( previewWindow ) {
      previewWindow.close();
      delete windows[name];
  }

  windows[name] = window.open( url, name,'toolbar=no,location=no,status=no,menubar=no,scrollbars=no,resizable=no,width='+width+',height='+height );
}

function reloadClean() {
  window.location = window.location.pathname+'?recache';
}