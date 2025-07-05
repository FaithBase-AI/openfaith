Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](campus.md)

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

# Campus

A `Campus` that has been added to your `Organization`.

`Campus`es can be especially useful in filtering `Donation`s across the various locations of your `Organization`.

[# Example Request](#/apps/giving/2019-10-18/vertices/campus#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/campuses
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/campuses)

[# Example Object](#/apps/giving/2019-10-18/vertices/campus#example-object)

```
{
  "type": "Campus",
  "id": "1",
  "attributes": {
    "name": "string",
    "address": {}
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/campus#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a campus.

`name`

`string`

The name for a campus. Campus names can be set via Accounts or the People API.

`address`

`object`

The address for a campus. Campus descriptions can be set via Accounts or the People API.

[# URL Parameters](#/apps/giving/2019-10-18/vertices/campus#url-parameters)

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/campus#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/campuses`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/campuses/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/campus#associations)

# donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/campuses/{campus_id}/donations`

Copy

[Donation](donation.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/campus#belongs-to)

# Donation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/campus`

Copy

[Donation](donation.md)

# InKindDonation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/in_kind_donations/{in_kind_donation_id}/campus`

Copy

[InKindDonation](in_kind_donation.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/campuses`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/primary_campus`

Copy

[Person](person.md)