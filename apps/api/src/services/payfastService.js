import { config } from "../config/env.js";

export function buildPayfastRedirectUrl({ itemName, amount, customStr1 }) {
  const baseUrl = "https://www.payfast.co.za/eng/process";
  const params = new URLSearchParams({
    merchant_id: config.payfast.merchantId,
    merchant_key: config.payfast.merchantKey,
    return_url: config.payfast.returnUrl,
    cancel_url: config.payfast.cancelUrl,
    notify_url: config.payfast.notifyUrl,
    item_name: itemName,
    amount: Number(amount || 0).toFixed(2),
    custom_str1: customStr1
  });

  return `${baseUrl}?${params.toString()}`;
}
