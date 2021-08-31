<?php
require( 'config.inc' );
require( 'functions.inc' );
require( 'vendor/autoload.php' );

$bannerID = ( isset( $_REQUEST['bannerid'] ) ? $_REQUEST['bannerid'] : '' );
if( $bannerID == '' ) {
  pError( 'Banner ID not set. Nothing to preview' );
}

$csvData = getCSV();
if( !isset( $csvData[$bannerID] ) ) {
  pError( 'Banner ID '.$bannerID.' not found in feedsheet' );
}

$data = $csvData[$bannerID];
$data['googleAssetPath'] = $GLOBALS['config']['googleAssetPath'];
$data['googleJsPath'] = $GLOBALS['config']['googleJsPath'];
$data['localAssetPath'] = $GLOBALS['config']['localAssetPath'];
$data['localImagePath'] = $GLOBALS['config']['localImagePath'];

$template = 'templates/'.$GLOBALS['config']['templatePrefix'].$data['Creative_Dimension'].'/index.html';

renderTemplate( $template, $data );
?>