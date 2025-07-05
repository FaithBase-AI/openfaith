Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](recurring_donation.md)

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

# RecurringDonation

A `RecurringDonation` is represents a `Donation` that repeats on a set schedule (weekly, monthly, etc.)

Data for `RecurringDonation`s is read-only; they can not be created or edited through the API.

[# Example Request](#/apps/giving/2019-10-18/vertices/recurring_donation#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/recurring_donations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/recurring_donations)

[# Example Object](#/apps/giving/2019-10-18/vertices/recurring_donation#example-object)

```
{
  "type": "RecurringDonation",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "release_hold_at": "2000-01-01T12:00:00Z",
    "amount_cents": 1,
    "status": "string",
    "last_donation_received_at": "2000-01-01T12:00:00Z",
    "next_occurrence": "2000-01-01T12:00:00Z",
    "schedule": {
      "day_in_month": {
        "day": 1
      }
    },
    "amount_currency": "USD"
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/recurring_donation#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a recurring donation.

`created_at`

`date_time`

The date and time at which a recurring donation was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a recurring donation was last updated. Example: `2000-01-01T12:00:00Z`

`release_hold_at`

`date_time`

The date when the hold on a recurring donation with a status of `temporary_hold` will be released.

`amount_cents`

`integer`

The number of cents scheduled to be donated.

`status`

`string`

Determines if a recurring donation is active or on hold, and if on hold, the kind of hold that has been placed on it.

Possible values: `active`, `indefinite_hold` or `temporary_hold`.

`last_donation_received_at`

`date_time`

The date and time that the last donation was made for a recurring donation. Example: `2000-01-01T12:00:00Z`

`next_occurrence`

`date_time`

The date that the next donation will be made for a recurring donation. Example: `2000-01-01T12:00:00Z`

`schedule`

`repeatable_schedule`

JSON representation of the billing schedule. See the repeatable Ruby gem for more details on the structure and meaning: https://github.com/molawson/repeatable#time-expressions

`amount_currency`

`currency_abbreviation`

The currency of `amount_cents`.

[# Relationships](#/apps/giving/2019-10-18/vertices/recurring_donation#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/recurring_donation#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

designations

include associated designations

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/recurring_donation#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/recurring_donations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/recurring_donations/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/recurring_donation#associations)

# payment\_method

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/payment_method`

Copy

[PaymentMethod](payment_method.md)

# designations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/recurring_donations/{recurring_donation_id}/designations`

Copy

[RecurringDonationDesignation](recurring_donation_designation.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/recurring_donation#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/recurring_donations`

Copy

[Organization](organization.md)

# PaymentMethod

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/payment_methods/{payment_method_id}/recurring_donations`

Copy

[PaymentMethod](payment_method.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/recurring_donations`

Copy

[Person](person.md)