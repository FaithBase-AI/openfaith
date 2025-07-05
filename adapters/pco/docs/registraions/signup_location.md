Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](signup_location.md)

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

# SignupLocation

`Signup_location` is the location of a signup.

[# Example Request](#/apps/registrations/2025-05-01/vertices/signup_location#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups/{signup_id}/signup_location
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups/{signup_id}/signup_location)

[# Example Object](#/apps/registrations/2025-05-01/vertices/signup_location#example-object)

```
{
  "type": "SignupLocation",
  "id": "1",
  "attributes": {
    "name": "string",
    "address_data": "json",
    "subpremise": "string",
    "latitude": "string",
    "longitude": "string",
    "location_type": "string",
    "url": "string",
    "formatted_address": "string",
    "full_formatted_address": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/signup_location#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

The name of the signup location.

`address_data`

`json`

The address data of the signup location, which includes details like street, city, state, and postal code.

Only available when requested with the `?fields` param

`subpremise`

`string`

The subpremise of the signup location, such as an building or room number.

`latitude`

`string`

The latitude of the signup location.

`longitude`

`string`

The longitude of the signup location.

`location_type`

`string`

The type of location, such as `address`, `coords`, or `online`.

`url`

`string`

The URL for the signup location, if applicable (e.g., for online events).

`formatted_address`

`string`

The formatted address of the signup location, which may not include subpremise details.

`full_formatted_address`

`string`

The fully formatted address of the signup location, including subpremise details.

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/signup_location#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/signup_location#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/signup_location`

Copy

Notes:

Organization admins can see signup locations for all signups.
Signup managers can only see signup locations for signups they manage.

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/signup_location/{id}`

Copy

Notes:

Organization admins can see signup locations for all signups.
Signup managers can only see signup locations for signups they manage.

[# Belongs To](#/apps/registrations/2025-05-01/vertices/signup_location#belongs-to)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/signup_location`

Copy

[Signup](signup.md)