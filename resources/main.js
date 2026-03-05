/* =========================================================
   Dark mode: apply theme immediately (before paint)
   ========================================================= */
( function () {
	var saved = localStorage.getItem( 'dr-theme' );
	if ( saved ) {
		document.documentElement.setAttribute( 'data-theme', saved );
	} else if ( window.matchMedia && window.matchMedia( '(prefers-color-scheme: dark)' ).matches ) {
		// No explicit preference — let CSS @media handle it (no data-theme attribute)
	} else {
		document.documentElement.setAttribute( 'data-theme', 'light' );
	}

	// Listen for system preference changes (only when no saved choice)
	if ( window.matchMedia ) {
		window.matchMedia( '(prefers-color-scheme: dark)' ).addEventListener( 'change', function ( e ) {
			if ( !localStorage.getItem( 'dr-theme' ) ) {
				// Remove attribute so CSS @media rules take effect
				document.documentElement.removeAttribute( 'data-theme' );
			}
		} );
	}
}() );

$( function () {
	// sidebar-chunk only applies to desktop-small, but the toggles are hidden at
	// other resolutions regardless and the css overrides any visible effects.
	var $dropdowns = $( '#personal, #p-variants-desktop, .sidebar-chunk' );

	/**
	 * Desktop menu click-toggling
	 *
	 * We're not even checking if it's desktop because the classes in play have no effect
	 * on mobile regardless... this may break things at some point, though.
	 */

	/**
	 * Close all dropdowns
	 */
	function closeOpen() {
		$dropdowns.removeClass( 'dropdown-active' );
	}

	/**
	 * Click behaviour
	 */
	$dropdowns.on( 'click', function ( e ) {
		// Check if it's already open so we don't open it again
		// eslint-disable-next-line no-jquery/no-class-state
		if ( $( this ).hasClass( 'dropdown-active' ) ) {
			if ( $( e.target ).closest( $( 'h2, #p-variants-desktop h3' ) ).length > 0 ) {
				// treat reclick on the header as a toggle
				closeOpen();
			}
			// Clicked inside an open menu; don't do anything
		} else {
			closeOpen();
			e.stopPropagation(); // stop hiding it!
			$( this ).addClass( 'dropdown-active' );
		}
	} );
	$( document ).on( 'click', function ( e ) {
		if ( $( e.target ).closest( $dropdowns ).length > 0 ) {
			// Clicked inside an open menu; don't close anything
		} else {
			closeOpen();
		}
	} );

	/* =========================================================
	   Dark mode toggle button (matches www.danceresource.org)
	   ========================================================= */
	( function () {
		var sunSvg = '<svg class="theme-icon-light" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
		var moonSvg = '<svg class="theme-icon-dark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

		var toggle = document.createElement( 'button' );
		toggle.id = 'dr-theme-toggle';
		toggle.title = 'Toggle dark mode';
		toggle.setAttribute( 'aria-label', 'Toggle dark mode' );
		toggle.innerHTML = sunSvg + moonSvg;

		function isCurrentlyDark() {
			var attr = document.documentElement.getAttribute( 'data-theme' );
			if ( attr === 'dark' ) {
				return true;
			}
			if ( attr === 'light' ) {
				return false;
			}
			return window.matchMedia && window.matchMedia( '(prefers-color-scheme: dark)' ).matches;
		}

		function syncIcons( isDark ) {
			var iconLight = toggle.querySelector( '.theme-icon-light' );
			var iconDark = toggle.querySelector( '.theme-icon-dark' );
			// Sun visible in light mode, moon visible in dark mode
			if ( iconLight ) {
				iconLight.style.display = isDark ? 'none' : '';
			}
			if ( iconDark ) {
				iconDark.style.display = isDark ? '' : 'none';
			}
		}

		syncIcons( isCurrentlyDark() );

		toggle.addEventListener( 'click', function ( e ) {
			e.stopPropagation();
			var nowDark = !isCurrentlyDark();
			document.documentElement.setAttribute( 'data-theme', nowDark ? 'dark' : 'light' );
			localStorage.setItem( 'dr-theme', nowDark ? 'dark' : 'light' );
			syncIcons( nowDark );
		} );

		// Insert left of #personal inside #user-tools
		var userTools = document.getElementById( 'user-tools' );
		var personal = document.getElementById( 'personal' );
		if ( userTools && personal ) {
			userTools.insertBefore( toggle, personal );
		} else if ( personal ) {
			personal.parentNode.insertBefore( toggle, personal );
		}
	}() );
} );

