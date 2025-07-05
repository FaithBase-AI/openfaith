Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](note.md)

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

# Note

[# Example Request](#/apps/giving/2019-10-18/vertices/note#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/donations/{donation_id}/note
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/donations/{donation_id}/note)

[# Example Object](#/apps/giving/2019-10-18/vertices/note#example-object)

```
{
  "type": "Note",
  "id": "1",
  "attributes": {
    "body": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/note#attributes)

Name

Type

Description

`id`

`primary_key`

`body`

`string`

[# URL Parameters](#/apps/giving/2019-10-18/vertices/note#url-parameters)

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/note#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/note`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/donations/{donation_id}/note/{id}`

Copy

[# Belongs To](#/apps/giving/2019-10-18/vertices/note#belongs-to)

# Donation

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/note`

Copy

[Donation](donation.md)