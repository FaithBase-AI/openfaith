Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](refund.md)

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

# Refund

A `Refund` record holds information pertaining to a refunded `Donation`.

[# Example Request](#/apps/giving/2019-10-18/vertices/refund#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/donations/{donation_id}/refund
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/donations/{donation_id}/refund)

[# Example Object](#/apps/giving/2019-10-18/vertices/refund#example-object)

```
{
  "type": "Refund",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "amount_cents": 1,
    "amount_currency": "string",
    "fee_cents": 1,
    "refunded_at": "2000-01-01T12:00:00Z",
    "fee_currency": "USD"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/refund#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a refund.

`created_at`

`date_time`

The date and time at which a refund was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a refund was last updated. Example: `2000-01-01T12:00:00Z`

`amount_cents`

`integer`

The number of cents being refunded.

`amount_currency`

`string`

The currency of `amount_cents`.

`fee_cents`

`integer`

The payment processing fee returned by Stripe, if any.

`refunded_at`

`date_time`

The date and time at which a refund was processed. Example: `2000-01-01T12:00:00Z`

`fee_currency`

`currency_abbreviation`

The currency of `fee_cents`.

[# URL Parameters](#/apps/giving/2019-10-18/vertices/refund#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

designation\_refunds

include associated designation\_refunds

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/refund#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/refund`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/refund/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/refund#associations)

# designation\_refunds

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/refund/{refund_id}/designation_refunds`

Copy

[DesignationRefund](designation_refund.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/refund#belongs-to)

# Donation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/refund`

Copy

[Donation](donation.md)