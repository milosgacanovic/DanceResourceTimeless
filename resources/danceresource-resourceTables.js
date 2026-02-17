( function () {
	'use strict';

	function isMobile() {
		return ( window.matchMedia && window.matchMedia( '(max-width: 720px)' ).matches ) ||
			( window.innerWidth && window.innerWidth <= 720 );
	}

	function initSortbars( $root ) {
		if ( !isMobile() ) {
			return;
		}

		$root.find( '.dr-cards' ).each( function () {
			var $wrap = $( this );
			var $bar = $wrap.find( '.dr-sortbar' ).first();
			if ( !$bar.length ) {
				return;
			}

			if ( $bar.data( 'drSortReady' ) ) {
				return;
			}

			var $table = $wrap.find( 'table.dr-resource-table.sortable' ).first();
			if ( !$table.length ) {
				return;
			}

			var $tbody = $table.find( 'tbody' );
			if ( !$tbody.length ) {
				return;
			}

			$bar.data( 'drSortReady', true );

			$tbody.children( 'tr' ).each( function ( i ) {
				var $tr = $( this );
				if ( $tr.attr( 'data-dr-pos' ) == null ) {
					$tr.attr( 'data-dr-pos', String( i ) );
				}
			} );

			var columns = [
				{ label: 'Default order', col: -1 },
				{ label: 'Resource', col: 0 },
				{ label: 'Creator', col: 1 },
				{ label: 'Year', col: 2 },
				{ label: 'Format', col: 3 },
				{ label: 'Access', col: 4 }
			];

			var selectedCol = -1;
			var dir = 'asc';

			function resetToDefault() {
				var rows = $tbody.children( 'tr' ).get();
				rows.sort( function ( a, b ) {
					return ( parseInt( a.getAttribute( 'data-dr-pos' ), 10 ) || 0 ) -
						( parseInt( b.getAttribute( 'data-dr-pos' ), 10 ) || 0 );
				} );
				for ( var i = 0; i < rows.length; i++ ) {
					$tbody.append( rows[i] );
				}
			}

			function stateOf( $th ) {
				if ( $th.hasClass( 'headerSortDown' ) ) {
					return 'desc';
				}
				if ( $th.hasClass( 'headerSortUp' ) ) {
					return 'asc';
				}
				return 'none';
			}

			function applySort() {
				if ( selectedCol === -1 ) {
					resetToDefault();
					$dirBtn.hide();
					return;
				}

				$dirBtn.show();

				var $th = $table.find( 'thead th' ).eq( selectedCol );
				if ( !$th.length ) {
					return;
				}

				var max = 5;
				while ( max-- > 0 ) {
					var st = stateOf( $th );
					if ( st === dir ) {
						break;
					}
					$th.trigger( 'click' );
				}
			}

			var $row = $( '<div class="dr-sortbar-row"></div>' );
			var $label = $( '<span class="dr-sort-label">Sort:</span>' );

			var $menuBtn = $( '<button type="button" class="dr-sort-menu-btn"></button>' );
			var $caret = $( '<span class="dr-sort-caret" aria-hidden="true"></span>' );
			$menuBtn.append( $( '<span class="dr-sort-menu-text"></span>' ) ).append( $caret );

			var $dirBtn = $( '<button type="button" class="dr-sort-dir">Asc</button>' );

			var $menu = $( '<div class="dr-sort-menu" role="menu"></div>' ).attr( 'hidden', true );
			columns.forEach( function ( c ) {
				var $item = $( '<button type="button" class="dr-sort-item" role="menuitem"></button>' );
				$item.text( c.label ).attr( 'data-col', String( c.col ) );
				$menu.append( $item );
			} );

			$bar.empty().append( $row.append( $label ).append( $menuBtn ).append( $dirBtn ) ).append( $menu );

			function setMenuText() {
				var found = columns.find( function ( c ) {
					return c.col === selectedCol;
				} );
				$menuBtn.find( '.dr-sort-menu-text' ).text( found ? found.label : 'Default order' );
			}

			function closeMenu() {
				$menu.attr( 'hidden', true );
				$menuBtn.attr( 'aria-expanded', 'false' );
			}

			function openMenu() {
				$menu.removeAttr( 'hidden' );
				$menuBtn.attr( 'aria-expanded', 'true' );
			}

			$menuBtn.on( 'click', function ( e ) {
				e.preventDefault();
				if ( $menu.is( '[hidden]' ) ) {
					openMenu();
				} else {
					closeMenu();
				}
			} );

			$menu.on( 'click', '.dr-sort-item', function ( e ) {
				e.preventDefault();
				selectedCol = parseInt( $( this ).attr( 'data-col' ), 10 );
				setMenuText();
				closeMenu();
				applySort();
			} );

			$dirBtn.on( 'click', function () {
				dir = ( dir === 'asc' ) ? 'desc' : 'asc';
				$dirBtn.text( dir === 'asc' ? 'Asc' : 'Desc' );
				applySort();
			} );

			$( document ).on( 'mousedown.drSort', function ( evt ) {
				if ( !$bar[0].contains( evt.target ) ) {
					closeMenu();
				}
			} );

			$( document ).on( 'keydown.drSort', function ( evt ) {
				if ( evt.key === 'Escape' ) {
					closeMenu();
				}
			} );

			selectedCol = -1;
			dir = 'asc';
			setMenuText();
			$dirBtn.hide();
			resetToDefault();
		} );
	}

	mw.loader.using( [ 'jquery' ] ).then( function () {
		initSortbars( $( document ) );
	} );

	mw.hook( 'wikipage.content' ).add( function ( $content ) {
		initSortbars( $content );
	} );
}() );
