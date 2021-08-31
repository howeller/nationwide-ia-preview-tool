<?php

function getCSV( $reCache = false ) {
  if( !function_exists( 'cacheFeed' ) ) {
    function cacheFeed() {
    // Get CSV from live sheet
    $csvFeed = @file_get_contents( $GLOBALS['config']['feedSheet'] );
    if( $csvFeed === false ) {
      error_log( 'cacheFeed() - Error reading live FeedSheet' );
      throw new Exception( 'Error reading live FeedSheet. Try again, or contact support' );
    }

    // Check for empty feed
    if( trim( $csvFeed ) == '' ) {
      error_log( 'cacheFeed() - Error reading live FeedSheet - received no results' );
      throw new Exception( 'Error reading live FeedSheet - received no results. Try again, or contact support' );
    }
    
    // Save to cache file
    try {
      file_put_contents( $GLOBALS['config']['cacheFile'], $csvFeed );
    } catch( Exception $e ) {
      error_log( 'cacheFeed() - Error caching live FeedSheet - '.$e->getMessage() );
      throw new Exception( 'Error caching live FeedSheet. Try again, or contact support' );
    }
    
    return( true );
  }
  }
  
  if( $reCache ) {
    cacheFeed();
  }
  
  $csvFeed = @file_get_contents( $GLOBALS['config']['cacheFile'] );
  if( $csvFeed === false ) {
    error_log( 'getCSV() - Error reading cached FeedSheet - Trying to get live Feed' );
    cacheFeed();
    $csvFeed = @file_get_contents( $GLOBALS['config']['cacheFile'] );
    if( $csvFeed === false ) {
      error_log( 'getCSV() - Error reading cached FeedSheet - Failed 2nd try of getting live feed' );
      throw new Exception( 'Error caching live FeedSheet. Try again, or contact support' );
    }
  }
  
  $csvRows = explode( "\n", $csvFeed );
  $csvHeader = str_getcsv( array_shift( $csvRows ) );
  $csvData = array();
  foreach( $csvRows as $row ) {
    $rowArray = str_getcsv( $row );
    $currentBanner = $rowArray[0];
    foreach( $rowArray as $index => $value ) {
      if( strpos( $csvHeader[$index], "_css" ) > 0 ) {
        if( trim( $value ) != '' ) {
          $csvArray = array_map( 'trim', str_getcsv( $value ) ) ;
          $valueArray = [];
          foreach( $csvArray as $csvValue ) {
            $valueArray[] = '"'.$csvValue.'"';
          }
          $value = implode( ',', $valueArray );
        }
      }
      $csvData[$currentBanner][$csvHeader[$index]] = $value;
    }
  }
  return( $csvData );
}

function renderTemplate( $handle, $data, $print = true ) {
  $smarty = new Smarty();
  $smarty->left_delimiter = '[[';
  $smarty->right_delimiter = ']]';
  $smarty->caching = 0;
  $smarty->assign( "data", $data );
  $code = $smarty->fetch( $handle );
  if( $print ) {
    print( $code );
  } else {
    return( $code );
  }
}

function pError( $string ) {
  header( 'Content-type: text/plain' );
  print $string;
}

?>