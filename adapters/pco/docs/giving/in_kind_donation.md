Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](in_kind_donation.md)

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

# InKindDonation

An `InKindDonation` record represents a non-cash gift given to an `Organization` at a specific time.

These include items like furniture, vehicles, services, or stocks. `InKindDonations` do not trigger
acknowledgment letter emails via the API — these must be sent from the Giving Admin UI.

[More info](https://pcogiving.zendesk.com/hc/en-us/articles/360040772154-In-kind-donations#enter-an-in-kind-donation-0)

[# Example Request](#/apps/giving/2019-10-18/vertices/in_kind_donation#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/in_kind_donations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/in_kind_donations)

[# Example Object](#/apps/giving/2019-10-18/vertices/in_kind_donation#example-object)

```
{
  "type": "InKindDonation",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "exchange_details": "string",
    "fair_market_value_cents": 1,
    "received_on": "2000-01-01",
    "valuation_details": "string",
    "acknowledgment_last_sent_at": "2000-01-01T12:00:00Z",
    "fair_market_value_currency": "USD"
  },
  "relationships": {
    "fund": {
      "data": {
        "type": "Fund",
        "id": "1"
      }
    },
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "campus": {
      "data": {
        "type": "Campus",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/in_kind_donation#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for an in-kind donation.

`created_at`

`date_time`

The date and time at which an in-kind donation was created.

Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which an in-kind donation was last updated.

Example: `2000-01-01T12:00:00Z`

`description`

`string`

Required. Brief description of an in-kind donation gift.

Example: `2019 Toyota Corolla (used)`

`exchange_details`

`string`

Optional. Records whether any goods or services were exchanged for an in-kind donation.

Example: `In exchange, a charity event ticket for $100 was provided.`

`fair_market_value_cents`

`integer`

Optional. The fair market value of an in-kind donation in cents. Must be greater than $0 and less than or equal to $21,000,000.

`received_on`

`date`

Required. The date an in-kind donation was received.

Format: `YYYY-MM-DD` (e.g. `2025-04-09`).

`valuation_details`

`string`

Optional. The fair market for an in-kind donation which should be determined by donors and appraisers. Maximum 255 characters. Example: `Appraised by Bob Johnson CPA (123 Easy Street, Carlsbad CA 92008)`

`acknowledgment_last_sent_at`

`date_time`

The timestamp of when the acknowledgment letter was last sent for this in-kind donation. This value is set automatically and cannot be manually changed.

`fair_market_value_currency`

`currency_abbreviation`

[# Relationships](#/apps/giving/2019-10-18/vertices/in_kind_donation#relationships)

Name

Type

Association Type

Note

fund

Fund

to\_one

`Fund` is required.

person

Person

to\_one

`Person` is required.

campus

Campus

to\_one

`Campus` is automatically assigned based on the donor's primary campus. If you pass an explicit value (a relationship reference or `null`), it will override the default.

[# URL Parameters](#/apps/giving/2019-10-18/vertices/in_kind_donation#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

campus

include associated campus

create and update

include

fund

include associated fund

create and update

include

person

include associated person

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

received\_on

string

prefix with a hyphen (-received\_on) to reverse the order

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

campus\_id

where[campus\_id]

integer

`Campus` is automatically assigned based on the donor's primary campus. If you pass an explicit value (a relationship reference or `null`), it will override the default.

`?where[campus_id]=1`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

fund\_id

where[fund\_id]

integer

`Fund` is required.

`?where[fund_id]=1`

received\_on

where[received\_on]

date

Query on a specific received\_on

`?where[received_on]=2000-01-01`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/in_kind_donation#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/in_kind_donations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/in_kind_donations/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/in_kind_donations`

Copy

* description
* exchange\_details
* fair\_market\_value\_cents
* received\_on
* valuation\_details
* fair\_market\_value\_currency
* fund\_id
* campus\_id
* person\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/in_kind_donations/{id}`

Copy

* description
* exchange\_details
* fair\_market\_value\_cents
* received\_on
* valuation\_details
* fair\_market\_value\_currency
* fund\_id
* campus\_id
* person\_id

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/in_kind_donations/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/in_kind_donation#associations)

# campus

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/in_kind_donations/{in_kind_donation_id}/campus`

Copy

[Campus](campus.md)

# fund

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/in_kind_donations/{in_kind_donation_id}/fund`

Copy

[Fund](fund.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/in_kind_donations/{in_kind_donation_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/in_kind_donation#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/in_kind_donations`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/in_kind_donations`

Copy

[Person](person.md)