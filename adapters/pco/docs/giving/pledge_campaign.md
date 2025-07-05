Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](pledge_campaign.md)

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

# PledgeCampaign

A `PledgeCampaign` is a way to request and track long-terms commitments to a particular goal or project.

[# Example Request](#/apps/giving/2019-10-18/vertices/pledge_campaign#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/pledge_campaigns
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/pledge_campaigns)

[# Example Object](#/apps/giving/2019-10-18/vertices/pledge_campaign#example-object)

```
{
  "type": "PledgeCampaign",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "description": "string",
    "starts_at": "2000-01-01T12:00:00Z",
    "ends_at": "2000-01-01T12:00:00Z",
    "goal_cents": 1,
    "goal_currency": "USD",
    "show_goal_in_church_center": true,
    "received_total_from_pledges_cents": 1,
    "received_total_outside_of_pledges_cents": 1
  },
  "relationships": {
    "fund": {
      "data": {
        "type": "Fund",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/pledge_campaign#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

`name`

`string`

`description`

`string`

`starts_at`

`date_time`

`ends_at`

`date_time`

`goal_cents`

`integer`

Optional. During the donation period of this campaign, the running total of donations will be tracked against this number

`goal_currency`

`currency_abbreviation`

`show_goal_in_church_center`

`boolean`

In addition to seeing their personal pledge progress within their donor profile, this option allows donors to see the the collective progress towards the campaign’s overall goal (if set).

`received_total_from_pledges_cents`

`integer`

`received_total_outside_of_pledges_cents`

`integer`

[# Relationships](#/apps/giving/2019-10-18/vertices/pledge_campaign#relationships)

Name

Type

Association Type

Note

fund

Fund

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/pledge_campaign#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

fund

include associated fund

create and update

# Order By

Parameter

Value

Type

Description

order

ends\_at

string

prefix with a hyphen (-ends\_at) to reverse the order

order

starts\_at

string

prefix with a hyphen (-starts\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

ends\_at

where[ends\_at]

date\_time

Query on a specific ends\_at

`?where[ends_at]=2000-01-01T12:00:00Z`

fund\_id

where[fund\_id]

integer

Query on a related fund

`?where[fund_id]=1`

starts\_at

where[starts\_at]

date\_time

Query on a specific starts\_at

`?where[starts_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/pledge_campaign#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/pledge_campaigns`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/pledge_campaigns/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/pledge_campaigns`

Copy

* name
* description
* starts\_at
* ends\_at
* goal\_cents
* show\_goal\_in\_church\_center
* fund\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/pledge_campaigns/{id}`

Copy

* name
* description
* starts\_at
* ends\_at
* goal\_cents
* show\_goal\_in\_church\_center
* fund\_id

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/pledge_campaigns/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/pledge_campaign#associations)

# fund

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/pledge_campaigns/{pledge_campaign_id}/fund`

Copy

[Fund](fund.md)

# pledges

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/pledge_campaigns/{pledge_campaign_id}/pledges`

Copy

[Pledge](pledge.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/pledge_campaign#belongs-to)

# Pledge

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/pledges/{pledge_id}/pledge_campaign`

Copy

[Pledge](pledge.md)