mw.hook( 'wikipage.content' ).add( function ( $content ) {
	// Gotta wrap them for this to work; maybe later the parser etc will do this for us?!
	$content.find( 'div > table:not( table table )' ).wrap( '<div class="content-table-wrapper"><div class="content-table"></div></div>' );
	$content.find( '.content-table-wrapper' ).prepend( '<div class="content-table-left"></div><div class="content-table-right"></div>' );

	/**
	 * Set up borders for experimental overflowing table scrolling
	 *
	 * I have no idea what I'm doing.
	 *
	 * @param {jQuery} $table
	 */
	function setScrollClass( $table ) {
		var $tableWrapper = $table.parent(),
			// wtf browser rtl implementations
			scroll = Math.abs( $tableWrapper.scrollLeft() );

		$tableWrapper.parent()
			// 1 instead of 0 because of weird rtl rounding errors or something
			.toggleClass( 'scroll-left', scroll > 1 )
			.toggleClass( 'scroll-right', $table.outerWidth() - $tableWrapper.innerWidth() - scroll > 1 );
	}

	$content.find( '.content-table' ).on( 'scroll', function () {
		setScrollClass( $( this ).children( 'table' ).first() );

		if ( $content.attr( 'dir' ) === 'rtl' ) {
			$( this ).find( 'caption' ).css( 'margin-right', Math.abs( $( this ).scrollLeft() ) + 'px' );
		} else {
			$( this ).find( 'caption' ).css( 'margin-left', $( this ).scrollLeft() + 'px' );
		}
	} );

	/**
	 * Mark overflowed tables for scrolling
	 */
	function unOverflowTables() {
		$content.find( '.content-table > table' ).each( function () {
			var $table = $( this ),
				$wrapper = $table.parent().parent();
			if ( $table.outerWidth() > $wrapper.outerWidth() ) {
				$wrapper.addClass( 'overflowed' );
				setScrollClass( $table );
			} else {
				$wrapper.removeClass( 'overflowed scroll-left scroll-right fixed-scrollbar-container' );
			}
		} );

		// Set up sticky captions
		$content.find( '.content-table > table > caption' ).each( function () {
			var $container, tableHeight,
				$table = $( this ).parent(),
				$wrapper = $table.parent().parent();

			if ( $table.outerWidth() > $wrapper.outerWidth() ) {
				$container = $( this ).parents( '.content-table-wrapper' );
				$( this ).width( $content.width() );
				tableHeight = $container.innerHeight() - $( this ).outerHeight();

				$container.find( '.content-table-left' ).height( tableHeight );
				$container.find( '.content-table-right' ).height( tableHeight );
			}
		} );
	}

	unOverflowTables();
	$( window ).on( 'resize', unOverflowTables );

	/**
	 * Sticky scrollbars maybe?!
	 */
	$content.find( '.content-table' ).each( function () {
		var $table, $tableWrapper, $spoof, $scrollbar;

		$tableWrapper = $( this );
		$table = $tableWrapper.children( 'table' ).first();

		// Assemble our silly crap and add to page
		$scrollbar = $( '<div>' ).addClass( 'content-table-scrollbar inactive' ).width( $content.width() );
		$spoof = $( '<div>' ).addClass( 'content-table-spoof' ).width( $table.outerWidth() );
		$tableWrapper.parent().prepend( $scrollbar.prepend( $spoof ) );
	} );

	/**
	 * Scoll table when scrolling scrollbar and visa-versa lololol wut
	 */
	$content.find( '.content-table' ).on( 'scroll', function () {
		// Only do this here if we're not already mirroring the spoof
		var $mirror = $( this ).siblings( '.inactive' ).first();

		$mirror.scrollLeft( $( this ).scrollLeft() );
	} );
	$content.find( '.content-table-scrollbar' ).on( 'scroll', function () {
		var $mirror = $( this ).siblings( '.content-table' ).first();

		// Only do this here if we're not already mirroring the table
		// eslint-disable-next-line no-jquery/no-class-state
		if ( !$( this ).hasClass( 'inactive' ) ) {
			$mirror.scrollLeft( $( this ).scrollLeft() );
		}
	} );

	/**
	 * Set active when actually over the table it applies to...
	 */
	function determineActiveSpoofScrollbars() {
		$content.find( '.overflowed .content-table' ).each( function () {
			var $scrollbar = $( this ).siblings( '.content-table-scrollbar' ).first();

			// Skip caption
			var captionHeight = $( this ).find( 'caption' ).outerHeight() || 0;
			if ( captionHeight ) {
				// Pad slightly for reasons
				captionHeight += 8;
			}

			var tableTop = $( this ).offset().top,
				tableBottom = tableTop + $( this ).outerHeight(),
				viewBottom = window.scrollY + document.documentElement.clientHeight,
				active = tableTop + captionHeight < viewBottom && tableBottom > viewBottom;
			$scrollbar.toggleClass( 'inactive', !active );
		} );
	}

	determineActiveSpoofScrollbars();
	$( window ).on( 'scroll resize', determineActiveSpoofScrollbars );

	/**
	 * Make sure tablespoofs remain correctly-sized?
	 */
	$( window ).on( 'resize', function () {
		$content.find( '.content-table-scrollbar' ).each( function () {
			var width = $( this ).siblings().first().find( 'table' ).first().width();
			$( this ).find( '.content-table-spoof' ).first().width( width );
			$( this ).width( $content.width() );
		} );
	} );
} );
