<?php

if (!defined('ABSPATH')) { exit; }

if (!class_exists('DHLPWC_Model_Logic_Access_Control_Capabilities')) :

class DHLPWC_Model_Logic_Access_Control_Capabilities extends DHLPWC_Model_Core_Singleton_Abstract
{

    public function filter_unique_parceltypes($capabilities)
    {
        $unique_parceltypes = array();
        if (is_array($capabilities)) {
            foreach ($capabilities as $capability) {
                if (isset($capability->parcel_type)) {
                    if (!array_key_exists($capability->parcel_type->key, $unique_parceltypes)) {
                        $unique_parceltypes[$capability->parcel_type->key] = $capability->parcel_type;
                    }
                }
            }
        }
        usort($unique_parceltypes, array($this, 'parceltype_weight_sort'));
        return $unique_parceltypes;
    }

    protected function parceltype_weight_sort($one, $two)
    {
        return $one->max_weight_kg > $two->max_weight_kg;
    }

    public function filter_unique_options($capabilities)
    {
        $allowed_shipping_options = array();
        if (is_array($capabilities)) {
            foreach ($capabilities as $capability) {
                if (isset($capability->options) && is_array($capability->options)) {
                    foreach ($capability->options as $option) {
                        if (isset($option->key)) {
                            $allowed_shipping_options[] = $option->key;
                        }
                    }
                }
            }
        }
        return array_unique($allowed_shipping_options);
    }

    public function check_order_capabilities($check = array())
    {
        $order_id = is_array($check) && isset($check['order_id']) ? $check['order_id'] : null;
        $options = is_array($check) && isset($check['options']) && is_array($check['options']) ? $check['options'] : array();
        $to_business = is_array($check) && isset($check['to_business']) ? $check['to_business'] : false;

        if (!$order_id) {
            return false;
        }

        $receiver_address = $this->get_address_from_order($order_id);
        $data = $this->get_capability_check($receiver_address, $to_business);

        // Add selected options
        $data->option = implode(',', $options);

        return $this->get_capabilities($data);
    }

    public function check_shipping_capabilities()
    {
        $service = DHLPWC_Model_Service_Access_Control::instance();
        $to_business = $service->check(DHLPWC_Model_Service_Access_Control::ACCESS_DEFAULT_TO_BUSINESS);

        $cart_address = $this->get_address_from_cart();
        $data = $this->get_capability_check($cart_address, $to_business);

        return $this->get_capabilities($data);
    }

    protected function get_capabilities(DHLPWC_Model_API_Data_Capability_Check $capability_check) {
        $connector = DHLPWC_Model_API_Connector::instance();
        $sender_type = 'business'; // A webshop is always a business, not a regular consumer type nor a parcelshop. Will leave this as hardcoded for now.
        $response = $connector->get(sprintf('capabilities/%s', $sender_type), $capability_check->to_array());

        $capabilities = array();

        if (is_array($response)) {
            foreach ($response as $entry) {
                $capabilities[] = new DHLPWC_Model_API_Data_Capability($entry);
            }
        }

        return $capabilities;
    }

    /**
     * @param $data
     * @return DHLPWC_Model_API_Data_Capability_Check
     */
    protected function get_capability_check($receiver_address, $to_business)
    {
        $capability_check = new DHLPWC_Model_API_Data_Capability_Check();
        $service = DHLPWC_Model_Service_Settings::instance();

        // Get default shipper address
        $shipper_address = $service->get_default_address();

        // Build a capability check data set
        $capability_check->from_country = $shipper_address->country;
        $capability_check->to_country = $receiver_address->country;
        $capability_check->to_business = $to_business ? 'true' : 'false';
        $capability_check->return_product = null; // TODO
        $capability_check->to_postal_code = $receiver_address->postcode;
        $capability_check->account_number = $service->get_api_account();
        $capability_check->organisation_id = $service->get_api_organization();

        return $capability_check;
    }

    protected function get_address_from_order($order_id)
    {
        $order = wc_get_order($order_id);
        $receiver_address_data = $order->get_address('shipping') ?: $order->get_address();
        return new DHLPWC_Model_Meta_Address($receiver_address_data);
    }

    protected function get_address_from_cart()
    {
        $cart = WC()->cart;
        if ($cart && $cart->get_customer() && $cart->get_customer()->get_shipping()) {
            return new DHLPWC_Model_Meta_Address($cart->get_customer()->get_shipping());
        }

        return new DHLPWC_Model_Meta_Address();
    }

}

endif;
