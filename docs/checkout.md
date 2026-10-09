# Checkout rebuild

Reviewed the original `src/app/Pages/checkout/checkout.component.ts` and `Server/server.js` in the supplied Ephesians-Fitness-master folder. The original flow generated IDs in the browser, wrote order/summary CSVs, and used Gmail OAuth2 plus Nodemailer to send the business notification and customer payment email.

Problems corrected in this rebuild:

- Browser no longer waits an arbitrary 1.5 seconds for IDs or clears the bag before email processing completes.
- One request saves the order and handles both emails, with one HTTP response.
- IDs are generated on the server; retries reuse the same order and do not repeat an already recorded email delivery.
- Prices, quantities and variants are validated against the server catalogue. Browser totals are not trusted.
- Both text and HTML emails include the same bank details, total and reference. The old plain-text email had bank placeholders.
- Customer text is escaped in HTML; sender is the configured business address and reply-to is used for customer replies.
- Postal codes use South Africa's four-digit format.

## Local preview

Run `npm.cmd run server` and `npm.cmd start` in separate terminals. The Angular server proxies `/api` to the local checkout server. Restart Angular after changing the proxy configuration. In the bag choose **Review & checkout**. The default **Preview order** action saves an order and the customer/business email previews in ignored `server/data/`. It sends no email and keeps the bag. Test records use fictitious addresses.

## Live email configuration

Copy `server/.env.example` to `server/.env`. Enter verified bank details and the sending account configuration, and set `MAIL_MODE=live`. The original bank/OAuth secrets were not copied into source or the browser. Gmail OAuth2 is supported using the same fields as the old server; alternatively configure SMTP. Nodemailer can refresh Gmail access tokens from a configured refresh token: https://nodemailer.com/smtp/oauth2 . No live delivery or credentials were tested.

Restart the checkout server after configuration changes. Live checkout reports success after both mail servers accept the messages; this does not guarantee inbox delivery or payment. Successful live checkout clears the bag. Orders remain `awaiting_payment`; payment verification is manual. Keep order data on private persistent storage, outside the web root.

## Deployment scope

The new API is a single-process Node backend using private JSON files. It is suitable for local preview and a single-instance host with persistent disk; multi-instance deployment requires a shared transactional database and an email outbox. A process crash between SMTP acceptance and saving its delivery flag can result in a repeated email on retry. The API is not connected to the old CSV administrator/account system. Configure a same-origin reverse proxy for `/api`, persistent private storage, real credentials and HTTPS when deploying. No production changes were made.

The existing policy of free shipping **over** R800 is retained. The old checkout code used free shipping **at** R800; this difference is now consistent with the storefront copy.

## EFT checkout screen

Customers review their bag and delivery details, then place their order. The confirmation screen shows the server-calculated amount, reference, configured banking details, delivery address (including suburb and optional address line 2) and proof-of-payment email link. Copy buttons and a PDF download action let customers retain instructions; email remains a backup. Orders stay awaiting payment until funds are manually verified. No payment gateway or additional payment fees were introduced. Preview explicitly prohibits payment and labels missing banking fields. Only public payment instructions are returned by the API; email credentials are never returned.

The Send email action resends customer payment instructions to the stored order email; it never accepts a replacement recipient or creates another order. The private checkout request identifier authorizes resends, with a one-minute cooldown and API rate limiting. Preview rewrites local email previews and sends no mail. Save PDF downloads selectable payment and delivery instructions without opening a print dialog.

## Terms and conditions

The /terms page is linked from the footer and opens in a new tab from checkout so the entered address is retained. A required, initially unchecked acceptance checkbox is validated in the browser and API. The current version comes from src/app/core/terms.json; each saved order records termsVersion and a server-generated termsAcceptedAt. Update the version whenever the terms change. Existing orders retain their accepted version.

The initial wording follows existing EFT, R50/free-over-R800 delivery, estimated 7–14 business day delivery and 30-day change-of-mind return policies. Statutory rights are separate from the voluntary return policy. Sources checked: https://www.gov.za/sites/default/files/gcis_document/201409/a25-02.pdf (sections 43–44) and https://www.thencc.org.za/wp-content/uploads/2023/11/Explanatory-Note-7-of-2023.pdf (CPA section 56 remedies).

Before publishing, complete the seller’s legal identity, physical/service address and applicable registration information once supplied by the owner; none were invented. Confirm operational delivery/return policies and the seller disclosures required by ECTA section 43. The personal-information paragraph describes checkout only and is not a complete privacy notice.
