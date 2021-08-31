<?php
date_default_timezone_set ( 'America/New_York' );
error_reporting(E_ALL);
ini_set('display_errors', 1);

$config = [
  'feedSheet' => 'https://docs.google.com/spreadsheets/d/1xPr3z7CbQViAzTy1D4a7lMR6yXcGhWxeR6KVbfEcw_M/export?format=csv&gid=1494579635',
  'cacheFile' => 'cache/FeedSheet.csv',
  'templatePrefix' => 'NW_2021_Dyn_Brand_',
  'googleAssetPath' => 'https://s0.2mdn.net/creatives/assets/4087743/',
  'googleJsPath' => 'https://s0.2mdn.net/creatives/assets/4087879/',
  'localAssetPath' => '../build/assets/',
  'localImagePath' => '../build/assets/images/'
];

?>