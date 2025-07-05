Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](webhook_subscription.md)

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

# WebhookSubscription

[# Example Request](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#example-request)

```
curl https://api.planningcenteronline.com/webhooks/v2/webhook_subscriptions
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/webhooks/v2/webhook_subscriptions)

[# Example Object](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#example-object)

```
{
  "type": "WebhookSubscription",
  "id": "1",
  "attributes": {
    "name": "string",
    "url": "string",
    "active": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "authenticity_secret": "string",
    "application_id": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`url`

`string`

`active`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

`authenticity_secret`

`string`

Every delivery will include a header `X-PCO-Webhooks-Authenticity`.

This header will be the `HMAC-SHA256` value of this the `authenticity_secret` used as the key,
and the message as the webhook body.

`hmac_sha256(authenticity_secret, webhook_body)`

`application_id`

`string`

[# URL Parameters](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#url-parameters)

# Query By

Name

Parameter

Type

Description

Example

application\_id

where[application\_id]

string

Query on a specific application\_id

`?where[application_id]=string`

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

[# Endpoints](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/webhooks/v2/webhook_subscriptions`

Copy

# Reading

HTTP Method

Endpoint

GET

`/webhooks/v2/webhook_subscriptions/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/webhooks/v2/webhook_subscriptions`

Copy

* name
* url
* active

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/webhooks/v2/webhook_subscriptions/{id}`

Copy

* active

# Deleting

HTTP Method

Endpoint

DELETE

`/webhooks/v2/webhook_subscriptions/{id}`

Copy

[# Actions](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#actions)

# rotate\_secret

HTTP Method

Endpoint

POST

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/rotate_secret`

Copy

Permissions:

Must be authenticated

[# Associations](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#associations)

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/webhooks/v2/webhook_subscriptions/{webhook_subscription_id}/events`

Copy

[Event](event.md)

[# Belongs To](#/apps/webhooks/2022-10-20/vertices/webhook_subscription#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/webhooks/v2/webhook_subscriptions`

Copy

[Organization](organization.md)