Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](designation_refund.md)

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

# DesignationRefund

A record that links a `Refund` with a `Designation`

[# Example Request](#/apps/giving/2019-10-18/vertices/designation_refund#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/donations/{donation_id}/refund/designation_refunds
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/donations/{donation_id}/refund/designation_refunds)

[# Example Object](#/apps/giving/2019-10-18/vertices/designation_refund#example-object)

```
{
  "type": "DesignationRefund",
  "id": "1",
  "attributes": {
    "amount_cents": 1,
    "amount_currency": "string"
  },
  "relationships": {
    "designation": {
      "data": {
        "type": "Designation",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/designation_refund#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a designation refund.

`amount_cents`

`integer`

The number of cents being refunded.

`amount_currency`

`string`

The currency of `amount_cents`.

[# Relationships](#/apps/giving/2019-10-18/vertices/designation_refund#relationships)

Name

Type

Association Type

Note

designation

Designation

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/designation_refund#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

designation

include associated designation

create and update

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/designation_refund#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/refund/designation_refunds`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/refund/designation_refunds/{id}`

Copy

[# Associations](#/apps/giving/2019-10-18/vertices/designation_refund#associations)

# designation

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/refund/designation_refunds/{designation_refund_id}/designation`

Copy

[Designation](designation.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/designation_refund#belongs-to)

# Refund

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/refund/{refund_id}/designation_refunds`

Copy

[Refund](refund.md)