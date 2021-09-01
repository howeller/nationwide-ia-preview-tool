<!DOCTYPE html>
<html lang="en">
<head>
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-174201828-1"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());

		gtag('config', 'UA-174201828-1');
	</script>
	<title>Nationwide Dynamic Banner Preview</title>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="stylesheet" href="local.css" />
	<script src="local.js"></script>
</head>
<body>
<div class="container">
	<div class="header">
		<h1>Nationwide Dynamic Banner&nbsp;Preview</h1>
		<img id="logo" src="http://nwemailhost.com/img/fays2018/logo_2x.png" alt="Nationwide&reg; Logo"/>
	</div>
		<p class="timestamp cool-gray8">
			<button type="button" class="button-cache" onclick="reloadClean();" />Refresh Feed</button>
			Feed Sheet cached: [[$data.cacheTime]]
		<p>		

	[[if isset($data.errors)]]
	<section id="errors">
		<h2>Errors:</h2>
		<ul>
			[[foreach from=$data.errors item=$error]]
			<li>[[$error]]</li>
			[[/foreach]]
		</ul>
	</section>
	[[/if]]
	
	[[if isset($data.values)]]
	<section id="list">
		<h2>Available Banners in <a href="https://docs.google.com/spreadsheets/d/19fokeHLH4s2s-O4h7hFQtM_xMMeHfnpYio12QXpGBco/edit?usp=sharing" target="_blank" style="text-decoration: underline;">Independent_Agent</a> Feed Sheet</h2>
		<table>
			<tr>
				<th>Banner ID</th>
				<th>Animation Style</th>
				<th>Dyn Targeting Key</th>
				<th>Status</th>
			</tr>
		[[foreach from=$data.values item=$banner name=loopy]]
			[[*if $banner.Color_Version=='T1' || $banner.Color_Version=='Opt1' || $banner.Color_Version=='Opt3']]
				[[$BUTTON_CLASS = 't1']]
			[[elseif $banner.Color_Version=='T2' || $banner.Color_Version=='Opt2' || $banner.Color_Version=='Opt4']]
				[[$BUTTON_CLASS = 't2']]
			[[/if*]]
			<tr>
				<td>[[if isset( $banner._preview ) ]]
					<a href="preview.php?bannerid=[[$banner.Banner_ID]]" onclick="previewWindow( this.href,[[$banner._width]],[[$banner._height]] );return false;" class="button-preview [[*$BUTTON_CLASS*]][[*( $smarty.foreach.loopy.index % 2) ? buttonEven : buttonO[[$BUTTON_CLASS]]dd*]]">
						[[$banner.Banner_ID]]
					</a>[[else]]
					<span class="no_template">(no template)</span>[[/if]]
				</td>
				[[*<!-- <td class="fays-black"><a href="preview.php?bannerid=[[$banner.Banner_ID]]" onclick="previewWindow( this.href,[[$banner._width]],[[$banner._height]] );return false;" class="[[$banner.CtaBtnColor|replace:' ':'-'|lower]]">[[$banner.Banner_ID]]</a></td> -->*]]
				<td class="vibrantblue">[[$banner.Ani_Style]]</td>
				<td class="mediumblue">[[$banner.Targeting_Key]]</td>
				[[*<!-- <td class="">[[$banner.Concept]]</td> -->*]]
				[[if $banner.Active == 'TRUE']]<td class="accent-green">Active[[else]]<td class="cool-gray8">Disabled[[/if]]</td>
				[[*<!-- <td>
					[[if isset( $banner._preview ) ]]
					<a href="preview.php?bannerid=[[$banner.Banner_ID]]" onclick="previewWindow( this.href,[[$banner._width]],[[$banner._height]] );return false;" class="button-preview [[( $smarty.foreach.loopy.index % 2) ? buttonEven : buttonOdd]]">Preview Banner</a>
					[[else]]
						<span class="no_template">(no template)</span>
					[[/if]]
				</td> -->*]]
			</tr>
		[[/foreach]]
		</table>
	</section>
	[[/if]]
	

</div>
</body>
</html>