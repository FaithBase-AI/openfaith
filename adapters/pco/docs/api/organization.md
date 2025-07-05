Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)

2019-02-13

Info

[ConnectedApplication](connected_application.md)

[ConnectedApplicationPerson](connected_application_person.md)

[OauthApplication](oauth_application.md)

[OauthApplicationMau](oauth_application_mau.md)

[Organization](organization.md)

[Person](person.md)

[PersonalAccessToken](personal_access_token.md)

[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Organization

[# Example Request](#/apps/api/2019-02-13/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/api/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/api/v2)

[# Example Object](#/apps/api/2019-02-13/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {},
  "relationships": {}
}
```

[# Attributes](#/apps/api/2019-02-13/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

[# URL Parameters](#/apps/api/2019-02-13/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/api/2019-02-13/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/api/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/api/v2/{id}`

Copy

[# Associations](#/apps/api/2019-02-13/vertices/organization#associations)

# connected\_applications

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/api/v2/connected_applications`

Copy

[ConnectedApplication](connected_application.md)

# oauth\_applications

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/api/v2/oauth_applications`

Copy

[OauthApplication](oauth_application.md)

# personal\_access\_tokens

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/api/v2/personal_access_tokens`

Copy

[PersonalAccessToken](personal_access_token.md)