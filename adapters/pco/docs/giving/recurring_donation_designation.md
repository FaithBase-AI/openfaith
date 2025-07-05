Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](recurring_donation_designation.md)

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

# RecurringDonationDesignation

Much like a `Designation`, A `RecurringDonationDesignation` conveys how much of a `RecurringDonation` goes to a particular `Fund`.

[# Example Request](#/apps/giving/2019-10-18/vertices/recurring_donation_designation#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/recurring_donations/{recurring_donation_id}/designations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/recurring_donations/{recurring_donation_id}/designations)

[# Example Object](#/apps/giving/2019-10-18/vertices/recurring_donation_designation#example-object)

```
{
  "type": "RecurringDonationDesignation",
  "id": "1",
  "attributes": {
    "amount_cents": 1,
    "amount_currency": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/recurring_donation_designation#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a recurring donation designation.

`amount_cents`

`integer`

Required. The number of cents that will be donated to a recurring donation designation's associated fund.

`amount_currency`

`string`

The currency of `amount_cents`. Set to the currency of the associated organization.

[# URL Parameters](#/apps/giving/2019-10-18/vertices/recurring_donation_designation#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

fund

include associated fund

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/recurring_donation_designation#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/designations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/designations/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/recurring_donation_designation#associations)

# fund

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/designations/{recurring_donation_designation_id}/fund`

Copy

[Fund](fund.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/recurring_donation_designation#belongs-to)

# RecurringDonation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/designations`

Copy

[RecurringDonation](recurring_donation.md)