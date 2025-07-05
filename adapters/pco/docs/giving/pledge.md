Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](pledge.md)

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

# Pledge

A `Pledge` made by a `Person` toward a particular `PledgeCampaign`.

[# Example Request](#/apps/giving/2019-10-18/vertices/pledge#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/pledges
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/pledges)

[# Example Object](#/apps/giving/2019-10-18/vertices/pledge#example-object)

```
{
  "type": "Pledge",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "amount_cents": 1,
    "amount_currency": "USD",
    "joint_giver_amount_cents": 1,
    "donated_total_cents": 1,
    "joint_giver_donated_total_cents": 1
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "pledge_campaign": {
      "data": {
        "type": "PledgeCampaign",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/pledge#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

`amount_cents`

`integer`

The amount pledged

`amount_currency`

`currency_abbreviation`

`joint_giver_amount_cents`

`integer`

The amount pledged by the joint giver, if in a joint giving unit

`donated_total_cents`

`integer`

The amount donated

`joint_giver_donated_total_cents`

`integer`

The amount donated by the joint giver, if in a joint giving unit

[# Relationships](#/apps/giving/2019-10-18/vertices/pledge#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

pledge\_campaign

PledgeCampaign

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/pledge#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

joint\_giver

include associated joint\_giver

include

pledge\_campaign

include associated pledge\_campaign

create and update

# Order By

Parameter

Value

Type

Description

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

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

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/pledge#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/pledges`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/pledges/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/pledges`

Copy

* amount\_cents
* person\_id
* pledge\_campaign\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/pledges/{id}`

Copy

* amount\_cents

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/pledges/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/pledge#associations)

# joint\_giver

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/pledges/{pledge_id}/joint_giver`

Copy

[Person](person.md)

# pledge\_campaign

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/pledges/{pledge_id}/pledge_campaign`

Copy

[PledgeCampaign](pledge_campaign.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/pledge#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/pledges`

Copy

[Person](person.md)

# PledgeCampaign

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/pledge_campaigns/{pledge_campaign_id}/pledges`

Copy

[PledgeCampaign](pledge_campaign.md)