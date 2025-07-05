Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](payment_source.md)

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

# PaymentSource

A donation's `PaymentSource` refers to the platform it originated from.

`Donation`s made through Giving will be assigned the built-in `PaymentSource` "Planning Center". `Donation`s made through external platforms (Square, Pushpay, ect.) can be assigned a `PaymentSource` identifying them as such.

[# Example Request](#/apps/giving/2019-10-18/vertices/payment_source#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/payment_sources
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/payment_sources)

[# Example Object](#/apps/giving/2019-10-18/vertices/payment_source#example-object)

```
{
  "type": "PaymentSource",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "payment_source_type": "value"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/payment_source#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a payment source.

`created_at`

`date_time`

The date and time at which a payment source was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a payment source was last updated. Example: `2000-01-01T12:00:00Z`

`name`

`string`

Required. The name of a payment source. Must be unique within the associated organization.

`payment_source_type`

`string`

For more info on payment source types, please refer to our [documentation on creating a payment source](https://pcogiving.zendesk.com/hc/en-us/articles/115012277207-Payment-Sources#create-the-payment-source-1).

Possible values: `direct_from_donor`, `donor_advised_fund`, or `qualified_charitable_distribution`

[# URL Parameters](#/apps/giving/2019-10-18/vertices/payment_source#url-parameters)

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/payment_source#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/payment_sources`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/payment_sources/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/payment_sources`

Copy

* name
* payment\_source\_type

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/payment_sources/{id}`

Copy

* name
* payment\_source\_type

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/payment_sources/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/payment_source#associations)

# donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/payment_sources/{payment_source_id}/donations`

Copy

[Donation](donation.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/payment_source#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/payment_sources`

Copy

[Organization](organization.md)