Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](signup.md)

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

# Signup

A `Signup` is an organization signup that people can register for.

[# Example Request](#/apps/registrations/2025-05-01/vertices/signup#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups)

[# Example Object](#/apps/registrations/2025-05-01/vertices/signup#example-object)

```
{
  "type": "Signup",
  "id": "1",
  "attributes": {
    "archived": true,
    "close_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "logo_url": "string",
    "name": "string",
    "new_registration_url": "string",
    "open_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/signup#attributes)

Name

Type

Description

`id`

`primary_key`

`archived`

`boolean`

Whether the signup is archived or not.

`close_at`

`date_time`

UTC time at which regsitration closes.

`description`

`string`

Decription of the signup.

`logo_url`

`string`

URL for the image used for the signup.

`name`

`string`

Name of the signup.

`new_registration_url`

`string`

URL to allow people to register for signup.

`open_at`

`date_time`

UTC time at which regsitration opens.

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/signup#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

campuses

include associated campuses

include

categories

include associated categories

include

next\_signup\_time

include associated next\_signup\_time

include

signup\_location

include associated signup\_location

include

signup\_times

include associated signup\_times

# Query By

Name

Parameter

Type

Description

Example

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/signup#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups`

Copy

Notes:

Organization admins can see all signups. Signup managers can only see the signups they manage.

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{id}`

Copy

Notes:

Organization admins can see all signups. Signup managers can only see the signups they manage.

[# Associations](#/apps/registrations/2025-05-01/vertices/signup#associations)

# attendees

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees`

Copy

[Attendee](attendee.md)

* `active`
* `canceled`
* `waitlist`

# campuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/campuses`

Copy

[Campus](campus.md)

# categories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/categories`

Copy

[Category](category.md)

# next\_signup\_time

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/next_signup_time`

Copy

[SignupTime](signup_time.md)

# registrations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/registrations`

Copy

[Registration](registration.md)

# selection\_types

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/selection_types`

Copy

[SelectionType](selection_type.md)

* `publicly_available`

# signup\_location

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/signup_location`

Copy

[SignupLocation](signup_location.md)

# signup\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/signup_times`

Copy

[SignupTime](signup_time.md)

* `future`
* `past`

[# Belongs To](#/apps/registrations/2025-05-01/vertices/signup#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups`

Copy

[Organization](organization.md)

* `archived`
* `unarchived`