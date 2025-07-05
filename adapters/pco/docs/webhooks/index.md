Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](index.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

2022-10-20

Info

[AvailableEvent](vertices/available_event.md)

[Delivery](vertices/delivery.md)

[Event](vertices/event.md)

[Organization](vertices/organization.md)

[WebhookSubscription](vertices/webhook_subscription.md)

# 2022-10-20

Beta

Replace Subscription with WebhookSubscription

# Changes

Type

Changes to

Notes

breaking

`event`

Added `last_delivery` include to events

breaking

`organization-batch_update`

Use SubscriptionVertex when creating new

# Removed

* `Subscription` (Deprecated in [2018-08-01](#/apps/webhooks/2018-08-01))
* `.../organization/1/subscriptions` (Deprecated in [2018-08-01](#/apps/webhooks/2018-08-01))
* `.../subscription/1/events` (Deprecated in [2018-08-01](#/apps/webhooks/2018-08-01))
* `.../subscription/1/rotate_secret` (Deprecated in [2018-08-01](#/apps/webhooks/2018-08-01))