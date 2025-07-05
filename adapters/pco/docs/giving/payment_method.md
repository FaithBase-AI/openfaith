Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](payment_method.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)

2019-10-18

Info

[Batch](batch.md)

[BatchGroup](batch_group.md)

[Campus](campus.md)

[Designation](designation.md)

[DesignationRefund](designation_refund.md)

[Donation](donation.md)

[Fund](fund.md)

[InKindDonation](in_kind_donation.md)

[Label](label.md)

[Note](note.md)

[Organization](organization.md)

[PaymentMethod](payment_method.md)

[PaymentSource](payment_source.md)

[Person](person.md)

[Pledge](pledge.md)

[PledgeCampaign](pledge_campaign.md)

[RecurringDonation](recurring_donation.md)

[RecurringDonationDesignation](recurring_donation_designation.md)

[Refund](refund.md)

[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# PaymentMethod

Stored `PaymentMethod` information (`card` or `bank_account`) used by donors to make online `Donation`s.

`PaymentMethod` data is for informational purposes only and cannot be used to create charges through the API.

[# Example Request](#/apps/giving/2019-10-18/vertices/payment_method#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/people/{person_id}/payment_methods
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/people/{person_id}/payment_methods)

[# Example Object](#/apps/giving/2019-10-18/vertices/payment_method#example-object)

```
{
  "type": "PaymentMethod",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "method_type": "value",
    "method_subtype": "string",
    "last4": "string",
    "brand": "string",
    "expiration": "2000-01-01",
    "verified": true
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/payment_method#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a payment method.

`created_at`

`date_time`

The date and time at which a payment method was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a payment method was last updated. Example: `2000-01-01T12:00:00Z`

`method_type`

`string`

Determines whether or not the payment method is a card or bank account.

Possible values: `card`, `us_bank_account`, or `au_becs_debit`

`method_subtype`

`string`

For cards, either `credit`, `debit`, `prepaid`, or `unknown`. For bank accounts, either `checking` or `savings`.

`last4`

`string`

The last 4 digits of the payment method's number. For cards, this is the last 4 digits of the card number. For bank accounts, this is the last 4 digits of the bank account number. Note: In cases where we don't have all 4 digits on file, a `*` will be used to pad the number. For example: `*321`

`brand`

`string`

For cards, this is the card brand (eg Visa, Mastercard, etc). For bank accounts, this is the bank name.

`expiration`

`date`

For cards only. String representation of the expiration date in the `MM/YYYY` form (without leading zeros). Will be `null` for bank accounts.

`verified`

`boolean`

For bank accounts only. Will be `null` for cards.

[# URL Parameters](#/apps/giving/2019-10-18/vertices/payment_method#url-parameters)

# Pagination

Name

Parameter

Type

Description

per\_page

per\_page

integer

how many records to return per page (min=1, max=100, default=25)

offset

offset

integer

get results from given offset

[# Endpoints](#/apps/giving/2019-10-18/vertices/payment_method#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/people/{person_id}/payment_methods`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/people/{person_id}/payment_methods/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/payment_method#associations)

# recurring\_donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/payment_methods/{payment_method_id}/recurring_donations`

Copy

[RecurringDonation](recurring_donation.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/payment_method#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/payment_methods`

Copy

[Person](person.md)

# RecurringDonation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/payment_method`

Copy

[RecurringDonation](recurring_donation.md)