jQuery( function( $ ) {

	var wc_shipment_dhl_label_items = {
	
		// init Class
		init: function() {
			$( '#woocommerce-shipment-dhl-label' )
				.on( 'click', '.dhl-label-button', this.save_dhl_label );

			$( '#woocommerce-shipment-dhl-label' )
				.on( 'click', 'a.dhl_delete_label', this.delete_dhl_label );

			$( '#woocommerce-shipment-dhl-label-express' )
				.on( 'click', '.dhl-label-button', this.save_dhl_label );

			$( '#woocommerce-shipment-dhl-label-express' )
				.on( 'click', 'a.dhl_delete_label', this.delete_dhl_label );
		},
	
		save_dhl_label: function () {
			// console.log(dhl_label_data);
			// Remove any errors from last attempt to create label
			var form_id;
			var action_id;
			if( $(this).closest("#woocommerce-shipment-dhl-label-express").length ) {
				form_id = '#woocommerce-shipment-dhl-label-express';
				action_id = 'wc_shipment_dhl_gen_label_express';
			} else {
				if( $(this).closest("#woocommerce-shipment-dhl-label").length ) {
					form_id = '#woocommerce-shipment-dhl-label';
					action_id = 'wc_shipment_dhl_gen_label';
				}
			}

			// console.log(form_id);
			$( form_id + ' .shipment-dhl-label-form .wc_dhl_error' ).remove();

			$( form_id + ' .shipment-dhl-label-form' ).block( {
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6
				}
			} );
			
			// loop through inputs within id 'shipment-dhl-label-form'
			
			var data = {
				action:                   action_id,
				order_id:                 woocommerce_admin_meta_boxes.post_id,
			};
			
			// var data = new Array();
			$(function(){ 
				$(form_id + ' .shipment-dhl-label-form').each(function(i, div) {

				    $(div).find('input').each(function(j, element){
				        // $(element).attr('disabled','disabled');
				        // console.log( $(element).attr('name') );
				        if( $(element).attr('type') == 'checkbox' ) {
				        	// console.log($(element).prop('checked'));
				        	if ( $(element).prop('checked') ) {
					        	data[ $(element).attr('name') ] = 'yes';
				        	} else {
					        	data[ $(element).attr('name') ] = 'no';
				        	}
				        } else {
				        	data[ $(element).attr('name') ] = $(element).val();
				        }
				    });

				    $(div).find('select').each(function(j, element){
				        // $(element).attr('disabled','disabled');
				        // console.log( $(element).attr('name') );
			        	data[ $(element).attr('name') ] = $(element).val();
				    });

				    $(div).find('textarea').each(function(j, element){
				        // $(element).attr('disabled','disabled');
				        // console.log( $(element).attr('name') );
			        	data[ $(element).attr('name') ] = $(element).val();
				    });
		    	});
		    });
			
			$.post( woocommerce_admin_meta_boxes.ajax_url, data, function( response ) {
				$( form_id + ' .shipment-dhl-label-form' ).unblock();
				if ( response.error ) {
					$( form_id + ' .shipment-dhl-label-form' ).append('<p class="wc_dhl_error">' + response.error + '</p>');
				} else {
					// Disable all form items
					$(function(){ 
						$(form_id + ' .shipment-dhl-label-form').each(function(i, div) {

						    $(div).find('input').each(function(j, element){
						       $(element).prop('disabled', 'disabled');
						    });

						    $(div).find('select').each(function(j, element){
						        $(element).prop('disabled', 'disabled');
						    });

						    $(div).find('textarea').each(function(j, element){
						        $(element).prop('disabled','disabled');
						    });
				    	});
				    });

					$( form_id + ' .dhl-label-button').remove();
					$( form_id + ' .shipment-dhl-label-form' ).append(dhl_label_data.print_button);
					$( form_id + ' .dhl-label-print').attr("href", response.label_url ); // update new url
					$( form_id + ' .shipment-dhl-label-form' ).append(dhl_label_data.delete_label);

					if( response.tracking_note ) {

						$( '#woocommerce-order-notes' ).block({
							message: null,
							overlayCSS: {
								background: '#fff',
								opacity: 0.6
							}
						});
						
						var data = {
							action:                   'woocommerce_add_order_note',
							post_id:                  woocommerce_admin_meta_boxes.post_id,
							note_type: 				  'customer',
							note:					  response.tracking_note,
							security:                 woocommerce_admin_meta_boxes.add_order_note_nonce
						};

						$.post( woocommerce_admin_meta_boxes.ajax_url, data, function( response_note ) {
							// alert(response_note);
							$( 'ul.order_notes' ).prepend( response_note );
							$( '#woocommerce-order-notes' ).unblock();
							$( '#add_order_note' ).val( '' );
						});							
					}

				}
			});				

			return false;
		},

		delete_dhl_label: function () {

			var form_id;
			if( $(this).closest("#woocommerce-shipment-dhl-label-express").length ) {
				form_id = '#woocommerce-shipment-dhl-label-express';
				action_id = 'wc_shipment_dhl_delete_label_express';
			} else {
				if( $(this).closest("#woocommerce-shipment-dhl-label").length ) {
					form_id = '#woocommerce-shipment-dhl-label';
					action_id = 'wc_shipment_dhl_delete_label';
				}
			}

			$( form_id + ' .shipment-dhl-label-form .wc_dhl_error' ).remove();

			$( form_id + ' .shipment-dhl-label-form' ).block( {
				message: null,
				overlayCSS: {
					background: '#fff',
					opacity: 0.6
				}
			} );
			
			var data = {
				action:                   action_id,
				order_id:                 woocommerce_admin_meta_boxes.post_id,
				pr_dhl_label_nonce:       $( '#pr_dhl_label_nonce' ).val()
			};
			
			$.post( woocommerce_admin_meta_boxes.ajax_url, data, function( response ) {
				$( form_id + ' .shipment-dhl-label-form' ).unblock();
				if ( response.error ) {
					$( form_id + ' .shipment-dhl-label-form' ).append('<p class="wc_dhl_error">Error: ' + response.error + '</p>');
				} else {

					$(  form_id + ' .shipment-dhl-label-form .wc_dhl_delete' ).remove();
					// Enable all form items
					$(function(){ 
						$(form_id + ' .shipment-dhl-label-form').each(function(i, div) {

						    $(div).find('input').each(function(j, element){
						       $(element).removeAttr('disabled');
						    });

						    $(div).find('select').each(function(j, element){
						        $(element).removeAttr('disabled');
						    });

						    $(div).find('textarea').each(function(j, element){
						        $(element).removeAttr('disabled');
						    });

				    	});
				    });
					
					$( form_id + ' .dhl-label-print').remove();
					$( form_id + ' .shipment-dhl-label-form' ).append(dhl_label_data.main_button);

					if( response.dhl_tracking_num ) {
						// alert(response.dhl_tracking_num);
						var tracking_note;
						$('ul.order_notes li').each(function(i) {
						   tracking_note = $(this);
						   tracking_note_html = $(this).html()
						   if (tracking_note_html.indexOf(response.dhl_tracking_num) >= 0) {
							
								// var tracking_note = $( this ).closest( 'li.tracking_note' ); 
								$( tracking_note ).block({
									message: null,
									overlayCSS: {
										background: '#fff',
										opacity: 0.6
									}
								});

								var data_note = {
									action:   'woocommerce_delete_order_note',
									note_id:  $( tracking_note ).attr( 'rel' ),
									security: woocommerce_admin_meta_boxes.delete_order_note_nonce
								};

								$.post( woocommerce_admin_meta_boxes.ajax_url, data_note, function() {
									$( tracking_note ).remove();
								});
								
							   	return false;					   	
							}
						});
					}
				}
			});

			return false;
		}
	}
	
	wc_shipment_dhl_label_items.init();

} );
