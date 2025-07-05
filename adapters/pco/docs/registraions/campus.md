Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](campus.md)

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

# Campus

A `Campus` is a location belonging to an Organization.

[# Example Request](#/apps/registrations/2025-05-01/vertices/campus#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/campuses
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/campuses)

[# Example Object](#/apps/registrations/2025-05-01/vertices/campus#example-object)

```
{
  "type": "Campus",
  "id": "1",
  "attributes": {
    "name": "string",
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "country": "string",
    "full_formatted_address": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/campus#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

Name of the campus.

`street`

`string`

Street address of the campus.

`city`

`string`

City where the campus is located.

`state`

`string`

State or province where the campus is located.

`zip`

`string`

Zip code of the campus.

`country`

`string`

Country where the campus is located.

`full_formatted_address`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/campus#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/campus#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/campuses`

Copy

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/campuses/{id}`

Copy

[# Belongs To](#/apps/registrations/2025-05-01/vertices/campus#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/campuses`

Copy

[Organization](organization.md)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/campuses`

Copy

[Signup](signup.md)