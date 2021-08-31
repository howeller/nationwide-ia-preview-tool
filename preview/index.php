<?php
require( 'config.inc' );
require( 'functions.inc' );
require( 'vendor/autoload.php' );

$data = [];
$templates = [];

// Load banner templates
foreach( glob( 'templates/'.$GLOBALS['config']['templatePrefix'].'*' ) as $file ) {
  if( preg_match( '/([0-9]+x[0-9]+)/', $file, $matches ) == 1 ) {
    $templates[$matches[1]] = basename( $file );
  }
}

if( isset( $_REQUEST['recache'] ) ) {
  getCSV( true );
  header( 'Refresh:0; url='.$_SERVER['HTTP_REFERER'] );
}

try {
  $rawBanners = getCSV();
  foreach( $rawBanners as $banner => $attributes ) {
    if( empty( $attributes['Banner_ID'] ) ) {
      continue;
    }
    $data['values'][$banner] = array_merge( $attributes );
    
    list( $width, $height ) = explode( 'x', $attributes['Creative_Dimension'] );
    $data['values'][$banner]['_width'] = $width;
    $data['values'][$banner]['_height'] = $height;
    
    if( isset( $templates[$attributes['Creative_Dimension']] ) ) {
      $data['values'][$banner]['_preview'] = true;
    }
  }
  $data['cacheTime'] = date ("F d Y H:i:s.", filemtime( $GLOBALS['config']['cacheFile'] ) );
} catch( Exception $e ) {
  $data['errors'] = $e->getMessage();
}

renderTemplate( 'master/bannerlist.tpl', $data );
?>
