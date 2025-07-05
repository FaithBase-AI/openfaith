Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](label.md)

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

# Label

A `Label` is a way for Admins to manage and categorize `Donation`s.

Multiple `Label`s can be added for each `Donation`, and these will only be displayed in the Giving admin interface, so donors never see them.

[# Example Request](#/apps/giving/2019-10-18/vertices/label#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/labels
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/labels)

[# Example Object](#/apps/giving/2019-10-18/vertices/label#example-object)

```
{
  "type": "Label",
  "id": "1",
  "attributes": {
    "slug": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/label#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a label.

`slug`

`string`

The label text itself. Made up solely of lowercase letters, numbers, and dashes. When creating or updating a label, the string you provide will be formatted automatically. For example: `My awesome label!` will be saved as `my-awesome-label`

[# URL Parameters](#/apps/giving/2019-10-18/vertices/label#url-parameters)

# Query By

Name

Parameter

Type

Description

Example

slug

where[slug]

string

Query on a specific slug

`?where[slug]=string`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/label#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/labels`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/labels/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/labels`

Copy

* slug

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/labels/{id}`

Copy

* slug

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/labels/{id}`

Copy

[# Belongs To](#/apps/giving/2019-10-18/vertices/label#belongs-to)

# Donation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/labels`

Copy

[Donation](donation.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/labels`

Copy

[Organization](organization.md)