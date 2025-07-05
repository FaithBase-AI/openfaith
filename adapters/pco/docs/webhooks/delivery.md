Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](delivery.md)

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

# Delivery

[# Example Request](#/apps/webhooks/2022-10-20/vertices/delivery#example-request)

```
curl https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/deliveries
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/deliveries)

[# Example Object](#/apps/webhooks/2022-10-20/vertices/delivery#example-object)

```
{
  "type": "Delivery",
  "id": "1",
  "attributes": {
    "status": 1,
    "request_headers": "string",
    "request_body": "string",
    "response_headers": "string",
    "response_body": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "timing": 1.42,
    "object_url": "string"
  },
  "relationships": {
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/webhooks/2022-10-20/vertices/delivery#attributes)

Name

Type

Description

`id`

`primary_key`

`status`

`integer`

`request_headers`

`string`

`request_body`

`string`

`response_headers`

`string`

`response_body`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`timing`

`float`

`object_url`

`string`

[# Relationships](#/apps/webhooks/2022-10-20/vertices/delivery#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

[# URL Parameters](#/apps/webhooks/2022-10-20/vertices/delivery#url-parameters)

# Order By

Parameter

Value

Type

Description

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

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

[# Endpoints](#/apps/webhooks/2022-10-20/vertices/delivery#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/deliveries`

Copy

# Reading

HTTP Method

Endpoint

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/deliveries/{id}`

Copy

[# Belongs To](#/apps/webhooks/2022-10-20/vertices/delivery#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/deliveries`

Copy

[Event](event.md)