Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](selection_type.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)

2025-05-01

Info

[Attendee](attendee.md)

[Campus](campus.md)

[Category](category.md)

[EmergencyContact](emergency_contact.md)

[Organization](organization.md)

[Person](person.md)

[Registration](registration.md)

[SelectionType](selection_type.md)

[Signup](signup.md)

[SignupLocation](signup_location.md)

[SignupTime](signup_time.md)

[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# SelectionType

`Selection_Types` are used to present the options people register for in a signup.

[# Example Request](#/apps/registrations/2025-05-01/vertices/selection_type#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups/{signup_id}/selection_types
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups/{signup_id}/selection_types)

[# Example Object](#/apps/registrations/2025-05-01/vertices/selection_type#example-object)

```
{
  "type": "SelectionType",
  "id": "1",
  "attributes": {
    "name": "string",
    "publicly_available": true,
    "price_cents": 1,
    "price_currency": "string",
    "price_currency_symbol": "string",
    "price_formatted": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/selection_type#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

Name of the selection type.

`publicly_available`

`boolean`

Whether or not the selection type is available to the public.

`price_cents`

`integer`

Price of selection type in cents.

`price_currency`

`string`

Signup currency code, example `"USD"`.

Only available when requested with the `?fields` param

`price_currency_symbol`

`string`

Signup currency symbol, example `"$"`.

Only available when requested with the `?fields` param

`price_formatted`

`string`

Price of selection type with currency formatting (symbol not included).

Only available when requested with the `?fields` param

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/selection_type#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/selection_type#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/selection_types`

Copy

Notes:

Organization admins can see all selection types for all signups.
Signup managers can only see the selection types for signups they manage.

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/selection_types/{id}`

Copy

Notes:

Organization admins can see all selection types for all signups.
Signup managers can only see the selection types for signups they manage.

[# Belongs To](#/apps/registrations/2025-05-01/vertices/selection_type#belongs-to)

# Attendee

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/selection_type`

Copy

[Attendee](attendee.md)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/selection_types`

Copy

[Signup](signup.md)

* `publicly_available`