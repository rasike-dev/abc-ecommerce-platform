// Commercial Bank Payment Gateway Configuration
// These values should be set in your .env file
export const testCombankUrl =
  process.env.COMBANK_TEST_URL || 'https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56';
export const prodCombankUrl =
  process.env.COMBANK_PROD_URL || 'https://cbcmpgs.gateway.mastercard.com/api/nvp/version/56';
export const combankApiUserName = process.env.COMBANK_API_USERNAME;
export const combankPassword = process.env.COMBANK_API_PASSWORD;
export const combankMerchant = process.env.COMBANK_MERCHANT_ID;
