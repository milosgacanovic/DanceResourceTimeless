<?php

namespace MediaWiki\Skin\DanceResourceTimeless;

use SkinTemplate;

/**
 * SkinTemplate class for the Timeless skin
 *
 * @ingroup Skins
 */
class SkinDanceResourceTimeless extends SkinTemplate {
	/**
	 * @inheritDoc
	 */
	public function __construct(
		array $options = []
	) {
		$out = $this->getOutput();

		// Basic IE support without flexbox
		$out->addStyle( 'DanceResourceTimeless/resources/IE9fixes.css', 'screen', 'IE' );

		parent::__construct( $options );
	}
}
