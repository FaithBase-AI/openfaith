Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](registration.md)

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

# Registration

[# Example Request](#/apps/registrations/2025-05-01/vertices/registration#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups/{signup_id}/registrations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups/{signup_id}/registrations)

[# Example Object](#/apps/registrations/2025-05-01/vertices/registration#example-object)

```
{
  "type": "Registration",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/registration#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/registration#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

created\_by

include associated created\_by

include

registrant\_contact

include associated registrant\_contact

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/registration#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/registrations`

Copy

Notes:

Organization admins can see all registrations for all signups.
Signup managers can only see the registrations for signups they manage.

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/registrations/{id}`

Copy

Notes:

Organization admins can see all registrations for all signups.
Signup managers can only see the registrations for signups they manage.

[# Associations](#/apps/registrations/2025-05-01/vertices/registration#associations)

# created\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/registrations/{registration_id}/created_by`

Copy

[Person](person.md)

# registrant\_contact

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/registrations/{registration_id}/registrant_contact`

Copy

[Person](person.md)

[# Belongs To](#/apps/registrations/2025-05-01/vertices/registration#belongs-to)

# Attendee

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/registration`

Copy

[Attendee](attendee.md)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/registrations`

Copy

[Signup](signup.md)