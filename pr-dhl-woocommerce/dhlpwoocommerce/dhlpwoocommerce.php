<?php
/*
Plugin Name: DHL Parcel for WooCommmerce
Plugin URI: https://www.dhlparcel.nl
Description: This is the official DHL Parcel for WooCommerce plugin.
Author: DHL Parcel
Version: 1.0.0
*/

if (!defined('ABSPATH')) { exit; }

if (!class_exists('DHLPWC')) :

class DHLPWC
{

    public function __construct()
    {
        // Only load this plugin if WooCommerce is loaded
        if (in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
            add_action('init', array($this, 'init'));
        }
    }

    public function init()
    {
        // Autoloader
        include_once('includes/class-dhlpwc-autoloader.php');

        // Set constants
        $this->define('DHLPWC_PLUGIN_FILE', __FILE__);
        $this->define('DHLPWC_PLUGIN_DIR', plugin_dir_path(__FILE__));
        $this->define('DHLPWC_PLUGIN_URL', plugins_url('/', __FILE__));

        $this->define('DHLPWC_RELATIVE_PLUGIN_DIR', $this->get_relative_plugin_dir());

        // Load translation
        load_plugin_textdomain('dhlpwc', false, DHLPWC_RELATIVE_PLUGIN_DIR . DIRECTORY_SEPARATOR .'languages' );

        // Load controllers

        // This controller will not be encapsulated in an availability check, due to it providing screens
        // necessary to enable the plugin and setting up the plugin.
        new DHLPWC_Controller_Settings();
        new DHLPWC_Controller_Admin_Settings();

        $service = DHLPWC_Model_Service_Access_Control::instance();

        if ($service->check(DHLPWC_Model_Service_Access_Control::ACCESS_API)) {
            new DHLPWC_Controller_Admin_Order_Metabox();
            new DHLPWC_Controller_Admin_Order();

            new DHLPWC_Controller_Checkout();
            new DHLPWC_Controller_Cart();
            new DHLPWC_Controller_Account();
        }
    }

    protected function get_relative_plugin_dir()
    {
        // Check if the full dir is equal to the plugin dir. For example, if it's symlinked, this following
        // Logic to get the relative path won't work. Instead we will return the relative directory
        if (substr(DHLPWC_PLUGIN_DIR, 0, strlen(WP_PLUGIN_DIR)) !== WP_PLUGIN_DIR) {
            return trim(basename(dirname(__FILE__)));
        }

        $relative_dir = substr(DHLPWC_PLUGIN_DIR, strlen(WP_PLUGIN_DIR), strlen(DHLPWC_PLUGIN_DIR));
        return trim($relative_dir, '/\\');
    }

    protected function define($name, $value) {
        if (!defined($name)) {
            define($name, $value);
        }
    }
}

// Run immediately
$DHLPWC = new DHLPWC();

endif;
