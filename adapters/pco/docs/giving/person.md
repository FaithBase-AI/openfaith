Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

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

# Person

A Planning Center `Person` record that has been added to Giving.

The `Person` object in Planning Center is so crucial that we have an entire product dedicated to managing, keeping track of, editing, and creating these records and metadata around them. For additional info, take a look at the [Planning Center People API Docs](https://developer.planning.center/docs/#/apps/people).

[# Example Request](#/apps/giving/2019-10-18/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/people)

[# Example Object](#/apps/giving/2019-10-18/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "permissions": "string",
    "email_addresses": [],
    "addresses": [],
    "phone_numbers": [],
    "first_name": "string",
    "last_name": "string",
    "donor_number": 1,
    "first_donated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "primary_campus": {
      "data": {
        "type": "Campus",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/person#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a person.

`permissions`

`string`

The level of Giving access granted to a person. See our product documentation for more information on [permissions in Giving](https://pcogiving.zendesk.com/hc/en-us/articles/206541708-Permissions-in-Giving).

Possible values: `administrator`, `reviewer`, `counter`, or `bookkeeper`

`email_addresses`

`array`

An array of email addresses for a person. Can be managed via People. Example:

```


```
  [
    {
      "address": "support@planningcenter.com",
      "location": "Home",
      "blocked": false,
      "primary": true
    }
  ]

```


```

`addresses`

`array`

An array of addresses for a person. Can be managed via People. Example:

```


```
  [
    {
      "street_line_1": "2790 Gateway Rd",
      "street_line_2": "",
      "city": "Carlsbad",
      "state": "CA",
      "zip": "92009",
      "location": "Home",
      "primary": true,
      "street": "2790 Gateway Rd",
      "line_1": "2790 Gateway Rd",
      "line_2": "Carlsbad, CA 92009"
    }
  ]

```


```

`phone_numbers`

`array`

An array of phone numbers for a person. Can be managed via People. Example:

```


```
  [
    {
      "number": "(123) 456-7890",
      "carrier": "PC Mobile",
      "location": "Mobile",
      "primary": true
    }
  ]

```


```

`first_name`

`string`

A person's first name.

`last_name`

`string`

A person's last name.

`donor_number`

`integer`

The donor number for a person, if applicable. See our product documentation for more information on [donor numbers](https://pcogiving.zendesk.com/hc/en-us/articles/360012298634-donor-numbers).

`first_donated_at`

`date_time`

Timestamp of a person's first donation or `null` if they have never donated.

[# Relationships](#/apps/giving/2019-10-18/vertices/person#relationships)

Name

Type

Association Type

Note

primary\_campus

Campus

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/person#url-parameters)

# Query By

Name

Parameter

Type

Description

Example

first\_name

where[first\_name]

string

Query on a specific first\_name

`?where[first_name]=string`

last\_name

where[last\_name]

string

Query on a specific last\_name

`?where[last_name]=string`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/people/{id}`

Copy

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/people/{id}`

Copy

* donor\_number

[# Associations](#/apps/giving/2019-10-18/vertices/person#associations)

# batch\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/batch_groups`

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

`/giving/v2/people/{person_id}/batches`

Copy

[Batch](batch.md)

* `committed`
* `in_progress`

# donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/donations`

Copy

[Donation](donation.md)

# in\_kind\_donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/in_kind_donations`

Copy

[InKindDonation](in_kind_donation.md)

# payment\_methods

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/payment_methods`

Copy

[PaymentMethod](payment_method.md)

# pledges

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/pledges`

Copy

[Pledge](pledge.md)

# primary\_campus

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/primary_campus`

Copy

[Campus](campus.md)

# recurring\_donations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/people/{person_id}/recurring_donations`

Copy

[RecurringDonation](recurring_donation.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/person#belongs-to)

# BatchGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/batch_groups/{batch_group_id}/owner`

Copy

[BatchGroup](batch_group.md)

# Batch

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/batches/{batch_id}/owner`

Copy

[Batch](batch.md)

# InKindDonation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/in_kind_donations/{in_kind_donation_id}/person`

Copy

[InKindDonation](in_kind_donation.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people`

Copy

[Organization](organization.md)

* `has_donated` — filter to people with at least one associated donation

# Pledge

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/pledges/{pledge_id}/joint_giver`

Copy

[Pledge](pledge.md)