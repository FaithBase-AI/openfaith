Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

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

# Person

[# Example Request](#/apps/registrations/2025-05-01/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/person
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/person)

[# Example Object](#/apps/registrations/2025-05-01/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "first_name": "string",
    "last_name": "string",
    "name": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/person#attributes)

Name

Type

Description

`id`

`primary_key`

`first_name`

`string`

`last_name`

`string`

`name`

`string`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/person#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/person`

Copy

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/person/{id}`

Copy

[# Belongs To](#/apps/registrations/2025-05-01/vertices/person#belongs-to)

# Attendee

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/person`

Copy

[Attendee](attendee.md)

# Registration

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/registrations/{registration_id}/created_by`

Copy

[Registration](registration.md)

# Registration

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/registrations/{registration_id}/registrant_contact`

Copy

[Registration](registration.md)