Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event.md)

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

# Event

[# Example Request](#/apps/webhooks/2022-10-20/vertices/event#example-request)

```
curl https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events)

[# Example Object](#/apps/webhooks/2022-10-20/vertices/event#example-object)

```
{
  "type": "Event",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "status": "value",
    "updated_at": "2000-01-01T12:00:00Z",
    "uuid": "string",
    "payload": "string"
  },
  "relationships": {
    "subscription": {
      "data": {
        "type": "Subscription",
        "id": "1"
      }
    },
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/webhooks/2022-10-20/vertices/event#attributes)

Name

Type

Description

Note

`id`

`primary_key`

`created_at`

`date_time`

`status`

`string`

Possible values: `pending`, `delivered`, `failed`, `skipped`, `duplicated`, `ignored_failed`, `ignored_skipped`, or `ignored_duplicated`

`updated_at`

`date_time`

`uuid`

`string`

`payload`

`string`

A string encoded JSON object. E.G. `"{\"data\":{...}}"`

[# Relationships](#/apps/webhooks/2022-10-20/vertices/event#relationships)

Name

Type

Association Type

Note

subscription

Subscription

to\_one

person

Person

to\_one

[# URL Parameters](#/apps/webhooks/2022-10-20/vertices/event#url-parameters)

# Order By

Parameter

Value

Type

Description

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

status

where[status]

string

Query on a specific status

Possible values: `pending`, `delivered`, `failed`, `skipped`, `duplicated`, `ignored_failed`, `ignored_skipped`, or `ignored_duplicated`

`?where[status]=value`

uuid

where[uuid]

string

Query on a specific uuid

`?where[uuid]=string`

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

[# Endpoints](#/apps/webhooks/2022-10-20/vertices/event#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events`

Copy

# Reading

HTTP Method

Endpoint

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{id}`

Copy

[# Actions](#/apps/webhooks/2022-10-20/vertices/event#actions)

# ignore

HTTP Method

Endpoint

POST

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/ignore`

Copy

Permissions:

Must be authenticated

# redeliver

HTTP Method

Endpoint

POST

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/redeliver`

Copy

Permissions:

Must be authenticated

[# Associations](#/apps/webhooks/2022-10-20/vertices/event#associations)

# deliveries

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events/{event_id}/deliveries`

Copy

[Delivery](delivery.md)

[# Belongs To](#/apps/webhooks/2022-10-20/vertices/event#belongs-to)

# WebhookSubscription

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events`

Copy

[WebhookSubscription](webhook_subscription.md)