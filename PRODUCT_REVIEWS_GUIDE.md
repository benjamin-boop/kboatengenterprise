# Publishing product reviews

The storefront does not publish customer submissions automatically. The product-page form prepares a WhatsApp message; the team verifies and approves each review, then adds it to `approved-product-reviews.js`.

## Review and approve

1. Open the customer's WhatsApp message and check the optional order reference against business records.
2. Decide whether the feedback is relevant and appropriate. Contact the customer for permission to publish their comment and chosen display name.
3. Remove order references, phone numbers, email addresses, and other private information. Keep the customer's meaning intact.
4. Set `verifiedPurchase` to `true` only after confirming the purchase. Otherwise use `false`; an unverified review can still be published without a verified-purchase badge.

## Add an approved review

Edit the array in `approved-product-reviews.js`. Add one object per approved review, separating entries with commas:

```js
{
    productId: "100",
    displayName: "Customer-approved display name",
    rating: 5,
    comment: "The exact customer comment approved for publication.",
    verifiedPurchase: true
}
```

The object above is a format example only. Replace every value with actual, approved customer feedback before adding it. Do not publish the example as a real review.

Use the product ID from this list:

| Product | ID |
| --- | --- |
| Lactoadvance Shower Gel | `100` |
| Aloe Vera Shower Gel | `99` |
| Avena Shower Gel | `3` |
| Concentrado Floral | `4` |
| Concentrado Talco | `5` |
| Concentrado Spa | `6` |
| Concentrado Azul | `7` |
| Concentrado Colonia | `8` |
| Men Extra Dry Deo Spray | `37` |
| Men Invisible Deo Spray | `36` |
| Women Dry Care Deo Spray | `34` |
| Women Invisible Deo Spray | `33` |
| Women Dermo Sensitive Deo Spray | `35` |

`rating` must be a whole number from 1 to 5. Keep `displayName` to the name the customer consented to publish, and use only the approved comment. The storefront calculates the average and count from valid entries, shows the published reviews on the matching product page, and displays the summary on product cards. Invalid records are skipped and reported in the browser console.

Save and deploy the updated files for the rating to appear on the live site. This is a manual, source-file workflow; it does not provide an admin dashboard or store incoming submissions.
