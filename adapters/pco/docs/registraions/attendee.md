Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](attendee.md)

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

# Attendee

An `Attendee` is a person registered for a signup.

[# Example Request](#/apps/registrations/2025-05-01/vertices/attendee#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups/{signup_id}/attendees
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups/{signup_id}/attendees)

[# Example Object](#/apps/registrations/2025-05-01/vertices/attendee#example-object)

```
{
  "type": "Attendee",
  "id": "1",
  "attributes": {
    "complete": true,
    "active": true,
    "canceled": true,
    "waitlisted": true,
    "waitlisted_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/attendee#attributes)

Name

Type

Description

`id`

`primary_key`

`complete`

`boolean`

Whether or not attendee has completed all necessary items (personal information, questions, forms, add ons).

Only available when requested with the `?fields` param

`active`

`boolean`

Whether or not the attendee is active.

`canceled`

`boolean`

Whether or not the attendee is canceled.

`waitlisted`

`boolean`

Whether or not the attendee is waitlisted.

`waitlisted_at`

`date_time`

UTC time at which the attendee was waitlisted.

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/attendee#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

emergency\_contact

include associated emergency\_contact

include

person

include associated person

include

registration

include associated registration

include

selection\_type

include associated selection\_type

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/attendee#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/attendees`

Copy

Notes:

Organization admins can see all attendees for all signups.
Signup managers can only see the attendees for signups they manage.

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/attendees/{id}`

Copy

Notes:

Organization admins can see all attendees for all signups.
Signup managers can only see the attendees for signups they manage.

[# Associations](#/apps/registrations/2025-05-01/vertices/attendee#associations)

# emergency\_contact

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/emergency_contact`

Copy

[EmergencyContact](emergency_contact.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/person`

Copy

[Person](person.md)

# registration

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/registration`

Copy

[Registration](registration.md)

# selection\_type

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/selection_type`

Copy

[SelectionType](selection_type.md)

[# Belongs To](#/apps/registrations/2025-05-01/vertices/attendee#belongs-to)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees`

Copy

[Signup](signup.md)

* `active`
* `canceled`
* `waitlist`