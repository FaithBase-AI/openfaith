Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](batch_group.md)

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

# BatchGroup

A `BatchGroup` is a collection of `Batch`es.

`BatchGroup`s are an optional way of organizing your `Batch`es into groups that share common characteristics. These are completely customizable and can be used in whatever way makes sense to your organization's workflow.

Similarly to `Batch`es, you can `commit` (see more in the Actions section) a `BatchGroup`, and by doing so, all `Batches` and `Donations` contained in the `BatchGroup` will also be committed.

[# Example Request](#/apps/giving/2019-10-18/vertices/batch_group#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/batch_groups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/batch_groups)

[# Example Object](#/apps/giving/2019-10-18/vertices/batch_group#example-object)

```
{
  "type": "BatchGroup",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "committed": true,
    "total_cents": 1,
    "total_currency": "string",
    "status": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/batch_group#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a batch group. For batches and batch groups, these identifiers are unique not across all of Planning Center, but only per organization. As such, it is possible to see the same batch group `id` in multiple organizations.

`created_at`

`date_time`

The date and time at which a batch group was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a batch group was last updated. Example: `2000-01-01T12:00:00Z`

`description`

`string`

A brief description of what a batch group is for. This is displayed in Giving to help differentiate different batch groups from one another. If no description is provided for a batch group, it will be referred to as `Untitled group` within Giving.

`committed`

`boolean`

Returns `true` if a batch group has been committed, and `false` if it hasn't.

`total_cents`

`integer`

The gross total of cents donated within the batch group. Factors in all donations made to each batch within the group.

`total_currency`

`string`

The currency used to calculate `total_cents`.

`status`

`string`

One of `in_progress`, `updating`, or `committed`. The `updating` state is temporary and describes a BatchGroup that is currently being changed in some way (e.g. moving from `in_progress` to `committed`). Certain changes to BatchGroups in this state (or their Batches or Donations) will be restricted until the BatchGroup has finished updating.

[# URL Parameters](#/apps/giving/2019-10-18/vertices/batch_group#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

owner

include associated owner

# Order By

Parameter

Value

Type

Description

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

updated\_at

where[updated\_at]

date\_time

Query on a specific updated\_at

`?where[updated_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/batch_group#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/batch_groups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/batch_groups/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/batch_groups`

Copy

* description

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/batch_groups/{id}`

Copy

* description

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/batch_groups/{id}`

Copy

[# Actions](#/apps/giving/2019-10-18/vertices/batch_group#actions)

# commit

HTTP Method

Endpoint

Description

POST

`/giving/v2/batch_groups/{batch_group_id}/commit`

Copy

Used to commit an in progress batch group.

Details:

This action takes an uncommitted BatchGroup and commits it.
It will respond with `unprocessable_entity` if the BatchGroup cannot be committed.

It does not expect a body.

Committing a BatchGroup happens asyncronously, so initially the BatchGroup's `status` will be `updating`.
You can poll that BatchGroup's endpoint to see whether it's changed from `updating` to `committed`.

Permissions:

Must be authenticated

[# Associations](#/apps/giving/2019-10-18/vertices/batch_group#associations)

# batches

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/batch_groups/{batch_group_id}/batches`

Copy

[Batch](batch.md)

* `committed`
* `in_progress`

# owner

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/batch_groups/{batch_group_id}/owner`

Copy

[Person](person.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/batch_group#belongs-to)

# Batch

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/batches/{batch_id}/batch_group`

Copy

[Batch](batch.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/batch_groups`

Copy

[Organization](organization.md)

* `committed`
* `in_progress`

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/batch_groups`

Copy

[Person](person.md)

* `committed`
* `in_progress`