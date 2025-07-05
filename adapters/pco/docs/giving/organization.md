Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

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

# Organization

The root level `Organization` record which serves as a link to `Donation`s, `People`, `Fund`s, etc.

[# Example Request](#/apps/giving/2019-10-18/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/giving/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2)

[# Example Object](#/apps/giving/2019-10-18/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "name": "string",
    "time_zone": "string",
    "text2give_enabled": true
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for an organization.

`name`

`string`

The name for an organization.

`time_zone`

`string`

The time zone for an organization.

`text2give_enabled`

`boolean`

`true` if this organization is accepting Text2Give donations, `false` otherwise.

[# URL Parameters](#/apps/giving/2019-10-18/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/organization#associations)

# batch\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/batch_groups`

Copy

[BatchGroup](batch_group.md)

* `committed`
* `in_progress`

# batches

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/batches`

Copy

[Batch](batch.md)

* `committed`
* `in_progress`

# campuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/campuses`

Copy

[Campus](campus.md)

# donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations`

Copy

[Donation](donation.md)

* `succeeded`

# funds

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/funds`

Copy

[Fund](fund.md)

# in\_kind\_donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/in_kind_donations`

Copy

[InKindDonation](in_kind_donation.md)

# labels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/labels`

Copy

[Label](label.md)

# payment\_sources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/payment_sources`

Copy

[PaymentSource](payment_source.md)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people`

Copy

[Person](person.md)

* `has_donated` — filter to people with at least one associated donation

# recurring\_donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/recurring_donations`

Copy

[RecurringDonation](recurring_donation.md)