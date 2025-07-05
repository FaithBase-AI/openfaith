Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](designation.md)

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

# Designation

A `Designation` conveys how much of a `Donation` goes to a particular `Fund`.

`Designation` details are required when creating a `Donation`. If all of a `Donation` is going to a single `Fund`, it will only have one `Designation`. Similarly, to split a `Donation` between multiple `Fund`s, you can use multiple `Designation`s.

[# Example Request](#/apps/giving/2019-10-18/vertices/designation#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/donations/{donation_id}/designations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/donations/{donation_id}/designations)

[# Example Object](#/apps/giving/2019-10-18/vertices/designation#example-object)

```
{
  "type": "Designation",
  "id": "1",
  "attributes": {
    "amount_cents": 1,
    "amount_currency": "string",
    "fee_cents": 1
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

[# Attributes](#/apps/giving/2019-10-18/vertices/designation#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a designation.

`amount_cents`

`integer`

Required. The number of cents being donated to a designation's associated fund.

`amount_currency`

`string`

The currency of `amount_cents`. Set to the currency of the associated organization.

`fee_cents`

`integer`

The fee amount distributed to a donation's designation in proportion to the amount of the designation. This should either be 0 or a negative integer.

[# Relationships](#/apps/giving/2019-10-18/vertices/designation#relationships)

Name

Type

Association Type

Note

fund

Fund

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/designation#url-parameters)

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/designation#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/designations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/designations/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/designation#associations)

# fund

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/designations/{designation_id}/fund`

Copy

[Fund](fund.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/designation#belongs-to)

# DesignationRefund

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/refund/designation_refunds/{designation_refund_id}/designation`

Copy

[DesignationRefund](designation_refund.md)

# Donation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/designations`

Copy

[Donation](donation.md)