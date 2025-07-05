Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](fund.md)

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

# Fund

A `Fund` is a way of tracking the intent of `Donation`.

All `Organization`s have a default `Fund` (usually named "General"), and creating additional `Fund`s allows donors to allocate their gift to a particular cause/effort.

You can query for the default `Fund` using the `default` param:

```


```
GET https://api.planningcenteronline.com/giving/v2/funds?where[default]=true

```


```

[# Example Request](#/apps/giving/2019-10-18/vertices/fund#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/funds
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/funds)

[# Example Object](#/apps/giving/2019-10-18/vertices/fund#example-object)

```
{
  "type": "Fund",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "ledger_code": "string",
    "description": "string",
    "visibility": "value",
    "default": true,
    "color": "string",
    "deletable": true
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/fund#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a fund.

`created_at`

`date_time`

The date and time at which a fund was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a fund was last updated. Example: `2000-01-01T12:00:00Z`

`name`

`string`

Required. The name for a fund. Must be unique within the associated organization.

`ledger_code`

`string`

If an organization's general ledger software tracks funds by code, this attribute can be used to store the fund's code for reference.

`description`

`string`

A short description that describes how the money given to the fund will be used. 255 characters maximum.

`visibility`

`string`

Required. Controls how a fund is visible on Church Center. `everywhere` will allow anyone to donate to the fund on Church Center. `admin_only` will hide the fund on Church Center, allowing only permitted Giving Users to designate donations to it. `nowhere` will prevent donations from being designated to the fund altogether, while still displaying fund data in historical reports. `hidden` will hide the fund from the list of funds in the default Church Center donation form, but allow donors to give to it via direct link, or through Text-to-Give.

Possible values: `everywhere`, `admin_only`, `nowhere`, or `hidden`

`default`

`boolean`

This attribute is set to `true` if a fund is the associated organization's default fund, or `false` if it isn't. More information on default funds can be found in our product documentation: https://pcogiving.zendesk.com/hc/en-us/articles/205197070-Funds

`color`

`string`

The hex color code that is used to help differentiate the fund from others in Giving, as determined by `color_identifier`.

`deletable`

`boolean`

Boolean that tells if you if the fund can be deleted or not. Read more in our product documentation: https://pcogiving.zendesk.com/hc/en-us/articles/205197070-Managing-Funds#DeleteaFund

[# URL Parameters](#/apps/giving/2019-10-18/vertices/fund#url-parameters)

# Query By

Name

Parameter

Type

Description

Example

default

where[default]

boolean

Query on a specific default

`?where[default]=true`

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

name

where[name]

string

Query on a specific name

`?where[name]=string`

visibility

where[visibility]

string

Query on a specific visibility

Possible values: `everywhere`, `admin_only`, `nowhere`, or `hidden`

`?where[visibility]=value`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/fund#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/funds`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/funds/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/funds`

Copy

* name
* ledger\_code
* description
* visibility

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/funds/{id}`

Copy

* name
* ledger\_code
* description
* visibility

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/funds/{id}`

Copy

[# Belongs To](#/apps/giving/2019-10-18/vertices/fund#belongs-to)

# Designation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/designations/{designation_id}/fund`

Copy

[Designation](designation.md)

# InKindDonation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/in_kind_donations/{in_kind_donation_id}/fund`

Copy

[InKindDonation](in_kind_donation.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/funds`

Copy

[Organization](organization.md)

# PledgeCampaign

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/pledge_campaigns/{pledge_campaign_id}/fund`

Copy

[PledgeCampaign](pledge_campaign.md)

# RecurringDonationDesignation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/designations/{recurring_donation_designation_id}/fund`

Copy

[RecurringDonationDesignation](recurring_donation_designation.md)