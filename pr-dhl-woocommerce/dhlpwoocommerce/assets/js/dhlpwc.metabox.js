var dhlpwc_metabox_timeout = null;

jQuery(document).ready(function($) {
    $(document.body).on('click', '#dhlpwc-label-create', function(e) {
        e.preventDefault();

        var label_size = $('.dhlpwc-label-create-size:checked').val();
        if (typeof label_size === "undefined" ) {
            // TODO update alert to a more user friendly user feedback
            alert('Select a label');
            return;
        }

        var label_options = [];
        $("input[name='dhlpwc-label-create-option[]']:checked").each(function() {
            label_options.push($(this).val().toString());
        });

        var to_business = $("input[name='dhlpwc-label-create-to-business']").is(':checked') ?  'yes' : 'no';

        var data = $.extend(true, $(this).data(), {
            action: 'dhlpwc_label_create',
            security: $( '#dhlpwc-ajax-nonce' ).val(),
            post_id: dhlpwc_metabox_object.post_id,
            label_size: label_size,
            label_options: label_options,
            to_business: to_business,
            form_data: $('#post').serializeArray()
        });

        // Click-2-much prevention
        if ($('#dhlpwc-label').attr('metabox_busy') == 'true') {
            alert('Currently handling the previous request, please wait.');
            return;
        } else {
            $('#dhlpwc-label').attr('metabox_busy', 'true');
        }

        $.post(ajaxurl, data, function(response) {
            try {
                view =  response.data.view;
            } catch(error) {
                alert('Error');
                return;
            }

            $('div.dhlpwc-order-metabox-content').html(view);
            $(document.body).trigger('dhlpwc:select_default_parceltype');
            $('#dhlpwc-label').attr('metabox_busy', 'false');
        }, 'json');

    }).on('click', '.dhlpwc_action_delete', function(e) {
        e.preventDefault();

        var data = {
            'action': 'dhlpwc_label_delete',
            post_id: $(this).data('post-id'),
            label_id: $(this).attr('label-id')
        };

        // Click-2-much prevention
        if ($('#dhlpwc-label').attr('metabox_busy') == 'true') {
            alert('Currently handling the previous request, please wait.');
            return;
        } else {
            $('#dhlpwc-label').attr('metabox_busy', 'true');
        }

        $.post(ajaxurl, data, function(response) {
            try {
                view = response.data.view;
            } catch(error) {
                alert('Error');
                return;
            }

            $('div.dhlpwc-order-metabox-content').html(view);
            $(document.body).trigger('dhlpwc:select_default_parceltype');
            $('#dhlpwc-label').attr('metabox_busy', 'false');
        }, 'json');

    }).on('change', 'input.dhlpwc-label-create-option', function(e) {
        // Delay metabox refresh due to rapid multiple checkbox changes
        if (dhlpwc_metabox_timeout) {
            clearTimeout(dhlpwc_metabox_timeout);
        }

        dhlpwc_metabox_timeout = setTimeout(function() {
            $(document.body).trigger('dhlpwc:refresh_metabox');
        }, 800);

    }).on('dhlpwc:refresh_metabox', function() {
        var label_options = [];
        $("input[name='dhlpwc-label-create-option[]']:checked").each(function () {
            label_options.push($(this).val().toString());
        });

        var to_business = $("input[name='dhlpwc-label-create-to-business']").is(':checked') ? 'yes' : 'no';

        var data = {
            'action': 'dhlpwc_label_refresh',
            post_id: dhlpwc_metabox_object.post_id,
            label_options: label_options,
            to_business: to_business
        };

        // Click-2-much prevention
        if ($('#dhlpwc-label').attr('metabox_busy') == 'true') {
            alert('Currently handling the previous request, please wait.');
            return;
        } else {
            $('#dhlpwc-label').attr('metabox_busy', 'true');
        }

        $.post(ajaxurl, data, function (response) {
            try {
                view = response.data.view;
            } catch (error) {
                alert('Error');
                return;
            }

            $('div.dhlpwc-order-metabox-form-parceltypes > .dhlpwc-form-content').html(view);
            $(document.body).trigger('dhlpwc:select_default_parceltype');
            $('#dhlpwc-label').attr('metabox_busy', 'false');
        }, 'json');

    }).on('dhlpwc:select_default_parceltype', function() {
        if($('input:radio[name=dhlpwc-label-create-size]:not(:disabled)').not(':checked')) {
            $('input:radio[name=dhlpwc-label-create-size]:not(:disabled):first').attr('checked', true);
        }
    });

    $(document.body).trigger('dhlpwc:select_default_parceltype');

});
