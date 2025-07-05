Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

2022-10-20

Info

[AvailableEvent](available_event.md)

[Delivery](delivery.md)

[Event](event.md)

[Organization](organization.md)

[WebhookSubscription](webhook_subscription.md)

# Organization

[# Example Request](#/apps/webhooks/2022-10-20/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/webhooks/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/webhooks/v2)

[# Example Object](#/apps/webhooks/2022-10-20/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {},
  "relationships": {}
}
```

[# Attributes](#/apps/webhooks/2022-10-20/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

[# URL Parameters](#/apps/webhooks/2022-10-20/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/webhooks/2022-10-20/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/webhooks/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/webhooks/v2/{id}`

Copy

[# Associations](#/apps/webhooks/2022-10-20/vertices/organization#associations)

# available\_events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/webhooks/v2/available_events`

Copy

[AvailableEvent](available_event.md)

# webhook\_subscriptions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/webhooks/v2/webhook_subscriptions`

Copy

[WebhookSubscription](webhook_subscription.md)