Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](category.md)

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

# Category

A `Category` is a label used to group together and find signups more easily.

[# Example Request](#/apps/registrations/2025-05-01/vertices/category#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/categories
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/categories)

[# Example Object](#/apps/registrations/2025-05-01/vertices/category#example-object)

```
{
  "type": "Category",
  "id": "1",
  "attributes": {
    "name": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/category#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

Name of the category.

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/category#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/category#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/categories`

Copy

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/categories/{id}`

Copy

[# Belongs To](#/apps/registrations/2025-05-01/vertices/category#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/categories`

Copy

[Organization](organization.md)

# Signup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/categories`

Copy

[Signup](signup.md)