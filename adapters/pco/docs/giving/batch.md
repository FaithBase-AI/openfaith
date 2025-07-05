Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](batch.md)

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

# Batch

A `Batch` is a collection of `Donation`s. When creating `Donation`'s via the API, you're required to put them in a `Batch`.

When a `Batch` is first created, it's in the `in_progress` or "uncommitted" state. You can freely add/remove/modify `Donation`s in this `Batch` and they won't show up in a donor's donation history online, they won't appear in any donor statements issued by the Giving admin, and changes to these donations are not flagged in the system log. Think of it as a staging area for donations.

When a `Batch` is committed (see more in the Actions section), all of the `Donation`s within it are also marked as "committed". At that point, they're visible to donors in their online history, and any further edits made to those `Donation`s are logged and visible to Giving admins.

With all of that in mind, you can use `Batch`es in one of two ways:

1. Create an uncommitted `Batch`, add `Donation`s to it, then commit the `Batch`.
2. Create a `Batch` with a least one donation, commit it, then add more `Donation`s to it.

In both cases, the end result is the same. The main difference is that option #2 does not provide you/other admins the opportunity to fix any mistakes before changes are logged and `Donation`s are made visible to donors. Any `Donation`s added to a committed `Batch` will automatically be committed as well. Note, batches can't be committed until they have at least one donation.

Whichever route you decide to take, it's helpful to make use of the `Batch`'s description to help differentiate these groupings from each other and from other `Batch`es that the Giving admins might be creating on their own.

[# Example Request](#/apps/giving/2019-10-18/vertices/batch#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/batches
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/batches)

[# Example Object](#/apps/giving/2019-10-18/vertices/batch#example-object)

```
{
  "type": "Batch",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "committed_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "donations_count": 1,
    "total_cents": 1,
    "total_currency": "string",
    "status": "string"
  },
  "relationships": {
    "batch_group": {
      "data": {
        "type": "BatchGroup",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/batch#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a batch. For batches and batch groups, these identifiers are unique not across all of Planning Center, but only per organization. As such, it is possible to see the same batch `id` in multiple organizations.

`created_at`

`date_time`

The date and time at which a batch was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a batch was last updated. Example: `2000-01-01T12:00:00Z`

`committed_at`

`date_time`

The date and time that a batch was committed at. If it's `null`, the batch is still in progress or updating. Example: `2000-01-01T12:00:00Z`

`description`

`string`

A brief description of what a batch is for. This is displayed in Giving to help differentiate different batches from one another. If no description is provided for a batch, it will be referred to as `Untitled batch` within Giving.

`donations_count`

`integer`

Only available when requested with the `?fields` param

`total_cents`

`integer`

The gross total of cents donated within the batch.

`total_currency`

`string`

The currency used to calculate `total_cents`.

`status`

`string`

One of `in_progress`, `updating`, or `committed`. The `updating` state is temporary and describes a Batch that is currently being changed in some way (e.g. moving from `in_progress` to `committed`). Certain changes to Batches in this state (or their Donations) will be restricted until the Batch has finished updating.

[# Relationships](#/apps/giving/2019-10-18/vertices/batch#relationships)

Name

Type

Association Type

Note

batch\_group

BatchGroup

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/batch#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

batch\_group

include associated batch\_group

create and update

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/batch#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/batches`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/batches/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/batches`

Copy

* description

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/batches/{id}`

Copy

* description

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/batches/{id}`

Copy

[# Actions](#/apps/giving/2019-10-18/vertices/batch#actions)

# commit

HTTP Method

Endpoint

Description

POST

`/giving/v2/batches/{batch_id}/commit`

Copy

Used to commit an in progress batch.

Details:

This action takes an uncommitted Batch and commits it.
It will respond with `unprocessable_entity` if the Batch cannot be committed.

It does not expect a body.

Committing a Batch happens asyncronously, so initially the Batch's `status` will be `updating`.
You can poll that Batch's endpoint to see whether it's changed from `updating` to `committed`.

Permissions:

Must be authenticated

[# Associations](#/apps/giving/2019-10-18/vertices/batch#associations)

# batch\_group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/batches/{batch_id}/batch_group`

Copy

[BatchGroup](batch_group.md)

# donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/batches/{batch_id}/donations`

Copy

[Donation](donation.md)

# owner

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/batches/{batch_id}/owner`

Copy

[Person](person.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/batch#belongs-to)

# BatchGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/batch_groups/{batch_group_id}/batches`

Copy

[BatchGroup](batch_group.md)

* `committed`
* `in_progress`

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/batches`

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

`/giving/v2/people/{person_id}/batches`

Copy

[Person](person.md)

* `committed`
* `in_progress`