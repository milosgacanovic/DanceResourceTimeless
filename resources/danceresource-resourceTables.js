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
			var $table = $wrap.find( 'table.dr-resource-table.sortable' ).first();
			if ( !$table.length ) {
				return;
			}

			var $bar = $wrap.find( '.dr-sortbar' ).first();
			if ( !$bar.length ) {
				return;
			}

			if ( $bar.data( 'drSortReady' ) ) {
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

			var msgDefault = mw.message( 'default' ).exists() ?
				mw.message( 'default' ).text() :
				'Default';
			msgDefault = msgDefault ? msgDefault.charAt( 0 ).toUpperCase() + msgDefault.slice( 1 ) : 'Default';
			var msgAsc = mw.message( 'sort-ascending' ).exists() ?
				mw.message( 'sort-ascending' ).text() :
				'Asc';
			var msgDesc = mw.message( 'sort-descending' ).exists() ?
				mw.message( 'sort-descending' ).text() :
				'Desc';
			var shortDir = getShortDirectionLabels( msgAsc, msgDesc );

			var columns = [ { label: msgDefault, col: -1 } ];
			$table.find( 'thead th' ).each( function ( i ) {
				var $th = $( this );
				var label = $.trim( $th.text() );
				if ( !label ) {
					return;
				}
				columns.push( { label: label, col: i } );
			} );

			// Fallback for templates that don't emit a usable THEAD at first paint.
			if ( columns.length <= 1 ) {
				var seen = Object.create( null );
				var $firstRowCells = $table.find( 'tbody tr:first-child > th, tbody tr:first-child > td' );
				$firstRowCells.each( function ( i ) {
					var $cell = $( this );
					var label = $.trim( $cell.attr( 'data-label' ) || $cell.text() || '' );
					if ( !label || seen[label] ) {
						return;
					}
					seen[label] = true;
					columns.push( { label: label, col: i } );
				} );
			}

			// Last-resort fallback: discover labels from any cell in table.
			if ( columns.length <= 1 ) {
				var seenAny = Object.create( null );
				$table.find( 'tbody td[data-label], tbody th[data-label]' ).each( function () {
					var label = $.trim( $( this ).attr( 'data-label' ) || '' );
					if ( !label || seenAny[label] ) {
						return;
					}
					seenAny[label] = true;
					columns.push( { label: label, col: columns.length - 1 } );
				} );
			}

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
			var orderLabel = mw.message( 'danceresourcetimeless-order-label' ).exists() ?
				mw.message( 'danceresourcetimeless-order-label' ).text() :
				'Order';
			var $label = $( '<span class="dr-sort-label"></span>' );
			$label.text( orderLabel + ':' );

			var $menuBtn = $( '<button type="button" class="dr-sort-menu-btn"></button>' );
			var $caret = $( '<span class="dr-sort-caret" aria-hidden="true"></span>' );
			$menuBtn.append( $( '<span class="dr-sort-menu-text"></span>' ) ).append( $caret );

			var $dirBtn = $( '<button type="button" class="dr-sort-dir"></button>' );

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
				$menuBtn.find( '.dr-sort-menu-text' ).text( found ? found.label : msgDefault );
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
				$dirBtn.text( dir === 'asc' ? shortDir.asc : shortDir.desc );
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
			$dirBtn.text( shortDir.asc );
			$dirBtn.hide();
			resetToDefault();

			// Reveal only after mobile sort/list behavior is fully initialized.
			$wrap.addClass( 'dr-resource-ready' );
		} );
	}

	function getShortDirectionLabels( asc, desc ) {
		var a = String( asc || '' ).trim();
		var d = String( desc || '' ).trim();
		var minLen = Math.min( a.length, d.length );
		var i = 0;
		while ( i < minLen && a.charAt( i ).toLowerCase() === d.charAt( i ).toLowerCase() ) {
			i++;
		}
		var prefix = a.slice( 0, i );
			var split = prefix.lastIndexOf( ' ' );
		if ( split > 0 ) {
			var aShort = a.slice( split + 1 ).trim();
			var dShort = d.slice( split + 1 ).trim();
			if ( aShort && dShort ) {
				return { asc: ucFirst( aShort ), desc: ucFirst( dShort ) };
			}
		}
		return { asc: ucFirst( a || 'Ascending' ), desc: ucFirst( d || 'Descending' ) };
	}

	function ucFirst( value ) {
		var text = String( value || '' ).trim();
		return text ? text.charAt( 0 ).toUpperCase() + text.slice( 1 ) : text;
	}

	mw.loader.using( [ 'jquery' ] ).then( function () {
		initSortbars( $( document ) );
	} );

	mw.hook( 'wikipage.content' ).add( function ( $content ) {
		initSortbars( $content );
	} );
}() );
