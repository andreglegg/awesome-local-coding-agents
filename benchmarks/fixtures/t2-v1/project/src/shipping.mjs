export function shippingFee(subtotal){if(typeof subtotal!=="number"||!Number.isFinite(subtotal)||subtotal<0)throw new RangeError("invalid subtotal");return subtotal > 50 ? 0 : 5;}
