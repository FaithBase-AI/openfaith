Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](available_event.md)

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

# AvailableEvent

Collection Only

An event supported by webhooks

[# Example Request](#/apps/webhooks/2022-10-20/vertices/available_event#example-request)

```
curl https://api.planningcenteronline.com/webhooks/v2/available_events
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/webhooks/v2/available_events)

[# Example Object](#/apps/webhooks/2022-10-20/vertices/available_event#example-object)

```
{
  "type": "AvailableEvent",
  "id": "1",
  "attributes": {
    "name": "string",
    "app": "string",
    "version": "string",
    "type": "string",
    "resource": "string",
    "action": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/webhooks/2022-10-20/vertices/available_event#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`app`

`string`

`version`

`string`

`type`

`string`

`resource`

`string`

`action`

`string`

[# URL Parameters](#/apps/webhooks/2022-10-20/vertices/available_event#url-parameters)

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

[# Endpoints](#/apps/webhooks/2022-10-20/vertices/available_event#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/webhooks/v2/available_events`

Copy

[# Belongs To](#/apps/webhooks/2022-10-20/vertices/available_event#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/webhooks/v2/available_events`

Copy

[Organization](organization.md)