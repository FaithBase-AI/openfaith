Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](index.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)

2025-03-20

Info

[Address](vertices/address.md)

[App](vertices/app.md)

[BackgroundCheck](vertices/background_check.md)

[BirthdayPeople](vertices/birthday_people.md)

[Campus](vertices/campus.md)

[Carrier](vertices/carrier.md)

[Condition](vertices/condition.md)

[ConnectedPerson](vertices/connected_person.md)

[CustomSender](vertices/custom_sender.md)

[Email](vertices/email.md)

[FieldDatum](vertices/field_datum.md)

[FieldDefinition](vertices/field_definition.md)

[FieldOption](vertices/field_option.md)

[Form](vertices/form.md)

[FormCategory](vertices/form_category.md)

[FormField](vertices/form_field.md)

[FormFieldOption](vertices/form_field_option.md)

[FormSubmission](vertices/form_submission.md)

[FormSubmissionValue](vertices/form_submission_value.md)

[Household](vertices/household.md)

[HouseholdMembership](vertices/household_membership.md)

[InactiveReason](vertices/inactive_reason.md)

[List](vertices/list.md)

[ListCategory](vertices/list_category.md)

[ListResult](vertices/list_result.md)

[ListShare](vertices/list_share.md)

[ListStar](vertices/list_star.md)

[MailchimpSyncStatus](vertices/mailchimp_sync_status.md)

[MaritalStatus](vertices/marital_status.md)

[Message](vertices/message.md)

[MessageGroup](vertices/message_group.md)

[NamePrefix](vertices/name_prefix.md)

[NameSuffix](vertices/name_suffix.md)

[Note](vertices/note.md)

[NoteCategory](vertices/note_category.md)

[NoteCategoryShare](vertices/note_category_share.md)

[NoteCategorySubscription](vertices/note_category_subscription.md)

[Organization](vertices/organization.md)

[OrganizationStatistics](vertices/organization_statistics.md)

[PeopleImport](vertices/people_import.md)

[PeopleImportConflict](vertices/people_import_conflict.md)

[PeopleImportHistory](vertices/people_import_history.md)

[Person](vertices/person.md)

[PersonApp](vertices/person_app.md)

[PersonMerger](vertices/person_merger.md)

[PhoneNumber](vertices/phone_number.md)

[PlatformNotification](vertices/platform_notification.md)

[Report](vertices/report.md)

[Rule](vertices/rule.md)

[SchoolOption](vertices/school_option.md)

[ServiceTime](vertices/service_time.md)

[SocialProfile](vertices/social_profile.md)

[SpamEmailAddress](vertices/spam_email_address.md)

[Tab](vertices/tab.md)

[Workflow](vertices/workflow.md)

[WorkflowCard](vertices/workflow_card.md)

[WorkflowCardActivity](vertices/workflow_card_activity.md)

[WorkflowCardNote](vertices/workflow_card_note.md)

[WorkflowCategory](vertices/workflow_category.md)

[WorkflowShare](vertices/workflow_share.md)

[WorkflowStep](vertices/workflow_step.md)

[WorkflowStepAssigneeSummary](vertices/workflow_step_assignee_summary.md)

[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# 2025-03-20

Beta

Prevent archived workflows from the `Workflow` association

# Changes

Type

Changes to

Notes

breaking

`workflow-organization-workflows`

Remove archived workflows from the `Workflow` association

breaking

`workflow`

Remove archived workflows from `total_unfiltered_count` in `WorkflowVertex` meta